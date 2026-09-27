import { Action, bump, ElementTimeline, lerp, phase, rawProgress, Scene } from "../storyboard/timeline";
import { sky, VIDEO } from "../style/theme";
import { angleTo, dist, lerpPt, mod, polar, Pt } from "./geometry";

// A Body's live state (what Body.tsx draws, and what orbits, tethers, traces
// and arrows read) and its geometry.

export type Orbit = { around: string; radius: number; angle: number };
export type Part = "near" | "far" | "outline";
export type BodyProps = {
  center?: Pt;
  orbit?: Orbit;
  r: number;
  color?: string;
  halves?: { near: string; far: string };
  rotation?: "fixed" | "locked";
  heading?: number;
  stretch?: number;
  tilt?: number;
  markingOpacity?: number;
  opacity?: number;
  name?: string;
  labels?: { near?: string; far?: string };
  pointer?: boolean;
};

type Fading = { text: string; opacity: number };

export type BodyState = {
  center: Pt;
  r: number;
  orbit: Orbit | null; // angle unwrapped: it keeps counting past 360
  heading: number; // where the near half's pole points
  axis: number; // the long axis, toward orbit.around (plus tilt)
  stretch: number; // long ÷ short axis, area kept
  tilt: number;
  appear: number;
  out: number;
  opacity: number;
  markingOpacity: number;
  names: Fading[];
  labels: Record<"near" | "far", Fading[]>;
  pointer: { grow: number; opacity: number };
  pulse: Record<Part, number>;
};

export const body = (scene: Scene, id: string) => scene.state(id, "Body") as BodyState;

export const semiAxes = (s: BodyState) => [s.r * Math.sqrt(s.stretch), s.r / Math.sqrt(s.stretch)];

// Center to outline along `deg`.
export const outlineRadius = (s: BodyState, deg: number) => {
  const [a, b] = semiAxes(s);
  const t = ((deg - s.axis) * Math.PI) / 180;
  return 1 / Math.hypot(Math.cos(t) / a, Math.sin(t) / b);
};

export const insideBody = (s: BodyState, p: Pt) => dist(s.center, p) < outlineRadius(s, angleTo(s.center, p));

// A point on the body: an end of its long axis (nearTip on orbit.around's
// side) or its center.
export const pointOn = (s: BodyState, at: "nearTip" | "farTip" | "center"): Pt =>
  at === "center" ? s.center : polar(s.center, semiAxes(s)[0], at === "nearTip" ? s.axis : s.axis + 180);

// The pointer as drawn: base just outside the outline on the heading.
export const pointerOf = (s: BodyState) => ({
  base: polar(s.center, outlineRadius(s, s.heading) + sky.pointerGap, s.heading),
  deg: s.heading,
  length: Math.max(sky.pointerLength * s.r, sky.pointerMin) * s.pointer.grow,
});

const STYLE_KEYS = ["opacity", "markingOpacity", "name", "labels", "pointer"];

const crossFade = (list: Fading[], text: string | null | undefined, e: number): Fading[] =>
  list.length === 1 && list[0].text === text
    ? list
    : [...list.map((f) => ({ ...f, opacity: f.opacity * (1 - e) })), ...(text ? [{ text, opacity: e }] : [])].filter(
        (f) => f.opacity > 0,
      );

// settle's slowdown: speed as a share of the starting speed over the span's
// progress u, shaped so the distance covered is `share` of what the starting
// speed would cover, and landing at rest without a jolt (zero slope at u = 1).
// (1 - u^n)² covers 1 - 2/(n+1) + 1/(2n+1) (a third at n = 1, rising toward
// all of it); below a third, (1 - u)^p covers 1/(p+1).
const slowdown = (share: number) => {
  if (share <= 0 || share >= 1) throw new Error(`settle: cannot cover ${share.toFixed(2)} of the starting speed's distance`);
  if (share < 1 / 3) {
    const p = 1 / share - 1;
    return { covered: (u: number) => (1 - (1 - u) ** (p + 1)) / (p + 1) / share, speed: (u: number) => (1 - u) ** p };
  }
  const covers = (n: number) => 1 - 2 / (n + 1) + 1 / (2 * n + 1);
  let [lo, hi] = [1, 1e4];
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (covers(mid) < share) lo = mid;
    else hi = mid;
  }
  const n = (lo + hi) / 2;
  return {
    covered: (u: number) => (u - (2 * u ** (n + 1)) / (n + 1) + u ** (2 * n + 1) / (2 * n + 1)) / share,
    speed: (u: number) => (1 - u ** n) ** 2,
  };
};

