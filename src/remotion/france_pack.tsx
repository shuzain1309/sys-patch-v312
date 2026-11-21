// france_pack.tsx — FRANCE PACK (2026-11-21, French Revolution video)
// Place-faithful Paris / Versailles backdrops + the COCKADE device (the video's
// signature prop: one rosette, six era states), the Declaration, the assignat,
// the metre bar and the revolutionary calendar board.
// Additive pack: nothing in world.tsx changes except the import, the PropArt
// dispatch, the Backdrop dispatch and the GROUND spread.
import React from 'react';
import {INK} from './world';
import type {PropT} from './world';

// ── DEVICE: THE COCKADE ─────────────────────────────────────────────────────
// Before July 1789 Paris wore the white cockade of the Bourbon kings. Lafayette
// folded the city's blue and red around the royal white and made the tricolour.
// t states: white (Bourbon) → joined (the tricolour) → cap (the cockade pinned
// to a Phrygian liberty cap) → torn (Varennes: the union ripped) → list (the
// cockade pinned to a suspects' list) → crown (an emperor's gold over it).
export const FranceProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p}) => {
  const t = p.t ?? 'joined';
  if (p.k === 'cockade_fr') {
    const ring = (r: number, fill: string, key: string) => <circle key={key} cx={0} cy={0} r={r} fill={fill} stroke="#3a2c18" strokeWidth={3}/>;
    return <g>
      {t === 'white' && <g>{ring(46, '#f2ead8', 'a')}{ring(30, '#efe6d0', 'b')}{ring(14, '#e8dcbc', 'c')}
        {[0, 60, 120, 180, 240, 300].map(a => <circle key={a} cx={22 * Math.cos(a * Math.PI / 180)} cy={22 * Math.sin(a * Math.PI / 180)} r={3.4} fill="#c9a227"/>)}</g>}
      {t === 'joined' && <g>{ring(46, '#b03030', 'a')}{ring(31, '#f2ead8', 'b')}{ring(16, '#2456a6', 'c')}</g>}
      {t === 'cap' && <g>
        <path d="M-40 -18 Q0 -78 44 -30 Q50 -58 26 -64 Q58 -44 46 -14 Q44 6 30 12 L-34 12 Q-44 0 -40 -18 Z" fill="#b03030" stroke="#5e1a12" strokeWidth={3}/>
        <g transform="translate(0 26)">{ring(30, '#b03030', 'a')}{ring(20, '#f2ead8', 'b')}{ring(10, '#2456a6', 'c')}</g></g>}
      {t === 'torn' && <g>
        <path d="M0 -46 A46 46 0 0 1 8 44 L-2 10 L4 -8 L-4 -30 Z" fill="#b03030" stroke="#3a2c18" strokeWidth={3}/>
        <path d="M0 -46 A46 46 0 0 0 -8 44 L2 8 L-4 -12 L3 -32 Z" fill="#f2ead8" stroke="#3a2c18" strokeWidth={3}/>
        <circle cx={0} cy={-2} r={15} fill="#2456a6" stroke="#3a2c18" strokeWidth={3}/>
        <path d="M-30 52 L30 52" stroke="#3a2c18" strokeWidth={3} strokeDasharray="5 5"/></g>}
      {t === 'list' && <g>
        <rect x={-34} y={-58} width={68} height={96} rx={3} fill="#e9dcba" stroke="#6b5322" strokeWidth={3}/>
        {[-38, -22, -6, 10, 26].map(y => <line key={y} x1={-24} y1={y} x2={24} y2={y} stroke="#8a7648" strokeWidth={3}/>)}
        <g transform="translate(0 -34)">{ring(17, '#b03030', 'a')}{ring(11, '#f2ead8', 'b')}{ring(5.5, '#2456a6', 'c')}</g>
        <circle cx={0} cy={-34} r={3} fill="#3a2c18"/></g>}
      {t === 'crown' && <g>
        {ring(44, '#2456a6', 'a')}{ring(29, '#f2ead8', 'b')}{ring(15, '#b03030', 'c')}
        <path d="M-30 -34 L-22 -56 L-10 -40 L0 -60 L10 -40 L22 -56 L30 -34 Q0 -26 -30 -34 Z" fill="#d9a92c" stroke="#7a5c10" strokeWidth={3}/>
        {[ -22, 0, 22].map(x => <circle key={x} cx={x} cy={-58 + (x === 0 ? -4 : 4)} r={3.6} fill="#7a2e1d"/>)}</g>}
    </g>;
  }
  if (p.k === 'declaration_fr') {
    // The Declaration of the Rights of Man: two stone-tablet parchment panels,
    // a Phrygian cap on a pike above, Roman numerals down the articles.
    return <g>
      <line x1={0} y1={-118} x2={0} y2={-54} stroke="#4a3a22" strokeWidth={5}/>
      <path d="M-13 -118 Q0 -140 15 -122 Q19 -136 8 -140 Q26 -128 18 -112 Q16 -104 8 -102 L-10 -102 Q-15 -110 -13 -118 Z" fill="#b03030" stroke="#5e1a12" strokeWidth={2.6}/>
      <path d="M-64 -48 Q-64 -66 -46 -66 L-6 -66 L-6 62 L-64 62 Z" fill="#e9dcba" stroke="#6b5322" strokeWidth={3}/>
      <path d="M64 -48 Q64 -66 46 -66 L6 -66 L6 62 L64 62 Z" fill="#e9dcba" stroke="#6b5322" strokeWidth={3}/>
      {[-44, -28, -12, 4, 20, 36].map(y => <g key={y}><line x1={-52} y1={y} x2={-18} y2={y} stroke="#8a7648" strokeWidth={3}/><line x1={52} y1={y} x2={18} y2={y} stroke="#8a7648" strokeWidth={3}/></g>)}
      <circle cx={0} cy={-30} r={9} fill="none" stroke="#c9a227" strokeWidth={3}/>
      <path d="M0 -78 L10 -58 L-10 -58 Z" fill="none" stroke="#c9a227" strokeWidth={2.6}/>
    </g>;
  }
  if (p.k === 'assignat_fr') {
    // A paper assignat: royal portrait oval (early issues), denomination panel,
    // red seal — drawn generic, no readable text (narration carries the words).
    return <g>
      <rect x={-56} y={-34} width={112} height={68} rx={4} fill="#ddd6bd" stroke="#5d5642" strokeWidth={3}/>
      <rect x={-48} y={-26} width={96} height={52} rx={3} fill="none" stroke="#8a8266" strokeWidth={2}/>
      <ellipse cx={-26} cy={0} rx={14} ry={18} fill="#cbbfa0" stroke="#5d5642" strokeWidth={2.4}/>
      <path d="M-26 -14 Q-34 -4 -31 8 M-26 -14 Q-18 -4 -21 8" stroke="#5d5642" strokeWidth={2} fill="none"/>
      <rect x={2} y={-16} width={38} height={13} fill="#b9b094"/>
      <rect x={2} y={2} width={38} height={9} fill="#c6bda2"/>
      <circle cx={38} cy={20} r={8} fill="#a03a2e" opacity={0.85}/>
    </g>;
  }
  if (p.k === 'metre_fr') {
    // The standard metre: a brass bar on two trestles, end standards, a plumb
    // line behind for the meridian survey.
    return <g>
      <line x1={0} y1={-92} x2={0} y2={-30} stroke="#6b6f76" strokeWidth={2.4}/>
      <path d="M0 -30 L-6 -16 L6 -16 Z" fill="#6b6f76"/>
      <rect x={-95} y={-14} width={190} height={11} rx={3} fill="#c9a227" stroke="#7a5c10" strokeWidth={3}/>
      <rect x={-95} y={-20} width={9} height={24} fill="#8a6d1c" stroke="#7a5c10" strokeWidth={2}/>
      <rect x={86} y={-20} width={9} height={24} fill="#8a6d1c" stroke="#7a5c10" strokeWidth={2}/>
      <path d="M-70 46 L-52 -3 L-40 46 M70 46 L52 -3 L40 46" stroke="#4a3a22" strokeWidth={6} fill="none"/>
      {[-60, -30, 0, 30, 60].map(x => <line key={x} x1={x} y1={-14} x2={x} y2={-7} stroke="#7a5c10" strokeWidth={2.4}/>)}
    </g>;
  }
  if (p.k === 'calendar_fr') {
    // The revolutionary calendar board: twelve months in four season rows,
    // ten-day weeks — a grid that visually refuses the old seven-day world.
    const cols = ['#7fae5a', '#a8c46a', '#e0c48a', '#d9a05a', '#b0623a'];
    return <g>
      <rect x={-78} y={-58} width={156} height={116} rx={4} fill="#e9dcba" stroke="#6b5322" strokeWidth={3}/>
      {[0, 1, 2, 3].map(r => [0, 1, 2].map(c => <rect key={`${r}-${c}`} x={-68 + c * 46} y={-46 + r * 27} width={38} height={20} fill={cols[(r + c) % cols.length]} opacity={0.75} stroke="#6b5322" strokeWidth={1.6}/>))}
      <line x1={-78} y1={-58} x2={78} y2={-58} stroke="#6b5322" strokeWidth={5}/>
    </g>;
  }
  return null;
};
export const FRANCE_PROPS = ['cockade_fr', 'declaration_fr', 'assignat_fr', 'metre_fr', 'calendar_fr'];
export const isFranceProp = (k: string) => FRANCE_PROPS.includes(k);

