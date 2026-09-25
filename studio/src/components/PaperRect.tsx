import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentScale } from "remotion";
import {
  Action,
  bump,
  ElementTimeline,
  lerp,
  mix,
  phase,
  rawProgress,
  Scene,
  themeColor,
} from "../storyboard/timeline";
import { fontsLoaded } from "../style/fonts";
import { color, fill, font, mark, stroke, type, VIDEO } from "../style/theme";
import { Anchored } from "./Anchored";
import { expressionInk, tokenInk } from "./ink";
import { drawTokens, InkBox, matchTokens, morph, tokenize, TokenStyle } from "./morph";
import { Tex } from "./Tex";

// A sheet of paper: an axis-aligned rectangle that folds, stands up, and
// carries edge labels. Spec: storyboard.json → components → PaperRect.

export type Box = { cx: number; cy: number; w: number; h: number };
type Pair = "long" | "short";
type Label = { tex: string; color: string };
export type Side = "bottom" | "right";

type Props = {
  center?: [number, number];
  w?: number;
  h?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  dashed?: boolean;
  edgeColors?: Partial<Record<Pair, string>>;
  labels?: Partial<Record<Side, Label>>;
  name?: string;
  valueLabel?: { side: "right"; color: string } | null;
  followHalfOf?: string;
  page?: boolean;
};

export type PaperState = {
  opacity: number;
  box: Box;
  rot: number; // degrees clockwise about the center, only while rotating
  stroke: string;
  edge: Record<Pair, string>;
  edgeWidth: Record<Pair, number>;
  strokeWidth: number;
  fill: string;
  fillOpacity: number;
  dashed: number; // 1 = dashed outline, 0 = solid; between, the gaps fill in
  page: number; // document content (the page prop), 0..1
  draw: number; // share of the outline drawn on
  content: number; // fill, labels and name fade in after the outline
  midline: number; // share of the fold line drawn, from the center outward
  flip: number | null; // while folding: 0 = flat, 1 = the top half lies on the bottom half
  // `change`: a setStyle still turning this label from another text.
  labels: (Label & { side: Side; opacity: number; change?: Label & { a: Action } })[];
  names: { text: string; opacity: number }[];
  valueLabel: { color: string; opacity: number } | null;
};

export const rotated = (b: Box, deg: number): Box =>
  (deg / 90) % 2 === 0 ? b : { ...b, w: b.h, h: b.w };