// Frames at which a body appearing onPassOf another fades in, per appear cue.
const passes = new WeakMap<Action, number>();

export const bodyState = (el: ElementTimeline, scene: Scene): BodyState => {
  const { frame } = scene;
  const id = el.spec.id;
  const p = el.spec.props as BodyProps;
  const fps = VIDEO.fps;
  const need = <T,>(v: T | undefined, what: string, action: string): T => {
    if (v === undefined) throw new Error(`Body ${id}: ${action} needs ${what}`);
    return v;
  };
  let center = p.center;
  let r = p.r;
  let orbitRadius = p.orbit?.radius;
  let angle = p.orbit?.angle;
  let stretch = p.stretch ?? 1;
  let tilt = p.tilt ?? 0;
  let appear = el.spec.visibleAtStart ? 1 : 0;
  let out = 1;
  let opacity = p.opacity ?? 1;
  let markingOpacity = p.markingOpacity ?? 1;
  let names: Fading[] = p.name ? [{ text: p.name, opacity: 1 }] : [];
  const labels = {
    near: p.labels?.near ? [{ text: p.labels.near, opacity: 1 }] : [],
    far: p.labels?.far ? [{ text: p.labels.far, opacity: 1 }] : [],
  };
  let pointer = p.pointer ? { grow: 1, opacity: 1 } : { grow: 0, opacity: 0 };
  const pulse = { near: 0, far: 0, outline: 0 };
  // A locked body's spin against the line to orbit.around: how far it has
  // turned (degrees), and at what rate (degrees per second) since frame t.
  const spin = { turned: 0, rate: 0, t: 0 };
  const hold = (to: number) => {
    if (to <= spin.t) return;
    spin.turned += (spin.rate * (to - spin.t)) / fps;
    spin.t = to;
  };
  const locked = (action: string) => {
    if (p.rotation !== "locked") throw new Error(`Body ${id}: ${action} needs rotation locked`);
  };

  for (const a of el.actions) {
    if (frame < a.from) break;
    const e = phase(a, frame);
    const q = a.params;
    switch (a.action) {
      case "appear": {
        let from = a.from;
        if (q.onPassOf) {
          const own = need(angle, "an orbit", "appear onPassOf");
          from = passes.get(a) ?? passFrame(scene, a, q.onPassOf, own, id);
          passes.set(a, from);
        }
        appear = phase({ ...a, from, to: from + a.to - a.from }, frame);
        break;
      }
      case "exit":
        out *= 1 - e;
        break;
      case "orbit":
        angle = need(angle, "an orbit", "orbit") + q.by * e;
        break;
      case "moveTo":
        if (q.center) center = lerpPt(need(center, "a center", "moveTo center"), q.center, e);
        if (q.r !== undefined) r = lerp(r, q.r, e);
        if (q.orbitRadius !== undefined) orbitRadius = lerp(need(orbitRadius, "an orbit", "moveTo orbitRadius"), q.orbitRadius, e);
        break;
      case "setStyle":
        for (const key of Object.keys(q)) {
          if (!STYLE_KEYS.includes(key)) throw new Error(`Body ${id}: setStyle ${key} is not supported`);
        }
        if ("opacity" in q) opacity = lerp(opacity, q.opacity, e);
        if ("markingOpacity" in q) markingOpacity = lerp(markingOpacity, q.markingOpacity, e);
        if ("name" in q) names = crossFade(names, q.name, e);
        if ("labels" in q) {
          labels.near = crossFade(labels.near, q.labels?.near, e);
          labels.far = crossFade(labels.far, q.labels?.far, e);
        }
        if ("pointer" in q) {
          // One that appears grows out from its base; one that leaves fades.
          pointer = q.pointer
            ? { grow: lerp(pointer.grow, 1, e), opacity: 1 }
            : { grow: e < 1 ? pointer.grow : 0, opacity: pointer.opacity * (1 - e) };
        }
        break;
      case "stretchTo":
        stretch = lerp(stretch, q.ratio, e);
        break;
      case "tiltTo":
        tilt = lerp(tilt, q.deg, e);
        break;
      case "spin": {
        // The rate eases from the current one to q.rate turns per second
        // across the span, then holds; the turn is its integral.
        locked("spin");
        hold(a.from);
        const [w0, w1] = [spin.rate, q.rate * 360];
        const end = Math.min(frame, a.to);
        const steps = (end - a.from) * 8;
        for (let i = 0; i < steps; i++) {
          const f = a.from + (i + 0.5) / 8;
          spin.turned += lerp(w0, w1, phase(a, f)) / 8 / fps;
        }
        spin.rate = frame < a.to ? lerp(w0, w1, e) : w1;
        spin.t = end;
        break;
      }
      case "settle": {
        // Slows to rest with the near half facing orbit.around at the span's
        // end: the whole number of turns closest to an even slowdown (half
        // the distance the starting rate would cover), shaped to land exactly.
        locked("settle");
        hold(a.from);
        const w0 = spin.rate;
        if (w0 <= 0) throw new Error(`Body ${id}: settle needs a spinning body`);
        const reach = (w0 * (a.to - a.from)) / fps;
        const rest = mod(-spin.turned, 360);
        const turns = Math.max(rest > 0 ? 0 : 1, Math.round((reach / 2 - rest) / 360));
        const d = rest + 360 * turns;
        const u = rawProgress(a, frame);
        const shape = slowdown(d / reach);
        const start = spin.turned;
        if (u < 1) {
          spin.turned = start + d * shape.covered(u);
          spin.rate = w0 * shape.speed(u);
          spin.t = frame;
        } else {
          spin.turned = Math.round((start + d) / 360) * 360;
          spin.rate = 0;
          spin.t = a.to;
        }
        break;
      }
      case "pulse": {
        const b = bump(a, frame);
        const parts: Part[] = q.part === "all" ? ["near", "far", "outline"] : [q.part];
        for (const part of parts) {
          if (!(part in pulse)) throw new Error(`Body ${id}: pulse part ${q.part}`);
          pulse[part] = Math.max(pulse[part], b);
        }
        break;
      }
      default:
        throw new Error(`Body ${id}: unknown action ${a.action}`);
    }
  }
  hold(frame);

  let orbit: Orbit | null = null;
  if (p.orbit) {
    orbit = { around: p.orbit.around, radius: orbitRadius!, angle: angle! };
    center = polar(body(scene, p.orbit.around).center, orbit.radius, orbit.angle);
  }
  if (!center) throw new Error(`Body ${id}: needs a center or an orbit`);
  // Toward what it orbits: the far side of its orbit angle.
  const toward = orbit ? orbit.angle + 180 : 0;
  if ((stretch !== 1 || tilt !== 0) && !orbit) throw new Error(`Body ${id}: stretch and tilt follow an orbit`);
  const heading =
    p.rotation === "locked" ? toward + spin.turned : p.rotation === "fixed" ? need(p.heading, "a heading", "rotation fixed") : 0;
  return {
    center,
    r,
    orbit,
    heading,
    axis: toward + tilt,
    stretch,
    tilt,
    appear,
    out,
    opacity,
    markingOpacity,
    names,
    labels,
    pointer,
    pulse,
  };
};

// The first frame from the cue on at which `other` has orbited to `own`
// degrees (mod 360), counterclockwise.
const passFrame = (scene: Scene, a: Action, other: string, own: number, id: string) => {
  const el = scene.elements.find((e) => e.spec.id === other);
  if (!el) throw new Error(`Body ${id}: onPassOf ${other}, which is not declared`);
  const last = Math.max(a.from, ...el.actions.filter((x) => x.action === "orbit").map((x) => x.to));
  const angleAt = (f: number) => body(scene.at(f), other).orbit?.angle ?? NaN;
  const start = angleAt(a.from);
  const togo = mod(own - start, 360);
  for (let f = a.from; f <= last; f++) if (angleAt(f) - start >= togo - 1e-9) return f;
  throw new Error(`Body ${id}: ${other} never passes ${own}° after f${a.from}`);
};

