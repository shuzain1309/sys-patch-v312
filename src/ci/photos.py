#!/usr/bin/env python3
"""photos.py : real photos, paintings, maps and portraits for a script. Fetched at BUILD time (merge job), never at render time.
Cache: fetch-photos downloads a catalog once into photo-cache/<id>.jpg + <id>.json (credit); every render copies from there, so a render never depends on Commons being up.
Entry extras: "must": ["word"] (title must contain one), "alt": "caption for the placeholder card", "small_ok": true.
A photo that cannot be found STOPS the run before the render (no empty placeholder cards in a finished video). Set PHOTO_ALLOW_PLACEHOLDER=1 only for a throwaway test render.
Missing ones: the dashboard lists them (Photos card); save each as photo-cache/<id>.jpg (a jpg with no .json beside it counts as a user-supplied photo) and push.
Script block (strict JSON between the markers; CI reads it):
  export const PHOTOS = /*PHOTOS*/ [
    {"id": "caesar_bust", "file": "File:Gaius Iulius Caesar (Vatican Museum).jpg"},      exact Wikimedia Commons file (preferred: you verified it)
    {"id": "forum",       "q": "Roman Forum panorama"},                                  search Commons, first usable result
    {"id": "map_gaul",    "q": "Gaul map 58 BC", "provider": "openverse"}                 Openverse (CC images from many sources)
  ]/*PHOTOS*/;
Use them as {type:'photo', src:'photos/<id>.jpg'} scenes or {k:'photo', src:'photos/<id>.jpg', t:'caption'} props.
Licences accepted: public domain, CC0, CC BY (any version). Rejected: NC, ND, fair use, GFDL, and CC BY-SA unless the entry has "allow_sa": true
(share-alike can apply to the video). Every image's credit is written to out/photos-credits.txt and into the video description
({{CREDITS}} placeholder, or appended automatically when attribution is required). Any failure stops the run BEFORE the render.
"""
import json, os, pathlib, re, shutil, subprocess, sys, tempfile, time, urllib.parse, urllib.request

UA = os.environ.get('PHOTO_UA', 'history-explainer-pipeline/1.0 (educational videos; contact via the GitHub repo)')
MIN_W = 900


def get(url, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r:
                return r.read()
        except Exception as e:  # network hiccups and 429s: back off and retry
            if i == tries - 1:
                raise
            time.sleep(2 + 3 * i)


def get_json(url):
    return json.loads(get(url))


def tokens(s):
    return re.sub(r'[^a-z0-9]+', ' ', (s or '').lower()).split()


def license_ok(short, allow_sa=False):
    """-> (usable, attribution_required)"""
    t = tokens(short)
    if not t or {'nc', 'nd', 'gfdl'} & set(t) or 'fair' in t or 'non' in t:
        return False, False
    if 'cc0' in t or t[0] == 'pd' or t[:2] == ['public', 'domain'] or t[:2] == ['no', 'known'] or t[:2] == ['no', 'restrictions'] or 'pdm' in t:
        return True, False
    if t[0] == 'cc' and 'by' in t:
        if 'sa' in t and not allow_sa:
            return False, True
        return True, True
    return False, False


def strip_html(s):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s or '')).strip()


