import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentScale } from "remotion";
import { ElementTimeline, lerp, phase, rawProgress, Scene, themeColor } from "../storyboard/timeline";
import { fontsLoaded } from "../style/fonts";
import { ease, font, type } from "../style/theme";
import { glyphRect } from "./ink";
import { Tex } from "./Tex";

// One line of plain text with $...$ math, centered on a point by its ink.
// Spec: storyboard.json → components → Note.

type Props = { text: string; at: [number, number]; color?: string; mathColor?: string };

// A line's ink box and baseline, relative to the line's own top-left corner.
type Metrics = { l: number; t: number; r: number; b: number; baseline: number };

const noteState = (el: ElementTimeline, frame: number) => {
  let opacity = el.spec.visibleAtStart ? 1 : 0;
  let text = (el.spec.props as Props).text;
  let old: string | null = null; // the line a running setText fades out
  let e = 1; // its crossfade
  let slide = 1; // its shared left edge, old line's to new line's
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
        old = rawProgress(a, frame) < 1 && a.params.text !== text ? text : null;
        e = phase(a, frame);
        // The edge moves at once and settles, ahead of the fade: a wider new
        // line starting from the old line's left edge would otherwise reach
        // past its resting right end while it shows.
        slide = ease.out(rawProgress(a, frame));
        text = a.params.text;
        break;
      default:
        throw new Error(`Note ${el.spec.id}: unknown action ${a.action}`);
    }
  }
  const lines = old === null ? [{ text, opacity: 1 }] : [{ text: old, opacity: 1 - e }, { text, opacity: e }];
  return { opacity, lines, slide };
};

export const Note: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const s = noteState(el, scene.frame);
  const scale = useCurrentScale();
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const [metrics, setMetrics] = useState(new Map<string, Metrics>());
  const shown = s.opacity > 0 ? s.lines : [];
  const missing = JSON.stringify(shown.map((l) => l.text).filter((t) => !metrics.has(t)));
  useLayoutEffect(() => {
    const texts: string[] = JSON.parse(missing);
    if (!texts.length) return;
    const handle = delayRender(`measure note ${el.spec.id}`);
    fontsLoaded.then(() => {
      const next = new Map(metrics);
      for (const text of texts) {
        const node = nodes.current.get(text)!;
        const outer = node.getBoundingClientRect();
        const ink = glyphRect(node);
        const baseline = node.querySelector("[data-baseline]")!.getBoundingClientRect().top;
        next.set(text, {
          l: (ink.left - outer.left) / scale,
          t: (ink.top - outer.top) / scale,
          r: (ink.right - outer.left) / scale,
          b: (ink.bottom - outer.top) / scale,
          baseline: (baseline - outer.top) / scale,
        });
      }
      setMetrics(next);
      continueRender(handle);
    });
  }, [missing, metrics, scale, el.spec.id]);
  if (!shown.length) return null;

  // Where a line's ink left edge and baseline sit when its ink is centered on `at`.
  const [x, y] = p.at;
  const home = (m: Metrics) => ({ x: x - (m.r - m.l) / 2, y: y - (m.t + m.b) / 2 + m.baseline });
  const ms = shown.map((l) => metrics.get(l.text));
  // While setText runs, both lines share one left edge and baseline, sliding
  // from the old line's to the new one's, so words they share stay in place.
  const origin = ms.every((m): m is Metrics => !!m)
    ? ms.length === 2
      ? { x: lerp(home(ms[0]).x, home(ms[1]).x, s.slide), y: lerp(home(ms[0]).y, home(ms[1]).y, s.slide) }
      : home(ms[0])
    : null;
  const textColor = themeColor(p.color ?? "text");
  const mathColor = themeColor(p.mathColor ?? p.color ?? "text");
  return (
    <AbsoluteFill style={{ opacity: s.opacity }}>
      {shown.map((l, i) => (
        <div
          key={l.text}
          ref={(n) => {
            if (n) nodes.current.set(l.text, n);
            else nodes.current.delete(l.text);
          }}
          data-text="label"
          style={{
            position: "absolute",
            left: origin ? origin.x - ms[i]!.l : 0,
            top: origin ? origin.y - ms[i]!.baseline : 0,
            opacity: origin ? l.opacity : 0,
            whiteSpace: "nowrap",
            ...type.label,
            fontFamily: font.sans,
            color: textColor,
          }}
        >
          <span data-baseline style={{ display: "inline-block", width: 0, height: 0 }} />
          {/* Display style, as in captions, so a fraction keeps full-size digits. */}
          {l.text.split("$").map((seg, k) =>
            k % 2 ? (
              <Tex key={k} tex={`\\displaystyle ${seg}`} color={mathColor} />
            ) : (
              <React.Fragment key={k}>{seg}</React.Fragment>
            ),
          )}
        </div>
      ))}
    </AbsoluteFill>
  );
};
