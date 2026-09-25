# Review · 001-a4-paper-ratio

## v2 · Round 1

**Verdict: ship.**

The v2 render is 41.6 s, 1248 frames. It was built at 12:05, and its
fingerprint matches the current storyboard and studio code.

- It matches its storyboard in every beat, speaks the script's words, and gets
  every number right.
- check-render fails and warns only on the two items accepted before this
  round.
- The visual pass found four small things. None of them misleads or hides
  content. The first is worth fixing if the render is rebuilt for another
  reason. On its own it doesn't justify a rebuild, because its fix touches
  shared studio code and would need this whole pass again.

Evidence is in `review/v2r1/`:

- `sheet-ends-b1-b5.png` and `sheet-ends-b6-b11.png`: f0 and every beat's
  last frame;
- `sheet-b8-steps.png`: B8's last two equation steps;
- the cited frames.

### Issues

#### 1. Minor: B8's last two steps replace terms instead of morphing them

- **On "제곱하면" (f786, 26.20 s):** `x/2 × x × 2` fades out over f789–f792.
  The left side of the row is empty from f793 to f797 while "= 2" slides into
  place. x² fades in over f794–f801 (`v2r1/f0795.png`).
- **On "엑스는" (spoken f821–f832):** x² and 2 fade out over f824–f827. From
  f828 to f833 (27.60–27.77 s) the row holds only "=" (`v2r1/f0830.png`).
  Then x = √2 fades in over f834–f840. The x vanishes while the narration says
  it, and comes back just before "루트" (f837). See `v2r1/sheet-b8-steps.png`.
- **Why:** the storyboard maps these steps as morphs: x2 from lhs and ta, x
  from x2, sq from two. The render can't honor the map.
  `studio/src/components/morph.ts:8-11` keeps `x^2`, `\sqrt{2}` and
  `\frac{x}{2}` as single tokens, so x² and x share no token, and neither do 2
  and √2. Unshared tokens finish fading out before new ones fade in (the
  no-overlap rule), and that leaves the gap.
- Nothing overlaps, and the math still reads. This is a polish loss at the
  algebra's payoff, not an error.
- **Fix (optional):** let a mapped part match inside a scripted or radical
  token (x^2 as x plus ^2, \sqrt{2} as radical plus 2). Then x and 2 slide,
  and only ² and the radical sign fade. Alternatively, crossfade a mapped part
  in place. morph.ts also drives the edge-label changes in B6 and B7, so a
  change there needs this whole pass again.
- **Owner:** production.

#### 2. Minor: the red gap is dim (B1–B3)

- The Mismatch strip renders as (95, 42, 41) on the (13, 16, 19) ground,
  about 1.7:1 (f123, 4.10 s, `v2r1/f0123.png`). It reads as dark brick more
  than red.
- The gap itself stays clear, because the teal edge and the dashed outline
  bound it at high contrast.
- The strip carries the hook's payoff (B1) and the whole of B3's search. A
  stronger fill or a red outline on the strip would make "doesn't fit" stand
  out.
- **Owner:** production (Mismatch style).

#### 3. Minor: the "이쪽만" pulse on A4 barely shows (B1)

- The pulse is cued on "이쪽만" (f58) and flashes a4Ghost's outline over
  f60–f72 (f66, 2.20 s, `v2r1/f0066.png`). By then the growing teal half
  covers nearly all of that outline, so the flash shows only as a dashed
  shimmer along the half's edge.
- The comparison still lands, because Letter's red strip appears at f72 on
  "딱".
- Pulsing a4Half, or both, would point harder. The render follows the spec,
  whose note says the flash happens "while the half is still landing".
- **Owner:** storyboard.

#### 4. Nit: √2's box sits close to "=" (B8 end)

- At f890 (29.67 s) the box's left edge is 18 px from "=", while x sits 37 px
  from it on the other side (`v2r1/f0890.png`). It reads fine but looks
  slightly lopsided.
- **Owner:** production (box padding), or leave it.

### check-render

My run with `--out` produced `check.md` and `check.json` byte-identical to
the tracked ones: **1 fail, 1 warn, 14 pass**.

- **words (fail), accepted.**
  - B7's "이" has no audible onset.
  - The caption "이 길이가 1과" still switches on it (f685), and Whisper hears
    "이 길이가" there, so nothing is missing.
  - The label change was already moved to "길이가" (f689) for this reason.
- **readable (warn), accepted.**
  - The page's "A4" is fully visible for 18 frames (f1230–1247), and
    letterHalf2's "레터" for 12 (f1236–1247).
  - Both carry into frame 0 and stay until B2 fades them (f124–f136), so on a
    loop they read for over 4 s.
  - A viewer who stops at the end sees them for 0.4–0.6 s.
- **Everything else passes:**
  - freshness;
  - technical: 1080×1920, BT.709 TV range, 30 fps, 48 kHz;
  - bounds: ink x 152–927, y 256–1251;
  - centering: every beat end within ±14 px;
  - legibility: smallest glyph 31 px, the "m" in "210 mm";
  - overlaps, labels, cues and blank runs;
  - captions: all 25 on their cue and on one line;
  - reaction: +1 frame at every beat;
  - loudness: −14.1 LUFS, −2.1 dBTP;
  - A/V sync: 0 ms;
  - loop: 142 px differ between the last frame and the first.

### For the human

None of these is a defect. Each is a choice the storyboard or script made.

