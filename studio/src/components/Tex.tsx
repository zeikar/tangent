import katex from "katex";
import React, { useMemo } from "react";
import { color as palette, type } from "../style/theme";

type Props = {
  tex: string;
  display?: boolean;
  fontSize?: number;
  color?: string;
  style?: React.CSSProperties;
};

// Renders LaTeX with KaTeX. Invalid TeX throws so a broken formula fails the
// render instead of shipping red error text.
export const Tex: React.FC<Props> = ({
  tex,
  display = false,
  fontSize = display ? type.mathDisplay : type.mathInline,
  color = palette.text,
  style,
}) => {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: display,
        output: "html",
        throwOnError: true,
      }),
    [tex, display],
  );
  return (
    <span
      style={{ fontSize, color, lineHeight: 1, ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
