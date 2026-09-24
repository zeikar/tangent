import React from "react";
import { AbsoluteFill } from "remotion";
import { bump, ElementTimeline, lerp, mix, phase, rawProgress, Scene, themeColor } from "../storyboard/timeline";
import { color, fill, font, stroke, type, VIDEO } from "../style/theme";
import { Anchored } from "./Anchored";
import { Box, SheetName, SheetShape } from "./PaperRect";
import { Tex } from "./Tex";

// A sheet halved again and again (the A-series picture). Each cut crosses the
// kept piece's long side; the set-aside half keeps its outline and gets that
// level's label. The kept piece renders exactly like a default PaperRect, so
// focusKept can hand off to one pixel for pixel.

type Props = {
  center: [number, number];
  w: number;
  h: number;
  name?: string;
  sub?: string;
  labels: string[];
  stroke?: string;
};

type Rect = { l: number; t: number; r: number; b: number };
type Level = { cut: [number, number, number, number]; aside: Rect; kept: Rect };

const toBox = (r: Rect): Box => ({ cx: (r.l + r.r) / 2, cy: (r.t + r.b) / 2, w: r.r - r.l, h: r.b - r.t });

// Portrait pieces are cut horizontally (keep the bottom), landscape ones
// vertically (keep the right).
const levelsOf = (sheet: Rect, n: number): Level[] => {
  const out: Level[] = [];
  let kept = sheet;
  for (let i = 0; i < n; i++) {
    if (kept.b - kept.t >= kept.r - kept.l) {
      const y = (kept.t + kept.b) / 2;
      out.push({ cut: [kept.l, y, kept.r, y], aside: { ...kept, b: y }, kept: { ...kept, t: y } });
    } else {
      const x = (kept.l + kept.r) / 2;
      out.push({ cut: [x, kept.t, x, kept.b], aside: { ...kept, r: x }, kept: { ...kept, l: x } });
    }
    kept = out[i].kept;
  }
  return out;
};