const lerpBox = (a: Box, b: Box, t: number): Box => ({
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

type Match = "width" | "height";

// standAndFit's end: scaled uniformly until its width (or height) equals
// ref's, bottom-left corners together.
const fitTo = (b: Box, ref: Box, match: Match): Box => {
  const k = match === "height" ? ref.h / b.h : ref.w / b.w;
  const w = b.w * k;
  const h = b.h * k;
  return { cx: ref.cx - ref.w / 2 + w / 2, cy: ref.cy + ref.h / 2 - h / 2, w, h };
};

// The half a fold across the long side leaves, stood up and fitted to the sheet.
const fittedHalf = (ref: Box, match: Match): Box => {
  const half = ref.h >= ref.w ? { ...ref, h: ref.h / 2 } : { ...ref, w: ref.w / 2 };
  return fitTo(rotated(half, 90), ref, match);
};

const STYLE_KEYS = ["stroke", "fill", "fillOpacity", "dashed", "page", "edgeColors", "labels", "name", "valueLabel"];

// Which pair the horizontal (top/bottom) edges belong to.
const horizontalPair = (b: Box): Pair => (b.w > b.h ? "long" : "short");
const other = (p: Pair): Pair => (p === "long" ? "short" : "long");

export const paperState = (el: ElementTimeline, scene: Scene): PaperState => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  const strokeColor = themeColor(p.stroke ?? "text");
  const edgeSet = { long: !!p.edgeColors?.long, short: !!p.edgeColors?.short };
  const s: PaperState = {
    opacity: el.spec.visibleAtStart ? 1 : 0,
    box: p.followHalfOf
      ? fittedHalf(scene.paper(p.followHalfOf).box, "width")
      : { cx: p.center![0], cy: p.center![1], w: p.w!, h: p.h! },
    rot: 0,
    stroke: strokeColor,
    edge: {
      long: p.edgeColors?.long ? themeColor(p.edgeColors.long) : strokeColor,
      short: p.edgeColors?.short ? themeColor(p.edgeColors.short) : strokeColor,
    },
    edgeWidth: { long: 0, short: 0 },
    strokeWidth: p.strokeWidth ?? stroke.sheet,
    fill: themeColor(p.fill ?? p.stroke ?? "text"),
    fillOpacity: p.fillOpacity ?? fill.sheet,
    dashed: p.dashed ? 1 : 0,
    page: p.page ? 1 : 0,
    draw: 1,
    content: 1,
    midline: 0,
    flip: null,
    labels: (["bottom", "right"] as const)
      .filter((side) => p.labels?.[side])
      .map((side) => ({ side, ...p.labels![side]!, color: themeColor(p.labels![side]!.color), opacity: 1 })),
    names: p.name ? [{ text: p.name, opacity: 1 }] : [],
    valueLabel: p.valueLabel ? { color: themeColor(p.valueLabel.color), opacity: 1 } : null,
  };
  const pulses: { pairs: Pair[]; color?: string; b: number }[] = [];

  for (const a of el.actions) {
    if (frame < a.from) break;
    const t = rawProgress(a, frame);
    const e = phase(a, frame);
    const q = a.params;
    switch (a.action) {
      case "appear":
        if (q.mode === "fade") {
          s.opacity = e;
        } else {
          s.opacity = 1;
          s.draw = phase(a, frame, 0, 0.7);
          s.content = phase(a, frame, 0.7, 1);
        }
        break;
      case "exit":
        s.opacity *= 1 - e;
        break;
      case "moveTo":
        s.box = lerpBox(s.box, { cx: q.center[0], cy: q.center[1], w: q.w ?? s.box.w, h: q.h ?? s.box.h }, e);
        break;
      case "resize": {
        const h = s.box.w * q.ratio;
        s.box = lerpBox(s.box, { ...s.box, cy: s.box.cy + s.box.h / 2 - h / 2, h }, e);
        break;
      }
      case "showMidline":
        s.midline = e;
        break;
      case "rotate":
        if (q.deg % 90 !== 0) throw new Error(`${el.spec.id}: rotate by ${q.deg}°; only multiples of 90 keep it axis-aligned`);
        if (t < 1) s.rot = q.deg * e;
        else s.box = rotated(s.box, q.deg);
        break;
      case "standAndFit": {
        const match: Match = q.match ?? "width";
        if (match !== "width" && match !== "height") throw new Error(`${el.spec.id}: standAndFit match ${match}`);
        if (t < 0.4) {
          s.rot = 90 * phase(a, frame, 0, 0.4);
        } else if (q.follow) {
          // The fitted half of ref's live box, from here on: it tracks ref's
          // moves and resizes, and later geometry actions start from it.
          s.box = lerpBox(rotated(s.box, 90), fittedHalf(scene.paper(q.ref).box, match), phase(a, frame, 0.4, 1));
        } else {
          // Fitted to ref as it is when the fit ends; ref moving later leaves it be.
          const ref = (t < 1 ? scene : scene.at(a.to)).paper(q.ref).box;
          const stood = rotated(s.box, 90);
          s.box = lerpBox(stood, fitTo(stood, ref, match), phase(a, frame, 0.4, 1));
        }
        break;
      }
      case "fold": {
        if (s.box.w > s.box.h) throw new Error(`${el.spec.id}: fold expects a portrait sheet (top half onto bottom)`);
        if (s.page > 0) throw new Error(`${el.spec.id}: fold with its page content showing; setStyle page false first`);
        // The name is gone before the fold line draws, so the line never crosses it.
        const nameOut = phase(a, frame, 0, 0.15);
        const drawLine = phase(a, frame, 0.15, 0.3);
        const flip = phase(a, frame, 0.3, 1);
        if (t < 1) {
          s.midline = Math.max(s.midline, drawLine);
          s.names = s.names.map((n) => ({ ...n, opacity: n.opacity * (1 - nameOut) }));
          s.flip = flip;
          s.stroke = mix(s.stroke, color.teal, flip);
          s.edge = { long: mix(s.edge.long, color.teal, flip), short: mix(s.edge.short, color.teal, flip) };
          s.fill = mix(s.fill, color.teal, flip);
        } else {
          // The sheet is now its bottom half, and the fold line its top edge.
          s.box = { ...s.box, cy: s.box.cy + s.box.h / 4, h: s.box.h / 2 };
          s.stroke = s.fill = color.teal;
          s.edge = { long: color.teal, short: color.teal };
          edgeSet.long = edgeSet.short = false;
          s.fillOpacity = fill.sheet;
          s.midline = 0;
          s.names = [];
        }
        break;
      }
      case "setStyle":
        for (const key of Object.keys(q)) {
          if (!STYLE_KEYS.includes(key)) throw new Error(`${el.spec.id}: setStyle ${key} is not supported`);
        }
        if ("stroke" in q) {
          const to = themeColor(q.stroke);
          s.stroke = mix(s.stroke, to, e);
          for (const pair of ["long", "short"] as const) if (!edgeSet[pair]) s.edge[pair] = mix(s.edge[pair], to, e);
        }
        if ("fill" in q) s.fill = mix(s.fill, themeColor(q.fill), e);
        if ("fillOpacity" in q) s.fillOpacity = lerp(s.fillOpacity, q.fillOpacity, e);
        if ("dashed" in q) s.dashed = lerp(s.dashed, q.dashed ? 1 : 0, e);
        if ("page" in q) s.page = lerp(s.page, q.page ? 1 : 0, e);
        if ("edgeColors" in q) {
          for (const pair of ["long", "short"] as const) {
            const c = q.edgeColors?.[pair];
            s.edge[pair] = mix(s.edge[pair], c ? themeColor(c) : s.stroke, e);
            edgeSet[pair] = !!c;
          }
        }
        if ("labels" in q) {
          for (const side of ["bottom", "right"] as const) {
            const next: Label | undefined = q.labels?.[side];
            const cur = s.labels.filter((l) => l.side === side);
            const rest = s.labels.filter((l) => l.side !== side);
            const kept =
              next && cur.length === 1 && cur[0].tex === next.tex
                ? [{ ...cur[0], color: mix(cur[0].color, themeColor(next.color), e) }]
                : next && cur.length === 1
                  ? [
                      {
                        side,
                        tex: next.tex,
                        color: themeColor(next.color),
                        opacity: cur[0].opacity,
                        ...(t < 1 ? { change: { tex: cur[0].tex, color: cur[0].color, a } } : {}),
                      },
                    ]
                  : [
                      ...cur.map((l) => ({ ...l, opacity: l.opacity * (1 - e) })),
                      ...(next ? [{ side, tex: next.tex, color: themeColor(next.color), opacity: e }] : []),
                    ];
            s.labels = [...rest, ...kept.filter((l) => l.opacity > 0)];
          }
        }
        if ("name" in q && !(s.names.length === 1 && s.names[0].text === q.name)) {
          s.names = [
            ...s.names.map((n) => ({ ...n, opacity: n.opacity * (1 - e) })),
            ...(q.name ? [{ text: q.name as string, opacity: e }] : []),
          ].filter((n) => n.opacity > 0);
        }
        if ("valueLabel" in q) {
          s.valueLabel = q.valueLabel
            ? { color: themeColor(q.valueLabel.color), opacity: s.valueLabel ? 1 : e }
            : s.valueLabel && { ...s.valueLabel, opacity: s.valueLabel.opacity * (1 - e) };
        }
        break;
      case "handOff":
        // Internal (timeline.ts): an Equation reveal takes this label off the sheet.
        s.labels = s.labels.filter((l) => l.side !== q.label);
        break;
      case "pulse": {
        const edges = q.edges ?? "all";
        pulses.push({
          pairs: edges === "all" ? ["long", "short"] : [edges],
          color: q.color && themeColor(q.color),
          b: bump(a, frame),
        });
        break;
      }
      default:
        throw new Error(`PaperRect ${el.spec.id}: unknown action ${a.action}`);
    }
  }

  s.edgeWidth = { long: s.strokeWidth, short: s.strokeWidth };
  for (const pu of pulses) {
    for (const pair of pu.pairs) {
      s.edgeWidth[pair] = Math.max(s.edgeWidth[pair], s.strokeWidth * (1 + pu.b));
      if (pu.color) s.edge[pair] = mix(s.edge[pair], pu.color, pu.b);
    }
  }
  return s;
};

type EdgeStyle = { color: string; width: number };

// Rectangle outline as four edges (top, right, bottom, left), drawn on
// clockwise from the top-left corner, plus its fill. Shared by every sheet so
// equal inputs give identical pixels. Between dashed (1) and solid (0), the
// solid outline fades in over the dashed one, so the gaps fill in.
export const SheetShape: React.FC<{
  box: Box;
  edges: [EdgeStyle, EdgeStyle, EdgeStyle, EdgeStyle];
  dashed?: number;
  draw?: number;
  fill: string;
  fillOpacity: number;
}> = ({ box, edges, dashed = 0, draw = 1, fill: fillColor, fillOpacity }) => {
  const l = box.cx - box.w / 2;
  const r = box.cx + box.w / 2;
  const t = box.cy - box.h / 2;
  const b = box.cy + box.h / 2;
  let budget = draw * 2 * (box.w + box.h);
  const segs = (
    [
      [l, t, r, t],
      [r, t, r, b],
      [r, b, l, b],
      [l, b, l, t],
    ] as const
  ).map(([x1, y1, x2, y2]) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const k = Math.min(budget, len) / len;
    budget -= len;
    return { x1, y1, x2: x1 + (x2 - x1) * k, y2: y1 + (y2 - y1) * k, drawn: k > 0 };
  });
  const outline = (dash: boolean, opacity: number) =>
    segs.map((sg, i) =>
      sg.drawn ? (
        <line
          key={`${dash}-${i}`}
          x1={sg.x1}
          y1={sg.y1}
          x2={sg.x2}
          y2={sg.y2}
          stroke={edges[i].color}
          strokeWidth={edges[i].width}
          strokeLinecap={dash ? "butt" : "square"}
          strokeDasharray={dash ? stroke.dash.join(" ") : undefined}
          opacity={opacity < 1 ? opacity : undefined}
        />
      ) : null,
    );
  return (
    <>
      {fillOpacity > 0 ? (
        <rect x={l} y={t} width={box.w} height={box.h} fill={fillColor} fillOpacity={fillOpacity} />
      ) : null}
      {dashed > 0 ? outline(true, 1) : null}
      {dashed < 1 ? outline(false, 1 - dashed) : null}
    </>
  );
};

