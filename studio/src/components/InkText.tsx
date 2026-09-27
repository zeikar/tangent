import React from "react";
import { font, type } from "../style/theme";
import { glyphRect } from "./ink";
import { Rel, useTextMetrics } from "./measure";

// Plain type.label lines placed by their ink, for components that put text on
// or inside their shapes (Note centers its own lines, math included).

const lineStyle = { position: "absolute", whiteSpace: "nowrap", ...type.label, fontFamily: font.sans } as const;

// Ink of each text, measured once from a hidden copy: render `measuring`
// until it is empty.
export const useInk = (label: string, texts: string[]) => {
  const unique = [...new Set(texts)];
  const { metrics, copyRef } = useTextMetrics(label, unique, glyphRect);
  const measuring = unique
    .filter((t) => !metrics.has(t))
    .map((t) => (
      <div key={`m-${t}`} ref={copyRef(t)} style={{ ...lineStyle, left: 0, top: 0, visibility: "hidden" }}>
        {t}
      </div>
    ));
  return { ink: (t: string) => metrics.get(t)!.ink, measuring };
};

// One line with its ink centered on (x, y), scaled about that point.
export const InkLine: React.FC<{
  text: string;
  ink: Rel;
  x: number;
  y: number;
  color: string;
  opacity: number;
  scale?: number;
  // What the probe (src/probe) calls this text item.
  kind: string;
}> = ({ text, ink, x, y, color, opacity, scale = 1, kind }) => {
  const cx = (ink.l + ink.r) / 2;
  const cy = (ink.t + ink.b) / 2;
  return (
    <div
      data-text={kind}
      style={{
        ...lineStyle,
        left: x - cx,
        top: y - cy,
        color,
        opacity,
        scale: scale === 1 ? undefined : String(scale),
        transformOrigin: `${cx}px ${cy}px`,
      }}
    >
      {text}
    </div>
  );
};
