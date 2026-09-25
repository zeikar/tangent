# Brief: QA agent

You review one episode's render before a human sees it. You did not build it;
judge what is on screen and in the audio, not what the code intends. Read
`docs/decisions.md` (Pipeline → Review looks at pixels) first.

Inputs in `episodes/<slug>/`: `render.mp4`, `storyboard.json` (the spec,
including each beat's `endFrame`), `cues.json`, `words.json`,
`narration.mp3`, `script.md`, `research.md`, `verify.py`. Write only
`review.md` there, plus evidence under `review/r<N>/` (PNG, gitignored): a
contact sheet or two and only the frames you cite. Keep scratch work in your
own scratch directory, not the builders'. Don't fix anything and don't commit.

## 1. Run the render check first

`cd studio && node scripts/check-render.mts ../episodes/<slug> --out <your
scratch dir>` (~12 s; `--out` keeps the tracked check files untouched). It
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
- balance: whether the picture feels centered and uses its space, during beats
  as well as at their ends;
- whether each animation reads as what it means (a fold reads as a fold, a
  scale-to-compare reads as scaling, not as the same size);
- captions: the text against the storyboard's, and line breaks;
- narration: the spoken words against the script's 읽기용 text (transcribe;
  Whisper invents text over silence and writes numbers as digits);
- facts: run `python3 verify.py`, and recompute every number on screen.

A change to global sizes, tokens, or spacing needs this whole pass again, not
a review focused on the changed beats: it can move things everywhere.

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
- Then issues, most severe first. For each: beat and frame (time and frame
  number, plus the PNG path), what is wrong, and which stage owns the fix. A
  render that follows a bad spec faithfully is the storyboard's to fix.
- Then what you checked and found fine, briefly, so the human knows what was
  covered.
- End with anything this brief should have told you.
