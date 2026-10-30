import base64
import io, json, os, pathlib, tempfile
from PIL import Image
import gen_assets as g

def png():
    b = io.BytesIO(); Image.new("RGB", (1024, 1024), "tan").save(b, "PNG"); return b.getvalue()

def calls():
    log = []
    def bad(p, r, s=None): log.append("cf"); raise RuntimeError("429")
    def good(p, r, s=None): log.append("gem"); return png()
    return log, bad, good

os.chdir(tempfile.mkdtemp())
log, bad, good = calls()
g.PROVIDERS = {"cloudflare": (bad, "K1"), "gemini": (good, "K2")}
os.environ.update(K1="x", K2="x")
pathlib.Path("m.json").write_text(json.dumps([{"kind": "bg", "id": "hill", "prompt": "olive hills", "tags": ["rome"]}]))
assert g.main("m.json") == 0 and log == ["cf", "gem"]          # falls through to second provider
im = Image.open("public/bg/hill/main.webp"); assert im.size == (1920, 1080)
assert json.load(open("library.json"))["bgs"]["hill"]["tags"] == ["rome"]
g.main("m.json"); assert log == ["cf", "gem"]                   # cached: no second call
del os.environ["K1"], os.environ["K2"]
pathlib.Path("m2.json").write_text(json.dumps([{"kind": "bg", "id": "x", "prompt": "y"}]))
assert g.main("m2.json") == 1                                   # no keys -> reports failure
# reference pose must go to klein as multipart with input_image_0
import requests
seen = {}
class R:
    ok = True
    def json(self): return {"result": {"image": base64.b64encode(png()).decode()}}
def fake(url, **kw): seen.update(url=url, files=kw.get("files")); return R()
requests.post = fake
os.environ.update(CF_ACCOUNT_ID="a", CF_API_TOKEN="t")
g.cloudflare("pose", [png()])
assert seen["url"].endswith("flux-2-klein-9b") and "input_image_0" in seen["files"]
g.cloudflare("pose", None)
assert seen["url"].endswith("flux-1-schnell") and seen["files"] is None
# sheet: 3x2 grid, one blob per cell; rembg faked as identity
import sys, types
sys.modules["rembg"] = types.SimpleNamespace(remove=lambda im: im)
def sheet_png(skip_cell=None, spill=False):
    im = Image.new("RGBA", (1920, 1920), (0, 0, 0, 0))
    for i in range(6):
        if i == skip_cell: continue
        x, y = (i % 3) * 640, (i // 3) * 960
        box = (x + 100, y + 100, x + 540, y + 860) if not spill else (x, y + 100, x + 640, y + 860)
        im.paste((255, 0, 0, 255), box)
    b = io.BytesIO(); im.save(b, "PNG"); return b.getvalue()
assert len(g.split_sheet(sheet_png(), 3, 2)) == 6
for bad in (dict(skip_cell=4), dict(spill=True)):
    try: g.split_sheet(sheet_png(**bad), 3, 2); raise SystemExit("should fail")
    except ValueError: pass
os.chdir(tempfile.mkdtemp())
g.generate = lambda p, refs=None, size=None: sheet_png()
pathlib.Path("s.json").write_text(json.dumps([{"kind": "sheet", "id": "c", "prompt": "x", "poses": {n: n for n in "abcdef"}}]))
assert g.main("s.json") == 0 and len(list(pathlib.Path("public/char/c").glob("*.webp"))) == 6
assert list(json.load(open("library.json"))["chars"]["c"]["poses"]) == list("abcdef")
pathlib.Path("library.json").write_text("\n")                  # blank library file must not crash
pathlib.Path("public").mkdir(exist_ok=True)
assert g.main("s.json") == 0
print("ok")
