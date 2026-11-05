#!/usr/bin/env python3
"""terrain.py <params.json>: realistic relief maps for thumbnails.
params = {"out": "public/thumb", "frames": [{"id": "A", "w": 1920, "h": 1080, "lon": 53, "lat": 32.5, "s": 3300, "tx": 912, "ty": 540}]}
Each frame is a Web-Mercator view (same maths as d3 geoMercator().center([lon,lat]).translate([tx,ty]).scale(s)).
Per frame it writes terrain-<id>.png (the styled map) and relief-<id>.png (red-tinted relief, to be clipped to the subject).
Sources, first that works: 1. NASA GIBS Blue Marble shaded relief + bathymetry (public domain, real land cover colours),
2. AWS terrain tiles (Terrarium: SRTM/GMTED/ETOPO1) coloured by height and hill-shaded. Prints one JSON line {id: source|"none"}; never raises.
Env GIBS_BASE / TERRARIUM_BASE override the tile servers (used by the offline test)."""
import concurrent.futures as cf, io, json, math, os, sys, urllib.request
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

UA = 'history-explainer-pipeline/1.0 (thumbnail maps)'
GIBS = os.environ.get('GIBS_BASE', 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8')
TERR = os.environ.get('TERRARIUM_BASE', 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium')
SOURCES = {'nasa': dict(max_z=8, url=lambda z, x, y: f'{GIBS}/{z}/{y}/{x}.jpeg'), 'terrain': dict(max_z=10, url=lambda z, x, y: f'{TERR}/{z}/{x}/{y}.png')}


def get(url, tries=3):
    last = None
    for _ in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40) as r:
                return r.read()
        except Exception as e:
            last = e
    raise last


def sample(fr, src):
    """-> float32 array (h, w, 3): the source tiles resampled onto the frame, or raises."""
    w, h, s = fr['w'], fr['h'], fr['s']
    psi0 = math.log(math.tan(math.pi / 4 + math.radians(fr['lat']) / 2))
    z = min(SOURCES[src]['max_z'], max(0, math.ceil(math.log2(2 * math.pi * s / 256))))
    while True:
        lam = math.radians(fr['lon']) + (np.arange(w) - fr['tx']) / s                      # separable: x only
        psi = psi0 - (np.arange(h) - fr['ty']) / s                                          # y only
        n = 2 ** z
        fx = (lam + math.pi) / (2 * math.pi) * n
        fy = (1 - psi / math.pi) / 2 * n
        x0, x1, y0, y1 = int(np.floor(fx.min())), int(np.floor(fx.max())), max(0, int(np.floor(fy.min()))), min(n - 1, int(np.floor(fy.max())))
        if (x1 - x0 + 1) * (y1 - y0 + 1) <= 160 or z == 0: break
        z -= 1
    xs, ys = range(x0, x1 + 1), range(y0, y1 + 1)
    mos = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256, 3), np.uint8)
    jobs = {(x, y): SOURCES[src]['url'](z, x % n, y) for x in xs for y in ys}
    bad = 0
    with cf.ThreadPoolExecutor(8) as ex:
        res = {k: ex.submit(get, u) for k, u in jobs.items()}
    for (x, y), f in res.items():
        try:
            im = Image.open(io.BytesIO(f.result())).convert('RGB')
            if im.size != (256, 256): im = im.resize((256, 256))
            mos[(y - y0) * 256:(y - y0 + 1) * 256, (x - x0) * 256:(x - x0 + 1) * 256] = np.asarray(im)
        except Exception:
            bad += 1
    if bad > 0.1 * len(jobs): raise RuntimeError(f'{bad} of {len(jobs)} tiles missing from {src}')
    PX, PY = np.meshgrid(fx * 256 - x0 * 256, fy * 256 - y0 * 256)
    out = np.stack([ndi.map_coordinates(mos[..., c].astype(np.float32), [PY, PX], order=1, mode='nearest') for c in range(3)], -1)
    return out, z


def vivid(rgb, rng):
    """NASA Blue Marble colours -> the saturated gold / green / brown relief look of the reference thumbnails."""
    c = rgb / 255.0
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    ocean = ndi.gaussian_filter(np.clip((b - np.maximum(r, g) - 0.015) / 0.09, 0, 1), 1.0)
    # land: strong saturation, warm gold push, local contrast so ridges go brown
    land = lum[..., None] + (c - lum[..., None]) * 1.95
    land = land * np.array([1.07, 1.0, 0.82]) + 0.03
    detail = lum - ndi.gaussian_filter(lum, 5)
    big = lum - ndi.gaussian_filter(lum, 22)
    land = land + (detail * 2.4 + big * 1.6)[..., None]
    land = (land - 0.5) * 1.22 + 0.53
    grain = ndi.gaussian_filter(rng.normal(0, 1, lum.shape), 0.6) * 0.06
    land = land + grain[..., None]
    # ocean: vivid blue, lighter in shallow water, bright cyan fringe along the coast
    shallow = np.clip(lum * 3.0, 0, 1) ** 1.2
    deep, mid = np.array([0.05, 0.30, 0.82]), np.array([0.10, 0.48, 0.96])
    sea = deep + (mid - deep) * shallow[..., None]
    dist = ndi.distance_transform_edt(ocean > 0.5)
    glow = np.exp(-dist / 16.0)[..., None]
    sea = sea + (np.array([0.35, 0.82, 1.0]) - sea) * glow * 0.75
    out = land * (1 - ocean[..., None]) + sea * ocean[..., None]
    relief = np.clip(0.5 + detail * 6.0 + big * 3.5, 0, 1)
    return np.clip(out, 0, 1), relief, ocean


