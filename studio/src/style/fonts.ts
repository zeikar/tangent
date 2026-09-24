import { loadFont } from "@remotion/fonts";
import "katex/dist/katex.min.css";
import "./global.css";
import pretendard from "pretendard/dist/web/variable/woff2/PretendardVariable.woff2";
import amsRegular from "katex/dist/fonts/KaTeX_AMS-Regular.woff2";
import mainBold from "katex/dist/fonts/KaTeX_Main-Bold.woff2";
import mainItalic from "katex/dist/fonts/KaTeX_Main-Italic.woff2";
import mainRegular from "katex/dist/fonts/KaTeX_Main-Regular.woff2";
import mathBoldItalic from "katex/dist/fonts/KaTeX_Math-BoldItalic.woff2";
import mathItalic from "katex/dist/fonts/KaTeX_Math-Italic.woff2";
import size1 from "katex/dist/fonts/KaTeX_Size1-Regular.woff2";
import size2 from "katex/dist/fonts/KaTeX_Size2-Regular.woff2";
import size3 from "katex/dist/fonts/KaTeX_Size3-Regular.woff2";
import size4 from "katex/dist/fonts/KaTeX_Size4-Regular.woff2";

// katex.min.css declares these faces too, but the browser only fetches a face
// once a glyph needs it, which can be after Remotion captures the frame.
// loadFont() blocks rendering until each face is ready.
const faces = [
  { family: "Pretendard", url: pretendard, weight: "45 920" },
  { family: "KaTeX_AMS", url: amsRegular },
  { family: "KaTeX_Main", url: mainRegular },
  { family: "KaTeX_Main", url: mainBold, weight: "bold" },
  { family: "KaTeX_Main", url: mainItalic, style: "italic" },
  { family: "KaTeX_Math", url: mathItalic, style: "italic" },
  { family: "KaTeX_Math", url: mathBoldItalic, weight: "bold", style: "italic" },
  { family: "KaTeX_Size1", url: size1 },
  { family: "KaTeX_Size2", url: size2 },
  { family: "KaTeX_Size3", url: size3 },
  { family: "KaTeX_Size4", url: size4 },
];

for (const face of faces) {
  loadFont(face);
}
