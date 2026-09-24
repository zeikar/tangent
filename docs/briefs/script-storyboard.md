# Brief: script & storyboard agent

You write one YouTube Shorts episode's script, then (in a second pass, after a
human approves the script) its storyboard. Channel: Korean-language math /
science / engineering explainers in the 3Blue1Brown style, code-rendered
animation. Read `docs/decisions.md` first for format and style decisions.

Inputs: `episodes/<slug>/topic.md`, `episodes/<slug>/research.md`.
Write only the output file of the current pass. Don't edit other files.

## Pass 1: script → `episodes/<slug>/script.md`

### Format
- 9:16 Short, one visual insight. Length target comes from `topic.md`; never
  over 60 s.
- Hook within the first 1–2 s, carried by both the first words and the first
  visual. No greeting, no channel intro, no "구독과 좋아요".
- Korean, polite casual "~요" register, spoken rhythm: short sentences, one idea
  per sentence.
- Audience: curious high-schoolers and adults. Explain with the picture, not
  with jargon.

### Beats
Split the script into beats (B1, B2, ...), one idea each. Every beat has:
- **화면용** (display): the on-screen caption text. Math goes in `$...$` as
  KaTeX (`$\frac{x}{2}$`, `$\sqrt{2}$`). Numbers as digits.
- **읽기용** (read-aloud): the exact TTS input. Spell out every number, symbol,
  formula, Latin letter, and English term in Hangul (`$x^2 = 2$` → "엑스 제곱은
  이", "A4" → "에이포", "210" → "이백십"). Commas mark breaths. The word
  sequence must be something a forced aligner can match: Hangul words only, no
  digits or Latin letters.
- **비주얼**: one line: what the viewer sees, the single picture that carries
  the idea.
- **근거**: the research.md claim IDs (C1, C2, ...) this beat relies on. A
  factual statement without a claim ID is not allowed; pure arithmetic or logic
  shown on screen may say "산수".

Respect research.md's "틀리기 쉬운 표현" section.

### Length budget
Narration is Gemini TTS (`gemini-3.8-flash-tts`, voice Kore, fast style),
measured at **5.3 Hangul syllables per second** including natural pauses.
Estimated seconds = Hangul syllables in 읽기용 ÷ 5.3. Count syllables with code
(e.g. `len(re.findall(r'[가-힣]', text))`), not by eye. Leave 2–4 s of the
target for visual-only moments.

### File layout
A short header (total syllables, estimated narration length, estimated total
with visual pauses), then one `## B<n> · <name> (~<sec>초)` section per beat
with the four bullets above.

### Before you finish
- Recount syllables and check the total against the target.
- Check every 근거 ID exists in research.md and says what the beat claims.
- Report back: the total length estimate, the hook in one line, and any choice
  you were unsure about.

## Pass 2: storyboard → `episodes/<slug>/storyboard.json`

Input: the approved `script.md` (plus topic and research). The storyboard is
the production agent's only spec: it must say what is on screen, when, and
which component draws it, precisely enough that nobody improvises.

### Timing model
- Narration is **one TTS take** of all 읽기용 lines. Word start times come from
  forced alignment. Every animation cue is anchored to a spoken word; never
  write seconds for when something happens.
- An anchor is `{ "word": "<eojeol>", "nth": 1 }`: the start of that word in the
  beat's `readAloud` (compare with punctuation stripped; `nth` for repeats,
  default 1). `{ "pause": true }` is the start of the beat's trailing pause.
- `pauseAfter` (seconds, 0–1.5) is editorial pacing: production inserts that
  much silence into the audio after the beat. It is the only place seconds
  appear.
- How long an animation runs: `until` (another anchor), or `speed`: `fast` /
  `base` / `slow` (style-guide durations). Nothing else.

### Captions
Captions are phrase chunks of the 화면용 text, 2–4 eojeol each, shown from
the anchor of the chunk's first spoken word until the next chunk. Keep `$...$`
math. Chunks together must cover the beat's 화면용 text in order.

### Screen
- 1080×1920. Safe area and zones are in `studio/src/style/theme.ts`: the
  picture lives in the visual zone (y 240–1250); captions own the band below.
  Center compositions on the frame (x 540) and keep everything, labels
  included, within x 140–940.
- Colors by theme name only: `text`, `muted`, `blue`, `yellow`, `teal`, `red`,
  `purple`. Pick a color meaning and keep it for the whole episode (e.g. the
  long side is always yellow).
- Existing components: `Tex` (props: `tex`, `display`, `color`). Anything else
  is new: name it, and spec it once in `components`. Prefer a few general
  primitives with props over one component per beat.
- Elements persist across beats until an `exit` cue.

### Schema
```jsonc
{
  "slug": "001-a4-paper-ratio",
  "colors": { "yellow": "long side", "blue": "short side" },  // meaning map
  "components": [
    { "name": "PaperRect", "status": "new",
      "spec": "rectangle with optional side labels; actions: appear, fold, rotate, scaleTo, exit" }
  ],
  "beats": [
    {
      "id": "B1",
      "name": "훅",
      "readAloud": "…exactly script.md 읽기용…",
      "captions": [{ "text": "A4를 반으로 접어도", "at": { "word": "에이포를" } }],
      "pauseAfter": 0.5,
      "elements": [
        { "id": "a4", "component": "PaperRect",
          "props": { "ratio": 1.4142, "stroke": "text" },
          "where": "visual zone, centered" }
      ],
      "cues": [
        { "at": { "word": "접어도" }, "target": "a4", "action": "fold",
          "params": { "axis": "parallel to short side" }, "speed": "base",
          "note": "why this moment" }
      ],
      "endFrame": "what the last frame of this beat must show (QA checks it)",
      "claims": ["C1", "C2"]
    }
  ]
}
```

### Before you finish
- Validate with code: the file parses; every beat's `readAloud` equals
  script.md's 읽기용; every anchor word exists in its beat; captions cover the
  화면용 text in order; every component used is listed in `components`; every
  `target` is a declared element.
- Report back: the component list (new ones with a one-line spec), any beat
  whose picture you are unsure can be drawn with those components, and missing
  context as before.
