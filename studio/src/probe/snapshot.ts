// What one frame actually draws, read back from the DOM: per storyboard
// element, its stroked lines, filled regions and text items, in frame pixels,
// with their effective opacity. Text ink and glyph heights come from the
// fonts' own metrics (canvas measureText), not from line boxes.
//
// Elements are the [data-el] wrappers StoryboardPlayer draws, plus the
// channel mark ("logo"); text items are [data-text] nodes (their value is the
// kind: name, edge-label, equation, ...).

import { textNodeInk as glyphInk } from "../components/ink";

export type Line = [x1: number, y1: number, x2: number, y2: number, width: number, opacity: number];
export type Box = [left: number, top: number, right: number, bottom: number];
// A filled region: its bounding box, opacity, and for rectangles the four
// corners as drawn (a rotating sheet's box is much larger than the sheet).
export type Fill = [...box: Box, opacity: number, corners?: number[]];
export type TextItem = {
  kind: string;
  text: string;
  box: Box;
  opacity: number;
  // Smallest letter or digit (lowercase x-height included) and its ink height.
  glyph: [char: string, height: number] | null;
  origin?: [x: number, y: number]; // a [data-baseline] marker inside the item: left edge, baseline
  lines?: number; // captions: how many lines the text wraps to
};
export type ElementSnap = { id: string; lines: Line[]; fills: Fill[]; texts: TextItem[] };

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Number(n.toFixed(2));
const alphaOf = (c: string) => {
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (!m) return c === "transparent" || c === "none" ? 0 : 1;
  const parts = m[1].split(",");
  return parts.length === 4 ? parseFloat(parts[3]) : 1;
};

// Product of opacity from the node up to the document.
const opacityOf = (node: Element) => {
  let o = 1;
  for (let e: Element | null = node; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity || "1");
  return o;
};

// Ink of one text node, and its effective opacity.
const textNodeInk = (node: Text) => {
  const parent = node.parentElement!;
  const cs = getComputedStyle(parent);
  if (cs.visibility !== "visible") return null; // e.g. Equation's measuring copies
  const ink = glyphInk(node);
  return ink && { ...ink, opacity: opacityOf(parent) * alphaOf(cs.color) };
};

const union = (a: Box | null, b: Box): Box =>
  a ? [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])] : b;

const texOnly = (el: HTMLElement) => {
  const texs = el.querySelectorAll<HTMLElement>("[data-tex]");
  if (el.dataset.text === "equation" || texs.length !== 1) return undefined;
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) if (n.textContent?.trim() && !texs[0].contains(n)) return undefined;
  return texs[0].dataset.tex;
};

const textItem = (el: HTMLElement): TextItem | null => {
  let box: Box | null = null;
  let opacity = 0;
  let glyph: [string, number] | null = null;
  let text = "";
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const ink = textNodeInk(n as Text);
    if (!ink || ink.opacity <= 0.01) continue;
    text += n.textContent;
    box = union(box, ink.box);
    opacity = Math.max(opacity, ink.opacity);
    if (ink.glyph && (!glyph || ink.glyph[1] < glyph[1])) glyph = ink.glyph;
  }
  // KaTeX draws radicals as SVG and fraction bars as borders.
  el.querySelectorAll("svg, .frac-line").forEach((e) => {
    const r = e.getBoundingClientRect();
    if (r.width && getComputedStyle(e).visibility === "visible" && opacityOf(e) > 0.01) box = union(box, [r.left, r.top, r.right, r.bottom]);
  });
  if (!box) return null;
  const marker = el.querySelector("[data-baseline]");
  const kind = el.dataset.text ?? "text";
  return {
    kind,
    // A label that is all one Tex reads as its source (KaTeX puts a
    // fraction's denominator first in the DOM).
    text: texOnly(el) ?? text.replace(/[\s\u200b]+/g, " ").trim(),
    box: box.map(r1) as Box,
    opacity: r2(opacity),
    glyph: glyph && [glyph[0], r1(glyph[1])],
    ...(marker ? { origin: [r1(marker.getBoundingClientRect().left), r1(marker.getBoundingClientRect().top)] } : {}),
    ...(kind === "caption" ? { lines: lineCount(el) } : {}),
  };
};

