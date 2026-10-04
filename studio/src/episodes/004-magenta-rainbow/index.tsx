import cuesJson from "../../../../episodes/004-magenta-rainbow/cues.json";
import storyboardJson from "../../../../episodes/004-magenta-rainbow/storyboard.json";
import { makeEpisode } from "../../storyboard/Episode";
import { Cues, Storyboard } from "../../storyboard/timeline";

export const magentaRainbow = makeEpisode("004-magenta-rainbow", {
  storyboard: storyboardJson as Storyboard,
  cues: cuesJson as Cues,
});
export const magentaCues = cuesJson as Cues;
