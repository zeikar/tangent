import { describe, expect, it } from "vitest";
import { coneAt, coneRatios, hue, purpleMix, screenColor, screenRgb } from "./light";

// The values episode 004's storyboard lists (notes: Screen color, Cone
// responses), which its verify.py computes from the same tables.

const MAGENTA: [number, number][] = [
  [630, 1],
  [450, 0.975],
];

describe("screenColor", () => {
  it("gives the storyboard's check values", () => {
    const expected: [number, string][] = [
      [680, "#FF0000"],
      [595, "#FF6100"],
      [570, "#FAFF00"],
      [527, "#00FF00"],
      [483.34, "#00A5FF"],
      [472, "#0042FF"],
      [450, "#4F00FF"],
      [445, "#5A00FF"],
      [405, "#7000FF"],
      [400, "#7100FF"],
    ];
    for (const [nm, hex] of expected) expect([nm, screenColor([[nm, 1]])]).toEqual([nm, hex]);
  });

  it("is one flat red from 610 nm up", () => {
    for (let nm = 610; nm <= 680; nm += 0.5) expect(screenColor([[nm, 1]])).toBe("#FF0000");
  });

  it("mixes red and blue light into magenta at 1 : 0.975, pink at 1 : 0.5", () => {
    expect(screenColor(MAGENTA)).toBe("#FF00FF");
    expect(screenColor([[630, 1], [450, 0.5]])).toBe("#FF00C0");
    // verify.py's k: hue exactly 300° at 1 : 0.9749.
    expect(hue(screenRgb([[630, 1], [450, 0.9749]]))).toBeCloseTo(300, 1);
  });

  it("ignores brightness", () => {
    expect(screenColor([[630, 3], [450, 2.925]])).toBe("#FF00FF");
  });
});

describe("coneRatios", () => {
  const round = (v: number[]) => v.map((x) => Math.round(x * 1000) / 1000);

  it("gives the storyboard's key states", () => {
    expect(round(coneRatios(MAGENTA))).toEqual([0.482, 0.158, 1]);
    expect(round(coneRatios([[675, 1]]))).toEqual([1, 0.066, 0]);
    expect(round(coneRatios([[483.34, 1]]))).toEqual([0.482, 0.795, 1]);
    const v405 = coneRatios([[405, 1]]);
    expect(round(v405)).toEqual([0.039, 0.038, 1]);
    // Both under 4% (C5).
    expect(Math.max(v405[0], v405[1])).toBeLessThan(0.04);
  });

  it("hands the tallest bar from L to M to S along the sweep, never matching the target", () => {
    const target = coneRatios(MAGENTA);
    const tallest: [string, number][] = [];
    let closest = { nm: 0, off: Infinity };
    for (let nm = 675; nm >= 405; nm -= 0.5) {
      const v = coneRatios([[nm, 1]]);
      const top = "LMS"[v.indexOf(Math.max(...v))];
      if (tallest[tallest.length - 1]?.[0] !== top) tallest.push([top, nm]);
      const off = Math.max(...v.map((x, i) => Math.abs(x - target[i])));
      if (off < closest.off) closest = { nm, off };
    }
    // L down to 554 nm, M to 486 nm, then S (C4), sampled every 0.5 nm.
    expect(tallest).toEqual([
      ["L", 675],
      ["M", 554],
      ["S", 485.5],
    ]);
    expect(closest.nm).toBeCloseTo(475, -1);
    expect(closest.off).toBeCloseTo(0.25, 2);
  });

  it("reads each curve's height from the table, peak 1", () => {
    expect(coneAt("L", 570)).toBeCloseTo(0.999993, 6);
    expect(coneAt("S", 442.5)).toBeCloseTo((0.99102 + 0.991515) / 2, 5);
    expect(coneAt("M", 680)).toBeCloseTo(0.00163734, 8);
  });
});

describe("purpleMix", () => {
  it("runs from the violet end's hue through magenta to the red end's", () => {
    const violet = hue(screenRgb([[400, 1]]));
    expect(screenColor(purpleMix(400, 680, violet))).toBe("#7100FF");
    expect(screenColor(purpleMix(400, 680, 300))).toBe("#FF00FF");
    expect(screenColor(purpleMix(400, 680, 360))).toBe("#FF0000");
  });
});
