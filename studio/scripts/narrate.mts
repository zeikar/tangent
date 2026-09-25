// Narration take: every beat's Read-aloud line from script.md, joined with
// newlines, in one TTS call so the voice stays consistent across beats. It runs
// right after the script is written, so the human approves the take together
// with the script and the storyboard is written against real word timings.
// Writes <episode>/take<N>.wav (next free N) and, next to it, take<N>.txt: the
// exact text sent, which is the transcript align.py needs and how
// takes-view.py tells which script a take reads.
//
// --script=script.a.md reads a script variant instead of script.md.
// --tempo=1.08,1.15 also writes sped-up copies (pitch kept) as
// take<N>@<tempo>.wav for the human to compare. The picked file is recorded in
// <episode>/narration.json and is the episode's narration source from then on.
//
//   node scripts/narrate.mts ../episodes/<slug> [--script=script.a.md] [--tempo=1.08,1.15]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { geminiSynth } from "./tts.mts";

const MODEL = "gemini-3.8-flash-tts";
const VOICE = "Kore";

const flag = (name: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

const episode = process.argv[2];
if (!episode) {
  throw new Error("usage: node scripts/narrate.mts <episode dir> [--script=script.a.md] [--tempo=1.08,1.15]");
}
const scriptFile = flag("script") ?? "script.md";
const script = readFileSync(join(episode, scriptFile), "utf8");
const lines = [...script.matchAll(/\*\*Read-aloud:\*\*\s*(.+)/g)].map((m) => m[1].trim());
if (lines.length === 0) throw new Error(`${episode}/${scriptFile} has no Read-aloud lines`);
const text = lines.join("\n");

let n = 1;
while (existsSync(join(episode, `take${n}.wav`))) n++;
const take = join(episode, `take${n}.wav`);
writeFileSync(take, await geminiSynth(text, MODEL, VOICE));
writeFileSync(join(episode, `take${n}.txt`), text + "\n");
console.log(take);

const tempos = flag("tempo")?.split(",").filter(Boolean) ?? [];
for (const t of tempos) {
  const out = join(episode, `take${n}@${t}.wav`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", take, "-filter:a", `atempo=${t}`, out]);
  console.log(out);
}
