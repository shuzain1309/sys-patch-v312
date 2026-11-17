// Civil War pack — built for "How the American Civil War Actually Happened — In One Video" (2026-11-17).
// Pure SVG, deterministic (no Math.random / Date / index keys). Imported by world.tsx exactly like
// germany/korea/iran/japan/afghanistan packs. Do not edit per video.
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {HAND, INK} from './world';
import type {PropT} from './world';

const OL = {stroke: '#241c17', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * f)));
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * f)));
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * f)));
  return `rgb(${r},${g},${b})`;
};
const T: React.FC<{x: number; y: number; s?: number; c?: string; w?: number; children: React.ReactNode}> = ({x, y, s = 40, c = INK, w, children}) => {
  const str = String(children ?? '');
  const size = w ? Math.min(s, w / Math.max(1, str.length * 0.58)) : s;
  return <text x={x} y={y} fontFamily={HAND} fontSize={size} fill={c} textAnchor="middle" stroke="none">{str}</text>;
};
const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop01 = (at: number | undefined, f: number) => at == null ? 1 : interpolate(f, [at * 90, at * 90 + 15], [0, 1], {...C, easing: Easing.out(Easing.cubic)});

export type CivilwarKind = 'flag_us' | 'flag_cs' | 'balance_board' | 'telegraph_key' | 'ironclad' | 'cotton_bale' | 'runner_ship' | 'draft_board' | 'headstones';
const SET = new Set<string>(['flag_us', 'flag_cs', 'balance_board', 'telegraph_key', 'ironclad', 'cotton_bale', 'runner_ship', 'draft_board', 'headstones']);
export const isCivilwarProp = (k: string) => SET.has(k);

// The United States flag with a true star count per era. t = '24' | '33' | '34' | '35' | '36' | 'finale'.
const UsCloth: React.FC<{st: string; top: number; w: number; h: number; f: number}> = ({st, top, w, h, f}) => {
  const wave = Math.sin(f / 9) * 5;
  const counts: Record<string, number> = {'24': 24, '33': 33, '34': 34, '35': 35, '36': 36, finale: 36};
  const n = counts[st] ?? 34;
  const stripeH = h / 13;
  const cw = w * 0.44, ch = stripeH * 7;
  const stars: {x: number; y: number}[] = [];
  const rows = st === '24' ? 4 : 6;
  for (let r = 0; r < rows; r++) {
    const per = Math.ceil((n - stars.length) / (rows - r));
    for (let i = 0; i < per && stars.length < n; i++) stars.push({x: (i + 0.5) * (cw / 6) + (r % 2) * 6, y: (r + 0.5) * (ch / rows)});
  }
  return (
    <g>
      <path d={`M0 ${top} Q${w * 0.5} ${top - 9 + wave} ${w} ${top + 5} V${top + h} Q${w * 0.5} ${top + h + 11 + wave} 0 ${top + h}Z`} fill="#f6f4ec" />
      {Array.from({length: 7}, (_, i) => <path key={i} d={`M0 ${top + i * 2 * stripeH + (i ? wave * (i / 6) : 0)} H${w} V${top + (i * 2 + 1) * stripeH + wave * (i / 6)} H0Z`} fill="#b03a2e" stroke="none" />)}
      <rect x={0} y={top} width={cw} height={ch} fill="#2e3a6e" stroke="none" />
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={top + s.y} r={6.4} fill="#f6f4ec" stroke="none" />)}
      {st === 'finale' && <path d={`M0 ${top + h} H${w}`} stroke="#d9a441" strokeWidth={10} strokeDasharray="14 8" />}
      <path d={`M0 ${top} Q${w * 0.5} ${top - 9 + wave} ${w} ${top + 5} V${top + h} Q${w * 0.5} ${top + h + 11 + wave} 0 ${top + h}Z`} fill="none" />
    </g>
  );
};

