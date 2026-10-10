# Review · 006-zeros-and-ones

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
