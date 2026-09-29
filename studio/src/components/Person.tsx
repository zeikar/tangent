import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, mix, phase, Scene, themeColor } from "../storyboard/timeline";
import { color, figure, stroke, VIDEO, zone } from "../style/theme";
import { capsule, clipAbove, hand, outlineRuns } from "./figure";
import { arcPoints, lerpPt, Pt, pointsAttr } from "./geometry";
import { Polyline, Svg } from "./shapes";

// A simple standing person drawn in code, one arm raised, seen from behind
// or from the front. Its body is one silhouette (head, neck, torso and legs,
// arms) outlined only on the outside; the raised hand shows its back or its
// palm in its own color. It can turn half round about its vertical axis and
// move. Nothing is drawn below the visual zone, so a big figure low in the
// frame is a bust. Spec: storyboard.json → components → Person.

type Side = "screenRight" | "screenLeft";
type View = "back" | "front";
type Face = "back" | "palm";
type Props = {
  at: Pt;
  r: number;
  view: View;
  raise: Side;
  face: Face;
  backColor: string;
  palmColor: string;
  style: "solid" | "ghost";
};

export type PersonState = {
  at: Pt;
  r: number;
  // Horizontal scale of the arms and hand about the head's vertical line:
  // +1 with the raised hand on the screen right, −1 on the left, passing 0
  // halfway through a turn.
  arm: number;
  // The torso's: 1 facing either way, down to figure.profile side on.
  body: number;
  hairline: number; // the hair's lower edge, in r below the head's center
  view: View;
  face: Face;
  // A turning face's features, spread and faded in by this (0 side on, 1 facing).
  features: number;
  shown: number; // appear × exit × opacity
  pulse: { head: number; hand: number };
  hand: { center: Pt; height: number };
};

// Proportions in head radii from the head's center, with the raised arm on
// +x: shoulders at +1.9, ±2.0; waist at +5, ±1.5; feet at +11.
const HAND_AT: Pt = [1.9, -1.9];
const HAND_H = 1.6;
const ARM = 0.225; // half an arm's thickness
const SHOULDER: Pt = [1.775, 2.2]; // where an arm leaves the torso, flush with its side
const LOWERED: Pt = [-2.3, 5.5];
const hairlineOf = (view: View) => (view === "back" ? 1 / 3 : -1 / 3);

const torso: Pt[] = [
  ...arcPoints([-1.5, 2.3], 0.5, 180, 90),
  ...arcPoints([1.5, 2.3], 0.5, 90, 0),
  [1.5, 5],
  [0.95, 11],
  [0.15, 11],
  [0, 6.4],
  [-0.15, 11],
  [-0.95, 11],
  [-1.5, 5],
];
const neck: Pt[] = [
  [-0.35, 0.6],
  [0.35, 0.6],
  [0.35, 2],
  [-0.35, 2],
];

export const person = (scene: Scene, id: string) => scene.state(id, "Person") as PersonState;

export const personState = (el: ElementTimeline, scene: Scene): PersonState => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  let at = p.at;
  let r = p.r;
  let side = p.raise === "screenRight" ? 1 : -1;
  let view = p.view;
  let face = p.face;
  let turning = 0; // progress through a running turn
  let appear = el.spec.visibleAtStart ? 1 : 0;
  let out = 1;
  let opacity = 1;
  const pulse = { head: 0, hand: 0 };
  for (const a of el.actions) {
    if (frame < a.from) break;
    const e = phase(a, frame);
    const q = a.params;
    switch (a.action) {
      case "appear":
        appear = e;
        break;
      case "exit":
        out *= 1 - e;
        break;
      case "setStyle":
        if (Object.keys(q).some((k) => k !== "opacity")) throw new Error(`Person ${el.spec.id}: setStyle takes opacity only`);
        opacity = lerp(opacity, q.opacity, e);
        break;
      case "pulse":
        if (!(q.part in pulse)) throw new Error(`Person ${el.spec.id}: pulse part ${q.part}`);
        pulse[q.part as keyof typeof pulse] = Math.max(pulse[q.part as keyof typeof pulse], bump(a, frame));
        break;
      case "turn":
        if (e >= 1) {
          side = -side;
          view = view === "back" ? "front" : "back";
          face = face === "back" ? "palm" : "back";
          turning = 0;
        } else turning = e;
        break;
      case "moveTo":
        at = lerpPt(at, q.at, e);
        r = lerp(r, q.r, e);
        break;
      default:
        throw new Error(`Person ${el.spec.id}: unknown action ${a.action}`);
    }
  }
  // Mid-turn: the arms and hand swing round the vertical axis (flat, so they
  // narrow to nothing side on), the torso narrows only to its depth, the head
  // stays round while the hairline moves, and past halfway the other side shows.
  const cos = Math.cos(Math.PI * turning);
  const sin = Math.sin(Math.PI * turning);
  const half = turning >= 0.5;
  const flip = (v: string, a: string, b: string) => (half ? (v === a ? b : a) : v);
  const nextView = view === "back" ? "front" : "back";
  const arm = side * cos;
  return {
    at,
    r,
    arm,
    body: Math.hypot(cos, figure.profile * sin),
    hairline: lerp(hairlineOf(view), hairlineOf(nextView), turning),
    view: flip(view, "back", "front") as View,
    face: flip(face, "back", "palm") as Face,
    features: Math.abs(cos),
    shown: appear * out * opacity,
    pulse,
    hand: { center: [at[0] + HAND_AT[0] * r * arm, at[1] + HAND_AT[1] * r], height: HAND_H * r },
  };
};

