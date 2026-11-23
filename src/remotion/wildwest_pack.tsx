// wildwest_pack.tsx — WILD WEST PACK (2026-11-22, Wild West video)
// Place-faithful frontier backdrops + THE MAP THAT FILLED IN device (the
// video's signature prop: one survey map of the West whose blank interior
// fills in by era state), the wanted poster, the golden spike, the barbed
// wire, the longhorn and the bison.
// Additive pack: nothing in world.tsx changes except the import, the PropArt
// dispatch, the Backdrop dispatch and the GROUND spread.
import React from 'react';
import {INK} from './world';
import type {PropT} from './world';

// ── DEVICE: THE MAP THAT FILLED IN ──────────────────────────────────────────
// One framed survey map of the continent, carried on two posts. In 1803 the
// east is inked and hatched; the west is empty parchment. Each era state inks
// another layer: the expedition's dotted route, the wagon trails, the gold
// burst, the iron lines, the cattle trails, the towns and wires — until the
// finished grid of states leaves no blank at all.
// t states (cumulative): blank → lewis → trails → gold → rails → cattle →
// towns → full.
const MAP_STATES = ['blank', 'lewis', 'trails', 'gold', 'rails', 'cattle', 'towns', 'full'];
export const WildWestProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p}) => {
  const t = p.t ?? 'blank';
  if (p.k === 'map_ww') {
    const lvl = Math.max(0, MAP_STATES.indexOf(t));
    const dot = (x: number, y: number, r: number, fill: string, key: string) => <circle key={key} cx={x} cy={y} r={r} fill={fill}/>;
    return <g>
      <rect x={-8} y={30} width={14} height={86} fill="#5d4630"/>
      <rect x={150} y={30} width={14} height={86} fill="#5d4630"/>
      <rect x={-156} y={-118} width={468} height={196} rx={6} fill="#e9dcba" stroke="#6b5322" strokeWidth={6}/>
      <rect x={-144} y={-106} width={444} height={172} fill="none" stroke="#b39b5e" strokeWidth={2}/>
      {/* the inked east: hatched states along the right edge */}
      <g stroke="#8a7648" strokeWidth={2.4}>
        {[218, 240, 262, 284].map(x => <line key={x} x1={x} y1={-100} x2={x - 14} y2={60}/>)}</g>
      <path d="M196 -106 L196 66" stroke="#6b5322" strokeWidth={3}/>
      {/* the Mississippi: one blue thread down the middle-right */}
      <path d="M186 -100 Q172 -40 184 10 Q190 40 182 62" stroke="#5d84a6" strokeWidth={4} fill="none"/>
      {/* compass rose */}
      <g transform="translate(-116 -70)"><circle r={13} fill="none" stroke="#8a7648" strokeWidth={2}/>
        <path d="M0 -13 L3 0 L0 13 L-3 0 Z" fill="#8a7648"/><path d="M-13 0 L0 -3 L13 0 L0 3 Z" fill="#8a7648"/></g>
      {lvl === 0 && <g>
        <path d="M-60 -100 L186 -100 L182 62 L-96 62 Q-70 0 -60 -100 Z" fill="none" stroke="#8a7648" strokeWidth={2.6} strokeDasharray="8 7"/>
        <path d="M40 -34 q0 -22 20 -22 q18 0 18 15 q0 12 -12 17 q-6 3 -6 12 M66 8 L66 12" stroke="#8a7648" strokeWidth={5} fill="none"/></g>}
      {lvl >= 1 && <g>
        <path d="M182 30 Q110 6 60 -8 Q0 -24 -60 -18 Q-104 -14 -128 -30" stroke="#7a4a21" strokeWidth={3.4} fill="none" strokeDasharray="2 8" strokeLinecap="round"/>
        {dot(-128, -30, 5, '#c9a227', 'p1')}{dot(60, -8, 4, '#7a4a21', 'p2')}{dot(182, 30, 4, '#7a4a21', 'p3')}</g>}
      {lvl >= 2 && <g>
        <path d="M150 44 Q80 30 20 22 Q-50 14 -118 -6" stroke="#a8722c" strokeWidth={3.6} fill="none"/>
        <path d="M150 52 Q96 52 60 38 Q30 26 8 6" stroke="#a8722c" strokeWidth={3} fill="none"/>
        {dot(20, 22, 4.4, '#5d4630', 't1')}{dot(-118, -6, 4.4, '#5d4630', 't2')}{dot(60, 38, 4, '#5d4630', 't3')}</g>}
      {lvl >= 3 && <g>
        {dot(-126, 2, 7, '#e8c14a', 'g0')}{dot(-112, -12, 5, '#e8c14a', 'g1')}{dot(-136, -14, 4.4, '#e8c14a', 'g2')}{dot(-118, 14, 4.4, '#e8c14a', 'g3')}{dot(-104, 2, 3.6, '#d9a92c', 'g4')}
        <path d="M-126 66 Q-40 84 60 70 Q140 60 210 44" stroke="#5d84a6" strokeWidth={3} fill="none" strokeDasharray="7 6"/></g>}
      {lvl >= 4 && <g>
        <path d="M-128 -2 L288 -2" stroke="#4a4d55" strokeWidth={4.4}/>
        <path d="M40 62 L96 -2 L170 -80" stroke="#4a4d55" strokeWidth={3.6}/>
        {dot(-24, -2, 6.4, '#e8c14a', 's1')}<circle cx={-24} cy={-2} r={11} fill="none" stroke="#e8c14a" strokeWidth={2.2}/></g>}
      {lvl >= 5 && <g>
        <path d="M96 62 Q92 20 78 -2" stroke="#b0623a" strokeWidth={3.6} fill="none"/>
        <path d="M118 62 Q110 26 96 4" stroke="#b0623a" strokeWidth={3} fill="none"/>
        {[58, 72, 44].map((x, i) => dot(x, 44 - i * 4, 3, '#7a4a21', 'c' + i))}</g>}
      {lvl >= 6 && <g>
        {[[30, -48], [-20, -56], [-84, -40], [120, -30], [150, 8], [-40, 30], [10, -16]].map(([x, y], i) => dot(x, y, 3.6, '#3a3f47', 'w' + i))}
        <path d="M-140 -52 L290 -52 M-140 30 L290 30" stroke="#9aa3ae" strokeWidth={1.8}/></g>}
      {lvl >= 7 && <g stroke="#8a7648" strokeWidth={2.2}>
        {[-80, -20, 40, 100, 160].map(x => <line key={x} x1={x} y1={-104} x2={x} y2={62}/>)}
        {[-52, 6].map(y => <line key={y} x1={-142} y1={y} x2={196} y2={y}/>)}</g>}
    </g>;
  }
  if (p.k === 'wanted_ww') {
    // A wanted poster nailed to a post: dark header band, a face in profile
    // silhouette, ruled lines for the crimes, a seal. No readable words —
    // the kit's text elements carry the names.
    return <g>
      <rect x={-7} y={-6} width={14} height={110} fill="#5d4630"/>
      <rect x={-72} y={-104} width={144} height={176} rx={3} fill="#e9dcba" stroke="#6b5322" strokeWidth={3.4}/>
      <rect x={-72} y={-104} width={144} height={30} fill="#3a2c18"/>
      <path d="M-14 -52 a17 17 0 1 1 30 0 q6 14 -2 24 l-26 0 q-8 -10 -2 -24 Z" fill="#4a4038"/>
      <path d="M-30 6 q30 -14 60 0 l6 22 -84 0 Z" fill="#4a4038"/>
      {[-44, -30, 44, 56].map(y => <line key={y} x1={-56} y1={y} x2={56} y2={y} stroke="#8a7648" strokeWidth={3}/>)}
      <circle cx={48} cy={-88} r={4} fill="#8a2f23"/>
    </g>;
  }
  if (p.k === 'spike_ww') {
    // The last tie: two rail ends almost touching, one golden spike standing
    // in the gap, a sledgehammer resting against the tie.
    return <g>
      <rect x={-130} y={26} width={260} height={20} rx={4} fill="#6b4a2c" stroke="#4a3a22" strokeWidth={3}/>
      <path d="M-130 18 L-14 18 L-14 30 L-130 30 Z" fill="#9aa3ae" stroke="#4a4d55" strokeWidth={2.4}/>
      <path d="M130 18 L14 18 L14 30 L130 30 Z" fill="#9aa3ae" stroke="#4a4d55" strokeWidth={2.4}/>
      <path d="M-9 -26 L9 -26 L5 20 L-5 20 Z" fill="#e8c14a" stroke="#a87e14" strokeWidth={3}/>
      <rect x={-13} y={-32} width={26} height={10} rx={3} fill="#f2d06b" stroke="#a87e14" strokeWidth={2.6}/>
      <path d="M64 44 L104 -18" stroke="#6b4a2c" strokeWidth={7}/>
      <rect x={98} y={-34} width={30} height={16} rx={3} fill="#6b6f76" stroke="#4a4d55" strokeWidth={2.4} transform="rotate(-58 113 -26)"/>
      {[0, 1, 2, 3].map(i => <path key={i} d={`M${-26 - i * 2} ${-44 - i * 8} l-6 -8 M${26 + i * 2} ${-44 - i * 8} l6 -8`} stroke="#f2d06b" strokeWidth={2.4}/>)}</g>;
  }
  if (p.k === 'wire_ww') {
    // Three strands of barbed wire on two posts — the fence that closed the
    // open range. t 'cut': the top strand is snipped, ends curled back.
    const cut = t === 'cut';
    const barbs = (y: number, x0: number, x1: number) => <g stroke="#3a3f47" strokeWidth={2.2}>
      {Array.from({length: 9}, (_, i) => x0 + 14 + i * ((x1 - x0 - 28) / 8)).map((x, i) => <path key={i} d={`M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x - 4} ${y + 4} L${x + 4} ${y - 4}`}/>)}</g>;
    return <g>
      <rect x={-136} y={-52} width={13} height={118} fill="#6b4a2c" stroke="#4a3a22" strokeWidth={2.4}/>
      <rect x={123} y={-52} width={13} height={118} fill="#6b4a2c" stroke="#4a3a22" strokeWidth={2.4}/>
      {[-34, -6, 22].map((y, i) => <g key={y}>
        {cut && i === 0 ? <g>
          <line x1={-130} y1={y} x2={-16} y2={y} stroke="#3a3f47" strokeWidth={2.8}/>
          <line x1={16} y1={y} x2={130} y2={y} stroke="#3a3f47" strokeWidth={2.8}/>
          <path d="M-16 -34 q-14 2 -12 12 M16 -34 q14 2 12 12" stroke="#3a3f47" strokeWidth={2.8} fill="none"/>
          {barbs(y, -130, -30)}{barbs(y, 30, 130)}</g>
        : <g><line x1={-130} y1={y} x2={130} y2={y} stroke="#3a3f47" strokeWidth={2.8}/>{barbs(y, -130, 130)}</g>}</g>)}
    </g>;
  }
  if (p.k === 'longhorn_ww') {
    // A Texas longhorn: lean body, four legs, and the great level horns.
    return <g stroke="#4a3421" strokeWidth={3}>
      <ellipse cx={0} cy={-26} rx={86} ry={30} fill="#8a5a33"/>
      <path d="M-60 -44 q60 -16 118 -4 l0 12 q-58 -10 -118 2 Z" fill="#a06a3a" stroke="none"/>
      {[-58, -34, 40, 62].map(x => <path key={x} d={`M${x} -8 L${x - 2} 52`} stroke="#6e4525" strokeWidth={9}/>)}
      <path d="M-84 -30 q-14 22 -8 46" fill="none" stroke="#6e4525" strokeWidth={6}/>
      <g><path d="M78 -34 q26 -6 30 10 q2 14 -12 20 l-22 2 q-8 -16 4 -32 Z" fill="#8a5a33"/>
        <path d="M96 -34 q34 -14 52 -34 M100 -30 q-30 -18 -38 -40" fill="none" stroke="#e8dcbc" strokeWidth={7}/>
        <circle cx={100} cy={-18} r={3.6} fill="#2c2015" stroke="none"/></g>
      <path d="M-88 -34 q-10 -14 -4 -26" fill="none" stroke="#e8dcbc" strokeWidth={6}/></g>;
  }
  if (p.k === 'bison_ww') {
    // An American bison: the huge shouldered front, shaggy cape, low head.
    return <g stroke="#33241a" strokeWidth={3}>
      <ellipse cx={16} cy={-22} rx={74} ry={28} fill="#5d4630"/>
      <path d="M-66 -52 q30 -14 62 -6 q22 6 24 26 q2 22 -18 34 l-56 0 q-20 -12 -18 -30 q0 -16 10 -24 Z" fill="#4a3421"/>
      {[-44, 52, 70].map(x => <path key={x} d={`M${x} -2 L${x - 2} 50`} stroke="#3a2a1c" strokeWidth={10}/>)}
      <path d="M-52 0 L-54 50" stroke="#3a2a1c" strokeWidth={10}/>
      <path d="M88 -26 q14 18 8 40" fill="none" stroke="#3a2a1c" strokeWidth={6}/>
      <g><path d="M-58 -18 q-16 4 -16 20 q0 16 14 20 l16 -2 q8 -20 -2 -34 q-4 -6 -12 -6 Z" fill="#3a2a1c"/>
        <path d="M-70 -20 q-12 -8 -10 -20 M-46 -22 q10 -10 6 -22" fill="none" stroke="#cbbfa0" strokeWidth={5.6}/>
        <path d="M-58 22 q-2 10 4 14" fill="none" stroke="#241a10" strokeWidth={5}/></g></g>;
  }
  return null;
};
export const WILDWEST_PROPS = ['map_ww', 'wanted_ww', 'spike_ww', 'wire_ww', 'longhorn_ww', 'bison_ww'];
export const isWildWestProp = (k: string) => WILDWEST_PROPS.includes(k);

