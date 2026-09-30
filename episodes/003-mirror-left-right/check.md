# Render check · 003-mirror-left-right

**Pass**: 0 fail, 0 warn, 15 pass, 1 skip · contact sheet `check/sheet.png`

| Check | Status | Summary |
|---|---|---|
| freshness | pass | render.mp4, cues.json and the studio code all match this storyboard.json |
| technical | pass | 1080×1920 yuv420p bt709 tv, 30 fps, 1246 frames (41.53 s); audio 48000 Hz, last 100 ms at -120 dBFS |
| bounds | pass | all 1246 frames inside x 140–940, visual ink below y 240 and above the caption band, captions in y 1280–1500; visual ink x 144–935, y 264–1247 |
| centering | pass | B1 0/0, B2 0/0, B3 +2/0, B5 0/0, B6 0/0 (px off x 540: all ink / picture without edge labels; tolerance ±25) |
| legibility | pass | smallest glyph "그" 41.4 px in captions "그런데 내가 돌아서서" (floor 30 px, 24 text items) |
| overlaps | pass | no text meets other text, lines, or a fill drawn over it (in or across elements); no entrance draws while an exit is still visible |
| labels | skip | no edge label has another element's line nearby |
| captions | pass | all 24 captions appear 0–0 frames after their cue (limit 3), on one line, inside the caption zone |
| readable | pass | every name and label stays fully visible at least 30 frames |
| reaction | pass | B1 +1, B2 +1, B3 +1, B5 +1, B6 +1 (frames from each beat's first word to the first visible change; — = no cue on that word; limit 3) |
| cues | pass | every cue after a beat's first word shows a change within 5 frames |
| blank | pass | the visual zone is never empty for more than 3 frames in a row |
| loudness | pass | -14.1 LUFS integrated (target -14 ±1), true peak -3.6 dBTP (max -1), range 4.3 LU |
| av-sync | pass | render audio is 0 ms off against narration.mp3 (limit ±20 ms) |
| words | pass | 23 of 23 words after a pause start within 50 ms of an audible onset (widest "늘," at 32.96 s, -50 ms); limit ±200 ms |
| loop | pass | 6 visual-zone pixels differ by more than 16 levels between the last and first frame (limit 500) |
