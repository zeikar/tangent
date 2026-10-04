import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, phase, Scene, themeColor } from "../storyboard/timeline";
import { color, optics, stroke } from "../style/theme";
import { Axis, axisX, Cone, coneAt, Light } from "./light";
import { Svg } from "./shapes";

// Light of one or more single wavelengths on the cone curves' graph: per
// light a vertical line at its wavelength and a dot where it crosses each
// curve. Its live lights are its state, which ConeBars (follow) and
// ColorChip (of) read every frame. Spec: storyboard.json → components →
// LightLine.

type Props = Axis & {
  y0: number;
  y1: number;
  base: number;
  height: number;
  cones: { cone: Cone; color: string }[];
  lights: Light;
};

export type LightLineState = {
  lights: Light;
  appear: number; // the lines' growth from y1 to y0
  dots: number; // the dots' fade-in
  out: number;
  linePulse: number;
  dotPulse: Partial<Record<Cone, number>>;
};

export const lightLine = (scene: Scene, id: string) => scene.state(id, "LightLine") as LightLineState;

// Each light's nm and power move linearly in the eased progress. A light the
// target adds starts where the last light already on stands, at its target
// power, so the mixture's ratios and color don't jump as a line splits.
const moveLights = (from: Light, to: Light, t: number): Light => {
  if (to.length < from.length) throw new Error("LightLine moveTo: list every light that is on (power 0 turns one off)");
  return to.map(([nm, power], i) => {
    const [nm0, power0] = from[i] ?? [from[from.length - 1][0], power];
    return [lerp(nm0, nm, t), lerp(power0, power, t)];
  });
};

export const lightLineState = (el: ElementTimeline, scene: Scene): LightLineState => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  const s: LightLineState = { lights: p.lights, appear: el.spec.visibleAtStart ? 1 : 0, dots: el.spec.visibleAtStart ? 1 : 0, out: 1, linePulse: 0, dotPulse: {} };
  for (const a of el.actions) {
    if (frame < a.from) break;
    switch (a.action) {
      case "appear":
        s.appear = phase(a, frame);
        s.dots = phase(a, frame, 0.5, 1);
        break;
      case "moveTo": {
        const moved = moveLights(s.lights, a.params.lights, phase(a, frame));
        s.lights = phase(a, frame) >= 1 ? moved.filter(([, power]) => power > 0) : moved;
        break;
      }
      case "pulse": {
        const b = bump(a, frame);
        const cone = a.params.cone as Cone | undefined;
        if (cone) s.dotPulse[cone] = Math.max(s.dotPulse[cone] ?? 0, b);
        else s.linePulse = Math.max(s.linePulse, b);
        break;
      }
      case "exit":
        s.out *= 1 - phase(a, frame);
        break;
      default:
        throw new Error(`LightLine ${el.spec.id}: unknown action ${a.action}`);
    }
  }
  return s;
};

// A filled circle as a path, so the probe sees it.
const dotPath = (x: number, y: number, r: number) => `M${x - r},${y}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;

export const LightLine: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const s = lightLine(scene, el.spec.id);
  if (s.appear <= 0 || s.out <= 0) return null;
  const top = lerp(p.y1, p.y0, s.appear);
  const shown = (power: number) => Math.min(1, power / optics.fullPower);
  // The middle cell's dots last, on top.
  const order = [...p.cones].sort((a, b) => Number(a.cone === "M") - Number(b.cone === "M"));
  return (
    <AbsoluteFill style={{ opacity: s.out }}>
      <Svg>
        {s.lights.map(([nm, power], i) => {
          const x = axisX(p, nm);
          return (
            <line key={`line${i}`} x1={x} y1={p.y1} x2={x} y2={top} stroke={color.text} strokeWidth={stroke.arrow * (1 + s.linePulse)} opacity={shown(power)} />
          );
        })}
        {s.dots > 0
          ? order.flatMap(({ cone, color: c }) =>
              s.lights.map(([nm, power], i) => {
                const value = coneAt(cone, nm);
                if (value < optics.dotMin) return null;
                const r = optics.dot * (1 + (optics.dotPulse - 1) * (s.dotPulse[cone] ?? 0));
                return (
                  <path
                    key={`${cone}${i}`}
                    d={dotPath(axisX(p, nm), p.base - p.height * value, r)}
                    fill={themeColor(c)}
                    opacity={shown(power) * s.dots}
                  />
                );
              }),
            )
          : null}
      </Svg>
    </AbsoluteFill>
  );
};
