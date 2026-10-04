import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, phase, Scene, themeColor } from "../storyboard/timeline";
import { optics, stroke, VIDEO } from "../style/theme";
import { Pt } from "./geometry";
import { Axis, axisX, Cone, coneAt } from "./light";
import { Polyline, Svg } from "./shapes";

// The three cone response curves over the wavelength axis, each cone's peak
// at `height` px above `base`, from the tabulated fundamentals (light.ts).
// Spec: storyboard.json → components → ConeCurves.

type Props = Axis & { base: number; height: number; cones: { cone: Cone; color: string }[] };

// The runs of the curve where it is at least optics.curveMin, as [nm, value]
// lists: the table's own rows (it is linear between them) and the points
// where it crosses the threshold, so no line runs along the axis.
const runs = ({ nm: [long, short] }: Axis, cone: Cone) => {
  const rows = [long];
  for (let nm = Math.floor(long / 5) * 5; nm > short; nm -= 5) if (nm < long) rows.push(nm);
  rows.push(short);
  const out: [number, number][][] = [];
  let run: [number, number][] | null = null;
  rows.forEach((nm, i) => {
    const v = coneAt(cone, nm);
    const inside = v >= optics.curveMin;
    if (i > 0) {
      const [prev, pv] = [rows[i - 1], coneAt(cone, rows[i - 1])];
      if (inside !== pv >= optics.curveMin) {
        const cross = prev + ((optics.curveMin - pv) / (v - pv)) * (nm - prev);
        if (inside) run = [[cross, optics.curveMin]];
        else run?.push([cross, optics.curveMin]);
      }
    } else if (inside) run = [];
    if (inside) run!.push([nm, v]);
    else if (run) {
      out.push(run);
      run = null;
    }
  });
  if (run) out.push(run);
  return out;
};

export const ConeCurves: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  const rise: Partial<Record<Cone, number>> = {};
  const pulse: Partial<Record<Cone, number>> = {};
  let out = 1;
  for (const a of el.actions) {
    if (frame < a.from) break;
    const cone = a.params.cone as Cone;
    if (a.action === "appear") rise[cone] = phase(a, frame);
    else if (a.action === "pulse") pulse[cone] = Math.max(pulse[cone] ?? 0, bump(a, frame));
    else if (a.action === "exit") out *= 1 - phase(a, frame);
    else throw new Error(`ConeCurves ${el.spec.id}: unknown action ${a.action}`);
  }
  if (out <= 0) return null;
  // A curve ending steeply at the axis's end would put its stroke's corner
  // past it: cut there, square.
  const clip = `curves-${el.spec.id}`;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Svg>
        <clipPath id={clip}>
          <rect x={Math.min(p.x0, p.x1)} y={0} width={Math.abs(p.x1 - p.x0)} height={VIDEO.height} />
        </clipPath>
        <g clipPath={`url(#${clip})`}>
          {p.cones.map(({ cone, color }) => {
            const k = el.spec.visibleAtStart ? 1 : (rise[cone] ?? 0);
            if (k <= 0) return null;
            return runs(p, cone).map((run, i) => (
              <Polyline
                key={`${cone}${i}`}
                pts={run.map(([nm, v]): Pt => [axisX(p, nm), p.base - p.height * v * k])}
                color={themeColor(color)}
                width={stroke.arrow * (1 + (pulse[cone] ?? 0))}
              />
            ));
          })}
        </g>
      </Svg>
    </AbsoluteFill>
  );
};
