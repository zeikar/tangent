# Render check · 005-hilbert-hotel

**Pass**: 0 fail, 1 warn, 14 pass, 1 skip · contact sheet `check/sheet.png`

| Check | Status | Summary |
|---|---|---|
| freshness | pass | render.mp4, cues.json and the studio code all match this storyboard.json |
| technical | pass | 1080×1920 yuv420p bt709 tv, 30 fps, 1346 frames (44.87 s); audio 48000 Hz, last 100 ms at -120 dBFS |
| bounds | pass | all 1346 frames inside x 140–940, visual ink below y 240 and above the caption band, captions in y 1280–1500; visual ink x 144–935, y 405–1106 |
| centering | pass | B1 +7/-8, B2 +7/-8, B3 -2/-1, B4 +3/-7, B5 +19/-20, B6 +18/-20, B7 +7/-8 (px off x 540: all ink / picture without edge labels; tolerance ±25) |
| legibility | pass | smallest glyph "1" 35.5 px in inf "1" (floor 30 px, 76 text items) |
| overlaps | pass | no text meets other text, lines, or a fill drawn over it (in or across elements); no entrance draws while an exit is still visible |
| labels | skip | no edge label has another element's line nearby |
| captions | pass | all 31 captions appear 0–0 frames after their cue (limit 3), on one line, inside the caption zone |
| readable | pass | every name and label stays fully visible at least 30 frames |
| reaction | pass | B1 —, B2 +1, B3 +1, B4 +1, B5 +1, B6 —, B7 — (frames from each beat's first word to the first visible change; — = no cue on that word; limit 3) |
| cues | warn | 2 cues show nothing within 5 frames of their word: B3 f415 finHops.setStyle none; B6 f1117 rowN.setStyle +6 |
| blank | pass | the visual zone is never empty for more than 3 frames in a row |
| loudness | pass | -14 LUFS integrated (target -14 ±1), true peak -3.3 dBTP (max -1), range 3.1 LU |
| av-sync | pass | render audio is 0 ms off against narration.mp3 (limit ±20 ms) |
| words | pass | 20 of 20 words after a pause start within 70 ms of an audible onset (widest "있어요." at 4.28 s, -70 ms); limit ±200 ms |
| loop | pass | 7 visual-zone pixels differ by more than 16 levels between the last and first frame (limit 500) |

**cues** (warn)

- `check/cues-1.png`: cues: B3 finHops.setStyle at f415
- `check/cues-2.png`: cues: B6 rowN.setStyle at f1117
