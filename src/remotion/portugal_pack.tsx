// Portugal pack for the Vidfactory kit. Pure SVG, deterministic (no Math.random, no Date, no CSS animation).
// Contents: 6 props (incl. the border_pt signature prop with 8 era states, and a bobbing lateen caravel), 5 backgrounds.
// Imported by world.tsx (props, backgrounds) exactly like afghanistan_pack / civilwar_pack. Do not edit per video.
// First built for: "Why Portugal Was Never Conquered in 35 Minutes" (Zeus History, 2026-11-18).
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {HAND, INK} from './world';
import type {PropT} from './world';

const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = {stroke: '#241c17', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
const T: React.FC<{x?: number; y?: number; t: string; fs?: number; fill?: string; sw?: number; a?: 'start' | 'middle' | 'end'; r?: number}> = ({x = 0, y = 0, t, fs = 40, fill = '#fff', sw = 7, a = 'middle', r = 0}) => (
  <text x={x} y={y} textAnchor={a} fontFamily={HAND} fontSize={fs} fill={fill} stroke={INK} strokeWidth={sw} paintOrder="stroke" strokeLinejoin="round" transform={r ? `rotate(${r} ${x} ${y})` : undefined}>{t}</text>
);
const pop01 = (f: number, a: number) => interpolate(f, [a, a + 8], [0, 1], {...C, easing: Easing.out(Easing.back(2))});

// ================= PROPS =================
export type PortugalKind = 'border_pt' | 'padrao_pt' | 'armillary_pt' | 'azulejo_pt' | 'rooster_pt' | 'caravel_pt';
const SET = new Set<string>(['border_pt', 'padrao_pt', 'armillary_pt', 'azulejo_pt', 'rooster_pt', 'caravel_pt']);
export const isPortugalProp = (k: string) => SET.has(k);

export const PortugalProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p, f, seed}) => {
  const t = p.t ?? '';
  switch (p.k as PortugalKind) {
    case 'border_pt': { // THE signature prop: the frontier stone of 1297. t = era state: county|kingdom|cracked|globe|crown|restored|scorched|modern.
      const st = t || 'kingdom';
      const stone = st === 'scorched' ? '#4a423c' : st === 'modern' ? '#b9b2a4' : '#a89a80';
      const stoneD = st === 'scorched' ? '#33291f' : '#8a7a5f';
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={110} ry={13} fill="#000" opacity={0.16} stroke="none" />
          <path d="M-86 0 L-58 -34 H58 L86 0Z" fill={stoneD} />
          {st === 'county' && (<g>
            <rect x={-13} y={-218} width={26} height={196} fill="#7a5c38" />
            <path d="M13 -218 L96 -196 L13 -172Z" fill="#b03030" />
            <rect x={-60} y={-30} width={120} height={14} fill="#8a7a5f" transform="rotate(-4 0 -24)" />
          </g>)}
          {st !== 'county' && (<g>
            <path d="M-46 0 L-40 -168 Q0 -196 40 -168 L46 0Z" fill={stone} />
            <path d="M-40 -168 Q0 -196 40 -168" fill="none" stroke={stoneD} strokeWidth={5} />
            {/* carved cross of the Order of Christ: plain cross pattée outline, abstract */}
            <g stroke="#b03030" strokeWidth={7} fill="none">
              <path d="M0 -148 V-84" /><path d="M-24 -128 H24" />
            </g>
            <g stroke={stoneD} strokeWidth={4} opacity={0.8}>
              <path d="M-22 -62 H22" /><path d="M-22 -46 H22" />
            </g>
            {st === 'cracked' && <path d="M6 -190 L-6 -140 L10 -104 L-4 -58 L6 -6" fill="none" stroke="#241c17" strokeWidth={5} />}
            {st === 'restored' && <path d="M6 -190 L-6 -140 L10 -104 L-4 -58 L6 -6" fill="none" stroke="#d9a441" strokeWidth={5} />}
            {st === 'globe' && (<g transform="translate(0 -238)">
              <circle r={34} fill="none" stroke="#c9962e" strokeWidth={6} />
              <ellipse rx={34} ry={13} fill="none" stroke="#c9962e" strokeWidth={4} />
              <ellipse rx={13} ry={34} fill="none" stroke="#c9962e" strokeWidth={4} />
              <path d="M-40 26 H40" stroke="#c9962e" strokeWidth={6} />
            </g>)}
            {st === 'crown' && (<g opacity={0.92}>
              <path d="M-120 -300 L-96 -238 L-52 -282 L0 -232 L52 -282 L96 -238 L120 -300 L112 -206 H-112Z" fill="#3a3230" stroke="#241c17" strokeWidth={4} />
              <circle cx={0} cy={-258} r={10} fill="#c9962e" stroke="none" />
            </g>)}
            {st === 'scorched' && (<g fill="#241c17" opacity={0.55} stroke="none">
              <path d="M-40 -120 Q-10 -150 8 -108 Q-16 -96 -40 -120Z" /><path d="M-16 -52 Q14 -74 30 -40 Q2 -30 -16 -52Z" />
            </g>)}
            {st === 'modern' && (<g>
              <rect x={-30} y={-66} width={60} height={34} fill="#2e4a7a" />
              {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={-18 + (i % 3) * 18} cy={-58 + Math.floor(i / 3) * 16} r={3.4} fill="#ffd24a" stroke="none" />)}
            </g>)}
          </g>)}
        </g>);
    }
    case 'padrao_pt': { // A padrão: the stone pillar Portugal planted on new coasts. Cross on top, plaque with ruled lines.
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={86} ry={11} fill="#000" opacity={0.16} stroke="none" />
          <path d="M-58 0 L-44 -26 H44 L58 0Z" fill="#8a7a5f" />
          <rect x={-24} y={-300} width={48} height={278} fill="#b3a58c" />
          <rect x={-40} y={-316} width={80} height={26} fill="#a89a80" />
          <g stroke="#7a1f2b" strokeWidth={8} fill="none"><path d="M0 -396 V-322" /><path d="M-22 -372 H22" /></g>
          <rect x={-17} y={-238} width={34} height={64} fill="#cbbfa5" />
          <g stroke="#8a7a5f" strokeWidth={4}><path d="M-10 -222 H10" /><path d="M-10 -208 H10" /><path d="M-10 -194 H10" /></g>
        </g>);
    }
    case 'armillary_pt': { // The armillary sphere, emblem of the seaborne empire. The two inner rings genuinely SPIN on the axis in opposite directions (continuous, deterministic); the outer meridian ring and stand stay still. (Upgraded 2026-11-18 for the v2 script's navigation beats; the kit's generic anim:'spin' would swing the stand, so the rotation lives inside the prop.)
      const a1 = (f / 4) % 360, a2 = (-(f / 5)) % 360;
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={70} ry={10} fill="#000" opacity={0.16} stroke="none" />
          <path d="M-34 0 L-12 -64 H12 L34 0Z" fill="#5d4a33" />
          <circle cx={0} cy={-150} r={76} fill="none" stroke="#c9962e" strokeWidth={8} />
          <g transform={`rotate(${a1.toFixed(1)} 0 -150)`}>
            <ellipse cx={0} cy={-150} rx={76} ry={28} fill="none" stroke="#e0aa4e" strokeWidth={5} />
          </g>
          <g transform={`rotate(${a2.toFixed(1)} 0 -150)`}>
            <ellipse cx={0} cy={-150} rx={28} ry={76} fill="none" stroke="#c9962e" strokeWidth={5} />
            <ellipse cx={0} cy={-150} rx={76} ry={56} fill="none" stroke="#a87c26" strokeWidth={4} transform="rotate(24 0 -150)" />
          </g>
          <line x1={0} y1={-226} x2={0} y2={-74} stroke="#e0aa4e" strokeWidth={5} />
          <circle cx={0} cy={-150} r={13} fill="#d9a441" />
        </g>);
    }
    case 'caravel_pt': { // A lateen-rigged caravel with the Cross of Christ on its sails. The waterline sits exactly on the prop baseline, so the kit's anim:'bob' reads as floating and a move slides it across a harbour without the hull lifting out of the water. (Added 2026-11-18 for the v2 script's voyage beats.)
      return (
        <g {...OL}>
          <line x1={18} y1={-44} x2={18} y2={-318} stroke="#4a3520" strokeWidth={8} />
          <line x1={-128} y1={-96} x2={158} y2={-272} stroke="#4a3520" strokeWidth={7} />
          <path d="M-118 -104 L148 -262 L30 -150Z" fill="#efe3c8" stroke="#c9b489" strokeWidth={4} />
          <g stroke="#b03030" strokeWidth={13} fill="none"><path d="M12 -238 V-152" /><path d="M-16 -206 H40" /></g>
          <line x1={128} y1={-70} x2={128} y2={-238} stroke="#4a3520" strokeWidth={6} />
          <line x1={66} y1={-92} x2={182} y2={-204} stroke="#4a3520" strokeWidth={5} />
          <path d="M72 -98 L176 -198 L118 -128Z" fill="#e7d9b8" stroke="#c9b489" strokeWidth={3} />
          <g stroke="#b03030" strokeWidth={9} fill="none"><path d="M122 -172 V-118" /><path d="M104 -152 H140" /></g>
          <path d="M-168 -44 L-168 -118 L-96 -118 L-96 -44Z" fill="#7a5636" />
          <rect x={-160} y={-106} width={18} height={24} fill="#f4c95d" />
          <line x1={-132} y1={-118} x2={-132} y2={-158} stroke="#4a3520" strokeWidth={5} />
          <path d="M-132 -158 L-108 -146 L-132 -136Z" fill="#b03030" stroke="none" />
          <path d="M-178 -46 L178 -46 L140 8 L-130 8Z" fill="#6b4a2f" />
          <path d="M-178 -46 L178 -46 L168 -66 L-158 -66Z" fill="#84603c" />
          <path d="M178 -46 L204 -88 L150 -52Z" fill="#84603c" />
          <g fill="#f4c95d" stroke="none"><circle cx={-60} cy={-56} r={5} /><circle cx={-10} cy={-56} r={5} /><circle cx={40} cy={-56} r={5} /><circle cx={90} cy={-56} r={5} /></g>
          <g stroke="#9fc6d8" strokeWidth={5} strokeLinecap="round" opacity={0.85} fill="none">
            <path d="M-190 14 H-96" /><path d="M-30 18 H70" /><path d="M120 14 H196" />
          </g>
        </g>);
    }
    case 'azulejo_pt': { // An azulejo tile panel on two posts: a drawn board for mounting ideas and claims.
      const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={170} ry={12} fill="#000" opacity={0.15} stroke="none" />
          <rect x={-140} y={-40} width={18} height={40} fill="#5d4a33" /><rect x={122} y={-40} width={18} height={40} fill="#5d4a33" />
          <rect x={-168} y={-300} width={336} height={264} fill="#e9e4d8" />
          {tiles.map((i) => {
            const x = -168 + (i % 3) * 112, y = -300 + Math.floor(i / 3) * 88;
            return (<g key={i}>
              <rect x={x} y={y} width={112} height={88} fill={i % 2 ? '#f2eee2' : '#dfe7ee'} stroke="#2e4a7a" strokeWidth={3} />
              <circle cx={x + 56} cy={y + 44} r={17} fill="none" stroke="#2e4a7a" strokeWidth={4} />
              <path d={`M${x + 14} ${y + 66} q21 -18 42 0 q21 18 42 0`} fill="none" stroke="#2e4a7a" strokeWidth={4} />
            </g>);
          })}
        </g>);
    }
    case 'rooster_pt': { // The Barcelos rooster, Portugal's folk emblem. t = caption text under the bird (optional).
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={92} ry={11} fill="#000" opacity={0.16} stroke="none" />
          <rect x={-66} y={-16} width={132} height={16} fill="#8a7a5f" />
          <path d="M-8 -16 V-58 M16 -16 V-58" stroke="#5d4a33" strokeWidth={6} />
          <path d="M-58 -96 Q-96 -190 -38 -238 Q-70 -160 -30 -128 Q-66 -150 -84 -120 Q-52 -104 -58 -96Z" fill="#2e4a7a" />
          <path d="M-52 -110 Q-88 -168 -52 -214" fill="none" stroke="#b03030" strokeWidth={9} />
          <path d="M-40 -70 Q-44 -128 18 -140 Q66 -148 74 -112 Q80 -78 40 -62 Q-8 -46 -40 -70Z" fill="#d9a441" />
          <circle cx={-16} cy={-104} r={9} fill="#b03030" stroke="none" /><circle cx={12} cy={-88} r={7} fill="#2e7d4f" stroke="none" /><circle cx={-30} cy={-80} r={6} fill="#2e4a7a" stroke="none" />
          <circle cx={52} cy={-128} r={26} fill="#e8e2d2" />
          <circle cx={58} cy={-132} r={4.6} fill="#241c17" stroke="none" />
          <path d="M76 -130 L102 -122 L76 -112Z" fill="#c96f2e" />
          <path d="M38 -152 Q44 -172 58 -176 Q52 -160 52 -150Z" fill="#b03030" />
          {t ? <T x={0} y={44} t={t} fs={34} fill="#f6f4ec" /> : null}
        </g>);
    }
    default: return null;
  }
};

