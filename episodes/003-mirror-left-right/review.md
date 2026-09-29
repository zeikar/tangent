# Review · 003-mirror-left-right

## Round 4 · 2026-09-29

**Verdict: ship.**

This round reviewed the render from 438931b (studio at 86e048b). Only
`Camera.tsx` changed (plus its new test), and no storyboard or cues changed.
Camera is shared code, but only this episode uses it, and it acts only during
B5's push-in and B6's pull-back. So instead of a focused look, I compared
every frame against round 3's to prove nothing else moved. Then I re-judged
the two moves.

- **r3#1 is fixed.** Both camera moves now go straight in and straight out.
- **Nothing else moved.** Every frame outside the two moves matches round 3.
- **r3#2 is fixed.** script.md's B3 and B5 Visual lines now describe the
  render. Only those lines changed: no Read-aloud or Display text.
- **check-render passes:** 0 fail, 0 warn, 15 pass, 1 skip.
- **No issues are left.**

Evidence is in `review/r4/`:

- `sheet-b5-f742-969.png`: the push-in and the pull-back;
- `f0820.png`: the frame where round 3's top edge was gone.

### Round 3, re-checked

| Round 3 | Now |
|---------|-----|
| r3#1 the push-in bobs | **Fixed** (`review/r4/sheet-b5-f742-969.png`, `review/r4/f0820.png`). Every point now moves one way. The mirror's top edge stays in view the whole time: y 267–272 at f742, easing to 261–268 by f897, where round 3 hid it at f812–f832. The rings' top goes 300 → 312 without a rise (round 3: 297 → 280 → 312). The pair's feet go 1222 → 1179 and the rings' x extents widen steadily. The rings' left edge and top move in a fixed ratio (−7/+4 by f810, −21/+12 by f897), so the path is straight. The pull-back mirrors it: the top edge goes 261 → 272 over f949–f969 without leaving the frame, and the frame is back at rest (sides at x 157 and 922) by f971. The new `Camera.test.ts` passes (2 tests). |
| r3#2 script.md's Visual lines | **Fixed.** B3's line now says the up and right arrows go and only the purple pair stays. B5's describes me fading, the push-in on the pair, and a 1 s hold. The Read-aloud and Display lines are unchanged. |

### Nothing else moved

I extracted every frame of both renders the same way (`ffmpeg -q:v 3`) and
compared them:

- **f0–f711 and f1207–f1245 are byte-identical** (751 frames).
- **f712–f1206 differ, as they should.** The encoder re-encoded that stretch
  because the moves changed inside it.
- **Outside the moves (f712–f741 and f971–f1206)** the largest difference is
  1,476 pixels over 16 levels (f1095), and at most 0.18 levels on average.
  Every such frame is in motion (the ghost's walk, the purple pulse, the
  people fading at "그래서"), and the differences sit along the moving edges.
  That's encoder noise, not a drawing change. Still frames in that stretch
  differ by fewer than 100 pixels.
- **The moves' end states match round 3.** f897 and f948 (the pushed-in hold)
  differ from round 3 at under 30 pixels, and f971 on is back to encoder
  noise. Only the
  path between the ends changed.

check-render agrees:

- **Same as round 3:** reaction +1 everywhere, centering, loudness
  (−14.1 LUFS, −3.6 dBTP), words, and the loop (28 px).
- **One change, and it's the fix showing:** the ink's top is now y 260
  instead of 244, because the mirror's top edge no longer rises into the
  clip.

My `--out` run matched the tracked `check.md` and `check.json` byte for byte.

## Round 3 · 2026-09-29

**Verdict: ship.**

This round reviewed the render from c8396aa (studio at f2e0c8d): 41.53 s,
1246 frames, inside topic.md's 40–50 s target. f2e0c8d changes the player
(a Camera element that clips and transforms the whole picture), the probe
(clipping to the camera), and the caption format (`until`). So this is a full
pass.

- **The push-in works.** B5's zoomed pair reads at a glance, and B6's return
  is clean.
- **Round 2's two nits are resolved.** The storyboard note is fixed, and B5's
  long still is down from 3.1 s to 1.7 s.
- **The loop's end is caption-free.** The last caption clears as the speech
  ends, and frame 0's question follows.
- **check-render passes:** 0 fail, 0 warn, 15 pass, 1 skip.
- **What's left:** two nits.

Evidence is in `review/r3/`:

- `sheet-ends.png`: f0, every beat's last frame, and f1200/f1201 around the
  caption's clear;
