import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { Tex } from "../components/Tex";
import { color } from "../style/theme";
import { Probe } from "./Probe";

export const measureTexSchema = z.object({
  items: z.array(z.object({ tex: z.string(), fontSize: z.number() })),
  probe: z.boolean().optional(),
});

// Renders TeX strings the way labels render them (the Tex component), each on
// a baseline marker, for scripts/measure-tex.mts to read back through the probe.
export const MeasureTex: React.FC<z.infer<typeof measureTexSchema>> = ({ items, probe }) => (
  <AbsoluteFill style={{ background: color.bg }}>
    {items.map((item, i) => (
      <div key={i} data-el={`tex-${i}`} style={{ position: "absolute", left: 100, top: 100 + i * 400 }}>
        <div data-text="tex" style={{ whiteSpace: "nowrap" }}>
          <span data-baseline style={{ display: "inline-block", width: 0, height: 0 }} />
          <Tex tex={item.tex} fontSize={item.fontSize} />
        </div>
      </div>
    ))}
    {probe ? <Probe /> : null}
  </AbsoluteFill>
);
