"""Fetch Pexels photos/clips per scene.visual.query -> assets/ + assets.json. Failures fall back to text cards."""
import json, os, sys, time
from pathlib import Path
import requests

job = Path(sys.argv[1])
S = json.loads((job / "script.json").read_text(encoding="utf-8"))
H = {"Authorization": os.environ["PEXELS_KEY"]}
a = job / "assets"
a.mkdir(exist_ok=True)
used, out = set(), {}


def get(url, **kw):
    for _ in range(4):
        r = requests.get(url, timeout=60, **kw)
        if r.status_code == 429:  # Pexels free limit: 200 req/hour
            time.sleep(90)
            continue
        r.raise_for_status()
        return r
    raise RuntimeError("rate limited")


def photo(q, name):
    r = get("https://api.pexels.com/v1/search", headers=H,
            params={"query": q, "orientation": "landscape", "per_page": 15}).json()
    for p in r.get("photos", []):
        if p["id"] not in used:
            used.add(p["id"])
            (a / f"{name}.jpg").write_bytes(get(p["src"]["large2x"]).content)
            return f"assets/{name}.jpg"


def video(q, name):
    r = get("https://api.pexels.com/videos/search", headers=H,
            params={"query": q, "orientation": "landscape", "per_page": 10}).json()
    for v in r.get("videos", []):
        fs = [f for f in v["video_files"] if f["file_type"] == "video/mp4" and 1280 <= f["width"] <= 1920]
        if v["id"] not in used and fs:
            used.add(v["id"])
            (a / f"{name}.mp4").write_bytes(get(fs[0]["link"]).content)
            return f"assets/{name}.mp4"


jobs = [(s["id"], s["visual"]) for s in S["scenes"]]
if S.get("thumbnail", {}).get("bg_query"):
    jobs.append(("_thumb", {"type": "image", "query": S["thumbnail"]["bg_query"]}))
for sid, v in jobs:
    if v["type"] not in ("image", "video") or not v.get("query"):
        continue
    try:
        f = (video if v["type"] == "video" else photo)(v["query"], sid)
        if f:
            out[sid] = {"file": f}
    except Exception as e:
        print("asset miss", sid, type(e).__name__)  # never print queries: logs are public
(job / "assets.json").write_text(json.dumps(out), encoding="utf-8")
