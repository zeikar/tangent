# Render check · 003-mirror-left-right

**Pass**: 0 fail, 0 warn, 15 pass, 1 skip · contact sheet `check/sheet.png`

| Check | Status | Summary |
|---|---|---|
| freshness | pass | render.mp4, cues.json and the studio code all match this storyboard.json |
| technical | pass | 1080×1920 yuv420p bt709 tv, 30 fps, 1358 frames (45.27 s); audio 48000 Hz, last 100 ms at -120 dBFS |
| bounds | pass | all 1358 frames inside x 140–940, visual ink below y 240 and above the caption band, captions in y 1280–1500; visual ink x 152–927, y 264–1255 |
| centering | pass | B1 +2/0, B2 +2/0, B3 0/0, B4 +1/0, B5 0/0, B6 -1/0 (px off x 540: all ink / picture without edge labels; tolerance ±25) |
| legibility | pass | smallest glyph "그" 41.4 px in captions "자리는 그대로지만" (floor 30 px, 30 text items) |
| overlaps | pass | no text meets other text, lines, or a fill drawn over it (in or across elements); no entrance draws while an exit is still visible |
| labels | skip | no edge label has another element's line nearby |
| captions | pass | all 29 captions appear 0–0 frames after their cue (limit 3), on one line, inside the caption zone |
| readable | pass | every name and label stays fully visible at least 30 frames |
| reaction | pass | B1 +1, B2 +1, B3 +2, B4 +2, B5 +1, B6 +1 (frames from each beat's first word to the first visible change; — = no cue on that word; limit 3) |
| cues | pass | every cue after a beat's first word shows a change within 5 frames |
| blank | pass | the visual zone is never empty for more than 3 frames in a row |
| loudness | pass | -14.1 LUFS integrated (target -14 ±1), true peak -2.6 dBTP (max -1), range 3.4 LU |
| av-sync | pass | render audio is 0 ms off against narration.mp3 (limit ±20 ms) |
| words | pass | 21 of 21 words after a pause start within 50 ms of an audible onset (widest "앞뒤예요." at 14 s, -50 ms); limit ±200 ms |
| loop | pass | 20 visual-zone pixels differ by more than 16 levels between the last and first frame (limit 500) |
