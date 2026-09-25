---
name: script
description: >-
  This skill should be used when a tangent episode needs its narration script
  or a revision of it, e.g. "write the script for 002", "/script 002-<slug>
  a", "002 대본 써줘", "/script 002-<slug> a revise: <notes>", or when the episode
  runbook reaches the script stage (it runs once per variant). A fresh writer
  agent writes episodes/<slug>/script.md, or script.<variant>.md when a
  variant letter is given. Not for code in studio/scripts/.
argument-hint: "<slug> [a|b] [revise: <notes>]"
context: fork
---

# Script: what the viewer hears and reads

Arguments: `$ARGUMENTS`: the episode slug (folder `episodes/<slug>/`), then an
optional variant letter, then optionally `revise:` and notes. With a letter,
the file is `script.<letter>.md` (e.g. `script.a.md`); without one,
`script.md`. If the slug isn't an existing episode folder with `topic.md` and
`research.md`, stop and report without writing anything.

Write one YouTube Shorts episode's script: Korean-language math / science /
engineering explainers in the 3Blue1Brown style, code-rendered animation.
Read `docs/decisions.md` (Format, Style) and `docs/narration.md` first.
`episodes/001-a4-paper-ratio/script.md` is a shipped example of the layout.

Inputs: `topic.md` and `research.md` in the episode folder. Write only the
script file; don't edit other files and don't commit.

**Variants.** With a variant letter, another writer drafts the same episode
independently and the human picks one by ear. Don't open the other variant's
file. Write the version believed best, not a deliberate contrast.

## Format

- 9:16 Short, one visual insight. The length target comes from `topic.md`;
  never over 60 s.
- Hook within the first 1–2 s, carried by both the first words and the first
  visual. No greeting, no channel intro, no "구독과 좋아요".
- Korean, polite casual "~요" register, spoken rhythm: short sentences, one
  idea per sentence.
- Audience: curious high-schoolers and adults. Explain with the picture, not
  with jargon.

## Telling it

A 40–50 s Short has room for one idea told well, not for every step of a
documentary arc. Episode 001 was written twice. v1 showed the surprising
fact, explained it with one picture and the classic derivation, checked it
on the real sheet, and ended on the size system. v2 fit a question → guess →
search → proof → use arc into the same length and came out busier and harder
to follow; the human preferred v1 by feel. So treat what follows as
judgment, not a template:

- Open with something surprising about a thing the viewer knows, within the
  first 1–2 s. A question can do it; so can a plain statement over a picture
  that makes the viewer ask "why?".
- Follow one line of thought in the order that's easiest to follow. Prefer
  the shortest familiar explanation over a clever one with more steps.
- Fewer, bigger pictures beat many small moves; let a result sit still for a
  moment when it lands.
- End where the idea pays off. Returning to the opening picture makes the
  loop work.
- Don't make the viewer read the same formula in two places at once; when
  the picture shows the math, the caption can say what it means.
- Be precise where it's cheap to be: say the direction of an operation, write
  rounded values with ≈, keep design values apart from measured ones (see
  research.md's Easy to misstate section).

## Beats

Split the script into beats (B1, B2, ...), one idea each. Every beat has:

- **Display**: the on-screen caption text. Math goes in dollar
  signs as KaTeX (`$\frac{x}{2}$`, `$\sqrt{2}$`). Numbers as digits.
- **Read-aloud**: the exact TTS input, following
  `docs/narration.md` (spelling out, and clashes to avoid). Spell out every
  number, symbol, formula, Latin letter, and English term in Hangul
  (`$x^2 = 2$` → "엑스 제곱은 이", "A4" → "에이포", "210" → "이백십").
  Commas mark breaths. The word sequence must be something a forced aligner
  can match: Hangul words only, no digits or Latin letters.
- **Visual**: one line: what the viewer sees, the single picture that carries
  the idea. A separate storyboard agent turns this line into the spec, so it
  must say what matters about the picture. If a shape is scaled to compare
  with another, the scaling should read as scaling, not as "the same size".
  A silent hold after the beat goes at the end of this line as
  `(hold <N> s)`, 0–1.5 s; the storyboard starts its pacing from it.
- **Claims**: the research.md claim IDs (C1, C2, ...) this beat relies on. A
  factual statement without a claim ID is not allowed; pure arithmetic or
  logic shown on screen may say "arithmetic".

Respect research.md's Easy to misstate section.

## Length budget

Narration is Gemini TTS (`gemini-3.8-flash-tts`, voice Kore, fast style). Its
rate varies by take: 4.9–5.3 Hangul syllables per second including natural
pauses. Budget at **5.0**: estimated seconds = Hangul syllables in Read-aloud ÷
5.0. Count syllables with code (e.g. `len(re.findall(r'[가-힣]', text))`),
not by eye. Leave 2–4 s of the target for the silent holds. The human hears
the take at 1.0× and sped up (1.08×, 1.15×) and picks one.

## File layout

A short header (total syllables, estimated narration length, estimated total
with silent holds), then one `## B<n> · <name> (~<sec> s)` section per beat
with the four bullets above. Tools parse this: no other `##` headings, and
`**Display:**` and `**Read-aloud:**` each on one line. Notes go in the report,
not the file.

## Revising

A revision comes from the orchestrator, either by resuming this agent or as
`revise:` notes in a fresh run: a Codex critique (`critique-script.md`, or
`critique-script.<letter>.md` for a variant) and/or the human's notes. Edit
the existing file in place, keep beat IDs stable where beats survive, and
leave untouched what the notes don't reach. The critique is advice from a
reader who doesn't see every constraint (upload title, pronunciation list):
apply what makes the script clearer or more accurate, skip what adds steps or
effects against "Telling it", and say which findings were skipped and why.

## Before finishing

- Recount syllables and check the total against the target.
- Check every Claims ID exists in research.md and says what the beat claims.
- Report back: the total length estimate, the hook in one line, and any
  choice that felt uncertain.
