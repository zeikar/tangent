import cuesJson from "../../../../episodes/002-moon-rotation/cues.json";
import storyboardJson from "../../../../episodes/002-moon-rotation/storyboard.json";
import { makeEpisode } from "../../storyboard/Episode";
import { Cues, Storyboard } from "../../storyboard/timeline";

export const moonRotation = makeEpisode("002-moon-rotation", {
  storyboard: storyboardJson as Storyboard,
  cues: cuesJson as Cues,
});
export const moonCues = cuesJson as Cues;
