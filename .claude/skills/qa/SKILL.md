---
name: qa
description: This skill should be used when a tangent episode's render needs review before a human sees the final, e.g. "QA episode 002", "/qa 002-<slug>", "re-review the render", or when the episode runbook reaches QA. A fresh agent that didn't build the scenes checks render.mp4 against the storyboard, script, and research, and writes episodes/<slug>/review.md.
argument-hint: <slug> [round notes]
context: fork
---

# QA: review the render

Arguments: `$ARGUMENTS`: the episode slug (folder `episodes/<slug>/`),
optionally followed by notes for this round (what changed, whether it was
global).

Review one episode's render. It wasn't built here; judge what is on screen
and in the audio, not what the code intends. Read `docs/decisions.md`
(Pipeline → Review looks at pixels) first. The human watches the same render
for feel and a Codex critic judges it as a viewer, both in parallel; stick to
defects, measurements, and facts.

Inputs in the episode folder: `render.mp4`, `storyboard.json` (the spec,
including each beat's `endFrame`), `cues.json`, `words.json`,
`narration.mp3`, `script.md`, `research.md`, `verify.py`. Write only
`review.md` there, plus evidence under `review/r<N>/` (PNG, gitignored): a
contact sheet or two and only the frames cited. Keep scratch work in a
scratch directory of this agent's own, not the builders'. Don't fix anything
and don't commit.

## 1. Run the render check first

`cd studio && node scripts/check-render.mts ../episodes/<slug> --out
<scratch dir>` (~12 s; `--out` keeps the tracked check files untouched). It
covers freshness (the render's storyboard and studio-code hashes), technical
(incl. BT.709, 48 kHz), bounds, centering (ink and picture), legibility,
overlaps (across and inside elements, text under fills, exits still visible
while new content draws), label ownership, captions (timing, one line, zone),
readable duration, reaction, mid-beat cues, blank runs, loudness, A/V sync,
word timing, and the loop, with thresholds in `theme.ts`'s `checks` block.
Report its summary; every fail is an issue, every warn needs a verdict.

## 2. Then judge what it can't

Look at frames extracted from `render.mp4`: every beat's last frame, every
beat boundary and long move sampled every 2–3 frames. Check:

- each end frame against its beat's `endFrame` description;
- readability beyond glyph height: contrast (muted text, red on dark), stroke
  weight, fractions and superscripts, color pairs that must be told apart;
- balance: whether the picture feels centered and uses its space, during
  beats as well as at their ends;
- whether each animation reads as what it means (a fold reads as a fold, a
  scale-to-compare reads as scaling, not as the same size);
- captions: the text against the storyboard's, and line breaks;
- narration: the spoken words against the script's 읽기용 text (transcribe;
  Whisper invents text over silence and writes numbers as digits);
- facts: run `python3 verify.py`, and recompute every number on screen.

A later round re-runs check-render and re-judges every changed beat and its
boundaries. A change to global sizes, tokens, spacing, a player rule, or a
shared component needs this whole pass again, not a review focused on the
changed beats: it can move things everywhere (in episode 001 a focused
round missed a label regression that way).

## Thresholds

Smallest glyph (lowercase x-height, fraction numerators) ≥ 30 px at 1080
wide; everything within x 140–940 and y ≥ 240, captions in the caption zone;
beat-end centering within ±25 px of x 540; first visible change ≤ 3 frames
after a beat's first word; −14 ±1 LUFS, true peak ≤ −1 dBTP; A/V within
±20 ms. Duration: 60 s is a hard limit; report a miss of `topic.md`'s target
for the human, not as a defect.

## `review.md`

- Verdict first: **ship**, **fix then ship**, or **rework**. A later round
  adds a section at the top and keeps earlier rounds below.
- Then issues, numbered, most severe first. For each: beat and frame (time
  and frame number, plus the PNG path), what is wrong, and what would fix it.
  One production agent owns all fixes, spec and code alike; flag an issue
  that needs the script (what is said or claimed) as such.
- Then what was checked and found fine, briefly, so the human knows what was
  covered.
- End with anything this skill should have said.