- `sheet-b5-f736-948.png`: the push-in;
- `f0820.png` and `f0948.png`.

### Round 2, re-checked

| Round 2 | Now |
|---------|-----|
| r2#1 B5's end still for 3.1 s with 2.3 s of silence | **Resolved.** The push-in runs from "보면" (f742) to the pause (f897), so the picture moves through the rest of B5's speech. The still is now 1.73 s (f897–f949) over 1.76 s of silence. The longest still is B3's end: 2.53 s (f570–f646) with 1.64 s of silence, unchanged since round 2 and on purpose. |
| r2#2 stale "0.7 s of the 1.2 s pause" | **Fixed.** The note reads "0.7 s of the 1.5 s pause". It matches the render: the rise runs f1201–about f1219, then B1's frame holds, with no caption, until f1245. |

### Issues

#### 1. Nit: the push-in drifts up, then down, instead of moving straight in (f742–f897)

- **The cause.** `cameraState` interpolates the camera's `center` and `zoom`
  separately. So a point's screen position, which is HOME + zoom × (p −
  center), moves on a curve rather than a line.
- **Measured on screen:**
  - the mirror's top edge (drawn at y 270) rises from y 267–272 into the
    clip's top edge. It's hidden, or a 1 px sliver, from about f812 to f832
    (`review/r3/f0820.png`). It then slides back down to y 261–268 by f897;
  - the rings' top goes 297 → 280 (f810–f820) → 312;
  - the pull-back in B6 does the same in miniature: the top edge leaves at
    f957–f961 and comes back by f965.
- **Why it's only a nit.** The pair itself moves smoothly, and it's slow. But
  in a 5 s push-in, the frame's top edge vanishing for 0.7 s and sinking back
  reads as a gentle bob, not a straight approach. The storyboard's "the
  mirror's top edge still in view" holds only at the ends.
- **Fix:** interpolate the transform's translation (HOME − zoom × center)
  linearly alongside the zoom, rather than the center. Every point then moves
  in a straight line from its rest position to its pushed-in one. It's shared
  code, but nothing else uses Camera yet.

#### 2. Nit: script.md's Visual lines describe the old B3 and B5

- B3's line still says the up and right arrows stay "흐리게 그대로". The
  render clears them on "뒤집히는".
- B5's line says "(hold 1.5 s)", with no push-in and me still present. The
  render fades me out, pushes in and holds 1.0 s.
- The storyboard owns the picture now, so nothing on screen is wrong. But a
  later reader of script.md (the publish agent, a re-storyboard) would get the
  old picture.
- **Fix:** update those two Visual lines to match, or leave them if script.md
  is meant to stay as approved.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for byte:
