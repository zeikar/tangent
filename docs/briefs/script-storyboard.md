# Brief: script & storyboard agent

You write one YouTube Shorts episode's script, then (in a second pass, after a
human approves the script) its storyboard. Channel: Korean-language math /
science / engineering explainers in the 3Blue1Brown style, code-rendered
animation. Read `docs/decisions.md` first for format and style decisions.

Inputs: `episodes/<slug>/topic.md`, `episodes/<slug>/research.md`.
Write only the output file of the current pass. Don't edit other files.

## Pass 1: script → `episodes/<slug>/script.md`

### Format
- 9:16 Short, one visual insight. Length target comes from `topic.md`; never
  over 60 s.
- Hook within the first 1–2 s, carried by both the first words and the first
  visual. No greeting, no channel intro, no "구독과 좋아요".
- Korean, polite casual "~요" register, spoken rhythm: short sentences, one idea
  per sentence.
- Audience: curious high-schoolers and adults. Explain with the picture, not
  with jargon.

### Beats
Split the script into beats (B1, B2, ...), one idea each. Every beat has:
- **화면용** (display): the on-screen caption text. Math goes in `$...$` as
  KaTeX (`$\frac{x}{2}$`, `$\sqrt{2}$`). Numbers as digits.
- **읽기용** (read-aloud): the exact TTS input. Spell out every number, symbol,
  formula, Latin letter, and English term in Hangul (`$x^2 = 2$` → "엑스 제곱은
  이", "A4" → "에이포", "210" → "이백십"). Commas mark breaths. The word
  sequence must be something a forced aligner can match: Hangul words only, no
  digits or Latin letters.
- **비주얼**: one line: what the viewer sees, the single picture that carries
  the idea.
- **근거**: the research.md claim IDs (C1, C2, ...) this beat relies on. A
  factual statement without a claim ID is not allowed; pure arithmetic or logic
  shown on screen may say "산수".

Respect research.md's "틀리기 쉬운 표현" section.

### Length budget
Narration is Gemini TTS (`gemini-3.8-flash-tts`, voice Kore, fast style),
measured at **5.3 Hangul syllables per second** including natural pauses.
Estimated seconds = Hangul syllables in 읽기용 ÷ 5.3. Count syllables with code
(e.g. `len(re.findall(r'[가-힣]', text))`), not by eye. Leave 2–4 s of the
target for visual-only moments.

### File layout
A short header (total syllables, estimated narration length, estimated total
with visual pauses), then one `## B<n> · <name> (~<sec>초)` section per beat
with the four bullets above.

### Before you finish
- Recount syllables and check the total against the target.
- Check every 근거 ID exists in research.md and says what the beat claims.
- Report back: the total length estimate, the hook in one line, and any choice
  you were unsure about.
