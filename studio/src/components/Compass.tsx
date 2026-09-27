import React from "react";
import { AbsoluteFill } from "remotion";
import { ElementTimeline, phase, rawProgress, Scene } from "../storyboard/timeline";
import { color, ease, mark, sky, stroke } from "../style/theme";
import { body, pointerOf } from "./bodies";
import { arcPoints, lerpPt, polar, Pt } from "./geometry";
import { CurvedArrow, lifecycle, Polyline, StraightArrow, Svg } from "./shapes";

// Compares directions against the fixed frame of the stars: copies of the
// pointers of the bodies in `of`, gathered at one point by translation only,
// never turning; a sweep then passes them all in order.
// Spec: storyboard.json → components → Compass.

type Props = { of: string[]; center: Pt; hub?: number };

export const Compass: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  const hub = p.hub ?? sky.hub;
  let sweep = 0;
  const { appear, out } = lifecycle(el, frame, (a) => {
    if (a.action === "sweep") sweep = phase(a, frame);
    else throw new Error(`Compass ${el.spec.id}: unknown action ${a.action}`);
  });
  if (appear <= 0 || out <= 0) return null;

  // The gather is a move, so it eases smooth, not with the entrance's ease.out
  // (which covers most of the way in two frames: a jump, not a slide).
  const gather = el.actions.find((a) => a.action === "appear");
  const slide = gather ? ease.smooth(rawProgress(gather, frame)) : 1;
  const pointers = p.of.map((id) => pointerOf(body(scene, id)));
  const copies = pointers.map((ptr) => ({
    ...ptr,
    base: lerpPt(ptr.base, polar(p.center, hub + sky.pointerGap, ptr.deg), slide),
  }));
  const reach = hub + sky.pointerGap + Math.max(...pointers.map((ptr) => ptr.length)) + sky.sweepGap;
  const start = pointers[0].deg;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Svg>
        <Polyline pts={arcPoints(p.center, hub, 0, 360)} color={color.muted} width={stroke.thin} opacity={appear} closed />
        {copies.map((c, i) => (
          <StraightArrow key={i} tail={c.base} deg={c.deg} length={c.length} head={mark.head} color={color.text} width={stroke.arrow} />
        ))}
        {sweep > 0 ? (
          <CurvedArrow
            pts={arcPoints(p.center, reach, start, start + (360 - sky.sweepShort) * sweep)}
            head={mark.head}
            color={color.purple}
            width={stroke.arrow}
          />
        ) : null}
      </Svg>
    </AbsoluteFill>
  );
};
