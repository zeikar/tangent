import React from "react";
import { AbsoluteFill } from "remotion";
import { Caption } from "../storyboard/timeline";
import { color, content, font, type, zone } from "../style/theme";
import { Tex } from "./Tex";

// Phrase captions in the caption band: plain text with $...$ math, each shown
// from its anchor until the next one, cutting in. The first is on screen from
// frame 0 (resolveCaptions), so the feed's first frame shows it whole.

export const Captions: React.FC<{ captions: Caption[]; frame: number }> = ({ captions, frame }) => {
  const i = captions.findIndex((c) => frame >= c.from && frame < c.to);
  if (i < 0) return null;
  const cur = captions[i];
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: content.left,
          width: content.right - content.left,
          top: zone.caption.top,
          height: zone.caption.bottom - zone.caption.top,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          wordBreak: "keep-all",
          ...type.caption,
          fontFamily: font.sans,
          color: color.text,
        }}
      >
        <div data-text="caption">
          {/* Display style: an inline \frac would set its digits at half the caption's
              size. Bold: regular KaTeX reads lighter than the bold caption text. */}
          {cur.text.split("$").map((seg, i) =>
            i % 2 ? (
              <Tex key={i} tex={`\\displaystyle\\boldsymbol{${seg}}`} />
            ) : (
              <React.Fragment key={i}>{seg}</React.Fragment>
            ),
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
