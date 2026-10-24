"""Pad each scene's voice to its frame length, concat, mix music -> audio.m4a"""
import json, subprocess, sys
from pathlib import Path

job = Path(sys.argv[1])
tl = json.loads((job / "timeline.json").read_text(encoding="utf-8"))
tmp = job / "tmp"
tmp.mkdir(exist_ok=True)
run = lambda c: subprocess.run(["ffmpeg", "-y", "-v", "error", *c], check=True)
lines = []
for s in tl["scenes"]:
    o = tmp / f"{s['id']}.wav"
    run(["-i", str(job / s["audio"]), "-af", f"apad=whole_dur={s['dur'] / tl['fps']:.3f}",
         "-ar", "44100", "-ac", "2", str(o)])
    lines.append(f"file '{o.resolve()}'")
(tmp / "l.txt").write_text("\n".join(lines))
run(["-f", "concat", "-safe", "0", "-i", str(tmp / "l.txt"), "-c", "copy", str(tmp / "voice.wav")])
mu = tl["brand"].get("music")
cmd = ["-i", str(tmp / "voice.wav")]
if mu and mu.get("file"):
    cmd += ["-stream_loop", "-1", "-i", str(job / "brand" / mu["file"]), "-filter_complex",
            f"[1:a]volume={mu.get('volume', 0.08)}[m];[0:a][m]amix=inputs=2:duration=first:normalize=0[a]",
            "-map", "[a]"]
run([*cmd, "-c:a", "aac", "-b:a", "160k", str(job / "audio.m4a")])
