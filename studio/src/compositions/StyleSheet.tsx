import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { SafeAreaGuide } from "../components/SafeAreaGuide";
import { Tex } from "../components/Tex";
import { color, duration, ease, font, safe, type } from "../style/theme";

export const styleSheetSchema = z.object({ showSafeArea: z.boolean() });

const swatches = ["blue", "yellow", "teal", "red", "purple", "muted"] as const;

// Visual check for the style guide: Korean type, KaTeX, palette, easing.
export const StyleSheet: React.FC<z.infer<typeof styleSheetSchema>> = ({
  showSafeArea,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (from: number, len: number, easing: (x: number) => number) =>
    interpolate(frame, [from * fps, (from + len) * fps], [0, 1], {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const titleIn = t(0.2, duration.base, ease.out);
  const eqIn = t(0.8, duration.slow, ease.smooth);
  const dot = t(1.5, duration.slow, ease.smooth);

  return (
    <AbsoluteFill
      style={{
        background: color.bg,
        color: color.text,
        fontFamily: font.sans,
        paddingTop: safe.top,
        paddingLeft: safe.left + 20,
        paddingRight: safe.right,
        gap: 48,
      }}
    >
      <div
        style={{
          ...type.headline,
          opacity: titleIn,
          translate: `0 ${(1 - titleIn) * 40}px`,
        }}
      >
        A4 용지는 왜
        <br />
        1 : <span style={{ color: color.yellow }}>√2</span> 일까?
      </div>
      <div style={{ ...type.body, color: color.muted }}>
        한글 본문 · 숫자 1,000 · 3.14 · Monte Carlo
      </div>
      <div style={{ opacity: eqIn, scale: String(0.9 + 0.1 * eqIn) }}>
        <Tex
          display
          tex={String.raw`\frac{x}{1} = \frac{1}{x/2} \;\Rightarrow\; x^2 = 2`}
        />
      </div>
      <Tex display tex={String.raw`\sum_{k=1}^{n} (2k-1) = n^2`} color={color.blue} />
      <div style={{ ...type.body }}>
        원의 넓이는 <Tex tex={String.raw`\pi r^2`} color={color.yellow} />,
        미분하면 <Tex tex={String.raw`\frac{d}{dx}\sin x = \cos x`} />
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        {swatches.map((name) => (
          <div key={name} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 16,
                background: color[name],
              }}
            />
            <div style={{ ...type.label, fontSize: 28, marginTop: 8 }}>
              {name}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "relative",
          height: 60,
          width: 800,
          borderBottom: `4px solid ${color.grid}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: dot * 740,
            top: 0,
            width: 60,
            height: 60,
            borderRadius: 30,
            background: color.yellow,
          }}
        />
      </div>
      {showSafeArea ? <SafeAreaGuide /> : null}
    </AbsoluteFill>
  );
};
