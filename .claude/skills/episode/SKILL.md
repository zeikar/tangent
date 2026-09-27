---
name: episode
description: >-
  This skill should be used when the user asks to "make episode 002", "start
  the next episode", "continue episode <slug>", "what's next for <slug>", "다음
  편 만들자", or otherwise to run or resume the tangent production pipeline. It is
  the orchestrator's runbook for the main conversation, covering stage order,
  which agent or tool runs each stage, what the human hears or sees at each
  checkpoint, and when to commit.
argument-hint: "[slug]"
---

# Episode runbook

Episode: `$ARGUMENTS` (a slug; if empty, resume the newest `episodes/*/`
folder, or start at the topic stage if its episode has shipped).

Run one episode through the pipeline from the main conversation. Stage work
belongs to the stage agents in `.claude/agents/` (`tangent-topic`,
`tangent-research`, `tangent-script`, `tangent-storyboard`,
`tangent-production`, `tangent-qa`, `tangent-publish`). Spawn each with the
Agent tool in the background; the task message names the slug and anything
the stage needs (a variant letter, revision or fix notes). Each reads the
previous stage's files, writes its own, and reports back; SendMessage
resumes it for a revision with its context intact. Give each spawned agent a
name, `<stage>-<NNN>` plus a variant or round where needed (`script-002-a`,
`qa-002-2`), and a new name for a fresh re-spawn, so SendMessage reaches the
right one. Agent files load when a session starts: if the Agent tool doesn't
list the `tangent-*` agents, the session predates them and needs a restart.
The orchestrator runs the tools between stages, weighs critiques, talks to
the human, records the human's decisions, and commits. Background: `docs/decisions.md` (Pipeline, Agents),
`docs/channel.md`, and `studio/README.md` (every command; run them from
`studio/` with `ep=../episodes/<slug>`, set in each command, since shell
variables don't carry over between Bash calls).

## `checkpoints.md`

Every human decision goes into `episodes/<slug>/checkpoints.md` as soon as
it's made, in the human's own words where they gave reasons, and is
committed with that stage:

```markdown
# Checkpoints · <slug>

- <date> · topic · picked "<title>": <why>
- <date> · script + take · script b: "<the human's words>"
- <date> · storyboard · approved (notes: …)
- <date> · first look · <feel, notes; length gate decision if any>
- <date> · rework · <restoryboard | rewrite | push on>: "<the human's words>"
- <date> · retake · take<N>: <why, and what the human heard>
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
| first look | latest review round **fix then ship** | 8 Fix round |
| first look | latest review round **rework** | ask the human (Going back) |
| first look | review **ship**, no `publish.md` | 9 Publish |
| first look | `publish.md` | 9 Final checkpoint |
| final | no `Published:` line in `publish.md` | 10 Release and upload |
| rework | per the option picked | Going back |
| retake | `narration.json` not yet on it | point it there; then 8 Fix round, or restoryboard after a rewrite |

A **rework** verdict, or a first look that rejects the flow, goes back to the
human with the options (restoryboard, rewrite, or push on) before any fix;
see Going back.

## 1. Topic 🛑

If `docs/topics.md` has ideas the human hasn't ruled on, show them (name,
hook, and the picture in one line each, and the agent's first pick) and
ask. Spawn `tangent-topic` only
when there are none or the human passed on them, with the human's reactions
and reasons in the task. The human picks one. Write `episodes/<slug>/topic.md` from the pick (slug
rule: decisions.md → Episode folders): insight, hook, key picture, length
target (40–50 s unless the topic needs otherwise), why it was picked, and the
shelved candidates. Its first line is `# NNN · <title>`, which the
checkpoint pages show. Record the pick in `checkpoints.md`, add it to "Made
so far" in `docs/topics.md`, move the other ideas of that round to "Shown,
not picked", and delete the round's dated section. Commit.

## 2. Research

Spawn `tangent-research` with the slug. Run `python3 verify.py` in the
episode folder; if it fails, resume the research agent with the output.
If the report says the sources don't support what the topic assumes, take
that to the human as a topic question before committing research, and
record the answer as a `topic` line: reshape it (edit `topic.md`, resume the
research agent), or pick another (`git rm -r` the folder and start stage 1
again). Commit `research.md` and `verify.py`.

## 3. Script: two variants

Spawn two `tangent-script` agents in one message, one with variant `a` and
one with `b`; they write independently, which separates the human's taste
from one draft's luck. When both have reported, critique each (Codex and a
fresh Claude, in parallel, one file per variant):
`node scripts/critique.mts $ep script script.a.md` (and `script.b.md`).
Read each critique and pick the findings worth applying; a point both
critics raise weighs more (the critics don't see the pronunciation list or
the upload title, and structural advice made episode 001 busier). Resume
each writer with them for one revision, or spawn a fresh `tangent-script`
with the variant and the findings if it can't be resumed. A second critique
round only if a critic said **restructure**. Commit both variants and their
critiques.