// The page prop's document, in fractions of the box from its top-left: a
// title bar, text lines (y, length, all from x 0.12) and a framed figure of a
// mountain and a sun. Stroke widths stay fixed as the box scales. No glyphs,
// so nothing to hold to the legibility floor.
const PAGE = {
  left: 0.12,
  title: { x: [0.12, 0.62], y: [0.07, 0.105], radius: 4 },
  lines: [
    [0.17, 0.76],
    [0.22, 0.72],
    [0.27, 0.76],
    [0.32, 0.46],
    [0.74, 0.76],
    [0.8, 0.7],
    [0.86, 0.52],
  ],
  figure: { x: [0.12, 0.6], y: [0.4, 0.66] },
  mountain: [
    [0.14, 0.64],
    [0.26, 0.5],
    [0.34, 0.58],
    [0.44, 0.47],
    [0.58, 0.64],
  ],
  sun: { x: 0.53, y: 0.46, r: 0.03 }, // r in box widths
} as const;

const PageContent: React.FC<{ box: Box; opacity: number }> = ({ box, opacity }) => {
  const x = (f: number) => box.cx - box.w / 2 + f * box.w;
  const y = (f: number) => box.cy - box.h / 2 + f * box.h;
  const ink = { stroke: color.muted, strokeWidth: stroke.line, fill: "none" };
  const { title, figure, sun } = PAGE;
  return (
    <g opacity={opacity}>
      <rect
        x={x(title.x[0])}
        y={y(title.y[0])}
        width={x(title.x[1]) - x(title.x[0])}
        height={y(title.y[1]) - y(title.y[0])}
        rx={title.radius}
        fill={color.text}
      />
      {PAGE.lines.map(([fy, len]) => (
        <line key={fy} x1={x(PAGE.left)} y1={y(fy)} x2={x(PAGE.left + len)} y2={y(fy)} {...ink} strokeLinecap="round" />
      ))}
      <rect
        x={x(figure.x[0])}
        y={y(figure.y[0])}
        width={x(figure.x[1]) - x(figure.x[0])}
        height={y(figure.y[1]) - y(figure.y[0])}
        {...ink}
      />
      <polyline
        points={PAGE.mountain.map(([fx, fy]) => `${x(fx)},${y(fy)}`).join(" ")}
        {...ink}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={x(sun.x)} cy={y(sun.y)} r={sun.r * box.w} {...ink} />
    </g>
  );
};

