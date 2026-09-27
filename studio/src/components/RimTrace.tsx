import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, Scene } from "../storyboard/timeline";
import { color, sky, stroke } from "../style/theme";
import { body, BodyState, outlineRadius } from "./bodies";
import { angleTo, arcPoints, wrap180 } from "./geometry";
import { lifecycle, Polyline, Svg } from "./shapes";

// Which sides of a body have faced another: an arc just outside `of`'s
// outline over every direction of of's own frame (turning with its heading)
// that has pointed at `toward` since the trace began, closing into a ring
// once every side has. Spec: storyboard.json → components → RimTrace.

type Props = { of: string; toward: string };

// Direction to `toward` in of's own frame (0 = its heading).
const facing = (of: BodyState, toward: BodyState) => angleTo(of.center, toward.center) - of.heading;

export const RimTrace: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  let pulse = 0;
  let began: number | null = el.spec.visibleAtStart ? el.start : null;
  const { appear, out } = lifecycle(el, frame, (a) => {
    if (a.action === "pulse") pulse = Math.max(pulse, bump(a, frame));
    else throw new Error(`RimTrace ${el.spec.id}: unknown action ${a.action}`);
  });
  const appearCue = el.actions.find((a) => a.action === "appear");
  if (appearCue) began = appearCue.from;
  if (began === null || frame < began || out <= 0 || appear <= 0) return null;

  // The swept range, unwrapped frame by frame.
  let prev = facing(body(scene.at(began), p.of), body(scene.at(began), p.toward));
  let [lo, hi] = [prev, prev];
  for (let f = began + 1; f <= frame; f++) {
    const at = f === frame ? scene : scene.at(f);
    prev += wrap180(facing(body(at, p.of), body(at, p.toward)) - prev);
    lo = Math.min(lo, prev);
    hi = Math.max(hi, prev);
  }
  if (hi <= lo) return null;
  const s = body(scene, p.of);
  const ring = hi - lo >= 360;
  const [from, to] = ring ? [0, 360] : [lo + s.heading, hi + s.heading];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Svg>
        <Polyline
          pts={arcPoints(s.center, (deg) => outlineRadius(s, deg) + sky.traceGap, from, to)}
          color={color.text}
          width={stroke.arrow * (1 + pulse)}
          cap="round"
          closed={ring}
        />
      </Svg>
    </AbsoluteFill>
  );
};
