import { CIE1931, CONES } from "./spectra";

// Light as the eye and the screen see it, for every component that draws
// light: a light is a list of single wavelengths with their powers. Its cone
// responses (the bars, the dots on the curves) and its screen color (the
// band, the chips, the ring) are both computed from the tabulated spectra in
// spectra.ts, never from each other (painting the bars red, green and blue
// and adding them gives the wrong color).

export type Light = [nm: number, power: number][];
export type Cone = "L" | "M" | "S";
export const CONE_INDEX: Record<Cone, number> = { L: 0, M: 1, S: 2 };
type Vec3 = [number, number, number];

// A table's row at nm, linear between its 5 nm rows; 0 outside it.
const sample = (table: typeof CONES, nm: number): Vec3 => {
  const first = table[0][0];
  const i = Math.floor((nm - first) / 5);
  if (i < 0 || i >= table.length || (i === table.length - 1 && nm > table[i][0])) return [0, 0, 0];
  const a = table[i];
  const b = table[Math.min(i + 1, table.length - 1)];
  const t = b === a ? 0 : (nm - a[0]) / 5;
  return [1, 2, 3].map((k) => a[k] + (b[k] - a[k]) * t) as Vec3;
};

const sum = (light: Light, table: typeof CONES): Vec3 =>
  light.reduce<Vec3>(
    (acc, [nm, power]) => {
      const v = sample(table, nm);
      return [acc[0] + power * v[0], acc[1] + power * v[1], acc[2] + power * v[2]];
    },
    [0, 0, 0],
  );

// L, M, S responses, each cone's peak response = 1.
export const coneResponse = (light: Light) => sum(light, CONES);

// One cone's response to a single wavelength at power 1 (a curve's height).
export const coneAt = (cone: Cone, nm: number) => sample(CONES, nm)[CONE_INDEX[cone]];

// The bars: each response over the largest, so the tallest is 1 whatever
// the brightness. No light, no bars.
export const coneRatios = (light: Light): Vec3 => {
  const v = coneResponse(light);
  const top = Math.max(...v);
  return top > 0 ? (v.map((x) => x / top) as Vec3) : [0, 0, 0];
};

// sRGB from its definition: BT.709 primaries and D65 white in CIE 1931 xy
// (as verify.py's to_rgb derives it, not a rounded published matrix).
const PRIMARIES: [number, number][] = [
  [0.64, 0.33],
  [0.3, 0.6],
  [0.15, 0.06],
];
const WHITE: [number, number] = [0.3127, 0.329];
const xyzOf = ([x, y]: [number, number]): Vec3 => [x / y, 1, (1 - x - y) / y];

const det = (m: number[][]) =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
  m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
  m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

// Cramer's rule for m·x = v.
const solve = (m: number[][], v: number[]): Vec3 => {
  const d = det(m);
  return [0, 1, 2].map((k) => det(m.map((row, r) => row.map((x, c) => (c === k ? v[r] : x)))) / d) as Vec3;
};

const columns = PRIMARIES.map(xyzOf);
const gain = solve(
  [0, 1, 2].map((r) => columns.map((col) => col[r])),
  xyzOf(WHITE),
);
const RGB_TO_XYZ = [0, 1, 2].map((r) => columns.map((col, c) => col[r] * gain[c]));
const toLinearRgb = (xyz: Vec3) => solve(RGB_TO_XYZ, xyz);

const encode = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

// A light's screen color as encoded sRGB, 0..1 per channel: CIE 1931 XYZ →
// linear sRGB → negative channels clipped (no single wavelength is inside
// sRGB; clipping, not adding white, keeps the red end red) → scaled so the
// largest channel is 1 → encoded. Black for no light.
export const screenRgb = (light: Light): Vec3 => {
  const rgb = toLinearRgb(sum(light, CIE1931)).map((v) => Math.max(v, 0));
  const top = Math.max(...rgb);
  return top > 0 ? (rgb.map((v) => encode(v / top)) as Vec3) : [0, 0, 0];
};

export const hex = (rgb: Vec3) =>
  `#${rgb.map((v) => Math.round(Math.min(Math.max(v, 0), 1) * 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;

export const screenColor = (light: Light) => hex(screenRgb(light));

// HSV hue in degrees, 0 ≤ hue < 360 (#FF00FF is 300).
export const hue = ([r, g, b]: Vec3) => {
  const hi = Math.max(r, g, b);
  const lo = Math.min(r, g, b);
  if (hi === lo) return 0;
  const h = hi === r ? ((g - b) / (hi - lo) + 6) % 6 : hi === g ? (b - r) / (hi - lo) + 2 : (r - g) / (hi - lo) + 4;
  return 60 * h;
};

// The mixture of a short and a long light whose screen color has the given
// hue, between the short light's own hue and the long light's (the purples
// that close the color wheel, going through magenta). Hue rises with the
// long light's share, so a bisection on that share finds it.
export const purpleMix = (short: number, long: number, target: number): Light => {
  // Hue measured upward from the short light's, past 360 to the long light's.
  const unwrapped = (light: Light) => {
    const h = hue(screenRgb(light));
    return h < 180 ? h + 360 : h;
  };
  let [lo, hi] = [0, 1];
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (unwrapped([[short, 1 - mid], [long, mid]]) < target) lo = mid;
    else hi = mid;
  }
  const share = (lo + hi) / 2;
  return [
    [short, 1 - share],
    [long, share],
  ];
};

// The wavelength axis the band, the curves and the light lines share: long
// wavelengths at x0, linear in nm.
export type Axis = { nm: [long: number, short: number]; x0: number; x1: number };
export const axisX = ({ nm: [long, short], x0, x1 }: Axis, nm: number) => x0 + ((long - nm) / (long - short)) * (x1 - x0);
