// Iran pack for the Vidfactory kit. Pure SVG, deterministic (no Math.random, no Date, no CSS animation).
// Contents: 16 props (incl. the carpet_ir signature prop with era states), 7 backgrounds.
// Imported by world.tsx (props, backgrounds) exactly like germany_pack / korea_pack. Do not edit per video.
// First built for: "The Entire History of Iran" (Zeus History, 2026-11-14).
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

// carpet border motif glyphs, one per absorbed civilisation (p.m on carpet_ir)
const Motif: React.FC<{m?: string; x: number; y: number}> = ({m, x, y}) => {
  if (m === 'meander') return <path d={`M${x - 16} ${y + 10} h32 v-20 h-22 v10 h12`} fill="none" stroke="#e8c14a" strokeWidth={4} />;
  if (m === 'arabesque') return <g fill="none" stroke="#7fd4c9" strokeWidth={4}><circle cx={x} cy={y} r={13} /><circle cx={x} cy={y} r={5} /></g>;
  if (m === 'cloudband') return <path d={`M${x - 18} ${y + 4} q9 -16 18 -6 q12 -10 16 4 q-14 8 -24 2 q-10 6 -18 0Z`} fill="#d9d4c5" stroke="none" />;
  if (m === 'floral') return <g><circle cx={x} cy={y} r={6} fill="#d96a8a" stroke="none" />{[0, 1, 2, 3].map((i) => { const a = (i * Math.PI) / 2; return <circle key={i} cx={x + Math.cos(a) * 12} cy={y + Math.sin(a) * 12} r={5} fill="#e88aa8" stroke="none" />; })}<circle cx={x} cy={y} r={3.5} fill="#e8c14a" stroke="none" /></g>;
  return <rect x={x - 9} y={y - 9} width={18} height={18} fill="none" stroke="#e8c14a" strokeWidth={4} transform={`rotate(45 ${x} ${y})`} />;
};

// ================= PROPS =================
export type IranKind = 'carpet_ir' | 'loom_ir' | 'faravahar' | 'fire_altar' | 'cylinder_ir' | 'daric' | 'qanat' | 'cuneiform_tablet' | 'relief_wall' | 'epic_book' | 'astrolabe' | 'tile_mosaic' | 'peacock_throne' | 'oil_derrick' | 'haft_sin' | 'skull_pyramid';
const SET = new Set<string>(['carpet_ir', 'loom_ir', 'faravahar', 'fire_altar', 'cylinder_ir', 'daric', 'qanat', 'cuneiform_tablet', 'relief_wall', 'epic_book', 'astrolabe', 'tile_mosaic', 'peacock_throne', 'oil_derrick', 'haft_sin', 'skull_pyramid']);
export const isIranProp = (k: string) => SET.has(k);

