#!/usr/bin/env python3
"""Never let missing audio fail a render. Run as a CI step BEFORE extract/check, on the committed script.
Any MUSIC cue whose file is not in music-real/ becomes silence (key: null); the script is rewritten in place.
Usage: python3 tools/prune_missing_audio.py [src/remotion/current_script.tsx] [music-real]
Always exits 0. Writes a short report to stdout (and $GITHUB_STEP_SUMMARY when set)."""
import json, os, re, sys

script = sys.argv[1] if len(sys.argv) > 1 else 'src/remotion/current_script.tsx'
mdir = sys.argv[2] if len(sys.argv) > 2 else 'music-real'
EXT = ('.mp3', '.wav', '.ogg', '.m4a', '.flac')
try:
    s = open(script, encoding='utf8').read()
    m = re.search(r'(/\*MUSIC\*/\s*)(\[.*?\])(\s*/\*MUSIC\*/)', s, re.S)
    if not m:
        print('prune_missing_audio: no MUSIC block found, nothing to do'); sys.exit(0)
    cues = json.loads(m.group(2))
    have = {os.path.splitext(f)[0] for f in os.listdir(mdir)} if os.path.isdir(mdir) else set()
    have = {k for k in have if any(os.path.exists(os.path.join(mdir, k + e)) for e in EXT)}
    dropped = []
    for c in cues:
        if c.get('key') and c['key'] not in have:
            dropped.append(f"{c['from']}:{c['key']}"); c['key'] = None
    if dropped:
        s = s[:m.start(2)] + json.dumps(cues) + s[m.end(2):]
        open(script, 'w', encoding='utf8').write(s)
    msg = f"music: {len(cues) - len(dropped)}/{len(cues)} cues have files; silenced {len(dropped)}: {', '.join(dropped) or 'none'}"
    print(msg)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        open(os.environ['GITHUB_STEP_SUMMARY'], 'a').write('### Music guard\n' + msg + '\n')
except Exception as e:  # never fail the run
    print('prune_missing_audio: skipped (%s)' % e)
sys.exit(0)
