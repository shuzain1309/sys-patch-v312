#!/usr/bin/env python3
"""photos.py : real photos, paintings, maps and portraits for a script. Fetched at BUILD time (merge job), never at render time.
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
import json, os, pathlib, re, subprocess, sys, tempfile, time, urllib.parse, urllib.request

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
    block = 'Image credits:\n' + '\n'.join(f'{c["title"]} by {c["artist"]} ({c["license"]}) {c["page"]}' for c in credits.values())
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


def run(photos_json='photos.json', out_dir='public/photos', credits_txt='out/photos-credits.txt'):
    items = json.loads(pathlib.Path(photos_json).read_text()) if pathlib.Path(photos_json).exists() else []
    pathlib.Path(out_dir).mkdir(parents=True, exist_ok=True)
    pathlib.Path(out_dir, '.keep').write_text('')  # the artifact upload needs the folder to exist even when there are no photos
    if not items:
        print('photos: none in this script'); return 0
    credits, errors = {}, []
    for it in items:
        pid = it['id']
        try:
            found, why = openverse(it) if it.get('provider') == 'openverse' else commons(it)
            if not found:
                raise RuntimeError('no usable image. ' + '; '.join(why[:4]))
            last = None
            for cand in found[:3]:  # first candidates may fail to download; try the next
                try:
                    to_jpg(get(cand['url']), pathlib.Path(out_dir) / f'{pid}.jpg'); credits[pid] = cand; break
                except Exception as e:
                    last = e
            else:
                raise RuntimeError(f'download failed: {last}')
            print(f'{pid}: {credits[pid]["title"]} ({credits[pid]["license"]})')
        except Exception as e:
            errors.append(f'{pid}: {e}')
    pathlib.Path(credits_txt).parent.mkdir(parents=True, exist_ok=True)
    with open(credits_txt, 'w', encoding='utf-8') as f:
        f.write('Images used by this render\n\n' + '\n'.join(credit_line(k, v) for k, v in credits.items()) + '\n')
    pathlib.Path(out_dir, 'credits.json').write_text(json.dumps(credits, indent=1))
    patch_seo(credits)
    for e in errors:
        print('::error::photo ' + e)
    return 1 if errors else 0


def candidates(catalog, n=4):
    """Audition mode: for each catalog entry list the top usable (licence-safe) results, to pick one and pin it with "file"."""
    data = json.loads(pathlib.Path(catalog).read_text())
    for it in data.get('photos', data) if isinstance(data, dict) else data:
        try:
            found, why = openverse(it) if it.get('provider') == 'openverse' else commons(it)
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
    else:
        sys.exit(run(*sys.argv[1:4]))
