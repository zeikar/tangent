import React from "react";
import { AbsoluteFill } from "remotion";
import { color } from "../style/theme";
import { Logo, LOGO_UNIT } from "./Logo";

// YouTube's recommended profile picture size; it is shown cropped to a circle.
export const AVATAR = { width: LOGO_UNIT, height: LOGO_UNIT } as const;

export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ background: color.bg }}>
    <Logo size={AVATAR.width} />
  </AbsoluteFill>
);
