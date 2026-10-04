# Review · 004-magenta-rainbow

## Round 4 · 2026-10-04

**Verdict: ship.**

This round reviewed the render from b515620. That commit adds one cue for
r3#1: the axis band's red end pulses on "긴" in B2 (f329). It is a short
round as asked. I checked production's claim that nothing else changed
against round 3's frames, then looked at the pulse.

- **The claim holds:**
  - The render is the same length, 1452 frames.
  - The audio is identical sample for sample. Only the container's
    storyboard-hash tag differs.
  - Of the 1452 frames, 1289 have no pixel more than 16 levels off round
    3's.
  - The other 163 are the pulse itself (f329–f349) and encoder noise in
    the same GOP: f299–f316 (at most 32 pixels each) and f368–f499.
  - The worst noise frame is f394: 875 pixels, PSNR 50.0 dB in RGB
    (51.3 dB luma, by my measure; production quoted ≥ 53.8 dB). Its
    differences are speckle along the curves' anti-aliased edges, where
    they pulse on 엘, 엠, 에스 (`review/r4/diff-r3-r4-f374-f394.png`: round
    4, round 3, difference ×4).
  - From f500 on, the frames are identical.
- **r3#1 fixed.** B2's 1.9 s still is now two stills of 0.6 s (f311–f329,
  f351–f368). The longest still in the video is B6's end again
  (f1166–f1214, 1.6 s).
- **check-render:** 0 fail, 0 warn, 15 pass, 1 skip. My `--out` run matched
  the tracked files byte for byte. Bounds now reach y 1255, the swollen
  빨's bottom, still above the caption band at 1280.

Evidence is in `review/r4/`:

- `sheet-b2-redend-f329-351.png`: the pulse, cropped;
- `f0329-f0340-curve-ends-4x.png`: the curve ends at rest and at the
  pulse's peak, ×4;
- `diff-r3-r4-f374-f394.png`.

### The pulse (f329–f351)

- **The swell:** the red end (680–640 nm, x 144–257) swells from 60 to
  72 px (y 1094–1165 at the peak, f339–f340). 빨 hangs 24 px under it and
  grows 1.3× (ink y 1190–1253).
- **It reads as a pointer.** On the thin axis band the swell itself is
  modest, and 빨 growing is what catches the eye. Together with the caption
  "긴 파장 쪽부터", it points at the long-wavelength end, and the L, M, S
  labels then come in from that side.
- **It is accurate:** that end is the long-wavelength side (C1, C4).
- **The curve ends touch the band, and that's fine.**
  - Production's note holds: at the peak the yellow curve's end (x 144,
    ink to y 1094) meets the band's top edge.
  - The teal curve's first 45 px (x 212–257, ink y 1088–1099) are drawn
    over the swollen band for about 9 frames (f335–f344).
  - That teal end already rests on the band at value 0.01 in every frame
    from B2 to B6. The pulse only lifts the band under it.
  - Both curves rise out of the axis, so a curve end on the axis reads as
    meant. Nothing is hidden: the strokes are on top, and 빨 and the band
    stay clear.
  - Not an issue (`review/r4/f0329-f0340-curve-ends-4x.png`).

### Issues

#### 1. Nit (carried from r1#5, unchanged): the curves show their 5 nm corners

Optional, as before.

### What these instructions should have said

- **Keep the previous round's frames.** A "nothing else changed" claim is
  quickest to check against them. I still had round 3's extracted frames in
  scratch, so the comparison was direct. Without them, it would need the
  previous render rebuilt from git.

## Round 3 · 2026-10-04

**Verdict: ship.**

This round reviewed the render for the reworded script and take3, committed
in 70183a6 (studio at 9a4777d; script and take in c16b07f). It runs 48.40 s
(1452 frames). That is inside topic.md's 40–50 s target; script.md's
estimate was 50.5 s.

The studio change is additive. ConeBars gets `label: false` on appear and a
new `label` action. Nothing else in the player or theme changed. The take,
the captions and every word-anchored cue moved, so this is a full pass: the
whole narration against script.md, every caption, every changed cue, beat
ends, the colors and bars, the loop, and the whole-render scans.

- **The narration matches script.md's Read-aloud text in every
  sentence.** Each word Whisper wrote differently checks out by its own
  clip or by acoustics (below). "남보" is clean in this take.
