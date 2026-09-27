import React from "react";
import { AbsoluteFill } from "remotion";
import { ElementTimeline, lerp, Scene, themeColor } from "../storyboard/timeline";
import { color, fill, mark, sky, stroke } from "../style/theme";
import { body, BodyProps, BodyState, outlineRadius, Part, pointerOf } from "./bodies";
import { angleTo, arcPoints, dist, polar, Pt, pointsAttr } from "./geometry";
import { InkLine, useInk } from "./InkText";
import { Rel } from "./measure";
import { Polyline, StraightArrow, Svg } from "./shapes";

// A round body drawn in code (a planet, a moon, a ghost of one), never lit.
// It sits at a center or on an orbit around another body, one-color or in
// two halves (near and far, split across its heading), and can turn with its
// orbit, spin against it, and stretch along the line to what it orbits.
// Spec: storyboard.json → components → Body.

// Where a tag goes inside its half: its ink box (at its pulse's scale) as far
// from the chord as from the rim's inner edge (about 9 px each for 앞면 at
// rest in r 85; the storyboard asks for 6).
const tagCenter = (s: BodyState, side: "near" | "far", ink: Rel, scale: number): Pt => {
  const dir = side === "near" ? s.heading : s.heading + 180;
  const [w, h] = [(ink.r - ink.l) * scale, (ink.b - ink.t) * scale];
  const corners = (d: number): Pt[] => {
    const [x, y] = polar(s.center, d, dir);
    return [
      [x - w / 2, y - h / 2],
      [x + w / 2, y - h / 2],
      [x + w / 2, y + h / 2],
      [x - w / 2, y + h / 2],
    ];
  };
  const [ux, uy] = polar([0, 0], 1, dir);
  const chordGap = (d: number) => Math.min(...corners(d).map(([x, y]) => (x - s.center[0]) * ux + (y - s.center[1]) * uy));
  const rimGap = (d: number) =>
    Math.min(...corners(d).map((c) => outlineRadius(s, angleTo(s.center, c)) - stroke.line / 2 - dist(s.center, c)));
  let [lo, hi] = [0, s.r];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (chordGap(mid) < rimGap(mid)) lo = mid;
    else hi = mid;
  }
  return polar(s.center, (lo + hi) / 2, dir);
};

// The outline from `from` to `to` degrees, pushed out by `out` px.
const bodyShape = (s: BodyState, from: number, to: number, out = 0) =>
  arcPoints(s.center, (deg) => outlineRadius(s, deg) + out, from, to);

export const Body: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const s = body(scene, el.spec.id);
  const p = el.spec.props as BodyProps;
  const shown = s.appear * s.out;
  const texts = shown > 0 ? [...s.names, ...s.labels.near, ...s.labels.far].map((t) => t.text) : [];
  const { ink, measuring } = useInk(`body ${el.spec.id}`, texts);
  if (shown <= 0) return null;
  if (measuring.length) return <AbsoluteFill>{measuring}</AbsoluteFill>;

  // A pulsed stroke thickens outward, keeping clear of the tags inside.
  const width = (part: Part) => stroke.line * (1 + s.pulse[part]);
  const rim = (from: number, to: number, part: Part) => bodyShape(s, from, to, (width(part) - stroke.line) / 2);
  const fillOf = (part: Part) => lerp(fill.body, fill.bodyPulse, s.pulse[part]);
  let shape: React.ReactNode;
  if (p.halves) {
    const half = (part: "near" | "far") => {
      const mid = part === "near" ? s.heading : s.heading + 180;
      const pts = bodyShape(s, mid - 90, mid + 90);
      const c = themeColor(p.halves![part]);
      return (
        <g key={part} opacity={s.markingOpacity}>
          <polygon points={pointsAttr(pts)} fill={c} fillOpacity={fillOf(part)} />
          <Polyline pts={rim(mid - 90, mid + 90, part)} color={c} width={width(part)} />
        </g>
      );
    };
    shape = [half("near"), half("far")];
  } else {
    const c = themeColor(p.color ?? "text");
    const pts = bodyShape(s, 0, 360);
    const all = Math.max(s.pulse.near, s.pulse.far, s.pulse.outline);
    const w = stroke.line * (1 + all);
    shape = (
      <>
        <polygon points={pointsAttr(pts)} fill={c} fillOpacity={lerp(fill.body, fill.bodyPulse, all)} />
        <Polyline pts={bodyShape(s, 0, 360, (w - stroke.line) / 2)} color={c} width={w} closed />
      </>
    );
  }
  const pointer = pointerOf(s);
  const tags = (["near", "far"] as const).flatMap((side) =>
    s.labels[side].map((t) => {
      const scale = lerp(1, sky.tagPulse, s.pulse[side]);
      const at = tagCenter(s, side, ink(t.text), scale);
      return (
        <InkLine
          key={`${side}-${t.text}`}
          text={t.text}
          ink={ink(t.text)}
          x={at[0]}
          y={at[1]}
          color={color.text}
          opacity={t.opacity}
          scale={scale}
          kind="label"
        />
      );
    }),
  );
  return (
    <AbsoluteFill style={{ opacity: shown }}>
      <AbsoluteFill style={{ opacity: s.opacity }}>
        <Svg>
          {shape}
          {/* Below full marking, the shape keeps a white outline. */}
          {s.markingOpacity < 1 ? (
            <Polyline pts={rim(0, 360, "outline")} color={color.text} width={width("outline")} opacity={1 - s.markingOpacity} closed />
          ) : null}
        </Svg>
        {tags}
        {s.names.map((n) => (
          <InkLine key={n.text} text={n.text} ink={ink(n.text)} x={s.center[0]} y={s.center[1]} color={color.text} opacity={n.opacity} kind="name" />
        ))}
      </AbsoluteFill>
      {/* The pointer at full strength, whatever the body's opacity. */}
      {s.pointer.opacity > 0 ? (
        <Svg>
          <StraightArrow
            tail={pointer.base}
            deg={pointer.deg}
            length={pointer.length}
            head={mark.head}
            color={color.text}
            width={stroke.arrow}
            opacity={s.pointer.opacity}
          />
        </Svg>
      ) : null}
    </AbsoluteFill>
  );
};
