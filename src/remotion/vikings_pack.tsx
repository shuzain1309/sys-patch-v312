import React from 'react';
import {INK} from './world';
import type {PropT} from './world';

// ── VIKINGS PACK (2026-11-24) ────────────────────────────────────────────────
// Signature device: THE STRIPED SAIL (sail_vk) — one longship sail whose face
// changes with the age: raid → settle → crown → west → east → norman → cross
// → last. Plus a runestone and a plain iron helm (the myth-bust beat), and
// four place-faithful northern backdrops.

const SailFace: React.FC<{t?: string}> = ({t}) => {
  const stripes = ['#a03a2e', '#f2ead8', '#a03a2e', '#f2ead8', '#a03a2e', '#f2ead8', '#a03a2e'];
  if (t === 'norman') {
    // A Norman shield-sail: red field, two gold leopards (stylised).
    return <g>
      <rect x={-130} y={-240} width={260} height={250} fill="#a03a2e" stroke={INK} strokeWidth={5}/>
      {[40, 130].map(y => <g key={y}>
        <ellipse cx={-10} cy={-240 + y} rx={52} ry={20} fill="#e8b64c" stroke={INK} strokeWidth={3}/>
        <circle cx={48} cy={-248 + y} r={15} fill="#e8b64c" stroke={INK} strokeWidth={3}/>
        <path d={`M-58 ${-228 + y} L-78 ${-212 + y} L-56 ${-214 + y}`} fill="#e8b64c" stroke={INK} strokeWidth={2.4}/>
      </g>)}
    </g>;
  }
  if (t === 'cross') {
    return <g>
      <rect x={-130} y={-240} width={260} height={250} fill="#f2ead8" stroke={INK} strokeWidth={5}/>
      <rect x={-26} y={-240} width={52} height={250} fill="#a03a2e"/>
      <rect x={-130} y={-148} width={260} height={52} fill="#a03a2e"/>
    </g>;
  }
  if (t === 'last') {
    return <g>
      <path d="M-130 -240 L130 -240 L130 10 L88 -18 L46 6 L4 -22 L-38 4 L-80 -20 L-130 2 Z" fill="#8d9299" stroke={INK} strokeWidth={5}/>
      {[-92, -30, 32, 94].map(x => <line key={x} x1={x} y1={-240} x2={x} y2={-16} stroke="#6d7278" strokeWidth={16} opacity={0.55}/>)}
      <path d="M-40 -180 L30 -90 M30 -180 L-40 -90" stroke="#5d6165" strokeWidth={6}/>
    </g>;
  }
  return <g>
    {stripes.map((c, i) => <rect key={i} x={-130 + i * 37.2} y={-240} width={37.2} height={250} fill={c}/>)}
    <rect x={-130} y={-240} width={260} height={250} fill="none" stroke={INK} strokeWidth={5}/>
    {t === 'raid' && <g>
      {/* the dragon head rides above the sail */}
      <path d="M-14 -240 L-8 -292 L14 -306 L10 -282 L34 -296 L22 -268 L40 -262 L16 -248 L10 -240 Z" fill="#5d4630" stroke={INK} strokeWidth={3}/>
      <circle cx={8} cy={-282} r={3.4} fill="#e8b64c"/>
    </g>}
    {(t === 'settle' || !t) && t === 'settle' && <path d="M0 -240 L96 -222 L0 -204 Z" fill="#3f7d4e" stroke={INK} strokeWidth={3}/>}
    {t === 'crown' && <g>
      <path d="M-52 -128 L-52 -168 L-26 -146 L0 -176 L26 -146 L52 -168 L52 -128 Z" fill="#e8b64c" stroke={INK} strokeWidth={4}/>
      <rect x={-52} y={-128} width={104} height={12} fill="#e8b64c" stroke={INK} strokeWidth={3}/>
    </g>}
    {t === 'west' && <g>
      <path d="M-130 -240 L130 -240 L130 -214 L-130 -214 Z" fill="#cfe3ee"/>
      {[-70, 0, 70].map(x => <path key={x} d={`M${x - 18} -120 Q${x} -140 ${x + 18} -120 M${x - 18} -120 L${x - 26} -108 M${x + 18} -120 L${x + 26} -108`} stroke={INK} strokeWidth={4} fill="none"/>)}
    </g>}
    {t === 'east' && <g>
      <circle cx={-44} cy={-118} r={30} fill="#e8b64c" stroke={INK} strokeWidth={4}/>
      <circle cx={-44} cy={-118} r={19} fill="none" stroke={INK} strokeWidth={2.6}/>
      <rect x={16} y={-146} width={58} height={52} rx={8} fill="#8a6a42" stroke={INK} strokeWidth={4}/>
      <path d="M16 -128 L74 -128 M45 -146 L45 -94" stroke={INK} strokeWidth={3}/>
    </g>}
  </g>;
};