- **B1–B6 sit high.**
  - Every sheet's bottom edge is at y 900–960, so B7–B8's equation row fits
    under the same picture without moving it.
  - Until B7, the 240–380 px between the picture and the captions stay empty.
    Beat-end ink centers are at y 583–650, against the visual zone's center
    at y 760.
- **B6's width label is stale for 2.4 s.** From f617 until B7 relabels it on
  "길이가" (f689), the grown half's width still says x/2. That relabel is the
  point of B7, so it's deliberate, but the label is wrong until then.
- **The x/2 label is never spoken.** The half's x/2 and 1 labels land on
  "볼게요" (f530), and the narration never explains them. B6 starts 0.9 s
  later.
- **"조금 달라요" has nothing on screen to point at.** B9 shows 210 mm and
  297 mm, but not the ratio that differs (297 ÷ 210 ≈ 1.41429 against
  √2 ≈ 1.41421). The ratio note left at B9's start. The line is correct (C8,
  C14), and the storyboard chose not to show a difference under 1 px.
- **Duration: 41.6 s.** This is inside topic.md's 40–50 s target. The script
  estimated 45.6 s; the take at 1.08× runs shorter.

### Checked and fine

- **End frames.**
  - Every beat's last frame matches its `endFrame`.
  - Measured stroke centers are within 1 px of the storyboard's geometry:
    - f123: A4 spans x 190–490, Letter's half ends at 841, the red strip at
      890;
    - f244: the sheet spans x 370–710, y 520–960;
    - f339: the sheet's top is at y 479;
    - f555: the sheet spans x 227–527, the half 617–830, the half's top is at
      y 600;
    - f651: both tops are level at y 475;
    - f1033: the sheet spans x 243–543;
    - f1180: the page spans x 328–751, y 360–959.
  - f1247 matches f0 row for row.
- **Motion,** sampled every 1–3 frames at every beat boundary and long move:
  - B1: the halves turn 90° clockwise, then grow to the outline's height. It
    reads as turn-then-scale.
  - B2: A4 and the fold note fade out before the pair slides to center.
  - B3: the gap narrows, flips outside the sheet past √2, and the sheet
    settles on √2 by about f310, 1 s before "여기선".
  - B5: the pair splits apart, and each label lands on its word.
  - B6: the half grows ×x from its bottom edge, and the 1→x height label
    crossfades cleanly.
  - B7: the label morph starts at f690 and settles at f711.
  - B9: each dimension line draws out from its middle before its label
    appears.
  - B10: the page grows to under 1 px inside A3 with no flash, so "거의"
    holds.
  - B11: the fold reads as a flap folding down (edge-on at f1203, landed at
    f1211). The pair then shrinks into the left slot, and Letter fades in
    after it (f1233).
- **Closest calls.**
  - At B3's widest point (f281), compareNote and the sheet's top are 22 px
    apart. The picture sits 52 px right of center at that moment, only
    mid-sweep.
  - In B7, the half's label and the equation row are 27 px apart vertically
    and don't overlap horizontally at that point.
