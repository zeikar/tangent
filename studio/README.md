# studio

Remotion project: style guide and reusable scene components. 1080×1920, 30 fps.

- `src/style/theme.ts`: palette, type scale, easing, Shorts safe area. Scenes use
  these tokens instead of literal values.
- `src/style/fonts.ts`: Pretendard (Korean/Latin) and KaTeX faces, loaded with
  `loadFont()` so frames never capture a fallback font.
- `src/components/`: primitives (`Tex`, `SafeAreaGuide`, ...).
- `src/compositions/StyleSheet.tsx`: visual check for the style guide.
- `.claude/skills/`: Remotion's official agent skills (markup, render, captions,
  docs), loaded when an agent works in this directory. Pinned in
  `skills-lock.json`; update with `npx skills update -p`.

```sh
npm i
npm run dev                                   # Studio preview
npx remotion still StyleSheet out/a.png --frame=45
npx remotion still StyleSheet out/a.png --props='{"showSafeArea":true}'
npx remotion render StyleSheet out/a.mp4
```

Remotion is free for individuals and companies of up to 3 people; see its
[license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
