import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentScale } from "remotion";
import { Action, ElementTimeline, lerp, mix, phase, rawProgress, Scene, themeColor } from "../storyboard/timeline";
import { fontsLoaded } from "../style/fonts";
import { content, mark, stroke, type, VIDEO, zone } from "../style/theme";
import { expressionInk, inkRect, tokenInk } from "./ink";
import { drawTokens, InkBox, matchTokens, morph, tokenize, TokenStyle } from "./morph";
import { labelAt, labelLineStyle, labelTex, Side } from "./PaperRect";
import { Tex } from "./Tex";

// One line of KaTeX built from addressable parts, rendered as a single
// expression so spacing is KaTeX's own. Parts reveal (fading up, or flying in
// from a sheet's edge label), recolor, get boxed, and transform into a new
// part list on the same baseline, token by token (see morph.ts).

type Part = { id: string; tex: string; color: string };
type Props = {
  parts: Part[];
  fontSize?: number;
  y: number; // baseline
  centerX?: number;
  align?: { part: string; x: number };
};

// Ink box relative to the expression's left edge and baseline.
type Ink = { x0: number; x1: number; y0: number; y1: number };
type Measured = { baseline: number; ink: Record<string, Ink>; tokens: Record<string, (Ink | null)[]> };
// An edge label measured at the row's font size: the ink the sheet places it
// by, and its glyph ink.
type LabelInk = { placement: { l: number; t: number; r: number; b: number }; glyphs: { l: number; t: number } };
type FromLabel = { of: string; side: Side };

const measureTex = (parts: Part[]) =>
  `\\displaystyle ${parts
    .map((p) => `\\htmlData{part=${p.id}}{${tokenize(p.tex).tex((k) => `\\htmlData{tok=${k}}`)}}`)
    .join(" ")}`;

// Zero-size inline-block: sits on the baseline at the expression's left edge.
const Origin = () => <span data-origin style={{ display: "inline-block", width: 0, height: 0 }} />;

