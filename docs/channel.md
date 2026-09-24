# Channel: upload defaults

Channel-wide settings the publish step applies to every episode. Channel:
[루트와이 (√y, "root why")](https://www.youtube.com/channel/UCQyrXQkYvmwkQ2W8oaQEy1w).

## Settings

| Setting | Value | Why |
| ------- | ----- | --- |
| Language | 한국어 | Korean first (decisions.md → Language) |
| Category | 교육 | Concept explainers; 과학기술 would also be accurate |
| License | 표준 YouTube 라이선스 | Episode content is all rights reserved (README → License) |
| Audience | 아동용 아님 | Aimed at teens and adults |
| AI disclosure ("변경되거나 합성된 콘텐츠") | 아니요, unless an episode uses AI music or realistic AI visuals | See below |

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
still says the narration is an AI voice, voluntarily.

## Per-episode metadata

- **Title:** under ~40 characters (Shorts truncate), containing the words
  someone would search for, posed in terms the viewer already knows. Never
  put the answer in the title: for 001, "A4 용지 비율의 비밀", not "A4 용지는
  왜 1:√2일까?" (few viewers know the ratio is 1:√2).
- **Description:** two lines of what the short shows, the key math in plain
  text, then 출처 with the research.md sources the video relies on, then the
  AI-voice line, then three hashtags (the first three show above the title).
- **Tags:** the topic's search terms in Korean and English plus the channel
  name; never other channels' names.
- **Playlists:** by theme. Current: `일상 속 수학` (math in everyday objects).
  Add a theme playlist when a second episode shares a theme.
- **Thumbnail:** a frame that shows the subject and the answer at once. Until
  custom Shorts thumbnails are available to the channel, pick that frame in the
  mobile app's frame selector; the publish step records its time.
