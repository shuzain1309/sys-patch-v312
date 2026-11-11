#!/usr/bin/env python3
"""Wires germany_pack.tsx into world.tsx + geo.tsx (idempotent, fails loudly if an anchor moved). Run once in the repo's src/remotion/."""
import re, sys

def sub1(s, old, new, label):
    if new in s: return s  # already patched
    assert s.count(old) == 1, f'anchor not found exactly once: {label} ({s.count(old)})'
    return s.replace(old, new)

pack = open('germany_pack.tsx', encoding='utf8').read()
props = re.findall(r"'(\w+)'", re.search(r'GERMANY_PROPS = \[([^\]]+)\]', pack).group(1))
bgs = re.findall(r"'(\w+)'", re.search(r'GERMANY_BGS = \[([^\]]+)\]', pack).group(1))
lit = lambda xs: ' | '.join(f"'{x}'" for x in xs)

W = open('world.tsx', encoding='utf8').read()
# 1. import
W = sub1(W, "import {fit, measure, placeBox, SAFE, Rect} from './textfit';",
         "import {fit, measure, placeBox, SAFE, Rect} from './textfit';\nimport {FocusOverlay, FocusT, GermanyProp, isGermanyProp, GermanyBg, isGermanyBg, GERMANY_GROUND} from './germany_pack';", 'import')
