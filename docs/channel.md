# Channel

Channel-wide settings, and the rules the publish step follows for each
episode. Channel:
[루트와이 (√y, "root why")](https://www.youtube.com/channel/UCQyrXQkYvmwkQ2W8oaQEy1w).

## Channel settings (YouTube Studio → 설정 → 채널)

Set once by hand.

- **키워드** (기본 정보):
  ```
  수학 과학 공학 원리 수학원리 과학원리 수학상식 과학상식 일상속수학 수학쇼츠 과학쇼츠 시각화 애니메이션 루트와이 √y math science explained
  ```
- **국가:** 대한민국
- **시청자층** (고급 설정): 아니요, 아동용 채널이 아닙니다. Aimed at teens
  and adults.

## Upload defaults (YouTube Studio → 설정 → 업로드 기본 설정)

These pre-fill every upload, so an episode only needs its title,
description, tags, thumbnail, and playlist.

| Field | Value | Why |
| ----- | ----- | --- |
| 제목, 설명 | (empty) | Per episode |
| 공개 상태 | 비공개 | A last look before it goes public |
| 태그 | 루트와이, 수학, 과학 | Channel-wide; episode tags are added |
| 카테고리 | 교육 | Concept explainers (과학기술 would also be accurate) |
| 라이선스 | 표준 YouTube 라이선스 | Episode content is all rights reserved (README → License) |
| 퍼가기 허용 | 예 | |
| 동영상 언어, 제목 및 설명 언어 | 한국어 | Korean first (decisions.md → Language) |
| 댓글 | 사용 (부적절할 수 있는 댓글은 검토를 위해 보류) | |
| 좋아요 수 표시 | 예 | |

Two per-video answers the defaults don't cover: 시청자층 "아니요, 아동용이
아닙니다", and 변경되거나 합성된 콘텐츠 "아니요" (below).

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
code-rendered animation, so the answer is 아니요. It becomes 예 if an episode
adds AI-generated music or realistic AI-generated imagery. The description
doesn't mention the TTS voice; it isn't required and most channels don't.

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
  "1.414…"). Then 출처: only research.md sources the video relies on and that
  were actually read (a standard we couldn't open is named in the body, not
  cited; a standard read through a preview is cited with that note). Then
  three hashtags. The first three show above the title, so they follow the
  title's rule too: no answer (001 uses #용지규격, not #루트2).
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

영상: `publish/<slug>.mp4` · 썸네일: `publish/<slug>.thumb.png`

## 제목
```
<title>
```

## 설명
```
<description>
```

## 태그
```
<comma-separated tags>
```

## 업로드할 때
- 썸네일: <m:ss.s> (<start>–<end>초 사이 아무 데나), <what it shows>
- 재생목록: <playlist>
- 시청자층: 아니요, 아동용이 아닙니다
- 변경되거나 합성된 콘텐츠: 아니요
- 나머지는 업로드 기본 설정 그대로

---

## 메모 (업로드에 쓰지 않음)
- 줄별 근거: <line → claim IDs>
- <why this title / thumbnail, anything unusual>
````
