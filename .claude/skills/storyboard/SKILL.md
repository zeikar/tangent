---
name: storyboard
description: >-
  This skill should be used when a tangent episode's approved script and take
  need a storyboard, e.g. "storyboard 002", "/storyboard 002-<slug>", "002
  스토리보드", "/storyboard 002-<slug> revise: <notes>", or when the episode
  runbook reaches the storyboard stage. A fresh agent writes
  episodes/<slug>/storyboard.json against the take's real word timings.
argument-hint: "<slug> [revise: <notes>]"
context: fork
---

# Storyboard: the spec production draws from

Arguments: `$ARGUMENTS`: the episode slug (folder `episodes/<slug>/`),
optionally followed by `revise:` and notes. If the slug isn't an existing
episode folder with `script.md` and `narration.json`, stop and report
without writing anything. If `cues.json` exists, production has started and
owns `storyboard.json`: stop and report instead of editing it.

Turn the approved script into `storyboard.json`: what is on screen, when,
and which component draws it, precisely enough that nobody improvises. Read
`docs/decisions.md` (Style, component library, Pipeline) first. Write only
`storyboard.json`; don't commit. Run commands from `studio/` with
`ep=../episodes/<slug>`, as `studio/README.md` does.

Inputs in the episode folder: the approved `script.md` (plus `topic.md` and
`research.md`) and the approved take: `narration.json`'s `source` names the
audio file (e.g. `take1@1.08.wav`), and the file of the same name ending in
`.words.json` (`take1@1.08.words.json`) holds real word start times in
seconds (frame = start × 30; the final narration adds each beat's
`pauseAfter` after that beat). Check timing against these real starts, not
estimates.

A revision (`revise:` notes, usually the human's from the storyboard
checkpoint) edits the existing file in place: keep element ids and color
meanings, and change only what the notes reach.

Each beat's **Visual** line is the writer's picture: realize it. If a picture
can't be drawn as written, or reads worse than an alternative, say so in the
report instead of silently redesigning it.

## Timing model

- Narration is **one TTS take** of all Read-aloud lines. Word start times come
  from forced alignment. Every animation cue is anchored to a spoken word;
  never write seconds for when something happens.
- An anchor is `{ "word": "<eojeol>", "nth": 1 }`: the start of that word in
  the beat's `readAloud` (compare with punctuation stripped; `nth` for
  repeats, default 1). `{ "pause": true }` is the start of the beat's
  trailing pause.
- `pauseAfter` (seconds, 0–1.5) is editorial pacing: production inserts that
  much silence into the audio after the beat. It is the only place seconds
  appear. Start from the script's `(hold <N> s)` holds (0 where there
  is none); from here on the storyboard owns pacing, and the validator only
  notes a difference.
- How long an animation runs: `until` (another anchor), or `speed`: `fast` /
  `base` / `slow` (style-guide durations). Nothing else.
- Player rules to rely on: cues sharing an anchor run in parallel, except that
  an appear or reveal sharing its anchor with exits waits until those exits
  end. Every exit is a 0.2 s even fade, whatever its speed. An element with
  `visibleAtStart` is drawn from the beat's first frame. Mechanisms (how a
  label flies into an equation, how tokens morph) belong to production: state
  the intent, and use a mechanism only once it exists in
  `studio/src/components/`.

## Captions

Captions are phrase chunks of the Display text, 2–4 eojeol each, shown from the
anchor of the chunk's first spoken word until the next chunk. Keep the
dollar-sign math. Chunks together must cover the beat's Display text in order.

## Screen

- 1080×1920. Safe area and zones are in `studio/src/style/theme.ts`: the
  picture lives in the visual zone (y 240–1250); captions own the band below.
  Center compositions on the frame (x 540) and keep everything, labels
  included, within x 140–940 at every frame: a rotating or moving shape's
  whole sweep counts, not just its end position.
- Legibility floor: the smallest glyph (lowercase x-height, a fraction's
  numerator) is at least 30 px tall at 1080 wide. Measure math with
  `studio/scripts/measure-tex.mts` instead of estimating; a display fraction
  (`\dfrac`) is usually needed for a readable label.
- Colors by theme name only: `text`, `muted`, `blue`, `yellow`, `teal`, `red`,
  `purple`. Pick a color meaning and keep it for the whole episode (e.g. the
  long side is always yellow). Write the meanings in Korean, briefly: the
  human sees them on the checkpoint page.
- Existing components live in `studio/src/components/` (e.g. Tex, PaperRect,
  Equation, NumberLine, Note, Captions; list the folder for the rest); read
  their props there and reuse them. Anything else is new: name it, and
  spec it once in `components`. Prefer a few general primitives with props
  over one component per beat.
- Elements persist across beats until an `exit` cue. Declare each element in
  the beat where it first appears; draw order is declaration order, so an
  element that must sit beneath another is declared just before it.
- Centering is checked two ways at every beat end: all ink, and the picture
  without its edge labels, each within ±25 px of x 540. Center the picture
  itself, not a sheet plus a one-sided label.
- For Korean text in the visual zone, use `Note` (one line, dollar-sign math).

## Schema

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
      "readAloud": "…exactly script.md's Read-aloud…",
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

`episodes/001-a4-paper-ratio/storyboard.json` is a complete, shipped example.

## Before finishing

- Run `python3 scripts/validate-storyboard.py $ep` until it prints "OK" (it
  exits 1 on errors): it checks that the file parses, `readAloud` equals
  script.md's Read-aloud, anchors exist, captions cover the Display text,
  components and targets are declared, and geometry stays in bounds.
- It can't see sweeps or label extents. Measure every TeX label with
  `scripts/measure-tex.mts`, work out sweeps from the geometry, and list any
  beat whose extents are still a guess; production's render check measures
  them, and production may retune layout to pass it.
- The orchestrator then builds the checkpoint page
  (`studio/scripts/storyboard-view.py`) for the human.
- Report back: the component list (new ones with a one-line spec), any beat
  whose picture might not be drawable with those components, any Visual line
  realized differently than written, and missing context.
