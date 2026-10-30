#!/usr/bin/env python3
"""Generate missing images listed in a manifest. Usage: gen_assets.py manifest.json [outdir]
Manifest item: {kind: char|bg, id, pose (default main), prompt, ref? "<id>/<pose>", tags?}
Providers are tried in order from IMG_PROVIDERS; a provider with no key in env is skipped."""
import base64, io, json, os, pathlib, sys
import requests

STYLE = ("simple 2D cartoon webcomic art in the style of image 0: huge perfectly round blank white head, NO nose, NO ears, "
         "NO cheeks, tiny black dot eyes, heavy thick eyebrows, small mouth, short chunky stubby body with tiny hands, "
         "very thick bold black outline, flat colours with soft cel shading. ")
STYLE_REF = pathlib.Path("style/style_ref.png")
CHAR = "full body, centered, on a plain flat light grey background"
BG = "painted 2D cartoon background, no characters, soft gradient sky, layered hills, warm cinematic light, wide panoramic composition"


def _ok(r):
    if not r.ok:
        raise RuntimeError(f"{r.status_code}: {r.text[:300]}")
    return r


def cloudflare(prompt, refs, size=(1024, 1024)):
    url = f"https://api.cloudflare.com/client/v4/accounts/{os.environ['CF_ACCOUNT_ID']}/ai/run/@cf/black-forest-labs/"
    auth = {"Authorization": f"Bearer {os.environ['CF_API_TOKEN']}"}
    if not refs:  # cheap text-only model
        r = _ok(requests.post(url + "flux-1-schnell", headers=auth, json={"prompt": prompt, "steps": 6}, timeout=120))
    else:  # klein takes reference images (must be under 512x512)
        from PIL import Image
        fields = {"prompt": (None, prompt), "width": (None, str(size[0])), "height": (None, str(size[1]))}
        for i, ref in enumerate(refs):
            im = Image.open(io.BytesIO(ref)).convert("RGBA")
            im.thumbnail((500, 500))
            flat = Image.new("RGB", im.size, (200, 200, 200))
            flat.paste(im, mask=im.split()[3])
            buf = io.BytesIO(); flat.save(buf, "PNG")
            fields[f"input_image_{i}"] = ("r.png", buf.getvalue(), "image/png")
        r = _ok(requests.post(url + "flux-2-klein-9b", headers=auth, files=fields, timeout=180))
    return base64.b64decode(r.json()["result"]["image"])


def gemini(prompt, refs, size=None):
    parts = [{"text": prompt}]
    for ref in refs or []:
        parts.append({"inline_data": {"mime_type": "image/png", "data": base64.b64encode(ref).decode()}})
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
def generate(prompt, refs=None, size=(1024, 1024)):
    for name in os.environ.get("IMG_PROVIDERS", "cloudflare,gemini").split(","):
        fn, key = PROVIDERS[name]
        if key not in os.environ:
            continue
        try:
            img = fn(prompt, refs, size)
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
        im = im.crop(im.getchannel("A").getbbox())
        im.thumbnail((1024, 1024))
    else:
        w, h = im.size
        nh = w * 9 // 16
        top = (h - nh) // 2
        im = im.crop((0, top, w, top + nh)).convert("RGB").resize((1920, 1080), Image.LANCZOS)
    return im


def split_sheet(raw, cols, rows):
    from PIL import Image
    from rembg import remove
    im = remove(Image.open(io.BytesIO(raw)).convert("RGBA"))
    cw, ch = im.size[0] // cols, im.size[1] // rows
    out = []
    for r in range(rows):
        for c in range(cols):
            cell = im.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
            bb = cell.getchannel("A").getbbox()
            if not bb:
                raise ValueError("empty cell")
            if bb[0] <= 2 or bb[1] <= 2 or bb[2] >= cw - 2 or bb[3] >= ch - 2:
                raise ValueError("pose touches its cell edge: grid not respected")
            out.append(cell.crop(bb))
    return out


def do_sheet(it, out, lib, lib_path):
    names = list(it["poses"])
    cols = it.get("cols", 3)
    rows = -(-len(names) // cols)
    paths = {n: pathlib.Path(out) / "char" / it["id"] / f"{n}.webp" for n in names}
    if all(p.exists() for p in paths.values()):
        return
    listing = " ".join(f"{i+1}) {d}." for i, d in enumerate(it["poses"].values()))
    prompt = (STYLE + f"Character sheet of the SAME character drawn {len(names)} times, in a grid of {cols} columns and {rows} rows, "
              f"each pose full body inside its own cell with wide empty space around it, plain flat light grey background. "
              f"Character: {it['prompt']}. Poses in reading order: {listing}")
    refs = [STYLE_REF.read_bytes()] if STYLE_REF.exists() else None
    cells = split_sheet(generate(prompt, refs, (cols * 640, rows * 960)), cols, rows)
    rec = lib.setdefault("chars", {}).setdefault(it["id"], {"tags": it.get("tags", []), "poses": {}})
    for (n, p), cell in zip(paths.items(), cells):
        cell.thumbnail((1024, 1024))
        p.parent.mkdir(parents=True, exist_ok=True)
        cell.save(p, "WEBP", quality=90)
        rec["poses"][n] = it["poses"][n]
        print("ok", p)
    lib_path.write_text(json.dumps(lib, indent=1))


def main(manifest, out="public"):
    items = json.load(open(manifest))
    lib_path = pathlib.Path("library.json")
    lib = json.loads(lib_path.read_text().strip() or "{}") if lib_path.exists() else {}  # blank file = empty library
    fails = 0
    for it in items:
        if it["kind"] == "sheet":
            try:
                do_sheet(it, out, lib, lib_path)
            except Exception as e:
                print(f"FAILED sheet/{it['id']}: {e}", file=sys.stderr)
                fails += 1
            continue
        kind, pose = it["kind"], it.get("pose", "main")
        path = pathlib.Path(out) / kind / it["id"] / f"{pose}.webp"
        if path.exists():
            continue
        prompt = (STYLE + it["prompt"] + ", " + CHAR) if kind == "char" else (BG + ", " + it["prompt"])
        try:
            ref = None
            if it.get("ref"):
                ref = (pathlib.Path(out) / kind / f"{it['ref']}.webp").read_bytes()
            im = finish(generate(prompt, [ref] if ref else None), kind)
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
