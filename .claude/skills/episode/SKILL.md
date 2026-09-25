---
name: episode
description: >-
  This skill should be used when the user asks to "make episode 002", "start
  the next episode", "continue episode <slug>", "what's next for <slug>", "다음
  편 만들자", or otherwise to run or resume the tangent production pipeline. It is
  the orchestrator's runbook for the main conversation, covering stage order,
  which skill or tool runs each stage, what the human hears or sees at each
  checkpoint, and when to commit.
argument-hint: "[slug]"
---

# Episode runbook

Episode: `$ARGUMENTS` (a slug; if empty, resume the newest `episodes/*/`
folder, or start at the topic stage if its episode has shipped).

Run one episode through the pipeline from the main conversation. Stage work
belongs to the stage skills (`research`, `script`, `storyboard`,
`production`, `qa`, `publish`): each runs as a fresh forked agent in the
background, reads the previous stage's files, writes its own, and reports
back; SendMessage resumes it for a revision. The orchestrator runs the tools
between stages, weighs critiques, talks to the human, records the human's
decisions, and commits. Background: `docs/decisions.md` (Pipeline, Agents),
`docs/channel.md`, and `studio/README.md` (every command; run them from
`studio/` with `ep=../episodes/<slug>`).

## `checkpoints.md`

Every human decision goes into `episodes/<slug>/checkpoints.md` as soon as
it's made, in the human's own words where they gave reasons, and is
committed with that stage:

```markdown
# Checkpoints · <slug>

- <date> · topic · picked "<title>": <why>
- <date> · script + take · script.b at 1.08×: "<the human's words>"
- <date> · storyboard · approved (notes: …)
- <date> · first look · <feel, notes; length gate decision if any>
- <date> · final · approved with metadata
```

It's the record of the channel's taste (which variant won and why) and the
only proof a checkpoint passed: files can exist before the human has looked.

## Where things stand

Read `checkpoints.md` for the last decision, then the folder:

| Last checkpoint | Files | Next |
| --------------- | ----- | ---- |
| none | no `topic.md` | 1 Topic |
| topic | no `research.md` | 2 Research |
| topic | `research.md` | 3 Script variants |
| topic | `script.<v>.md`, takes | 4 Takes (the pick) |
| script + take | no approved storyboard | 5 Storyboard |
| storyboard | no `render.mp4` | 6 Production |
| storyboard | `render.mp4` | 7 First look |
| first look | latest review round not **ship** | 8 Fix round |
| first look | review **ship**, no `publish.md` | 9 Publish |
| first look | `publish.md` | 9 Final checkpoint |
| final | no `Published:` line in `publish.md` | 10 Release and upload |

A **rework** verdict, or a first look that rejects the flow, goes back to the
human with the options (restoryboard, rewrite, or push on) before any fix.

## 1. Topic 🛑

