// Numbers written in a base, and the values a BaseCounter shows frame by
// frame while it runs or counts (BaseCounter.tsx). Every value shown is a
// real number with its real digits, so a ✓ is never placed by hand.

// n's digits in `base`, most significant first.
export const digitsOf = (n: number, base: number): number[] => {
  if (!Number.isSafeInteger(n) || n < 0) throw new Error(`digitsOf: ${n} is not a whole number`);
  const out: number[] = [];
  do {
    out.unshift(n % base);
    n = Math.floor(n / base);
  } while (n > 0);
  return out;
};

// Written in `base` with only 0s and 1s: its row has a ✓.
export const only01 = (n: number, base: number) => digitsOf(n, base).every((d) => d <= 1);

// Rows n gives a ✓ among `bases`, leaving out base 2, where every number has one.
const passedRows = (n: number, bases: number[]) => bases.filter((b) => b > 2 && only01(n, b)).length;

// Runs already worked out, by ease and the rest of their arguments.
const runs = new WeakMap<(t: number) => number, Map<string, number[]>>();

// A run: `frames` values, one a frame, from `from` to `to` on a log scale
// under `ease`, never going down. Every `flicker`-th frame instead shows the
// first number at or above its own that gives exactly one of `bases`' rows a
// ✓ (base 2 left out), if there is one before the next frame's value: a ✓
// flickers on as the count passes a real number that earns it.
export const runValues = (from: number, to: number, frames: number, ease: (t: number) => number, bases: number[], flicker: number) => {
  const byArgs = runs.get(ease) ?? new Map<string, number[]>();
  runs.set(ease, byArgs);
  const key = JSON.stringify([from, to, frames, bases, flicker]);
  const cached = byArgs.get(key);
  if (cached) return cached;
  if (from < 1 || to < from) throw new Error(`run from ${from} to ${to}: both at least 1, rising`);
  const at = (i: number) =>
    frames <= 1 ? to : Math.round(Math.exp(Math.log(from) + (Math.log(to) - Math.log(from)) * ease(i / (frames - 1))));
  const out: number[] = [];
  for (let i = 0; i < frames; i++) {
    let v = Math.max(at(i), out[i - 1] ?? from);
    if (i % flicker === flicker - 1 && i < frames - 1) {
      const next = at(i + 1);
      let w = v;
      while (w < next && passedRows(w, bases) !== 1) w++;
      if (w < next) v = w;
    }
    out.push(v);
  }
  byArgs.set(key, out);
  return out;
};

// A count from `start` through `stops`, frame i of `frames`: each stop gets
// an equal slot; in its first quarter the value counts up from the one
// before, a number a frame (spread evenly when there are more numbers than
// frames), and then holds the stop. Past the span it holds the last stop.
export const countValue = (start: number, stops: number[], frames: number, i: number) => {
  const n = stops.length;
  if (!n) throw new Error("a count needs stops");
  if (i >= frames) return stops[n - 1];
  const { k, from, length } = countSlot(n, frames, i);
  const quarter = Math.max(1, Math.floor(length / 4));
  const prev = k === 0 ? start : stops[k - 1];
  const gap = stops[k] - prev;
  const j = i - from;
  if (gap <= 0 || j >= quarter - 1) return stops[k];
  return Math.min(stops[k], prev + (gap <= quarter ? j + 1 : Math.round(((j + 1) * gap) / quarter)));
};

// The stop a count of n stops over `frames` is on at frame i (0..n-1), and
// its slot's first frame and length.
export const countSlot = (n: number, frames: number, i: number) => {
  const slot = (k: number) => Math.round((k * frames) / n);
  let k = 0;
  while (k < n - 1 && slot(k + 1) <= i) k++;
  return { k, from: slot(k), length: slot(k + 1) - slot(k) };
};
