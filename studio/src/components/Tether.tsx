import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, Scene } from "../storyboard/timeline";
import { color, stroke } from "../style/theme";
import { body, outlineRadius } from "./bodies";
import { angleTo, lerpPt, polar, Pt } from "./geometry";
import { lifecycle, Svg } from "./shapes";

// A dashed line on the line through two bodies' live centers, from a's
// outline to b's (stretched outlines included): where it meets b's rim is the
// side of b facing a. Spec: storyboard.json → components → Tether.

type Props = { a: string; b: string };

export type TetherState = { from: Pt; to: Pt };

export const tether = (scene: Scene, id: string) => scene.state(id, "Tether") as TetherState;

export const tetherState = (el: ElementTimeline, scene: Scene): TetherState => {
  const p = el.spec.props as Props;
  const [a, b] = [body(scene, p.a), body(scene, p.b)];
  const deg = angleTo(a.center, b.center);
  return { from: polar(a.center, outlineRadius(a, deg), deg), to: polar(b.center, outlineRadius(b, deg + 180), deg + 180) };
};

export const Tether: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  let pulse = 0;
  const { appear, out } = lifecycle(el, scene.frame, (a) => {
    if (a.action === "pulse") pulse = Math.max(pulse, bump(a, scene.frame));
    else throw new Error(`Tether ${el.spec.id}: unknown action ${a.action}`);
  });
  if (appear <= 0 || out <= 0) return null;
  const { from, to } = tether(scene, el.spec.id);
  // Drawn on from a, the dashes anchored there so they don't crawl.
  const end = lerpPt(from, to, appear);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Svg>
        <line
          x1={from[0]}
          y1={from[1]}
          x2={end[0]}
          y2={end[1]}
          stroke={color.muted}
          strokeWidth={stroke.line * (1 + pulse)}
          strokeDasharray={stroke.dash.join(" ")}
        />
      </Svg>
    </AbsoluteFill>
  );
};
