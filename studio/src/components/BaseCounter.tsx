import React from "react";
import { AbsoluteFill } from "remotion";
import { Action, bump, ElementTimeline, lerp, mix, phase, rawProgress, Scene } from "../storyboard/timeline";
import { color, counter, duration, stroke, VIDEO } from "../style/theme";
import { countValue, digitsOf, only01, runValues } from "./bases";
import { pointsAttr, roundedRectPoints } from "./geometry";
import { InkLine, InkTex, useInk, useTexInk } from "./InkText";
import { Lamp } from "./lamp";
import { Rel } from "./measure";
import { lifecycle, Polyline, Svg } from "./shapes";

// One number, and the same number written in several bases, row under row.
// Each base row has a lamp at its left end that is lit exactly when the row
// has only 0s and 1s, and a lit row's box lights with it. Every value shown
// is a real number with its real digits, so no lamp is lit by hand. Spec:
// storyboard.json → components → BaseCounter.

type Decimal = { y: number; label: string; labelX: number; size: number; ones: number };
type RowStyle = {
  box: [number, number];
  height: number;
  radius: number;
  lampX: number;
  lampR: number;
  labelX: number;
  label: string; // a row's name, "{base}" standing for its base
  size: number;
  ones: number; // the ones column's center
};
type Props = { value: number; decimal: Decimal; rowStyle: RowStyle };

// A digit's advance, of its TeX size: KaTeX_Main's digits are 0.5 em wide at
// 1.21 em per TeX px, so equal digits stack in columns.
const DIGIT_ADVANCE = 0.605;

// The decimal row's key wherever rows are named by base.
const DECIMAL = 10;

type Row = { base: number; y: number; shown: number; since: number };
// A step (roll) or set (fade) under way, or its lamps still following it.
type Change = { kind: "roll" | "fade"; from: number; t: number; lamps: number; since: number };

export type CounterState = {
  appear: number;
  out: number;
  value: number;
  change: Change | null;
  rows: Row[];
  lamps: number; // dark lamps shown
  colored: number; // digits of 2 or more turned red
  power: { lamp: number; box: number }; // lamps live
  lit: (base: number) => number; // a row's lamp, 0..1, once live
  lampPulse: (base: number) => number;
  digitPulse: (base: number, digit: number) => number;
};

const valueActions = new Set(["step", "set", "run", "count"]);