export const SheetName: React.FC<{ box: Box; text: string; opacity: number }> = ({ box, text, opacity }) => (
  <Anchored x={box.cx} y={box.cy} anchor="center" opacity={opacity} kind="name">
    <div style={{ ...type.label, fontFamily: font.sans, color: color.text }}>{text}</div>
  </Anchored>
);

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", left: 0, top: 0 }}>
    {children}
  </svg>
);

// Dashed fold line across the middle, parallel to the short sides, drawn from
// the center outward (two halves, so the dashes don't crawl as it grows).
const Midline: React.FC<{ box: Box; drawn: number; width: number; opacity?: number }> = ({
  box,
  drawn,
  width,
  opacity = 1,
}) => {
  const across = box.h >= box.w; // horizontal line on a portrait sheet
  const reach = (drawn * (across ? box.w : box.h)) / 2;
  return (
    <g opacity={opacity}>
      {[-1, 1].map((dir) => (
        <line
          key={dir}
          x1={box.cx}
          y1={box.cy}
          x2={across ? box.cx + dir * reach : box.cx}
          y2={across ? box.cy : box.cy + dir * reach}
          stroke={color.muted}
          strokeWidth={width}
          strokeDasharray={stroke.dash.join(" ")}
          strokeDashoffset={stroke.dash[0] + stroke.dash[1] / 2}
        />
      ))}
    </g>
  );
};

