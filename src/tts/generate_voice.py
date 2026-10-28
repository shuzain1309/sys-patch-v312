"""Narration -> public/narration.mp3, public/timings.json, captions (.srt/.vtt), chapters, final SEO.
Usage: generate_voice.py shard I N  (synthesise every N-th scene into clips/)  |  generate_voice.py merge  |  (no args: all in one).
Pacing: every SENTENCE is synthesised alone, silence is trimmed from both ends, then sentences are joined with
punctuation-based pauses (src/tts/pace.json). No fixed per-scene gap, so speech flows like a person talking.
Scene length = its speech + a short tail pause; the scene cut lands inside that natural pause.
Engine: Kokoro-82M (Apache-2.0) on CPU. Word times: faster-whisper, mapped back onto the SCRIPT's own words.
"""
import difflib
import json
import os
import re
import subprocess

SR = 24000
TAG = re.compile(r"^\[v:([a-z_]+)\]\s*")
NORM = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
SENT = re.compile(r"(?<=[.!?])\s+")


def parse_line(text, voices):
    m = TAG.match(text)
    key = m.group(1) if m else "narrator"
    return (key if key in voices else "narrator"), TAG.sub("", text).strip()


def respell(text, lex):
    """Speech-only respelling (lexicon). 1:1 word replacement keeps word counts aligned with the script."""
    out = []
    for w in text.split():
        m = re.match(r"^(\W*)([\w\u00C0-\u024F'\u2019-]+)(\W*)$", w)
        if m and m.group(2) in lex:
            w = m.group(1) + lex[m.group(2)] + m.group(3)
        out.append(w)
    return " ".join(out)


def pause_after(sentence, pace):
    s = sentence.rstrip()
    if s.endswith("..."):
        return pace["ellipsis"]
    if s.endswith("?"):
        return pace["question"]
    if s.endswith((":", ";")):
        return pace["colon"]
    return pace["sentence"]


def trim(a, db):
    import numpy as np
    if len(a) == 0:
        return a
    th = np.abs(a).max() * 10 ** (db / 20)
    idx = np.where(np.abs(a) > th)[0]
    if len(idx) == 0:
        return a
    pad = int(0.03 * SR)
    b = a[max(0, idx[0] - pad): min(len(a), idx[-1] + pad)].copy()
    k = int(0.006 * SR)  # 6 ms fades remove clicks
    b[:k] *= np.linspace(0, 1, k)
    b[-k:] *= np.linspace(1, 0, k)
    return b


def align(script_words, heard, span):
    """Per script word (start, end). Whisper-matched words use Whisper times; gaps are filled proportionally."""
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


