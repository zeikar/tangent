// Renders an episode to <episode>/render.mp4. Remotion draws the video (muted,
// BT.709 limited range); ffmpeg then muxes narration.mp3 in as AAC. Remotion's
// own AAC track carries no edit list, so the encoder's priming samples would
// play as a 43 ms audio delay; ffmpeg's mp4 muxer records them.
//
//   node scripts/render.mts ../episodes/<slug>
// The composition id is the slug.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { assertCuesFresh } from "./cues-fresh.mts";

const episodeArg = process.argv[2];
if (!episodeArg) throw new Error("usage: node scripts/render.mts <episode dir>");
const episode = resolve(episodeArg);
const slug = basename(episode);
assertCuesFresh(episode);
const studio = join(import.meta.dirname, "..");
const video = join(studio, "out", `${slug}-video.mp4`);
const out = join(episode, "render.mp4");
mkdirSync(join(studio, "out"), { recursive: true });

execFileSync("npx", ["remotion", "render", slug, video, "--muted", "--color-space=bt709"], {
  cwd: studio,
  stdio: "inherit",
});
execFileSync(
  "ffmpeg",
  ["-v", "error", "-y", "-i", video, "-i", join(episode, "narration.mp3"), "-map", "0:v", "-map", "1:a",
   "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", out],
  { stdio: "inherit" },
);
console.log(out);
