# Review · 006-zeros-and-ones

## Round 2 · 2026-10-11

**Verdict: ship.**

This round reviewed the render of the rewrite, committed in 7ba5b87 (studio
at f6914ea). Since round 1 the script, the take (take6@1.08.wav) and the
storyboard (40ef969) were all redone, so this is a full pass over a new cut,
not a re-check of changed beats. It runs 46.03 s (1381 frames), inside
topic.md's 40–50 s target.

- **Shared code:**
  - theme.ts changed only inside the `counter` block. Only BaseCounter,
    Sequence, Funnel and ScanBar import that block, and only 006 uses
    them.
  - lamp.tsx is deleted, and nothing else imported it.
  - validate-storyboard.py now accepts a one-eojeol Display as its own
    caption. That is a check, not rendering.
  - So no shipped episode moves.
- **Every number on screen is right.** I read every frame of the run and
  the near misses (f679–f765). Each is right in all four bases, ✓s
  included. So are 82000 in bases 2–6, the funnel and the bar.
  `python3 verify.py` passes.
- **The narration matches script.md's Read-aloud text** (Whisper). All 27
  captions match the storyboard.
- **check-render:** 0 fail, 1 warn, 14 pass, 1 skip. None of the seven
  late cues reads late (see check-render below).
- **B4's "why" now reads.** On "영과" the 2s turn red, on "일로만" a ✓
  draws in beside the 2진법 '10', and on "이루어진" the red 2s dip twice and
  stay red. The reason and the verdict sit at the same end of each row, and
  both show at phone scale. Round 1's r1#1 is fixed (details below).
- **The near misses read as patterns, not numbers.** Each stop lasts
  7 frames, but the ✓ pattern holds longer. Rows 2, 3 and 5 hold their ✓s
  for 0.43 s, then rows 2, 3 and 4 for 1.0 s. So "three of four, one
  short" reads twice, with a different row short each time.
- **Production's f748 flag is a nit, not a glitch (r2#1).** For one frame
  two ✓s drop out, but the digits under them change to a red 2 in the same
  frame. It reads as one more number going by.
- **For the human:** the header's 2 fills on "찾아요", right after the
  narration says the number must be all 0s and 1s in bases 2–5. B5 then
  explains it (r2#2).

Evidence is in `review/r2/`:

- `sheet.png`: f0 and every beat's last frame (check-render's sheet);
- `b4-f464-543.png`: the four rows from "영과" through B4's pause;
- `b6-f679-702.png`: the run, every frame;
- `b6-f702-765.png`: the near misses through 82000, every frame;
- `phone-f477-f486-f505-f543-f747-f748-f749-f755.png`: phone scale
  (400 px wide). It shows B4 before the ✓, with the ✓, at a blink dip and
  at its end, then 81985, 81993, 82000, and 82000 with all four ✓s.

### Issues

#### 1. Nit: two ✓s drop out for one frame at f716 and at f748, just before 82000

The count passes one in-between number on the way to 81921 and one on the
way to 82000, a frame each (`review/r2/b6-f702-765.png`).

- **f716, 81911:** the 3진법 and 5진법 ✓s go (✓ pixels 383 and 384 → 0).
  - The 3진법 ✓ is back at f717.
  - The 5진법 ✓ stays gone, since 81921 fails base 5.
  - The 4진법 ✓ draws in at f718.
- **f748, 81993:** the 3진법 and 4진법 ✓s go. At f749 (82000) they are back
  whole, and the 5진법 ✓ draws in over f750–f755.
- **The verdict:** neither reads as a glitch.
  - In the same frame the digits under those ✓s change to a red 2
    (11011110210 and 110001021 at 81993; 11011100202 and 10110121 at
    81911). So it looks like the count passing a number, as it does on
    every frame of the run just before.
  - It is still a 33 ms flicker in the ✓ column right before the
    episode's main moment, and it shows if you watch that column
    (`phone-…png`, panels 5–7).
