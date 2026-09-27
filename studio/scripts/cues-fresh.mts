// Refuses to render an episode whose cues.json was built from a different
// storyboard.json or take: its frame numbers would silently play the old
// timing, or another take's.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sha256 = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

// Why cues.json doesn't match the episode's storyboard.json and approved take
// (narration.json's source and its .words.json); empty if it does.
export const cuesStale = (episode: string, cues: { storyboardSha256?: string; narrationSource?: string; takeWordsSha256?: string }) => {
  const problems: string[] = [];
  if (cues.storyboardSha256 !== sha256(join(episode, "storyboard.json"))) problems.push("was built from another storyboard.json");
  const { source } = JSON.parse(readFileSync(join(episode, "narration.json"), "utf8"));
  if (typeof source !== "string" || !source.endsWith(".wav")) throw new Error(`${episode}/narration.json: source must name a take's .wav`);
  if (cues.narrationSource !== source) problems.push(`was built from ${cues.narrationSource ?? "an unrecorded take"}, not narration.json's ${source}`);
  else if (cues.takeWordsSha256 !== sha256(join(episode, source.replace(/\.wav$/, ".words.json")))) {
    problems.push(`was built from other word timings for ${source}`);
  }
  return problems;
};

// What render.mts stamps into a render: the exact cues it played.
export const cuesSha256 = (episode: string) => sha256(join(episode, "cues.json"));

export const assertCuesFresh = (episode: string) => {
  const cues = JSON.parse(readFileSync(join(episode, "cues.json"), "utf8"));
  const problems = cuesStale(episode, cues);
  if (problems.length) throw new Error(`${episode}/cues.json ${problems.join(" and ")}; rerun scripts/build-cues.py`);
  return cues;
};
