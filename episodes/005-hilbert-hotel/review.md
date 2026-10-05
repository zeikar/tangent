# Review · 005-hilbert-hotel

## Round 2 · 2026-10-05

**Verdict: ship.**

This round reviewed the render from 79e3e92, fix round 1. It runs 44.87 s
(1346 frames). B7's pause grew from 0.4 to 0.5 s, and every earlier frame
keeps its number.

- **The change is local, as production said:**
  - theme.ts changed only inside the `hotel` block. Only fade.tsx,
    Hotel.tsx, NumberRow.tsx and RoomArrows.tsx read that block, and only
    005 uses those components.
  - geometry.ts is byte for byte its pre-005 state (no diff against
    3fc3e74).
  - So no shared code moves. I re-judged the changed beats and their
    boundaries, and I diffed every frame against round 1's render to find
    them.
- **Frame by frame against round 1** (pixels more than 16 levels off):
  - **Identical:** f0–f283, f1000–f1083, f1105–f1168 and f1285–f1302:
    B1, most of B2, B6 outside its pulse, and B7's hold after the gather.
  - **Encoder noise only:** f284–f309 (B2's end) and f1169–f1180 (B7's
    start), at most 37 pixels.
  - **Changed:** f313–f999 (B3, B4 and B5, with B6's first three frames
    as encoder noise), f1084–f1104 (B6's row pulse) and f1199–f1342 (B7).
    Those are exactly the changed beats, so my round 1 findings on
    everything else still hold.
- **The audio** of round 1's render and this one is identical (same PCM
  hash over the first 44.7 s), so round 1's Whisper pass stands.
- **All four round 1 issues are fixed:** r1#1 through r1#4, each detailed
  below.
- **The critique changes read well:** B3 at phone scale, the B4 badges and
  arrows, and B7's ending.