**0 fail, 0 warn, 15 pass, 1 skip** (labels: no edge label has another
element's line nearby).

- **Passes at or near a limit:**
  - bounds: the ink now spans x 144–935 and y 244–1247, the camera's clip
    (x 144–936, y 244–1246) plus a pixel of ringing. The pushed-in frames fill
    the clip with the glass.
  - words: the widest is "늘," at −50 ms.
- **Everything else passes:**
  - reaction: every beat at +1, B3 included now that its first word is an
    exit (it was +3);
  - freshness;
  - technical: BT.709 TV range, 30 fps, 48 kHz, silent tail;
  - centering: within 2 px at every beat end, B5's pushed-in end included;
  - legibility: 41.4 px;
  - overlaps;
  - captions: 24 on their cue, one line each;
  - readable;
  - cues and blank runs;
  - loudness: −14.1 LUFS, −3.6 dBTP;
  - A/V sync: 0 ms;
  - loop: 28 px differ.

### Checked and fine

- **B5 pushed in** (`review/r3/f0948.png`).
  - The two raised hands are now 82 × 103 px (48 × 60 at rest). The
    reflection's thumb is on the screen left, the ghost's on the screen right,
    and the palm lines show on both.
  - The rings are 8 px strokes (5 × 1.6). The dashed outline scales to about
    6 px with longer dashes and still reads as dashed. Heads are level and
    feet are at y 1175–1177.
  - The pair spans x 165–910 around x 537.
  - I fade out on "보면" (f742–about f760), so at the end only the two in the
    mirror remain.
  - The glass fills the clip and meets the background there with a hard edge
    on three sides, 9 levels lighter (23, 26, 31 on 14, 18, 21). It reads as
    the mirror seen close, not as a box.
  - Scaling the strokes 1.6× looks right. Nothing is thicker than the mirror's
    own frame, which becomes a 9.6 px top edge.
- **B6's return** (f949–f969). The ghost and rings exit, the camera pulls back
  in 0.67 s, and I fade back in. The mirror frame is fully back by f969: from
  f970 its edges sit exactly where they do in B1 (sides at x 157 and 922, top
  at y 267–272). The only blemish is
  r3#1's brief dip of the top edge.
- **The caption `until`.**
  - "호수에 비친 산처럼요." shows from f1162 to f1200 and is gone at f1201.
  - The render's audio drops from −36 dB at 40.00 s to −65 dB at 40.05 s, so
    the caption clears as the voice ends. words.json's end of "산처럼요."
    (40.32 s) is the aligner's padding; nothing is audible after 40.05 s.
  - f1201–f1245 carry no caption, and f0 brings the question back.
- **B3 without the teal arrows.** They exit on "뒤집히는" (f421–f428). B1's
  plain scene then carries "앞뒤예요" with the hand pulses (f450), and the
  purple pair grows as before. The end frame matches its new `endFrame`.
- **End frames** (`review/r3/sheet-ends.png`). Every beat's last frame matches
  its `endFrame`, including B5's pushed-in one and B6's, which is identical
  to f0 with no caption.
- **Motion,** sampled every 2–10 frames through every beat and boundary, and
  frame by frame at the loop's rise:
  - the reflection stays inside the glass from f1207 on;
  - the turn and walk-in are unchanged from round 2.

  A frame-by-frame scan found no single-frame glitches.
- **The camera's clip at rest.** It trims my bust from y 1250 to y 1246 in
  every mirror-scene frame, which isn't visible because the cut was already a
  hard edge. The mirror frame (x 157–922, y 267–1223) sits inside the clip.
- **Narration.** A fresh Whisper transcript matches all 12 sentences of
  script.md word for word ("서보면" aside). No text is invented over the tail
  this time: it peaks at −65 dB after 40.3 s.
- **Captions.** All 24 match the storyboard on one line.
- **Facts.** `verify.py` passes. There are no numbers or words in the picture.
  - research.md's Easy to misstate holds as in round 2: the mirror hand stays
    on the screen right with a palm, the lake shows scenery only, and there's
    no perception claim beyond "이렇게 비교하면".
  - The push-in shows only the two figures whose comparison the words
    describe, so nothing new is claimed.
- **Shared changes.** The player applies the camera only when the storyboard
  has a Camera element, and the probe clips only under `data-clip`.
  resolveCaptions gives a caption without `until` the same end as before. So
  001 and 002 should render as they did. I didn't re-render them.

### What these instructions should have said

- **Where a caption or cue really ends.** words.json's `end` can run 0.3 s
  past the audible end (here "산처럼요."). A check of when a caption clears,
  or of a cue on a word's end, should measure the audio level, not trust the
  aligner.

## Round 2 · 2026-09-29

**Verdict: ship.**

This round reviewed the render from dff1c3f (studio at d0366a8): 42.03 s,
1261 frames, inside topic.md's 40–50 s target. The script dropped B4 and the
take is now take5. The fix round also changed shared code (Person's `inside`
and `beneath`, Mirror's glass state, the probe skipping clipPath shapes) and
the global `figure.hair` token. So this is a full pass, not a diff review.

- **Round 1's fixes hold.** r1#1, r1#4 and r1#6 are fixed. r1#2, r1#3 and
  r1#5 went away with B4 and take3.
- **The new narration and captions are clean.** Whisper hears take5 word for
  word against script.md, and all 24 captions match the storyboard.
- **check-render passes:** 0 fail, 0 warn, 15 pass, 1 skip.
- **What's left:** two nits, neither of which misleads or hides anything.

Evidence is in `review/r2/`:

- `sheet-ends.png`: f0 and every beat's last frame;
- `sheet-b5-f665-714.png`: the turn, cropped to the lower half of the mirror;
- `f0694.png`, `f0706.png` and `f1227.png`.

### Round 1, re-checked

| Round 1 | Now |
|---------|-----|
| r1#1 B5's turn reads as one solid person | **Fixed** (`review/r2/sheet-b5-f665-714.png`, `review/r2/f0694.png`). I dim on "내가" (f667, faint by f673). The ghost turns over me (f674–f698) with its dashed outline visible all the way round: head, shoulders, arms, body. It reads as its own figure, with a faint me and a navy hand behind it. The band across its eyes is gone. Down the head's center the ghost's hair measures (83, 86, 93), the eye row (46, 49, 54) and the lower face (53, 58, 61). The 7-level step is invisible, so the head reads as a light cap over a dark face. The ghost's hand now passes behind the reflection's leg rather than over it (`review/r2/f0706.png`), with at most about a fifth of it hidden (f692–f712). That reads as walking past behind, and I'd leave it. The move (f698–f737) glides cleanly over the faint me. |
| r1#2 B4's hands pop in | **Gone** with B4. |
| r1#3 "바닥에 눕히면" heard as "높이면" | **Gone.** Whisper hears take5 in the render as "그래서 바닥에 눕히면 위아래가 뒤집혀요", every word at 0.9 confidence or more. |
| r1#4 the mirror person outside the glass in the loop's rise | **Fixed** (`review/r2/f1227.png`). The person is clipped to the live glass, so the rising glass reveals it like a window. From f1222 (glass top at y 668) on, no ink shows above the glass's top edge. The only ink above it, at f1216–f1221, is the fading mountain. |
| r1#5 B4 still for 5.2 s | **Gone** with B4. The longest still is now B5's end (r2#1). |
| r1#6 hair nearly the glass's color | **Fixed.** The hair now measures (51, 56, 59) against glass at (23, 26, 31), 1.47:1, and 1.48:1 under the body gray. Both heads read as a filled cap. Between round 1's f0 and this one, only the two heads changed (16,644 px, all but 10 inside the two head boxes). |

### Issues

#### 1. Nit, for the human: B5's end is still for 3.1 s, including 2.3 s of silence (f870–f964, 29.0–32.1 s)

- After the rings pulse on "좌우가" (f855, done by f870), nothing moves until
  B6 starts at f964.
- The narration is silent from 29.88 to 32.14 s (f896–f964). The storyboard
  asks for a 1.5 s hold, and take5's own gap adds the rest.
- It's the longest still and the longest silence in the video. The next are
  B3's end: a 1.64 s silence (f596–f646) inside a 2.6 s still (f571–f648).
- The hold is on purpose: the cut critique asked for time on the pair side by
  side. Whether 2.3 s reads as room to see the two raised hands or as a dead
  spot is a feel call.
- **If it feels long:** shorten the hold to 1.0 s, or pulse both rings once
  mid-hold (around f930).

#### 2. Nit: a stale number in the storyboard's B6 note

- The pause cue for the mirror's rise still says "(0.7 s of the 1.2 s
  pause)". The pause is now 1.5 s.
- The rise takes 0.7 s (f1216 to about f1237). B1's frame then holds still
  for 0.77 s (f1238–f1260) before the loop.
- It's text only, with nothing to fix on screen.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for byte:
**0 fail, 0 warn, 15 pass, 1 skip** (labels: no edge label has another
element's line nearby).

- **Passes at or near a limit:**
  - reaction: B3 is +3 frames, right at the limit. The linear dim on
    "뒤집히는" (f421) first shows at f424; round 1 had +2. It passes, but
    with no margin if the take's timing moves again;
  - bounds: the leftmost ink is x 151, the rightmost x 927, and the bottom
    y 1255 (my bust's cut);
  - words: the widest is "늘," at −50 ms.
- **Everything else passes:**
  - freshness;
  - technical: BT.709 TV range, 30 fps, 48 kHz, silent tail;
  - centering: within 2 px at every beat end;
  - legibility: 41.4 px;
  - overlaps;
  - captions: 24 on their cue, one line each;
  - readable;
  - cues and blank runs;
  - loudness: −14.1 LUFS, −3.6 dBTP;
  - A/V sync: 0 ms;
  - loop: 29 px differ.

### Checked and fine

- **End frames** (`review/r2/sheet-ends.png`). Every beat's last frame matches
  its `endFrame`:
  - B1: the mirror scene, no arrows;
  - B2: the four teal arrows;
  - B3: the teal arrows at 0.35 and the purple pair, held through the 1 s
    pause;
  - B5: the ghost beside the person in the mirror with a red ring on each
    raised hand, and me at 0.3. The mirror frame's bottom edge shows through
    my faint bust, as it should at that opacity;
  - B6: identical to f0.
- **Motion,** sampled every 2–3 frames at every beat boundary and every move,
  and frame by frame through B5's turn and the loop's rise:
  - B1's glint and pulses on the new cue words ("좌우는" pulses my hand at f90,
    "바뀌어" the mirror hand at f106);
  - B2's arrows;
  - B3's dimming and the purple pair's growth;
  - B5's opening on "그런데" (the arrows exit and the purple pair hides by
    f655);
  - B6's return to full (f964–f970);
  - B6's tilt, now starting on "그래서" (f1089) as the people fade. They're
    faint by f1097–f1099, when the glass top is at y 285–333. The person
    in the mirror is clipped to the glass, so nothing shows outside it;
  - the shore on "눕히면" (f1112), 22 frames before its caption;
  - the unfold and the rise.

  A frame-by-frame scan found no single-frame glitches.
- **Narration.** A fresh Whisper transcript of the render matches all 12
  sentences of script.md's Read-aloud text. It differs only in "서보면" for
  "서 보면" and in punctuation. After 40.5 s it repeats "호수에 비친 산처럼요"
  several times. That's Whisper inventing text over the silent loop tail: the
  audio after 40.6 s peaks at −60 dB, and the last word ends at 40.82 s.
- **Captions.** All 24 match the storyboard on one line, with B6's re-chunked
  three ("거울이 뒤집는 건" / "늘 거울로 들어가는" / "방향 하나예요.").
  Frame 0 still shows the whole question, "왜 위아래는 안 뒤집을까요?".
- **Facts.** `verify.py` passes. There are no numbers on screen.
  - **The new hook line.** "좌우는 바뀌어 보이는데요" states how it looks,
    not that the mirror swaps. B2 answers it ("사실 … 좌우도 안 뒤집혀요").
    It doesn't say everyone sees it that way (research.md's C7 warning).
  - **The handedness step is gone.** With it went the only shape claim (C3),
    and nothing now implies the mirror changes nothing. B3 says front-back
    flips, and B6 says it flips the one direction into the mirror.
  - **The lake is still symmetric** about y 744.5. The purple arrows span
    y 303–409 and 1080–1188, the teal ones 551–568 and 921–938, and the tree
    stays on the right.
