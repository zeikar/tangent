import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentScale } from "remotion";
import { Action, ElementTimeline, mix, phase, rawProgress, Scene, themeColor } from "../storyboard/timeline";
import { fontsLoaded } from "../style/fonts";
import { font, type } from "../style/theme";
import { glyphRect, tokenInk } from "./ink";
import { drawTokens, InkBox, matchTokens, morph, tokenize, TokenStyle, withAlpha } from "./morph";
import { Tex } from "./Tex";

// One line of plain text with $...$ math, centered on a point by its ink.
// setText morphs it into the new line (morph.ts): words and math tokens the
// two share move, the rest fade. Spec: storyboard.json → components → Note.

type Props = { text: string; at: [number, number]; color?: string; mathColor?: string };

type Rel = { l: number; t: number; r: number; b: number }; // ink, relative to the line's top-left
type Metrics = { ink: Rel; tokens: (Rel | null)[] };

// A line's tokens in order: the words of its plain text and the TeX tokens of
// its math (their containers renumbered line-wide), keyed so a word never
// matches a math token.
const lineTokens = (text: string) => {
  const out: { key: string; parent: number | null; math: boolean }[] = [];
  text.split("$").forEach((seg, i) => {
    if (i % 2) {
      const t = tokenize(seg);
      const base = out.length;
      t.keys.forEach((key, k) => out.push({ key: `m:${key}`, parent: t.parents[k] === null ? null : base + t.parents[k]!, math: true }));
    } else {
      for (const w of seg.split(/\s+/).filter(Boolean)) out.push({ key: `t:${w}`, parent: null, math: false });
    }
  });
  return out;
};

// The line's content, each token addressable: data-tok marks for measuring,
// or each token's style for drawing. Whitespace stays plain text.
const Line: React.FC<{ text: string; styles?: TokenStyle[] }> = ({ text, styles }) => {
  let n = 0;
  return (
    <>
      {text.split("$").map((seg, i) => {
        if (i % 2) {
          const t = tokenize(seg);
          const base = n;
          n += t.keys.length;
          const tex = styles
            ? drawTokens(t, styles.slice(base, n))
            : t.tex((k) => `\\htmlData{tok=${base + k}}`);
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
                style={s && { color: withAlpha(s.color, s.opacity), position: "relative", left: s.dx, top: s.dy }}
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
        const rel = (r: { left: number; top: number; right: number; bottom: number }): Rel => {
          return {
            l: (r.left - outer.left) / scale,
            t: (r.top - outer.top) / scale,
            r: (r.right - outer.left) / scale,
            b: (r.bottom - outer.top) / scale,
          };
        };
        const tokens: (Rel | null)[] = [];
        node.querySelectorAll<HTMLElement>("[data-tok]").forEach((e) => {
          const r = tokenInk(e);
          tokens[Number(e.dataset.tok)] = r && rel(r);
        });
        next.set(text, { ink: rel(glyphRect(node)), tokens });
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
  const colors = (text: string) => lineTokens(text).map((t) => (t.math ? mathColor : textColor));
  // Top-left of a line whose ink is centered on `at`.
  const home = (text: string) => {
    const { ink } = metrics.get(text)!;
    return { left: p.at[0] - (ink.l + ink.r) / 2, top: p.at[1] - (ink.t + ink.b) / 2 };
  };
  const row = (text: string, styles: TokenStyle[], key: string) => (
    <div key={key} data-text="label" style={{ ...lineStyle, ...home(text) }}>
      <Line text={text} styles={styles} />
    </div>
  );

  if (!s.change) {
    const styles = colors(s.text).map((color) => ({ color, opacity: 1, dx: 0, dy: 0 }));
    return <AbsoluteFill style={{ opacity: s.opacity }}>{row(s.text, styles, s.text)}</AbsoluteFill>;
  }
  const { from, a } = s.change;
  const flat = (text: string, tag: string) => {
    const o = home(text);
    const m = metrics.get(text)!;
    return lineTokens(text).map((t, k) => {
      const b = m.tokens[k];
      return {
        key: t.key,
        id: `${tag}${k}`,
        parent: t.parent === null ? null : `${tag}${t.parent}`,
        box: b && ([o.left + b.l, o.top + b.t, o.left + b.r, o.top + b.b] as InkBox),
      };
    });
  };
  const src = flat(from, "o");
  const dst = flat(s.text, "n");
  const matched = matchTokens(
    src.map((t) => t.key),
    dst.map((t) => t.key),
  );
  const r = morph(src, dst, matched, (p0, p1) => phase(a, scene.frame, p0, p1), a.ease);
  const [fromColors, toColors] = [colors(from), colors(s.text)];
  const oldStyles = fromColors.map((color, k) => ({ color, opacity: r.old[k], dx: 0, dy: 0 }));
  const newStyles = toColors.map((color, k) => {
    const n = r.new[k];
    return { color: n.source === null ? color : mix(fromColors[n.source], color, r.move), opacity: n.opacity, dx: n.dx, dy: n.dy };
  });
  return (
    <AbsoluteFill style={{ opacity: s.opacity }}>
      {measuring}
      {row(from, oldStyles, `old-${from}`)}
      {row(s.text, newStyles, s.text)}
    </AbsoluteFill>
  );
};