// Mid-fold: the bottom half stays, the top half (the flap) flips down about
// the midline as a y-scale from 1 to −1.
const Folding: React.FC<{ s: PaperState; flip: number }> = ({ s, flip }) => {
  const { cx, cy, w, h } = s.box;
  const l = cx - w / 2;
  const r = cx + w / 2;
  const top = cy - h / 2;
  const flapTop = cy + (1 - 2 * flip) * (top - cy);
  // Portrait sheet: vertical edges are the long pair, horizontal ones the short.
  const line = (x1: number, y1: number, x2: number, y2: number, opacity = 1) => {
    const pair = x1 === x2 ? "long" : "short";
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={s.edge[pair]}
        strokeWidth={s.edgeWidth[pair]}
        strokeLinecap="square"
        opacity={opacity}
      />
    );
  };
  // The flap's fill rises to fill.flap as it lifts and drops to nothing as it
  // lands, so the landed stack reads as the single half it becomes.
  const flapFill = Math.min(
    lerp(s.fillOpacity * s.content, fill.flap, Math.min(flip / 0.2, 1)),
    fill.flap * Math.min((1 - flip) / 0.2, 1),
  );
  return (
    <>
      <rect x={l} y={cy} width={w} height={h / 2} fill={s.fill} fillOpacity={s.fillOpacity * s.content} />
      {line(l, cy, l, cy + h / 2)}
      {line(l, cy + h / 2, r, cy + h / 2)}
      {line(r, cy, r, cy + h / 2)}
      <Midline box={s.box} drawn={s.midline} width={s.strokeWidth} opacity={1 - flip} />
      {line(l, cy, r, cy, flip)}
      <rect
        x={l}
        y={Math.min(cy, flapTop)}
        width={w}
        height={Math.abs(flapTop - cy)}
        fill={s.fill}
        fillOpacity={flapFill}
      />
      {line(l, cy, l, flapTop)}
      {line(r, cy, r, flapTop)}
      {line(l, flapTop, r, flapTop)}
    </>
  );
};

