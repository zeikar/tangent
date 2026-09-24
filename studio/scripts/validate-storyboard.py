"""Checks storyboard.json against script.md, research.md and the brief's rules.

usage: python3 studio/scripts/validate-storyboard.py episodes/<slug>
"""
import json
import re
import sys

ep = sys.argv[1]
sb = json.load(open(f"{ep}/storyboard.json"))
script = open(f"{ep}/script.md").read()
research = open(f"{ep}/research.md").read()

errors = []
err = errors.append

# script.md beats: id -> (display, readAloud, pause)
sections = re.split(r"^## ", script, flags=re.M)[1:]
beats_md = {}
for sec in sections:
    bid = sec.split(" ")[0]
    disp = re.search(r"\*\*화면용:\*\* (.+)", sec).group(1)
    read = re.search(r"\*\*읽기용:\*\* (.+)", sec).group(1)
    pause = sum(float(x) for x in re.findall(r"말 없이 ([\d.]+)초", sec))
    beats_md[bid] = (disp, read, pause)

claims = set(re.findall(r"^\| (C\d+) \|", research, re.M))
comp_names = {c["name"] for c in sb["components"]}
theme_colors = {"text", "muted", "blue", "yellow", "teal", "red", "purple"}
for c in sb["colors"]:
    if c not in theme_colors:
        err(f"colors: {c} not a theme color")

if [b["id"] for b in sb["beats"]] != list(beats_md):
    err("beat ids/order differ from script.md")


def words(text):
    return [re.sub(r"[^\w가-힣]", "", w) for w in text.split()]


def anchor_pos(a, ws, where):
    if a.get("pause"):
        return len(ws)
    w, nth = a["word"], a.get("nth", 1)
    idx = [i for i, x in enumerate(ws) if x == w]
    if len(idx) < nth:
        err(f"{where}: anchor {w!r} nth {nth} not in readAloud")
        return None
    if nth == 1 and len(idx) > 1 and "nth" not in a:
        err(f"{where}: {w!r} repeats; give nth")
    return idx[nth - 1]


def units(display):
    # eojeol, with each $...$ span counted inside the eojeol it belongs to
    masked = re.sub(r"\$[^$]*\$", lambda m: "M" * len(m.group()), display)
    return len(masked.split())


def colors_in(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ("color", "stroke", "fill", "long", "short") and isinstance(v, str):
                yield v
            else:
                yield from colors_in(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from colors_in(v)


def geom_ok(where, props):
    if "center" not in props:
        return
    (x, y), w, h = props["center"], props.get("w", 0), props.get("h", 0)
    if x - w / 2 < 60 or x + w / 2 > 940 or y - h / 2 < 240 or y + h / 2 > 1250:
        err(f"{where}: geometry {props['center']} {w}x{h} leaves the visual zone")


live = {}  # element id -> component
for b in sb["beats"]:
    bid = b["id"]
    disp, read, pause = beats_md[bid]
    if b["readAloud"] != read:
        err(f"{bid}: readAloud differs from script.md")
    if b["pauseAfter"] != pause:
        err(f"{bid}: pauseAfter {b['pauseAfter']} vs script {pause}")
    if not 0 <= b["pauseAfter"] <= 1.5:
        err(f"{bid}: pauseAfter out of range")
    ws = words(read)
    # captions
    joined = " ".join(c["text"] for c in b["captions"])
    if joined != disp:
        err(f"{bid}: captions don't cover 화면용\n  {joined}\n  {disp}")
    last = -1
    for c in b["captions"]:
        n = units(c["text"])
        if not 2 <= n <= 4:
            err(f"{bid}: caption {c['text']!r} has {n} eojeol")
        p = anchor_pos(c["at"], ws, f"{bid} caption")
        if p is not None and p <= last:
            err(f"{bid}: caption anchors not increasing at {c['text']!r}")
        last = p if p is not None else last
    # elements
    for e in b["elements"]:
        if e["component"] not in comp_names:
            err(f"{bid}: component {e['component']} not in components")
        if e["id"] in live:
            err(f"{bid}: element {e['id']} declared twice")
        live[e["id"]] = e["component"]
        geom_ok(f"{bid}/{e['id']}", e["props"])
        for col in colors_in(e["props"]):
            if col not in theme_colors:
                err(f"{bid}/{e['id']}: color {col}")
        for ref in ("a", "b", "of", "followHalfOf", "markerFrom"):
            r = e["props"].get(ref)
            if isinstance(r, str) and r not in live:
                err(f"{bid}/{e['id']}: {ref} -> undeclared {r}")
    # cues
    exited = []
    for c in b["cues"]:
        t = c["target"]
        if t not in live:
            err(f"{bid}: cue target {t} undeclared or already exited")
        at = anchor_pos(c["at"], ws, f"{bid} cue {t}.{c['action']}")
        if "until" in c:
            u = anchor_pos(c["until"], ws, f"{bid} cue {t} until")
            if at is not None and u is not None and u <= at:
                err(f"{bid}: cue {t}.{c['action']} until is not after at")
            if "speed" in c:
                err(f"{bid}: cue {t} has both speed and until")
        if c.get("speed") not in (None, "fast", "base", "slow"):
            err(f"{bid}: bad speed {c['speed']}")
        for col in colors_in(c.get("params", {})):
            if col not in theme_colors:
                err(f"{bid}: cue color {col}")
        p = c.get("params", {})
        if "ref" in p and p["ref"] not in live:
            err(f"{bid}: ref {p['ref']} undeclared")
        if "center" in p:
            geom_ok(f"{bid} cue {t}.{c['action']}", p)
        if c["action"] == "exit":
            exited.append(t)
    for t in exited:
        live.pop(t, None)
    for cid in b["claims"]:
        if cid not in claims:
            err(f"{bid}: claim {cid} not in research.md")
    # appear cues vs visibleAtStart
    appeared = {c["target"] for c in b["cues"] if c["action"] in ("appear", "reveal")}
    for e in b["elements"]:
        if e["id"] not in appeared and not e.get("visibleAtStart"):
            err(f"{bid}: element {e['id']} never appears")

print("still on screen at the end:", sorted(live))
print("\n".join(errors) if errors else "OK: all checks passed")