- **The new wording is factually right.** 원추세포 is research.md's
  원뿔세포 (C1). L, M and S are named from the long-wavelength side, as in
  C1. B5's "빛 하나로 양쪽을 함께 자극하면, 엠 원추세포도 덩달아 세게
  반응해요" is C6's robust form. No 적·녹·청 names appear anywhere.
- **The labels and new cues land on their words.** The bar labels come in
  on 엘, 엠, 에스, each with its curve's pulse. B3's and B5's pulses, the
  hatching and the line's moves follow the new words.
- **The math is unchanged and still right.**
- **check-render:** 0 fail, 0 warn, 15 pass, 1 skip.
- **Two nits, both optional:** B2 holds still for 1.9 s on "긴 파장
  쪽부터" (r3#1). The curves' 5 nm corners carry over (r3#2).

Evidence is in `review/r3/`:

- `sheet-ends.png`: f0 and every beat's last frame;
- `sheet-b2-f203-433.png`, `sheet-b3-f434-607.png` and
  `sheet-b5-f787-1078.png`: the rewritten beats;
- `f0433.png`: B2's end, with L, M, S.

### Issues

#### 1. Nit, for the human: B2 is still for 1.9 s on "보통 세 가지, 긴 파장 쪽부터" (f311–f368, 10.4–12.3 s)

- The S curve finishes rising at about f310. The labels start on "엘" at
  f368. In between nothing moves (`review/r3/sheet-b2-f203-433.png`).
- It is now the longest still in the video. The next are B6's end
  (f1166–f1214, 1.6 s) and B5's (f981–f1019, 1.3 s).
- **"긴 파장 쪽부터" has no picture.** The frame is full, so it doesn't
  look empty, but the phrase tells the viewer where to look and nothing
  answers it.
- **If it feels long:** pulse the band's long-wavelength end (the strip's
  redEnd, under 빨) on "긴" at f329. That shows which side "긴 파장 쪽" is
  and is accurate. The L, M, S labels then come in left to right from it.

#### 2. Nit (carried from r1#5 and r2#1, unchanged): the curves show their 5 nm corners

As before. Optional.

### Narration (take3) against script.md

I transcribed the render with Whisper large-v3-turbo. Every sentence is
there, in order, and matches the Read-aloud text, apart from spellings
("-에요", "3가지"). The words Whisper wrote differently:

- **"엘, 엠, 에스" → "lms":** these are the same three letters, which
  Whisper writes as an acronym. A clip of B2's second sentence alone gives
  "LMS 원추세포예요".
  - The letters are separate syllables. The level drops to about 40 dB
    below the peak between 엘 and 엠 (50 ms, 12.54–12.59 s) and between 엠
    and 에스 (80 ms, 12.81–12.89 s).
  - The commas are said as quick breaks, not long pauses. The caption
    writes "L, M, S".
- **"마젠타예요" → "마젠타 요":** in the full pass, "요" got probability
  0.10. A clip of B6's end gives "이게 마젠타예요." The acoustics show
  예 is there: after 타's ㅏ (F1 about 900–1000 Hz) comes a 50 ms [e]
  (F1 540–590 Hz, F2 about 2370 Hz, 39.02–39.07 s), then 요. It is said in
  creak (F0 about 120 Hz), which explains Whisper's doubt.
- **"색상환이" → "색상 원이":** it is the same word Whisper misheard in
  round 1, now heard another way.
  - 상's vowel is ㅏ (F1 744–943 Hz). 환's vowel is ㅏ too (F1 about
    860 Hz), after a low-F2 onset that rises 1041 → 1676 Hz, the w glide.
    "원" would need ㅓ's lower F1.
  - The h is weakened, as is normal between voiced sounds. The word is
    said right.
- **"빨강과" → "빨간과":** before 과, ㅇ and ㄴ codas sound alike. A
  clip gives the same. "빨간과" isn't a word; it's Whisper's guess.
- **"이어 줘서예요" → "이어져서 해요":** a clip of the line alone gives
  "이어줘서예요". The full pass hears the creaky ending as "해요", as in
  round 1.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for byte:
