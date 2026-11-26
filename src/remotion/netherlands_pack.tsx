import React from 'react';
import {INK} from './world';
import type {PropT} from './world';

// ── NETHERLANDS PACK (2026-11-26) ────────────────────────────────────────────
// Signature device: THE GUILDER (guilder_nl) — one gold coin whose state
// tracks the argument of "Why America Once Feared the Netherlands": a pooled
// coin (coin) becomes a tradable share (share), a bank (bank), a world fleet
// (fleet), a globe-girdling system (globe), and finally the dollar (dollar).
// Refrain (exactly 3x in the script): "The money always came back."
// Plus two place-faithful backdrops: an Amsterdam canal row and the Statia
// roadstead under Fort Oranje.

const GOLD = '#d9a83c', GOLD_D = '#b8892f', GOLD_L = '#f0cd72';

const CoinFace: React.FC<{r: number; cy: number; dollar?: boolean}> = ({r, cy, dollar}) => (
  <g>
    <circle cx={0} cy={cy} r={r} fill={GOLD} stroke={INK} strokeWidth={4}/>
    <circle cx={0} cy={cy} r={r * 0.8} fill={GOLD_L} stroke={GOLD_D} strokeWidth={3}/>
    {dollar ? (
      <g stroke={INK} strokeWidth={5} fill="none">
        <path d={`M${-r * 0.34} ${cy + r * 0.42} L${-r * 0.34} ${cy - r * 0.42}`}/>
        <path d={`M${r * 0.34} ${cy + r * 0.42} L${r * 0.34} ${cy - r * 0.42}`}/>
        <path d={`M${-r * 0.52} ${cy - r * 0.3} Q0 ${cy - r * 0.62} ${r * 0.52} ${cy - r * 0.3} Q0 ${cy + 0.02} ${-r * 0.52} ${cy + r * 0.34} Q0 ${cy + r * 0.62} ${r * 0.52} ${cy + r * 0.34}`} strokeWidth={6}/>
      </g>
    ) : (
      <g>
        <path d={`M${-r * 0.4} ${cy - r * 0.28} L${-r * 0.28} ${cy - r * 0.52} L${-r * 0.1} ${cy - r * 0.34} L0 ${cy - r * 0.56} L${r * 0.1} ${cy - r * 0.34} L${r * 0.28} ${cy - r * 0.52} L${r * 0.4} ${cy - r * 0.28} Z`} fill={GOLD_D} stroke={INK} strokeWidth={3}/>
        <path d={`M${-r * 0.3} ${cy - r * 0.12} L${r * 0.3} ${cy - r * 0.12} L${r * 0.22} ${cy + r * 0.34} Q0 ${cy + r * 0.5} ${-r * 0.22} ${cy + r * 0.34} Z`} fill="#a03a2e" stroke={INK} strokeWidth={3}/>
        <line x1={-r * 0.3} y1={cy + r * 0.1} x2={r * 0.3} y2={cy + r * 0.1} stroke={GOLD_L} strokeWidth={4}/>
      </g>
    )}
  </g>
);

