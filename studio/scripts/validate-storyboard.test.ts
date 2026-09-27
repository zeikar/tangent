import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// A two-beat episode folder: an element "x" appears in B1 and exits, and B2
// declares its own elements.
const script = (readAloudEnd = "") => `# 대본

## B1 · 하나

- **Display:** 가 나 다
- **Read-aloud:** 가 나 다${readAloudEnd}

## B2 · 둘

- **Display:** 라 마 바
- **Read-aloud:** 라 마 바
`;
const beat = (id: string, words: string, elements: object[], cues: object[]) => ({
  id,
  readAloud: words,
  captions: [{ at: { word: words.split(" ")[0] }, text: words }],
  pauseAfter: 0,
  elements,
  cues,
  claims: [],
});
const note = (id: string) => ({ id, component: "Note", props: { text: id } });
const storyboard = (b2Element: string) => ({
  colors: {},
  components: [{ name: "Note" }],
  beats: [
    beat("B1", "가 나 다", [note("x")], [
      { at: { word: "가" }, target: "x", action: "appear" },
      { at: { word: "다" }, target: "x", action: "exit" },
    ]),
    beat("B2", "라 마 바", [note(b2Element)], [{ at: { word: "라" }, target: b2Element, action: "appear" }]),
  ],
});

const validate = (sb: object, scriptMd = script()) => {
  const ep = mkdtempSync(join(tmpdir(), "validate-"));
  writeFileSync(join(ep, "storyboard.json"), JSON.stringify(sb));
  writeFileSync(join(ep, "script.md"), scriptMd);
  writeFileSync(join(ep, "research.md"), "");
  try {
    return { ok: true, out: execFileSync("python3", [join(import.meta.dirname, "validate-storyboard.py"), ep], { encoding: "utf8" }) };
  } catch (e) {
    return { ok: false, out: (e as { stdout: string }).stdout };
  }
};

describe("validate-storyboard.py", () => {
  it("passes the fixture", () => {
    expect(validate(storyboard("y"))).toMatchObject({ ok: true });
  });

  it("rejects an id reused after its element exited", () => {
    const r = validate(storyboard("x"));
    expect(r.ok).toBe(false);
    expect(r.out).toMatch(/B2: element x declared twice/);
  });

  it("ignores trailing whitespace on a Read-aloud line", () => {
    expect(validate(storyboard("y"), script("  "))).toMatchObject({ ok: true });
  });
});
