"""Synthesises every sound effect in code (numpy only): no samples, no licences.
Writes public/sfx/<name>.wav (mono, 44.1 kHz, 16-bit). Loops (rain, fire, waves, wind) are seamless.
Volumes are set per cue in kit.tsx; these files are normalised to about -4 dBFS peak."""
import os
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(SR * d)) / SR


def norm(x, peak=0.63):
    return (x / (np.max(np.abs(x)) + 1e-9) * peak).astype("float32")


def band(x, lo, hi):
    """FFT band-pass with soft edges (also used for low-pass lo=0 and high-pass hi=SR/2)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.clip((f - lo) / max(lo * 0.3, 40), 0, 1) * np.clip((hi - f) / max(hi * 0.3, 40), 0, 1) if lo > 0 else np.clip((hi - f) / max(hi * 0.3, 40), 0, 1)
    return np.fft.irfft(X * m, len(x))


def env(n, a, r, curve=2.0):
    e = np.ones(n)
    ai, ri = int(a * SR), int(r * SR)
    if ai:
        e[:ai] = np.linspace(0, 1, ai) ** curve
    if ri:
        e[-ri:] *= np.linspace(1, 0, ri) ** curve
    return e


def noise(d):
    return rng.standard_normal(int(SR * d))


def sine_sweep(d, f0, f1):
    t = t_(d)
    f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def whoosh(d, lo, hi, peak_at=0.45):
    n = noise(d)
    out = 0
    for (a, b, c) in [(lo, lo * 3, 0.0), (lo * 3, hi * 0.6, 0.15), (hi * 0.6, hi, 0.3)]:
        e = np.exp(-(((t_(d) / d) - (peak_at + c)) ** 2) / 0.04)
        out = out + band(n, a, b) * e
    return out * env(len(out), 0.05 * d, 0.3 * d)


def loopfix(x, fade=0.4):
    k = int(fade * SR)
    head, tail = x[:k].copy(), x[-k:].copy()
    x = x[: len(x) - k].copy()
    x[:k] = head * np.linspace(0, 1, k) + tail * np.linspace(1, 0, k)
    return x


S = {}
S["whoosh"] = whoosh(0.7, 300, 5000)
S["whoosh_long"] = whoosh(1.3, 200, 4500, 0.5)
S["flip"] = band(noise(0.35), 1500, 8000) * env(int(SR * 0.35), 0.01, 0.3, 3) + 0.3 * sine_sweep(0.35, 900, 300) * env(int(SR * 0.35), 0.005, 0.3, 3)
t = t_(0.14); S["pop"] = np.sin(2 * np.pi * np.cumsum(520 * np.exp(-t * 14)) / SR) * np.exp(-t * 28)
t = t_(0.05); S["tick"] = band(noise(0.05), 2500, 9000) * np.exp(-t * 90)
t = t_(0.6); S["thud"] = np.sin(2 * np.pi * np.cumsum(95 * np.exp(-t * 6) + 38) / SR) * np.exp(-t * 7) + 0.5 * band(noise(0.6), 0, 500) * np.exp(-t * 20)
t = t_(2.2); S["impact"] = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 2.2) + 34) / SR) * np.exp(-t * 2.0) + 0.7 * band(noise(2.2), 0, 900) * np.exp(-t * 4) + 0.25 * band(noise(2.2), 2000, 9000) * np.exp(-t * 18)
r = sine_sweep(1.1, 160, 1100) * np.linspace(0, 1, int(SR * 1.1)) ** 2 + 0.7 * band(noise(1.1), 800, 9000) * np.linspace(0, 1, int(SR * 1.1)) ** 2.5
S["riser"] = r * env(len(r), 0, 0.02)
r = sine_sweep(1.5, 220, 880) * np.linspace(0, 1, int(SR * 1.5)) ** 1.5 + 0.4 * band(noise(1.5), 1200, 8000) * np.linspace(0, 1, int(SR * 1.5)) ** 2
S["riser_short"] = r * env(len(r), 0, 0.15)
t = t_(1.0); S["ding"] = (np.sin(2 * np.pi * 1318.5 * t) + 0.45 * np.sin(2 * np.pi * 2637 * t) + 0.2 * np.sin(2 * np.pi * 3951 * t)) * np.exp(-t * 4.5) * env(len(t), 0.002, 0)
t = t_(0.55); S["coin"] = (np.sin(2 * np.pi * 2093 * t) * np.exp(-t * 9) + np.sin(2 * np.pi * 3136 * np.clip(t - 0.07, 0, None)) * np.exp(-np.clip(t - 0.07, 0, None) * 8) * (t > 0.07))
x = sine_sweep(0.8, 300, 1400) * env(int(SR * 0.8), 0.1, 0.4) + 0.3 * band(noise(0.8), 2000, 9000) * env(int(SR * 0.8), 0.2, 0.4); S["sweep"] = x
t = t_(0.9); S["ignite"] = band(noise(0.9), 150, 3500) * np.minimum(1, t * 12) * np.exp(-t * 3.2) + 0.4 * band(noise(0.9), 0, 300) * np.exp(-t * 5)
t = t_(3.5); S["thunder"] = (band(noise(3.5), 0, 260) * (0.6 + 0.4 * np.sin(2 * np.pi * 5 * t)) * np.exp(-t * 0.9) * np.minimum(1, t * 8) + 0.6 * band(noise(3.5), 600, 6000) * np.exp(-t * 14))
# loops
d = 8.0 + 0.4
x = band(noise(d), 1200, 9000) * 0.5 + band(noise(d), 300, 1200) * 0.25
clicks = np.zeros(len(x)); idx = rng.integers(0, len(x) - 400, 700)
for i in idx: clicks[i:i + 220] += rng.uniform(0.2, 0.9) * np.exp(-np.arange(220) / 30)
S["rain"] = loopfix(x + 0.5 * band(clicks, 2500, 12000))
x = band(noise(d), 0, 450) * 0.4; clicks = np.zeros(len(x)); idx = rng.integers(0, len(x) - 3000, 160)
for i in idx: clicks[i:i + 1800] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(1800) / rng.uniform(80, 400)) * np.sign(rng.standard_normal(1800))
S["fire"] = loopfix(x + 0.9 * band(clicks, 400, 7000))
t = t_(d); mod = 0.55 + 0.45 * np.sin(2 * np.pi * (t / 8.0) * 1 - 1.2) ** 2
S["waves"] = loopfix(band(noise(d), 0, 1100) * mod + 0.3 * band(noise(d), 1500, 6000) * np.clip(mod - 0.5, 0, None))
S["wind"] = loopfix(band(noise(d), 250, 1100) * (0.55 + 0.45 * np.sin(2 * np.pi * t / 4.0 + 0.5)))

os.makedirs("public/sfx", exist_ok=True)
for k, v in S.items():
    v = norm(np.nan_to_num(v))
    with wave.open(f"public/sfx/{k}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((v * 32767).astype("<i2").tobytes())
print("sfx:", ", ".join(f"{k} {len(v) / SR:.1f}s" for k, v in S.items()))
