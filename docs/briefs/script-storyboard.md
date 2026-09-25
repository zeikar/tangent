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

### Telling it
A 40–50 s Short has room for one idea told well, not for every step of a
documentary arc. Episode 001 was written twice. v1 showed the surprising fact,
explained it with one picture and the classic derivation, checked it on the
real sheet, and ended on the size system. v2 fit a question → guess → search →
proof → use arc into the same length and came out busier and harder to follow;
the human preferred v1 by feel. So treat what follows as judgment, not a
template:

- Open with something surprising about a thing the viewer knows, within the
  first 1–2 s. A question can do it; so can a plain statement over a picture
  that makes the viewer ask "why?".
- Follow one line of thought in the order that's easiest to follow. Prefer the
  shortest familiar explanation over a clever one with more steps.
- Fewer, bigger pictures beat many small moves; let a result sit still for a
  moment when it lands.
- End where the idea pays off. Returning to the opening picture makes the loop
  work.
- Don't make the viewer read the same formula in two places at once; when the
  picture shows the math, the caption can say what it means.
- Be precise where it's cheap to be: say the direction of an operation, write
  rounded values with ≈, keep design values apart from measured ones (see
  research.md's 틀리기 쉬운 표현).

### Beats
Split the script into beats (B1, B2, ...), one idea each. Every beat has:
- **화면용** (display): the on-screen caption text. Math goes in `$...$` as
  KaTeX (`$\frac{x}{2}$`, `$\sqrt{2}$`). Numbers as digits.
- **읽기용** (read-aloud): the exact TTS input, following
  `docs/narration.md` (spelling out, and clashes to avoid). Spell out every number, symbol,
  formula, Latin letter, and English term in Hangul (`$x^2 = 2$` → "엑스 제곱은
  이", "A4" → "에이포", "210" → "이백십"). Commas mark breaths. The word
  sequence must be something a forced aligner can match: Hangul words only, no
  digits or Latin letters.
- **비주얼**: one line: what the viewer sees, the single picture that carries
  the idea. If a shape is scaled to compare with another, the scaling should
  read as scaling, not as "the same size".
- **근거**: the research.md claim IDs (C1, C2, ...) this beat relies on. A
  factual statement without a claim ID is not allowed; pure arithmetic or logic
  shown on screen may say "산수".

Respect research.md's "틀리기 쉬운 표현" section.

### Length budget
Narration is Gemini TTS (`gemini-3.8-flash-tts`, voice Kore, fast style). Its
rate varies by take: 4.9–5.3 Hangul syllables per second including natural
pauses. Budget at **5.0**: estimated seconds = Hangul syllables in 읽기용 ÷ 5.0.
Count syllables with code (e.g. `len(re.findall(r'[가-힣]', text))`), not by
eye. Leave 2–4 s of the target for visual-only moments.

After you finish, the orchestrator generates the take (plus sped-up variants)
from your 읽기용 lines, and the human approves script and take together, so
the 읽기용 text you write is exactly what gets spoken.

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

Input: the approved `script.md` (plus topic and research) and the approved
take: `narration.json` names its `source`, and `<source>.words.json` holds real
word start times in seconds (frame = start × 30; the final narration adds each
beat's `pauseAfter` after that beat). Check timing against these real starts,
not estimates. The storyboard is the production agent's only spec: it must say
what is on screen, when, and which component draws it, precisely enough that
nobody improvises.

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
- Player rules you can rely on: cues sharing an anchor run in parallel, except
  that an appear or reveal sharing its anchor with exits waits until those
  exits end. Every exit is a 0.2 s even fade, whatever its speed. An
  element with `visibleAtStart` is drawn from the beat's first frame.

### Captions
Captions are phrase chunks of the 화면용 text, 2–4 eojeol each, shown from
the anchor of the chunk's first spoken word until the next chunk. Keep `$...$`
math. Chunks together must cover the beat's 화면용 text in order.

### Screen
- 1080×1920. Safe area and zones are in `studio/src/style/theme.ts`: the
  picture lives in the visual zone (y 240–1250); captions own the band below.
  Center compositions on the frame (x 540) and keep everything, labels
  included, within x 140–940 at every frame: a rotating or moving shape's whole
  sweep counts, not just its end position.
- Legibility floor: the smallest glyph (lowercase x-height, a fraction's
  numerator) is at least 30 px tall at 1080 wide. Measure math with
  `studio/scripts/measure-tex` instead of estimating; a display fraction
  (`\dfrac`) is usually needed for a readable label.
- Colors by theme name only: `text`, `muted`, `blue`, `yellow`, `teal`, `red`,
  `purple`. Pick a color meaning and keep it for the whole episode (e.g. the
  long side is always yellow). Write the meanings in Korean, briefly: the
  human sees them on the checkpoint page.
- Existing components live in `studio/src/components/` (Tex, PaperRect,
  Mismatch, Equation, NumberLine, Dimension, HalvingNest, Captions); read
  their props there and reuse them. Anything else is new: name it, and spec it
  once in `components`. Prefer a few general primitives with props over one
  component per beat.
- Elements persist across beats until an `exit` cue. Declare each element in
  the beat where it first appears; draw order is declaration order, so an
  element that must sit beneath another is declared just before it.
- Centering is checked two ways at every beat end: all ink, and the picture
  without its edge labels, each within ±25 px of x 540. Center the picture
  itself, not a sheet plus a one-sided label.
- For Korean text in the visual zone, use `Note` (one line, `$...$` math).

### Schema
```jsonc
{
  "slug": "001-a4-paper-ratio",
  "loop": true,  // the last frame returns to the first (check-render verifies)
  "notes": ["units, draw order, anything the schema can't say"],
  "colors": { "yellow": "긴 변", "blue": "짧은 변" },  // meaning map, Korean
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
        { "id": "a4", "component": "PaperRect", "visibleAtStart": true,
          "props": { "ratio": 1.4142, "stroke": "text" },
          "where": "visual zone, centered" }
      ],
      "cues": [
        { "at": { "word": "접어도" }, "target": "a4", "action": "fold",
          "params": { "axis": "parallel to short side", "ease": "linear" },
          "speed": "base",
          "note": "why this moment" }
      ],
      "endFrame": "what the last frame of this beat must show (QA checks it)",
      "claims": ["C1", "C2"]
    }
  ]
}
```

### Before you finish
- Run `python3 studio/scripts/validate-storyboard.py episodes/<slug>`: it
  checks that the file parses, `readAloud` equals script.md's 읽기용, anchors
  exist, captions cover the 화면용 text, components and targets are declared,
  and geometry stays in bounds. It can't see sweeps or label extents; check
  those yourself (a scratch render with `studio/scripts/beat-stills.mts` is
  fine).
- The orchestrator then builds the checkpoint page
  (`studio/scripts/storyboard-view.py`) for the human.
- Report back: the component list (new ones with a one-line spec), any beat
  whose picture you are unsure can be drawn with those components, and missing
  context as before.
