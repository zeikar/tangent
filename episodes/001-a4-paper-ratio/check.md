# Render check · 001-a4-paper-ratio

**Pass**: 0 fail, 2 warn, 9 pass, 0 skip · 10.1 s · contact sheet `check/sheet.png`

| Check | Status | Summary |
|---|---|---|
| freshness | warn | render.mp4 carries no storyboard hash (made before render.mts tagged renders); can't prove it matches |
| technical | pass | 1080×1920, 30 fps, 1532 frames (51.07 s), video + audio, last 100 ms at -120 dBFS |
| bounds | pass | all 1532 frames inside x 140–940, visual ink below y 240 and above the caption band, captions in y 1280–1500; visual ink x 152–939, y 240–1254 |
| centering | pass | B1 0, B2 0, B3 +24, B4 -9, B5 -10, B6 -9, B7 +9, B8 0, B9 +1 (px off x 540, tolerance ±25) |
| legibility | pass | smallest glyph "r" 30.1 px in letter "Letter" (floor 30 px, 145 text items) |
| overlaps | warn | f442–444: half's lines cross rect "x" (while moving) |
| reaction | pass | B1 +2, B2 +1, B3 +1, B4 +1, B5 —, B6 +1, B7 +1, B8 +1, B9 +1 (frames from each beat's first word to the first visible change; — = no cue on that word; limit 3) |
| loudness | pass | -14 LUFS integrated (target -14 ±1), true peak -1.9 dBTP (max -1), range 3.8 LU |
| av-sync | pass | render audio is 0 ms off against narration.mp3 (limit ±20 ms) |
| words | pass | 23 of 23 words after a pause start within 90 ms of an audible onset (widest "딱" at 33.79 s, +90 ms); limit ±200 ms |
| loop | pass | 0 visual-zone pixels differ by more than 16 levels between the last and first frame (limit 500) |

**overlaps** (warn)

- `check/f0443.png`: f442–444: half's lines cross rect "x" (while moving)
