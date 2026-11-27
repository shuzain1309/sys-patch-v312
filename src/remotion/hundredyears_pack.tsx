import React from 'react';
import {INK} from './world';
import type {PropT} from './world';

// ── HUNDRED YEARS' WAR PACK (2026-11-27) ────────────────────────────────────
// For "How England Nearly Took France in 20 Minutes". Device: THE TIDE —
// one master map of France flooding English red and draining back (carried
// by the geo scenes, not a prop). Refrain (exactly 3x in the script):
// "And the tide came in." x2, then inverted "And the tide went out."
// Bespoke kit: the destrier warhorse (to the FIXED Alexander silhouette
// standard — the kit horse blob is never used), planted anti-cavalry
// stakes, the arrow storm, the Genoese pavise, and Joan's painted banner.
// Every backdrop paints a FULL-FRAME BASE first (sky gradient + its
// ground colour to y1080) — the Alexander black-scene lesson: world.tsx
// returns a pack backdrop directly with no sky/ground base of its own.
// House colours: England red + royal gold; France royal blue + gold;
// Burgundy deep burgundy; Joan white.

const ENG_RED = '#a52a21', ENG_RED_D = '#7e1f18', GOLD = '#d9a83c', GOLD_L = '#f0cd72';
const FRA_BLUE = '#2b4f9e', FRA_BLUE_D = '#1e3a75', BURG = '#6e2434';
const STONE = '#9a8a70', STONE_D = '#7a6a50', WOOD = '#7a6248', WOOD_D = '#5d4630';
const WHITE = '#f2ead8';

// ── THE HORSE — copied silhouette discipline from the FIXED Alexander
// HorseBody (2026-11-27 fix pass): one silhouette for barrel, arched neck
// and elongated head — muzzle narrower than the jaw, pricked ears, eye and
// nostril on the face plane; mane along the neck crest; tail from the
// rump; legs JOINTED (thicker upper, knee/hock, thinner cannon, hoof
// block), far pair behind the body, near pair in front. Feet at y=0.
const HorseBody: React.FC<{coat: string; mane: string; cloth?: string; rim?: string}> = ({coat, mane, cloth, rim}) => {
  const Leg: React.FC<{hip: number; knee: number; foot: number; upper: number}> = ({hip, knee, foot, upper}) => (
    <g>
      <path d={`M${hip} -118 L${knee} -56`} stroke={INK} strokeWidth={upper + 4} strokeLinecap="round"/>
      <path d={`M${hip} -118 L${knee} -56`} stroke={coat} strokeWidth={upper} strokeLinecap="round"/>
      <path d={`M${knee} -56 L${foot} -10`} stroke={INK} strokeWidth={13.5} strokeLinecap="round"/>
      <path d={`M${knee} -56 L${foot} -10`} stroke={coat} strokeWidth={9.5} strokeLinecap="round"/>
      <rect x={foot - 12} y={-9} width={25} height={9} fill="#241f1a" stroke={INK} strokeWidth={1.6}/>
    </g>
  );
  return (
  <g>
    <path d="M-146 -192 Q-180 -148 -173 -82 Q-170 -46 -155 -28" fill="none" stroke={mane} strokeWidth={13} strokeLinecap="round"/>
    <Leg hip={-80} knee={-73} foot={-69} upper={14}/>
    <Leg hip={70} knee={75} foot={79} upper={14}/>
    <path d="M-148 -198 Q-156 -148 -126 -126 Q-70 -104 -6 -108 Q66 -102 106 -126 Q132 -138 130 -170 Q148 -208 178 -254 Q184 -246 198 -240 L240 -216 Q252 -224 248 -238 L178 -294 Q168 -302 158 -296 Q128 -258 98 -230 Q30 -216 -60 -214 Q-120 -212 -148 -198 Z" fill={coat} stroke={INK} strokeWidth={3.6}/>
    <path d="M160 -296 L155 -323 L175 -305 Z" fill={coat} stroke={INK} strokeWidth={2.8}/>
    <path d="M177 -301 L182 -327 L193 -300 Z" fill={coat} stroke={INK} strokeWidth={2.8}/>
    <path d="M161 -301 Q170 -316 183 -303 Q172 -295 161 -301 Z" fill={mane}/>
    <path d="M158 -292 Q116 -252 88 -220" fill="none" stroke={mane} strokeWidth={11} strokeLinecap="round"/>
    {rim && <path d="M-140 -201 Q-60 -217 96 -231 Q128 -259 166 -295" fill="none" stroke={rim} strokeWidth={4} opacity={0.85}/>}
    <Leg hip={-112} knee={-103} foot={-99} upper={15}/>
    <Leg hip={97} knee={101} foot={103} upper={15}/>
    {cloth && <g>
      <path d="M-46 -224 L66 -226 L58 -138 L-38 -136 Z" fill={cloth} stroke={INK} strokeWidth={3}/>
      <path d="M-46 -224 L66 -226 L64 -200 L-44 -198 Z" fill="#000" opacity={0.14}/>
      <line x1={-40} y1={-146} x2={60} y2={-148} stroke={GOLD} strokeWidth={4}/>
    </g>}
    <path d="M196 -252 Q216 -264 238 -238" fill="none" stroke={GOLD} strokeWidth={4}/>
    <circle cx={207} cy={-263} r={4.6} fill={INK}/>
    <ellipse cx={240} cy={-226} rx={3.6} ry={2.6} fill={INK} transform="rotate(-32 240 -226)"/>
  </g>
  );
};