- **research.md's Easy to misstate.**
  - The mirror person's raised hand stays on the screen right, showing a palm,
    in every mirror-scene frame. Clipping it to the glass cuts nothing at rest
    (the hand's top is at y 316, the glass's inner edge at y 273).
  - The ghost's hand is the mirror image of the reflection's.
  - There's no text in the picture at all now, so nothing can label the
    mirror hand 오른손.
  - The lake shows scenery only.
  - The only perception line is still "이렇게 비교하면, 좌우가 바뀐 것처럼
    보이죠".
- **Shared changes.**
  - Only Person draws a `<mask>` or `<clipPath>` (grep of `studio/src`), so
    the probe's clipPath skip can't change what 001 or 002 are checked
    against.
  - `figure.hair` is read only by Person.
  - Mirror's state refactor draws the same frame and glass: f0's only changed
    pixels are the heads.
  - 001 and 002 use none of these. I didn't re-render them.

### What these instructions should have said

- **Whisper over a silent tail.** The brief warns that Whisper invents text
  over silence. It could add the quick test: measure the level after the last
  word in words.json (here −60 dB peak), so a repeated line at the end isn't
  mistaken for a doubled take.

## Round 1 · 2026-09-29

**Verdict: fix then ship.**

This round reviewed the first render, committed in be671eb (storyboard at
be671eb, studio at 9d1234a). It runs 45.27 s (1358 frames), inside topic.md's
40–50 s target. 9d1234a adds six components and changes shared code (the
StoryboardPlayer registry, theme blocks, Polyline's dash, and the probe
skipping masked shapes), so this is a full pass.

