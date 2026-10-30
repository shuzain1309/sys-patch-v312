import base64, io, json, os, pathlib, subprocess, sys, tempfile, types
from PIL import Image
import requests
sys.modules["rembg"] = types.SimpleNamespace(remove=lambda im: im)  # identity: tests need no model download
import gen_assets as g

def png(size=(1024, 1024)):
    b = io.BytesIO(); Image.new("RGB", size, "tan").save(b, "PNG"); return b.getvalue()

def sheet_png(skip=None, spill=False):
    im = Image.new("RGBA", (1920, 1920), (0, 0, 0, 0))
    for i in range(6):
        if i == skip: continue
        x, y = (i % 3) * 640, (i // 3) * 960
        im.paste((255, 0, 0, 255), (x, y + 100, x + 640, y + 860) if spill else (x + 100, y + 100, x + 540, y + 860))
    b = io.BytesIO(); im.save(b, "PNG"); return b.getvalue()

assert len(g.split_sheet(sheet_png(), 3, 2)) == 6
for bad in (dict(skip=4), dict(spill=True)):
    try: g.split_sheet(sheet_png(**bad), 3, 2); raise SystemExit("should fail")
    except ValueError: pass

os.chdir(tempfile.mkdtemp())
pathlib.Path("style").mkdir(); pathlib.Path("style/style_ref.png").write_bytes(png((900, 700)))
ITEMS = [{"kind": "sheet", "id": "c", "prompt": "x", "tags": ["t"], "poses": {n: n for n in "abcdef"}},
         {"kind": "bg", "id": "hill", "prompt": "hills"}, {"kind": "prop", "id": "sign", "prompt": "wooden sign"}]
pathlib.Path("m.json").write_text(json.dumps(ITEMS))

# 1. real cloudflare(): klein-4b URL, multipart refs under 512px, 4006 quota stops the loop and hands jobs on
calls = []
class R:
    def __init__(s, ok=True, code=200, text=""): s.ok, s.status_code, s.text = ok, code, text
    def json(s): return {"result": {"image": base64.b64encode(sheet_png()).decode()}}
def fake_post(url, **kw):
    calls.append((url, kw["files"]))
    return R() if len(calls) == 1 else R(False, 429, '{"code":4006}')
requests.post = fake_post
os.environ.update(CF_ACCOUNT_ID="a", CF_API_TOKEN="t")
left = g.cloudflare(g.build_jobs(ITEMS, "public", {}, pathlib.Path("library.json")))
assert calls[0][0].endswith("flux-2-klein-4b") and "input_image_0" in calls[0][1]
assert Image.open(io.BytesIO(calls[0][1]["input_image_0"][1])).size[0] <= 500
assert len(calls) == 2 and [j["name"] for j in left] == ["bg/hill", "prop/sign"]   # sheet saved, quota hit on 2nd, 3rd never tried
assert len(list(pathlib.Path("public/char/c").glob("*.webp"))) == 6

# 2. real kaggle() with the CLI mocked: kernel files, polling, output pickup
seen = {}
def fake_run(cmd, **kw):
    if cmd[2] == "push":
        d = pathlib.Path(cmd[4])
        seen["meta"] = json.loads((d / "kernel-metadata.json").read_text()); seen["code"] = (d / "k.py").read_text()
    if cmd[2] == "output":
        o = pathlib.Path(cmd[5]); o.mkdir(parents=True)
        for i in range(2): (o / f"{i}.png").write_bytes(png())
    return types.SimpleNamespace(stdout='has status "KernelWorkerStatus.COMPLETE"')
subprocess.run, g.time.sleep = fake_run, lambda s: None
os.environ.update(KAGGLE_USERNAME="u", KAGGLE_API_TOKEN="KGAT_x")
left = g.kaggle(left)
assert left == [] and seen["meta"]["enable_gpu"] and seen["meta"]["id"] == "u/ig-worker"
assert "JOBS = json.loads(" in seen["code"] and "Flux2KleinPipeline" in seen["code"]
assert pathlib.Path("public/bg/hill/main.webp").exists() and pathlib.Path("public/prop/sign.webp").exists()

# 3. main(): cloudflare out of quota -> everything falls to kaggle; library records it; blank library file tolerated
import shutil; shutil.rmtree("public"); pathlib.Path("library.json").write_text("\n")
requests.post = lambda url, **kw: R(False, 429, '{"code":4006}')
def fake_run2(cmd, **kw):
    if cmd[2] == "output":
        o = pathlib.Path(cmd[5]); o.mkdir(parents=True)
        (o / "0.png").write_bytes(sheet_png()); (o / "1.png").write_bytes(png()); (o / "2.png").write_bytes(png())
    return types.SimpleNamespace(stdout="complete")
subprocess.run = fake_run2
assert g.main("m.json") == 0
lib = json.load(open("library.json"))
assert list(lib["chars"]["c"]["poses"]) == list("abcdef") and "hill" in lib["bgs"] and "sign" in lib["props"]
assert g.main("m.json") == 0   # nothing pending now: cached
# 4. no credentials at all -> reports failure
for k in ("CF_ACCOUNT_ID", "CF_API_TOKEN", "KAGGLE_USERNAME", "KAGGLE_API_TOKEN"): os.environ.pop(k)
shutil.rmtree("public"); assert g.main("m.json") == 1
# 5. kernel error: the notebook log tail is printed and the batch is reported failed
def fake_run3(cmd, **kw):
    if cmd[2] == "output":
        o = pathlib.Path(cmd[5]); o.mkdir(parents=True, exist_ok=True); (o / "ig-worker.log").write_text("CUDA out of memory")
    return types.SimpleNamespace(stdout="error")
subprocess.run = fake_run3
os.environ.update(KAGGLE_USERNAME="u", KAGGLE_API_TOKEN="KGAT_x", IMG_PROVIDERS="kaggle")
shutil.rmtree("public", ignore_errors=True); assert g.main("m.json") == 1
print("ok")