export const Equation: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  const fontSize = p.fontSize ?? type.mathDisplay;
  const transforms = el.actions.filter((a) => a.action === "transformTo");
  const layouts: Part[][] = [p.parts, ...transforms.map((a) => a.params.parts as Part[])];
  // Labels that parts fly in from, as the sheet drew them the frame before.
  const handoffs = el.actions
    .filter((a) => a.action === "reveal" && a.params.fromLabel)
    .map((a) => {
      const { of, side } = a.params.fromLabel as FromLabel;
      if ((a.params.parts as string[] | undefined)?.length !== 1) {
        throw new Error(`Equation ${el.spec.id}: reveal fromLabel takes exactly one part`);
      }
      const sheet = scene.at(a.from - 1).paper(of);
      const label = sheet.labels.find((l) => l.side === side);
      if (!label) throw new Error(`Equation ${el.spec.id}: ${of} has no ${side} label at f${a.from - 1} to reveal from`);
      return { a, side, box: sheet.box, tex: label.tex, color: label.color, part: (a.params.parts as string[])[0] };
    });

  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scale = useCurrentScale();
  const [measured, setMeasured] = useState<{ layouts: Measured[]; labels: LabelInk[] } | null>(null);
  useLayoutEffect(() => {
    const handle = delayRender(`measure ${el.spec.id}`);
    fontsLoaded.then(() => {
      const layoutInks = refs.current.map((box) => {
        const origin = box!.querySelector("[data-origin]")!.getBoundingClientRect();
        const rel = (r: { left: number; right: number; top: number; bottom: number }): Ink => ({
          x0: (r.left - origin.left) / scale,
          x1: (r.right - origin.left) / scale,
          y0: (r.top - origin.top) / scale,
          y1: (r.bottom - origin.top) / scale,
        });
        const ink: Record<string, Ink> = {};
        const tokens: Record<string, (Ink | null)[]> = {};
        box!.querySelectorAll<HTMLElement>("[data-part]").forEach((part) => {
          const id = part.dataset.part!;
          ink[id] = rel(inkRect(part));
          tokens[id] = [];
          part.querySelectorAll<HTMLElement>("[data-tok]").forEach((t) => {
            const r = tokenInk(t);
            tokens[id][Number(t.dataset.tok)] = r && rel(r);
          });
        });
        return { baseline: (origin.top - box!.getBoundingClientRect().top) / scale, ink, tokens };
      });
      const labelInks = labelRefs.current.map((copy) => {
        const outer = copy!.getBoundingClientRect();
        const e = expressionInk(copy!);
        const g = inkRect(copy!);
        return {
          placement: {
            l: (e.left - outer.left) / scale,
            t: (e.top - outer.top) / scale,
            r: (e.right - outer.left) / scale,
            b: (e.bottom - outer.top) / scale,
          },
          glyphs: { l: (g.left - outer.left) / scale, t: (g.top - outer.top) / scale },
        };
      });
      setMeasured({ layouts: layoutInks, labels: labelInks });
      continueRender(handle);
    });
  }, [el.spec.id, scale]);

  const measuring = (
    <>
      {layouts.map((parts, i) => (
        <div
          key={i}
          ref={(d) => {
            refs.current[i] = d;
          }}
          style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", visibility: "hidden" }}
        >
          <Origin />
          <Tex tex={measureTex(parts)} trust fontSize={fontSize} />
        </div>
      ))}
      {handoffs.map((h, i) => (
        <div
          key={`label-${i}`}
          ref={(d) => {
            labelRefs.current[i] = d;
          }}
          style={{ ...labelLineStyle, left: 0, top: 0, visibility: "hidden" }}
        >
          <Tex tex={labelTex(h.tex)} trust fontSize={fontSize} />
        </div>
      ))}
    </>
  );
  if (!measured) return <AbsoluteFill>{measuring}</AbsoluteFill>;
  const m = measured.layouts;

  // Frame x of each layout's left edge: centered on centerX, or one part's
  // center on align.x.
  const originX = m.map((mi, i) => {
    const xs = layouts[i].map((part) => mi.ink[part.id]);
    if (p.align) {
      const a = mi.ink[p.align.part];
      if (!a) throw new Error(`Equation ${el.spec.id}: align part ${p.align.part} missing from a layout`);
      return p.align.x - (a.x0 + a.x1) / 2;
    }
    return p.centerX! - (Math.min(...xs.map((b) => b.x0)) + Math.max(...xs.map((b) => b.x1))) / 2;
  });

  let cur = 0;
  let vis: Record<string, number> = Object.fromEntries(p.parts.map((q) => [q.id, 0]));
  let col: Record<string, string> = Object.fromEntries(p.parts.map((q) => [q.id, themeColor(q.color)]));
  let rise: Record<string, number> = {};
  let from: { layout: number; a: Action; vis: Record<string, number>; col: Record<string, string>; morph: Record<string, string[]> } | null = null;
  let box: { part: string; color: string; drawn: number } | null = null;
  // Parts still flying in (several can overlap in time).
  const flights: { h: (typeof handoffs)[number]; label: LabelInk; e: number }[] = [];
  let opacity = 1;
  for (const a of el.actions) {
    if (frame < a.from) break;
    const e = phase(a, frame);
    switch (a.action) {
      case "reveal": {
        const i = handoffs.findIndex((h) => h.a === a);
        if (i >= 0) {
          // The part is the label until it lands, then itself. The flight
          // ends a frame early, so its last frame is exactly the landed part.
          const landed = rawProgress(a, frame) >= 1;
          vis[handoffs[i].part] = landed ? 1 : 0;
          const e1 = phase(a, frame, 0, Math.max(0, a.to - 1 - a.from) / Math.max(1, a.to - a.from));
          if (!landed) flights.push({ h: handoffs[i], label: measured.labels[i], e: e1 });
          break;
        }
        for (const id of (a.params.parts as string[] | undefined) ?? layouts[cur].map((q) => q.id)) {
          vis[id] = e;
          rise[id] = (1 - e) * mark.revealRise;
        }
        break;
      }
      case "transformTo": {
        const next = layouts[cur + 1];
        from = rawProgress(a, frame) < 1 ? { layout: cur, a, vis, col, morph: a.params.morph ?? {} } : null;
        vis = Object.fromEntries(next.map((q) => [q.id, q.id in vis ? vis[q.id] : 1]));
        col = Object.fromEntries(next.map((q) => [q.id, themeColor(q.color)]));
        rise = {};
        cur += 1;
        break;
      }
      case "recolor":
        for (const [id, c] of Object.entries(a.params.colors as Record<string, string>)) col[id] = mix(col[id], themeColor(c), e);
        break;
      case "box":
        box = { part: a.params.part, color: themeColor(a.params.color), drawn: e };
        break;
      case "exit":
        opacity *= 1 - e;
        break;
      default:
        throw new Error(`Equation ${el.spec.id}: unknown action ${a.action}`);
    }
  }
  if (opacity <= 0) return null;

  // A boxed part makes room as its box draws: its neighbor ends up as far from
  // the box as from its own other neighbor (or, lacking one, as far as from the
  // part before boxing). The row stays centered, or an aligned part stays put.
  const shift: Record<string, number> = {};
  if (box) {
    const parts = layouts[cur];
    // Glyph ink (the union of a part's tokens), not KaTeX's advance boxes, and
    // the box's outer edge, stroke included: the gaps the eye compares.
    const ink = parts.map((q) => {
      const bs = m[cur].tokens[q.id].filter((b): b is Ink => !!b);
      return { x0: Math.min(...bs.map((b) => b.x0)), x1: Math.max(...bs.map((b) => b.x1)) };
    });
    const i = parts.findIndex((q) => q.id === box!.part);
    const gap = (a: number, b: number) => ink[b].x0 - ink[a].x1;
    const room = (n: number, far: number) => {
      if (!parts[n]) return 0;
      const now = gap(Math.min(n, i), Math.max(n, i)) - mark.boxPadding - stroke.line / 2;
      const want = parts[far] ? gap(Math.min(n, far), Math.max(n, far)) : now + mark.boxPadding + stroke.line / 2;
      return Math.max(0, want - now);
    };
    const left = room(i - 1, i - 2) * box.drawn;
    const right = room(i + 1, i + 2) * box.drawn;
    const raw = (j: number) => (j < i ? 0 : j === i ? left : left + right);
    // Centered on the row's ink, the box's outer edges included.
    const last = parts.length - 1;
    const edge = (mark.boxPadding + stroke.line / 2) * box.drawn;
    const l0 = raw(0) - (i === 0 ? edge : 0);
    const r0 = raw(last) + (i === last ? edge : 0);
    const anchor = p.align ? raw(parts.findIndex((q) => q.id === p.align!.part)) : (l0 + r0) / 2;
    parts.forEach((q, j) => (shift[q.id] = raw(j) - anchor));
  }

  const tokensOf = (i: number) => layouts[i].map((q) => tokenize(q.tex));
  const box2 = (i: number, part: string, k: number): InkBox | null => {
    const b = m[i].tokens[part][k];
    return b && [originX[i] + b.x0, b.y0, originX[i] + b.x1, b.y1];
  };
  // At rest, every token as its part says.
  let current: TokenStyle[][] = layouts[cur].map((q, j) =>
    tokensOf(cur)[j].keys.map(() => ({ color: col[q.id], opacity: vis[q.id], dx: shift[q.id] ?? 0, dy: rise[q.id] ?? 0 })),
  );
  let old: TokenStyle[][] = [];
  if (from) {
    // Mid-transform: each new part morphs from itself (same id) or its morph
    // sources, token by token; old parts nothing morphs from fade out. The
    // whole row is scheduled at once (morph.ts).
    const f = from;
    const [was, now] = [layouts[f.layout], layouts[cur]];
    const [wasToks, nowToks] = [tokensOf(f.layout), tokensOf(cur)];
    const flat = (parts: Part[], toks: ReturnType<typeof tokensOf>, i: number, tag: string) =>
      parts.flatMap((q, j) =>
        toks[j].keys.map((key, k) => ({
          part: j,
          k,
          key,
          id: `${tag}${q.id}.${k}`,
          parent: toks[j].parents[k] === null ? null : `${tag}${q.id}.${toks[j].parents[k]}`,
          box: box2(i, q.id, k),
        })),
      );
    const src = flat(was, wasToks, f.layout, "o:");
    const dst = flat(now, nowToks, cur, "n:");
    const matched: [number, number][] = [];
    const claimed = new Set<string>();
    now.forEach((q, j) => {
      const ids = was.some((o) => o.id === q.id) ? [q.id] : (f.morph[q.id] ?? []).filter((id) => !claimed.has(id));
      ids.forEach((id) => claimed.add(id));
      const a = src.flatMap((t, n) => (ids.includes(was[t.part].id) ? [n] : []));
      const b = dst.flatMap((t, n) => (t.part === j ? [n] : []));
      for (const [x, y] of matchTokens(
        a.map((n) => src[n].key),
        b.map((n) => dst[n].key),
      ))
        matched.push([a[x], b[y]]);
    });
    // Token boxes are relative to the baseline; so is the room they may use.
    const room = { top: zone.visual.top - p.y, bottom: zone.visual.bottom - p.y };
    const r = morph(src, dst, matched, (p0, p1) => phase(f.a, frame, p0, p1), f.a.ease, room);
    old = was.map((q, j) => wasToks[j].keys.map(() => ({ color: f.col[q.id], opacity: f.vis[q.id], dx: 0, dy: 0 })));
    src.forEach((t, n) => (old[t.part][t.k].opacity *= r.old[n]));
    current = now.map((q, j) => nowToks[j].keys.map(() => ({ color: col[q.id], opacity: 1, dx: 0, dy: 0 })));
    dst.forEach((t, n) => {
      const s = r.new[n];
      const srcPart = s.source === null ? null : was[src[s.source].part].id;
      current[t.part][t.k] = {
        color: srcPart === null ? col[now[t.part].id] : mix(f.col[srcPart], col[now[t.part].id], r.move),
        opacity: srcPart === null ? s.opacity : f.vis[srcPart],
        dx: s.dx + (shift[now[t.part].id] ?? 0),
        dy: s.dy,
      };
    });
  }

  // Math must stay inside the content bounds: scale the row about its anchor if a layout overflows.
  const anchorX = p.align ? p.align.x : p.centerX!;
  const fit = Math.min(
    1,
    ...m.flatMap((mi, i) => {
      const inks = layouts[i].map((q) => mi.ink[q.id]);
      const l = originX[i] + Math.min(...inks.map((b) => b.x0));
      const r = originX[i] + Math.max(...inks.map((b) => b.x1));
      return [
        l < content.left ? (anchorX - content.left) / (anchorX - l) : 1,
        r > content.right ? (content.right - anchorX) / (r - anchorX) : 1,
      ];
    }),
  );

  const row = (i: number, styles: TokenStyle[][]) => (
    <div
      data-text="equation"
      style={{ position: "absolute", left: originX[i], top: p.y - m[i].baseline, whiteSpace: "nowrap" }}
    >
      <Origin />
      <Tex
        tex={`\\displaystyle ${layouts[i].map((q, j) => drawTokens(tokensOf(i)[j], styles[j])).join(" ")}`}
        trust
        fontSize={fontSize}
      />
    </div>
  );
  const boxInk = box && m[cur].ink[box.part];
  // A part flying in from a label: the label, drawn at the row's size and
  // scaled down to the label's to start where the sheet drew it, moving and
  // growing until its glyphs cover the part's, so it lands as the part itself.
  const ghosts = flights.map(({ h, label, e }) => {
    const k0 = type.mathInline / fontSize;
    const pl = label.placement;
    const start = labelAt(h.box, h.side, { l: pl.l * k0, t: pl.t * k0, r: pl.r * k0, b: pl.b * k0 });
    const part = m[cur].ink[h.part];
    const toFrame = (x: number, y: number) => [anchorX + (x - anchorX) * fit, p.y + (y - p.y) * fit];
    const [x0, y0] = toFrame(originX[cur] + part.x0 + (shift[h.part] ?? 0), p.y + part.y0);
    return (
      <div
        key={h.part}
        data-text="equation"
        style={{
          ...labelLineStyle,
          left: lerp(start.left, x0 - fit * label.glyphs.l, e),
          top: lerp(start.top, y0 - fit * label.glyphs.t, e),
          scale: String(lerp(k0, fit, e)),
          transformOrigin: "0 0",
          opacity,
        }}
      >
        <Tex tex={labelTex(h.tex, mix(h.color, col[h.part], e))} trust name={h.tex} fontSize={fontSize} />
      </div>
    );
  });
  return (
    <AbsoluteFill>
      {measuring}
      <AbsoluteFill style={{ opacity, scale: String(fit), transformOrigin: `${anchorX}px ${p.y}px` }}>
        {from ? row(from.layout, old) : null}
        {row(cur, current)}
        {box && boxInk ? (
          <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", left: 0, top: 0 }}>
            <rect
              x={originX[cur] + boxInk.x0 + (shift[box.part] ?? 0) - mark.boxPadding}
              y={p.y + boxInk.y0 - mark.boxPadding}
              width={boxInk.x1 - boxInk.x0 + 2 * mark.boxPadding}
              height={boxInk.y1 - boxInk.y0 + 2 * mark.boxPadding}
              rx={mark.boxRadius}
              fill="none"
              stroke={box.color}
              strokeWidth={stroke.line}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - box.drawn}
            />
          </svg>
        ) : null}
      </AbsoluteFill>
      {ghosts}
    </AbsoluteFill>
  );
};
