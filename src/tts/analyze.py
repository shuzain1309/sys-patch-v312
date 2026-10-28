"""Pace/pitch profile of narration files, compared with the measured reference profile. Usage: analyze.py a.mp3 b.mp3 ...
Used by the voice-test workflow to rank voices. This only MEASURES pacing and pitch; it does not copy or clone any voice."""
import subprocess
import sys
import wave

import numpy as np

TARGET = {"speech_frac": 0.78, "pause_mean": 0.34, "syl_per_s": 4.13, "f0_med": 135, "f0_range": 103}


def load(p):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", p, "-ac", "1", "-ar", "16000", "/tmp/_a.wav"], check=True)
    w = wave.open("/tmp/_a.wav")
    return np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32768, w.getframerate()


def metrics(p):
    a, sr = load(p)
    n, dur = len(a), len(a) / sr
    hop = int(sr * 0.01)
    fr = np.array([np.sqrt(np.mean(a[i:i + hop * 2] ** 2)) for i in range(0, n - hop * 2, hop)])
    db = 20 * np.log10(fr + 1e-9)
    thr = np.percentile(db, 95) - 32
    sp = db > thr
    runs, c = [], 0
    for v in sp:
        if not v:
            c += 1
        else:
            if c:
                runs.append(c * 0.01)
            c = 0
    pa = np.array([r for r in runs if r >= 0.15])
    env = np.convolve(fr, np.ones(5) / 5, "same")
    lim = np.percentile(env[sp], 40) * 0.8
    pk = sum(1 for i in range(3, len(env) - 3) if sp[i] and env[i] == max(env[i - 3:i + 4]) and env[i] > lim)
    f0, L = [], int(sr * 0.04)
    for i in range(0, n - L * 2, int(sr * 0.02)):
        x = a[i:i + L * 2]
        if np.sqrt(np.mean(x ** 2)) < 10 ** (thr / 20) * 1.5:
            continue
        x = x - x.mean()
        ac = np.correlate(x, x, "full")[len(x) - 1:]
        lo, hi = int(sr / 300), int(sr / 70)
        k = lo + np.argmax(ac[lo:hi])
        if ac[k] > 0.4 * ac[0]:
            f0.append(sr / k)
    f0 = np.array(f0)
    return {"speech_frac": sp.sum() * 0.01 / dur, "pause_mean": float(pa.mean()) if len(pa) else 0, "syl_per_s": pk / dur,
            "f0_med": float(np.median(f0)), "f0_range": float(np.percentile(f0, 90) - np.percentile(f0, 10))}


rows = []
for p in sys.argv[1:]:
    m = metrics(p)
    dist = abs(m["pause_mean"] - TARGET["pause_mean"]) / 0.34 + abs(m["syl_per_s"] - TARGET["syl_per_s"]) / 4.13 + abs(m["f0_range"] - TARGET["f0_range"]) / 103 + abs(m["f0_med"] - TARGET["f0_med"]) / 135
    rows.append((dist, p, m))
print(f"{'file':28} speech pause  syl/s  f0med f0range  distance")
print(f"{'TARGET (reference profile)':28} {TARGET['speech_frac']:.2f}   {TARGET['pause_mean']:.2f}   {TARGET['syl_per_s']:.2f}   {TARGET['f0_med']:.0f}   {TARGET['f0_range']:.0f}")
for d, p, m in sorted(rows):
    print(f"{p.split('/')[-1][:28]:28} {m['speech_frac']:.2f}   {m['pause_mean']:.2f}   {m['syl_per_s']:.2f}   {m['f0_med']:.0f}   {m['f0_range']:.0f}     {d:.2f}")
print("Lower distance = closer pace and pitch spread to the target. Listen to the top 3 before choosing.")
