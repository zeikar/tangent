// Cross-model critique: Codex, in a read-only sandbox, reviews an episode as an
// outside editor, so a different model's blind spots than the Claude agents'.
//
//   node scripts/critique.mts ../episodes/<slug> script [script.a.md]  (before the takes)
//   node scripts/critique.mts ../episodes/<slug> cut                   (after the first render)
//
// The brief is scripts/critique/<stage>.md. "script" reviews script.md, or the
// variant named, and writes critique-script.md (critique-script.a.md for
// script.a.md). For "cut", contact sheets of render.mp4 at 2 fps are attached
// as images, with the narration and each beat's time range in the prompt;
// writes critique-cut.md.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../../..");
const [episodeArg, stage, scriptFile = "script.md"] = process.argv.slice(2);
if (!episodeArg || (stage !== "script" && stage !== "cut")) {
  throw new Error("usage: node scripts/critique.mts <episode dir> script [<script file>] | cut");
}
const episode = resolve(episodeArg);
const out = join(episode, stage === "script" ? `critique-${scriptFile.replace(/\.md$/, "")}.md` : "critique-cut.md");

let prompt = readFileSync(join(root, "studio/scripts/critique", `${stage}.md`), "utf8");
prompt += `\n\nEpisode folder: ${relative(root, episode)}\n`;
if (stage === "script") prompt += `Script file: ${scriptFile}\n`;

const images: string[] = [];
if (stage === "cut") {
  const dir = mkdtempSync(join(tmpdir(), `critique-${basename(episode)}-`));
  // 24 frames per sheet at 2 fps = 12 s per sheet.
  execFileSync("ffmpeg", [
    "-v", "error", "-i", join(episode, "render.mp4"),
    "-vf", "fps=2,scale=270:-1,tile=6x4", join(dir, "sheet%02d.png"),
  ]);
  images.push(...readdirSync(dir).sort().map((f) => join(dir, f)));

  const storyboard = JSON.parse(readFileSync(join(episode, "storyboard.json"), "utf8"));
  const cues = JSON.parse(readFileSync(join(episode, "cues.json"), "utf8"));
  const fps: number = cues.fps;
  prompt += "\nNarration by beat (seconds):\n";
  storyboard.beats.forEach((b: { id: string; readAloud: string }, i: number) => {
    const c = cues.beats[i];
    prompt += `- ${b.id} ${(c.startFrame / fps).toFixed(1)}–${((c.endFrame + 1) / fps).toFixed(1)}: ${b.readAloud}\n`;
  });
}

execFileSync(
  "codex",
  ["exec", "-s", "read-only", "-C", root, "-o", out, ...images.flatMap((i) => ["-i", i]), "-"],
  { input: prompt, stdio: ["pipe", "inherit", "inherit"] },
);
console.log(out);
