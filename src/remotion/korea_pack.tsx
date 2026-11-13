// Korea pack for the Vidfactory kit. Pure SVG, deterministic (no Math.random, no Date, no CSS animation).
// Contents: 14 props, 7 backgrounds, peninsula country characters (one / north / south).
// Imported by world.tsx (props, backgrounds) exactly like germany_pack. Do not edit per video.
// First built for: "Why South Korea Became Rich While North Korea Stayed Poor" (Zeus History, 2026-11-13).
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {HAND, INK} from './world';
import type {PropT} from './world';

const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = {stroke: '#241c17' /* = INK; literal on purpose: world.tsx and this file import each other, so INK must not be read at load time */, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16), ch = (s: number) => Math.round(Math.min(255, Math.max(0, ((n >> s) & 255) * (1 + k))));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};
const T: React.FC<{x?: number; y?: number; t: string; fs?: number; fill?: string; sw?: number; a?: 'start' | 'middle' | 'end'; r?: number}> = ({x = 0, y = 0, t, fs = 40, fill = '#fff', sw = 7, a = 'middle', r = 0}) => (
  <text x={x} y={y} textAnchor={a} fontFamily={HAND} fontSize={fs} fill={fill} stroke={INK} strokeWidth={sw} paintOrder="stroke" strokeLinejoin="round" transform={r ? `rotate(${r} ${x} ${y})` : undefined}>{t}</text>
);
const pop01 = (f: number, a: number) => interpolate(f, [a, a + 8], [0, 1], {...C, easing: Easing.out(Easing.back(2))});

// ================= PROPS =================
export type KoreaKind = 'hangul_scroll' | 'turtle_ship' | 'turtle_banknote' | 'magazine_map' | 'stopwatch' | 'dmz_wire' | 'volvo' | 'tanker_kr' | 'phone_kr' | 'phonefire' | 'goldpile' | 'ryugyong' | 'statue_kim' | 'cow_kr' | 'kr_country';
const SET = new Set<string>(['hangul_scroll', 'turtle_ship', 'turtle_banknote', 'magazine_map', 'stopwatch', 'dmz_wire', 'volvo', 'tanker_kr', 'phone_kr', 'phonefire', 'goldpile', 'ryugyong', 'statue_kim', 'cow_kr', 'kr_country']);
export const isKoreaProp = (k: string) => SET.has(k);

