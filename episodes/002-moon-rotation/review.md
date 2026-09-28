# Review · 002-moon-rotation

## Round 2 · 2026-09-28

**Verdict: ship.**

This round reviewed the render from 520d5a5: 48.90 s, 1467 frames. B4's hold
is 0.5 s longer than in round 1. The fix round changed shared theme tokens and
the timeline's easing, so this is a full pass, not a diff review.

- **Round 1's three minor issues are fixed.** So are r1#4 (in check-render)
  and r1#5.
- **r1#8 stays as it is,** and I agree (see below).
- **check-render passes:** 0 fail, 15 pass, 1 skip.
- **What's left:** three new nits and round 1's two carried nits. None
  misleads or hides anything.

Evidence is in `review/r2/`:

- `sheet-ends.png`: f0 and every beat's last frame;
- `sheet-b4-f620-647.png` and `sheet-b6-f1150-1200.png`: motion strips;
- `f0369.png` and `f0733.png`.

### Round 1, re-checked

| Round 1 | Now |
|---------|-----|
| r1#1 orbits start and stop at full speed | **Fixed.** Every orbit ramps over about 5 frames. B1: 0 → 0.5 → 3.2 → 7.1 → 10.6 → 12.5 px/frame (f3–f8), and back down 12.3 → 10.7 → 7.5 → 3.1 → 0.7 → 0 (f73–f78). B2, B3 and B7 ramp the same way. B7's stall-then-jolt is gone: the pull-back slows to under 1 px/frame for 4 frames (f1328–f1331), then the orbit ramps 3.3 → 7.3 → 11.1 → 12.6. The end angles and frames are unchanged. |
| r1#2 the spin arc crosses the red pull arrow | **Mostly fixed.** The arc dims to 0.35 from "비껴" (f1055), so its pass over the red arrow at about f1150 is faint. The arrow is bigger: 100 px, 8 px stroke, 5.8:1 on the ground. It holds full length through the 25° lean until "브레이크가". One full-strength crossing remains: r2#1. |
| r1#3 B4's arrows are at the glyph floor | **Fixed.** Ghost pointers are now 35 px (ghost1Top's runs y 465–499), and the compass copies 56 px on a 36 px hub. The right compass with its sweep spans x 631–868 and y 941–1188, about 1.5× round 1's (`review/r2/f0733.png`). |
| r1#4 words detector miss | **Fixed** in check-render (12dc309), using the rule I proposed. It now passes 23 of 23, widest "앞면이" at −50 ms. |
| r1#5 compass copies clump | **Fixed.** The copies leave one at a time, and no two meet (`review/r2/sheet-b4-f620-647.png`). Each still crosses Earth or a ghost for a few frames on its way, which reads as a slide. The last copy lands at f644, as the sweep starts. |
| r1#6 B3's panels sit high | Carried, unchanged, and fine to leave. B4 now uses the bottom of the zone down to y 1188. |
| r1#7 the ghosts' halves are faint | Carried, unchanged (opacity 0.35). |
| r1#8 the "도는 / 것" caption split | **Not done, and I agree.** The storyboard's 2–4 eojeol rule, which `validate-storyboard.py` enforces, leaves this split as the only choice. "지구에선 / 안 도는 것 같지만" needs a 1-eojeol caption, and the whole clause is 5 eojeol. The rule guards against one-word flashes and long lines, and it's worth more than this 0.77 s fragment. Closed. |

