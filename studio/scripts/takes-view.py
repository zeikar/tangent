"""Build a one-file listening page for the script + take checkpoint.

usage: python3 studio/scripts/takes-view.py episodes/<slug> [--fragment]

Writes episodes/<slug>/takes.html: one column per script file (script.md, or
the variants script.a.md, script.b.md, ...) with every take read from it
(take<N>.wav and its tempo copies, matched by the text in take<N>.txt) and
the beats' captions, so the human picks a script and a speed by ear.
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
template = (Path(__file__).parent / "takes-view.html").read_text()


def read_aloud(text):
    # Exactly what narrate.mts sends, and so what take<N>.txt holds.
    return "\n".join(m.strip() for m in re.findall(r"\*\*Read-aloud:\*\*\s*(.+)", text))


def beats(text):
    out = []
    for m in re.finditer(r"^## (B\d+) · (.+?)\s*$(.*?)(?=^## |\Z)", text, re.M | re.S):
        disp = re.search(r"\*\*Display:\*\*\s*(.+)", m.group(3))
        out.append({"id": m.group(1),
                    "name": re.sub(r"\s*\(~[^)]*\)$", "", m.group(2)),
                    "display": disp.group(1).strip() if disp else ""})
    return out


def duration(wav):
    return float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)],
        check=True, capture_output=True, text=True).stdout)


def mp3(wav):
    # Small mp3s keep a page of several takes light enough to publish.
    return base64.b64encode(subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "64k",
         "-f", "mp3", "-"], check=True, capture_output=True).stdout).decode()


def take_number(p):
    return int(re.match(r"take(\d+)", p.name).group(1))


takes = {t: t.read_text().strip() for t in sorted(ep.glob("take*.txt"), key=take_number)}
scripts = sorted(ep.glob("script.*.md")) + ([ep / "script.md"] if (ep / "script.md").exists() else [])
if not scripts:
    sys.exit(f"{ep}: no script.md or script.<variant>.md")

columns = []
matched = set()
for s in scripts:
    text = s.read_text()
    spoken = read_aloud(text)
    variant = s.name.removeprefix("script").removesuffix(".md").strip(".")
    syllables = len(re.findall(r"[가-힣]", spoken))
    audio = []
    for txt, said in takes.items():
        if said != spoken:
            continue
        matched.add(txt)
        n = take_number(txt)
        files = [(1.0, ep / f"take{n}.wav")] + sorted(
            (float(w.stem.split("@")[1]), w) for w in ep.glob(f"take{n}@*.wav"))
        for tempo, wav in files:
            if not wav.exists():
                continue
            d = duration(wav)
            audio.append({"file": wav.name, "take": n, "tempo": tempo, "seconds": round(d, 2),
                          "rate": round(syllables / d, 2), "src": mp3(wav)})
    columns.append({"file": s.name, "variant": variant.upper(), "syllables": syllables,
                    "beats": beats(text), "audio": audio})
    print(f"{s.name}: {syllables} syllables, "
          f"{len(audio)} audio file(s): {', '.join(a['file'] for a in audio) or 'none'}")

for txt in takes:
    if txt not in matched:
        print(f"{txt.name}: reads no current script (an older draft), left out")

topic = (ep / "topic.md").read_text().splitlines()[0]
title = re.sub(r"^#\s*(\d+\s*·\s*)?", "", topic).strip()


def js(o):
    return json.dumps(o, ensure_ascii=False).replace("</", "<\\/")


page = (template
        .replace("__SLUG__", slug)
        .replace("__H1__", js(title))
        .replace("__COLUMNS__", js(columns)))
if not fragment:
    page = ('<!doctype html><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">\n' + page)
out = ep / "takes.html"
out.write_text(page)
print(f"{out} ({len(page) // 1024} KB)")