export const KoreaProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p, f, seed}) => {
  const c = p.c, t = p.t ?? '';
  switch (p.k as KoreaKind) {
    case 'hangul_scroll': return (
      <g {...OL}><rect x={-16} y={-420} width={32} height={26} rx={8} fill="#7a4a2a" /><rect x={-150} y={-394} width={300} height={360} fill="#f6efdc" />
        <rect x={-150} y={-34} width={300} height={16} fill="#7a4a2a" />
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((i) => (<g key={`${r}${i}`} transform={`translate(${-118 + i * 59} ${-362 + r * 82})`}><rect width={44} height={58} fill="none" stroke="#4a3a28" strokeWidth={3} /><path d="M6 14 H38 M6 30 H38 M22 6 V50" stroke="#4a3a28" strokeWidth={4} /></g>)))}
        {t && <T y={-440} t={t} fs={44} fill="#fff" />}</g>);
    case 'turtle_ship': return (
      <g {...OL}><path d="M-190 0 L-150 -52 H150 L196 -6 L150 14 H-140Z" fill="#8a5a33" />
        <path d="M-140 -52 Q0 -128 150 -52 L138 -30 Q0 -92 -128 -30Z" fill="#5d6068" />
        {[-100, -50, 0, 50, 100].map((x, i) => <path key={i} d={`M${x} ${-84 - Math.cos(x / 60) * 14} l8 -20 l8 20`} fill="#3f4249" />)}
        <rect x={-8} y={-196} width={10} height={86} fill="#6b4426" /><path d="M2 -196 L96 -150 L2 -140Z" fill="#e8e2d2" />
        <path d="M-210 22 q30 -14 60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="#3f7fbf" strokeWidth={7} /></g>);
    case 'turtle_banknote': return (
      <g {...OL} transform="rotate(-4)"><rect x={-210} y={-130} width={420} height={240} fill="#7fae5a" /><rect x={-190} y={-110} width={380} height={200} fill="none" stroke="#e9f2d8" strokeWidth={4} />
        <g transform="translate(0 46) scale(0.62)"><path d="M-190 0 L-150 -52 H150 L196 -6 L150 14 H-140Z" fill="#5d4a2a" /><path d="M-140 -52 Q0 -128 150 -52 L138 -30 Q0 -92 -128 -30Z" fill="#3f4249" /></g>
        <T x={-160} y={-58} t={t || '500'} fs={64} fill="#e9f2d8" sw={0} a="start" /><T x={160} y={66} t={t || '500'} fs={44} fill="#e9f2d8" sw={0} a="end" /></g>);
    case 'magazine_map': return (
      <g {...OL}><rect x={-190} y={-330} width={380} height={440} fill="#f2c230" /><rect x={-168} y={-286} width={336} height={356} fill="#cfe6f2" />
        <path d="M-60 -250 L30 -262 L92 -216 L74 -140 L96 -52 L58 44 L-6 62 L-52 -8 L-34 -104 L-84 -160Z" fill="#e8dfae" />
        <path d={`M-100 -52 H110`} stroke="#d9433a" strokeWidth={7 * pop01(f, (p.at ?? 0.2) * 60)} />
        <circle cx={-8} cy={-18} r={9} fill={INK} /><T x={26} y={-4} t="Seoul" fs={30} fill={INK} sw={0} a="start" />
        <T y={-306} t={t || 'NATIONAL GEOGRAPHIC'} fs={27} fill={INK} sw={0} /></g>);
    case 'stopwatch': return (
      <g {...OL}><rect x={-16} y={-238} width={32} height={30} rx={6} fill="#8a8f99" /><circle cy={-104} r={118} fill="#f6efdc" />
        <path d={`M0 -104 L0 -222 A118 118 0 0 1 ${118 * Math.sin(Math.PI / 3)} ${-104 - 118 * Math.cos(Math.PI / 3)}Z`} fill="#d9433a" opacity={0.4} stroke="none" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => { const a = (i * Math.PI) / 6; return <path key={i} d={`M${Math.sin(a) * 96} ${-104 - Math.cos(a) * 96} l${Math.sin(a) * 14} ${-Math.cos(a) * 14}`} strokeWidth={5} />; })}
        <path d="M0 -104 L62 -148" stroke="#d9433a" strokeWidth={8} /><circle cy={-104} r={11} fill={INK} />
        {t && <T y={86} t={t} fs={52} fill="#fff" />}</g>);
    case 'dmz_wire': return (
      <g {...OL}>{Array.from({length: p.n ?? 3}, (_, i) => (<g key={i} transform={`translate(${(i - ((p.n ?? 3) - 1) / 2) * 300} 0)`}>
        <rect x={-10} y={-190} width={20} height={190} fill="#5d5348" />
        {[0, 1, 2].map((r) => <path key={r} d={`M-150 ${-158 + r * 52} H150`} strokeWidth={4} />)}
        {[0, 1, 2, 3, 4].map((s) => <circle key={s} cx={-120 + s * 60} cy={-132} r={17} fill="none" strokeWidth={4} />)}
        {[0, 1, 2, 3, 4].map((s) => <circle key={s} cx={-90 + s * 60} cy={-80} r={17} fill="none" strokeWidth={4} />)}</g>))}</g>);
    case 'volvo': return (
      <g {...OL}><path d="M-190 -38 L-176 -96 L-92 -108 L-64 -150 L84 -150 L116 -106 L182 -92 L194 -38 L160 -24 L-156 -24Z" fill={c ?? '#b9c0c9'} />
        <path d="M-52 -146 L-60 -110 L10 -110 L10 -146Z M22 -146 L78 -146 L102 -110 L22 -110Z" fill="#bfe0f2" />
        <rect x={-196} y={-52} width={16} height={18} fill="#f2c230" /><rect x={180} y={-52} width={16} height={18} fill="#d9433a" />
        <circle cx={-112} cy={-22} r={30} fill="#2b2b30" /><circle cx={-112} cy={-22} r={13} fill="#c9ccd4" />
        <circle cx={118} cy={-22} r={30} fill="#2b2b30" /><circle cx={118} cy={-22} r={13} fill="#c9ccd4" />
        {t && <T y={-196} t={t} fs={44} fill="#fff" />}</g>);
    case 'tanker_kr': return (
      <g {...OL}><path d="M-330 0 L-290 -56 H300 L336 -2 L290 22 H-280Z" fill="#37424e" /><rect x={-290} y={-14} width={580} height={12} fill="#c0392b" />
        <rect x={196} y={-150} width={86} height={96} fill="#e8e4da" /><rect x={212} y={-132} width={54} height={20} fill="#9fd0ef" />
        {[-240, -140, -40, 60].map((x, i) => <rect key={i} x={x} y={-104} width={88} height={48} fill={['#3b6fb6', '#d97b29', '#3f9d63', '#8a5aa0'][i]} />)}
        <path d="M-360 34 q36 -16 72 0 t72 0 t72 0 t72 0 t72 0 t72 0 t72 0" fill="none" stroke="#3f7fbf" strokeWidth={7} />
        {t && <T y={-196} t={t} fs={46} fill="#fff" />}</g>);
    case 'phone_kr': return (
      <g {...OL}>{Array.from({length: p.n ?? 1}, (_, i) => (<g key={i} transform={`translate(${(i % 4) * 64 - 96} ${-Math.floor(i / 4) * 118}) rotate(${(i % 3 - 1) * 5})`}>
        <rect x={-27} y={-104} width={54} height={104} rx={9} fill="#23242a" /><rect x={-20} y={-90} width={40} height={72} fill={c ?? '#9fd0ef'} /><circle cy={-9} r={4} fill="#c9ccd4" /></g>))}</g>);
    case 'phonefire': { const fl = (x: number, h: number, col: string, ph: number) => (<path d={`M${x - 26} 0 Q${x - 30 + Math.sin(f / 5 + ph) * 6} ${-h * 0.55} ${x} ${-h + Math.sin(f / 4 + ph) * 8} Q${x + 30} ${-h * 0.55} ${x + 26} 0Z`} fill={col} stroke="none" />); return (
      <g {...OL}><path d="M-150 0 L130 -34 M-130 -6 L150 -30" stroke="#6b4426" strokeWidth={17} />
        {fl(-70, 150, '#e2571e', 0)}{fl(0, 196, '#f07f1e', 2)}{fl(70, 140, '#e2571e', 4)}{fl(0, 120, '#f2c230', 1)}
        {[-96, -34, 30, 88].map((x, i) => <g key={i} transform={`translate(${x} ${-58 - (i % 2) * 26}) rotate(${(i * 37) % 40 - 20})`}><rect x={-24} y={-46} width={48} height={92} rx={8} fill="#23242a" /><rect x={-17} y={-34} width={34} height={60} fill="#575b66" /></g>)}
        {t && <T y={-262} t={t} fs={48} fill="#fff" />}</g>); }
    case 'goldpile': return (
      <g {...OL}>{[0, 1, 2].map((r) => Array.from({length: 4 - r}, (_, i) => <rect key={`${r}${i}`} x={-104 + i * 56 + r * 28} y={-34 - r * 32} width={50} height={28} fill="#e8b93b" stroke="#a67c1a" strokeWidth={2} />))}
        {[0, 1, 2].map((i) => <circle key={i} cx={-128 + i * 26} cy={-96 - i * 8} r={17} fill="none" stroke="#e8b93b" strokeWidth={8} />)}
        <path d="M96 -6 a34 30 0 1 1 68 0 a34 30 0 1 1 -68 0" fill="#d9d4c5" /><ellipse cx={130} cy={-70} rx={26} ry={10} fill="#f2c230" stroke="none" />
        {t && <T y={-196} t={t} fs={48} fill="#fff" />}</g>);
    case 'ryugyong': return (
      <g {...OL}><path d="M0 -560 L120 0 H-120Z" fill={c ?? '#9aa0a8'} /><path d="M0 -560 L0 0 H-120Z" fill={shade('#9aa0a8', -0.12)} stroke="none" />
        {Array.from({length: 12}, (_, r) => <path key={r} d={`M${-104 + r * 9} ${-46 - r * 40} H${104 - r * 9}`} stroke="#6d7278" strokeWidth={4} opacity={0.8} />)}
        <rect x={-150} y={-14} width={300} height={14} fill="#7c8288" />
        {t && <T y={-616} t={t} fs={46} fill="#fff" />}</g>);
    case 'statue_kim': return (
      <g {...OL}><rect x={-170} y={-60} width={340} height={60} fill="#8a8f99" /><rect x={-130} y={-96} width={260} height={36} fill="#9aa0a8" />
        <g fill="#6e6257"><rect x={-34} y={-300} width={26} height={120} /><rect x={10} y={-300} width={26} height={120} />
        <path d="M-52 -452 L56 -452 L64 -296 L-58 -296Z" /><path d="M52 -440 L150 -516 L162 -496 L64 -396Z" /><path d="M-52 -440 L-96 -360 L-76 -348 L-40 -408Z" />
        <circle cy={-492} r={37} /></g>
        {t && <T y={-580} t={t} fs={44} fill="#fff" />}</g>);
    case 'cow_kr': return (
      <g {...OL}><ellipse cx={-10} cy={-128} rx={118} ry={56} fill={c ?? '#a9743f'} />
        <circle cx={104} cy={-146} r={42} fill={c ?? '#a9743f'} /><path d="M76 -176 q-16 -22 -34 -18 M128 -178 q14 -24 32 -22" fill="none" strokeWidth={8} />
        <rect x={118} y={-128} width={40} height={30} rx={12} fill="#c98d5f" /><circle cx={128} cy={-114} r={4} fill={INK} /><circle cx={146} cy={-114} r={4} fill={INK} />
        <circle cx={92} cy={-152} r={6} fill={INK} />
        {[-84, -44, 34, 66].map((x, i) => <rect key={i} x={x} y={-84} width={17} height={84} fill={shade('#a9743f', -0.15)} />)}
        <path d="M-124 -152 q-20 40 -8 84" fill="none" strokeWidth={8} />
        <ellipse cx={-24} cy={-70} rx={22} ry={14} fill="#d9a066" />
        {t && <T y={-236} t={t} fs={44} fill="#fff" />}</g>);
    case 'kr_country': return <g transform={`scale(${p.flip ? -1 : 1} 1)`}><KoreaCountry t={t || 'one'} c={c} m={p.m} f={f} seed={seed} /></g>;
  }
};

