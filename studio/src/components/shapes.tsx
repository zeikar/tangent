import React from "react";
import { Action, ElementTimeline, phase } from "../storyboard/timeline";
import { VIDEO } from "../style/theme";
import { dist, headPoints, polar, Pt, pointsAttr } from "./geometry";

// Pieces the diagram components share: their lifecycle, a frame-sized SVG,
// and arrows.

// Shown from the beat's first frame with visibleAtStart, else from its
// appear (`appear` is that cue's progress); an exit fades it out (`out`
// falls from 1 to 0). Every other action goes to `other`, in start order.
export const lifecycle = (el: ElementTimeline, frame: number, other: (a: Action) => void) => {
  let appear = el.spec.visibleAtStart ? 1 : 0;
  let out = 1;
  for (const a of el.actions) {
    if (frame < a.from) break;
    if (a.action === "appear") appear = phase(a, frame);
    else if (a.action === "exit") out *= 1 - phase(a, frame);
    else other(a);
  }
  return { appear, out };
};

export const Svg: React.FC<{ opacity?: number; children: React.ReactNode }> = ({ opacity = 1, children }) => (
  <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", left: 0, top: 0, opacity }}>
    {children}
  </svg>
);

type Stroke = { color: string; width: number; opacity?: number };

// `closed`: a ring whose points end where they start (figure.ts's ring()
// makes one), drawn one segment past its start so the ends join without a seam.
export const Polyline: React.FC<
  Stroke & { pts: Pt[]; cap?: "butt" | "round"; closed?: boolean; dash?: readonly number[] }
> = ({ pts, color, width, opacity, cap = "butt", closed, dash }) =>
  pts.length > 1 ? (
    <polyline
      points={pointsAttr(closed ? [...pts, pts[1]] : pts)}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap={cap}
      strokeLinejoin="round"
      strokeDasharray={dash?.join(" ")}
      opacity={opacity}
    />
  ) : null;

// The head keeps its size until the arrow is shorter than twice that, then
// shrinks with it, so a growing or shrinking arrow never shows a bare head.
const headFor = (length: number, head: number) => Math.min(head, length / 2);

// A straight arrow from `tail`, `length` long along `deg`.
export const StraightArrow: React.FC<Stroke & { tail: Pt; deg: number; length: number; head: number }> = ({
  tail,
  deg,
  length,
  head,
  color,
  width,
  opacity,
}) => {
  if (length <= 0) return null;
  const h = headFor(length, head);
  const tip = polar(tail, length, deg);
  const neck = polar(tail, length - h, deg);
  return (
    <g opacity={opacity}>
      <line x1={tail[0]} y1={tail[1]} x2={neck[0]} y2={neck[1]} stroke={color} strokeWidth={width} />
      <polygon points={pointsAttr(headPoints(tip, deg, h))} fill={color} />
    </g>
  );
};

// A curved arrow along `pts` (a polyline from arcPoints), its head at the last
// point, pointing along the last segment.
export const CurvedArrow: React.FC<Stroke & { pts: Pt[]; head: number }> = ({ pts, head, color, width, opacity }) => {
  if (pts.length < 2) return null;
  const length = pts.slice(1).reduce((sum, p, i) => sum + dist(pts[i], p), 0);
  const h = headFor(length, head);
  // The line stops where the head's base begins, measured back along the curve.
  let left = h;
  let k = pts.length - 1;
  while (k > 0 && dist(pts[k - 1], pts[k]) < left) left -= dist(pts[k - 1], pts[k--]);
  const [x0, y0] = pts[k - 1] ?? pts[0];
  const [x1, y1] = pts[k];
  const seg = Math.hypot(x1 - x0, y1 - y0) || 1;
  const neck: Pt = [x1 - ((x1 - x0) * left) / seg, y1 - ((y1 - y0) * left) / seg];
  const tip = pts[pts.length - 1];
  const deg = Math.atan2(neck[1] - tip[1], tip[0] - neck[0]) * (180 / Math.PI);
  return (
    <g opacity={opacity}>
      <Polyline pts={[...pts.slice(0, k), neck]} color={color} width={width} />
      <polygon points={pointsAttr(headPoints(tip, deg, h))} fill={color} />
    </g>
  );
};
