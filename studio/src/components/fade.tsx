import React from "react";
import { lerp } from "../storyboard/timeline";
import { hotel } from "../style/theme";
import { dist, lerpPt, Pt } from "./geometry";
import { Polyline } from "./shapes";

// An endless row fading out to the right (Hotel, RoomArrows, NumberRow): drawn
// at full opacity left of x0, falling linearly to 0 at x1, nothing past x1.
// The fade is applied per drawn piece, each at the opacity of its x, so the
// probe sees it; null is no fade.
export type Fade = [x0: number, x1: number] | null;

export const fadeAt = (fade: Fade, x: number) =>
  !fade ? 1 : x <= fade[0] ? 1 : x >= fade[1] ? 0 : (fade[1] - x) / (fade[1] - fade[0]);

export const lerpFade = (a: Fade, b: Fade, t: number): Fade =>
  a && b ? [lerp(a[0], b[0], t), lerp(a[1], b[1], t)] : t < 1 ? a : b;

// Clips what an element draws at the fade's end (text and fills that straddle it).
export const fadeClip = (fade: Fade, width: number) => (fade ? `inset(0px ${width - fade[1]}px 0px 0px)` : undefined);

const same = (a: Pt, b: Pt) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;

// A polyline as runs at one opacity each: whole left of x0, cut into pieces
// at most hotel.fadeStep long where it fades (opacity in 1/64 steps, so a
// run along a wall stays one), and cut off at x1.
export const fadeRuns = (pts: Pt[], fade: Fade): { pts: Pt[]; opacity: number }[] => {
  if (!fade) return pts.length > 1 ? [{ pts, opacity: 1 }] : [];
  const [x0, x1] = fade;
  const runs: { pts: Pt[]; opacity: number }[] = [];
  let last: Pt | null = null;
  const piece = (a: Pt, b: Pt) => {
    const o = Math.round(fadeAt(fade, (a[0] + b[0]) / 2) * 64) / 64;
    const run = runs[runs.length - 1];
    if (o > 0 && run && last && run.opacity === o && same(last, a)) run.pts.push(b);
    else if (o > 0) runs.push({ pts: [a, b], opacity: o });
    last = o > 0 ? b : null;
  };
  for (let i = 1; i < pts.length; i++) {
    let [a, b] = [pts[i - 1], pts[i]];
    if (a[0] >= x1 && b[0] >= x1) {
      last = null;
      continue;
    }
    if (a[0] > x1) a = lerpPt(a, b, (a[0] - x1) / (a[0] - b[0]));
    if (b[0] > x1) b = lerpPt(a, b, (x1 - a[0]) / (b[0] - a[0]));
    const ts = (a[0] - x0) * (b[0] - x0) < 0 ? [0, (x0 - a[0]) / (b[0] - a[0]), 1] : [0, 1];
    for (let j = 1; j < ts.length; j++) {
      const p = lerpPt(a, b, ts[j - 1]);
      const q = lerpPt(a, b, ts[j]);
      const n = Math.max(p[0], q[0]) > x0 ? Math.max(1, Math.ceil(dist(p, q) / hotel.fadeStep)) : 1;
      for (let k = 0; k < n; k++) piece(lerpPt(p, q, k / n), lerpPt(p, q, (k + 1) / n));
    }
  }
  return runs;
};

export const FadedPolyline: React.FC<{ pts: Pt[]; fade: Fade; color: string; width: number; opacity?: number }> = ({
  pts,
  fade,
  color,
  width,
  opacity = 1,
}) =>
  opacity > 0 ? (
    <>
      {fadeRuns(pts, fade).map((r, i) => (
        <Polyline key={i} pts={r.pts} color={color} width={width} opacity={r.opacity * opacity} />
      ))}
    </>
  ) : null;