# 2. types: hats, gender tag, prop fields, prop kinds, bg kinds, focus on stage
W = sub1(W, "| 'qing';", "| 'qing' | 'conical' | 'pickelhaube' | 'stahlhelm';", 'hat union')
W = sub1(W, "kohl?: boolean};", "kohl?: boolean; g?: 'm' | 'f'};", 'look gender')
W = sub1(W, "clash?: {a?: string; b?: string; n?: number}};", "clash?: {a?: string; b?: string; n?: number}; m?: string; tx?: string; ts?: number};", 'propT fields')
W = sub1(W, "| 'silkroll' | 'clash';", "| 'silkroll' | 'clash' | " + lit(props) + ";", 'prop kinds')
W = sub1(W, "| 'yellowriver' | 'karst';", "| 'yellowriver' | 'karst' | " + lit(bgs) + ";", 'bg kinds')
W = sub1(W, "bars?: boolean; spot?:", "bars?: boolean; focus?: FocusT | FocusT[]; spot?:", 'stage focus')
W = sub1(W, "lantern: 0};", "lantern: 0, wallseg: 0, brandenburg: -40};", 'layer z')
# 3. ground colours for the new backgrounds
W = sub1(W, "karst: '#7fa56a'};", "karst: '#7fa56a', ...GERMANY_GROUND};", 'ground')
# 4. hats
hats = """    case 'conical': return (<g {...OL}><path d={`M-84 ${top + 16} L0 ${top - 74} L84 ${top + 16} Q0 ${top + 30} -84 ${top + 16}Z`} fill="#e8cf86" /><path d={`M-40 ${top - 20} Q0 ${top - 8} 40 ${top - 20}`} fill="none" stroke="#b9953f" strokeWidth={3} /><path d={`M0 ${top - 74} q10 -14 6 -28 M0 ${top - 74} q-8 -10 -4 -26`} fill="none" stroke="#c0392b" strokeWidth={6} /></g>);
    case 'pickelhaube': return (<g {...OL}><path d={`M-50 ${top + 18} Q-52 ${top - 34} 0 ${top - 36} Q52 ${top - 34} 50 ${top + 18}Z`} fill="#2b2f3a" /><path d={`M-4 ${top - 36} L0 ${top - 84} L4 ${top - 36}Z`} fill="#d8b24a" /><path d={`M-18 ${top - 4} L0 ${top - 30} L18 ${top - 4}Z`} fill="#d8b24a" /><path d={`M-56 ${top + 14} Q0 ${top + 26} 56 ${top + 14}`} fill="none" stroke="#d8b24a" strokeWidth={6} /><path d={`M10 ${top + 14} L68 ${top + 20} Q62 ${top + 30} 10 ${top + 26}Z`} fill="#1f1f27" /></g>);
    case 'stahlhelm': return (<g {...OL}><path d={`M-58 ${top + 20} Q-60 ${top - 34} 0 ${top - 38} Q60 ${top - 34} 58 ${top + 20} Q0 ${top + 34} -58 ${top + 20}Z`} fill="#6b7260" /><path d={`M-58 ${top + 20} Q0 ${top + 34} 58 ${top + 20} Q0 ${top + 12} -58 ${top + 20}Z`} fill="#555c4b" /></g>);
"""
W = sub1(W, "    case 'straw': return (<g {...OL}><ellipse", hats + "    case 'straw': return (<g {...OL}><ellipse", 'hats')
# 5. flags (bands only; Nazi-era flags are deliberately not drawn)
flags = """  if (k === 'de') return [[0, 0.333, '#1f1f27'], [0.333, 0.667, '#c0392b'], [0.667, 1, '#f2c230']];
  if (k === 'dei') return [[0, 0.333, '#1f1f27'], [0.333, 0.667, '#f4f4f4'], [0.667, 1, '#c0392b']];
  if (k === 'pru') return [[0, 0.5, '#f4f4f4'], [0.5, 1, '#1f1f27']];
  if (k === 'pl') return [[0, 0.5, '#f4f4f4'], [0.5, 1, '#d52b1e']];
  if (k === 'at') return [[0, 0.333, '#c8102e'], [0.333, 0.667, '#f4f4f4'], [0.667, 1, '#c8102e']];
  if (k === 'nl') return [[0, 0.333, '#ae1c28'], [0.333, 0.667, '#f4f4f4'], [0.667, 1, '#21468b']];
  if (k === 'se') return [[0, 1, '#006aa7'], [0.4, 0.6, '#fecc00']];
  if (k === 'eu') return [[0, 1, '#003399']];
"""
W = sub1(W, "  if (k === 'ukr')", flags + "  if (k === 'ukr')", 'flags')
# 6. dispatch
W = sub1(W, "  const c = p.c;\n  switch (p.k) {\n    case 'house': {", "  if (isGermanyProp(p.k)) return <GermanyProp p={p} f={f} seed={seed} />;\n  const c = p.c;\n  switch (p.k) {\n    case 'house': {", 'prop dispatch')
W = sub1(W, "  const night = tod === 'night' || tod === 'fire';\n  if (bg === 'temple') {", "  const night = tod === 'night' || tod === 'fire';\n  if (isGermanyBg(bg)) return <GermanyBg bg={bg as any} f={f} cx={cx} seed={seed} />;\n  if (bg === 'temple') {", 'bg dispatch')
# 7. focus overlay LAST in the stage svg (above art, labels and texts; the year badge and narrator are drawn by kit.tsx on top)
W = sub1(W, "      })()}\n    </svg>\n  );", "      })()}\n      {st.focus && <FocusOverlay focus={st.focus} f={f} d={d} seed={seed} />}\n    </svg>\n  );", 'stage focus render')
open('world.tsx', 'w', encoding='utf8').write(W)

G = open('geo.tsx', encoding='utf8').read()
G = sub1(G, "import {HAND, INK, MapClash} from './world';", "import {HAND, INK, MapClash} from './world';\nimport {FocusOverlay, FocusT} from './germany_pack';", 'geo import')
G = sub1(G, "clash?: {lon?: number;", "focus?: FocusT | FocusT[]; // grey scrim with a circular void on the year badge (default) or at x,y,r; `at`/`to` = fractions of the scene\n  clash?: {lon?: number;", 'geo type')
G = sub1(G, "    </svg>\n  );\n};", "      {(gRaw as any).focus && <FocusOverlay focus={(gRaw as any).focus} f={f} d={d} seed={seed} />}\n    </svg>\n  );\n};", 'geo render')
open('geo.tsx', 'w', encoding='utf8').write(G)
print('patched world.tsx + geo.tsx:', len(props), 'props,', len(bgs), 'backgrounds, hats conical/pickelhaube/stahlhelm, flags de dei pru pl at nl se eu, focus overlay')
