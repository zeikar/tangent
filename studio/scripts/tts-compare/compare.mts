// Milestone-1 spike: synthesize the same test sentences with each candidate
// TTS engine so a human can listen and compare. Keys come from the repo-root
// .env. Output: out/tts-compare/<engine>-<model>-<label>-<version>.{mp3|wav,json}
// Gemini returns no timestamps; align its readAloud file with scripts/align.py.
//
//   node scripts/tts-compare/compare.mts voices <elevenlabs|typecast|gemini>
//   node scripts/tts-compare/compare.mts synth <engine> <model> <voiceId> <label>
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { call, env, geminiSynth, geminiVoices } from "../tts.mts";

type Word = { word: string; start: number; end: number };
type Result = { audio: Buffer; ext: "mp3" | "wav"; words: Word[] | null };

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../../out/tts-compare");
const sentences: Record<"display" | "readAloud", string> = JSON.parse(
  readFileSync(join(here, "sentences.json"), "utf8"),
);

// ElevenLabs aligns characters; words are the runs between whitespace.
const charsToWords = (
  chars: string[],
  starts: number[],
  ends: number[],
): Word[] => {
  const words: Word[] = [];
  let cur: Word | null = null;
  chars.forEach((c, i) => {
    if (/\s/.test(c)) {
      cur = null;
      return;
    }
    if (!cur) {
      cur = { word: "", start: starts[i], end: ends[i] };
      words.push(cur);
    }
    cur.word += c;
    cur.end = ends[i];
  });
  return words;
};

const engines = {
  elevenlabs: {
    voices: async () => {
      const headers = { "xi-api-key": env("ELEVENLABS_API_KEY") };
      const own = await call("https://api.elevenlabs.io/v2/voices?page_size=100", { headers });
      const shared = await call(
        "https://api.elevenlabs.io/v1/shared-voices?language=ko&page_size=50",
        { headers },
      );
      return [
        ...own.voices.map((v: any) => `own     ${v.voice_id}  ${v.name}  ${JSON.stringify(v.labels)}`),
        ...shared.voices.map(
          (v: any) =>
            `shared  ${v.voice_id}  ${v.name}  ${v.gender}/${v.age}/${v.use_case}  owner=${v.public_owner_id}  ${v.description?.slice(0, 60) ?? ""}`,
        ),
      ];
    },
    synth: async (text: string, model: string, voiceId: string): Promise<Result> => {
      const json = await call(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": env("ELEVENLABS_API_KEY"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, model_id: model }),
        },
      );
      const a = json.alignment;
      return {
        audio: Buffer.from(json.audio_base64, "base64"),
        ext: "mp3",
        words: charsToWords(
          a.characters,
          a.character_start_times_seconds,
          a.character_end_times_seconds,
        ),
      };
    },
  },
  typecast: {
    voices: async () => {
      const json = await call("https://api.typecast.ai/v3/voices?model=ssfm-v30", {
        headers: { "X-API-KEY": env("TYPECAST_API_KEY") },
      });
      const list = Array.isArray(json) ? json : (json.voices ?? json.result ?? []);
      return list.map((v: any) => `${v.voice_id}  ${v.voice_name}  ${v.gender}/${v.age}  ${JSON.stringify(v.use_cases ?? [])}`);
    },
    synth: async (text: string, model: string, voiceId: string): Promise<Result> => {
      const json = await call(
        "https://api.typecast.ai/v1/text-to-speech/with-timestamps?granularity=word",
        {
          method: "POST",
          headers: {
            "X-API-KEY": env("TYPECAST_API_KEY"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voice_id: voiceId,
            text,
            model,
            language: "kor",
            prompt: { emotion_type: "smart" },
            output: { audio_format: "mp3" },
          }),
        },
      );
      return {
        audio: Buffer.from(json.audio, "base64"),
        ext: "mp3",
        words: json.words.map((w: any) => ({ word: w.text, start: w.start, end: w.end })),
      };
    },
  },
};

const geminiEngine = {
  voices: geminiVoices,
  synth: async (text: string, model: string, voiceName: string): Promise<Result> => ({
    audio: await geminiSynth(text, model, voiceName),
    ext: "wav",
    words: null,
  }),
};

const [cmd, engineName, model, voiceId, label] = process.argv.slice(2);
const engine = { ...engines, gemini: geminiEngine }[
  engineName as "elevenlabs" | "typecast" | "gemini"
];
if (!engine) throw new Error(`unknown engine: ${engineName}`);

if (cmd === "voices") {
  console.log((await engine.voices()).join("\n"));
} else if (cmd === "synth") {
  mkdirSync(outDir, { recursive: true });
  for (const version of ["display", "readAloud"] as const) {
    const { audio, ext, words } = await engine.synth(sentences[version], model, voiceId);
    const base = join(outDir, `${engineName}-${model}-${label}-${version}`);
    writeFileSync(`${base}.${ext}`, audio);
    if (words) {
      writeFileSync(`${base}.json`, JSON.stringify(words, null, 1));
      console.log(`${base}.${ext}  words=${words.length}  lastWordEnd=${words.at(-1)?.end.toFixed(2)}s`);
    } else {
      console.log(`${base}.${ext}  (no timestamps)`);
    }
  }
} else {
  throw new Error(`unknown command: ${cmd}`);
}
