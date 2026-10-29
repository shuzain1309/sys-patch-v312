import io, json, os, pathlib, tempfile
from PIL import Image
import gen_assets as g

def png():
    b = io.BytesIO(); Image.new("RGB", (1024, 1024), "tan").save(b, "PNG"); return b.getvalue()

def calls():
    log = []
    def bad(p, r): log.append("cf"); raise RuntimeError("429")
    def good(p, r): log.append("gem"); return png()
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
print("ok")