Spawn a general-purpose agent with `docs/briefs/topic.md` as its task for a
pool of candidates in `docs/topics.md` (the topic stage isn't a skill yet).
The human picks one. Write `episodes/<slug>/topic.md` from the pick (slug
rule: decisions.md → Episode folders): insight, hook, key picture, length
target (40–50 s unless the topic needs otherwise), why it was picked, and the
shelved candidates. Record the pick in `checkpoints.md`. Commit.

## 2. Research

Invoke `/research <slug>`. Run `python3 verify.py` in the episode folder.
Commit `research.md` and `verify.py`.

## 3. Script: two variants

Invoke `/script <slug> a`, then `/script <slug> b`; the writers work
independently, which separates the human's taste from one draft's luck. The
first runs in the background; the second holds the turn until it returns,
because Claude Code waits on a forked skill invoked while the same skill is
still running. When both have reported, critique each with Codex:
`node scripts/critique.mts $ep script script.a.md` (and `script.b.md`).
Read each critique and pick the findings worth applying (the critic doesn't
see the pronunciation list or the upload title, and its structural advice
made episode 001 busier). Resume each writer with them for one revision, or
invoke `/script <slug> <v> revise: <findings>` if it can't be resumed. A
second critique round only if the first said **restructure**. Commit both
variants and their critiques.

## 4. Takes 🛑

```sh
node scripts/narrate.mts $ep --script=script.a.md --tempo=1.08,1.15
node scripts/narrate.mts $ep --script=script.b.md --tempo=1.08,1.15
python3 scripts/takes-view.py $ep --fragment   # → $ep/takes.html
```

Publish `takes.html` as a private artifact and give the human the link: both
scripts' takes at 1.0×, 1.08×, and 1.15×, with captions to follow along.
Ask for one pick, a script and a speed; listening decides, not reading. Then,
for a pick of script b at 1.08× (take2):

```sh
git mv $ep/script.b.md $ep/script.md
git mv $ep/critique-script.b.md $ep/critique-script.md
git rm $ep/script.a.md $ep/critique-script.a.md
uv run scripts/align.py $ep/take2@1.08.wav $ep/take2.txt $ep/take2@1.08.words.json
```

At 1.0× the audio is `take2.wav` and the timings `take2.words.json`. Write
`narration.json` with `source` set to the picked audio file (plus `take`,
`tempo`, `model`, `voice`, `style`; see episode 001's). Record the pick and
the human's reason in `checkpoints.md` and commit; the unpicked variant stays
in git history.

## 5. Storyboard 🛑

Invoke `/storyboard <slug>`. Check its report, rerun
`python3 scripts/validate-storyboard.py $ep` (exit 1 on errors), then
`python3 scripts/storyboard-view.py $ep --fragment` and publish
`storyboard.html` as a private artifact: captions, each cue under its word,
the take playing in sync. The human approves or gives notes; notes go to
`/storyboard <slug> revise: <notes>` (or the resumed agent). Record the
approval in `checkpoints.md` and commit.

## 6. Production

Invoke `/production <slug>`. From here on it owns `storyboard.json`: it
builds cues and scenes, renders, and passes check-render, retuning layout
where the checks need it. Commit the episode's text files (`storyboard.json`
if changed, `cues.json`, `words.json`, `check.md`, `check.json`) and the
studio changes, separately when the studio changes are reusable
(`feat(studio): …`). A length-gate miss in its report is a question for the
first look.

## 7. First look 🛑, with QA and critique in parallel

The human watches the first render before any polish: send `render.mp4`
(SendUserFile when available, or give `! open episodes/<slug>/render.mp4`)
and ask how it feels: flow, pace, pictures. Meanwhile invoke `/qa <slug>` and
run `node scripts/critique.mts $ep cut`. Record the human's reaction in
`checkpoints.md`; commit it with `review.md` and `critique-cut.md`.

## 8. Fix rounds

Combine one round's notes: the human's first, then QA's issues (`r<N>#<k>`),
then the critique points worth taking (weighed against the human's feel;
never effects for their own sake). Send them to the production agent that
built the render (SendMessage), or invoke `/production <slug> fix: <notes>`
if it can't be resumed. It alone edits `storyboard.json` and `studio/`, so
nothing is relayed between agents.

A note that changes what is said or claimed goes through the script first:
revise `script.md` (`/script <slug> revise: <notes>`), make a new take with
`narrate.mts` and `takes-view.py`, let the human listen, align it, and update
`narration.json`; then the fix round tells production to sync
`storyboard.json` to the new script and take.

Then QA again: resume the QA agent with the round's summary (say whether
anything global changed, which requires a full pass), or `/qa <slug> <notes>`.
Commit each round (`fix(<slug>): …`, then `docs(<slug>): QA round N`). Repeat
until QA says ship. At most two cut-critique rounds; a second only after a
substantial change.

## 9. Publish 🛑

Invoke `/publish <slug>`. The human sees the final cut and the metadata
together: send the video, and show the title, the description's first two
lines, and the thumbnail frame. On approval, record it in `checkpoints.md`
and commit `publish.md`.

## 10. Release and upload

These steps are outward-facing: ask before pushing or creating the release.

- Push, then create the GitHub Release tagged `<slug>` at the commit that
  produced the cut: `publish/<slug>.mp4`, `publish/<slug>.thumb.png`, the
  original take as FLAC (`ffmpeg -i $ep/take<N>.wav $ep/take<N>.flac`), and
  `narration.mp3`, with rebuild steps in the notes (FLAC → WAV → atempo →
  build-cues → render.mts), as in release `001-a4-paper-ratio`.
- The human uploads by hand (docs/channel.md has the upload defaults). After
  upload, add `Published: <URL> (<date>)` under the title in `publish.md` and
  `**Watch:** <URL>` at the top of the release notes. Commit and push.

## Rules

- **Checkpoints are things to hear or see:** the takes page, the storyboard
  page, the video. Ask one decision per message; bundled questions stalled
  milestone 1.
- **One writer per file at a time.** Parallel agents never share a file. The
  storyboard agent writes `storyboard.json` until production starts; from
  then on only the production agent edits it and `studio/`, and it renders
  itself.
- **Critiques are advice.** At most two critique rounds per stage; the human's
  feel decides.
- **Commits:** one per stage or fix round, conventional commits with the slug
  as scope, adding only this episode's and the changed studio files by path
  (another session may be working in the same tree). Push only when the
  human says.
- **Log the run** in `docs/milestone-2-notes.md`: per stage, agent time,
  human wait, blockers, repeated work, silent failures.
