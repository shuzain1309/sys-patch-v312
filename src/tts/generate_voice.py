"""Narration -> public/narration.mp3 + public/timings.json
Engine: Kokoro-82M (Apache-2.0), natural-sounding, runs on CPU.
timings.json: {id: {"seconds": clip+gap, "words": [{"w","s","e"}]}}, words are the SCRIPT words (so captions are spelled right),
timed from faster-whisper's word timestamps. `seconds` is exactly the number of samples written, so the video stays locked to the audio.
"""
import difflib
import json
import os
import re
import subprocess

SR = 24000
GAP = 0.35  # seconds of silence after every scene
TAG = re.compile(r"^\[v:([a-z_]+)\]\s*")
NORM = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())


def parse_line(text, voices):
    m = TAG.match(text)
    key = m.group(1) if m else "narrator"
    if key not in voices:
        key = "narrator"
    return key, TAG.sub("", text).strip()


def align(script_words, heard, span):
    """script_words: list[str]; heard: list[(word,start,end)] from Whisper; span: (speech_start, speech_end).
    Returns [(start,end)] per script word. Matched words use Whisper times; gaps are filled evenly."""
    n = len(script_words)
    if n == 0:
        return []
    t = [None] * n
    if heard:
        sm = difflib.SequenceMatcher(None, [NORM(w) for w in script_words], [NORM(h[0]) for h in heard], autojunk=False)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                for k in range(i2 - i1):
                    t[i1 + k] = (heard[j1 + k][1], heard[j1 + k][2])
    i = 0
    while i < n:
        if t[i] is not None:
            i += 1
            continue
        j = i
        while j < n and t[j] is None:
            j += 1
        lo = t[i - 1][1] if i > 0 else span[0]
        hi = t[j][0] if j < n else span[1]
        hi = max(hi, lo + 0.05 * (j - i))
        w = [max(1, len(NORM(script_words[k]))) for k in range(i, j)]
        tot, acc = sum(w), lo
        for k in range(i, j):
            d = (hi - lo) * w[k - i] / tot
            t[k] = (acc, acc + d)
            acc += d
        i = j
    return t


def main():
    import numpy as np
    import soundfile as sf

    voices = json.load(open("src/tts/voices.json"))
    items = json.load(open("narration.json"))
    os.makedirs("public", exist_ok=True)
    os.makedirs("tmp", exist_ok=True)

    from kokoro import KPipeline
    from faster_whisper import WhisperModel

    pipes = {}

    def speak(text, vc):
        lang = vc["voice"][0]
        if lang not in pipes:
            pipes[lang] = KPipeline(lang_code=lang)
        parts = []
        for _, _, audio in pipes[lang](text, voice=vc["voice"], speed=vc.get("speed", 1.0), split_pattern=r"(?<=[.!?])\s+"):
            a = audio.numpy() if hasattr(audio, "numpy") else np.asarray(audio)
            parts += [a.astype("float32"), np.zeros(int(SR * 0.12), "float32")]
        return np.concatenate(parts[:-1]) if parts else np.zeros(SR // 2, "float32")

    wm = WhisperModel("base.en", device="cpu", compute_type="int8")
    timings = {}
    out = sf.SoundFile("tmp/narration.wav", "w", samplerate=SR, channels=1, subtype="PCM_16")
    gap = np.zeros(int(GAP * SR), "float32")
    for n, it in enumerate(items):
        key, text = parse_line(it["text"], voices)
        a = speak(text, voices[key])
        p = f"tmp/{it['id']}.wav"
        sf.write(p, a, SR)
        segs, _ = wm.transcribe(p, language="en", word_timestamps=True, beam_size=1)
        heard = [(w.word.strip(), w.start, w.end) for s in segs for w in (s.words or [])]
        os.remove(p)
        words = text.split()
        span = (heard[0][1] if heard else 0.0, heard[-1][2] if heard else len(a) / SR)
        tt = align(words, heard, span)
        total = len(a) + len(gap)
        timings[it["id"]] = {"seconds": round(total / SR, 4), "words": [{"w": w, "s": round(s, 3), "e": round(e, 3)} for w, (s, e) in zip(words, tt)]}
        out.write(a)
        out.write(gap)
        if n % 25 == 0:
            print(f"voice {n + 1}/{len(items)}", flush=True)
    out.close()
    # light broadcast polish: remove rumble, gentle compression, loudness to -16 LUFS. Duration is unchanged.
    af = "highpass=f=70,acompressor=threshold=0.125:ratio=3:attack=15:release=250:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=11"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "tmp/narration.wav", "-af", af, "-ar", "48000", "-b:a", "192k", "public/narration.mp3"], check=True)
    json.dump(timings, open("public/timings.json", "w"))
    print("done:", round(sum(v["seconds"] for v in timings.values()) / 60, 1), "min of narration")


if __name__ == "__main__":
    main()
