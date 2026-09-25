# Render check · 001-a4-paper-ratio

**Fail**: 1 fail, 1 warn, 14 pass, 0 skip · contact sheet `check/sheet.png`

| Check | Status | Summary |
|---|---|---|
| freshness | pass | render.mp4, cues.json and the studio code all match this storyboard.json |
| technical | pass | 1080×1920 yuv420p bt709 tv, 30 fps, 1248 frames (41.60 s); audio 48000 Hz, last 100 ms at -120 dBFS |
| bounds | pass | all 1248 frames inside x 140–940, visual ink below y 240 and above the caption band, captions in y 1280–1500; visual ink x 145–935, y 264–1174 |
| centering | pass | B1 -1/0, B2 0/0, B3 0/0, B4 -9/-9, B5 +11/-9, B6 +12/-11, B7 +13/-11, B8 +13/-10, B9 0/+0, B10 0/0, B11 0/0 (px off x 540: all ink / picture without edge labels; tolerance ±25) |
| legibility | pass | smallest glyph "m" 31 px in dim210 "210\,\mathrm{mm}" (floor 30 px, 55 text items) |
| overlaps | pass | no text meets other text, lines, or a fill drawn over it (in or across elements); no entrance draws while an exit is still visible |
| labels | pass | every resting edge label sits at least 2.5× nearer its own edge than any other line; closest: sheet "x" 12 px from its edge, 35 px from half's |
| captions | pass | all 25 captions appear 0–0 frames after their cue (limit 3), on one line, inside the caption zone |
| readable | warn | 2 names or labels are fully visible for under 30 frames: letterHalf2 "레터" 12 frames (f1236–1247); page "A4" 18 frames (f1230–1247) |
| reaction | pass | B1 +1, B2 +1, B3 +1, B4 +1, B5 +1, B6 +2, B7 +1, B8 +1, B9 +1, B10 +1, B11 +1 (frames from each beat's first word to the first visible change; — = no cue on that word; limit 3) |
| cues | pass | every cue after a beat's first word shows a change within 5 frames |
| blank | pass | the visual zone is never empty for more than 3 frames in a row |
| loudness | pass | -14.1 LUFS integrated (target -14 ±1), true peak -2.1 dBTP (max -1), range 3.5 LU |
| av-sync | pass | render audio is 0 ms off against narration.mp3 (limit ±20 ms) |
| words | fail | 21 of 22 words after a pause start within 70 ms of an audible onset (widest "똑같이" at 0.1 s, +70 ms); limit ±200 ms; off: "이" no onset |
| loop | pass | 151 visual-zone pixels differ by more than 16 levels between the last and first frame (limit 500) |

**readable** (warn)

- `check/f1242.png`: readable: letterHalf2 "레터" fully visible only 12 frames (f1236–1247)
- `check/f1239.png`: readable: page "A4" fully visible only 18 frames (f1230–1247)
