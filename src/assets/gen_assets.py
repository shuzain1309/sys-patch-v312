#!/usr/bin/env python3
"""Generate missing images from a manifest with FLUX.2 klein 4B. Usage: gen_assets.py manifest.json [outdir]
Providers run in IMG_PROVIDERS order (default cloudflare,kaggle) on whatever is still pending;
a provider with no credentials in env is skipped. Both run the same model so the look matches.
Manifest items: sheet {id, prompt, poses:{name:desc}, cols?}, bg {id, prompt}, prop {id, prompt}; all take tags?."""
import base64, io, json, os, pathlib, subprocess, sys, tempfile, time
import requests

STYLE = ("simple 2D cartoon webcomic art in the style of image 0: huge perfectly round blank white head, NO nose, NO ears, "
         "NO cheeks, tiny black dot eyes, heavy thick eyebrows, small mouth, short chunky stubby body with tiny hands, "
         "very thick bold black outline, flat colours with soft cel shading. ")
STYLE_REF = pathlib.Path("style/style_ref.png")
GREY = "plain flat light grey background"
BG = ("painted 2D cartoon background in the art style of image 0, no characters, soft gradient sky, layered hills, "
      "warm cinematic light, wide composition, ")
KEYS = {"cloudflare": ("CF_ACCOUNT_ID", "CF_API_TOKEN"), "kaggle": ("KAGGLE_USERNAME", "KAGGLE_API_TOKEN")}
SLUG = "ig-worker"

KERNEL = '''
import base64, io, os, subprocess, sys, time
T = time.time()
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "git+https://github.com/huggingface/diffusers.git",
                "transformers", "accelerate", "sentencepiece"], check=True)
print("pip done", int(time.time() - T), "s", flush=True)
os.environ["HF_HOME"] = "/kaggle/temp/hf"
import torch
from PIL import Image
from diffusers import Flux2KleinPipeline
dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
pipe = Flux2KleinPipeline.from_pretrained("black-forest-labs/FLUX.2-klein-4B", torch_dtype=dtype)
pipe.enable_model_cpu_offload()
print("model ready", int(time.time() - T), "s", flush=True)
for i, j in enumerate(JOBS):
    try:
        kw = dict(prompt=j["prompt"], width=j["size"][0], height=j["size"][1], guidance_scale=1.0,
                  num_inference_steps=4, generator=torch.Generator("cpu").manual_seed(0))
        if j["refs"]:
            kw["image"] = [Image.open(io.BytesIO(base64.b64decode(r))).convert("RGB") for r in j["refs"]]
        pipe(**kw).images[0].save(f"/kaggle/working/{i}.png")
        print("job", i, "done", int(time.time() - T), "s", flush=True)
    except Exception as e:
        print("job", i, "failed:", e)
'''


def _ok(r):
    if not r.ok:
        raise RuntimeError(f"{r.status_code}: {r.text[:300]}")
    return r


def prep(raw):
    """Reference images: flat grey background, max 500px (Cloudflare's limit; Kaggle gets the same input)."""
    from PIL import Image
    im = Image.open(io.BytesIO(raw)).convert("RGBA")
    im.thumbnail((500, 500))
    flat = Image.new("RGB", im.size, (200, 200, 200))
    flat.paste(im, mask=im.split()[3])
    buf = io.BytesIO()
    flat.save(buf, "PNG")
    return buf.getvalue()


def cloudflare(jobs):
    model = os.environ.get("CF_MODEL", "flux-2-klein-4b")
    url = f"https://api.cloudflare.com/client/v4/accounts/{os.environ['CF_ACCOUNT_ID']}/ai/run/@cf/black-forest-labs/{model}"
    auth = {"Authorization": f"Bearer {os.environ['CF_API_TOKEN']}"}
    left = []
    for n, j in enumerate(jobs):
        fields = {"prompt": (None, j["prompt"]), "width": (None, str(j["size"][0])), "height": (None, str(j["size"][1]))}
        for i, ref in enumerate(j["refs"]):
            fields[f"input_image_{i}"] = ("r.png", ref, "image/png")
        try:
            r = _ok(requests.post(url, headers=auth, files=fields, timeout=180))
            j["save"](base64.b64decode(r.json()["result"]["image"]))
        except Exception as e:
            print(f"cloudflare failed {j['name']}: {e}", file=sys.stderr)
            left.append(j)
            if "4006" in str(e):  # daily neurons used up: hand everything else on
                left += jobs[n + 1:]
                break
    return left


