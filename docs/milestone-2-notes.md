# Milestone 2 notes

A running log of milestone 2: episodes produced through the stage agents in
`.claude/agents/`, orchestrated from the main conversation by the `episode`
skill. The question is milestone 1's: which stage bottlenecks next. Per
stage, record agent time, human wait, blockers, repeated or mechanical work,
and silent failures.

## Log

### Skills, one fixer, two variants (2026-09-26)

Milestone 1's next-step candidates 1–3, done before episode 002's production
(decisions.md → Pipeline, Agents). The first bullets describe stage skills
as first built; "Agents instead of forked skills" below replaced them the
same day.

- **Briefs → skills.** Research, script, storyboard, production, QA, and
  publish are skills that run as forked subagents: each call starts a fresh
  context with the skill as its task, runs in the background, and returns a
  report; SendMessage resumes the agent for a revision or fix round. The
  orchestrator's own procedure, never written down in milestone 1, is the
  `episode` skill. Narration stayed tools (`narrate.mts --script`,
  `takes-view.py`) rather than an agent: none of its steps need judgment. The
  topic brief was being written in a parallel session and stays in
  `docs/briefs/` for now.
- **Constraints from the Claude Code docs** that shaped the skills: a forked
  skill doesn't see the conversation, so each skill stands alone; a stage
  agent spawning its own reviewer, as milestone 1's script agent did, would
  compete with the Codex critique and QA, so the writer, storyboard, and
  production agents get no Agent tool; a forked skill invoked while the same skill is still running blocks
  the orchestrator until it returns, so of the two script writers one runs in
  the background and the other holds the turn.
- **Relay cost:** once production starts, the production agent owns every
  fix, spec and code alike, and renders itself. QA numbers its issues, and
  the orchestrator sends one combined round (the human's notes first, then QA,
  then chosen critique points) instead of routing each fix to its owner.
- **Taste vs. luck:** two writers draft independently; the takes page puts
  both scripts at every speed on one page for the pick. The first render goes
  to the human for feel while QA and the Codex cut critique run in parallel.
