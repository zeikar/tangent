# Review · 001-a4-paper-ratio

**Verdict: fix then ship.**

The audio and the facts are clean. Every spoken word matches the 읽기용 script,
every caption shows the storyboard text and starts on its word, and every number
on screen checks out. The problems are all in the on-screen layout. One label
that the B4–B6 argument depends on can't be read on a phone. In three places, new
content draws over old content before the old content has gone. One transition
in B9 shows labels colliding for about a second. None of this needs a rework.

Frames are `review/fNNNN.png`, where NNNN is the 0-based frame number at 30 fps,
all extracted from `render.mp4`.

## Issues

### 1. The half's x/2 label is unreadable at phone size (B4–B6)

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

### 2. New content draws over old content at beat changes (B6→B7, B8→B9, B2→B3)

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

### 3. The moving A4 piece runs into the fading nest labels (B9, focusKept)

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

### 4. The "√2" label on rect sits against the half's edge (B6)

- **Where:** f848 (28.27 s) to f900. See `review/f0900.png`.
- **What:** when rect's right label changes from x to √2, it gets wider. It now
  spans x 490–567, and the half's yellow left edge starts at x 577. That is
  9 px from the half's edge and 27 px from rect's own edge, so √2 reads as a
  label on the half's left side, which has length 1. As "x", the label had
  plenty of room.
- **Fix:** leave more space between rect and half in B4 (move rect left or half
  right), or put rect's long-side label on its left.
- **Owner:** storyboard.

### 5. "A0 · 1 m²" is on screen for about 0.4 s, and the first cut runs through it (B9)

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

### 6. Loudness is −16.2 LUFS

- **What:** the render's audio measures −16.2 LUFS integrated, 3.8 LU loudness
  range, and −3.6 dBTP true peak (ffmpeg `ebur128`). YouTube turns loud audio
  down but doesn't turn quiet audio up, so this short will play about 2 dB
  quieter than one normalized to −14 LUFS.
- **Fix:** normalize to −14 LUFS with true peak at or below −1 dBTP. The
  +2.2 dB of gain fits: the peak lands at −1.4 dBTP.
- **Owner:** production.

### 7. Minor

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

## Checked and fine

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

## What this brief should have told me

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