def from_dem(rgb, fr, z, rng):
    """Terrarium tiles -> height in metres -> palette + hill-shade (fallback source)."""
    e = rgb[..., 0] * 256.0 + rgb[..., 1] + rgb[..., 2] / 256.0 - 32768.0
    e = ndi.gaussian_filter(e, 1.0)
    lat = np.degrees(2 * np.arctan(np.exp(math.log(math.tan(math.pi / 4 + math.radians(fr['lat']) / 2)) - (np.arange(fr['h']) - fr['ty']) / fr['s'])) - math.pi / 2)
    m = 40075016.7 / (2 * math.pi * fr['s']) * np.cos(np.radians(lat))[:, None]          # metres per output pixel
    gy, gx = np.gradient(e)
    gx, gy = gx / m, gy / m
    az, alt, zf = math.radians(315), math.radians(42), 3.6
    slope = np.arctan(zf * np.hypot(gx, gy)); asp = np.arctan2(gy, -gx)
    hill = np.clip(np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - asp), 0, 1)
    stops = [(0, (70, 150, 50)), (250, (112, 165, 55)), (600, (200, 172, 48)), (1000, (232, 176, 32)), (1700, (205, 140, 30)), (2600, (150, 100, 40)), (3800, (110, 80, 60)), (5500, (235, 235, 235))]
    land = np.stack([np.interp(e, [a for a, _ in stops], [c[i] for _, c in stops]) for i in range(3)], -1) / 255.0
    land = land * (0.35 + 1.0 * hill[..., None]) + ndi.gaussian_filter(rng.normal(0, 1, e.shape), 0.6)[..., None] * 0.05
    ocean = ndi.gaussian_filter((e < 0).astype(float), 1.0)
    shallow = np.clip(1 + e / 1800.0, 0, 1)
    deep, mid = np.array([0.05, 0.30, 0.82]), np.array([0.10, 0.48, 0.96])
    sea = deep + (mid - deep) * shallow[..., None]
    dist = ndi.distance_transform_edt(ocean > 0.5)
    sea = sea + (np.array([0.35, 0.82, 1.0]) - sea) * np.exp(-dist / 16.0)[..., None] * 0.75
    out = land * (1 - ocean[..., None]) + sea * ocean[..., None]
    return np.clip(out, 0, 1), np.clip(hill * 1.15 - 0.1, 0, 1), ocean


def redden(relief, rng):
    """relief 0..1 -> the red used inside the subject: dark red ridges, bright red plains, fine grain"""
    t = np.clip(relief + ndi.gaussian_filter(rng.normal(0, 1, relief.shape), 0.7) * 0.05, 0, 1)[..., None]
    lo, mid, hi = np.array([0.30, 0.0, 0.0]), np.array([0.86, 0.04, 0.05]), np.array([1.0, 0.24, 0.20])
    return np.where(t < 0.5, lo + (mid - lo) * (t / 0.5), mid + (hi - mid) * ((t - 0.5) / 0.5))


def main(pf):
    p = json.load(open(pf)); os.makedirs(p['out'], exist_ok=True); status = {}
    for fr in p['frames']:
        rng = np.random.default_rng(7)
        status[fr['id']] = 'none'
        for src in ('nasa', 'terrain'):
            try:
                rgb, z = sample(fr, src)
                col, rel, _ = vivid(rgb, rng) if src == 'nasa' else from_dem(rgb, fr, z, rng)
                Image.fromarray((col * 255).astype(np.uint8)).save(os.path.join(p['out'], f'terrain-{fr["id"]}.png'))
                Image.fromarray((redden(rel, rng) * 255).astype(np.uint8)).save(os.path.join(p['out'], f'relief-{fr["id"]}.png'))
                status[fr['id']] = src; break
            except Exception as e:
                print(f'terrain {fr["id"]}: {src} failed: {str(e)[:160]}', file=sys.stderr)
    print(json.dumps(status))


if __name__ == '__main__':
    try:
        main(sys.argv[1])
    except Exception as e:
        print(json.dumps({}), file=sys.stderr); print(f'terrain failed: {e}', file=sys.stderr); print('{}')
