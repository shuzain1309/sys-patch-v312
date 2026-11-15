// Japan pack for the Vidfactory kit. Pure SVG, deterministic (no Math.random, no Date, no CSS animation).
// Contents: 8 props (incl. the gate_jp signature prop with 10 states), 6 backgrounds.
// Imported by world.tsx (props, backgrounds) exactly like germany_pack / korea_pack / iran_pack. Do not edit per video.
// First built for: "The Entire History of Japan" (Zeus History, 2026-11-15).
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
const flame = (f: number, x: number, base: number, h: number, col: string, ph: number) => (
  <path d={`M${x - 24} ${base} Q${x - 28 + Math.sin(f / 5 + ph) * 6} ${base - h * 0.55} ${x} ${base - h + Math.sin(f / 4 + ph) * 9} Q${x + 28} ${base - h * 0.55} ${x + 24} ${base}Z`} fill={col} stroke="none" />
);

// ================= PROPS =================
export type JapanKind = 'gate_jp' | 'torii_jp' | 'katana_jp' | 'tanegashima_jp' | 'blackship_jp' | 'shinkansen_jp' | 'kofun_jp' | 'jomon_pot_jp';
const SET = new Set<string>(['gate_jp', 'torii_jp', 'katana_jp', 'tanegashima_jp', 'blackship_jp', 'shinkansen_jp', 'kofun_jp', 'jomon_pot_jp']);
export const isJapanProp = (k: string) => SET.has(k);

