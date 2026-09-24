// Measures TeX as the studio renders it (the Tex component, KaTeX, the
// project's fonts): its ink box against the origin and baseline, and its
// smallest glyph against the legibility floor, so math can be laid out in a
// storyboard without guessing.
//
//   node scripts/measure-tex.mts '<tex>' ['<tex>' ...] [--display] [--size=N | --token=NAME] [--json]
// --display prefixes \displaystyle (how Equation and captions set math);
// --token takes the size from `type` in src/style/theme.ts (default
// mathInline); a token with a fontSize (label, caption, ...) uses that.
import { checks, type } from "../src/style/theme.ts";
import { bundleStudio, probeFrames } from "./probe.mts";

const args = process.argv.slice(2);
const flag = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const texs = args.filter((a) => !a.startsWith("--"));
if (!texs.length) throw new Error("usage: node scripts/measure-tex.mts '<tex>' [...] [--display] [--size=N | --token=NAME] [--json]");
const display = args.includes("--display");
const tokenName = flag("token") ?? "mathInline";
const token = (type as Record<string, unknown>)[tokenName];
if (!flag("size") && token === undefined) throw new Error(`no type.${tokenName} in theme.ts`);
const fontSize = Number(flag("size") ?? (typeof token === "number" ? token : (token as { fontSize: number }).fontSize));

const items = texs.map((tex) => ({ tex: display ? `\\displaystyle ${tex}` : tex, fontSize }));
const [snap] = await probeFrames({ serveUrl: bundleStudio(), id: "MeasureTex", inputProps: { items }, frameRange: [0, 0] });
const out = texs.map((tex, i) => {
  const t = snap.els.find((e) => e.id === `tex-${i}`)!.texts[0];
  const [x0, base] = t.origin!;
  const [l, top, r, bottom] = t.box;
  return {
    tex,
    fontSize,
    style: display ? "display" : "inline",
    width: +(r - l).toFixed(1),
    height: +(bottom - top).toFixed(1),
    ascent: +(base - top).toFixed(1), // ink above the baseline
    descent: +(bottom - base).toFixed(1), // ink below it
    left: +(l - x0).toFixed(1), // ink's left edge from the origin
    smallestGlyph: t.glyph ? { char: t.glyph[0], height: t.glyph[1] } : null,
    legible: t.glyph ? t.glyph[1] >= checks.glyphMin : true,
  };
});
if (args.includes("--json")) console.log(JSON.stringify(out, null, 1));
else {
  for (const m of out) {
    const size = flag("size") ? `${m.fontSize} px` : `${tokenName} ${m.fontSize} px`;
    console.log(`${m.tex}  (${size}, ${m.style})`);
    console.log(`  ink ${m.width} × ${m.height} px: ${m.ascent} above the baseline, ${m.descent} below; starts ${m.left} px right of the origin`);
    console.log(
      m.smallestGlyph
        ? `  smallest glyph "${m.smallestGlyph.char}" ${m.smallestGlyph.height} px: ${m.legible ? "clears" : "UNDER"} the ${checks.glyphMin} px floor`
        : "  no letters or digits",
    );
  }
}
