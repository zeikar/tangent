import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentScale } from "remotion";
import { ElementTimeline, mix, phase, Scene, themeColor } from "../storyboard/timeline";
import { mark, safe, stroke, type, VIDEO } from "../style/theme";
import { inkRect } from "./ink";
import { Tex } from "./Tex";

// One line of KaTeX built from addressable parts, rendered as a single
// expression so spacing is KaTeX's own. Parts reveal, recolor, get boxed, and
// transform into a new part list on the same baseline.

type Part = { id: string; tex: string; color: string };
type Props = {
  parts: Part[];
  fontSize?: number;
  y: number; // baseline
  centerX?: number;
  align?: { part: string; x: number };
};

// Ink box of a part, relative to the expression's left edge and baseline.
type Ink = { x0: number; x1: number; y0: number; y1: number };
type Measured = { baseline: number; ink: Record<string, Ink> };
// A part as drawn this frame, offset from its own layout slot.
type Drawn = Part & { opacity: number; dx: number; dy: number };

const measureTex = (parts: Part[]) =>
  `\\displaystyle ${parts.map((p) => `\\htmlData{part=${p.id}}{${p.tex}}`).join(" ")}`;

const drawTex = (parts: Drawn[]) =>
  `\\displaystyle ${parts
    .map(
      (p) =>
        `\\htmlStyle{color:${p.color};opacity:${p.opacity.toFixed(4)};position:relative;` +
        `left:${p.dx.toFixed(2)}px;top:${p.dy.toFixed(2)}px}{${p.tex}}`,
    )
    .join(" ")}`;

// Zero-size inline-block: sits on the baseline at the expression's left edge.
const Origin = () => <span data-origin style={{ display: "inline-block", width: 0, height: 0 }} />;

