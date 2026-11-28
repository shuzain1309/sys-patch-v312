import React from 'react';
import {INK} from './world';
import type {PropT} from './world';

// ── BULGARIA PACK (2026-11-28) ──────────────────────────────────────────────
// For the Bulgaria entire-history video (working shape: the vanishing-and-
// returning arc to 2026; emphasis is a DEFAULT awaiting Bruce's veto — see
// the design inventory). Candidate device (gate-prep proposal, NOT settled):
// THE NAME THAT NEVER CHANGED — Bulgaria kept its name for thirteen
// centuries while empires took the land; the alphabet is the second leg.
// Refrain candidate: "Empires took the land. Bulgaria kept the letters."
// Bespoke kit: the steppe horse (to the FIXED Alexander silhouette
// standard — the kit horse blob is never used), the Madara Horseman
// relief, the Pliska rosette, the alphabet board (Cyrillic / Glagolitic
// states), the lion banner, and Krum's skull cup.
// Every backdrop paints a FULL-FRAME BASE first (sky gradient + its
// ground colour to y1080) — the Alexander black-scene lesson: world.tsx
// returns a pack backdrop directly with no sky/ground base of its own.
// House colours: medieval Bulgaria gold + deep red (the lion banner);
// Byzantium imperial purple + gold; the Ottomans green + red; modern
// Bulgaria white / green / red (the tricolour, carried by kit flag art).

const BG_GOLD = '#d9a83c', BG_GOLD_L = '#f0cd72', BG_RED = '#8e2a22', BG_RED_D = '#671d16';
const BYZ_PURPLE = '#5d2a72', BYZ_GOLD = '#e8c14a';
const OTT_GREEN = '#2f6e4a', OTT_RED = '#b3312a';
const STONE = '#9a8a70', STONE_D = '#7a6a50', WOOD = '#7a6248', WOOD_D = '#5d4630';
const WHITE = '#f2ead8', BRONZE = '#a8763e', BRONZE_D = '#7d5527';

// ── THE HORSE — silhouette discipline copied from the FIXED Alexander
// HorseBody (as carried by the HYW destrier): one silhouette for barrel,
// arched neck and elongated head — muzzle narrower than the jaw, pricked
// ears, eye and nostril on the face plane; mane along the neck crest;
// tail from the rump; legs JOINTED (thicker upper, knee/hock, thinner
// cannon, hoof block), far pair behind the body, near pair in front.
// Feet at y=0. The steppe read: a slightly lighter build and a plain
// saddle blanket in the faction colour (p.c) instead of a caparison.
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
    <Leg hip={-80} knee={-73} foot={-69} upper={13}/>
    <Leg hip={70} knee={75} foot={79} upper={13}/>
    <path d="M-148 -198 Q-156 -148 -126 -126 Q-70 -104 -6 -108 Q66 -102 106 -126 Q132 -138 130 -170 Q148 -208 178 -254 Q184 -246 198 -240 L240 -216 Q252 -224 248 -238 L178 -294 Q168 -302 158 -296 Q128 -258 98 -230 Q30 -216 -60 -214 Q-120 -212 -148 -198 Z" fill={coat} stroke={INK} strokeWidth={3.6}/>
    <path d="M160 -296 L155 -323 L175 -305 Z" fill={coat} stroke={INK} strokeWidth={2.8}/>
    <path d="M177 -301 L182 -327 L193 -300 Z" fill={coat} stroke={INK} strokeWidth={2.8}/>
    <path d="M161 -301 Q170 -316 183 -303 Q172 -295 161 -301 Z" fill={mane}/>
    <path d="M158 -292 Q116 -252 88 -220" fill="none" stroke={mane} strokeWidth={11} strokeLinecap="round"/>
    {rim && <path d="M-140 -201 Q-60 -217 96 -231 Q128 -259 166 -295" fill="none" stroke={rim} strokeWidth={4} opacity={0.85}/>}
    <Leg hip={-112} knee={-103} foot={-99} upper={14}/>
    <Leg hip={97} knee={101} foot={103} upper={14}/>
    {cloth && <g>
      <path d="M-48 -222 L64 -224 L58 -150 L-40 -148 Z" fill={cloth} stroke={INK} strokeWidth={3}/>
      <path d="M-48 -222 L64 -224 L62 -204 L-46 -202 Z" fill="#000" opacity={0.14}/>
      <line x1={-42} y1={-156} x2={58} y2={-158} stroke={BG_GOLD} strokeWidth={4}/>
    </g>}
    <path d="M196 -252 Q216 -264 238 -238" fill="none" stroke={BG_GOLD} strokeWidth={4}/>
    <circle cx={207} cy={-263} r={4.6} fill={INK}/>
    <ellipse cx={240} cy={-226} rx={3.6} ry={2.6} fill={INK} transform="rotate(-32 240 -226)"/>
  </g>
  );
};

