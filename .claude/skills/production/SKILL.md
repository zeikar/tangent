---
name: production
description: >-
  This skill should be used when a tangent episode's approved storyboard and
  take need to become a render, or a render needs a fix round, e.g. "build
  episode 002", "/production 002-<slug>", "/production 002-<slug> fix:
  <notes>", or when the episode runbook reaches production or a fix round. A
  fresh agent builds cues, scenes, and render.mp4, runs check-render, and owns
  storyboard.json and every fix from then on.
argument-hint: "<slug> [fix: <notes>]"
context: fork
---

# Production: from storyboard and take to a checked render

Arguments: `$ARGUMENTS`: the episode slug (folder `episodes/<slug>/`), then
optionally `fix:` and a fix round's notes (see "Fix rounds"). If the slug
isn't an existing episode folder with `storyboard.json` and
`narration.json`, stop and report without writing anything.

Turn the approved storyboard and narration take into a rendered Short: final
narration, beat cues, scenes, render, and the render check. Read
`docs/decisions.md` (Stack, component library, Pipeline, Narration) and
`studio/README.md` first; the README lists every command. Run commands from
`studio/` with `ep=../episodes/<slug>`.

Inputs in the episode folder: `storyboard.json` (the spec), `narration.json`
(its `source` names the approved take's audio, e.g. `take1@1.08.wav`, whose
word starts are in the matching `take1@1.08.words.json`), `script.md`,
`research.md`. If the storyboard is ambiguous or a picture can't be drawn as
written, stop and report instead of improvising.

From here on this agent owns `storyboard.json`: layout and timing change as
the render check and fix rounds need, without asking for a storyboard pass.
Anything reusable across episodes (tools, components) goes in `studio/`;
episode files stay in the episode folder. Don't commit; the orchestrator does.

## 1. Narration and cues

The take was generated and approved with the script; don't generate a new
one. Validate the storyboard (`python3 scripts/validate-storyboard.py $ep`
prints "OK", else exits 1), then build the cues from the approved take, the
`source` file and its word timings, e.g. `python3 scripts/build-cues.py $ep
$ep/take1@1.08.wav $ep/take1@1.08.words.json`. It writes `narration.mp3`, `words.json`, and `cues.json`, with these
semantics:

- A beat starts at its first word's start (B1 at frame 0) and ends one frame
  before the next beat starts; the last beat ends `pauseAfter` after its
  speech.
- `{ "pause": true }` resolves to the measured end of the beat's speech (the
  aligner's word ends run early). Each `pauseAfter` is inserted as silence
  inside the silent run after the beat; leading silence is trimmed to 0.1 s.
- The narration is normalized to the loudness target in the theme's `checks`
  block, and `cues.json` carries the storyboard's hash, so a render from a
  stale `cues.json` refuses to run.

**Length gate:** if the result exceeds `topic.md`'s length target, say so in
the report with the number; the human decides (trim, retake, or accept).
60 s is the hard limit.

## 2. Scenes

- Episodes are data: `makeEpisode` and the generic `StoryboardPlayer` draw
  every element from `storyboard.json` and `cues.json`. The episode folder in
  `studio/src/episodes/<slug>/` is only wiring (copy
  `001-a4-paper-ratio/index.tsx`), registered in `studio/src/Root.tsx` with
  the slug as the composition id.
- Build only the components the storyboard marks new, as general primitives
  in `studio/src/components/` (props, not per-beat hacks). Reuse existing
  ones. Production owns mechanisms (how a label flies into an equation, token
  morphs): when the storyboard states an intent that needs a new mechanism,
  build it as a prop on the component and describe it in the report.
- Timing comes from `cues.json` only; animation lengths from the theme's
  `duration` / `ease` or `until` anchors. On-screen text comes from
  `storyboard.json`, never string literals, so an English version is a data
  swap.
- Colors, type, easing, content bounds, zones, and style values (strokes,
  dashes, gaps) come from `theme.ts`. If the storyboard's `notes` need a
  value the theme lacks, add it to the theme.
- Manim only for a scene Remotion can't do; say which and why first.

## 3. Render and check

- `node scripts/render.mts $ep` renders (BT.709), muxes the narration, tags
  the render with the storyboard and studio-code hashes, and runs
  `scripts/check-render.mts`. Fix every fail before reporting, retuning
  `storyboard.json` layout where that is the cause; a warn needs a one-line
  reason.
- Render twice and compare the decoded frames: save the first render's
  `ffmpeg -i $ep/render.mp4 -f framemd5 -` output to a scratch file before
  rendering again. A measurement race (text laid out before its font loaded)
  changes pixels between renders and no check catches it.
- check-render doesn't judge everything (see the `qa` skill's list). Before
  reporting, also look at the beat-end stills (`scripts/beat-stills.mts`)
  against each beat's `endFrame` text, and at every beat boundary and long
  move in the render, every 2–3 frames.
- Build what the storyboard says and stop there. The first render goes to
  the human before any polish, so don't add effects or refinements the
  storyboard didn't ask for.
- Report back: the check summary, files written, how each step went (time,
  retries, failures), anything in the storyboard that needed interpreting,
  any layout changed to pass the checks, and what this skill should have
  said.

## Fix rounds

After the first render this agent owns every fix, in `storyboard.json` and
`studio/` alike, so nothing is relayed between agents. The orchestrator
resumes this agent when it can, or starts a fresh one with the notes after
`fix:`. A round's notes come from the human (who watched the render), QA
(issues in `review.md`, cited as `r<N>#<k>`), and chosen points from
`critique-cut.md`; the human's notes win a conflict. A fresh agent reads
`review.md` and the episode's recent commits (`git log -p --
episodes/<slug>`) for what earlier rounds changed.

- Change layout, timing (anchors, `until`, `speed`, `pauseAfter`), props,
  element order, and components as needed, keeping each beat's intent: its
  `endFrame` meaning and the script's Visual line.
- Don't originate changes to what is said or claimed: `readAloud`, caption
  text, `claims`. If a fix needs one, stop and report; it goes back to the
  script. When the orchestrator hands over an approved script and take
  change (new `script.md` lines, a new `narration.json` source and its word
  timings), sync `storyboard.json` to it: `readAloud`, captions, `claims`,
  and cue anchors on changed words.
- Keep it proportionate: fix what the notes name, without adding new effects.
- A change to something global (theme tokens, type sizes, a player rule, a
  shared component) must be named in the report: QA then does a full pass.
- After storyboard edits, validate and rebuild cues, then render, pass
  check-render, and render twice as above.
- Report back per note: what changed (files), and how it was verified.