export const Equation: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  const fontSize = p.fontSize ?? type.mathDisplay;
  const transforms = el.actions.filter((a) => a.action === "transformTo");
  const layouts: Part[][] = [p.parts, ...transforms.map((a) => a.params.parts as Part[])];

  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const scale = useCurrentScale();
  const [measured, setMeasured] = useState<Measured[] | null>(null);
  useLayoutEffect(() => {
    const handle = delayRender(`measure ${el.spec.id}`);
    document.fonts.ready.then(() => {
      setMeasured(
        refs.current.map((box) => {
          const origin = box!.querySelector("[data-origin]")!.getBoundingClientRect();
          const ink: Record<string, Ink> = {};
          box!.querySelectorAll<HTMLElement>("[data-part]").forEach((part) => {
            const r = inkRect(part);
            ink[part.dataset.part!] = {
              x0: (r.left - origin.left) / scale,
              x1: (r.right - origin.left) / scale,
              y0: (r.top - origin.top) / scale,
              y1: (r.bottom - origin.top) / scale,
            };
          });
          return { baseline: (origin.top - box!.getBoundingClientRect().top) / scale, ink };
        }),
      );
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
    </>
  );
  if (!measured) return <AbsoluteFill>{measuring}</AbsoluteFill>;

  // Frame x of each layout's left edge: centered on centerX, or one part's
  // center on align.x.
  const originX = measured.map((m, i) => {
    const xs = layouts[i].map((part) => m.ink[part.id]);
    if (p.align) {
      const a = m.ink[p.align.part];
      if (!a) throw new Error(`Equation ${el.spec.id}: align part ${p.align.part} missing from a layout`);
      return p.align.x - (a.x0 + a.x1) / 2;
    }
    return p.centerX! - (Math.min(...xs.map((b) => b.x0)) + Math.max(...xs.map((b) => b.x1))) / 2;
  });
  const center = (i: number, id: string) => {
    const b = measured[i].ink[id];
    return { x: originX[i] + (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 };
  };

  let cur = 0;
  let vis: Record<string, number> = Object.fromEntries(p.parts.map((q) => [q.id, 0]));
  let col: Record<string, string> = Object.fromEntries(p.parts.map((q) => [q.id, themeColor(q.color)]));
  let rise: Record<string, number> = {};
  let from: { layout: number; e: number; vis: Record<string, number>; col: Record<string, string>; morph: Record<string, string[]> } | null = null;
  let box: { part: string; color: string; drawn: number } | null = null;
  let opacity = 1;
  for (const a of el.actions) {
    if (frame < a.from) break;
    const e = phase(a, frame);
    switch (a.action) {
      case "reveal":
        for (const id of (a.params.parts as string[] | undefined) ?? layouts[cur].map((q) => q.id)) {
          vis[id] = e;
          rise[id] = (1 - e) * mark.revealRise;
        }
        break;
      case "transformTo": {
        const next = layouts[cur + 1];
        from = e < 1 ? { layout: cur, e, vis, col, morph: a.params.morph ?? {} } : null;
        vis = Object.fromEntries(next.map((q) => [q.id, q.id in vis ? vis[q.id] : e]));
        col = Object.fromEntries(
          next.map((q) => [q.id, q.id in col ? mix(col[q.id], themeColor(q.color), e) : themeColor(q.color)]),
        );
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

  // The current layout; mid-transform, shared parts slide in from their old slots.
  const current: Drawn[] = layouts[cur].map((q) => {
    const d = { ...q, color: col[q.id], opacity: vis[q.id], dx: 0, dy: rise[q.id] ?? 0 };
    if (from && q.id in from.vis) {
      const was = center(from.layout, q.id);
      const now = center(cur, q.id);
      d.dx = (was.x - now.x) * (1 - from.e);
      d.dy = (was.y - now.y) * (1 - from.e);
    }
    return d;
  });
  // The old layout fades out; morph sources move onto their new part.
  const old: Drawn[] = from
    ? layouts[from.layout].map((q) => {
        const f = from!;
        const shared = layouts[cur].some((n) => n.id === q.id);
        const target = Object.keys(f.morph).find((n) => f.morph[n].includes(q.id));
        const d = { ...q, color: f.col[q.id], opacity: shared ? 0 : f.vis[q.id] * (1 - f.e), dx: 0, dy: 0 };
        if (target) {
          const was = center(f.layout, q.id);
          const to = center(cur, target);
          d.dx = (to.x - was.x) * f.e;
          d.dy = (to.y - was.y) * f.e;
        }
        return d;
      })
    : [];

  // Math must stay inside the safe area: scale the row about its anchor if a layout overflows.
  const anchorX = p.align ? p.align.x : p.centerX!;
  const fit = Math.min(
    1,
    ...measured.flatMap((m, i) => {
      const inks = layouts[i].map((q) => m.ink[q.id]);
      const l = originX[i] + Math.min(...inks.map((b) => b.x0));
      const r = originX[i] + Math.max(...inks.map((b) => b.x1));
      return [
        l < safe.left ? (anchorX - safe.left) / (anchorX - l) : 1,
        r > VIDEO.width - safe.right ? (VIDEO.width - safe.right - anchorX) / (r - anchorX) : 1,
      ];
    }),
  );

  const row = (i: number, parts: Drawn[]) => (
    <div style={{ position: "absolute", left: originX[i], top: p.y - measured[i].baseline, whiteSpace: "nowrap" }}>
      <Origin />
      <Tex tex={drawTex(parts)} trust fontSize={fontSize} />
    </div>
  );
  const boxInk = box && measured[cur].ink[box.part];
  return (
    <AbsoluteFill>
      {measuring}
      <AbsoluteFill style={{ opacity, scale: String(fit), transformOrigin: `${anchorX}px ${p.y}px` }}>
        {from ? row(from.layout, old) : null}
        {row(cur, current)}
        {box && boxInk ? (
          <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", left: 0, top: 0 }}>
            <rect
              x={originX[cur] + boxInk.x0 - mark.boxPadding}
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
    </AbsoluteFill>
  );
};
