---
name: episode
description: This skill should be used when the user asks to "make episode 002", "start the next episode", "continue episode <slug>", "what's next for <slug>", or otherwise to run or resume the tangent production pipeline. It is the orchestrator's runbook for the main conversation: stage order, which skill or tool runs each stage, what the human hears or sees at each checkpoint, and when to commit.
argument-hint: [slug]
---

# Episode runbook

Episode: `$ARGUMENTS` (a slug; if empty, resume the newest `episodes/*/`
folder, or start at the topic stage if its episode has shipped).

Run one episode through the pipeline from the main conversation. Stage work
belongs to the stage skills (`research`, `script`, `storyboard`,
`production`, `qa`, `publish`): each runs as a fresh forked agent, reads the
previous stage's files, and writes its own. The orchestrator runs the tools
between stages, weighs critiques, talks to the human, and commits. Background:
`docs/decisions.md` (Pipeline, Agents), `docs/channel.md`, and
`studio/README.md` (every command; run them from `studio/` with
`ep=../episodes/<slug>`).

## Where things stand

Find the next step from the episode folder:

| Present | Next |
| ------- | ---- |
| nothing | 1 Topic |
| `topic.md` | 2 Research |
| `research.md` | 3 Script variants |
| `script.<v>.md` files | 3 critique, then 4 Takes |
| `script.md`, `narration.json` | 5 Storyboard |
| `storyboard.json` (approved) | 6 Production |
| `render.mp4`, no `review.md` | 7 First look |
| `review.md`, latest verdict not ship | 8 Fix round |
| review says ship, no `publish.md` | 9 Publish |
| `publish.md` without a `게시:` line | 10 Release and upload |

## 1. Topic 🛑

Run the topic agent (brief: `docs/briefs/topic.md`) for a pool of candidates
in `docs/topics.md`. The human picks one. Write `episodes/<slug>/topic.md`
from the pick (slug rule: decisions.md → Episode folders): insight, hook,
key picture, length target (40–50 s unless the topic needs otherwise), why
it was picked, and the shelved candidates. Commit.

## 2. Research

Invoke `/research <slug>`. Run `python3 verify.py` in the episode folder.
Commit `research.md` and `verify.py`.

## 3. Script: two variants

Invoke `/script <slug> a` and `/script <slug> b`; the writers work
independently, which separates the human's taste from one draft's luck.
When both report, critique each with Codex:
`node scripts/critique.mts $ep script script.a.md` (and `script.b.md`).
Read each critique, pick the findings worth applying (the critic doesn't see
the pronunciation list or the upload title, and its structural advice made
episode 001 busier), and resume each writer (SendMessage) with them for one
revision; a fresh `/script` run with the notes after the letter works when
the writer can't be resumed. A second critique round only if the first said
**restructure**. Commit both variants and their critiques.

## 4. Takes 🛑

```sh
node scripts/narrate.mts $ep --script=script.a.md --tempo=1.08,1.15
node scripts/narrate.mts $ep --script=script.b.md --tempo=1.08,1.15
python3 scripts/takes-view.py $ep --fragment   # → $ep/takes.html
```

Publish `takes.html` as a private artifact and give the human the link: both
scripts' takes at 1.0×, 1.08×, and 1.15×, with captions to follow along.
Ask for one pick (script and speed); listening decides, not reading. Then:

```sh
git mv $ep/script.a.md $ep/script.md          # the picked variant
git mv $ep/critique-script.a.md $ep/critique-script.md
git rm $ep/script.b.md $ep/critique-script.b.md
```

Write `narration.json` (`source`, `take`, `tempo`, `model`, `voice`, `style`;
see episode 001's) and align the picked file:
`uv run scripts/align.py $ep/take<N>@<tempo>.wav $ep/take<N>.txt
$ep/take<N>@<tempo>.words.json`. Commit, with the pick and the human's
reason in the message; the unpicked variant stays in git history.

## 5. Storyboard 🛑

Invoke `/storyboard <slug>`. Check its report, rerun
`python3 scripts/validate-storyboard.py $ep`, then
`python3 scripts/storyboard-view.py $ep --fragment` and publish
`storyboard.html` as a private artifact: captions, each cue under its word,
the take playing in sync. The human approves or gives notes (a revision
goes back to `/storyboard <slug> <notes>`). Commit.

## 6. Production

Invoke `/production <slug>`. It builds cues and scenes, renders, and passes
check-render. Commit the episode's text files (`cues.json`, `words.json`,
`check.md`, `check.json`) and the studio changes, separately when the studio
changes are reusable (`feat(studio): …`).

## 7. First look 🛑, with QA and critique in parallel

The human watches the first render before any polish: send `render.mp4`
(SendUserFile when available, or give `! open episodes/<slug>/render.mp4`)
and ask how it feels: flow, pace, pictures. Meanwhile invoke `/qa <slug>` and
run `node scripts/critique.mts $ep cut`. Commit `review.md` and
`critique-cut.md`.

## 8. Fix rounds

Combine one round's notes: the human's first, then QA's issues by number,
then the critique points worth taking (weighed against the human's feel;
never effects for their own sake). Send them to the production agent that
built the render (SendMessage), or invoke `/production <slug> fix: <notes>`
if it can't be resumed. It alone edits `storyboard.json` and `studio/` from
here on, so nothing is relayed between agents. A note that changes what is
said or claimed goes back to stage 3–4 instead.

Then QA again: resume the QA agent with the round's summary (say whether
anything global changed, which requires a full pass), or `/qa <slug> <notes>`.
Commit each round (`fix(<slug>): …`, then `docs(<slug>): QA round N`). Repeat
until QA says ship. At most two cut-critique rounds; a second only after a
substantial change.

## 9. Publish 🛑

Invoke `/publish <slug>`. The human sees the final cut and the metadata
together: send the video, and show the title, the description's first two
lines, and the thumbnail frame. On approval, commit `publish.md`.

## 10. Release and upload

These steps are outward-facing: ask before pushing or creating the release.

- Push, then create the GitHub Release tagged `<slug>` at the commit that
  produced the cut: `publish/<slug>.mp4`, `publish/<slug>.thumb.png`, the
  original take as FLAC (`ffmpeg -i $ep/take<N>.wav $ep/take<N>.flac`), and
  `narration.mp3`, with rebuild steps in the notes (FLAC → WAV → atempo →
  build-cues → render.mts), as in release `001-a4-paper-ratio`.
- The human uploads by hand (docs/channel.md has the upload defaults). After
  upload, add `게시: <URL> (<date>)` under the title in `publish.md` and
  `**Watch:** <URL>` at the top of the release notes. Commit and push.

## Rules

- **Checkpoints are things to hear or see:** the takes page, the storyboard
  page, the video. Ask one decision per message; bundled questions stalled
  milestone 1.
- **One writer per file at a time.** Parallel agents never share a file;
  after the first render only the production agent edits `storyboard.json`
  and `studio/`, and it renders itself.
- **Critiques are advice.** At most two critique rounds per stage; the human's
  feel decides.
- **Commits:** one per stage or fix round, conventional commits with the slug
  as scope, adding only this episode's and the changed studio files (another
  session may be working in the same tree). Push only when the human says.
- **Log the run** in `docs/milestone-2-notes.md`: per stage, agent time,
  human wait, blockers, repeated work, silent failures.
