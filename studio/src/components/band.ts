import { bump, ElementTimeline, lerp, phase } from "../storyboard/timeline";
import { content, optics } from "../style/theme";
import { lerpPt, Pt } from "./geometry";
import { hex, hue, purpleMix, screenRgb } from "./light";

// The Spectrum's band as numbers: its shape at any frame (straight, curling
// into a ring, bridged, uncurling) and the slices and colors it is drawn
// with. Spec: storyboard.json → components → Spectrum.

export type Box = { center: Pt; w: number; h: number };
export type Props = Box & { nm: [long: number, short: number]; names?: [text: string, nm: number][] };
export type Part = "band" | "redEnd" | "violetEnd" | "bridge";

// The band's shape: its centerline, `len` long, turns through `theta`
// radians around a center below its middle point `mid` (0 is straight).
// u runs along it, 0 at the long end and 1 at the short end; past 1 is the
// ring's gap, which the bridge fills from the short end around to the long
// end. `bridge` lists the filled shares of the gap, [from, to] each.
export type BandState = {
  mid: Pt;
  len: number;
  theta: number;
  h: number;
  names: number; // opacity
  namesUnder: Box; // the straight band the names hang under
  bridge: [number, number][];
  pulse: Record<Part, number>;
};

// Shares of a curl's span: it bends over [0, CURL_BEND] and grows to the
// ring's radius and thickness over [CURL_GROW, 1]. The two overlap, so the
// curl never comes to rest midway, and the growing starts only once the band
// is bent past a half circle, where growing can't push it past the bounds.
// An uncurl mirrors it: it shrinks to its new length over [0,
// UNCURL_SHRINK] and unbends over [UNCURL_UNBEND, 1]; meanwhile its bridge
// opens at its middle and draws back into the band's two ends over [0,
// UNCURL_BRIDGE], so it never shows as a piece apart from the ring.
const CURL_BEND = 0.65;
const CURL_GROW = 0.45;
const UNCURL_SHRINK = 0.55;
const UNCURL_UNBEND = 0.35;
const UNCURL_BRIDGE = 0.3;

// A band partway between a straight band (`from`, `fromLen` long) and a ring
// around `center` turning through `end` radians: bent through b of `end`,
// `len` long. Its middle moves from the straight band's to the ring's top as
// it bends, so at b = 1 it is a ring around `center`, whatever its length.
const bent = (from: Pt, fromLen: number, center: Pt, end: number, b: number, len: number) => ({
  mid: [lerp(from[0], center[0], b), lerp(from[1], center[1] - fromLen / end, b) - (b * (len - fromLen)) / end] as Pt,
  len,
  theta: end * b,
});

