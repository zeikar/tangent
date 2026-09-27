# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = [
#   # Git, not PyPI: the PyPI "ctc-forced-aligner" is an unrelated ONNX project (deskpai).
#   "ctc-forced-aligner @ git+https://github.com/MahmoudAshraf97/ctc-forced-aligner.git@64293cc6d711e57666c4a8b098e9fd93b381fd88",
# ]
# ///
"""Forced-align a known transcript to audio with the MMS-300m CTC aligner.

usage: uv run align.py audio.(wav|mp3) transcript.txt out.json
Writes [{"word", "start", "end"}] with one entry per space-separated word (Korean eojeol).
The transcript must be the read-aloud text (numbers/symbols spelled out in Hangul).

Forced alignment places every transcript word somewhere, so it can't tell a
take that differs from its text on its own. Two signs catch it, calibrated on
episode 001's take (worst word score -2.6, widest gap 0.84 s):
- a word the take never says scores far lower (-9 to -13 for a skipped phrase);
- speech the transcript lacks leaves a wide gap between two words, or before
  the first one (5.1 s for an extra line; the first word at 3.3 s after 3 s
  of speech it doesn't have; 001's first word starts by 0.34 s).
Exits 1 on either, naming the words, before writing anything.
"""
import json
import sys

MIN_SCORE = -5.0  # mean log-probability of a word's frames
MAX_GAP = 1.5  # seconds between one word's end and the next one's start

import torch
from ctc_forced_aligner import (generate_emissions, get_alignments, get_spans, load_alignment_model,
                                load_audio, postprocess_results, preprocess_text)

audio_path, text_path, out_path = sys.argv[1:4]
text = open(text_path, encoding="utf-8").read().strip()

model, tokenizer = load_alignment_model("cpu", dtype=torch.float32)
wav = load_audio(audio_path, model.dtype, model.device)
emissions, stride = generate_emissions(model, wav, batch_size=4)
tokens, words = preprocess_text(text, romanize=True, language="kor")
segments, scores, blank = get_alignments(emissions, tokens, tokenizer)
spans = get_spans(tokens, segments, blank)
result = postprocess_results(words, spans, stride, scores)

low = [f'{w["text"]} at {w["start"]:.2f}s ({w["score"]:.1f})' for w in result if w["score"] < MIN_SCORE]
start = {"text": "(start)", "end": 0.0}
gaps = [f'{a["text"]} → {b["text"]} at {a["end"]:.2f}s ({b["start"] - a["end"]:.1f}s)'
        for a, b in zip([start] + result, result) if b["start"] - a["end"] > MAX_GAP]
if low or gaps:
    sys.exit("the take doesn't read its transcript; listen there and retake:\n"
             + "".join(f"  not spoken? {w}\n" for w in low) + "".join(f"  unscripted speech? {g}\n" for g in gaps))
out = [{"word": w["text"], "start": round(w["start"], 3), "end": round(w["end"], 3)} for w in result]
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
