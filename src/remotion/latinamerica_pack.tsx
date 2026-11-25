import React from 'react';
import {INK} from './world';
import type {PropT} from './world';

// ── LATIN AMERICA PACK (2026-11-25) ──────────────────────────────────────────
// Signature device: THE CRACKED MAP (map_la) — a carved table-map of South
// America whose cracks spread with the story: whole → seam → cracks → union
// → shatter → pieces. Brazil's eastern bulge is drawn as its own overlay and
// NEVER cracks, in any state — the exception that proves the rule. Plus the
// royal seal of Madrid (seal_la), an independence banner whose cloth changes
// with the cause (banner_la), and four place-faithful backdrops.

const SA_OUTLINE = "M-100 -415 L-50 -442 L15 -438 L75 -412 L125 -378 L148 -325 L158 -282 L128 -212 L104 -148 L78 -92 L52 -38 L18 -12 L-8 0 L-30 -30 L-38 -90 L-42 -150 L-40 -215 L-48 -285 L-60 -345 L-80 -390 Z";
const MESO = "M-152 -436 L-98 -432 L-100 -415 L-128 -398 L-150 -408 Z";
const BRAZIL = "M15 -438 L75 -412 L125 -378 L148 -325 L158 -282 L128 -212 L104 -148 L78 -92 L52 -38 L34 -64 L16 -140 L6 -228 L8 -322 L12 -392 Z";
const SEAM = "M-52 -404 L-46 -318 L-53 -232 L-47 -148 L-41 -64 L-34 -16";
const CRACKS = [
  "M-49 -330 L34 -322 L84 -330",
  "M-51 -238 L52 -246 L96 -228",
  "M-45 -152 L28 -142 L64 -158",
  "M-96 -408 L-52 -366 L-14 -372",
  "M-40 -64 L16 -52 L40 -70",
];
const SHATTER_EXTRA = [
  "M-48 -282 L-6 -262 L38 -276",
  "M-50 -196 L-2 -182 L44 -196",
  "M-44 -104 L2 -92 L30 -108",
  "M-70 -380 L-30 -352",
  "M20 -400 L58 -368 L96 -372",
];

const MapFace: React.FC<{t?: string}> = ({t}) => {
  const state = t ?? 'whole';
  const baseFill = state === 'shatter' || state === 'pieces' ? '#b3a284' : '#c9a85e';
  return <g>
    <path d={MESO} fill={baseFill} stroke={INK} strokeWidth={4}/>
    <path d={SA_OUTLINE} fill={baseFill} stroke={INK} strokeWidth={5}/>
    {/* Brazil: its own overlay, green, and never a crack across it */}
    <path d={BRAZIL} fill="#4c7a4f" stroke={INK} strokeWidth={3.4} opacity={state === 'whole' ? 0.35 : 0.85}/>
    {state === 'whole' && <g stroke="#8a6d2f" strokeWidth={2.4} opacity={0.6}>
      <line x1={-70} y1={-360} x2={110} y2={-360}/><line x1={-58} y1={-270} x2={132} y2={-270}/>
      <line x1={-50} y1={-180} x2={100} y2={-180}/><line x1={-44} y1={-90} x2={66} y2={-90}/>
    </g>}
    {(state === 'seam' || state === 'cracks' || state === 'union' || state === 'shatter' || state === 'pieces') &&
      <path d={SEAM} fill="none" stroke={state === 'union' ? '#e8b64c' : '#3a2c1c'} strokeWidth={state === 'pieces' ? 9 : 5}/>}
    {state === 'union' && <g>
      <path d="M-100 -415 L-50 -442 L15 -438 L75 -412 L96 -388 L40 -352 L-14 -372 L-52 -366 L-84 -392 Z" fill="#2b6cb0" stroke={INK} strokeWidth={3.4} opacity={0.9}/>
      {[-392, -348, -304, -260].map(y => <line key={y} x1={-62} y1={y} x2={-36} y2={y - 12} stroke="#e8b64c" strokeWidth={5}/>)}
    </g>}
    {(state === 'cracks' || state === 'shatter' || state === 'pieces') && <g fill="none" stroke="#3a2c1c" strokeWidth={state === 'pieces' ? 8 : 4.4}>
      {CRACKS.map((d, i) => <path key={i} d={d}/>)}
    </g>}
    {(state === 'shatter' || state === 'pieces') && <g fill="none" stroke="#3a2c1c" strokeWidth={state === 'pieces' ? 8 : 4}>
      {SHATTER_EXTRA.map((d, i) => <path key={i} d={d}/>)}
    </g>}
  </g>;
};

