import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, mix, phase, Scene } from "../storyboard/timeline";
import { color, counter, hotel, stroke } from "../style/theme";
import { lerpPt, Pt, pointsAttr, roundedRectPoints } from "./geometry";
import { InkTex, useTexInk } from "./InkText";
import { lifecycle, Polyline, Svg } from "./shapes";

// A sequence's terms side by side in a row of cells, with an open (dashed)
// cell for the term nobody knows. The whole row moves and scales about its
// center; its strokes and dashes keep their px. Spec: storyboard.json →
// components → Sequence.

type Props = {
  terms: string[]; // TeX, in order; cells are addressed by their term
  open: string; // the term whose cell is dashed
  center: Pt;
  size: number; // TeX px at scale 1
  cell: [w: number, h: number]; // a one-character term's cell
  wide: number; // a longer term's cell width
  gap: number;
};

type Cell = { term: string; opacity: number; lit: number; pulse: number; blink: number };

export type SequenceState = { center: Pt; scale: number; cells: Cell[] };

const picked = (p: Props, cells: unknown, id: string): string[] => {
  const list = cells === "all" ? p.terms : cells;
  if (!Array.isArray(list)) throw new Error(`Sequence ${id}: cells must be all or a list of terms`);
  for (const t of list) if (!p.terms.includes(t)) throw new Error(`Sequence ${id}: no cell ${t}`);
  return list;
};

export const sequenceState = (el: ElementTimeline, scene: Scene): SequenceState => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  let center = p.center;
  let scale = 1;
  const cells: Cell[] = p.terms.map((term) => ({ term, opacity: 1, lit: 0, pulse: 0, blink: 1 }));
  const each = (list: unknown, f: (c: Cell) => void) => {
    const terms = picked(p, list, el.spec.id);
    for (const c of cells) if (terms.includes(c.term)) f(c);
  };
  lifecycle(el, frame, (a) => {
    const q = a.params;
    const t = phase(a, frame);
    switch (a.action) {
      case "moveTo":
        center = lerpPt(center, q.center, t);
        scale = lerp(scale, q.scale ?? scale, t);
        break;
      case "setStyle":
        each(q.cells, (c) => (c.opacity = lerp(c.opacity, q.opacity, t)));
        break;
      case "light":
        each(q.cells, (c) => (c.lit = lerp(c.lit, 1, t)));
        break;
      case "unlight":
        each(q.cells, (c) => (c.lit = lerp(c.lit, 0, t)));
        break;
      case "pulse":
        each(q.cells, (c) => (c.pulse = Math.max(c.pulse, bump(a, frame))));
        break;
      case "blink": {
        // `times` dips to counter.blink and back, ending at rest.
        const dip = Math.sin(Math.PI * (q.times ?? 1) * t) ** 2;
        each(q.cells, (c) => (c.blink *= 1 - (1 - counter.blink) * dip));
        break;
      }
      default:
        throw new Error(`Sequence ${el.spec.id}: unknown action ${a.action}`);
    }
  });
  return { center, scale, cells };
};

// Each cell's box at a center and scale.
const layout = (p: Props, [cx, cy]: Pt, s: number) => {
  const widths = p.terms.map((t) => (t.length > 1 ? p.wide : p.cell[0]));
  const starts = widths.map((_, i) => widths.slice(0, i).reduce((a, w) => a + w + p.gap, 0));
  const total = starts[starts.length - 1] + widths[widths.length - 1];
  const at = (u: number) => cx + (u - total / 2) * s;
  const [top, bottom] = [cy - (p.cell[1] / 2) * s, cy + (p.cell[1] / 2) * s];
  return starts.map((u, i) => [at(u), top, at(u + widths[i]), bottom] as [number, number, number, number]);
};

export const Sequence: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const s = scene.state(el.spec.id, "Sequence") as SequenceState;
  const { ink, measuring } = useTexInk(`sequence ${el.spec.id}`, p.terms, p.size);
  if (measuring.length) return <AbsoluteFill>{measuring}</AbsoluteFill>;

  const boxes = layout(p, s.center, s.scale);
  // A lit cell is at full opacity whatever setStyle set.
  const shown = (c: Cell) => lerp(c.opacity, 1, c.lit) * c.blink;
  return (
    <AbsoluteFill>
      <Svg>
        {s.cells.map((c, i) => {
          const [l, t, r, b] = boxes[i];
          // A pulse thickens the outline inward.
          const width = lerp(stroke.line, counter.cellPulse, c.pulse);
          const k = (width - stroke.line) / 2;
          const radius = counter.cellRadius * s.scale;
          const ring = roundedRectPoints([l + k, t + k, r - k, b - k], Math.max(0, radius - k));
          return (
            <g key={c.term} opacity={shown(c)}>
              {c.lit > 0 ? (
                <polygon points={pointsAttr(roundedRectPoints([l, t, r, b], radius))} fill={color.yellow} fillOpacity={hotel.lit * c.lit} />
              ) : null}
              <Polyline
                pts={ring}
                color={mix(color.text, color.yellow, c.lit)}
                width={width}
                closed={c.term !== p.open}
                dash={c.term === p.open ? stroke.dash : undefined}
              />
            </g>
          );
        })}
      </Svg>
      {s.cells.map((c, i) => {
        const [l, t, r, b] = boxes[i];
        const k = ink(c.term);
        // A pulsed term grows, but stays termGap inside the pulsed outline.
        const room = (span: number, ink: number) => (span - 2 * (counter.cellPulse + counter.termGap)) / (ink * s.scale);
        const grow = Math.max(1, Math.min(counter.termPulse, room(r - l, k.r - k.l), room(b - t, k.b - k.t)));
        return (
          <InkTex
            key={c.term}
            tex={c.term}
            ink={k}
            fontSize={p.size}
            x={(l + r) / 2}
            y={(t + b) / 2}
            color={color.text}
            opacity={shown(c)}
            scale={s.scale * lerp(1, grow, c.pulse)}
            kind="term"
          />
        );
      })}
    </AbsoluteFill>
  );
};
