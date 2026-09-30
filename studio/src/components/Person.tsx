import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, mix, phase, Scene, themeColor } from "../storyboard/timeline";
import { color, figure, stroke, VIDEO, zone } from "../style/theme";
import { capsule, clipAbove, hand, HandShape, mitten, outlineRuns, quad, roundCorners, tube } from "./figure";
import { arcPoints, lerpPt, Pt, pointsAttr } from "./geometry";
import { mirrorOf } from "./Mirror";
import { Polyline, Svg } from "./shapes";

// A simple standing person drawn in code, one arm raised, seen from behind
// or from the front, in one of two looks (classic or chibi). Its body is one
// silhouette (head, torso and legs, arms) outlined only on the outside; the
// raised hand shows its back (plain) or its palm (creases) in its own color. It can turn half round about its vertical axis and
// move. Nothing is drawn below the visual zone, so a big figure low in the
// frame is a bust; a person in a mirror (`inside`) is drawn only on its
// glass. Spec: storyboard.json → components → Person.

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
  beneath?: string[]; // elements it is drawn beneath (StoryboardPlayer's registry)
  inside?: string; // a Mirror: drawn only on its live glass
  look?: LookName; // default classic
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
  hairline: number; // the hair's lower edge, in head radii below the head's center
  hairDip: number; // how much lower it runs in the middle
  view: View;
  face: Face;
  // A turning face's features, spread and faded in by this (0 side on, 1 facing).
  features: number;
  shown: number; // appear × exit × opacity
  pulse: { head: number; hand: number };
  hand: { center: Pt; height: number };
};

// A look: the figure's proportions in r from the head's center, with the
// raised arm on +x. The head is `head` r round; hair and face are in head
// radii. The raised hand is centered at handAt, handH tall.
type Look = {
  head: number;
  body: Pt[][]; // neck, torso and legs: narrowed as a turn goes side on
  raised: (wrist: Pt) => Pt[]; // the raised arm up to the wrist, a polygon
  lowered: Pt[];
  hand: HandShape;
  handAt: Pt;
  handH: number;
  hair: Record<View, { line: number; dip: number }>; // the hairline, and how much lower it runs in the middle
  face: { eye: [x: number, y: number, r: number]; mouth: [y: number, halfWidth: number]; smile: number };
};
type LookName = "classic" | "chibi";

const ARM = 0.225; // classic: half an arm's thickness
const SHOULDER: Pt = [1.775, 2.2]; // classic: where an arm leaves the torso, flush with its side

const LOOKS: Record<LookName, Look> = {
  // Shoulders at +1.9, ±2.0; waist at +5, ±1.5; feet at +11.
  classic: {
    head: 1,
    body: [
      [
        [-0.35, 0.6],
        [0.35, 0.6],
        [0.35, 2],
        [-0.35, 2],
      ],
      [
        ...arcPoints([-1.5, 2.3], 0.5, 180, 90),
        ...arcPoints([1.5, 2.3], 0.5, 90, 0),
        [1.5, 5],
        [0.95, 11],
        [0.15, 11],
        [0, 6.4],
        [-0.15, 11],
        [-0.95, 11],
        [-1.5, 5],
      ],
    ],
    raised: (wrist) => capsule(SHOULDER, wrist, ARM, [true, false]),
    lowered: capsule([-SHOULDER[0], SHOULDER[1]], [-2.3, 5.5], ARM),
    hand,
    handAt: [1.9, -1.9],
    handH: 1.6,
    hair: { back: { line: 1 / 3, dip: 0 }, front: { line: -1 / 3, dip: 0 } },
    face: { eye: [0.36, 0.08, 0.11], mouth: [0.5, 0.22], smile: 0 },
  },
  // A big head (over a third of the height), a short bell of a body, stubby
  // legs, chunky arms (the raised one curving up and tapering into the
  // wrist), mittens. The raised hand sits a little further out than the
  // classic one, so a ring around it clears the bigger head.
  chibi: {
    head: 1.3,
    body: [
      roundCorners(
        [
          [-1.05, 1.0],
          [1.05, 1.0],
          [1.45, 3.9],
          [-1.45, 3.9],
        ],
        [0.45, 0.45, 0.5, 0.5],
      ),
      capsule([-0.55, 3.6], [-0.55, 5.35], 0.46),
      capsule([0.55, 3.6], [0.55, 5.35], 0.46),
    ],
    raised: (wrist) => tube(quad([1.0, 1.8], [2.45, 1.15], wrist, 12), 0.34, [true, false], 0.21),
    lowered: tube(quad([-1.05, 1.75], [-1.6, 2.2], [-1.75, 3.05], 12), 0.34),
    hand: mitten,
    handAt: [2.1, -2.0],
    handH: 1.45,
    hair: { back: { line: 0.15, dip: 0.25 }, front: { line: -0.3, dip: 0.2 } },
    face: { eye: [0.38, 0.14, 0.14], mouth: [0.52, 0.2], smile: 0.09 },
  },
};