**0 fail, 0 warn, 15 pass, 1 skip** (labels: no edge label has another
element's line nearby).

- **Passes at or near a limit:**
  - bounds: the ink spans x 144–936 and y 248–1239;
  - words: the widest is "빨주노초파남보," at +70 ms.
- **Everything else passes:**
  - captions: 33 on their cue, one line each;
  - reaction: +0 or +1 at every beat;
  - loop: 89 pixels differ (limit 500);
  - freshness;
  - technical: BT.709 TV range, 30 fps, 48 kHz, silent tail;
  - centering: 0 at every beat;
  - legibility: 44 text items, smallest 노 at 39.6 px. L, M and S
    measure 40–42 px of ink;
  - overlaps;
  - readable, cues and blank runs;
  - loudness: −14.1 LUFS, −2.3 dBTP;
  - A/V sync: 0 ms.

### Checked and fine

- **Captions:** all 33 on screen match the storyboard's text and
  script.md's Display text:
  - B2's "보통 세 가지," "긴 파장 쪽부터" and "L, M, S 원추세포예요.";
  - B3's "L과 S 원추세포는 세게," and "M 원추세포는" (과 after 엘 is
    right);
  - B5's six: "M 원추세포가" "가운데 끼어 있거든요." "그래서 빛 하나로"
    "양쪽을 함께 자극하면" "M 원추세포도 덩달아" "세게 반응해요.".
- **The labels** (`review/r3/f0433.png`) are white L, M, S under the bars,
  ink top y 744, clear of the curves' peaks.
  - L comes in on "엘" (f368, 12.28 s), M on "엠" (f379) and S on "에스"
    (f388). Each lands as its curve thickens, which is what ties a white
    letter to its colored curve.
  - The empty tracks' tints are faint in B2, the purple one nearly gray.
    The colors read fully from B3 on, once the bars fill.
- **B3:** the bars rise on "보면" (f447). L pulses on "엘과" (f467), S on
  "에스" (f479) and M on "엠" (f526). The target is marked on "반응해요"
  (f567).
- **B5's cues:**
  - M curve and bar on "엠" (f787), M curve again on "가운데" (f812), and
    L and S curves on "끼어" (f823), so the next sentence's "양쪽" reads as
    them.
  - The line moves to 483.34 nm from "그래서" until "양쪽을" (f858–f892).
  - L's and S's dots pulse on "양쪽을" (f892), and L's and S's bars on
    "함께" (f905).
  - The hatching starts on the second "엠" (f940), and M's dot pulses on
    "덩달아" (f964). The end frame matches its spec.
- **Colors and bars**, re-measured against verify.py's tables:
  - B4's sweep (f671–f754, now 2.8 s) every 6th frame: the chip and the
    bars match, and the tall bar hands from L to M at 559–538 nm and from M
    to S at 497–477 nm.
  - B5's return every 8th frame.
  - B3's, B5's and B6's ends: 0.483 / 0.158 / 1, 0.483 / 0.796 / 1, and
    0.483 / 0.158 / 1 with both chips #FD00FC.
  - B6's 1 : 0.5 mix: #FC00BE.
- **B7 and the loop** play as in round 2, shifted to the new timing. The
  curl runs f1229–f1262 and the uncurl f1413–f1451. The seed waits in the
  hole, crosses the arch in 3 frames, then grows. The last frame differs
  from frame 0 by 89 pixels.
- **Facts:**
  - `python3 verify.py` passes.
  - "원추세포" is research's 원뿔세포 (C1).
  - "긴 파장 쪽부터 엘, 엠, 에스" is C1.
  - "엘과 에스는 세게, 엠은 약하게" is C6.
  - "빛 하나로 양쪽을 함께 자극하면, 엠 원추세포도 덩달아 세게" is C6's
    robust form. "빛 하나" refers back to B4's single-wavelength light.
  - 보라 is still only the violet end, and no 적·녹·청 names appear.
- **For the human, not a defect:** script.md's B2 Visual asks for name
  tags on the curves ("L 원추세포"…). The storyboard puts L, M, S under the
  bars instead and gives its reason: the tags won't fit beside the peaks.
  The captions carry 원추세포. You asked for the picture to stay as it was,
  and this keeps it.

### What these instructions should have said

