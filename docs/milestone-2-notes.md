# Milestone 2 notes

A running log of milestone 2: episodes produced through the stage agents in
`.claude/agents/`, orchestrated from the main conversation by the `episode`
skill. The question is milestone 1's: which stage bottlenecks next. Per
stage, record agent time, human wait, blockers, repeated or mechanical work,
and silent failures.

## Log

### Skills, one fixer, two variants (2026-09-26)

Milestone 1's next-step candidates 1–3, done before episode 002's production
(decisions.md → Pipeline, Agents).

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
