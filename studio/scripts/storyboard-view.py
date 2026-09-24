"""Build a one-file storyboard viewer page for an episode's human checkpoint.

usage: python3 studio/scripts/storyboard-view.py episodes/<slug> [--fragment]

Writes episodes/<slug>/storyboard.html: captions, each cue under the word that
triggers it, and the narration playing in sync. Audio comes from the final
narration (narration.mp3 + words.json) when it exists, otherwise from the
approved take named in narration.json (<source>.wav + <source>.words.json).
--fragment omits the doctype and charset header, for publishing as an
artifact (the host adds its own).
"""
import base64
import json
import re
import subprocess
import sys
from pathlib import Path

args = [a for a in sys.argv[1:] if not a.startswith("--")]
fragment = "--fragment" in sys.argv
ep = Path(args[0])
slug = ep.resolve().name
template = (Path(__file__).parent / "storyboard-view.html").read_text()

# The approved take (narration.json's source, e.g. take1@1.08.wav) until the
# final narration is built from it.
record = ep / "narration.json"
source = json.loads(record.read_text())["source"] if record.exists() else "take1.wav"
source = source.removesuffix(".wav")

if (ep / "narration.mp3").exists() and (ep / "words.json").exists():
    audio = (ep / "narration.mp3").read_bytes()
    words = json.loads((ep / "words.json").read_text())
    note = "최종 나레이션이에요(비트 사이 여백 포함)."
elif (ep / f"{source}.wav").exists() and (ep / f"{source}.words.json").exists():
    # Embed the take as a small mp3; the page only needs it for listening.
    audio = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(ep / f"{source}.wav"), "-codec:a", "libmp3lame",
         "-b:a", "64k", "-f", "mp3", "-"],
        check=True, capture_output=True).stdout
    words = json.loads((ep / f"{source}.words.json").read_text())
    note = "미리 읽기 테이크예요. 비트 사이 여백(pauseAfter)은 아직 안 들어가 있어요."
else:
    sys.exit(f"{ep}: no narration.mp3 + words.json or {source}.wav + {source}.words.json to play")

topic = (ep / "topic.md").read_text().splitlines()[0]
title = re.sub(r"^#\s*(\d+\s*·\s*)?", "", topic).strip()


def js(o):
    return json.dumps(o, ensure_ascii=False).replace("</", "<\\/")


page = (template
        .replace("__TITLE__", f"{title} 스토리보드")
        .replace("__SLUG__", slug)
        .replace("__H1__", js(title))
        .replace("__AUDIO_NOTE__", note)
        .replace("__STORYBOARD__", js(json.loads((ep / "storyboard.json").read_text())))
        .replace("__WORDS__", js(words))
        .replace("__AUDIO__", base64.b64encode(audio).decode()))
if not fragment:
    page = ('<!doctype html><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">\n' + page)
out = ep / "storyboard.html"
out.write_text(page)
print(f"{out} ({len(page) // 1024} KB)")
