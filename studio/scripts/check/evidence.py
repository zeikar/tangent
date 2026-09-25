# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=11"]
# ///
"""Evidence images for check-render.mts (ffmpeg here has no text filter).

usage: uv run evidence.py spec.json
The spec names a folder of extracted frames (f0000.png, ...), a font, and the
outputs: "sheet" (labeled tiles in a grid), "pair" (labeled tiles side by
side), "frame" (one full frame with red boxes and a strip of notes under it).
"""
import json
import sys

from PIL import Image, ImageDraw, ImageFont

spec = json.load(open(sys.argv[1]))
frame = lambda f: Image.open(f"{spec['frames']}/f{f:04d}.png").convert("RGB")
font = lambda size: ImageFont.truetype(spec["font"], size)
BG, INK, RED = (15, 17, 21), (242, 242, 242), (252, 70, 60)


def tiles(items, crop, width, cols):
    label_h = max(24, width // 9)
    f = font(label_h * 2 // 3)
    ims = []
    for it in items:
        im = frame(it["frame"]).crop(tuple(crop))
        im = im.resize((width, round(im.height * width / im.width)))
        for l, t, r, b in it.get("boxes", []):
            k = width / (crop[2] - crop[0])
            ImageDraw.Draw(im).rectangle(
                [(l - crop[0]) * k - 3, (t - crop[1]) * k - 3, (r - crop[0]) * k + 3, (b - crop[1]) * k + 3], outline=RED, width=2
            )
        tile = Image.new("RGB", (width, im.height + label_h), BG)
        tile.paste(im, (0, label_h))
        ImageDraw.Draw(tile).text((6, label_h // 6), it["label"], font=f, fill=INK)
        ims.append(tile)
    pad = 6
    rows = (len(ims) + cols - 1) // cols
    h = max(t.height for t in ims)
    out = Image.new("RGB", (cols * (width + pad) + pad, rows * (h + pad) + pad), (64, 64, 64))
    for i, t in enumerate(ims):
        out.paste(t, (pad + (i % cols) * (width + pad), pad + (i // cols) * (h + pad)))
    return out


for o in spec["outputs"]:
    if o["kind"] in ("sheet", "pair"):
        img = tiles(o["tiles"], o["crop"], o["width"], o.get("cols", len(o["tiles"])))
    else:
        im = frame(o["frame"])
        d = ImageDraw.Draw(im)
        for l, t, r, b in o["boxes"]:
            d.rectangle([l - 4, t - 4, r + 4, b + 4], outline=RED, width=4)
        f = font(30)
        lines = [f"f{o['frame']}"]
        for note in o["notes"]:  # wrap to the frame width
            line = ""
            for word in note.split(" "):
                if line and f.getlength(f"{line} {word}") > im.width - 40:
                    lines.append(line)
                    line = word
                else:
                    line = f"{line} {word}".strip()
            lines.append(line)
        strip = Image.new("RGB", (im.width, 20 + 44 * len(lines)), BG)
        ds = ImageDraw.Draw(strip)
        for i, line in enumerate(lines):
            ds.text((20, 10 + 44 * i), line, font=f, fill=RED if i else INK)
        img = Image.new("RGB", (im.width, im.height + strip.height), BG)
        img.paste(im, (0, 0))
        img.paste(strip, (0, im.height))
    img.save(f"{spec['out']}/{o['file']}")
