---
name: research
description: >-
  This skill should be used when a tangent episode needs its sourced fact
  base, e.g. "research episode 002", "/research 002-<slug>", "002 리서치",
  "revise research.md", or when the episode runbook reaches the research
  stage. A fresh agent writes episodes/<slug>/research.md and verify.py from
  topic.md. Not for general web research outside an episode.
argument-hint: "<slug> [revise: <notes>]"
context: fork
---

# Research: the episode's fact base

Arguments: `$ARGUMENTS`: the episode slug (folder `episodes/<slug>/`),
optionally followed by `revise:` and what to change. If the slug isn't an
existing episode folder with a `topic.md`, stop and report without writing
anything.

Write the sourced fact base the episode stands on. The script may only state
what `research.md` supports, and QA and the publish step check against it.
Read `docs/decisions.md` first; `episodes/001-a4-paper-ratio/research.md` is
a shipped example (sections Sources, Claims, Easy to misstate; sources S1,
S2, ...).

Input: `topic.md` (and, when revising, the existing `research.md`). Output:
`research.md` and `verify.py` in the episode folder. Edit nothing else and
don't commit; the orchestrator does.

## Sources

- Prefer primary sources (the standard, the paper, the official page), then
  reputable secondary ones. Cite a source only if it was actually read; name a
  source that couldn't be opened in the text, but don't list it as read.
  Paywalled standards are common (iso.org returns 403); a preview or two
  agreeing secondary sources are the fallback, and the notes say which.
- For each source: author or body, title, date or edition, URL, and the access
  date.
- Quote the exact sentence that supports each claim, in the source's language.
  Save each source's raw text (`curl` the page or PDF into a scratch
  directory from `mktemp -d`; PDF text via `uv run --with pypdf`) and
  match every quote against it with code. WebFetch returns a model's reading
  of the page, not the page, so it can't confirm a quote.

## Claims

- One table row per claim the video might use: ID (C1, C2, ...), the claim in
  Korean, the supporting quote(s) with source IDs, and how it was verified
  computationally (if numeric). Rows start `| C<n> |`; the storyboard
  validator reads the IDs from them.
- Every numeric claim gets a check in `verify.py` (plain Python, no
  dependencies; `python3 verify.py` passes).
- Keep an "Easy to misstate" list: wordings that would be false or misleading
  (exact vs. approximate, direction, design value vs. measured, who invented
  what), with the correct form. The script writer and QA both use it.
- When revising, keep existing claim IDs stable; add new IDs rather than
  renumbering.

## Report back

New or changed claim IDs, sources that couldn't be accessed, and anything the
topic assumes that the sources don't support.
