import React from "react";
import { AbsoluteFill } from "remotion";
import { ElementTimeline, lerp, phase, rawProgress, Scene } from "../storyboard/timeline";
import { color, ease, mark, sky, stroke } from "../style/theme";
import { body, pointerOf } from "./bodies";
import { arcPoints, lerpPt, polar, Pt } from "./geometry";
import { CurvedArrow, lifecycle, Polyline, StraightArrow, Svg } from "./shapes";

// Compares directions against the fixed frame of the stars: copies of the
// pointers of the bodies in `of`, gathered at one point by translation only,
// never turning, one after another, growing to `length` if given; a sweep
// then passes them all in order.
// Spec: storyboard.json → components → Compass.

type Props = { of: string[]; center: Pt; hub?: number; length?: number };

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

  // The gather is a move, so each slide eases smooth, not with the
  // entrance's ease.out (which covers most of the way in two frames: a jump,
  // not a slide). The slides are staggered in list order, so paths that
  // cross don't all meet at once.
  const gather = el.actions.find((a) => a.action === "appear");
  const pointers = p.of.map((id) => pointerOf(body(scene, id)));
  const span = 1 - sky.gatherStagger * (pointers.length - 1);
  const copies = pointers.map((ptr, i) => {
    const slide = gather ? ease.smooth(Math.min(Math.max((rawProgress(gather, frame) - i * sky.gatherStagger) / span, 0), 1)) : 1;
    return {
      ...ptr,
      base: lerpPt(ptr.base, polar(p.center, hub + sky.pointerGap, ptr.deg), slide),
      length: lerp(ptr.length, p.length ?? ptr.length, slide),
    };
  });
  const reach = hub + sky.pointerGap + Math.max(...pointers.map((ptr) => p.length ?? ptr.length)) + sky.sweepGap;
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