type Rel = { l: number; t: number; r: number; b: number }; // ink, relative to the label's top-left
type LabelMetrics = { ink: Rel; tokens: (Rel | null)[] };

// Where a label's top-left goes so its ink sits beside the edge: centered
// below the bottom edge, or right of the right edge and centered on it.
export const labelAt = (box: Box, side: Side, ink: Rel) =>
  side === "bottom"
    ? { left: box.cx - (ink.l + ink.r) / 2, top: box.cy + box.h / 2 + mark.edgeLabelGap - ink.t }
    : { left: box.cx + box.w / 2 + mark.edgeLabelGap - ink.l, top: box.cy - (ink.t + ink.b) / 2 };

// An edge label's line (its Tex at the default type.mathInline).
export const labelLineStyle = { position: "absolute", display: "flex", whiteSpace: "nowrap" } as const;

// An edge label's TeX, tokenized (morph.ts): every token in `color`, as drawn
// at rest, or without a color, each token marked for measuring.
export const labelTex = (tex: string, color?: string) => {
  const t = tokenize(tex);
  return color === undefined
    ? t.tex((k) => `\\htmlData{tok=${k}}`)
    : drawTokens(
        t,
        t.keys.map(() => ({ color, opacity: 1, dx: 0, dy: 0 })),
      );
};