- **check-render:** 0 fail, 1 warn, 14 pass, 1 skip.
- **One nit:** at its peak, the thicker wall pulse comes within 1 px of the
  '10' (r2#1).
- **For the human:** B5's copies of 2, 4, 6, 8 first show a third of the
  way along their path. So where they came from is implied by their
  direction, not seen (r2#2).

Evidence is in `review/r2/`:

- `sheet.png`: f0 and every beat's last frame;
- `b5-f843-905.png`: B5's handoff, every frame from f875;
- `b3-f373-423.png`: the end wall through the shift, the pulse and the red
  recolor;
- `phone-f700-f842-f576-f887.png`: four frames at phone scale (400 px
  wide): B4's badges, B4's end, B3's end, B5's copies in flight;
- `b4-tags-f0700.png`: the badges at full resolution;
- `b7-f1264-1345.png`: B7 from "그래서" to the last frame;
- `rows-f899-f1264.png`: the row pulses at rest and at their peaks, and
  B7's top row turning white.

### Issues

#### 1. Nit: at its peak, the wall pulse nearly touches the '10' (f385–f390, 12.83–13.00 s)

- **The pulse now reads:** the wall grows from 6 to 14 px, about its
  center x 788. The floor past it lifts to white, which also shows
  (`review/r2/b3-f373-423.png`, f386–f389). r1#3 is fixed.
- **It grows into room 10:** the wall's left edge comes to within 1 px of
  the '0' of '10' (f387–f388, at y 515) and stays within 2 px for f385–f390.
  At rest the gap is 5 px. For about 6 frames, '10' and the wall read as
  touching. check-render's overlaps check doesn't flag a 1 px gap.
- **Fix, if worth it:** cap the growth at about 10 px. Growing rightward
  only would run into the pushed-out guest's outline (ink from x ≈ 799), so
  the cap is the simpler fix. The floor's lift already carries the
  emphasis.

#### 2. For the human: B5's copies show up a third of the way into their flight (f884–f891, 29.47–29.70 s)

Production asked whether the bottom row still reads as coming from the even
rooms. Measured per frame (`review/r2/b5-f843-905.png`):

- **The arcs leave cleanly:** they fade out in place (f875–f883) and never
  cross the top row or '자연수', which fades in at f884–f886 over nothing.
  The pairing lines grow down from the top row (ticks at f886, full by
  f892).
- **The first frame they show** is f884, already partway along:
  - '2' at x 257, 33% of the way from room 2 (x 287) toward its place
    under 1 (x 197);
  - '4' at x 408, between the top row's 3 and 4, nearer the 3;
  - '6' at x 558, right under the top row's 5;
  - '8' at x 698, between 6 and 7.
- **They come in below the row:** their ink top is at y 709, 17 px under
  the top row's ink. They are at full strength from f885 and land at
  f891–f895.
- **How it reads:** a set of teal numbers drops in from just under the top
  row and fans left, and the farther a number lands, the more it slides.
  That direction points back at 2, 4, 6, 8, but no frame shows a number
  leaving its room's number. It is a correct picture, with the
  where-from implied rather than seen.
- **If the human wants it explicit:** give the copies a vertical-first path
  that drops straight down under its source and then slides left. Then each
  copy's first visible frame sits right under its own 2, 4, 6 or 8. That
  keeps today's rule that a copy stays unseen until it is below the row.
  Showing the copies on the row itself would bring back round 1's
  text-on-text overlap.

### Round 1's issues

- **r1#1 fixed** (`review/r2/b5-f843-905.png`):
  - Nothing crosses a number or '자연수' (check-render's overlaps check
    now passes).
  - 10–18 start fading in at f892, after the '8' has landed. The '8' is at
    x 474–489 when '10' first shows at x 526, a gap of 37 px, and no number
    passes another.
  - B5's end frame is unchanged.
- **r1#2 fixed:**
  - On "전체만큼" (f1211) the top row returns to text color as it pulses.
    It is all white by f1240 and stays white into the gather
    (`review/r2/rows-f899-f1264.png`).
- **r1#3 fixed,** with r2#1 as a side effect.
- **r1#4 fixed:**
  - At the peak of all three rowE pulses (f913, f1094, f1208), the gap
    between two-digit numbers stays at 20–22 px (27–28 at rest, 15 in
    round 1). Single digits go from 59 to 53 px apart.
  - The color lift toward white shows.
  - The top row's pulse on "전체만큼" grows '2' from 29 to 35 px wide,
    keeping gaps of 52 px or more.

### The critique changes

- **B3, bigger and set apart** (`review/r2/phone-f700-f842-f576-f887.png`,
  third frame):
  - The hotels are now 230 px apart (floors 630 and 1010) and read as two
    separate rows.
  - At phone scale (0.37×), the room numbers are about 13 px tall and
    readable. The red guest and the lit 10 → 11 arrow are the only accents,
    so the eye finds the pair, and the red guest stands right over room 11.
  - At full size, '10' sits 6 px from its left wall and 5 px from the end
    wall (4 px inside the number).
  - The taller rooms (150) leave about 34 px of empty wall between number
    and head (ink y 538 to 572). That is fine.
  - B3's centering is −2/−1.
  - B2 → B3 (f310–f337) is the same move as before, into the new
    positions, and the finite hotel fades in clear of the moving one.
  - B3 → B4 (f577–f601) is clean.
- **B4's badges** (`review/r2/b4-tags-f0700.png`):
  - **Contrast:** the badge fill averages #9B7033 (yellow at 0.6 over the
    ground), and the digits' cores are near black. Contrast is 4.40–4.47:1
    for tags 1–6, which confirms production's 4.4:1 estimate. Tag 7 is at
    3.3:1 and tag 8 at 1.8:1, as the fade intends.
  - **Readable:** the digits are TeX at 44 px (35.5 px tall), so the large
    text bar of 3:1 applies, and they read at phone scale.
  - **Distinct:** the tags no longer look like room numbers.
  - **Arrival:** the badges come in with their newcomers (f595–f616) and
    fade away as the newcomers leave the street (f794–f797).
- **B4's arrows** (f779–f842):
  - **What shows:** only the arrows into rooms 1, 3, 5 and 7 are visible;
    the one into 9 is a trace. The newcomers past 4 still move into the
    fade with the others during the admit, which is right, since every
    newcomer moves at once.
  - **The end frame** has four calm arrows instead of round 1's fan, and
    still matches its `endFrame`.
- **B7's ending** (`review/r2/b7-f1264-1345.png`):
  - **The gather** (f1264–f1286) is as in round 1.
  - **During the last line:** the alternating hotel (yellow newcomers in
    the odd rooms) stays on screen through "자리가 나는 거예요" (f1303–f1329).
  - **In the pause:** from f1330 the odd guests turn blue and the newcomer
    fades in at the door. The picture is complete by f1340 and still from
    there to the last frame.
  - **The caption** ends at f1330.
  - **The loop:** the last frame differs from frame 0 by 8 pixels in the
    visual zone.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for
byte: **0 fail, 1 warn, 14 pass, 1 skip** (labels: no edge label has
another element's line nearby).

- **cues (warn):** B3 f415 (the red recolor, which shows by f423) and B6
  f1117 (+6, inside its word). Both are unchanged from round 1 and fine.
  Round 1's third warn, B7's f1303 bookkeeping exit, is gone: that cue now
  sits on the pause.
- **overlaps** now passes.
- **Bounds:**
  - The ink spans x 144–935 and y 405–1106. The badges' bottom is at
    1106, and the caption band starts at 1280.
  - B3's room 1 wall is drawn at x 146–149, inside the content edge at
    140.
- **Everything else passes:**
  - freshness;
  - technical;
  - centering: B3 −2/−1, B5 +19/−20;
  - legibility: 35.5 px;
  - captions: 31, each on its cue;
  - readable, reaction and blank runs;
  - loudness: −14 LUFS, −3.3 dBTP;
  - A/V sync: 0 ms;
  - words;
  - loop: 7 pixels.

### What these instructions should have said

- **Diffing against the last round** is the cheapest way to prove that a
  local fix stayed local: keep the previous round's decoded frames until
  the next round. This round, that made the focused review safe.

## Round 1 · 2026-10-05

**Verdict: fix then ship.**

This round reviewed the first render, committed in 0739185 (studio at
63747ce). It runs 44.77 s (1343 frames), inside topic.md's 40–50 s target.
63747ce adds three components and a per-piece fade. It changes shared code
by adding to it, except for one refactor in shapes.tsx that moves code
without changing it (see Checked and fine). So no shipped episode moves.
This is a full pass.

- **The hotel math on screen is right.** Every room number, tag, arrow
  and pairing is correct: n → n+1, n → 2n, newcomer k → room 2k−1, and
  n paired with 2n. `python3 verify.py` passes. The finite hotel's room 1
  stays empty and unlit (C17).
- **The narration matches the Read-aloud text word for word** (Whisper).
- **check-render:** 0 fail, 2 warn, 13 pass, 1 skip. Both warns get a
  verdict below: the overlaps warn is r1#1, and the three cue warns are
  fine.
- **One fix:** B5's handoff from arcs to pairing lines. For about 0.6 s the
  arcs sweep through the top row and '자연수', and the flying '8' runs over
  the '10' and then reads "810" (r1#1).
- **Minor, for the human:** at "전체만큼" the top row still has B6's dimmed
  odd numbers, so "the whole" pulses half dimmed (r1#2).
- **The rest are nits** (r1#3, r1#4).

Evidence is in `review/r1/`:

- `sheet.png`: f0 and every beat's last frame;
- `b5-f877-896.png`: B5's handoff, every frame, cropped;
- `b5-f887-890.png`: the '8' and the '10', full resolution;
- `b7-f1169-1221.png`: B7 at rest, at "일부가" and at "전체만큼";
- `b3-f361-423.png`: B3's end wall through the shift, the wall pulse and
  the red recolor;
- `b5-f899-911.png`: the bottom row at rest and at its pulse's peak.

### Issues

#### 1. Fix: B5's arcs sweep through the top row, and the flying '8' runs over the '10' (f877–f896, 29.23–29.87 s)

On "이건" (f875), three things start together. The arcs n → 2n straighten
into vertical lines. The even rooms' numbers 2, 4, 6, 8 fly down and left
to sit under 1, 2, 3, 4. The rest of the bottom row (10, 12, 14, 16, 18)
fades in where it ends up. Frame by frame (`review/r1/b5-f877-896.png`):

- **f877–f882: the far end of the row comes first.** 10–16 are already
  faintly in place while the copies of 2, 4, 6, 8 are still on the top
  row's numbers. So the flyers land into a row that has already formed.
- **f883–f888: the arcs sweep down through the top row.** Each arc's
  head swings from room 2n's roof down to under n, crossing the digits
  between them (1 through 8). At f884–f886 the arcs also cross '자연수'
  while it fades in on "자연수와" (f884). This is check-render's overlaps
  warn (f883–889), and it is visible.
- **f887–f890: the '8' runs over the '10'** (`review/r1/b5-f887-890.png`):
  - **f887:** the '8' (ink x 570–598, y 770–816) sits 15 px straight above
    the '0' of '10'.
  - **f888–f889:** the '8' touches the '1' of '10' (x 526–550, y 832–878).
    Their ink joins into one shape (x 508–550 at f889).
  - **f890:** the '8' (x 488–517, y 812–860) sits 9 px left of the '10',
    beside it, so the row reads "2 4 6 810 12 14 16". At rest, the gap
    between two numbers is 27 px and the gap inside '10' is 4 px.
  - **From f891** the gap is 22 px, and the row is in place by f895.
- check-render doesn't catch the '8' and the '10'. Both belong to rowE, and
  its overlaps check looks at text meeting text from different elements.

**Why it matters:** this is the moment the hotel becomes the pairing, "이건
자연수와 짝수를". The viewer should see each arc become one line from n to
2n. Instead they get 0.6 s of tangle and a number that isn't there (810).

**Fix:**

- Take the fallback the storyboard's notes already name: fade the arcs
  while the pairing lines grow in place, top to bottom. Then nothing sweeps
  through the top row or '자연수'.
- Hold 10, 12, 14, 16 and 18 back until the flyers have landed (about
  f891), or at least until the '8' is left of x 520. The row then fills
  left to right, and no flyer passes an end number that is already showing.

Both changes are in NumberRow and RoomArrows' pairTo, which are new in
63747ce. No other episode uses them.

#### 2. Minor, for the human: "전체만큼" pulses a top row still half dimmed from B6 (f1211–f1225, 40.37–40.83 s)

- **B6 ends with the top row split:** evens teal, odds muted ("짝수는
  자연수의 일부인데도요"). That reads as meant there.
- **B7 keeps that styling** through "무한에서는 일부가 전체만큼 클 수 있어요".
  On "일부가" (f1198) the bottom row, the part, pulses. On "전체만큼"
  (f1211) the top row, the whole, pulses, but half of it is dim and the
  other half is teal like the part (`review/r1/b7-f1169-1221.png`, f1221).
- **The pulse is the only change:** digits grow about 1.15× ('2' ink 29 →
  34 px wide). So "the whole" never looks whole in the beat that names it.
- **Fix, if the human agrees:** on "전체만큼" (or on B7's first word),
  return rowN's numbers to text color as it pulses. That is a storyboard
  change only. Note that the script's B7 Visual line says B6's two rows
  stand as they are through the first sentence. That fits the layout, and
  this fix changes only the colors.

#### 3. Nit: B3's end-wall pulse on "마지막 방" barely shows (f377–f395, 12.57–13.17 s)

- **The wall is already white:** text color, 6 px. The pulse only thickens
  it to 10 px for about 8 frames (f383–f392, measured at y 560). The color
  doesn't change (`review/r1/b3-f361-423.png`).
- **It costs little:** the shift just before (f361–f376) pushes guest 10
  through that wall, so the eye is already there.
- **Fix, if worth it:** pulse the wall in yellow, or brighten the floor's
  end with it. Or drop the cue.

#### 4. Nit: the bottom row's pulse squeezes the two-digit numbers (f903–f917, f1084–f1098, f1198–f1212)

- **The gap closes:** rowE pulses 1.2× in place on "짝수를", "짝수는" and
  "일부가". At the peak, the gap between '10', '12', '14' and '16' closes
  from 27 px to 15 px, against 4–5 px inside each number. For about 0.3 s
  it reads as "10121416" at a glance (`review/r1/b5-f899-911.png`, f911).
- **Fix, if worth it:** pulse rowE at about 1.1×, or by brightness only.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for
byte: **0 fail, 2 warn, 13 pass,
1 skip** (labels: no edge label has another element's line nearby).

- **overlaps (warn):** dbl's lines cross rowN's digits (f883–889) and
  '자연수' (f885) while moving. Real and visible: part of r1#1.
- **cues (warn): all three are fine.**
  - **B3 f415, finHops.setStyle (red), "none":** check-render can't see
    this one. Blue #5285F8 and red #E25273 have nearly the same luminance
    (0.25 against 0.23). By eye, the arrow and the guest go through a
    violet in-between at f420 and are fully red by f423. They read clearly
    (`review/r1/b3-f361-423.png`).
  - **B6 f1117, rowN.setStyle, +6:** a smooth recolor. It shows from about
    f1123 and is done by f1131, inside "일부인데도요" (f1117–f1134).
  - **B7 f1303, rowN.exit, +6:** this exit is bookkeeping. Nothing of rowN
    is drawn after the gather. The word's visible changes, the odd guests
    turning blue and the newcomer appearing at the door, show by
    f1305–f1308.
- **Everything else passes:**
  - freshness;
  - technical: BT.709 TV range, 30 fps, 48 kHz, silent tail;
  - bounds: ink x 146–935, y 405–1086;
  - centering: at most +19/−20 px, in B5 and B6;
  - legibility: the smallest glyph is a room number, 35.5 px;
  - captions: 31, each on its cue and on one line;
  - readable;
  - reaction: +1 or no cue on every beat's first word;
  - blank runs;
  - loudness: −14 LUFS, −3.3 dBTP;
  - A/V sync: 0 ms;
  - words: widest −70 ms;
  - loop: 2 pixels differ.

### Checked and fine

- **End frames match each beat's `endFrame`** (`review/r1/sheet.png`):
  - B1 is frame 0's picture.
  - B2: the newcomer in room 1, the arrows at 0.35, no light.
  - B3: the finite hotel's room 1 empty and unlit, the red guest at x 803
    outside the wall, room 10's arrow red; below, room 11 under the red
    guest and the 10 → 11 arrow at full strength.
  - B4: blue guests in even rooms, yellow in odd, the arcs n → 2n, the
    yellow arrows from the empty street, no tags and no lights.
  - B5: the two rows, the names and the lines, no hotel.
  - B6: the top row's evens teal and odds muted.
  - B7 equals frame 0, with no caption.
- **Numbers on screen, recomputed:**
  - The pairing lines and the bottom row's numbers sit under their n at
    x = 197 + 90(n − 1), within 1 px for 2 through 16.
  - B4's arc heads land at room 2n's roof (center − 18): 269, 449, 629,
    809.
  - The yellow arrows run from newcomer k to room 2k − 1: 197 → 197,
    287 → 377, 377 → 557, 467 → 737.
  - The room numbers count up 1–10 in the finite hotel and 1–13 in the
    infinite one. The tags count up 1–9.
- **Facts:**
  - `python3 verify.py` passes (exit 0).
  - Every move is all at once: B2's and B3's shifts, B4's 2n stretch and
    B4's admit all start and land together.
  - B3 admits nobody to the finite hotel's room 1 (C17).
  - "크기가 같다고 해요" is stated as a definition, which is C6's honest
    form. "일부가 전체만큼" is C7.
- **Production's notes:**
  - **B3's density in 62 px rooms is tight but legible.** Room numbers are
    35.5 px tall. In both hotels, '10' and '11' sit 4–5 px from their walls,
    the same as the gap inside the number. Even so, the walls are full-height
    lines and can't be read as digits. The focal pair (the red guest above,
    room 11 below) is clear at the end frame.
  - **The B3 recolor** reads by eye (see the cues warn above).
  - **The B5 transition** is r1#1.
- **Animations read as meant:**
  - B1's wave runs a white outline from room 1 into the fade.
  - B2's and B3's shifts slide every guest together. Guest 10 passes
    through the end wall at f371–f373.
  - B3's move reads as the hotel shrinking and dropping, with the finite
    hotel fading in above, room for room, by f334.
  - B4 stretches the row to double spacing, and the newcomers move along
    their arrows into the odd rooms, all landing at f809.
  - B7 folds the top row back into room numbers. Their teal and gray fade
    to white by f1276. The hotel grows back into the big layout by f1284.
  - Color fades pass through gray or violet in-betweens for 2–3 frames
    (B4 f586, B7 f1311); that's fine.
- **Captions:** all 31 match the storyboard's text, in 2–4 eojeol chunks,
  one line each. The first chunk is on screen from frame 0.
- **Narration:** Whisper's transcript matches script.md's Read-aloud text
  word for word. It writes 일 번 as 1번 and 열 개 as 10개, and joins
  홀수방. It writes "비죠?" with a question mark twice; that is Whisper's
  punctuation, not evidence of the voice's intonation.
- **Balance:**
  - B5's and B6's rows fade out to the right, so their weight sits left of
    center, and the centered names sit over the 4–5 gap. Picture centering
    is −20 px, inside the ±25 tolerance.
  - Frame 0's hotel spans x 160–911 at y 643–847, the width the
    storyboard argues for.
- **Contrast:** muted #8A8F98 on the ground is 5.8:1. B6's dimmed odd
  numbers stay readable.
- **Shared code** (read from 63747ce's diff; no shipped episode was
  rebuilt):
  - theme.ts adds `figure.guest` and the `hotel` block. No existing value
    changed.
  - StoryboardPlayer adds three registry entries.
  - InkText.tsx adds `useTexInk` and `InkTex`. InkLine is untouched.
  - geometry.ts adds `resample`.
  - shapes.tsx moves CurvedArrow's arithmetic verbatim into
    `curvedArrowParts`. The `pts.length < 2` guard stays in CurvedArrow,
    and the line and head points are computed exactly as before. This
    agrees with production's byte-identical static markup over 76 inputs.
    So 002's Compass and SpinArrow draw as they did.

### What these instructions should have said

- **Same-element collisions:** check-render's overlaps check doesn't catch
  two glyphs of the same element meeting while moving (rowE's '8' over its
  '10'). Wherever a row assembles from pieces that move at different times,
  step through it frame by frame.
- **Equal-luminance recolors:** the cues check works on gray, so a recolor
  between two accents of equal luminance (blue and red here) shows as
  "none". Every recolor cue should be checked by eye, not only when the
  task names it.