export const LatinAmericaProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p}) => {
  if (p.k === 'map_la') {
    return <g>
      <rect x={-268} y={0} width={536} height={26} fill="#6e5136" stroke={INK} strokeWidth={3.4}/>
      <rect x={-268} y={26} width={536} height={10} fill="#54382a"/>
      <g transform="translate(0,6) scale(0.92)"><MapFace t={p.t}/></g>
    </g>;
  }
  if (p.k === 'seal_la') {
    // A royal decree: parchment sheet, ruled lines, and the great red wax
    // seal of the Council of the Indies on its ribbons.
    return <g>
      <rect x={-96} y={-216} width={192} height={216} fill="#e8dcc0" stroke={INK} strokeWidth={3.6}/>
      {[-186, -162, -138, -114].map(y => <line key={y} x1={-72} y1={y} x2={72} y2={y} stroke="#8a7a5a" strokeWidth={4}/>)}
      <line x1={-72} y1={-90} x2={30} y2={-90} stroke="#8a7a5a" strokeWidth={4}/>
      <path d="M-14 -66 L-30 -18 L-6 -30 L10 -66 Z" fill="#c9962e"/>
      <path d="M14 -66 L30 -18 L6 -30 L-10 -66 Z" fill="#a03a2e"/>
      <circle cx={0} cy={-72} r={40} fill="#a03a2e" stroke={INK} strokeWidth={3.6}/>
      <path d="M-16 -86 L-16 -96 L-5 -86 L0 -98 L5 -86 L16 -96 L16 -86 Z" fill="#e8b64c"/>
      <rect x={-16} y={-82} width={32} height={7} fill="#e8b64c"/>
      <circle cx={0} cy={-62} r={5} fill="#e8b64c"/>
    </g>;
  }
  // banner_la — a tall independence banner; the cloth carries the cause.
  const cloth = p.t ?? 'tricolour';
  return <g>
    <rect x={-6} y={-330} width={11} height={330} fill="#5d4630" stroke={INK} strokeWidth={2.2}/>
    <circle cx={0} cy={-338} r={9} fill="#e8b64c" stroke={INK} strokeWidth={2.4}/>
    <rect x={4} y={-322} width={172} height={118} fill="#f2ead8" stroke={INK} strokeWidth={3.6}/>
    {cloth === 'royal' && <g>
      <rect x={4} y={-322} width={172} height={59} fill="#a03a2e"/>
      <rect x={4} y={-263} width={172} height={59} fill="#c9962e"/>
      <rect x={66} y={-292} width={48} height={40} fill="#f2ead8" stroke={INK} strokeWidth={2.6}/>
      <path d="M76 -282 L76 -292 L82 -292 L82 -286 L88 -286 L88 -292 L94 -292 L94 -286 L100 -286 L100 -292 L104 -292 L104 -282 Z" fill="#a03a2e"/>
    </g>}
    {cloth === 'tricolour' && <g>
      <rect x={4} y={-322} width={172} height={40} fill="#e8b64c"/>
      <rect x={4} y={-282} width={172} height={39} fill="#2b6cb0"/>
      <rect x={4} y={-243} width={172} height={39} fill="#a03a2e"/>
      <circle cx={90} cy={-262} r={11} fill="#f2ead8" stroke={INK} strokeWidth={2.2}/>
    </g>}
    {cloth === 'green' && <g>
      <rect x={4} y={-322} width={172} height={118} fill="#3f7d4e"/>
      <path d="M90 -310 L164 -263 L90 -216 L16 -263 Z" fill="#e8b64c"/>
      <circle cx={90} cy={-263} r={21} fill="#2b4a6e"/>
    </g>}
    {cloth === 'white' && <g>
      <rect x={4} y={-322} width={172} height={118} fill="#e8e2d2"/>
      <path d="M4 -322 L176 -204 M176 -322 L4 -204" stroke="#b9b0a0" strokeWidth={5}/>
    </g>}
  </g>;
};
export const LATINAMERICA_PROPS = ['map_la', 'seal_la', 'banner_la'];
export const isLatinAmericaProp = (k: string) => LATINAMERICA_PROPS.includes(k);