// Edge label, placed by its ink rather than its line box: KaTeX's box adds
// more room above a digit than above a fraction, so equal box gaps look
// unequal. A setStyle that changes its text morphs it (morph.ts): tokens both
// texts share move from the old placement to the new one, the rest fade out
// or in in place, and no two different glyphs ever overlap.
const SideLabel: React.FC<{
  box: Box;
  side: Side;
  opacity: number;
  label: Label;
  change?: Label & { a: Action };
  frame: number;
}> = ({ box, side, opacity, label, change, frame }) => {
  const texs = change ? [change.tex, label.tex] : [label.tex];
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const scale = useCurrentScale();
  const [metrics, setMetrics] = useState(new Map<string, LabelMetrics>());
  const missing = JSON.stringify(texs.filter((t) => !metrics.has(t)));
  useLayoutEffect(() => {
    const todo: string[] = JSON.parse(missing);
    if (!todo.length) return;
    const handle = delayRender(`measure label ${todo.join(", ")}`);
    fontsLoaded.then(() => {
      const next = new Map(metrics);
      for (const t of todo) {
        const node = nodes.current.get(t)!;
        const outer = node.getBoundingClientRect();
        const rel = (r: { left: number; top: number; right: number; bottom: number }): Rel => ({
          l: (r.left - outer.left) / scale,
          t: (r.top - outer.top) / scale,
          r: (r.right - outer.left) / scale,
          b: (r.bottom - outer.top) / scale,
        });
        const tokens: (Rel | null)[] = [];
        node.querySelectorAll<HTMLElement>("[data-tok]").forEach((e) => {
          const r = tokenInk(e);
          tokens[Number(e.dataset.tok)] = r && rel(r);
        });
        next.set(t, { ink: rel(expressionInk(node)), tokens });
      }
      setMetrics(next);
      continueRender(handle);
    });
  }, [missing, metrics, scale]);
  const measuring = texs
    .filter((t) => !metrics.has(t))
    .map((t) => (
      <div
        key={`m-${t}`}
        ref={(n) => {
          if (n) nodes.current.set(t, n);
          else nodes.current.delete(t);
        }}
        style={{ ...labelLineStyle, left: 0, top: 0, visibility: "hidden" }}
      >
        <Tex tex={labelTex(t)} trust />
      </div>
    ));
  if (measuring.length) return <>{measuring}</>;

  const at = (t: string) => labelAt(box, side, metrics.get(t)!.ink);
  const line = (t: string, styles: TokenStyle[], key: string) => (
    <div key={key} data-text="edge-label" style={{ ...labelLineStyle, ...at(t), opacity }}>
      <Tex tex={drawTokens(tokenize(t), styles)} trust name={t} />
    </div>
  );
  if (!change) return line(label.tex, tokenize(label.tex).keys.map(() => ({ color: label.color, opacity: 1, dx: 0, dy: 0 })), label.tex);
  const flat = (t: string, tag: string) => {
    const tk = tokenize(t);
    const o = at(t);
    const m = metrics.get(t)!;
    return tk.keys.map((key, k) => {
      const b = m.tokens[k];
      return {
        key,
        id: `${tag}${k}`,
        parent: tk.parents[k] === null ? null : `${tag}${tk.parents[k]}`,
        box: b && ([o.left + b.l, o.top + b.t, o.left + b.r, o.top + b.b] as InkBox),
      };
    });
  };
  const src = flat(change.tex, "o");
  const dst = flat(label.tex, "n");
  const matched = matchTokens(
    src.map((t) => t.key),
    dst.map((t) => t.key),
  );
  const r = morph(src, dst, matched, (p0, p1) => phase(change.a, frame, p0, p1), change.a.ease);
  return (
    <>
      {line(
        change.tex,
        src.map((_, i) => ({ color: change.color, opacity: r.old[i], dx: 0, dy: 0 })),
        `old-${change.tex}`,
      )}
      {line(
        label.tex,
        r.new.map((n) => ({
          color: n.source === null ? label.color : mix(change.color, label.color, r.move),
          opacity: n.opacity,
          dx: n.dx,
          dy: n.dy,
        })),
        label.tex,
      )}
    </>
  );
};

export const PaperRect: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const s = scene.paper(el.spec.id);
  if (s.opacity <= 0) return null;
  const hp = horizontalPair(s.box);
  const edgeOf = (pair: Pair) => ({ color: s.edge[pair], width: s.edgeWidth[pair] });
  return (
    <AbsoluteFill style={{ opacity: s.opacity }}>
      <Svg>
        <g transform={s.rot ? `rotate(${s.rot} ${s.box.cx} ${s.box.cy})` : undefined}>
          {s.flip !== null ? (
            <Folding s={s} flip={s.flip} />
          ) : (
            <>
              <SheetShape
                box={s.box}
                edges={[edgeOf(hp), edgeOf(other(hp)), edgeOf(hp), edgeOf(other(hp))]}
                dashed={s.dashed}
                draw={s.draw}
                fill={s.fill}
                fillOpacity={s.fillOpacity * s.content}
              />
              {s.page > 0 ? <PageContent box={s.box} opacity={s.page * s.content} /> : null}
              {s.midline > 0 ? <Midline box={s.box} drawn={s.midline} width={s.strokeWidth} /> : null}
            </>
          )}
        </g>
      </Svg>
      {s.labels.map((l) => (
        <SideLabel
          key={l.side}
          box={s.box}
          side={l.side}
          opacity={l.opacity * s.content}
          label={l}
          change={l.change}
          frame={scene.frame}
        />
      ))}
      {s.valueLabel ? (
        <SideLabel
          box={s.box}
          side="right"
          opacity={s.valueLabel.opacity * s.content}
          label={{ tex: (s.box.h / s.box.w).toFixed(3), color: s.valueLabel.color }}
          frame={scene.frame}
        />
      ) : null}
      {s.names.map((n) => (
        <SheetName key={n.text} box={s.box} text={n.text} opacity={n.opacity * s.content} />
      ))}
    </AbsoluteFill>
  );
};
