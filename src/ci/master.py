#!/usr/bin/env python3
"""master.py mix.wav master.m4a qa.json : two-pass loudness master of the whole mix + checks.
Chunks are mixed separately, so loudness is only meaningful (and only fixed) here, once, over the joined audio."""
import json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
mix = json.loads((ROOT / 'audio-mix.json').read_text())
I, TP = mix['master_lufs'], mix['master_tp']


def ff(*a):
    return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', *a], capture_output=True, text=True)


def stats(src, extra=''):
    t = ff('-i', src, '-af', f'loudnorm=I={I}:TP={TP}:LRA=11:print_format=json{extra}', '-f', 'null', '-').stderr
    return json.loads(t[t.rindex('{'):t.rindex('}') + 1])


def main(src, dst, report):
    a = stats(src)
    af = (f'loudnorm=I={I}:TP={TP}:LRA=11:measured_I={a["input_i"]}:measured_TP={a["input_tp"]}:measured_LRA={a["input_lra"]}'
          f':measured_thresh={a["input_thresh"]}:offset={a["target_offset"]}:linear=true')
    r = ff('-y', '-i', src, '-af', af, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', dst)
    if r.returncode:
        raise SystemExit('master failed: ' + r.stderr[-400:])
    b = stats(dst)
    sil = ff('-i', dst, '-af', 'silencedetect=noise=-50dB:d=2', '-f', 'null', '-').stderr
    silences = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', sil)]
    out = {'before': {'lufs': float(a['input_i']), 'true_peak': float(a['input_tp']), 'lra': float(a['input_lra'])},
           'after': {'lufs': float(b['input_i']), 'true_peak': float(b['input_tp']), 'lra': float(b['input_lra'])},
           'silences_over_2s': silences, 'warnings': []}
    if out['after']['true_peak'] > -1: out['warnings'].append(f'true peak {out["after"]["true_peak"]} dBTP is above -1')
    if abs(out['after']['lufs'] - I) > 1.5: out['warnings'].append(f'loudness {out["after"]["lufs"]} LUFS is not near {I}')
    if out['after']['lra'] > 15: out['warnings'].append(f'loudness range {out["after"]["lra"]} LU is wide: some sections are much louder than others')
    if silences: out['warnings'].append(f'{len(silences)} silent gap(s) over 2 s, first at {silences[0]:.0f}s (missing sound?)')
    pathlib.Path(report).write_text(json.dumps(out, indent=1))
    for w in out['warnings']:
        print('::warning::' + w)
    print(f'master: {out["before"]["lufs"]} -> {out["after"]["lufs"]} LUFS, peak {out["after"]["true_peak"]} dBTP')


if __name__ == '__main__':
    main(*sys.argv[1:4])
