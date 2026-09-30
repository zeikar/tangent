import { angleTo, arcPoints, polar, Pt } from "./geometry";

// Geometry Person and Hand share: the open hand's and the mitten's outlines,
// capsules, tubes and rounded polygons for bodies, and the cut that turns a
// figure low in the frame into a bust.

// A quadratic curve from a through control c to b, as points.
export const quad = (a: Pt, c: Pt, b: Pt, n = 8): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const [u, v, w] = [(1 - t) ** 2, 2 * t * (1 - t), t * t];
    return [u * a[0] + v * c[0] + w * b[0], u * a[1] + v * c[1] + w * b[1]];
  });

// An open hand, fingers up, its thumb out on the -x side: a right hand seen
// from its back is the same outline as a left hand seen from its palm. In a
// box 0.78 wide and 1 tall centered on 0 (fingertips at -0.5, the wrist's end
// at 0.5). `thumb` is the outline's index range from the thumb's outer base
// to the web; `wrist` is the wrist's center; `palmLines` the creases a palm
// shows.
export type HandShape = { outline: Pt[]; thumb: [number, number]; wrist: Pt; palmLines: Pt[][] };

// From the wrist's left side: the heel of the thumb, the thumb (out along its
// outer edge, round its tip, back along its inner edge) to the web at x = web.
// Returns the outline's index range of the thumb.
const thumbRun = (pts: Pt[], o: { heel: Pt; tip: Pt; base: Pt; r: number; web: number }): [number, number] => {
  const deg = angleTo(o.base, o.tip);
  pts.push(...quad(pts[pts.length - 1], o.heel, polar(o.base, o.r, deg + 90)).slice(1));
  const from = pts.length - 1;
  pts.push(...arcPoints(o.tip, o.r, deg + 90, deg - 90));
  const inner = polar(o.tip, o.r, deg - 90);
  const [ux, uy] = [Math.cos(((deg + 180) * Math.PI) / 180), -Math.sin(((deg + 180) * Math.PI) / 180)];
  pts.push([o.web, inner[1] + (uy * (o.web - inner[0])) / ux]);
  return [from, pts.length - 1];
};

// Fit a hand drawn in rough units into the box exactly, so `at` centers its ink.
const fitHand = (pts: Pt[], thumb: [number, number], wrist: Pt, palmLines: Pt[][]): HandShape => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const fit = ([x, y]: Pt): Pt => [((x - (x0 + x1) / 2) * 0.78) / (x1 - x0), (y - (y0 + y1) / 2) / (y1 - y0)];
  return { outline: pts.map(fit), thumb, wrist: fit(wrist), palmLines: palmLines.map((l) => l.map(fit)) };
};

const buildHand = (): HandShape => {
  const pts: Pt[] = [
    [-0.03, 0.5],
    [-0.03, 0.38],
  ];
  const thumb = thumbRun(pts, { heel: [-0.12, 0.36], tip: [-0.31, -0.08], base: [-0.07, 0.2], r: 0.075, web: -0.12 });
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
  return fitHand(pts, thumb, [0.115, 0.44], [
    quad([0.36, -0.03], [0.2, 0.03], [0.02, -0.05]),
    quad([-0.1, 0.04], [0.08, 0.06], [0.28, 0.14]),
    quad([-0.08, 0.03], [-0.04, 0.22], [0.08, 0.28]),
  ]);
};

// A mitten: the same hand with its fingers in one rounded piece and a
// chunkier thumb; its palm shows two creases.
const buildMitten = (): HandShape => {
  const pts: Pt[] = [
    [-0.02, 0.5],
    [-0.02, 0.38],
  ];
  const thumb = thumbRun(pts, { heel: [-0.12, 0.37], tip: [-0.3, -0.05], base: [-0.05, 0.19], r: 0.1, web: -0.1 });
  pts.push(...arcPoints([0.145, -0.245], 0.245, 180, 0), [0.39, 0.2], ...arcPoints([0.29, 0.2], 0.1, 0, -90).slice(1), [0.26, 0.33], [0.26, 0.5]);
  return fitHand(pts, thumb, [0.12, 0.44], [quad([0.34, 0.0], [0.19, 0.06], [0.03, -0.01]), quad([-0.06, 0.06], [-0.03, 0.21], [0.07, 0.28])]);
};

export const hand = buildHand();
export const mitten = buildMitten();

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

// A polygon with its corners rounded (a radius per corner, shrunk where an
// edge is too short for it).
export const roundCorners = (pts: Pt[], radius: number[]): Pt[] =>
  pts.flatMap((b, i) => {
    const a = pts[(i + pts.length - 1) % pts.length];
    const c = pts[(i + 1) % pts.length];
    const [l1, l2] = [Math.hypot(a[0] - b[0], a[1] - b[1]), Math.hypot(c[0] - b[0], c[1] - b[1])];
    const v1: Pt = [(a[0] - b[0]) / l1, (a[1] - b[1]) / l1];
    const v2: Pt = [(c[0] - b[0]) / l2, (c[1] - b[1]) / l2];
    const angle = Math.acos(Math.max(-1, Math.min(1, v1[0] * v2[0] + v1[1] * v2[1])));
    const t = Math.min(radius[i] / Math.tan(angle / 2), l1 / 2, l2 / 2);
    const rad = t * Math.tan(angle / 2);
    if (rad <= 0) return [b];
    // The arc's center is on the bisector, rad / sin(angle / 2) from the corner.
    const bis = Math.hypot(v1[0] + v2[0], v1[1] + v2[1]);
    const d = rad / Math.sin(angle / 2);
    const o: Pt = [b[0] + ((v1[0] + v2[0]) / bis) * d, b[1] + ((v1[1] + v2[1]) / bis) * d];
    const start = Math.atan2(b[1] + v1[1] * t - o[1], b[0] + v1[0] * t - o[0]);
    let end = Math.atan2(b[1] + v2[1] * t - o[1], b[0] + v2[0] * t - o[0]);
    if (end - start > Math.PI) end -= 2 * Math.PI;
    if (start - end > Math.PI) end += 2 * Math.PI;
    const steps = Math.max(2, Math.ceil(Math.abs(end - start) / (Math.PI / 18)));
    return Array.from({ length: steps + 1 }, (_, k): Pt => {
      const u = start + ((end - start) * k) / steps;
      return [o[0] + rad * Math.cos(u), o[1] + rad * Math.sin(u)];
    });
  });

// A soft tube along a path: the path offset both ways by its radius (from
// rad at the start to rad2 at the end), round at the ends unless asked flat.
export const tube = (path: Pt[], rad: number, round: [boolean, boolean] = [true, true], rad2 = rad): Pt[] => {
  const last = path.length - 1;
  const radAt = (i: number) => rad + ((rad2 - rad) * i) / last;
  const normal = (i: number): Pt => {
    const [a, b] = [path[Math.max(0, i - 1)], path[Math.min(last, i + 1)]];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
  };
  const side = (k: 1 | -1) => path.map((p, i): Pt => [p[0] + normal(i)[0] * radAt(i) * k, p[1] + normal(i)[1] * radAt(i) * k]);
  const cap = (at: Pt, r: number, from: number, isRound: boolean) => (isRound ? arcPoints(at, r, from, from + 180).slice(1, -1) : []);
  const endCap = cap(path[last], rad2, angleTo(path[last - 1], path[last]) - 90, round[1]);
  const startCap = cap(path[0], rad, angleTo(path[1], path[0]) - 90, round[0]);
  return [...side(1), ...endCap, ...side(-1).reverse(), ...startCap];
};