- **Readability.**
  - At full size, the fractions read clearly.
  - Muted text (#8A8F98) on the ground is about 5.8:1.
  - Yellow (long sides) and blue (short sides) are easy to tell apart.
- **Captions.** All 25 match the storyboard's text, each on one line, and the
  splits follow phrases.
- **Narration.**
  - I transcribed the render's audio with Whisper large-v3-turbo. It matches
    every line of the 읽기용 text, with digits and "X" where the script spells
    out numbers and 엑스.
  - The full run heard "밀리미터 단위라" as "mm 단이라". Transcribing
    32.4–33.7 s on its own gives "밀리미터 단위랑", so the syllable is there.
- **Facts.**
  - `verify.py` passes.
  - Recomputed on screen:
    - ≈ 1.414 for √2 ≈ 1.41421;
    - x/2 · x = 1, so x² = 2 and x = √2;
    - 210 × 297 mm (C4);
    - 141% ≈ √2 (C12), and the page grows from 300 to 423 px, 1.41×;
    - Letter's fitted half is 251.2 px wide (the 11/8.5 scale, C11);
    - B2's half is 284.7 px wide, and B3's is 446.1 px at ratio 1.62.
  - "≈" and "거의" appear where research.md says to use them.
- **Shorts UI.** The √y mark at bottom left is the theme's `channelMark`, on
  every frame by design.

### What the brief should have told me

- **The morph limits.** The brief should say which steps the storyboard asks
  to morph and what the studio can actually morph: a token is a whole scripted
  or radical group. I found issue 1 only by stepping through B8 frame by
  frame, and check-render doesn't flag a mapped part that shares no token. A
  warning for that would catch it.
- **How rounds are numbered after a rewrite.** The brief says `review/r<N>/`,
  and this round went to `review/v2r1/` on the orchestrator's instruction.

---

The sections below reviewed v1, which was never published.

## Corrections (after round 3)

Both corrections come from reviewing `check-render`.

- **Round 1 misreported the x/2 label's size.** It gave the numerator x as
  13 px tall, but my crop had cut the glyph off. Re-measured on the round-1
  frame `review/f0578.png`, the numerator x is 21 px and the denominator 2 is
  31 px. `measure-tex` agrees: 20.0 px for `\frac{x}{2}` at 52 px. The
  finding stands, since 21 px is still under the 30 px floor. The "13 px"
  figures in Round 1 issue 1 and Round 2's re-check table are wrong.
- **Round 3 missed a regression in √2's placement.** Round 2 fixed which sheet
  the label reads as belonging to. When round 3 recentered the layout, rect
  moved to x 330 and the half to x 740, and the label is ambiguous again. I
  didn't re-measure it in round 3.
  - At f900 (`review/r3/f0900.png`), rect's right edge ink ends at x 502, the
    √2 label ink spans x 517–605, and the half's left edge ink starts at x 616.
  - That leaves 14 px of clear space to rect's edge and 10 px to the half's
    edge, so √2 sits slightly closer to the half and reads as the half's
    left-side label. The half's left side is the one of length 1.
  - The label is wedged between the two sheets from f848 to f900 (B6).
    `check-render` passes it, because it has no label-ownership check.
  - The storyboard is widening the rect–half gap. Round 4 re-checks it.

## Round 4

**Verdict: ship.**

This round is a focused review of the render rebuilt at 08:25 (d136c18, the
B4–B6 gap fix). The √2 label now clearly belongs to rect. The half's new
set-down slide collides with nothing. The rest of the render is unchanged from
round 3. Evidence is in `review/r4/`: `sheet-b4-lift-slide.png`,
`sheet-b5-b6-labels.png` and `sheet-boundaries.png`, plus the cited frames.

### Label ownership, B4–B6 (f429–900)

I measured every frame from f438 to f900. The gaps are clear space in pixel
ink, from the label to rect's right edge and to the nearest other ink:

| Span | Label | To rect | To anything else |
|------|-------|---------|------------------|
| f440–f855, at rest | x | 11 px | 107 px (the half) |
| f865–f900 (`r4/f0900.png`) | √2 | 14 px | 51 px (the half's left edge) |
| f471–f483, the slide on "긴" | x | 11 px | 61 px, growing to 106 px |
| f442–f444, the lift | x | — | the half's edge touches the label |
| f445–f446, the lift | x | 11 px | 1 px, then 6 px |

- **√2 reads as rect's label** (was 14 against 10 px, the round-3 regression).
- **The slide on "긴" is clean.** The half moves down and right, away from the
  label. Nothing new collides with anything during it
  (`sheet-b4-lift-slide.png`).
- **The x→√2 crossfade (f852–f862) is clean** (`sheet-b5-b6-labels.png`).
- **The lift crossing is still there.** The half's edge crosses the top of the
  "x" at f442–f444 and passes 1 px from it at f445. `check-render` warns on it
  (`r4/f0443.png`), and it was accepted in round 3.
- **Measurement difference.** The commit message's 9 px for √2 is measured
  from the probe's box, which starts at the radical's box. The pixel ink
  starts 5 px later.

### check-render on the real episode

My run matches production's summary: **0 fail, 1 warn, 10 pass**.

- The only warn is "f442–444: half's lines cross rect "x" (while moving)".
- Freshness now passes: the render carries the storyboard hash.
- Centering: B4 +2, B5 +3, B6 +3.

The run rewrote the tracked `check.md` and `check.json`. The only differences
were the run time and timestamp, so I restored both to the committed version.

### Regression pass

- **Beat boundaries.** I sampled all 8 boundaries every 2 frames
  (`sheet-boundaries.png`). They are unchanged from round 3: the old picture
  fades out, 4 blank frames, then the new one draws, and nothing overlaps.
- **Bounds.** All 1532 frames stay inside x 140–940 and below y 240. Visual ink
  spans x 146–937.
  - The lifted half reaches y 240 at f461 (`r4/f0461.png`) and x 937 at f460.
- **Crowding at the frame bounds.** The B4–B6 picture now spans almost the full
  content width: rect's left edge ink starts at x 149, and the half's "1" label
  ends at x 934. That is 9 px and 6 px inside the bounds. It is inside the
  rule and still reads as balanced (`r4/f0578.png`). The bounding box is
  centered at +1.5; the ink centroid is at −18.6, since the larger rect is on
  the left.
- **Captions.** All 28 start within 0.5 frame of their word and stay inside
  y 1325–1453.
- **Cue reaction.** Only eased color crossfades react later than 3 frames,
  showing 3 frames in, the same as round 3. The slide starts on "긴".

## Round 3

**Verdict: ship.**

This round is a focused review of the render rebuilt at 22:42. Content is now
centered on x 540 and stays inside x 140–940 in every frame. Every glyph clears
30 px, lowercase letters included. Every beat change reacts within 1 frame of
its first word, and the round-2 overlaps are gone. Audio, captions, sync, facts
and the loop are still clean. What remains are observations for the human
below, not defects.

Evidence is in `review/r3/`. The contact sheets are `sheet-beat-ends.png`,
`sheet-boundaries-1.png` and `sheet-boundaries-2.png` (every beat boundary,
every 2 frames), plus `detail-fold-names.png`, `detail-b4-lift.png` and
`detail-letter-rotate.png`. The cited frames are `fNNNN.png`. I pruned the
uncited frames from `review/r2/`.

### Centering (visual zone, beat ends)

The bounding box of all ink at each beat's last frame, against a target of
x 540:

| Beat | Frame | Ink x | Box center | Off |
|------|-------|-------|------------|-----|
| B1 | f156 | 297–782 | 539.5 | −0.5 |
| B2 | f282 | 297–782 | 539.5 | −0.5 |
| B3 | f428 | 367–758 | 562.5 | +22.5 |
| B4 | f578 | 157–902 | 529.5 | −10.5 |
| B5 | f727 | 157–902 | 529.5 | −10.5 |
| B6 | f900 | 157–902 | 529.5 | −10.5 |
| B7 | f1090 | 178–920 | 549.0 | +9.0 |
| B8 | f1337 | 202–879 | 540.5 | +0.5 |
| B9 | f1531 | 297–782 | 539.5 | −0.5 |

Nothing is off by more than 25 px. B3 comes closest, at +22.5, only because of
the "x" label on the right. The sheet itself spans x 367–713, which centers at
540, and the beat reads as centered. On `sheet-beat-ends.png` every beat looks
centered on the frame.

### Bounds (all 1532 frames)

- **Visual ink** stays within x 154–939 and y 240–1252. No frame falls outside
  x 140–940 or above y 240.
- **Closest approach:** B4's half, standing up at its lifted spot, touches
  x 939 and y 240 at f458–f463 (`r3/f0460.png`). That is inside the bounds, by
  design.
- **Captions:** ink stays within y 1325–1453 and x 229–848 (centered on
  about 538), inside 1280–1500.
- **Lowest visual ink:** y 1252, from B2's "1.29 → 1.55" at f167–f284. That is
  2 px below `zone.visual` but 73 px clear of the captions, so no bound is
  broken.

### Round-2 issues, re-checked

| Round 2 | Now | Evidence |
|---------|-----|----------|
| Lowercase glyphs under 30 px | **Fixed.** Measured glyph heights:<br>• "Letter" name: e 32, r 31<br>• number-line "Letter" (now plain text): e 32, r 31<br>• "mm": 32<br>• "m" in "1 m²": 32<br>• label x: 33; x/2 numerator: 33<br>• caption x: 34; caption x/2 numerator: 34; caption superscript ²: 33<br>The smallest glyph anywhere is 31 px. | `r3/f0180.png`, `r3/f1090.png`, `r3/f1337.png`, `r3/f1440.png`, `r3/f0578.png`, `r3/f0510.png` |
| Beat changes reacted 7–8 frames late | **Fixed.** The exits at f157, f283, f901 and f1338 show change 1 frame later (f158, f284, f902, f1339), and new content draws 7 frames after the word. Across all 48 cue anchors, the only ones slower than 3 frames are color crossfades, which show 3 frames in (e.g. f342 → f345, f375 → f378). | `sheet-boundaries-1/2.png` |
| Fold midline crossed the "A4" and "Letter" names | **Fixed.** Each name is gone (f8, f189) before its midline starts (f10, f190). | `detail-fold-names.png` |
| B4's half slid across rect's "x" label | **Nearly fixed.** It now lifts up and to the right. Its bottom edge crosses the top of the "x" for 2 frames (f442–f443) and clears it by f444. | `detail-b4-lift.png`, `r3/f0443.png` |
| Rotating Letter half grazed "1.29" | **Fixed.** The label moved to baseline 1240, and the corner stays about 17 px above it. | `detail-letter-rotate.png` |
| "Letter" name readable for only 0.4 s | **Better.** It is readable for about 0.5 s (f171–f187). | `sheet-boundaries-1.png` |
| Edge-label spacing differed from the spec | **Fixed.** The storyboard now specifies 12 px, measured to the ink. | — |
| "210 mm" tight above the division row | **Fixed.** The gap is 85 px (was 46) after the B8 relayout. | `r3/f1337.png` |

### For the human

None of these block shipping:

- **Brief blank between pictures.** At the four exit/appear beat changes, the
  visual zone is empty for 4 frames (0.13 s) between the old picture fading
  and the new one drawing: f160–f163, f286–f289, f904–f907 and f1341–f1344
  (`r3/f0162.png`). It reads as a quick cut rather than a glitch.
- **B7's number line has no end numbers.** The storyboard dropped "1.2" and
  "1.7" (`ends: false`), so the line shows only the Letter and √2 marks. The
  sheet's live label carries the value (`r3/f1090.png`).
- **The teal-to-blue change on the half's short edges is still faint**
  (unchanged since round 1): teal (93,207,176) against blue (88,195,216).
- **Length.** The render is 51.07 s, 1.07 s over the 40–50 s target.

### Sanity pass

- **Technical.** 1080×1920 at 30 fps, 1532 frames, yuv420p BT.709. Audio is
  AAC 24 kHz, 51.07 s. Loudness is −14.0 LUFS integrated with −1.9 dBTP true
  peak. Speech ends at 50.57 s, before the video does.
- **A/V sync.** I re-ran `align.py` on the render's audio: all 94 word starts
  land within ±10 ms of `words.json`. Cross-correlating with `narration.mp3`
  gives 0 samples of lag.
- **Captions.** All 28 chunks show the storyboard text and start within
  0.5 frame of their word.
- **Transcript.** Whisper's transcript matches the 읽기용 text in every beat;
  the only differences are digits and spacing.
- **Facts.** `verify.py` passes. The on-screen numbers are unchanged:
  1.29 → 1.55, 1.41429 / 1.41421, 1.414.
- **Loop.** In the visual zone, f1531 and f0 differ in 496 px beyond a 2% fuzz
  (RMSE 0.15%). That is anti-aliasing around the "A4" name, which looks
  identical.
- **Beat ends.** All nine match their `endFrame` descriptions at the new
  x 540 positions.
- **Transitions.** Every beat boundary is clean: the old picture fades out and
  the new one draws on, with nothing overlapping.

## Round 2

**Verdict: fix then ship.** One small fix is required: four pieces of lowercase
label text are under the 30 px legibility floor. Everything else passes.

Every round-1 issue that mattered is fixed in the rebuilt render:

- the x/2 label is readable;
- no beat change draws new content over old;
- the B9 focus move is clean;
- √2 sits by its own edge;
- the A0 title stays up for about 3.4 s;
- loudness is on target.

Audio, captions, sync and facts are still clean. Without the floor rule on
x-height, this render would be a **ship**.

Frames are `review/r2/fNNNN.png` (0-based frame number, 30 fps), extracted from
the rebuilt `render.mp4`. 391 frames cover every beat boundary and every long
move.

### Round-1 issues, re-checked

| # | Round 1 | Now | Evidence |
|---|---------|-----|----------|
| 1 | The half's x/2 label glyph was 13 px tall | **Fixed.** It is a display-style fraction now: numerator x 30 px, denominator 2 43 px, the same as the "1" labels. | `r2/f0578.png` |
| 2 | New content drew over old content at B2→B3, B6→B7, B8→B9 | **Fixed.** At all four beats whose first word has exits, the old picture clears before the new one draws, so nothing overlaps. | `r2/f0283`–`f0297`, `r2/f0899`–`f0925`, `r2/f1336`–`f1362` |
| 3 | In B9's focusKept, the A4 label collided with A3 | **Fixed.** The rest of the nest fades out over f1449–f1463, and the A4 piece moves only after that (f1464–f1498). | `r2/f1458.png`, `r2/f1461.png`, `r2/f1470.png`, `r2/f1485.png` |
| 4 | "√2" sat 9 px from the half and 27 px from rect | **Fixed.** It is now 13 px from rect's edge and 21 px from the half, so it reads as rect's label. | `r2/f0900.png` |
| 5 | "A0 · 1 m²" showed for 0.4 s, and a cut line crossed it | **Fixed.** The title sits above the sheet from f1357 to about f1460 (3.4 s), and no line crosses it. Its "m" is under the floor; see issue 1 below. | `r2/f1358.png`, `r2/f1440.png` |
| 6 | Loudness −16.2 LUFS | **Fixed.** −14.0 LUFS integrated, true peak −1.9 dBTP, LRA 3.8 LU. | — |
| 7a | Teal-to-blue change on the half's short edges barely shows | **Unchanged.** Still (93,207,176) → (89,192,214). | `r2/f0516.png` |
| 7b | Caption math lighter than the words | **Fixed.** Math in captions is bold now. | `r2/f0620.png` |
| 7c | "210 mm" tight above the division row | **Unchanged.** Still a 46 px gap. | `r2/f1337.png` |
| 7d | Color metadata | **Fixed.** yuv420p, BT.709, TV range. | — |

### Issues

#### 1. Lowercase label text is under the 30 px floor (B2, B7, B8, B9)

The floor is 30 px for the smallest glyph at 1080 px frame width. The math
glyphs now sit right at it: every x is 30 px, including the numerators of the
caption and label fractions, and the superscript ² is 30 px. The lowercase
letters in these plain-text labels fall short:

| Beat | Text | Frames | Smallest glyph | Evidence |
|------|------|--------|----------------|----------|
| B2 | The "Letter" sheet name | ~f0176–f0188 | e and r, 25 px | `r2/f0180.png` |
| B7 | The "Letter" mark on the number line | f0925–f1090 | r 24 px, e 26 px | `r2/f1090.png` |
| B8 | "mm" in both dimension labels | f1110–f1337 | 29 px | `r2/f1337.png` |
| B9 | "m" in the title "A0 · 1 m²" | f1357–f1460 | 28 px | `r2/f1440.png` |

Capitals and digits in the same labels measure 32–45 px.

- **Fix:** enlarge these four labels by about 20%: `type.label` and the
  number-line mark size (44 → about 54), and `type.mathInline` enough to lift
  "mm" and "m" to 30 px. Then re-check spacing, since B8's "210 mm" is already
  tight.
- **Owner:** production for the theme sizes. The storyboard sets the
  number-line mark at fontSize 44 explicitly, so that value changes in the
  storyboard.

#### 2. Minor: the picture reacts about 0.25 s after the first word at four beat changes

Under the new rule, appears wait for exits on the same anchor. The exits use
ease.in over 11 frames, so for about 7 frames after the first word nothing
visibly changes. The new content first draws 11–12 frames in:

| Change | First word | First visible change | New content |
|--------|------------|----------------------|-------------|
| B1→B2 | f157 | f165 | f168 |
| B2→B3 | f283 | f290 | f295 |
| B6→B7 | f901 | f908 | f913 |
| B8→B9 | f1338 | f1345 | f1350 |

The caption switches on the word, so the picture visibly trails the sentence by
about 0.25 s. Nothing overlaps, and this doesn't block shipping.

- **Fix (optional):** give exits a curve that moves at once (ease.out or
  linear), or shorten them to about 6 frames.
- **Owner:** production.

#### 3. Minor: brief overlaps during moves (under 0.3 s each)

- **The fold midline crosses the sheet name.** The dashed midline draws through
  "A4" at f0008–f0011, in the hook's first 0.4 s, and through "Letter" at
  f0188–f0191, while the name is still fading out (`r2/f0009.png`,
  `r2/f0010.png`, `r2/f0189.png`). Fading the name out before the line reaches
  the center would avoid it.
- **B4's half slides across rect's "x" label.** As the half lifts off at
  f0443–f0449, its translucent fill passes over the label (`r2/f0445.png`,
  `r2/f0447.png`).
- **The rotating Letter half grazes "1.29".** Its corner touches the label for
  about 2 frames around f0213 (`r2/f0213.png`).

Owner: storyboard.

#### 4. Minor: "Letter" is readable for about 0.4 s (B2)

The name fades in only after the exits and the fast draw-on, around f0176.
The fold starts fading it at f0186. The narration says "레터" at the same time,
so nothing is lost. Owner: storyboard, if anyone wants it longer.

#### 5. Minor: edge labels no longer match the storyboard's spacing

The storyboard's PaperRect spec still puts edge labels 24 px outside the edge.
The render now uses `mark.edgeLabelGap` = 12 in theme.ts:

- label ink starts 7 px below a bottom edge's ink;
- label ink starts 11 px right of a right edge's ink.

It reads fine and is what fixed round-1 issue 4, but the spec should say 12.
Owner: storyboard (update the spec text).

#### 6. Informational: audio is now 24 kHz

The audio stream changed from 48 kHz to 24 kHz AAC. That matches the 24 kHz TTS
source, so nothing is lost. YouTube resamples uploads, so 48 kHz is only the
conventional choice. Owner: production, if at all.

### Checked and fine

- **Technical.**
  - Video: 1080×1920 at 30 fps, 1532 frames, 51.07 s, yuv420p, BT.709, TV
    range.
  - Audio: AAC 24 kHz stereo, 51.07 s.
  - Speech ends at 50.57 s, followed by 0.49 s of silence, so nothing is cut
    off.
  - Loudness: −14.0 LUFS integrated, −1.9 dBTP true peak.
  - Duration: 51.07 s is within the 60 s limit. It misses the 40–50 s target
    in `topic.md` by 1.07 s; that is for the human to judge.
- **Safe area and zones.** Across all 1532 frames:
  - all content stays within x 104–911 and y 282–1447;
  - the visual content never goes below y 1226;
  - caption ink stays within y 1332–1446 and x 194–803, inside `zone.caption`
    (y 1280–1500).
- **Beat end frames.** All nine match their updated `endFrame` descriptions:
  f156, f282, f428, f578, f727, f900, f1090, f1337, f1531.
  - B2: the red strip spans y 320–433.
  - B3: rect is centered at y ≈ 620.
  - B4: both bottoms are at y ≈ 860.
  - B7: there is no red on the sheet, and the label reads 1.414.
- **Loop.** In the visual zone, f1531 and f0 differ in 193 px beyond a 2% fuzz
  (RMSE 0.12%). That is anti-aliasing noise.
- **Transitions.**
  - All 9 beat boundaries were sampled every 2 frames for 26 frames.
  - Every cue lasting 15 frames or more was sampled every 3 frames: B1's
    folds and fits, B2's fold and fit, B4's lift-off and rotation, B6's three
    morphs, B7's two resizes, B8's move, B9's split and focus.
  - The only findings are issues 2–4 above. The B6 morphs show brief ghosting
    mid-crossfade, which is normal for this kind of morph.
- **Captions.**
  - All 28 chunks show the storyboard text exactly.
  - Each starts on the frame of its first word in `words.json`, within
    0.5 frame.
- **A/V sync.**
  - I re-ran `studio/scripts/align.py` on the render's own audio: all 94 word
    starts land within ±10 ms of `words.json` (59 on the same frame, 35 one
    frame off).
  - Cross-correlating the render's audio with `narration.mp3` gives 0 samples
    of lag.
  - Of the 48 cue anchor frames, 34 show visual change within 2 frames. The
    rest are expected:
    - color crossfades appear 3–5 frames in (ease.smooth starts slowly);
    - the four beat changes in issue 2 respond 7–8 frames in;
    - the teal-to-blue edge change on "짧은" (f504) is too faint for the motion
      detector (minor 7a above).
- **Narration.** A Whisper large-v3-turbo transcript of the render matches the
  읽기용 text in every beat; the only differences are Whisper's digits and
  spacing.
- **Facts.** `python3 verify.py` passes. The on-screen numbers are unchanged
  from round 1 and still check out: 1.29 → 1.55, 1.41429 / 1.41421, 1.414, the
  number-line marks, A1–A4, and x : 1 = 1 : x/2 → x² = 2 → x = √2.

### What the brief should still tell me

- **Say which glyph height the floor means.** Worded as the smallest glyph, the
  30 px floor catches lowercase x-height ("Letter", "mm"). Say whether that is
  intended, or whether it means digit, cap and math-symbol height.
- **Set a reaction-time limit at beat changes.** For example: "first visible
  change within 3 frames of the anchor word". The wait-for-exits rule now puts
  new content 11–12 frames after the word.
- **Say what round 2 covers.** Say whether a re-review covers the whole render
  or only the changes. I re-ran everything.
- **Cap the evidence frames.** The transition pass keeps 391 PNGs (about
  32 MB). The brief could ask for contact sheets plus the individual frames
  that are cited.

## Round 1

Everything below reviews the first render, which has since been replaced. Its
frames are the `review/fNNNN.png` files, not the ones under `review/r2/`.

**Verdict: fix then ship.**

The audio and the facts are clean. Every spoken word matches the 읽기용 script,
every caption shows the storyboard text and starts on its word, and every number
on screen checks out. The problems are all in the on-screen layout. One label
that the B4–B6 argument depends on can't be read on a phone. In three places, new
content draws over old content before the old content has gone. One transition
in B9 shows labels colliding for about a second. None of this needs a rework.

Frames are `review/fNNNN.png`, where NNNN is the 0-based frame number at 30 fps,
all extracted from `render.mp4`.

### Issues

#### 1. The half's x/2 label is unreadable at phone size (B4–B6)

- **Where:** f529 (17.63 s) to f900 (30.00 s). See `review/f0578.png` (B4
  end), `review/f0727.png` and `review/f0900.png`.
- **What:** the label under the teal half renders as a text-style fraction. Its
  numerator x is 13 px tall and the whole fraction is 23 px wide at 1080 px
  frame width. On a frame shown 400 px wide, those glyphs are about 5 px tall.
  The "1" label next to it is 42 px tall. This label says the half's short side
  is x/2, which is the step the whole derivation depends on. Until the
  equation shows x/2 in B5, only the caption carries it.
- **Fix:** use `\dfrac{x}{2}` or a larger label size, so the label reads at the
  size of the "1" labels.
- **Owner:** storyboard. The label is specced as `\frac{x}{2}` at
  `type.mathInline`. It becomes production's fix if the choice is to render
  every Tex label in display style.

#### 2. New content draws over old content at beat changes (B6→B7, B8→B9, B2→B3)

Exits on a beat's first word use ease.in over 0.35 s. The old picture stays
close to full opacity while the new one draws on top of it, and then it drops
out.

- **B6→B7, f902–f912 (30.07–30.40 s),** `review/f0905.png`. The sweep sheet and
  its red strip land on top of rect and half. The number line draws straight
  through "x = √2". At f909, "1.200" overlaps the half's "1" label.
- **B8→B9, f1339–f1349 (44.63–44.97 s),** `review/f1344.png`. The A0 outline
  crosses through "297 mm" and through "297 ÷ 210 = 1.41429".
- **B2→B3, f284–f292 (9.47–9.73 s),** `review/f0289.png`. This one is milder:
  the new rect draws inside the Letter half and its red strip.

Each overlap lasts about a third of a second. It reads as a glitch, especially
when a line crosses text.

- **Fix:** make exits finish before appears on the same anchor start. Either
  delay the appears by about 0.3 s, or have exits fade quickly.
- **Owner:** storyboard, because each of these exits shares its anchor word with
  an appear and the render follows that spec. Production could instead fix it
  once for every episode in the player or theme, if the human prefers one rule.

#### 3. The moving A4 piece runs into the fading nest labels (B9, focusKept)

- **Where:** f1460–f1488 (48.67–49.60 s). See `review/f1468.png`,
  `review/f1476.png` and `review/f1484.png`.
- **What:** while the kept A4 moves and grows, the rest of the nest stays
  clearly visible for most of the move. The "A4" label runs into "A3": they
  touch at f1468 and overlap from f1472 to f1480. The nest's cut lines show
  through the growing sheet for about a second.
- **Fix:** fade the rest of the nest out in the first ~30% of the span, before
  the piece has moved far. The spec says the rest "fades out while the kept
  piece moves", which allows this.
- **Owner:** production.

#### 4. The "√2" label on rect sits against the half's edge (B6)

- **Where:** f848 (28.27 s) to f900. See `review/f0900.png`.
- **What:** when rect's right label changes from x to √2, it gets wider. It now
  spans x 490–567, and the half's yellow left edge starts at x 577. That is
  9 px from the half's edge and 27 px from rect's own edge, so √2 reads as a
  label on the half's left side, which has length 1. As "x", the label had
  plenty of room.
- **Fix:** leave more space between rect and half in B4 (move rect left or half
  right), or put rect's long-side label on its left.
- **Owner:** storyboard.

#### 5. "A0 · 1 m²" is on screen for about 0.4 s, and the first cut runs through it (B9)

- **Where:** f1353–f1366 (45.10–45.53 s). See `review/f1356.png` and
  `review/f1362.png`.
- **What:** the name and the "1 m²" sub fade in only after the outline has
  finished drawing. The first cut starts on "반씩" at f1360, a few frames later,
  and fades them out. That cut line is horizontal and draws straight through
  the name. The narration never says "1 m²", so this brief moment is the only
  chance to read it.
- **Fix:** make nest appear with `mode: fade` so the name shows from about
  f1342, and/or start the split one word later. Alternatively, drop the sub.
- **Owner:** storyboard.

#### 6. Loudness is −16.2 LUFS

- **What:** the render's audio measures −16.2 LUFS integrated, 3.8 LU loudness
  range, and −3.6 dBTP true peak (ffmpeg `ebur128`). YouTube turns loud audio
  down but doesn't turn quiet audio up, so this short will play about 2 dB
  quieter than one normalized to −14 LUFS.
- **Fix:** normalize to −14 LUFS with true peak at or below −1 dBTP. The
  +2.2 dB of gain fits: the peak lands at −1.4 dBTP.
- **Owner:** production.

#### 7. Minor

- **Blue and teal look nearly the same (B4).** On "짧은" at f504 (16.8 s, see
  `review/f0515.png`), the half's short edges change from teal (93,207,176) to
  blue (88,196,221). The change barely registers, so the cue shows almost
  nothing, and "blue = short side" is weak on a teal-filled sheet. The yellow
  long edges read fine. Owner: storyboard (palette choice).
- **Caption math is lighter than the words around it.** Math in captions
  renders in regular-weight KaTeX next to bold Pretendard, e.g.
  "x : 1과 1 : x/2가" (`review/f0626.png`) and "1 : √2, 딱 하나예요."
  (`review/f1090.png`). It's readable, just visibly lighter. Owner: production
  (Captions).
- **"210 mm" is close to the division row (B8).** The label spans y 879–921 and
  the "297 ÷ 210" row starts 46 px below it, at y 967 (`review/f1337.png`). It
  isn't wrong, just tight, and it reads as part of the equation stack. Owner:
  storyboard.
- **Color metadata (informational).** The video stream is yuvj420p full range,
  tagged colorspace bt470bg, with primaries and transfer unset, at 0.2 Mbps.
  The frames look clean, and ffmpeg decodes the colors to the palette values.
  Some players may still shift colors slightly with BT.601 or unset tags on a
  1080p video; BT.709 limited range is the safe default. Owner: production.

### Checked and fine

- **Technical.** Video is 1080×1920 at 30 fps: 1532 frames, 51.07 s. Audio is
  AAC 48 kHz stereo, 51.11 s. Speech ends at 50.61 s and decays naturally into
  silence, so nothing is cut off. The inserted pauses (after B1, B2, B6 and B7,
  and at the end) are clean digital silence with no clicks at the joins. Length
  is under the 60 s cap, but about 1 s over the 40–50 s target in `topic.md`.
- **Safe area.** Across all 1532 frames, every non-background pixel stays
  within x 104–911 and y 282–1445. The limits are x 60–940 and y 240–1500.
  Nothing is cut off at a frame edge.
- **Beat end frames.** Every beat's end frame matches its `endFrame`
  description:
  - f156, f428, f578, f727, f900, f1337, f1531 match as described.
  - f282: the red strip spans y 318–434, and the teal half measures 480×742
    with its stroke.
  - f1090: there is no red on the sheet, the marker sits on √2, and the label
    reads 1.414.
- **Loop.** In the visual zone, f1531 and f0 differ in 167 px beyond a 2% fuzz
  (RMSE 0.13%). That is anti-aliasing noise on the "A4" name and the corners,
  and the two frames look identical. Only the caption differs, by design:
  f0 has none.
- **Captions.**
  - All 28 chunks show the storyboard text exactly and sit inside the caption
    band.
  - Each one starts on the frame of its first word in `words.json`, within
    1 frame. The first chunk fades in over f4–f7.
- **`words.json` against the audio.** For words that follow a pause, the
  aligner's start times fall between 110 ms early and 30 ms late relative to
  the acoustic onset. Typically they are about 50 ms (1.5 frames) early.
  - The largest gap is "딱": the aligner puts it 130 ms before the audible
    burst, because it counts the stop's silent closure as the word's start.
    The pulse still peaks after the burst.
- **Audio sync.**
  - All 48 cue anchor frames (81 cues) were checked by measuring when motion
    starts in the visual zone, and at least one cue per beat by looking at the
    frames.
  - Moves and appears start 0–2 frames after their anchor. Color crossfades
    first show 3–4 frames in, because ease.smooth starts slowly (e.g. B3
    "짧은": cue at f342, first change at f345).
- **Narration.** A Whisper large-v3-turbo transcript of the render's audio
  matches the 읽기용 text in every beat. The only differences are Whisper's
  digits and Latin letters ("a4", "1.414", "x") and its spacing ("레터용지는",
  "나눠보면"). Nothing is dropped, added or garbled.
- **Facts.** `python3 verify.py` passes. I recomputed what it doesn't cover:
  - Letter's ratios: 11/8.5 = 1.294, shown as "1.29", and 8.5/5.5 = 1.545,
    shown as "1.55".
  - B8's rows: 297/210 = 1.414286, shown as "1.41429", and √2 = 1.414214, shown
    as "1.41421".
  - B7's number line: Letter's tick is at x 275 (1.294) and √2's at x 448. The
    sheet ends at 420×594 (h/w 1.414).
  - The A1–A4 labels sit in the correct halves of the nest.
  - The on-screen algebra is correct: x : 1 = 1 : x/2 → x·x/2 = 1 → x² = 2 →
    x = √2. Its colors match the storyboard.
  - The wording "거의 정확히 √2" follows the caution in `research.md`.
- **Other legibility.** Captions (glyphs about 54 px tall), the equations,
  "1.414", the number-line labels, A1–A4 and the dimension labels all read at
  400 px wide.
- **B6 morphs.** The equation morphs crossfade cleanly, with brief ghosting
  mid-morph only. The B7→B8 handover is clean.

### What this brief should have told me

- **Check transitions.** The worst problems were in transitions, which neither
  the beat-end frames nor the after-cue frames catch. Ask for a pass over every
  beat boundary (the first ~12 frames) and every long move, sampled every 2–3
  frames, or for a whole-video contact sheet at about 5 fps.
- **Define "the frame after each major cue".** It could mean just after the cue
  starts, or after its animation finishes. I used the second: the cue frame
  plus 11 frames (fast) or 21 frames (base), or its `untilFrame`.
- **Give a number for legibility.** For example: "glyphs under ~30 px tall in
  the 1080-wide frame fail." "Think 400 px wide" leaves it to judgement.
- **Say where the caption zone is.** It is `zone.caption` in `theme.ts`,
  y 1280–1500. The brief names the zone without giving its coordinates.
- **Check `words.json` against the audio itself.** The brief only compares
  captions to `words.json`, so an aligner error would pass every caption check.
- **Set the loudness pass/fail line.** Say what tolerance counts as an issue
  (±1 LU?) and what the true-peak ceiling is.
- **Say who owns a faithful-but-bad render.** When the render follows a spec
  that produces a bad result, as in issues 1, 2 and 5, say that the fix belongs
  to the storyboard.
- **Say which duration target applies.** The brief says ≤ 60 s, while
  `topic.md` says 40–50 s.
- **Mention `episodes/<slug>/frames/`.** It holds production's safe-area
  stills, and the brief doesn't say what to do with them. I didn't use them.
