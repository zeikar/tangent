// Narration take: every beat's Read-aloud line from script.md, joined with
// newlines, in one TTS call so the voice stays consistent across beats. It runs
// right after the script is written, so the human approves the take together
// with the script and the storyboard is written against real word timings.
// Writes <episode>/take<N>.wav (next free N, claimed before the TTS call so
// two runs in parallel get their own) and, next to it, take<N>.txt: the
// exact text sent, which is the transcript align.py needs and how
// takes-view.py tells which script a take reads. Every word must be Hangul
// (punctuation aside): the aligner drops digits and romanizes Latin letters.
//
// --script=script.a.md reads a script variant instead of script.md.
// --tempo=1.08 also writes a sped-up copy (pitch kept) as take<N>@1.08.wav,
// the speed episodes play at; a list (1.08,1.15) writes one copy per speed.
// The picked file is recorded in <episode>/narration.json and is the
// episode's narration source from then on.
//
//   node scripts/narrate.mts ../episodes/<slug> [--script=script.a.md] [--tempo=1.08]
import { execFileSync } from "node:child_process";
import { closeSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { geminiSynth } from "./tts.mts";

const MODEL = "gemini-3.8-flash-tts";
const VOICE = "Kore";

const flag = (name: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

const episode = process.argv[2];
if (!episode) {
  throw new Error("usage: node scripts/narrate.mts <episode dir> [--script=script.a.md] [--tempo=1.08]");
}
const scriptFile = flag("script") ?? "script.md";
const script = readFileSync(join(episode, scriptFile), "utf8");
const lines = [...script.matchAll(/\*\*Read-aloud:\*\*\s*(.+)/g)].map((m) => m[1].trim());
if (lines.length === 0) throw new Error(`${episode}/${scriptFile} has no Read-aloud lines`);
const text = lines.join("\n");
const notHangul = text.split(/\s+/).filter((w) => !/^[가-힣]+$/.test(w.replace(/[^\p{L}\p{N}_]/gu, "")));
if (notHangul.length) throw new Error(`Read-aloud words must be spelled in Hangul: ${notHangul.join(" ")}`);

let n = 1;
for (; ; n++) {
  try {
    closeSync(openSync(join(episode, `take${n}.wav`), "wx"));
    break;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
  }
}
const take = join(episode, `take${n}.wav`);
// Until the audio is in, the claimed file is empty: drop it on any way out.
const drop = () => {
  rmSync(take, { force: true });
  process.exit(130);
};
process.once("SIGINT", drop);
try {
  writeFileSync(take, await geminiSynth(text, MODEL, VOICE));
} catch (e) {
  rmSync(take);
  throw e;
}
process.off("SIGINT", drop);
writeFileSync(join(episode, `take${n}.txt`), text + "\n");
console.log(take);

const tempos = flag("tempo")?.split(",").filter(Boolean) ?? [];
for (const t of tempos) {
  const out = join(episode, `take${n}@${t}.wav`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", take, "-filter:a", `atempo=${t}`, out]);
  console.log(out);
}
