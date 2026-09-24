// Renders an episode to <episode>/render.mp4. Remotion draws the video (muted,
// BT.709 limited range); ffmpeg then muxes narration.mp3 in as AAC. Remotion's
// own AAC track carries no edit list, so the encoder's priming samples would
// play as a 43 ms audio delay; ffmpeg's mp4 muxer records them.
//
//   node scripts/render.mts ../episodes/<slug>
// The composition id is the slug. The output only becomes render.mp4 if
// storyboard.json is unchanged when the render ends; otherwise it is left as
// render.stale.mp4 and the script fails.
import { execFileSync } from "node:child_process";
import { mkdirSync, renameSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { assertCuesFresh } from "./cues-fresh.mts";

const episodeArg = process.argv[2];
if (!episodeArg) throw new Error("usage: node scripts/render.mts <episode dir>");
const episode = resolve(episodeArg);
const slug = basename(episode);
const { storyboardSha256 } = assertCuesFresh(episode);
const studio = join(import.meta.dirname, "..");
const video = join(studio, "out", `${slug}-video.mp4`);
const partial = join(episode, "render.partial.mp4");
const out = join(episode, "render.mp4");
mkdirSync(join(studio, "out"), { recursive: true });

execFileSync("npx", ["remotion", "render", slug, video, "--muted", "--color-space=bt709"], {
  cwd: studio,
  stdio: "inherit",
});
execFileSync(
  "ffmpeg",
  ["-v", "error", "-y", "-i", video, "-i", join(episode, "narration.mp3"), "-map", "0:v", "-map", "1:a",
   "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", partial],
  { stdio: "inherit" },
);

// The storyboard may have changed while the render ran.
try {
  if (assertCuesFresh(episode).storyboardSha256 !== storyboardSha256) throw new Error("cues.json was rebuilt");
} catch (e) {
  renameSync(partial, join(episode, "render.stale.mp4"));
  throw new Error(`storyboard.json or cues.json changed during the render (${(e as Error).message}); ` +
    "left the output as render.stale.mp4. Rerun build-cues.py and render.mts.");
}
renameSync(partial, out);
console.log(out);