- **Fix, if wanted:** step from 81985 straight to 82000, and from 81901 to
  81921. The count already skips 13 of the 14 numbers between 81985 and
  82000, and 18 of the 19 between 81901 and 81921. Dropping one more in
  each is no less honest, and 82000 would then arrive with only its 5진법 ✓
  changing.

#### 2. For the human: the header's 2 fills on "찾아요" (f508–f524, 16.93–17.47 s)

- **What the viewer gets:** on "다 0과 1로만 이루어진 수를 찾아요", the
  header's 2 fills yellow, as if the search found it. At that moment three
  of 2's four forms are red with no ✓.
- **What explains it:** the storyboard means 2 as the answer for 2진법
  alone. Nothing says so until B5's "3은 3진법까지, 4는 4진법까지". There
  the header's 3 and 4 fill as their rows get ✓s, which explains the 2 one
  beat later.
- **Facts:** the screen claims nothing false, since the red 2s are in view.
- **Options:** leave it, or fill 2 at B5's start with 3. Either is
  reasonable.

### Round 1's issues

- **r1#1 is fixed.** The lamp is gone. The ✓ (ink x 855–901 at rest) sits
  27 px right of the ones digit, and the red digits that keep a row
  unchecked sit right beside the empty slot.
  - **The blink is now an opacity dip.** The 3진법 2 goes from
    (229, 111, 138) to (88, 53, 65), the same red darkened, at f504–f506
    and f512–f514. It's back by f522.
  - **The ✓ pulse reads.** On "삼진법까지" and "사진법까지" it grows
    1.22×, from 47 × 36 px to 57 × 44 px (f568–f571 and f615–f618).
- **r1#2 is gone.** The dotted gap and its spark were removed. The five
  cells now sit 12 px apart.
- **r1#3 stands, by choice.** The restoryboard kept the counter's row
  positions, so B3's ink still spans y 259–635. Nothing new to decide.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for