## 4. Takes 🛑

Narration plays at 1.08× (episode 001's pick), so the human compares scripts,
not speeds:

```sh
node scripts/narrate.mts $ep --script=script.a.md --tempo=1.08
node scripts/narrate.mts $ep --script=script.b.md --tempo=1.08
python3 scripts/takes-view.py $ep --tempo=1.08 --fragment   # → $ep/takes.html
```

Publish `takes.html` as a private artifact and give the human the link: each
script's take at 1.08×, with captions to follow along. Ask which script;
listening decides, not reading. A script's take is whichever the page lists
under it (take numbers run in generation order). If a take mispronounces or
glitches, rerun `narrate.mts` for that script; the page then lists both, and
the human picks the take too. Then, for a pick of script b read by take2:

```sh
git mv $ep/script.b.md $ep/script.md
git mv $ep/critique-script.b.md $ep/critique-script.md
git rm $ep/script.a.md $ep/critique-script.a.md
uv run scripts/align.py $ep/take2@1.08.wav $ep/take2.txt $ep/take2@1.08.words.json
```

Write `narration.json` with `source` set to the picked audio file
(`take2@1.08.wav`; plus `take`, `tempo`, `model`, `voice`, `style`; see
episode 001's). Record the pick and the human's reason in `checkpoints.md` and
commit the renames, `narration.json`, the take's `.words.json`, and
`checkpoints.md`; the unpicked variant stays in git history.

## 5. Storyboard 🛑

Spawn `tangent-storyboard` with the slug. Check its report, rerun
`python3 scripts/validate-storyboard.py $ep` (exit 1 on errors), then
`python3 scripts/storyboard-view.py $ep --fragment` and publish
`storyboard.html` as a private artifact: captions, each cue under its word,
the take playing in sync. The human approves or gives notes; notes go to
the resumed storyboard agent (or a fresh one with the notes). Record the
approval in `checkpoints.md` and commit.

## 6. Production

Spawn `tangent-production` with the slug. From here on it owns
`storyboard.json`: it
builds cues and scenes, renders, and passes check-render, retuning layout
where the checks need it. Commit the episode's text files (`storyboard.json`
if changed, `cues.json`, `words.json`, `check.md`, `check.json`) and the
studio changes, separately when the studio changes are reusable
(`feat(studio): …`). A length-gate miss in its report is a question for the
first look.

## 7. First look 🛑, with QA and critique in parallel

The human watches the first render before any polish: send `render.mp4`
(SendUserFile when available, or give `! open episodes/<slug>/render.mp4`)
and ask how it feels: flow, pace, pictures. Meanwhile spawn `tangent-qa`
with the slug and run `node scripts/critique.mts $ep cut`. Record the human's reaction in
`checkpoints.md`; commit it with `review.md` and `critique-cut.md`.

## 8. Fix rounds

Combine one round's notes: the human's first, then QA's issues (`r<N>#<k>`),
then the critique points worth taking (weighed against the human's feel;
never effects for their own sake). Send them to the production agent that
built the render (SendMessage), or spawn a fresh `tangent-production` with
the notes if it can't be resumed. It alone edits `storyboard.json` and `studio/`, so
nothing is relayed between agents.

A note that changes what is said or claimed goes through the script first:
revise `script.md` (`tangent-script` with the notes), then retake it (also
the answer when the length gate asks for a retake):

```sh
node scripts/narrate.mts $ep --tempo=1.08          # → take<N>.wav, take<N>@1.08.wav
python3 scripts/takes-view.py $ep --tempo=1.08 --fragment
uv run scripts/align.py $ep/take<N>@1.08.wav $ep/take<N>.txt $ep/take<N>@1.08.words.json
```

Let the human listen and record it (`retake` in `checkpoints.md`), then
point `narration.json`'s `source` and `take` at the new take; the fix round
tells production to sync `storyboard.json` to the new script and take.

Then QA again: resume the QA agent with the round's summary (say whether
anything global changed, which requires a full pass), or spawn a fresh
`tangent-qa` with that summary.
Commit each round (`fix(<slug>): …`, then `docs(<slug>): QA round N`). Repeat
until QA says ship. At most two cut-critique rounds; a second only after a
substantial change.

