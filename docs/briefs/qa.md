# Brief: QA agent

You review one episode's render before a human sees it. You did not build it;
judge what is on screen and in the audio, not what the code intends. Read
`docs/decisions.md` (Pipeline → Review looks at pixels) first.

Inputs in `episodes/<slug>/`: `render.mp4`, `storyboard.json` (the spec,
including each beat's `endFrame`), `cues.json`, `words.json`,
`narration.mp3`, `script.md`, `research.md`, `verify.py`. Save extracted frames
under `episodes/<slug>/review/` (PNG, gitignored). Write only `review.md`
there. Don't fix anything yourself and don't commit.

## Checks

1. **Technical.** 1080×1920, 30 fps, ≤ 60 s, video and audio streams present,
   audio not cut off at the end. Report integrated loudness (`ffmpeg -af
   ebur128`); Shorts normalize to about −14 LUFS.
2. **Per-beat frames.** Extract the last frame of every beat (from
   `cues.json`) and the frame after each major cue. Look at each one:
   - matches the beat's `endFrame` description;
   - no overlapping elements, nothing cut off by the frame edge;
   - nothing important in the Shorts UI zones (`safe` in
     `studio/src/style/theme.ts`: top 240, bottom 420, left 60, right 140 px);
   - text and math legible at phone size (think of the frame shown ~400 px
     wide).

   Judge frames extracted from `render.mp4` itself. For a safe-area overlay,
   `studio/scripts/beat-stills.mts` re-renders beat stills from source with
   the guide on; use those only as a supplement.
3. **Captions.** Each caption chunk shows the storyboard's text, inside the
   caption zone, readable, and appears when its first word is spoken (compare
   the caption's first frame with the word's start in `words.json`; more than
   3 frames off is an issue).
4. **Audio sync.** Animations start on their anchor words (spot-check at least
   one cue per beat against `words.json`). The spoken words match the script's
   읽기용 text: nothing dropped, added, or garbled. Listen via transcription,
   remembering Whisper invents text over silence and writes numbers as digits.
5. **Facts.** Every number, label, and equation on screen agrees with
   `research.md`; run `python3 verify.py`. Recompute anything shown that
   `verify.py` doesn't cover.
6. **Loop.** If the storyboard promises a loop, diff the last frame against the
   first.

## `review.md`

- Verdict first: **ship**, **fix then ship**, or **rework**.
- Then issues, most severe first. For each: beat and frame (time and frame
  number, plus the PNG path), what is wrong, and which stage owns the fix
  (script, storyboard, or production).
- Then what you checked and found fine, briefly, so the human knows what was
  covered.
- End with anything this brief should have told you.