const straight = ({ center, w, h }: Box) => ({ mid: center, len: w, theta: 0, h });
const boxOf = (s: { mid: Pt; len: number; h: number }): Box => ({ center: s.mid, w: s.len, h: s.h });
const lerpBox = (a: Box, b: Box, t: number): Box => ({ center: lerpPt(a.center, b.center, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

// The thickness a part of the band is drawn at (a pulse swells it about its
// centerline).
export const swell = (s: BandState, parts: Part[]) => s.h * (1 + (optics.partPulse - 1) * Math.max(0, ...parts.map((p) => s.pulse[p])));
export const thickest = (s: BandState) => swell(s, ["band", "redEnd", "violetEnd", "bridge"]);

// The longest centerline that keeps a bent band's outer corners inside the
// content bounds (less optics.inset): bending at constant length would push
// them past the straight band's ends (and a thicker band further).
const fitted = (s: BandState) => {
  if (s.theta <= 0) return s.len;
  const half = Math.min(s.mid[0] - content.left, content.right - s.mid[0]) - optics.inset;
  const t2 = thickest(s) / 2;
  const reach = s.theta < Math.PI ? half / Math.sin(s.theta / 2) - t2 : half - t2;
  return Math.min(s.len, s.theta * reach);
};

export const bandState = (el: ElementTimeline, frame: number): BandState => {
  const p = el.spec.props as Props;
  let s: BandState = {
    ...straight(p),
    names: p.names ? 1 : 0,
    namesUnder: p,
    bridge: [],
    pulse: { band: 0, redEnd: 0, violetEnd: 0, bridge: 0 },
  };
  for (const a of el.actions) {
    if (frame < a.from) break;
    const t = phase(a, frame);
    const s0 = s;
    switch (a.action) {
      case "moveTo": {
        if (s0.theta > 0) throw new Error(`Spectrum ${el.spec.id}: moveTo needs a straight band`);
        const box = lerpBox(boxOf(s0), a.params as Box, t);
        s = { ...s0, ...straight(box), namesUnder: box, names: lerp(s0.names, a.params.names ? 1 : 0, t) };
        break;
      }
      case "pulse":
        s = { ...s0, pulse: { ...s0.pulse, [a.params.part]: Math.max(s0.pulse[a.params.part as Part], bump(a, frame)) } };
        break;
      case "curl": {
        if (s0.theta > 0) throw new Error(`Spectrum ${el.spec.id}: curl needs a straight band`);
        const end = 2 * Math.PI - (a.params.gap * Math.PI) / 180;
        const grow = phase(a, frame, CURL_GROW, 1);
        const len = lerp(s0.len, a.params.r * end, grow);
        s = {
          ...s0,
          ...bent(s0.mid, s0.len, a.params.center, end, phase(a, frame, 0, CURL_BEND), len),
          h: lerp(s0.h, a.params.band, grow),
          names: s0.names * (1 - phase(a, frame, 0, 1 / 3)),
        };
        break;
      }
      case "bridge":
        s = { ...s0, bridge: [[0, t]] };
        break;
      case "uncurl": {
        if (s0.theta <= 0) throw new Error(`Spectrum ${el.spec.id}: uncurl needs a curled band`);
        const center: Pt = [s0.mid[0], s0.mid[1] + s0.len / s0.theta];
        const unbend = phase(a, frame, UNCURL_UNBEND, 1);
        const len = lerp(s0.len, a.params.w, phase(a, frame, 0, UNCURL_SHRINK));
        // Each half of the bridge keeps to its end of the band.
        const half = (1 - phase(a, frame, 0, UNCURL_BRIDGE)) / 2;
        const bridge =
          half >= 0.5 ? s0.bridge : s0.bridge.flatMap(([b0, b1]): [number, number][] => [[b0, Math.min(b1, half)], [Math.max(b0, 1 - half), b1]]).filter(([b0, b1]) => b1 > b0);
        s = {
          ...s0,
          ...bent(a.params.center, a.params.w, center, s0.theta, 1 - unbend, len),
          h: lerp(s0.h, a.params.h, unbend),
          bridge,
          namesUnder: a.params as Box,
          names: lerp(s0.names, a.params.names ? 1 : 0, phase(a, frame, 2 / 3, 1)),
        };
        break;
      }
      case "appear":
      case "exit":
        break;
      default:
        throw new Error(`Spectrum ${el.spec.id}: unknown action ${a.action}`);
    }
  }
  return { ...s, len: fitted(s) };
};

// A point on the bent band: u along it, `off` px out from its centerline
// (outward is up while it is straight).
export const bandPoint = (s: BandState, u: number, off: number): Pt => {
  if (s.theta <= 0) return [s.mid[0] + (u - 0.5) * s.len, s.mid[1] - off];
  const r = s.len / s.theta;
  const a = Math.PI / 2 + (0.5 - u) * s.theta;
  return [s.mid[0] + (r + off) * Math.cos(a), s.mid[1] + r - (r + off) * Math.sin(a)];
};

// u of a share of the ring's gap, 0 at the short end.
export const gapU = (s: BandState, share: number) => 1 + (share * (2 * Math.PI - s.theta)) / s.theta;

type Slice = { pts: Pt[]; color: string };

// Slices of the bent band from u0 to u1. Each overlaps the next by a little,
// and the end slices reach past their ends when `overlap` says so, so the
// slices' anti-aliased edges never let the background through as seams.
export const slices = (
  s: BandState,
  [u0, u1]: [number, number],
  thickness: (u: number) => number,
  colorAt: (u: number) => string,
  overlap: [boolean, boolean] = [false, false],
): Slice[] => {
  const outer = s.len / s.theta + thickest(s) / 2;
  const span = outer * s.theta * (u1 - u0);
  const n = Math.max(1, Math.ceil(span / optics.slice));
  const du = (u1 - u0) / n;
  const reach = 0.75 / (outer * s.theta); // in u: 0.75 px on the outer edge
  return Array.from({ length: n }, (_, i) => {
    const mid = u0 + du * (i + 0.5);
    const a = u0 + du * i - (i === 0 && overlap[0] ? reach : 0);
    const b = u0 + du * (i + 1) + (i < n - 1 || overlap[1] ? reach : 0);
    const half = thickness(mid) / 2;
    return { pts: [bandPoint(s, a, -half), bandPoint(s, a, half), bandPoint(s, b, half), bandPoint(s, b, -half)], color: colorAt(mid) };
  });
};

// Screen colors by wavelength, cached: a curved band asks for thousands a frame.
const colorCache = new Map<number, string>();
export const nmColor = (nm: number) => {
  const key = Math.round(nm * 100) / 100;
  let c = colorCache.get(key);
  if (!c) colorCache.set(key, (c = hex(screenRgb([[key, 1]]))));
  return c;
};

// The bridge's colors along the gap (share 0 at the short end): the
// mixture of the two end lights whose hue runs from the short end's through
// #FF00FF (300°) at the middle to the long end's.
const purples = new Map<string, [number, number, number][]>();
const PURPLE_STEPS = 1024;
export const purpleAt = ([long, short]: [number, number], share: number) => {
  const key = `${long}-${short}`;
  let table = purples.get(key);
  if (!table) {
    const [from, to] = [hue(screenRgb([[short, 1]])), hue(screenRgb([[long, 1]])) + 360];
    table = Array.from({ length: PURPLE_STEPS + 1 }, (_, i) => {
      const k = i / PURPLE_STEPS;
      const target = k <= 0.5 ? lerp(from, 300, k / 0.5) : lerp(300, to, (k - 0.5) / 0.5);
      return screenRgb(purpleMix(short, long, target));
    });
    purples.set(key, table);
  }
  return table[Math.round(Math.min(Math.max(share, 0), 1) * PURPLE_STEPS)];
};

export const whiten = (rgb: [number, number, number], k: number) => hex(rgb.map((v) => v + (1 - v) * k) as [number, number, number]);
