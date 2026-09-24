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
