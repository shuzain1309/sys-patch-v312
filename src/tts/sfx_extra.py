#!/usr/bin/env python3
"""Rome-pack sound effects. Pure numpy, deterministic, no samples, no licences.
Usage:  python src/tts/sfx_extra.py public/sfx      (run after sfx.py; adds to the same folder)
Every key below is usable in a scene's  sfx:[[fraction, 'key', volume?]]  track.  Keys ending _loop are loops."""
import sys, wave, os
import numpy as np
SR = 24000
rng = np.random.default_rng(7)

def t(d): return np.linspace(0, d, int(SR * d), endpoint=False)
def env(n, a=0.01, r=0.2, curve=2.0):
    x = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    x[:na] = np.linspace(0, 1, na); x[-nr:] = np.linspace(1, 0, nr) ** curve; return x
def noise(d): return rng.uniform(-1, 1, int(SR * d))
def lp(x, k):  # one-pole lowpass, k in 0..1 (bigger = brighter)
    y = np.zeros_like(x); a = 0
    for i, v in enumerate(x): a += k * (v - a); y[i] = a
    return y
def hp(x, k): return x - lp(x, k)
def tone(f, d, wave_='sine'):
    ph = 2 * np.pi * np.cumsum(np.full(int(SR * d), f) if np.isscalar(f) else f) / SR
    return np.sign(np.sin(ph)) * 0.6 if wave_ == 'square' else (2 * (ph / (2 * np.pi) % 1) - 1) * 0.6 if wave_ == 'saw' else np.sin(ph)
