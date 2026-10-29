#!/usr/bin/env python3
"""Real (recorded, CC0) sound effects instead of synthesised ones.
  python src/tts/sfx_real.py fetch              one-off: download the packs in sfx-real-name.json into sfx-real/
  python src/tts/sfx_real.py build public/sfx   every render: sfx-real/ -> public/sfx/<script key>.wav, quiet
Script key -> file is decided only by sfx-real-name.json ("keys": key -> file-name prefix)."""
import json, pathlib, shutil, subprocess, sys, tempfile
ROOT = pathlib.Path(__file__).resolve().parents[2]
LIB = ROOT / 'sfx-real'
CFG = json.loads((ROOT / 'sfx-real-name.json').read_text())
EXT = ('.ogg', '.wav', '.mp3')

def ff(src, dst, db):  # 24 kHz mono wav, quieter by db
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src), '-ar', '24000', '-ac', '1',
                    '-af', f'volume={db}dB', str(dst)], check=True)

def fetch():
    LIB.mkdir(exist_ok=True)
    for url in CFG['sources']:
        tmp = tempfile.mkdtemp()
        subprocess.run(['git', 'clone', '--depth', '1', url, tmp], check=True)
        for p in pathlib.Path(tmp).rglob('*'):
            if p.suffix.lower() in EXT: shutil.copy(p, LIB / p.name)
    names = sorted(p.name for p in LIB.iterdir())
    (ROOT / 'sfx-real-index.txt').write_text('\n'.join(names) + '\n')
    print(f'{len(names)} files in sfx-real/; list in sfx-real-index.txt')

def build(out):
    out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
    for k in CFG.get('drop', []): (out / f'{k}.wav').unlink(missing_ok=True)  # synthetic sounds we do not want
    for w in out.glob('*.wav'):  # older synthetic effects: quieter, music untouched
        if 'music' in w.name: continue
        tmp = w.with_name(w.stem + '.tmp.wav'); ff(w, tmp, CFG['legacy_gain_db']); tmp.replace(w)
    files = sorted(p for p in LIB.glob('*') if p.suffix.lower() in EXT) if LIB.exists() else []
    if not files: print('::warning::sfx-real/ is empty; run the fetch-sfx workflow once')
    missing = []
    for key, prefix in CFG['keys'].items():
        hit = [p for p in files if p.name.lower().startswith(prefix.lower())]
        if hit: ff(hit[0], out / f'{key}.wav', CFG['gain_db'])
        else: missing.append(key)
    print(f'real effects: {len(CFG["keys"]) - len(missing)} mapped; no file for: {", ".join(missing) or "none"}')

if __name__ == '__main__':
    fetch() if sys.argv[1] == 'fetch' else build(sys.argv[2] if len(sys.argv) > 2 else 'public/sfx')
