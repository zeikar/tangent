// Outside critique: two critics review an episode with the same brief, in
// parallel and read-only. Codex brings a different model's blind spots than
// the Claude agents'; a fresh Claude (`claude -p`, file-reading tools only, no
// user settings or plugins) reads it with none of the writers' context. A
// point both raise weighs more.
//
//   node scripts/critique.mts ../episodes/<slug> script [script.a.md]  (before the takes)
//   node scripts/critique.mts ../episodes/<slug> cut                   (after the first render)
//
// The brief is scripts/critique/<stage>.md. "script" reviews script.md, or the
// variant named, and writes critique-script.md (critique-script.a.md for
// script.a.md). For "cut", contact sheets of render.mp4 at 2 fps go to both
// critics as images, with the narration and each beat's time range in the
// prompt; writes critique-cut.md. The file holds a "## Codex" and a
// "## Claude" section; if one critic fails, its section says so and the
// script exits 1 after writing the other.
import { execFile, execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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

const dir = mkdtempSync(join(tmpdir(), `critique-${basename(episode)}-`));
const images: string[] = [];
if (stage === "cut") {
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

const run = (cmd: string, args: string[], input: string) =>
  new Promise<string>((done, fail) => {
    const child = execFile(cmd, args, { cwd: root, maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) =>
      err ? fail(new Error(`${cmd} failed: ${stderr.trim() || err.message}`)) : done(stdout),
    );
    child.stdin!.end(input);
  });

const codexOut = join(dir, "codex.md");
const codex = run("codex", ["exec", "-s", "read-only", "-C", root, "-o", codexOut, ...images.flatMap((i) => ["-i", i]), "-"], prompt)
  .then(() => readFileSync(codexOut, "utf8"));
const claudePrompt = images.length
  ? `${prompt}\nThe contact sheets are these image files; read them in order:\n${images.map((i) => `- ${i}`).join("\n")}\n`
  : prompt;
const claude = run(
  "claude",
  ["-p", "--tools", "Read,Grep,Glob", "--setting-sources", "project", "--no-session-persistence", "--add-dir", dir],
  claudePrompt,
);

const results = await Promise.allSettled([codex, claude]);
const section = (name: string, r: PromiseSettledResult<string>) =>
  `## ${name}\n\n${r.status === "fulfilled" ? r.value.trim() : `(unavailable: ${(r.reason as Error).message})`}\n`;
const title = stage === "script" ? scriptFile : "cut";
writeFileSync(out, `# Critique · ${title}\n\n${section("Codex", results[0])}\n${section("Claude", results[1])}`);
console.log(out);
if (results.some((r) => r.status === "rejected")) process.exitCode = 1;