export const VikingsProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p}) => {
  if (p.k === 'sail_vk') {
    return <g>
      <rect x={-7} y={-330} width={14} height={340} fill="#5d4630" stroke={INK} strokeWidth={2.4}/>
      <rect x={-140} y={-252} width={280} height={12} fill="#5d4630" stroke={INK} strokeWidth={2.4}/>
      <SailFace t={p.t}/>
      <path d="M-140 -246 L-196 6 M140 -246 L196 6" stroke={INK} strokeWidth={3.4}/>
    </g>;
  }
  if (p.k === 'runestone_vk') {
    return <g>
      <path d="M-52 0 L-52 -196 Q-52 -248 0 -248 Q52 -248 52 -196 L52 0 Z" fill="#9aa0a6" stroke={INK} strokeWidth={5}/>
      <path d="M-34 -216 Q0 -236 34 -216 L34 -30 Q0 -14 -34 -30 Z" fill="none" stroke="#a03a2e" strokeWidth={6} opacity={0.75}/>
      {[-180, -148, -116, -84].map(y => <g key={y} stroke={INK} strokeWidth={4.4}>
        <line x1={-18} y1={y} x2={-18} y2={y + 20}/><line x1={-18} y1={y + 4} x2={-4} y2={y - 4}/>
        <line x1={8} y1={y} x2={8} y2={y + 20}/><line x1={8} y1={y + 16} x2={22} y2={y + 24}/>
      </g>)}
      <ellipse cx={0} cy={2} rx={66} ry={9} fill="#6d7278"/>
    </g>;
  }
  // helm_vk — a plain conical iron helmet on a stand: no horns, ever.
  return <g>
    <rect x={-6} y={-58} width={12} height={58} fill="#5d4630"/>
    <path d="M-64 -58 Q-64 -128 0 -132 Q64 -128 64 -58 L46 -58 Q46 -104 0 -106 Q-46 -104 -46 -58 Z" fill="#b9bec4" stroke={INK} strokeWidth={4.4}/>
    <rect x={-9} y={-104} width={18} height={52} fill="#9aa0a6" stroke={INK} strokeWidth={3}/>
    <rect x={-64} y={-62} width={128} height={9} fill="#8d9299" stroke={INK} strokeWidth={2.6}/>
  </g>;
};
export const VIKINGS_PROPS = ['sail_vk', 'runestone_vk', 'helm_vk'];
export const isVikingsProp = (k: string) => VIKINGS_PROPS.includes(k);

