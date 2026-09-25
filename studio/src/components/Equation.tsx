import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentScale } from "remotion";
import { Action, ElementTimeline, mix, phase, rawProgress, Scene, themeColor } from "../storyboard/timeline";
import { fontsLoaded } from "../style/fonts";
import { content, mark, stroke, type, VIDEO } from "../style/theme";
import { inkRect } from "./ink";
import { DrawnToken, drawTokens, InkBox, matchTokens, moveOffset, schedule, texTokens, wrapTokens } from "./morph";
import { Tex } from "./Tex";

// One line of KaTeX built from addressable parts, rendered as a single
// expression so spacing is KaTeX's own. Parts reveal, recolor, get boxed, and
// transform into a new part list on the same baseline, token by token (see
// morph.ts).

type Part = { id: string; tex: string; color: string };
type Props = {
  parts: Part[];
  fontSize?: number;
  y: number; // baseline
  centerX?: number;
  align?: { part: string; x: number };
};

// Ink box of a part or token, relative to the expression's left edge and baseline.
type Ink = { x0: number; x1: number; y0: number; y1: number };
type Measured = { baseline: number; ink: Record<string, Ink>; tokens: Record<string, Ink[]> };

const measureTex = (parts: Part[]) =>
  `\\displaystyle ${parts
    .map((p) => `\\htmlData{part=${p.id}}{${wrapTokens(texTokens(p.tex), (k) => `\\htmlData{tok=${k}}`)}}`)
    .join(" ")}`;

const drawTex = (tokens: DrawnToken[]) => `\\displaystyle ${drawTokens(tokens)}`;

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
    fontsLoaded.then(() => {
      setMeasured(
        refs.current.map((box) => {
          const origin = box!.querySelector("[data-origin]")!.getBoundingClientRect();
          const inkOf = (e: Element): Ink => {
            const r = inkRect(e);
            return {
              x0: (r.left - origin.left) / scale,
              x1: (r.right - origin.left) / scale,
              y0: (r.top - origin.top) / scale,
              y1: (r.bottom - origin.top) / scale,
            };
          };
          const ink: Record<string, Ink> = {};
          const tokens: Record<string, Ink[]> = {};
          box!.querySelectorAll<HTMLElement>("[data-part]").forEach((part) => {
            ink[part.dataset.part!] = inkOf(part);
            tokens[part.dataset.part!] = [...part.querySelectorAll("[data-tok]")].map(inkOf);
          });
          return { baseline: (origin.top - box!.getBoundingClientRect().top) / scale, ink, tokens };
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
  let cur = 0;
  let vis: Record<string, number> = Object.fromEntries(p.parts.map((q) => [q.id, 0]));
  let col: Record<string, string> = Object.fromEntries(p.parts.map((q) => [q.id, themeColor(q.color)]));
  let rise: Record<string, number> = {};
  let from: { layout: number; a: Action; vis: Record<string, number>; col: Record<string, string>; morph: Record<string, string[]> } | null = null;
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

  const tokensOf = (i: number) => layouts[i].map((q) => texTokens(q.tex));
  // At rest, every token as its part says; mid-transform, see morph.ts: tokens
  // the old and new layout share (same part, or a morph target and its
  // sources) move to their new slot, the others fade out or in in place.
  let current: DrawnToken[] = layouts[cur].flatMap((q, i) =>
    tokensOf(cur)[i].map((tex) => ({ tex, color: col[q.id], opacity: vis[q.id], dx: 0, dy: rise[q.id] ?? 0 })),
  );
  let old: DrawnToken[] = [];
  if (from) {
    const f = from;
    const [was, now] = [layouts[f.layout], layouts[cur]];
    const [wasToks, nowToks] = [tokensOf(f.layout), tokensOf(cur)];
    const at = (i: number, part: string, k: number): InkBox => {
      const b = measured[i].tokens[part][k];
      return [originX[i] + b.x0, b.y0, originX[i] + b.x1, b.y1];
    };
    // New token (part index, token) -> the old token it moves from.
    const source = new Map<string, { part: number; k: number }>();
    const moving = new Set<string>();
    now.forEach((q, j) => {
      const ids = was.some((o) => o.id === q.id) ? [q.id] : (f.morph[q.id] ?? []);
      const src = ids.flatMap((id) => {
        const i = was.findIndex((o) => o.id === id);
        return wasToks[i].map((tex, k) => ({ part: i, k, tex }));
      });
      for (const [a, b] of matchTokens(src.map((t) => t.tex), nowToks[j])) {
        if (moving.has(`${src[a].part}.${src[a].k}`)) continue;
        moving.add(`${src[a].part}.${src[a].k}`);
        source.set(`${j}.${b}`, src[a]);
      }
    });
    const w = schedule(
      was.flatMap((o, i) => wasToks[i].flatMap((_, k) => (moving.has(`${i}.${k}`) || !f.vis[o.id] ? [] : [at(f.layout, o.id, k)]))),
      now.flatMap((q, j) =>
        nowToks[j].flatMap((_, k) => {
          const s = source.get(`${j}.${k}`);
          return s ? [[at(f.layout, was[s.part].id, s.k), at(cur, q.id, k)] as [InkBox, InkBox]] : [];
        }),
      ),
      now.flatMap((q, j) => nowToks[j].flatMap((_, k) => (source.has(`${j}.${k}`) ? [] : [at(cur, q.id, k)]))),
      f.a.ease,
    );
    const out = 1 - phase(f.a, frame, ...w.out);
    const move = phase(f.a, frame, ...w.move);
    const enter = phase(f.a, frame, ...w.in);
    old = was.flatMap((o, i) =>
      wasToks[i].map((tex, k) => ({
        tex,
        color: f.col[o.id],
        opacity: moving.has(`${i}.${k}`) ? 0 : f.vis[o.id] * out,
        dx: 0,
        dy: 0,
      })),
    );
    current = now.flatMap((q, j) =>
      nowToks[j].map((tex, k) => {
        const s = source.get(`${j}.${k}`);
        if (!s) return { tex, color: col[q.id], opacity: enter, dx: 0, dy: 0 };
        const src = was[s.part].id;
        return {
          tex,
          color: mix(f.col[src], col[q.id], move),
          opacity: f.vis[src],
          ...moveOffset(at(f.layout, src, s.k), at(cur, q.id, k), move),
        };
      }),
    );
  }

  // Math must stay inside the content bounds: scale the row about its anchor if a layout overflows.
  const anchorX = p.align ? p.align.x : p.centerX!;
  const fit = Math.min(
    1,
    ...measured.flatMap((m, i) => {
      const inks = layouts[i].map((q) => m.ink[q.id]);
      const l = originX[i] + Math.min(...inks.map((b) => b.x0));
      const r = originX[i] + Math.max(...inks.map((b) => b.x1));
      return [
        l < content.left ? (anchorX - content.left) / (anchorX - l) : 1,
        r > content.right ? (content.right - anchorX) / (r - anchorX) : 1,
      ];
    }),
  );

  const row = (i: number, tokens: DrawnToken[]) => (
    <div
      data-text="equation"
      style={{ position: "absolute", left: originX[i], top: p.y - measured[i].baseline, whiteSpace: "nowrap" }}
    >
      <Origin />
      <Tex tex={drawTex(tokens)} trust fontSize={fontSize} />
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
