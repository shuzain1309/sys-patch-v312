#!/usr/bin/env python3
"""Throwaway assembler: ch/*.txt lines 'narration ||| scene body' -> title_script.tsx + photo catalog + checks.
Extras over the stock assembler: @skit macro (voice tag chosen from the speaker's gender), gender/voice lint, grey-overlay (focus) lint, thin-scene lint."""
import os, re, json, glob, sys, pathlib
sys.path.insert(0, '.')
from meta import SEO, BIBLE, PHOTOS, MUSIC_KEYS, THEME_TS, TITLE, SLUG, VOICE

BUILTIN_G = {'king': 'm', 'banker': 'm', 'woman': 'f', 'merchant': 'm', 'soldier': 'm', 'narrator': 'm'}
def gender(look):
    return BIBLE['looks'].get(look, {}).get('g') or BUILTIN_G.get(look)

scenes, lines, chapters, skit = [], {}, [], None
bad = []
for f in sorted(glob.glob('ch/ch*.txt')):
    for raw in open(f, encoding='utf8'):
        raw = raw.rstrip('\n')
        if not raw.strip() or raw.startswith('#'):
            continue
        if raw.startswith('@skit '):  # @skit bg|tod|lookA|lookB|xA|xB|props-js
            bg, tod, la, lb, xa, xb, props = (raw[6:].split('|') + [''])[:7]
            ga, gb = gender(la), gender(lb)
            if not ga or not gb: bad.append(f'skit {la}/{lb}: look without gender (add g to BIBLE)')
            if ga == 'f' and gb == 'f': bad.append(f'skit {la}/{lb}: two women, only one female voice exists')
            males = [x for x, g in ((la, ga), (lb, gb)) if g == 'm']
            vt = {}
            for x, g in ((la, ga), (lb, gb)):
                vt[x] = 'woman' if g == 'f' else ('king' if x == males[0] else 'banker')
            skit = dict(bg=bg, tod=tod, a=la, b=lb, xa=xa, xb=xb, props=props.strip(), vt=vt)
            continue
        nar, body = raw.split(' ||| ', 1)
        m = re.match(r'^([AB]): (.*)$', nar)
        if m:
            assert skit, 'skit line before @skit'
            who = skit['a'] if m.group(1) == 'A' else skit['b']
            ex = body.strip()
            tok = dict(re.findall(r'\b(p[ab]|f[ab]|yr)=(\S+)', ex))
            ex = re.sub(r'\b(p[ab]|f[ab]|yr)=\S+', '', ex).strip().strip(',').strip()
            if ex == '-': ex = ''
            def act(side):
                a = side == 'a'
                o = ["talk:%s" % ('true' if (m.group(1) == 'A') == a else 'false')]
                if tok.get('p' + side): o.append("pose:'%s'" % tok['p' + side])
                if tok.get('f' + side): o.append("face:'%s'" % tok['f' + side])
                if not a: o.append('flip:true')
                return "A('%s',%s,{%s})" % (skit['a' if a else 'b'], skit['xa' if a else 'xb'], ','.join(o))
            yr = ("year:'%s', " % tok['yr'].replace('_', ' ')) if 'yr' in tok else ''
            body = "type:'stage', %sst:{bg:'%s', tod:'%s', props:[%s], actors:[%s,%s], cam:{z:[1,1.08]}%s}" % (yr, skit['bg'], skit['tod'], skit['props'], act('a'), act('b'), (', ' + ex) if ex else '')
            nar = '[v:%s] %s' % (skit['vt'][who], m.group(2))
        sid = 's%03d' % (len(scenes) + 1)
        clean = re.sub(r'^\[v:\w+\]\s*', '', nar)
        total = len(re.sub('⟦\\w+⟧', '', clean).split())
        for m2 in re.finditer(r'⟦(\w+)⟧', clean):
            before = len(re.sub('⟦\\w+⟧', '', clean[:m2.start()]).split())
            body = body.replace('AT_' + m2.group(1), str(max(0, round(before / total - 0.05, 2))))
        nar = re.sub(' {2,}', ' ', re.sub('⟦\\w+⟧', '', nar))
        assert 'AT_' not in body, (sid, body[:80])
        assert body.startswith("type:'"), (sid, body[:40])
        if body.startswith("type:'chapter'"):
            chapters.append(sid)
            skit = None
        lines[sid] = nar
        scenes.append((sid, body))

# ---- MUSIC: one track per chapter (hook = s001); keys with no file only warn in CI, that section is silent
music = [{"from": "s001", "key": MUSIC_KEYS[0]}] + [{"from": c, "key": k, **({"xf": 3} if i else {})} for i, (c, k) in enumerate(zip(chapters, MUSIC_KEYS[1:]))]
assert os.environ.get('PARTIAL') or len(MUSIC_KEYS) == len(chapters) + 1, (len(MUSIC_KEYS), len(chapters))