export const counterState = (el: ElementTimeline, scene: Scene): CounterState => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  const fast = duration.fast * VIDEO.fps;
  let value = p.value;
  let change: Change | null = null;
  const rows: Row[] = [];
  let lamps = 0;
  let colored = 0;
  const power = { lamp: 0, box: 0 };
  const lampPulses: { rows?: number[]; b: number }[] = [];
  const digitPulses: { rows?: number[]; red: boolean; b: number }[] = [];
  const rowOf = (base: number, a: Action) => {
    const r = rows.find((r) => r.base === base);
    if (!r) throw new Error(`BaseCounter ${el.spec.id}: ${a.action} on base ${base}, which has no row yet`);
    return r;
  };

  const { appear, out } = lifecycle(el, frame, (a) => {
    const q = a.params;
    const t = phase(a, frame);
    if (valueActions.has(a.action)) {
      const before = value;
      const i = frame - a.from;
      change = null;
      if (a.action === "step" || a.action === "set") {
        value = q.to;
        // Lamps follow the new digits from halfway through.
        const lampT = Math.min(1, Math.max(0, (frame - (a.from + a.to) / 2) / fast));
        if (rawProgress(a, frame) < 1 || lampT < 1) change = { kind: a.action === "step" ? "roll" : "fade", from: before, t, lamps: lampT, since: a.from };
      } else if (a.action === "run") {
        const frames = a.to - a.from;
        const list = runValues(q.from, q.to, frames, a.ease, rows.map((r) => r.base), counter.flicker);
        value = i < frames ? list[i] : q.to;
      } else value = countValue(before, q.stops, a.to - a.from, i);
      return;
    }
    switch (a.action) {
      case "addRow":
        if (rows.some((r) => r.base === q.base)) throw new Error(`BaseCounter ${el.spec.id}: base ${q.base} added twice`);
        rows.push({ base: q.base, y: q.y, shown: t, since: a.from });
        break;
      case "moveRow": {
        const r = rowOf(q.base, a);
        r.y = lerp(r.y, q.y, t);
        break;
      }
      case "lamps":
        lamps = t;
        break;
      case "color":
        colored = t;
        break;
      case "power":
        // Lamp first, then the box.
        power.lamp = phase(a, frame, 0, 0.6);
        power.box = phase(a, frame, 0.4, 1);
        break;
      case "pulse":
        if (q.part === "lamps") lampPulses.push({ rows: q.rows, b: bump(a, frame) });
        else if (q.part === "digits") {
          if (q.which !== "red" && q.which !== "all") throw new Error(`BaseCounter ${el.spec.id}: pulse digits which must be red or all`);
          digitPulses.push({ rows: q.rows, red: q.which === "red", b: bump(a, frame) });
        } else throw new Error(`BaseCounter ${el.spec.id}: unknown pulse part ${q.part}`);
        break;
      default:
        throw new Error(`BaseCounter ${el.spec.id}: unknown action ${a.action}`);
    }
  });

  // Set inside the callback, where TypeScript's narrowing doesn't look.
  const ch = change as Change | null;
  return {
    appear,
    out,
    value,
    change: ch,
    rows,
    lamps,
    colored,
    power,
    lit: (base) => {
      const now = only01(value, base) ? 1 : 0;
      const row = rows.find((r) => r.base === base);
      // A row added since the change began never showed the old value.
      if (!ch || (row && row.since >= ch.since)) return now;
      return lerp(only01(ch.from, base) ? 1 : 0, now, ch.lamps);
    },
    lampPulse: (base) => Math.max(0, ...lampPulses.filter((l) => !l.rows || l.rows.includes(base)).map((l) => l.b)),
    digitPulse: (base, digit) =>
      Math.max(0, ...digitPulses.filter((d) => (!d.rows || d.rows.includes(base)) && (!d.red || digit >= 2)).map((d) => d.b)),
  };
};

const counterOf = (scene: Scene, id: string) => scene.state(id, "BaseCounter") as CounterState;

type Glyph = { key: string; d: number; x: number; y: number; opacity: number };

// A row's digits, right-aligned on `ones` in columns `pitch` apart. While a
// step rolls, each column that changes rolls upward: the old digit rises out
// and fades as the new one rises into place; a set crossfades in place.
const glyphs = (now: number[], old: number[] | null, change: Change | null, ones: number, pitch: number, y: number): Glyph[] => {
  const out: Glyph[] = [];
  const columns = Math.max(now.length, old?.length ?? 0);
  for (let k = 0; k < columns; k++) {
    const x = ones - k * pitch;
    const n = now[now.length - 1 - k];
    const o = old?.[old.length - 1 - k];
    if (!change || !old || o === n) {
      if (n !== undefined) out.push({ key: `${k}`, d: n, x, y, opacity: 1 });
      continue;
    }
    const { t } = change;
    const rise = change.kind === "roll" ? counter.roll : 0;
    if (o !== undefined) out.push({ key: `${k}o${o}`, d: o, x, y: y - rise * t, opacity: 1 - t });
    if (n !== undefined) out.push({ key: `${k}n${n}`, d: n, x, y: y + rise * (1 - t), opacity: t });
  }
  return out;
};

