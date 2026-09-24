# Decisions

Why the project is shaped the way it is. Read before re-litigating something.

---

## Goal: both a channel and the system

Grow a channel *and* build the agent system as an engineering project. The
first milestone serves both: one short, end to end, run stage by stage in
conversation rather than as automated skills. Agents draft every stage; the
human picks the topic and approves script, storyboard, and final cut. The stage
that bottlenecks is the next one to automate.

## Style: 3Blue1Brown first, Kurzgesagt later

The 3b1b look is procedural (shapes, equations, graphs defined in code), which
suits code generation. The Kurzgesagt look is hand-illustrated vector art;
LLM-drawn SVG ends up looking like clip art. Kurzgesagt-ish scenes come later
via image-generated stills split into layers and animated in code (parallax,
reveals).

## No video-generation AI; image generation OK

All motion is code-rendered. Image generation is allowed for static
illustration assets only.

## Stack: Remotion backbone, Manim inserts

- **Remotion**: React, which LLMs write well; strong at captions, audio, 9:16
  layout, compositing; renders single frames fast, which the review loop needs.
- **Manim (CE)**: only for scenes Remotion does poorly (equation morphs, 3D),
  rendered as transparent clips and composited in Remotion.

Not yet validated. Milestone 1 confirms or revises this.

## Quality comes from a component library, not free-form generation

A style guide (palette, type, easing) plus tested primitives: equation reveal,
graph, number line, vector, highlight, caption track. Agents compose and
parameterize these; they don't write animation from scratch. Published
agent → Manim work (TheoremExplainAgent, Code2Video) found layout (overlap,
off-frame) to be the main failure mode.

## Pipeline: file handoffs between stages

`topic.md → research.md (sourced) → script.md → storyboard.json →
narration audio + word timestamps → scenes → render.mp4 → review.md`

Each stage reads the previous file and writes its own, so any stage can be
re-run, hand-edited, or gated by a human.

- **Storyboard is its own stage.** In this style the visual *is* the
  explanation, so script and visuals are designed together. Otherwise the scene
  agent improvises and narration and picture drift apart.
- **Audio first.** Generate TTS, extract word-level timestamps, then bind
  animation cues to those beats. Never time animation by hand-set seconds.
- **Review looks at pixels.** Extract frames per beat and check them visually:
  overlap, off-frame, Shorts UI safe areas (bottom/right), legibility. Check
  facts against research.md sources, and check math computationally where
  possible. The reviewer is a fresh agent, not the one that made the scenes.
- **Human checkpoints:** topic, script/storyboard, final cut. No full autonomy
  early on.

## Episode folders and git

- **Slug: `NNN-english-kebab`** (e.g. `001-a4-paper-ratio`). The number keeps
  production order; ASCII paths stay safe in CLI tools; English keeps the
  folder name valid when an English version is added.
- **Git holds text artifacts plus each episode's final narration audio.** Word
  timestamps and beat cues derive from that exact file, and TTS never produces
  the same take twice, so losing it means redoing narration and everything
  after. Renders, extracted frames, and discarded takes stay out of git.

## Language: Korean first, English later

- The early bottleneck is judging quality (hooks, TTS naturalness), which is
  sharper in the native language.
- English STEM shorts are saturated with AI-produced channels. The Korean
  market is smaller with lower CPM; accepted.
- English stays cheap to add later if two rules hold from day one: on-screen
  text lives in strings separate from scene code, and animation timing binds to
  beats, not seconds. Then English = translate + re-TTS + re-render.

## Narration: Gemini TTS + local forced alignment

- **Engine: Gemini TTS on the free tier**, chosen on cost in milestone 1. Google
  claims no ownership of the output; the free tier lets Google use inputs and
  outputs to improve its products, which is acceptable because the scripts get
  published anyway. Fallbacks if quality disappoints: ElevenLabs (character
  timestamps, from $6/mo) and Typecast (Korean-specialized, word timestamps,
  $15/mo). Supertone's API shut down in August 2026; CLOVA Voice's policy
  doesn't allow saving the audio.
- **Word timestamps come from local forced alignment** (MMS aligner), since
  Gemini returns none. Word starts land within about 40 ms, about one frame.
- **Keep a display script and a read-aloud script.** The read-aloud script
  spells numbers, formulas, and English terms in Hangul (x² → 엑스 제곱).
  Gemini reads most display text correctly on its own, but the aligner can only
  match Hangul words, and a fixed spoken text keeps timing reproducible.

## Format

9:16 (1080×1920), one visual insight per short, hook within the first 1–2 s.
Volume is not the strategy: YouTube's July 2025 monetization update names
mass-produced, repetitive uploads "inauthentic content".