// ================= PENINSULA COUNTRY CHARACTERS =================
// One peninsula that splits in two. Outlines in lon/lat, scaled like germany_pack's Country.
const OUTK: Record<string, [number, number][]> = {
  one: [[124.6, 39.9], [126.0, 40.9], [127.4, 41.8], [130.6, 42.3], [129.9, 40.8], [129.5, 38.6], [129.0, 36.8], [129.4, 35.2], [128.1, 34.6], [126.4, 34.4], [126.1, 35.6], [126.3, 36.8], [126.4, 37.9], [125.3, 38.6]],
  north: [[124.6, 39.9], [126.0, 40.9], [127.4, 41.8], [130.6, 42.3], [129.9, 40.8], [129.5, 38.6], [128.9, 38.3], [127.3, 38.0], [126.2, 38.3], [125.3, 38.6]],
  south: [[125.6, 38.2], [126.2, 38.3], [127.3, 38.0], [128.9, 38.3], [129.0, 36.8], [129.4, 35.2], [128.1, 34.6], [126.4, 34.4], [126.1, 35.6], [126.3, 36.8], [126.4, 37.9]],
};
const KCOL: Record<string, string> = {one: '#7fae5a', north: '#5a6f9e', south: '#e8c14a'};
const kPath = (k: string, H: number) => {
  const pts = OUTK[k] ?? OUTK.one, lat0 = pts.reduce((s, q) => s + q[1], 0) / pts.length, cs = Math.cos((lat0 * Math.PI) / 180);
  const xy = pts.map(([lo, la]) => [lo * cs, -la] as [number, number]);
  const x0 = Math.min(...xy.map((q) => q[0])), x1 = Math.max(...xy.map((q) => q[0])), y0 = Math.min(...xy.map((q) => q[1])), y1 = Math.max(...xy.map((q) => q[1]));
  const sc = H / (y1 - y0);
  return {d: 'M' + xy.map(([x, y]) => `${((x - (x0 + x1) / 2) * sc).toFixed(1)} ${((y - y1) * sc).toFixed(1)}`).join(' L') + 'Z', w: (x1 - x0) * sc, H};
};
export const KoreaCountry: React.FC<{t?: string; c?: string; m?: string; f: number; seed: string}> = ({t = 'one', c, m = 'smile', f, seed}) => {
  const {d} = kPath(t, 560), col = c ?? KCOL[t] ?? '#7fae5a', cy = -330;
  const mouth = m === 'sad' ? `M-26 ${cy + 34} q26 -20 52 0` : m === 'angry' ? `M-24 ${cy + 30} h48` : `M-26 ${cy + 22} q26 22 52 0`;
  return (
    <g {...OL}><path d={d} transform="translate(0 -40)" fill={col} />
      <circle cx={-34} cy={cy} r={9} fill={INK} stroke="none" /><circle cx={34} cy={cy} r={9} fill={INK} stroke="none" />
      <path d={mouth} fill="none" strokeWidth={6} />
      <path d="M-70 -300 q-52 26 -58 74 M70 -300 q52 26 58 74" fill="none" strokeWidth={11} />
      <path d="M-40 -36 v44 M40 -36 v44" strokeWidth={11} /><path d="M-58 10 h36 M22 10 h36" strokeWidth={11} />
      <text x={0} y={-640} textAnchor="middle" fontFamily={HAND} fontSize={40} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{t === 'one' ? 'KOREA' : t === 'north' ? 'NORTH' : 'SOUTH'}</text></g>);
};

