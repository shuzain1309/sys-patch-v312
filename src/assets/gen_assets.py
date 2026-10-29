#!/usr/bin/env python3
"""Generate missing images listed in a manifest. Usage: gen_assets.py manifest.json [outdir]
Manifest item: {kind: char|bg, id, pose (default main), prompt, ref? "<id>/<pose>", tags?}
Providers are tried in order from IMG_PROVIDERS; a provider with no key in env is skipped."""
import base64, io, json, os, pathlib, sys
import requests

STYLE = ("2D cartoon webcomic illustration, thick uneven black ink outline, flat cel shading with soft shadow, "
         "chunky small body, blank white round head with tiny dot eyes and thick eyebrows, ")
CHAR = "full body, centered, on a plain flat light grey background"
BG = "painted 2D cartoon background, no characters, soft gradient sky, layered hills, warm cinematic light, wide panoramic composition"


def _ok(r):
    if not r.ok:
        raise RuntimeError(f"{r.status_code}: {r.text[:300]}")
    return r


def cloudflare(prompt, ref):
    url = f"https://api.cloudflare.com/client/v4/accounts/{os.environ['CF_ACCOUNT_ID']}/ai/run/@cf/black-forest-labs/"
    auth = {"Authorization": f"Bearer {os.environ['CF_API_TOKEN']}"}
    if not ref:  # cheap text-only model
        r = _ok(requests.post(url + "flux-1-schnell", headers=auth, json={"prompt": prompt, "steps": 6}, timeout=120))
    else:  # klein takes reference images (must be under 512x512)
        from PIL import Image
        im = Image.open(io.BytesIO(ref)).convert("RGBA")
        im.thumbnail((500, 500))
        flat = Image.new("RGB", im.size, (200, 200, 200))
        flat.paste(im, mask=im.split()[3])
        buf = io.BytesIO(); flat.save(buf, "PNG")
        fields = {"prompt": (None, "Keep exactly the same character and outfit as image 0. " + prompt),
                  "width": (None, "1024"), "height": (None, "1024"),
                  "input_image_0": ("ref.png", buf.getvalue(), "image/png")}
        r = _ok(requests.post(url + "flux-2-klein-9b", headers=auth, files=fields, timeout=180))
    return base64.b64decode(r.json()["result"]["image"])


def gemini(prompt, ref):
    parts = [{"text": prompt}]
    if ref:
        parts.append({"inline_data": {"mime_type": "image/webp", "data": base64.b64encode(ref).decode()}})
    r = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent",
        headers={"x-goog-api-key": os.environ["GEMINI_KEY"]},
        json={"contents": [{"parts": parts}]}, timeout=120)
    _ok(r)
    for p in r.json()["candidates"][0]["content"]["parts"]:
        d = p.get("inlineData") or p.get("inline_data")
        if d:
            return base64.b64decode(d["data"])
    raise ValueError("no image in response")


PROVIDERS = {"cloudflare": (cloudflare, "CF_API_TOKEN"), "gemini": (gemini, "GEMINI_KEY")}


# shortcut: no retry/backoff, a 429 just falls to the next provider; add backoff if daily limits bite
def generate(prompt, ref=None):
    for name in os.environ.get("IMG_PROVIDERS", "cloudflare,gemini").split(","):
        fn, key = PROVIDERS[name]
        if key not in os.environ:
            continue
        try:
            img = fn(prompt, ref)
        except Exception as e:
            print(f"{name} failed: {e}", file=sys.stderr)
            continue
        if img:
            return img
    raise RuntimeError("all providers failed")


def finish(raw, kind):
    from PIL import Image
    im = Image.open(io.BytesIO(raw)).convert("RGBA")
    if kind == "char":
        from rembg import remove  # CI installs it; cuts the grey background out
        im = remove(im)
        im = im.crop(im.getbbox())
        im.thumbnail((1024, 1024))
    else:
        w, h = im.size
        nh = w * 9 // 16
        top = (h - nh) // 2
        im = im.crop((0, top, w, top + nh)).convert("RGB").resize((1920, 1080), Image.LANCZOS)
    return im


def main(manifest, out="public"):
    items = json.load(open(manifest))
    lib_path = pathlib.Path("library.json")
    lib = json.loads(lib_path.read_text()) if lib_path.exists() else {}
    fails = 0
    for it in items:
        kind, pose = it["kind"], it.get("pose", "main")
        path = pathlib.Path(out) / kind / it["id"] / f"{pose}.webp"
        if path.exists():
            continue
        prompt = (STYLE + it["prompt"] + ", " + CHAR) if kind == "char" else (BG + ", " + it["prompt"])
        try:
            ref = None
            if it.get("ref"):
                ref = (pathlib.Path(out) / kind / f"{it['ref']}.webp").read_bytes()
            im = finish(generate(prompt, ref), kind)
        except Exception as e:
            print(f"FAILED {kind}/{it['id']}/{pose}: {e}", file=sys.stderr)
            fails += 1
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        im.save(path, "WEBP", quality=90)
        rec = lib.setdefault(kind + "s", {}).setdefault(it["id"], {"tags": it.get("tags", []), "poses": {}})
        rec["poses"][pose] = it["prompt"]
        lib_path.write_text(json.dumps(lib, indent=1))
        print("ok", path)
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:3]))
