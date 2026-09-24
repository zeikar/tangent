// Style guide: the single source of visual constants. Scenes use these tokens;
// they never hardcode colors, sizes, or easing curves.
import { Easing } from "remotion";

export const VIDEO = { width: 1080, height: 1920, fps: 30 } as const;

// 3b1b-leaning palette: near-black ground, Manim-style accents.
export const color = {
  bg: "#0F1115",
  text: "#F2F2F2",
  muted: "#8A8F98",
  grid: "#2A2F38",
  blue: "#58C4DD", // primary object
  yellow: "#F4D345", // highlight / "look here"
  teal: "#5CD0B3", // secondary object
  red: "#FC6255", // contrast, error, "not this"
  purple: "#9A72AC", // tertiary, used sparingly
} as const;

export const font = {
  // Korean + Latin UI text. Variable font, weights 45–920.
  sans: "Pretendard, sans-serif",
  // KaTeX brings its own Computer Modern faces; this is for plain-text math-ish
  // labels that aren't worth a KaTeX render.
  serif: "KaTeX_Main, serif",
} as const;

// Sizes for a 1080px-wide frame viewed on a phone.
export const type = {
  headline: { fontSize: 96, fontWeight: 800, lineHeight: 1.2 },
  body: { fontSize: 56, fontWeight: 600, lineHeight: 1.35 },
  caption: { fontSize: 60, fontWeight: 700, lineHeight: 1.3 },
  // Labels and inline math: lowercase glyphs clear checks.glyphMin.
  label: { fontSize: 56, fontWeight: 600, lineHeight: 1.2 },
  // KaTeX scales its glyphs to 1.21em of this, so 80 renders like ~97px text.
  mathDisplay: 80,
  mathInline: 58,
} as const;

// Manim's `smooth` rate function: a normalized sigmoid, 3b1b's default motion.
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const smoothInflection = 10;
const smoothError = sigmoid(-smoothInflection / 2);
const smooth = (t: number) =>
  Math.min(
    Math.max(
      (sigmoid(smoothInflection * (t - 0.5)) - smoothError) /
        (1 - 2 * smoothError),
      0,
    ),
    1,
  );

export const ease = {
  smooth, // moves and transforms (default)
  out: Easing.bezier(0.16, 1, 0.3, 1), // entrances and exits: move at once, settle
  linear: (t: number) => t, // tracing along with time
} as const;

// Diagram strokes, fills, and marks (px).
export const stroke = {
  sheet: 6, // paper outlines and cut lines
  line: 4, // number lines, dimension lines, equation boxes
  dash: [18, 12], // dashed outlines and fold lines: dash, gap
} as const;

export const fill = {
  sheet: 0.08, // paper
  flap: 0.2, // the half of a sheet that is flipping over
  mismatch: 0.35, // where two shapes disagree
} as const;

export const mark = {
  labelGap: 24, // line (number line, dimension) to its label; sheet to its title
  edgeLabelGap: 12, // sheet edge to its label: tight, so it can't read as a neighbor's
  tick: 24, // number-line tick
  endTick: 16, // dimension-line end tick
  marker: 28, // number-line marker triangle width
  boxPadding: 12, // box drawn around an equation part
  boxRadius: 16,
  revealRise: 20, // an equation part rises this far into place
  pulseScale: 1.3, // a pulsed number-line mark
} as const;

// Default animation lengths. These are durations, not start times; start times
// always come from beat cues.
export const duration = {
  fast: 0.35,
  base: 0.7,
  slow: 1.2,
  exit: 0.2, // every exit, whatever its speed: it clears the way for what comes next
} as const;

// Shorts overlays (header, action buttons on the right, title/description at
// the bottom, which grows when expanded). YouTube publishes no official spec;
// these are conservative values from third-party overlay templates.
export const safe = { top: 240, bottom: 420, left: 60, right: 140 } as const;

// Content centers on the frame, not on the asymmetric safe area, and keeps the
// safe area's wider (right) margin on both sides.
export const content = {
  centerX: VIDEO.width / 2,
  left: safe.right,
  right: VIDEO.width - safe.right,
} as const;

// Vertical zones inside the safe area (y in px). The picture owns the visual
// zone; captions own the band below it.
export const zone = {
  visual: { top: safe.top, bottom: 1250 },
  caption: { top: 1280, bottom: VIDEO.height - safe.bottom },
} as const;

// What scripts/check-render.mts holds a render to; build-cues.py reads the
// loudness target from here too. Pixel levels are 8-bit gray.
export const checks = {
  maxSeconds: 60,
  glyphMin: 30, // px at 1080 wide: smallest letter or digit, lowercase x-height included
  centerTolerance: 25, // px between the visual zone's ink center and content.centerX at a beat's end
  reactionFrames: 3, // a beat's first word (when it has cues) to the first visible change
  loudness: { target: -14, tolerance: 1, maxTruePeak: -1 }, // LUFS integrated, LU, dBTP
  avOffsetMs: 20, // render audio vs narration.mp3
  wordOnsetMs: 200, // words.json start vs the audible onset, for words after a pause
  // Audible onsets: speech (speechDb, per 10 ms) within 60 ms of a dip to
  // dipDb. Checked for words words.json puts at least wordGap s after the
  // previous word's end (the aligner's ends run up to ~0.16 s early).
  onset: { dipDb: -55, speechDb: -35, wordGap: 0.25 },
  tailSilenceDb: -50, // the render's last 100 ms must be quieter, or the audio was cut off
  inkLevel: 10, // gray levels above the background that count as ink
  changeLevel: 16, // a pixel changed by more than this...
  changePixels: 100, // ...in more visual-zone pixels than this is a visible change
  loopMaxPixels: 500, // visual-zone pixels allowed to differ (by changeLevel) between the last and first frame
} as const;
