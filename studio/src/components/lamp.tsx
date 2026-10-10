import React from "react";
import { mix } from "../storyboard/timeline";
import { color, counter, stroke } from "../style/theme";
import { arcPoints, polar, Pt, pointsAttr } from "./geometry";
import { Polyline } from "./shapes";

// A lamp (BaseCounter, Funnel, ScanBar): a round bulb, dark (a muted ring over
// the background) or lit (filled yellow, with short yellow rays round it),
// `lit` blending the two. `scale` grows bulb and rays about the center; the
// strokes keep their width. Drawn inside an Svg.

// How far its ink reaches from the center, at rest.
export const lampReach = (r: number) => r * counter.rays[1];

export const Lamp: React.FC<{ at: Pt; r: number; lit: number; scale?: number; opacity?: number }> = ({
  at,
  r,
  lit,
  scale = 1,
  opacity = 1,
}) => {
  if (opacity <= 0) return null;
  const R = r * scale;
  const ring = arcPoints(at, R, 90, 450);
  const rays = Array.from({ length: counter.rayCount }, (_, k) => counter.rayTurn + (360 * k) / counter.rayCount);
  return (
    <g opacity={opacity}>
      <polygon points={pointsAttr(ring)} fill={mix(color.bg, color.yellow, lit)} />
      <Polyline pts={ring} color={mix(color.muted, color.yellow, lit)} width={stroke.line} closed />
      {lit > 0
        ? rays.map((deg) => (
            <Polyline
              key={deg}
              pts={[polar(at, R * counter.rays[0], deg), polar(at, R * counter.rays[1], deg)]}
              color={color.yellow}
              width={counter.rayWidth}
              opacity={lit}
            />
          ))
        : null}
    </g>
  );
};
