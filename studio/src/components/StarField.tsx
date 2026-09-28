import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, Scene } from "../storyboard/timeline";
import { color, mark, sky } from "../style/theme";
import { dist, pointsAttr, Pt } from "./geometry";
import { lifecycle, Svg } from "./shapes";

// Fixed stars, the frame turning is measured against; they never move.
// Either named stars (bright: a 4-point sparkle each), or a faint field of
// dots placed once from a seed inside a region, its outermost dots on the
// region's left and right edges so the field's ink stays centered, and none
// near other ink: `avoid` lists that ink as disks {circle: [x, y, r]} and
// boxes {box: [x0, y0, x1, y1]}. Spec: storyboard.json → components → StarField.

type Shape = { circle: [number, number, number] } | { box: [number, number, number, number] };
type Props = { stars?: Pt[]; bright?: boolean; region?: [number, number, number, number]; seed?: number; avoid?: Shape[] };
type Dot = { at: Pt; r: number };

// mulberry32: a small seeded generator, so a field is the same on every frame and render.
const random = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const gap = (s: Shape, [x, y]: Pt) => {
  if ("circle" in s) return dist([s.circle[0], s.circle[1]], [x, y]) - s.circle[2];
  const [x0, y0, x1, y1] = s.box;
  return Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(y0 - y, 0, y - y1));
};

const fields = new WeakMap<Props, Dot[]>();

const field = (p: Props, id: string): Dot[] => {
  const cached = fields.get(p);
  if (cached) return cached;
  if (!p.region || p.seed === undefined) throw new Error(`StarField ${id}: needs stars, or a region and a seed`);
  const [x0, y0, x1, y1] = p.region;
  const next = random(p.seed);
  const dots: Dot[] = [];
  const [rMin, rMax] = sky.dot;
  const fits = (at: Pt, r: number) =>
    (p.avoid ?? []).every((s) => gap(s, at) >= r + sky.dotClear) && dots.every((d) => dist(d.at, at) >= sky.dotSpacing);
  const place = (x: number | null, want: number) => {
    for (let tries = 0; tries < 2000 && dots.length < want; tries++) {
      const at: Pt = [x ?? lerp(x0, x1, next()), lerp(y0, y1, next())];
      const r = lerp(rMin, rMax, next());
      if (fits(at, r)) dots.push({ at, r });
    }
  };
  // The two edge dots first, then the rest wherever they fit.
  place(x0, 1);
  place(x1, 2);
  if (dots[0]?.at[0] !== x0 || dots[1]?.at[0] !== x1) throw new Error(`StarField ${id}: no room for a star on both of the region's edges`);
  place(null, sky.dots);
  fields.set(p, dots);
  return dots;
};

// A 4-point sparkle `size` across, centered on c.
const sparkle = ([x, y]: Pt, size: number): Pt[] => {
  const [o, i] = [size / 2, size / 6];
  return [
    [x, y - o],
    [x + i, y - i],
    [x + o, y],
    [x + i, y + i],
    [x, y + o],
    [x - i, y + i],
    [x - o, y],
    [x - i, y - i],
  ];
};

export const StarField: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  let pulse = 0;
  const { appear, out } = lifecycle(el, scene.frame, (a) => {
    if (a.action === "pulse") pulse = Math.max(pulse, bump(a, scene.frame));
    else throw new Error(`StarField ${el.spec.id}: unknown action ${a.action}`);
  });
  if (appear <= 0 || out <= 0) return null;
  if (p.stars) {
    const size = sky.star * lerp(sky.starGrow, 1, appear) * lerp(1, mark.pulseScale, pulse);
    return (
      <AbsoluteFill style={{ opacity: appear * out }}>
        <Svg>
          {p.stars.map((at) => (
            <polygon key={at.join()} points={pointsAttr(sparkle(at, size))} fill={color.text} />
          ))}
        </Svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: appear * out * sky.dotOpacity }}>
      <Svg>
        {field(p, el.spec.id).map(({ at: [x, y], r }) => (
          <path key={`${x},${y}`} d={`M${x - r},${y}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`} fill={color.text} />
        ))}
      </Svg>
    </AbsoluteFill>
  );
};
