import React from "react";
import { AbsoluteFill } from "remotion";
import { Action, bump, ElementTimeline, lerp, mix, phase, rawProgress, Scene, themeColor } from "../storyboard/timeline";
import { color, counter, duration, ease, stroke, VIDEO } from "../style/theme";
import { countSlot, countValue, digitsOf, only01, runValues } from "./bases";
import { Pt, roundedRectPoints, trimPolyline } from "./geometry";
import { InkLine, InkTex, useInk, useTexInk } from "./InkText";
import { Rel } from "./measure";
import { lifecycle, Polyline, Svg } from "./shapes";

// One number, and the same number written in several bases, row under row.
// Once marks are live, each base row has a ✓ just right of its digits exactly
// when the row has only 0s and 1s. Every value shown is a real number with
// its real digits, so no ✓ is placed by hand. Spec: storyboard.json →
// components → BaseCounter.

type Decimal = { y: number; label: string; labelX: number; size: number; ones: number };
type RowStyle = {
  box: [number, number];
  height: number;
  radius: number;
  labelX: number;
  label: string; // a row's name, "{base}" standing for its base
  size: number;
  ones: number; // the ones column's center
  markX: number; // the ✓'s center
};
type Props = { value: number; decimal: Decimal; rowStyle: RowStyle };

// A digit's advance, of its TeX size: KaTeX_Main's digits are 0.5 em wide at
// 1.21 em per TeX px, so equal digits stack in columns.
const DIGIT_ADVANCE = 0.605;

// The decimal row's key wherever rows are named by base.
const DECIMAL = 10;

type Row = { base: number; y: number; shown: number; since: number };
// A step (roll) or set (fade) under way.
type Change = { kind: "roll" | "fade"; from: number; t: number; since: number };
// A ✓: how much of its path is drawn, and its opacity (a ✓ that goes fades whole).
type Mark = { draw: number; opacity: number };

export type CounterState = {
  appear: number;
  out: number;
  value: number;
  change: Change | null;
  rows: Row[];
  colored: number; // digits of 2 or more turned red
  mark: (base: number) => Mark;
  markPulse: (base: number) => number;
  // A digit's pulses: how far it grows and turns to a pulse's color (0..1 each), and its blinks' opacity.
  digitPulse: (base: number, digit: number) => { grow: number; tint: { color: string; t: number } | null; opacity: number };
};

const valueActions = new Set(["step", "set", "run", "count"]);

// The value at a frame, the step or set moving it, and how the ✓s treat the
// frame. `marked` is the value whose digits decide them (a step's new value
// from its halfway). On a run's frames and on the numbers a count passes
// between its stops (`between`) they follow the digits at once, fully drawn,
// so a one-frame flicker shows whole. Otherwise a ✓ that comes draws over
// `come` frames (a share of the slot at a count's stop with stops still to
// come) and one that goes fades over `go` (at once at a count's stop: the
// digits passed on the way already took it).
type Shown = { value: number; change: Change | null; marked: number; instant: boolean; between: boolean; come: number; go: number };

const shownAt = (el: ElementTimeline, frame: number): Shown => {
  const fast = duration.fast * VIDEO.fps;
  let value = (el.spec.props as Props).value;
  const settled = { change: null, instant: false, between: false, come: fast, go: fast };
  let shown: Shown = { ...settled, value, marked: value };
  const bases: number[] = [];
  for (const a of el.actions) {
    if (frame < a.from) break;
    const q = a.params;
    if (a.action === "addRow") bases.push(q.base);
    if (!valueActions.has(a.action)) continue;
    const before = value;
    const i = frame - a.from;
    const frames = a.to - a.from;
    if (a.action === "step" || a.action === "set") {
      value = q.to;
      const change: Change | null =
        rawProgress(a, frame) < 1 ? { kind: a.action === "step" ? "roll" : "fade", from: before, t: phase(a, frame), since: a.from } : null;
      shown = { ...settled, value, change, marked: frame >= (a.from + a.to) / 2 ? value : before };
    } else if (a.action === "run") {
      value = i < frames ? runValues(q.from, q.to, frames, a.ease, bases, counter.flicker)[i] : q.to;
      shown = { ...settled, value, marked: value, instant: i < frames };
    } else {
      value = countValue(before, q.stops, frames, i);
      const slot = countSlot(q.stops.length, frames, i);
      const between = i < frames && value !== q.stops[slot.k];
      const more = i < frames && slot.k < q.stops.length - 1;
      shown = { ...settled, value, marked: value, instant: between, between, come: more ? Math.min(fast, counter.markCount * slot.length) : fast, go: 0 };
    }
  }
  return shown;
};