// ================= BACKGROUNDS =================
export type PortugalBgKind = 'tagus' | 'sagres' | 'douro' | 'hills_pt' | 'pines_pt';
const BGSET = new Set<string>(['tagus', 'sagres', 'douro', 'hills_pt', 'pines_pt']);
export const isPortugalBg = (k: string) => BGSET.has(k);
export const PORTUGAL_GROUND: Record<PortugalBgKind, string> = {tagus: '#9a7b52', sagres: '#8a7a5f', douro: '#7d9a52', hills_pt: '#b08954', pines_pt: '#7a8a4f'};

export const PortugalBg: React.FC<{bg: PortugalBgKind; f: number; cx: number; seed: string}> = ({bg, f, cx, seed}) => {
  const S = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  if (bg === 'tagus') return (
    <g {...S}><defs><linearGradient id={`tg${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f2e3bb" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#tg${seed})`} stroke="none" />
      <circle cx={240} cy={120} r={48} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <path d="M0 560 L420 500 L900 548 L1400 496 L1920 552 V640 H0Z" fill="#7d94a8" stroke="none" />
      <rect y={560} width={1920} height={120} fill="#4a86c5" stroke="none" opacity={0.85} />
      <path d="M0 612 H1920 M0 648 H1920" stroke="#bcd8f0" strokeWidth={4} opacity={0.5} />
      <g transform={`translate(${-cx * 0.1} 0)`}>
        {[120, 420, 760, 1120, 1480].map((x, i) => (<g key={i}>
          <rect x={x} y={596} width={210} height={134} fill={i % 2 ? '#cbb490' : '#bfa87e'} />
          <path d={`M${x - 12} 596 H${x + 222} L${x + 190} 566 H${x + 20}Z`} fill="#8a4a3a" />
          {[0, 1, 2].map((w) => <rect key={w} x={x + 26 + w * 62} y={636} width={34} height={44} fill="#5d4a33" />)}
        </g>))}
        <g><rect x={1660} y={470} width={52} height={260} fill="#c9b184" /><path d="M1648 470 L1686 396 L1724 470Z" fill="#5d4630" /><rect x={1674} y={520} width={24} height={60} fill="#4a3826" /></g>
      </g>
      <rect y={730} width={1920} height={350} fill="#9a7b52" />
      <path d="M0 800 H1920 M0 890 H1920" stroke="#7d6244" strokeWidth={4} opacity={0.6} /></g>);
  if (bg === 'sagres') return (
    <g {...S}><defs><linearGradient id={`sg${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fb2dd" /><stop offset="1" stopColor="#e9dfba" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#sg${seed})`} stroke="none" />
      <circle cx={1660} cy={110} r={46} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <rect y={470} width={1920} height={260} fill="#3f74ab" stroke="none" />
      <path d="M0 500 H1920 M0 548 H1920 M0 596 H1920" stroke="#bcd8f0" strokeWidth={4} opacity={0.45} />
      <g transform={`translate(${-cx * 0.06} 0)`}>
        <path d="M0 730 L0 560 L560 470 L1180 520 L1540 640 L1920 600 V730Z" fill="#96754a" />
        <path d="M0 730 L240 600 L760 560 L1300 620 L1920 660 V730Z" fill="#8a7a5f" />
        {[300, 700, 1150, 1560].map((x, i) => <path key={i} d={`M${x} 640 l26 -14 l24 14 l-12 12 h-28Z`} fill="#77572f" stroke="none" opacity={0.7} />)}
      </g>
      <rect y={730} width={1920} height={350} fill="#8a7a5f" /></g>);
  if (bg === 'douro') return (
    <g {...S}><defs><linearGradient id={`dr${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f2e3bb" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#dr${seed})`} stroke="none" />
      <circle cx={1560} cy={120} r={48} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        {[0, 1, 2, 3].map((i) => (<g key={i}>
          <path d={`M${-80 + i * 40} ${470 + i * 62} H${2000 - i * 40} L${1880 - i * 30} ${540 + i * 62} H${40 + i * 30}Z`} fill={i % 2 ? '#7d9a52' : '#8fae5f'} />
          {Array.from({length: 9}, (_, w) => <path key={w} d={`M${140 + w * 200 + i * 22} ${492 + i * 62} q14 10 28 0`} stroke="#4f7f3f" strokeWidth={5} fill="none" />)}
        </g>))}
      </g>
      <path d="M0 730 L520 668 L1040 724 L1520 672 L1920 716 V730 H0Z" fill="#4a86c5" stroke="none" />
      <rect y={730} width={1920} height={350} fill="#7d9a52" /></g>);
  if (bg === 'hills_pt') return (
    <g {...S}><defs><linearGradient id={`hp${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f7ecc9" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#hp${seed})`} stroke="none" />
      <circle cx={300} cy={118} r={50} fill="#f7dd8e" stroke="none" />
      <g transform={`translate(${-cx * 0.05} 0)`}><path d="M0 620 Q480 470 960 580 Q1440 690 1920 560 V730 H0Z" fill="#a98a5f" /></g>
      <g transform={`translate(${-cx * 0.1} 0)`}><path d="M0 690 Q520 560 1080 660 Q1560 740 1920 650 V730 H0Z" fill="#96754a" />
        {[240, 700, 1180, 1620].map((x, i) => (<g key={i}>
          <rect x={x + 26} y={618} width={12} height={52} fill="#5d4a33" />
          <ellipse cx={x + 32} cy={596} rx={64} ry={34} fill="#4f7f3f" />
        </g>))}
      </g>
      <rect y={730} width={1920} height={350} fill="#b08954" />
      {Array.from({length: 10}, (_, i) => <path key={i} d={`M${i * 200 + 40} ${820 + (i % 3) * 70} l22 -10 l20 10 l-9 9 h-24Z`} fill="#96754a" stroke="none" opacity={0.7} />)}</g>);
  return (
    <g {...S}><defs><linearGradient id={`pn${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#eef0d0" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#pn${seed})`} stroke="none" />
      <circle cx={1620} cy={116} r={46} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <path d="M0 640 Q640 540 1280 610 Q1640 650 1920 600 V730 H0Z" fill="#6d8a48" />
      <g transform={`translate(${-cx * 0.08} 0)`}>
        {[80, 420, 780, 1180, 1520, 1800].map((x, i) => (<g key={i}>
          <path d={`M${x + 30} 730 V${470 + (i % 3) * 26}`} stroke="#6b4a2e" strokeWidth={13} />
          <ellipse cx={x + 32} cy={452 + (i % 3) * 26} rx={118} ry={40} fill="#3e6b34" />
          <ellipse cx={x + 32} cy={436 + (i % 3) * 26} rx={84} ry={28} fill="#4f7f3f" />
        </g>))}
      </g>
      <rect y={730} width={1920} height={350} fill="#7a8a4f" /></g>);
};
