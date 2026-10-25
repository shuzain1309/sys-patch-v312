"""Audition voices: python src/tts/voice_test.py "text" voice1,voice2,... -> public/test/<voice>.mp3"""
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro import KPipeline

text, names = sys.argv[1], [v.strip() for v in sys.argv[2].split(",") if v.strip()]
os.makedirs("public/test", exist_ok=True)
pipes = {}
for v in names:
    pipes.setdefault(v[0], KPipeline(lang_code=v[0]))
    parts = []
    for _, _, a in pipes[v[0]](text, voice=v, speed=0.97, split_pattern=r"(?<=[.!?])\s+"):
        parts += [a.numpy() if hasattr(a, "numpy") else np.asarray(a), np.zeros(int(24000 * 0.12), "float32")]
    sf.write(f"public/test/{v}.wav", np.concatenate(parts), 24000)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"public/test/{v}.wav", "-af", "highpass=f=70,loudnorm=I=-16:TP=-1.5", "-b:a", "192k", f"public/test/{v}.mp3"], check=True)
    os.remove(f"public/test/{v}.wav")
    print("made", v)