// Lines of plain text (outside KaTeX, whose fractions stack glyphs without
// wrapping): each text fragment's rect, grouped by vertical overlap.
const lineCount = (el: HTMLElement) => {
  const rows: [number, number][] = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.textContent?.trim() || n.parentElement?.closest(".katex")) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (!r.width) continue;
      const row = rows.find(([t, b]) => r.top < b && r.bottom > t);
      if (row) {
        row[0] = Math.min(row[0], r.top);
        row[1] = Math.max(row[1], r.bottom);
      } else rows.push([r.top, r.bottom]);
    }
  }
  return rows.length;
};

const point = (svg: SVGGraphicsElement, x: number, y: number) => {
  const p = new DOMPoint(x, y).matrixTransform(svg.getScreenCTM()!);
  return [p.x, p.y];
};

export const snapshot = (): ElementSnap[] =>
  [...document.querySelectorAll<HTMLElement>("[data-el]")].map((el) => {
    const lines: Line[] = [];
    const fills: Fill[] = [];
    el.querySelectorAll<SVGGraphicsElement>("line, polyline, rect, path, polygon").forEach((g) => {
      // KaTeX draws glyphs (radicals) as SVG on huge clipped canvases; they
      // belong to the text item, not the diagram.
      if (!g.getScreenCTM() || g.closest(".katex")) return;
      const cs = getComputedStyle(g);
      if (cs.visibility !== "visible") return;
      const o = opacityOf(g);
      const strokeO = o * parseFloat(cs.strokeOpacity || "1") * alphaOf(cs.stroke);
      const fillO = o * parseFloat(cs.fillOpacity || "1") * alphaOf(cs.fill);
      const ctm = g.getScreenCTM()!;
      const w = parseFloat(cs.strokeWidth || "0") * Math.hypot(ctm.a, ctm.b);
      const segs: number[][] = [];
      let corners: number[][] | undefined;
      if (g instanceof SVGLineElement) {
        segs.push([...point(g, g.x1.baseVal.value, g.y1.baseVal.value), ...point(g, g.x2.baseVal.value, g.y2.baseVal.value)]);
      } else if (g instanceof SVGPolylineElement) {
        const pts = [...g.points].map((p) => point(g, p.x, p.y));
        for (let i = 1; i < pts.length; i++) segs.push([...pts[i - 1], ...pts[i]]);
      } else if (g instanceof SVGRectElement) {
        const { x, y, width: rw, height: rh } = g.getBBox();
        corners = [point(g, x, y), point(g, x + rw, y), point(g, x + rw, y + rh), point(g, x, y + rh)];
        if (cs.stroke !== "none") for (let i = 0; i < 4; i++) segs.push([...corners[i], ...corners[(i + 1) % 4]]);
      }
      if (strokeO > 0.01 && w > 0) {
        for (const s of segs) if (s[0] !== s[2] || s[1] !== s[3]) lines.push([...s.map(r1), r1(w), r2(strokeO)] as Line);
      }
      if (!(g instanceof SVGLineElement) && fillO > 0.01 && cs.fill !== "none") {
        const r = g.getBoundingClientRect();
        if (r.width && r.height)
          fills.push([r1(r.left), r1(r.top), r1(r.right), r1(r.bottom), r2(fillO), ...(corners ? [corners.flat().map(r1)] : [])] as Fill);
      }
    });
    const texts = [...el.querySelectorAll<HTMLElement>("[data-text]")]
      .map(textItem)
      .filter((t): t is TextItem => t !== null);
    return { id: el.dataset.el!, lines, fills, texts };
  });