def commons(item):
    q = {'action': 'query', 'format': 'json', 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': 1920,
         'iiextmetadatafilter': 'LicenseShortName|Artist|Credit|ObjectName|NonFree|Copyrighted'}
    if item.get('file'):
        q['titles'] = item['file'] if item['file'].startswith('File:') else 'File:' + item['file']
    else:
        q.update({'generator': 'search', 'gsrsearch': item['q'] + ' filetype:bitmap', 'gsrnamespace': 6, 'gsrlimit': 12})
    pages = sorted(get_json('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(q)).get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 0))
    out, why = [], []
    for p in pages:
        ii = (p.get('imageinfo') or [{}])[0]
        md = ii.get('extmetadata', {})
        lic = (md.get('LicenseShortName') or {}).get('value', '')
        ok, attr = license_ok(lic, item.get('allow_sa', False))
        if (md.get('NonFree') or {}).get('value', '').lower() == 'true':
            ok = False
        if not ii or not ii.get('mime', '').startswith('image/') or ii.get('mime') in ('image/svg+xml', 'image/gif'):
            why.append(f'{p.get("title")}: not a photo/painting file'); continue
        if not ok:
            why.append(f'{p.get("title")}: licence "{lic}" not allowed'); continue
        if ii.get('width', 0) < MIN_W and not item.get('small_ok'):
            why.append(f'{p.get("title")}: only {ii.get("width")} px wide'); continue
        out.append({'title': strip_html((md.get('ObjectName') or {}).get('value')) or p.get('title', '').replace('File:', ''), 'artist': strip_html((md.get('Artist') or {}).get('value')) or 'unknown',
                    'license': lic, 'attribution': attr, 'page': ii.get('descriptionurl'), 'url': ii.get('thumburl') or ii.get('url')})
    return out, why


def openverse(item):
    q = urllib.parse.urlencode({'q': item['q'], 'license': 'cc0,pdm,by' + (',by-sa' if item.get('allow_sa') else ''), 'page_size': 12})
    out, why = [], []
    for r in get_json('https://api.openverse.org/v1/images/?' + q).get('results', []):
        if (r.get('width') or 0) < MIN_W and not item.get('small_ok'):
            why.append(f'{r.get("title")}: small'); continue
        lic = r.get('license', '')
        out.append({'title': r.get('title') or item['q'], 'artist': r.get('creator') or 'unknown', 'license': ('CC ' + lic.upper() + ' ' + (r.get('license_version') or '')).strip() if lic not in ('cc0', 'pdm') else ('CC0' if lic == 'cc0' else 'Public domain'),
                    'attribution': lic not in ('cc0', 'pdm'), 'page': r.get('foreign_landing_url') or r.get('url'), 'url': r.get('url')})
    return out, why


def to_jpg(raw, dst):
    with tempfile.NamedTemporaryFile(suffix='.img', delete=False) as t:
        t.write(raw)
    r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', t.name, '-vf', "scale='min(1920,iw)':-2", '-frames:v', '1', '-q:v', '3', str(dst)], capture_output=True, text=True)
    os.unlink(t.name)
    if r.returncode:
        raise RuntimeError(r.stderr[-200:])


def credit_line(pid, c):
    return f'photos/{pid}: "{c["title"]}" by {c["artist"]}, {c["license"]}. {c["page"]}'


def patch_seo(credits, seo_path='out/seo.json', desc_path='out/description.txt'):
    block = 'Image credits:\n' + '\n'.join(f'{c["title"]} by {c["artist"]} ({c["license"]}) {c["page"]}' for c in credits.values() if not c.get('manual'))
    need = any(c['attribution'] for c in credits.values())
    sp, dp = pathlib.Path(seo_path), pathlib.Path(desc_path)
    if not sp.exists():
        return
    seo = json.loads(sp.read_text())
    d = seo.get('description', '')
    d = d.replace('{{CREDITS}}', block) if '{{CREDITS}}' in d else (d + '\n\n' + block if need else d)
    seo['description'] = d
    sp.write_text(json.dumps(seo, ensure_ascii=False, indent=2))
    dp.write_text(d, encoding='utf-8')


CACHE = pathlib.Path(os.environ.get('PHOTO_CACHE', 'photo-cache'))  # committed to the repo by the fetch-photos workflow; reused by every render
STRICT = os.environ.get('PHOTO_ALLOW_PLACEHOLDER', '') != '1'  # default: a missing photo stops the run BEFORE the render; =1 draws a caption card instead (test renders only)


def find(it):
    """Search a provider and keep only results whose title/page matches the optional "must" list (any one word)."""
    found, why = openverse(it) if it.get('provider') == 'openverse' else commons(it)
    must = [m.lower() for m in it.get('must', [])]
    if must:
        keep = [c for c in found if any(m in (c['title'] + ' ' + (c['page'] or '')).lower() for m in must)]
        why += [f'{c["title"]}: does not contain {must}' for c in found if c not in keep]
        found = keep
    return found, why


def download(it, dst):
    """Live fetch of one entry -> jpg at dst, returns the credit dict."""
    found, why = find(it)
    if not found:
        raise RuntimeError('no usable image. ' + '; '.join(why[:4]))
    last = None
    for cand in found[:3]:  # first candidates may fail to download; try the next
        try:
            to_jpg(get(cand['url']), dst)
            return cand
        except Exception as e:
            last = e
    raise RuntimeError(f'download failed: {last}')


def cached(pid):
    j, c = CACHE / f'{pid}.jpg', CACHE / f'{pid}.json'
    if not (j.exists() and j.stat().st_size > 2000):
        return None
    if not c.exists():  # a jpg the user pushed by hand: no on-screen credit line, not listed in the description
        return {'title': pid, 'artist': 'unknown', 'license': 'user supplied', 'attribution': False, 'page': '', 'manual': True}
    try:
        return json.loads(c.read_text(encoding='utf-8'))
    except Exception:
        return None


def placeholder(it, dst):
    """A plain paper card with the caption, so a missing photo never breaks the render. Needs Pillow; falls back to a flat colour."""
    text = it.get('alt') or it['id'].replace('_', ' ')
    try:
        from PIL import Image, ImageDraw, ImageFont
        im = Image.new('RGB', (1600, 1000), '#ebe5d4')
        d = ImageDraw.Draw(im)
        d.rectangle([40, 40, 1560, 960], outline='#1f2430', width=6)
        font = None
        for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'):
            if os.path.exists(f):
                font = ImageFont.truetype(f, 88); break
        font = font or ImageFont.load_default()
        words, lines, cur = text.split(), [], ''
        for w in words:
            if len(cur + ' ' + w) > 22 and cur:
                lines.append(cur); cur = w
            else:
                cur = (cur + ' ' + w).strip()
        lines.append(cur)
        y = 500 - 55 * len(lines)
        for ln in lines:
            d.text((800, y), ln, fill='#1f2430', font=font, anchor='mm'); y += 110
        im.save(dst, quality=90)
    except Exception:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=0xebe5d4:s=1600x1000', '-frames:v', '1', str(dst)])


def run(photos_json='photos.json', out_dir='public/photos', credits_txt='out/photos-credits.txt'):
    items = json.loads(pathlib.Path(photos_json).read_text()) if pathlib.Path(photos_json).exists() else []
    pathlib.Path(out_dir).mkdir(parents=True, exist_ok=True)
    pathlib.Path(out_dir, '.keep').write_text('')  # the artifact upload needs the folder to exist even when there are no photos
    if not items:
        pathlib.Path(out_dir, 'credits.json').write_text('{}')  # kit.tsx reads it for the on-screen credit line
        print('photos: none in this script'); return 0
    credits, errors, holes = {}, [], []
    for it in items:
        pid, dst = it['id'], pathlib.Path(out_dir) / f'{it["id"]}.jpg'
        try:
            c = cached(pid)
            if c:
                shutil.copy(CACHE / f'{pid}.jpg', dst); credits[pid] = c
                print(f'{pid}: from photo-cache ({c["license"]})'); continue
            credits[pid] = download(it, dst)  # not cached yet: try live once (run the fetch-photos workflow to store it for good)
            print(f'{pid}: fetched live {credits[pid]["title"]} ({credits[pid]["license"]})  [run fetch-photos to cache it]')
        except Exception as e:
            if STRICT:
                errors.append(f'{pid}: {e}')
            else:
                placeholder(it, dst); holes.append(pid)
                print(f'::warning::photo {pid}: {e}. A caption card was used instead; run fetch-photos or pin a "file".')
    pathlib.Path(credits_txt).parent.mkdir(parents=True, exist_ok=True)
    with open(credits_txt, 'w', encoding='utf-8') as f:
        f.write('Images used by this render\n\n' + '\n'.join(credit_line(k, v) for k, v in credits.items()) + '\n')
    pathlib.Path(out_dir, 'credits.json').write_text(json.dumps(credits, indent=1))
    patch_seo(credits)
    if holes:
        print(f'photos: {len(holes)} placeholder card(s): {", ".join(holes)}')
    for e in errors:
        print('::error::photo ' + e)
    return 1 if errors else 0


def fetch(catalog, force=False):
    """fetch-photos workflow: download every entry of a catalog (or a script's photos.json) into photo-cache/ once. Never fails the workflow
    for one bad entry: it lists them so you can pin a "file" and run again."""
    data = json.loads(pathlib.Path(catalog).read_text(encoding='utf-8'))
    items = data.get('photos', data) if isinstance(data, dict) else data
    CACHE.mkdir(parents=True, exist_ok=True)
    ok = bad = skipped = 0
    mp = CACHE / '_missing.json'  # id -> why; the dashboard reads it to list what you must add by hand
    miss = json.loads(mp.read_text()) if mp.exists() else {}
    for it in items:
        pid = it['id']
        if cached(pid) and not force:
            skipped += 1; miss.pop(pid, None); continue
        try:
            c = download(it, CACHE / f'{pid}.jpg')
            c['id'], c['query'] = pid, it.get('file') or it.get('q')
            (CACHE / f'{pid}.json').write_text(json.dumps(c, ensure_ascii=False, indent=1), encoding='utf-8')
            ok += 1; miss.pop(pid, None)
            print(f'OK   {pid:<24} {c["license"]:<12} {c["title"][:60]}  {c["page"]}')
        except Exception as e:
            bad += 1; miss[pid] = str(e)[:300]
            print(f'MISS {pid:<24} {e}')
    mp.write_text(json.dumps(miss, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'\nphoto-cache: {ok} new, {skipped} already cached, {bad} missing. For misses: audition (List photo candidates), pin {{"file": "File:..."}} in the catalog, run again.')
    return 0


def candidates(catalog, n=4):
    """Audition mode: for each catalog entry list the top usable (licence-safe) results, to pick one and pin it with "file"."""
    data = json.loads(pathlib.Path(catalog).read_text())
    for it in data.get('photos', data) if isinstance(data, dict) else data:
        try:
            found, why = find(it)
        except Exception as e:
            print(f'\n== {it.get("id")}: ERROR {e}'); continue
        print(f'\n== {it.get("id")}  ({it.get("q") or it.get("file")})')
        for c in found[:n]:
            print(f'   {c["license"]:<14} {c["title"][:60]:<60} by {c["artist"][:30]}  {c["page"]}')
        if not found:
            print('   nothing usable. ' + '; '.join(why[:3]))
    print('\nPin a pick in your script: {"id": "...", "file": "File:<exact title as shown on the Commons page>"}')


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'candidates':
        candidates(sys.argv[2])
    elif len(sys.argv) > 2 and sys.argv[1] == 'fetch':
        sys.exit(fetch(sys.argv[2], force=len(sys.argv) > 3 and sys.argv[3] == 'force'))
    else:
        sys.exit(run(*sys.argv[1:4]))
