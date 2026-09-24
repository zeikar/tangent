# AGENTS.md

## Project

Agent-driven short-form video studio: math / science / tech / engineering
explainers with code-rendered animation (3Blue1Brown-style). Claude Code agents
run the production pipeline; a human approves at checkpoints.

Status: pre-code. Read [docs/decisions.md](docs/decisions.md) before proposing
stack, pipeline, or format changes.

## Planned layout

Directories get created when they first have content.

- `episodes/<slug>/`: one short per folder, holding each pipeline stage's
  handoff file (see decisions.md → Pipeline).
- `studio/`: Remotion project: style guide + reusable scene components.
- `docs/briefs/`: hand-written agent briefs from milestone 1; seeds for the
  skills.
- `.claude/skills/`: one skill per agent role (see decisions.md → Agents).
