import React from "react";
import { Tex } from "../components/Tex";
import { color } from "../style/theme";

// The channel mark, √y (루트와이, "root why"), drawn on an 800-unit square and
// scaled to `size`. The radical is a stroked polyline rather than KaTeX's,
// whose hairline radical disappears at avatar size (~36 px).
export const LOGO_UNIT = 800;

// Hook, down to the foot, up to the top, then the bar over the radicand.
// Centered on (400, 400) so the mark survives a circular crop.
const radical = "140,450 205,415 300,615 405,185 665,185";

export const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
  >
    <div
      style={{
        position: "absolute",
        width: LOGO_UNIT,
        height: LOGO_UNIT,
        transformOrigin: "0 0",
        transform: `scale(${size / LOGO_UNIT})`,
      }}
    >
      <svg
        width={LOGO_UNIT}
        height={LOGO_UNIT}
        style={{ position: "absolute" }}
      >
        <polyline
          points={radical}
          fill="none"
          stroke={color.blue}
          strokeWidth={40}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 425,
          top: 215,
          width: 230,
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Tex
          tex={String.raw`\boldsymbol{y}`}
          fontSize={330}
          color={color.yellow}
        />
      </div>
    </div>
  </div>
);

// The mark alone on a transparent background, for anywhere outside YouTube.
export const LogoStill: React.FC = () => <Logo size={LOGO_UNIT} />;