// A pulsed fill: the extra opacity of `c` over a fill at share `base` that
// brings it to lerp(base, figure.pulse, p).
const boost = (base: number, p: number) => ((figure.pulse - base) * p) / (1 - base);

export const Person: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const s = person(scene, el.spec.id);
  if (s.shown <= 0) return null;
  const p = el.spec.props as Props;
  const ghost = p.style === "ghost";
  const cut = zone.visual.bottom;
  const px =
    (k: number) =>
    ([x, y]: Pt): Pt => [s.at[0] + s.r * x * k, s.at[1] + s.r * y];
  const armPt = px(s.arm);
  const wrist: Pt = [HAND_AT[0] + HAND_H * hand.wrist[0], HAND_AT[1] + HAND_H * hand.wrist[1]];
  const head = arcPoints(s.at, s.r, 0, 360).slice(0, -1);
  const pieces = [
    head,
    neck.map(px(s.body)),
    torso.map(px(s.body)),
    capsule(armPt(SHOULDER), armPt(wrist), ARM * s.r, [true, false]),
    capsule(armPt([-SHOULDER[0], SHOULDER[1]]), armPt(LOWERED), ARM * s.r),
  ]
    .map((pts) => clipAbove(pts, cut))
    .filter((pts) => pts.length > 2);
  const outlineWidth = (i: number) => stroke.line * (i === 0 ? 1 + s.pulse.head : 1);
  const mask = `person-${el.spec.id}`;
  const bodyFill = ghost ? color.muted : mix(color.bg, color.muted, figure.body);
  const hairFill = ghost ? color.muted : mix(color.bg, color.muted, figure.hair);

  // The hair: the head above its hairline.
  const h = Math.asin(Math.max(-1, Math.min(1, s.hairline))) * (180 / Math.PI);
  const hair = arcPoints(s.at, s.r, -h, 180 + h);
  const eye = 0.11 * s.r;
  const eyes = [-0.36, 0.36].map((x) => arcPoints([s.at[0] + x * s.r * s.features, s.at[1] + 0.08 * s.r], eye, 0, 360));
  const mouth = [-0.22, 0.22].map((x) => [s.at[0] + x * s.r * s.features, s.at[1] + 0.5 * s.r] as Pt);

  // The raised hand, thumb toward the body's midline (hand's -x → body's -x).
  const handColor = themeColor(s.face === "back" ? p.backColor : p.palmColor);
  const handPt = ([x, y]: Pt): Pt => [s.hand.center[0] + s.hand.height * x * s.arm, s.hand.center[1] + s.hand.height * y];
  const handPts = clipAbove(hand.outline.map(handPt), cut);
  const handShare = ghost ? figure.ghostHand : figure.hand;

  return (
    <AbsoluteFill style={{ opacity: s.shown }}>
      <Svg>
        <defs>
          {/* Each piece's outline, centered on its edge at twice the width,
              shows only outside every piece: the silhouette's outline. */}
          <mask id={mask} maskUnits="userSpaceOnUse" x={0} y={0} width={VIDEO.width} height={VIDEO.height}>
            <rect x={0} y={0} width={VIDEO.width} height={cut} fill="white" />
            {pieces.map((pts, i) => (
              <polygon key={i} points={pointsAttr(pts)} fill="black" />
            ))}
          </mask>
        </defs>
        <g mask={`url(#${mask})`}>
          {pieces.flatMap((pts, i) =>
            outlineRuns(pts, cut).map((run, k) => (
              <Polyline
                key={`${i}-${k}`}
                pts={run.pts}
                closed={run.closed}
                color={color.text}
                width={2 * outlineWidth(i)}
                dash={ghost ? stroke.dash : undefined}
              />
            )),
          )}
        </g>
        <g opacity={ghost ? figure.ghost : 1}>
          {pieces.map((pts, i) => (
            <polygon key={i} points={pointsAttr(pts)} fill={bodyFill} />
          ))}
        </g>
        {s.pulse.head > 0 ? (
          <polygon points={pointsAttr(head)} fill={color.muted} fillOpacity={boost(ghost ? figure.ghost : figure.body, s.pulse.head)} />
        ) : null}
        <polygon points={pointsAttr(hair)} fill={hairFill} fillOpacity={ghost ? figure.ghostHair : 1} />
        {s.view === "front" ? (
          <g opacity={s.features}>
            {eyes.map((pts, i) => (
              <polygon key={i} points={pointsAttr(pts)} fill={color.text} />
            ))}
            <line x1={mouth[0][0]} y1={mouth[0][1]} x2={mouth[1][0]} y2={mouth[1][1]} stroke={color.text} strokeWidth={stroke.line} strokeLinecap="round" />
          </g>
        ) : null}
        {handPts.length > 2 ? (
          <g>
            <polygon
              points={pointsAttr(handPts)}
              fill={ghost ? handColor : mix(color.bg, handColor, handShare)}
              fillOpacity={ghost ? handShare : 1}
            />
            {s.pulse.hand > 0 ? (
              <polygon points={pointsAttr(handPts)} fill={handColor} fillOpacity={boost(handShare, s.pulse.hand)} />
            ) : null}
            {s.face === "palm"
              ? hand.palmLines.map((line, i) => (
                  <Polyline
                    key={i}
                    pts={line.map(handPt).filter(([, y]) => y <= cut)}
                    color={color.text}
                    width={stroke.thin}
                    opacity={figure.palmLines}
                    cap="round"
                  />
                ))
              : null}
            {outlineRuns(handPts, cut).map((run, k) => (
              <Polyline key={k} pts={run.pts} closed={run.closed} color={handColor} width={stroke.line * (1 + s.pulse.hand)} />
            ))}
          </g>
        ) : null}
      </Svg>
    </AbsoluteFill>
  );
};
