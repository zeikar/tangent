---
name: publish
description: >-
  This skill should be used when an approved tangent episode needs its upload
  metadata and upload tray, e.g. "prepare 002 for upload", "/publish
  002-<slug>", "002 업로드 정보 만들어줘", or when the episode runbook reaches the
  publish stage. A fresh agent writes episodes/<slug>/publish.md (title,
  description, tags, playlist, thumbnail) and fills publish/.
argument-hint: "<slug>"
context: fork
---

# Publish: metadata and the upload tray

Arguments: `$ARGUMENTS`: the episode slug (folder `episodes/<slug>/`). If
the slug isn't an existing episode folder with `render.mp4` and a QA
`review.md`, stop and report without writing anything.

Prepare one approved episode for upload: title, description, tags, playlist,
thumbnail, and the files in `publish/`. This runs after QA says "ship"; the
human approves the metadata together with the final cut, then uploads by
hand.

Inputs: `topic.md`, `script.md`, `research.md`, `storyboard.json`,
`cues.json`, `render.mp4` in the episode folder, and `docs/channel.md`
(channel settings and metadata rules). `episodes/001-a4-paper-ratio/publish.md`
is a shipped example.

## Write `episodes/<slug>/publish.md`

Use the format in `docs/channel.md` → `publish.md` format: every field the
uploader pastes (title, description, tags) alone in its own code block, in
upload order, then the per-upload answers (thumbnail time, playlist,
audience, AI disclosure), then our notes below a rule. The uploader should be
able to copy each block without editing it. Leave the `Published:` line out;
it is added after upload.

- **Title, description, tags, playlist** per `docs/channel.md`. Korean, the
  same "~요" register as the script. Tags leave out what the upload defaults
  already add.
- **Facts:** every factual statement in the description comes from a
  research.md claim, and the description's 출처 (sources) lines are the sources
  those claims cite.
  Don't add facts the video doesn't show. The claim map goes in the notes.
- **AI disclosure:** answer per `docs/channel.md` and say why in the notes.
  Check the episode for anything that changes the answer (AI music,
  realistic AI imagery).
- **Thumbnail:** choose one frame that shows the subject and the title's
  question, never the answer (docs/channel.md), not mid-transition, with
  nothing important in the Shorts UI zones. Prefer a picture that holds for
  at least ~1 s so it can be hit in the app's frame selector. Give its time
  range in the upload answers and the frame number in the notes.

## Files

- Copy `render.mp4` to `publish/<slug>.mp4`.
- Export the thumbnail frame from `render.mp4` (exact frame, PNG, 1080×1920)
  to `publish/<slug>.thumb.png`.
- Symlink the metadata next to them, so the upload tray holds everything
  while the committed file stays the source: `ln -sf
  ../episodes/<slug>/publish.md publish/<slug>.md`.

## Report back

The title, the thumbnail time with a one-line reason, and anything in
`docs/channel.md` that didn't fit this episode. Don't commit; `publish/` is
gitignored.
