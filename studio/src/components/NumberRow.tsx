import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, mix, phase, Scene, themeColor } from "../storyboard/timeline";
import { color, hotel, VIDEO } from "../style/theme";
import { Fade, fadeAt, fadeClip } from "./fade";
import { hotelOf } from "./Hotel";
import { InkTex, useTexInk } from "./InkText";
import { lifecycle } from "./shapes";

// A row of numbers going on to the right (n, or 2n, for n = 1, 2, 3, …),
// fading out like a Hotel. It can grow out of a Hotel's room numbers and fold
// back into them. Spec: storyboard.json → components → NumberRow.

type Props = {
  values: "n" | "2n";
  x0: number; // the first number's ink center
  step: number;
  y: number;
  size: number; // TeX px
  color: string;
  fade: [number, number];
};

// Half a digit's ink height, of its TeX size (KaTeX_Main; measure-tex.mts:
// 36.7 px at 44, 48.3 at 58).
const DIGIT_HALF = 0.417;

export type RowNumber = { n: number; value: number; x: number; y: number; size: number; scale: number; color: string; opacity: number };

export type NumberRowState = {
  fade: Fade;
  count: number;
  // The n-th number at its own place and size, and where it is now; `half` is
  // its ink's half height there, pulses left out.
  rest: (n: number) => { x: number; y: number; half: number };
  live: (n: number) => { x: number; y: number; half: number };
  numbers: RowNumber[]; // drawn this frame
};

export const rowOf = (scene: Scene, id: string) => scene.state(id, "NumberRow") as NumberRowState;

const picks = (which: unknown, value: number) => {
  if (which === undefined || which === "all") return true;
  if (which === "even") return value % 2 === 0;
  if (which === "odd") return value % 2 === 1;
  throw new Error(`NumberRow: which must be all, even or odd, not ${JSON.stringify(which)}`);
};

export const numberRowState = (el: ElementTimeline, scene: Scene): NumberRowState => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  const value = (n: number) => (p.values === "2n" ? 2 * n : n);
  const restX = (n: number) => p.x0 + (n - 1) * p.step;
  const count = Math.ceil((p.fade[1] - p.x0) / p.step);
  const rows = Array.from({ length: count }, (_, i) => ({
    n: i + 1,
    value: value(i + 1),
    x: restX(i + 1),
    y: p.y,
    size: p.size,
    scale: 1,
    color: themeColor(p.color),
    opacity: 1,
    shown: 0, // the appear's or gather's share of its opacity, with the fade
  }));
  const { out } = lifecycle(el, frame, (a) => {
    const q = a.params;
    switch (a.action) {
      case "pulse": {
        const s = lerp(1, hotel.numberPulse, bump(a, frame));
        for (const r of rows) if (picks(q.which, r.value)) r.scale = Math.max(r.scale, s);
        break;
      }
      case "setStyle": {
        const t = phase(a, frame);
        for (const r of rows) {
          if (!picks(q.which, r.value)) continue;
          if (q.color) r.color = mix(r.color, themeColor(q.color), t);
          if (q.opacity !== undefined) r.opacity = lerp(r.opacity, q.opacity, t);
        }
        break;
      }
      case "gather":
        if (p.values !== "n") throw new Error(`NumberRow ${el.spec.id}: only a row of n gathers into a hotel`);
        break;
      default:
        throw new Error(`NumberRow ${el.spec.id}: unknown action ${a.action}`);
    }
  });

  const appear = el.actions.find((a) => a.action === "appear");
  const gather = el.actions.find((a) => a.action === "gather");
  for (const r of rows) {
    r.shown = el.spec.visibleAtStart ? fadeAt(p.fade, r.x) : 0;
    if (appear && frame >= appear.from) {
      const t = phase(appear, frame);
      r.shown = t * fadeAt(p.fade, r.x);
      if (appear.params.from && t < 1) {
        // Out of the hotel's room number of the same value, at its size and place.
        const h = hotelOf(scene, appear.params.from);
        const [sx, sy] = h.numberAt(r.value);
        if (fadeAt(h.fade, sx) > 0) {
          [r.x, r.y, r.size] = [lerp(sx, r.x, t), lerp(sy, r.y, t), lerp(hotel.number, p.size, t)];
          if (p.values === "n") r.shown = fadeAt(p.fade, r.x);
          else {
            // A copy leaving the number it was: faint while it still meets
            // that number's row, then fading in on the way.
            const clear = sy + 2 * DIGIT_HALF * p.size + 2;
            const faint = 0.25 * Math.min(1, t / 0.1);
            r.shown = fadeAt(p.fade, r.x) * (r.y < clear ? faint : lerp(faint, 1, Math.min(1, (r.y - clear) / 40)));
          }
        }
      }
    }
    if (gather && frame >= gather.from) {
      if (frame >= gather.to) {
        r.shown = 0;
        continue;
      }
      // Onto room n's number in the hotel's live geometry: offset from it by
      // the gap at the start, closing as it goes, so it lands centered.
      const t = phase(gather, frame);
      const h = hotelOf(scene, gather.params.into);
      const start = hotelOf(scene.at(gather.from), gather.params.into).numberAt(r.n);
      const [hx, hy] = h.numberAt(r.n);
      [r.x, r.y] = [hx + (1 - t) * (r.x - start[0]), hy + (1 - t) * (r.y - start[1])];
      r.size = lerp(p.size, hotel.number, t);
      r.color = mix(r.color, color.text, t);
      r.shown = lerp(fadeAt(p.fade, r.x), fadeAt(h.fade, r.x), t);
    }
  }
  const half = (size: number) => DIGIT_HALF * size;
  return {
    fade: p.fade,
    count,
    rest: (n) => ({ x: restX(n), y: p.y, half: half(p.size) }),
    live: (n) => {
      const r = rows[n - 1];
      return { x: r.x, y: r.y, half: half(r.size) };
    },
    numbers: rows
      .map(({ shown, opacity, ...r }) => ({ ...r, opacity: shown * opacity * out }))
      .filter((r) => r.opacity > 0),
  };
};

export const NumberRow: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const s = rowOf(scene, el.spec.id);
  const { ink, measuring } = useTexInk(`row ${el.spec.id}`, s.numbers.map((r) => String(r.value)), p.size);
  if (!s.numbers.length) return null;
  if (measuring.length) return <AbsoluteFill>{measuring}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{ clipPath: fadeClip(s.fade, VIDEO.width) }}>
      {s.numbers.map((r) => (
        <InkTex
          key={r.n}
          tex={String(r.value)}
          ink={ink(String(r.value))}
          fontSize={p.size}
          x={r.x}
          y={r.y}
          color={r.color}
          opacity={r.opacity}
          scale={(r.size / p.size) * r.scale}
          kind="number"
        />
      ))}
    </AbsoluteFill>
  );
};