export const NetherlandsProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p}) => {
  const state = p.t ?? 'coin';
  if (state === 'share') {
    // The coin becomes paper: a share certificate, ruled lines, wax seal,
    // the little guilder stamped at its head — ownership anyone can buy.
    return <g>
      <rect x={-150} y={-330} width={300} height={330} fill="#e8dcc0" stroke={INK} strokeWidth={3.6}/>
      <CoinFace r={44} cy={-268}/>
      {[-196, -168, -140, -112].map(y => <line key={y} x1={-118} y1={y} x2={118} y2={y} stroke="#8a7a5a" strokeWidth={4}/>)}
      <line x1={-118} y1={-84} x2={40} y2={-84} stroke="#8a7a5a" strokeWidth={4}/>
      <path d="M62 -66 L48 -22 L66 -34 L82 -66 Z" fill="#c9962e"/>
      <path d="M94 -66 L108 -22 L90 -34 L74 -66 Z" fill="#a03a2e"/>
      <circle cx={78} cy={-72} r={30} fill="#a03a2e" stroke={INK} strokeWidth={3.2}/>
      <circle cx={78} cy={-72} r={16} fill="none" stroke={GOLD_L} strokeWidth={3}/>
    </g>;
  }
  if (state === 'bank') {
    // A stepped-gable Amsterdam bank house, the guilder as its hanging sign.
    return <g>
      <rect x={-170} y={-300} width={340} height={300} fill="#cbb894" stroke={INK} strokeWidth={3.6}/>
      <path d="M-170 -300 L-170 -348 L-112 -348 L-112 -326 L-56 -326 L-56 -356 L0 -380 L56 -356 L56 -326 L112 -326 L112 -348 L170 -348 L170 -300 Z" fill="#8a4a3a" stroke={INK} strokeWidth={3.4}/>
      {[-120, -40, 40, 120].map(x => <rect key={x} x={x - 22} y={-268} width={44} height={64} fill="#f7e3a1" stroke={INK} strokeWidth={2.4}/>)}
      {[-80, 0, 80].map(x => <rect key={x} x={x - 22} y={-168} width={44} height={64} fill="#f7e3a1" stroke={INK} strokeWidth={2.4}/>)}
      <rect x={-34} y={-104} width={68} height={104} fill="#4a3421" stroke={INK} strokeWidth={3}/>
      <line x1={-196} y1={-392} x2={-196} y2={-330} stroke={INK} strokeWidth={5}/>
      <line x1={-196} y1={-392} x2={-148} y2={-392} stroke={INK} strokeWidth={5}/>
      <g transform="translate(-124,-392)"><CoinFace r={34} cy={52}/></g>
    </g>;
  }
  if (state === 'fleet') {
    // Three East Indiamen on a wave bar; the middle sail carries the coin.
    const Ship: React.FC<{x: number; s: number; coin?: boolean}> = ({x, s, coin}) => (
      <g transform={`translate(${x},0) scale(${s})`}>
        <path d="M-120 -44 L120 -44 L84 0 L-84 0 Z" fill="#6e5136" stroke={INK} strokeWidth={3.4}/>
        <line x1={0} y1={-44} x2={0} y2={-238} stroke={INK} strokeWidth={5}/>
        <line x1={-64} y1={-44} x2={-64} y2={-196} stroke={INK} strokeWidth={4}/>
        <line x1={64} y1={-44} x2={64} y2={-196} stroke={INK} strokeWidth={4}/>
        <path d="M-58 -226 L58 -226 L48 -128 L-48 -128 Z" fill="#f2ead8" stroke={INK} strokeWidth={3}/>
        <path d="M-52 -186 L-118 -186 L-108 -118 L-52 -118 Z" fill="#e8dcc0" stroke={INK} strokeWidth={3}/>
        <path d="M52 -186 L118 -186 L108 -118 L52 -118 Z" fill="#e8dcc0" stroke={INK} strokeWidth={3}/>
        {coin && <g transform="translate(0,-176)"><CoinFace r={30} cy={0}/></g>}
        <path d="M0 -238 L44 -224 L0 -210 Z" fill="#a03a2e" stroke={INK} strokeWidth={2.4}/>
      </g>
    );
    return <g>
      <Ship x={-215} s={0.82}/><Ship x={0} s={1} coin/><Ship x={215} s={0.82}/>
      <path d="M-330 6 Q-240 -12 -150 6 Q-60 24 30 6 Q120 -12 210 6 Q270 18 330 6" fill="none" stroke="#4a7a96" strokeWidth={8}/>
      <path d="M-300 30 Q-200 14 -100 30 Q0 46 100 30 Q200 14 300 30" fill="none" stroke="#4a7a96" strokeWidth={6} opacity={0.6}/>
    </g>;
  }
  if (state === 'globe') {
    // The system girdles the earth: a globe, its trade arcs, the coin above.
    return <g>
      <path d="M-40 0 L0 -44 L40 0 Z" fill="#5d4630" stroke={INK} strokeWidth={3}/>
      <circle cx={0} cy={-196} r={150} fill="#7fa8c9" stroke={INK} strokeWidth={4}/>
      <ellipse cx={0} cy={-196} rx={62} ry={150} fill="none" stroke="#3f6a8c" strokeWidth={3.4}/>
      <ellipse cx={0} cy={-196} rx={118} ry={150} fill="none" stroke="#3f6a8c" strokeWidth={3}/>
      <line x1={-150} y1={-196} x2={150} y2={-196} stroke="#3f6a8c" strokeWidth={3.4}/>
      <path d="M-138 -262 Q0 -226 138 -262 M-138 -130 Q0 -166 138 -130" fill="none" stroke="#3f6a8c" strokeWidth={3}/>
      <path d="M-52 -292 Q-96 -250 -70 -196 Q-96 -150 -58 -118 M66 -306 Q110 -262 92 -204" fill="#4c7a4f" stroke="#4c7a4f" strokeWidth={16} strokeLinecap="round" fill-opacity={0} opacity={0.85}/>
      <path d="M-238 -268 Q-120 -330 0 -300 Q120 -330 238 -268" fill="none" stroke={GOLD_D} strokeWidth={4} strokeDasharray="10 8"/>
      <path d="M-238 -124 Q-120 -62 0 -92 Q120 -62 238 -124" fill="none" stroke={GOLD_D} strokeWidth={4} strokeDasharray="10 8"/>
      <g transform="translate(0,-396)"><CoinFace r={36} cy={0}/></g>
    </g>;
  }
  if (state === 'dollar') {
    // The guilder, reborn: same gold disc, but its face now carries the two
    // pillars and the scroll — the mark the Spanish dollar handed to America.
    return <g>
      <rect x={-190} y={-14} width={380} height={14} fill="#6e5136" stroke={INK} strokeWidth={3}/>
      <circle cx={-128} cy={-58} r={26} fill={GOLD} stroke={INK} strokeWidth={3.4}/>
      <circle cx={128} cy={-44} r={19} fill={GOLD} stroke={INK} strokeWidth={3.2}/>
      <CoinFace r={118} cy={-176} dollar/>
    </g>;
  }
  // coin (default): one gold guilder standing on its table bar.
  return <g>
    <rect x={-190} y={-14} width={380} height={14} fill="#6e5136" stroke={INK} strokeWidth={3}/>
    <circle cx={-140} cy={-52} r={24} fill={GOLD} stroke={INK} strokeWidth={3.2}/>
    <circle cx={-96} cy={-38} r={17} fill={GOLD} stroke={INK} strokeWidth={3}/>
    <circle cx={142} cy={-46} r={20} fill={GOLD} stroke={INK} strokeWidth={3.2}/>
    <CoinFace r={118} cy={-176}/>
  </g>;
};
export const NETHERLANDS_PROPS = ['guilder_nl'];
export const isNetherlandsProp = (k: string) => NETHERLANDS_PROPS.includes(k);

