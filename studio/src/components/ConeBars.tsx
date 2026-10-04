import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, phase, Scene, themeColor } from "../storyboard/timeline";
import { color, mark, optics, stroke } from "../style/theme";
import { Pt, trimPolyline } from "./geometry";
import { InkLine, useInk } from "./InkText";
import { Cone, coneRatios, Light } from "./light";
import { lightLine } from "./LightLine";
import { Polyline, Svg } from "./shapes";

// Three bars, one per cone, showing a light's responses as ratios: each over
// the largest, so the tallest always stands at full height. A light is set
// (setLights) or followed live from a LightLine (follow); markTarget keeps the
// bars' current shape as dashed outlines to compare against. A bar's label
// comes in with its track, or later on its own (appear with label: false,
// then label). Spec:
// storyboard.json → components → ConeBars.

type Props = {
  centers: [number, number, number];
  floor: number;
  width: number;
  height: number;
  cones: { cone: Cone; color: string; label: string }[];
};
type Vec3 = [number, number, number];

const lerp3 = (a: Vec3, b: Vec3, t: number) => a.map((x, i) => lerp(x, b[i], t)) as Vec3;

// The bars' ratios at `frame`, from the first `upTo` actions. A move starts
// from where the bars stood when it began.
const valuesAt = (el: ElementTimeline, sceneAt: (f: number) => Scene, frame: number, upTo = el.actions.length): Vec3 => {
  let v: Vec3 = [0, 0, 0];
  for (let k = 0; k < upTo; k++) {
    const a = el.actions[k];
    if (frame < a.from) break;
    if (a.action !== "setLights" && a.action !== "follow") continue;
    const from = valuesAt(el, sceneAt, a.from, k);
    const light: Light = a.action === "setLights" ? a.params.lights : lightLine(sceneAt(frame), a.params.of).lights;
    v = lerp3(from, coneRatios(light), phase(a, frame));
  }
  return v;
};

export const ConeBars: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  const sceneAt = (f: number) => (f === frame ? scene : scene.at(f));
  const n = p.cones.length;
  const shown = Array<number>(n).fill(el.spec.visibleAtStart ? 1 : 0);
  const named = Array<number>(n).fill(el.spec.visibleAtStart ? 1 : 0);
  const pulse = Array<number>(n).fill(0);
  const mismatch = Array<number>(n).fill(0);
  let floorDrawn = el.spec.visibleAtStart ? 1 : 0;
  let target: { values: Vec3; drawn: number } | null = null;
  let targetPulse = 0;
  let out = 1;
  const index = (a: { params: { cone?: Cone } }) => {
    const i = p.cones.findIndex((c) => c.cone === a.params.cone);
    if (i < 0) throw new Error(`ConeBars ${el.spec.id}: no cone ${a.params.cone}`);
    return i;
  };
  el.actions.forEach((a, k) => {
    if (frame < a.from) return;
    const t = phase(a, frame);
    switch (a.action) {
      case "appear":
        if (shown.every((s) => s === 0)) floorDrawn = t;
        shown[index(a)] = t;
        // With label: false the label waits for its own label action.
        if (a.params.label !== false) named[index(a)] = t;
        break;
      case "label":
        named[index(a)] = t;
        break;
      case "markTarget":
        target = { values: valuesAt(el, sceneAt, a.from, k), drawn: t };
        break;
      case "pulse":
        pulse[index(a)] = Math.max(pulse[index(a)], bump(a, frame));
        break;
      case "pulseTarget":
        targetPulse = Math.max(targetPulse, bump(a, frame));
        break;
      case "mismatch":
        mismatch[index(a)] = a.params.show ? t : (1 - t) * mismatch[index(a)];
        break;
      case "exit":
        out *= 1 - t;
        break;
      case "setLights":
      case "follow":
        break;
      default:
        throw new Error(`ConeBars ${el.spec.id}: unknown action ${a.action}`);
    }
  });
  const { ink, measuring } = useInk(`bars ${el.spec.id}`, out > 0 ? p.cones.map((c) => c.label) : []);
  if (out <= 0) return null;
  if (measuring.length) return <AbsoluteFill>{measuring}</AbsoluteFill>;

  const values = valuesAt(el, sceneAt, frame);
  const marked = target as { values: Vec3; drawn: number } | null;
  const half = p.width / 2;
  const floorLine: Pt[] = [
    [p.centers[0] - half - optics.floorOverhang, p.floor],
    [p.centers[n - 1] + half + optics.floorOverhang, p.floor],
  ];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Svg>
        {p.cones.map(({ cone, color: name }, i) => {
          if (shown[i] <= 0) return null;
          const c = themeColor(name);
          const x = p.centers[i];
          const w = p.width * (1 + (optics.barPulse - 1) * pulse[i]);
          const top = p.floor - p.height * values[i];
          // Above its target a mismatched bar is hatched in its own color
          // (no warning red beside the magenta chips), following its live height.
          const split = marked && mismatch[i] > 0 ? Math.max(top, p.floor - p.height * marked.values[i]) : p.floor;
          const barFill = lerp(optics.bar, 1, pulse[i]);
          const hatch = `${el.spec.id}-hatch-${cone}`;
          const excess = (fillProps: React.SVGProps<SVGRectElement>) => (
            <rect x={x - w / 2} y={top} width={w} height={split - top} {...fillProps} />
          );
          return (
            <g key={cone} opacity={shown[i]}>
              <rect x={x - half} y={p.floor - p.height} width={p.width} height={p.height} fill={c} fillOpacity={optics.track} />
              {values[i] > 0 ? (
                <>
                  <rect x={x - w / 2} y={split} width={w} height={p.floor - split} fill={c} fillOpacity={barFill} />
                  {split > top ? (
                    <>
                      <pattern id={hatch} patternUnits="userSpaceOnUse" width={optics.hatch} height={optics.hatch} patternTransform="rotate(45)">
                        <rect width={optics.hatch / 2} height={optics.hatch} fill={c} fillOpacity={barFill} />
                      </pattern>
                      {excess({ fill: c, fillOpacity: lerp(barFill, optics.hatchGap, mismatch[i]) })}
                      {excess({ fill: `url(#${hatch})`, opacity: mismatch[i] })}
                    </>
                  ) : null}
                </>
              ) : null}
            </g>
          );
        })}
        {floorDrawn > 0 ? <Polyline pts={trimPolyline(floorLine, floorDrawn)} color={color.muted} width={stroke.line} /> : null}
        {marked
          ? p.cones.map(({ cone }, i) => {
              const [x, g] = [p.centers[i], optics.targetGap];
              const top = p.floor - p.height * marked.values[i] - g;
              const outline: Pt[] = [
                [x - half - g, p.floor],
                [x - half - g, top],
                [x + half + g, top],
                [x + half + g, p.floor],
              ];
              return (
                <Polyline
                  key={`target${cone}`}
                  pts={trimPolyline(outline, marked.drawn)}
                  color={color.text}
                  width={stroke.line * (1 + targetPulse)}
                  dash={stroke.dash}
                />
              );
            })
          : null}
      </Svg>
      {p.cones.map(({ cone, label }, i) =>
        Math.min(shown[i], named[i]) > 0 ? (
          <InkLine
            key={`label${cone}`}
            text={label}
            ink={ink(label)}
            x={p.centers[i]}
            y={p.floor + mark.labelGap + (ink(label).b - ink(label).t) / 2}
            color={color.text}
            opacity={Math.min(shown[i], named[i])}
            kind="label"
          />
        ) : null,
      )}
    </AbsoluteFill>
  );
};
