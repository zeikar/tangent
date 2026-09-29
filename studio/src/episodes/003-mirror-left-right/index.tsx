import cuesJson from "../../../../episodes/003-mirror-left-right/cues.json";
import storyboardJson from "../../../../episodes/003-mirror-left-right/storyboard.json";
import { makeEpisode } from "../../storyboard/Episode";
import { Cues, Storyboard } from "../../storyboard/timeline";

export const mirrorLeftRight = makeEpisode("003-mirror-left-right", {
  storyboard: storyboardJson as Storyboard,
  cues: cuesJson as Cues,
});
export const mirrorCues = cuesJson as Cues;
