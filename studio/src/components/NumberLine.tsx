import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, phase, Scene, themeColor } from "../storyboard/timeline";
import { color, font, mark, stroke, type, VIDEO } from "../style/theme";
import { Anchored } from "./Anchored";
import { Tex } from "./Tex";

// Horizontal number line with labeled marks and a marker that follows a
// sheet's live h/w.

type Props = {
  min: number;
  max: number;
  x0: number;
  x1: number;
  y: number;
  ends?: boolean;
  // Each mark's label is plain text (styled like a sheet name) or tex.
  marks?: { value: number; color: string; text?: string; tex?: string }[];
  markerFrom?: string;
};

export const NumberLine: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  let line = 0;
  let rest = 0;
  let opacity = 1;
  const pulse = new Map<number, number>();
  for (const a of el.actions) {
    if (frame < a.from) break;
    if (a.action === "appear") {
      line = phase(a, frame, 0, 0.6);
      rest = phase(a, frame, 0.6, 1);
    } else if (a.action === "pulseMark") {
      pulse.set(a.params.value, bump(a, frame));
    } else if (a.action === "exit") {
      opacity *= 1 - phase(a, frame);
    } else {
      throw new Error(`NumberLine ${el.spec.id}: unknown action ${a.action}`);
    }
  }
  if (line <= 0 || opacity <= 0) return null;

  const xOf = (v: number) => p.x0 + ((v - p.min) / (p.max - p.min)) * (p.x1 - p.x0);
  const markerAt = p.markerFrom
    ? (() => {
        const { w, h } = scene.paper(p.markerFrom).box;
        return xOf(Math.min(Math.max(h / w, p.min), p.max));
      })()
    : null;
  const tipY = p.y - mark.tick / 2 - stroke.line; // just above the tick tops
  const half = mark.marker / 2;
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={VIDEO.width} height={VIDEO.height}>
        <line
          x1={p.x0}
          y1={p.y}
          x2={p.x0 + (p.x1 - p.x0) * line}
          y2={p.y}
          stroke={color.muted}
          strokeWidth={stroke.line}
          strokeLinecap="round"
        />
        <g opacity={rest}>
          {(p.marks ?? []).map((m) => {
            const len = (mark.tick / 2) * (1 + (mark.pulseScale - 1) * (pulse.get(m.value) ?? 0));
            return (
              <line
                key={m.value}
                x1={xOf(m.value)}
                y1={p.y - len}
                x2={xOf(m.value)}
                y2={p.y + len}
                stroke={themeColor(m.color)}
                strokeWidth={stroke.line}
              />
            );
          })}
          {markerAt !== null ? (
            <path
              d={`M${markerAt},${tipY} L${markerAt - half},${tipY - half * Math.sqrt(3)} L${markerAt + half},${tipY - half * Math.sqrt(3)} Z`}
              fill={color.yellow}
            />
          ) : null}
        </g>
      </svg>
      {(p.marks ?? []).map((m) => (
        <Anchored
          key={m.value}
          x={xOf(m.value)}
          y={p.y + mark.labelGap}
          anchor="top"
          opacity={rest}
          scale={1 + (mark.pulseScale - 1) * (pulse.get(m.value) ?? 0)}
        >
          {m.text !== undefined ? (
            <div style={{ ...type.label, fontFamily: font.sans, color: themeColor(m.color) }}>{m.text}</div>
          ) : (
            <Tex tex={m.tex!} color={themeColor(m.color)} />
          )}
        </Anchored>
      ))}
      {p.ends
        ? [p.min, p.max].map((v) => (
            <Anchored key={v} x={xOf(v)} y={p.y + mark.labelGap} anchor="top" opacity={rest}>
              <div style={{ ...type.label, fontFamily: font.sans, color: color.muted }}>{v}</div>
            </Anchored>
          ))
        : null}
    </AbsoluteFill>
  );
};
