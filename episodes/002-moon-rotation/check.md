# Render check · 002-moon-rotation

**Pass**: 0 fail, 0 warn, 15 pass, 1 skip · contact sheet `check/sheet.png`

| Check | Status | Summary |
|---|---|---|
| freshness | pass | render.mp4, cues.json and the studio code all match this storyboard.json |
| technical | pass | 1080×1920 yuv420p bt709 tv, 30 fps, 1467 frames (48.90 s); audio 48000 Hz, last 100 ms at -120 dBFS |
| bounds | pass | all 1467 frames inside x 140–940, visual ink below y 240 and above the caption band, captions in y 1280–1500; visual ink x 147–933, y 241–1233 |
| centering | pass | B1 0/0, B2 0/0, B3 0/0, B4 +1/+0, B5 -9/-10, B6 0/-1, B7 0/0 (px off x 540: all ink / picture without edge labels; tolerance ±25) |
| legibility | pass | smallest glyph "1" 39.6 px in titleReal "자전1바퀴" (floor 30 px, 45 text items) |
| overlaps | pass | no text meets other text, lines, or a fill drawn over it (in or across elements); no entrance draws while an exit is still visible |
| labels | skip | no edge label has another element's line nearby |
| captions | pass | all 35 captions appear 0–0 frames after their cue (limit 3), on one line, inside the caption zone |
| readable | pass | every name and label stays fully visible at least 30 frames |
| reaction | pass | B1 +1, B2 +1, B3 +1, B4 +1, B5 +1, B6 +1, B7 +1 (frames from each beat's first word to the first visible change; — = no cue on that word; limit 3) |
| cues | pass | every cue after a beat's first word shows a change within 5 frames |
| blank | pass | the visual zone is never empty for more than 3 frames in a row |
| loudness | pass | -14 LUFS integrated (target -14 ±1), true peak -3.2 dBTP (max -1), range 4 LU |
| av-sync | pass | render audio is 0 ms off against narration.mp3 (limit ±20 ms) |
| words | pass | 23 of 23 words after a pause start within 50 ms of an audible onset (widest "앞면이" at 5.54 s, -50 ms); limit ±200 ms |
| loop | pass | 4 visual-zone pixels differ by more than 16 levels between the last and first frame (limit 500) |
