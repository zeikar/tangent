import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, mix, phase, Scene, themeColor } from "../storyboard/timeline";
import { hotel, mark, stroke, VIDEO } from "../style/theme";
import { Fade, fadeAt, fadeClip, FadedPolyline, lerpFade } from "./fade";
import { arcPoints, lerpPt, Pt, pointsAttr, resample, trimPolyline } from "./geometry";
import { GUEST_HEIGHT, HotelState, hotelOf } from "./Hotel";
import { rowOf } from "./NumberRow";
import { curvedArrowParts, lifecycle, Svg } from "./shapes";

// Arrows showing an assignment between places in a Hotel, from its live
// geometry and fade: a half-ellipse over the roof from room n to room map(n),
// or a straight arrow from newcomer k on the street up into room 2k − 1.
// Arrows from rooms can straighten into pairing lines between two
// NumberRows. Spec: storyboard.json → components → RoomArrows.

type Props = { of: string; from: "rooms" | "street"; map: "n+1" | "2n" | "2k-1"; color: string };

// Points per arrow when an arc straightens into a line.
const MORPH_POINTS = 64;

// Arrow n's path (n = 1, 2, …), tail to tip, for every arrow that starts
// before the hotel ends.
const paths = (p: Props, h: HotelState): Pt[][] => {
  const end = h.finite !== null ? Infinity : h.fade![1];
  const out: Pt[][] = [];
  if (p.from === "street") {
    if (p.map !== "2k-1") throw new Error(`RoomArrows: arrows from the street map 2k-1`);
    for (let k = 1; h.roomX(k) < end; k++) {
      const [x, feet] = h.spotAt({ at: "street", k });
      out.push([
        [x, feet - GUEST_HEIGHT * h.w - hotel.headGap],
        [h.roomX(2 * k - 1), h.floor + hotel.floorGap],
      ]);
    }
    return out;
  }
  const map = p.map === "n+1" ? (n: number) => n + 1 : p.map === "2n" ? (n: number) => 2 * n : null;
  if (!map) throw new Error(`RoomArrows: arrows from rooms map n+1 or 2n`);
  const y = h.roof - hotel.arrowGap;
  const inset = hotel.arrowInset * h.w;
  for (let n = 1; h.finite !== null ? n <= h.finite : h.roomX(n) + inset < end; n++) {
    const m = map(n);
    // Past a finite hotel's last room: its outside spot, the room that isn't there.
    const to = h.finite !== null && m > h.finite ? h.spotAt({ at: "outside" })[0] : h.roomX(m);
    const [a, b] = [h.roomX(n) + inset, to - inset];
    // A half-ellipse over the top, as a polar curve about its center.
    const [rx, ry] = [(b - a) / 2, hotel.arrowRise * (b - a)];
    const r = (deg: number) => {
      const t = (deg * Math.PI) / 180;
      return (rx * ry) / Math.hypot(ry * Math.cos(t), rx * Math.sin(t));
    };
    out.push(arcPoints([(a + b) / 2, y], r, 180, 0));
  }
  return out;
};

export const RoomArrows: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  const base = themeColor(p.color);
  // Per-arrow styles and pulses, in action order; which: a list of n, or all.
  const styles: { which?: number[]; opacity?: number; color?: string; t: number }[] = [];
  const pulses: { which?: number[]; b: number }[] = [];
  let pair: { top: string; bottom: string; t: number } | null = null;
  const { appear, out } = lifecycle(el, frame, (a) => {
    const q = a.params;
    if (a.action === "setStyle") styles.push({ which: q.which, opacity: q.opacity, color: q.color, t: phase(a, frame) });
    else if (a.action === "pulse") pulses.push({ which: q.which, b: bump(a, frame) });
    else if (a.action === "pairTo") {
      if (p.map !== "2n") throw new Error(`RoomArrows ${el.spec.id}: only 2n arrows pair rows`);
      pair = { top: q.top, bottom: q.bottom, t: phase(a, frame) };
    } else throw new Error(`RoomArrows ${el.spec.id}: unknown action ${a.action}`);
  });
  if (appear <= 0 || out <= 0) return null;
  const h = hotelOf(scene, p.of);
  const picked = (which: number[] | undefined, n: number) => !which || which.includes(n);
  const styleOf = (n: number) => {
    let [opacity, c] = [1, base];
    for (const s of styles) {
      if (!picked(s.which, n)) continue;
      if (s.opacity !== undefined) opacity = lerp(opacity, s.opacity, s.t);
      if (s.color) c = mix(c, themeColor(s.color), s.t);
    }
    return { opacity, color: c, pulse: Math.max(0, ...pulses.filter((s) => picked(s.which, n)).map((s) => s.b)) };
  };

  // Paired: each arc straightens into a vertical line between the top row's
  // n-th number and the bottom row's (at their places while it does, then
  // following them), its head shrinking away.
  const paired = pair as { top: string; bottom: string; t: number } | null;
  const top = paired && rowOf(scene, paired.top);
  const bottom = paired && rowOf(scene, paired.bottom);
  const arcs = paired && paired.t >= 1 ? [] : paths(p, h);
  const count = paired && paired.t >= 1 ? top!.count : arcs.length;
  let fade: Fade = h.fade;
  if (paired) fade = lerpFade(h.fade, top!.fade, paired.t);

  const drawn = Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const st = styleOf(n);
    let pts = arcs[i] && trimPolyline(arcs[i], appear);
    let head = mark.head * lerp(1, mark.pulseScale, st.pulse);
    if (paired) {
      const at = paired.t >= 1 ? "live" : "rest";
      const [a, b] = [top![at](n), bottom![at](n)];
      const line: Pt[] = [
        [a.x, a.y + a.half + hotel.pairGap],
        [b.x, b.y - b.half - hotel.pairGap],
      ];
      if (paired.t >= 1) pts = line;
      else {
        const [from, to] = [resample(pts!, MORPH_POINTS), resample(line, MORPH_POINTS)];
        pts = from.map((q, j) => lerpPt(q, to[j], paired.t));
      }
      head *= 1 - paired.t;
    }
    if (!pts || pts.length < 2) return null;
    const width = lerp(stroke.arrow, hotel.arrowPulse, st.pulse);
    const parts = head > 0 ? curvedArrowParts(pts, head) : { line: pts, head: null };
    const tip = pts[pts.length - 1];
    return (
      <g key={n}>
        <FadedPolyline pts={parts.line} fade={fade} color={st.color} width={width} opacity={st.opacity} />
        {parts.head && fadeAt(fade, tip[0]) > 0 ? (
          <polygon points={pointsAttr(parts.head)} fill={st.color} opacity={st.opacity * fadeAt(fade, tip[0])} />
        ) : null}
      </g>
    );
  });
  return (
    <AbsoluteFill style={{ opacity: out, clipPath: fadeClip(fade, VIDEO.width) }}>
      <Svg>{drawn}</Svg>
    </AbsoluteFill>
  );
};