- **Nothing new.** Copying verify.py to scratch before importing it (round
  2's note) kept the episode folder clean this time.

## Round 2 · 2026-10-04

**Verdict: ship.**

This round reviewed the fix render, committed in 379e7f9 (studio at
5fe3e97). It is the same length as before, 47.37 s (1421 frames). B4's pause
lost 0.3 s and B7's gained 0.3 s.

5fe3e97 changes a player rule: timeline.ts now eases an appear or reveal
that has a `from` param as smooth. Only 004's loopChip has such a cue. I
parsed every cue in 001–004's storyboards to confirm that. Because it is a
player rule, this is a full pass anyway: every beat end, every changed move
frame by frame, colors and bars re-measured against verify.py, the
transcript, and the whole-render scans.

- **Every round-1 issue that was raised is fixed** (details below):
  - r1#1, the loop: the ring now opens before the chip covers anything.
  - r1#3, the curl stall: gone.
  - r1#4, 보 touching the band: the 24 px gap now holds.
  - r1#6, B2's empty middle: the frame moves until the first curve.
- **r1#2 is closed by the human,** who listened and kept take1.
- **r1#5, the curves' 5 nm corners, is unchanged.** It is still a nit
  (r2#1).
- **The new hatching reads as the excess, and theme red is gone.**
- **The math is still right.** The chips, the band, the ring and the bars
  match verify.py's tables, as in round 1.
- **check-render:** 0 fail, 0 warn, 15 pass, 1 skip.

Evidence is in `review/r2/`:

- `sheet-ends.png`: f0 and every beat's last frame;
- `sheet-b7-uncurl-f1381-1420.png`: the loop, cropped;
- `sheet-b7-curl-f1198-1220.png`: the curl, cropped;
- `sheet-b5-hatch-f902-990.png`: the hatching in and out;
- `sheet-b2-f201-331.png`: B2.

### Round 1's issues

- **r1#1 fixed: the loop** (`review/r2/sheet-b7-uncurl-f1381-1420.png`).
  - **The ring opens in place.** The bridge opens at 6 o'clock under the
    90 px seed (f1381–f1385), and each half draws back into its end of the
    band. No piece stands apart from the ring.
  - **The seed waits clear of the band.** It rises into the ring's hole
    (center by f1395) and waits there while the ring shrinks and unbends
    (f1395–f1401).
  - **It crosses the arch quickly.** The seed passes up through the arch's
    crest in 3 frames (f1402–f1404). It is drawn over the band there, as the
    storyboard intends, and it reads as popping out.
  - **It grows only after the band is clear.** It waits above the arch
    (f1405–f1408) and grows from f1408 to f1417, while the band is
    straightening below it.
  - **The ending holds.** The last 3 frames are still. The last frame
    differs from frame 0 by 189 pixels over 16 levels (largest 55), all
    anti-aliased edges of the chip and the names. check-render counts 74.
- **r1#2 closed by the human.** The transcript is otherwise unchanged from
  round 1, with the same Whisper errors already ruled out.
- **r1#3 fixed: the curl doesn't stall**
  (`review/r2/sheet-b7-curl-f1198-1220.png`).
  - The slowest mid-curl frame (f1212) still changes about 16,700 pixels.
    That is about a quarter of the peak (73,000). Round 1's dropped to
    4,900, about 6%.
  - **For the human's feel, not a defect:** the ring still goes small and
    then grows. It is about 415 px wide at f1209–f1211 and 631 px at the
    end. That follows from the spec's constant-length bend.
- **r1#4 fixed: 보 keeps its gap.** In the violet-end pulse, 보 hangs 24 px
  under the swollen band at every frame (f139–f161) and grows downward to
  y 1111.
- **r1#6 fixed: B2's middle doesn't stand empty**
  (`review/r2/sheet-b2-f201-331.png`).
  - The band and the chip move until "색을" (f258).
  - The curves rise on 색을, 세포는 and 보통 (f258, f274, f286), so all
    three are up for "세 가지".
- **r1#5 is unchanged** (r2#1).

### Issues

#### 1. Nit (carried from r1#5, unchanged): the curves show their 5 nm corners

ConeCurves didn't change, and purple's peak still looks flat-topped with two
corners. The fix suggestion stands as written in r1#5. It's optional.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for byte:
**0 fail, 0 warn, 15 pass, 1 skip** (labels: no edge label has another
element's line nearby).

- **Passes at or near a limit:**
  - bounds: the ink spans x 144–935 and y 248–1236;
  - words: the widest is "빨주노초파남보," at +60 ms.
- **Everything else passes:**
  - loop: 74 pixels differ (limit 500);
  - reaction: +0 or +1 at every beat;
  - freshness;
  - technical: BT.709 TV range, 30 fps, 48 kHz, silent tail;
  - centering: 0 at every beat;
  - legibility: 노, 39.6 px;
  - overlaps;
  - captions: 31 on their cue, one line each;
  - readable, cues and blank runs;
  - loudness: −14 LUFS, −2.2 dBTP;
  - A/V sync: 0 ms.

### Checked and fine

- **The hatching** (`review/r2/sheet-b5-hatch-f902-990.png`):
  - On "중간까지" (f904–f915), M's part above its target fades from solid
    to teal stripes over a dimmer teal. The dashed target line runs across
    the bar, solid teal below it.
  - It reads as "this much is extra" without a warning color next to the
    magenta chips.
  - In B6 it fades back to solid as the bar drops (f974–f990), with no gray
    in-between this time.
- **No theme red anywhere.** I scanned every other frame for theme red and
  its 0.8 blend. The only hits are B7's glow at its peak (f1354–f1358). That
  is the bridge's computed rose, lifted toward white, not theme red.
- **B4's sweep** now runs from "빨강부터" to "나와요" (f607–f712, 3.5 s,
  even speed), then holds at the violet end for about 1 s.
  - The tallest bar hands from L to M between f652 (560 nm) and f656
    (550 nm), and from M to S between f676 (496 nm) and f680 (485 nm).
  - The target-outline pulse on "모양은" (f692) lands mid-sweep, with S
    tallest.
  - The now chip and the bars match the model every 4th frame. The one
    0.02 outlier (f628) is my measurement: M's bar top touches its dashed
    line there.
- **Colors and bars re-measured:**
  - frame-0 band and chip as in round 1;
  - B3, B5 and B6 ends at 0.483 / 0.158 / 1, 0.483 / 0.796 / 1 and
    0.483 / 0.158 / 1;
  - B6's 1 : 0.5 mix #FC00BE, and both chips #FD00FC at B6's end;
  - the ring: 6 o'clock #FA00FB, violet end #6E00FB, red end #FA0000.
- **End frames match each beat's `endFrame`.** The boxes are the same as
  round 1's, B2 and B4 included.
- **The other beats look as in round 1:** B1, B3, B5's pulses, B6's split,
  and B7's exits, curl, bridge and glow.
- **The longest stills** are B5's end (f920–f973) and B6's end
  (f1125–f1177), 1.8 s each. Both are under their held captions.
- **Narration:** the Whisper transcript is the same as round 1's. Every
  sentence is there and in order.
- **Facts:** `python3 verify.py` passes. The wording is unchanged and still
  follows research.md's Easy to misstate.

### What these instructions should have said

- **Round 1's note on `__pycache__` held again.** I set
  `PYTHONDONTWRITEBYTECODE` in one shell but not in the next, so importing
  verify.py wrote the folder again. I deleted it. Copying verify.py to
  scratch before importing it is the robust way.

## Round 1 · 2026-10-03

**Verdict: fix then ship.**

This round reviewed the first render, committed in 1ca1434 (studio at
28ea95b). It runs 47.37 s (1421 frames), inside topic.md's 40–50 s target.
28ea95b adds five components and changes shared code only by adding to it
(theme.ts, geometry.ts, the StoryboardPlayer registry: 1331 lines added,
none removed), so no shipped episode moves. This is a full pass.

- **The color and cone math on screen is right.** Every chip, the band and
  the ring are computed colors that match verify.py's tables frame by frame.
  No chip is mixed from bar colors, and no cell is painted red, green or
  blue. Theme red shows only on B5's overshoot. The bars hit C5's and C6's
  key states.
- **Nothing states a fact wrong.** 보라 is only ever the spectrum's violet
  end. Nothing says "존재하지 않는 색", and there are no numbers on screen.
- **check-render:** 0 fail, 0 warn, 15 pass, 1 skip.
- **One fix:** the loop's last 0.5 s. The magenta chip grows over the ring
  while the ring opens, so the opening is hidden. Before that, the bridge
  breaks off as a separate wedge (r1#1).
- **For the human's ear:** "빨주노초파남보" in the hook likely sounds like
  "…남복". That is in the take, not in Whisper (r1#2). The other words
  Whisper got wrong are Whisper's errors, not the voice's.
- **Minor:** the curl stops on a small ring before it grows (r1#3).
- **The rest are nits.**

Evidence is in `review/r1/`:

- `sheet-ends.png`: f0 and every beat's last frame;
- `sheet-b7-uncurl-f1390-1403.png`: the loop's uncurl, cropped;
- `sheet-b7-curl-f1209-1226.png`: the curl, cropped;
- `spec-nambo-take1-take2-yuna.png`: spectrograms of "…파남보," in take1,
  take2, and macOS Yuna reading 남보 and 남복, each with an intensity line;
- `f0150-violet-pulse.png` (f141 and f150, 2× crop), `f0250.png` and
  `f0331.png`.

### Issues

#### 1. Fix: in the loop, the chip covers the ring as it opens, and the bridge breaks off first (f1391–f1404, 46.37–46.80 s)

After "고리예요" (pause at f1390), the uncurl and loopChip's appear start
together. Per frame (`review/r1/sheet-b7-uncurl-f1390-1403.png`):

- **f1391–f1392: the ring falls apart.** The ring shrinks toward its new
  radius, but the bridge stays at the old one. So the bridge floats below as
  a separate wedge with dark gaps at both joints, and the chip seed sits on
  top of it. For two frames the closed ring reads as three pieces.
- **f1393–f1404: the chip hides the ring.** The chip reaches the ring's
  center by f1393 (271 px wide, x 404–675, y 584–855). It is full size by
  f1402 (x 352–727, y 380–753). Meanwhile the ring shrinks and unbends under
  it. For about 12 frames, what shows is a magenta square with a red horn and
  a violet horn below it (f1395–f1401). Then the arch's crest passes behind
  the chip's bottom edge (f1403–f1404).
- **The band is straight from about f1407**, with the chip in place, so the
  last frame matches frame 0 (check-render's loop check: 19 pixels differ).

**Why it matters:** the beat says the ring opens back into the band and its
magenta rises into the chip. On screen, the opening is hidden under the chip.
It is also the last thing before the loop restarts. Production flagged it for
feel. It is an overlap: a fill drawn over the beat's subject while it moves.
check-render's overlaps check doesn't cover fill over fill.

**Fix:** keep the chip off the band until the band is mostly straight:

- let the seed rise small (no wider than the ring's inner hole, about
  100–120 px) and grow to 380 px only once the arch's crest is below the
  chip's bottom edge (y 750). That is the last third or so of the uncurl,
  so the chip's growth needs its own timing;
- shrink the bridge on the ring's current radius, so it never shows as a
  separate wedge. Or hand its middle to the chip seed in the same frame;
- the pause is 1.0 s and the uncurl uses about 0.6 s of it (f1390–f1408).
  If the opening still reads fast, there is room to slow it so it ends on
  f1420.

Spectrum's uncurl and ColorChip's appear are new code in 28ea95b. No other
episode uses them.

#### 2. For the human's ear: "빨주노초파남보" in the hook likely sounds like "…남복" (1.92–2.90 s, f58–f87)

- **Whisper hears 남복 in this take only.** Whisper (large-v3-turbo) writes
  "빨주노초파남복" for the render, for a 1.5 s clip of just that word, and for
  the raw take1.wav at 1.0×. So the 1.08× tempo step didn't cause it.
- **Whisper hears 보 correctly elsewhere.** Take2 has the same phrase in the
  same voice, and Whisper writes "빨주노초파남보". macOS Yuna reading
  "…남보," comes out as 남보, and the same voice reading "…남복," comes out as
  남복. So Whisper can tell the two apart.
- **The sound backs it up** (Praat via parselmouth;
  `review/r1/spec-nambo-take1-take2-yuna.png`):
  - Take1's 보 is short: about 90 ms at full level, against about 150 ms in
    take2.
  - Its pitch falls from 183 to 118 Hz into creak.
  - Its F1 drops from about 450 to 195 Hz in the last 10 ms. That drop is the
    mark of a stop closing. Yuna's 복 has it (F1 518 → 305 Hz). Take2's 보
    and Yuna's 보 don't (F1 stays at 440–510 Hz to the end).
- **The caption is right** ("빨주노초파남보 어디에도 없어요." from f58), so
  a viewer reading along gets the word.
- **Worth one listen at 1.9–2.9 s.** It is the hook's second line. If it
  sounds like 복, the fix is the take, not code or the script: regenerate
  that sentence, or splice "빨주노초파남보," from take2. The new take would
  need words.json and cues re-aligned.

#### 3. Minor: the curl stops on a small ring before growing (f1218–f1222, 40.60–40.73 s)

- **Two eased phases meet at zero speed.** The band bends at constant length
  into a ring about 400 px wide (f1219: ink x 340–739). Then it grows to the
  final ring (x 224–855 by f1233).
- **Motion nearly stops at the join.** Changed pixels per frame fall from
  about 78,000 (f1209) to 4,900 (f1221), then rise again
  (`review/r1/sheet-b7-curl-f1209-1226.png`). So "둥근 건" shows as two
  moves: roll into a small ring, then inflate. Production flagged this too.
- **Fix:** overlap the phases, so r and band start growing before the bend
  finishes. Or ease the curl once over the whole span rather than once per
  phase, so the speed never drops to zero mid-curl. band.test.ts's extents
  sampling has to pass again on the new path.

#### 4. Nit: in B1's violet-end pulse, 보 nearly touches the swollen band (f147–f152, 4.9–5.1 s)

- The swollen band's bottom edge moves down 16 px (to y 1035). 보 scales
  1.3× about its center, so its top rises 6 px (to y 1037).
- At the peak (f149–f150) they are 1–2 px apart
  (`review/r1/f0150-violet-pulse.png`, f141 at rest and f150 at the peak).
  For about 4 frames it reads as touching.
- **Fix:** scale 보 about its ink bottom rather than its center, or swell
  the end only upward. The 10 px gap to the chip above has to stay; it does
  now (chip bottom 833, band top 844 at the peak).

#### 5. Nit: the curves show their 5 nm corners (B2–B6, e.g. f331)

- The curves are polylines through the 5 nm rows, 14 px apart. At the peaks
  that shows (`review/r1/f0331.png`).
- Purple's top is a flat segment with two corners (440–445 nm), and there
  is a kink at its 460 nm shoulder. Teal's top is flat across 540–545 nm.
- On a phone, purple's peak can look clipped.
- **Fix, if worth it:** draw the stroke through CVRL's 1 nm table, or a
  monotone cubic through the 5 nm rows. Put LightLine's dots on the same
  curve the stroke uses. The bars can keep verify.py's linear values; the
  difference at 260 px is about 1 px.

#### 6. Nit, for the human: B2 holds 1.2 s with the middle of the frame empty (f238–f274, 7.9–9.1 s)

- The band and the chip land at f238. The first curve and track rise on
  "세포는" at f274.
- In between, under "있어요. 색을 느끼는", the frame shows only the chip at
  the upper left (y 265–435) and the thin axis at the bottom (y 1100–1234).
  The 665 px between them are empty (`review/r1/f0250.png`).
- It's not long as stills go: the longest stills are B5's and B6's ends,
  1.8 s each.
- **If it feels empty:** stretch the two moves to "색을" (`until`), or bring
  the long-wavelength track and curve in on "색을" and keep one per word
  after that.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for byte:
**0 fail, 0 warn, 15 pass, 1 skip** (labels: no edge label has another
element's line nearby).

- **Passes at or near a limit:**
  - bounds: the ink spans x 144–937 and y 248–1237;
  - words: the widest is "빨주노초파남보," at +60 ms.
- **Everything else passes:**
  - loop: 19 pixels differ (limit 500);
  - reaction: +0 or +1 at every beat;
  - freshness;
  - technical: BT.709 TV range, 30 fps, 48 kHz, silent tail;
  - centering: 0 at every beat;
  - legibility: smallest glyph 노, 39.6 px;
  - overlaps;
  - captions: 31 on their cue, one line each;
  - readable, cues and blank runs;
  - loudness: −14 LUFS, −2.3 dBTP;
  - A/V sync: 0 ms.

### Checked and fine

- **Computed colors** (sampled from the decoded frames; TV range tops out
  at about 252):
  - **The band at frame 0** matches every check value in the storyboard's
    notes within 5 levels: 595 nm #FC5F00, 570 #F5FC00, 527 #00FE00,
    483.34 #00A3FD, 472 #003EFE, 450 #4E00FC, 445 #5800FD, 405 #6F00FC. The
    hook chip is #FD00FC.
  - **The now chip** was checked every third frame through B4's sweep, B5's
    return and B6's split. I read the light's x from the frame, converted it
    to nm, and computed the screen color from verify.py's CIE table. The
    chip matched within encode error everywhere, e.g. 599.9 nm #FC4600
    (model #FF4700) and 485.2 nm #00B5FC (#00B7FF). Mixing the bar colors
    would give none of these.
  - **B6's mixes:** at 1 : 0.5 the chip is #FC00BE (model #FF00C0); at the
    end #FD00FC.
  - **The ring:** 6 o'clock #FA00FB, violet end #6E00FB, red end #FA0000.
    No seam once closed. The thin dark slit at f1322 is the gap closing.
- **Bar ratios**, measured per frame, match the model within 0.01
  (about 2 px):
  - B3 end and B6 end: 0.483 / 0.158 / 1.000 (C6).
  - B5: 0.483 / 0.796 / 1.000. L and S sit on their outlines, and M is 5×
    its target (C6).
  - B4's violet end: L 0.042, M 0.037, about 9 px stubs. L never visibly
    climbs back (C5).
  - The tallest bar passes L → M just after 557 nm (f634–f637), and M → S
    between 499.5 and 485 nm (f646–f649), as in C4 (554 and 486 nm).
  - No sampled frame of the sweep fills the dashed target.
- **Theme red** appears in f922–f984 only, on M's overshoot and its fade-out
  (a scan of every other frame). Cells are yellow, teal and purple, never
  red, green or blue.
- **End frames match each beat's `endFrame`:**
  - B1: chip x 728–927, y 634–833, 26 px above the band.
  - B2: chip x 246–413, y 266–433.
  - B3: outlines and chip frame.
  - B4: line at x 921 (405.3 nm), purple's dot only.
  - B5: line at x 700, three dots stacked yellow, teal, purple.
  - B6: lines at x 285 and 794; '마젠타' ink x 469–610, y 325–374.
  - B7: ring at "고리예요" x 224–855, y 404–1035.
  - The last frame equals frame 0 bar the caption, by design.
- **Animations read as meant:**
  - B1's chip slides over every color without matching one.
  - B2's band drops into the axis.
  - B4's sweep hands the tall bar along.
  - B5's overshoot turns red on "중간까지".
  - B6's line splits (the chip passes mint and pink, as the storyboard says).
  - B7 arches like a rainbow before closing.
  - Fades go through dark or gray in-betweens for 2–3 frames (now chip
    f539, mismatch f919 and f989); that's fine.
- **Wording against research.md's Easy to misstate:**
  - 보라 is only the spectrum's violet end: B1 맨 끝 보라, B4 보라까지, and
    B7 보라를 with the violetEnd pulse. The bridge's purples are never
    called 보라.
  - The cells are 긴·중간·짧은 파장.
  - 무지개 is the band throughout.
  - "우리 눈이 만든 고리" is C15's honest form.
  - `python3 verify.py` passes.
- **Captions:** all 31 match the storyboard's text, one line each.
- **Narration:** Whisper's transcript matches script.md's Read-aloud text
  except "남복" (r1#2), "-에요" spellings, and three words checked by ear
  proxy:
  - **무지개에 → 무지개:** the 에 runs into 있 as one front vowel (ㅐ+ㅔ+ㅣ,
    about 155 ms). The word takes 0.36 s, against 0.30 s for B4's 무지개.
  - **색상환이 → 색성 안이 / 색상하니:** 상's vowel is ㅏ (F1 about 810 Hz,
    F2 about 1330 Hz), not ㅓ. 환's F2 rise (1008 → 1669 Hz) matches take2's
    (1055 → 1585 Hz), which Whisper transcribes as 색상환이. Whisper also
    misreads Yuna's clean reading as "색상관이". These are Whisper's errors.
  - **이어 줘서예요 → 이어져서 해요:** the clip alone gives "이어줘서 해요".
    The "해" is 예요 spoken in creak (F0 falls to about 110 Hz). There is no
    h-like gap.
- **For the human, not a defect:** B6's blue light stands at 450 nm (x 795).
  That is 14 px from 남's center and 63 px from 파's, while the narration
  says "파랑 빛". 450 nm is blue in C6. Moving it to 460 nm (x 766) would
  change C6's mix (k 0.967, bars 0.61 / 0.23 / 1), and B3, B5 and B6 would
  all move with it. So leave it unless it bothers the ear-and-eye check.
- **B7's glow** whitens the bridge to a pastel magenta at its peak (f1366)
  with a faint halo. It reads as a highlight.

### What these instructions should have said

- **Importing an episode's verify.py writes `__pycache__/` into the episode
  folder.** I did that to reuse its tables, then deleted it. The
  instructions could say to set `PYTHONDONTWRITEBYTECODE=1` or copy the file
  to scratch first.
- **A calibration step for Whisper's mishearings settles them faster than
  argument.** Transcribe the same phrase from another take, plus a clean
  `say -v Yuna` reading of the right and the wrong word. Then compare
  Praat's formants and intensity at the disputed sound. The system python has no
  numpy, Pillow or parselmouth; a `uv venv` in the scratch directory works.
- **check-render's overlaps check covers text, lines and text under fills,
  but not one element's fill over another's** (r1#1). For moving fills, only
  the frames show it.
