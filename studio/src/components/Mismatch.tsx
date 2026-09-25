import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, phase, Scene, themeColor } from "../storyboard/timeline";
import { fill, stroke, VIDEO } from "../style/theme";
import { PaperState } from "./PaperRect";

// Shades the region inside exactly one of two sheets (their symmetric
// difference), from their live geometry. The player draws it beneath both. A
// pulse flashes it to full opacity with a band just outside the sheets'
// strokes around it, so it glows outward.

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
  let flash = 0;
  for (const a of el.actions) {
    if (frame < a.from) break;
    if (a.action === "appear") opacity = phase(a, frame);
    else if (a.action === "exit") opacity *= 1 - phase(a, frame);
    else if (a.action === "pulse") flash = Math.max(flash, bump(a, frame));
    else throw new Error(`Mismatch ${el.spec.id}: unknown action ${a.action}`);
  }
  if (opacity <= 0) return null;
  const d = `${outline(scene.paper(p.a))} ${outline(scene.paper(p.b))}`;
  const c = themeColor(p.color ?? "red");
  const glow = `mismatch-glow-${el.spec.id}`;
  // The region's edges are sheet edges, whose strokes cover it: the band starts
  // where they end.
  const covered = stroke.sheet / 2;
  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height}>
        <path d={d} fillRule="evenodd" fill={c} fillOpacity={lerp(fill.mismatch, 1, flash) * opacity} />
        {flash > 0 ? (
          <>
            <filter id={glow} filterUnits="userSpaceOnUse" x={0} y={0} width={VIDEO.width} height={VIDEO.height}>
              <feMorphology in="SourceAlpha" operator="dilate" radius={covered + stroke.line} result="outer" />
              <feMorphology in="SourceAlpha" operator="dilate" radius={covered} result="inner" />
              <feComposite in="outer" in2="inner" operator="out" result="band" />
              <feFlood floodColor={c} floodOpacity={flash * opacity} />
              <feComposite in2="band" operator="in" />
            </filter>
            {/* Drawn only through the filter: the region grown by the covered
                width plus a line width, less the region grown by the covered width. */}
            <path d={d} fillRule="evenodd" fill="black" filter={`url(#${glow})`} />
          </>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
