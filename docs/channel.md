# Channel

Channel-wide settings, and the rules the publish step follows for each
episode. Channels:

- [루트와이 (√y, "root why")](https://www.youtube.com/channel/UCQyrXQkYvmwkQ2W8oaQEy1w)
  (`@루트와이`): Korean. Every episode is published here, and everything below
  applies to it.
- [Root Why](https://www.youtube.com/channel/UCPf5uD3ktXORf20cHAnGRtA)
  (`@sqrtwhy`): English, created 2026-09-26 and held for English versions
  (decisions.md → Language). Nothing uploaded yet; its settings go here when
  English versions start. Same avatar and watermark; banner is `BannerEn`.
  `@rootwhy` belongs to an unrelated channel with a similar premise, and a
  spoken "root why" typed without the `-` or `_` lands there, hence `sqrtwhy`.

## Channel settings (YouTube Studio → Settings → Channel)

Set once by hand. The Korean channel's Studio runs in Korean, so labels and
options carry their Korean UI text in parentheses.

- **Keywords** (Basic info; 키워드, 기본 정보):
  ```
  수학 과학 공학 원리 수학원리 과학원리 수학상식 과학상식 일상속수학 수학쇼츠 과학쇼츠 시각화 애니메이션 루트와이 √y math science explained
  ```
- **Country** (국가): South Korea (대한민국)
- **Audience** (Advanced settings; 시청자층, 고급 설정): No, it's not made
  for kids (아니요, 아동용 채널이 아닙니다). Aimed at teens and adults.

## Upload defaults (YouTube Studio → Settings → Upload defaults)

These pre-fill every upload, so an episode only needs its title,
description, tags, thumbnail, and playlist.

| Field | Value | Why |
| ----- | ----- | --- |
| Title, description (제목, 설명) | (empty) | Per episode |
| Visibility (공개 상태) | Private (비공개) | A last look before it goes public |
| Tags (태그) | 루트와이, 수학, 과학 | Channel-wide; episode tags are added |
| Category (카테고리) | Education (교육) | Concept explainers (Science & Technology, 과학기술, would also be accurate) |
| License (라이선스) | Standard YouTube License (표준 YouTube 라이선스) | Episode content is all rights reserved (README → License) |
| Allow embedding (퍼가기 허용) | Yes (예) | |
| Video language; title and description language (동영상 언어, 제목 및 설명 언어) | Korean (한국어) | Korean first (decisions.md → Language) |
| Comments (댓글) | On, holding potentially inappropriate comments for review (사용, 부적절할 수 있는 댓글은 검토를 위해 보류) | |
| Show like count (좋아요 수 표시) | Yes (예) | |

Two per-video answers the defaults don't cover: Audience, "No, it's not made
for kids" (시청자층, "아니요, 아동용이 아닙니다"), and Altered or synthetic
content, "No" (변경되거나 합성된 콘텐츠, "아니요"; below).

## AI disclosure

YouTube requires disclosure only for realistic content made or meaningfully
altered with AI: a real person appearing to say or do something they didn't,
altered footage of a real event or place, or a realistic scene that didn't
happen. Its own examples list AI-generated music as requiring disclosure, and
fully animated video and production help (scripts, thumbnails, titles) as not
requiring it
([YouTube Help](https://support.google.com/youtube/answer/14328491?hl=en),
checked 2026-09-25).

Our episodes use a stock synthetic voice (not a real person's) over
code-rendered animation, so the answer is No (아니요). It becomes Yes (예) if
an episode adds AI-generated music or realistic AI-generated imagery. The
description doesn't mention the TTS voice; it isn't required and most
channels don't.

## Uploading by API

Not used yet. Videos uploaded through `videos.insert` from an API project
that hasn't passed YouTube's audit are locked private, can't be made public,
and can't be appealed; they must be re-uploaded
([docs](https://developers.google.com/youtube/v3/docs/videos/insert),
[help](https://support.google.com/youtube/answer/7300965?hl=en)). If manual
entry becomes a chore, the cheaper path is to upload the file in Studio and
fill the metadata with `videos.update`, which the lock doesn't affect.

## Per-episode metadata

- **Title:** under ~40 characters (Shorts truncate), containing the words
  someone would search for, posed in terms the viewer already knows. Never
  put the answer in the title, and don't presuppose a fact most viewers don't
  know: start from something they have seen. Avoid "~의 비밀" (dated,
  over-promises). For 001: "A4 용지는 왜 하필 210×297일까?" (numbers everyone
  has seen), not "A4 용지는 왜 1:√2일까?" (gives the answer), "A4 용지는 왜
  반으로 접어도 모양이 똑같을까?" (assumes a property few know), or "A4 용지
  비율의 비밀" (clumsy).
- **Description:** first two lines show the phenomenon, not the answer; then
  the key math in plain text with its variables defined; decimals written so
  they don't read as exact (297 ÷ 210 ≈ 1.41429 next to √2 ≈ 1.41421, not
  "1.414…"). Then 출처 (sources): only research.md sources the video relies
  on and that were actually read (a standard we couldn't open is named in
  the body, not cited; a standard read through a preview is cited with that
  note). Then three hashtags. The first three show above the title, so they
  follow the title's rule too: no answer (001 uses #용지규격, not #루트2).
- **Tags:** the topic's search terms in Korean and English, spaced and
  unspaced (A4 용지, A4용지); nothing the video doesn't show and never other
  channels' names. The channel-wide tags come from the upload defaults. Tags
  matter little for discovery.
- **Playlists:** by theme. Current: `일상 속 수학` (math in everyday objects).
  Add a theme playlist when a second episode shares a theme.
- **Thumbnail:** a frame that shows the subject and the title's question, not
  the answer, holding for at least ~1 s. Until custom Shorts thumbnails are
  available to the channel, pick that frame in the mobile app's frame
  selector.

## `publish.md` format

Copy-ready: every field the uploader pastes is alone in its own code block, in
upload order, and nothing else is inside those blocks. Notes for us (reasons,
the claim map) go below a rule at the end.

````markdown
# <NNN> · <title>

Published: <YouTube URL> (<date>)   ← added after upload

Video: `publish/<slug>.mp4` · Thumbnail: `publish/<slug>.thumb.png`

## Title
```
<title>
```

## Description
```
<description>
```

## Tags
```
<comma-separated tags>
```

## When uploading
- Thumbnail: <m:ss.s> (anywhere in <start>–<end> s), <what it shows>
- Playlist: <playlist>
- Audience: No, it's not made for kids (아니요, 아동용이 아닙니다)
- Altered or synthetic content: No (아니요)
- Everything else: the upload defaults

---

## Notes (not for upload)
- Line by line: <line → claim IDs>
- <why this title / thumbnail, anything unusual>
````
