import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, mix, phase, Scene } from "../storyboard/timeline";
import { color, scenery, stroke } from "../style/theme";
import { clipAbove, ring } from "./figure";
import { Pt, pointsAttr } from "./geometry";
import { Polyline, Svg } from "./shapes";

// Landscape drawn in code, standing on a waterline: mountains (a snowcap on
// top) and conifers. With flipAbout it is drawn upside down below that line,
// its reflection, and can unfold out of it. Fills are opaque, so a tree's
// tiers cover each other; `opacity` fades the whole drawing.
// Spec: storyboard.json → components → Scenery.

type Item =
  | { kind: "mountain"; points: Pt[] }
  | { kind: "tree"; x: number; base: number; height: number; width: number };
type Props = { items: Item[]; flipAbout?: number; opacity?: number };

// A conifer's three tiers, bottom to top: [base, apex] as shares of its
// height above its base, and width as a share of the lowest's.
const TIERS: [number, number, number][] = [
  [0.2, 0.62, 1],
  [0.42, 0.83, 0.78],
  [0.62, 1, 0.56],
];

export const Scenery: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  let appear = el.spec.visibleAtStart ? 1 : 0;
  let unfold = 1;
  let out = 1;
  let pulse = 0;
  for (const a of el.actions) {
    if (frame < a.from) break;
    if (a.action === "appear") {
      // Unfolding, it is at full opacity as it grows out of the line.
      if (a.params.unfold) {
        if (p.flipAbout === undefined) throw new Error(`Scenery ${el.spec.id}: unfold needs flipAbout`);
        unfold = phase(a, frame);
        appear = 1;
      } else appear = phase(a, frame);
    } else if (a.action === "exit") out *= 1 - phase(a, frame);
    else if (a.action === "pulse") pulse = Math.max(pulse, bump(a, frame));
    else throw new Error(`Scenery ${el.spec.id}: unknown action ${a.action}`);
  }
  if (appear <= 0 || out <= 0 || unfold <= 0) return null;
  const line = p.flipAbout;
  // Upside down below the flip line, scaled toward it while unfolding.
  const at = ([x, y]: Pt): Pt => (line === undefined ? [x, y] : [x, line + (line - y) * unfold]);
  const body = mix(color.bg, color.muted, lerp(scenery.fill, scenery.fillPulse, pulse));
  const outline = { color: color.text, width: stroke.line * (1 + pulse) };
  const shapes = p.items.map((item, i) => {
    if (item.kind === "mountain") {
      const ys = item.points.map((q) => q[1]);
      const [peak, base] = [Math.min(...ys), Math.max(...ys)];
      const snow = clipAbove(item.points, peak + scenery.snowcap * (base - peak));
      return (
        <g key={i}>
          <polygon points={pointsAttr(item.points.map(at))} fill={body} />
          <polygon points={pointsAttr(snow.map(at))} fill={color.text} fillOpacity={scenery.snow} />
          {/* Along the silhouette only: the base is the waterline. */}
          <Polyline pts={item.points.map(at)} {...outline} />
        </g>
      );
    }
    const { x, base, height, width } = item;
    const tiers = TIERS.map(([b, top, share]): Pt[] => [
      [x - (width * share) / 2, base - b * height],
      [x, base - top * height],
      [x + (width * share) / 2, base - b * height],
    ]);
    return (
      <g key={i}>
        <line
          x1={at([x, base])[0]}
          y1={at([x, base])[1]}
          x2={at([x, base - TIERS[0][0] * height])[0]}
          y2={at([x, base - TIERS[0][0] * height])[1]}
          stroke={color.muted}
          strokeWidth={scenery.trunk}
        />
        {tiers.map((pts, k) => (
          <g key={k}>
            <polygon points={pointsAttr(pts.map(at))} fill={body} />
            <Polyline pts={ring(pts.map(at))} closed {...outline} />
          </g>
        ))}
      </g>
    );
  });
  return (
    <AbsoluteFill style={{ opacity: appear * out * (p.opacity ?? 1) }}>
      <Svg>{shapes}</Svg>
    </AbsoluteFill>
  );
};