# ---- checks against the real kit
W = open('world.tsx', encoding='utf8').read()
looks = set(re.findall(r'^  ([a-z_0-9]+): \{', W[W.index('export const LOOKS'):W.index('Object.assign(LOOKS')], re.M)) | set(json.load(open('looks_lib.json'))) | set(BIBLE['looks'])
props = set(re.findall(r"'([a-z0-9]+)'", re.search(r'export type PropKind = ([^;]+);', W).group(1)))
bgs = set(re.findall(r"'([a-z]+)'", re.search(r'export type BgKind = ([^;]+);', W).group(1)))
hats = set(re.findall(r"'([a-z]+)'", re.search(r'export type Look = \{hat: ([^;]+?);', W).group(1)))
photo_ids = {p['id'] for p in PHOTOS}
used_photos = set()
for sid, body in scenes:
    for n in re.findall(r"look:\s*'(\w+)'", body) + re.findall(r"\bA\('(\w+)'", body) + re.findall(r"rider:\s*'(\w+)'", body):
        if n not in looks: bad.append(f'{sid}: unknown look {n}')
    for n in re.findall(r"\bP\('(\w+)'", body) + re.findall(r"\bk:\s*'(\w+)'", body):
        if n not in props and n not in ('name', 'faction', 'place', 'date', 'fact'): bad.append(f'{sid}: unknown prop {n}')
    for n in re.findall(r"bg:\s*'(\w+)'", body):
        if n not in bgs: bad.append(f'{sid}: unknown bg {n}')
    for n in re.findall(r"fac:\s*'([\w ]+)'", body):
        if n not in BIBLE['factions']: bad.append(f'{sid}: unknown faction {n}')
    for n in re.findall(r"photos/(\w+)\.jpg", body):
        used_photos.add(n)
        if n not in photo_ids: bad.append(f'{sid}: photo {n} not declared')
for p in photo_ids - used_photos: bad.append(f'photo {p} declared but unused')

# ---- geo library check (place / ref must exist) and clash check
G = json.load(open('geo.json', encoding='utf8'))
for sid, body in scenes:
    for n in re.findall(r"place:\s*'([\w ]+)'", body):
        if n not in G['places']: bad.append(f'{sid}: unknown geo place {n}')
    for n in re.findall(r"ref:\s*'(\w+)'", body):
        if n not in G['regions'] and n not in G['lines']: bad.append(f'{sid}: unknown geo ref {n}')
    if 'clash:[' in body and 'army_shout_loop' not in body: bad.append(f'{sid}: clash scene without army_shout_loop sfx')
    if "type:'geo'" in body and 'geo:G(' not in body: bad.append(f'{sid}: geo scene must use geo:G({{...}})')
# ---- VOICE / GENDER LINT: every [v:tag] must match the talking actor's gender; every talking actor needs a tag
for sid, body in scenes:
    tag = re.match(r'^\[v:(\w+)\]', lines[sid])
    talkers = re.findall(r"A\('(\w+)',[^)]*?talk:true", body)
    if tag:
        t = tag.group(1)
        if t not in VOICE: bad.append(f'{sid}: unknown voice tag {t}')
        elif len(talkers) != 1: bad.append(f'{sid}: voice tag but {len(talkers)} talking actors')
        elif gender(talkers[0]) != VOICE[t]: bad.append(f'{sid}: voice {t} ({VOICE[t]}) vs look {talkers[0]} ({gender(talkers[0])})')
    elif talkers: bad.append(f'{sid}: talking actor {talkers} without a [v:] tag')
# ---- GREY OVERLAY (focus) LINT: window must start on a spoken word (AT_ marker) and aim at the year badge or an explicit x,y
nfocus = 0
for sid, body in scenes:
    for m in re.finditer(r'focus:\s*(\[?\{[^\]]*?\}\]?)(?=,\s*\w+:|\}|$)', body):
        nfocus += 1
        for w in re.findall(r'\{([^{}]*)\}', m.group(1)):
            if not re.search(r'\bat:', w): bad.append(f'{sid}: focus window without at')
            if 'x:' not in w and "year:'" not in body: bad.append(f'{sid}: focus on year but scene has no year badge')
for sid, body in scenes:
    if 'focus:' in body and not re.search(r"type:'(stage|geo|chapter)'", body): bad.append(f'{sid}: focus only works on stage/geo scenes')
