// Refuses to render an episode whose cues.json was built from a different
// storyboard.json: its frame numbers would silently play the old timing.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const assertCuesFresh = (episode: string) => {
  const hash = createHash("sha256").update(readFileSync(join(episode, "storyboard.json"))).digest("hex");
  const cues = JSON.parse(readFileSync(join(episode, "cues.json"), "utf8"));
  if (cues.storyboardSha256 !== hash) {
    throw new Error(`${episode}/cues.json is from another storyboard.json; rerun scripts/build-cues.py`);
  }
  return cues;
};
