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
  put the answer in the title, and don't presuppose a fact most viewers don't
  know: start from something they have seen. Avoid "~의 비밀" (dated,
  over-promises). For 001: "A4 용지는 왜 하필 210×297일까?" (numbers everyone
  has seen), not "A4 용지는 왜 1:√2일까?" (gives the answer), "A4 용지는 왜
  반으로 접어도 모양이 똑같을까?" (assumes a property few know), or "A4 용지
  비율의 비밀" (clumsy).
- **Description:** first two lines show the phenomenon, not the answer; then
  the key math in plain text with its variables defined; decimals written so
  they don't read as exact (297 ÷ 210 = 1.41429 next to √2 = 1.41421, not
  "1.414…"). Then 출처: only research.md sources the video relies on and that
  were actually read (a standard we couldn't open is named in the body, not
  cited). Then the AI line, "내레이션은 AI 음성(TTS)이고, 애니메이션은 코드로
  그렸어요." (standard spelling 내레이션; no "직접", which overstates), then
  three hashtags (the first three show above the title). Keep a line-by-line
  claim map under the description block in publish.md.
- **Tags:** the topic's search terms in Korean and English, spaced and
  unspaced (A4 용지, A4용지), plus the channel name; nothing the video doesn't
  show and never other channels' names. Tags matter little for discovery.
- **Playlists:** by theme. Current: `일상 속 수학` (math in everyday objects).
  Add a theme playlist when a second episode shares a theme.
- **Thumbnail:** a frame that shows the subject and the title's question, not
  the answer. Until
  custom Shorts thumbnails are available to the channel, pick that frame in the
  mobile app's frame selector; the publish step records its time.