- **Two fresh-eyes reviews before first use** (a skill reviewer agent and
  Codex) found mostly handoff gaps between skills, not problems inside one:
  the validator rejected the pacing changes production was now allowed to
  make; resuming from which files exist would skip checkpoints (QA writes
  `review.md` before the human's first look), so each episode now keeps
  `checkpoints.md`, which also records why the human picked a variant; a
  content change after the first render had no owner; the script skill had
  no way to take revision notes; and the storyboard's proxy render needs
  wiring that only exists once production starts, so production now owns
  `storyboard.json` from its start and the storyboard agent lists the
  extents it couldn't measure.
- **Agents instead of forked skills** (same day, before first use). Weighed
  against `plugin-dev:agent-development`: the stage roles are delegated work,
  which agent definitions are for, while the runbook is a procedure for the
  main conversation and stays a skill. What decided it: two writers of the
  same role run in parallel, the task is a plain message, and each role gets
  its own tool list. The topic brief became `tangent-topic` too. Narration
  speed is fixed at 1.08× (episode 001's pick), so the human compares
  scripts, not speeds, and the writer budgets at 5.3 syllables per second.
- **To watch in episode 002:** whether a fresh storyboard agent realizes the
  writer's `Visual` lines without the writer's context or a proxy render;
  whether one fixer's context holds up over several rounds; how long the
  added first-look checkpoint waits on the human.

### A freer topic agent (2026-09-26)

Episode 002's topic search ran four rounds in a parallel session (the pool
reached ~1,200 lines and some 45 candidates), and the human called the ideas
formulaic: mostly "why does everyday X do Y". The brief had the agent mine
popular Shorts, search suggestions, and Q&A sites, fill six fields per
candidate (evidence links, Korean coverage, production), bring 12–15, and
keep any field under a third; each round of feedback added another filter or
score. The same pattern as the script brief in milestone 1: rules forced on
the writer made the output safe and busy.

`tangent-topic` now gets one bar (a "wait, what?" and one picture that makes
it obvious), is told to start from what surprises it rather than from what's
popular, brings only ideas it would bet on (five to ten) with four short
fields, and names the one it would make first. `docs/topics.md` was reset to
the human's taste (their own words), what was made, and the ideas already
shown or rejected, by name only; the old rounds' notes are in git history. A
fresh reviewer caught that the first reset also dropped the shown list, so
the new agent would likely have repeated them.

### Whole-project review (2026-09-27)

Before episode 002, four fresh reviewers (rendering code, pipeline scripts,
agents and docs, architecture) and a Codex review read the whole repo. Codex
and a reviewer found the top two player bugs independently.

- **Silent failures fixed.** The player replaced an element whose id was
  reused after its exit, and the validator allowed it. `build-cues.py` took
  the take as free arguments, so cues from an unapproved take (001's 1.0×
  pair) passed every freshness check; it now reads `narration.json` and
  stamps the take into `cues.json`. `visibleAtStart` worked only in
  PaperRect and Note. `align.py`'s word check could never fail; it now fails
  on a word score below −5 or a gap over 1.5 s (001's takes: worst −2.6,
  widest 0.84 s; a phrase the take skips scores −9 to −13, an unscripted
  line leaves 5.1 s). Also: shared temp paths between runs, a stale
  `check.json` left by a crashed check, parallel takes claiming one number.
- **Ways back.** The runbook offered "restoryboard" after a rejected first
  look, but no agent could do it (the storyboard agent stops once
  `cues.json` exists). It now has a Going back section and a When a tool
  fails list.
- **Tests.** `npm test` (vitest: timeline, validator, cue freshness) and
  `npm run lint`, which now type-checks `scripts/` too.
- **Left for episode 002's build:** one schema for storyboard and cues
  (defined in four places today), and a player core that doesn't import
  PaperRect. 002's new components should shape both.

### Episode 002, the Moon's rotation (2026-09-27 → 28)

Published 2026-09-28 (https://youtube.com/shorts/WDywGPVblfU), 48.9 s, the
first episode through the stage agents. Times are wall clock.

- **Topic (~20 min agent):** the freer brief brought nine ideas; the human
  picked their own instead (the Moon turns once per orbit) and set the
  criteria: the picture first, and Korean coverage no longer counts.
- **Research (~30 min):** 16 claims, verify.py passes. It caught a premise
  the topic overstated (a month wouldn't show the far side in sunlight) and
  "dark side" as misleading rather than wrong.
- **Scripts (~10 min each, one revision):** both writers independently
  cut the Earth coda to stay under 50 s, and both critiques converged
  (open on the non-rotating Moon, lighten the mechanism, flip the myth at
  the end). Parallel takes claimed take1 and take2 cleanly (the new `wx`
  reservation's first real use).
- **Wording (two retakes):** the human picked by ear, then the new Claude
  critic and the human found words a listener can't follow once ("위쪽",
  "앞서", "부푼 쪽", "도로 당겨", "지구 방향을 지나쳤어요"). A survey of
  Korean 윤문 tools found none that caught these; the rules went into
  narration.md instead. The last wording was judged on the storyboard page,
  with the picture.
- **Storyboard (~30 min, re-synced twice):** eight new general components
  and a seamless loop (start and end at 6 o'clock). Re-syncing to a retake
  only moved anchors, since every cue binds to a word.
- **Production (~30 min):** generalized the player (Scene.state, a registry,
  draw order from data) with 001 frame-identical, and found a words-check
  detector miss that QA diagnosed and the orchestrator fixed (12dc309).
- **First look, one fix round (~15 min), QA ship:** the human liked the
  first render; the round was legibility only (sizes, holds, easing), taken
  from where QA and both critics converged.
- **Publish:** sources compacted to four and a 우주 이야기 playlist opened,
  both the human's calls; channel.md updated.
- **Human wait:** overnight between the storyboard page and approval; every
  other checkpoint came back within minutes.
- **Silent failures:** none reached the render. The checks that fired were
  the ones added in the review (take stamp, aligner, validator).
- **Side exploration:** a mascot, drawn as SVG by two agents (~6/10) and as
  six Codex image concepts (better), is on hold; the SVG drafts are in
  `git stash`.
