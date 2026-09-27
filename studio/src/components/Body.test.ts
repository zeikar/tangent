import { describe, expect, it } from "vitest";
import { Action, ElementTimeline, Params, Scene } from "../storyboard/timeline";
import { ease } from "../style/theme";
import { body, bodyState } from "./bodies";
import { mod } from "./geometry";

const act = (action: string, from: number, to: number, params: Params = {}, e: (t: number) => number = ease.smooth): Action => ({
  action,
  params,
  from,
  to,
  ease: e,
});

const element = (id: string, props: Params, actions: Action[] = []): ElementTimeline => ({
  spec: { id, component: "Body", visibleAtStart: true, props },
  start: 0,
  end: Infinity,
  actions,
});

// Bodies only, each state computed once per frame, as the player does.
const sceneOf = (elements: ElementTimeline[]) => {
  const at = (frame: number): Scene => {
    const states = new Map<string, unknown>();
    const scene: Scene = {
      frame,
      elements,
      state: (id) => {
        if (!states.has(id)) states.set(id, bodyState(elements.find((e) => e.spec.id === id)!, scene));
        return states.get(id);
      },
      at,
    };
    return scene;
  };
  return at;
};

const earth = element("earth", { center: [250, 745], r: 90, color: "blue" });

describe("Body settle", () => {
  // B6's timing: spin up to 0.8 turns/s over 16 frames, hold, brake over 76.
  const moon = element("moon", { orbit: { around: "earth", radius: 540, angle: 0 }, r: 90, halves: { near: "yellow", far: "teal" }, rotation: "locked" }, [
    act("spin", 16, 32, { rate: 0.8 }),
    act("settle", 259, 335),
  ]);
  const at = sceneOf([earth, moon]);
  const heading = (f: number) => body(at(f), "moon").heading;

  it("lands with the near half toward what it orbits, exactly at the span's end", () => {
    expect(mod(heading(335) - 180, 360)).toBeCloseTo(0, 9);
    expect(heading(400)).toBe(heading(335));
  });

  it("slows without speeding up or turning back", () => {
    const speeds = Array.from({ length: 335 - 258 }, (_, i) => heading(259 + i) - heading(258 + i));
    expect(speeds[0]).toBeCloseTo((0.8 * 360) / 30, 0);
    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]).toBeGreaterThanOrEqual(0);
      expect(speeds[i]).toBeLessThanOrEqual(speeds[i - 1] + 1e-9);
    }
  });
});

describe("Body appear onPassOf", () => {
  it("waits until the other body's orbit reaches its angle", () => {
    const mover = element("mover", { orbit: { around: "earth", radius: 140, angle: 90 }, r: 40 }, [
      act("orbit", 10, 130, { by: 360 }, ease.linear),
    ]);
    const ghost = { ...element("ghost", { orbit: { around: "earth", radius: 140, angle: 0 }, r: 40 }, [act("appear", 10, 20, { onPassOf: "mover" }, ease.linear)]) };
    ghost.spec = { ...ghost.spec, visibleAtStart: false };
    const at = sceneOf([earth, mover, ghost]);
    // 270° of 360° over 120 frames: frame 100.
    expect(body(at(99), "ghost").appear).toBe(0);
    expect(body(at(100), "ghost").appear).toBe(0);
    expect(body(at(105), "ghost").appear).toBeCloseTo(0.5);
  });
});