export const BaseCounter: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const s = counterOf(scene, el.spec.id);
  const shown = s.out > 0 && (s.appear > 0 || s.rows.length > 0);
  const name = (base: number) => p.rowStyle.label.replace("{base}", String(base));
  const names = shown ? [p.decimal.label, ...s.rows.map((r) => name(r.base))] : [];
  const allDigits = Array.from({ length: 10 }, (_, d) => String(d));
  const labels = useInk(`counter ${el.spec.id} names`, names, counter.name);
  const big = useTexInk(`counter ${el.spec.id} decimal`, shown ? allDigits : [], p.decimal.size);
  const small = useTexInk(`counter ${el.spec.id} digits`, shown ? allDigits : [], p.rowStyle.size);
  if (!shown) return null;
  const measuring = [...labels.measuring, ...big.measuring, ...small.measuring];
  if (measuring.length) return <AbsoluteFill>{measuring}</AbsoluteFill>;

  const rs = p.rowStyle;
  const [x0, x1] = rs.box;
  const half = rs.height / 2;
  const old = (base: number, since: number) => (s.change && since < s.change.since ? digitsOf(s.change.from, base) : null);
  const textOf = (base: number, d: number) => (base === DECIMAL || d < 2 ? color.text : mix(color.text, color.red, s.colored));
  // A pulsed digit grows about its center, but never closer than digitGap
  // to its neighbours, and its color lifts toward text.
  const digit = (base: number, g: Glyph, size: number, ink: (t: string) => Rel, opacity: number) => {
    const i = ink(String(g.d));
    const pitch = DIGIT_ADVANCE * size;
    const grow = Math.max(1, Math.min(counter.digitPulse, (pitch - counter.digitGap) / (i.r - i.l)));
    const pulse = s.digitPulse(base, g.d);
    return (
      <InkTex
        key={`${base}-${g.key}`}
        tex={String(g.d)}
        ink={i}
        fontSize={size}
        x={g.x}
        y={g.y}
        color={mix(textOf(base, g.d), color.text, counter.digitLift * pulse)}
        opacity={g.opacity * opacity}
        scale={lerp(1, grow, pulse)}
        kind="number"
      />
    );
  };
  const label = (text: string, x: number, y: number, opacity: number) => {
    const i = labels.ink(text);
    return (
      <InkLine
        key={text}
        text={text}
        ink={i}
        x={x + (i.r - i.l) / 2}
        y={y}
        color={color.text}
        opacity={opacity}
        fontSize={counter.name}
        kind="name"
      />
    );
  };

  const d = p.decimal;
  return (
    <AbsoluteFill style={{ opacity: s.out }}>
      <Svg>
        {s.rows.map((r) => {
          const lamp = s.lit(r.base) * s.power.lamp;
          const box = s.lit(r.base) * s.power.box;
          const ring = roundedRectPoints([x0, r.y - half, x1, r.y + half], rs.radius);
          return (
            <g key={r.base} opacity={r.shown}>
              {box > 0 ? <polygon points={pointsAttr(ring)} fill={color.yellow} fillOpacity={counter.band * box} /> : null}
              <Polyline pts={ring} color={mix(color.muted, color.yellow, box)} width={stroke.line} closed />
              <Lamp
                at={[rs.lampX, r.y]}
                r={rs.lampR}
                lit={lamp}
                scale={lerp(1, counter.lampPulse, s.lampPulse(r.base))}
                opacity={s.lamps}
              />
            </g>
          );
        })}
      </Svg>
      {s.appear > 0 ? label(d.label, d.labelX, d.y, s.appear) : null}
      {s.appear > 0
        ? glyphs(digitsOf(s.value, DECIMAL), old(DECIMAL, -Infinity), s.change, d.ones, DIGIT_ADVANCE * d.size, d.y).map((g) =>
            digit(DECIMAL, g, d.size, big.ink, s.appear),
          )
        : null}
      {s.rows.map((r) => label(name(r.base), rs.labelX, r.y, r.shown))}
      {s.rows.flatMap((r) =>
        glyphs(digitsOf(s.value, r.base), old(r.base, r.since), s.change, rs.ones, DIGIT_ADVANCE * rs.size, r.y).map((g) =>
          digit(r.base, g, rs.size, small.ink, r.shown),
        ),
      )}
    </AbsoluteFill>
  );
};
