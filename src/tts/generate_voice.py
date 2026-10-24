"""script.json -> audio/<scene>.mp3 + tts.json (duration + word timings). Replaces Whisper."""
import asyncio, json, subprocess, sys
from pathlib import Path
import edge_tts

job = Path(sys.argv[1])
script = json.loads((job / "script.json").read_text(encoding="utf-8"))
m = script["meta"]
out = job / "audio"
out.mkdir(exist_ok=True)
sem = asyncio.Semaphore(4)


def duration(p):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))


async def speak(s):
    mp3 = out / f"{s['id']}.mp3"
    async with sem:
        for attempt in range(4):  # edge-tts is an unofficial endpoint: retry
            try:
                words = []
                com = edge_tts.Communicate(s["narration"], s.get("voice", m.get("voice", "en-US-GuyNeural")),
                                           rate=m.get("rate", "+0%"), boundary="WordBoundary")
                with open(mp3, "wb") as f:
                    async for ch in com.stream():
                        if ch["type"] == "audio":
                            f.write(ch["data"])
                        elif ch["type"] == "WordBoundary":
                            words.append({"text": ch["text"], "start": ch["offset"] / 1e7,
                                          "end": (ch["offset"] + ch["duration"]) / 1e7})
                if mp3.stat().st_size > 0:
                    return {"id": s["id"], "file": f"audio/{mp3.name}", "duration": duration(mp3), "words": words}
            except Exception as e:
                print("tts retry", s["id"], type(e).__name__)
            await asyncio.sleep(3 * (attempt + 1))
    sys.exit(f"TTS failed for {s['id']}")


async def main():
    res = await asyncio.gather(*(speak(s) for s in script["scenes"]))
    (job / "tts.json").write_text(json.dumps(res), encoding="utf-8")

asyncio.run(main())
