"""Audition voices with the same pacing logic as the real pipeline: python src/tts/voice_test.py "text" voice1,voice2 -> public/test/<voice>.mp3"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro import KPipeline

sys.path.insert(0, os.path.dirname(__file__))
from generate_voice import SENT, SR, pause_after, trim  # noqa: E402

text, names = sys.argv[1], [v.strip() for v in sys.argv[2].split(",") if v.strip()]
pace = json.load(open("src/tts/pace.json"))
os.makedirs("public/test", exist_ok=True)
pipes = {}
for v in names:
    pipes.setdefault(v[0], KPipeline(lang_code=v[0], repo_id="hexgrad/Kokoro-82M"))
    parts = []
    sents = [s for s in SENT.split(text) if s.strip()]
    for k, s in enumerate(sents):
        for r in pipes[v[0]](s, voice=v, speed=0.97, split_pattern=r"\n+"):
            a = r.audio if hasattr(r, "audio") else r[2]
            if a is not None:
                parts.append(trim((a.numpy() if hasattr(a, "numpy") else np.asarray(a)).astype("float32"), pace["trim_db"]))
        if k < len(sents) - 1:
            parts.append(np.zeros(int(SR * pause_after(s, pace)), "float32"))
    sf.write(f"public/test/{v}.wav", np.concatenate(parts), SR)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"public/test/{v}.wav", "-af", "highpass=f=70,loudnorm=I=-16:TP=-1.5", "-b:a", "192k", f"public/test/{v}.mp3"], check=True)
    os.remove(f"public/test/{v}.wav")
    print("made", v)
