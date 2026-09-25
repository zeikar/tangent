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

## Palette: our own blue and yellow, not Manim's

Milestone 1 used Manim's default accents (`#58C4DD` blue, `#F4D345` yellow,
…), which are 3b1b's signature colors and what most Manim-made channels use.
Since 2026-09-26 the accents in `theme.ts` are our own: cobalt `#5285F8` and
amber `#FEB251`, with teal `#03BDB6`, red `#E25273`, and purple `#C8B7FF`.

- **Blue and yellow stay.** The pair has the widest lightness gap, its hue
  axis survives red-green color blindness, and the storyboard's color names
  stay true. Violet and orange scored a little higher on the check below but
  would have meant renaming every color token.
- **Measured distance from Manim.** In OKLab (ΔE ×100, where ~2 is barely
  noticeable), blue moved 18.6 and yellow 8.6.
- **Every pair stays distinguishable.** The closest pair of the five is at
  least 10 apart under normal, protan, deutan, and tritan simulation (Machado
  2009). Manim's blue and teal were 1.7 apart under tritan and under 8
  otherwise, which is why 001's teal→blue edge change was nearly invisible
  (milestone-1 notes).
- **Contrast.** All accents are at least 5:1 on the ground.

The published 001 keeps the old colors.

## No video-generation AI; image generation OK

All motion is code-rendered. Image generation is allowed for static
illustration assets only.

## Stack: Remotion backbone, Manim inserts

- **Remotion**: React, which LLMs write well; strong at captions, audio, 9:16
  layout, compositing; renders single frames fast, which the review loop needs.
- **Manim (CE)**: only for scenes Remotion does poorly (equation morphs, 3D),
  rendered as transparent clips and composited in Remotion.

Validated in milestone 1: Remotion handled Korean type, KaTeX, 9:16 layout,
word-synced captions, and audio; a frame renders in under 2 s and the 51 s
short in about 20 s. No scene needed Manim: equation steps work as KaTeX
token morphs (shared tokens slide, the rest fade without overlapping), so
Manim stays reserved for true glyph-shape morphs and 3D.

## Quality comes from a component library, not free-form generation

A style guide (palette, type, easing) plus tested primitives: equation reveal,
graph, number line, vector, highlight, caption track. Agents compose and
parameterize these; they don't write animation from scratch. Published
agent → Manim work (TheoremExplainAgent, Code2Video) found layout (overlap,
off-frame) to be the main failure mode.

## Pipeline: file handoffs between stages

`topic.md → research.md (sourced) → two script variants + takes →
script.md + narration take → word timestamps → storyboard.json → beat cues →
scenes → render.mp4 → review.md → publish.md`

Each stage reads the previous file and writes its own, so any stage can be
re-run, hand-edited, or gated by a human.

- **Storyboard is its own stage.** In this style the visual *is* the
  explanation, so script and visuals are designed together. Otherwise the scene
  agent improvises and narration and picture drift apart.
- **Two script variants.** Two writers draft the script independently, and
  the human picks one by ear. Episode 001's v1 and v2 differed in approach and
  in luck at once, so one draft can't tell the human's taste from a draw;
  takes are free and a minute each.
- **Audio before the storyboard.** Each variant's TTS take is generated right
  after the script, with sped-up copies, and the human picks a script and a
  speed together on one listening page. The picked take is aligned to word
  timestamps, and the storyboard is written against those real timings, then
  cues bind animation to the words. Never time animation by hand-set seconds.
  (Milestone 1 wrote the storyboard on estimated timings; the real ones
  exposed collisions only after rendering.)
- **Review looks at pixels.** Extract frames per beat and check them visually:
  overlap, off-frame, Shorts UI safe areas (bottom/right), legibility. Check
  facts against research.md sources, and check math computationally where
  possible. The reviewer is a fresh agent, not the one that made the scenes.
- **Human checkpoints:** topic, script + take, storyboard, the first render
  (feel, before any polish), and the final cut with its upload metadata. Each
  is something to hear or see (the takes page, the storyboard viewer page, the
  video), not a document to read. The orchestrator records each decision, in
  the human's words, in the episode's `checkpoints.md`: proof the checkpoint
  passed, and a record of the channel's taste. No full autonomy early on.

## Agents: one specialist per stage group

