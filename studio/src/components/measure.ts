import { useLayoutEffect, useRef, useState } from "react";
import { cancelRender, continueRender, delayRender, useCurrentScale } from "remotion";
import { fontsLoaded } from "../style/fonts";
import { tokenInk } from "./ink";

// Measuring text in the browser: hidden copies are laid out, and their ink is
// read once the fonts are in, holding the render until it has been.

// A box relative to a copy's top-left, in composition pixels.
export type Rel = { l: number; t: number; r: number; b: number };
export type TextMetrics = { ink: Rel; tokens: (Rel | null)[] };
type ClientBox = { left: number; top: number; right: number; bottom: number };

// A throw while measuring fails the render instead of leaving it waiting.
export const measureAfterFonts = (label: string, measure: () => void) => {
  const handle = delayRender(label);
  fontsLoaded.then(measure).then(() => continueRender(handle), cancelRender);
};

// Ink (as `inkOf` finds it) and per-token ink of each text, measured once per
// text from a hidden copy the caller renders with ref={copyRef(text)} while
// the text isn't in `metrics` yet.
export const useTextMetrics = (label: string, texts: string[], inkOf: (node: Element) => ClientBox) => {
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const scale = useCurrentScale();
  const [metrics, setMetrics] = useState(new Map<string, TextMetrics>());
  const missing = JSON.stringify(texts.filter((t) => !metrics.has(t)));
  useLayoutEffect(() => {
    const todo: string[] = JSON.parse(missing);
    if (!todo.length) return;
    measureAfterFonts(`measure ${label}: ${todo.join(", ")}`, () => {
      const next = new Map(metrics);
      for (const t of todo) {
        const node = nodes.current.get(t)!;
        const outer = node.getBoundingClientRect();
        const rel = (r: ClientBox): Rel => ({
          l: (r.left - outer.left) / scale,
          t: (r.top - outer.top) / scale,
          r: (r.right - outer.left) / scale,
          b: (r.bottom - outer.top) / scale,
        });
        const tokens: (Rel | null)[] = [];
        node.querySelectorAll<HTMLElement>("[data-tok]").forEach((e) => {
          const r = tokenInk(e);
          tokens[Number(e.dataset.tok)] = r && rel(r);
        });
        next.set(t, { ink: rel(inkOf(node)), tokens });
      }
      setMetrics(next);
    });
  }, [missing, metrics, scale, label, inkOf]);
  const copyRef = (t: string) => (n: HTMLDivElement | null) => {
    if (n) nodes.current.set(t, n);
    else nodes.current.delete(t);
  };
  return { metrics, copyRef };
};