byte: **0 fail, 1 warn, 14 pass, 1 skip** (labels: no edge label has
another element's line nearby).

- **cues (warn): none of the seven reads late.**
  - **B4 f464, counter.color, +7:** the 2s begin to redden at f468–f472
    and are fully red by f482. That is during "영과", before the ✓ arrives
    on "일로만" (f479, drawing in f480–f486).
  - **B4 f491, counter.blink, +9:** a slow double dip.
    - The dips are at f504–f506 and f512–f514, on the end of "이루어진"
      and on "수를", and it's back by f522.
    - It reads as following the word. The second dip overlaps the start of
      the header's 2 filling (f510–f524), but they sit at opposite ends of
      the picture: the dips at the rows' right end, the fill at the top.
  - **B8 f891, counter.blink, +9:** the same double dip, at f903–f906 and
    f912, on "일로만".
  - **The four ? blinks, each +6:** each dips once about 10 frames after
    its word and is back within 8 frames after that:
    - B8 f928: dip at f938, on "있어야 해요";
    - B10 f1231: dip at f1241, on "못 찾았어요";
    - B11 f1301: dip at f1311, on "추측하지만";
    - B11 f1354: dip at f1365, on "없어요". It ends at f1371, before the
      last frame (f1380), as the loop needs.
- **Everything else passes:**
  - freshness;
  - technical: BT.709 TV range, 30 fps, 48 kHz, silent tail;
  - bounds: ink x 144–935 with the ringing, y 256–1150;
  - centering: at most 1 px off;
  - legibility: the smallest glyph is the '1' of '10진법', 33.9 px;
  - overlaps;
  - captions: 27, each 0 frames from its cue, one line each;
  - readable;
  - reaction: +0 to +2;
  - blank runs;
  - loudness: −14.1 LUFS, −2.9 dBTP;
  - A/V sync: 0 ms;
  - words: widest −80 ms;
  - loop: 11 pixels differ.

### Checked and fine

- **End frames match each beat's `endFrame`** (`review/r2/sheet.png`):
  - B1 is frame 0's picture: five cells x 148–931, y 673–816.
  - B2: the header at x 323–756, y 259–340, with 2, 3, 4 and 82000 dimmed
    and ? white.
  - B3: 10진법 3 over the 3진법 box with 10, with no ✓ and no red.
  - B4: 2진법 10 ✓; 3진법, 4진법 and 5진법 each a red 2 with no ✓. The
    header's 2 is filled.
  - B5: 100 / 11 / 10 each ✓, and the 5진법 row's red 4.
  - B6: 81985, with ✓s on 2, 3 and 4 and 5진법 10110420 with its 4 and 2
    red.
  - B7: 82000, four ✓s, all white.
  - B8: the 6진법 row 1431344, its 1s white and the rest red, no ✓.
  - B9: the four tiers and the filled 82000 (ink to y 1089).
  - B10: the bar, white to the tick, dashes past it, one dot.
  - B11 equals frame 0.
- **Numbers on screen, recomputed in bases 2–6:**
  - **The run, every frame f679–f702:** 5, 5, 6, 6, 7, 9, 12, 18, 36, 79,
    213, 650, 1920, 5190, 15625, 22149, 34904, 59049, 59105, 67953, 78125,
    78886, 81899. Every row and every ✓ is right.
  - **The flicker values are real numbers:** 5 (✓ 2, 4, 5), 6 and 650
    (5진법), 9, 12, 36, 22149 and 59049 (3진법), 15625 and 78125
    (5진법 1000000 and 10000000).
  - **The near misses (C18):**
    - 81900 (f702–f708) and 81901 (f709–f715): ✓ on 2, 3 and 5, with
      4진법 103333230 and 103333231 red.
    - 81921 (f717–f723), 81984 (f724–f730) and 81985 (f731–f747): ✓ on 2,
      3 and 4, with 5진법 10110141, 10110414 and 10110420 red.
    - The pass-throughs 81911 and 81993 are right too.
  - **82000 (C4):** 10100000001010000 / 11011111001 / 110001100 /
    10111000, and 1431344 in base 6 (C5).
  - **The funnel:** 99,999 → 2,046 → 30 → 1 (C13).
  - **The bar:** '82000' over '5자리' at the dot, and '10진법 1100만 자리'
    at the tick (C7).
  - **The red digits** are exactly the ones of 2 or more, in every frame I
    read.
- **Facts:**
  - `python3 verify.py` passes ("all checks passed").
  - **B7's "82000에서야 처음 나와요":** no number from 2 to 81,999 passes
    bases 3–5 (C4).
  - **B10 says "5진법까지 되는 수조차":** that is bases 2–5, which is what
    the 2015 search covered (C7). So it no longer reads as a base-6 search
    after B8.
  - **B11:** a conjecture, no proof (C9).
  - Nothing says "모든 진법" or "유일하다".
- **Animations read as meant:**
  - **B1:** the cells pulse one by one on 이, 삼, 사 and 팔만. 82000 keeps
    8 px inside its pulsed outline (f58).
  - **B2:** the ? blinks while the row shrinks into the header (f127–f150).
  - **B3:** the 9 → 10 carry (f197–f212) and the 3진법 2 → 10 carry
    (f290–f305) are the same rise-and-swap motion. On "삼진법은" the
    decimal 10 fades out as the 3진법 row fades in. They cross at about
    f233, so the two never read as "10 = 0".
  - **B4:** the 3진법 row slides down (f380–f388) before the 2진법 row
    fades in. No two rows' digits cross.
  - **B5:** each row's ✓ arrives as it reaches 10 (3진법 by f559, 4진법 by
    f609). The header's 3 and 4 fill with them.
  - **B6:** the run takes off from 5 and slows into 81899 within
    "오진법까지는요?" (f679–f701).
  - **B7:** the 5진법 ✓ draws in at 82000 (f750–f755). Then the four ✓s
    pulse, and the header's 82000 fills (f781–f800).
  - **B8:** the 6진법 row fades in (f862–f874) and its red digits dip twice.
  - **B9:** the counter clears by f964, before tier 1 drops in (f966).
    Each tier drops 2 frames after its word.
  - **B10:** the scan runs from the dot to the tick (f1117–f1157). No other
    dot appears.
  - **B11:** the row grows back and unfills (f1264–f1295). f1380 matches
    f0.
