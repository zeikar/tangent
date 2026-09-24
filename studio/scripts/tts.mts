// Gemini TTS client shared by the narration stage (narrate.mts) and the
// engine comparison spike (tts-compare/compare.mts). Keys come from the
// repo-root .env.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

process.loadEnvFile(join(dirname(fileURLToPath(import.meta.url)), "../../.env"));

export const env = (name: string) => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing from .env`);
  return v;
};

export const call = async (url: string, init: RequestInit) => {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${res.status} ${url}\n${await res.text()}`);
  return res.json();
};

// Gemini's unary response is WAV or headerless 16-bit mono PCM
// ("audio/L16;codec=pcm;rate=24000"); the latter needs a header to play.
export const pcmToWav = (pcm: Buffer, rate: number) => {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
};

// Legacy Gemini TTS (generateContent) is steered by a natural-language
// preamble. 3.8 models read the whole text field verbatim, preamble included,
// so they get the style in speech_metadata via the Interactions API instead.
export const GEMINI_STYLE =
  process.env.GEMINI_STYLE ??
  "clear, curious, upbeat narrator of a YouTube Shorts math explainer; fast, energetic pace with short pauses";
const GEMINI_LEGACY_PREAMBLE = `Read the Korean narration below aloud as a ${GEMINI_STYLE}. Read only the narration.\n\nNarration:\n`;

export const geminiVoices = async (): Promise<string[]> => {
  const json = await call(
    "https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000",
    { headers: { "x-goog-api-key": env("GEMINI_API_KEY") } },
  );
  return json.models
    .filter((m: any) => /tts/i.test(m.name))
    .map((m: any) => `${m.name}  ${m.displayName}`);
};

// Returns WAV audio.
export const geminiSynth = async (
  text: string,
  model: string,
  voiceName: string,
): Promise<Buffer> => {
  const headers = {
    "x-goog-api-key": env("GEMINI_API_KEY"),
    "Content-Type": "application/json",
  };
  if (model.startsWith("gemini-3.8")) {
    const json = await call("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        input: [
          {
            type: "user_input",
            content: [
              {
                type: "text",
                text,
                annotations: [{ type: "speech_metadata", style: GEMINI_STYLE }],
              },
            ],
          },
        ],
        response_format: { type: "audio" },
        generation_config: { speech_config: [{ voice: voiceName }] },
      }),
    });
    const audio = json.steps
      ?.flatMap((s: any) => s.content ?? [])
      .find((c: any) => c.type === "audio");
    if (!audio) throw new Error(`no audio in response: ${JSON.stringify(json).slice(0, 500)}`);
    return Buffer.from(audio.data, "base64");
  }
  const json = await call(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        contents: [{ parts: [{ text: GEMINI_LEGACY_PREAMBLE + text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
        },
      }),
    },
  );
  const part = json.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (!part) throw new Error(`no audio in response: ${JSON.stringify(json).slice(0, 500)}`);
  const { mimeType, data } = part.inlineData;
  const raw = Buffer.from(data, "base64");
  const rate = Number(/rate=(\d+)/.exec(mimeType)?.[1] ?? 24000);
  return mimeType.startsWith("audio/wav") ? raw : pcmToWav(raw, rate);
};
