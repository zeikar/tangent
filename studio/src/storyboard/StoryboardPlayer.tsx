import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Captions } from "../components/Captions";
import { Dimension } from "../components/Dimension";
import { Equation } from "../components/Equation";
import { HalvingNest } from "../components/HalvingNest";
import { Mismatch } from "../components/Mismatch";
import { NumberLine } from "../components/NumberLine";
import { PaperRect, PaperState, paperState } from "../components/PaperRect";
import { color } from "../style/theme";
import { Cues, ElementTimeline, resolveCaptions, resolveTimeline, Scene, Storyboard } from "./timeline";

const components: Record<string, React.FC<{ el: ElementTimeline; scene: Scene }>> = {
  PaperRect,
  Mismatch,
  Equation,
  NumberLine,
  Dimension,
  HalvingNest,
};

// Draw order is declaration order, except a Mismatch goes beneath both of
// the sheets it compares.
const drawOrder = (elements: ElementTimeline[]) => {
  const order = elements.filter((e) => e.spec.component !== "Mismatch");
  for (const m of elements.filter((e) => e.spec.component === "Mismatch")) {
    const at = Math.min(...[m.spec.props.a, m.spec.props.b].map((id) => order.findIndex((e) => e.spec.id === id)));
    order.splice(at, 0, m);
  }
  return order;
};

// Plays an episode's storyboard: every element, alive from its beat's start
// to the end of its exit, driven by the cue frames in cues.json.
export const StoryboardPlayer: React.FC<{ storyboard: Storyboard; cues: Cues }> = ({ storyboard, cues }) => {
  const frame = useCurrentFrame();
  const elements = useMemo(() => resolveTimeline(storyboard, cues), [storyboard, cues]);
  const captions = useMemo(() => resolveCaptions(storyboard, cues), [storyboard, cues]);
  const order = useMemo(() => {
    for (const e of elements) {
      if (!components[e.spec.component]) throw new Error(`no component ${e.spec.component} for ${e.spec.id}`);
    }
    return drawOrder(elements);
  }, [elements]);

  const papers = new Map<string, PaperState>();
  const scene: Scene = {
    frame,
    paper: (id) => {
      let s = papers.get(id);
      if (!s) {
        const el = elements.find((e) => e.spec.id === id && e.spec.component === "PaperRect");
        if (!el) throw new Error(`${id} is not a PaperRect`);
        s = paperState(el, scene);
        papers.set(id, s);
      }
      return s;
    },
  };

  return (
    <AbsoluteFill style={{ background: color.bg }}>
      {order
        .filter((e) => frame >= e.start && frame < e.end)
        .map((e) => {
          const C = components[e.spec.component];
          return <C key={e.spec.id} el={e} scene={scene} />;
        })}
      <Captions captions={captions} frame={frame} fps={cues.fps} />
    </AbsoluteFill>
  );
};