export const IranProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p, f, seed}) => {
  const c = p.c, t = p.t ?? '', m = (p as any).m as string | undefined;
  switch (p.k as IranKind) {
    case 'carpet_ir': { // THE signature prop. t = state: whole|torn|reknotting|burned|halved|ash|stained. m = border motif: plain|meander|arabesque|cloudband|floral.
      const st = t || 'whole';
      const ground = st === 'ash' ? '#6d6a63' : '#1d3a6e', band = st === 'ash' ? '#8a877f' : '#7a1f2b', line = st === 'ash' ? '#a9a69d' : '#e8c14a';
      const half = st === 'halved', dx = half ? 26 : 0;
      const panel = (off: number) => (
        <g transform={`translate(${off} 0)`}>
          <rect x={-330} y={-470} width={660} height={470} fill={ground} />
          <rect x={-330} y={-470} width={660} height={470} fill="none" stroke={line} strokeWidth={6} />
          <rect x={-296} y={-436} width={592} height={402} fill={band} />
          <rect x={-262} y={-402} width={524} height={334} fill={ground} />
          {Array.from({length: 11}, (_, i) => <Motif key={`t${i}`} m={m} x={-275 + i * 55} y={-453} />)}
          {Array.from({length: 11}, (_, i) => <Motif key={`b${i}`} m={m} x={-275 + i * 55} y={-17} />)}
          {Array.from({length: 6}, (_, i) => <Motif key={`l${i}`} m={m} x={-313} y={-385 + i * 62} />)}
          {Array.from({length: 6}, (_, i) => <Motif key={`r${i}`} m={m} x={313} y={-385 + i * 62} />)}
          <path d="M0 -368 L64 -235 L0 -102 L-64 -235Z" fill={st === 'ash' ? '#7d7a72' : '#2f9e9e'} />
          <path d="M0 -318 L38 -235 L0 -152 L-38 -235Z" fill={line} opacity={0.85} stroke="none" />
          {[-150, 150].map((x, i) => <path key={i} d={`M${x} -300 L${x + 34} -235 L${x} -170 L${x - 34} -235Z`} fill={st === 'ash' ? '#7d7a72' : '#2f9e9e'} opacity={0.8} />)}
          {st === 'reknotting' && <g>{Array.from({length: 9}, (_, i) => <path key={i} d={`M${-240 + i * 30} -402 V-68`} stroke="#d9d4c5" strokeWidth={3} opacity={0.75} />)}{Array.from({length: 14}, (_, i) => <circle key={`k${i}`} cx={-230 + (i % 7) * 34} cy={-360 + Math.floor(i / 7) * 150} r={7} fill={line} stroke="none" />)}</g>}
        </g>);
      return (
        <g {...OL}>
          {!half && panel(0)}
          {half && <g><defs><clipPath id={`cl${seed}`}><rect x={-700} y={-560} width={700} height={640} /></clipPath><clipPath id={`cr${seed}`}><rect x={0} y={-560} width={700} height={640} /></clipPath></defs>
            <g clipPath={`url(#cl${seed})`} transform="translate(-30 4)">{panel(0)}</g>
            <g clipPath={`url(#cr${seed})`} transform="translate(30 -4)">{panel(0)}</g>
            <path d="M0 -470 L14 -380 L-10 -290 L12 -200 L-8 -110 L10 0" fill="none" stroke="#f6f4ec" strokeWidth={8} /></g>}
          {st === 'torn' && <path d="M-330 -300 L-120 -260 L-190 -180 L40 -150 L-30 -80 L220 -40" fill="none" stroke="#f6f4ec" strokeWidth={13} />}
          {st === 'burned' && <g><path d="M150 -470 H330 V-290 Q240 -330 190 -380 Q150 -420 150 -470Z" fill="#17130f" stroke="none" opacity={0.92} />{[0, 1, 2, 3].map((i) => <circle key={i} cx={230 + i * 26} cy={-316 - (i % 2) * 34} r={6} fill="#f07f1e" stroke="none" opacity={0.9} />)}</g>}
          {st === 'stained' && <g fill="#14100c" stroke="none" opacity={0.88}><ellipse cx={-90} cy={-160} rx={120} ry={66} /><ellipse cx={30} cy={-120} rx={70} ry={40} /><ellipse cx={-190} cy={-110} rx={44} ry={26} /></g>}
          {st === 'ash' && <g>{[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={-260 + i * 100} cy={-420 + (i % 3) * 130} r={26 + (i % 3) * 9} fill="#8a877f" stroke="none" opacity={0.35} />)}</g>}
          {seed && null}
        </g>);
    }
    case 'loom_ir': return (
      <g {...OL}><rect x={-330} y={-560} width={34} height={560} fill="#7a4a2a" /><rect x={296} y={-560} width={34} height={560} fill="#7a4a2a" />
        <rect x={-330} y={-560} width={660} height={30} fill="#8a5a33" /><rect x={-330} y={-36} width={660} height={30} fill="#8a5a33" />
        {Array.from({length: 21}, (_, i) => <path key={i} d={`M${-300 + i * 30} -530 V-180`} stroke="#e9e2ce" strokeWidth={3.5} opacity={0.85} />)}
        <rect x={-300} y={-180} width={600} height={144} fill="#1d3a6e" /><rect x={-300} y={-180} width={600} height={26} fill="#7a1f2b" />
        {Array.from({length: 9}, (_, i) => <Motif key={i} m={m} x={-262 + i * 65} y={-108} />)}
        <rect x={120} y={-330} width={130} height={20} rx={9} fill="#c9a86a" /><path d="M120 -320 H-240" stroke="#e9e2ce" strokeWidth={3} />
        {t && <T y={-606} t={t} fs={44} fill="#fff" />}</g>);
    case 'faravahar': return (
      <g {...OL}><circle cy={-238} r={52} fill="#e8c14a" /><circle cy={-238} r={34} fill="#1d3a6e" />
        <path d="M-16 -196 h32 l6 44 h-44Z" fill="#2f6f8a" /><circle cy={-212} r={13} fill="#eed2b6" />
        {[-1, 1].map((sg) => (<g key={sg}>{[0, 1, 2].map((r) => <path key={r} d={`M${sg * 44} ${-262 + r * 26} Q${sg * 190} ${-300 + r * 30} ${sg * 330} ${-252 + r * 34} Q${sg * 190} ${-238 + r * 26} ${sg * 44} ${-238 + r * 22}Z`} fill={r === 1 ? '#2f9e9e' : '#e8c14a'} />)}</g>))}
        {[-1, 1].map((sg) => <path key={`s${sg}`} d={`M${sg * 10} -150 q${sg * 60} 60 ${sg * 46} 130 q${-sg * 26} -60 ${-sg * 46} -84Z`} fill="#7a1f2b" />)}
        {t && <T y={-356} t={t} fs={42} fill="#fff" />}</g>);
    case 'fire_altar': { const fl = (x: number, h: number, col: string, ph: number) => (<path d={`M${x - 24} -196 Q${x - 28 + Math.sin(f / 5 + ph) * 6} ${-196 - h * 0.55} ${x} ${-196 - h + Math.sin(f / 4 + ph) * 9} Q${x + 28} ${-196 - h * 0.55} ${x + 24} -196Z`} fill={col} stroke="none" />); return (
      <g {...OL}><path d="M-110 0 L-84 -150 H84 L110 0Z" fill="#a89880" /><rect x={-130} y={-186} width={260} height={38} rx={8} fill="#8a7a62" />
        <ellipse cy={-190} rx={104} ry={20} fill="#4a3a2a" stroke="none" />
        {fl(-38, 120, '#e2571e', 0)}{fl(6, 168, '#f07f1e', 2)}{fl(44, 104, '#e2571e', 4)}{fl(2, 96, '#f2c230', 1)}
        {t && <T y={56} t={t} fs={40} fill="#fff" />}</g>); }
    case 'cylinder_ir': return (
      <g {...OL} transform="rotate(-90)"><rect x={-64} y={-190} width={128} height={380} rx={58} fill="#c9a877" />
        {Array.from({length: 11}, (_, r) => Array.from({length: 9}, (_, i) => <path key={`${r}${i}`} d={`M${-150 + i * 38} ${-44 + r * 9} l10 6 l-10 6 l-3 -6Z`} fill="#8a6a42" stroke="none" />))}
        <ellipse cy={-190} rx={64} ry={20} fill="#b8946a" /><ellipse cy={190} rx={64} ry={20} fill="#b8946a" />
        {t && <T y={258} t={t} fs={38} fill="#fff" r={90} />}</g>);
    case 'daric': return (
      <g {...OL}>{Array.from({length: p.n ?? 1}, (_, i) => (<g key={i} transform={`translate(${(i - ((p.n ?? 1) - 1) / 2) * 108} ${-(i % 2) * 14})`}>
        <circle r={50} fill="#e8b93b" stroke="#a67c1a" strokeWidth={4} /><circle r={40} fill="none" stroke="#a67c1a" strokeWidth={2.5} />
        <path d="M-14 16 q-4 -22 10 -34 l8 10 q10 -4 14 6 M-4 -12 l-16 30 M8 2 l16 22 M-20 26 h34" fill="none" stroke="#8a6414" strokeWidth={5} /></g>))}
        {t && <T y={-84} t={t} fs={40} fill="#fff" />}</g>);
    case 'qanat': return (
      <g {...OL}><path d="M-420 -330 H420" stroke="#8a6a42" strokeWidth={10} />
        {[-300, -100, 100, 300].map((x, i) => <g key={i}><path d={`M${x} -330 V${-120 + i * 8}`} stroke="#8a6a42" strokeWidth={13} /><path d={`M${x} -330 L${x - 60} -236 L${x + 60} -236Z`} fill="#d9c9a3" opacity={0.35} stroke="none" /></g>)}
        <path d="M-420 -96 L-140 -118 L140 -140 L420 -164 L420 -84 L-420 -60Z" fill="#5d4a33" />
        <path d={`M-420 ${-72 + Math.sin(f / 9) * 3} Q-210 ${-92 + Math.sin(f / 9 + 1) * 3} 0 ${-100 + Math.sin(f / 9) * 3} T420 ${-128 + Math.sin(f / 9 + 2) * 3}`} fill="none" stroke="#4fb3e8" strokeWidth={13} />
        <path d="M-420 -330 L-420 -60 M420 -330 L420 -84" stroke="#8a6a42" strokeWidth={6} opacity={0.6} />
        {t && <T y={-384} t={t} fs={42} fill="#fff" />}</g>);
    case 'cuneiform_tablet': return (
      <g {...OL}><rect x={-170} y={-230} width={340} height={250} rx={26} fill="#c9a877" />
        {Array.from({length: 6}, (_, r) => Array.from({length: 7}, (_, i) => <path key={`${r}${i}`} d={`M${-138 + i * 44} ${-196 + r * 36} l13 8 l-13 8 l-4 -8Z`} fill="#8a6a42" stroke="none" />))}
        {t && <T y={66} t={t} fs={38} fill="#fff" />}</g>);
    case 'relief_wall': return (
      <g {...OL}><rect x={-360} y={-430} width={720} height={430} fill="#c9b48a" />
        <path d="M-360 -60 h720 M-360 -430 h720" stroke="#8a6a42" strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (<g key={i} transform={`translate(${-262 + i * 176} 0)`}>
          <circle cy={-330} r={26} fill="#a3865e" /><path d="M-24 -304 h48 l8 130 h-64Z" fill="#a3865e" />
          <path d="M20 -260 l52 -26 M20 -220 l52 10" stroke="#a3865e" strokeWidth={11} />
          <ellipse cx={88} cy={-282} rx={30} ry={22} fill="#8a6a42" />
          <path d="M-16 -174 v110 M16 -174 v110" stroke="#a3865e" strokeWidth={12} /></g>))}
        {t && <T y={-478} t={t} fs={40} fill="#fff" />}</g>);
    case 'epic_book': return (
      <g {...OL}><path d="M0 -268 Q-140 -310 -268 -282 V22 Q-140 -6 0 -44 Q140 -6 268 22 V-282 Q140 -310 0 -268Z" fill="#7a1f2b" />
        <path d="M0 -254 Q-132 -294 -252 -268 V8 Q-132 8 0 -32 Q132 8 252 8 V-268 Q132 -294 0 -254Z" fill="#f6efdc" />
        <path d="M0 -254 V-32" stroke="#c9b48a" strokeWidth={5} />
        <rect x={-228} y={-248} width={180} height={190} fill="#1d3a6e" /><path d="M-138 -214 L-104 -128 L-138 -52 L-172 -128Z" fill="#e8c14a" stroke="none" />
        {[-216, -60].map((x, i) => <Motif key={i} m="arabesque" x={x} y={-230} />)}
        {[0, 1, 2, 3, 4].map((r) => <path key={r} d={`M44 ${-216 + r * 38} H228`} stroke="#8a7a62" strokeWidth={6} opacity={0.8} />)}
        {[0, 1, 2].map((r) => <path key={r} d={`M-228 ${-24 + r * 4} H-52`} stroke="#8a7a62" strokeWidth={5} opacity={0.6} />)}
        {t && <T y={84} t={t} fs={42} fill="#fff" />}</g>);
    case 'astrolabe': return (
      <g {...OL}><circle cy={-436} r={20} fill="none" stroke="#a67c1a" strokeWidth={9} />
        <circle cy={-238} r={180} fill="#c9a24a" /><circle cy={-238} r={180} fill="none" stroke="#a67c1a" strokeWidth={6} />
        <circle cy={-238} r={138} fill="#e8cf7e" /><circle cy={-238} r={96} fill="none" stroke="#a67c1a" strokeWidth={4} /><circle cy={-238} r={52} fill="none" stroke="#a67c1a" strokeWidth={4} />
        {[0, 1, 2, 3, 4, 5].map((i) => { const a = (i * Math.PI) / 3; return <path key={i} d={`M${Math.sin(a) * 60} ${-238 - Math.cos(a) * 60} L${Math.sin(a) * 132} ${-238 - Math.cos(a) * 132}`} stroke="#a67c1a" strokeWidth={4} />; })}
        <path d={`M${-120 * Math.cos(f / 40)} ${-238 - 120 * Math.sin(f / 40)} L${120 * Math.cos(f / 40)} ${-238 + 120 * Math.sin(f / 40)}`} stroke="#7a5410" strokeWidth={11} />
        <circle cy={-238} r={15} fill="#7a5410" />
        {t && <T y={30} t={t} fs={40} fill="#fff" />}</g>);
    case 'tile_mosaic': return (
      <g {...OL}><rect x={-300} y={-420} width={600} height={420} fill="#2f9e9e" />
        {Array.from({length: 4}, (_, r) => Array.from({length: 5}, (_, i) => (<g key={`${r}${i}`} transform={`translate(${-240 + i * 120} ${-360 + r * 105})`}>
          <path d="M0 -34 L10 -10 L34 0 L10 10 L0 34 L-10 10 L-34 0 L-10 -10Z" fill={r % 2 ? '#1d3a6e' : '#e8c14a'} stroke="none" />
          <circle r={6} fill="#f6efdc" stroke="none" /></g>)))}
        <rect x={-300} y={-420} width={600} height={420} fill="none" stroke="#1d3a6e" strokeWidth={8} />
        {t && <T y={52} t={t} fs={40} fill="#fff" />}</g>);
    case 'peacock_throne': return (
      <g {...OL}><path d="M-120 0 v-190 h240 v190 M-120 -60 h240" fill="#8a6414" />
        <rect x={-96} y={-176} width={192} height={120} fill="#7a1f2b" />
        {Array.from({length: 9}, (_, i) => { const a = Math.PI * (0.08 + (i * 0.105)); const x = Math.cos(a) * 168, y = -196 - Math.sin(a) * 168; return (<g key={i}><path d={`M0 -196 L${x} ${y}`} stroke="#2f9e5a" strokeWidth={7} /><ellipse cx={x} cy={y} rx={24} ry={31} fill="#2f6f8a" /><ellipse cx={x} cy={y} rx={12} ry={17} fill="#2f9e5a" stroke="none" /><ellipse cx={x} cy={y} rx={5.5} ry={8} fill="#7b2d8e" stroke="none" /></g>); })}
        <path d="M-150 0 h300 M-132 -216 q132 -52 264 0" fill="none" stroke="#e8c14a" strokeWidth={7} />
        {[0, 1, 2].map((i) => <circle key={i} cx={-52 + i * 52} cy={-118} r={9} fill="#4fb3e8" stroke="none" />)}
        {t && <T y={56} t={t} fs={40} fill="#fff" />}</g>);
    case 'oil_derrick': return (
      <g {...OL}><path d="M-120 0 L-44 -470 M120 0 L44 -470 M-44 -470 H44" stroke="#6b4426" strokeWidth={15} />
        {Array.from({length: 6}, (_, i) => { const y = -52 - i * 72, w = 108 - i * 15; return <path key={i} d={`M${-w} ${y} H${w} M${-w} ${y} L${w} ${y - 66} M${w} ${y} L${-w} ${y - 66}`} stroke="#6b4426" strokeWidth={8} fill="none" />; })}
        <path d="M0 -470 V-330" stroke="#3a3a3a" strokeWidth={7} /><rect x={-34} y={-330} width={68} height={44} fill="#3a3a3a" />
        <path d="M0 -286 V-30" stroke="#3a3a3a" strokeWidth={10} /><ellipse cy={-16} rx={52} ry={13} fill="#14100c" stroke="none" />
        <path d="M-190 0 h380" stroke="#8a6a42" strokeWidth={9} />
        {t && <T y={-524} t={t} fs={42} fill="#fff" />}</g>);
    case 'haft_sin': return (
      <g {...OL}><rect x={-330} y={-118} width={660} height={26} rx={8} fill="#7a4a2a" /><path d="M-290 -92 v92 M290 -92 v92" stroke="#7a4a2a" strokeWidth={13} />
        <rect x={-330} y={-118} width={660} height={10} fill="#f6efdc" stroke="none" />
        {[-252, -152, -52, 52, 152, 252].map((x, i) => (<g key={i}><ellipse cx={x} cy={-128} rx={40} ry={15} fill={['#3f9d63', '#c9a24a', '#d96a8a', '#7a4a8a', '#b3543f', '#2f9e9e'][i]} /><path d={`M${x - 40} -128 a40 15 0 0 0 80 0`} fill="none" strokeWidth={3} /></g>))}
        <g><rect x={-26} y={-238} width={52} height={112} fill="#d9e6ee" stroke={INK} strokeWidth={3} /><path d="M-26 -238 L0 -262 L26 -238" fill="#c9a24a" stroke="none" /></g>
        {[-96, 96].map((x, i) => (<g key={i}><rect x={x - 6} y={-176} width={12} height={52} fill="#f6efdc" /><path d={`M${x} ${-196 + Math.sin(f / 4 + i * 2) * 3} q9 -18 0 -30 q-9 12 0 30Z`} fill="#f2a541" stroke="none" /></g>))}
        <g><ellipse cx={196} cy={-140} rx={42} ry={26} fill="#bfe0f2" opacity={0.75} stroke="none" /><path d="M182 -142 q14 -10 26 0 q-12 8 -26 0Z" fill="#e2571e" stroke="none" /></g>
        {t && <T y={52} t={t} fs={40} fill="#fff" />}</g>);
    case 'skull_pyramid': return (
      <g {...OL} opacity={0.92}>{[0, 1, 2, 3].map((r) => Array.from({length: 5 - r}, (_, i) => (<g key={`${r}${i}`} transform={`translate(${-128 + i * 64 + r * 32} ${-34 - r * 58})`}>
        <circle r={29} fill="#d9d2be" /><circle cx={-11} cy={-4} r={6.5} fill="#3a3428" stroke="none" /><circle cx={11} cy={-4} r={6.5} fill="#3a3428" stroke="none" /><path d="M-5 8 l5 9 l5 -9" fill="#3a3428" stroke="none" /><path d="M-13 24 h26" stroke="#3a3428" strokeWidth={3.5} /></g>)))}
        {t && <T y={-306} t={t} fs={38} fill="#fff" />}</g>);
  }
};