def stamp(s, comma):
    ms = int(round(s * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d}{comma}{ms % 1000:03d}"


def make_cues(words, max_chars=42, max_dur=5.5):
    """words: [(text,start,end)] on the global timeline -> [(start,end,text)] caption cues (max 2 lines of ~42 chars)."""
    cues, cur = [], []
    def flush():
        if not cur:
            return
        txt = " ".join(w[0] for w in cur)
        if len(txt) > max_chars:
            parts, line = [], ""
            half = len(txt) / 2
            for w in txt.split():
                if line and len(line) + 1 + len(w) > half and not parts:
                    parts.append(line); line = w
                else:
                    line = (line + " " + w).strip()
            parts.append(line)
            txt = "\n".join(parts)
        cues.append([cur[0][1], cur[-1][2], txt])
    for w in words:
        if cur:
            length = len(" ".join(x[0] for x in cur)) + 1 + len(w[0])
            if length > max_chars * 2 or w[2] - cur[0][1] > max_dur or w[1] - cur[-1][2] > 0.8 or cur[-1][0].endswith((".", "?", "!")):
                flush(); cur.clear()
        cur.append(w)
    flush()
    for i, c in enumerate(cues):  # readable minimum, never overlap the next cue
        nxt = cues[i + 1][0] - 0.04 if i + 1 < len(cues) else c[1] + 1
        c[1] = min(max(c[1], c[0] + 0.7), nxt)
    return cues


def chapter_stamp(s):
    s = int(s)
    return f"{s // 3600}:{s // 60 % 60:02d}:{s % 60:02d}" if s >= 3600 else f"{s // 60}:{s % 60:02d}"


def synth_shard(i, n):
    import numpy as np
    import soundfile as sf
    voices = json.load(open("src/tts/voices.json"))
    pace = json.load(open("src/tts/pace.json"))
    lex = {k: v for k, v in json.load(open("src/tts/lexicon.json")).items() if not k.startswith("_")}
    items = json.load(open("narration.json"))
    os.makedirs("clips", exist_ok=True)
    mine = [it for k, it in enumerate(items) if k % n == i]
    if not mine:
        return
    from faster_whisper import WhisperModel
    from kokoro import KPipeline
    pipes = {}

    def say(sentence, vc):
        lang = vc["voice"][0]
        if lang not in pipes:
            pipes[lang] = KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M")
        parts = []
        for r in pipes[lang](sentence, voice=vc["voice"], speed=vc.get("speed", 1.0), split_pattern=r"\n+"):
            audio = r.audio if hasattr(r, "audio") else r[2]
            if audio is None:
                continue
            parts.append((audio.numpy() if hasattr(audio, "numpy") else np.asarray(audio)).astype("float32"))
        return np.concatenate(parts) if parts else np.zeros(int(SR * 0.3), "float32")

    wm = WhisperModel("base.en", device="cpu", compute_type="int8")
    for c, it in enumerate(mine):
        key, text = parse_line(it["text"], voices)
        speak = respell(text, lex)
        sents = [x for x in SENT.split(speak) if x.strip()]
        clip = []
        for k, x in enumerate(sents):
            clip.append(trim(say(x, voices[key]), pace["trim_db"]))
            if k < len(sents) - 1:
                clip.append(np.zeros(int(SR * pause_after(x, pace)), "float32"))
        a = np.concatenate(clip)
        p = f"clips/{it['id']}.wav"
        sf.write(p, a, SR, subtype="FLOAT")
        segs, _ = wm.transcribe(p, language="en", word_timestamps=True, beam_size=1)
        heard = [(w.word.strip(), w.start, w.end) for s_ in segs for w in (s_.words or [])]
        tw = speak.split()
        span = (heard[0][1] if heard else 0.0, heard[-1][2] if heard else len(a) / SR)
        tt = align(tw, heard, span)
        json.dump({"words": [{"w": w, "s": round(s0, 3), "e": round(e0, 3)} for w, (s0, e0) in zip(text.split(), tt)]}, open(f"clips/{it['id']}.json", "w"))
        if c % 20 == 0:
            print(f"shard {i}: {c + 1}/{len(mine)}", flush=True)


def merge():
    import numpy as np
    import soundfile as sf
    pace = json.load(open("src/tts/pace.json"))
    items = json.load(open("narration.json"))
    chapters = json.load(open("chapters.json"))
    seo = json.load(open("seo.json"))
    os.makedirs("public", exist_ok=True)
    os.makedirs("out", exist_ok=True)
    os.makedirs("tmp", exist_ok=True)
    out = sf.SoundFile("tmp/narration.wav", "w", samplerate=SR, channels=1, subtype="PCM_16")
    timings, starts, cum, gwords = {}, {}, 0, []
    for n, it in enumerate(items):
        a, _ = sf.read(f"clips/{it['id']}.wav", dtype="float32")
        words = json.load(open(f"clips/{it['id']}.json"))["words"]
        nxt = items[n + 1]["type"] if n + 1 < len(items) else ""
        tail = pace["after_chapter"] if it["type"] == "chapter" else pace["before_chapter"] if nxt == "chapter" else pace["scene_tail"]
        tail_a = np.zeros(int(SR * tail), "float32")
        total = len(a) + len(tail_a)
        starts[it["id"]] = cum / SR
        timings[it["id"]] = {"seconds": round(total / SR, 4), "words": words}
        for w in words:
            gwords.append((w["w"], cum / SR + w["s"], cum / SR + w["e"]))
        out.write(a)
        out.write(tail_a)
        cum += total
    out.close()
    af = "highpass=f=70,acompressor=threshold=0.125:ratio=3:attack=15:release=250:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=11"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "tmp/narration.wav", "-af", af, "-ar", "48000", "-b:a", "192k", "public/narration.mp3"], check=True)
    json.dump(timings, open("public/timings.json", "w"))
    cues = make_cues(gwords)
    with open("out/captions.srt", "w", encoding="utf-8") as f:
        for i, (a0, b0, t0) in enumerate(cues, 1):
            f.write(f"{i}\n{stamp(a0, ',')} --> {stamp(b0, ',')}\n{t0}\n\n")
    with open("out/captions.vtt", "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for a0, b0, t0 in cues:
            f.write(f"{stamp(a0, '.')} --> {stamp(b0, '.')}\n{t0}\n\n")
    marks = [(0.0, seo.get("introLabel", "Intro"))]
    for c in chapters:
        s0 = starts.get(c["id"], 0.0)
        if s0 < 1:
            marks[0] = (0.0, c["title"])
        elif s0 - marks[-1][0] >= 10:
            marks.append((s0, c["title"]))
    chap_txt = "\n".join(f"{chapter_stamp(s0)} {t0}" for s0, t0 in marks)
    open("out/chapters.txt", "w", encoding="utf-8").write(chap_txt + "\n")
    desc = seo.get("description", "").replace("{{CHAPTERS}}", chap_txt)
    if len(marks) < 3:
        print("::warning::fewer than 3 chapters; YouTube will not show chapter markers")
    seo["description"] = desc
    json.dump(seo, open("out/seo.json", "w"), ensure_ascii=False, indent=2)
    open("out/description.txt", "w", encoding="utf-8").write(desc)
    print("done:", round(cum / SR / 60, 1), "min of narration,", len(cues), "caption cues,", len(marks), "chapters")


if __name__ == "__main__":
    import sys
    a = sys.argv[1:]
    if a[:1] == ["shard"]:
        synth_shard(int(a[1]), int(a[2]))
    elif a[:1] == ["merge"]:
        merge()
    else:
        synth_shard(0, 1)
        merge()