**Frame 0 (the Claude cut critic's point 5).** Production is right: the Moon
isn't fading in at f0. Its fills there are (155, 111, 55) yellow and
(8, 117, 117) teal, the same as at B1's end (f131) and at B7's 6 o'clock
(f1437). Frames 0–3 differ from f0 in at most 4 pixels. The see-through look
is the approved 0.6 body fill: #FEB251 at 0.6 over the ground comes out at
about 155.

### Issues

#### 1. Nit: the spin arc still crosses the full-length red arrow once, on "브레이크가" (f1181–f1199)

- The arc returns to full strength on "브레이크가" (f1177, a 0.35 s fade).
  The lean holds until then, so the red arrow is still about 95 px long.
- The arc's next pass over the Earth side overlaps the red arrow's box from
  f1181 to f1199, at full strength by f1183 (`review/r2/sheet-b6-f1150-1200.png`).
- It's one pass of 0.6 s, and on "브레이크가" both arrows matter, so it's
  much milder than round 1's.
- **Fix (optional):** bring the arc back on "걸렸죠" (f1192) instead. It would
  reach full strength around f1202, after the crossing, and the slowdown
  still shows from there to "맞을".

#### 2. Nit, for the human: B4's hold is now 2.2 s of silence over a still picture (f670–f734, 22.3–24.5 s)

- The Codex critic asked for more time on the finished compass, so the pause
  after "돌았어요" went from 1.0 to 1.5 s.
- The narration is silent from 22.28 to 24.46 s, and nothing on screen moves
  from f670 to f734.
- It's now the longest still and the longest silence in the video. The next
  longest still is B5's 1.4 s (f761–803), under narration. The next longest
  silence is 1.3 s before B3 (11.0–12.3 s), and the ring's pulse covers its
  first 0.4 s.
- Whether 2.2 s reads as time to take in the conclusion or as a dead spot is
  a feel call.
- **If it feels long:** a single pulse of compass2's arrows about halfway in
  (around f700) would keep it alive without giving the time back.

#### 3. Nit: B2's bigger star crowds the title, and at B2's end the pointer aims into the title (f199–f369)

- star1 is now 40 px across (y 249–286). The title "자전 안 하면" starts
  18 px below it (ink y 305–355), so the star reads a little like the
  title's ornament.
- At B2's end the Moon's pointer tip is at y 387, 32 px below the title. So
  the arrow meant for the star points into the title text, with the star
  behind it (`review/r2/f0369.png`).
- In mid-orbit the pointer is far from the title, so this only shows around
  12 o'clock: from about f300 to B2's end.
- **Fix (optional):** exit title1 on "같은" (f189), when the star appears. The
  question it names has been asked, and the caption carries "자전을 안
  하면". The star then has the top center to itself, and B3's exit list
  shrinks by one.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for byte:
**0 fail, 0 warn, 15 pass, 1 skip** (labels: no edge labels).

- **Passes at or near a limit:**
  - bounds: the top ink is y 241 against the y ≥ 240 bound. It's star1 at the
    peak of its "별을" pulse (f615), 1 px inside. The storyboard gives
    242–294, so it's the 40 px star at 1.3×. It passes, but there's no room
    left if the star grows again.
  - bounds: the rightmost ink is x 933, a star-field edge dot.
  - words: the widest is "앞면이" at −50 ms.
  - centering: B5 is −9 px for all ink and −10 px for the picture.
- **Everything else passes:**
  - freshness;
  - technical: BT.709 TV range, 30 fps, 48 kHz, silent tail;
  - legibility: 39.6 px;
  - overlaps;
  - captions: 35 on their cue, one line each;
  - readable;
  - reaction: +1 at every beat, B1 included with the ramped orbit;
  - cues and blank runs;
  - loudness: −14 LUFS, −3.2 dBTP;
  - A/V sync: 0 ms;
  - loop: 4 px differ.

### Checked and fine

- **End frames** (`review/r2/sheet-ends.png`). Every beat's last frame matches
  its `endFrame`:
  - B2: the 40 px star at (540, 268) and the 64 px pointer, tip at y 387;
  - B4: the compasses at y 1060, the left one a single 56 px up arrow, the
    right one down, right, up and left with the counterclockwise sweep 20°
    short;
  - B5 and B6: the halves at 70%;
  - B1, B3 and B7 as in round 1, with B7 matching f0.
- **Motion,** re-sampled every 2–10 frames through every beat and every 2–3
  frames at the boundaries and changed moves. Beyond what's in the table:
  - B6: the lean reaches 25° counterclockwise (Earth-side end below the line)
    on "비껴" and holds, with the halves still spinning inside the leaning
    outline, until "브레이크가". It then closes with the settle, and the red
    arrow shrinks with it, gone by f1240. The spin never reverses.
  - B5: the halves step back to 70% (2.8:1 and 2.3:1 on the ground) under a
    faint outline. The rugby shape and the yellow-toward-Earth marking both
    read, which answers the Claude critic's point 4.
  - B2: the pointer, now 64 px, still clears Earth at 6 o'clock by about
    21 px.
- **Still stretches** (under 100 changed pixels per frame, 0.8 s or longer):
  f99–132, f343–370, f524–555, f670–734 (r2#2), f761–803, f887–918,
  f1273–1307 and f1444–1466. None spans a new sentence without a cue.
- **Captions.** All 35 match the storyboard, unchanged from round 1.
- **Narration.** A fresh Whisper transcript of this render matches all 13
  sentences of the Read-aloud text. Only the pause after B4 changed.
- **Facts.** `verify.py` passes. The picture's claims are as in round 1. The
  larger lean (25°) still leads in the spin direction, as C11 and research's
  "Easy to misstate" require.
- **The shared changes.** Episode 001 uses none of the changed components or
  tokens (force strokes, sky tokens, sparkle, cruise). I re-rendered the same
  12 stills of 001 with today's studio, and they're byte-identical to round
  1's.

### What the brief should have told me

- **Where the caption rule lives.** The brief asks QA to judge line breaks,
  but the 2–4 eojeol limit sits in the storyboard agent's instructions and
  `validate-storyboard.py`. Had I known it, r1#8 would have come with its
  constraint.

## Round 1 · 2026-09-28

**Verdict: fix then ship.**

This round reviewed the first render, committed in c39ccc0 (storyboard at
c39ccc0, studio at c89d703). It runs 48.40 s (1452 frames), inside topic.md's
40–50 s target. c89d703 changed shared player code, so this is a full pass.

- **Nothing misleads.** Narration, captions and facts are clean. Every end
  frame matches its `endFrame`, and the last frame matches frame 0.
- **check-render:** 1 fail, 14 pass, 1 skip. The fail is the words check at
  "돌고", and it's the detector's miss, not a sync problem (r1#4).
- **Three minor issues are worth fixing before the final:**
  - every orbit starts and stops at full speed (r1#1);
  - B6's spin arc sweeps across the red pull arrow while the narration is on
    the pull (r1#2);
  - B4's arrows are the size of the smallest allowed glyph, and they carry
    the picture (r1#3).
- **The rest are nits.**

Evidence is in `review/r1/`:

- `sheet-ends.png`: f0 and every beat's last frame;
- `sheet-b7-f1312-1318.png`, `sheet-b6-f1125-1139.png` and
  `sheet-b4-f629-639.png`: motion strips;
- `f0554.png`, `f0718.png` and `f1309.png`.

### Issues

#### 1. Minor: every orbit starts and stops at full speed

All four orbit cues are linear from their first frame to their last. The Moon
goes from rest to full speed, or from full speed to rest, in one frame. I
measured the Moon's centroid per frame:

| Beat | Start | Stop |
|------|-------|------|
| B1 | f3 → f4: 0 → 11.7 px/frame | f77 → f78: 11.6 → 0 |
| B2 | f132 → f133: 0 → 8.9 | f321 → f322: 9.2 → 0 |
| B3 (both Moons) | f400 → f401: 0 → 6.9 | f523 → f524: 6.5 → 0 |
| B7 | f1315 → f1316: 0.3 → 12.2 | f1422 → f1423: 12.2 → 0 |

- **B7's start is the most visible** (`review/r1/sheet-b7-f1312-1318.png`).
  The pull-back eases the Moon to rest at f1315, and on the next frame it
  leaves at 12 px/frame. It reads as a stall, then a jolt.
- **The stops read as a thunk.** B1's and B2's at least land on a pulse
  ("뒷면도", "향하죠"). B7's stop at f1422 leads into the loop, and the loop
  snaps into motion again at f3.
- The storyboard's notes allowed for exactly this: "If a start or stop from
  rest jerks, production may round off its first and last ~0.15 s." It wasn't
  done.
- **Fix:** ease the first and last ~4–5 frames of each orbit and keep the
  linear middle, with the same end angles and frames. B1 still reacts within
  3 frames: the tags fade in at f3.
- This probably changes the orbit action in shared code, so the next round
  needs a full pass.

#### 2. Minor: B6's spin arc crosses the red pull arrow during "자기 쪽으로 당기니" (f1112–f1180)

- The purple spin arc runs at radius 128 around the Moon and turns with it.
  The red pull arrow reaches from the Earth-side tip, about 110 px from the
  center, up and left toward the dashed line.
- So every turn, the arc sweeps across the red arrow and the dashed line:
  - **f1127–f1139**, in the middle of "자기 쪽으로 당기니" (f1112–f1147). At
    f1127 the purple head sits right beside the red head; at f1129–f1133 the
    arc lies across the red shaft (`review/r1/sheet-b6-f1125-1139.png`).
  - **f1163–f1180**, during "브레이크가", more slowly.
- The red arrow is the only thing on screen that says "pulls". For its first
  second it shares the spot with a second arrow in another color.
- This can't be fixed with spacing alone: an arc outside the arrow's reach
  (radius ~170) would cross the x 940 bound on the right.
- **Fix:** dim the spin arrow (say to 0.35) from "자기" to "브레이크가", and
  bring it back to full for the settle. By the second crossing the red arrow
  is shrinking and the slowing arc is the point. Or draw the red arrow above
  the arc with a dark outline.

#### 3. Minor: B4's arrows are the size of the smallest glyph (f619–f718)

- B4's reading rests on arrows. The ghosts' pointers show up versus toward
  Earth. The compass shows one arrow versus four directions with a sweep
  ("별을 기준으로 보면 한 바퀴").
- Each pointer is about 27 px long with a 14–18 px head. Measured at f718:
  ghost1Top's pointer runs y 473–499. The compass copies are the same length.
  The whole right compass, sweep included, is 155 × 155 px (x 672–827,
  y 912–1067; `review/r1/f0718.png`).
- That's at the brief's 30 px floor for the smallest glyph, and these are the
  picture's point, not a footnote.
- There's room to grow: below the compasses, from y 1067 to 1250 (183 px),
  there are only faint stars, and each compass could double in width.
- **Fix:** bigger compasses: hub 24 → about 36, and copies about 50 px instead
  of each ghost pointer's length. That's a spec change, since Compass copies
  keep the pointer's own length. Optionally, longer ghost pointers too
  (minimum 28 → about 40 px).

#### 4. Tooling: the words check fails at "돌고" (46.48 s), but the detector missed its onset

Production's account is right. The narration is in sync; the onset rule
misses a word that starts quietly.

- **The audio, in 10 ms windows around 46.48 s:**

  | Time | Level | What it is |
  |------|-------|------------|
  | 46.43–46.49 | −74 to −81 dB, one −54 dB click at 46.45 | silence |
  | 46.50 | −36.6 dB, zero crossings 7200/s | a burst |
  | 46.51–46.57 | −37 to −41 dB, zero crossings ~1500/s, autocorrelation 0.3–0.45 | a voiced murmur (the ㄷ) |
  | 46.58 | −21 dB | the vowel |

- **So the word starts at 46.50, 20 ms after words.json's 46.48.** The vowel
  follows at +100 ms. Both are well inside the ±200 ms limit.
- The caption and the spin-arrow pulse come in at f1394. That's 1 frame
  before the sound and 3 before the vowel, so it's fine.
- **Why the detector misses it.** An onset needs a level crossing up through
  −35 dB with a dip to −55 dB in the previous 60 ms. The first −35 crossing is
  the vowel at 46.58, 90 ms after the last dip frame (46.49). The murmur never
  reaches −35.
- **Recommended change** (`check-render.mts` words block and
  `theme.ts` `checks.onset`):
  - keep the trigger (a −35 dB crossing);
  - look back 150 ms for the −55 dB dip instead of 60 ms;
  - date the onset at the first frame after the last dip frame, where sound
    starts, not at the crossing.
- **I replayed that rule on both renders' audio:**
  - 002: 23 of 23, "돌고" at +20 ms, widest "앞면이" at −50 ms;
  - 001: 21 of 21, widest "어떤" at +180 ms (+190 today);
  - the number of onsets is about the same: 56 → 56 for 002, 61 → 60 for 001.
- Lowering the trigger to −40 dB would also pass "돌고" here. But a fixed
  level just moves the edge to the next quiet consonant.
- **Until the rule changes,** accept this fail for this take.

#### 5. Nit: B4's right compass copies clump into a sparkle (f631–f633)

- The copies only translate: the top ghost's down arrow lands below the hub,
  the left ghost's right arrow lands to its right, and so on. So all four
  paths cross over the 6 o'clock ghost.
- At f631 they point inward at one spot, and at f632–f633 they merge into a
  white cross that looks like star1's sparkle. They fan out by f635, and the
  down arrow passes through the hub circle on its way (f635–f637;
  `review/r1/sheet-b4-f629-639.png`).
- It's 3–4 frames at speed. It reads as a flash, not as a wrong direction.
- **Fix (optional):** stagger the four slides by a few frames, or arc each path
  around the ghost.

#### 6. Nit: B3's panels sit high and leave the bottom 378 px empty (f385–f554)

- At B3's end the visual ink spans y 248–871 (`review/r1/f0554.png`), so its
  box is centered at y 560 against the zone's 745. From y 872 to 1250 the
  zone is empty for 5.6 s, until B4's compasses fill it.
- This is the same trade episode 001 made in its B3: one layout for two
  beats.
- Leave it, unless r1#3 moves the compasses anyway. Then the panels could
  come down a little too.

#### 7. Nit: the ghosts' halves are hard to tell apart (B3–B4)

- At 0.35 opacity a ghost's yellow half renders (61, 49, 31) and its teal
  half (10, 51, 51), on a (13, 16, 19) ground. That's 1.5:1 and 1.4:1 against
  the ground, and 1.08:1 between the halves: hue only (`review/r1/f0554.png`).
- In B4 the pointers carry the reading. In B3's hold (f523–f554), though, the
  ghosts are the only record of which way yellow faced at 9, 6 and 3 o'clock.
- They're readable at full size but faint on a phone.
- **Fix (optional):** ghost opacity 0.5, which puts the halves at about 2:1.
  The script asks for faint ghosts, so this is a matter of degree.

#### 8. Nit: one caption split separates "도는" from "것" (B4, f555–f606)

- The captions read "지구에선 안 도는" and then "것 같지만". The second
  flashes for 0.77 s as a fragment.
- "지구에선" / "안 도는 것 같지만" would keep the phrase whole. The second
  caption is about 440 px at 60 px, well under the widest caption's 631 px,
  so it fits on one line.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for byte:
**1 fail, 0 warn, 14 pass, 1 skip**.

- **words (fail):** see r1#4. It's a detector miss; accept it for this render.
- **labels (skip):** there are no edge labels in this episode.
- **Passes at or near a limit:**
  - bounds: ink x 144–935 against x 140–940. The rightmost ink is a star
    field's edge dot: the field puts its outermost dots on the region's edge
    at x 930 (B7, y 1216). That's by design.
  - centering: B5 is −9 px for all ink and −10 px for the picture (limit
    ±25). Everything else is within ±1.
- **Everything else passes:**
  - freshness;
  - technical: BT.709 TV range, 30 fps, 48 kHz, silent tail;
  - legibility: smallest glyph 39.6 px, the "1" in "자전 1바퀴";
  - overlaps;
  - captions: 35 on their cue, one line each;
  - readable;
  - reaction: +1 frame at every beat;
  - cues and blank runs;
  - loudness: −14 LUFS, −3.2 dBTP;
  - A/V sync: 0 ms;
  - loop: 6 px differ.

### Checked and fine

- **End frames** (`review/r1/sheet-ends.png`). Every beat's last frame matches
  its `endFrame`:
  - B1: moon1 at 12 o'clock (540, 545), yellow up with "앞면", teal toward
    Earth with "뒷면";
  - B2: the same, plus star1, the closed ring and the pointer up;
  - B3: two panels, left ghosts all yellow-up, right ghosts all yellow toward
    earth2;
  - B4: pointers up versus toward Earth, the one-arrow compass versus the
    four-way compass, and a counterclockwise sweep that stops 20° short;
  - B5: the 1.5 rugby ball on the line, with "지구 방향" and "과장";
  - B6: the axis on the line, yellow toward Earth, "옛날", and the spin arc at
    rest on the far side;
  - B7: matches f0.
- **Motion,** sampled every 2–8 frames through each beat and every 2–3
  frames at every boundary:
  - B1: the non-rotating Moon goes 6 → 3 → 12 o'clock with yellow held up;
    the side facing Earth slides from yellow to teal, with the pulse on
    "뒷면도".
  - B2: one orbit. The ring grows from the Earth-facing side and closes at
    f321, and the pointer grows on "별" and stays up.
  - B3: tags leave before the shrink (gone by f376), and the right panel
    fades in. Both Moons go counterclockwise together, and each ghost drops
    as its Moon passes. The locked Moon turns counterclockwise, the same way
    it orbits.
  - B4: exits, pointers, the Earth pulse on "도는", stars and the star1 pulse
    on "별을". The left copies land on one another, and the right sweep
    passes down, right, up, left.
  - B5: exits over 6 frames, then a zoom into the 3 o'clock ghost, the Earth
    line on "한", faint halves with the white outline, and a symmetric stretch
    (both bulges).
  - B6: the spin-up to about 0.78 turns/s. The tilt leads counterclockwise:
    the Earth-side end dips below the line, never the other way. The pull
    arrow points back toward the line. The settle slows over f1162–f1238 and
    is effectively at rest by about f1220. It ends exactly 7 turns after the
    spin-up (2520°), with no correction, and yellow lands toward Earth.
  - B7: pull-back, un-stretch and color return, then the orbit with yellow
    always toward Earth and the spin arc turning with the Moon. Stars and arc
    clear on the pause.
  - In the pull-back (f1300–f1315) the bodies sit about 130 px right of
    center until the orbit fades back in. It's brief and reads as a
    transition.
- **Still stretches** (under 100 changed pixels per frame, 0.8 s or longer):
  - f99–132 (1.1 s), f343–370, f524–555 and f873–903 (about 1 s each);
  - B4's end, f670–719 (1.7 s, including its 1 s pause);
  - B5's f746–788 (1.4 s, "딱 한 바퀴일까요?" over the zoomed pair);
  - B6's end, f1258–1292 (1.2 s);
  - B7's hold, f1429–1451.
  - None spans a new sentence without a cue.
- **Balance.** Every beat end is horizontally centered. Vertically, see r1#6.
- **Readability.**
  - "지구 방향" and "과장" in muted gray are 6.4:1 on the ground.
  - The red pull arrow is 5.2:1 and the purple arc 11:1.
  - White tags are 4.0:1 on the yellow half and 4.9:1 on teal, at 56 px.
  - "지구" is 6.4:1 on Earth.
  - Yellow and teal at full strength are easy to tell apart. For the ghosts,
    see r1#7.
- **Captions.** All 35 match the storyboard's text, one line each (one split
  is r1#8).
- **Narration.** Whisper large-v3-turbo on the render's audio matches all 13
  sentences of the Read-aloud text exactly, once punctuation is dropped.
- **Facts.** `verify.py` passes (exit 0). What the picture claims:
  - the non-rotating Moon keeps its heading and shows every side once per
    orbit (C4);
  - the locked Moon turns once per orbit, in the orbit's direction (C1, C2);
  - against the stars its pointer turns 360° counterclockwise: down → right →
    up → left;
  - the tidal shape is two equal bulges on the Earth line (C11);
  - the bulge leads in the spin direction while the Moon spins fast, and the
    pull is back toward the line (C11);
  - it spins down to a locked Moon, not to zero spin: B7 shows it still
    turning against the stars (C1, C12).
  - The only number on screen is the "1" in "자전 1바퀴".
- **The shared-code change (c89d703).** I rendered 12 frames of episode 001
  as stills in a scratch copy, once with the studio at c89d703^ and once at
  HEAD: all 9 beat ends, plus f200, f413 (the Mismatch overlap), f682 and
  f720. All 12 PNGs are byte-identical. This supports production's
  frame-identical claim.
- **Shorts UI.** All ink is inside x 144–935 and y 244–1233, and the captions
  are inside the caption zone.

### For the human

- **script.md's Visual lines are stale against the approved storyboard.**
  They say B1 starts at 3 o'clock and B3 splits top and bottom. The
  storyboard starts at 6 o'clock, so the loop matches, and puts the panels
  side by side. The video follows the storyboard, which you approved. This is
  housekeeping only.

### What the brief should have told me

- **How to spot-check a "frame-identical" claim.** 001's committed render.mp4
  predates later studio changes (its teal differs), so it can't be the
  baseline. What worked was rendering stills with `beat-stills.mts --clean
  --frames=…` twice, into scratch copies:
  - from `git archive <commit>^ studio`, with an `episodes/<slug>` beside it
    and `studio/public/episodes/<slug>/narration.mp3`;
  - from today's studio;
  - then comparing the PNGs byte for byte.
- **Motion checks.** check-render has no measure of starts and stops (r1#1),
  no vertical balance, and no still-run length. 001's review asked for the
  last one too. I measured all three by hand.