// A seated rider with a FULL body (Alexander fix standard: no floating
// torsos) — legs draped down the barrel (thigh to a forward knee, shin to
// a boot beside the belly), torso above the saddle, head and hat, one arm
// forward to the reins; the reins themselves are drawn by the destrier so
// hand and bit are physically connected (the chariot lesson).
const Rider: React.FC<{surcoat: string; hat: string; skin: string; hair?: string}> = ({surcoat, hat, skin, hair}) => (
  <g>
    <path d="M4 -182 L36 -140 L31 -88" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round"/>
    <path d="M4 -182 L36 -140 L31 -88" fill="none" stroke={surcoat} strokeWidth={9.5} strokeLinecap="round"/>
    <path d="M-14 -182 L12 -142 L8 -94" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round"/>
    <path d="M-14 -182 L12 -142 L8 -94" fill="none" stroke={surcoat} strokeWidth={9.5} strokeLinecap="round"/>
    <path d="M-14 -258 L16 -258 L20 -178 L-10 -176 Z" fill={surcoat} stroke={INK} strokeWidth={2.8}/>
    <path d="M12 -246 L52 -214" stroke={INK} strokeWidth={10.5} strokeLinecap="round"/>
    <path d="M12 -246 L52 -214" stroke={surcoat} strokeWidth={7} strokeLinecap="round"/>
    <circle cx={2} cy={-280} r={16.5} fill={skin} stroke={INK} strokeWidth={2.4}/>
    {hat === 'crown' && <path d="M-15 -290 L-13 -306 L-4 -294 L3 -308 L10 -294 L18 -306 L19 -289 Z" fill={GOLD} stroke={INK} strokeWidth={2.2}/>}
    {hat === 'helm' && <path d="M-16 -282 Q2 -312 20 -282 L20 -268 Q2 -280 -16 -268 Z" fill="#9aa0a8" stroke={INK} strokeWidth={2.4}/>}
    {hat === 'cap' && <path d="M-15 -288 Q2 -302 19 -288 L19 -280 Q2 -290 -15 -280 Z" fill={WOOD_D} stroke={INK} strokeWidth={2.2}/>}
    {hair === 'bob' && <path d="M-16 -284 Q-18 -258 -10 -250 L-8 -272 Z M20 -284 Q22 -258 14 -250 L12 -272 Z" fill="#2e2019"/>}
  </g>
);

