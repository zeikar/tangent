// Style guide: the single source of visual constants. Scenes use these tokens;
// they never hardcode colors, sizes, or easing curves.
import { Easing } from "remotion";

export const VIDEO = { width: 1080, height: 1920, fps: 30 } as const;

// Near-black ground; accents are our own, not Manim's defaults (decisions.md →
// Palette). Any change here also goes to the palette copies in
// scripts/storyboard-view.html and scripts/takes-view.html.
export const color = {
  bg: "#0F1115",
  text: "#F2F2F2",
  muted: "#8A8F98",
  grid: "#2A2F38",
  blue: "#5285F8", // primary object
  yellow: "#FEB251", // highlight / "look here"
  teal: "#03BDB6", // secondary object
  red: "#E25273", // contrast, error, "not this"
  purple: "#C8B7FF", // tertiary, used sparingly
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
  out: Easing.bezier(0.16, 1, 0.3, 1), // entrances: move at once, settle
  // Exits fade evenly: they start at once and stay visible across their 0.2 s
  // (out spent two thirds of it in the first frame, so they read as cuts).
  exit: (t: number) => t,
  linear: (t: number) => t, // tracing along with time
} as const;

// A cue's ease: cruise. Constant speed, like linear, but easing out of rest
// and back into it over cruiseRamp seconds at each end (an orbit that starts
// and stops). `ramp` is that time as a share of the cue's span.
export const cruiseRamp = 0.15;
export const cruise = (ramp: number) => {
  const r = Math.min(ramp, 0.5);
  const v = 1 / (1 - r); // the constant speed
  // Distance over a ramp's first u (0..1): speed rises as smoothstep.
  const ramped = (u: number) => v * r * (u ** 3 - u ** 4 / 2);
  return (t: number) => (t < r ? ramped(t / r) : t > 1 - r ? 1 - ramped((1 - t) / r) : v * (t - r / 2));
};

// Diagram strokes, fills, and marks (px).
export const stroke = {
  sheet: 6, // paper outlines and cut lines
  line: 4, // number lines, dimension lines, equation boxes, body rims, tethers
  dash: [18, 12], // dashed outlines and fold lines: dash, gap
  thin: 3, // orbits, compass hubs
  arrow: 5, // pointers, rim traces, spin and sweep arcs, direction arrows, rings
  force: 8, // force arrows
  hand: 5, // a hand drawn large on its own (Hand)
} as const;

export const fill = {
  sheet: 0.08, // paper
  flap: 0.2, // the half of a sheet that is flipping over
  mismatch: 0.8, // where two shapes disagree: clearly red, about 4.4:1 against the background
  body: 0.6, // planets and moons, each half alike: no half reads as a dark side
  bodyPulse: 0.85, // a pulsed body part, at its peak
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
  pulseScale: 1.3, // a pulsed number-line mark or star
  head: 18, // arrowhead length (and width) on a 5 px arrow or arc
  forceHead: 30, // on a force arrow
} as const;

// Bodies (Body), what rides on them, and the stars behind them (px, degrees).
export const sky = {
  orbitOpacity: 0.5, // orbit circles, in muted
  tagPulse: 1.15, // a tag's scale when its half pulses
  pointerGap: 10, // outline to a pointer's base; compass hub to a gathered pointer's base
  pointerLength: 0.75, // of the body's r...
  pointerMin: 36, // ...but at least this
  traceGap: 10, // outline to a rim trace
  spinGap: 20, // long semi-axis to a spin arrow
  spinSpan: 120, // a spin arrow's arc
  hub: 24, // a compass hub's radius
  sweepGap: 14, // gathered pointers' tips to a compass sweep
  sweepShort: 20, // a compass sweep stops this short of a full turn
  gatherStagger: 0.15, // each gathered pointer starts its slide this share of the gather after the one before
  star: 40, // a named (bright) star, across
  starGrow: 0.6, // a bright star appears from this scale
  dot: [2, 4], // a faint star's radius, smallest and largest
  dotOpacity: 0.35,
  dots: 24, // faint stars in a field, about
  dotClear: 24, // a faint star to any other ink
  dotSpacing: 56, // faint stars to each other, at least
} as const;

// People and hands drawn in code (Person, Hand). A solid person is opaque:
// its fills are these shares of a color over the background. A ghost's are
// opacities, so what it stands over shows through.
export const figure = {
  body: 0.5, // a solid person's body, in muted
  hair: 0.3, // its hair, in muted: darker than the body, lighter than the glass
  ghost: 0.15, // a ghost's body, in muted
  ghostHair: 0.4, // a ghost's hair, in muted
  hand: 0.6, // a hand's face, in its color
  ghostHand: 0.8,
  pulse: 0.85, // a pulsed part's fill at its peak
  guest: 0.6, // a hotel guest (Hotel), in its color: an icon, not a solid person
  palmLines: 0.6, // in text
  profile: 0.5, // a turning person's body seen side on, as a share of its width
} as const;

// A standing mirror (Mirror) and the landscape on a lake (Scenery).
export const mirror = {
  radius: 20, // the frame's corners
  sheen: [90, 55], // its two streaks' lengths, running lower left to upper right
  sheenGap: 22, // between the streaks
  sheenAt: [75, 75], // the long streak's center, in from the frame's top-right corner
  sheenOpacity: 0.5, // in text
  tiltTaper: 0.06, // a tipping mirror's top edge is this much shorter than its bottom at 45°
} as const;