- **Captions:** all 27 match the storyboard's text, one line each. B1's is
  on screen from frame 0.
- **Narration:** Whisper's transcript matches the Read-aloud text.
  - It writes numbers as digits.
  - It writes "구 다음에" as "9 다음의". In speech the particle 의 is
    pronounced 에, so this is Whisper's spelling, not a misread.
  - It splits "그 다음".
- **Readability:**
  - **The ✓:** yellow, 6 px strokes, 47 px wide at rest. At phone scale it
    reads as a tick (`phone-…png`).
  - **The red digits** on the ground are about 4.3:1. They differ from the
    white ones in luminance as well as hue.
  - **The 17-digit binary row** runs x 341–828, 57 px clear of '2진법' (ink
    to x 284). Its ✓ starts 27 px after the last digit.
- **Balance:**
  - Every beat end is centered within 1 px.
  - B4–B8 fill y 259–1019, or to 1147 with the 6진법 row.
  - B9 runs to y 1089, and B10 to y 860.
  - B3 is as in r1#3.
- **Edges:** the outlines' ink ends at x 148 and 931 at every beat end, and
  the ringing stays inside x 144–935.

### What these instructions should have said

- **A rewrite resets the round's scope.** When the script, the take and
  the storyboard are all redone, every beat is changed. The "re-judge every
  changed beat" rule then means a full first-round pass. Round 1's issue
  numbers carry over only as status.
- **Step through a count's stops frame by frame.** A one-frame
  in-between value (81911, 81993) changes marks for 33 ms. No check
  flags it, and a sheet sampled every 2–3 frames can skip it.

## Round 1 · 2026-10-10

**Verdict: fix then ship.**

This round reviewed the first render, committed in c26160b (studio at
91c3952). It runs 48.10 s (1443 frames), inside topic.md's 40–50 s target.
91c3952 adds four components, lamp.tsx, bases.ts and theme.ts's `counter`
block. The only edit to existing shared code is InkText's optional
`fontSize`, which defaults to the size it used before. No line of theme.ts
was removed or changed, so no shipped episode moves. This is a full pass.

- **Every number on screen is right.** It all matches verify.py (which
  passes) and my own recomputation: 2, 3 and 4 in each base, the run's
  values, the five near misses, 82000 in bases 2–6, the funnel and the
  1100만 자리 bar.
- **The narration matches the Read-aloud text word for word** (Whisper).
  All 29 captions match the storyboard.
- **check-render:** 0 fail, 1 warn, 14 pass, 1 skip. None of the four late
  cues reads late (see check-render below).
