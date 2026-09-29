# Review · 003-mirror-left-right

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
