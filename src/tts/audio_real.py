#!/usr/bin/env python3
"""Real recordings only (Freesound, CC0). Nothing here synthesises sound.
  FREESOUND_KEY=.. audio_real.py fetch sfx|music         download every key that has no file yet -> sfx-real/ | music-real/
  FREESOUND_KEY=.. audio_real.py candidates sfx|music    list the best matches per missing key (id, name, length, link) so you can listen and pin an id
  audio_real.py build public/audio [credits.txt]         every render: normalise each file to a fixed loudness -> public/audio/{sfx,music}/<key>.wav + manifest.json
The file name IS the script key. A key's value in sfx-real-name.json / music-name.json is a search text, a Freesound id (pins a sound),
or {q, id, min, max}. Freesound serves 128 kbps mp3 previews through the token API; the original needs OAuth, so previews are what we keep.
"""
import json, os, pathlib, re, subprocess, sys, time, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
KINDS = {'sfx': ('sfx-real-name.json', 'sfx-real', 'sfx-real-credits.json'),
         'music': ('music-name.json', 'music-real', 'music-real-credits.json')}
EXT = ('.mp3', '.ogg', '.wav', '.flac')
API = 'https://freesound.org/apiv2'
FIELDS = 'id,name,username,license,duration,previews,avg_rating,num_ratings,num_downloads'
CC0 = 'license:"Creative Commons 0"'


def load(kind):
    cfg_f, lib, cred_f = KINDS[kind]
    return json.loads((ROOT / cfg_f).read_text()), ROOT / lib, ROOT / cred_f


def get(url):
    time.sleep(1.1)  # API limit is 60 requests/minute
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read()


def api(path, **q):
    q['token'] = os.environ['FREESOUND_KEY']
    return json.loads(get(f'{API}/{path}?' + urllib.parse.urlencode(q)))


def spec(val, cfg):
    """key value -> (search text | None, pinned id | None, min seconds, max seconds)"""
    v = val if isinstance(val, dict) else {('id' if isinstance(val, int) else 'q'): val}
    return v.get('q'), v.get('id'), v.get('min', cfg.get('min_seconds', 0.2)), v.get('max', cfg.get('max_seconds', 8))


def rank(s):
    """Prefer sounds other people rated well and downloaded often: a cheap proxy for recording quality."""
    return ((s.get('avg_rating') or 0) if (s.get('num_ratings') or 0) >= 3 else 0, s.get('num_downloads') or 0)


def search(val, cfg, n=10):
    q, sid, lo, hi = spec(val, cfg)
    if sid:
        return [api(f'sounds/{sid}/', fields=FIELDS)]
    r = api('search/text/', query=q, fields=FIELDS, page_size=n, filter=f'{CC0} duration:[{lo} TO {hi}]')['results']
    return sorted(r, key=rank, reverse=True)


def missing(kind):
    cfg, lib, _ = load(kind)
    have = {p.stem for p in lib.glob('*') if p.suffix in EXT} if lib.exists() else set()
    return cfg, lib, [(k, v) for k, v in cfg['keys'].items() if k not in have]


def fetch(kind):
    cfg, lib, todo = missing(kind)
    lib.mkdir(exist_ok=True)
    cred_f = load(kind)[2]
    cred = json.loads(cred_f.read_text()) if cred_f.exists() else {}
    for key, val in todo:
        found = search(val, cfg)
        if not found:
            print(f'::warning::nothing found for {key} ({val})')
            continue
        s = found[0]
        (lib / f'{key}.mp3').write_bytes(get(s['previews']['preview-hq-mp3']))
        cred[key] = {k: s[k] for k in ('id', 'name', 'username', 'license')}
        print(f'{key}: {s["name"]} (id {s["id"]}, {s["duration"]:.0f}s)')
    cred_f.write_text(json.dumps(cred, indent=1))


def candidates(kind, n=5):
    cfg, _, todo = missing(kind)
    for key, val in todo:
        print(f'\n== {key}  ({val})')
        for s in search(val, cfg)[:n]:
            print(f'   id {s["id"]:>8}  {s["duration"]:6.1f}s  by {s["username"]}  "{s["name"]}"  https://freesound.org/s/{s["id"]}/')
    print('\nPin a pick: set the key to its id (number) in the json file, then run fetch.')


# ---------------------------------------------------------------- build
def run(*a):
    return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', *a], capture_output=True, text=True)


