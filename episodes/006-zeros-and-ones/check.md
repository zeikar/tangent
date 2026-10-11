# Render check · 006-zeros-and-ones

**Pass**: 0 fail, 1 warn, 14 pass, 1 skip · contact sheet `check/sheet.png`

| Check | Status | Summary |
|---|---|---|
| freshness | pass | render.mp4, cues.json and the studio code all match this storyboard.json |
| technical | pass | 1080×1920 yuv420p bt709 tv, 30 fps, 1381 frames (46.03 s); audio 48000 Hz, last 100 ms at -120 dBFS |
| bounds | pass | all 1381 frames inside x 140–940, visual ink below y 240 and above the caption band, captions in y 1280–1500; visual ink x 144–935, y 256–1150 |
| centering | pass | B1 +1/0, B2 +1/0, B3 0/0, B4 0/0, B5 0/0, B6 0/0, B7 0/0, B8 0/0, B9 0/0, B10 +1/0, B11 +1/0 (px off x 540: all ink / picture without edge labels; tolerance ±25) |
| legibility | pass | smallest glyph "1" 33.9 px in counter "10진법" (floor 30 px, 60 text items) |
| overlaps | pass | no text meets other text, lines, or a fill drawn over it (in or across elements); no entrance draws while an exit is still visible |
| labels | skip | no edge label has another element's line nearby |
| captions | pass | all 27 captions appear 0–0 frames after their cue (limit 3), on one line, inside the caption zone |
| readable | pass | every name and label stays fully visible at least 30 frames |
| reaction | pass | B1 +1, B2 +2, B3 +1, B4 +1, B5 +1, B6 +0, B7 +0, B8 +2, B9 +1, B10 +1, B11 +1 (frames from each beat's first word to the first visible change; — = no cue on that word; limit 3) |
| cues | warn | 7 cues show nothing within 5 frames of their word: B4 f464 counter.color +7; B4 f491 counter.blink +9; B8 f891 counter.blink +9; B8 f928 seq.blink +6; B10 f1231 seq.blink +6; B11 f1301 seq.blink +6; B11 f1354 seq.blink +6 |
| blank | pass | the visual zone is never empty for more than 3 frames in a row |
| loudness | pass | -14.1 LUFS integrated (target -14 ±1), true peak -2.9 dBTP (max -1), range 2.4 LU |
| av-sync | pass | render audio is 0 ms off against narration.mp3 (limit ±20 ms) |
| words | pass | 29 of 29 words after a pause start within 80 ms of an audible onset (widest "사," at 1.1 s, -80 ms); limit ±200 ms |
| loop | pass | 11 visual-zone pixels differ by more than 16 levels between the last and first frame (limit 500) |

**cues** (warn)

- `check/cues-1.png`: cues: B4 counter.color at f464
- `check/cues-2.png`: cues: B4 counter.blink at f491
- `check/cues-3.png`: cues: B8 counter.blink at f891