Each stage group belongs to a specialist agent: a fresh subagent that reads the
previous stage's files and writes its own. Agents collaborate only through
files. Each agent is a stage skill in `.claude/skills/` that runs as a forked
subagent (`/qa <slug>`). The main conversation orchestrates with the `episode`
skill, its runbook: it runs the tools between stages, passes files along, and
stops at the human checkpoints.

Stage numbers follow the `episode` runbook.

| Agent | Stages | Reads → writes |
| ----- | ------ | -------------- |
| Topic | 1 | past episodes → `topic.md` (candidates, duplicate check) |
| Research | 2 | `topic.md` → `research.md` (claims, sources, dates), `verify.py` |
| Script (×2) | 3 | `topic.md`, `research.md` → `script.<variant>.md` |
| Storyboard | 5 | picked `script.md`, the approved take's words → `storyboard.json` |
| Production | 6, 8 (fixes) | `storyboard.json` (owned from here on), approved take → beat cues → scenes → `render.mp4`; every fix |
| QA | 7–8 | render, `research.md` → `review.md` (captions, audio sync, layout, facts) |
| Publish | 9 | approved render, `script.md`, `research.md`, `docs/channel.md` → `publish.md` (title, description, tags, playlist, thumbnail), `publish/` |

- Script and storyboard are designed together because the visual is the
  explanation (see Pipeline): the writer gives each beat one picture in its
  `비주얼` line, and the storyboard agent realizes it, reporting where it
  can't. Milestone 1 used one agent for both passes; skills start fresh each
  run and can't be resumed across sessions, so the `비주얼` line carries the
  intent. Between the two stages the orchestrator runs the takes
  (`studio/scripts/narrate.mts`), and the human picks script and take before
  the storyboard.
- **Once production starts, one agent owns every fix.** The production
  agent takes over `storyboard.json` from the storyboard agent, edits it and
  `studio/` alike, and renders itself. In milestone 1, spec fixes and player
  fixes went to two agents, and relaying what one learned to the other became
  the main cost (~12 messages in one round) and caused a render race. What is
  said or claimed (read-aloud, captions, claim IDs) still goes back to the
  script stage; production then syncs the storyboard to it.
- QA is never the agent that built the scenes.
- **A second model critiques twice.** Codex, in a read-only sandbox
  (`studio/scripts/critique.mts`), reviews each script variant before the
  takes (editorial: hook, curiosity arc, pacing) and the first render as a
  viewer, from contact sheets, while QA and the human look at it too. Its
  findings are advice, not gates: at most two critique-and-revise rounds per
  stage, the orchestrator picks which findings to apply (the critic doesn't
  see every constraint, e.g. the upload title or the pronunciation list), and
  then the human judges. In milestone 1 an outside Codex review caught what no Claude agent had: the
  episode explained well but never made the viewer wonder. But the rewrite
  that followed its advice as a checklist (v2) came out busier and was liked
  less than the original, so critique is weighed against the human's feel,
  and the human watches the first render before any critique-driven polish.
- Milestone 1's hand-written briefs became the stage skills; the Codex
  critics' briefs live next to `critique.mts`. Whatever a skill has to carry
  beyond its input files shows what the handoff files are missing.

## Episode folders and git

- **Slug: `NNN-english-kebab`** (e.g. `001-a4-paper-ratio`). The number keeps
  production order; ASCII paths stay safe in CLI tools; English keeps the
  folder name valid when an English version is added.
- **Git holds text artifacts only; all media stays out.** Every media file can
  be regenerated from the committed text: a new TTS take, then alignment and
  cues rebuild and the animation re-times itself, because cues bind to words.
  A regenerated take is equivalent, not identical (TTS never repeats a take),
  so a regenerated episode needs a fresh QA pass. This keeps the public repo
  small.
- **Each approved episode gets a GitHub Release** tagged with its slug, at the
  commit that produced the cut: the final video, the original TTS take (FLAC,
  lossless), and the mixed narration. That is the exact-media backup; git
  stays text-only. The approved video is also copied to `publish/` for upload.
  After upload, the YouTube URL goes into the episode's `publish.md` and the
  release notes.

## Language: Korean first, English later

- The early bottleneck is judging quality (hooks, TTS naturalness), which is
  sharper in the native language.
- English STEM shorts are saturated with AI-produced channels. The Korean
  market is smaller with lower CPM; accepted.
- That gap is the topic niche: a topic proven in English science Shorts or
  YouTube but not yet told in Korean is worth making. What Korean viewers
  already know (textbook material, common trivia) isn't; the human passed on
  a batch of those for 002.
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
