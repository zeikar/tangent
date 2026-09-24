import React from "react";
import { AbsoluteFill } from "remotion";
import {
  bump,
  ElementTimeline,
  lerp,
  mix,
  phase,
  rawProgress,
  Scene,
  themeColor,
} from "../storyboard/timeline";
import { color, fill, font, mark, stroke, type, VIDEO } from "../style/theme";
import { Anchored } from "./Anchored";
import { Tex } from "./Tex";

// A sheet of paper: an axis-aligned rectangle that folds, stands up, and
// carries edge labels. Spec: storyboard.json → components → PaperRect.

export type Box = { cx: number; cy: number; w: number; h: number };
type Pair = "long" | "short";
type Label = { tex: string; color: string };
type Side = "bottom" | "right";

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
  dashed: boolean;
  draw: number; // share of the outline drawn on
  content: number; // fill, labels and name fade in after the outline
  midline: number; // share of the fold line drawn, from the center outward
  flip: number | null; // while folding: 0 = flat, 1 = the top half lies on the bottom half
  labels: (Label & { side: Side; opacity: number })[];
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

// standAndFit's end: scaled uniformly to ref's width, bottom-left corners together.
const fitTo = (b: Box, ref: Box): Box => {
  const h = (b.h * ref.w) / b.w;
  return { cx: ref.cx, cy: ref.cy + ref.h / 2 - h / 2, w: ref.w, h };
};

// The half a fold across the long side leaves, stood up and fitted to the sheet.
const fittedHalf = (ref: Box): Box => {
  const half = ref.h >= ref.w ? { ...ref, h: ref.h / 2 } : { ...ref, w: ref.w / 2 };
  return fitTo(rotated(half, 90), ref);
};

const STYLE_KEYS = ["stroke", "fill", "fillOpacity", "edgeColors", "labels", "name", "valueLabel"];

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
      ? fittedHalf(scene.paper(p.followHalfOf).box)
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
    dashed: !!p.dashed,
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
      case "standAndFit":
        if (t < 0.4) {
          s.rot = 90 * phase(a, frame, 0, 0.4);
        } else {
          const stood = rotated(s.box, 90);
          s.box = lerpBox(stood, fitTo(stood, scene.paper(q.ref).box), phase(a, frame, 0.4, 1));
        }
        break;
      case "fold": {
        if (s.box.w > s.box.h) throw new Error(`${el.spec.id}: fold expects a portrait sheet (top half onto bottom)`);
        const drawLine = phase(a, frame, 0, 0.3);
        const flip = phase(a, frame, 0.3, 1);
        if (t < 1) {
          s.midline = Math.max(s.midline, drawLine);
          s.names = s.names.map((n) => ({ ...n, opacity: n.opacity * (1 - drawLine) }));
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
// equal inputs give identical pixels.
export const SheetShape: React.FC<{
  box: Box;
  edges: [EdgeStyle, EdgeStyle, EdgeStyle, EdgeStyle];
  dashed?: boolean;
  draw?: number;
  fill: string;
  fillOpacity: number;
}> = ({ box, edges, dashed = false, draw = 1, fill: fillColor, fillOpacity }) => {
  const l = box.cx - box.w / 2;
  const r = box.cx + box.w / 2;
  const t = box.cy - box.h / 2;
  const b = box.cy + box.h / 2;
  const segs: [number, number, number, number][] = [
    [l, t, r, t],
    [r, t, r, b],
    [r, b, l, b],
    [l, b, l, t],
  ];
  let budget = draw * 2 * (box.w + box.h);
  return (
    <>
      {fillOpacity > 0 ? (
        <rect x={l} y={t} width={box.w} height={box.h} fill={fillColor} fillOpacity={fillOpacity} />
      ) : null}
      {segs.map(([x1, y1, x2, y2], i) => {
        const len = Math.hypot(x2 - x1, y2 - y1);
        const k = Math.min(budget, len) / len;
        budget -= len;
        return k > 0 ? (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x1 + (x2 - x1) * k}
            y2={y1 + (y2 - y1) * k}
            stroke={edges[i].color}
            strokeWidth={edges[i].width}
            strokeLinecap={dashed ? "butt" : "square"}
            strokeDasharray={dashed ? stroke.dash.join(" ") : undefined}
          />
        ) : null;
      })}
    </>
  );
};

export const SheetName: React.FC<{ box: Box; text: string; opacity: number }> = ({ box, text, opacity }) => (
  <Anchored x={box.cx} y={box.cy} anchor="center" opacity={opacity}>
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
    lerp(s.fillOpacity, fill.flap, Math.min(flip / 0.2, 1)),
    fill.flap * Math.min((1 - flip) / 0.2, 1),
  );
  return (
    <>
      <rect x={l} y={cy} width={w} height={h / 2} fill={s.fill} fillOpacity={s.fillOpacity} />
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

const SideLabel: React.FC<{ box: Box; side: Side; opacity: number; children: React.ReactNode }> = ({
  box,
  side,
  opacity,
  children,
}) =>
  side === "bottom" ? (
    <Anchored x={box.cx} y={box.cy + box.h / 2 + mark.labelGap} anchor="top" opacity={opacity}>
      {children}
    </Anchored>
  ) : (
    <Anchored x={box.cx + box.w / 2 + mark.labelGap} y={box.cy} anchor="left" opacity={opacity}>
      {children}
    </Anchored>
  );

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
              {s.midline > 0 ? <Midline box={s.box} drawn={s.midline} width={s.strokeWidth} /> : null}
            </>
          )}
        </g>
      </Svg>
      {s.labels.map((l) => (
        <SideLabel key={`${l.side}-${l.tex}`} box={s.box} side={l.side} opacity={l.opacity * s.content}>
          <Tex tex={l.tex} color={l.color} />
        </SideLabel>
      ))}
      {s.valueLabel ? (
        <SideLabel box={s.box} side="right" opacity={s.valueLabel.opacity * s.content}>
          <Tex tex={(s.box.h / s.box.w).toFixed(3)} color={s.valueLabel.color} />
        </SideLabel>
      ) : null}
      {s.names.map((n) => (
        <SheetName key={n.text} box={s.box} text={n.text} opacity={n.opacity * s.content} />
      ))}
    </AbsoluteFill>
  );
};