const lookOf = (p: Props) => LOOKS[p.look ?? "classic"];

// The head above a hairline that runs `dip` lower in the middle (head radii).
const hairShape = (c: Pt, R: number, line: number, dip: number): Pt[] => {
  const hy = (x: number) => line + dip * (1 - x * x);
  const above = (deg: number) => -Math.sin((deg * Math.PI) / 180) <= hy(Math.cos((deg * Math.PI) / 180));
  // The two degrees where the head's outline crosses the hairline, found from
  // the top (above) toward the bottom (below).
  const edge = (inside: number, outside: number) => {
    for (let i = 0; i < 40; i++) {
      const mid = (inside + outside) / 2;
      if (above(mid)) inside = mid;
      else outside = mid;
    }
    return inside;
  };
  const [right, left] = [edge(90, -90), edge(90, 270)];
  const [xr, xl] = [Math.cos((right * Math.PI) / 180), Math.cos((left * Math.PI) / 180)];
  const curve = Array.from({ length: 11 }, (_, i): Pt => {
    const x = xl + ((xr - xl) * (i + 1)) / 12;
    return [c[0] + x * R, c[1] + hy(x) * R];
  });
  return [...arcPoints(c, R, right, left), ...curve];
};

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
  const nextView: View = view === "back" ? "front" : "back";
  const look = lookOf(p);
  const arm = side * cos;
  return {
    at,
    r,
    arm,
    body: Math.hypot(cos, figure.profile * sin),
    hairline: lerp(look.hair[view].line, look.hair[nextView].line, turning),
    hairDip: lerp(look.hair[view].dip, look.hair[nextView].dip, turning),
    view: flip(view, "back", "front") as View,
    face: flip(face, "back", "palm") as Face,
    features: Math.abs(cos),
    shown: appear * out * opacity,
    pulse,
    hand: { center: [at[0] + look.handAt[0] * r * arm, at[1] + look.handAt[1] * r], height: look.handH * r },
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
  const look = lookOf(p);
  const armPt = px(s.arm);
  const wrist: Pt = [look.handAt[0] + look.handH * look.hand.wrist[0], look.handAt[1] + look.handH * look.hand.wrist[1]];
  const R = look.head * s.r;
  const head = arcPoints(s.at, R, 0, 360).slice(0, -1);
  const pieces = [head, ...look.body.map((b) => b.map(px(s.body))), look.raised(wrist).map(armPt), look.lowered.map(armPt)]
    .map((pts) => clipAbove(pts, cut))
    .filter((pts) => pts.length > 2);
  const outlineWidth = (i: number) => stroke.line * (i === 0 ? 1 + s.pulse.head : 1);
  const mask = `person-${el.spec.id}`;
  const clip = p.inside ? { id: `person-in-${el.spec.id}`, glass: mirrorOf(scene, p.inside).glass } : null;
  const bodyFill = ghost ? color.muted : mix(color.bg, color.muted, figure.body);
  const hairFill = ghost ? color.muted : mix(color.bg, color.muted, figure.hair);

  // The hair: the head above its hairline.
  const hair = hairShape(s.at, R, s.hairline, s.hairDip);
  const f = look.face;
  const fx = (x: number) => s.at[0] + x * R * s.features;
  const fy = (y: number) => s.at[1] + y * R;
  const eyes = [-f.eye[0], f.eye[0]].map((x) => arcPoints([fx(x), fy(f.eye[1])], f.eye[2] * R, 0, 360));
  const mouth = quad([fx(-f.mouth[1]), fy(f.mouth[0])], [fx(0), fy(f.mouth[0] + 2 * f.smile)], [fx(f.mouth[1]), fy(f.mouth[0])]);

  // The raised hand, thumb toward the body's midline (hand's -x → body's -x).
  const handColor = themeColor(s.face === "back" ? p.backColor : p.palmColor);
  const handPt = ([x, y]: Pt): Pt => [s.hand.center[0] + s.hand.height * x * s.arm, s.hand.center[1] + s.hand.height * y];
  const handPts = clipAbove(look.hand.outline.map(handPt), cut);
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
          {clip ? (
            <clipPath id={clip.id}>
              <polygon points={pointsAttr(clip.glass)} />
            </clipPath>
          ) : null}
        </defs>
        <g clipPath={clip ? `url(#${clip.id})` : undefined}>
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
              <Polyline pts={mouth} color={color.text} width={stroke.line} cap="round" />
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
                ? look.hand.palmLines.map((line, i) => (
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
        </g>
      </Svg>
    </AbsoluteFill>
  );
};
