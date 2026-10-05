import cuesJson from "../../../../episodes/005-hilbert-hotel/cues.json";
import storyboardJson from "../../../../episodes/005-hilbert-hotel/storyboard.json";
import { makeEpisode } from "../../storyboard/Episode";
import { Cues, Storyboard } from "../../storyboard/timeline";

export const hilbertHotel = makeEpisode("005-hilbert-hotel", {
  storyboard: storyboardJson as Storyboard,
  cues: cuesJson as Cues,
});
export const hilbertCues = cuesJson as Cues;
