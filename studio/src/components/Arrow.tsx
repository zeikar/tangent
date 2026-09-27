import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, Scene, themeColor } from "../storyboard/timeline";
import { mark, stroke } from "../style/theme";
import { body, pointOn } from "./bodies";
import { angleTo, lerpPt } from "./geometry";
import { lifecycle, StraightArrow, Svg } from "./shapes";
import { tether } from "./Tether";

// A straight force arrow between live points: from a point on a body toward
// a point on a tether (t = 0 at its a end, 1 at its b end). With scaleByTilt
// its length follows the body's tilt, shrinking away as the tilt closes.
// Spec: storyboard.json → components → Arrow.

type Props = {
  from: { of: string; at: "nearTip" | "farTip" | "center" };
  aim: { of: string; t: number };
  length: number;
  color: string;
  scaleByTilt?: { of: string; deg: number };
};

export const Arrow: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  let pulse = 0;
  const { appear, out } = lifecycle(el, scene.frame, (a) => {
    if (a.action === "pulse") pulse = Math.max(pulse, bump(a, scene.frame));
    else throw new Error(`Arrow ${el.spec.id}: unknown action ${a.action}`);
  });
  if (appear <= 0 || out <= 0) return null;
  const tail = pointOn(body(scene, p.from.of), p.from.at);
  const line = tether(scene, p.aim.of);
  const aim = lerpPt(line.from, line.to, p.aim.t);
  const scale = p.scaleByTilt ? body(scene, p.scaleByTilt.of).tilt / p.scaleByTilt.deg : 1;
  const c = themeColor(p.color);
  // Grows from its tail.
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Svg>
        <StraightArrow
          tail={tail}
          deg={angleTo(tail, aim)}
          length={p.length * scale * appear}
          head={mark.forceHead}
          color={c}
          width={stroke.force * (1 + pulse)}
        />
      </Svg>
    </AbsoluteFill>
  );
};
