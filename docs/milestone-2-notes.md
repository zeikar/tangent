# Milestone 2 notes

A running log of milestone 2: episodes produced through the stage skills in
`.claude/skills/`, orchestrated from the main conversation by the `episode`
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
  skill doesn't see the conversation, so each skill stands alone; a
  background subagent has no Agent tool, so a stage agent can't spawn its own
  reviewer as milestone 1's script agent did (Codex critique and QA cover
  that); a forked skill invoked while the same skill is still running blocks
  the orchestrator until it returns, so of the two script writers one runs in
  the background and the other holds the turn.
- **Relay cost:** after the first render, the production agent owns every
  fix, spec and code alike, and renders itself. QA numbers its issues, and
  the orchestrator sends one combined round (the human's notes first, then QA,
  then chosen critique points) instead of routing each fix to its owner.
- **Taste vs. luck:** two writers draft independently; the takes page puts
  both scripts at every speed on one page for the pick. The first render goes
  to the human for feel while QA and the Codex cut critique run in parallel.
- **To watch in episode 002:** whether a fresh storyboard agent realizes the
  writer's `비주얼` lines without the writer's context; whether one fixer's
  context holds up over several rounds; how long the added first-look
  checkpoint waits on the human.
