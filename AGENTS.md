# AGENTS.md

## Project

Agent-driven short-form video studio: math / science / tech / engineering
explainers with code-rendered animation (3Blue1Brown-style). Claude Code agents
run the production pipeline; a human approves at checkpoints.

Status: milestone 2; episode 001 published 2026-09-26. Episodes run through
the stage agents in `.claude/agents/`, orchestrated from the main
conversation by the `episode` skill. Read
[docs/decisions.md](docs/decisions.md) before proposing stack, pipeline, or
format changes, and [docs/milestone-1-notes.md](docs/milestone-1-notes.md) for
what the first episode taught.

## Planned layout

Directories get created when they first have content.

- `episodes/<slug>/`: one short per folder, holding each pipeline stage's
  handoff file (see decisions.md → Pipeline).
- `studio/`: Remotion project: style guide + reusable scene components.
- `publish/`: the upload tray. After the human approves the cut it holds
  `<slug>.mp4`, `<slug>.thumb.png`, and `<slug>.md` (a symlink to the
  episode's committed `publish.md`). Gitignored. Channel-wide settings:
  `docs/channel.md`.
- `.claude/agents/`: one agent per stage, `tangent-<stage>` (see
  decisions.md → Agents).
- `.claude/skills/episode/`: the orchestrator's runbook.
