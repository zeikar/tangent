import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Arrow } from "../components/Arrow";
import { Body } from "../components/Body";
import { bodyState } from "../components/bodies";
import { Captions } from "../components/Captions";
import { Compass } from "../components/Compass";
import { Dimension } from "../components/Dimension";
import { Equation } from "../components/Equation";
import { HalvingNest } from "../components/HalvingNest";
import { Mismatch } from "../components/Mismatch";
import { Note } from "../components/Note";
import { NumberLine } from "../components/NumberLine";
import { OrbitPath } from "../components/OrbitPath";
import { PaperRect, paperState } from "../components/PaperRect";
import { RimTrace } from "../components/RimTrace";
import { SpinArrow } from "../components/SpinArrow";
import { StarField } from "../components/StarField";
import { Tether, tetherState } from "../components/Tether";
import { color } from "../style/theme";
import { Cues, ElementTimeline, Params, resolveCaptions, resolveTimeline, Scene, Storyboard } from "./timeline";

type Component = {
  draw: React.FC<{ el: ElementTimeline; scene: Scene }>;
  // The live state it exposes to other elements (scene.state).
  state?: (el: ElementTimeline, scene: Scene) => unknown;
  // The elements it is drawn beneath; otherwise it draws in declaration order.
  beneath?: (props: Params) => string[];
};

const components: Record<string, Component> = {
  PaperRect: { draw: PaperRect, state: paperState },
  Mismatch: { draw: Mismatch, beneath: (p) => [p.a, p.b] },
  Equation: { draw: Equation },
  NumberLine: { draw: NumberLine },
  Dimension: { draw: Dimension },
  HalvingNest: { draw: HalvingNest },
  Note: { draw: Note },
  Body: { draw: Body, state: bodyState },
  OrbitPath: { draw: OrbitPath },
  Tether: { draw: Tether, state: tetherState },
  RimTrace: { draw: RimTrace },
  Compass: { draw: Compass },
  StarField: { draw: StarField },
  SpinArrow: { draw: SpinArrow },
  Arrow: { draw: Arrow },
};

// Draw order is declaration order, except that an element drawn beneath
// others goes just below the first of them.
const drawOrder = (elements: ElementTimeline[]) => {
  const under = (e: ElementTimeline) => components[e.spec.component].beneath?.(e.spec.props);
  const order = elements.filter((e) => !under(e));
  for (const m of elements.filter(under)) {
    const at = under(m)!.map((id) => {
      const i = order.findIndex((e) => e.spec.id === id);
      if (i < 0) throw new Error(`${m.spec.id} is drawn beneath ${id}, which is not declared`);
      return i;
    });
    order.splice(Math.min(...at), 0, m);
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

  const byId = useMemo(() => new Map(elements.map((e) => [e.spec.id, e])), [elements]);

  // Each element's state is computed once per frame, on first read.
  const sceneAt = (f: number): Scene => {
    const states = new Map<string, unknown>();
    const reading = new Set<string>();
    const scene: Scene = {
      frame: f,
      elements,
      state: (id, component) => {
        const el = byId.get(id);
        const expose = el?.spec.component === component ? components[component].state : undefined;
        if (!el || !expose) throw new Error(`${id} is not a ${component}`);
        if (!states.has(id)) {
          if (reading.has(id)) throw new Error(`${id}'s state depends on itself`);
          reading.add(id);
          states.set(id, expose(el, scene));
          reading.delete(id);
        }
        return states.get(id);
      },
      at: sceneAt,
    };
    return scene;
  };
  const scene = sceneAt(frame);

  return (
    <AbsoluteFill style={{ background: color.bg }}>
      {order
        .filter((e) => frame >= e.start && frame < e.end)
        .map((e) => {
          const C = components[e.spec.component].draw;
          // data-el: the element a frame's pixels belong to, for the probe.
          return (
            <div key={e.spec.id} data-el={e.spec.id} style={{ position: "absolute", inset: 0 }}>
              <C el={e} scene={scene} />
            </div>
          );
        })}
      <div data-el="captions" style={{ position: "absolute", inset: 0 }}>
        <Captions captions={captions} frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
