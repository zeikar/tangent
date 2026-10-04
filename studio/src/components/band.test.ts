import { describe, expect, it } from "vitest";
import { Action, ElementTimeline, Params } from "../storyboard/timeline";
import { content, ease, optics, zone } from "../style/theme";
import { bandPoint, bandState, gapU, thickest } from "./band";

const act = (action: string, from: number, to: number, params: Params = {}): Action => ({ action, params, from, to, ease: ease.smooth });

// Episode 004's band: the hook's band, thinned into the graph's axis, curled
// into a ring, bridged, and opened back into the hook's band.
const strip: ElementTimeline = {
  spec: { id: "strip", component: "Spectrum", visibleAtStart: true, props: { nm: [680, 400], center: [540, 940], w: 792, h: 160, names: [["빨", 645]] } },
  start: 0,
  end: Infinity,
  actions: [
    act("moveTo", 0, 36, { center: [540, 1130], w: 792, h: 60, names: true }),
    act("curl", 100, 134, { center: [540, 720], r: 270, band: 90, gap: 90 }),
    act("pulse", 150, 171, { part: "redEnd" }),
    act("bridge", 194, 225),
    act("pulse", 254, 276, { part: "bridge" }),
    act("uncurl", 290, 326, { center: [540, 940], w: 792, h: 160, names: false }),
  ],
};

// px a frame: well clear of the curl's old near-stop (~1 px a frame).
const MIN_MOVE = 4;

// Every point of the band's outline (and its bridge's) at a frame.
const outline = (frame: number) => {
  const s = bandState(strip, frame);
  const half = thickest(s) / 2;
  const us = Array.from({ length: 401 }, (_, i) => i / 400);
  if (s.theta > 0) for (const [b0, b1] of s.bridge) us.push(...Array.from({ length: 101 }, (_, i) => gapU(s, b0 + ((b1 - b0) * i) / 100)));
  return us.flatMap((u) => [bandPoint(s, u, -half), bandPoint(s, u, half)]);
};

describe("band curl and uncurl", () => {
  it("keep every intermediate shape inside the content bounds (less the inset) and the visual zone", () => {
    const frames = [0, 18, 36, ...Array.from({ length: 4 * 34 + 1 }, (_, i) => 100 + i / 4), 160, 210, 265, ...Array.from({ length: 4 * 36 + 1 }, (_, i) => 290 + i / 4)];
    for (const f of frames) {
      const pts = outline(f);
      const [xs, ys] = [pts.map(([x]) => x), pts.map(([, y]) => y)];
      const extent = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      expect(extent[0], `frame ${f}`).toBeGreaterThanOrEqual(content.left + optics.inset - 1e-6);
      expect(extent[1], `frame ${f}`).toBeLessThanOrEqual(content.right - optics.inset + 1e-6);
      expect(extent[2], `frame ${f}`).toBeGreaterThanOrEqual(zone.visual.top);
      expect(extent[3], `frame ${f}`).toBeLessThanOrEqual(zone.visual.bottom);
    }
  });

  it("end on the ring asked for, then on the band asked for", () => {
    const ring = bandState(strip, 134);
    expect(ring.theta).toBeCloseTo((3 * Math.PI) / 2, 9);
    expect(ring.len / ring.theta).toBeCloseTo(270, 9);
    expect(ring.h).toBe(90);
    // The middle (540 nm) at 12 o'clock, the ends at 7:30 and 4:30.
    expect(bandPoint(ring, 0.5, 0)).toEqual([540, 450]);
    const [rx, ry] = bandPoint(ring, 0, 0);
    expect(rx).toBeCloseTo(540 - 270 * Math.SQRT1_2, 6);
    expect(ry).toBeCloseTo(720 + 270 * Math.SQRT1_2, 6);
    // The bridge's middle at 6 o'clock.
    const [bx, by] = bandPoint(ring, gapU(ring, 0.5), 0);
    expect(bx).toBeCloseTo(540, 6);
    expect(by).toBeCloseTo(990, 6);

    const band = bandState(strip, 326);
    expect(band).toMatchObject({ mid: [540, 940], len: 792, theta: 0, h: 160, bridge: [], names: 0 });
  });

  it("never come to rest midway", () => {
    // The most any outline point moves in a frame, over each span's middle.
    const moved = (f: number) => Math.max(...outline(f).map(([x, y], i) => Math.hypot(x - outline(f - 1)[i][0], y - outline(f - 1)[i][1])));
    for (const [from, to] of [[100, 134], [290, 326]]) {
      const span = to - from;
      for (let f = from + Math.ceil(span * 0.2); f <= to - Math.ceil(span * 0.2); f++) expect(moved(f), `frame ${f}`).toBeGreaterThan(MIN_MOVE);
    }
  });

  it("draw the bridge back into the band's ends, never as a piece apart", () => {
    for (let f = 290; f <= 326; f += 0.25) {
      for (const [b0, b1] of bandState(strip, f).bridge) expect(b0 <= 0 || b1 >= 1, `frame ${f}`).toBe(true);
    }
  });

  it("bend at constant length, shortening only to keep their corners inside", () => {
    const lengths = Array.from({ length: 21 }, (_, i) => bandState(strip, 100 + i).len);
    expect(Math.min(...lengths)).toBeGreaterThan(782);
  });
});