// A seated rider with a FULL body (Alexander fix standard: no floating
// torsos) — legs draped down the barrel, torso above the saddle, head and
// hat, one arm forward to the reins; the reins are drawn by the horse
// prop so hand and bit are physically connected (the chariot lesson).
const Rider: React.FC<{surcoat: string; hat: string; skin: string}> = ({surcoat, hat, skin}) => (
  <g>
    <path d="M4 -182 L36 -140 L31 -88" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round"/>
    <path d="M4 -182 L36 -140 L31 -88" fill="none" stroke={surcoat} strokeWidth={9.5} strokeLinecap="round"/>
    <path d="M-14 -182 L12 -142 L8 -94" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round"/>
    <path d="M-14 -182 L12 -142 L8 -94" fill="none" stroke={surcoat} strokeWidth={9.5} strokeLinecap="round"/>
    <path d="M-14 -258 L16 -258 L20 -178 L-10 -176 Z" fill={surcoat} stroke={INK} strokeWidth={2.8}/>
    <path d="M12 -246 L52 -214" stroke={INK} strokeWidth={10.5} strokeLinecap="round"/>
    <path d="M12 -246 L52 -214" stroke={surcoat} strokeWidth={7} strokeLinecap="round"/>
    <circle cx={2} cy={-280} r={16.5} fill={skin} stroke={INK} strokeWidth={2.4}/>
    {hat === 'khan' && <g>
      <path d="M-15 -288 Q2 -306 19 -288 L19 -278 Q2 -288 -15 -278 Z" fill="#4a3426" stroke={INK} strokeWidth={2.2}/>
      <rect x={-15} y={-292} width={34} height={7} fill={BG_GOLD} stroke={INK} strokeWidth={1.6}/>
    </g>}
    {hat === 'crown' && <path d="M-15 -290 L-13 -306 L-4 -294 L3 -308 L10 -294 L18 -306 L19 -289 Z" fill={BG_GOLD} stroke={INK} strokeWidth={2.2}/>}
    {hat === 'helm' && <path d="M-16 -282 Q2 -312 20 -282 L20 -268 Q2 -280 -16 -268 Z" fill="#9aa0a8" stroke={INK} strokeWidth={2.4}/>}
    {hat === 'cap' && <path d="M-15 -288 Q2 -302 19 -288 L19 -280 Q2 -290 -15 -280 Z" fill={WOOD_D} stroke={INK} strokeWidth={2.2}/>}
  </g>
);

