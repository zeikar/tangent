// Where KaTeX output actually draws, in client pixels (divide by
// useCurrentScale() for frame pixels).

// Union of glyphs, radical signs and fraction bars. KaTeX's strut and spacing
// spans are left out: they are taller or wider than the ink.
export const inkRect = (el: Element) => {
  const rects: DOMRect[] = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (/^[\s\u200b]*$/.test(n.textContent ?? "")) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    rects.push(range.getBoundingClientRect());
  }
  el.querySelectorAll("svg, .frac-line").forEach((e) => rects.push(e.getBoundingClientRect()));
  if (!rects.length) throw new Error("KaTeX output has no ink");
  return {
    left: Math.min(...rects.map((r) => r.left)),
    right: Math.max(...rects.map((r) => r.right)),
    top: Math.min(...rects.map((r) => r.top)),
    bottom: Math.max(...rects.map((r) => r.bottom)),
  };
};

// A whole expression's ink: its height from KaTeX's struts, which KaTeX sizes
// from glyph metrics (a text range's height is the font's ascent and descent,
// so an x would get the same top as a 1).
export const expressionInk = (el: Element) => {
  const struts = [...el.querySelectorAll(".katex-strut, .strut")].map((s) => s.getBoundingClientRect());
  if (!struts.length) throw new Error("KaTeX output has no strut");
  return {
    ...inkRect(el),
    top: Math.min(...struts.map((r) => r.top)),
    bottom: Math.max(...struts.map((r) => r.bottom)),
  };
};

let canvas: CanvasRenderingContext2D | null = null;
const metricsCache = new Map<string, TextMetrics>();
const measure = (font: string, s: string) => {
  const key = `${font}|${s}`;
  let m = metricsCache.get(key);
  if (!m) {
    canvas ??= document.createElement("canvas").getContext("2d")!;
    canvas.font = font;
    m = canvas.measureText(s);
    metricsCache.set(key, m);
  }
  return m;
};

const GLYPH = /[\p{L}\p{N}]/u;

// Ink of one text node: its laid-out advance box (from a Range) placed on the
// font's baseline, sized by the glyphs' actual bounds (canvas measureText), so
// tighter than the Range's line box. Also its smallest letter or digit
// (lowercase x-height included) and that glyph's height.
export const textNodeInk = (node: Text) => {
  const s = node.textContent ?? "";
  if (!s.trim() || /^[\s\u200b]*$/.test(s)) return null;
  const cs = getComputedStyle(node.parentElement!);
  const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const range = document.createRange();
  range.selectNodeContents(node);
  const r = range.getBoundingClientRect();
  const m = measure(font, s);
  if (!m.width || !r.width) return null;
  const k = r.width / m.width; // any CSS scale between layout and screen
  const baseline = r.top + m.fontBoundingBoxAscent * k;
  let glyph: [string, number] | null = null;
  for (const ch of s) {
    if (!GLYPH.test(ch)) continue;
    const g = measure(font, ch);
    const h = (g.actualBoundingBoxAscent + g.actualBoundingBoxDescent) * k;
    if (!glyph || h < glyph[1]) glyph = [ch, h];
  }
  return {
    box: [
      r.left - m.actualBoundingBoxLeft * k,
      baseline - m.actualBoundingBoxAscent * k,
      r.left + m.actualBoundingBoxRight * k,
      baseline + m.actualBoundingBoxDescent * k,
    ] as [left: number, top: number, right: number, bottom: number],
    glyph,
  };
};

// A line of text and KaTeX as the probe sees its ink: glyphs (textNodeInk),
// radical signs and fraction bars.
export const glyphRect = (el: Element) => {
  const boxes: number[][] = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const ink = textNodeInk(n as Text);
    if (ink) boxes.push(ink.box);
  }
  el.querySelectorAll("svg, .frac-line").forEach((e) => {
    const r = e.getBoundingClientRect();
    if (r.width) boxes.push([r.left, r.top, r.right, r.bottom]);
  });
  if (!boxes.length) throw new Error("no ink to measure");
  return {
    left: Math.min(...boxes.map((b) => b[0])),
    top: Math.min(...boxes.map((b) => b[1])),
    right: Math.max(...boxes.map((b) => b[2])),
    bottom: Math.max(...boxes.map((b) => b[3])),
  };
};

// A token's own ink (text-node glyphs, radical signs, fraction bars) without
// the tokens nested in it: a radical without its radicand. Null if it has none.
export const tokenInk = (el: Element) => {
  const boxes: number[][] = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (n.parentElement!.closest("[data-tok]") !== el) continue;
    const ink = textNodeInk(n as Text);
    if (ink) boxes.push(ink.box);
  }
  el.querySelectorAll("svg, .frac-line").forEach((e) => {
    const r = e.getBoundingClientRect();
    if (r.width && e.closest("[data-tok]") === el) boxes.push([r.left, r.top, r.right, r.bottom]);
  });
  if (!boxes.length) return null;
  return {
    left: Math.min(...boxes.map((b) => b[0])),
    top: Math.min(...boxes.map((b) => b[1])),
    right: Math.max(...boxes.map((b) => b[2])),
    bottom: Math.max(...boxes.map((b) => b[3])),
  };
};
