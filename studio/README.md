# studio

Remotion project: style guide and reusable scene components. 1080×1920, 30 fps.

- `src/style/theme.ts`: palette, type scale, easing, Shorts safe area. Scenes use
  these tokens instead of literal values.
- `src/style/fonts.ts`: Pretendard (Korean/Latin) and KaTeX faces, loaded with
  `loadFont()` so frames never capture a fallback font.
- `src/components/`: primitives (`Tex`, `PaperRect`, `Equation`, ...), each
  specced in the storyboard that introduced it.
- `src/storyboard/`: plays an episode's `storyboard.json` with the frame numbers
  in its `cues.json`. `src/episodes/<slug>/` wires one episode to it and to its
  `narration.mp3`; the composition id is the slug.
- `src/compositions/StyleSheet.tsx`: visual check for the style guide.
- `.claude/skills/`: Remotion's official agent skills (markup, render, captions,
  docs), loaded when an agent works in this directory. Not committed, since
  their repo declares no license; install them after cloning (below).
  `skills-lock.json` records what was installed.

```sh
npm i
npx skills add remotion-dev/skills -a claude-code --copy -y \
  -s remotion-markup -s remotion-render -s remotion-captions -s remotion-docs
npm run dev                                   # Studio preview
npx remotion still StyleSheet out/a.png --frame=45
npx remotion still StyleSheet out/a.png --props='{"showSafeArea":true}'
npx remotion render StyleSheet out/a.mp4
```

Narration and production (API keys in the repo-root `.env`; `ep` is
`../episodes/<slug>`):

```sh
# One TTS take of every beat's readAloud → $ep/take<N>.wav + take<N>.txt
node scripts/narrate.mts $ep
# Word timestamps for a take (first run downloads 1.3 GB)
uv run scripts/align.py $ep/take1.wav $ep/take1.txt take1.words.json
# Insert pauseAfter silences → $ep/narration.mp3, words.json, cues.json
python3 scripts/build-cues.py $ep $ep/take1.wav take1.words.json
# A still at every beat's endFrame (safe-area guide on) → $ep/frames/
node scripts/beat-stills.mts $ep
npx remotion render <slug> $ep/render.mp4
# TTS samples of scripts/tts-compare/sentences.json → out/tts-compare/
node scripts/tts-compare/compare.mts synth gemini gemini-3.8-flash-tts Kore kore
```

Remotion is free for individuals and companies of up to 3 people; see its
[license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
