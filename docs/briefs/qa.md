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

`cd studio && node scripts/check-render.mts ../episodes/<slug>` (~10 s). It
covers freshness, technical, bounds, centering, legibility, overlaps between
elements, reaction, loudness, A/V sync, word timing, and the loop, with the
thresholds in `theme.ts`'s `checks` block. Report its summary; every fail is
an issue.

Know its blind spots: its legibility and overlap checks measure the current
studio code, not the pixels of `render.mp4`, so trust them only when the
freshness check passes. The run rewrites the tracked `check.md` and
`check.json`; restore them afterwards (`git checkout --`) unless the render
changed.

## 2. Then judge what it can't

Look at frames extracted from `render.mp4`: every beat's last frame, every
beat boundary and long move sampled every 2–3 frames. Check:

- each end frame against its beat's `endFrame` description;
- collisions inside one element (a name against its own fold line, labels
  inside one diagram) and text under translucent fills;
- label ownership: every edge label clearly nearer its own edge than any
  other element's;
- readability beyond glyph height: contrast (muted text, red on dark), stroke
  weight, fractions and superscripts, color pairs that must be told apart;
- balance: the picture's weight, not just its bounding box, during beats as
  well as at their ends;
- timing: how long names and labels stay readable (about 1 s at least), cues
  after each beat's first word, blank frames between beats;
- captions: text against the storyboard, line breaks, width, and that each
  appears within 3 frames of its first word;
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
