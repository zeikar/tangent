"""Turns an aligned narration take into the episode's narration.mp3, words.json
and cues.json.

usage: python3 studio/scripts/build-cues.py episodes/<slug> \
           episodes/<slug>/take<N>.wav episodes/<slug>/take<N>.words.json

take<N>.words.json is align.py's output for the chosen take. It stays in the
episode folder (committed), so the build reruns without re-aligning.

- Trims the take's leading silence to LEAD seconds and ends the audio the last
  beat's pauseAfter seconds after its speech ends.
- Inserts each beat's pauseAfter as digital silence in the gap between the
  beat's last word and the next beat's first word.
- Writes narration.mp3 as the video's audio master: the take on both stereo
  channels, with one gain so it measures TARGET_LUFS integrated and at most
  MAX_TRUE_PEAK (gain only, so timestamps stay valid). Copies it to
  studio/public/episodes/<slug>/, where the composition loads it.
- Writes words.json (align.py format, shifted into narration.mp3's timeline)
  and cues.json: per beat startFrame / endFrame (inclusive) / pauseFrame, and
  the frame of every caption and cue anchor (plus untilFrame), in storyboard
  order. Frames at the fps in studio/src/style/theme.ts. cues.json also
  records storyboard.json's SHA-256; render.mts and beat-stills.mts refuse
  a cues.json built from another version of it.

Where speech ends is measured, not taken from the aligner (its word ends run
early): the start of the first run of SILENCE_RUN seconds below SILENCE_DB
after the beat's last word starts. That point is also the beat's
{"pause": true} anchor.
"""
import array
import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
import wave

LEAD = 0.1  # seconds of silence kept before the first word
SILENCE_DB = -45.0  # dBFS RMS in HOP windows
SILENCE_RUN = 0.15  # seconds; longer than a stop-consonant closure
HOP = 0.01
TARGET_LUFS = -14.0  # YouTube turns louder audio down, quieter audio stays quiet
MAX_TRUE_PEAK = -1.0  # dBTP
DUAL_MONO = "pan=stereo|c0=c0|c1=c0"

ep, take_path, words_path = sys.argv[1:4]
studio = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
theme = open(os.path.join(studio, "src/style/theme.ts"), encoding="utf-8").read()
FPS = int(re.search(r"VIDEO = \{[^}]*fps: (\d+)", theme).group(1))

sb_bytes = open(os.path.join(ep, "storyboard.json"), "rb").read()
sb = json.loads(sb_bytes)
aligned = json.load(open(words_path, encoding="utf-8"))

with wave.open(take_path) as w:
    if w.getnchannels() != 1 or w.getsampwidth() != 2:
        sys.exit("expected 16-bit mono wav")
    rate = w.getframerate()
    samples = array.array("h", w.readframes(w.getnframes()))
if sys.byteorder != "little":
    samples.byteswap()

# RMS level per HOP window, in dBFS.
hop = int(rate * HOP)
levels = []
for i in range(0, len(samples), hop):
    chunk = samples[i : i + hop]
    rms = math.sqrt(sum(s * s for s in chunk) / len(chunk)) / 32768
    levels.append(20 * math.log10(rms) if rms > 0 else -120.0)


def speech_end(after, before):
    """Start of the first silent run after `after` (seconds) that ends before
    `before`, or None if speech runs straight on."""
    run = math.ceil(SILENCE_RUN / HOP)
    i = int(after / HOP)
    quiet = 0
    while i < len(levels) and i * HOP < before:
        quiet = quiet + 1 if levels[i] < SILENCE_DB else 0
        if quiet == run:
            return (i - run + 1) * HOP
        i += 1
    return None


def loudness(path, af):
    """(integrated LUFS, true peak dBTP) of `path` after filter `af`."""
    err = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", f"{af},ebur128=peak=true", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    ).stderr
    summary = err[err.rindex("Summary:"):]
    return (float(re.search(r"I:\s+(-?[\d.]+) LUFS", summary).group(1)),
            float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summary).group(1)))


def strip(word):
    return re.sub(r"[^\w가-힣]", "", word)


# Split the aligned words into beats.
beat_words = []
pos = 0
for b in sb["beats"]:
    n = len(b["readAloud"].split())
    beat_words.append(aligned[pos : pos + n])
    pos += n
if pos != len(aligned) or [w["word"] for bw in beat_words for w in bw] != [
    w for b in sb["beats"] for w in b["readAloud"].split()
]:
    sys.exit("words.json does not match the storyboard's readAloud")

onset = next(i * HOP for i, lv in enumerate(levels) if lv >= SILENCE_DB)
trim = max(0.0, min(onset, aligned[0]["start"]) - LEAD)

# Speech end per beat and the insertion point in the gap after it (take time).
ends, inserts = [], []  # inserts: (take time, seconds of silence)
take_len = len(samples) / rate
for k, bw in enumerate(beat_words):
    nxt = beat_words[k + 1][0]["start"] if k + 1 < len(beat_words) else take_len
    end = speech_end(bw[-1]["start"], nxt)
    pause = sb["beats"][k]["pauseAfter"]
    if end is None:
        if pause > 0 or k + 1 == len(beat_words):
            sys.exit(f"{sb['beats'][k]['id']}: no {SILENCE_RUN}s silence after its last word to put the pause in")
        end = nxt  # joined straight onto the next beat
    ends.append(end)
    if k + 1 < len(beat_words) and pause > 0:
        # Inside the measured silent run, so no breath or word tail is split.
        inserts.append((end + SILENCE_RUN / 2, pause))
