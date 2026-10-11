import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, phase, Scene } from "../storyboard/timeline";
import { color, counter, hotel, stroke } from "../style/theme";
import { fadeAt } from "./fade";
import { arcPoints, Pt, pointsAttr } from "./geometry";
import { InkTex, useTexInk } from "./InkText";
import { lifecycle, Polyline, Svg } from "./shapes";

// A searched range along a horizontal bar: a yellow dot at the found point,
// the bar to how far the search went (a tick), and a dashed continuation
// fading out past it, since the numbers go on. A search light sweeps the bar,
// turning it white behind it, and lights nothing. Spec: storyboard.json →
// components → ScanBar.

type Props = { from: Pt; to: Pt; tail: number; dot: { label: string; labelY: number } };

// The light reaches the tick at this share of the scan, then fades out there.
const ARRIVE = 0.85;

export const ScanBar: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  let draw = { dot: 0, bar: 0, tick: 0, dashes: 0 };
  let scan = 0; // how far the light has gone, 0..1
  let light = 0; // its opacity
  let pulse = 0;
  const { out } = lifecycle(el, frame, (a) => {
    if (a.action === "pulse" && a.params.part === "dot") pulse = Math.max(pulse, bump(a, frame));
    else if (a.action === "scan") {
      const t = phase(a, frame);
      scan = Math.min(1, t / ARRIVE);
      light = t < 1 ? 1 - Math.max(0, (t - ARRIVE) / (1 - ARRIVE)) : 0;
    } else throw new Error(`ScanBar ${el.spec.id}: unknown action ${a.action}`);
  });
  // Drawn from the dot: the bar, then the tick and the dashes.
  const appear = el.actions.find((a) => a.action === "appear");
  if (appear && frame >= appear.from) {
    draw = {
      dot: phase(appear, frame, 0, 0.25),
      bar: phase(appear, frame, 0.15, 0.7),
      tick: phase(appear, frame, 0.6, 0.8),
      dashes: phase(appear, frame, 0.7, 1),
    };
  }
  const visible = out > 0 && draw.dot > 0;
  const { ink, measuring } = useTexInk(`scan ${el.spec.id}`, visible ? [p.dot.label] : [], counter.scanLabel);
  if (!visible) return null;
  if (measuring.length) return <AbsoluteFill>{measuring}</AbsoluteFill>;

  const [x0, y] = p.from;
  const x1 = p.to[0];
  const end = lerp(x0, x1, draw.bar);
  const lightX = lerp(x0, x1, scan);
  const period = stroke.dash[0] + stroke.dash[1];
  // Dashes from one gap past the tick, each at the fade's opacity for its middle.
  const dashes: [number, number][] = [];
  for (let a = x1 + stroke.dash[1]; a < p.tail; a += period) dashes.push([a, Math.min(a + stroke.dash[0], p.tail)]);
  // The light's trail: pieces fading toward its tail, none behind the dot.
  const trail: { pts: Pt[]; opacity: number }[] = [];
  const pieces = Math.ceil(counter.scanTrail / hotel.fadeStep);
  for (let k = 0; k < pieces; k++) {
    const [a, b] = [lightX - ((k + 1) * counter.scanTrail) / pieces, lightX - (k * counter.scanTrail) / pieces];
    if (b <= x0) break;
    trail.push({ pts: [[Math.max(a, x0), y], [b, y]], opacity: light * (1 - (k + 0.5) / pieces) });
  }
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Svg>
        {draw.bar > 0 ? <Polyline pts={[[x0, y], [end, y]]} color={color.muted} width={stroke.sheet} /> : null}
        {scan > 0 ? <Polyline pts={[[x0, y], [Math.min(lightX, end), y]]} color={color.text} width={stroke.sheet} /> : null}
        {draw.tick > 0 ? (
          <Polyline
            pts={[[x1, y - counter.scanTick / 2], [x1, y + counter.scanTick / 2]]}
            color={color.text}
            width={stroke.line}
            opacity={draw.tick}
          />
        ) : null}
        {dashes.map(([a, b]) => {
          const o = fadeAt([x1, p.tail], (a + b) / 2) * draw.dashes;
          return o > 0 ? <Polyline key={a} pts={[[a, y], [b, y]]} color={color.muted} width={stroke.sheet} opacity={o} /> : null;
        })}
        {trail.map((t, k) => (
          <Polyline key={k} pts={t.pts} color={color.yellow} width={stroke.sheet} opacity={t.opacity} />
        ))}
        {light > 0 ? <polygon points={pointsAttr(arcPoints([lightX, y], counter.scanLight / 2, 0, 360))} fill={color.yellow} opacity={light} /> : null}
        {draw.dot > 0 ? (
          <polygon
            points={pointsAttr(arcPoints(p.from, counter.scanDot * lerp(1, counter.scanPulse, pulse), 0, 360))}
            fill={color.yellow}
            opacity={draw.dot}
          />
        ) : null}
      </Svg>
      <InkTex
        tex={p.dot.label}
        ink={ink(p.dot.label)}
        fontSize={counter.scanLabel}
        x={x0}
        y={p.dot.labelY}
        color={color.yellow}
        opacity={draw.dot}
        kind="label"
      />
    </AbsoluteFill>
  );
};