export const HundredYearsProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p}) => {
  if (p.k === 'destrier_hyw') {
    // The warhorse: fixed Alexander silhouette, caparison in the faction
    // colour (p.c), an optional full-bodied rider by p.t:
    // 'crown' king / 'helm' knight / 'cap' commander / 'joan' (white
    // surcoat, bob hair) / anything else = riderless.
    const cap = p.c ?? ENG_RED;
    const riderHat = p.t === 'crown' ? 'crown' : p.t === 'helm' ? 'helm' : p.t === 'cap' ? 'cap' : p.t === 'joan' ? 'none' : null;
    return <g>
      <ellipse cx={0} cy={5} rx={215} ry={13} fill="#000" opacity={0.16}/>
      <HorseBody coat="#4a3826" mane="#2e2115" cloth={cap} rim="#a08a68"/>
      {riderHat !== null && <g>
        <path d="M54 -216 Q150 -238 236 -206" fill="none" stroke="#2e2115" strokeWidth={3.4}/>
        <path d="M56 -208 Q150 -226 234 -198" fill="none" stroke="#2e2115" strokeWidth={2.8}/>
        <g transform="scale(0.94) translate(-4,-16)">
          <Rider surcoat={p.c2 ?? cap} hat={riderHat} skin="#eec39b" hair={p.t === 'joan' ? 'bob' : undefined}/>
        </g>
      </g>}
    </g>;
  }
  if (p.k === 'stakes_hyw') {
    // Planted anti-cavalry stakes: a row of sharpened poles angled toward
    // the enemy, driven in at the ground line. n copies (default 6).
    const n = Math.min(p.n ?? 6, 14);
    return <g>
      <ellipse cx={0} cy={4} rx={n * 34} ry={9} fill="#000" opacity={0.13}/>
      {Array.from({length: n}, (_, i) => {
        const x = (i - (n - 1) / 2) * 62;
        return <g key={i}>
          <path d={`M${x - 7} 2 L${x + 16} -118 L${x + 26} -112 L${x + 9} 2 Z`} fill={WOOD} stroke={INK} strokeWidth={2.4}/>
          <path d={`M${x + 16} -118 L${x + 26} -112 L${x + 21} -96 L${x + 13} -100 Z`} fill="#c9b088"/>
        </g>;
      })}
    </g>;
  }
  if (p.k === 'arrows_hyw') {
    const n = Math.min(p.n ?? 12, 30);
    if (p.t === 'storm') {
      // The arrow storm: a volley frozen mid-arc, shafts on parallel
      // descending diagonals with pale fletching.
      return <g>
        {Array.from({length: n}, (_, i) => {
          const x = (i % 6) * 74 - 190 + Math.floor(i / 6) * 30, y = -Math.floor(i / 6) * 84 - (i % 3) * 16;
          return <g key={i} transform={`translate(${x},${y}) rotate(38)`}>
            <line x1={-44} y1={0} x2={40} y2={0} stroke={WOOD_D} strokeWidth={4} strokeLinecap="round"/>
            <path d="M40 0 l16 -5 l-3 5 l3 5 Z" fill="#c8ccd2" stroke={INK} strokeWidth={1.4}/>
            <path d="M-44 0 l-14 -8 l2 8 l-2 8 Z" fill={WHITE} stroke={INK} strokeWidth={1.2}/>
          </g>;
        })}
      </g>;
    }
    // Fallen shafts bristling in the field after a volley.
    return <g>
      {Array.from({length: n}, (_, i) => {
        const x = (i - (n - 1) / 2) * 44, tilt = ((i * 37) % 26) - 13;
        return <g key={i} transform={`translate(${x},0) rotate(${tilt})`}>
          <line x1={0} y1={2} x2={6} y2={-64} stroke={WOOD_D} strokeWidth={3.6} strokeLinecap="round"/>
          <path d="M6 -64 l4 -13 l5 12 Z" fill="#c8ccd2" stroke={INK} strokeWidth={1.2}/>
          <path d="M1 -8 l-11 -7 l1 8 l-3 7 Z" fill={WHITE} stroke={INK} strokeWidth={1}/>
        </g>;
      })}
    </g>;
  }
  if (p.k === 'pavise_hyw') {
    // The Genoese pavise: a tall painted shield a crossbowman shelters
    // behind — white field, the red cross of Genoa (p.c recolours it).
    const cross = p.c ?? '#b3312a';
    return <g>
      <ellipse cx={0} cy={4} rx={62} ry={8} fill="#000" opacity={0.15}/>
      <path d="M-52 0 L-52 -168 Q0 -196 52 -168 L52 0 Q0 14 -52 0 Z" fill={WHITE} stroke={INK} strokeWidth={3.4}/>
      <path d="M-52 -160 Q0 -186 52 -160" fill="none" stroke={INK} strokeWidth={2}/>
      <rect x={-11} y={-172} width={22} height={168} fill={cross}/>
      <rect x={-50} y={-104} width={100} height={22} fill={cross}/>
      <line x1={-30} y1={2} x2={-44} y2={-26} stroke={WOOD_D} strokeWidth={5}/>
      <line x1={30} y1={2} x2={44} y2={-26} stroke={WOOD_D} strokeWidth={5}/>
    </g>;
  }
  if (p.k === 'cradle_hyw') {
    // A royal cradle: rockers, a hooded head end, white swaddling with
    // the infant's face — Henry VI present at the dual-monarchy beat
    // (1422) beside the two crowns, before the kid rig casts him at ten.
    return <g>
      <ellipse cx={0} cy={4} rx={92} ry={9} fill="#000" opacity={0.15}/>
      <path d="M-96 2 Q0 22 96 2" fill="none" stroke={WOOD_D} strokeWidth={8} strokeLinecap="round"/>
      <path d="M-84 -6 L-76 -64 L76 -64 L84 -6 Z" fill={WOOD} stroke={INK} strokeWidth={3.2}/>
      <path d="M-76 -64 L76 -64 L70 -84 L-70 -84 Z" fill={WOOD_D} stroke={INK} strokeWidth={3}/>
      <path d="M-84 -64 Q-88 -118 -52 -128 L-52 -64 Z" fill={ENG_RED} stroke={INK} strokeWidth={3}/>
      <ellipse cx={-30} cy={-72} rx={40} ry={15} fill={WHITE} stroke={INK} strokeWidth={2.4}/>
      <circle cx={-52} cy={-78} r={11} fill="#f6cfa5" stroke={INK} strokeWidth={2.2}/>
      <path d="M-58 -84 Q-52 -90 -46 -84" fill="none" stroke={INK} strokeWidth={1.8}/>
      <line x1={-70} y1={-58} x2={70} y2={-58} stroke={GOLD} strokeWidth={3.4}/>
    </g>;
  }
  // joan_banner_hyw (default) — Joan's banner: a tall white standard,
  // gold fringe, a painted field of gold lilies around a radiant centre.
  // The painting is abstract (rays + lilies), never text.
  return <g>
    <ellipse cx={0} cy={4} rx={54} ry={8} fill="#000" opacity={0.14}/>
    <line x1={0} y1={2} x2={0} y2={-392} stroke={WOOD_D} strokeWidth={7} strokeLinecap="round"/>
    <circle cx={0} cy={-396} r={8} fill={GOLD} stroke={INK} strokeWidth={2}/>
    <path d="M4 -384 L196 -368 Q176 -300 196 -232 L4 -218 Z" fill={WHITE} stroke={INK} strokeWidth={3.2}/>
    {Array.from({length: 6}, (_, i) => <line key={i} x1={14 + i * 30} y1={-222} x2={14 + i * 30} y2={-206} stroke={GOLD} strokeWidth={4}/>)}
    <g transform="translate(102,-302)">
      <circle cx={0} cy={0} r={21} fill={GOLD_L} stroke={GOLD} strokeWidth={2.6}/>
      {Array.from({length: 8}, (_, i) => { const a = (i / 8) * Math.PI * 2; return <line key={i} x1={Math.cos(a) * 26} y1={Math.sin(a) * 26} x2={Math.cos(a) * 36} y2={Math.sin(a) * 36} stroke={GOLD} strokeWidth={3.4} strokeLinecap="round"/>; })}
    </g>
    {[-52, 52].map((dx, i) => (
      <g key={i} transform={`translate(${102 + dx},${-302 + (i ? 44 : -44)}) scale(0.62)`}>
        <path d="M0 12 C-14 -2 -12 -18 0 -26 C12 -18 14 -2 0 12 Z M0 12 L0 24 M-9 20 Q0 14 9 20" fill="none" stroke={FRA_BLUE} strokeWidth={5} strokeLinecap="round"/>
      </g>
    ))}
  </g>;
};
export const HUNDREDYEARS_PROPS = ['destrier_hyw', 'stakes_hyw', 'arrows_hyw', 'pavise_hyw', 'joan_banner_hyw', 'cradle_hyw'];
export const isHundredYearsProp = (k: string) => HUNDREDYEARS_PROPS.includes(k);

