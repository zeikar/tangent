import { describe, expect, it } from "vitest";
import { cruise, ease } from "../style/theme";
import { Cues, phase, resolveCaptions, resolveTimeline, Storyboard } from "./timeline";

const el = (id: string) => ({ id, component: "Note", props: {} });

describe("resolveTimeline", () => {
  it("refuses an id declared again after its element exited", () => {
    const sb: Storyboard = {
      beats: [
        { id: "B1", captions: [], elements: [el("x")], cues: [{ at: { word: "a" }, target: "x", action: "exit" }] },
        { id: "B2", captions: [], elements: [el("x")], cues: [] },
      ],
    };
    const cues: Cues = {
      fps: 30,
      durationInFrames: 200,
      beats: [
        { id: "B1", startFrame: 0, endFrame: 99, captions: [], cues: [{ target: "x", action: "exit", word: "a", frame: 10 }] },
        { id: "B2", startFrame: 100, endFrame: 199, captions: [], cues: [] },
      ],
    };
    expect(() => resolveTimeline(sb, cues)).toThrow(/x is declared again/);
  });

  it("keeps an entrance's until anchor when it waits for an exit", () => {
    const sb: Storyboard = {
      beats: [
        {
          id: "B1",
          captions: [],
          elements: [el("old"), el("new")],
          cues: [
            { at: { word: "a" }, target: "old", action: "exit" },
            { at: { word: "a" }, target: "new", action: "appear", until: { word: "b" } },
          ],
        },
      ],
    };
    const cues: Cues = {
      fps: 30,
      durationInFrames: 100,
      beats: [
        {
          id: "B1",
          startFrame: 0,
          endFrame: 99,
          captions: [],
          cues: [
            { target: "old", action: "exit", word: "a", frame: 10 },
            { target: "new", action: "appear", word: "a", frame: 10, untilFrame: 30 },
          ],
        },
      ],
    };
    const appear = resolveTimeline(sb, cues).find((e) => e.spec.id === "new")!.actions[0];
    const exit = resolveTimeline(sb, cues).find((e) => e.spec.id === "old")!.actions[0];
    expect(appear.from).toBe(exit.to);
    expect(appear.to).toBe(30);
  });
});

describe("phase", () => {
  it("steps instead of dividing by zero on an empty window", () => {
    const a = { action: "reveal", params: {}, from: 10, to: 12, ease: ease.linear };
    expect(phase(a, 10, 0, 0)).toBe(1);
    expect(phase(a, 10, 0.5, 0.5)).toBe(0);
    expect(phase(a, 11, 0.5, 0.5)).toBe(1);
  });
});

describe("cruise", () => {
  it("covers the span at constant speed, easing out of and into rest", () => {
    const f = cruise(0.1);
    expect(f(0)).toBe(0);
    expect(f(1)).toBe(1);
    const speed = (t: number) => (f(t + 1e-4) - f(t)) / 1e-4;
    expect(speed(0.3)).toBeCloseTo(1 / 0.9, 3);
    expect(speed(0.7)).toBeCloseTo(1 / 0.9, 3);
    expect(speed(0)).toBeLessThan(0.01);
    expect(speed(1 - 1e-4)).toBeLessThan(0.01);
    for (let t = 0; t < 1; t += 0.01) expect(f(t + 0.01)).toBeGreaterThan(f(t));
  });
});

describe("resolveCaptions", () => {
  it("shows the first caption from frame 0 and the rest from their anchors", () => {
    const sb: Storyboard = {
      beats: [
        { id: "B1", captions: [{ text: "one" }, { text: "two" }], elements: [], cues: [] },
        { id: "B2", captions: [{ text: "three" }], elements: [], cues: [] },
      ],
    };
    const cues: Cues = {
      fps: 30,
      durationInFrames: 200,
      beats: [
        { id: "B1", startFrame: 0, endFrame: 99, captions: [{ frame: 9 }, { frame: 40 }], cues: [] },
        { id: "B2", startFrame: 100, endFrame: 199, captions: [{ frame: 110 }], cues: [] },
      ],
    };
    expect(resolveCaptions(sb, cues)).toEqual([
      { text: "one", from: 0, to: 40 },
      { text: "two", from: 40, to: 110 },
      { text: "three", from: 110, to: 200 },
    ]);
  });
});