// ── BACKDROPS ───────────────────────────────────────────────────────────────
const Win: React.FC<{x: number; y: number; w?: number; h?: number; lit?: string}> = ({x, y, w = 22, h = 34, lit = '#f7e3a1'}) => <rect x={x} y={y} width={w} height={h} fill={lit} stroke="#4a4038" strokeWidth={2}/>;

export type FranceBgKind = 'versailles_fr' | 'mirrors_fr' | 'bastille_fr' | 'tuileries_fr' | 'paris_street_fr' | 'place_revolution_fr' | 'varennes_fr' | 'valmy_fr';
export const FranceBg: React.FC<{bg: FranceBgKind; f: number; cx: number; seed: string}> = ({bg: kind}) => {
  if (kind === 'versailles_fr') {
    // The palace from the gardens: long classical facade, orange trees, the
    // parterre and the Grand Canal running to the horizon.
    return <g>
      <rect x={-40} y={330} width={2000} height={80} fill="#8a6f4d"/>
      <g>{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => <g key={i}>
        <rect x={120 + i * 122} y={238} width={104} height={100} fill="#d9c9a8" stroke="#8a7a58" strokeWidth={2}/>
        <path d={`M${112 + i * 122} 238 L${172 + i * 122} 208 L${232 + i * 122} 238 Z`} fill="#5d6a72"/>
        <Win x={140 + i * 122} y={256} w={16} h={26}/><Win x={172 + i * 122} y={256} w={16} h={26}/><Win x={140 + i * 122} y={292} w={16} h={22}/><Win x={172 + i * 122} y={292} w={16} h={22}/></g>)}
      </g>
      <rect x={830} y={196} width={260} height={142} fill="#e2d2ac" stroke="#8a7a58" strokeWidth={2}/>
      <path d="M810 196 L960 158 L1110 196 Z" fill="#4c5a63"/>
      <circle cx={960} cy={182} r={13} fill="#f7e3a1" stroke="#8a7a58" strokeWidth={2}/>
      <path d="M700 700 L900 348 L1020 348 L1220 700 Z" fill="#3f7d5a" opacity={0.55}/>
      <path d="M880 700 L930 348 L990 348 L1040 700 Z" fill="#7db3d9" opacity={0.8}/>
      {[420, 560, 1360, 1500].map(x => <g key={x}><circle cx={x} cy={520} r={52} fill="#3f7d5a"/><rect x={x - 6} y={540} width={12} height={60} fill="#6b4a2c"/><path d={`M${x - 40} 430 L${x} 380 L${x + 40} 430 L${x + 30} 500 L${x - 30} 500 Z`} fill="#4c8a5f"/></g>)}
      {[300, 640, 1280, 1620].map(x => <g key={x}><path d={`M${x} 640 q6 -26 0 -44 q-6 18 0 44`} fill="#cfe3ee"/><ellipse cx={x} cy={646} rx={26} ry={7} fill="#a8c8dd"/></g>)}
    </g>;
  }
  if (kind === 'mirrors_fr') {
    // The Hall of Mirrors: arched windows to the gardens on one side, the
    // mirror arches answering them, chandeliers, parquet.
    return <g>
      <rect x={-40} y={120} width={2000} height={560} fill="#7a5c38"/>
      {[0, 1, 2, 3, 4].map(i => <g key={i}>
        <path d={`M${90 + i * 180} 620 L${90 + i * 180} 260 Q${165 + i * 180} 190 ${240 + i * 180} 260 L${240 + i * 180} 620 Z`} fill="#bfe0f2" stroke="#c9a227" strokeWidth={5}/>
        <path d={`M${1010 + i * 175} 620 L${1010 + i * 175} 260 Q${1082 + i * 175} 190 ${1155 + i * 175} 260 L${1155 + i * 175} 620 Z`} fill="#5d7d99" stroke="#c9a227" strokeWidth={5} opacity={0.9}/>
        <path d={`M${1040 + i * 175} 560 L${1040 + i * 175} 300 Q${1082 + i * 175} 250 ${1125 + i * 175} 300 L${1125 + i * 175} 560 Z`} fill="#8fb0c9" opacity={0.55}/></g>)}
      {[300, 700, 1100, 1500].map(x => <g key={x}><line x1={x} y1={130} x2={x} y2={196} stroke="#8a6d1c" strokeWidth={4}/>
        <ellipse cx={x} cy={224} rx={52} ry={20} fill="none" stroke="#c9a227" strokeWidth={4}/>
        {[-36, -12, 12, 36].map(dx => <circle key={dx} cx={x + dx} cy={238} r={6} fill="#ffe9a8"/>)}</g>)}
      <path d="M-40 700 L1960 700 L1500 1080 L420 1080 Z" fill="#9a7448"/>
      {[0, 1, 2, 3, 4, 5].map(i => <line key={i} x1={200 + i * 260} y1={700} x2={340 + i * 210} y2={1080} stroke="#7a5c38" strokeWidth={4}/>)}
    </g>;
  }
  if (kind === 'bastille_fr') {
    // The fortress from the street: eight round towers, machicolated tops,
    // the ditch and the drawbridge gate.
    const tower = (x: number, h: number, key: number) => <g key={key}>
      <rect x={x} y={640 - h} width={86} height={h} fill="#8d8578" stroke="#57534a" strokeWidth={3}/>
      <path d={`M${x - 8} ${640 - h} h102 l-10 26 h-82 Z`} fill="#6e685c"/>
      {[0, 1, 2].map(i => <rect key={i} x={x + 12 + i * 26} y={618 - h} width={10} height={18} fill="#57534a"/>)}
      <rect x={x + 34} y={560 - h + 60} width={16} height={30} fill="#3d3a33"/>
      <rect x={x + 34} y={470 - h + 60} width={16} height={30} fill="#3d3a33"/></g>;
    return <g>
      <rect x={-40} y={636} width={2000} height={26} fill="#4c4438"/>
      <rect x={-40} y={662} width={2000} height={60} fill="#3f6d8c"/>
      {tower(180, 300, 1)}{tower(330, 330, 2)}{tower(520, 310, 3)}{tower(760, 345, 4)}{tower(1010, 330, 5)}{tower(1240, 315, 6)}{tower(1430, 335, 7)}{tower(1600, 300, 8)}
      <rect x={240} y={420} width={1420} height={216} fill="#7d7668"/>
      <path d="M880 636 L880 520 Q960 470 1040 520 L1040 636 Z" fill="#2e2a24"/>
      <path d="M860 636 L1060 636 L1010 700 L910 700 Z" fill="#6b4a2c"/>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => <rect key={i} x={300 + i * 160} y={452} width={18} height={30} fill="#3d3a33"/>)}
    </g>;
  }
  if (kind === 'tuileries_fr') {
    // The Tuileries from the garden: the long palace front, the central
    // pavilion, gravel walks and clipped cones of the garden.
    return <g>
      <rect x={-40} y={330} width={2000} height={70} fill="#7a6a52"/>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <g key={i}>
        <rect x={90 + i * 175} y={250} width={150} height={88} fill="#ddd0ae" stroke="#8a7a58" strokeWidth={2}/>
        <path d={`M${82 + i * 175} 250 L${165 + i * 175} 222 L${248 + i * 175} 250 Z`} fill="#54626b"/>
        <Win x={112 + i * 175} y={264} w={15} h={24}/><Win x={146 + i * 175} y={264} w={15} h={24}/><Win x={180 + i * 175} y={264} w={15} h={24}/></g>)}
      <rect x={830} y={208} width={260} height={130} fill="#e6d6ae" stroke="#8a7a58" strokeWidth={2}/>
      <path d="M812 208 L960 164 L1108 208 Z" fill="#46545d"/><circle cx={960} cy={188} r={12} fill="#f7e3a1" stroke="#8a7a58" strokeWidth={2}/>
      <path d="M560 1080 L830 700 L1090 700 L1360 1080 Z" fill="#c9b184" opacity={0.8}/>
      {[240, 480, 1440, 1680].map(x => <g key={x}><path d={`M${x} 700 L${x + 34} 560 L${x + 68} 700 Z`} fill="#3f7d5a"/><rect x={x + 28} y={700} width={12} height={34} fill="#6b4a2c"/></g>)}
      {[660, 1260].map(x => <g key={x}><rect x={x} y={600} width={14} height={110} fill="#57534a"/><circle cx={x + 7} cy={586} r={17} fill="#e8e2d2" stroke="#57534a" strokeWidth={2}/></g>)}
    </g>;
  }
  if (kind === 'paris_street_fr') {
    // A Paris street of the faubourgs: tall shuttered houses leaning in,
    // mansard roofs, a lantern, cobbles.
    const house = (x: number, w: number, h: number, c: string, key: number) => <g key={key}>
      <rect x={x} y={700 - h} width={w} height={h} fill={c} stroke="#4a4038" strokeWidth={2.6}/>
      <path d={`M${x - 8} ${700 - h} L${x + w / 2} ${664 - h} L${x + w + 8} ${700 - h} Z`} fill="#4c4a55"/>
      {[0, 1, 2].map(r => [0, 1, 2].map(cc => <g key={`${r}-${cc}`}><rect x={x + 18 + cc * (w - 40) / 2.4} y={716 - h + r * (h / 3.4)} width={22} height={34} fill="#31404e" stroke="#2c2620" strokeWidth={2}/><line x1={x + 8 + cc * (w - 40) / 2.4} y1={716 - h + r * (h / 3.4)} x2={x + 8 + cc * (w - 40) / 2.4} y2={750 - h + r * (h / 3.4)} stroke="#5d7d5a" strokeWidth={5}/><line x1={x + 50 + cc * (w - 40) / 2.4} y1={716 - h + r * (h / 3.4)} x2={x + 50 + cc * (w - 40) / 2.4} y2={750 - h + r * (h / 3.4)} stroke="#5d7d5a" strokeWidth={5}/></g>))}
    </g>;
    return <g>
      {house(40, 300, 430, '#b8a88e', 1)}{house(360, 260, 380, '#a89a80', 2)}{house(1300, 280, 400, '#b0a086', 3)}{house(1600, 300, 450, '#a2947a', 4)}
      <line x1={960} y1={300} x2={960} y2={420} stroke="#2c2620" strokeWidth={4}/>
      <path d="M928 420 h64 l-10 44 h-44 Z" fill="#2c2620"/><circle cx={960} cy={442} r={9} fill="#ffd98a"/>
      {[0, 1, 2, 3, 4, 5, 6].map(i => <ellipse key={i} cx={200 + i * 260} cy={790 + (i % 2) * 60} rx={70} ry={12} fill="#7d7668"/>)}
    </g>;
  }
  if (kind === 'place_revolution_fr') {
    // The great square by the Seine (today the Concorde): the pedestal where
    // a king's statue stood, the Tuileries behind, the river and bridge.
    return <g>
      <rect x={-40} y={560} width={2000} height={150} fill="#7db3d9" opacity={0.85}/>
      <path d="M-40 560 L500 520 L560 560 Z M1360 560 L1420 520 L1960 560 Z" fill="#6e685c"/>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => <rect key={i} x={100 + i * 150} y={330} width={120} height={64} fill="#ddd0ae" stroke="#8a7a58" strokeWidth={2}/>)}
      <rect x={90} y={394} width={1740} height={10} fill="#8a7a58"/>
      <rect x={896} y={470} width={128} height={180} fill="#9a917e" stroke="#57534a" strokeWidth={3}/>
      <rect x={876} y={446} width={168} height={26} fill="#8d8578" stroke="#57534a" strokeWidth={3}/>
      <rect x={920} y={650} width={80} height={20} fill="#57534a"/>
      {[300, 560, 1360, 1620].map(x => <g key={x}><rect x={x} y={520} width={10} height={130} fill="#3d3a33"/><circle cx={x + 5} cy={508} r={13} fill="#e8e2d2" stroke="#3d3a33" strokeWidth={2}/></g>)}
      <path d="M-40 710 L1960 710 L1960 760 L-40 760 Z" fill="#b3a184"/>
    </g>;
  }
  if (kind === 'varennes_fr') {
    // A small Meuse town at night-fall: the inn, the church tower, the bridge
    // over the river where the carriage was stopped.
    return <g>
      <rect x={-40} y={600} width={2000} height={90} fill="#3f6d8c"/>
      <path d="M-40 640 Q480 596 960 640 T1960 640 L1960 700 L-40 700 Z" fill="#547d99"/>
      <path d="M700 700 L760 606 L1160 606 L1220 700 Z" fill="#6b5a44"/>
      {[760, 880, 1000, 1120].map(x => <rect key={x} x={x} y={640} width={16} height={60} fill="#54432e"/>)}
      <g><rect x={180} y={420} width={300} height={180} fill="#c2b294" stroke="#4a4038" strokeWidth={3}/>
        <path d="M160 420 L330 356 L500 420 Z" fill="#5d4a3a"/>
        <rect x={300} y={500} width={60} height={100} fill="#3d3a33"/>
        <Win x={216} y={452} w={26} h={36}/><Win x={392} y={452} w={26} h={36}/>
        <rect x={196} y={392} width={120} height={26} fill="#8a3b2e"/><text x={256} y={411} fontSize={17} fill="#f2ead8" textAnchor="middle" fontFamily="Georgia, serif">AUBERGE</text></g>
      <g><rect x={1420} y={330} width={90} height={270} fill="#a89a80" stroke="#4a4038" strokeWidth={3}/>
        <path d="M1404 330 L1465 262 L1526 330 Z" fill="#4c4a55"/><rect x={1448} y={380} width={34} height={52} fill="#31404e"/></g>
      {[560, 600].map(x => <g key={x}><rect x={x} y={470} width={200} height={130} fill="#b0a086" stroke="#4a4038" strokeWidth={2.6}/><path d={`M${x - 8} 470 L${x + 100} 428 L${x + 208} 470 Z`} fill="#4c4a55"/><Win x={x + 30} y={500} w={24} h={32}/><Win x={x + 140} y={500} w={24} h={32}/></g>)}
    </g>;
  }
  if (kind === 'valmy_fr') {
    // The Valmy battlefield: Kellermann's windmill on the ridge, the Argonne
    // woods behind, the plain where the Prussian columns stopped.
    return <g>
      <path d="M-40 640 Q500 470 1000 560 T1960 520 L1960 760 L-40 760 Z" fill="#7a8a4f"/>
      <path d="M1200 560 Q1500 470 1960 500 L1960 620 Q1600 600 1200 620 Z" fill="#4f7f3f"/>
      <g transform="translate(560 470)">
        <path d="M-52 170 L-26 0 L26 0 L52 170 Z" fill="#c9b184" stroke="#6b5322" strokeWidth={3}/>
        <path d="M-70 6 L70 6 L52 -26 L-52 -26 Z" fill="#8a3b2e"/>
        <g stroke="#e8e2d2" strokeWidth={9}><line x1={0} y1={-16} x2={-64} y2={-84}/><line x1={0} y1={-16} x2={64} y2={-84}/><line x1={0} y1={-16} x2={-64} y2={52}/><line x1={0} y1={-16} x2={64} y2={52}/></g>
        <circle cx={0} cy={-16} r={10} fill="#6b5322"/>
        <rect x={-13} y={110} width={26} height={60} fill="#54432e"/></g>
      {[240, 1560, 1700].map(x => <g key={x}><circle cx={x} cy={600} r={44} fill="#4f7f3f"/><rect x={x - 5} y={620} width={10} height={44} fill="#6b4a2c"/></g>)}
      <path d="M-40 760 L1960 700 L1960 800 L-40 830 Z" fill="#97a86a" opacity={0.7}/>
    </g>;
  }
  return null;
};
export const FRANCE_BGS = ['versailles_fr', 'mirrors_fr', 'bastille_fr', 'tuileries_fr', 'paris_street_fr', 'place_revolution_fr', 'varennes_fr', 'valmy_fr'];
export const isFranceBg = (k: string) => FRANCE_BGS.includes(k);
export const FRANCE_GROUND: Record<FranceBgKind, string> = {versailles_fr: '#7fae5a', mirrors_fr: '#9a7448', bastille_fr: '#8a8172', tuileries_fr: '#a8b06a', paris_street_fr: '#8d8578', place_revolution_fr: '#b3a184', varennes_fr: '#7a6a52', valmy_fr: '#8a9a5a'};
