import React from "react";
import { AbsoluteFill } from "remotion";
import { ElementTimeline, lerp, phase, Scene } from "../storyboard/timeline";
import { color, sky, stroke } from "../style/theme";
import { body, BodyState, insideBody } from "./bodies";
import { arcPoints, polar } from "./geometry";
import { lifecycle, Polyline, Svg } from "./shapes";

// The circle a body orbits on, around the live center of `around`. It is left
// out inside every body shown on an orbit around the same body (ghosts
// included), so it never crosses a moon or what is written on it.
// Spec: storyboard.json → components → OrbitPath.

type Props = { around: string; radius: number };

// The arcs of the circle outside every rider, as [from, to] degrees (to > from,
// unwrapped past 360), from samples a few px apart with their ends refined.
const outsideArcs = (inside: (deg: number) => boolean, samples: number): [number, number][] => {
  const step = 360 / samples;
  const out = Array.from({ length: samples }, (_, i) => !inside(i * step));
  if (out.every(Boolean)) return [[0, 360]];
  // Between an inside and an outside angle, the outside end of the crossing.
  const edge = (inDeg: number, outDeg: number) => {
    for (let k = 0; k < 30; k++) {
      const mid = (inDeg + outDeg) / 2;
      if (inside(mid)) inDeg = mid;
      else outDeg = mid;
    }
    return outDeg;
  };
  // Walked once around from an inside sample, so no run wraps.
  const start = out.indexOf(false);
  const arcs: [number, number][] = [];
  let run: number | null = null;
  for (let i = start + 1; i <= start + samples; i++) {
    if (out[i % samples]) run ??= i;
    else if (run !== null) {
      arcs.push([edge((run - 1) * step, run * step), edge(i * step, (i - 1) * step)]);
      run = null;
    }
  }
  return arcs;
};

export const OrbitPath: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  let radius = p.radius;
  let opacity = 1;
  const { appear, out } = lifecycle(el, frame, (a) => {
    const e = phase(a, frame);
    if (a.action === "moveTo") radius = lerp(radius, a.params.radius, e);
    else if (a.action === "setStyle") opacity = lerp(opacity, a.params.opacity, e);
    else throw new Error(`OrbitPath ${el.spec.id}: unknown action ${a.action}`);
  });
  const shown = appear * out * opacity;
  if (shown <= 0) return null;

  const center = body(scene, p.around).center;
  const riders: BodyState[] = scene.elements
    .filter((e) => e.spec.component === "Body" && e.spec.props.orbit?.around === p.around && frame >= e.start && frame < e.end)
    .map((e) => body(scene, e.spec.id))
    .filter((s) => s.appear * s.out > 0);
  const inside = (deg: number) => riders.some((s) => insideBody(s, polar(center, radius, deg)));
  const samples = Math.ceil((2 * Math.PI * radius) / 4);
  return (
    <AbsoluteFill>
      <Svg>
        {outsideArcs(inside, samples).map(([from, to]) => (
          <Polyline
            key={from}
            pts={arcPoints(center, radius, from, to)}
            color={color.muted}
            width={stroke.thin}
            opacity={sky.orbitOpacity * shown}
            closed={to - from >= 360}
          />
        ))}
      </Svg>
    </AbsoluteFill>
  );
};