// ================= BACKGROUNDS =================
export type KoreaBgKind = 'palace_kr' | 'dmz' | 'shipyard_kr' | 'seoulnight' | 'pyongyang' | 'market_kr' | 'darkhome';
const BGSET = new Set<string>(['palace_kr', 'dmz', 'shipyard_kr', 'seoulnight', 'pyongyang', 'market_kr', 'darkhome']);
export const isKoreaBg = (k: string) => BGSET.has(k);
export const KOREA_GROUND: Record<KoreaBgKind, string> = {palace_kr: '#c9b48a', dmz: '#7a8a5a', shipyard_kr: '#9a7b52', seoulnight: '#23283d', pyongyang: '#8f9296', market_kr: '#b39a6d', darkhome: '#3a3630'};

export const KoreaBg: React.FC<{bg: KoreaBgKind; f: number; cx: number; seed: string}> = ({bg, f, cx, seed}) => {
  const S = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  if (bg === 'palace_kr') return (
    <g {...S}><defs><linearGradient id={`pk${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#e9f5ff" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#pk${seed})`} stroke="none" />
      <path d="M0 560 L360 380 L760 560 L1120 360 L1560 560 L1920 420 V730 H0Z" fill="#7fa56a" opacity={0.75} stroke="none" />
      {[300, 1180].map((x, i) => (<g key={i} transform={`translate(${x - cx * 0.15} 0)`}><rect x={0} y={520} width={440} height={210} fill="#c9a877" />
        <path d="M-40 520 Q220 420 480 520 L430 556 Q220 478 10 556Z" fill="#3d4a5a" /><rect x={70} y={580} width={70} height={150} fill="#7a4a2a" /><rect x={300} y={580} width={70} height={150} fill="#7a4a2a" /></g>))}
      <rect y={730} width={1920} height={360} fill="#c9b48a" />{Array.from({length: 8}, (_, i) => <path key={i} d={`M${i * 260 - 60} 730 V1080`} opacity={0.12} />)}</g>);
  if (bg === 'dmz') return (
    <g {...S}><defs><linearGradient id={`dz${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a8c4de" /><stop offset="1" stopColor="#e6eef5" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#dz${seed})`} stroke="none" />
      <path d="M0 620 Q400 480 900 580 T1920 540 V730 H0Z" fill="#7a8a5a" stroke="none" />
      <g transform="translate(700 0)"><rect x={0} y={560} width={240} height={110} fill="#3f7fbf" /><rect x={260} y={560} width={240} height={110} fill="#3f7fbf" /><rect x={70} y={596} width={100} height={74} fill="#2b2b30" /><rect x={330} y={596} width={100} height={74} fill="#2b2b30" /></g>
      <g transform="translate(240 0)"><rect x={-6} y={270} width={12} height={330} fill="#5d5348" /><path d={`M0 282 q${20 + Math.sin(f / 11) * 5} -10 96 0 v64 q-48 -12 -96 0Z`} fill="#f2f2f2" /><circle cx={48} cy={306} r={13} fill="#d9433a" stroke="none" /><circle cx={48} cy={322} r={13} fill="#3b6fb6" stroke="none" /></g>
      <g transform="translate(1640 0)"><rect x={-7} y={210} width={14} height={390} fill="#5d5348" /><path d={`M0 222 q${22 + Math.sin(f / 10 + 2) * 5} -10 104 0 v70 q-52 -13 -104 0Z`} fill="#d9433a" /><rect x={0} y={258} width={104} height={34} fill="#3b6fb6" /><circle cx={52} cy={275} r={15} fill="#fff" stroke="none" /><path d="M52 263 l4 8 9 1 -6 6 1 9 -8 -4 -8 4 1 -9 -6 -6 9 -1Z" fill="#d9433a" stroke="none" /></g>
      <g transform="translate(1330 0)"><rect x={0} y={470} width={120} height={130} fill="#8a7a5c" /><path d="M-14 470 L60 420 L134 470Z" fill="#5d5348" /><rect x={40} y={510} width={40} height={36} fill="#2b2b30" /></g>
      <rect y={730} width={1920} height={360} fill="#7a8a5a" />{Array.from({length: 22}, (_, i) => <path key={i} d={`M${i * 92 - 30} ${790 + (i % 4) * 60} l10 -18 l10 18`} stroke="#5f7346" fill="none" />)}</g>);
  if (bg === 'shipyard_kr') return (
    <g {...S}><defs><linearGradient id={`sy${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fb8e6" /><stop offset="1" stopColor="#dceefc" /></linearGradient></defs>
      <rect width={1920} height={620} fill={`url(#sy${seed})`} stroke="none" />
      {[260, 1560].map((x, i) => (<g key={i} transform={`translate(${x - cx * 0.2} 0)`} stroke="#c9532e" strokeWidth={13}><path d="M0 620 V150 M0 150 H360 M330 150 v60" fill="none" /><path d="M0 620 L330 210" fill="none" strokeWidth={7} /></g>))}
      <path d="M560 640 L620 520 H1300 L1370 640 L1300 690 H640Z" fill="#37424e" /><path d="M620 520 h680" stroke="#c0392b" strokeWidth={10} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={`M${660 + i * 82} 520 V690`} stroke="#8a8f99" strokeWidth={6} />)}
      <rect y={730} width={1920} height={360} fill="#2f6ea6" />{Array.from({length: 14}, (_, i) => <path key={i} d={`M${i * 150 - 40} ${790 + (i % 3) * 70} q34 -16 68 0`} stroke="#9fd0ef" fill="none" opacity={0.7} />)}
      <rect y={690} width={1920} height={42} fill="#9a7b52" /></g>);
  if (bg === 'seoulnight') return (
    <g {...S}><rect width={1920} height={1080} fill="#171b2e" stroke="none" />
      {Array.from({length: 60}, (_, i) => <circle key={i} cx={(i * 173) % 1920} cy={(i * 97) % 300} r={2.4} fill="#fff" opacity={0.7} stroke="none" />)}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const x = i * 250 - 110 - cx * 0.15, h = 260 + ((i * 67) % 200); return (<g key={i}><rect x={x} y={700 - h} width={180} height={h} fill="#232842" />
        {Array.from({length: 24}, (_, w) => <rect key={w} x={x + 18 + (w % 4) * 40} y={700 - h + 24 + Math.floor(w / 4) * 44} width={20} height={24} fill={(w * 7 + i) % 3 ? '#f4d37a' : '#39406b'} stroke="none" />)}</g>); })}
      <path d="M0 700 Q480 640 960 700 T1920 700" fill="none" stroke="#f4d37a" strokeWidth={5} opacity={0.85} />
      <rect y={730} width={1920} height={360} fill="#1d2f4a" />{Array.from({length: 16}, (_, i) => <rect key={i} x={(i * 131) % 1920} y={770 + (i % 4) * 60} width={44} height={7} fill="#f4d37a" opacity={0.5} stroke="none" />)}</g>);
  if (bg === 'pyongyang') return (
    <g {...S}><defs><linearGradient id={`py${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9aa4ae" /><stop offset="1" stopColor="#d5d8da" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#py${seed})`} stroke="none" />
      <g transform="translate(760 0)"><path d="M0 730 V380 L200 290 L400 380 V730" fill="none" stroke="#7c8288" strokeWidth={44} /><rect x={-30} y={352} width={460} height={26} fill="#8a8f99" /></g>
      {[120, 1420].map((x, i) => (<g key={i} transform={`translate(${x} 0)`}><rect x={0} y={470} width={330} height={260} fill="#a8abb0" />{Array.from({length: 12}, (_, w) => <rect key={w} x={26 + (w % 4) * 76} y={500 + Math.floor(w / 4) * 66} width={44} height={46} fill="#6d7278" stroke="none" />)}</g>))}
      <g transform="translate(1700 0) scale(0.42)"><path d="M0 -560 L120 0 H-120Z" fill="#9aa0a8" /></g>
      <rect y={730} width={1920} height={360} fill="#8f9296" /><path d="M0 1080 L760 730 M1920 1080 L1160 730" opacity={0.25} /></g>);
  if (bg === 'market_kr') return (
    <g {...S}><defs><linearGradient id={`mk${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b8c9d4" /><stop offset="1" stopColor="#e8e2d2" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#mk${seed})`} stroke="none" />
      <path d="M0 600 Q500 470 1000 570 T1920 560 V730 H0Z" fill="#8a9678" stroke="none" />
      {[120, 700, 1280].map((x, i) => (<g key={i} transform={`translate(${x - cx * 0.15} 0)`}><rect x={0} y={580} width={420} height={150} fill="#a3865e" />
        <path d={`M-24 580 L210 512 L444 580 L404 612 L16 612Z`} fill={['#b3543f', '#7a7f52', '#5d7186'][i]} />
        {[0, 1, 2].map((b) => <rect key={b} x={36 + b * 130} y={640} width={86} height={56} fill="#c9a86a" />)}
        {[0, 1].map((s2) => <ellipse key={s2} cx={110 + s2 * 190} cy={716} rx={52} ry={20} fill="#e3d9b8" />)}</g>))}
      <rect y={730} width={1920} height={360} fill="#b39a6d" /></g>);
  if (bg === 'darkhome') return (
    <g {...S}><rect width={1920} height={1080} fill="#33302b" stroke="none" />
      <defs><radialGradient id={`dh${seed}`} cx="0.5" cy="0.32" r="0.55"><stop offset="0" stopColor="#f4d37a" stopOpacity="0.5" /><stop offset="1" stopColor="#f4d37a" stopOpacity="0" /></radialGradient></defs>
      <rect width={1920} height={1080} fill={`url(#dh${seed})`} stroke="none" />
      <path d="M960 0 V268" stroke="#14120f" strokeWidth={6} /><circle cx={960} cy={302} r={34 + Math.sin(f / 23) * 2} fill="#f7dd8e" />
      <rect x={1420} y={170} width={330} height={300} fill="#101623" /><path d="M1585 170 V470" strokeWidth={7} />
      <rect y={730} width={1920} height={360} fill="#3a3630" /><path d="M0 730 H1920" stroke="#14120f" strokeWidth={6} /></g>);
  return <rect width={1920} height={1080} fill="#c3c3c3" />;
};
