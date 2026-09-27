import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, Scene } from "../storyboard/timeline";
import { color, mark, sky, stroke } from "../style/theme";
import { body, semiAxes } from "./bodies";
import { arcPoints } from "./geometry";
import { CurvedArrow, lifecycle, Svg } from "./shapes";

// A body's spin: a curved arrow around it, centered on its far pole and
// pointing counterclockwise. It turns exactly with the body's heading, so its
// speed is the spin; it doesn't stretch or tilt with the outline.
// Spec: storyboard.json → components → SpinArrow.

type Props = { of: string; gap?: number; span?: number };

export const SpinArrow: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  let pulse = 0;
  const { appear, out } = lifecycle(el, scene.frame, (a) => {
    if (a.action === "pulse") pulse = Math.max(pulse, bump(a, scene.frame));
    else throw new Error(`SpinArrow ${el.spec.id}: unknown action ${a.action}`);
  });
  if (appear <= 0 || out <= 0) return null;
  const s = body(scene, p.of);
  const far = s.heading + 180;
  const half = (p.span ?? sky.spinSpan) / 2;
  return (
    <AbsoluteFill style={{ opacity: appear * out }}>
      <Svg>
        <CurvedArrow
          pts={arcPoints(s.center, semiAxes(s)[0] + (p.gap ?? sky.spinGap), far - half, far + half)}
          head={mark.head}
          color={color.purple}
          width={stroke.arrow * (1 + pulse)}
        />
      </Svg>
    </AbsoluteFill>
  );
};
