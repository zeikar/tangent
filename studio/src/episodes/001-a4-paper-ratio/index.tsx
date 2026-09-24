import cuesJson from "../../../../episodes/001-a4-paper-ratio/cues.json";
import storyboardJson from "../../../../episodes/001-a4-paper-ratio/storyboard.json";
import { makeEpisode } from "../../storyboard/Episode";
import { Cues, Storyboard } from "../../storyboard/timeline";

export const a4PaperRatio = makeEpisode("001-a4-paper-ratio", {
  storyboard: storyboardJson as Storyboard,
  cues: cuesJson as Cues,
});
export const a4Cues = cuesJson as Cues;