def kaggle(jobs):
    """One GPU kernel run for the whole batch (model load is the slow part)."""
    ref = f"{os.environ['KAGGLE_USERNAME']}/{SLUG}"
    d = pathlib.Path(tempfile.mkdtemp())
    payload = [{"prompt": j["prompt"], "size": j["size"], "refs": [base64.b64encode(r).decode() for r in j["refs"]]} for j in jobs]
    (d / "k.py").write_text("import json\nJOBS = json.loads(%r)\n" % json.dumps(payload) + KERNEL)
    (d / "kernel-metadata.json").write_text(json.dumps({
        "id": ref, "title": SLUG, "code_file": "k.py", "language": "python", "kernel_type": "script",
        "is_private": True, "enable_gpu": True, "enable_internet": True}))
    subprocess.run(["kaggle", "kernels", "push", "-p", str(d)], check=True)
    out = d / "out"
    for _ in range(100):  # ~50 min
        time.sleep(30)
        st = subprocess.run(["kaggle", "kernels", "status", ref], capture_output=True, text=True).stdout.upper()
        if "COMPLETE" in st:
            break
        if "ERROR" in st or "CANCEL" in st:
            subprocess.run(["kaggle", "kernels", "output", ref, "-p", str(out)])
            for f in out.glob("*.log"):
                print("--- notebook log (tail) ---\n" + f.read_text()[-3000:], file=sys.stderr)
            raise RuntimeError(st.strip())
    else:
        raise TimeoutError("kaggle kernel did not finish")
    subprocess.run(["kaggle", "kernels", "output", ref, "-p", str(out)], check=True)
    left = []
    for i, j in enumerate(jobs):
        try:
            j["save"]((out / f"{i}.png").read_bytes())
        except Exception as e:
            print(f"kaggle failed {j['name']}: {e}", file=sys.stderr)
            left.append(j)
    return left


PROVIDERS = {"cloudflare": cloudflare, "kaggle": kaggle}


def split_sheet(raw, cols, rows):
    from PIL import Image
    from rembg import remove  # CI installs it; cuts the grey background out
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


def build_jobs(items, out, lib, lib_path):
    from PIL import Image
    style = [prep(STYLE_REF.read_bytes())] if STYLE_REF.exists() else []
    root = pathlib.Path(out)
    jobs = []

    def record(kind, it, pose, desc):
        rec = lib.setdefault(kind + "s", {}).setdefault(it["id"], {"tags": it.get("tags", []), "poses": {}})
        rec["poses"][pose] = desc
        lib_path.write_text(json.dumps(lib, indent=1))

    for it in items:
        kind = it["kind"]
        if kind == "sheet":
            names = list(it["poses"])
            cols = it.get("cols", 3)
            rows = -(-len(names) // cols)
            paths = [root / "char" / it["id"] / f"{n}.webp" for n in names]
            if all(p.exists() for p in paths):
                continue
            listing = " ".join(f"{i+1}) {d}." for i, d in enumerate(it["poses"].values()))
            prompt = (STYLE + f"Character sheet of the SAME character drawn {len(names)} times, in a grid of {cols} columns and "
                      f"{rows} rows, each pose full body inside its own cell with wide empty space around it, {GREY}. "
                      f"Character: {it['prompt']}. Poses in reading order: {listing}")

            def save(raw, it=it, names=names, paths=paths, cols=cols, rows=rows):
                for n, p, cell in zip(names, paths, split_sheet(raw, cols, rows)):
                    cell.thumbnail((1024, 1024))
                    p.parent.mkdir(parents=True, exist_ok=True)
                    cell.save(p, "WEBP", quality=90)
                    record("char", it, n, it["poses"][n])
                    print("ok", p)
            jobs.append(dict(name=f"sheet/{it['id']}", prompt=prompt, refs=style, size=(cols * 640, rows * 960), save=save))
        elif kind == "bg":
            p = root / "bg" / it["id"] / "main.webp"
            if p.exists():
                continue

            def save(raw, it=it, p=p):
                p.parent.mkdir(parents=True, exist_ok=True)
                Image.open(io.BytesIO(raw)).convert("RGB").resize((1920, 1080), Image.LANCZOS).save(p, "WEBP", quality=90)
                record("bg", it, "main", it["prompt"])
                print("ok", p)
            jobs.append(dict(name=f"bg/{it['id']}", prompt=BG + it["prompt"], refs=style, size=(1920, 1080), save=save))
        elif kind == "prop":
            p = root / "prop" / f"{it['id']}.webp"
            if p.exists():
                continue

            def save(raw, it=it, p=p):
                from rembg import remove
                im = remove(Image.open(io.BytesIO(raw)).convert("RGBA"))
                im = im.crop(im.getchannel("A").getbbox())
                im.thumbnail((1024, 1024))
                p.parent.mkdir(parents=True, exist_ok=True)
                im.save(p, "WEBP", quality=90)
                record("prop", it, "main", it["prompt"])
                print("ok", p)
            prompt = STYLE + f"A single object, no character: {it['prompt']}, {GREY}"
            jobs.append(dict(name=f"prop/{it['id']}", prompt=prompt, refs=style, size=(1024, 1024), save=save))
    return jobs


def main(manifest, out="public"):
    items = json.load(open(manifest))
    lib_path = pathlib.Path("library.json")
    lib = json.loads(lib_path.read_text().strip() or "{}") if lib_path.exists() else {}  # blank file = empty library
    pending = build_jobs(items, out, lib, lib_path)
    for name in os.environ.get("IMG_PROVIDERS", "cloudflare,kaggle").split(","):
        if not pending or not all(k in os.environ for k in KEYS[name]):
            continue
        try:
            pending = PROVIDERS[name](pending)
        except Exception as e:
            print(f"{name} failed: {e}", file=sys.stderr)
    for j in pending:
        print(f"FAILED {j['name']}", file=sys.stderr)
    return 1 if pending else 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:3]))