# ---- MONETISATION SAFETY: the Hitler stand-in is a faceless silhouette and never salutes or cheers; no Nazi symbols anywhere
for sid, body in scenes:
    if re.search(r"A\('hitler_sil'[^)]*pose:'(salute|cheer|wave)'", body): bad.append(f'{sid}: hitler_sil must not salute, cheer or wave')
    if re.search(r'swastika|hakenkreuz|sieg heil|heil hitler', body + lines[sid], re.I): bad.append(f'{sid}: banned Nazi symbol or slogan')
# ---- THIN SCENE LINT: a stage with almost nothing in it is usually a keyword-only scene
thin, run, prev = [], 0, None
for sid, body in scenes:
    if body.startswith("type:'stage'"):
        n = len(re.findall(r"\bP\('", body)) + len(re.findall(r"\bA\('", body)) + len(re.findall(r"\{t:'", body))
        if n < 3 and 'nar:' not in body: thin.append(f'{sid}: only {n} elements')
        bgm = re.search(r"bg:'(\w+)'", body); b = bgm.group(1) if bgm else None
        run = run + 1 if b == prev else 1; prev = b
        if run == 7: thin.append(f'{sid}: 7th consecutive scene on bg {b}')
# ---- LAYER LINT: engine biases throne/bed behind and podium/sign/desk/cage/console in front within 90px of an actor baseline;
# warn when a front-kind prop is placed more than 90px above an actor it overlaps (the actor would cover it).
FRONT = {'podium', 'sign', 'desk', 'console', 'cage', 'scaffold'}
for sid, body in scenes:
    acts = [(int(m.group(2)), 990) for m in re.finditer(r"A\('(\w+)',\s*\[?(\d+)", body)]
    for m in re.finditer(r"P\('(\w+)',\s*(\d+),\s*(\d+)", body):
        k, x, y = m.group(1), int(m.group(2)), int(m.group(3))
        if k in FRONT and any(abs(ax - x) < 260 and y + 90 < ay for ax, ay in acts):
            warn_layer = f'{sid}: {k} at y{y} would be covered by an actor; raise y or add z:500'
            bad.append(warn_layer)
warn = []
for sid, t in lines.items():
    t2 = re.sub(r'^\[v:\w+\]\s*', '', t)
    n = len(t2.split())
    if n > 60: warn.append(f'{sid}: {n} words')
    for s in re.split(r'(?<=[.!?])\s+', t2):
        if len(s.split()) > 40: warn.append(f'{sid}: long sentence')
words = sum(len(re.sub(r'^\[v:\w+\]\s*', '', t).split()) for t in lines.values())

out = open('header.ts', encoding='utf8').read()
out = out.replace('@@TITLEJS@@', json.dumps(TITLE, ensure_ascii=False)).replace('@@THEME@@', THEME_TS).replace('@@TITLE@@', TITLE).replace('@@SLUG@@', SLUG)
out = out.replace('@@LINES@@', json.dumps(lines, ensure_ascii=False, indent=1))
out = out.replace('@@SEO@@', json.dumps(SEO, ensure_ascii=False, indent=1))
out = out.replace('@@SCENES@@', '\n'.join(f"  {{id: '{sid}', {body}}}," for sid, body in scenes))
out = out.replace('@@MUSIC@@', json.dumps(music))
out = out.replace('@@BIBLE@@', json.dumps(BIBLE, ensure_ascii=False, indent=1))
out = out.replace('@@PHOTOS@@', json.dumps(PHOTOS, ensure_ascii=False, indent=1))
pathlib.Path('title_script.tsx').write_text(out, encoding='utf8')
pathlib.Path(os.environ.get('PHOTOS_FILE', 'photos-germany.json')).write_text(json.dumps({"_doc": "Germany history photo catalog for fetch-photos. Each entry is searched on Wikimedia Commons, licence-checked (public domain, CC0, CC BY) and stored in photo-cache/. 'must' = title must contain one of these words; 'alt' = caption if nothing is found. Entries that print MISS: run List photo candidates, pin {id, file:'File:Exact Title.jpg'} and fetch again.", "photos": PHOTOS}, indent=1, ensure_ascii=False))
types = {}
for sid, body in scenes: types[re.match(r"type:'(\w+)'", body).group(1)] = types.get(re.match(r"type:'(\w+)'", body).group(1), 0) + 1
print('focus windows', nfocus, '| thin/run warnings', len(thin))
print(*thin[:40], sep='\n  ')
print('scenes', len(scenes), 'chapters', len(chapters), 'words', words, '~min@160wpm', round(words / 160, 1), types)
print('ERRORS', *bad, sep='\n  ') if bad else print('no kit errors')
print('WARN', *warn, sep='\n  ') if warn else print('no length warnings')