def vol(src):
    """mean / max volume in dB (ffmpeg volumedetect)"""
    t = run('-i', str(src), '-af', 'volumedetect', '-f', 'null', '-').stderr
    m = re.search(r'mean_volume: (-?[\d.]+) dB', t), re.search(r'max_volume: (-?[\d.]+) dB', t)
    if not all(m):
        raise RuntimeError(f'cannot read {src}: {t[-300:]}')
    return float(m[0][1]), float(m[1][1])


def seconds(p):
    o = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)], capture_output=True, text=True).stdout.strip()
    return round(float(o), 2)


def norm_sfx(src, dst, mean_db, peak_db):
    """One gain per file: bring the average to mean_db, but never let the peak pass peak_db."""
    mean, peak = vol(src)
    gain = max(-30, min(30, min(mean_db - mean, peak_db - peak)))
    dur = seconds(src)
    fade = min(0.02, dur / 4)
    r = run('-y', '-i', str(src), '-ar', '48000', '-ac', '1', '-af', f'volume={gain}dB,afade=t=in:d=0.003,afade=t=out:st={max(0, dur - fade):.3f}:d={fade:.3f}', '-c:a', 'pcm_s16le', str(dst))
    if r.returncode:
        raise RuntimeError(r.stderr[-300:])


def norm_music(src, dst, lufs):
    """Two-pass EBU R128 so every track sits at the same loudness; stereo 48 kHz."""
    tp = -2
    a = run('-i', str(src), '-af', f'loudnorm=I={lufs}:TP={tp}:LRA=11:print_format=json', '-f', 'null', '-').stderr
    j = json.loads(a[a.rindex('{'):a.rindex('}') + 1])
    af = (f'loudnorm=I={lufs}:TP={tp}:LRA=11:measured_I={j["input_i"]}:measured_TP={j["input_tp"]}:measured_LRA={j["input_lra"]}'
          f':measured_thresh={j["input_thresh"]}:offset={j["target_offset"]}:linear=true')
    r = run('-y', '-i', str(src), '-ar', '48000', '-ac', '2', '-af', af, '-c:a', 'pcm_s16le', str(dst))
    if r.returncode:
        raise RuntimeError(r.stderr[-300:])


def build(out, credits=None):
    out = pathlib.Path(out)
    mix = json.loads((ROOT / 'audio-mix.json').read_text())
    man = {'sfx': {}, 'music': {}, 'levels': {k: v for k, v in mix.items() if not k.startswith('_')}}
    lines = []
    for kind in KINDS:
        _, lib, cred_f = load(kind)
        (out / kind).mkdir(parents=True, exist_ok=True)
        cred = json.loads(cred_f.read_text()) if cred_f.exists() else {}
        for p in sorted(lib.glob('*')) if lib.exists() else []:
            if p.suffix not in EXT:
                continue
            dst = out / kind / f'{p.stem}.wav'
            if kind == 'music':
                norm_music(p, dst, mix['music_lufs'])
            else:
                loop = p.stem.endswith('_loop')  # ambience beds sit lower than one-shot effects
                norm_sfx(p, dst, mix['sfx']['mean_db'] - (4 if loop else 0), mix['sfx']['peak_db'])
            man[kind][p.stem] = {'sec': seconds(dst)}
            c = cred.get(p.stem)
            lines.append(f'{kind}/{p.stem}: ' + (f'{c["name"]} by {c["username"]} ({c["license"]}) freesound.org/s/{c["id"]}' if c else 'added by hand, licence not recorded'))
    (out / 'manifest.json').write_text(json.dumps(man))
    if credits:
        pathlib.Path(credits).parent.mkdir(parents=True, exist_ok=True)
        pathlib.Path(credits).write_text('Sound effects and music used by this render (real recordings, CC0 unless stated)\n\n' + '\n'.join(lines) + '\n')
    print(f'audio: {len(man["sfx"])} effects, {len(man["music"])} music tracks')
    if not man['sfx']:
        print('::warning::sfx-real/ is empty; run the fetch-sfx workflow once')
    if not man['music']:
        print('::warning::music-real/ is empty; run the fetch-music workflow if the script has a MUSIC block')


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[0] == 'fetch':
        fetch(a[1])
    elif a[0] == 'candidates':
        candidates(a[1])
    else:
        build(a[1] if len(a) > 1 else 'public/audio', a[2] if len(a) > 2 else None)
