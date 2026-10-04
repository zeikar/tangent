import React from "react";
import { AbsoluteFill } from "remotion";
import { Action, bump, ElementTimeline, lerp, phase, Scene } from "../storyboard/timeline";
import { color, mark, optics, stroke } from "../style/theme";
import { lerpPt, Pt, roundedRectPoints, trimPolyline } from "./geometry";
import { Light, screenColor } from "./light";
import { lightLine } from "./LightLine";
import { Polyline, Svg } from "./shapes";

// A color swatch: a rounded rectangle filled with the screen color of a
// light, fixed (`light`) or a LightLine's live lights (`of`), with no outline.
// An outline action adds a dashed frame around it, kept: "this is the target".
// Spec: storyboard.json → components → ColorChip.

type Props = { center: Pt; w: number; h: number; light?: Light; of?: string };
type Box = { center: Pt; w: number; h: number };

const lerpBox = (a: Box, b: Box, t: number): Box => ({ center: lerpPt(a.center, b.center, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

// An appear with `from` grows the chip out of a point, opaque throughout: a
// fromSize square there moves to its center and scales to its size. By
// default both take the whole span; with `path` ([x, y, from, to] legs, in
// shares of the span) the square first travels those legs at its seed size,
// and with `grow` ([from, to]) it scales, and makes for its center from
// wherever the path left it, only in that window.
const seed = (a: Action, frame: number, box: Box): Box => {
  const [g0, g1] = (a.params.grow as [number, number] | undefined) ?? [0, 1];
  let at: Pt = a.params.from;
  for (const [x, y, p0, p1] of (a.params.path as [number, number, number, number][] | undefined) ?? []) at = lerpPt(at, [x, y], phase(a, frame, p0, p1));
  return lerpBox({ center: at, w: a.params.fromSize, h: a.params.fromSize }, box, phase(a, frame, g0, g1));
};

export const ColorChip: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  let box: Box = { center: p.center, w: p.w, h: p.h };
  let opacity = el.spec.visibleAtStart ? 1 : 0;
  let pulse = 0;
  let outline = 0;
  for (const a of el.actions) {
    if (frame < a.from) break;
    const t = phase(a, frame);
    switch (a.action) {
      case "appear":
        if (a.params.from) {
          opacity = 1;
          box = seed(a, frame, box);
        } else opacity = t;
        break;
      case "moveTo":
        box = lerpBox(box, { center: a.params.center, w: a.params.w, h: a.params.h }, t);
        break;
      case "pulse":
        pulse = Math.max(pulse, bump(a, frame));
        break;
      case "outline":
        outline = t;
        break;
      case "exit":
        opacity *= 1 - t;
        break;
      default:
        throw new Error(`ColorChip ${el.spec.id}: unknown action ${a.action}`);
    }
  }
  if (opacity <= 0) return null;
  const light = p.of ? lightLine(scene, p.of).lights : p.light;
  if (!light) throw new Error(`ColorChip ${el.spec.id}: needs light or of`);
  const s = 1 + (optics.chipPulse - 1) * pulse;
  const [cx, cy] = box.center;
  const [w, h] = [box.w * s, box.h * s];
  // The frame sits off the chip at rest, so a pulse doesn't shake it.
  const pad = mark.boxPadding;
  const frameBox: [number, number, number, number] = [cx - box.w / 2 - pad, cy - box.h / 2 - pad, cx + box.w / 2 + pad, cy + box.h / 2 + pad];
  return (
    <AbsoluteFill style={{ opacity }}>
      <Svg>
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={mark.boxRadius} fill={screenColor(light)} />
        {outline > 0 ? (
          <Polyline
            pts={trimPolyline(roundedRectPoints(frameBox, mark.boxRadius + pad), outline)}
            color={color.text}
            width={stroke.line}
            dash={stroke.dash}
          />
        ) : null}
      </Svg>
    </AbsoluteFill>
  );
};