export const scenery = {
  fill: 0.35, // mountains and trees, in muted over the background
  fillPulse: 0.6,
  snow: 0.8, // a snowcap, in text
  snowcap: 0.2, // of a mountain's height, from its peak
  trunk: 10, // a tree's trunk width
} as const;

// Light drawn as its screen color, and the eye's response to it (Spectrum,
// ColorChip, ConeCurves, LightLine, ConeBars). Computed colors are wide fills
// only: YouTube's 4:2:0 chroma subsampling smears thin saturated lines.
export const optics = {
  inset: 4, // px: a band or curve stays this far inside the content bounds; the encoder spreads a saturated edge 1–3 px
  slice: 1, // px: a curved band's slices along its outer edge, at most (reads as a smooth gradient)
  sliver: 24, // px: a ring's bridge drawn into its middle is gone once narrower than this on its outside (a thin saturated line)
  partPulse: 1.2, // a pulsed part of a band, its thickness
  end: 40, // nm: a band's end, as a pulse picks it out
  whiten: 0.35, // a pulsed bridge's colors lifted toward white, at the peak
  glow: 20, // px: a pulsed bridge's glow reaches this far past the ring at rest, at most
  chipPulse: 1.08, // a pulsed chip's scale
  curveMin: 0.01, // a cone curve is drawn where it is at least this
  dot: 10, // radius of a light's dot on a curve
  dotMin: 0.03, // a dot shows where its curve is at least this
  dotPulse: 1.6,
  fullPower: 0.3, // a light's line and dots are fully opaque from this power up
  track: 0.15, // a bar's full-height track, in its color
  bar: 0.85, // a bar, in its color
  barPulse: 1.1, // a pulsed bar's width (its fill goes to 1)
  targetGap: 8, // px: a bar to its dashed target outline
  hatch: 24, // px: the stripe period hatching a bar above its target (stripes and gaps alike half of it)
  hatchGap: 0.3, // the hatching's gaps, in the bar's color
  floorOverhang: 40, // px: the bars' floor line past the outer bars
} as const;

// A row of numbered rooms seen from the front (Hotel), arrows between its
// places (RoomArrows) and rows of numbers taken from it (NumberRow): px, or a
// share of the room width w where noted. An endless row fades out to the
// right, each drawn piece at the opacity of its x.
export const hotel = {
  number: 44, // TeX px: room numbers and newcomers' tags
  numberDrop: 40, // a room's roof to its number's ink center
  numberPulse: 1.2, // a pulsed number's scale, in a room or a row
  street: 230, // the floor to the street line's feet
  tagGap: 16, // a newcomer's feet to its tag's ink top
  floorPast: 0.6, // of w: a finite hotel's floor line past its outside spot
  lit: 0.15, // a lit room's fill, in yellow
  guestPulse: 6, // a pulsed guest's outline (its fill goes to figure.pulse)
  wallPulse: 10, // a pulsed end wall
  wave: 1.5, // of w: half the width of a rooms pulse running along the row
  arrowGap: 6, // a roof to a room arrow's ends
  arrowInset: 0.15, // of w: a room arrow's ends from its rooms' centers
  arrowRise: 0.4, // a room arrow's height, of its span
  arrowPulse: 8, // a pulsed arrow's stroke (its head grows by mark.pulseScale)
  headGap: 14, // a newcomer's head to its arrow's tail
  floorGap: 8, // a newcomer's arrow tip to its room's floor
  pairGap: 12, // a pairing line's ends to its numbers' ink
  fadeStep: 8, // a fading line is cut into pieces at most this long
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

// A camera (components/Camera) clips the picture this far inside the content
// bounds and the visual zone: the edges it cuts are hard, and the encoder
// rings a few pixels past them.
export const cameraInset = 4;

// The channel mark (brand/Logo) on every frame of every episode, in one place
// so a looping short's last frame still matches its first: the caption band's
// bottom-left corner, below any one-line caption and outside the picture.
const markSize = 60;
export const channelMark = {
  size: markSize,
  left: content.left,
  top: zone.caption.bottom - markSize,
  opacity: 0.5,
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
  // Audible onsets: speech (speechDb, per 10 ms) within lookbackMs of a dip
  // to dipDb, dated where the rise out of the dip begins (a voiced stop can
  // murmur under speechDb for ~80 ms first). Checked for words words.json
  // puts at least wordGap s after the previous word's end (the aligner's
  // ends run up to ~0.16 s early).
  onset: { dipDb: -55, speechDb: -35, lookbackMs: 150, wordGap: 0.25 },
  tailSilenceDb: -50, // the render's last 100 ms must be quieter, or the audio was cut off
  inkLevel: 10, // gray levels above the background that count as ink
  changeLevel: 16, // a pixel changed by more than this...
  changePixels: 100, // ...in more visual-zone pixels than this is a visible change
  loopMaxPixels: 500, // visual-zone pixels allowed to differ (by changeLevel) between the last and first frame
  labelOwnership: 2.5, // an edge label's gap to any other element's line, at least this many times its gap to its own edge
  captionLateFrames: 3, // a caption's first visible frame after its cue frame
  readableFrames: 30, // names and labels fully visible at least this long (warn under)
  cueFrames: 5, // a cue after a beat's first word to the first visible change (warn over)
  blankFrames: 3, // frames in a row with an empty visual zone (warn over)
  delivery: { pixFmt: "yuv420p", colorSpace: "bt709", colorRange: "tv", audioRate: 48000 },
} as const;