// ── BACKDROPS ────────────────────────────────────────────────────────────────
export type LatinAmericaBgKind = 'andes_la' | 'plaza_la' | 'rio_la' | 'pampas_la';
export const LatinAmericaBg: React.FC<{bg: LatinAmericaBgKind; f: number; cx: number; seed: string}> = ({bg: kind}) => {
  if (kind === 'andes_la') {
    // A high Andean pass: snow peaks walling both sides, the mule track
    // zigzagging down through the saddle the armies crossed.
    return <g>
      <path d="M-40 700 L-40 300 L240 120 L520 330 L700 240 L820 420 L900 300 L1180 130 L1500 320 L1760 180 L1960 340 L1960 700 Z" fill="#7d8ea0"/>
      {[[240, 120], [1180, 130], [1760, 180]].map(([x, y], i) => <path key={i} d={`M${x - 120} ${y + 66} L${x} ${y} L${x + 120} ${y + 66} L${x + 44} ${y + 30} L${x} ${y + 52} L${x - 44} ${y + 30} Z`} fill="#eef3f6"/>)}
      <path d="M-40 700 L-40 470 L560 420 L860 560 L1100 430 L1960 480 L1960 700 Z" fill="#8a7a5f"/>
      <path d="M560 700 L760 520 L700 500 L880 430 L820 408 L1010 350" fill="none" stroke="#d8c49a" strokeWidth={13}/>
      <path d="M300 640 L330 580 L360 640 Z M1560 620 L1590 566 L1620 620 Z" fill="#6e5f49"/>
    </g>;
  }
  if (kind === 'plaza_la') {
    // A colonial plaza mayor: twin-towered cathedral on the left, the
    // arcaded government palace on the right, fountain at the centre.
    return <g>
      <path d="M-40 700 L-40 470 L1960 470 L1960 700 Z" fill="#b09a72"/>
      <path d="M-40 500 L1960 500" stroke="#967d55" strokeWidth={6}/>
      <g>
        <rect x={90} y={300} width={380} height={200} fill="#d9cdb2" stroke={INK} strokeWidth={3.4}/>
        <rect x={110} y={180} width={74} height={320} fill="#cfc0a0" stroke={INK} strokeWidth={3.4}/>
        <rect x={376} y={180} width={74} height={320} fill="#cfc0a0" stroke={INK} strokeWidth={3.4}/>
        <path d="M102 180 L147 128 L192 180 Z M368 180 L413 128 L458 180 Z" fill="#8a4a3a"/>
        <circle cx={147} cy={238} r={17} fill="#3a3f47"/><circle cx={413} cy={238} r={17} fill="#3a3f47"/>
        <path d="M226 300 L280 232 L334 300 Z" fill="#8a4a3a"/>
        <rect x={252} y={392} width={56} height={108} fill="#4a3421"/>
        <rect x={266} y={330} width={28} height={40} fill="#f7e3a1" stroke={INK} strokeWidth={2}/>
        <g stroke="#e8b64c" strokeWidth={6}><line x1={280} y1={232} x2={280} y2={198}/><line x1={267} y1={212} x2={293} y2={212}/></g>
      </g>
      <g>
        <rect x={1420} y={316} width={450} height={184} fill="#cbb894" stroke={INK} strokeWidth={3.4}/>
        <path d="M1404 316 L1645 262 L1886 316 Z" fill="#8a4a3a"/>
        {[1466, 1566, 1666, 1766].map(x => <g key={x}>
          <path d={`M${x} 500 L${x} 416 Q${x + 26} 388 ${x + 52} 416 L${x + 52} 500 Z`} fill="#6e5a44"/>
        </g>)}
        {[1466, 1566, 1666, 1766].map(x => <rect key={x} x={x + 8} y={336} width={36} height={44} fill="#f7e3a1" stroke={INK} strokeWidth={2} opacity={0.9}/>)}
      </g>
      <g>
        <path d="M880 500 L880 452 L1040 452 L1040 500 Z" fill="#9a8a70" stroke={INK} strokeWidth={3}/>
        <rect x={944} y={404} width={32} height={52} fill="#9a8a70" stroke={INK} strokeWidth={3}/>
        <path d="M960 404 Q930 372 960 348 Q990 372 960 404" fill="#7d9cae" opacity={0.8}/>
        <ellipse cx={960} cy={502} rx={130} ry={10} fill="#7d9cae" opacity={0.55}/>
      </g>
    </g>;
  }
  if (kind === 'rio_la') {
    // Rio de Janeiro: the harbour, the Sugarloaf cone standing in the bay,
    // the long ridge behind, white colonial blocks along the shore.
    return <g>
      <path d="M-40 470 L300 380 L620 430 L900 340 L1300 420 L1640 360 L1960 430 L1960 540 L-40 540 Z" fill="#4c6a52"/>
      <path d="M1330 470 L1420 218 L1510 470 Z" fill="#5d7263"/>
      <path d="M1396 268 L1420 218 L1444 268 L1432 250 L1420 262 L1408 250 Z" fill="#e8e4da"/>
      <rect x={-40} y={520} width={2000} height={180} fill="#4a7a96"/>
      <path d="M-40 560 Q480 544 960 558 Q1440 572 1960 552 L1960 700 L-40 700 Z" fill="#5d8ca8" opacity={0.7}/>
      <g>
        {[140, 300, 460].map(x => <g key={x}><rect x={x} y={452} width={120} height={70} fill="#e3dbc6" stroke={INK} strokeWidth={3}/><path d={`M${x - 8} 452 L${x + 60} 418 L${x + 128} 452 Z`} fill="#8a4a3a"/></g>)}
        <g><rect x={700} y={438} width={90} height={84} fill="#d9cdb2" stroke={INK} strokeWidth={3}/><path d="M692 438 L745 396 L798 438 Z" fill="#8a4a3a"/><rect x={733} y={466} width={24} height={56} fill="#4a3421"/></g>
      </g>
      <path d="M1080 610 Q1140 598 1200 610 M240 640 Q320 628 400 640" stroke="#eef3f6" strokeWidth={4} fill="none" opacity={0.6}/>
    </g>;
  }
  // pampas_la — the flat grass ocean of the south: one ombu tree, a fence
  // line running to the horizon, cattle grazing, an estancia far off.
  return <g>
    <path d="M-40 700 L-40 500 L1960 500 L1960 700 Z" fill="#7fae56"/>
    <path d="M-40 500 L1960 500" stroke="#679647" strokeWidth={5}/>
    {[0, 1, 2, 3, 4, 5, 6].map(i => <path key={i} d={`M${120 + i * 300} 700 L${300 + i * 260} 512`} stroke="#8fbf66" strokeWidth={6}/>)}
    <g>
      <path d="M1330 512 Q1300 400 1420 372 Q1560 340 1620 420 Q1660 474 1600 512 Q1470 486 1330 512 Z" fill="#3d6b35"/>
      <rect x={1470} y={470} width={26} height={66} fill="#5d4630"/>
      <path d="M1483 470 Q1440 420 1400 428 M1483 462 Q1530 408 1580 420" stroke="#5d4630" strokeWidth={11} fill="none"/>
    </g>
    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <line key={i} x1={60 + i * 130} y1={540} x2={60 + i * 130} y2={586} stroke="#5d4630" strokeWidth={6}/>)}
    <line x1={40} y1={556} x2={1080} y2={556} stroke="#5d4630" strokeWidth={4}/>
    {[300, 560, 860].map(x => <g key={x} fill="#4a3a2c">
      <ellipse cx={x} cy={606} rx={42} ry={24}/><circle cx={x + 46} cy={592} r={14}/>
      <path d={`M${x + 52} 580 L${x + 58} 570 M${x + 40} 580 L${x + 34} 570`} stroke="#4a3a2c" strokeWidth={4}/>
      <rect x={x - 30} y={622} width={9} height={26}/><rect x={x + 22} y={622} width={9} height={26}/>
    </g>)}
    <g><rect x={156} y={470} width={150} height={52} fill="#d9cdb2" stroke={INK} strokeWidth={3}/><path d="M148 470 L231 440 L314 470 Z" fill="#8a4a3a"/></g>
  </g>;
};
export const isLatinAmericaBg = (k: string): k is LatinAmericaBgKind => ['andes_la', 'plaza_la', 'rio_la', 'pampas_la'].includes(k);
export const LATINAMERICA_GROUND: Partial<Record<LatinAmericaBgKind, string>> = {
  andes_la: '#8a7a5f', plaza_la: '#b09a72', rio_la: '#7d9cae', pampas_la: '#7fae56',
};