export const JapanProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p, f, seed}) => {
  const c = p.c, t = p.t ?? '';
  switch (p.k as JapanKind) {
    case 'gate_jp': { // THE signature prop. t = state: shore|built|guarded|broken|rebuilt|shut|forced|burning|glass|open. Stands on a shoreline: sand + surf at the base, whatever the era.
      const st = t || 'built';
      const wood = c ?? '#7a5230', woodHi = shade('#7a5230', 0.22), stone = '#8a8578';
      const doorPanel = (side: -1 | 1, fill: string, extra?: React.ReactNode) => (
        <g>
          <rect x={side < 0 ? -168 : 4} y={-398} width={164} height={398} fill={fill} />
          {[-120, -72, -24].map((o, i) => side < 0
            ? <path key={i} d={`M${-168 + 48 + i * 48} -398 V0`} stroke="#5d3d22" strokeWidth={3} opacity={0.7} />
            : <path key={i} d={`M${4 + 48 + i * 48} -398 V0`} stroke="#5d3d22" strokeWidth={3} opacity={0.7} />)}
          <circle cx={side * 26} cy={-190} r={15} fill="none" stroke="#3a3a3a" strokeWidth={6} />
          {extra}
        </g>);
      const bands = (<g>{[-330, -70].map((y, i) => <g key={i}><rect x={-168} y={y} width={336} height={22} fill="#3f4249" />{Array.from({length: 7}, (_, s) => <circle key={s} cx={-140 + s * 46} cy={y + 11} r={5.5} fill="#c9ccd4" stroke="none" />)}</g>)}</g>);
      return (
        <g {...OL}>
          {/* shoreline: surf + wet sand, drawn first so the frame stands in it */}
          <path d="M-430 6 q36 -14 72 0 t72 0 t72 0 t72 0 t72 0 t72 0 t72 0 t72 0" fill="none" stroke="#4fb3e8" strokeWidth={7} />
          <path d="M-430 26 q36 -12 72 0 t72 0 t72 0 t72 0 t72 0 t72 0 t72 0 t72 0" fill="none" stroke="#9fd0ef" strokeWidth={5} opacity={0.8} />
          {/* stone frame: two pillars on stone bases + double lintel */}
          {[-1, 1].map((sg) => (<g key={sg}>
            <path d={`M${sg * 268} 0 L${sg * 252} -34 L${sg * 176} -34 L${sg * 164} 0Z`} fill={shade(stone, -0.14)} />
            <rect x={sg < 0 ? -238 : 170} y={-452} width={68} height={420} fill={stone} />
            <path d={`M${sg < 0 ? -238 : 170} -300 h68 M${sg < 0 ? -238 : 170} -150 h68`} stroke={shade(stone, -0.25)} strokeWidth={3} />
          </g>))}
          <rect x={-282} y={-500} width={564} height={34} fill={shade(stone, 0.08)} />
          <rect x={-258} y={-466} width={516} height={22} fill={stone} />
          {/* doors by state */}
          {st === 'shore' && <g>{/* open frame only: two short rope ties where doors will hang */}
            {[-1, 1].map((sg) => <path key={sg} d={`M${sg * 168} -380 q${sg * -14} 26 0 52`} fill="none" stroke="#c9a86a" strokeWidth={6} />)}</g>}
          {(st === 'built' || st === 'guarded' || st === 'shut') && <g>{doorPanel(-1, wood)}{doorPanel(1, wood)}</g>}
          {st === 'rebuilt' && <g>{doorPanel(-1, woodHi)}{doorPanel(1, woodHi)}{bands}</g>}
          {st === 'glass' && <g>
            <rect x={-168} y={-398} width={336} height={398} fill="#bfe0f2" opacity={0.55} />
            <path d="M0 -398 V0 M-168 -200 H168" stroke="#6d7681" strokeWidth={10} />
            <rect x={-168} y={-398} width={336} height={398} fill="none" stroke="#6d7681" strokeWidth={8} />
            {[-1, 1].map((sg) => <rect key={sg} x={sg * 30 - 5} y={-216} width={10} height={64} rx={5} fill="#3f4249" />)}
            <path d="M-140 -370 L60 -60 M-60 -398 L168 -130" stroke="#fff" strokeWidth={9} opacity={0.5} /></g>}
          {st === 'broken' && <g>
            <g transform="rotate(6 -168 -398)">{doorPanel(-1, wood)}<path d="M-160 -320 L-90 -240 L-140 -150 L-70 -70 L-110 0" fill="none" stroke="#2e1f12" strokeWidth={6} /></g>
            <g transform="rotate(-16 168 -398)">{doorPanel(1, shade('#7a5230', -0.08))}</g>
            <path d="M-30 0 L-6 -52 L16 0Z M60 0 L84 -38 L104 0Z" fill={wood} />
            <path d="M-168 -398 h336" stroke="#2e1f12" strokeWidth={4} strokeDasharray="14 10" /></g>}
          {st === 'forced' && <g>
            <g transform="rotate(-64 -168 -398)">{doorPanel(-1, wood)}</g>
            <g transform="rotate(28 168 -398) translate(0 22)">{doorPanel(1, shade('#7a5230', -0.06))}<path d="M168 -398 l26 14 l-10 22 l-20 -12Z" fill="#3f4249" /></g>
            <path d="M-60 -6 L-30 -44 L4 -6Z" fill={wood} /></g>}
          {st === 'open' && <g>
            <g transform="rotate(-72 -168 -398)">{doorPanel(-1, wood)}</g>
            <g transform="rotate(72 168 -398)">{doorPanel(1, wood)}</g></g>}
          {st === 'burning' && <g>{doorPanel(-1, shade('#7a5230', -0.15))}{doorPanel(1, shade('#7a5230', -0.15))}
            <path d="M-168 -398 h336 v60 q-168 44 -336 0Z" fill="#241c17" opacity={0.55} stroke="none" />
            {flame(f, -110, -398, 120, '#e2571e', 0)}{flame(f, 0, -398, 168, '#f07f1e', 2)}{flame(f, 110, -398, 108, '#e2571e', 4)}{flame(f, -30, 0, 96, '#f07f1e', 1)}{flame(f, 70, 0, 76, '#e2571e', 3)}
            {[0, 1, 2].map((i) => <circle key={i} cx={-60 + i * 60} cy={-520 - (i % 2) * 26} r={17 + i * 4} fill="#6d6a63" opacity={0.55} stroke="none" />)}</g>}
          {st === 'guarded' && <g>{/* crossed spears barred across the doors */}
            <path d="M-196 -30 L196 -368 M196 -30 L-196 -368" stroke="#8a5a33" strokeWidth={11} />
            <path d="M196 -368 l18 -34 l6 38Z M-196 -368 l-18 -34 l-6 38Z" fill="#dfe5ec" />
            <circle cy={-199} r={13} fill="#b3202a" /></g>}
          {st === 'shut' && <g>{/* the heavy bar */}
            <rect x={-216} y={-238} width={432} height={46} rx={8} fill="#4a3a28" />
            {[-196, 150].map((x, i) => <rect key={i} x={x} y={-252} width={46} height={74} fill="#3f4249" />)}
            <path d="M-216 -215 H216" stroke="#2e2115" strokeWidth={5} /></g>}
          {seed && null}
        </g>);
    }
    case 'torii_jp': return (
      <g {...OL}><path d="M-252 -428 Q0 -452 252 -428 L236 -392 Q0 -414 -236 -392Z" fill="#c23b2a" />
        <rect x={-238} y={-392} width={476} height={24} fill="#a82f21" />
        {[-1, 1].map((sg) => (<g key={sg}><path d={`M${sg * 168} 0 L${sg * 156} -368 h30 L${sg * 186} 0Z`} fill="#c23b2a" /><rect x={sg * 156 - (sg < 0 ? 30 : 0)} y={-368} width={30} height={0} fill="none" /></g>))}
        <rect x={-196} y={-300} width={392} height={22} fill="#c23b2a" />
        <rect x={-13} y={-392} width={26} height={94} fill="#a82f21" />
        {[-1, 1].map((sg) => <path key={sg} d={`M${sg * 186} 0 h${sg * -44}`} stroke="#7e2418" strokeWidth={8} />)}
        {t && <T y={-486} t={t} fs={42} fill="#fff" />}</g>);
    case 'katana_jp': return (
      <g {...OL}>{/* stand */}
        <path d="M-190 0 L-120 -64 L-50 0 M190 0 L120 -64 L50 0 M-120 -64 H120" stroke="#4a3a28" strokeWidth={13} fill="none" />
        <rect x={-216} y={-84} width={432} height={20} rx={8} fill="#5d4a33" />
        {/* blade, edge down, gentle curve */}
        <path d="M-196 -96 Q0 -138 196 -96 L196 -82 Q0 -118 -196 -82Z" fill="#dfe5ec" />
        <path d="M-196 -90 Q0 -128 196 -90" fill="none" stroke="#9aa5b1" strokeWidth={3} />
        {/* tsuba + wrapped grip */}
        <ellipse cx={-216} cy={-96} rx={10} ry={24} fill="#c9a24a" />
        <path d="M-226 -108 L-268 -100 L-226 -90 L-268 -80" fill="none" stroke="#2b2d42" strokeWidth={13} />
        <circle cx={-282} cy={-90} r={10} fill="#2b2d42" />
        {t && <T y={-176} t={t} fs={40} fill="#fff" />}</g>);
    case 'tanegashima_jp': return (
      <g {...OL}><path d="M-240 0 Q-120 -26 30 -34 L250 -44 L250 -26 L36 -16 Q-110 -8 -196 22 Q-232 30 -240 0Z" fill="#7a4a2a" />
        <rect x={-60} y={-58} width={316} height={15} rx={7} fill="#3f4249" />
        <path d="M60 -43 q6 -34 44 -38 q-16 20 -14 38Z" fill="#8f98a3" />
        <circle cx={66} cy={-40} r={7} fill="#c9a24a" />
        <rect x={196} y={-66} width={10} height={24} fill="#c9a24a" />
        <path d="M-30 -30 q-4 26 12 40" fill="none" stroke="#3f4249" strokeWidth={7} />
        <circle cx={-196} cy={14} r={12} fill="#5d3d22" />
        {t && <T y={-116} t={t} fs={40} fill="#fff" />}</g>);
    case 'blackship_jp': return ( // a vessel: keep on water backgrounds only (render-review rule)
      <g {...OL}><path d="M-300 0 L-258 -64 H268 L308 -4 L256 20 H-246Z" fill="#23242a" />
        <rect x={-258} y={-78} width={526} height={16} fill="#17181d" />
        {[-180, -60, 60, 180].map((x, i) => <rect key={i} x={x} y={-50} width={26} height={18} fill="#f4d37a" stroke="none" />)}
        {/* paddle box + stack with drifting smoke */}
        <rect x={196} y={-118} width={54} height={56} fill="#17181d" />
        <rect x={-16} y={-196} width={30} height={120} fill="#17181d" /><rect x={-22} y={-206} width={42} height={14} fill="#3f4249" />
        {[0, 1, 2].map((i) => <circle key={i} cx={2 + i * 22 + Math.sin(f / 9 + i) * 4} cy={-232 - i * 30} r={13 + i * 6} fill="#c9ccd4" opacity={0.75 - i * 0.18} stroke="none" />)}
        {/* masts + furled sails: steam AND sail, 1853 */}
        {[-150, 110].map((x, i) => (<g key={i}><path d={`M${x} -76 V-268`} stroke="#17181d" strokeWidth={8} /><path d={`M${x - 56} -226 H${x + 56} M${x - 44} -168 H${x + 44}`} stroke="#17181d" strokeWidth={5} /><path d={`M${x - 50} -226 q50 20 100 0 l-8 18 q-42 -14 -84 0Z`} fill="#e8e2d2" /></g>))}
        <path d="M-330 34 q36 -16 72 0 t72 0 t72 0 t72 0 t72 0 t72 0 t72 0" fill="none" stroke="#3f7fbf" strokeWidth={7} />
        {t && <T y={-306} t={t} fs={44} fill="#fff" />}</g>);
    case 'shinkansen_jp': return (
      <g {...OL}><path d="M-330 -8 L-318 -64 Q-300 -104 -210 -112 L180 -118 Q300 -116 332 -66 Q340 -30 318 -12 L120 0Z" fill="#f2f4f6" />
        <path d="M-318 -52 L332 -58 L332 -66 Q300 -116 180 -118 L-210 -112 Q-300 -104 -318 -64Z" fill="#2f6fb2" opacity={0.0} stroke="none" />
        <path d="M-326 -44 Q0 -58 334 -50 L334 -30 Q0 -40 -326 -26Z" fill="#2f6fb2" />
        <path d="M196 -112 Q286 -108 314 -70 L120 -64 Q150 -100 196 -112Z" fill="#23242a" />
        {[-240, -150, -60, 30].map((x, i) => <rect key={i} x={x} y={-96} width={62} height={22} rx={9} fill="#23242a" />)}
        <circle cx={306} cy={-22} r={7} fill="#f2c230" stroke="none" />
        <path d="M-330 6 H340" stroke="#8a8f99" strokeWidth={8} />
        {t && <T y={-160} t={t} fs={42} fill="#fff" />}</g>);
    case 'kofun_jp': return ( // keyhole mound drawn in plan, tilted on its green apron: the shape IS the information
      <g {...OL}><ellipse cy={-14} rx={330} ry={120} fill="#6c9a52" opacity={0.45} stroke="none" />
        <path d="M0 -268 a104 104 0 0 1 104 104 L150 -6 a150 44 0 0 1 -300 0 L-104 -164 a104 104 0 0 1 104 -104Z" fill="#5d8a44" transform="translate(0 60) scale(1 0.62)" />
        <path d="M0 -208 a64 64 0 0 1 64 64 L92 -44 a92 30 0 0 1 -184 0 L-64 -144 a64 64 0 0 1 64 -64Z" fill="#7fae5f" stroke="none" transform="translate(0 60) scale(1 0.62)" />
        {[-190, -120, 130, 200, -40, 60].map((x, i) => (<g key={i} transform={`translate(${x} ${i % 2 ? -96 : -60})`}><circle r={17} fill="#3f7a34" /><rect x={-3} y={8} width={6} height={14} fill="#5d4a33" stroke="none" /></g>))}
        {t && <T y={-196} t={t} fs={40} fill="#fff" />}</g>);
    case 'jomon_pot_jp': return (
      <g {...OL}><path d="M-92 -210 Q-118 -110 -84 -38 Q-60 0 0 0 Q60 0 84 -38 Q118 -110 92 -210Z" fill="#a8693c" />
        <path d="M-92 -210 Q0 -186 92 -210 L92 -178 Q0 -156 -92 -178Z" fill="#8a552e" />
        {/* flame rim: the wild crown of knobs and curls */}
        {[-84, -42, 0, 42, 84].map((x, i) => (<g key={i}>
          <path d={`M${x - 15} -206 Q${x - 20} ${-252 - (i % 2) * 16} ${x} ${-262 - (i % 2) * 22} Q${x + 20} ${-252 - (i % 2) * 16} ${x + 15} -206Z`} fill="#a8693c" />
          <circle cx={x} cy={-236 - (i % 2) * 20} r={7} fill="#7a4520" stroke="none" /></g>))}
        {[0, 1, 2].map((r) => <path key={r} d={`M${-88 + r * 8} ${-150 + r * 36} Q0 ${-132 + r * 36} ${88 - r * 8} ${-150 + r * 36}`} fill="none" stroke="#7a4520" strokeWidth={6} />)}
        {[-52, 0, 52].map((x, i) => <path key={i} d={`M${x} -196 q10 22 0 44`} fill="none" stroke="#7a4520" strokeWidth={5} />)}
        {t && <T y={-316} t={t} fs={40} fill="#fff" />}</g>);
  }
};