// ── BACKDROPS ───────────────────────────────────────────────────────────────
const Mesa: React.FC<{x: number; y: number; w: number; h: number; c?: string}> = ({x, y, w, h, c = '#b98a5e'}) => <path d={`M${x} ${y} L${x + 18} ${y - h} L${x + w - 18} ${y - h} L${x + w} ${y} Z`} fill={c}/>;

export type WildWestBgKind = 'mainstreet_ww' | 'sutter_ww' | 'fort_ww' | 'railcamp_ww' | 'prairie_ww';
export const WildWestBg: React.FC<{bg: WildWestBgKind; f: number; cx: number; seed: string}> = ({bg: kind}) => {
  if (kind === 'mainstreet_ww') {
    // A cow-town main street: false-front stores receding to a dusty vanishing
    // point, boardwalks, a water tower, telegraph poles, mesas behind.
    const fronts = ['#a06a3a', '#8a5a33', '#b3814a', '#96703f'];
    return <g>
      <Mesa x={-40} y={430} w={560} h={120} c="#c09a6c"/><Mesa x={1420} y={430} w={580} h={150} c="#b98a5e"/>
      <path d="M560 700 L860 420 L1060 420 L1360 700 Z" fill="#9c774e"/>
      {[0, 1, 2, 3].map(i => <g key={'l' + i}>
        <rect x={60 + i * 16} y={300 + i * 34} width={430 - i * 92} height={300 - i * 30} fill={fronts[i]} stroke="#5d4630" strokeWidth={3}/>
        <rect x={46 + i * 16} y={268 + i * 34} width={458 - i * 92} height={30} fill={fronts[(i + 1) % 4]} stroke="#5d4630" strokeWidth={3}/>
        <rect x={110 + i * 20} y={380 + i * 30} width={70 - i * 8} height={110 - i * 10} fill="#4a3421"/>
        <rect x={300 + i * 8} y={392 + i * 28} width={90 - i * 10} height={60 - i * 6} fill="#f7e3a1" stroke="#5d4630" strokeWidth={2.4} opacity={0.92}/></g>)}
      {[0, 1, 2, 3].map(i => <g key={'r' + i}>
        <rect x={1430 - i * 16} y={300 + i * 34} width={430 - i * 92} height={300 - i * 30} fill={fronts[(i + 2) % 4]} stroke="#5d4630" strokeWidth={3}/>
        <rect x={1416 - i * 16} y={268 + i * 34} width={458 - i * 92} height={30} fill={fronts[(i + 3) % 4]} stroke="#5d4630" strokeWidth={3}/>
        <rect x={1740 - i * 20} y={380 + i * 30} width={70 - i * 8} height={110 - i * 10} fill="#4a3421"/>
        <rect x={1530 - i * 8} y={392 + i * 28} width={90 - i * 10} height={60 - i * 6} fill="#f7e3a1" stroke="#5d4630" strokeWidth={2.4} opacity={0.92}/></g>)}
      <rect x={40} y={596} width={520} height={18} fill="#7a5c38"/><rect x={1360} y={596} width={520} height={18} fill="#7a5c38"/>
      <g><rect x={912} y={196} width={96} height={26} fill="#6e4525"/><path d="M922 222 L916 300 M998 222 L1004 300 M928 300 L992 300" stroke="#6e4525" strokeWidth={8}/>
        <path d="M906 196 L960 168 L1014 196 Z" fill="#5d4630"/></g>
      {[700, 1240].map(x => <g key={x}><line x1={x} y1={700} x2={x} y2={380} stroke="#4a3421" strokeWidth={7}/><line x1={x - 34} y1={404} x2={x + 34} y2={404} stroke="#4a3421" strokeWidth={6}/></g>)}
      <path d="M700 404 Q960 360 1240 404" stroke="#3a3f47" strokeWidth={2.4} fill="none"/>
    </g>;
  }
  if (kind === 'sutter_ww') {
    // Sutter's Mill on the American River at Coloma: the mill race running
    // down from the pines, the great undershot wheel, the sawmill shed —
    // the ditch where James Marshall stooped and picked up the flakes.
    return <g>
      <path d="M-40 470 L420 300 L760 430 L1120 280 L1500 420 L1960 300 L1960 700 L-40 700 Z" fill="#4c6a3f"/>
      {[180, 460, 1330, 1620].map(x => <g key={x}><path d={`M${x} 430 L${x + 26} 300 L${x + 52} 430 Z`} fill="#33502c"/><rect x={x + 20} y={424} width={12} height={44} fill="#4a3a22"/></g>)}
      <path d="M240 700 L700 470 L860 470 L700 700 Z" fill="#7db3d9" opacity={0.85}/>
      <path d="M330 700 L706 492 L790 492 L560 700 Z" fill="#a8c8dd" opacity={0.6}/>
      <g><rect x={1060} y={330} width={360} height={190} fill="#8a6a42" stroke="#5d4630" strokeWidth={3}/>
        <path d="M1030 330 L1240 252 L1450 330 Z" fill="#6e5136"/>
        <rect x={1180} y={420} width={90} height={100} fill="#4a3421"/>
        <circle cx={1010} cy={452} r={86} fill="none" stroke="#5d4630" strokeWidth={15}/>
        {[0, 45, 90, 135].map(a => <line key={a} x1={1010 - 80 * Math.cos(a * Math.PI / 180)} y1={452 - 80 * Math.sin(a * Math.PI / 180)} x2={1010 + 80 * Math.cos(a * Math.PI / 180)} y2={452 + 80 * Math.sin(a * Math.PI / 180)} stroke="#5d4630" strokeWidth={9}/>)}
        <circle cx={1010} cy={452} r={14} fill="#4a3421"/>
        <path d="M930 380 L1010 452 L1130 400" stroke="#7db3d9" strokeWidth={10} fill="none" opacity={0.7}/></g>
      <path d="M700 470 L1010 420 L1010 452" stroke="#6b4a2c" strokeWidth={12} fill="none"/>
      {[560, 640, 1480, 1560].map(x => <ellipse key={x} cx={x} cy={640} rx={42} ry={13} fill="#8a8f7a"/>)}
    </g>;
  }
  if (kind === 'fort_ww') {
    // A frontier stockade fort: sharpened log walls, two blockhouses flying
    // the flag, the gate, a parade ground with a well and a wagon.
    return <g>
      <path d="M-40 420 L500 340 L1040 410 L1520 330 L1960 410 L1960 700 L-40 700 Z" fill="#7d8f56"/>
      <g>{Array.from({length: 46}, (_, i) => 60 + i * 40).map(x => <path key={x} d={`M${x} 560 L${x + 9} 428 L${x + 18} 560 Z`} fill="#8a6a42" stroke="#5d4630" strokeWidth={1.6}/>)}</g>
      <g><rect x={96} y={330} width={170} height={230} fill="#96703f" stroke="#5d4630" strokeWidth={3}/>
        <path d="M78 330 L181 268 L284 330 Z" fill="#6e5136"/><rect x={150} y={420} width={56} height={80} fill="#f7e3a1" stroke="#5d4630" strokeWidth={2.4}/></g>
      <g><rect x={1654} y={330} width={170} height={230} fill="#96703f" stroke="#5d4630" strokeWidth={3}/>
        <path d="M1636 330 L1739 268 L1842 330 Z" fill="#6e5136"/><rect x={1708} y={420} width={56} height={80} fill="#f7e3a1" stroke="#5d4630" strokeWidth={2.4}/></g>
      <rect x={856} y={436} width={208} height={124} fill="#4a3421"/>
      <path d="M856 436 L960 396 L1064 436" fill="none" stroke="#5d4630" strokeWidth={8}/>
      <g><line x1={960} y1={560} x2={960} y2={238} stroke="#5d4630" strokeWidth={7}/>
        <path d="M960 238 L1068 262 L960 288 Z" fill="#a03a2e"/>
        {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x={966 + (i % 3) * 12} y={246 + Math.floor(i / 3) * 12} width={8} height={8} fill="#f2ead8"/>)}</g>
      <circle cx={620} cy={620} r={30} fill="none" stroke="#8a8f7a" strokeWidth={9}/>
      <path d="M590 596 L620 560 L650 596" stroke="#6b4a2c" strokeWidth={7} fill="none"/>
    </g>;
  }
  if (kind === 'railcamp_ww') {
    // A railroad construction camp at the end of track: the rails running to
    // the horizon, a water tower, a row of canvas tents, stacked ties.
    return <g>
      <Mesa x={-40} y={440} w={640} h={110}/><Mesa x={1380} y={440} w={620} h={130} c="#c09a6c"/>
      <path d="M820 700 L946 436 L974 436 L1100 700 Z" fill="#8a6b48"/>
      <path d="M896 700 L954 436 M1024 700 L966 436" stroke="#9aa3ae" strokeWidth={7}/>
      {[0, 1, 2, 3, 4, 5, 6].map(i => <line key={i} x1={872 - i * 6} y1={668 - i * 34} x2={1048 + i * 6} y2={668 - i * 34} stroke="#5d4630" strokeWidth={8 - i * 0.7}/>)}
      <g><rect x={1180} y={210} width={120} height={30} fill="#6e4525"/><path d="M1192 240 L1186 330 M1288 240 L1294 330 M1196 330 L1284 330" stroke="#6e4525" strokeWidth={9}/>
        <path d="M1172 210 L1240 178 L1308 210 Z" fill="#5d4630"/><line x1={1240} y1={240} x2={1240} y2={300} stroke="#4a4d55" strokeWidth={6}/></g>
      {[0, 1, 2, 3].map(i => <g key={i}><path d={`M${180 + i * 130} 560 L${240 + i * 130} 470 L${300 + i * 130} 560 Z`} fill="#e8e2d2" stroke="#b9b094" strokeWidth={2.6}/>
        <line x1={240 + i * 130} y1={470} x2={240 + i * 130} y2={560} stroke="#b9b094" strokeWidth={2.4}/></g>)}
      <g>{[0, 1, 2].map(i => <rect key={i} x={1420} y={600 + i * 20} width={220} height={13} fill="#6b4a2c" stroke="#4a3a22" strokeWidth={2}/>)}</g>
      <ellipse cx={960} cy={420} rx={180} ry={16} fill="#c9b18a" opacity={0.5}/>
    </g>;
  }
  // prairie_ww — the open plains: rolling grass, wagon ruts curving away,
  // a lone butte, a sky too big for the frame.
  return <g>
    <path d="M-40 520 Q480 440 960 490 Q1440 540 1960 470 L1960 700 L-40 700 Z" fill="#a8894f"/>
    <path d="M-40 580 Q520 520 1040 570 Q1520 610 1960 560 L1960 700 L-40 700 Z" fill="#96793f"/>
    <Mesa x={1560} y={500} w={440} h={170} c="#b98a5e"/>
    <path d="M300 700 Q700 590 900 520 M460 700 Q820 600 980 528" stroke="#7a5c30" strokeWidth={9} fill="none" opacity={0.65}/>
    {[240, 700, 1180, 1620].map(x => <g key={x} stroke="#7d8f56" strokeWidth={4}>
      <path d={`M${x} 660 q-6 -26 -14 -36 M${x + 12} 662 q0 -28 6 -40 M${x + 24} 660 q6 -24 14 -34`}/></g>)}
    {[420, 900, 1450].map(x => <g key={x}><ellipse cx={x} cy={180} rx={110} ry={22} fill="#f2ead8" opacity={0.75}/><ellipse cx={x + 60} cy={162} rx={70} ry={17} fill="#f2ead8" opacity={0.6}/></g>)}
  </g>;
};
export const isWildWestBg = (k: string): k is WildWestBgKind => ['mainstreet_ww', 'sutter_ww', 'fort_ww', 'railcamp_ww', 'prairie_ww'].includes(k);
export const WILDWEST_GROUND: Partial<Record<WildWestBgKind, string>> = {
  mainstreet_ww: '#8a6b48', sutter_ww: '#5d7a4a', fort_ww: '#8f774f', railcamp_ww: '#8a6b48', prairie_ww: '#a8894f',
};
