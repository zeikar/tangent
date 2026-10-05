# Review · 005-hilbert-hotel

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
