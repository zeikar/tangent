import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentScale } from "remotion";
import { Action, ElementTimeline, mix, phase, rawProgress, Scene, themeColor } from "../storyboard/timeline";
import { fontsLoaded } from "../style/fonts";
import { font, type } from "../style/theme";
import { glyphRect } from "./ink";
import { drawTokens, InkBox, matchTokens, moveOffset, schedule, texTokens, wrapTokens } from "./morph";
import { Tex } from "./Tex";

// One line of plain text with $...$ math, centered on a point by its ink.
// setText morphs it into the new line (morph.ts): words and math tokens the
// two share move, the rest fade. Spec: storyboard.json → components → Note.

type Props = { text: string; at: [number, number]; color?: string; mathColor?: string };

type Rel = { l: number; t: number; r: number; b: number }; // ink, relative to the line's top-left
type Metrics = { ink: Rel; tokens: Rel[] };
type Style = { color: string; opacity: number; dx: number; dy: number };

// A line's tokens in order: the words of its plain text and the TeX tokens of
// its math, keyed so a word never matches a math token.
const tokenKeys = (text: string) =>
  text.split("$").flatMap((seg, i) =>
    i % 2 ? texTokens(seg).map((t) => `m:${t}`) : seg.split(/\s+/).filter(Boolean).map((w) => `t:${w}`),
  );

// The line's content, each token addressable: data-tok marks for measuring,
// or each token's style for drawing. Whitespace stays plain text.
const Line: React.FC<{ text: string; styles?: Style[] }> = ({ text, styles }) => {
  let n = 0;
  return (
    <>
      {text.split("$").map((seg, i) => {
        if (i % 2) {
          const toks = texTokens(seg);
          const base = n;
          n += toks.length;
          const tex = styles
            ? drawTokens(toks.map((t, k) => ({ tex: t, ...styles[base + k] })))
            : wrapTokens(toks, (k) => `\\htmlData{tok=${base + k}}`);
          return <Tex key={i} tex={`\\displaystyle ${tex}`} trust name={seg} />;
        }
        return seg
          .split(/(\s+)/)
          .filter(Boolean)
          .map((w, j) => {
            if (/^\s+$/.test(w)) return w;
            const k = n++;
            const s = styles?.[k];
            return (
              <span
                key={`${i}-${j}`}
                data-tok={styles ? undefined : k}
                style={s && { color: s.color, opacity: s.opacity, position: "relative", left: s.dx, top: s.dy }}
              >
                {w}
              </span>
            );
          });
      })}
    </>
  );
};

const noteState = (el: ElementTimeline, frame: number) => {
  let opacity = el.spec.visibleAtStart ? 1 : 0;
  let text = (el.spec.props as Props).text;
  let change: { from: string; a: Action } | null = null; // a running setText
  for (const a of el.actions) {
    if (frame < a.from) break;
    switch (a.action) {
      case "appear":
        opacity = phase(a, frame);
        break;
      case "exit":
        opacity *= 1 - phase(a, frame);
        break;
      case "setText":
        change = rawProgress(a, frame) < 1 && a.params.text !== text ? { from: text, a } : null;
        text = a.params.text;
        break;
      default:
        throw new Error(`Note ${el.spec.id}: unknown action ${a.action}`);
    }
  }
  return { opacity, text, change };
};

