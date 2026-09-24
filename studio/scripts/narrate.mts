// Narration take: every beat's readAloud from storyboard.json, joined with
// newlines, in one TTS call so the voice stays consistent across beats.
// Writes <episode>/take<N>.wav (next free N) and, next to it, take<N>.txt: the
// exact text sent, which is the transcript align.py needs.
//
//   node scripts/narrate.mts ../episodes/<slug>
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { geminiSynth } from "./tts.mts";

const MODEL = "gemini-3.8-flash-tts";
const VOICE = "Kore";

const episode = process.argv[2];
if (!episode) throw new Error("usage: node scripts/narrate.mts <episode dir>");
const storyboard = JSON.parse(readFileSync(join(episode, "storyboard.json"), "utf8"));
const text = storyboard.beats.map((b: { readAloud: string }) => b.readAloud).join("\n");

let n = 1;
while (existsSync(join(episode, `take${n}.wav`))) n++;
const wav = await geminiSynth(text, MODEL, VOICE);
writeFileSync(join(episode, `take${n}.wav`), wav);
writeFileSync(join(episode, `take${n}.txt`), text + "\n");
console.log(join(episode, `take${n}.wav`));