last_pause = sb["beats"][-1]["pauseAfter"]
total = round((ends[-1] + last_pause - trim) + sum(p for _, p in inserts), 6)
n_frames = math.ceil(total * FPS - 1e-6)


def out_time(t):
    """Take time -> narration time."""
    return t - trim + sum(p for at, p in inserts if at <= t)


def frame(t):
    return round(out_time(t) * FPS)


# Build the narration: trim, insert silences, cut or pad to n_frames.
out = array.array("h")
cursor = int(round(trim * rate))
for at, pause in inserts:
    cut = int(round(at * rate))
    out.extend(samples[cursor:cut])
    out.extend([0] * int(round(pause * rate)))
    cursor = cut
out.extend(samples[cursor:])
want = int(round(n_frames / FPS * rate))
del out[want:]
out.extend([0] * (want - len(out)))
if sys.byteorder != "little":
    out.byteswap()
with tempfile.TemporaryDirectory() as tmp:
    wav_path = os.path.join(tmp, "narration.wav")
    with wave.open(wav_path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(out.tobytes())
    lufs, peak = loudness(wav_path, DUAL_MONO)
    gain = TARGET_LUFS - lufs
    if peak + gain > MAX_TRUE_PEAK:
        gain = MAX_TRUE_PEAK - peak
        print(f"WARNING: true peak limits the gain; narration will be {lufs + gain:.1f} LUFS, "
              f"not {TARGET_LUFS}", file=sys.stderr)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", wav_path, "-af", f"{DUAL_MONO},volume={gain:.2f}dB",
         "-codec:a", "libmp3lame", "-q:a", "2", os.path.join(ep, "narration.mp3")],
        check=True,
    )

shifted = [
    {"word": w["word"], "start": round(out_time(w["start"]), 3), "end": round(out_time(w["end"]), 3)}
    for w in aligned
]
with open(os.path.join(ep, "words.json"), "w", encoding="utf-8") as f:
    json.dump(shifted, f, ensure_ascii=False, indent=1)


def resolve(anchor, k):
    if anchor.get("pause"):
        return {"pause": True, "frame": frame(ends[k])}
    word, nth = anchor["word"], anchor.get("nth", 1)
    hits = [w for w in beat_words[k] if strip(w["word"]) == word]
    if len(hits) < nth:
        sys.exit(f"{sb['beats'][k]['id']}: anchor {word!r} nth {nth} not found")
    return {"word": word, "frame": frame(hits[nth - 1]["start"])}


beats = []
for k, b in enumerate(sb["beats"]):
    start = 0 if k == 0 else frame(beat_words[k][0]["start"])
    cues = []
    for c in b["cues"]:
        cue = {"target": c["target"], "action": c["action"], **resolve(c["at"], k)}
        if "until" in c:
            cue["untilFrame"] = resolve(c["until"], k)["frame"]
        cues.append(cue)
    beats.append({
        "id": b["id"],
        "startFrame": start,
        "pauseFrame": frame(ends[k]),
        "captions": [resolve(c["at"], k) for c in b["captions"]],
        "cues": cues,
    })
for k, b in enumerate(beats):
    b["endFrame"] = beats[k + 1]["startFrame"] - 1 if k + 1 < len(beats) else n_frames - 1
    b_keys = ["id", "startFrame", "endFrame", "pauseFrame", "captions", "cues"]
    beats[k] = {key: b[key] for key in b_keys}

with open(os.path.join(ep, "cues.json"), "w", encoding="utf-8") as f:
    json.dump({"storyboardSha256": hashlib.sha256(sb_bytes).hexdigest(), "fps": FPS,
               "durationInFrames": n_frames, "beats": beats}, f,
              ensure_ascii=False, indent=1)

public = os.path.join(studio, "public", "episodes", os.path.basename(os.path.abspath(ep)))
os.makedirs(public, exist_ok=True)
shutil.copyfile(os.path.join(ep, "narration.mp3"), os.path.join(public, "narration.mp3"))

lufs_out, peak_out = loudness(os.path.join(ep, "narration.mp3"), "anull")
print(f"trimmed {trim:.3f}s lead; inserted {[p for _, p in inserts]}; "
      f"narration {n_frames} frames ({n_frames / FPS:.2f}s); "
      f"gain {gain:+.2f} dB -> {lufs_out:.1f} LUFS, true peak {peak_out:.1f} dBTP")
for k, b in enumerate(beats):
    gap = (beat_words[k + 1][0]["start"] - ends[k]) if k + 1 < len(beats) else None
    print(f"{b['id']}: frames {b['startFrame']}-{b['endFrame']}, speech ends {b['pauseFrame']}"
          + (f", natural gap {gap:.2f}s" if gap is not None else ""))
