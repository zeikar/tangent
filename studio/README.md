# studio

Remotion project: style guide and reusable scene components. 1080×1920, 30 fps.

- `src/style/theme.ts`: palette, type scale, easing, Shorts safe area. Scenes use
  these tokens instead of literal values.
- `src/style/fonts.ts`: Pretendard (Korean/Latin) and KaTeX faces, loaded with
  `loadFont()` so frames never capture a fallback font.
- `src/components/`: primitives (`Tex`, `PaperRect`, `Equation`, ...), each
  specced in the storyboard that introduced it.
- `src/storyboard/`: plays an episode's `storyboard.json` with the frame numbers
  in its `cues.json`. `src/episodes/<slug>/` wires one episode to it with
  `makeEpisode` (`Episode.tsx`) and registers it in `Root.tsx`; the composition
  id is the slug. Scripts pass an episode folder's own `storyboard` and `cues`
  as props, so scratch copies render too.
- `src/probe/`: with the `probe` prop, a composition logs what every frame
  draws (lines, fills, text ink, glyph heights) for `check-render` and
  `measure-tex`; the player marks elements `data-el`, text items `data-text`.
- `src/compositions/StyleSheet.tsx`: visual check for the style guide.
- `src/brand/`: channel branding (루트와이, √y) as stills in the `brand` folder:
  `Logo` (transparent), `Avatar` (profile picture, 800×800), `Watermark` (video
  watermark, 150×150), `Banner` (channel banner; `showSafeArea` outlines what
  every device shows).
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
npx remotion still Avatar out/brand/avatar.png
npx remotion still Banner out/brand/banner.png --scale=1.25   # 2560×1440 for TV
npx remotion still Logo out/brand/logo.png
npx remotion still Watermark out/brand/watermark.png
```

Narration and production (API keys in the repo-root `.env`; `ep` is
`../episodes/<slug>`):

```sh
# Right after the script: one TTS take of every 읽기용 line in script.md, plus
# sped-up copies to compare → $ep/take<N>.wav, take<N>@1.08.wav, ..., take<N>.txt
node scripts/narrate.mts $ep --tempo=1.08,1.15
# The human picks a take; record it in $ep/narration.json:
#   {"source": "take1@1.08.wav", "take": "take1.wav", "tempo": 1.08, ...}
# Word timestamps for the picked take (first run downloads 1.3 GB); the
# storyboard is written against these
uv run scripts/align.py $ep/take1@1.08.wav $ep/take1.txt $ep/take1@1.08.words.json
# Check storyboard.json against script.md, research.md and the brief's rules
python3 scripts/validate-storyboard.py $ep
# Checkpoint page for the human: captions, each cue under its word, narration
# in sync → $ep/storyboard.html (final narration if built, else the picked take)
python3 scripts/storyboard-view.py $ep
# Insert pauseAfter silences, normalize to -14 LUFS
#   → $ep/narration.mp3, words.json, cues.json, and a copy of the narration
#     in public/episodes/<slug>/ (gitignored), which the composition plays.
#     An episode renders only after this has run; the rest of the studio
#     needs no episode media.
python3 scripts/build-cues.py $ep $ep/take1@1.08.wav $ep/take1@1.08.words.json
# A still at every beat's endFrame (safe-area guide on) → $ep/frames/
node scripts/beat-stills.mts $ep
# Video from Remotion (BT.709), narration muxed by ffmpeg as 48 kHz AAC
#   → $ep/render.mp4, stamped with the storyboard's and the studio code's
#   hashes; then check-render (--no-check to skip; its failures fail the step)
node scripts/render.mts $ep
# Check a render: freshness (storyboard and code), technical, bounds,
# centering, legibility, overlaps (in and across elements, fills included),
# label ownership, captions, readable time, reaction, cue timing, blank
# frames, loudness, A/V sync, words vs audio, loop. Thresholds: `checks` in
# theme.ts. → check.json, check.md, check/ (labeled contact sheet, cited
# frames, before/after pairs) in $ep or --out <dir>; exit 1 on a fail. The
# files carry no timestamps: re-checking an unchanged render changes nothing.
node scripts/check-render.mts $ep [--out <dir>]
# Ink box and smallest glyph of TeX as the studio renders it (default size
# type.mathInline; --display for \displaystyle; --token=mathDisplay | --size=N)
node scripts/measure-tex.mts '\dfrac{x}{2}' 'x^2 = 2' --display
# TTS samples of scripts/tts-compare/sentences.json → out/tts-compare/
node scripts/tts-compare/compare.mts synth gemini gemini-3.8-flash-tts Kore kore
```

Remotion is free for individuals and companies of up to 3 people; see its
[license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