## 9. Publish 🛑

Spawn `tangent-publish` with the slug. The human sees the final cut and the metadata
together: send the video, and show the title, the description's first two
lines, and the thumbnail frame. On approval, record it in `checkpoints.md`
and commit `publish.md`. A video fix asked for here is a fix round (stage
8). Once QA says ship on the new render, resume the publish agent (new
cut) so `publish/` and the thumbnail follow it, then show the human the new
cut and metadata again.

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

## Going back

The forward path above covers most of an episode; these are the ways back.

- **Rework: restoryboard.** The picture or flow is wrong, the script is
  right. `git rm $ep/cues.json`, which hands `storyboard.json` back to the
  storyboard agent (it won't touch one production has started on), and
  rename `render.mp4` to `render.v<N>.mp4` for comparison. Spawn a fresh
  `tangent-storyboard` with the human's notes, `review.md`, and
  `critique-cut.md`, then run stage 5 (a new storyboard checkpoint) and
  stage 6 with a fresh `tangent-production`, which reuses or reworks the
  studio components from the first pass.
- **Rework: rewrite.** What is said is wrong. Resume or spawn `tangent-script`
  on `script.md` with the human's notes; for another approach altogether,
  `git rm $ep/script.md $ep/critique-script.md` first and run stages 3–4
  again. Retake it as in stage 8 and let the human listen (a `retake`
  line), align it, and point `narration.json` at it. Then restoryboard as
  above; the rewrite is committed with the new storyboard (stage 5), since
  the old storyboard no longer matches the script.
- **Rework: push on.** Stage 8 with the human's notes.
- **A claim research.md lacks.** A writer, production, or QA that needs a
  fact without a claim ID reports it. Resume (or spawn) `tangent-research`
  with the claim, rerun `verify.py`, send the new claim ID back to whoever
  asked, and commit `research.md` and `verify.py` with that stage. Never
  write a fact without its claim ID.

## When a tool fails

- `verify.py`: back to the research agent (stage 2).
- `align.py` exits 1: it names where the take and its text disagree. Play
  that span to the human, or transcribe it with `mlx_whisper` as QA does
  (`tangent-qa.md`, narration); a bad take is retaken with `narrate.mts`,
  the human hears the new one, and it gets a `retake` line.
- `narrate.mts` stopping on a long rate-limit wait means the day's Gemini
  quota is spent: tell the human and continue the next day. Switching TTS
  engines is the human's call (decisions.md → Narration).
- `critique.mts` exits 1 when a critic failed; the file says which. Go on
  with the other critic's section and say so at the checkpoint; critiques
  are advice.
- `validate-storyboard.py` or `check-render.mts` failing after a stage
  agent reported success: back to the agent that owns `storyboard.json`
  (storyboard before production starts, production after).

## Rules

- **Checkpoints are things to hear or see:** the takes page, the storyboard
  page, the video. Ask one decision per message; bundled questions stalled
  milestone 1.
- **One writer per file at a time.** Parallel agents never share a file. The
  storyboard agent writes `storyboard.json` until production starts; from
  then on only the production agent edits it and `studio/`, and it renders
  itself. A restoryboard (Going back) hands it back, and production then
  starts fresh.
- **Critiques are advice.** At most two critique rounds per stage; the human's
  feel decides.
- **Commits:** one per stage or fix round, conventional commits with the slug
  as scope, adding only this episode's and the changed studio files by path
  (another session may be working in the same tree). `npm run verify` in
  `studio/` passes first (CI runs it on every push). Push only when the
  human says.
- **Log the run** in `docs/milestone-2-notes.md`: per stage, agent time,
  human wait, blockers, repeated work, silent failures.
