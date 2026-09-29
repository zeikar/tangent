import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, phase, Scene, themeColor } from "../storyboard/timeline";
import { mark, stroke } from "../style/theme";
import { angleTo, dist, headPoints, polar, Pt, pointsAttr } from "./geometry";
import { lifecycle, StraightArrow, Svg } from "./shapes";

// A straight direction arrow between two fixed points, its tip at `to`. With
// a taper its shaft and head scale along it, from taper[0] at the tail to
// taper[1] at the head, so an arrow going into the picture narrows and one
// coming out widens. It grows from its tail, each point keeping the width it
// has in the whole arrow. Spec: storyboard.json → components → DirArrow.

type Props = { from: Pt; to: Pt; color: string; taper?: [number, number] };

const PULSE = 0.6; // a pulse widens shaft and head by this share at its peak

export const DirArrow: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  let pulse = 0;
  let opacity = 1;
  const { appear, out } = lifecycle(el, scene.frame, (a) => {
    if (a.action === "pulse") pulse = Math.max(pulse, bump(a, scene.frame));
    else if (a.action === "setStyle") opacity = lerp(opacity, a.params.opacity, phase(a, scene.frame));
    else throw new Error(`DirArrow ${el.spec.id}: unknown action ${a.action}`);
  });
  if (appear <= 0 || out <= 0 || opacity <= 0) return null;
  const [t0, t1] = p.taper ?? [1, 1];
  const c = themeColor(p.color);
  const deg = angleTo(p.from, p.to);
  const full = dist(p.from, p.to);
  const length = full * appear;
  const k = 1 + PULSE * pulse;
  // Scale at a distance d from the tail.
  const scale = (d: number) => lerp(t0, t1, d / full) * k;
  let drawn: React.ReactNode;
  if (t0 === t1) {
    drawn = <StraightArrow tail={p.from} deg={deg} length={length} head={mark.head * t0 * k} color={c} width={stroke.arrow * t0 * k} />;
  } else {
    // As StraightArrow: the head keeps its size until the arrow is shorter
    // than twice it.
    const head = Math.min(mark.head * scale(length), length / 2);
    const neck = length - head;
    const side = (d: number, s: 1 | -1) => polar(polar(p.from, d, deg), (stroke.arrow * scale(d)) / 2, deg + 90 * s);
    const shaft: Pt[] = [side(0, 1), side(neck, 1), side(neck, -1), side(0, -1)];
    drawn = (
      <g>
        <polygon points={pointsAttr(shaft)} fill={c} />
        <polygon points={pointsAttr(headPoints(polar(p.from, length, deg), deg, head))} fill={c} />
      </g>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: out * opacity }}>
      <Svg>{drawn}</Svg>
    </AbsoluteFill>
  );
};
