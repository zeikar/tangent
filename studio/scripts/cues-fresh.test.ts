import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertCuesFresh } from "./cues-fresh.mts";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

// An episode folder whose cues.json was built from take1@1.08.
const episode = () => {
  const ep = mkdtempSync(join(tmpdir(), "cues-fresh-"));
  const files: Record<string, string> = {
    "storyboard.json": '{"beats":[]}',
    "narration.json": '{"source":"take1@1.08.wav"}',
    "take1@1.08.words.json": '[{"word":"가","start":0,"end":1}]',
    "take2@1.08.words.json": '[{"word":"가","start":0.1,"end":1}]',
  };
  files["cues.json"] = JSON.stringify({
    storyboardSha256: sha256(files["storyboard.json"]),
    narrationSource: "take1@1.08.wav",
    takeWordsSha256: sha256(files["take1@1.08.words.json"]),
  });
  for (const [name, text] of Object.entries(files)) writeFileSync(join(ep, name), text);
  return ep;
};

describe("assertCuesFresh", () => {
  it("passes cues built from the storyboard and the approved take", () => {
    expect(() => assertCuesFresh(episode())).not.toThrow();
  });

  it("refuses cues from another storyboard", () => {
    const ep = episode();
    writeFileSync(join(ep, "storyboard.json"), '{"beats":[1]}');
    expect(() => assertCuesFresh(ep)).toThrow(/another storyboard.json/);
  });

  it("refuses cues from a take narration.json no longer names", () => {
    const ep = episode();
    writeFileSync(join(ep, "narration.json"), '{"source":"take2@1.08.wav"}');
    expect(() => assertCuesFresh(ep)).toThrow(/built from take1@1.08.wav, not narration.json's take2@1.08.wav/);
  });

  it("refuses cues from other word timings of the same take", () => {
    const ep = episode();
    writeFileSync(join(ep, "take1@1.08.words.json"), "[]");
    expect(() => assertCuesFresh(ep)).toThrow(/other word timings/);
  });
});
