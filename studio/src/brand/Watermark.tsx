import React from "react";
import { AbsoluteFill } from "remotion";
import { color } from "../style/theme";
import { Logo } from "./Logo";

// YouTube's recommended video watermark size. It overlays the player's corner
// on long-form videos (Shorts don't show it), so the mark sits on its own dark
// disc to stay legible over any frame.
export const WATERMARK = { width: 150, height: 150 } as const;

export const Watermark: React.FC = () => (
  <AbsoluteFill style={{ background: color.bg, borderRadius: "50%" }}>
    <Logo size={WATERMARK.width} />
  </AbsoluteFill>
);
