// Renders an episode to <episode>/render.mp4. Remotion draws the video (muted,
// BT.709 limited range); ffmpeg then muxes narration.mp3 in as AAC. Remotion's
// own AAC track carries no edit list, so the encoder's priming samples would
// play as a 43 ms audio delay; ffmpeg's mp4 muxer records them.
//
//   node scripts/render.mts ../episodes/<slug> [--no-check]
// The composition id is the slug; the folder's own storyboard.json and
// cues.json are passed in, so a scratch copy renders too. The output only
// becomes render.mp4 if storyboard.json is unchanged when the render ends;
// otherwise it is left as render.stale.mp4 and the script fails. The file
// carries the storyboard's and the studio code's hashes (comment tag) for
// check-render.mts, which runs last unless --no-check; its failures fail
// this script too.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { assertCuesFresh } from "./cues-fresh.mts";
import { renderTag, studioSha256 } from "./fingerprint.mts";

const [episodeArg, ...flags] = process.argv.slice(2);
if (!episodeArg) throw new Error("usage: node scripts/render.mts <episode dir> [--no-check]");
const episode = resolve(episodeArg);
const slug = basename(episode);
const { storyboardSha256 } = assertCuesFresh(episode);
const studioHash = studioSha256();
const studio = join(import.meta.dirname, "..");
const video = join(studio, "out", `${slug}-video.mp4`);
const partial = join(episode, "render.partial.mp4");
const out = join(episode, "render.mp4");
const props = join(studio, "out", `${slug}-props.json`);
mkdirSync(join(studio, "out"), { recursive: true });
const readJson = (name: string) => JSON.parse(readFileSync(join(episode, name), "utf8"));
writeFileSync(props, JSON.stringify({ showSafeArea: false, storyboard: readJson("storyboard.json"), cues: readJson("cues.json") }));

execFileSync("npx", ["remotion", "render", slug, video, "--muted", "--color-space=bt709", `--props=${props}`], {
  cwd: studio,
  stdio: "inherit",
});
execFileSync(
  "ffmpeg",
  ["-v", "error", "-y", "-i", video, "-i", join(episode, "narration.mp3"), "-map", "0:v", "-map", "1:a",
   "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-movflags", "+faststart",
   "-metadata", `comment=${renderTag(storyboardSha256, studioHash)}`, partial],
  { stdio: "inherit" },
);

// The storyboard or the studio code may have changed while the render ran.
try {
  if (assertCuesFresh(episode).storyboardSha256 !== storyboardSha256) throw new Error("cues.json was rebuilt");
  if (studioSha256() !== studioHash) throw new Error("studio code changed");
} catch (e) {
  renameSync(partial, join(episode, "render.stale.mp4"));
  throw new Error(`the storyboard or the studio code changed during the render (${(e as Error).message}); ` +
    "left the output as render.stale.mp4. Rerun build-cues.py and render.mts.");
}
renameSync(partial, out);
console.log(out);
if (!flags.includes("--no-check")) {
  try {
    execFileSync("node", [join(import.meta.dirname, "check-render.mts"), episode], { stdio: "inherit" });
  } catch {
    process.exitCode = 1; // the check printed its failures; the render itself is kept
  }
}
