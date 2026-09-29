# Narration: voice and pronunciation

Shared rules for every episode's Read-aloud text. The script writer reads this
before writing; add to it whenever a take mishears or a reviewer catches a
clash.

## Voice

- Gemini TTS `gemini-3.8-flash-tts`, voice Kore, the style string in
  `studio/scripts/tts.mts` (`GEMINI_STYLE`). The style goes in
  `speech_metadata.style`, never in the text: 3.8 reads the text verbatim.
- One take for the whole script, sped up to 1.08× with pitch kept
  (`narrate.mts --tempo=1.08`), the speed episode 001 settled on. At the
  script checkpoint the human picks a script, not a speed; `narration.json`
  records the take.
- Measured rate: 4.8–5.1 Hangul syllables per second at tempo 1.0, 5.2–5.5 at
  1.08× (episode 001's takes).

## Wording

A line is heard once, at speed, so it has to land on the first listen.
These come from a survey of Korean 윤문 (polishing) rule sets on
2026-09-27; their automatic checks misfire on spoken scripts (they strip
breathing commas and "A가 아니라 B"), so the rules live here in our words
and the ear judges. The rules for all Korean text (번역투, register,
precision) are in `docs/korean.md` and the general rules it points to;
these are the ones for the ear.

- **Name what a word is relative to.** A word only the picture explains
  ("위쪽", "앞서" without what it runs ahead of) names its reference in the
  sentence ("같은 별 쪽", "지구 방향을 지나쳐").
- **Spoken connectives:** 그래서, 그러니까, or none, instead of 따라서, 즉,
  결론적으로, 이처럼.
- **Everyday words over written ones.** A word that mostly lives in writing
  stops a listener even when it's correct: 견주다 → 비교하다 (003, where
  the human asked what 견주면 meant).
- **Keep what polishing tools strip:** breathing commas, a question hook,
  one "A가 아니라 B" turn, and a key verb repeated on purpose to carry a
  contrast.

## Spelling out

| Written | Read aloud |
| ------- | ---------- |
| A4, A0, A3 | 에이포, 에이제로, 에이쓰리 |
| x, n | 엑스, 엔 |
| x/2 | 이분의 엑스 |
| x : 1 | 엑스 대 일 |
| x² | 엑스 제곱 |
| √2 | 루트 이 |
| 1.414 | 일 점 사일사 (digits one by one after the point) |
| ≈ | 약 |
| 210 × 297 | 이백십 곱하기 이백구십칠, or 가로 이백십, 세로 이백구십칠 |
| 141% | 백사십일 퍼센트 |

## Clashes to avoid

Hangul numbers 일 and 이 collide with grammar words, and some verbs mean
something else in the episode's context. Rewrite around them:

| Avoid | Heard as | Use |
| ----- | -------- | --- |
| 루트 이예요 | 루트예요 | 루트 이가 돼요, 루트 이와 같아요 |
| 엑스 대 일이 | (일이 = a task) | 엑스 대 일과 |
| 루트 이 하나뿐 | 이 하나뿐 (only this one) | 딱 하나예요 |
| 일로 놓고 | 이리로 | 일이라 하고 |
| 풀면 (in a folding video) | unfold | 계산하면 |
