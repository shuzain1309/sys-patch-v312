// Spain pack for the Vidfactory kit. Pure SVG, deterministic (no Math.random, no Date, no CSS animation).
// Contents: 4 props (incl. the castles_es signature prop with 6 era states) and 5 backgrounds.
// Imported by world.tsx (props, backgrounds) exactly like mongol_pack / portugal_pack. Do not edit per video.
// First built for: "How Spain Was Born: The 781-Year Reconquista in 35 Minutes" (Zeus History, 2026-11-19).
import React from 'react';
import {INK} from './world';
import type {PropT} from './world';

const OL = {stroke: '#241c17', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;

// ================= PROPS =================
export type SpainKind = 'castles_es' | 'arch_es' | 'crown_es' | 'astrolabe_es';
const SET = new Set<string>(['castles_es', 'arch_es', 'crown_es', 'astrolabe_es']);
export const isSpainProp = (k: string) => SET.has(k);

export const SpainProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p, f, seed}) => {
  const t = p.t ?? '';
  switch (p.k as SpainKind) {
    case 'castles_es': { // THE signature prop: the frontier line of castles. t = era state: one|duero|tagus|broken|sierra|crown.
      const st = t || 'duero';
      const stone = '#9a8a76', stoneD = '#7d6f5c', roof = '#8a4a34';
      const tower = (x: number, y: number, s: number, ruin = false) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x={-26} y={-120} width={52} height={120} fill={stone} />
          <path d="M-32 -120 h64 M-32 -120 v-14 h16 v14 M-8 -120 v-14 h16 v14 M16 -120 v-14 h16 v14" fill={stoneD} stroke="#241c17" strokeWidth={3} />
          <rect x={-7} y={-86} width={14} height={30} fill="#3a2c1c" />
          {ruin && (<g stroke="#241c17" strokeWidth={4}><path d="M-20 -118 L4 -70 L-8 -34" fill="none" /><path d="M22 -104 L6 -66" fill="none" /></g>)}
          {ruin && <path d="M-26 -120 L26 -96 L26 -120Z" fill="#241c17" opacity={0.25} stroke="none" />}
        </g>);
      const banner = (x: number, y: number, c: string) => (
        <g key={'b' + x} transform={`translate(${x} ${y})`}>
          <rect x={-3} y={-168} width={6} height={62} fill="#5a4632" />
          <path d="M3 -166 h44 l-10 11 10 11 h-44Z" fill={c} />
        </g>);
      if (st === 'one') return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={170} ry={13} fill="#000" opacity={0.16} stroke="none" />
          <path d="M-170 0 Q0 -64 170 0Z" fill="#8a9a5f" />
          {tower(0, -38, 1.05)}
          {banner(0, -38, '#a8242c')}
        </g>);
      if (st === 'crown') return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={250} ry={14} fill="#000" opacity={0.16} stroke="none" />
          <path d="M-260 0 Q0 -34 260 0Z" fill="#8a7a56" />
          <path d="M-208 -34 h416" stroke={stoneD} strokeWidth={16} />
          {tower(-190, -40, 1.12)} {tower(-64, -34, 0.92)} {tower(64, -34, 0.92)} {tower(190, -40, 1.12)}
          <g transform="translate(0 -196)">
            <rect x={-3} y={-30} width={6} height={40} fill="#5a4632" />
            <path d="M-88 -34 h176 v44 h-176Z" fill="#e8dcc0" />
            <rect x={-88} y={-34} width={88} height={44} fill="#a8242c" />
            <rect x={0} y={-34} width={88} height={44} fill="#c9962e" />
            <path d="M-44 -22 v20 M-54 -12 h20" stroke="#e8dcc0" strokeWidth={5} />
            <circle cx={44} cy={-12} r={9} fill="#a8242c" stroke="none" />
          </g>
        </g>);
      const xs = [-208, -104, 0, 104, 208];
      const ys = st === 'sierra' ? [-6, -26, -48, -70, -92] : [-16, -30, -36, -30, -16];
      const n = st === 'duero' ? 3 : 5;
      const used = xs.slice(0, n), usedY = ys.slice(0, n);
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={260} ry={14} fill="#000" opacity={0.16} stroke="none" />
          <path d={`M-270 0 Q0 ${st === 'sierra' ? -120 : -52} 270 0Z`} fill={st === 'sierra' ? '#7d7468' : '#8a7a56'} />
          {st !== 'duero' && <path d={`M${used[0]} ${usedY[0] - 30} ${used.map((x, i) => `L${x} ${usedY[i] - 30}`).join(' ')}`} stroke={stoneD} strokeWidth={13} fill="none" />}
          {used.map((x, i) => tower(x, usedY[i], 0.92, st === 'broken' && i === 2))}
          {st === 'duero' && <path d="M-270 6 Q0 -16 270 6 L270 14 L-270 14Z" fill="#4a86c5" stroke="none" opacity={0.85} />}
          {st === 'broken' && (<g transform={`translate(0 -64) rotate(24)`}><rect x={-3} y={-40} width={6} height={44} fill="#5a4632" /><path d="M3 -38 h34 l-8 9 8 9 h-34Z" fill="#a8242c" opacity={0.75} /></g>)}
          {st === 'sierra' && (<g stroke="#241c17" strokeWidth={3} strokeDasharray="7 7" fill="none" opacity={0.65}><rect x={232} y={-196} width={44} height={96} /></g>)}
          {st !== 'broken' && banner(used[Math.floor(n / 2)], usedY[Math.floor(n / 2)], '#a8242c')}
        </g>);
    }
    case 'arch_es': { // A Mezquita horseshoe arch: double arch, alternating red and white voussoirs, warm light inside.
      const vouss = Array.from({length: 9}, (_, i) => i);
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={150} ry={12} fill="#000" opacity={0.16} stroke="none" />
          <rect x={-96} y={-190} width={26} height={190} fill="#cbb590" />
          <rect x={70} y={-190} width={26} height={190} fill="#cbb590" />
          <rect x={-104} y={-206} width={42} height={18} fill="#a8895a" />
          <rect x={62} y={-206} width={42} height={18} fill="#a8895a" />
          <path d="M-96 -190 A96 96 0 0 1 96 -190 L96 -168 A74 74 0 0 0 -96 -168Z" fill="#8a4a34" />
          {vouss.map((i) => { const a = Math.PI * (1 - i / 8); const x1 = Math.cos(a) * 96, y1 = -190 - Math.sin(a) * 96, x2 = Math.cos(a) * 74, y2 = -190 - Math.sin(a) * 74; return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 2 ? '#e8dcc0' : '#8a4a34'} strokeWidth={9} />; })}
          <path d="M-62 -190 A62 62 0 0 1 62 -190 L62 0 L-62 0Z" fill="#e8a33d" opacity={0.28} stroke="none" />
          <path d="M-62 -190 A62 62 0 0 1 62 -190" fill="none" stroke="#a8895a" strokeWidth={7} />
          <rect x={-62} y={-192} width={10} height={192} fill="#b09a72" />
          <rect x={52} y={-192} width={10} height={192} fill="#b09a72" />
        </g>);
    }
    case 'crown_es': { // A Visigothic votive crown (Guarrazar type): gold circlet on chains, cross and letter pendants hanging.
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={90} ry={10} fill="#000" opacity={0.14} stroke="none" />
          <g stroke="#8a6a1f" strokeWidth={4}><path d="M-52 -238 L0 -292 M52 -238 L0 -292 M0 -244 L0 -292" /></g>
          <circle cx={0} cy={-296} r={8} fill="#d9a441" />
          <path d="M-58 -238 A58 20 0 0 0 58 -238 L52 -206 A52 16 0 0 1 -52 -206Z" fill="#d9a441" />
          <path d="M-58 -238 A58 20 0 0 0 58 -238" fill="none" stroke="#8a6a1f" strokeWidth={4} />
          {[-38, -13, 13, 38].map((x, i) => <circle key={i} cx={x} cy={-224} r={5} fill={i % 2 ? '#7a1f2b' : '#2b5fb4'} stroke="none" />)}
          {[-40, -14, 14, 40].map((x, i) => (
            <g key={i} transform={`translate(${x} -204)`}>
              <path d="M0 0 v26" stroke="#8a6a1f" strokeWidth={3} />
              {i === 1 || i === 2 ? (<g stroke="#d9a441" strokeWidth={5}><path d="M0 26 v30 M-10 40 h20" /></g>) : (<path d="M0 26 l-8 22 h16Z" fill="#d9a441" />)}
            </g>))}
          <g stroke="#d9a441" strokeWidth={5}><path d="M0 -204 v34 M-11 -156 h22" /></g>
        </g>);
    }
    case 'astrolabe_es': { // A brass astrolabe: outer ring with degree ticks, an abstract rete, a sighting rule, hanging loop.
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={100} ry={11} fill="#000" opacity={0.15} stroke="none" />
          <path d="M0 -268 v-22" stroke="#8a6a1f" strokeWidth={6} />
          <circle cx={0} cy={-300} r={13} fill="none" stroke="#8a6a1f" strokeWidth={6} />
          <circle cx={0} cy={-150} r={118} fill="#c9962e" />
          <circle cx={0} cy={-150} r={104} fill="#e3c268" />
          {Array.from({length: 24}, (_, i) => { const a = (i / 24) * Math.PI * 2; return <line key={i} x1={Math.cos(a) * 96} y1={-150 + Math.sin(a) * 96} x2={Math.cos(a) * 104} y2={-150 + Math.sin(a) * 104} stroke="#8a6a1f" strokeWidth={3} />; })}
          <circle cx={0} cy={-150} r={72} fill="none" stroke="#8a6a1f" strokeWidth={4} />
          <circle cx={0} cy={-150} r={38} fill="none" stroke="#8a6a1f" strokeWidth={3} />
          <g stroke="#8a6a1f" strokeWidth={4} fill="none">
            <path d="M-58 -186 L-16 -160 L-44 -118" /><path d="M52 -196 L14 -158 L48 -112" /><path d="M-64 -132 L-10 -138 L30 -104" />
          </g>
          <path d="M-88 -88 L88 -212" stroke="#7a5a14" strokeWidth={9} />
          <circle cx={0} cy={-150} r={10} fill="#8a6a1f" stroke="none" />
          {[[-58, -186], [52, -196], [48, -112], [-44, -118]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4.5} fill="#7a1f2b" stroke="none" />)}
        </g>);
    }
    default: return null;
  }
};

