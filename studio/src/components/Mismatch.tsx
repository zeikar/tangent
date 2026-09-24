import React from "react";
import { AbsoluteFill } from "remotion";
import { ElementTimeline, phase, Scene, themeColor } from "../storyboard/timeline";
import { fill, VIDEO } from "../style/theme";
import { PaperState } from "./PaperRect";

// Shades the region inside exactly one of two sheets (their symmetric
// difference), from their live geometry. The player draws it beneath both.

const outline = ({ box: { cx, cy, w, h }, rot }: PaperState) => {
  const a = (rot * Math.PI) / 180;
  const pts = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ].map(([x, y]) => `${cx + x * Math.cos(a) - y * Math.sin(a)},${cy + x * Math.sin(a) + y * Math.cos(a)}`);
  return `M${pts.join("L")}Z`;
};

export const Mismatch: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const { frame } = scene;
  const p = el.spec.props as { a: string; b: string; color?: string };
  let opacity = 0;
  for (const a of el.actions) {
    if (frame < a.from) break;
    if (a.action === "appear") opacity = phase(a, frame);
    else if (a.action === "exit") opacity *= 1 - phase(a, frame);
    else throw new Error(`Mismatch ${el.spec.id}: unknown action ${a.action}`);
  }
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height}>
        <path
          d={`${outline(scene.paper(p.a))} ${outline(scene.paper(p.b))}`}
          fillRule="evenodd"
          fill={themeColor(p.color ?? "red")}
          fillOpacity={fill.mismatch * opacity}
        />
      </svg>
    </AbsoluteFill>
  );
};
