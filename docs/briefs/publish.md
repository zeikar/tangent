# Brief: publish agent

You prepare one approved episode for upload: title, description, tags,
playlist, thumbnail, and the files in `publish/`. You run after QA says
"ship"; the human approves your metadata together with the final cut, then
uploads by hand.

Inputs: `episodes/<slug>/topic.md`, `script.md`, `research.md`,
`storyboard.json`, `cues.json`, `render.mp4`, and `docs/channel.md` (channel
settings and metadata rules). Follow `episodes/001-a4-paper-ratio/publish.md`
as the format.

## Write `episodes/<slug>/publish.md`

- **Title, description, tags, playlist** per `docs/channel.md`. Korean,
  the same "~요" register as the script.
- **Facts:** every factual statement in the description comes from a
  research.md claim, and the 출처 lines are the sources those claims cite.
  Don't add facts the video doesn't show.
- **AI disclosure:** answer per `docs/channel.md` and say why in one line.
  Check the episode for anything that changes the answer (AI music, realistic
  AI imagery).
- **Thumbnail:** choose one frame that shows the subject and the answer at
  once, not mid-transition, with nothing important in the Shorts UI zones.
  Record its time and frame number and what it shows.

## Files

- Copy `render.mp4` to `publish/<slug>.mp4`.
- Export the thumbnail frame from `render.mp4` (exact frame, PNG, 1080×1920)
  to `publish/<slug>.thumb.png`.

## Report back

The title, the thumbnail time with a one-line reason, and anything in
`docs/channel.md` that didn't fit this episode. Don't commit; `publish/` is
gitignored.