// ================= BACKGROUNDS =================
export type SpainBgKind = 'cordoba_es' | 'granada_es' | 'toledo_es' | 'covadonga_es' | 'meseta_es';
const BGSET = new Set<string>(['cordoba_es', 'granada_es', 'toledo_es', 'covadonga_es', 'meseta_es']);
export const isSpainBg = (k: string) => BGSET.has(k);
export const SPAIN_GROUND: Record<SpainBgKind, string> = {cordoba_es: '#a8895a', granada_es: '#7a8a4a', toledo_es: '#b09a64', covadonga_es: '#5f8a4a', meseta_es: '#c2a061'};

export const SpainBg: React.FC<{bg: SpainBgKind; f: number; cx: number; seed: string}> = ({bg, f, cx, seed}) => {
  const S = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  if (bg === 'cordoba_es') return (
    <g {...S}><defs><linearGradient id={`co${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f7ecc9" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#co${seed})`} stroke="none" />
      <circle cx={1590} cy={110} r={48} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        <path d="M0 636 Q480 556 960 606 Q1440 656 1920 596 V730 H0Z" fill="#b09a64" />
        <rect x={560} y={470} width={640} height={110} fill="#cbb590" />
        <path d="M548 470 h664 l-30 -26 h-604Z" fill="#8a4a34" />
        {[600, 690, 780, 870, 960, 1050, 1140].map((x, i) => <path key={i} d={`M${x} 580 v-58 a16 20 0 0 1 32 0 v58`} fill="#7a4a2a" />)}
        <rect x={1252} y={392} width={52} height={188} fill="#cbb590" />
        <path d="M1246 392 h64 l-32 -34Z" fill="#8a4a34" />
        {[240, 380, 1440, 1620].map((x, i) => (<g key={i} transform={`translate(${x} 596)`}><path d="M0 0 v-64" stroke="#5d4630" strokeWidth={8} /><path d="M0 -64 q-40 -22 -62 -4 M0 -64 q40 -22 62 -4 M0 -64 q-6 -34 -26 -44 M0 -64 q6 -34 26 -44" stroke="#4f7f3f" strokeWidth={8} fill="none" /></g>))}
        <g stroke="#7d6f5c" strokeWidth={10} fill="none"><path d="M120 668 a90 44 0 0 1 180 0 M330 668 a90 44 0 0 1 180 0 M540 668 a90 44 0 0 1 180 0 M750 668 a90 44 0 0 1 180 0 M960 668 a90 44 0 0 1 180 0 M1170 668 a90 44 0 0 1 180 0 M1380 668 a90 44 0 0 1 180 0 M1590 668 a90 44 0 0 1 180 0" /></g>
      </g>
      <rect y={730} width={1920} height={350} fill="#a8895a" />
      <path d="M0 800 Q480 776 960 800 Q1440 824 1920 796" stroke="#4a86c5" strokeWidth={16} fill="none" opacity={0.55} /></g>);
  if (bg === 'granada_es') return (
    <g {...S}><defs><linearGradient id={`gr${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#93b8dc" /><stop offset="1" stopColor="#f2e3bb" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#gr${seed})`} stroke="none" />
      <circle cx={300} cy={112} r={46} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        <path d="M0 470 L360 300 L700 420 L1080 260 L1460 400 L1920 300 V730 H0Z" fill="#aebfd2" />
        <path d="M360 300 l60 44 -34 6 -26 -20 -22 22 -30 -8Z M1080 260 l70 52 -40 8 -30 -24 -26 26 -34 -10Z" fill="#eef3f8" stroke="none" />
        <path d="M0 660 Q620 520 1240 590 Q1620 630 1920 580 V730 H0Z" fill="#6d7f43" />
        <g transform="translate(620 470)">
          <path d="M0 130 L60 40 H640 L700 130Z" fill="#96754a" />
          <rect x={60} y={-16} width={580} height={72} fill="#a85f3d" />
          <path d="M52 -16 h596 l-24 -20 h-548Z" fill="#8a4a34" />
          {[110, 240, 370, 500].map((x, i) => <rect key={i} x={x} y={6} width={34} height={34} fill="#e8dcc0" />)}
          <rect x={-8} y={-72} width={64} height={130} fill="#a85f3d" />
          <path d="M-16 -72 h80 l-40 -30Z" fill="#8a4a34" />
          <rect x={640} y={-96} width={58} height={154} fill="#a85f3d" />
          <path d="M632 -96 h74 l-37 -28Z" fill="#8a4a34" />
          <rect x={660} y={-66} width={20} height={30} fill="#3a2c1c" />
        </g>
        {[220, 1560, 1720].map((x, i) => (<g key={i} transform={`translate(${x} 640)`}><path d="M0 30 v-84" stroke="#3f6030" strokeWidth={7} /><ellipse cx={0} cy={-92} rx={30} ry={44} fill="#3f6030" /></g>))}
      </g>
      <rect y={730} width={1920} height={350} fill="#7a8a4a" />
      <path d="M0 812 H1920 M0 900 H1920" stroke="#66793c" strokeWidth={4} opacity={0.55} /></g>);
  if (bg === 'toledo_es') return (
    <g {...S}><defs><linearGradient id={`to${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f7ecc9" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#to${seed})`} stroke="none" />
      <circle cx={1640} cy={108} r={47} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        <path d="M240 690 Q960 470 1680 690 L1680 730 L240 730Z" fill="#a8895a" />
        <path d="M420 640 Q960 486 1500 640" stroke="#7d6f5c" strokeWidth={22} fill="none" />
        {[520, 700, 900, 1100, 1300].map((x, i) => { const y = 622 - Math.sin((x - 420) / 1080 * Math.PI) * 108; return (<g key={i} transform={`translate(${x} ${y})`}><rect x={-24} y={-84} width={48} height={84} fill="#9a8a76" /><path d="M-30 -84 h60 M-30 -84 v-12 h15 v12 M-7 -84 v-12 h15 v12 M15 -84 v-12 h15 v12" fill="#7d6f5c" stroke="#241c17" strokeWidth={2.5} /></g>); })}
        <rect x={852} y={330} width={216} height={130} fill="#b09a72" />
        <path d="M842 330 h236 l-26 -26 h-184Z" fill="#7d6f5c" />
        <g transform="translate(1210 372)"><rect x={-17} y={-120} width={34} height={120} fill="#9a8a76" /><path d="M0 -120 L-22 -168 L0 -152 L22 -168Z" fill="#5d6068" /><rect x={-8} y={-92} width={16} height={28} fill="#3a2c1c" /></g>
        {[620, 780, 1060].map((x, i) => <rect key={i} x={x} y={420 - i * 12} width={64} height={52} fill="#cbb590" />)}
      </g>
      <rect y={730} width={1920} height={350} fill="#b09a64" />
      <path d="M0 786 Q480 812 960 786 Q1440 760 1920 790" stroke="#4a86c5" strokeWidth={18} fill="none" opacity={0.6} /></g>);
  if (bg === 'covadonga_es') return (
    <g {...S}><defs><linearGradient id={`cv${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fc6e8" /><stop offset="1" stopColor="#eef3d8" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#cv${seed})`} stroke="none" />
      <circle cx={320} cy={106} r={44} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        <path d="M0 730 V300 L300 180 L560 380 L760 240 L760 730Z" fill="#5f7f52" />
        <path d="M1160 730 V240 L1400 380 L1660 180 L1920 300 V730Z" fill="#557549" />
        <path d="M300 180 l44 52 -30 4 -20 -18 -16 20 -26 -6Z M1660 180 l44 52 -30 4 -20 -18 -16 20 -26 -6Z" fill="#e8eef4" stroke="none" />
        <path d="M700 730 V430 Q960 380 1220 430 V730Z" fill="#6d8a5c" />
        <ellipse cx={960} cy={470} rx={130} ry={86} fill="#3a3230" />
        <ellipse cx={960} cy={478} rx={104} ry={64} fill="#171310" />
        <g transform="translate(960 452)"><rect x={-26} y={-34} width={52} height={40} fill="#e8dcc0" /><path d="M-32 -34 h64 l-32 -20Z" fill="#8a4a34" /><path d="M0 -66 v-18 M-8 -76 h16" stroke="#c9962e" strokeWidth={5} /></g>
        <path d="M960 556 q-8 90 0 174" stroke="#bcd8f0" strokeWidth={10} fill="none" opacity={0.75} />
        {[180, 420, 1520, 1760].map((x, i) => (<g key={i} transform={`translate(${x} ${660 + (i % 2) * 30})`}><path d="M0 20 v-56" stroke="#3f6030" strokeWidth={7} /><ellipse cx={0} cy={-66} rx={28} ry={40} fill="#3f6030" /></g>))}
      </g>
      <rect y={730} width={1920} height={350} fill="#5f8a4a" />
      <path d="M0 816 H1920 M0 902 H1920" stroke="#4c733c" strokeWidth={4} opacity={0.55} /></g>);
  return (
    <g {...S}><defs><linearGradient id={`me${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f7e3ae" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#me${seed})`} stroke="none" />
      <circle cx={960} cy={120} r={54} fill="#f7dd8e" stroke="none" opacity={0.95} />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        <path d="M0 620 Q480 580 960 606 Q1440 632 1920 596 V730 H0Z" fill="#bfa05e" />
        {[300, 1560].map((x, i) => (<g key={i} transform={`translate(${x} 596) scale(0.62)`} opacity={0.85}>
          <rect x={-26} y={-120} width={52} height={120} fill="#8a7a5f" />
          <path d="M-32 -120 h64 M-32 -120 v-14 h16 v14 M-8 -120 v-14 h16 v14 M16 -120 v-14 h16 v14" fill="#6f6152" stroke="#241c17" strokeWidth={3} />
          <rect x={-7} y={-86} width={14} height={30} fill="#3a2c1c" />
        </g>))}
        <path d="M120 690 q90 -12 200 0 M760 706 q110 -12 240 0 M1420 690 q90 -10 190 0" stroke="#a8894e" strokeWidth={5} fill="none" opacity={0.7} />
        {[560, 1240].map((x, i) => (<g key={i} transform={`translate(${x} 668)`}><ellipse cx={0} cy={-16} rx={30} ry={20} fill="#7d8a4a" /><ellipse cx={22} cy={-8} rx={22} ry={15} fill="#6d7a40" /></g>))}
      </g>
      <rect y={730} width={1920} height={350} fill="#c2a061" />
      <path d="M0 812 H1920 M0 900 H1920" stroke="#ab8a4f" strokeWidth={4} opacity={0.55} /></g>);
};