// ── BACKDROPS ────────────────────────────────────────────────────────────────
export type NetherlandsBgKind = 'amsterdam_nl' | 'statia_nl';
export const NetherlandsBg: React.FC<{bg: NetherlandsBgKind; f: number; cx: number; seed: string}> = ({bg: kind}) => {
  if (kind === 'amsterdam_nl') {
    // An Amsterdam canal row: stepped and bell gables shoulder to shoulder,
    // a stone bridge, a loaded barge on green canal water.
    const House: React.FC<{x: number; w: number; h: number; c: string; bell?: boolean}> = ({x, w, h, c, bell}) => (
      <g>
        <rect x={x} y={500 - h} width={w} height={h} fill={c} stroke={INK} strokeWidth={3.2}/>
        {bell
          ? <path d={`M${x} ${500 - h} L${x + w / 2} ${500 - h - 44} L${x + w} ${500 - h} L${x + w - 14} ${500 - h} L${x + w - 14} ${500 - h - 18} L${x + 14} ${500 - h - 18} L${x + 14} ${500 - h} Z`} fill={c} stroke={INK} strokeWidth={3}/>
          : <path d={`M${x} ${500 - h} L${x} ${500 - h - 22} L${x + w * 0.34} ${500 - h - 22} L${x + w * 0.34} ${500 - h - 40} L${x + w * 0.66} ${500 - h - 40} L${x + w * 0.66} ${500 - h - 22} L${x + w} ${500 - h - 22} L${x + w} ${500 - h} Z`} fill={c} stroke={INK} strokeWidth={3}/>}
        {[0.28, 0.52, 0.76].map((fx, i) => <rect key={i} x={x + w * fx - 13} y={500 - h + 34} width={26} height={44} fill="#f7e3a1" stroke={INK} strokeWidth={2}/>)}
        {[0.28, 0.52, 0.76].map((fx, i) => <rect key={i} x={x + w * fx - 13} y={500 - h + 104} width={26} height={44} fill="#f7e3a1" stroke={INK} strokeWidth={2}/>)}
        <rect x={x + w / 2 - 15} y={500 - 62} width={30} height={62} fill="#4a3421"/>
      </g>
    );
    return <g>
      <House x={60} w={215} h={330} c="#8a5a44"/>
      <House x={290} w={185} h={380} c="#6e4a3a" bell/>
      <House x={490} w={225} h={345} c="#7d5240"/>
      <House x={730} w={195} h={395} c="#5d4034" bell/>
      <House x={1205} w={215} h={350} c="#7d5240"/>
      <House x={1435} w={190} h={385} c="#6e4a3a" bell/>
      <House x={1640} w={220} h={335} c="#8a5a44"/>
      <path d="M900 700 L900 560 Q960 512 1020 560 L1020 700" fill="#9a8a70" stroke={INK} strokeWidth={3.4}/>
      <path d="M-40 500 L1960 500 L1960 540 L-40 540 Z" fill="#8f8578"/>
      <rect x={-40} y={540} width={2000} height={160} fill="#3f6a52"/>
      <path d="M-40 586 Q480 574 960 584 Q1440 594 1960 580 L1960 700 L-40 700 Z" fill="#4c7a5e" opacity={0.7}/>
      <g>
        <path d="M240 636 L560 636 L516 678 L284 678 Z" fill="#5d4630" stroke={INK} strokeWidth={3}/>
        {[300, 360, 420, 480].map(x => <rect key={x} x={x} y={606} width={44} height={32} fill="#a8793c" stroke={INK} strokeWidth={2.4}/>)}
        <line x1={400} y1={606} x2={400} y2={566} stroke={INK} strokeWidth={4}/>
      </g>
      <path d="M1180 652 Q1260 642 1340 652 M1560 668 Q1650 658 1740 668" stroke="#cfe4d2" strokeWidth={4} fill="none" opacity={0.5}/>
    </g>;
  }
  // statia_nl — the Statia roadstead: the green cone of the Quill behind,
  // Fort Oranje on its cliff point, the long warehouse row of the lower town,
  // and a roadstead full of anchored shipping on blue water.
  return <g>
    <path d="M-40 500 L240 210 L430 96 L640 210 L820 500 Z" fill="#4c7a4f"/>
    <path d="M430 96 L520 190 L470 226 L392 190 Z" fill="#5d8a58"/>
    <path d="M-40 470 L700 470 L820 540 L-40 540 Z" fill="#c9b083"/>
    <g>
      <rect x={96} y={392} width={210} height={84} fill="#b09a72" stroke={INK} strokeWidth={3.2}/>
      <path d="M84 392 L201 356 L318 392 Z" fill="#8a4a3a"/>
      <rect x={120} y={330} width={46} height={64} fill="#a08a64" stroke={INK} strokeWidth={3}/>
      <line x1={143} y1={330} x2={143} y2={282} stroke={INK} strokeWidth={4}/>
      <path d="M143 282 L196 294 L143 306 Z" fill="#a03a2e"/>
      {[0, 1, 2, 3].map(i => <path key={i} d={`M${96 + i * 52} 476 L${96 + i * 52} 428 L${122 + i * 52} 428 L${122 + i * 52} 476`} fill="none" stroke={INK} strokeWidth={3}/>)}
    </g>
    {[420, 560, 700].map((x, i) => <g key={x}>
      <rect x={x} y={452} width={110} height={46} fill="#e3dbc6" stroke={INK} strokeWidth={2.8}/>
      <path d={`M${x - 6} 452 L${x + 55} 428 L${x + 116} 452 Z`} fill="#8a4a3a"/>
    </g>)}
    <rect x={-40} y={540} width={2000} height={160} fill="#2f6a96"/>
    <path d="M-40 584 Q480 572 960 582 Q1440 592 1960 578 L1960 700 L-40 700 Z" fill="#3d7ca8" opacity={0.7}/>
    {[1150, 1420, 1690].map((x, i) => <g key={x} transform={`translate(${x},596) scale(${0.62 + i * 0.1})`}>
      <path d="M-104 -36 L104 -36 L72 0 L-72 0 Z" fill="#6e5136" stroke={INK} strokeWidth={3.4}/>
      <line x1={0} y1={-36} x2={0} y2={-196} stroke={INK} strokeWidth={5}/>
      <path d="M-48 -186 L48 -186 L40 -106 L-40 -106 Z" fill="#f2ead8" stroke={INK} strokeWidth={3}/>
      <path d="M0 -196 L38 -184 L0 -172 Z" fill="#e07b2a"/>
    </g>)}
    <path d="M240 640 Q330 630 420 640 M900 664 Q1000 654 1100 664" stroke="#cfe9ff" strokeWidth={4} fill="none" opacity={0.5}/>
  </g>;
};
export const isNetherlandsBg = (k: string): k is NetherlandsBgKind => ['amsterdam_nl', 'statia_nl'].includes(k);
export const NETHERLANDS_GROUND: Partial<Record<NetherlandsBgKind, string>> = {
  amsterdam_nl: '#8f8578', statia_nl: '#c9b083',
};
