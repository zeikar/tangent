import katex from "katex";
import React, { useMemo } from "react";
import { color as palette, type } from "../style/theme";

type Props = {
  tex: string;
  display?: boolean;
  fontSize?: number;
  color?: string;
  // Allows \htmlData / \htmlStyle, which Equation uses to address its parts.
  trust?: boolean;
  style?: React.CSSProperties;
  // What the probe calls it (data-tex), when `tex` wraps it for drawing.
  name?: string;
};

// Renders LaTeX with KaTeX. Invalid TeX throws so a broken formula fails the
// render instead of shipping red error text.
export const Tex: React.FC<Props> = ({
  tex,
  display = false,
  fontSize = display ? type.mathDisplay : type.mathInline,
  color = palette.text,
  trust = false,
  style,
  name = tex,
}) => {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: display,
        output: "html",
        throwOnError: true,
        trust,
        strict: trust ? "ignore" : "warn",
      }),
    [tex, display, trust],
  );
  return (
    <span
      data-tex={name}
      style={{ fontSize, color, lineHeight: 1, ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