// ================= BACKGROUNDS =================
export type IranBgKind = 'persepolis' | 'isfahan' | 'plateau' | 'fire_temple' | 'bazaar_ir' | 'caravanserai' | 'tehran_modern';
const BGSET = new Set<string>(['persepolis', 'isfahan', 'plateau', 'fire_temple', 'bazaar_ir', 'caravanserai', 'tehran_modern']);
export const isIranBg = (k: string) => BGSET.has(k);
export const IRAN_GROUND: Record<IranBgKind, string> = {persepolis: '#cbb287', isfahan: '#b39a6d', plateau: '#d9b77c', fire_temple: '#4a3a2a', bazaar_ir: '#a3865e', caravanserai: '#c2a878', tehran_modern: '#5a6068'};

export const IranBg: React.FC<{bg: IranBgKind; f: number; cx: number; seed: string}> = ({bg, f, cx, seed}) => {
  const S = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  if (bg === 'persepolis') return (
    <g {...S}><defs><linearGradient id={`pp${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f2e3bb" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#pp${seed})`} stroke="none" />
      <path d="M0 470 L420 330 L760 470 L1180 310 L1560 450 L1920 350 V730 H0Z" fill="#b39a6d" opacity={0.8} stroke="none" />
      <rect x={140} y={520} width={1640} height={210} fill="#c9b48a" />
      {[0, 1, 2, 3, 4, 5].map((i) => (<g key={i} transform={`translate(${300 + i * 264 - cx * 0.1} 0)`}><rect x={-26} y={210} width={52} height={310} fill="#d9c9a3" /><rect x={-40} y={182} width={80} height={30} fill="#b39a6d" /><path d="M-26 260 h52 M-26 330 h52 M-26 400 h52" stroke="#a3865e" strokeWidth={4} /></g>))}
      {[0, 1, 2].map((i) => <rect key={i} x={240 + i * 560} y={470} width={300} height={18} fill="#a3865e" />)}
      <rect y={730} width={1920} height={360} fill="#cbb287" />{Array.from({length: 9}, (_, i) => <path key={i} d={`M${i * 230 - 40} 730 V1080`} opacity={0.1} />)}</g>);
  if (bg === 'isfahan') return (
    <g {...S}><defs><linearGradient id={`is${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fb8e6" /><stop offset="1" stopColor="#e9f5ff" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#is${seed})`} stroke="none" />
      <g transform={`translate(${-cx * 0.12} 0)`}><path d="M700 560 a260 240 0 0 1 520 0Z" fill="#2f9e9e" /><path d="M760 560 a200 180 0 0 1 400 0Z" fill="#1d3a6e" /><circle cx={960} cy={330} r={17} fill="#e8c14a" stroke="none" /><path d="M960 300 v-58" stroke="#e8c14a" strokeWidth={7} />
        {[620, 1240].map((x, i) => (<g key={i}><rect x={x} y={270} width={34} height={290} fill="#2f9e9e" /><path d={`M${x + 17} 196 l20 74 h-40Z`} fill="#1d3a6e" /><circle cx={x + 17} cy={188} r={9} fill="#e8c14a" stroke="none" /></g>))}
        {[80, 420, 1420, 1720].map((x, i) => (<g key={i}><rect x={x} y={470} width={200} height={90} fill="#3aa7a3" />{[0, 1, 2].map((a) => <path key={a} d={`M${x + 22 + a * 62} 560 v-52 a20 26 0 0 1 40 0 v52Z`} fill="#1d3a6e" stroke="none" />)}</g>))}</g>
      <rect y={560} width={1920} height={170} fill="#7fa56a" /><rect y={730} width={1920} height={360} fill="#b39a6d" />
      <ellipse cx={960} cy={640} rx={420} ry={34} fill="#8ec9ee" opacity={0.55} stroke="none" /></g>);
  if (bg === 'plateau') return (
    <g {...S}><defs><linearGradient id={`pl${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f7e8c3" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#pl${seed})`} stroke="none" />
      <circle cx={1620} cy={140} r={62} fill="#f7dd8e" stroke="none" />
      <path d="M0 520 L300 300 L520 440 L820 260 L1120 430 L1420 290 L1720 420 L1920 330 V730 H0Z" fill="#9a8468" />
      <path d="M820 260 L890 330 L820 356 L752 330Z M1420 290 L1486 356 L1420 380 L1356 356Z" fill="#eef3f8" stroke="none" opacity={0.9} />
      <path d="M0 620 L360 500 L760 600 L1180 490 L1560 590 L1920 510 V730 H0Z" fill="#c2a878" />
      <rect y={730} width={1920} height={360} fill="#d9b77c" />{Array.from({length: 16}, (_, i) => <path key={i} d={`M${i * 128 - 30} ${800 + (i % 4) * 66} l12 -20 l12 20`} stroke="#b89468" fill="none" />)}</g>);
  if (bg === 'fire_temple') return (
    <g {...S}><rect width={1920} height={1080} fill="#241c14" stroke="none" />
      <defs><radialGradient id={`ft${seed}`} cx="0.5" cy="0.52" r="0.5"><stop offset="0" stopColor="#f2a541" stopOpacity="0.5" /><stop offset="1" stopColor="#f2a541" stopOpacity="0" /></radialGradient></defs>
      <rect width={1920} height={1080} fill={`url(#ft${seed})`} stroke="none" />
      {[240, 1560].map((x, i) => (<g key={i}><rect x={x} y={120} width={110} height={610} fill="#3a2e20" /><rect x={x - 16} y={96} width={142} height={30} fill="#4a3a28" /></g>))}
      <path d="M0 120 H1920" stroke="#120d08" strokeWidth={16} />
      <g transform="translate(960 730)"><path d="M-120 0 L-92 -140 H92 L120 0Z" fill="#5d4a33" /><rect x={-142} y={-176} width={284} height={38} rx={8} fill="#6d5940" />
        <path d={`M-40 -176 Q-46 ${-176 - 66 - Math.sin(f / 5) * 8} 0 ${-176 - 148 + Math.sin(f / 4) * 10} Q46 ${-176 - 66} 40 -176Z`} fill="#f07f1e" stroke="none" /><path d={`M-18 -176 Q-20 ${-176 - 44 - Math.sin(f / 4 + 1) * 6} 0 ${-176 - 92 + Math.sin(f / 5 + 1) * 7} Q20 ${-176 - 44} 18 -176Z`} fill="#f2c230" stroke="none" /></g>
      <rect y={730} width={1920} height={360} fill="#33281c" /></g>);
  if (bg === 'bazaar_ir') return (
    <g {...S}><defs><linearGradient id={`bz${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a6a44" /><stop offset="1" stopColor="#c9a877" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#bz${seed})`} stroke="none" />
      {[0, 1, 2].map((i) => { const y = 90 + i * 150, w = 860 - i * 190; return <path key={i} d={`M${960 - w} 730 V${y + 190} a${w * 0.52} ${150 - i * 26} 0 0 1 ${w * 1.04} 0 V730`} fill="none" stroke="#6d5136" strokeWidth={30 - i * 6} opacity={1 - i * 0.22} />; })}
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${330 + i * 420} 0 L${250 + i * 420} 730`} stroke="#f7e8c3" strokeWidth={26} opacity={0.14} fill="none" />)}
      {[60, 1330].map((x, i) => (<g key={i} transform={`translate(${x} 0)`}><rect x={0} y={560} width={500} height={170} fill="#7a5a38" /><path d="M-16 560 L250 492 L516 560 L478 590 L22 590Z" fill={i ? '#7a2e2e' : '#2f5f5f'} />{[0, 1, 2].map((b) => <rect key={b} x={36 + b * 150} y={616} width={104} height={66} fill="#c9a86a" />)}<circle cx={120} cy={700} r={26} fill="#d96a8a" stroke="none" /><circle cx={380} cy={700} r={26} fill="#2f9e9e" stroke="none" /></g>))}
      <rect y={730} width={1920} height={360} fill="#a3865e" /></g>);
  if (bg === 'caravanserai') return (
    <g {...S}><defs><linearGradient id={`cv${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f2e3bb" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#cv${seed})`} stroke="none" />
      <path d="M0 400 L300 260 L620 400 L960 240 L1300 400 L1620 270 L1920 400 V730 H0Z" fill="#b39a6d" opacity={0.7} stroke="none" />
      {[0, 1, 2, 3, 4].map((i) => (<g key={i} transform={`translate(${120 + i * 350 - cx * 0.08} 0)`}><rect x={0} y={430} width={270} height={190} fill="#c2a878" /><path d="M44 620 v-120 a91 105 0 0 1 182 0 v120Z" fill="#5d4a33" /><path d="M20 430 h230" stroke="#8a6a42" strokeWidth={9} /></g>))}
      <g transform="translate(960 0)"><circle cy={668} r={54} fill="#8a6a42" /><circle cy={660} r={42} fill="#3f7fbf" stroke="none" /><path d="M906 640 q54 -22 108 0" stroke="#c9d6da" strokeWidth={5} fill="none" /></g>
      <rect y={730} width={1920} height={360} fill="#c2a878" /></g>);
  if (bg === 'tehran_modern') return (
    <g {...S}><defs><linearGradient id={`tm${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#93a7ba" /><stop offset="1" stopColor="#dfe5ea" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#tm${seed})`} stroke="none" />
      <path d="M0 430 L340 250 L700 380 L1080 230 L1460 370 L1920 270 V560 H0Z" fill="#7d8ea3" />
      <path d="M1080 230 L1150 310 L1080 336 L1012 310Z M340 250 L398 312 L340 332 L284 312Z" fill="#eef3f8" stroke="none" opacity={0.95} />
      <g transform={`translate(${300 - cx * 0.1} 0)`}><path d="M0 730 L70 420 L110 420 L180 730 M22 560 H158 M44 486 H136" fill="none" stroke="#e8e4da" strokeWidth={17} /><path d="M90 420 v-44" stroke="#e8e4da" strokeWidth={10} /></g>
      {[760, 1060, 1420, 1660].map((x, i) => { const h = 210 + ((i * 83) % 150); return (<g key={i}><rect x={x} y={730 - h} width={170} height={h} fill="#6d7681" />{Array.from({length: 12}, (_, w) => <rect key={w} x={x + 16 + (w % 3) * 48} y={730 - h + 20 + Math.floor(w / 3) * 44} width={28} height={30} fill={(w * 5 + i) % 4 ? '#c9d6da' : '#f4d37a'} stroke="none" />)}</g>); })}
      <g transform="translate(1620 0)"><path d="M0 730 V470 M-8 470 a44 44 0 0 1 88 0Z" fill="#8a929c" /><path d="M40 470 v-70" stroke="#8a929c" strokeWidth={8} /></g>
      <rect y={730} width={1920} height={360} fill="#5a6068" />{Array.from({length: 10}, (_, i) => <path key={i} d={`M${i * 210 - 30} 800 H${i * 210 + 90}`} stroke="#e8e4da" strokeWidth={5} opacity={0.35} />)}</g>);
  return <rect width={1920} height={1080} fill="#c3c3c3" />;
};
