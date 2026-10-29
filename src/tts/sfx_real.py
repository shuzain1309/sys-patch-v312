#!/usr/bin/env python3
"""Real (recorded, CC0) sound effects from Freesound instead of synthesised ones.
  FREESOUND_KEY=... python src/tts/sfx_real.py fetch   download every key in sfx-real-name.json that has no file yet -> sfx-real/<key>.mp3
  python src/tts/sfx_real.py build public/sfx          every render: sfx-real/<key>.* -> public/sfx/<key>.wav (24 kHz mono, quieter)
The file name IS the script key, so there is no renaming step. A key's value in sfx-real-name.json is a search text,
or a Freesound id (number) to pin a sound. What was picked (id, name, licence, author) is written to sfx-real-credits.json."""
import json, os, pathlib, subprocess, sys, time, urllib.parse, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[2]
LIB = ROOT / 'sfx-real'
CFG = json.loads((ROOT / 'sfx-real-name.json').read_text())
EXT = ('.mp3', '.ogg', '.wav')
API = 'https://freesound.org/apiv2'
FIELDS = 'id,name,username,license,duration,previews'

def get(url):
    time.sleep(1.1)  # API limit is 60 requests/minute
    with urllib.request.urlopen(url, timeout=60) as r: return r.read()

def api(path, **q):
    q['token'] = os.environ['FREESOUND_KEY']
    return json.loads(get(f'{API}/{path}?' + urllib.parse.urlencode(q)))

def pick(val):
    if isinstance(val, int): return api(f'sounds/{val}/', fields=FIELDS)
    r = api('search/text/', query=val, fields=FIELDS, page_size=5,
            filter=f'license:"Creative Commons 0" duration:[0.2 TO {CFG["max_seconds"]}]')['results']
    return r[0] if r else None

def fetch():
    LIB.mkdir(exist_ok=True)
    cred_f = ROOT / 'sfx-real-credits.json'
    cred = json.loads(cred_f.read_text()) if cred_f.exists() else {}
    for key, val in CFG['keys'].items():
        if any((LIB / f'{key}{e}').exists() for e in EXT): continue
        s = pick(val)
        if not s: print(f'::warning::nothing found for {key} ({val})'); continue
        (LIB / f'{key}.mp3').write_bytes(get(s['previews']['preview-hq-mp3']))
        cred[key] = {k: s[k] for k in ('id', 'name', 'username', 'license')}
        print(f'{key}: {s["name"]} (id {s["id"]})')
    cred_f.write_text(json.dumps(cred, indent=1))

def ff(src, dst, db):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src), '-ar', '24000', '-ac', '1',
                    '-af', f'volume={db}dB', str(dst)], check=True)

def build(out):
    out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
    for w in out.glob('*.wav'):  # leftover synthetic effects: gain only, music untouched
        if 'music' in w.name or not CFG['legacy_gain_db']: continue
        tmp = w.with_name(w.stem + '.tmp.wav'); ff(w, tmp, CFG['legacy_gain_db']); tmp.replace(w)
    for k in [*CFG['drop'], *CFG['keys']]:  # synthetic sounds become silence; real files overwrite below, and a missing file would stall the render
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.1', str(out / f'{k}.wav')], check=True)
    done = []
    for p in sorted(LIB.glob('*')) if LIB.exists() else []:
        if p.suffix in EXT: ff(p, out / f'{p.stem}.wav', CFG['gain_db']); done.append(p.stem)
    miss = [k for k in CFG['keys'] if k not in done]
    if not done: print('::warning::sfx-real/ is empty; run the fetch-sfx workflow once')
    print(f'real effects: {len(done)}; no file for: {", ".join(miss) or "none"}')

if __name__ == '__main__':
    fetch() if sys.argv[1] == 'fetch' else build(sys.argv[2] if len(sys.argv) > 2 else 'public/sfx')
