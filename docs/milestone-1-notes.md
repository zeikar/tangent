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
