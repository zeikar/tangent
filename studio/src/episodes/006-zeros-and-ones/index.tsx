import cuesJson from "../../../../episodes/006-zeros-and-ones/cues.json";
import storyboardJson from "../../../../episodes/006-zeros-and-ones/storyboard.json";
import { makeEpisode } from "../../storyboard/Episode";
import { Cues, Storyboard } from "../../storyboard/timeline";

export const zerosAndOnes = makeEpisode("006-zeros-and-ones", {
  storyboard: storyboardJson as Storyboard,
  cues: cuesJson as Cues,
});
export const zerosCues = cuesJson as Cues;
