import { angleTo, arcPoints, polar, Pt } from "./geometry";

// Geometry Person and Hand share: the open hand's outline, capsules for
// limbs, and the cut that turns a figure low in the frame into a bust.

// A quadratic curve from a through control c to b, as points.
const quad = (a: Pt, c: Pt, b: Pt, n = 8): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const [u, v, w] = [(1 - t) ** 2, 2 * t * (1 - t), t * t];
    return [u * a[0] + v * c[0] + w * b[0], u * a[1] + v * c[1] + w * b[1]];
  });

// An open hand, fingers up, its thumb out on the -x side: a right hand seen
// from its back is the same outline as a left hand seen from its palm. In a
// box 0.78 wide and 1 tall centered on 0 (fingertips at -0.5, the wrist's end
// at 0.5). `thumb` is the outline's index range from the thumb's outer base
// to the web; `wrist` is the wrist's center; `palmLines` three creases.
export type HandShape = { outline: Pt[]; thumb: [number, number]; wrist: Pt; palmLines: Pt[][] };

const buildHand = (): HandShape => {
  const pts: Pt[] = [];
  // Wrist, then the heel of the thumb up to its outer base.
  pts.push([-0.03, 0.5], [-0.03, 0.38]);
  const tip: Pt = [-0.31, -0.08];
  const base: Pt = [-0.07, 0.2];
  const tr = 0.075;
  const deg = angleTo(base, tip);
  pts.push(...quad([-0.03, 0.38], [-0.12, 0.36], polar(base, tr, deg + 90)).slice(1));
  const thumbFrom = pts.length - 1;
  // The thumb: out along its outer edge, round its tip, back to the web at
  // the index finger's side.
  pts.push(...arcPoints(tip, tr, deg + 90, deg - 90));
  const inner = polar(tip, tr, deg - 90);
  const [ux, uy] = [Math.cos(((deg + 180) * Math.PI) / 180), -Math.sin(((deg + 180) * Math.PI) / 180)];
  const t = (-0.12 - inner[0]) / ux;
  pts.push([-0.12, inner[1] + uy * t]);
  const thumbTo = pts.length - 1;
  // Four fingers, index to little: [left edge, top], each about as long as
  // the palm is tall.
  const fingers: [number, number][] = [
    [-0.12, -0.44],
    [0.01, -0.5],
    [0.14, -0.47],
    [0.27, -0.35],
  ];
  const fw = 0.11;
  const valley = -0.13;
  fingers.forEach(([x, top], i) => {
    const fr = fw / 2;
    pts.push([x, top + fr], ...arcPoints([x + fr, top + fr], fr, 180, 0));
    if (i < fingers.length - 1) {
      const gap = fingers[i + 1][0] - (x + fw);
      pts.push([x + fw, valley], ...arcPoints([x + fw + gap / 2, valley], gap / 2, 180, 360).slice(1, -1));
    }
  });
  // Down the palm's outer edge, round its corner, into the wrist.
  pts.push([0.38, 0.2], ...arcPoints([0.28, 0.2], 0.1, 0, -90).slice(1), [0.26, 0.33], [0.26, 0.5]);
  const palmLines = [
    quad([0.36, -0.03], [0.2, 0.03], [0.02, -0.05]),
    quad([-0.1, 0.04], [0.08, 0.06], [0.28, 0.14]),
    quad([-0.08, 0.03], [-0.04, 0.22], [0.08, 0.28]),
  ];
  // Fit the box exactly, so `at` centers the hand's ink.
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const fit = ([x, y]: Pt): Pt => [((x - (x0 + x1) / 2) * 0.78) / (x1 - x0), (y - (y0 + y1) / 2) / (y1 - y0)];
  return {
    outline: pts.map(fit),
    thumb: [thumbFrom, thumbTo],
    wrist: fit([0.115, 0.44]),
    palmLines: palmLines.map((l) => l.map(fit)),
  };
};

export const hand = buildHand();

// A thick segment from a to b, its ends round unless asked flat.
export const capsule = (a: Pt, b: Pt, rad: number, round: [boolean, boolean] = [true, true]): Pt[] => {
  const deg = angleTo(a, b);
  const end = (c: Pt, from: number, isRound: boolean) =>
    isRound ? arcPoints(c, rad, from, from + 180) : [polar(c, rad, from), polar(c, rad, from + 180)];
  return [...end(b, deg - 90, round[1]), ...end(a, deg + 90, round[0])];
};

// The part of a polygon on or above the horizontal line y = cut.
export const clipAbove = (pts: Pt[], cut: number): Pt[] => {
  const out: Pt[] = [];
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length];
    if (a[1] <= cut) out.push(a);
    if (a[1] <= cut !== b[1] <= cut) out.push([a[0] + ((b[0] - a[0]) * (cut - a[1])) / (b[1] - a[1]), cut]);
  });
  return out;
};

// A ring of points ending where it starts, as Polyline's `closed` wants it.
export const ring = (pts: Pt[]) => [...pts, pts[0]];

// A clipped polygon's outline without its edges along the cut: one closed
// ring if nothing was cut, else the open runs between the cuts.
export const outlineRuns = (pts: Pt[], cut: number): { pts: Pt[]; closed: boolean }[] => {
  const n = pts.length;
  const onCut = (p: Pt) => Math.abs(p[1] - cut) < 1e-6;
  const along = (i: number) => onCut(pts[i]) && onCut(pts[(i + 1) % n]);
  const first = pts.findIndex((_, i) => along(i));
  if (first < 0) return [{ pts: ring(pts), closed: true }];
  const runs: { pts: Pt[]; closed: boolean }[] = [];
  let run: Pt[] = [];
  for (let k = 1; k <= n; k++) {
    const i = (first + k) % n;
    if (along(i)) {
      if (run.length > 1) runs.push({ pts: run, closed: false });
      run = [];
    } else {
      if (!run.length) run.push(pts[i]);
      run.push(pts[(i + 1) % n]);
    }
  }
  if (run.length > 1) runs.push({ pts: run, closed: false });
  return runs;
};
