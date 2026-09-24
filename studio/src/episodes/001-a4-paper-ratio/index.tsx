import React from "react";
import { AbsoluteFill, Html5Audio } from "remotion";
import { z } from "zod";
import cuesJson from "../../../../episodes/001-a4-paper-ratio/cues.json";
import narration from "../../../../episodes/001-a4-paper-ratio/narration.mp3";
import storyboardJson from "../../../../episodes/001-a4-paper-ratio/storyboard.json";
import { SafeAreaGuide } from "../../components/SafeAreaGuide";
import { StoryboardPlayer } from "../../storyboard/StoryboardPlayer";
import { Cues, Storyboard } from "../../storyboard/timeline";

// Episode 001: everything on screen comes from storyboard.json, every frame
// number from cues.json.
export const cues = cuesJson as Cues;
const storyboard = storyboardJson as Storyboard;

export const a4PaperRatioSchema = z.object({ showSafeArea: z.boolean() });

export const A4PaperRatio: React.FC<z.infer<typeof a4PaperRatioSchema>> = ({ showSafeArea }) => (
  <AbsoluteFill>
    <StoryboardPlayer storyboard={storyboard} cues={cues} />
    {/* Not @remotion/media's Audio: it ignores the MP3's encoder delay and
        plays the narration 46 ms late. */}
    <Html5Audio src={narration} />
    {showSafeArea ? <SafeAreaGuide /> : null}
  </AbsoluteFill>
);