export const Note: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const s = noteState(el, scene.frame);
  const scale = useCurrentScale();
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const [metrics, setMetrics] = useState(new Map<string, Metrics>());
  const texts = s.opacity > 0 ? (s.change ? [s.change.from, s.text] : [s.text]) : [];
  const missing = JSON.stringify(texts.filter((t) => !metrics.has(t)));
  useLayoutEffect(() => {
    const todo: string[] = JSON.parse(missing);
    if (!todo.length) return;
    const handle = delayRender(`measure note ${el.spec.id}`);
    fontsLoaded.then(() => {
      const next = new Map(metrics);
      for (const text of todo) {
        const node = nodes.current.get(text)!;
        const outer = node.getBoundingClientRect();
        const rel = (e: Element): Rel => {
          const r = glyphRect(e);
          return {
            l: (r.left - outer.left) / scale,
            t: (r.top - outer.top) / scale,
            r: (r.right - outer.left) / scale,
            b: (r.bottom - outer.top) / scale,
          };
        };
        const tokens: Rel[] = [];
        node.querySelectorAll<HTMLElement>("[data-tok]").forEach((e) => (tokens[Number(e.dataset.tok)] = rel(e)));
        next.set(text, { ink: rel(node), tokens });
      }
      setMetrics(next);
      continueRender(handle);
    });
  }, [missing, metrics, scale, el.spec.id]);
  if (!texts.length) return null;

  const lineStyle = {
    position: "absolute",
    whiteSpace: "nowrap",
    ...type.label,
    fontFamily: font.sans,
  } as const;
  // Hidden copies, measured once per text.
  const measuring = texts
    .filter((t) => !metrics.has(t))
    .map((t) => (
      <div
        key={`m-${t}`}
        ref={(n) => {
          if (n) nodes.current.set(t, n);
          else nodes.current.delete(t);
        }}
        style={{ ...lineStyle, left: 0, top: 0, visibility: "hidden" }}
      >
        <Line text={t} />
      </div>
    ));
  if (!texts.every((t) => metrics.has(t))) return <AbsoluteFill>{measuring}</AbsoluteFill>;

  const textColor = themeColor(p.color ?? "text");
  const mathColor = themeColor(p.mathColor ?? p.color ?? "text");
  const colors = (text: string) => tokenKeys(text).map((k) => (k.startsWith("m:") ? mathColor : textColor));
  // Top-left of a line whose ink is centered on `at`.
  const home = (text: string) => {
    const { ink } = metrics.get(text)!;
    return { left: p.at[0] - (ink.l + ink.r) / 2, top: p.at[1] - (ink.t + ink.b) / 2 };
  };
  const row = (text: string, styles: Style[], key: string) => (
    <div key={key} data-text="label" style={{ ...lineStyle, ...home(text) }}>
      <Line text={text} styles={styles} />
    </div>
  );

  if (!s.change) {
    const styles = colors(s.text).map((color) => ({ color, opacity: 1, dx: 0, dy: 0 }));
    return <AbsoluteFill style={{ opacity: s.opacity }}>{row(s.text, styles, s.text)}</AbsoluteFill>;
  }
  const { from, a } = s.change;
  const keys = [tokenKeys(from), tokenKeys(s.text)];
  const at = (text: string, k: number): InkBox => {
    const o = home(text);
    const b = metrics.get(text)!.tokens[k];
    return [o.left + b.l, o.top + b.t, o.left + b.r, o.top + b.b];
  };
  const pairs = matchTokens(keys[0], keys[1]);
  const moved = new Map(pairs.map(([i, j]) => [j, i])); // new token -> the old one it moves from
  const staying = new Set(pairs.map(([i]) => i));
  const w = schedule(
    keys[0].flatMap((_, k) => (staying.has(k) ? [] : [at(from, k)])),
    pairs.map(([i, j]): [InkBox, InkBox] => [at(from, i), at(s.text, j)]),
    keys[1].flatMap((_, k) => (moved.has(k) ? [] : [at(s.text, k)])),
    a.ease,
  );
  const out = 1 - phase(a, scene.frame, ...w.out);
  const move = phase(a, scene.frame, ...w.move);
  const enter = phase(a, scene.frame, ...w.in);
  const [fromColors, toColors] = [colors(from), colors(s.text)];
  const oldStyles = fromColors.map((color, k) => ({ color, opacity: staying.has(k) ? 0 : out, dx: 0, dy: 0 }));
  const newStyles = toColors.map((color, k) => {
    const i = moved.get(k);
    return i === undefined
      ? { color, opacity: enter, dx: 0, dy: 0 }
      : { color: mix(fromColors[i], color, move), opacity: 1, ...moveOffset(at(from, i), at(s.text, k), move) };
  });
  return (
    <AbsoluteFill style={{ opacity: s.opacity }}>
      {measuring}
      {row(from, oldStyles, `old-${from}`)}
      {row(s.text, newStyles, s.text)}
    </AbsoluteFill>
  );
};
