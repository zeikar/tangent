import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Html5Audio } from "remotion";
import { z } from "zod";
import { Logo } from "../brand/Logo";
import { SafeAreaGuide } from "../components/SafeAreaGuide";
import { Probe } from "../probe/Probe";
import { channelMark } from "../style/theme";
import { narrationSrc } from "./narration";
import { StoryboardPlayer } from "./StoryboardPlayer";
import { Cues, resolveCaptions, resolveTimeline, Storyboard } from "./timeline";

export const episodeSchema = z.object({
  showSafeArea: z.boolean(),
  // Scripts pass an episode folder's own storyboard.json and cues.json, so a
  // scratch copy renders without touching the imported defaults.
  storyboard: z.any().optional(),
  cues: z.any().optional(),
  // Log what every frame draws, for scripts/check-render.mts.
  probe: z.boolean().optional(),
});
type Props = z.infer<typeof episodeSchema>;

// The player's resolved timeline, without its easing functions.
const timelineOf = (storyboard: Storyboard, cues: Cues) => ({
  elements: resolveTimeline(storyboard, cues).map((e) => ({
    id: e.spec.id,
    component: e.spec.component,
    start: e.start,
    end: Number.isFinite(e.end) ? e.end : null,
    actions: e.actions.map((a) => ({ action: a.action, from: a.from, to: a.to })),
  })),
  captions: resolveCaptions(storyboard, cues),
});

// An episode's composition: everything on screen but the channel mark comes
// from storyboard.json, every frame number from cues.json, the audio from the
// narration build-cues.py wrote.
export const makeEpisode = (slug: string, defaults: { storyboard: Storyboard; cues: Cues }) => {
  const Component: React.FC<Props> = ({ showSafeArea, probe, ...props }) => {
    const storyboard = (props.storyboard ?? defaults.storyboard) as Storyboard;
    const cues = (props.cues ?? defaults.cues) as Cues;
    return (
      <AbsoluteFill>
        <StoryboardPlayer storyboard={storyboard} cues={cues} />
        <div
          data-el="logo"
          style={{
            position: "absolute",
            left: channelMark.left,
            top: channelMark.top,
            opacity: channelMark.opacity,
          }}
        >
          <Logo size={channelMark.size} />
        </div>
        {/* Not @remotion/media's Audio: it ignores the MP3's encoder delay and
            plays the narration 46 ms late. */}
        <Html5Audio src={narrationSrc(slug)} />
        {showSafeArea ? <SafeAreaGuide /> : null}
        {probe ? <Probe extra={timelineOf(storyboard, cues)} /> : null}
      </AbsoluteFill>
    );
  };
  const calculateMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
    durationInFrames: ((props.cues ?? defaults.cues) as Cues).durationInFrames,
  });
  return { Component, calculateMetadata };
};