// ================= BACKGROUNDS =================
export type JapanBgKind = 'ricefield_jp' | 'edo_jp' | 'castle_jp' | 'shrine_jp' | 'tokyo_ruin' | 'tokyo_jp';
const BGSET = new Set<string>(['ricefield_jp', 'edo_jp', 'castle_jp', 'shrine_jp', 'tokyo_ruin', 'tokyo_jp']);
export const isJapanBg = (k: string) => BGSET.has(k);
export const JAPAN_GROUND: Record<JapanBgKind, string> = {ricefield_jp: '#7fae5f', edo_jp: '#a3865e', castle_jp: '#9aa583', shrine_jp: '#5f7a4a', tokyo_ruin: '#6d6a63', tokyo_jp: '#5a6068'};

export const JapanBg: React.FC<{bg: JapanBgKind; f: number; cx: number; seed: string}> = ({bg, f, cx, seed}) => {
  const S = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  if (bg === 'ricefield_jp') return (
    <g {...S}><defs><linearGradient id={`rf${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#eef7e2" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#rf${seed})`} stroke="none" />
      <circle cx={260} cy={120} r={52} fill="#f7dd8e" stroke="none" />
      <path d="M0 470 L380 300 L700 440 L1080 270 L1440 420 L1920 320 V730 H0Z" fill="#6c8a5f" />
      <path d="M1080 270 L1150 342 L1082 366 L1014 340Z" fill="#eef3f8" stroke="none" opacity={0.9} />
      {/* terraces stepping down to the ground line */}
      {[0, 1, 2, 3].map((i) => { const y = 520 + i * 54, inset = i * 130; return (<g key={i}>
        <path d={`M${inset} 730 V${y} H${1920 - inset * 0.6} V730Z`} fill={i % 2 ? '#86bb5f' : '#93c46e'} />
        <path d={`M${inset} ${y} H${1920 - inset * 0.6}`} stroke="#4f7a38" strokeWidth={6} />
        <path d={`M${inset + 60} ${y + 16} H${900 - i * 60}`} stroke="#bfe0f2" strokeWidth={7} opacity={0.75} /></g>); })}
      <rect y={730} width={1920} height={360} fill="#7fae5f" />{Array.from({length: 18}, (_, i) => <path key={i} d={`M${i * 112 - 20} ${806 + (i % 4) * 62} q6 -22 12 0 M${i * 112 + 16} ${806 + (i % 4) * 62} q6 -18 12 0`} stroke="#4f7a38" fill="none" />)}</g>);
  if (bg === 'edo_jp') return (
    <g {...S}><defs><linearGradient id={`ed${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a8c8e8" /><stop offset="1" stopColor="#f2e3bb" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#ed${seed})`} stroke="none" />
      <path d="M0 500 L420 380 L860 490 L1300 360 L1920 480 V730 H0Z" fill="#8a9678" opacity={0.8} stroke="none" />
      {/* the castle on its hill, far off */}
      <g transform={`translate(${1330 - cx * 0.06} 168) scale(0.55)`}>
        <path d="M-190 362 L-150 200 H150 L190 362Z" fill="#8a8578" />
        {[0, 1, 2].map((i) => { const w = 250 - i * 56, y = 196 - i * 88; return (<g key={i}><rect x={-w / 2} y={y - 64} width={w} height={64} fill="#f4f1e6" /><path d={`M${-w / 2 - 26} ${y - 64} Q0 ${y - 116} ${w / 2 + 26} ${y - 64} L${w / 2 + 8} ${y - 44} Q0 ${y - 82} ${-w / 2 - 8} ${y - 44}Z`} fill="#3d4a5a" /></g>); })}
      </g>
      {/* machiya rows either side of the street */}
      {[70, 480, 1180, 1560].map((x, i) => (<g key={i} transform={`translate(${x - cx * 0.12} 0)`}>
        <rect x={0} y={520} width={330} height={210} fill={i % 2 ? '#8a6a48' : '#9a7852'} />
        <path d="M-18 520 L165 462 L348 520 L322 548 L8 548Z" fill="#4a4238" />
        {[0, 1, 2].map((w) => <rect key={w} x={30 + w * 102} y={580} width={66} height={84} fill="#5d4630" />)}
        <path d="M0 560 H330" stroke="#5d4630" strokeWidth={7} />
        <rect x={120} y={664} width={90} height={66} fill="#3a2d1e" /></g>))}
      <rect y={730} width={1920} height={360} fill="#a3865e" />
      <path d="M760 1080 L900 730 H1020 L1160 1080Z" fill="#8f7350" stroke="none" opacity={0.8} /></g>);
  if (bg === 'castle_jp') return (
    <g {...S}><defs><linearGradient id={`cj${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#e9f5ff" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#cj${seed})`} stroke="none" />
      <path d="M0 560 L400 430 L820 550 L1240 420 L1920 540 V730 H0Z" fill="#7fa56a" opacity={0.7} stroke="none" />
      <g transform={`translate(${-cx * 0.08} 0)`}>
        {/* ishigaki stone base, battered slope */}
        <path d="M560 730 L640 470 H1280 L1360 730Z" fill="#8a8578" />
        {[0, 1, 2, 3].map((r) => <path key={r} d={`M${592 - r * 8} ${660 - r * 62} H${1328 + r * 8}`} stroke="#6d6a60" strokeWidth={4} opacity={0.7} />)}
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${660 + i * 104} 470 L${640 + i * 108} 730`} stroke="#6d6a60" strokeWidth={4} opacity={0.5} />)}
        {/* white tenshu, three shrinking roofs */}
        {[0, 1, 2].map((i) => { const w = 400 - i * 108, y = 470 - i * 118; return (<g key={i}>
          <rect x={960 - w / 2} y={y - 92} width={w} height={92} fill="#f7f4ec" />
          {[0, 1].map((w2) => <rect key={w2} x={960 - w / 4 + w2 * (w / 4)} y={y - 66} width={30} height={36} fill="#3d4a5a" stroke="none" />)}
          <path d={`M${960 - w / 2 - 34} ${y - 92} Q960 ${y - 158} ${960 + w / 2 + 34} ${y - 92} L${960 + w / 2 + 12} ${y - 66} Q960 ${y - 118} ${960 - w / 2 - 12} ${y - 66}Z`} fill="#3d4a5a" /></g>); })}
        <path d="M960 116 v-30" stroke="#c9a24a" strokeWidth={7} /><circle cx={960} cy={80} r={9} fill="#c9a24a" stroke="none" />
        {/* moat */}
        <path d="M420 700 Q960 660 1500 700 L1500 742 Q960 706 420 742Z" fill="#4f8fc9" stroke="none" opacity={0.9} />
      </g>
      <rect y={730} width={1920} height={360} fill="#9aa583" />{Array.from({length: 12}, (_, i) => <path key={i} d={`M${i * 168 - 30} ${800 + (i % 4) * 66} l12 -20 l12 20`} stroke="#77875f" fill="none" />)}</g>);
  if (bg === 'shrine_jp') return (
    <g {...S}><defs><linearGradient id={`sj${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fb0d9" /><stop offset="1" stopColor="#dcead2" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#sj${seed})`} stroke="none" />
      {/* forest wall */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => { const x = i * 240 - 60 - cx * 0.1, h = 300 + (i % 3) * 60; return (<g key={i}><rect x={x - 9} y={730 - h + 130} width={18} height={160} fill="#4a3a28" /><path d={`M${x - 96} 730 L${x} ${730 - h} L${x + 96} 730Z`} fill={i % 2 ? '#2f5d33' : '#38693c'} /></g>); })}
      {/* shrine building, centre-back */}
      <g transform="translate(960 0)"><rect x={-260} y={520} width={520} height={210} fill="#7a4a2a" />
        <path d="M-310 520 Q0 428 310 520 L272 556 Q0 478 -272 556Z" fill="#2e3d33" />
        <rect x={-190} y={586} width={380} height={144} fill="#5d3a20" />
        {[-120, 0, 120].map((x, i) => <rect key={i} x={x - 26} y={600} width={52} height={130} fill="#e8dfc8" stroke="none" opacity={0.9} />)}
        <path d="M0 470 v52 M-22 492 h44" stroke="#c9a24a" strokeWidth={7} /></g>
      {/* the great torii in front */}
      <g transform="translate(300 730) scale(0.62)"><path d="M-252 -428 Q0 -452 252 -428 L236 -392 Q0 -414 -236 -392Z" fill="#c23b2a" />
        {[-1, 1].map((sg) => <path key={sg} d={`M${sg * 168} 0 L${sg * 156} -368 h30 L${sg * 186} 0Z`} fill="#c23b2a" />)}
        <rect x={-196} y={-300} width={392} height={22} fill="#c23b2a" /></g>
      <rect y={730} width={1920} height={360} fill="#5f7a4a" />
      <path d="M700 1080 L880 730 H1040 L1220 1080Z" fill="#c9bfa4" stroke="none" opacity={0.85} /></g>);
  if (bg === 'tokyo_ruin') return (
    <g {...S}><defs><linearGradient id={`tr${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8d8d89" /><stop offset="1" stopColor="#c4c0b4" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#tr${seed})`} stroke="none" />
      {/* a flat grey horizon of ash, one canal line */}
      <rect y={560} width={1920} height={170} fill="#7d7a72" />
      <path d="M0 640 Q640 618 1280 640 T1920 636" fill="none" stroke="#5d5a54" strokeWidth={10} opacity={0.7} />
      {/* the few things left standing: chimneys, a gutted concrete frame, a safe */}
      {[180, 1580].map((x, i) => (<g key={i} transform={`translate(${x - cx * 0.1} 0)`}><rect x={-26} y={330} width={52} height={232} fill="#6d6a63" /><rect x={-32} y={318} width={64} height={16} fill="#5d5a54" /></g>))}
      <g transform={`translate(${860 - cx * 0.12} 0)`}><rect x={-190} y={380} width={380} height={182} fill="none" stroke="#5d5a54" strokeWidth={16} />
        <path d="M0 380 V562 M-190 470 H190" stroke="#5d5a54" strokeWidth={10} />
        {[0, 1, 2].map((w) => <rect key={w} x={-160 + w * 124} y={404} width={76} height={52} fill="#3f3d38" stroke="none" />)}</g>
      {/* rubble mounds */}
      {[0, 1, 2, 3, 4].map((i) => { const x = 120 + i * 420; return <path key={i} d={`M${x} 730 L${x + 90} ${648 + (i % 3) * 18} L${x + 190} 730Z`} fill="#6d6a63" opacity={0.85} />; })}
      <rect y={730} width={1920} height={360} fill="#6d6a63" />{Array.from({length: 26}, (_, i) => <path key={i} d={`M${i * 78 - 30} ${790 + (i % 5) * 52} l${16 + (i % 3) * 9} -12 l14 12`} stroke="#4f4d48" fill="none" />)}</g>);
  if (bg === 'tokyo_jp') return (
    <g {...S}><defs><linearGradient id={`tj${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fb6d9" /><stop offset="1" stopColor="#e6eef5" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#tj${seed})`} stroke="none" />
      <path d="M0 470 L360 350 L760 450 L1180 330 L1560 440 L1920 370 V560 H0Z" fill="#9db3c4" opacity={0.8} stroke="none" />
      {/* the tower: lattice pylon, orange-red against the sky */}
      <g transform={`translate(${1240 - cx * 0.08} 0)`}>
        <path d="M-86 730 L-14 300 M86 730 L14 300 M-86 730 H86 M-52 560 H52 M-30 428 H30" fill="none" stroke="#c9532e" strokeWidth={13} />
        <path d="M-70 640 L70 470 M70 640 L-70 470" fill="none" stroke="#c9532e" strokeWidth={7} />
        <rect x={-40} y={268} width={80} height={34} fill="#c9532e" /><path d="M0 268 V196" stroke="#c9532e" strokeWidth={8} />
        <rect x={-24} y={380} width={48} height={20} fill="#e8e4da" /></g>
      {/* skyline blocks */}
      {[90, 420, 700, 1460, 1700].map((x, i) => { const h = 190 + ((i * 97) % 170); return (<g key={i}><rect x={x} y={730 - h} width={168} height={h} fill={i % 2 ? '#6d7681' : '#7c8794'} />
        {Array.from({length: 12}, (_, w) => <rect key={w} x={x + 16 + (w % 3) * 48} y={730 - h + 20 + Math.floor(w / 3) * 44} width={28} height={30} fill={(w * 5 + i) % 4 ? '#c9d6da' : '#f4d37a'} stroke="none" />)}</g>); })}
      <rect y={730} width={1920} height={360} fill="#5a6068" />{Array.from({length: 10}, (_, i) => <path key={i} d={`M${i * 210 - 30} 810 H${i * 210 + 90}`} stroke="#e8e4da" strokeWidth={5} opacity={0.35} />)}</g>);
  return <rect width={1920} height={1080} fill="#c3c3c3" />;
};