// ── BACKDROPS ────────────────────────────────────────────────────────────────
export type VikingsBgKind = 'fjord_vk' | 'lindisfarne_vk' | 'port_vk' | 'longhouse_vk';
export const VikingsBg: React.FC<{bg: VikingsBgKind; f: number; cx: number; seed: string}> = ({bg: kind}) => {
  if (kind === 'fjord_vk') {
    // A Norwegian fjord: steep pine-dark cliffs, snow peaks behind, and the
    // narrow grey water running out between them.
    return <g>
      <path d="M-40 470 L300 210 L560 380 L820 190 L1120 390 L1420 220 L1960 460 L1960 700 L-40 700 Z" fill="#7d8ea0"/>
      {[[420, 268], [880, 252], [1470, 282]].map(([x, y], i) => <path key={i} d={`M${x - 52} ${y} L${x} ${y - 58} L${x + 52} ${y} L${x + 18} ${y - 20} L${x} ${y - 34} L${x - 18} ${y - 20} Z`} fill="#eef3f6"/>)}
      <path d="M-40 700 L-40 380 L520 470 L700 700 Z" fill="#3d5c43"/>
      <path d="M1960 700 L1960 380 L1400 470 L1220 700 Z" fill="#35523c"/>
      {[120, 260, 1580, 1720].map(x => <g key={x}><path d={`M${x} 520 L${x + 20} 420 L${x + 40} 520 Z`} fill="#274435"/><rect x={x + 16} y={514} width={9} height={30} fill="#3a2c1c"/></g>)}
      <path d="M700 700 L820 500 L1100 500 L1220 700 Z" fill="#5d7f92"/>
      <path d="M790 700 L880 520 L1010 520 L1060 700 Z" fill="#7d9cae" opacity={0.65}/>
    </g>;
  }
  if (kind === 'lindisfarne_vk') {
    // Lindisfarne: a low tidal island — the little stone monastery with its
    // church and cross, the sand causeway, and flat northern sea all round.
    return <g>
      <rect x={-40} y={520} width={2000} height={180} fill="#5d7f92"/>
      <path d="M-40 560 Q480 536 960 556 Q1440 576 1960 552 L1960 700 L-40 700 Z" fill="#7d9cae" opacity={0.7}/>
      <path d="M240 560 Q960 500 1680 560 L1720 640 L200 640 Z" fill="#c2b28a"/>
      <path d="M300 636 Q960 600 1620 636" stroke="#a89468" strokeWidth={10} fill="none" opacity={0.7}/>
      <g>
        <rect x={760} y={392} width={300} height={128} fill="#a89a80" stroke={INK} strokeWidth={3.4}/>
        <path d="M742 392 L910 322 L1078 392 Z" fill="#6e5a44"/>
        <rect x={1030} y={330} width={64} height={190} fill="#9a8a70" stroke={INK} strokeWidth={3.4}/>
        <path d="M1022 330 L1062 292 L1102 330 Z" fill="#6e5a44"/>
        <rect x={1052} y={356} width={20} height={34} fill="#3a3f47"/>
        <rect x={872} y={446} width={52} height={74} fill="#4a3a28"/>
        {[806, 962].map(x => <rect key={x} x={x} y={424} width={26} height={44} fill="#f7e3a1" stroke={INK} strokeWidth={2} opacity={0.9}/>)}
        <g stroke="#e8b64c" strokeWidth={7}><line x1={910} y1={322} x2={910} y2={282}/><line x1={894} y1={300} x2={926} y2={300}/></g>
      </g>
      <g><rect x={560} y={452} width={120} height={68} fill="#a89a80" stroke={INK} strokeWidth={3}/><path d="M548 452 L620 414 L692 452 Z" fill="#6e5a44"/></g>
      <path d="M120 610 Q240 598 360 610 M1560 622 Q1680 610 1800 622" stroke="#eef3f6" strokeWidth={4} fill="none" opacity={0.6}/>
    </g>;
  }
  if (kind === 'port_vk') {
    // A Norse trading port: turf-roofed warehouses on a wooden jetty, bales
    // and barrels stacked for the ships, masts rocking behind.
    return <g>
      <rect x={-40} y={540} width={2000} height={160} fill="#5d7f92"/>
      <path d="M-40 700 L-40 470 L420 400 L900 452 L1400 396 L1960 460 L1960 700 L-40 700 Z" fill="#4c6a3f"/>
      {[330, 700, 1180, 1560].map(x => <g key={x} opacity={0.85}><line x1={x} y1={560} x2={x} y2={330} stroke="#5d4630" strokeWidth={8}/><path d={`M${x} 330 L${x + 74} 348 L${x} 366 Z`} fill="#a03a2e" opacity={0.8}/></g>)}
      <g><rect x={120} y={420} width={330} height={150} fill="#8a6a42" stroke={INK} strokeWidth={3.4}/>
        <path d="M100 420 L285 356 L470 420 Z" fill="#5d7a4a"/><rect x={258} y={478} width={58} height={92} fill="#4a3421"/>
        <rect x={156} y={452} width={52} height={40} fill="#f7e3a1" stroke={INK} strokeWidth={2} opacity={0.85}/></g>
      <g><rect x={1420} y={412} width={360} height={158} fill="#96703f" stroke={INK} strokeWidth={3.4}/>
        <path d="M1398 412 L1600 344 L1802 412 Z" fill="#5d7a4a"/><rect x={1570} y={474} width={62} height={96} fill="#4a3421"/></g>
      <rect x={-40} y={586} width={2000} height={26} fill="#6e5136"/>
      {Array.from({length: 13}, (_, i) => 30 + i * 155).map(x => <line key={x} x1={x} y1={586} x2={x} y2={700} stroke="#5d4630" strokeWidth={9}/>)}
      {[560, 620, 1240].map(x => <g key={x}><rect x={x} y={520} width={52} height={66} rx={10} fill="#8a6a42" stroke={INK} strokeWidth={3}/><path d={`M${x} 538 L${x + 52} 538 M${x} 566 L${x + 52} 566`} stroke={INK} strokeWidth={2.6}/></g>)}
      {[880, 950].map(x => <rect key={x} x={x} y={528} width={62} height={58} fill="#a8894f" stroke={INK} strokeWidth={3}/>)}
    </g>;
  }
  // longhouse_vk — a Norse settlement: the great longhouse with its curved
  // roof and smoke, smaller houses, a palisade, and fenced fields.
  return <g>
    <path d="M-40 700 L-40 440 L460 360 L980 430 L1500 356 L1960 430 L1960 700 L-40 700 Z" fill="#5d7a4a"/>
    <path d="M-40 560 L620 520 L640 700 L-40 700 Z" fill="#7d9a52"/>
    <path d="M1300 540 L1960 500 L1960 700 L1280 700 Z" fill="#c9a85e"/>
    {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M${1330 + i * 106} 700 L${1360 + i * 106} 520`} stroke="#a8894f" strokeWidth={7}/>)}
    <g>
      <path d="M520 570 L520 430 Q960 372 1400 430 L1400 570 Z" fill="#7a5c38" stroke={INK} strokeWidth={3.6}/>
      <path d="M496 436 Q960 356 1424 436 L1424 462 Q960 388 496 462 Z" fill="#4e4234"/>
      <path d="M560 430 L560 372 M1360 430 L1360 372" stroke="#5d4630" strokeWidth={10}/>
      <path d="M536 372 Q560 344 584 372 M1336 372 Q1360 344 1384 372" stroke="#5d4630" strokeWidth={9} fill="none"/>
      <rect x={922} y={470} width={76} height={100} fill="#3a2a1a"/>
      <rect x={640} y={486} width={40} height={52} fill="#f7e3a1" stroke={INK} strokeWidth={2} opacity={0.9}/>
      <rect x={1240} y={486} width={40} height={52} fill="#f7e3a1" stroke={INK} strokeWidth={2} opacity={0.9}/>
      <path d="M950 372 Q930 320 962 282 Q994 320 974 372" fill="#cfd6da" opacity={0.55}/>
      <path d="M990 360 Q976 322 998 292" fill="none" stroke="#cfd6da" strokeWidth={10} opacity={0.4}/>
    </g>
    <g><rect x={180} y={486} width={190} height={86} fill="#8a6a42" stroke={INK} strokeWidth={3}/><path d="M164 486 L275 436 L386 486 Z" fill="#5d7a4a"/></g>
    <g>{Array.from({length: 12}, (_, i) => 1560 + i * 32).map(x => <path key={x} d={`M${x} 560 L${x + 7} 486 L${x + 14} 560 Z`} fill="#8a6a42" stroke={INK} strokeWidth={1.4}/>)}</g>
  </g>;
};
export const isVikingsBg = (k: string): k is VikingsBgKind => ['fjord_vk', 'lindisfarne_vk', 'port_vk', 'longhouse_vk'].includes(k);
export const VIKINGS_GROUND: Partial<Record<VikingsBgKind, string>> = {
  fjord_vk: '#46626e', lindisfarne_vk: '#8a9a7d', port_vk: '#6e5136', longhouse_vk: '#68854e',
};
