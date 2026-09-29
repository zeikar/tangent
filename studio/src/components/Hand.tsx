import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, phase, Scene, themeColor } from "../storyboard/timeline";
import { color, figure, stroke } from "../style/theme";
import { hand, ring } from "./figure";
import { lerpPt, Pt, pointsAttr } from "./geometry";
import { person } from "./Person";
import { Polyline, Svg } from "./shapes";

// A Person's raised hand drawn large on its own: the same open-hand outline
// with a short wrist, showing its back or its palm. Two hands with their
// thumbs on the same side have the same outline whatever their face.
// Appearing `from` a Person, it grows out of that person's raised hand.
// Spec: storyboard.json → components → Hand.

type Props = {
  at: Pt;
  height: number;
  thumb: "screenLeft" | "screenRight";
  face: "back" | "palm";
  backColor: string;
  palmColor: string;
};

export const Hand: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  let opacity = el.spec.visibleAtStart ? 1 : 0;
  let grow: { from: string; e: number } | null = null;
  const pulse = { thumb: 0, all: 0 };
  for (const a of el.actions) {
    if (frame < a.from) break;
    switch (a.action) {
      case "appear":
        // Grown out of a person's hand, it is there from the start and only
        // fades in over the first part of the move.
        if (a.params.from) {
          grow = { from: a.params.from, e: phase(a, frame) };
          opacity = phase(a, frame, 0, 0.3);
        } else opacity = phase(a, frame);
        break;
      case "exit":
        opacity *= 1 - phase(a, frame);
        break;
      case "pulse": {
        const part = a.params.part as keyof typeof pulse;
        if (!(part in pulse)) throw new Error(`Hand ${el.spec.id}: pulse part ${a.params.part}`);
        pulse[part] = Math.max(pulse[part], bump(a, frame));
        break;
      }
      default:
        throw new Error(`Hand ${el.spec.id}: unknown action ${a.action}`);
    }
  }
  if (opacity <= 0) return null;
  let at = p.at;
  let height = p.height;
  if (grow && grow.e < 1) {
    const from = person(scene, grow.from).hand;
    at = lerpPt(from.center, p.at, grow.e);
    height = lerp(from.height, p.height, grow.e);
  }
  const sx = p.thumb === "screenLeft" ? 1 : -1;
  const pt = ([x, y]: Pt): Pt => [at[0] + height * x * sx, at[1] + height * y];
  const outline = hand.outline.map(pt);
  const thumb = outline.slice(hand.thumb[0], hand.thumb[1] + 1);
  const c = themeColor(p.face === "back" ? p.backColor : p.palmColor);
  // A pulsed part's fill rises from figure.hand toward figure.pulse.
  const boost = (b: number) => ((figure.pulse - figure.hand) * b) / (1 - figure.hand);
  return (
    <AbsoluteFill style={{ opacity }}>
      <Svg>
        <polygon points={pointsAttr(outline)} fill={c} fillOpacity={figure.hand} />
        {pulse.all > 0 ? <polygon points={pointsAttr(outline)} fill={c} fillOpacity={boost(pulse.all)} /> : null}
        {pulse.thumb > 0 ? <polygon points={pointsAttr(thumb)} fill={c} fillOpacity={boost(pulse.thumb)} /> : null}
        {p.face === "palm"
          ? hand.palmLines.map((line, i) => (
              <Polyline key={i} pts={line.map(pt)} color={color.text} width={stroke.line} opacity={figure.palmLines} cap="round" />
            ))
          : null}
        <Polyline pts={ring(outline)} closed color={c} width={stroke.hand * (1 + pulse.all)} />
        {pulse.thumb > 0 ? <Polyline pts={thumb} color={c} width={stroke.hand * (1 + pulse.thumb)} cap="round" /> : null}
      </Svg>
    </AbsoluteFill>
  );
};