export const CivilwarProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p, f}) => {
  const c = p.c ?? '#2e4a7a', t = p.t ?? '';
  const pop = pop01(p.at, f);
  if (pop <= 0) return null;
  switch (p.k as CivilwarKind) {
    case 'flag_us': { // THE FLAG THAT KEPT ITS STARS. t = star state: 24|33|34|35|36|finale.
      const st = t || '34';
      const pole = '#4a3826', W = st === 'finale' ? 372 : 330, H = st === 'finale' ? 224 : 200, TOP = -560;
      return (
        <g {...OL} transform={`scale(${pop})`}>
          <ellipse cx={26} cy={6} rx={118} ry={13} fill="#000" opacity={0.16} stroke="none" />
          <path d="M-50 0 L-12 -24 H70 L108 0Z" fill="#7a6a52" />
          <rect x={-9} y={TOP} width={18} height={-TOP} fill={pole} />
          <circle cx={0} cy={TOP - 15} r={13} fill="#d9a441" />
          {st === 'finale' && [0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-120 + i * 62} ${TOP - 66} l10 -30 l10 30 l-20 0Z`} fill="#f2c230" stroke="none" opacity={0.75} />)}
          <g transform="translate(9 0)"><UsCloth st={st} top={TOP + 8} w={W} h={H} f={f} /></g>
        </g>
      );
    }
    case 'flag_cs': { // Confederate battle flag — maps and markers only, never decoration.
      const pole = '#4a3826', W = 268, TOP = -470;
      const dots: {x: number; y: number}[] = [];
      for (let i = 0; i < 13; i++) { const u = (i + 0.5) / 13; dots.push({x: 20 + u * (W - 40) * (i % 2 ? 0.92 : 1), y: TOP + 26 + (i % 2 ? (W - 52) * 0.82 : (W - 52) * 0.12)}); }
      return (
        <g {...OL} transform={`scale(${pop})`}>
          <ellipse cx={20} cy={6} rx={100} ry={12} fill="#000" opacity={0.16} stroke="none" />
          <rect x={-8} y={TOP} width={16} height={-TOP} fill={pole} />
          <circle cx={0} cy={TOP - 13} r={11} fill="#8a8578" />
          <g transform="translate(8 0)">
            <rect x={0} y={TOP + 6} width={W} height={W - 12} fill="#a8242c" />
            <rect x={0} y={TOP + 6} width={W} height={W - 12} fill="none" stroke="#f6f4ec" strokeWidth={16} />
            <path d={`M6 ${TOP + 12} L${W - 6} ${TOP + W - 18} M${W - 6} ${TOP + 12} L6 ${TOP + W - 18}`} stroke="#2e3a6e" strokeWidth={44} fill="none" />
            <path d={`M6 ${TOP + 12} L${W - 6} ${TOP + W - 18} M${W - 6} ${TOP + 12} L6 ${TOP + W - 18}`} stroke="#f6f4ec" strokeWidth={3} fill="none" />
            {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={7} fill="#f6f4ec" stroke="none" />)}
          </g>
        </g>
      );
    }
    case 'balance_board': { // THE BALANCE — Senate scales. t = level | tip | broken.
      const st = t || 'level';
      const tilt = st === 'tip' ? 9 : 0;
      const tiles = (side: number, n: number, px: number, py: number) => (
        <g>{Array.from({length: n}, (_, i) => <rect key={i} x={px - 44 + (i % 3) * 30} y={py - 16 - Math.floor(i / 3) * 26} width={26} height={22} rx={3} fill={side < 0 ? '#2e4a7a' : '#9a8a68'} />)}</g>
      );
      if (st === 'broken') return (
        <g {...OL} transform={`scale(${pop})`}>
          <ellipse cx={0} cy={8} rx={240} ry={15} fill="#000" opacity={0.15} stroke="none" />
          <path d="M-40 0 L-26 -190 L-6 -196 L-14 0Z" fill="#6b5138" />
          <path d="M-190 -120 L-30 -176 L-22 -158 L-176 -104Z" fill="#7a5f40" />
          <path d="M170 -96 L36 -150 L30 -132 L158 -84Z" fill="#7a5f40" />
          <path d="M-330 -30 a120 26 0 0 0 240 0Z" fill="#8a6f4d" />
          <path d="M110 -14 a120 26 0 0 0 240 0Z" fill="#8a6f4d" />
          {tiles(-1, 9, -210, -34)}{tiles(1, 8, 230, -18)}
        </g>
      );
      const dy = st === 'tip' ? 44 : 0;
      return (
        <g {...OL} transform={`scale(${pop})`}>
          <ellipse cx={0} cy={8} rx={250} ry={15} fill="#000" opacity={0.15} stroke="none" />
          <path d="M-90 0 H90 L58 -34 H-58Z" fill="#5d4630" />
          <rect x={-17} y={-330} width={34} height={300} fill="#6b5138" />
          <circle cx={0} cy={-344} r={17} fill="#d9a441" />
          <g transform={`rotate(${tilt} 0 -330)`}>
            <rect x={-330} y={-342} width={660} height={17} rx={8} fill="#7a5f40" />
            <path d="M-300 -326 L-372 -196 M-300 -326 L-228 -196 M-300 -326 V-196" stroke="#3a2f24" strokeWidth={5} fill="none" />
            <path d="M300 -326 L228 -196 M300 -326 L372 -196 M300 -326 V-196" stroke="#3a2f24" strokeWidth={5} fill="none" />
            <path d={`M-392 ${-196 + dy} a92 22 0 0 0 184 0Z`} fill="#8a6f4d" transform={`translate(0 ${st === 'tip' ? 26 : 0})`} />
            <path d={`M208 ${-196 - dy} a92 22 0 0 0 184 0Z`} fill="#8a6f4d" transform={`translate(0 ${st === 'tip' ? -26 : 0})`} />
            <g transform={`translate(0 ${st === 'tip' ? 26 : 0})`}>{tiles(-1, st === 'tip' ? 16 : 11, -300, -200)}</g>
            <g transform={`translate(0 ${st === 'tip' ? -26 : 0})`}>{tiles(1, st === 'tip' ? 15 : 11, 300, -200)}</g>
          </g>
        </g>
      );
    }
    case 'telegraph_key': {
      return (
        <g {...OL} transform={`scale(${pop})`}>
          <ellipse cx={0} cy={6} rx={170} ry={12} fill="#000" opacity={0.15} stroke="none" />
          <path d="M-160 0 V-108 H160 V0 M-160 -108 L-196 0 M160 -108 L196 0" fill="#6b4a30" />
          <rect x={-176} y={-126} width={352} height={20} rx={6} fill="#7d5a38" />
          <rect x={-58} y={-152} width={116} height={28} rx={8} fill="#3a3a42" />
          <path d="M-58 -138 L-118 -158" stroke="#c9a227" strokeWidth={9} />
          <circle cx={-126} cy={-162} r={13} fill="#2a2a30" />
          <circle cx={34} cy={-146} r={10} fill="#c9a227" stroke="none" />
          <path d="M96 -126 q10 -54 44 -58 q30 -3 26 30 q-3 26 -34 22" fill="none" stroke="#e8e2d2" strokeWidth={15} />
          <path d="M140 -184 q60 -90 150 -120" fill="none" stroke="#2a2a30" strokeWidth={4} />
          <rect x={-150} y={-100} width={86} height={58} fill="#e8e2d2" transform="rotate(-4 -107 -71)" />
          <path d="M-138 -84 h58 M-136 -66 h52" stroke="#8a8578" strokeWidth={4} />
        </g>
      );
    }
    case 'ironclad': { // t = monitor | virginia. Waterline at y=0 — water backgrounds only.
      if (t === 'virginia') return (
        <g {...OL} transform={`scale(${pop})`}>
          <path d="M-330 6 H330 L282 58 H-282Z" fill="#3c3f45" />
          <path d="M-218 -6 L-168 -128 H168 L218 -6Z" fill="#4a4d52" />
          <path d="M-218 -6 L-168 -128 H168 L218 -6" fill="none" stroke="#2c2e33" strokeWidth={5} />
          {[-120, 0, 120].map((x, i) => <rect key={i} x={x - 17} y={-66} width={34} height={24} fill="#1e2023" />)}
          <rect x={196} y={-168} width={30} height={52} fill="#33363b" />
          <path d="M-330 6 q40 -12 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" fill="none" stroke="#dcebf5" strokeWidth={5} opacity={0.7} />
        </g>
      );
      return (
        <g {...OL} transform={`scale(${pop})`}>
          <path d="M-290 4 H290 L246 50 H-246Z" fill="#33363b" />
          <rect x={-292} y={-16} width={584} height={22} rx={9} fill="#3f4247" />
          <circle cx={0} cy={-58} r={56} fill="#45484e" />
          <circle cx={0} cy={-58} r={56} fill="none" stroke="#26282c" strokeWidth={5} />
          <path d="M-14 -66 L-118 -78 M14 -66 L118 -78" stroke="#1e2023" strokeWidth={15} strokeLinecap="round" />
          <rect x={118} y={-52} width={44} height={30} fill="#3a3d42" />
          <path d="M-290 6 q36 -11 72 0 t72 0 t72 0 t72 0 t72 0 t72 0 t72 0 t72 0" fill="none" stroke="#dcebf5" strokeWidth={5} opacity={0.7} />
        </g>
      );
    }
    case 'cotton_bale': {
      return (
        <g {...OL} transform={`scale(${pop})`}>
          <ellipse cx={0} cy={6} rx={200} ry={13} fill="#000" opacity={0.15} stroke="none" />
          <rect x={-30} y={-252} width={290} height={168} rx={15} fill="#bfab84" transform="rotate(2 -30 -252)" />
          <rect x={-168} y={-196} width={330} height={196} rx={16} fill="#d3bf96" />
          {[-110, -38, 34, 106].map((x, i) => <path key={i} d={`M${x} -196 V0`} stroke="#7a6248" strokeWidth={9} />)}
          <path d="M-168 -150 H162 M-168 -62 H162" stroke="#7a6248" strokeWidth={7} fill="none" />
          {[[-140, -176], [130, -160], [-96, -30], [96, -44]].map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={13} fill="#f2ead8" stroke="none" opacity={0.9} />)}
        </g>
      );
    }
    case 'runner_ship': { // blockade-runner silhouette — water backgrounds only.
      return (
        <g {...OL} transform={`scale(${pop})`}>
          <path d="M-330 0 H330 L272 52 H-262Z" fill="#39424e" />
          <rect x={-330} y={-20} width={660} height={22} fill="#454f5a" />
          {[-96, 84].map((x, i) => <g key={i}><path d={`M${x - 17} -20 L${x - 9} -128 H${x + 15} L${x + 19} -20Z`} fill="#2f3740" /><path d={`M${x + 2} -128 q26 -26 8 -44 q-14 -13 -26 2 q-9 12 2 22`} fill="#aebac4" stroke="none" opacity={0.55} /></g>)}
          {[-218, 218].map((x, i) => <rect key={i} x={x - 34} y={-56} width={68} height={38} rx={8} fill="#333c46" />)}
          <path d="M-330 2 q42 -12 84 0 t84 0 t84 0 t84 0 t84 0 t84 0 t84 0" fill="none" stroke="#dcebf5" strokeWidth={5} opacity={0.7} />
        </g>
      );
    }
    case 'draft_board': { // enrolment / notice board. p.t = headline sheet text (fitted).
      return (
        <g {...OL} transform={`scale(${pop})`}>
          <ellipse cx={0} cy={6} rx={230} ry={13} fill="#000" opacity={0.15} stroke="none" />
          {[-190, 190].map((x, i) => <rect key={i} x={x - 13} y={-430} width={26} height={430} fill="#5d4630" />)}
          <rect x={-238} y={-452} width={476} height={330} rx={8} fill="#7a5f40" />
          <rect x={-238} y={-452} width={476} height={330} rx={8} fill="none" stroke="#4a3826" strokeWidth={10} />
          <rect x={-206} y={-420} width={180} height={240} fill="#efe8d8" transform="rotate(-2 -116 -300)" />
          <rect x={16} y={-424} width={180} height={240} fill="#e8e2d2" transform="rotate(1.6 106 -304)" />
          <rect x={-96} y={-408} width={190} height={150} fill="#f2ecde" transform="rotate(-0.6 -1 -333)" />
          <T x={-1} y={-352} s={44} c="#33302a" w={172}>{t || 'ENLIST'}</T>
          {[-116, 106].map((x, i) => <g key={i} stroke="#8a8578" strokeWidth={4}><path d={`M${x - 58} -368 h116 M${x - 58} -336 h116 M${x - 58} -304 h96 M${x - 58} -272 h104`} /></g>)}
        </g>
      );
    }
    case 'headstones': { // drawn field of headstones for the toll beats — never paired with graphic photos.
      const rows = [0, 1, 2];
      return (
        <g {...OL} transform={`scale(${pop})`}>
          <ellipse cx={0} cy={8} rx={330} ry={16} fill="#000" opacity={0.13} stroke="none" />
          {rows.map((r) => (
            <g key={r} opacity={1 - r * 0.16}>
              {Array.from({length: 7 - r}, (_, i) => {
                const x = (i - (6 - r) / 2) * (118 - r * 14) + (r % 2) * 26;
                const y = -r * 52, s = 1 - r * 0.18, h = 96 * s, w = 56 * s;
                return <path key={i} d={`M${x - w / 2} ${y} V${y - h + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V${y}Z`} fill={shade('#cfd4d9', 1 - r * 0.1)} />;
              })}
            </g>
          ))}
        </g>
      );
    }
    default: return null;
  }
};

// ---------------- backgrounds ----------------
export type CivilwarBgKind = 'field_dawn' | 'river_reach' | 'cotton_port' | 'senate' | 'telegraph_office' | 'hospital' | 'ruined_city' | 'courthouse' | 'theatre_night';
const BGSET = new Set<string>(['field_dawn', 'river_reach', 'cotton_port', 'senate', 'telegraph_office', 'hospital', 'ruined_city', 'courthouse', 'theatre_night']);
export const isCivilwarBg = (k: string) => BGSET.has(k);
export const CIVILWAR_GROUND: Record<CivilwarBgKind, string> = {field_dawn: '#7a6a4a', river_reach: '#4a6b8a', cotton_port: '#8a7350', senate: '#7a5a3a', telegraph_office: '#6b4a30', hospital: '#77875a', ruined_city: '#6e6258', courthouse: '#7f9a58', theatre_night: '#4a4a58'};

const TreeLine: React.FC<{y: number; col: string; n?: number; h?: number}> = ({y, col, n = 14, h = 90}) => (
  <g stroke="none">{Array.from({length: n}, (_, i) => { const x = (i + 0.5) * (1920 / n); const hh = h * (0.75 + ((i * 53) % 40) / 80); return <path key={i} d={`M${x - hh * 0.52} ${y} a${hh * 0.52} ${hh * 0.62} 0 0 1 ${hh * 1.04} 0Z`} fill={col} />; })}</g>
);

export const CivilwarBg: React.FC<{bg: CivilwarBgKind; f: number; cx: number; seed: string}> = ({bg, f, cx, seed}) => {
  const S = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  if (bg === 'field_dawn') return (
    <g {...S}><defs><linearGradient id={`fd${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c3550" /><stop offset="0.62" stopColor="#8a5a52" /><stop offset="1" stopColor="#e8a56c" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#fd${seed})`} stroke="none" />
      <circle cx={960} cy={668} r={64} fill="#f7c873" stroke="none" opacity={0.95} />
      <g transform={`translate(${-cx * 0.05} 0)`}><TreeLine y={716} col="#3d4038" n={16} h={104} /></g>
      <rect y={712} width={1920} height={26} fill="#e8d9b0" stroke="none" opacity={0.22} />
      <rect y={730} width={1920} height={350} fill="#7a6a4a" />
      <g transform={`translate(${-cx * 0.12} 0)`}>{Array.from({length: 9}, (_, i) => <g key={i}><rect x={90 + i * 210} y={806} width={13} height={54} fill="#5d4a33" /><path d={`M${76 + i * 210} 824 L${290 + i * 210} 806 M${76 + i * 210} 846 L${290 + i * 210} 830`} stroke="#5d4a33" strokeWidth={8} /></g>)}</g>
      {Array.from({length: 11}, (_, i) => <path key={i} d={`M${i * 185 - 24} ${902 + (i % 3) * 56} q9 -26 15 0 M${i * 185 + 20} ${902 + (i % 3) * 56} q7 -19 13 0`} stroke="#5f7a38" fill="none" />)}</g>);
  if (bg === 'river_reach') return (
    <g {...S}><defs><linearGradient id={`rr${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#79b4dd" /><stop offset="1" stopColor="#e6efdb" /></linearGradient></defs>
      <rect width={1920} height={560} fill={`url(#rr${seed})`} stroke="none" />
      <g transform={`translate(${-cx * 0.04} 0)`}><path d="M0 560 L0 420 Q420 356 900 408 Q1420 462 1920 396 V560Z" fill="#5f7a4a" /><TreeLine y={446} col="#4c6b3c" n={18} h={84} /></g>
      <rect y={548} width={1920} height={532} fill="#4a6b8a" stroke="none" />
      {Array.from({length: 8}, (_, i) => <path key={i} d={`M${(i * 271 + 60) % 1800} ${640 + (i % 4) * 108} h${120 + (i % 3) * 70}`} stroke="#7fa3c4" strokeWidth={7} fill="none" opacity={0.65} />)}
      <g transform={`translate(${-cx * 0.1} 0)`}><path d="M0 1080 L0 946 Q360 902 700 946 L760 1080Z" fill="#6a7a4a" /><TreeLine y={952} col="#55703f" n={6} h={70} /></g></g>);
  if (bg === 'cotton_port') return (
    <g {...S}><defs><linearGradient id={`cp${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f2e3bb" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#cp${seed})`} stroke="none" />
      <g transform={`translate(${-cx * 0.06} 0)`}>
        {[120, 560, 1020, 1460].map((x, i) => <g key={i}><rect x={x} y={470} width={380} height={260} fill={i % 2 ? '#a3804f' : '#96754a'} /><path d={`M${x - 18} 470 L${x + 190} 396 L${x + 398} 470Z`} fill="#6d5136" /><rect x={x + 150} y={580} width={80} height={150} fill="#4a3826" />{[36, 118, 268].map((wx, w) => <rect key={w} x={x + wx} y={520} width={52} height={64} fill="#5d4a33" />)}</g>)}
        {[300, 1240].map((x, i) => <g key={i}><path d={`M${x} 730 V300`} stroke="#4a3826" strokeWidth={9} /><path d={`M${x} 320 L${x + 130} 470 M${x} 380 L${x - 110} 500`} stroke="#4a3826" strokeWidth={6} /></g>)}
      </g>
      <rect y={730} width={1920} height={220} fill="#8a7350" />
      {Array.from({length: 7}, (_, i) => <g key={i} transform={`translate(${140 + i * 258} 884)`}><rect x={-72} y={-64} width={144} height={70} rx={9} fill="#d3bf96" /><path d="M-72 -30 H72 M-30 -64 V6 M30 -64 V6" stroke="#7a6248" strokeWidth={5} /></g>)}
      <rect y={950} width={1920} height={130} fill="#4a6b8a" stroke="none" />
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M${i * 340 + 40} ${1004 + (i % 2) * 34} h150`} stroke="#7fa3c4" strokeWidth={6} fill="none" opacity={0.7} />)}</g>);
  if (bg === 'senate') return (
    <g {...S}>
      <rect width={1920} height={1080} fill="#4a3826" stroke="none" />
      <rect width={1920} height={730} fill="#5d4630" stroke="none" />
      {[240, 660, 1260, 1680].map((x, i) => <g key={i}><rect x={x - 34} y={90} width={68} height={560} fill="#c9b184" /><path d={`M${x - 48} 90 h96 l-14 44 h-68Z M${x - 48} 650 h96 l-14 -44 h-68Z`} fill="#a98f62" /><rect x={x - 20} y={170} width={40} height={400} fill="#bfa878" stroke="none" opacity={0.6} /></g>)}
      {[440, 960, 1480].map((x, i) => <g key={i}><path d={`M${x - 90} 620 V240 a90 90 0 0 1 180 0 V620Z`} fill="#f2d492" opacity={0.85} /><path d={`M${x - 90} 620 V240 a90 90 0 0 1 180 0 V620`} fill="none" stroke="#3a2c1e" strokeWidth={7} /></g>)}
      <rect y={636} width={1920} height={50} fill="#3a2c1e" stroke="none" />
      {[0, 1, 2].map((r) => <path key={r} d={`M${300 - r * 60} ${800 + r * 84} Q960 ${716 + r * 84} ${1620 + r * 60} ${800 + r * 84} L${1620 + r * 60} ${846 + r * 84} Q960 ${762 + r * 84} ${300 - r * 60} ${846 + r * 84}Z`} fill={r % 2 ? '#7d5f3a' : '#8a6a44'} />)}
      <rect y={730} width={1920} height={350} fill="#7a5a3a" opacity={0.35} stroke="none" />
      {[700, 960, 1220].map((x, i) => <g key={i}><circle cx={x} cy={120} r={13} fill="#f7dd8e" stroke="none" /><path d={`M${x} 0 v104`} stroke="#2c2115" strokeWidth={4} /></g>)}</g>);
  if (bg === 'telegraph_office') return (
    <g {...S}>
      <rect width={1920} height={1080} fill="#6b4a30" stroke="none" />
      <rect width={1920} height={520} fill="#8a6a48" stroke="none" />
      <rect y={520} width={1920} height={26} fill="#5d4030" stroke="none" />
      <g transform={`translate(${-cx * 0.03} 0)`}><rect x={1300} y={120} width={380} height={400} fill="#cfe3ee" /><path d="M1300 220 H1680 M1300 320 H1680 M1300 420 H1680 M1490 120 V520" stroke="#5d4030" strokeWidth={8} /><rect x={1300} y={120} width={380} height={400} fill="none" stroke="#4a3423" strokeWidth={12} /></g>
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-40 + i * 30} ${60 + i * 8} Q960 ${210 + i * 26} ${1960 - i * 30} ${50 + i * 10}`} stroke="#2c2115" strokeWidth={4} fill="none" />)}
      {[240, 560, 880].map((x, i) => <g key={i} transform={`translate(${x - cx * 0.08} 0)`}><rect x={-150} y={700} width={300} height={26} fill="#54381f" /><path d="M-150 726 L-176 900 M150 726 L176 900" stroke="#54381f" strokeWidth={13} /><rect x={-60} y={664} width={120} height={38} rx={7} fill="#3a3a42" /><path d="M-120 690 h52 M84 684 h44" stroke="#c9a227" strokeWidth={6} /></g>)}
      <rect y={900} width={1920} height={180} fill="#54381f" stroke="none" opacity={0.55} /></g>);
  if (bg === 'hospital') return (
    <g {...S}><defs><linearGradient id={`ho${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#eef3d8" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#ho${seed})`} stroke="none" />
      <g transform={`translate(${-cx * 0.05} 0)`}><TreeLine y={724} col="#5f7a4a" n={15} h={96} /></g>
      <rect y={730} width={1920} height={350} fill="#77875a" />
      <g transform={`translate(${-cx * 0.11} 0)`}>
        {[200, 560, 920, 1280].map((x, i) => <g key={i}><path d={`M${x} 760 L${x + 120} 624 L${x + 240} 760Z`} fill="#efe9dc" /><path d={`M${x} 760 L${x + 120} 624 L${x + 240} 760`} fill="none" stroke="#b9b0a0" strokeWidth={4} /><path d={`M${x + 96} 760 v-64 a24 24 0 0 1 48 0 v64Z`} fill="#6d5b43" /></g>)}
        <rect x={1560} y={470} width={11} height={290} fill="#5d4a33" />
        <rect x={1571} y={470} width={150} height={92} fill="#f6f4ec" />
        <path d="M1631 488 v56 M1603 516 h56" stroke="#b03a2e" strokeWidth={13} />
        <g transform="translate(1660 800)"><rect x={-130} y={-96} width={260} height={86} fill="#8a6f4d" /><path d="M-130 -96 a130 44 0 0 1 260 0Z" fill="#d9d2c1" />{[-84, 84].map((wx, i) => <g key={i}><circle cx={wx} cy={6} r={34} fill="none" stroke="#4a3826" strokeWidth={9} />{[0, 60, 120].map((a, j) => <path key={j} d={`M${wx} 6 L${wx + 30 * Math.cos(a * Math.PI / 180)} ${6 + 30 * Math.sin(a * Math.PI / 180)}`} stroke="#4a3826" strokeWidth={5} />)}</g>)}</g>
      </g></g>);
  if (bg === 'ruined_city') return (
    <g {...S}><defs><linearGradient id={`rc${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#565a63" /><stop offset="1" stopColor="#9a8f80" /></linearGradient></defs>
      <rect width={1920} height={760} fill={`url(#rc${seed})`} stroke="none" />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        <path d="M0 760 V240 H300 V420 H380 V180 H560 V760Z" fill="#4c463f" />
        <path d="M1920 760 V200 H1640 V400 H1560 V150 H1380 V760Z" fill="#453f39" />
        {[70, 420].map((x, i) => <rect key={i} x={x} y={60} width={52} height={190} fill="#3c372f" />)}
        {[120, 200].map((x, i) => <rect key={i} x={x} y={290} width={56} height={76} fill="#241f1a" />)}
        {[1700, 1470].map((x, i) => <rect key={i} x={x} y={250} width={56} height={76} fill="#241f1a" />)}
        {[180, 1620].map((x, i) => <path key={i} d={`M${x} 120 q26 -52 -6 -84 q-26 -26 -6 -58`} stroke="#8f8a80" strokeWidth={13} fill="none" opacity={0.5} />)}
      </g>
      <path d="M0 1080 L700 756 H1220 L1920 1080Z" fill="#7b7268" stroke="none" />
      <rect y={730} width={1920} height={350} fill="#6e6258" opacity={0.4} stroke="none" />
      <g transform={`translate(${-cx * 0.13} 0)`}>{Array.from({length: 8}, (_, i) => <path key={i} d={`M${120 + i * 230} ${950 + (i % 3) * 44} l44 -30 l52 12 l34 18 l-26 16 h-96Z`} fill="#5d554c" />)}</g></g>);
  if (bg === 'courthouse') return (
    <g {...S}><defs><linearGradient id={`ch${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#eef3d8" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#ch${seed})`} stroke="none" />
      <g transform={`translate(${-cx * 0.07} 0)`}>
        <rect x={560} y={330} width={800} height={400} fill="#e8e2d2" />
        <path d="M520 330 L960 218 L1400 330Z" fill="#b9b0a0" />
        {[620, 800, 980, 1160].map((x, i) => <rect key={i} x={x} y={344} width={44} height={330} fill="#f2ecde" />)}
        <rect x={560} y={664} width={800} height={26} fill="#a39a88" />
        <rect x={896} y={452} width={128} height={278} fill="#6d5b43" />
        <rect x={872} y={130} width={176} height={92} fill="#ddd5c3" />
        <path d="M856 130 L960 74 L1064 130Z" fill="#b9b0a0" />
        <rect x={948} y={30} width={24} height={52} fill="#8a8074" />
        <circle cx={960} cy={176} r={27} fill="#f6f4ec" /><path d="M960 176 v-17 M960 176 l12 8" stroke="#33302a" strokeWidth={4} />
      </g>
      <rect y={730} width={1920} height={350} fill="#7f9a58" />
      <g transform={`translate(${-cx * 0.14} 0)`}>{[170, 1690].map((x, i) => <g key={i}><rect x={x - 10} y={596} width={20} height={150} fill="#6d5636" /><circle cx={x} cy={540} r={86} fill="#5f7a4a" /><circle cx={x - 56} cy={580} r={52} fill="#55703f" stroke="none" /></g>)}</g>
      <path d="M760 1080 L880 746 H1040 L1160 1080Z" fill="#c9bd9f" stroke="none" opacity={0.8} /></g>);
  if (bg === 'theatre_night') return (
    <g {...S}><defs><linearGradient id={`tn${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0f24" /><stop offset="1" stopColor="#232c4a" /></linearGradient></defs>
      <rect width={1920} height={760} fill={`url(#tn${seed})`} stroke="none" />
      <circle cx={1700} cy={120} r={42} fill="#e8e6da" stroke="none" opacity={0.9} />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        <rect x={0} y={330} width={520} height={430} fill="#1d2233" />
        <rect x={1400} y={300} width={520} height={460} fill="#1a1f30" />
        {[70, 190, 310].map((x, i) => <rect key={i} x={x} y={420} width={64} height={92} fill="#f2c230" opacity={0.75} />)}
        {[1500, 1620, 1740].map((x, i) => <rect key={i} x={x} y={400} width={64} height={92} fill="#f2c230" opacity={0.6} />)}
        <rect x={560} y={210} width={800} height={550} fill="#262c42" />
        <path d="M520 210 L960 110 L1400 210Z" fill="#39415e" />
        <rect x={640} y={300} width={640} height={170} fill="#e8dcc0" />
        <rect x={640} y={300} width={640} height={170} fill="none" stroke="#d9a441" strokeWidth={8} />
        {Array.from({length: 12}, (_, i) => <circle key={i} cx={664 + i * 54} cy={288} r={8} fill="#f7dd8e" stroke="none" />)}
        {Array.from({length: 12}, (_, i) => <circle key={i} cx={664 + i * 54} cy={482} r={8} fill="#f7dd8e" stroke="none" />)}
        {[830, 1030].map((x, i) => <path key={i} d={`M${x} 760 v-190 a30 30 0 0 1 60 0 v190Z`} fill="#10131f" />)}
      </g>
      <rect y={760} width={1920} height={320} fill="#333344" stroke="none" />
      <rect y={730} width={1920} height={350} fill="#4a4a58" opacity={0.45} stroke="none" />
      {[300, 1620].map((x, i) => <g key={i}><circle cx={x} cy={560} r={44} fill="#f7dd8e" stroke="none" opacity={0.28} /><rect x={x - 6} y={560} width={12} height={210} fill="#14161f" /><circle cx={x} cy={548} r={15} fill="#f7dd8e" stroke="none" /></g>)}</g>);
  return null;
};
