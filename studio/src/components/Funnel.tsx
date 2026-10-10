import React from "react";
import { AbsoluteFill } from "remotion";
import { ElementTimeline, phase, Scene } from "../storyboard/timeline";
import { color, counter, hotel, mark, stroke } from "../style/theme";
import { pointsAttr, roundedRectPoints } from "./geometry";
import { InkLine, InkTex, useInk, useTexInk } from "./InkText";
import { Lamp } from "./lamp";
import { lifecycle, Polyline, StraightArrow, Svg } from "./shapes";

// A stepped funnel of counts: centered tiers narrowing downward, one per
// filter, each with BaseCounter's lit lamp so it reads as the same filter,
// and what comes out at the bottom in a lit cell. Tiers are drawn as steps,
// not to scale. Spec: storyboard.json → components → Funnel.

type Tier = { y: number; w: number; label: string; count: string };
type Props = { x: number; height: number; tiers: Tier[]; output: { tex: string; y: number; cell: [w: number, h: number] } };

export const Funnel: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  const shown = p.tiers.map(() => 0);
  let output = { arrow: 0, cell: 0 };
  const { appear, out } = lifecycle(el, frame, (a) => {
    if (a.action === "reveal" && a.params.part === "output") {
      output = { arrow: phase(a, frame, 0, 0.5), cell: phase(a, frame, 0.4, 1) };
      return;
    }
    if (a.action !== "reveal") throw new Error(`Funnel ${el.spec.id}: unknown action ${a.action}`);
    const n = a.params.tier;
    if (!(n >= 1 && n <= p.tiers.length)) throw new Error(`Funnel ${el.spec.id}: no tier ${n}`);
    shown[n - 1] = phase(a, frame);
  });
  // appear is tier 1's reveal.
  shown[0] = Math.max(shown[0], appear);
  const visible = out > 0 && shown[0] > 0;

  const names = useInk(`funnel ${el.spec.id} names`, visible ? p.tiers.map((t) => t.label) : [], counter.name);
  const counts = useTexInk(`funnel ${el.spec.id} counts`, visible ? [...p.tiers.map((t) => t.count), "0"] : [], counter.tierCount);
  const result = useTexInk(`funnel ${el.spec.id} output`, visible ? [p.output.tex] : [], counter.output);
  if (!visible) return null;
  const measuring = [...names.measuring, ...counts.measuring, ...result.measuring];
  if (measuring.length) return <AbsoluteFill>{measuring}</AbsoluteFill>;

  const half = p.height / 2;
  // Each tier drops into place as it fades in.
  const tiers = p.tiers.map((t, i) => ({ ...t, y: t.y - counter.drop * (1 - shown[i]), shown: shown[i], l: p.x - t.w / 2, r: p.x + t.w / 2 }));
  const last = p.tiers[p.tiers.length - 1];
  const [cw, chh] = [p.output.cell[0] / 2, p.output.cell[1] / 2];
  const cell = [p.x - cw, p.output.y - chh, p.x + cw, p.output.y + chh] as [number, number, number, number];
  // Counts sit on their digits' ink, whatever a comma adds below it.
  const digit = counts.ink("0");
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Svg>
        {tiers.map((t, i) =>
          t.shown > 0 ? (
            <g key={i} opacity={t.shown}>
              <Polyline pts={roundedRectPoints([t.l, t.y - half, t.r, t.y + half], mark.boxRadius)} color={color.muted} width={stroke.line} closed />
              <Lamp at={[t.l + counter.tierLampX, t.y]} r={counter.tierLamp} lit={1} />
            </g>
          ) : null,
        )}
        <StraightArrow
          tail={[p.x, last.y + half + counter.outputGap]}
          deg={-90}
          length={counter.outputArrow * output.arrow}
          head={mark.head}
          color={color.muted}
          width={stroke.arrow}
        />
        {output.cell > 0 ? (
          <g opacity={output.cell}>
            <polygon points={pointsAttr(roundedRectPoints(cell, counter.cellRadius))} fill={color.yellow} fillOpacity={hotel.lit} />
            <Polyline pts={roundedRectPoints(cell, counter.cellRadius)} color={color.yellow} width={stroke.line} closed />
          </g>
        ) : null}
      </Svg>
      {tiers.map((t, i) => {
        if (t.shown <= 0) return null;
        const name = names.ink(t.label);
        const count = counts.ink(t.count);
        return (
          <React.Fragment key={i}>
            <InkLine
              text={t.label}
              ink={name}
              x={t.l + counter.tierNameX + (name.r - name.l) / 2}
              y={t.y}
              color={color.text}
              opacity={t.shown}
              fontSize={counter.name}
              kind="name"
            />
            <InkTex
              tex={t.count}
              ink={count}
              fontSize={counter.tierCount}
              x={t.r - counter.tierCountX - (count.r - count.l) / 2}
              y={t.y + (count.t + count.b) / 2 - (digit.t + digit.b) / 2}
              color={color.text}
              opacity={t.shown}
              kind="number"
            />
          </React.Fragment>
        );
      })}
      {output.cell > 0 ? (
        <InkTex
          tex={p.output.tex}
          ink={result.ink(p.output.tex)}
          fontSize={counter.output}
          x={p.x}
          y={p.output.y}
          color={color.text}
          opacity={output.cell}
          kind="number"
        />
      ) : null}
    </AbsoluteFill>
  );
};
