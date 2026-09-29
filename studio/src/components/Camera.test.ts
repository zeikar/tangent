import { describe, expect, it } from "vitest";
import { ElementTimeline, Scene } from "../storyboard/timeline";
import { ease } from "../style/theme";
import { cameraState, HOME, onScreen } from "./Camera";
import { Pt } from "./geometry";

const camera = (params: { center: Pt; zoom: number }): ElementTimeline => ({
  spec: { id: "camera", component: "Camera", props: {} },
  start: 0,
  end: Infinity,
  actions: [{ action: "moveTo", params, from: 0, to: 10, ease: ease.smooth }],
});
const at = (el: ElementTimeline, frame: number) =>
  cameraState(el, { frame, elements: [el], state: () => undefined, at: () => undefined as unknown as Scene });

describe("cameraState", () => {
  it("rests on the picture as drawn and ends with center at the zone's center", () => {
    const el = camera({ center: [495, 570], zoom: 1.6 });
    expect(onScreen(at(el, 0), [123, 456])).toEqual([123, 456]);
    const end = onScreen(at(el, 10), [495, 570]);
    expect(end[0]).toBeCloseTo(HOME[0], 9);
    expect(end[1]).toBeCloseTo(HOME[1], 9);
  });

  it("moves every picture point on a straight line", () => {
    const el = camera({ center: [495, 570], zoom: 1.6 });
    for (const p of [[540, 270], [432, 302], [160, 1220]] as Pt[]) {
      const [a, b] = [onScreen(at(el, 0), p), onScreen(at(el, 10), p)];
      for (let f = 1; f < 10; f++) {
        const [x, y] = onScreen(at(el, f), p);
        // Cross product with the start-to-end chord: zero on the line.
        expect((x - a[0]) * (b[1] - a[1]) - (y - a[1]) * (b[0] - a[0])).toBeCloseTo(0, 6);
        // And no overshoot: it stays between the two ends.
        expect(Math.min(a[1], b[1]) - 1e-9).toBeLessThanOrEqual(y);
        expect(y).toBeLessThanOrEqual(Math.max(a[1], b[1]) + 1e-9);
      }
    }
  });
});