- **Nothing states a fact wrong.** The person in the mirror never reads as me
  turned around. Nothing labels the mirror hand 오른손. The lake shows only
  scenery. No line says why we perceive a swap.
- **check-render:** 0 fail, 0 warn, 15 pass, 1 skip.
- **One issue to fix:** B5's turn in place. For about half a second it reads
  as one solid person raising both hands, with a dark band across its eyes
  (r1#1).
- **Minor:** B4's big hands pop in instead of flying out of the two raised
  hands (r1#2).
- **For the human's ear:** "바닥에 눕히면" may sound like "바닥이 높이면"
  (r1#3).
- **The rest are nits.**

Evidence is in `review/r1/`:

- `sheet-ends.png`: f0 and every beat's last frame;
- `sheet-b5-f811-843.png`: the turn, cropped to the lower half of the mirror;
- `f0592.png`, `f0600.png`, `f0825.png` and `f1331.png`.

### Issues

#### 1. Fix: B5's turn reads as one solid person with both hands up and a masked face (f819–f843, 27.3–28.1 s)

The dashed ghost turns exactly over me (f806–f829, on "돌아서서"), then rises
into the mirror (f829–f868). While it's over me (`review/r1/f0825.png`,
`review/r1/sheet-b5-f811-843.png`):

- **Its dashed outline disappears into mine.** It shows only along the raised
  arm. Everywhere else it lies on my solid outline.
- **So it reads as one solid figure.** From the turn's midpoint (f818) until
  the heads separate (about f835), the ghost's eyes and mouth sit on my solid
  head. My blue hand stays up on the right, and the ghost's yellow palm comes
  up on the left. It looks like one solid person facing us with both hands
  raised: a palm on the left, a back of the hand on the right.
- **The face looks masked.** My hair (figure.hair, 0.15 muted, opaque)
  covers the top two thirds of the head. The ghost's hair (ghostHair, 0.4)
  covers only the top third, over a 0.15 body. So a dark band of my hair runs
  across the ghost's eyes, between its lighter hair and my gray lower third.
- **The ghost's hand crosses the reflection's feet.** From f821 to about f843,
  the ghost's yellow hand (about x 365–470, y 770–905) is drawn over the lower
  end of the reflection's leg on the screen right (legs end at y 838, x about
  320–400).
- **The ghost then slides over me.** From f844 to f853 its body passes over my
  head and raised arm. That part reads as a ghost gliding upward and is
  acceptable on its own.

**Why it matters:** B5's point is that only the raised hand differs. For about
half a second, on "내가 돌아서서", the screen shows a figure that has both
hands up and is neither me nor the ghost. The end frame (f1080) is right.

**Fix:** let the ghost read as its own figure while it turns. For example:

- dim me (setStyle opacity about 0.3) from "내가" until the ghost has left me,
  and restore me on "나란히";
- or start the ghost a little up and left of me, so it turns over the glass
  rather than over my body.

Either way:

- keep the ghost's hand off the reflection's legs on its way up;
- make sure no dark band shows across the ghost's eyes. That could mean
  giving the ghost's head an opaque fill while it overlaps me, or matching
  its hair share to mine.

A Person or theme change is shared code, so the next round needs a full pass.

#### 2. Minor: B4's big hands pop in instead of flying out of the raised hands (f599–f603, 20.0 s)

The storyboard says each big hand "grows out of" its person's raised hand.
Measured per frame (yellow / blue height in px):

| f597 | f599 | f600 | f601 | f603 | f606 |
|---|---|---|---|---|---|
| 64 / 140 | 60 / 136 | 240 / 281 | 338 / 359 | 415 / 420 | 441 / 442 |

- **The whole flight takes about one frame.** The appear waits for the arrows'
  0.2 s exits (f593–f599). By then the scene is at about a fifth of its
  opacity: the small yellow hand has 651 pixels left at f599, against 2200 at
  f597. The grow is `fast` with ease.out, so half of it happens between f599
  and f600, and 90% is done by f603.
- **So the link from small hands to big hands is one frame** (`review/r1/f0600.png`).
  It reads as a cut to two big hands. The colors (a yellow palm, a blue back)
  still tie them to the two people, so nothing is lost in meaning, only the
  "떼어" gesture.
- **Fix:** start the grow with the fade on "자리는" rather than after the
  exits, and ease it smooth at base speed (about 0.5 s), so the hands visibly
  travel from (432, 348) and (741, 838). The thumb pulse on "그대로지만"
  (f604) would then come after the landing, or with it.

#### 3. For the human's ear: "바닥에 눕히면" may sound like "바닥이 높이면" (40.24–40.96 s, f1207–f1229)

- **Whisper hears "높이면".** The Whisper transcript of the render reads
  "그래서 바닥이 높이면 위아래가 뒤집혀요". Transcribing that clip alone gives
  the same result, and so does the raw take3.wav at 1.0×. The confidence is
  0.83 on "바닥이" and 0.85 on "높이면".
- **Another take is heard correctly.** Take1 of the same sentence, with the
  same model, comes out as "바닥에 눕히면". So it's likely the voice in take3,
  not Whisper's bias. Whisper tends to favor the likelier phrase, and "바닥이
  높이면" isn't one.
- **Every other sentence matches the Read-aloud text.** The only other
  differences are punctuation and spacing ("되는데요?", "서보면", "보이죠?").
- **The caption is right.** "그래서 바닥에 눕히면" shows from f1196, so a viewer
  reading along gets the right word.
- **Worth one listen at 40.2 s.** If it sounds like 높이면, the fix is the take:
  retake that line, or splice "바닥에 눕히면" from another take. The script
  doesn't change.

#### 4. Nit: in the loop's rise the person in the mirror shows outside the glass (f1328–f1334, 44.3–44.5 s)

- The people fade back in over the same 0.7 s as the mirror stands up. The
  glass's top edge is below the reflection's head (y 382) until f1333, and
  below its raised hand (y 316) until f1334.
- Meanwhile the reflection's head has faded in from about 25% to 80% of its
  final brightness. So for about 6 frames, a "person in the mirror" floats
  above the mirror (`review/r1/f1331.png`).
- It's short, silent, and on the loop, but it breaks the one rule the scene
  keeps: the reflection is always inside the glass.
- **Fix:** start the reflection's restore once the glass's top edge passes
  y 316 (about f1334), or clip it to the glass while the glass is tilting. Me
  from behind can keep its timing, since I stand in front of the glass.

#### 5. Nit, for the human: B4 is still for 5.2 s after its second word (f644–f800, 21.5–26.7 s)

- After the "모양은" pulse ends (f644), the only change in B4 is the 5-frame
  fade-in of '왼손' at f730.
- f644–f730 (2.9 s) runs under "앞뒤만 뒤집혀도, 거울 속 손은" with nothing
  on screen answering it. f735–f800 (2.2 s) covers "왼손 모양이 되거든요" and
  the 0.6 s pause.
- It's the longest still in the video. The next longest are B5's end
  (f1003–f1081, 2.6 s, including its 1 s pause) and B2's "내가 오른쪽으로"
  stretch (f215–f275, 2.0 s).
- **If it feels long:** pulse bigHandRefl on "거울" (f704, "거울 속 손은").
  That points at the hand about to be named, before its label comes up.

#### 6. Nit: the hair is nearly the color of the glass (every mirror-scene frame)

- Hair is 0.15 muted: (32, 37, 40) over glass at (23, 26, 31), about 1.2:1.
- My head from behind reads as a white circle whose top two thirds are the
  glass, with a gray band below (`review/r1/sheet-ends.png`, f0). The
  reflection's top third looks the same.
- It still reads as the back of a head, because it has no face next to one
  that does. But it looks more like a hollow circle than hair.
- **Optional:** a hair value clearly apart from the glass, darker or lighter.
  That would also help r1#1's band.

### Production's first-look flags

- **B3's purple arrows, into and out of the mirror: fine as is**
  (`review/r1/f0592.png`).
  - The two arrows lie on one line through my hand and the mirrored hand, and
    point at each other. That matches "거울을 향하는데 / 나를 향하죠".
  - The depth cue is the line toward the smaller figure and the heads: 25 vs
    18 px on frontMe, 14 vs 22 px on frontRefl.
  - The shaft taper doesn't show. It measures 6.0 → 5.1 px along frontMe and
    4.0 → 5.5 px along frontRefl.
  - So a purely flat reading ("up-left" against "down-right") is possible.
    The words steer away from it, and nothing on screen contradicts B2.
- **B5's turn: r1#1.**
- **The loop's rise: r1#4.** I count 6 frames, not 5.
- **B4's hand flight: r1#2.**
- **Yellow reading as ochre: fine.**
  - The palm fill is #FEB251 at 0.6 over the background, so #9a713b, a tan
    that reads as skin. That helps "palm". The stroke is full #FEB251.
  - Against the back of the hand's #3a559a, it differs in both hue and
    lightness at every size.
  - No word on screen names the color.

### check-render

My `--out` run matched the tracked `check.md` and `check.json` byte for byte:
**0 fail, 0 warn, 15 pass, 1 skip** (labels: no edge label has another
element's line nearby).

- **Passes at or near a limit:**
  - bounds: the rightmost ink is x 927, the leftmost x 152, and the bottom
    y 1255 (my bust's cut at y 1250, plus antialiasing);
  - words: the widest is "앞뒤예요." at −50 ms;
  - reaction: B3 and B4 react at +2 frames against the limit of 3.
- **Everything else passes:**
  - freshness;
  - technical: BT.709 TV range, 30 fps, 48 kHz, silent tail;
  - centering: within 2 px at every beat end;
  - legibility: the smallest glyph is 41.4 px;
  - overlaps: text only (see below);
  - captions: all 29 on their cue, one line each;
  - readable;
  - cues and blank runs;
  - loudness: −14.1 LUFS, −2.6 dBTP;
  - A/V sync: 0 ms;
  - loop: 20 px differ.

### Checked and fine

- **End frames** (`review/r1/sheet-ends.png`). Every beat's last frame matches
  its `endFrame`:
  - B1: the mirror scene, both thumbs on the screen left, no arrows;
  - B2: four teal arrows, up above each head and right at each raised-hand
    shoulder;
  - B3: the teal arrows at 0.35 and the purple pair on one line;
  - B4: only the two big hands, the same outline, with '왼손' under the palm;
  - B5: the ghost beside the person in the mirror, heads level, a red ring on
    each raised hand;
  - B6: identical to f0.
- **Motion,** sampled every 2–3 frames at every beat boundary and every move,
  and frame by frame through B4's grow, B5's turn and the loop's rise:
  - the B1 glint and the head and hand pulses read as highlights;
  - arrows grow from their tails. B3's purple pair eases out, so frontMe is
    90% grown by f467 and frontRefl by f520, well before their `until` words.
    That's fine: each grows while its own clause is spoken;
  - B3's dimming shows by f393;
  - B5's rings draw on clockwise;
  - B6's tilt reads as tipping back, with the top edge shorter mid-tilt
    (f1222), not as squashing;
  - the reflection unfolds down out of the line.

  A frame-by-frame scan found no single-frame glitches.
- **Facts.**
  - `verify.py` passes (C1–C4, C7, C8, C10–C14). There are no numbers on
    screen.
  - The mirror geometry holds: the person in the mirror is me scaled by 0.447
    about (182, −49). The head (580, 1000) maps to (360, 420), and the hand
    (741, 838) to (432, 348).
  - The lake is symmetric about the line's center (y 744.5). The purple up
    arrow (y 303–409) mirrors the down arrow (1080–1188), and the teal right
    arrows sit at 551–568 and 921–938. The tree is on the right above and
    below.
- **research.md's Easy to misstate:**
  - In every mirror-scene frame, the raised hand of the person in the mirror
    is on the screen right of its body (x 406–457), showing a palm. Both B1
    thumbs are on the screen left.
  - The ghost's hand is the exact mirror image of the reflection's (thumb on
    the screen right, f1080), as me turned around should be.
  - The big hands are right too: a palm with the thumb on the left is a left
    hand facing out, and a back with the thumb on the left is a right hand
    seen from behind.
  - The only word in the picture is '왼손'. The "오른손은" pulse (f83) goes to
    my hand and "왼손이" (f99) to the mirror hand.
  - The lake has a mountain and a tree only.
  - The only perception line is "이렇게 비교하면, 좌우가 바뀐 것처럼 보이죠".
- **Captions.** All 29 match the storyboard's text on one line. Frame 0 shows
  the whole question, "왜 위아래는 안 뒤집을까요?", over the mirror while
  take3 says "거울은 왜 …" (0.1–2.5 s), as approved in checkpoints.md.
- **Readability.**
  - Captions are 60 px bold, and '왼손' is a 56 px label.
  - Red rings on amber hands, and purple next to teal in B6, are all easy to
    tell apart.
  - The dimmed teal arrows in B3 are about 2:1 on the glass, faint as "흐리게
    그대로" intends.
  - The mirror-size hands (48 × 60 px) tell palm from back by color. Their
    palm lines only show in B4.
- **Balance.** The mirror fills the zone. B4's hands span x 153–503 and
  576–923 with '왼손' centered under the palm. B6's lake sits on the zone's
  middle (ink y 300–1190).
- **Shared changes.** The probe change drops only shapes inside `<mask>`
  definitions, which draw nothing. Bounds, blank and loop measure pixels, so
  it can't hide drawn ink. The theme change adds new blocks and a `stroke.hand`
  token and only extends a comment on `stroke.arrow`. No existing token's
  value changed, and Polyline without a dash draws as before. So 001 and 002
  should be unaffected. I didn't re-render their stills to prove it.

### What these instructions should have said

- **How to tell a TTS slip from a Whisper slip.** Transcribe another take of
  the same text with the same model. Here take1 came out "눕히면" and take3
  "높이면", which is what makes r1#3 worth a listen.
- **Figure-on-figure collisions are QA's.** check-render's overlaps check
  covers text only. Shapes crossing shapes during moves (r1#1's hand over the
  reflection's feet) are left to the eye. The brief could say so under "judge
  what it can't".
- **Long stills under narration.** Nothing checks them, and a per-frame
  still-run scan is cheap. r1#5 came from one.
