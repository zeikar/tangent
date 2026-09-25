// Joins an episode's storyboard.json (what happens) with its cues.json (when)
// into per-element action lists. Scenes read timing from here only.
import { interpolateColors } from "remotion";
import type { PaperState } from "../components/PaperRect";
import { color, duration, ease } from "../style/theme";

type Anchor = { word: string; nth?: number } | { pause: true };

// Storyboard JSON is loosely typed; each component reads and checks its own.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Params = Record<string, any>;

export type StoryboardCue = {
  at: Anchor;
  target: string;
  action: string;
  params?: Params;
  speed?: string;
  until?: Anchor;
};

export type StoryboardElement = {
  id: string;
  component: string;
  visibleAtStart?: boolean;
  props: Params;
};

export type Storyboard = {
  beats: {
    id: string;
    captions: { text: string }[];
    elements: StoryboardElement[];
    cues: StoryboardCue[];
  }[];
};

export type Cues = {
  fps: number;
  durationInFrames: number;
  beats: {
    id: string;
    startFrame: number;
    endFrame: number;
    captions: { frame: number }[];
    cues: { target: string; action: string; word?: string; frame: number; untilFrame?: number }[];
  }[];
};

export type Action = {
  action: string;
  params: Params;
  from: number;
  to: number; // progress reaches 1 here
  ease: (t: number) => number;
};

export type ElementTimeline = {
  spec: StoryboardElement;
  start: number; // first frame the element exists (its beat's start)
  end: number; // first frame after its exit
  actions: Action[];
};

export type Caption = { text: string; from: number; to: number };

// What a component sees each frame: the frame, and other sheets' live state
// (Mismatch, Dimension, NumberLine and standAndFit read their geometry); `at`
// is the same view at another frame.
export type Scene = { frame: number; paper: (id: string) => PaperState; at: (frame: number) => Scene };

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

// Linear 0..1 through the action's span.
export const rawProgress = (a: Action, frame: number) =>
  a.to <= a.from ? (frame >= a.from ? 1 : 0) : clamp01((frame - a.from) / (a.to - a.from));

// Eased progress through [p0, p1] of the action's span.
export const phase = (a: Action, frame: number, p0 = 0, p1 = 1) =>
  a.ease(clamp01((rawProgress(a, frame) - p0) / (p1 - p0)));

// 0 → 1 → 0 over the action: pulses and flashes.
export const bump = (a: Action, frame: number) => Math.sin(Math.PI * phase(a, frame));

export const themeColor = (name: string): string => {
  const c = (color as Record<string, string>)[name];
  if (!c) throw new Error(`unknown theme color: ${name}`);
  return c;
};

export const mix = (a: string, b: string, t: number) =>
  t <= 0 ? a : t >= 1 ? b : interpolateColors(t, [0, 1], [a, b]);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Easing: out for entrances and exits (both start moving on their word),
// smooth for everything else, unless the cue asks for linear.
const easeFor = (c: StoryboardCue) =>
  c.params?.ease === "linear"
    ? ease.linear
    : c.action === "appear" || c.action === "reveal" || c.action === "exit"
      ? ease.out
      : ease.smooth;

export const resolveTimeline = (sb: Storyboard, cues: Cues): ElementTimeline[] => {
  if (sb.beats.length !== cues.beats.length) throw new Error("cues.json beats differ from storyboard");
  const elements = new Map<string, ElementTimeline>();
  sb.beats.forEach((beat, k) => {
    const timing = cues.beats[k];
    if (timing.id !== beat.id || timing.cues.length !== beat.cues.length) {
      throw new Error(`cues.json ${timing.id} does not match storyboard ${beat.id}; rebuild it`);
    }
    for (const spec of beat.elements) {
      elements.set(spec.id, { spec, start: timing.startFrame, end: Infinity, actions: [] });
    }
    const resolved = beat.cues.map((c, i) => {
      const t = timing.cues[i];
      // A cues.json from an older storyboard would silently play old timing.
      if (
        t.target !== c.target ||
        t.action !== c.action ||
        t.word !== ("word" in c.at ? c.at.word : undefined) ||
        (t.untilFrame === undefined) !== (c.until === undefined)
      ) {
        throw new Error(`cues.json ${beat.id} cue ${i} (${c.target}.${c.action}) is from another storyboard; rebuild it`);
      }
      const el = elements.get(c.target);
      if (!el) throw new Error(`${beat.id}: cue target ${c.target} is not declared`);
      // Exits are short whatever their speed, so an entrance waiting on them
      // (below) follows its word closely.
      const seconds = c.action === "exit" ? duration.exit : duration[(c.speed ?? "base") as keyof typeof duration];
      const len = t.untilFrame ?? t.frame + Math.round(seconds * cues.fps);
      if (Number.isNaN(len)) throw new Error(`${beat.id}: bad speed ${c.speed}`);
      return { el, action: { action: c.action, params: c.params ?? {}, from: t.frame, to: len, ease: easeFor(c) } };
    });
    // The one exception to "cues sharing an anchor run in parallel": an
    // entrance waits for the exits on its anchor, so new content never draws
    // over old content that is still fading out.
    for (const { action: a } of resolved) {
      if (a.action !== "appear" && a.action !== "reveal") continue;
      const exitsEnd = Math.max(
        a.from,
        ...resolved.filter((r) => r.action.action === "exit" && r.action.from === a.from).map((r) => r.action.to),
      );
      a.to += exitsEnd - a.from;
      a.from = exitsEnd;
    }
    for (const { el, action } of resolved) {
      el.actions.push(action);
      if (action.action === "exit") el.end = action.to;
    }
  });
  const list = [...elements.values()];
  // Actions apply in start order; cues sharing an anchor keep storyboard order.
  for (const el of list) el.actions.sort((a, b) => a.from - b.from);
  return list;
};

// Each caption shows from its anchor until the next caption starts.
export const resolveCaptions = (sb: Storyboard, cues: Cues): Caption[] => {
  const list = sb.beats.flatMap((beat, k) => {
    if (cues.beats[k].captions.length !== beat.captions.length) {
      throw new Error(`cues.json ${beat.id} captions differ from storyboard; rebuild it`);
    }
    return beat.captions.map((c, i) => ({ text: c.text, from: cues.beats[k].captions[i].frame }));
  });
  return list.map((c, i) => ({ ...c, to: list[i + 1]?.from ?? cues.durationInFrames }));
};
