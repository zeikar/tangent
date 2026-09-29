import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, phase, Scene, themeColor } from "../storyboard/timeline";
import { color, fill, mirror, stroke } from "../style/theme";
import { ring } from "./figure";
import { arcPoints, polar, Pt, pointsAttr } from "./geometry";
import { lifecycle, Polyline, Svg } from "./shapes";

// A standing mirror seen from the front: a round-cornered frame around faint
// glass, two sheen streaks near its upper-right corner. It can tip back about
// its horizontal center line until it is a single horizontal line (a lake's
// surface seen from the shore), and glint. Spec: storyboard.json →
// components → Mirror.

type Props = { center: Pt; w: number; h: number; stroke?: string; fill?: string };

export const Mirror: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  let pulse = 0;
  let opacity = 1;
  let tilt = 0;
  const { appear, out } = lifecycle(el, frame, (a) => {
    if (a.action === "pulse") pulse = Math.max(pulse, bump(a, frame));
    else if (a.action === "setStyle") opacity = lerp(opacity, a.params.opacity, phase(a, frame));
    else if (a.action === "tiltTo") tilt = lerp(tilt, a.params.deg, phase(a, frame));
    else throw new Error(`Mirror ${el.spec.id}: unknown action ${a.action}`);
  });
  const shown = appear * out * opacity;
  if (shown <= 0) return null;
  const [cx, cy] = p.center;
  const { w, h } = p;
  const rad = (tilt * Math.PI) / 180;
  const cos = Math.cos(rad);
  // Tipping back: squashed to h·cos about the center line, the top edge
  // shorter than the bottom (most at 45°) so it reads as a tip, not a squash.
  const taper = mirror.tiltTaper * Math.sin(2 * rad);
  const at = ([u, v]: Pt): Pt => [cx + u * (1 - taper * (0.5 - v / h)), cy + v * cos];
  const r = mirror.radius;
  const [x0, x1, y0, y1] = [-w / 2 + r, w / 2 - r, -h / 2 + r, h / 2 - r];
  const frameLocal: Pt[] = [
    ...arcPoints([x1, y0], r, 90, 0),
    ...arcPoints([x1, y1], r, 0, -90),
    ...arcPoints([x0, y1], r, -90, -180),
    ...arcPoints([x0, y0], r, 180, 90),
  ];
  const outline = frameLocal.map(at);
  // The streaks: the long one centered mirror.sheenAt in from the top-right
  // corner, the short one sheenGap below right of it.
  const corner: Pt = [w / 2, -h / 2];
  const long: Pt = [corner[0] - mirror.sheenAt[0], corner[1] + mirror.sheenAt[1]];
  const short = polar(long, mirror.sheenGap, -45);
  const streak = (c: Pt, len: number) => [polar(c, len / 2, 225), polar(c, len / 2, 45)].map(at);
  const main = themeColor(p.stroke ?? "text");
  return (
    <AbsoluteFill style={{ opacity: shown }}>
      <Svg>
        <polygon points={pointsAttr(outline)} fill={themeColor(p.fill ?? "muted")} fillOpacity={fill.sheet * cos} />
        {[streak(long, mirror.sheen[0]), streak(short, mirror.sheen[1])].map((pts, i) => (
          <Polyline
            key={i}
            pts={pts}
            color={color.text}
            width={stroke.arrow}
            cap="round"
            opacity={lerp(mirror.sheenOpacity, 1, pulse) * cos}
          />
        ))}
        <Polyline pts={ring(outline)} closed color={main} width={stroke.sheet * (1 + pulse)} />
      </Svg>
    </AbsoluteFill>
  );
};
