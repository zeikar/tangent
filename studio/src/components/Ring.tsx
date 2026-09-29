import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, Scene, themeColor } from "../storyboard/timeline";
import { stroke } from "../style/theme";
import { arcPoints, Pt } from "./geometry";
import { person } from "./Person";
import { lifecycle, Polyline, Svg } from "./shapes";

// A circle outline that marks something: around a fixed point, or around a
// Person's live raised hand (`of`). It draws on clockwise from 12 o'clock.
// Spec: storyboard.json → components → Ring.

type Props = { of?: string; at?: Pt; r: number; color: string };

export const Ring: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  let pulse = 0;
  const { appear, out } = lifecycle(el, scene.frame, (a) => {
    if (a.action === "pulse") pulse = Math.max(pulse, bump(a, scene.frame));
    else throw new Error(`Ring ${el.spec.id}: unknown action ${a.action}`);
  });
  if (appear <= 0 || out <= 0) return null;
  const center = p.of ? person(scene, p.of).hand.center : p.at;
  if (!center) throw new Error(`Ring ${el.spec.id}: needs of or at`);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Svg>
        <Polyline
          pts={arcPoints(center, p.r, 90, 90 - 360 * appear)}
          closed={appear >= 1}
          color={themeColor(p.color)}
          width={stroke.arrow * (1 + pulse)}
        />
      </Svg>
    </AbsoluteFill>
  );
};
