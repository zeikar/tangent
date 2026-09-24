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
"""
import json
import sys

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

out = [{"word": w["text"], "start": round(w["start"], 3), "end": round(w["end"], 3)} for w in result]
if [w["word"] for w in out] != text.split():
    sys.exit("aligned words do not match transcript words")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
