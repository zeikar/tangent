# Render check · 001-a4-paper-ratio

**Pass**: 0 fail, 3 warn, 13 pass, 0 skip · contact sheet `check/sheet.png`

| Check | Status | Summary |
|---|---|---|
| freshness | pass | render.mp4, cues.json and the studio code all match this storyboard.json |
| technical | pass | 1080×1920 yuv420p bt709 tv, 30 fps, 1532 frames (51.07 s); audio 48000 Hz, last 100 ms at -120 dBFS |
| bounds | pass | all 1532 frames inside x 140–940, visual ink below y 240 and above the caption band, captions in y 1280–1500; visual ink x 145–939, y 240–1254 |
| centering | pass | B1 0/0, B2 0/0, B3 +24/0, B4 +2/-18, B5 +3/-18, B6 +3/-18, B7 +10/0, B8 0/+1, B9 +1/0 (px off x 540: all ink / picture without edge labels; tolerance ±25) |
| legibility | pass | smallest glyph "r" 30.1 px in letter "Letter" (floor 30 px, 146 text items) |
| overlaps | warn | f442–444: half's lines cross rect "x" (while moving); f442–443: half's fill covers rect "x" (while moving) |
| labels | pass | every resting edge label sits at least 2.5× nearer its own edge than any other line; closest: rect "\sqrt{2}" 9 px from its edge, 51 px from half's |
| captions | pass | all 28 captions appear 0–0 frames after their cue (limit 3), on one line, inside the caption zone |
| readable | warn | 2 names or labels are fully visible for under 30 frames: a4 "A4" 6 frames (f0–5); letter "Letter" 15 frames (f172–186) |
| reaction | pass | B1 +2, B2 +1, B3 +1, B4 +1, B5 —, B6 +1, B7 +1, B8 +1, B9 +1 (frames from each beat's first word to the first visible change; — = no cue on that word; limit 3) |
| cues | warn | 2 cues show nothing within 5 frames of their word: B3 f375 rect.setStyle +6; B4 f504 half.setStyle none |
| blank | pass | the visual zone is never empty for more than 3 frames in a row |
| loudness | pass | -14 LUFS integrated (target -14 ±1), true peak -1.8 dBTP (max -1), range 3.8 LU |
| av-sync | pass | render audio is 0 ms off against narration.mp3 (limit ±20 ms) |
| words | pass | 23 of 23 words after a pause start within 90 ms of an audible onset (widest "딱" at 33.79 s, +90 ms); limit ±200 ms |
| loop | pass | 0 visual-zone pixels differ by more than 16 levels between the last and first frame (limit 500) |

**overlaps** (warn)

- `check/f0443.png`: overlaps: f442–444: half's lines cross rect "x" (while moving)
- `check/f0443.png`: overlaps: f442–443: half's fill covers rect "x" (while moving)

**readable** (warn)

- `check/f0003.png`: readable: a4 "A4" fully visible only 6 frames (f0–5)
- `check/f0179.png`: readable: letter "Letter" fully visible only 15 frames (f172–186)

**cues** (warn)

- `check/cues-1.png`: cues: B3 rect.setStyle at f375
- `check/cues-2.png`: cues: B4 half.setStyle at f504
