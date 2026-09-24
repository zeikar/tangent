import React from "react";
import { AbsoluteFill } from "remotion";
import { safe, VIDEO } from "../style/theme";

// Review overlay: shades the regions Shorts UI can cover. Toggled by a
// composition prop, never baked into a final render.
export const SafeAreaGuide: React.FC = () => {
  const shade = "rgba(255, 0, 80, 0.28)";
  const band = (s: React.CSSProperties) => (
    <div style={{ position: "absolute", background: shade, ...s }} />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {band({ left: 0, top: 0, width: VIDEO.width, height: safe.top })}
      {band({ left: 0, bottom: 0, width: VIDEO.width, height: safe.bottom })}
      {band({
        left: 0,
        top: safe.top,
        width: safe.left,
        bottom: safe.bottom,
      })}
      {band({
        right: 0,
        top: safe.top,
        width: safe.right,
        bottom: safe.bottom,
      })}
    </AbsoluteFill>
  );
};
