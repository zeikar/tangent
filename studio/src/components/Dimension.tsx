import React from "react";
import { AbsoluteFill } from "remotion";
import { ElementTimeline, phase, Scene, themeColor } from "../storyboard/timeline";
import { mark, stroke, VIDEO } from "../style/theme";
import { Anchored } from "./Anchored";
import { Tex } from "./Tex";

// Measurement line along one edge of a sheet, offset outward, with end ticks
// and a label beyond it. Tracks the sheet's live geometry.

type Props = {
  of: string;
  side: "bottom" | "right";
  offset: number;
  label: { tex: string; color: string };
};

export const Dimension: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  let grow = 0;
  let labelIn = 0;
  let opacity = 1;
  for (const a of el.actions) {
    if (frame < a.from) break;
    if (a.action === "appear") {
      grow = phase(a, frame, 0, 0.6);
      labelIn = phase(a, frame, 0.6, 1);
    } else if (a.action === "exit") {
      opacity *= 1 - phase(a, frame);
    } else {
      throw new Error(`Dimension ${el.spec.id}: unknown action ${a.action}`);
    }
  }
  if (grow <= 0 || opacity <= 0) return null;

  const { cx, cy, w, h } = scene.paper(p.of).box;
  const c = themeColor(p.label.color);
  const bottom = p.side === "bottom";
  // Line along the edge, as (center, half length) on its axis plus its offset position.
  const pos = bottom ? cy + h / 2 + p.offset : cx + w / 2 + p.offset;
  const mid = bottom ? cx : cy;
  const half = ((bottom ? w : h) / 2) * grow;
  // Ticks keep butt caps so they measure exactly mark.endTick.
  const seg = (a0: number, b0: number, a1: number, b1: number, key: string) => {
    const [x1, y1, x2, y2] = bottom ? [a0, b0, a1, b1] : [b0, a0, b1, a1];
    const cap = key === "line" ? "square" : "butt";
    return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={stroke.line} strokeLinecap={cap} />;
  };
  const tick = mark.endTick / 2;
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={VIDEO.width} height={VIDEO.height}>
        {seg(mid - half, pos, mid + half, pos, "line")}
        {seg(mid - half, pos - tick, mid - half, pos + tick, "t0")}
        {seg(mid + half, pos - tick, mid + half, pos + tick, "t1")}
      </svg>
      <Anchored
        x={bottom ? mid : pos + mark.labelGap}
        y={bottom ? pos + mark.labelGap : mid}
        anchor={bottom ? "top" : "left"}
        opacity={labelIn}
      >
        <Tex tex={p.label.tex} color={c} />
      </Anchored>
    </AbsoluteFill>
  );
};