// ── BACKDROPS ────────────────────────────────────────────────────────────────
export type HundredYearsBgKind = 'westminster_hyw' | 'crecy_hyw' | 'poitiers_hyw' | 'siege_camp_hyw' | 'chevauchee_hyw' | 'agincourt_hyw' | 'orleans_hyw' | 'domremy_hyw' | 'reims_hyw' | 'castillon_hyw' | 'sluys_hyw' | 'somme_hyw';
// FULL-FRAME BASE (the Alexander lesson): world.tsx returns a pack
// backdrop directly — no sky/ground base is painted by the engine on the
// pack branch. This wrapper paints the base FIRST — a day-sky gradient
// over y 0-700 and the backdrop's HUNDREDYEARS_GROUND colour over
// y 700-1080 — then the scenery on top. StageOne's tod tint still
// applies over the whole scene, so dusk/night scenes stay tinted.
export const HundredYearsBg: React.FC<{bg: HundredYearsBgKind; f: number; cx: number; seed: string}> = (props) => (
  <g>
    <defs>
      <linearGradient id="hyw-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7ba3cf"/>
        <stop offset="100%" stopColor="#e8dcbc"/>
      </linearGradient>
    </defs>
    <rect x={-40} y={0} width={2000} height={700} fill="url(#hyw-sky)"/>
    <rect x={-40} y={700} width={2000} height={380} fill={HUNDREDYEARS_GROUND[props.bg] ?? '#8a7a56'}/>
    <HundredYearsArt {...props}/>
  </g>
);
const Tree: React.FC<{x: number; y: number; s: number; c?: string}> = ({x, y, s, c}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M0 0 L0 -120" stroke={WOOD_D} strokeWidth={11} strokeLinecap="round"/>
    <path d="M-52 -96 Q-58 -168 0 -186 Q58 -168 52 -96 Q30 -66 0 -78 Q-30 -66 -52 -96 Z" fill={c ?? '#4f7f3f'} stroke={INK} strokeWidth={2.6}/>
  </g>
);
const HundredYearsArt: React.FC<{bg: HundredYearsBgKind; f: number; cx: number; seed: string}> = ({bg: kind}) => {
  if (kind === 'westminster_hyw') {
    // Westminster Hall, London: the great open timber span — hammer-beam
    // roof lines, tall lancet windows down both walls, the Thames light
    // at the far end. Interior: walls cover the sky base wall to wall.
    return <g>
      <rect x={-40} y={0} width={2000} height={700} fill="#8d7c62"/>
      <path d="M-40 0 L960 210 L1960 0 L1960 120 L960 300 L-40 120 Z" fill="#5d4630"/>
      {[-560, -280, 0, 280, 560].map((dx, i) => <path key={i} d={`M${960 + dx} 292 L${960 + dx * 1.55} 96`} stroke={INK} strokeWidth={7}/>)}
      {[120, 420, 1380, 1680].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 640 L${x} 260 Q${x + 45} 210 ${x + 90} 260 L${x + 90} 640 Z`} fill="#bcd6ea" stroke={INK} strokeWidth={3.4}/>
          <line x1={x + 45} y1={238} x2={x + 45} y2={640} stroke={INK} strokeWidth={3}/>
          <line x1={x} y1={430} x2={x + 90} y2={430} stroke={INK} strokeWidth={3}/>
        </g>
      ))}
      <path d="M880 700 L880 330 Q960 268 1040 330 L1040 700 Z" fill="#a8c8e2" stroke={INK} strokeWidth={3.6}/>
      <path d="M880 560 Q960 540 1040 562 L1040 700 L880 700 Z" fill="#3f74a8" opacity={0.8}/>
      <path d="M-40 700 L700 700 L700 660 L-40 660 Z M1220 700 L1960 700 L1960 660 L1220 660 Z" fill="#77684f"/>
      {[240, 760, 1160, 1680].map(x => <rect key={x} x={x - 30} y={596} width={60} height={64} fill="#6e5136" stroke={INK} strokeWidth={2.6}/>)}
    </g>;
  }
  if (kind === 'crecy_hyw') {
    // The Crecy ridge at evening: a broad crest running across the frame,
    // THE WINDMILL on it behind the English line, the slope falling away
    // toward the French approach, the sun low behind the English.
    return <g>
      <circle cx={330} cy={430} r={86} fill="#f4cf7d" opacity={0.9}/>
      <circle cx={330} cy={430} r={130} fill="#f4cf7d" opacity={0.28}/>
      <path d="M-40 520 Q700 428 1960 500 L1960 700 L-40 700 Z" fill="#7d8a56"/>
      <path d="M-40 700 L-40 560 Q900 500 1960 566 L1960 700 Z" fill="#8a955f"/>
      <g transform="translate(1150,470)">
        <path d="M-58 60 L-40 -120 L40 -120 L58 60 Z" fill="#cbb894" stroke={INK} strokeWidth={3.2}/>
        <path d="M-52 -120 L52 -120 L30 -152 L-30 -152 Z" fill="#8a4a3a" stroke={INK} strokeWidth={3}/>
        <g stroke={WOOD_D} strokeWidth={9} strokeLinecap="round">
          <line x1={0} y1={-138} x2={-86} y2={-224}/><line x1={0} y1={-138} x2={86} y2={-52}/>
          <line x1={0} y1={-138} x2={-86} y2={-52}/><line x1={0} y1={-138} x2={86} y2={-224}/>
        </g>
        <circle cx={0} cy={-138} r={10} fill={INK}/>
      </g>
      <path d="M-40 700 Q600 640 1960 690 L1960 700 L-40 700 Z" fill="#77683f"/>
      <Tree x={120} y={560} s={0.9}/><Tree x={1760} y={580} s={1.05}/><Tree x={1860} y={600} s={0.8}/>
    </g>;
  }
  if (kind === 'poitiers_hyw') {
    // The Maupertuis field: a long hedgerow crossing the frame with ONE
    // gap — the sunken lane the French attack funnelled into — vines to
    // the left, broken marshy ground to the right.
    return <g>
      <path d="M-40 470 Q960 420 1960 470 L1960 700 L-40 700 Z" fill="#7f9455"/>
      {Array.from({length: 9}, (_, i) => <line key={i} x1={120 + i * 90} y1={640} x2={86 + i * 90} y2={470} stroke={WOOD_D} strokeWidth={5}/>)}
      {Array.from({length: 9}, (_, i) => <path key={'v' + i} d={`M${86 + i * 90} 470 q22 -34 44 0 q-22 14 -44 0 Z`} fill="#5d8148"/>)}
      <path d="M-40 560 Q500 520 900 548 L900 700 L-40 700 Z M1060 548 Q1500 520 1960 560 L1960 700 L1060 700 Z" fill="#4f7f3f"/>
      {Array.from({length: 26}, (_, i) => <circle key={i} cx={30 + i * 36} cy={566 + (i % 3) * 8} r={17} fill="#5d8148" stroke={INK} strokeWidth={1.6}/>)}
      {Array.from({length: 26}, (_, i) => <circle key={'b' + i} cx={1090 + i * 34} cy={566 + (i % 3) * 8} r={17} fill="#5d8148" stroke={INK} strokeWidth={1.6}/>)}
      <path d="M906 700 L946 552 L1014 552 L1054 700 Z" fill="#a08a5e"/>
      <path d="M930 700 L952 560 M1030 700 L1008 560" stroke={WOOD_D} strokeWidth={4}/>
      <ellipse cx={1560} cy={640} rx={210} ry={22} fill="#5d7a52"/>
      <ellipse cx={1560} cy={634} rx={150} ry={14} fill="#7d9a72" opacity={0.8}/>
      <Tree x={240} y={520} s={1.1}/><Tree x={1700} y={510} s={0.95}/>
    </g>;
  }
  if (kind === 'siege_camp_hyw') {
    // A generic English siege camp before a walled French town (serves
    // Calais, Harfleur, Rouen, Orleans): tent rows and a palisade in the
    // foreground, stone walls and gate towers on the horizon.
    return <g>
      <path d="M-40 500 Q960 462 1960 500 L1960 700 L-40 700 Z" fill="#8a8f6a"/>
      <g>
        <rect x={560} y={330} width={800} height={150} fill={STONE} stroke={INK} strokeWidth={3.4}/>
        {[620, 760, 900, 1040, 1180].map(x => <path key={x} d={`M${x} 330 L${x} 302 L${x + 34} 302 L${x + 34} 330`} fill={STONE} stroke={INK} strokeWidth={2.2}/>)}
        <rect x={520} y={262} width={104} height={218} fill="#a08a68" stroke={INK} strokeWidth={3.2}/>
        <path d="M512 262 L572 214 L632 262 Z" fill="#6e5136" stroke={INK} strokeWidth={3}/>
        <rect x={1296} y={262} width={104} height={218} fill="#a08a68" stroke={INK} strokeWidth={3.2}/>
        <path d="M1288 262 L1348 214 L1408 262 Z" fill="#6e5136" stroke={INK} strokeWidth={3}/>
        <path d="M916 480 L916 392 Q960 366 1004 392 L1004 480 Z" fill="#4a3826"/>
        <path d="M960 480 L960 300" stroke={INK} strokeWidth={4}/><path d="M960 300 L1030 314 L960 330 Z" fill={FRA_BLUE}/>
        <path d="M1120 330 L1120 218 L1136 218 L1136 196 L1144 218 L1160 218 L1160 330" fill={STONE} stroke={INK} strokeWidth={2.6}/>
      </g>
      {Array.from({length: 15}, (_, i) => <line key={i} x1={60 + i * 128} y1={586} x2={60 + i * 128} y2={520} stroke={WOOD_D} strokeWidth={7}/>)}
      <line x1={-40} y1={548} x2={1960} y2={548} stroke={WOOD_D} strokeWidth={6}/>
      {[240, 560, 1420, 1700].map((x, i) => (
        <g key={i} transform={`translate(${x},652)`}>
          <path d="M-72 0 L0 -86 L72 0 Z" fill={i % 2 ? '#c9b088' : '#b89b72'} stroke={INK} strokeWidth={3}/>
          <line x1={0} y1={-86} x2={0} y2={-108} stroke={INK} strokeWidth={3.4}/>
          <path d="M0 -108 L34 -100 L0 -90 Z" fill={ENG_RED}/>
        </g>
      ))}
    </g>;
  }
  if (kind === 'chevauchee_hyw') {
    // The chevauchee countryside: a village street, its church tower,
    // fields — smoke columns on the horizon and one burned farm.
    return <g>
      <path d="M-40 500 Q960 452 1960 500 L1960 700 L-40 700 Z" fill="#93a05e"/>
      {[420, 760, 1240, 1620].map((x, i) => (
        <g key={i} opacity={0.55}>
          <path d={`M${x} 470 Q${x - 26} 380 ${x + 6} 300 Q${x + 30} 236 ${x + 4} 168`} fill="none" stroke="#6a6a72" strokeWidth={17} strokeLinecap="round"/>
          <path d={`M${x + 8} 300 Q${x + 34} 224 ${x + 16} 150`} fill="none" stroke="#7a7a82" strokeWidth={11} strokeLinecap="round"/>
        </g>
      ))}
      <g transform="translate(300,600)">
        <rect x={-110} y={-130} width={220} height={130} fill="#cbb894" stroke={INK} strokeWidth={3.2}/>
        <path d="M-126 -130 L0 -196 L126 -130 Z" fill="#8a4a3a" stroke={INK} strokeWidth={3.2}/>
        <rect x={-18} y={-70} width={36} height={70} fill="#4a3826"/>
      </g>
      <g transform="translate(880,580)">
        <rect x={-40} y={-230} width={80} height={230} fill={STONE} stroke={INK} strokeWidth={3.2}/>
        <path d="M-52 -230 L0 -286 L52 -230 Z" fill={STONE_D} stroke={INK} strokeWidth={3}/>
        <path d="M-14 -196 L-14 -238 Q0 -252 14 -238 L14 -196 Z" fill="#3d2c1c"/>
        <rect x={-90} y={-96} width={180} height={96} fill="#bfa87e" stroke={INK} strokeWidth={3}/>
        <path d="M-102 -96 L0 -142 L102 -96 Z" fill="#8a4a3a" stroke={INK} strokeWidth={3}/>
      </g>
      <g transform="translate(1520,610)">
        <rect x={-120} y={-104} width={240} height={104} fill="#8a7a62" stroke={INK} strokeWidth={3}/>
        <path d="M-130 -104 L-40 -150 M-40 -150 L60 -108 M60 -108 L130 -146" stroke="#241f1a" strokeWidth={10} fill="none"/>
        <path d="M-90 -104 L-60 -64 M20 -110 L44 -70 M90 -118 L104 -80" stroke="#241f1a" strokeWidth={7}/>
      </g>
      <path d="M-40 700 L560 700 L760 640 L1220 640 L1420 700 L1960 700 L1960 640 L-40 640 Z" fill="#a08a5e" opacity={0.55}/>
      <Tree x={620} y={560} s={1}/><Tree x={1180} y={548} s={0.9}/>
    </g>;
  }
  if (kind === 'agincourt_hyw') {
    // The field between the two woods: dense tree lines closing both
    // edges, a narrow newly ploughed field between them, standing water
    // in the furrows. The funnel IS the place.
    return <g>
      <path d="M-40 700 L-40 300 Q240 260 420 420 L430 700 Z" fill="#3f6030"/>
      <path d="M1960 700 L1960 300 Q1680 260 1500 420 L1490 700 Z" fill="#3f6030"/>
      {Array.from({length: 12}, (_, i) => <circle key={i} cx={60 + (i % 4) * 90} cy={330 + Math.floor(i / 4) * 110} r={64} fill="#4f7f3f" stroke={INK} strokeWidth={2}/>)}
      {Array.from({length: 12}, (_, i) => <circle key={'r' + i} cx={1860 - (i % 4) * 90} cy={330 + Math.floor(i / 4) * 110} r={64} fill="#4f7f3f" stroke={INK} strokeWidth={2}/>)}
      <path d="M430 700 L560 430 L1360 430 L1490 700 Z" fill="#6e5136"/>
      {Array.from({length: 8}, (_, i) => <path key={i} d={`M${520 + i * 110} 700 L${640 + i * 96} 436`} stroke="#4a3826" strokeWidth={7} fill="none"/>)}
      {[640, 880, 1130, 1300].map((x, i) => <ellipse key={i} cx={x} cy={560 + (i % 2) * 70} rx={86} ry={13} fill="#8fa8bc" opacity={0.85}/>)}
      <path d="M560 430 Q960 402 1360 430 L1360 452 Q960 426 560 452 Z" fill="#7a6248"/>
    </g>;
  }
  if (kind === 'orleans_hyw') {
    // Orleans from across the Loire: the walled city on the far bank,
    // the great bridge running toward camera with its BROKEN ARCH, and
    // the Tourelles fort at the bridge's near end. River band y 620-790;
    // the near bank below 790 is staging ground.
    return <g>
      <path d="M-40 620 L-40 470 Q960 430 1960 470 L1960 620 Z" fill="#8a9a6a"/>
      <g>
        <rect x={300} y={380} width={1320} height={130} fill={STONE} stroke={INK} strokeWidth={3.4}/>
        {[380, 560, 740, 1100, 1280, 1460].map(x => <path key={x} d={`M${x} 380 L${x} 352 L${x + 36} 352 L${x + 36} 380`} fill={STONE} stroke={INK} strokeWidth={2.2}/>)}
        <rect x={880} y={290} width={90} height={220} fill="#a08a68" stroke={INK} strokeWidth={3.2}/>
        <path d="M872 290 L925 236 L978 290 Z" fill="#6e5136" stroke={INK} strokeWidth={3}/>
        <path d="M925 290 L925 176 L934 176 L934 152 L942 176 L950 176 L950 290" fill={STONE} stroke={INK} strokeWidth={2.4}/>
        {[420, 640, 1180, 1420].map((x, i) => <rect key={i} x={x} y={330 - (i % 2) * 26} width={86} height={66 + (i % 2) * 26} fill="#cbb894" stroke={INK} strokeWidth={2.4}/>)}
        {[463, 683, 1223, 1463].map((x, i) => <path key={'r' + i} d={`M${x - 52} ${330 - (i % 2) * 26} L${x} ${300 - (i % 2) * 26} L${x + 52} ${330 - (i % 2) * 26} Z`} fill="#8a4a3a" stroke={INK} strokeWidth={2.4}/>)}
      </g>
      <rect x={-40} y={620} width={2000} height={170} fill="#3f74a8"/>
      <path d="M-40 668 Q480 654 960 666 Q1440 676 1960 662 L1960 790 L-40 790 Z" fill="#4d84b8" opacity={0.7}/>
      <path d="M140 716 Q260 706 380 716 M820 736 Q960 726 1100 738 M1460 712 Q1600 702 1740 714" stroke="#d8ecfa" strokeWidth={5} fill="none" opacity={0.55}/>
      <g>
        <path d="M884 790 L916 790 L908 520 L892 520 Z" fill="#a08a68" stroke={INK} strokeWidth={2.6}/>
        <path d="M1012 790 L1044 790 L1036 520 L1020 520 Z" fill="#a08a68" stroke={INK} strokeWidth={2.6}/>
        <path d="M884 520 L1044 520 L1044 492 L884 492 Z" fill={STONE} stroke={INK} strokeWidth={2.8}/>
        <path d="M908 620 Q928 586 946 620 Q928 640 908 620 Z M982 620 Q1002 586 1020 620 Q1002 640 982 620 Z" fill="#8a7a5e" stroke={INK} strokeWidth={2.2}/>
        <circle cx={964} cy={672} r={15} fill="#7a6a4e"/><circle cx={930} cy={694} r={10} fill="#8a7a5e"/>
      </g>
      <g transform="translate(964,830)">
        <rect x={-120} y={-118} width={240} height={118} fill="#a08a68" stroke={INK} strokeWidth={3.4}/>
        <circle cx={-76} cy={-118} r={37} fill={STONE} stroke={INK} strokeWidth={3}/>
        <circle cx={76} cy={-118} r={37} fill={STONE} stroke={INK} strokeWidth={3}/>
        <path d="M-113 -140 L-76 -168 L-39 -140 Z M39 -140 L76 -168 L113 -140 Z" fill="#6e5136" stroke={INK} strokeWidth={2.6}/>
        <path d="M0 0 L0 -196" stroke={INK} strokeWidth={4}/><path d="M0 -196 L64 -184 L0 -168 Z" fill={WHITE} stroke={INK} strokeWidth={1.6}/>
      </g>
      <path d="M-40 790 L1960 790 L1960 830 Q960 806 -40 826 Z" fill="#7a6a4a"/>
    </g>;
  }
  if (kind === 'domremy_hyw') {
    // Domremy: a lane of stone farmhouses, the village church where Joan
    // heard her voices, fields and river meadows, a wooded hill beyond.
    return <g>
      <path d="M-40 520 L300 330 L700 440 L1100 320 L1500 450 L1960 360 L1960 560 L-40 560 Z" fill="#5d8148"/>
      <path d="M-40 560 Q960 520 1960 560 L1960 700 L-40 700 Z" fill="#86a860"/>
      <path d="M-40 640 Q600 610 1960 646 L1960 700 L-40 700 Z" fill="#4d84b8" opacity={0.65}/>
      <g transform="translate(560,600)">
        <rect x={-34} y={-210} width={68} height={210} fill={STONE} stroke={INK} strokeWidth={3.2}/>
        <path d="M-46 -210 L0 -262 L46 -210 Z" fill={STONE_D} stroke={INK} strokeWidth={3}/>
        <circle cx={0} cy={-176} r={13} fill="#3d2c1c"/>
        <rect x={-110} y={-104} width={220} height={104} fill="#bfa87e" stroke={INK} strokeWidth={3}/>
        <path d="M-122 -104 L0 -148 L122 -104 Z" fill="#6e5136" stroke={INK} strokeWidth={3}/>
        <path d="M-16 0 L-16 -58 Q0 -72 16 -58 L16 0 Z" fill="#3d2c1c"/>
      </g>
      {[240, 1180, 1560].map((x, i) => (
        <g key={i} transform={`translate(${x},${640 + (i % 2) * 22})`}>
          <rect x={-84} y={-96} width={168} height={96} fill="#cbb894" stroke={INK} strokeWidth={3}/>
          <path d="M-96 -96 L0 -140 L96 -96 Z" fill="#8a4a3a" stroke={INK} strokeWidth={3}/>
          <rect x={-14} y={-56} width={28} height={56} fill="#4a3826"/>
          <rect x={-62} y={-66} width={26} height={26} fill="#f7e3a1" stroke={INK} strokeWidth={2}/>
        </g>
      ))}
      <path d="M-40 700 L700 700 L900 660 L1220 660 L1420 700 L1960 700 L1960 660 L-40 660 Z" fill="#a08a5e" opacity={0.6}/>
      <Tree x={900} y={580} s={1.15}/><Tree x={1760} y={590} s={1}/>
    </g>;
  }
  if (kind === 'reims_hyw') {
    // Reims Cathedral interior: the long gothic nave, columns rising out
    // of frame, pointed arches overhead, the altar and throne at the far
    // end, light falling from the high windows.
    return <g>
      <rect x={-40} y={0} width={2000} height={700} fill="#6a5c48"/>
      {[90, 420, 1390, 1720].map((x, i) => (
        <g key={i}>
          <rect x={x} y={0} width={110} height={700} fill="#7d6c52" stroke={INK} strokeWidth={3}/>
          <path d={`M${x} 330 Q${x + 55} 250 ${x + 110} 330 L${x + 110} 700 L${x} 700 Z`} fill="#59492f"/>
          <path d={`M${x + 22} 120 L${x + 22} 60 Q${x + 55} 20 ${x + 88} 60 L${x + 88} 120 Q${x + 55} 96 ${x + 22} 120 Z`} fill="#cfe0ee" opacity={0.85}/>
        </g>
      ))}
      <path d="M200 0 L760 300 L700 700 L120 700 Z" fill="#f7e3a1" opacity={0.13}/>
      <path d="M1720 0 L1160 300 L1220 700 L1800 700 Z" fill="#f7e3a1" opacity={0.13}/>
      <g transform="translate(960,640)">
        <rect x={-190} y={-190} width={380} height={190} fill="#8d7c62" stroke={INK} strokeWidth={3.4}/>
        <path d="M-190 -190 L190 -190 L150 -238 L-150 -238 Z" fill="#77684f" stroke={INK} strokeWidth={3}/>
        <circle cx={0} cy={-268} r={17} fill={GOLD} stroke={INK} strokeWidth={2.4}/>
        <line x1={0} y1={-238} x2={0} y2={-190} stroke={GOLD} strokeWidth={5}/>
        {[-120, -60, 60, 120].map(x => <rect key={x} x={x - 7} y={-168} width={14} height={86} fill={WHITE} stroke={INK} strokeWidth={1.8}/>)}
        {[-120, -60, 60, 120].map(x => <circle key={'f' + x} cx={x} cy={-176} r={7} fill="#f4a259"/>)}
        <g transform="translate(0,26)">
          <path d="M-52 0 L-44 -84 L44 -84 L52 0 Z" fill={FRA_BLUE} stroke={INK} strokeWidth={3}/>
          <path d="M-58 -84 L0 -118 L58 -84 Z" fill={FRA_BLUE_D} stroke={INK} strokeWidth={3}/>
          <circle cx={0} cy={-96} r={9} fill={GOLD}/>
        </g>
      </g>
      <path d="M-40 700 L700 700 L760 640 L1160 640 L1220 700 L1960 700 L1960 660 L-40 660 Z" fill="#77684f"/>
    </g>;
  }
  if (kind === 'sluys_hyw') {
    // The Sluys estuary, 1340: the Zwin inlet — low Flemish shore behind,
    // and across the water a line of cogs CHAINED together hull to hull,
    // a floating castle wall the French fleet sailed into. The locked
    // fleet is painted scenery; the water band runs y 470-790 and the
    // marshy near shore below 790 is staging ground.
    return <g>
      <path d="M-40 470 L-40 400 Q960 366 1960 400 L1960 470 Z" fill="#7d8a5a"/>
      <path d="M1560 400 L1560 300 L1576 300 L1576 268 L1586 300 L1602 300 L1602 400" fill="#8a7a5e"/>
      {[300, 700, 1180].map(x => <path key={x} d={`M${x} 440 l10 -34 l10 34 Z`} fill="#5d8148"/>)}
      <rect x={-40} y={470} width={2000} height={320} fill="#2f6a96"/>
      <path d="M-40 540 Q480 526 960 538 Q1440 550 1960 534 L1960 790 L-40 790 Z" fill="#3d7ca8" opacity={0.7}/>
      {[240, 520, 800, 1080, 1360, 1640].map((x, i) => (
        <g key={i} transform={`translate(${x},${640 + (i % 2) * 26})`}>
          <path d="M-86 0 L-70 -44 L70 -44 L86 0 Q0 14 -86 0 Z" fill={i % 2 ? '#6e5136' : '#7a5a38'} stroke={INK} strokeWidth={3}/>
          <rect x={-70} y={-78} width={34} height={36} fill="#5d4630" stroke={INK} strokeWidth={2.4}/>
          <rect x={36} y={-78} width={34} height={36} fill="#5d4630" stroke={INK} strokeWidth={2.4}/>
          <line x1={0} y1={-44} x2={0} y2={-168} stroke={WOOD_D} strokeWidth={5}/>
          <path d={`M0 -168 L44 -156 L0 -142 Z`} fill={i % 2 ? FRA_BLUE : ENG_RED}/>
          <line x1={86} y1={-16} x2={138} y2={-10} stroke="#3a2c1c" strokeWidth={4}/>
        </g>
      ))}
      <path d="M180 560 Q480 500 760 548 M1180 540 Q1460 492 1720 536" fill="none" stroke={INK} strokeWidth={2.4} strokeDasharray="3 9" opacity={0.6}/>
      <path d="M-40 790 L1960 790 L1960 826 Q960 802 -40 822 Z" fill="#6a7a4a"/>
    </g>;
  }
  if (kind === 'somme_hyw') {
    // Blanchetaque, 1346: the Somme at low water — a wide, pale, shallow
    // ford with gravel spits; the far bank held by the French (banner
    // line, tree line); the near bank below y 740 is staging ground, and
    // the ford band y 520-740 takes wading props by their waterline.
    return <g>
      <path d="M-40 470 L-40 380 Q960 340 1960 380 L1960 470 Z" fill="#5d8148"/>
      {Array.from({length: 10}, (_, i) => <circle key={i} cx={120 + i * 190} cy={400 + (i % 2) * 26} r={40} fill="#4f7f3f" stroke={INK} strokeWidth={1.8}/>)}
      {[420, 900, 1420].map((x, i) => (
        <g key={i} transform={`translate(${x},452)`}>
          <line x1={0} y1={0} x2={0} y2={-72} stroke={INK} strokeWidth={4}/>
          <path d="M0 -72 L52 -62 L0 -50 Z" fill={FRA_BLUE}/>
        </g>
      ))}
      <path d="M-40 470 L1960 470 L1960 520 L-40 520 Z" fill="#7a8a56"/>
      <rect x={-40} y={520} width={2000} height={220} fill="#7fa8c4"/>
      <path d="M-40 580 Q480 566 960 578 Q1440 588 1960 574 L1960 740 L-40 740 Z" fill="#9dc0d8" opacity={0.8}/>
      {[300, 760, 1240, 1620].map((x, i) => <ellipse key={i} cx={x} cy={600 + (i % 2) * 60} rx={150} ry={12} fill="#c9b088" opacity={0.75}/>)}
      <path d="M120 640 Q240 632 360 640 M760 690 Q900 682 1040 690 M1420 636 Q1560 628 1700 638" stroke="#eef6fc" strokeWidth={5} fill="none" opacity={0.7}/>
      <path d="M-40 740 L1960 740 L1960 782 Q960 758 -40 778 Z" fill="#8a7a56"/>
    </g>;
  }
  // castillon_hyw — the French artillery park IS the place: a ditched,
  // palisaded earthwork across the frame with open ground before it that
  // Talbot must cross, the Dordogne plain and a river glint behind.
  return <g>
    <path d="M-40 470 Q960 436 1960 470 L1960 560 L-40 560 Z" fill="#93a05e"/>
    <path d="M1560 470 L1960 440 L1960 500 L1560 512 Z" fill="#4d84b8" opacity={0.75}/>
    <path d="M-40 560 L1960 560 L1960 616 L-40 616 Z" fill="#5d4630"/>
    <path d="M-40 616 L1960 616 L1960 664 L-40 664 Z" fill="#77683f"/>
    {Array.from({length: 16}, (_, i) => <line key={i} x1={40 + i * 124} y1={618} x2={40 + i * 124} y2={548} stroke={WOOD_D} strokeWidth={8}/>)}
    <line x1={-40} y1={576} x2={1960} y2={576} stroke={WOOD_D} strokeWidth={6}/>
    <path d="M-40 700 L1960 700 L1960 664 L-40 664 Z" fill="#8a7a4e"/>
    {[300, 700, 1180, 1560].map((x, i) => <ellipse key={i} cx={x} cy={688} rx={90} ry={8} fill="#000" opacity={0.08}/>)}
    <Tree x={140} y={520} s={0.9}/><Tree x={1820} y={516} s={0.95}/>
  </g>;
};
export const isHundredYearsBg = (k: string): k is HundredYearsBgKind => ['westminster_hyw', 'crecy_hyw', 'poitiers_hyw', 'siege_camp_hyw', 'chevauchee_hyw', 'agincourt_hyw', 'orleans_hyw', 'domremy_hyw', 'reims_hyw', 'castillon_hyw', 'sluys_hyw', 'somme_hyw'].includes(k);
export const HUNDREDYEARS_GROUND: Partial<Record<HundredYearsBgKind, string>> = {
  westminster_hyw: '#77684f', crecy_hyw: '#8a7a4a', poitiers_hyw: '#7a6a42', siege_camp_hyw: '#8a7a4e',
  chevauchee_hyw: '#8f7c4e', agincourt_hyw: '#5d4630', orleans_hyw: '#7a6a4a', domremy_hyw: '#8f7c4e',
  reims_hyw: '#6a5a40', castillon_hyw: '#8a7a4e', sluys_hyw: '#5d7050', somme_hyw: '#8a7a56',
};
