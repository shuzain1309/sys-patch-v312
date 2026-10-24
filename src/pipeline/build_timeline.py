"""script + tts + assets + brand -> timeline.json (Remotion props), chunk matrix, retention lint, chapters."""
import json, math, os, re, sys
from pathlib import Path

job = Path(sys.argv[1])
rd = lambda n: json.loads((job / n).read_text(encoding="utf-8"))
S, A, brand = rd("script.json"), rd("assets.json"), rd("brand/config.json")
TTS = {t["id"]: t for t in rd("tts.json")}
m = S["meta"]
fps, W, H = int(m.get("fps", 30)), int(m.get("width", 1920)), int(m.get("height", 1080))
PAD = round(0.3 * fps)


def evenly(text, d):
    w = text.split()
    return [{"text": x, "start": i * d / len(w), "end": (i + 1) * d / len(w)} for i, x in enumerate(w)]


t, scenes, beats, chapters = 0, [], [], []
for s in S["scenes"]:
    a = TTS[s["id"]]
    dur = math.ceil(a["duration"] * fps) + PAD
    words = a["words"] or evenly(s["narration"], a["duration"])  # fallback if no word boundaries
    ws = [{"text": w["text"], "from": round(w["start"] * fps), "to": round(w["end"] * fps)} for w in words]
    for i in range(len(ws) - 1):
        ws[i]["to"] = ws[i + 1]["from"]
    if ws:
        ws[-1]["to"] = dur
    v = {**s["visual"], **A.get(s["id"], {})}
    if v["type"] in ("image", "video") and not v.get("file"):
        v = {"type": "card", "text": s.get("overlay_text", "")}
    sec = t / fps
    if s.get("beat"):
        beats.append(sec)
    if s.get("chapter") or not chapters:
        chapters.append(f"{int(sec // 60)}:{int(sec % 60):02d} {s.get('chapter', 'Intro')}")
    scenes.append({"id": s["id"], "from": t, "dur": dur, "visual": v, "overlay_text": s.get("overlay_text"),
                   "character": s.get("character"), "beat": s.get("beat"), "audio": a["file"], "words": ws})
    t += dur

pts = [0.0] + beats + [t / fps]
for x, y in zip(pts, pts[1:]):
    if y - x > 130:
        print(f"::warning::retention gap {y - x:.0f}s after {x:.0f}s (add a beat every ~120s)")

th = {**S.get("thumbnail", {}), "bg": A.get("_thumb", {}).get("file")}
(job / "timeline.json").write_text(json.dumps({
    "fps": fps, "width": W, "height": H, "totalFrames": t, "meta": m, "thumbnail": th,
    "brand": brand, "scenes": scenes, "chapters": "\n".join(chapters)}), encoding="utf-8")

C = int(os.getenv("CHUNK_FRAMES", 4500))
mx = [{"i": f"{i:03d}", "range": f"{a}-{min(a + C, t) - 1}"} for i, a in enumerate(range(0, t, C))]
slug = re.sub(r"[^a-z0-9]+", "-", m["title"].lower()).strip("-")[:40]
with open(os.environ["GITHUB_OUTPUT"], "a") as f:
    f.write(f"matrix={json.dumps(mx)}\ndir={os.environ['JOB_ID']}_{slug}\n")