- **The device reads, but only from color and the lamp (r1#1).** At
  "불이 켜져요" one row has a white '10' and a lit lamp, and three rows
  each have a red '2' and a dark lamp. B5 then shows the rule happen twice.
  But B4's two cues that point at *why* don't register. On "일뿐인", the
  2진법 '10' grows 1.07× and stays white. On "불이", the red 2s "blink" by
  fading toward pale pink, so at that moment they look less red, not more.
  B8's red digits do the same.
- **Minor:** B1's spark across the dots doesn't register, at full size or
  on a phone (r1#2).
- **For the human:** B3 sits in the top 40% of the visual zone for 6.8 s
  (r1#3).

Evidence is in `review/r1/`:

- `sheet.png`: f0 and every beat's last frame (check-render's sheet);
- `b4-f494-550.png`: the four rows from "일뿐인" through the pause, every
  3 frames;
- `b4-digits-f494-530.png`: the digits at rest and at both pulses' peaks,
  at full resolution;
- `b1-f56-71.png`: the spark across the dots, every frame, 2× zoom;
- `phone-f56-f62-f506-f524-f385.png`: five frames at phone scale (400 px
  wide): the dots before and during the spark, B4 at both pulses, and B3's
  end;
- `b6-f719-789.png` and `b7-f789-906.png`: the run, the near misses and
  82000, every 2 frames.

### Issues

#### 1. Fix: B4's two pointers to "why a row lights" don't register (f496–f535, 16.53–17.83 s; also B8 f971–f989)

The human couldn't hear what "줄에 불이 켜진다" means. So B4's picture has
to show it, and the storyboard gives two cues for that job:

- **"일뿐인" (f496): the 2진법 row's '1' and '0' pulse.** This is meant to
  pick out the row that has only 0s and 1s.
  - **Measured:** the '10' ink grows from x 846–898, y 563–604 to x
    845–899, y 561–605 (f504–f510). That is 1.07×, or 2–3 px. It is white
    and stays white, because the pulse lifts its color toward text, which
    is already white.
  - **Seen:** at full size it is barely visible
    (`review/r1/b4-digits-f494-530.png`, f494 against f506). At phone
    scale it's about 1 px, which is invisible (`phone-…png`, third panel).
- **"불이" (f515): the three red 2s blink once.** This is meant to show
  why their lamps stay dark.
  - **Measured:** the 2s' color goes from (228, 101, 132) at rest to
    (244, 183, 200) at f523–f526, then back by f532. Their height goes from
    38 to 42 px.
  - **Seen:** the "blink" turns the digits pale pink, the fade toward
    text again (`b4-digits-f494-530.png`, f524; phone panel 4). So at
    the very word, the digits that explain the dark lamps look *less* red.
    It also coincides with the lamp lighting at the row's left end, 650 px
    away, so it doesn't draw the eye.
- **B8 does the same on "켜져야" (f971):** the 6진법 row's red 4s and 3s fade
  to (240, 179, 193) at f980–f983, and their height goes from 40 to 41 px.
- **What does read:**
  - On "불이" the 2진법 lamp lights (f518–f524).
  - The row's outline is yellow by f530 and its band by f536.
  - The header's 2 lights at f526–f532.
  - The end frame matches `endFrame` (`b4-f494-550.png`, f550).
  - B5 then shows the rule happen: the 3진법 row's red 2 rolls to a white
    10 and its lamp lights (f566–f575). The 4진법 row does the same
    (f620–f632).

  So a first-time viewer can work out the rule by comparing rows. But
  nothing in B4 points at the digits as the reason.
- **Fix:** make both pulses visible, and have the one on the red digits
  stress the red rather than wash it out.
  - **"일뿐인":** change the 2진법 digits' color, for example toward
    yellow, or pulse the row's outline. Scale alone can't work here,
    because `counter.digitGap` caps a two-digit pulse near 1.08×.
  - **"불이":** use a real blink (an opacity dip, like Sequence's blink
    to 0.25), or a pulse that keeps the digits at full red.
  - The same change fixes B8.
  - `counter.digitLift` and `digitGap` live in the new `counter` block,
    which only 006's components read, so the change stays local.

#### 2. Minor: B1's spark across the dotted gap doesn't register (f56–f68, 1.87–2.27 s)

- **Measured, on "팔만" (f56):** the spark runs from f59 to f65, 7 frames
  or 0.23 s (`review/r1/b1-f56-71.png`).
  - **One or two of the six 8 px dots are tinted at a time.** At most they
    reach (209, 193, 167), a pale tan. Theme yellow is (254, 178, 81). On
    8 px dots, the encoder's 4:2:0 chroma subsampling blurs the color
    away.
  - **The dots don't grow.**
- **Seen at phone scale:** the dots are 3 px and the tint can't be seen
  (`phone-…png`, panels 1 and 2, f56 against f62).
- **The jump still reads** from the gap itself, 160 px against the 10 px
  between 2, 3 and 4. So this costs little.
- **Fix:** either drop the spark, or make it something a phone shows. For
  example, a yellow head of about 20 px, with the dots it passes growing
  about 1.5–2× and turning full yellow, over the whole "팔만" (f56–f68).

#### 3. For the human: B3's picture sits in the top 40% of the zone for 6.8 s (f180–f385, 6.00–12.83 s)

- **Measured:** through B3 the ink spans y 259–634 (the header, the
  10진법 row and the 3진법 box) in a visual zone of y 240–1250. The 616 px
  above the caption stay empty.
- **Seen:** at phone scale it looks top-heavy (`phone-…png`, panel 5,
  f385).
- **Context:** horizontal centering passes (+1 px). From B4 on, the rows
  fill down to y 1019–1147, so this is only B3 (and B2's last 0.7 s, when
  the header is alone).
- **If it's worth fixing:** start B3's two rows lower and move them up as
  B4 adds rows. That adds a move to B4's busy opening, so leaving it is
  reasonable.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for
byte: **0 fail, 1 warn, 14 pass, 1 skip** (labels: no edge label has
another element's line nearby).

- **cues (warn): none of the four reads late.**
  - **B4 f419, counter.lamps, +6:** the lamps arrive with the 2진법 row's
    entrance, which shows from f421. They read as part of that entrance,
    not as a cue of their own.
  - **B4 f484, counter.color, +7:** the 2s start to redden at about f490
    and are fully red by f504. That is inside "영과 일뿐인" (f484–f514),
    so it lands with the phrase.
  - **B10 f1294, seq.blink, +8:** the header's ? dips at f1308 and f1316
    (mean brightness 52 → 24) and is back by f1326. That falls on
    "찾았어요", on a small cell at the top. It reads as the sentence
    closing on the open question.
  - **B11 f1417, seq.blink, +6:** the dip is at f1426–f1429, on "없어요",
    and ends before the pause, so the last frame is frame 0's picture.
- **Everything else passes:**
  - freshness;
  - technical: BT.709 TV range, 30 fps, 48 kHz, silent tail;
  - bounds: ink x 144–935 with the ringing, y 256–1150;
  - centering: at most 2 px off;
  - legibility: the smallest glyph is the '1' of '10진법', 33.9 px;
  - overlaps;
  - captions: 29, each 0 frames from its cue, one line each;
  - readable;
  - reaction: +0 to +2;
  - blank runs;
  - loudness: −14 LUFS, −2.1 dBTP;
  - A/V sync: 0 ms;
  - words: widest −70 ms;
  - loop: 13 pixels differ.

### Checked and fine

- **End frames match each beat's `endFrame`** (`review/r1/sheet.png`):
  - B1 is frame 0's picture.
  - B2: the header at y 261–339, with 2, 3, 4 and 82000 dimmed and ?
    white.
  - B3: 10진법 3 over the 3진법 box with 10; no lamp, all white.
  - B4: as in r1#1.
  - B5: 100 / 11 / 10 lit, the 5진법 row's red 4 dark; the header's 2, 3,
    4 lit.
  - B6: 81921, three rows lit, the 5진법 row's red 4.
  - B7: 82000, all four lit, all white.
  - B8: the 6진법 row with 1431344, its two 1s white and the rest red,
    lamp dark.
  - B9: the four tiers, the arrow and the lit 82000.
  - B10: the bar, white to the tick, dashes past it, no other dot lit.
  - B11 equals frame 0.
- **Numbers on screen, recomputed in base 2–6:**
  - **B3–B5:** 2, 3 and 4 in every row (C3).
  - **The run** (`b6-f719-789.png`): I read 15 of its values off the
    frames, and every row of each is right. They are 5, 6, 8, 12, 26, 87,
    625, 2221, 9086, 26244, 43927, 61143, 72844, 79729 and the pass-through
    81908.
  - **The flickers are real numbers:** 5 (rows 4 and 5 lit), 6 and 26
    (5진법 11 and 101), 12 (3진법 110), 625 (5진법 10000), 26244 (3진법
    1100000000).
  - **The near misses (C18):**
    - 81900 and 81901 light 2, 3 and 5, with 4진법 103333230 and
      103333231 dark.
    - 81921, 81984 and 81985 light 2, 3 and 4, with 5진법 10110141,
      10110414 and 10110420 dark.
    - The one-frame pass-through at f812 is 81993, and it is right too.
  - **82000 (C4):** 10100000001010000 / 11011111001 / 110001100 /
    10111000, and 1431344 in base 6 (C5). The red digits are exactly the
    ones of 2 or more, in every frame I checked.
  - **The funnel:** 99,999 → 2,046 → 30 → 1 for 2..100,000, matching
    verify.py's C13.
  - **The bar:** '82000' over '5자리' at the dot, and '10진법 1100만 자리'
    at the tick (C7). It is labeled as digits, as research's "easy to
    misstate" list asks.
- **Facts:**
  - `python3 verify.py` passes ("all checks passed").
  - B10's claim is about four rows, bases 2–5, which is what the 2015
    search covered (C7).
  - B11 says it's a conjecture, not a proof (C9).
  - Nothing says "모든 진법" or "유일하다".
- **Animations read as meant:**
  - **B2:** the row dims and shrinks into the header (f157–f178).
  - **B3:** the 9 → 10 carry (f221–f237) and the 3진법 2 → 10 carry
    (f322–f336) are the same rise-and-swap motion, so they pair.
  - **B4:** the 3진법 row slides down (f404–f414) before the 2진법 row
    fades in above it. No two rows' digits ever cross.
  - **B5:** lamps light as each row reaches 10. The lamp pulses (1.25×)
    read.
  - **B6:** the run takes off from 5 and slows into 81900, all in the 1 s
    of "오진법 줄까지는요?". The near misses then hold about 0.4 s each.
  - **B7:** the 5진법 lamp lights at 82000 (f813), then all four pulse on
    "다" (f843).
  - **B9:** the counter clears in 6 frames before the heading appears. Each
    tier drops in 2–4 frames after its word.
  - **B10:** the scan light runs from the dot to the tick over f1177–f1222.
  - **B11:** the row grows back and unlights (f1336–f1372). The last frame
    matches f0.
- **Captions:** all 29 match the storyboard's text, one line each. B1's
  is on screen from frame 0. B1's caption mixes TeX bold digits with a
  Pretendard ', 그다음은?', as the storyboard chose. The two commas'
  shapes differ slightly, which is visible but not a defect.
- **Narration:** Whisper's transcript matches the Read-aloud text. It
  writes numbers as digits ("8만 2천", "1,100만") and 네 줄 / 다섯 줄 as
  "4줄" / "5줄", and spaces "그 다음". Those are Whisper's habits, not
  misreadings.
- **Production's notes:**
  - **The device** is r1#1.
  - **The spark** is r1#2.
  - **The edges:** the full-width outlines' ink ends at x 148 and 931 on
    every beat end, and ringing reaches x 144–935, inside 140–940.
  - **The lamp rays:** at rest they end at x 235–237, and the names' ink
    starts at x 250. At a 1.25× pulse (f585) they reach x 243, about 7 px
    from '2진법' and '3진법'. They come close but never touch.
- **Readability and contrast:**
  - Red #E25273 on the ground is about 4.3:1 at 38.7 px digits. Red and
    white digits differ in luminance as well as hue, so they stay apart
    without color vision.
  - Muted text is 5.8:1.
  - The header's terms dimmed to 0.45 stay readable.
  - The 17-digit binary row's ink runs x 411–898, 57 px clear of its
    name (ink to x 354).
- **Balance:** every beat end is centered within 2 px. B9 and B10 use the
  zone down to y 1049 and y 860. For B3 see r1#3.
- **Shared code** (read from 91c3952's diff; no shipped episode was
  rebuilt):
  - theme.ts only adds the `counter` block.
  - InkText's `useInk` and `InkLine` take a `fontSize` that defaults to
    type.label's, the size `lineStyle` already set.
  - StoryboardPlayer adds four registry entries.

### What these instructions should have said

- **Visible isn't the same as noticeable.** check-render's cues check
  passes any cue that changes some pixels within 5 frames. B4's 1.07×
  pulse on white digits passes it, and so does a "blink" that washes red
  toward white. When a cue carries meaning (the storyboard says "so it
  reads", "the reason", "THE DEVICE"), measure its peak: scale in px, and
  color against its resting color. Then look at it at phone scale.
- **A pulse can say the opposite of its cue.** A lift toward text on a
  colored digit fades the color that is the point. Check every pulse on a
  semantically colored element for which way its color moves.
