# AGENTS.md

## Project

Agent-driven short-form video studio: math / science / tech / engineering
explainers with code-rendered animation (3Blue1Brown-style). Claude Code agents
run the production pipeline; a human approves at checkpoints.

Status: milestone 2; episode 001 published 2026-09-26. Episodes run through
the stage agents in `.claude/agents/`, orchestrated from the main
conversation by the `episode` skill. Read
[docs/decisions.md](docs/decisions.md) before proposing stack, pipeline, or
format changes, [docs/milestone-1-notes.md](docs/milestone-1-notes.md) for
what the first episode taught, and
[docs/milestone-2-notes.md](docs/milestone-2-notes.md) for the running log.

## Layout

Directories get created when they first have content.

- `episodes/<slug>/`: one short per folder, holding each pipeline stage's
  handoff file (see decisions.md → Pipeline).
- `studio/`: Remotion project: style guide + reusable scene components.
- `publish/`: the upload tray. Once QA says ship, the publish agent fills it
  for the final checkpoint: `<slug>.mp4`, `<slug>.thumb.png`, and
  `<slug>.md` (a symlink to the episode's committed `publish.md`).
  Gitignored. Channel-wide settings: `docs/channel.md`.
- `.claude/agents/`: one agent per stage, `tangent-<stage>` (see
  decisions.md → Agents).
- `.claude/skills/episode/`: the orchestrator's runbook.
- `docs/korean.md`: the channel's Korean wording rules, on top of the
  global `korean-polish` skill (which polishes what the human posts).
