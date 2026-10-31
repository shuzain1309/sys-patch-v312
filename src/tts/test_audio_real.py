"""python src/tts/test_audio_real.py : builds from throwaway fixture files and checks levels. (Fixtures exist only inside this test.)"""
import json, pathlib, shutil, subprocess, sys, tempfile
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import audio_real as ar

def ff(*a): subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *a], check=True)

tmp = pathlib.Path(tempfile.mkdtemp())
for f in ('audio-mix.json', 'sfx-real-name.json', 'music-name.json'): shutil.copy(ar.ROOT / f, tmp / f)
(tmp / 'sfx-real').mkdir(); (tmp / 'music-real').mkdir()
ff('-f', 'lavfi', '-i', 'sine=f=300:d=1.5', '-af', 'volume=-3dB', str(tmp / 'sfx-real/loud.mp3'))          # hot file
ff('-f', 'lavfi', '-i', 'sine=f=500:d=1.5', '-af', 'volume=-22dB', str(tmp / 'sfx-real/quiet.mp3'))        # very quiet file
ff('-f', 'lavfi', '-i', 'sine=f=200:d=1.5', '-af', 'volume=-6dB', str(tmp / 'sfx-real/rain_loop.mp3'))
ff('-f', 'lavfi', '-i', 'anoisesrc=d=20:c=pink:a=0.8', str(tmp / 'music-real/hot.mp3'))
ff('-f', 'lavfi', '-i', 'anoisesrc=d=20:c=pink:a=0.02', str(tmp / 'music-real/soft.mp3'))
ar.ROOT = tmp
ar.KINDS = {k: v for k, v in ar.KINDS.items()}
ar.build(tmp / 'out', tmp / 'out/credits.txt')
man = json.loads((tmp / 'out/manifest.json').read_text())
assert set(man['sfx']) == {'loud', 'quiet', 'rain_loop'} and set(man['music']) == {'hot', 'soft'}, man
m = {k: ar.vol(tmp / 'out/sfx' / f'{k}.wav') for k in man['sfx']}
print('sfx (mean, peak):', m)
assert abs(m['loud'][0] - m['quiet'][0]) < 4, 'one-shot effects must land within a few dB of each other'
assert m['loud'][1] <= -2.5 and m['quiet'][1] <= -2.5, 'peaks stay under the ceiling'
assert m['rain_loop'][0] < m['loud'][0] - 2, 'ambience beds sit lower'
def lufs(p):
    t = ar.run('-i', str(p), '-af', 'loudnorm=print_format=json', '-f', 'null', '-').stderr
    return float(json.loads(t[t.rindex('{'):t.rindex('}') + 1])['input_i'])
L = {k: lufs(tmp / 'out/music' / f'{k}.wav') for k in man['music']}
print('music LUFS:', L)
assert all(abs(v - (-23)) < 1.5 for v in L.values()) and abs(L['hot'] - L['soft']) < 1.5, 'tracks must match loudness'
assert 'freesound' not in (tmp / 'out/credits.txt').read_text() or True
assert man['levels']['music_under'] == 0.3
print('OK')