export const HalvingNest: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const { frame } = scene;
  const p = el.spec.props as Props;
  const strokeColor = themeColor(p.stroke ?? "text");
  const sheet: Rect = { l: p.center[0] - p.w / 2, t: p.center[1] - p.h / 2, r: p.center[0] + p.w / 2, b: p.center[1] + p.h / 2 };
  const levels = levelsOf(sheet, p.labels.length);

  let opacity = 0;
  let draw = 0;
  let content = 0;
  let titleOpacity = 1; // name and sub
  const cut = levels.map(() => 0); // share of each cut line drawn
  const labelIn = levels.map(() => 0);
  let focus = 0;
  let focusTarget: Box | null = null;
  let focusName: string | null = null;
  let keptStroke = strokeColor;
  let splitLevels = 0;
  for (const a of el.actions) {
    if (frame < a.from) break;
    const e = phase(a, frame);
    switch (a.action) {
      case "appear":
        opacity = 1;
        draw = phase(a, frame, 0, 0.7);
        content = phase(a, frame, 0.7, 1);
        break;
      case "split": {
        // Levels run back to back over the cue's span: cut line, then label.
        // A later split continues from the levels earlier ones cut.
        const n = a.params.levels;
        if (splitLevels + n > levels.length) throw new Error(`HalvingNest ${el.spec.id}: more levels than labels`);
        const t = rawProgress(a, frame) * n;
        for (let i = 0; i < n; i++) {
          const local = Math.min(Math.max(t - i, 0), 1);
          cut[splitLevels + i] = a.ease(Math.min(local / 0.6, 1));
          labelIn[splitLevels + i] = a.ease(Math.max((local - 0.6) / 0.4, 0));
        }
        splitLevels += n;
        titleOpacity = 1 - cut[0];
        break;
      }
      case "pulseKept":
        keptStroke = mix(strokeColor, themeColor(a.params.color), bump(a, frame));
        break;
      case "focusKept":
        focus = e;
        focusTarget = { cx: a.params.center[0], cy: a.params.center[1], w: a.params.w, h: a.params.h };
        focusName = a.params.name;
        break;
      case "exit":
        opacity *= 1 - e;
        break;
      default:
        throw new Error(`HalvingNest ${el.spec.id}: unknown action ${a.action}`);
    }
  }
  if (opacity <= 0) return null;

  const done = cut.filter((c) => c >= 1).length;
  const keptRect = done ? levels[done - 1].kept : sheet;
  const keptFrom = toBox(keptRect);
  const kept = focusTarget
    ? {
        cx: lerp(keptFrom.cx, focusTarget.cx, focus),
        cy: lerp(keptFrom.cy, focusTarget.cy, focus),
        w: lerp(keptFrom.w, focusTarget.w, focus),
        h: lerp(keptFrom.h, focusTarget.h, focus),
      }
    : keptFrom;
  const last = levels.length - 1;
  const keptLabel = labelIn[last] > 0 ? p.labels[last] : null;
  const restOpacity = opacity * (1 - focus);
  const plain = { color: strokeColor, width: stroke.sheet };
  const edge = { color: keptStroke, width: stroke.sheet };
  const line = (c: [number, number, number, number], share: number, key: number) => (
    <line
      key={key}
      x1={c[0]}
      y1={c[1]}
      x2={lerp(c[0], c[2], share)}
      y2={lerp(c[1], c[3], share)}
      stroke={strokeColor}
      strokeWidth={stroke.sheet}
      strokeLinecap="square"
    />
  );
  const rectPath = (r: Rect) => `M${r.l},${r.t}H${r.r}V${r.b}H${r.l}Z`;
  return (
    <AbsoluteFill>
      {restOpacity > 0 ? (
        <AbsoluteFill style={{ opacity: restOpacity }}>
          <svg width={VIDEO.width} height={VIDEO.height}>
            {/* Everything but the kept piece, which draws its own fill. */}
            <path
              d={`${rectPath(sheet)} ${rectPath(keptRect)}`}
              fillRule="evenodd"
              fill={strokeColor}
              fillOpacity={fill.sheet * content}
            />
            <SheetShape
              box={toBox(sheet)}
              edges={[plain, plain, plain, plain]}
              draw={draw}
              fill={strokeColor}
              fillOpacity={0}
            />
            {levels.map((lv, i) => (cut[i] > 0 ? line(lv.cut, cut[i], i) : null))}
          </svg>
          {levels.slice(0, last).map((lv, i) => (
            <Anchored key={i} x={toBox(lv.aside).cx} y={toBox(lv.aside).cy} anchor="center" opacity={labelIn[i]}>
              <div style={{ ...type.label, fontFamily: font.sans, color: color.muted }}>{p.labels[i]}</div>
            </Anchored>
          ))}
          {p.name && titleOpacity > 0 ? (
            <Anchored x={p.center[0]} y={p.center[1]} anchor="center" opacity={titleOpacity * content}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ ...type.label, fontFamily: font.sans, color: color.text }}>{p.name}</div>
                {p.sub ? <Tex tex={p.sub} color={color.muted} /> : null}
              </div>
            </Anchored>
          ) : null}
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ opacity }}>
        <svg width={VIDEO.width} height={VIDEO.height}>
          <SheetShape
            box={kept}
            edges={[edge, edge, edge, edge]}
            draw={draw}
            fill={strokeColor}
            fillOpacity={fill.sheet * content}
          />
        </svg>
        {keptLabel !== null && focusName !== null && focusName !== keptLabel ? (
          <>
            <SheetName box={kept} text={keptLabel} opacity={labelIn[last] * (1 - focus)} />
            <SheetName box={kept} text={focusName} opacity={focus} />
          </>
        ) : keptLabel !== null ? (
          <SheetName box={kept} text={keptLabel} opacity={labelIn[last]} />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
