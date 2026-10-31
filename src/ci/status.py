#!/usr/bin/env python3
"""status.py : writes status.json for the dashboard (it is encrypted with SCRIPT_KEY by the workflow before it is committed).
Contains the Drive folder link, loudness QA, render timings. Nothing here is readable in the public repo."""
import datetime, glob, json, os, pathlib, sys

def read(p, d=None):
    try: return json.loads(pathlib.Path(p).read_text())
    except Exception: return d

perf = [read(p) for p in sorted(glob.glob('chunks/perf*.json'))]
pic = [p for p in perf if p and 'picture_s' in p]
aud = [p for p in perf if p and 'audio_s' in p]
folder = os.environ.get('DRIVE_FOLDER_ID', '')
out = {
    'sha': os.environ.get('GITHUB_SHA', ''),
    'slug': os.environ.get('SLUG', ''),
    'at': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
    'driveUrl': f'https://drive.google.com/drive/folders/{folder}' if folder else None,
    'audioQa': read('out/mix-qa.json'),
    'perf': {
        'chunks': len(pic), 'cores': pic[0]['cores'] if pic else None,
        'frames': sum(p['frames'] for p in pic),
        'picture_fps_per_runner': round(sum(p['frames'] for p in pic) / max(1, sum(p['picture_s'] for p in pic)), 2) if pic else None,
        'slowest_chunk_s': max([p['picture_s'] for p in pic] + [0]),
        'audio_pass_s_max': max([p['audio_s'] for p in aud] + [0]),
    },
}
pathlib.Path('status.json').write_text(json.dumps(out))
print(json.dumps(out, indent=1))
