import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { color, font, stroke } from "../style/theme";
import { Grid } from "./Grid";
import { Logo } from "./Logo";

// YouTube's minimum banner size. Render with --scale=1.25 for the 2560×1440
// it recommends for TV.
export const BANNER = { width: 2048, height: 1152 } as const;

// The only area every device shows. Desktop widens it to the full-width band
// of the same height; TV shows the whole banner.
const safeArea = { width: 1235, height: 338 };
const band = {
  top: (BANNER.height - safeArea.height) / 2,
  bottom: (BANNER.height + safeArea.height) / 2,
};
const safeLeft = (BANNER.width - safeArea.width) / 2;
const safeRight = safeLeft + safeArea.width;

// Brand on the left of the safe area, a y = √x plot on the right that keeps
// rising into the desktop-only margin.
const origin = { x: 1260, y: 700 };
const curveK = 9.3; // rise per √px, so the curve ends near the band's top edge
const curveY = (x: number) => origin.y - curveK * Math.sqrt(x - origin.x);
const dotX = 1520;

const curvePath = (() => {
  const pts: string[] = [];
  for (let x = origin.x; x <= BANNER.width; x += 4) {
    pts.push(`${x},${curveY(x).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")}`;
})();

export const bannerSchema = z.object({ showSafeArea: z.boolean() });

export const Banner: React.FC<z.infer<typeof bannerSchema>> = ({
  showSafeArea,
}) => (
  <AbsoluteFill style={{ background: color.bg }}>
    <Grid
      width={BANNER.width}
      height={BANNER.height}
      step={64}
      originX={origin.x}
      originY={origin.y}
    />
    <svg
      width={BANNER.width}
      height={BANNER.height}
      style={{ position: "absolute" }}
    >
      <line
        x1={origin.x - 40}
        y1={origin.y}
        x2={BANNER.width}
        y2={origin.y}
        stroke={color.muted}
        strokeWidth={4}
      />
      <line
        x1={origin.x}
        y1={0}
        x2={origin.x}
        y2={BANNER.height}
        stroke={color.muted}
        strokeWidth={4}
      />
      <path
        d={curvePath}
        fill="none"
        stroke={color.blue}
        strokeWidth={8}
        strokeLinecap="round"
      />
      <line
        x1={dotX}
        y1={curveY(dotX)}
        x2={dotX}
        y2={origin.y}
        stroke={color.yellow}
        strokeWidth={4}
        strokeDasharray={stroke.dash.join(" ")}
      />
      <circle cx={dotX} cy={curveY(dotX)} r={14} fill={color.yellow} />
    </svg>
    <div
      style={{
        position: "absolute",
        left: safeLeft + 20,
        top: band.top,
        height: safeArea.height,
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      <Logo size={260} />
      <div
        style={{
          fontFamily: font.sans,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 130,
            fontWeight: 800,
            lineHeight: 1.1,
            color: color.text,
          }}
        >
          루트와이
        </div>
        <div
          style={{
            fontSize: 46,
            fontWeight: 600,
            lineHeight: 1.3,
            color: color.muted,
          }}
        >
          왜 그런지, 그림 하나로
        </div>
      </div>
    </div>
    {showSafeArea ? <BannerSafeGuide /> : null}
  </AbsoluteFill>
);

// Review overlay: shades the TV-only area and outlines the all-device safe
// area. Toggled by a prop, never baked into a final render.
const BannerSafeGuide: React.FC = () => {
  const shade = "rgba(255, 0, 80, 0.28)";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: BANNER.width,
          height: band.top,
          background: shade,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: band.bottom,
          width: BANNER.width,
          bottom: 0,
          background: shade,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: safeLeft,
          top: band.top,
          width: safeRight - safeLeft,
          height: safeArea.height,
          outline: "4px dashed rgba(255, 0, 80, 0.9)",
        }}
      />
    </AbsoluteFill>
  );
};