def sweep(f0, f1, d, w='sine'): return tone(np.linspace(f0, f1, int(SR * d)), d, w)
def norm(x, g=0.9): m = np.max(np.abs(x)) or 1; return x / m * g
def mix(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def at(x, s, total):
    o = np.zeros(int(SR * total)); i = int(SR * s); o[i:i + len(x)] += x[:len(o) - i]; return o
def save(name, x, folder):
    x = np.clip(norm(x), -1, 1)
    with wave.open(os.path.join(folder, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())

def loopify(x, fade=0.08):  # crossfade ends so loops are seamless
    n = int(SR * fade); y = x.copy(); y[:n] = y[:n] * np.linspace(0, 1, n) + x[-n:] * np.linspace(1, 0, n); return y[:-n]

def S():
    o = {}
    # --- combat
    o['sword'] = (lambda: mix(hp(noise(.12), .5) * env(int(SR * .12), .001, .1), tone(2400, .5) * env(int(SR * .5), .001, .5, 3) * .5, tone(3700, .4) * env(int(SR * .4), .001, .4, 3) * .3))()
    o['slash'] = hp(noise(.22), .35) * np.sin(np.linspace(0, np.pi, int(SR * .22))) ** 1.5
    o['stab'] = mix(lp(noise(.18), .08) * env(int(SR * .18), .002, .16), sweep(180, 60, .18) * env(int(SR * .18), .002, .16))
    o['hit'] = mix(sweep(160, 50, .2) * env(int(SR * .2), .001, .19, 2), lp(noise(.1), .2) * env(int(SR * .1), .001, .1))
    o['body_fall'] = mix(sweep(120, 40, .28) * env(int(SR * .28), .002, .27), lp(noise(.3), .05) * env(int(SR * .3), .01, .28) * .8)
    o['shield_hit'] = mix(sweep(300, 120, .15) * env(int(SR * .15), .001, .14), tone(900, .2) * env(int(SR * .2), .001, .2, 3) * .3, hp(noise(.1), .4) * env(int(SR * .1), .001, .1) * .5)
    o['clash_loop'] = loopify(mix(*[at(o['sword'], i * .37, 2.0) * (.6 + .4 * rng.random()) for i in range(5)] + [at(o['shield_hit'], .2 + i * .53, 2.0) for i in range(3)]))
    # --- crowds
    cr = lp(noise(3), .06) * (1 + 0.5 * np.sin(2 * np.pi * 2.2 * t(3)))
    o['crowd_murmur_loop'] = loopify(cr * .8)
    o['cheer'] = lp(noise(2.2), .12) * env(int(SR * 2.2), .25, 1.4) * (1 + .4 * np.sin(2 * np.pi * 6 * t(2.2)))
    o['cheer_small'] = o['cheer'][:int(SR * 1.2)] * .6 * env(int(SR * 1.2), .1, .6)
    o['gasp'] = lp(noise(.55), .1) * np.sin(np.linspace(0, np.pi, int(SR * .55))) ** 1.2 * (1 + .3 * np.sin(2 * np.pi * 9 * t(.55)))
    o['boo'] = mix(sweep(220, 150, 1.2, 'saw') * env(int(SR * 1.2), .1, .8) * .5, lp(noise(1.2), .04) * env(int(SR * 1.2), .1, .8))
    o['laugh'] = mix(*[at(lp(noise(.2), .1) * env(int(SR * .2), .01, .15) * (1 + np.sin(2 * np.pi * 14 * t(.2))), .18 * i, 1.6) for i in range(7)])
    o['clap'] = mix(*[at(hp(noise(.05), .4) * env(int(SR * .05), .001, .04), .08 * i + rng.random() * .03, 1.2) for i in range(14)])
    # --- war & brass
    o['horn'] = mix(sweep(196, 262, .9, 'saw') * env(int(SR * .9), .08, .5) * .6, tone(131, .9, 'saw') * env(int(SR * .9), .1, .5) * .5)
    o['horn_low'] = mix(tone(98, 1.4, 'saw') * env(int(SR * 1.4), .15, .9), tone(147, 1.4, 'saw') * env(int(SR * 1.4), .15, .9) * .6)
    dr = mix(sweep(120, 55, .22) * env(int(SR * .22), .002, .2, 2))
    o['drum'] = dr
    o['war_drums_loop'] = loopify(mix(*[at(dr, i * .5, 4.0) * (1 if i % 2 == 0 else .6) for i in range(8)] + [at(dr * .5, i * .5 + .25, 4.0) for i in range(0, 8, 2)]))
    o['march_hit'] = o['body_fall'] * .6
    o['steps_loop'] = loopify(mix(*[at(lp(noise(.08), .1) * env(int(SR * .08), .002, .07), i * .42, 2.5) for i in range(6)]))
    o['run_loop'] = loopify(mix(*[at(lp(noise(.06), .12) * env(int(SR * .06), .002, .05), i * .24, 2.4) for i in range(10)]))
    o['march_loop'] = loopify(mix(*[at(lp(noise(.1), .08) * env(int(SR * .1), .002, .09) + sweep(90, 50, .1) * env(int(SR * .1), .001, .09) * .5, i * .5, 3.0) for i in range(6)]))
    o['hooves_loop'] = loopify(mix(*[at(lp(noise(.05), .2) * env(int(SR * .05), .001, .04), j, 2.4) for j in np.cumsum([0, .18, .12, .18, .12, .18, .12, .18, .12, .18, .12, .18, .12]) if j < 2.3]))
    # --- animals & nature
    o['howl'] = sweep(330, 620, 1.6, 'sine') * env(int(SR * 1.6), .3, .9) * (1 + .05 * np.sin(2 * np.pi * 6 * t(1.6)))
    o['trumpet'] = mix(sweep(300, 700, .9, 'saw') * env(int(SR * .9), .05, .5) * .6, lp(noise(.9), .05) * env(int(SR * .9), .05, .5) * .3)
    o['birds'] = mix(*[at(sweep(2600 + 500 * rng.random(), 3600 + 400 * rng.random(), .08, 'sine') * env(int(SR * .08), .005, .06), .15 * i + rng.random() * .1, 1.8) for i in range(10)])
    o['birds_loop'] = loopify(mix(*[at(sweep(2600 + 700 * rng.random(), 3800, .07) * env(int(SR * .07), .005, .05) * .6, .3 * i + rng.random() * .2, 3.0) for i in range(10)]))
    o['splash'] = mix(lp(noise(.7), .25) * env(int(SR * .7), .005, .6), sweep(300, 80, .3) * env(int(SR * .3), .002, .28) * .6)
    o['baby_cry'] = mix(sweep(520, 680, .3, 'saw') * env(int(SR * .3), .02, .1) * .5, at(sweep(560, 700, .3, 'saw') * env(int(SR * .3), .02, .1) * .5, .4, .8))
    o['creak'] = sweep(140, 90, .9, 'saw') * env(int(SR * .9), .1, .6) * (1 + .4 * np.sin(2 * np.pi * 18 * t(.9))) * .5
    o['crack'] = mix(hp(noise(.25), .5) * env(int(SR * .25), .001, .22, 3), sweep(1800, 200, .1) * env(int(SR * .1), .001, .09) * .6)
    o['boom'] = mix(sweep(90, 30, .9) * env(int(SR * .9), .003, .85, 2), lp(noise(.9), .03) * env(int(SR * .9), .003, .8) * .7)
    o['glass_break'] = mix(hp(noise(.5), .6) * env(int(SR * .5), .001, .45, 3), *[at(tone(2500 + 900 * rng.random(), .15) * env(int(SR * .15), .001, .14) * .3, .04 * i, .5) for i in range(8)])
    o['page'] = hp(noise(.3), .3) * env(int(SR * .3), .03, .25, 1.5) * .6
    # --- tension & music stings
    hb = mix(sweep(70, 45, .14) * env(int(SR * .14), .005, .13), at(sweep(70, 45, .14) * env(int(SR * .14), .005, .13) * .7, .2, .4))
    o['heartbeat_loop'] = loopify(mix(*[at(hb, i * .9, 3.6) for i in range(4)]))
    o['tense_loop'] = loopify(mix(tone(55, 4, 'saw') * .3, tone(58.3, 4, 'saw') * .3, lp(noise(4), .01) * .4) * (1 + .3 * np.sin(2 * np.pi * .5 * t(4))))
    o['sting_dun'] = mix(sweep(110, 90, 1.2, 'saw') * env(int(SR * 1.2), .01, .9), sweep(165, 135, 1.2, 'saw') * env(int(SR * 1.2), .01, .9) * .6, o['boom'][:int(SR * 1.2)] * .8)
    o['sting_tense'] = sweep(80, 400, 1.6, 'saw') * env(int(SR * 1.6), 1.4, .15, 1) * .8
    o['sting_sad'] = mix(*[at(tone(f, .5) * env(int(SR * .5), .02, .4) * .6, i * .35, 1.6) for i, f in enumerate([392, 370, 349, 330])])
    o['divine'] = mix(*[tone(f, 1.8) * env(int(SR * 1.8), .4, 1.1) * .4 for f in [523, 659, 784, 1047]])
    o['fanfare'] = mix(*[at(tone(f, .35, 'saw') * env(int(SR * .35), .01, .2) * .5, i * .22, 1.6) for i, f in enumerate([392, 392, 523, 659, 784])] + [at(tone(784, .6, 'saw') * env(int(SR * .6), .01, .5) * .5, 1.0, 1.6)])
    # --- comedy
    o['record_scratch'] = mix(hp(noise(.5), .3) * np.linspace(1, 0, int(SR * .5)) * (1 + np.sin(2 * np.pi * 40 * t(.5))) * .5, sweep(2000, 300, .5, 'saw') * env(int(SR * .5), .01, .3) * .3)
    o['rimshot'] = mix(*[at(lp(noise(.08), .15) * env(int(SR * .08), .001, .07), i * .18, .8) for i in range(2)], at(hp(noise(.3), .4) * env(int(SR * .3), .001, .28, 3), .45, .8))
    o['wah'] = mix(*[at(sweep(f, f - 30, .4, 'saw') * env(int(SR * .4), .02, .25) * .5, i * .4, 1.8) for i, f in enumerate([233, 220, 208])], at(sweep(196, 150, .8, 'saw') * env(int(SR * .8), .02, .6) * (1 + .4 * np.sin(2 * np.pi * 7 * t(.8))) * .5, 1.2, 2.2))
    o['boing'] = sweep(200, 700, .5) * env(int(SR * .5), .005, .4) * (1 + .5 * np.sin(2 * np.pi * 20 * t(.5)))
    o['slap'] = mix(hp(noise(.12), .4) * env(int(SR * .12), .001, .1, 3), sweep(400, 120, .1) * env(int(SR * .1), .001, .09) * .5)
    o['crickets'] = mix(*[at(tone(4300, .05) * env(int(SR * .05), .002, .04) * .35, .07 * i + (i // 4) * .2, 2.4) for i in range(24)])
    o['bonk'] = mix(sweep(500, 200, .12) * env(int(SR * .12), .001, .1), tone(900, .1) * env(int(SR * .1), .001, .08) * .3)
    o['smooch'] = mix(sweep(400, 1400, .1) * env(int(SR * .1), .005, .05) * .5, at(lp(noise(.05), .2) * env(int(SR * .05), .001, .04) * .6, .11, .2))
    o['cha_ching'] = mix(at(tone(1900, .35) * env(int(SR * .35), .001, .33, 3) * .5, 0, .8), at(tone(2500, .5) * env(int(SR * .5), .001, .48, 3) * .5, .12, .8), hp(noise(.08), .5) * env(int(SR * .08), .001, .07) * .5)
    o['bell'] = mix(*[tone(f, 1.6) * env(int(SR * 1.6), .002, 1.5, 3) * a for f, a in [(660, .6), (1320, .3), (1980, .15)]])
    o['gong'] = mix(*[tone(f, 2.6) * env(int(SR * 2.6), .004, 2.4, 2.5) * a for f, a in [(110, .7), (165, .4), (233, .3), (311, .2)]], lp(noise(2.6), .05) * env(int(SR * 2.6), .004, 2.2) * .15)
    o['whoosh_fast'] = hp(noise(.3), .1) * np.sin(np.linspace(0, np.pi, int(SR * .3))) ** 2
    return o

if __name__ == '__main__':
    folder = sys.argv[1] if len(sys.argv) > 1 else 'public/sfx'
    os.makedirs(folder, exist_ok=True)
    lib = S()
    for k, v in lib.items(): save(k, v, folder)
    print(f'wrote {len(lib)} effects to {folder}: ' + ', '.join(sorted(lib)))
