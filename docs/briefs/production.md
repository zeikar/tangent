# Brief: production agent

You turn one episode's approved storyboard into a rendered Short: narration,
word timestamps, beat cues, scenes, render. Read `docs/decisions.md` (Stack,
component library, Pipeline, Narration) and `studio/README.md` first.

Inputs: `episodes/<slug>/storyboard.json` (your spec), `script.md`,
`research.md`. If the storyboard is ambiguous or can't be drawn as written,
stop and report instead of improvising.

Anything reusable across episodes (TTS client, pause insertion, cue builder,
components) goes in `studio/`; episode files stay in the episode folder. Don't
commit; the orchestrator does.

## 1. Narration → `episodes/<slug>/narration.mp3`

- One TTS take of all beats' `readAloud`, joined with newlines, so the voice
  stays consistent. Engine: `gemini-3.8-flash-tts`, voice Kore, style from
  `studio/scripts/tts-compare/compare.mts` (`GEMINI_STYLE` default). 3.8 models
  read the text field verbatim: style goes in `speech_metadata.style` via the
  Interactions API, never in the text. Key: `GEMINI_API_KEY` in the repo-root
  `.env`.
- Keep takes as `episodes/<slug>/take<N>.wav` (gitignored).
- Reject a take if anything besides the script is spoken (a leaked
  instruction, added or dropped words). Transcribing with Whisper catches gross
  errors, but it invents text over trailing silence and writes numbers as
  digits; judge by the word sequence, not by exact text.

## 2. Word timestamps and beat cues

- Force-align the take against the read-aloud text:
  `uv run studio/scripts/align.py take.wav transcript.txt words.json`. Word
  starts are accurate to ~40 ms; ends run early, so a word ends where the next
  one starts.
- Insert each beat's `pauseAfter` as silence at the beat boundary (in the gap
  between the beat's last word and the next beat's first), shift later
  timestamps to match, and encode the result as `narration.mp3`.
- Write `episodes/<slug>/cues.json`: per beat, its start and end frame; per
  cue and caption, the frame its anchor resolves to. Frames at 30 fps from
  `studio/src/style/theme.ts`. Scenes read timing only from this file.

## 3. Scenes

- Build the storyboard's new components as general primitives in
  `studio/src/components/` (props, not per-beat hacks), then compose the
  episode in `studio/src/episodes/<slug>/`, registered in `Root.tsx`.
- Timing comes from `cues.json` only. No hard-coded start seconds or frames;
  animation lengths come from `duration` / `ease` in the theme or from `until`
  anchors.
- On-screen text (captions, labels) comes from `storyboard.json`, not string
  literals in scene code, so an English version is a data swap.
- The storyboard's `notes` carry style values the theme lacks (stroke width,
  dash pattern, tick sizes, box padding): add them to `theme.ts` and use them
  from there.
- Colors, type, easing, safe area, and zones from the theme only. Nothing
  important outside the safe area; math must fit its box (scale long equations
  down, never let them run off-frame).
- Manim only for a scene Remotion can't do; say which and why first.

## 4. Render and self-check

- For each beat, render a still at its `endFrame` moment and look at it:
  compare with the storyboard's `endFrame` text, overlaps, off-frame, safe
  area (`showSafeArea` guide), legibility.
- Render the full video to `episodes/<slug>/render.mp4` (gitignored).
- Report back: files written, how each step went (time, retries, failures),
  anything in the storyboard you had to interpret, and what you would change in
  this brief. A separate QA agent reviews your render; you don't need to review
  it for them.
