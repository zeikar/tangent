# Milestone 1 notes

A running log from producing the first short by hand, stage by stage. It
answers one question: which stage bottlenecks, so it gets automated first (see
[decisions.md → Goal](decisions.md#goal-both-a-channel-and-the-system)).

For each stage, record: time spent (agent work vs. waiting on a human),
blockers, repeated or mechanical work, and silent failures (things that looked
fine until someone looked at the pixels).

## Summary

Filled in at the end of the milestone.

| Stage | Agent time | Human wait | Blockers | Repeated work | Automate next? |
| ----- | ---------- | ---------- | -------- | ------------- | -------------- |

## Log

### 1. Topic (2026-09-24)

- Agent drafted five candidates in one pass (a few minutes, no research).
- **Human wait dominated.** The pick came about an hour later: it was asked
  alongside the TTS key requests, and the decisions got answered one at a time.
  Asking one decision per message may move faster than bundling.
- Picked A4 paper ratio (the recommendation), slug `001-a4-paper-ratio`, and the
  media rule (text + final narration in git).

### 2. Tech spike: Remotion (2026-09-24)

About 20 min of agent work. Result: `studio/` renders 1080×1920 stills and
video with Korean text (Pretendard) and KaTeX math.

- **Silent failure.** The `create-video` blank template sets
  `"sideEffects": ["*.css"]` in `package.json`, which lets the bundler drop any
  bare import of a TS module. `import "./style/fonts"` vanished, so neither the
  KaTeX CSS nor any font loaded. The render succeeded anyway, with fallback
  fonts and flattened math (fractions inline, exponents on the baseline). No
  error or warning; only looking at the frame caught it. Fixed by removing the
  field. This confirms decisions.md's "review looks at pixels", and suggests a
  cheap automated check: assert `document.fonts` contains the expected faces
  before the first frame.
- **Scaffold flag ignored.** `create-video --yes --blank --no-tailwind` still
  installed Tailwind and wired it into the config; removed by hand.
- **Layout is the failure mode, as predicted.** A display equation at the
  first-guess size ran past the right edge. KaTeX scales glyphs to 1.21em and
  adds 1em margins in display mode; both needed adjusting. The `Tex` component
  should get fit-to-width before scenes use it for long equations.
- **Render speed (M-series, cached bundle).** Single frame 1.7 s; the 3 s
  (90-frame) video 3.6 s. The first run takes about 1 min extra to download
  headless Chrome. Fast enough for a per-beat frame review loop.
- **Remotion agent skills.** Installed 4 of 11 (markup, render, captions, docs)
  into `studio/.claude/skills/`. Claude Code loads directory-scoped skills once
  an agent touches `studio/`, which keeps the root `.claude/skills/` for the
  pipeline-stage skills AGENTS.md plans. Skipped maps, saas, interactivity,
  multimedia, create, studio, upgrade, and `best-practices`: it is only a router
  whose links point at files that aren't in the installed layout.

### 2. Tech spike: word timestamps without the TTS engine (2026-09-24)

About 11 min, run by a background agent against macOS `say` (Yuna) audio of
the read-aloud test sentence (46 words, 20.8 s). Question: if the chosen TTS
engine returns no timestamps, can local forced alignment replace them? Yes.

- **Pick: MMS forced aligner** (`ctc-forced-aligner` from GitHub, model
  `mms-300m-1130-forced-aligner`, 1.26 GB, ~7 s per clip on CPU). All 46 words
  in order; word starts within about ±40 ms of the true boundaries (about one
  frame at 30 fps); 6/6 words cut at its timestamps transcribed back
  correctly. WhisperX (Korean wav2vec2) was close but clipped initial
  consonants (4/6); stable-ts started words up to 300 ms late; plain Whisper
  transcription is unusable for this (writes "R", "3.14", "A4", mishears
  words, so it can't be matched back to the script).
- **The aligner needs the read-aloud script**, not the display script: it
  romanizes the text, so digits and Latin letters don't align. One more reason
  the two scripts stay separate.
- **Use starts, not ends.** Word ends come up to ~160 ms early before pauses,
  and the last word's end runs to the end of the file. Cue code should end a
  word at the next word's start.
- **Trap:** the PyPI package named `ctc-forced-aligner` is an unrelated
  project; install from the GitHub repo. It compiles a C++ extension.
- Even if the engine returns timestamps, running this aligner once is a cheap
  cross-check.

### 2. Tech spike: TTS (2026-09-24)

Research by a background agent (~12 min), then samples on Gemini only: the
human chose Gemini's free tier on cost without a cross-engine listening test.
Engine landscape and the decision are in decisions.md → Narration.

- **Human wait dominated.** Picking an engine needed API keys (sign-ups) and a
  cost call from the human; agent work was ~30 min total.
- **Silent failure: instructions read aloud.** A style preamble in the text
  ("Read the Korean narration below aloud as...") was spoken verbatim in 2 of
  4 `gemini-3.8-flash-tts` samples, stretching them to 36 s. 3.8 models treat
  the text field as a verbatim transcript; style belongs in
  `speech_metadata.style` via the Interactions API (`/v1beta/interactions`).
  Caught only by transcribing the output. The raw REST response puts audio in
  `steps[].content[]`, not the `output_audio` the docs show.
- **Whisper is a noisy checker.** It hallucinates text over trailing silence
  or at the end of a file ("MBC 뉴스 ...", "아멘"; zero-length words) and
  writes numbers as digits, so it can't tell "삼 점 일사" from "3.14". Useful
  for catching gross errors like a leaked preamble, not for judging reading.
- **Gemini reads display text well.** Both 3.8 voices read πr², 1,000, 1/√N,
  and 1:√2 correctly from the raw display text. `3.1-flash-tts-preview`
  appears to drop "루트" in 1/√N and pads ~4 s of trailing silence.
- **Speech rate** (read-aloud version, 124 Hangul syllables): 3.8 Kore 4.4
  syl/s, 3.8 Charon 5.0, 3.1 Kore 5.3. A 30–60 s short holds roughly 130–300
  syllables; the script stage should budget with this.
- **No speed parameter.** Pace is only steerable through the style text.
- **Pace is steerable through the style field.** Asking for a "fast,
  energetic pace" moved 3.8 Kore from 4.4 to 5.3 syl/s (28.5 s → 23.7 s).
- **Picked: `gemini-3.8-flash-tts`, voice Kore, the fast style** (now the
  default in `compare.mts`). The human found all samples similar and leaned
  toward a female voice; the choice is cheap to revisit because timing binds to
  beats, so a new voice only means re-running the narration stage.

### 3. Research (2026-09-24)

About 10 min. Two independent sources that agree (Kuhn's Cambridge page and
Wikipedia), plus `verify.py` for every numeric claim. research.md lists claims
C1–C11; the script may only use those.

- The primary source (ISO 216 on iso.org) returned 403 to the fetch tool, so the
  standard itself went unread. Paywalled standards will recur; agreement between
  two secondary sources is the fallback.
- Worth recording alongside the claims: wording traps (not "exactly" √2, fold
  direction, the half is rotated 90°). They feed the script and the fact-check
  review.

### 4. Script (2026-09-24)

- **First draft by the orchestrator** (~10 min, 262 syllables ≈ 49 s). The
  human then pointed out the original plan: specialist agents per stage group,
  collaborating through files (now decisions.md → Agents). The draft was set
  aside as a baseline, and the script & storyboard agent writes the script from
  `topic.md` + `research.md` + `docs/briefs/script-storyboard.md` alone.
- **What the brief had to carry beyond the input files** (i.e. what the handoff
  files lack): the TTS speech rate (5.3 syl/s, only in these notes), the
  display/read-aloud rules and the `$...$` caption convention, the requirement
  that read-aloud text be aligner-safe (Hangul only), tone/register, and the
  audience. These belong in a studio-level config or style doc that every
  episode's agents read.
- **Agent draft** (~15 min including its own reviewer subagent): 9 beats, 233
  syllables, estimated 44 s narration; a TTS table read came out at 45.8 s, so
  the syllable budget is accurate to about 2 s. Compared with the orchestrator
  draft it is tighter, adds a ratio-sweep beat ("only √2 works"), uses US
  Letter as the counterexample, and ends on a loop back to the first frame.
- **A TTS table read at the script checkpoint is cheap and worth keeping**
  (free tier, ~30 s): the human hears pronunciation problems before the
  storyboard is built on the script. Whisper confirmed nothing was dropped.
- **Missing context the agent reported** (candidates for a studio-level
  narration/style doc): how captions map to narration (word-synced or per
  beat); how to record silent visual time and who inserts it; a pronunciation
  list shared across episodes (A0 → 에이제로, x/2 → 이분의 엑스, ratios with
  대); a rule for Hangul numbers that collide with grammar words ("루트
  이예요" can sound like "루트예요"; "일이", "이 하나"); a scaling rule for
  "same shape" overlays; whether unspoken labels need claim IDs; whether the
  loop ending is a channel convention.
- **Checkpoint format.** Asked to review the script, the human's first reaction
  was "do I have to read it?". Listening to the 45 s table read was enough to
  approve. Later checkpoints should present something to hear or see (table
  read, a handful of frames), not a document to read.
- Approved with the orchestrator's calls on the open questions: US Letter as
  the counterexample, loop ending (per-episode for now), tone as written.

### 5. Storyboard (2026-09-24)

Same agent as the script (resumed), ~25 min including its own validator and a
fresh reviewer subagent (4 must-fix, 7 should-fix, all applied). Output: 38 KB
`storyboard.json`, 9 beats, 6 new components (PaperRect, Mismatch, Equation,
NumberLine, Dimension, HalvingNest). The agent's validator is promoted to
`studio/scripts/validate-storyboard.py`.

- **The schema was missing things the agent had to invent:** showing an element
  on a beat's first frame (`visibleAtStart`, needed by the hook and the loop),
  per-cue easing, draw order, and a free-form `notes` field. Fold these into
  the brief's schema.
- **Timing gap: no "after the previous cue".** Every start must be a spoken
  word, which forced compound actions (`standAndFit`) and picking later words
  as workarounds. A cue-relative anchor (`{ "after": "<cue id>" }`) keeps
  timing beat-bound without seconds; consider it for the next episode.
- **Style values invented in the storyboard** (stroke 6 px, dash 18/12, tick
  sizes, box padding) belong in `theme.ts`.
- **The storyboard was written blind.** Word timings were estimated from the
  speech rate, and KaTeX sizes were guessed (B5's fraction sits ~35 px from a
  label). Two cheap fixes: align the approved table read before the storyboard
  pass, and a studio script that measures a TeX string's rendered box.
- Riskiest beats per the agent: B6 equation morphs (Manim candidate), the 2D
  fold in the hook, the pixel-exact loop, and B5/B8 layout.
- **Storyboard checkpoint as a page, not a file.** Asked for the storyboard,
  the human wanted a link, not 38 KB of JSON. A generated viewer (captions,
  cues under the words that trigger them, the table read playing in sync) was
  ~20 min to build from scratch. The generator is still a throwaway in the
  session scratchpad; it is a candidate studio tool for every episode's
  storyboard checkpoint, and later for the QA review (with real frames).

### 6–7. Narration and scenes (2026-09-24)

Production agent, ~42 min wall-clock plus a 12-min reviewer subagent in
parallel. No human wait. Result: 51.07 s render (1532 frames); full render
20 s, nine beat stills 13 s. No Manim needed.

- **Narration was the easy part.** One Gemini take, accepted first try; forced
  alignment of all 94 words, re-checked on the final mp3 (every start within
  10 ms). First runs download ~3 GB of models (aligner 1.3 GB, Whisper 1.6 GB).
- **Length drifted past the target.** Kore read this take at ~4.9 syl/s, not
  the 5.3 measured on the test sentence, so the episode runs ~1 s over
  topic.md's 40–50 s. Nothing gates length after the script; the brief needs a
  rule (retake, trim, or accept).
- **The big design win: a generic storyboard player.** Instead of per-beat
  scene code, one player computes every element's state per frame from its cue
  list; the episode folder is ~20 lines of wiring. This makes the storyboard
  the program and scene-building mostly a component-library question, which is
  what decisions.md hoped for.
- **Silent A/V offsets, found only by measurement.** `@remotion/media`'s Audio
  ignored the MP3's encoder priming (+46 ms); Remotion's AAC mux adds another
  +43 ms (no edit list). Switched to core `Html5Audio`; 43 ms (~1.3 frames)
  remains. A post-render `ffmpeg` remux of the original narration would remove
  it. An A/V sync check (re-align the render's audio) belongs in QA.
- **The agent had to invent the cue semantics:** where a beat starts and ends,
  what `{pause: true}` resolves to, trimming leading silence, and the shape of
  `cues.json`. These belong in the brief as a schema.
- **Storyboard timing nits surfaced only with real timings** (a pulse starting
  before a move lands, a move overlapping a rotate by 2 frames, folds of 17–22
  frames). Real word timings before the storyboard pass would catch these.

### 8. Review, round 1 (2026-09-24)

Fresh QA agent, verdict **fix then ship**. Audio, captions, cue timing, and
facts were clean (28 caption chunks within 1 frame of their words; 81 cues
0–2 frames after their anchors; nothing in the Shorts UI zones in any of 1532
frames). All problems were layout, and all were invisible in the builder's own
beat-end stills:

- A fraction label (x/2) rendered at ~13 px glyphs: unreadable on a phone.
- New content drawing over exiting content at beat changes (~0.3 s each),
  because exits ease in while appears on the same word start at once.
- Labels colliding during B9's zoom; a label read as belonging to the wrong
  sheet; A0's "1 m²" readable for 0.4 s; loudness −16.2 LUFS.

Findings about the process:
- **The worst defects live in transitions,** which end-of-beat frames never
  show. QA needs a pass over every beat boundary and long move, sampled every
  2–3 frames, and the builder's self-check should do the same.
- **Fixes span two agents.** The x/2 label is a storyboard spec; the overlaps
  are best fixed once as a player rule. Routing each fix to its owner works but
  costs a coordination round (storyboard edit must land before the re-render).
- **QA asked for thresholds the brief left to judgement:** a pixel legibility
  floor, the caption zone's coordinates, a loudness pass/fail line, which
  length target applies, who owns a faithful-but-bad render, and a check of
  words.json against the audio. QA also noted the shared session scratchpad
  exposed builders' files to it; QA should get its own scratch space.

### 8. Review, round 2 (2026-09-24)

Fix loop: storyboard agent and production agent in parallel (~20 min), with
the orchestrator relaying one cross-agent dependency (a player rule that
shifted storyboard timing); then the same QA agent re-reviewed (~25 min).
Every round-1 issue that mattered is fixed. Verdict again **fix then ship**,
but only because the orchestrator's new legibility floor (30 px glyphs at
1080 wide) caught lowercase letters in plain-text labels at 24–29 px; the
render was sent to the human for the final call instead of a third round.

- **A spec change can silently render stale.** The storyboard edit kept cue
  count and order, so the player would have rendered old timing without
  complaint. Production now stamps a storyboard hash into cues.json and the
  render refuses a mismatch.
- **Measurable thresholds change QA's output.** With pixel, loudness, and sync
  thresholds, QA reported numbers (captions within 0.5 frame, A/V ±10 ms,
  −14.0 LUFS) instead of judgement calls; an ambiguous threshold (which glyph
  height counts) produced the one blocking issue.
- **Minor leftovers:** entrances trail the beat's first word by ~11 frames
  under the exits-first rule; a few sub-0.3 s overlaps from storyboard
  geometry; the teal→blue edge change is nearly invisible (palette call).
- **Evidence volume:** round 2 kept 391 PNGs (~32 MB). The brief should cap
  saved frames (contact sheets plus cited frames).