export const counterState = (el: ElementTimeline, scene: Scene): CounterState => {
  const { frame } = scene;
  const rows: Row[] = [];
  let colored = 0;
  const markPulses: { rows?: number[]; b: number }[] = [];
  // Pulses and blinks on digits, each picking rows (all if none) and red digits or all.
  type OnDigits = { rows?: number[]; red: boolean };
  const digitPulses: (OnDigits & { b: number; color: string | null })[] = [];
  const digitBlinks: (OnDigits & { opacity: number })[] = [];
  const onDigits = (q: Action["params"]): OnDigits => {
    if (q.which !== "red" && q.which !== "all") throw new Error(`BaseCounter ${el.spec.id}: ${q.which} digits? which must be red or all`);
    return { rows: q.rows, red: q.which === "red" };
  };
  const rowOf = (base: number, a: Action) => {
    const r = rows.find((r) => r.base === base);
    if (!r) throw new Error(`BaseCounter ${el.spec.id}: ${a.action} on base ${base}, which has no row yet`);
    return r;
  };

  const { appear, out } = lifecycle(el, frame, (a) => {
    const q = a.params;
    const t = phase(a, frame);
    if (valueActions.has(a.action)) return; // shownAt
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
      case "color":
        colored = t;
        break;
      case "marks":
        break; // markOf
      case "pulse":
        if (q.part === "marks") markPulses.push({ rows: q.rows, b: bump(a, frame) });
        else if (q.part === "digits") digitPulses.push({ ...onDigits(q), b: bump(a, frame), color: q.color ? themeColor(q.color) : null });
        else throw new Error(`BaseCounter ${el.spec.id}: unknown pulse part ${q.part}`);
        break;
      case "blink": {
        // `times` dips to counter.blink and back, ending at rest; the digits keep their color.
        const dip = Math.sin(Math.PI * (q.times ?? 1) * t) ** 2;
        digitBlinks.push({ ...onDigits(q), opacity: 1 - (1 - counter.blink) * dip });
        break;
      }
      default:
        throw new Error(`BaseCounter ${el.spec.id}: unknown action ${a.action}`);
    }
  });

  // A row's ✓ follows the digits frame by frame: one that comes draws along
  // its path, one that goes fades, each over the frames shownAt allows. A
  // count's stop is weighed against the stop before it, not against the
  // numbers passed on the way, so a ✓ both stops have stays whole. Before
  // marks go live no row has one; as they do, the rows that qualify draw
  // theirs over the marks cue's span. A row added once marks are live brings
  // its ✓ in with it.
  const shown = new Map<number, Shown>();
  const at = (f: number) => shown.get(f) ?? shown.set(f, shownAt(el, f)).get(f)!;
  const live = el.actions.find((a) => a.action === "marks");
  const reach = Math.max(duration.fast * VIDEO.fps, live ? live.to - live.from : 0);
  const whole: Mark = { draw: 1, opacity: 1 };
  const none: Mark = { draw: 0, opacity: 0 };
  const markOf = (base: number): Mark => {
    const since = rows.find((r) => r.base === base)?.since ?? frame;
    const passes = (f: number) => !!live && f >= live.from && only01(at(f).marked, base);
    // The frame before f, leaving out the numbers a count passes between stops.
    const prior = (f: number) => {
      let p = f - 1;
      while (p > since && at(p).between) p--;
      return p;
    };
    const state = (f: number): Mark => {
      if (at(f).instant) return passes(f) ? whole : none;
      for (let s = f; s > Math.max(since, f - reach); ) {
        const p = prior(s);
        if (passes(s) !== passes(p)) {
          const frames = live && s === live.from ? live.to - live.from : passes(s) ? at(s).come : at(s).go;
          const t = frames <= 0 ? 1 : Math.min(1, (f - s) / frames);
          if (passes(s)) return { draw: ease.out(t), opacity: 1 };
          if (t >= 1) return none;
          const before = state(p);
          return { draw: before.draw, opacity: before.opacity * (1 - ease.exit(t)) };
        }
        if (at(p).instant) break; // a run's frame: settled there
        s = p;
      }
      return passes(f) ? whole : none;
    };
    return state(frame);
  };

  const now = at(frame);
  return {
    appear,
    out,
    value: now.value,
    change: now.change,
    rows,
    colored,
    mark: markOf,
    markPulse: (base) => Math.max(0, ...markPulses.filter((m) => !m.rows || m.rows.includes(base)).map((m) => m.b)),
    digitPulse: (base, digit) => {
      const on = (d: OnDigits) => (!d.rows || d.rows.includes(base)) && (!d.red || digit >= 2);
      const pulses = digitPulses.filter(on);
      const tinted = pulses.filter((d) => d.color).sort((x, y) => y.b - x.b)[0];
      return {
        grow: Math.max(0, ...pulses.map((d) => d.b)),
        tint: tinted ? { color: tinted.color!, t: tinted.b } : null,
        opacity: digitBlinks.filter(on).reduce((o, d) => o * d.opacity, 1),
      };
    },
  };
};

const counterOf = (scene: Scene, id: string) => scene.state(id, "BaseCounter") as CounterState;

// A ✓ centered at `at`, `scale`d about it, drawn `draw` of the way along its
// path (the short stroke, then the long one).
const checkPoints = ([x, y]: Pt, scale: number, draw: number): Pt[] =>
  trimPolyline(
    counter.check.map(([dx, dy]) => [x + dx * scale, y + dy * scale] as Pt),
    draw,
  );

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
  // to its neighbours, and turns toward the pulse's color if it has one.
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
        color={pulse.tint ? mix(textOf(base, g.d), pulse.tint.color, pulse.tint.t) : textOf(base, g.d)}
        opacity={g.opacity * opacity * pulse.opacity}
        scale={lerp(1, grow, pulse.grow)}
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
          const mark = s.mark(r.base);
          return (
            <g key={r.base} opacity={r.shown}>
              <Polyline pts={roundedRectPoints([x0, r.y - half, x1, r.y + half], rs.radius)} color={color.muted} width={stroke.line} closed />
              {mark.draw > 0 && mark.opacity > 0 ? (
                <Polyline
                  pts={checkPoints([rs.markX, r.y], lerp(1, counter.markPulse, s.markPulse(r.base)), mark.draw)}
                  color={color.yellow}
                  width={stroke.sheet}
                  opacity={mark.opacity}
                  cap="round"
                />
              ) : null}
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
