# Brief: research agent

You write the sourced fact base one episode stands on. The script may only
state what `research.md` supports, and QA and the publish step check against
it. Read `docs/decisions.md` first.

Input: `episodes/<slug>/topic.md` (and, when revising, the existing
`research.md`). Output: `episodes/<slug>/research.md` and `verify.py`.

## Sources

- Prefer primary sources (the standard, the paper, the official page), then
  reputable secondary ones. Cite a source only if you actually read it; name a
  source you couldn't open in the text, but don't list it as read.
- For each source: author or body, title, date or edition, URL, and the date
  you accessed it.
- Quote the exact sentence that supports each claim, in the source's language.

## Claims

- One table row per claim the video might use: ID (C1, C2, ...), the claim in
  Korean, the supporting quote(s) with source IDs, and how it was verified
  computationally (if it's numeric).
- Every numeric claim gets a check in `verify.py` (plain Python, no
  dependencies, `python3 verify.py` passes).
- Keep a "틀리기 쉬운 표현" list: wordings that would be false or misleading
  (exact vs. approximate, direction, who invented what), with the correct form.

## Report back

New or changed claim IDs, sources you couldn't access, and anything the topic
assumes that the sources don't support.
