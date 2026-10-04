// Points in frame pixels and angles in degrees as storyboards give them: 0 is
// 3 o'clock and counterclockwise on screen is positive (screen y points down).

export type Pt = [number, number];

const RAD = Math.PI / 180;

export const polar = ([cx, cy]: Pt, r: number, deg: number): Pt => [cx + r * Math.cos(deg * RAD), cy - r * Math.sin(deg * RAD)];

export const angleTo = ([x0, y0]: Pt, [x1, y1]: Pt) => Math.atan2(y0 - y1, x1 - x0) / RAD;

export const dist = ([x0, y0]: Pt, [x1, y1]: Pt) => Math.hypot(x1 - x0, y1 - y0);

export const lerpPt = ([x0, y0]: Pt, [x1, y1]: Pt, t: number): Pt => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];

export const mod = (x: number, m: number) => ((x % m) + m) % m;

// -180 < result <= 180.
export const wrap180 = (deg: number) => 180 - mod(180 - deg, 360);

// Degrees between samples that keep a polyline within 0.05 px of a circle of
// radius r (curves are drawn as polylines so the probe sees their strokes).
const step = (r: number) => Math.min(10, Math.acos(1 - 0.05 / Math.max(r, 1)) * 2 / RAD);

// Points on the curve at radius(deg) around c, from `from` to `to` degrees
// (counterclockwise when to > from), both ends included.
export const arcPoints = (c: Pt, radius: number | ((deg: number) => number), from: number, to: number): Pt[] => {
  const r = typeof radius === "number" ? () => radius : radius;
  const n = Math.max(1, Math.ceil(Math.abs(to - from) / step(Math.max(r(from), r((from + to) / 2), r(to)))));
  return Array.from({ length: n + 1 }, (_, i) => {
    const deg = from + ((to - from) * i) / n;
    return polar(c, r(deg), deg);
  });
};

// The first `t` share (0..1) of a polyline, by length: a line drawn on.
export const trimPolyline = (pts: Pt[], t: number): Pt[] => {
  if (t >= 1) return pts;
  const lengths = pts.slice(1).map((p, i) => dist(pts[i], p));
  let left = t * lengths.reduce((a, b) => a + b, 0);
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < lengths.length && left > 0; i++) {
    const k = Math.min(1, left / (lengths[i] || 1));
    out.push(lerpPt(pts[i], pts[i + 1], k));
    left -= lengths[i];
  }
  return out;
};

// A rounded rectangle's outline, clockwise from the top edge's left end.
export const roundedRectPoints = ([l, t, r, b]: [number, number, number, number], radius: number): Pt[] => {
  const corner = (c: Pt, from: number) => arcPoints(c, radius, from, from - 90);
  return [
    [l + radius, t],
    ...corner([r - radius, t + radius], 90),
    ...corner([r - radius, b - radius], 0),
    ...corner([l + radius, b - radius], -90),
    ...corner([l + radius, t + radius], 180),
  ];
};

export const pointsAttr = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

// A filled arrowhead: its tip at `tip`, pointing along `deg`, `len` long and as wide.
export const headPoints = (tip: Pt, deg: number, len: number): Pt[] => {
  const back = polar(tip, len, deg + 180);
  return [tip, polar(back, len / 2, deg + 90), polar(back, len / 2, deg - 90)];
};