export const BulgariaProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p}) => {
  if (p.k === 'horse_bg') {
    // The steppe horse: fixed Alexander silhouette, saddle blanket in the
    // faction colour (p.c), an optional full-bodied rider by p.t:
    // 'khan' (fur cap + gold band) / 'crown' / 'helm' / 'cap' / anything
    // else = riderless.
    const cloth = p.c ?? BG_RED;
    const riderHat = p.t === 'khan' ? 'khan' : p.t === 'crown' ? 'crown' : p.t === 'helm' ? 'helm' : p.t === 'cap' ? 'cap' : null;
    return <g>
      <ellipse cx={0} cy={5} rx={215} ry={13} fill="#000" opacity={0.16}/>
      <HorseBody coat="#5a4030" mane="#33241a" cloth={cloth} rim="#b09a78"/>
      {riderHat !== null && <g>
        <path d="M54 -216 Q150 -238 236 -206" fill="none" stroke="#2e2115" strokeWidth={3.4}/>
        <path d="M56 -208 Q150 -226 234 -198" fill="none" stroke="#2e2115" strokeWidth={2.8}/>
        <g transform="scale(0.94) translate(-4,-16)">
          <Rider surcoat={p.c2 ?? cloth} hat={riderHat} skin="#eec39b"/>
        </g>
      </g>}
    </g>;
  }
  if (p.k === 'madara_bg') {
    // The Madara Horseman: a standing cliff slab of pale rock, and on it
    // the carved relief — rider, horse, the dog at the horse's feet and
    // the speared lion beneath — drawn as incised lines with a relief
    // shadow, the way the carving reads in raking light. The REAL relief
    // also gets a PHOTOS pin (photos-bulgaria.json); this prop is the
    // stage-scale object for map-adjacent and chapter-card beats.
    return <g>
      <ellipse cx={0} cy={5} rx={190} ry={12} fill="#000" opacity={0.15}/>
      <path d="M-170 0 L-158 -392 L-96 -428 L118 -420 L168 -368 L176 0 Z" fill="#b3a284" stroke={INK} strokeWidth={3.6}/>
      <path d="M-170 0 L-158 -392 L-96 -428 L-84 -180 L-96 0 Z" fill="#000" opacity={0.10}/>
      <path d="M-120 -380 L-40 -342 M30 -396 L96 -330 M-140 -220 L-60 -196 M60 -160 L130 -196" stroke={INK} strokeWidth={2} opacity={0.35} fill="none"/>
      <g transform="translate(-6,-196) scale(0.92)" strokeLinecap="round">
        <path d="M-86 62 Q-98 30 -88 2 Q-40 -14 22 -10 Q66 -6 84 -22 Q96 -44 118 -70 L142 -58 L106 -30 Q118 6 96 34 Q60 58 6 54 Q-52 60 -86 62 Z" fill="none" stroke={INK} strokeWidth={5} opacity={0.78}/>
        <path d="M-52 44 L-46 96 M58 40 L64 92" stroke={INK} strokeWidth={5} opacity={0.78} fill="none"/>
        <path d="M-16 -16 L-10 -58 L26 -52 L22 -14 Z" fill="none" stroke={INK} strokeWidth={4.6} opacity={0.78}/>
        <circle cx={8} cy={-74} r={11} fill="none" stroke={INK} strokeWidth={4.4} opacity={0.78}/>
        <path d="M24 -44 L96 -6" stroke={INK} strokeWidth={4.6} opacity={0.78}/>
        <path d="M-30 108 Q10 92 58 104 L96 96" stroke={INK} strokeWidth={4.6} opacity={0.7} fill="none"/>
        <path d="M-104 96 Q-88 74 -66 84 Q-84 96 -78 110" stroke={INK} strokeWidth={4} opacity={0.7} fill="none"/>
      </g>
      <path d="M-150 -120 L150 -120 M-146 -84 L146 -84" stroke={INK} strokeWidth={2.2} opacity={0.3}/>
    </g>;
  }
  if (p.k === 'rosette_bg') {
    // The Pliska rosette: a bronze medallion — seven rays around a ring,
    // with incised sign-marks (abstract strokes standing for the runic
    // signs on the real artefact; no letterforms are claimed). It stands
    // on a low stone plinth, museum-style.
    return <g>
      <ellipse cx={0} cy={5} rx={86} ry={9} fill="#000" opacity={0.15}/>
      <path d="M-58 2 L-44 -34 L44 -34 L58 2 Z" fill={STONE} stroke={INK} strokeWidth={3}/>
      <g transform="translate(0,-118)">
        {Array.from({length: 7}, (_, i) => {
          const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
          return <path key={i} d={`M${Math.cos(a) * 30} ${Math.sin(a) * 30} L${Math.cos(a) * 62} ${Math.sin(a) * 62} L${Math.cos(a + 0.32) * 30} ${Math.sin(a + 0.32) * 30} Z`} fill={BRONZE} stroke={INK} strokeWidth={2.4}/>;
        })}
        <circle cx={0} cy={0} r={34} fill={BRONZE_D} stroke={INK} strokeWidth={3}/>
        <circle cx={0} cy={0} r={26} fill={BRONZE} stroke={INK} strokeWidth={2}/>
        <circle cx={0} cy={0} r={7} fill={BRONZE_D} stroke={INK} strokeWidth={2}/>
        {[[0, -16], [-14, 6], [14, 6]].map(([x, y], i) => (
          <path key={i} d={`M${x - 5} ${y + 6} L${x} ${y - 7} L${x + 5} ${y + 6} M${x} ${y - 1} L${x + 6} ${y - 1}`} stroke={INK} strokeWidth={2.6} fill="none"/>
        ))}
      </g>
    </g>;
  }
  if (p.k === 'alphabet_bg') {
    // The alphabet board — the device candidate's second leg. A school
    // board on two legs. State 'cyrillic' (default): rows of early
    // Cyrillic letterforms drawn as text glyphs. State 'glagolitic':
    // the older, rounder alphabet drawn as glyph-like path marks (no
    // unicode — the Glagolitic block is not safe in the render fonts).
    const glag = p.t === 'glagolitic';
    const rows = ['А Б В Г Д', 'Е Ж З И К', 'Л М Н О П', 'Р С Т У Ф'];
    const marks: Array<Array<[number, number]>> = [
      [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
      [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
      [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
    ];
    return <g>
      <ellipse cx={0} cy={5} rx={190} ry={10} fill="#000" opacity={0.14}/>
      <line x1={-140} y1={0} x2={-156} y2={-58} stroke={WOOD_D} strokeWidth={9} strokeLinecap="round"/>
      <line x1={140} y1={0} x2={156} y2={-58} stroke={WOOD_D} strokeWidth={9} strokeLinecap="round"/>
      <rect x={-188} y={-330} width={376} height={272} fill="#3d4a3a" stroke={INK} strokeWidth={4}/>
      <rect x={-188} y={-330} width={376} height={272} fill="none" stroke={WOOD} strokeWidth={10}/>
      {!glag && rows.map((r, i) => (
        <text key={i} x={0} y={-248 + i * 62} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize={47} fill="#f2ead8" letterSpacing={7}>{r}</text>
      ))}
      {glag && marks.map((row, ri) => row.map(([ci], i) => {
        const x = -144 + ci * 72, y = -268 + ri * 78;
        return <g key={`${ri}-${i}`} stroke="#f2ead8" strokeWidth={4.4} fill="none" strokeLinecap="round">
          <circle cx={x} cy={y} r={11}/>
          <path d={`M${x} ${y + 11} L${x} ${y + 30} M${x - 10} ${y + 22} L${x + 10} ${y + 22}`}/>
          {(ci + ri) % 2 === 0 && <path d={`M${x + 11} ${y - 4} L${x + 24} ${y - 4}`}/>}
        </g>;
      }))}
      <text x={0} y={-84} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize={25} fill={BG_GOLD_L}>{glag ? 'THE FIRST LETTERS' : 'THE NEW LETTERS'}</text>
    </g>;
  }
  if (p.k === 'lionbanner_bg') {
    // The lion banner: a tall war standard — deep red field, the gold
    // rampant lion of the Bulgarian tsars, gold fringe. The medieval
    // army's rallying point; also the chapter-card device candidate's
    // companion (the name on a banner that never changed).
    return <g>
      <ellipse cx={0} cy={4} rx={56} ry={8} fill="#000" opacity={0.14}/>
      <line x1={0} y1={2} x2={0} y2={-404} stroke={WOOD_D} strokeWidth={7} strokeLinecap="round"/>
      <circle cx={0} cy={-408} r={8} fill={BG_GOLD} stroke={INK} strokeWidth={2}/>
      <path d="M4 -396 L204 -382 Q186 -306 204 -230 L4 -216 Z" fill={BG_RED} stroke={INK} strokeWidth={3.2}/>
      <path d="M4 -396 L204 -382 Q200 -370 196 -352 L4 -338 Z" fill={BG_RED_D}/>
      {Array.from({length: 6}, (_, i) => <line key={i} x1={16 + i * 31} y1={-224} x2={16 + i * 31} y2={-208} stroke={BG_GOLD} strokeWidth={4}/>)}
      <g transform="translate(104,-306) scale(1.06)" strokeLinejoin="round">
        <path d="M-6 58 L-2 22 L-24 6 L-12 -6 L-30 -26 L-16 -34 L-24 -52 L-4 -50 L6 -64 L14 -48 L30 -52 L26 -34 L40 -22 L28 -12 L38 4 L20 8 L16 30 L26 52 L8 52 L2 34 L-6 44 Z" fill={BG_GOLD} stroke={INK} strokeWidth={2.8}/>
        <path d="M14 -48 L34 -58 M16 -40 L34 -42" stroke={INK} strokeWidth={2.6} fill="none"/>
        <circle cx={12} cy={-46} r={3.4} fill={INK}/>
        <path d="M-30 -26 Q-52 -18 -48 6 Q-60 -14 -44 -30" fill="none" stroke={BG_GOLD} strokeWidth={6}/>
      </g>
    </g>;
  }
  // skullcup_bg (default) — Krum's cup: the silver-lined skull of the
  // emperor Nikephoros, drawn as an artefact, not a horror prop — a
  // goblet whose bowl carries the skull's read (cranium dome, eye
  // sockets, jaw line) in pale silver with a gold rim band and stem.
  // The beat is labelled legend-framed in the fact audit tradition: the
  // cup is what the sources say Krum made; the prop is its portrait.
  return <g>
    <ellipse cx={0} cy={4} rx={64} ry={8} fill="#000" opacity={0.15}/>
    <path d="M-16 -64 L16 -64 L10 0 L-10 0 Z" fill={BRONZE} stroke={INK} strokeWidth={2.6}/>
    <ellipse cx={0} cy={2} rx={34} ry={7} fill={BRONZE_D} stroke={INK} strokeWidth={2.4}/>
    <path d="M-52 -66 L52 -66 L46 -96 L-46 -96 Z" fill="#c9ccd2" stroke={INK} strokeWidth={3}/>
    <path d="M-58 -96 Q-62 -176 0 -182 Q62 -176 58 -96 Z" fill="#d8dbe0" stroke={INK} strokeWidth={3.2}/>
    <path d="M-58 -102 L58 -102 L58 -92 L-58 -92 Z" fill={BG_GOLD} stroke={INK} strokeWidth={2}/>
    <ellipse cx={-22} cy={-138} rx={11} ry={14} fill={INK} opacity={0.82}/>
    <ellipse cx={22} cy={-138} rx={11} ry={14} fill={INK} opacity={0.82}/>
    <path d="M0 -128 L-5 -108 L6 -108 Z" fill={INK} opacity={0.7}/>
    <path d="M-26 -72 L-26 -84 M-9 -70 L-9 -84 M9 -70 L9 -84 M26 -72 L26 -84" stroke={INK} strokeWidth={2.6}/>
  </g>;
};
export const BULGARIA_PROPS = ['horse_bg', 'madara_bg', 'rosette_bg', 'alphabet_bg', 'lionbanner_bg', 'skullcup_bg'];
export const isBulgariaProp = (k: string) => BULGARIA_PROPS.includes(k);

// ── BACKDROPS ────────────────────────────────────────────────────────────────
export type BulgariaBgKind = 'pliska_bg' | 'preslav_bg' | 'danube_bg' | 'pass_bg' | 'tsarevets_bg' | 'rila_bg' | 'revival_bg' | 'sofia_bg' | 'varna_bg';
// FULL-FRAME BASE (the Alexander lesson): world.tsx returns a pack
// backdrop directly — no sky/ground base is painted by the engine on the
// pack branch. This wrapper paints the base FIRST — a day-sky gradient
// over y 0-700 and the backdrop's BULGARIA_GROUND colour over
// y 700-1080 — then the scenery on top. StageOne's tod tint still
// applies over the whole scene, so dusk/night scenes stay tinted.
export const BulgariaBg: React.FC<{bg: BulgariaBgKind; f: number; cx: number; seed: string}> = (props) => (
  <g>
    <defs>
      <linearGradient id="bgd-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7ba3cf"/>
        <stop offset="100%" stopColor="#e8dcbc"/>
      </linearGradient>
    </defs>
    <rect x={-40} y={0} width={2000} height={700} fill="url(#bgd-sky)"/>
    <rect x={-40} y={700} width={2000} height={380} fill={BULGARIA_GROUND[props.bg] ?? '#8a7a56'}/>
    <BulgariaArt {...props}/>
  </g>
);
const Tree: React.FC<{x: number; y: number; s: number; c?: string}> = ({x, y, s, c}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M0 0 L0 -120" stroke={WOOD_D} strokeWidth={11} strokeLinecap="round"/>
    <path d="M-52 -96 Q-58 -168 0 -186 Q58 -168 52 -96 Q30 -66 0 -78 Q-30 -66 -52 -96 Z" fill={c ?? '#4f7f3f'} stroke={INK} strokeWidth={2.6}/>
  </g>
);
const BulgariaArt: React.FC<{bg: BulgariaBgKind; f: number; cx: number; seed: string}> = ({bg: kind}) => {
  if (kind === 'pliska_bg') {
    // PLISKA, the first capital (681-893): a camp-city on the open
    // Danubian plain — the Great Basilica's long ruined nave on the
    // left, the khan's low stone palace walls on the right, felt tents
    // of the Bulgar camp at the edges, and nothing but steppe and sky
    // behind. The scale of the emptiness IS the place.
    return <g>
      <path d="M-40 560 Q960 520 1960 560 L1960 700 L-40 700 Z" fill="#b3a05e"/>
      <path d="M-40 640 Q960 610 1960 640 L1960 700 L-40 700 Z" fill="#a08c4e"/>
      <g transform="translate(430,600)">
        <path d="M-260 0 L-260 -150 L180 -150 L180 0 Z" fill="#c0ae84" stroke={INK} strokeWidth={3.4}/>
        <path d="M-260 -150 L-220 -196 L140 -196 L180 -150 Z" fill="#a89468" stroke={INK} strokeWidth={3.2}/>
        {[-200, -120, -40, 40, 110].map((x, i) => <path key={i} d={`M${x} -30 L${x} -104 Q${x + 20} -124 ${x + 40} -104 L${x + 40} -30 Z`} fill="#5d4c33"/>)}
        <path d="M-40 0 L-40 -150" stroke={INK} strokeWidth={3}/>
        <path d="M-296 0 L-260 -60 L-224 0 Z" fill="#8a7a5c" stroke={INK} strokeWidth={2.8}/>
      </g>
      <g transform="translate(1330,610)">
        <rect x={-240} y={-110} width={480} height={110} fill="#bfa87e" stroke={INK} strokeWidth={3.4}/>
        {[-200, -100, 0, 100].map((x, i) => <path key={i} d={`M${x} -110 L${x} -134 L${x + 44} -134 L${x + 44} -110`} fill="#bfa87e" stroke={INK} strokeWidth={2.2}/>)}
        <path d="M-26 0 L-26 -64 Q0 -84 26 -64 L26 0 Z" fill="#4a3826"/>
        <rect x={-310} y={-70} width={70} height={70} fill="#a89468" stroke={INK} strokeWidth={2.8}/>
        <rect x={240} y={-70} width={70} height={70} fill="#a89468" stroke={INK} strokeWidth={2.8}/>
      </g>
      {[130, 1790].map((x, i) => (
        <g key={i} transform={`translate(${x},660)`}>
          <path d="M-64 0 L0 -78 L64 0 Z" fill="#ddd2b8" stroke={INK} strokeWidth={3}/>
          <line x1={0} y1={-78} x2={0} y2={-100} stroke={INK} strokeWidth={3.2}/>
          <path d="M0 -100 L30 -93 L0 -84 Z" fill={BG_RED}/>
        </g>
      ))}
      <path d="M700 700 L860 640 L1180 640 L1300 700 Z" fill="#c2ab6c" opacity={0.6}/>
    </g>;
  }
  if (kind === 'preslav_bg') {
    // PRESLAV, the second capital (893-972): a greener, richer city in
    // the Ticha valley — the Round (Golden) Church with its dome at the
    // centre, a colonnaded palace court to the left, wooded hills
    // closing the frame, the river glinting below. Simeon's capital
    // reads built, where Pliska reads camped.
    return <g>
      <path d="M-40 480 L240 330 L620 430 L1020 320 L1420 440 L1960 350 L1960 560 L-40 560 Z" fill="#5d8148"/>
      <path d="M-40 560 Q960 520 1960 560 L1960 700 L-40 700 Z" fill="#7f9455"/>
      <g transform="translate(1030,610)">
        <circle cx={0} cy={-118} r={118} fill="#cbb894" stroke={INK} strokeWidth={3.6}/>
        <circle cx={0} cy={-118} r={88} fill="#bfa87e" stroke={INK} strokeWidth={2.6}/>
        <path d="M-52 -196 Q0 -268 52 -196 Z" fill={BG_GOLD} stroke={INK} strokeWidth={3.2}/>
        <line x1={0} y1={-252} x2={0} y2={-282} stroke={INK} strokeWidth={4}/>
        <circle cx={0} cy={-288} r={6} fill={BG_GOLD} stroke={INK} strokeWidth={2}/>
        {[-72, -36, 0, 36, 72].map((x, i) => <path key={i} d={`M${x} -60 L${x} -128 Q${x + 13} -144 ${x + 26} -128 L${x + 26} -60 Z`} fill="#5d4c33"/>)}
        <path d="M-16 0 L-16 -64 Q0 -82 16 -64 L16 0 Z" fill="#4a3826"/>
      </g>
      <g transform="translate(360,620)">
        <rect x={-230} y={-96} width={460} height={96} fill="#c0ae84" stroke={INK} strokeWidth={3.4}/>
        {[-190, -120, -50, 20, 90, 160].map((x, i) => <rect key={i} x={x} y={-168} width={22} height={76} fill="#d8c49a" stroke={INK} strokeWidth={2.4}/>)}
        <rect x={-240} y={-186} width={480} height={22} fill="#a89468" stroke={INK} strokeWidth={2.8}/>
        <path d="M-240 -186 L0 -224 L240 -186 Z" fill="#8a4a3a" stroke={INK} strokeWidth={3}/>
      </g>
      <path d="M-40 668 Q700 640 1960 672 L1960 700 L-40 700 Z" fill="#4d84b8" opacity={0.6}/>
      <Tree x={1620} y={580} s={1.1}/><Tree x={120} y={560} s={0.9}/>
    </g>;
  }
  if (kind === 'danube_bg') {
    // THE DANUBE: the empire's northern wall of water. The far bank is
    // a thin low green strip (the Wallachian shore); the river band
    // runs y 430-740 (fording and boat beats seat by the waterline);
    // the near bank below 740 is gravel staging ground. Asparuh's
    // crossing, the Ongal camp, a thousand years of armies looking
    // across — one composition serves them all.
    return <g>
      <path d="M-40 400 Q960 372 1960 400 L1960 430 L-40 430 Z" fill="#6d8a52"/>
      {[240, 620, 1180, 1640].map((x, i) => <path key={i} d={`M${x} 402 l9 -30 l9 30 Z`} fill="#4f7f3f"/>)}
      <rect x={-40} y={430} width={2000} height={310} fill="#4d7cae"/>
      <path d="M-40 500 Q480 486 960 498 Q1440 510 1960 494 L1960 740 L-40 740 Z" fill="#6390bd" opacity={0.75}/>
      <path d="M140 560 Q280 550 420 560 M760 620 Q920 610 1080 622 M1380 556 Q1540 546 1700 558" stroke="#dceefc" strokeWidth={5} fill="none" opacity={0.6}/>
      {[520, 900, 1330].map((x, i) => <ellipse key={i} cx={x} cy={700 + (i % 2) * 16} rx={130} ry={11} fill="#c9b088" opacity={0.7}/>)}
      <g transform="translate(1560,442)">
        <rect x={-8} y={-96} width={16} height={96} fill={WOOD_D} stroke={INK} strokeWidth={2.4}/>
        <path d="M-34 -96 L34 -96 L24 -64 L-24 -64 Z" fill={WOOD} stroke={INK} strokeWidth={2.6}/>
        <line x1={0} y1={-96} x2={0} y2={-128} stroke={INK} strokeWidth={3.4}/>
        <path d="M0 -128 L36 -120 L0 -110 Z" fill={BG_RED}/>
      </g>
      <path d="M-40 740 L1960 740 L1960 782 Q960 758 -40 778 Z" fill="#a08a5e"/>
      <path d="M-40 782 L1960 782 L1960 830 Q960 806 -40 826 Z" fill="#8a7a50"/>
    </g>;
  }
  if (kind === 'pass_bg') {
    // A BALKAN PASS: steep wooded slopes closing in from both sides to
    // a narrow winding road — the grammar of Varbitsa (811), of the
    // passes Basil II forced, and of Shipka (1877, dressed at script
    // stage with cannon props and snow). The funnel IS the place.
    return <g>
      <path d="M-40 700 L-40 180 Q420 120 760 430 L820 700 Z" fill="#46683a"/>
      <path d="M1960 700 L1960 180 Q1500 120 1160 430 L1100 700 Z" fill="#46683a"/>
      <path d="M-40 700 L300 260 Q560 200 800 470 L860 700 Z" fill="#557a45" opacity={0.85}/>
      <path d="M1960 700 L1620 260 Q1360 200 1120 470 L1060 700 Z" fill="#557a45" opacity={0.85}/>
      {Array.from({length: 14}, (_, i) => <circle key={i} cx={90 + (i % 5) * 130} cy={300 + Math.floor(i / 5) * 130} r={58} fill="#4f7f3f" stroke={INK} strokeWidth={1.8}/>)}
      {Array.from({length: 14}, (_, i) => <circle key={'r' + i} cx={1830 - (i % 5) * 130} cy={300 + Math.floor(i / 5) * 130} r={58} fill="#4f7f3f" stroke={INK} strokeWidth={1.8}/>)}
      <path d="M800 700 L910 470 L1010 470 L1120 700 Z" fill="#a08a5e"/>
      <path d="M880 700 L950 480 M1040 700 L972 480" stroke={WOOD_D} strokeWidth={4} fill="none"/>
      <path d="M910 470 L940 380 L990 380 L1010 470 Z" fill="#9a8a72"/>
      <path d="M940 380 Q960 330 980 380 Z" fill="#8a7a62"/>
      <path d="M-40 240 L360 180 L420 260 L-40 330 Z" fill="#6a7a62" opacity={0.7}/>
      <path d="M1960 240 L1560 180 L1500 260 L1960 330 Z" fill="#6a7a62" opacity={0.7}/>
    </g>;
  }
  if (kind === 'tsarevets_bg') {
    // VELIKO TARNOVO: Tsarevets hill — the Yantra gorge curving below,
    // the fortress walls climbing the steep hill, and on the summit
    // the Patriarchal church with its tall bell tower, the seat of the
    // Second Empire. Houses cascade on the far hill. The capital as a
    // crown on a rock: no other Bulgarian place reads like it.
    return <g>
      <path d="M1960 560 L1960 330 Q1560 260 1330 420 L1290 560 Z" fill="#7d8a56"/>
      {[1420, 1560, 1700, 1820].map((x, i) => (
        <g key={i} transform={`translate(${x},${430 + (i % 2) * 52})`}>
          <rect x={-44} y={-56} width={88} height={56} fill="#cbb894" stroke={INK} strokeWidth={2.2}/>
          <path d="M-52 -56 L0 -82 L52 -56 Z" fill="#8a4a3a" stroke={INK} strokeWidth={2.2}/>
        </g>
      ))}
      <path d="M-40 700 L-40 470 Q300 380 560 430 L900 470 Q1150 500 1290 560 L1290 700 Z" fill="#5d7050"/>
      <path d="M300 700 Q420 470 700 428 Q1010 396 1180 470 L1290 560 L1290 700 Z" fill="#77875a"/>
      <path d="M470 520 Q700 452 960 446 L960 486 Q700 492 470 552 Z" fill={STONE} stroke={INK} strokeWidth={3}/>
      {[560, 700, 840].map((x, i) => <path key={i} d={`M${x} ${486 - i * 4} L${x} 458 L${x + 30} 458 L${x + 30} ${490 - i * 4}`} fill={STONE} stroke={INK} strokeWidth={2}/>)}
      <g transform="translate(815,452)">
        <rect x={-56} y={-150} width={112} height={150} fill="#c0ae84" stroke={INK} strokeWidth={3.4}/>
        <path d="M-66 -150 L0 -196 L66 -150 Z" fill="#8a4a3a" stroke={INK} strokeWidth={3.2}/>
        <rect x={-17} y={-262} width={34} height={86} fill="#bfa87e" stroke={INK} strokeWidth={3}/>
        <path d="M-24 -262 L0 -292 L24 -262 Z" fill="#6e5136" stroke={INK} strokeWidth={2.8}/>
        <circle cx={0} cy={-238} r={8} fill="#3d2c1c"/>
        <path d="M-13 -88 L-13 -124 Q0 -140 13 -124 L13 -88 Z" fill="#3d2c1c"/>
      </g>
      <path d="M-40 700 Q480 640 900 660 Q1250 676 1290 700 Z" fill="#4d7cae"/>
      <path d="M100 686 Q260 676 420 686 M700 692 Q860 684 1020 694" stroke="#dceefc" strokeWidth={4} fill="none" opacity={0.55}/>
      <path d="M1290 560 L1960 560 L1960 700 L1290 700 Z" fill="#4d7cae" opacity={0.9}/>
    </g>;
  }
  if (kind === 'rila_bg') {
    // RILA MONASTERY: the striped black-and-white arcades of the
    // residential wings, the domed church at the courtyard's centre,
    // Hrelyu's medieval tower behind, and the pine ridges of Rila
    // mountain closing the frame. The visual icon of the faith that
    // carried the name through the Ottoman centuries.
    return <g>
      <path d="M-40 470 L260 240 L560 380 L900 210 L1240 390 L1560 250 L1960 420 L1960 560 L-40 560 Z" fill="#3f6030"/>
      {Array.from({length: 10}, (_, i) => <path key={i} d={`M${80 + i * 190} 470 l14 -52 l14 52 Z`} fill="#2f5230"/>)}
      <g transform="translate(300,600)">
        <rect x={-46} y={-240} width={92} height={240} fill="#a08a68" stroke={INK} strokeWidth={3.4}/>
        <path d="M-56 -240 L0 -282 L56 -240 Z" fill="#6e5136" stroke={INK} strokeWidth={3}/>
        {[0, 1, 2].map((r) => <path key={r} d={`M-26 ${-70 - r * 56} L-26 ${-102 - r * 56} Q0 ${-116 - r * 56} 26 ${-102 - r * 56} L26 ${-70 - r * 56} Z`} fill="#3d2c1c"/>)}
      </g>
      {[660, 1260].map((cx, side) => (
        <g key={side} transform={`translate(${cx},620)`}>
          <rect x={-280} y={-170} width={560} height={170} fill="#e6ddc8" stroke={INK} strokeWidth={3.4}/>
          {[0, 1].map((r) => (
            <g key={r}>
              <rect x={-280} y={-170 + r * 82} width={560} height={26} fill="#2e2a26"/>
              {[-224, -140, -56, 28, 112, 196].map((x, i) => <path key={i} d={`M${x} ${-58 + r * 82} L${x} ${-96 + r * 82} Q${x + 24} ${-110 + r * 82} ${x + 48} ${-96 + r * 82} L${x + 48} ${-58 + r * 82} Z`} fill="#59492f"/>)}
            </g>
          ))}
          <path d="M-292 -170 L0 -208 L292 -170 Z" fill="#8a4a3a" stroke={INK} strokeWidth={3.2}/>
        </g>
      ))}
      <g transform="translate(960,640)">
        <rect x={-120} y={-128} width={240} height={128} fill="#cbb894" stroke={INK} strokeWidth={3.4}/>
        <path d="M-70 -128 Q-66 -196 0 -200 Q66 -196 70 -128 Z" fill="#7a8a99" stroke={INK} strokeWidth={3.2}/>
        <line x1={0} y1={-200} x2={0} y2={-228} stroke={INK} strokeWidth={4}/>
        <path d="M-8 -228 L8 -228 M0 -236 L0 -220" stroke={BG_GOLD} strokeWidth={4}/>
        {[-72, 0, 72].map((x, i) => <path key={i} d={`M${x - 14} -40 L${x - 14} -84 Q${x} -98 ${x + 14} -84 L${x + 14} -40 Z`} fill="#3d2c1c"/>)}
      </g>
      <path d="M-40 700 L560 700 L700 660 L1220 660 L1360 700 L1960 700 L1960 660 L-40 660 Z" fill="#b8a888" opacity={0.7}/>
    </g>;
  }
  if (kind === 'revival_bg') {
    // A REVIVAL TOWN (Koprivshtitsa's grammar): painted merchant
    // houses with overhanging upper floors in ochre, rose and blue
    // along a cobbled lane, a hump-backed stone bridge over the
    // stream, Balkan foothills behind. The nineteenth century's
    // prosperity — and the April Uprising's first shots — live here.
    return <g>
      <path d="M-40 500 L300 350 L700 440 L1100 340 L1500 450 L1960 370 L1960 560 L-40 560 Z" fill="#5d8148"/>
      <path d="M-40 560 Q960 520 1960 560 L1960 700 L-40 700 Z" fill="#7a8a56"/>
      {[
        {x: 260, c: '#d9a05a', r: '#8a4a3a'}, {x: 620, c: '#c97b84', r: '#6e3a4a'},
        {x: 1300, c: '#7a9ab8', r: '#4a5a78'}, {x: 1660, c: '#d9c27a', r: '#8a6a3a'},
      ].map((h, i) => (
        <g key={i} transform={`translate(${h.x},${618 - (i % 2) * 14})`}>
          <rect x={-120} y={-128} width={240} height={128} fill={h.c} stroke={INK} strokeWidth={3.2}/>
          <rect x={-138} y={-196} width={276} height={76} fill={h.c} stroke={INK} strokeWidth={3.2}/>
          <rect x={-138} y={-196} width={276} height={16} fill="#000" opacity={0.12}/>
          <path d="M-150 -196 L0 -248 L150 -196 Z" fill={h.r} stroke={INK} strokeWidth={3.2}/>
          {[-88, -30, 28, 86].map((x, j) => <rect key={j} x={x} y={-178} width={34} height={44} fill="#f7e3a1" stroke={INK} strokeWidth={2.2}/>)}
          {[-70, 0, 70].map((x, j) => <rect key={'d' + j} x={x} y={-96} width={30} height={40} fill="#e8e2d2" stroke={INK} strokeWidth={2}/>)}
          <rect x={-16} y={-64} width={32} height={64} fill="#4a3826"/>
        </g>
      ))}
      <g transform="translate(960,676)">
        <path d="M-190 24 Q0 -52 190 24 L190 44 L-190 44 Z" fill={STONE} stroke={INK} strokeWidth={3.2}/>
        <path d="M-190 24 Q0 -52 190 24" fill="none" stroke={STONE_D} strokeWidth={8}/>
        <path d="M-190 44 L190 44 L190 60 L-190 60 Z" fill="#4d7cae"/>
      </g>
      <path d="M-40 700 L700 700 L760 668 L1160 668 L1220 700 L1960 700 L1960 664 L-40 664 Z" fill="#9a8a72" opacity={0.8}/>
      <Tree x={80} y={580} s={1}/><Tree x={1880} y={570} s={0.95}/>
    </g>;
  }
  if (kind === 'sofia_bg') {
    // SOFIA under Vitosha: the mountain's long dark massif fills the
    // sky behind the city, and at the centre the gold domes of the
    // Alexander Nevsky Cathedral rise over the rooftops — the capital
    // from 1879 to the euro, in one composition.
    return <g>
      <path d="M-40 520 L200 190 L520 330 L860 150 L1200 320 L1520 210 L1960 380 L1960 560 L-40 560 Z" fill="#5a6a72"/>
      <path d="M860 150 L800 210 L920 210 Z" fill="#eef3f8"/>
      <path d="M-40 560 Q960 520 1960 560 L1960 700 L-40 700 Z" fill="#8a8f7a"/>
      {[120, 420, 1420, 1720].map((x, i) => (
        <g key={i} transform={`translate(${x},${640 - (i % 2) * 26})`}>
          <rect x={-96} y={-120} width={192} height={120} fill={i % 2 ? '#b8a888' : '#a89a80'} stroke={INK} strokeWidth={2.8}/>
          <path d="M-106 -120 L0 -158 L106 -120 Z" fill="#7a4a3a" stroke={INK} strokeWidth={2.8}/>
          {[-58, 0, 58].map((wx, j) => <rect key={j} x={wx - 13} y={-92} width={26} height={34} fill="#f7e3a1" stroke={INK} strokeWidth={1.8}/>)}
        </g>
      ))}
      <g transform="translate(960,650)">
        <rect x={-210} y={-140} width={420} height={140} fill="#ddd2b8" stroke={INK} strokeWidth={3.6}/>
        {[-150, -50, 50, 150].map((x, i) => <path key={i} d={`M${x - 20} -30 L${x - 20} -92 Q${x} -110 ${x + 20} -92 L${x + 20} -30 Z`} fill="#3d4a44"/>)}
        <path d="M-58 -140 Q-54 -216 0 -222 Q54 -216 58 -140 Z" fill={BG_GOLD} stroke={INK} strokeWidth={3.2}/>
        <path d="M-150 -140 Q-146 -192 -118 -196 Q-90 -192 -86 -140 Z M86 -140 Q90 -192 118 -196 Q146 -192 150 -140 Z" fill={BG_GOLD} stroke={INK} strokeWidth={2.8}/>
        <line x1={0} y1={-222} x2={0} y2={-254} stroke={INK} strokeWidth={4}/>
        <path d="M-9 -254 L9 -254 M0 -264 L0 -246" stroke={BG_GOLD} strokeWidth={4.4}/>
        <rect x={-30} y={-196} width={60} height={30} fill="#c9b088" stroke={INK} strokeWidth={2.4}/>
      </g>
      <path d="M-40 700 L700 700 L760 664 L1160 664 L1220 700 L1960 700 L1960 664 L-40 664 Z" fill="#9096a0" opacity={0.65}/>
    </g>;
  }
  // varna_bg — THE BLACK SEA AT VARNA: a curving bay, the sea band
  // running y 520-800 on the right two-thirds (vessels seat by the
  // measured offsets from its surface), a sandy shore sweeping in from
  // the left, a low green headland behind. The Varna gold beat, the
  // Greek colonies, the Russian fleet of 1828 and the modern port all
  // stage on this one shore.
  return <g>
    <path d="M-40 430 L340 330 L760 400 L1180 320 L1960 400 L1960 520 L-40 520 Z" fill="#6d8a52"/>
    <path d="M1180 320 L1420 380 L1420 520 L1180 520 Z" fill="#5d7a48"/>
    {[1260, 1340].map((x, i) => <rect key={i} x={x} y={420 - i * 30} width={52} height={70 + i * 30} fill="#cbb894" stroke={INK} strokeWidth={2.4}/>)}
    <rect x={-40} y={520} width={2000} height={280} fill="#2f6a96"/>
    <path d="M-40 590 Q480 576 960 588 Q1440 600 1960 584 L1960 800 L-40 800 Z" fill="#3d7ca8" opacity={0.72}/>
    <path d="M-40 800 Q500 700 900 690 L1960 690 L1960 800 Z" fill="#e0c48a"/>
    <path d="M-40 800 Q500 700 900 690" fill="none" stroke="#c9a86a" strokeWidth={6}/>
    <path d="M200 640 Q340 632 480 640 M1100 636 Q1260 628 1420 638 M1560 700 Q1700 692 1840 702" stroke="#dceefc" strokeWidth={5} fill="none" opacity={0.6}/>
    <Tree x={180} y={500} s={1}/><Tree x={560} y={480} s={0.85}/>
  </g>;
};
export const isBulgariaBg = (k: string): k is BulgariaBgKind => ['pliska_bg', 'preslav_bg', 'danube_bg', 'pass_bg', 'tsarevets_bg', 'rila_bg', 'revival_bg', 'sofia_bg', 'varna_bg'].includes(k);
export const BULGARIA_GROUND: Partial<Record<BulgariaBgKind, string>> = {
  pliska_bg: '#a08c4e', preslav_bg: '#7a6a42', danube_bg: '#8a7a50', pass_bg: '#5d7050',
  tsarevets_bg: '#6a7a4e', rila_bg: '#8a7a56', revival_bg: '#8f7c4e', sofia_bg: '#7d7a6a', varna_bg: '#c9a86a',
};
