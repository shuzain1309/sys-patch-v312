import React from 'react';
import {INK} from './world';
import type {PropT} from './world';

// ── ALEXANDER PACK (2026-11-27) ─────────────────────────────────────────────
// For "How Alexander the Great Conquered the World in 20 Minutes".
// Signature device: THE MAP THAT GREW — a parchment conquest map
// (conquest_map_ax) whose gold extent grows state by state on the device
// beats (macedon → greece → anatolia → egypt → persia → east → indus) and
// ends fractured in three successor colours. Chapter cards carry board +
// backdrop only — no staged props or characters. Refrain (exactly 3x in the
// script, at the master-map returns): "And the map grew."
// Bespoke hero kit: Bucephalus (black horse, white star, gold tack), the
// Macedonian phalanx with sarissas, the Companion cavalry wedge, a war
// elephant of the Hydaspes, Tyre siege works (tower / ram / mole), the
// Gordian knot cart, and Alexander's planted spear at Troy.
// Backdrop water discipline (2026-11-26 measured convention): river and
// sea bands sit at y 540→700 (statia grammar) with grounded foreground
// below 700, so actors at feet-990 stand on the near bank / shore, never
// in the water; anything IN the band is placed by its art waterline.

const GOLD = '#d9a83c', GOLD_D = '#b8892f', GOLD_L = '#f0cd72';
const MACEDON_RED = '#8c2f26', PERSIA = '#33506e', STONE = '#9a8a70';

// ── PROPS ────────────────────────────────────────────────────────────────────
// The horse, redrawn 2026-11-27 (fix pass): one silhouette for barrel,
// arched neck and elongated head — muzzle narrower than the jaw, pricked
// ears, eye and nostril placed on the face plane; mane stroked along the
// neck crest; tail flowing from the rump; legs JOINTED (thicker upper,
// knee/hock, thinner cannon, hoof block), far pair drawn behind the body,
// near pair in front. Feet stay at y=0 so every delivered placement and
// waterline still holds. `rim` draws a light stroke along the back and
// crest so a dark coat (Bucephalus) separates from dark grounds.
const HorseBody: React.FC<{coat: string; mane: string; cloth?: boolean; star?: boolean; rim?: string}> = ({coat, mane, cloth, star, rim}) => {
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
    {star && <path d="M216 -266 l5 10 11 1 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -1 Z" fill="#f2ead8" stroke={INK} strokeWidth={1.6}/>}
    {cloth && <g>
      <path d="M-40 -222 L64 -224 L56 -150 L-32 -148 Z" fill={MACEDON_RED} stroke={INK} strokeWidth={3}/>
      <circle cx={12} cy={-186} r={16} fill={GOLD} stroke={INK} strokeWidth={2.4}/>
      {Array.from({length: 8}, (_, i) => { const a = (i / 8) * Math.PI * 2; return <line key={i} x1={12 + Math.cos(a) * 19} y1={-186 + Math.sin(a) * 19} x2={12 + Math.cos(a) * 26} y2={-186 + Math.sin(a) * 26} stroke={GOLD_D} strokeWidth={3}/>; })}
    </g>}
    <path d="M196 -252 Q216 -264 238 -238" fill="none" stroke={GOLD_D} strokeWidth={4.5}/>
    <circle cx={207} cy={-263} r={4.6} fill={INK}/>
    <ellipse cx={240} cy={-226} rx={3.6} ry={2.6} fill={INK} transform="rotate(-32 240 -226)"/>
  </g>
  );
};

export const AlexanderProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p}) => {
  const state = p.t ?? 'macedon';
  if (p.k === 'bucephalus_ax') {
    // Bucephalus: the black horse with the white star, gold tack, and the
    // red saddle cloth carrying the Macedonian sun.
    return <g>
      <ellipse cx={0} cy={4} rx={210} ry={13} fill="#000" opacity={0.16}/>
      <HorseBody coat="#26221f" mane="#17140f" cloth star rim="#8a7d68"/>
    </g>;
  }
  if (p.k === 'phalanx_ax') {
    // The Macedonian phalanx: two ranks of helmets and round shields, a
    // hedge of sarissa pikes angled up and forward over them.
    const rows = [0, 1];
    return <g>
      <ellipse cx={0} cy={6} rx={360} ry={14} fill="#000" opacity={0.15}/>
      {rows.map(r => (
        <g key={r} transform={`translate(${-275 + r * 26},${-118 + r * 62})`}>
          {Array.from({length: 6 - 0}, (_, i) => (
            <g key={i} transform={`translate(${i * 104},0)`}>
              <circle cx={0} cy={-58} r={21} fill="#e8b98a" stroke={INK} strokeWidth={2.6}/>
              <path d="M-24 -66 Q0 -96 24 -66 L24 -56 Q0 -70 -24 -56 Z" fill="#8a8f96" stroke={INK} strokeWidth={2.6}/>
              <circle cx={4} cy={6} r={37} fill={GOLD_D} stroke={INK} strokeWidth={3}/>
              <circle cx={4} cy={6} r={15} fill={GOLD} stroke={INK} strokeWidth={2.2}/>
              <path d="M-16 34 L24 34 L20 62 L-12 62 Z" fill={MACEDON_RED} stroke={INK} strokeWidth={2.6}/>
            </g>
          ))}
        </g>
      ))}
      {Array.from({length: 11}, (_, i) => (
        <line key={i} x1={-290 + i * 56} y1={-40} x2={-150 + i * 56} y2={-330 - (i % 3) * 22} stroke="#6e5136" strokeWidth={5} strokeLinecap="round"/>
      ))}
      {Array.from({length: 11}, (_, i) => (
        <path key={'t' + i} d={`M${-150 + i * 56} ${-330 - (i % 3) * 22} l7 15 l-13 2 Z`} fill="#c8ccd2" stroke={INK} strokeWidth={1.6}/>
      ))}
    </g>;
  }
  if (p.k === 'companions_ax') {
    // The Companion cavalry: a wedge of three riders, lances couched,
    // cloaks flying — the hammer that follows the phalanx anvil.
    // Rider redrawn 2026-11-27 (fix pass): seated AT the saddle point of
    // the 0.82-scaled horse (back line ≈ -176), legs draped down the
    // barrel — thigh to a forward knee, shin to a boot beside the belly —
    // torso, head and helmet at full height above the back, arm forward
    // to the couched lance. (The first cut floated a head + spear over
    // the horse with the torso hanging in air.)
    const Rider: React.FC<{x: number; y: number; s: number; coat: string; cloak: string}> = ({x, y, s, coat, cloak}) => (
      <g transform={`translate(${x},${y}) scale(${s})`}>
        <g transform="scale(0.82)"><HorseBody coat={coat} mane="#3a2c1c"/></g>
        <path d="M-2 -246 Q-46 -234 -54 -176 Q-32 -194 -12 -202 Z" fill={cloak} stroke={INK} strokeWidth={2.6}/>
        <path d="M6 -176 L34 -138 L30 -92" fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round"/>
        <path d="M6 -176 L34 -138 L30 -92" fill="none" stroke="#54423a" strokeWidth={9} strokeLinecap="round"/>
        <path d="M-12 -252 L14 -252 L18 -176 L-8 -174 Z" fill="#7a4a2e" stroke={INK} strokeWidth={2.6}/>
        <path d="M10 -174 L42 -134 L38 -88" fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round"/>
        <path d="M10 -174 L42 -134 L38 -88" fill="none" stroke="#54423a" strokeWidth={9} strokeLinecap="round"/>
        <circle cx={2} cy={-272} r={16} fill="#eec39a" stroke={INK} strokeWidth={2.4}/>
        <path d="M-14 -278 Q2 -300 18 -278 L18 -270 Q2 -282 -14 -270 Z" fill="#8a8f96" stroke={INK} strokeWidth={2.4}/>
        <path d="M12 -242 L48 -208" stroke="#7a4a2e" strokeWidth={9} strokeLinecap="round"/>
        <line x1={34} y1={-200} x2={214} y2={-172} stroke="#6e5136" strokeWidth={5} strokeLinecap="round"/>
        <path d="M214 -172 l20 4 l-16 9 Z" fill="#c8ccd2" stroke={INK} strokeWidth={1.6}/>
      </g>
    );
    return <g>
      <ellipse cx={0} cy={6} rx={330} ry={13} fill="#000" opacity={0.15}/>
      <Rider x={-215} y={-16} s={0.86} coat="#5d4630" cloak="#54423a"/>
      <Rider x={195} y={-22} s={0.9} coat="#7a6248" cloak="#37474f"/>
      <Rider x={-10} y={6} s={1} coat="#33302c" cloak={MACEDON_RED}/>
    </g>;
  }
  if (p.k === 'elephant_ax') {
    // A war elephant of Porus's line: grey bulk, gold-trimmed howdah,
    // mahout on the neck, tusks down. Feet at origin; the art waterline
    // for river scenes is the leg mid-depth, about y -70.
    return <g>
      <ellipse cx={0} cy={6} rx={265} ry={14} fill="#000" opacity={0.16}/>
      {[-128, -76, 88, 140].map((x, i) => (
        <g key={i}><path d={`M${x} -120 L${x + 4} 0`} stroke={INK} strokeWidth={27} strokeLinecap="round"/><path d={`M${x} -120 L${x + 4} 0`} stroke="#8d8d94" strokeWidth={19} strokeLinecap="round"/></g>
      ))}
      <path d="M-185 -128 Q-205 -268 -110 -308 L96 -316 Q176 -314 188 -238 L196 -150 Q198 -120 160 -116 L-130 -112 Q-172 -112 -185 -128 Z" fill="#9a9aa2" stroke={INK} strokeWidth={3.8}/>
      <path d="M150 -300 Q226 -312 238 -238 Q246 -176 214 -138 Q196 -116 168 -128 Q196 -196 178 -252 Q166 -288 150 -300 Z" fill="#8d8d94" stroke={INK} strokeWidth={3.4}/>
      <circle cx={196} cy={-238} r={5.4} fill={INK}/>
      <path d="M232 -176 Q252 -120 226 -66" fill="none" stroke="#e8e2d2" strokeWidth={9} strokeLinecap="round"/>
      <path d="M206 -148 Q214 -104 196 -74" fill="none" stroke="#e8e2d2" strokeWidth={7} strokeLinecap="round"/>
      <path d="M238 -236 Q262 -190 250 -128" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round"/>
      <path d="M238 -236 Q262 -190 250 -128" fill="none" stroke="#9a9aa2" strokeWidth={6} strokeLinecap="round"/>
      <g>
        <path d="M-58 -316 L74 -316 L74 -396 L-58 -396 Z" fill="#7a4a2e" stroke={INK} strokeWidth={3.2}/>
        <path d="M-70 -396 L86 -396 L74 -424 L-58 -424 Z" fill={MACEDON_RED} stroke={INK} strokeWidth={3}/>
        <line x1={-58} y1={-356} x2={74} y2={-356} stroke={GOLD} strokeWidth={5}/>
        <circle cx={8} cy={-330} r={9} fill={GOLD} stroke={INK} strokeWidth={2}/>
      </g>
      <circle cx={128} cy={-330} r={13} fill="#c98d5f" stroke={INK} strokeWidth={2.4}/>
      <path d="M116 -318 L142 -318 L146 -292 L112 -292 Z" fill="#e3dbc6" stroke={INK} strokeWidth={2.4}/>
    </g>;
  }
  if (p.k === 'siege_ax') {
    if (state === 'ram') {
      return <g>
        <ellipse cx={0} cy={6} rx={270} ry={13} fill="#000" opacity={0.15}/>
        <path d="M-230 0 L-196 -168 L196 -168 L230 0 Z" fill="#7a6248" stroke={INK} strokeWidth={3.6}/>
        <path d="M-196 -168 L196 -168 L182 -206 L-182 -206 Z" fill="#5d4630" stroke={INK} strokeWidth={3.4}/>
        {[-150, -50, 50, 150].map(x => <line key={x} x1={x} y1={-160} x2={x - 12} y2={-12} stroke={INK} strokeWidth={4}/>)}
        <line x1={-120} y1={-96} x2={150} y2={-96} stroke="#4a3826" strokeWidth={17} strokeLinecap="round"/>
        <path d="M150 -96 l44 -13 l0 26 Z" fill="#8a8f96" stroke={INK} strokeWidth={2.6}/>
        {[-168, 168].map(x => <g key={x}><circle cx={x} cy={-14} r={21} fill="#4a3826" stroke={INK} strokeWidth={3}/><circle cx={x} cy={-14} r={7} fill={GOLD_D}/></g>)}
      </g>;
    }
    if (state === 'mole') {
      // The Tyre causeway: a rubble stone arm reaching across the water.
      return <g>
        <path d="M-360 0 L360 0 L318 -64 L-318 -64 Z" fill={STONE} stroke={INK} strokeWidth={3.6}/>
        {[-280, -170, -60, 60, 170, 280].map((x, i) => <circle key={i} cx={x} cy={-30 - (i % 2) * 14} r={13 + (i % 3) * 5} fill="#8a7a5e" stroke={INK} strokeWidth={2.4}/>)}
        <path d="M-370 -70 Q-240 -84 -110 -70 Q20 -56 150 -70 Q260 -82 370 -70" fill="none" stroke="#cfe9ff" strokeWidth={5} opacity={0.65}/>
        <path d="M-330 -96 Q-200 -108 -70 -96 M120 -100 Q230 -110 340 -98" fill="none" stroke="#cfe9ff" strokeWidth={4} opacity={0.45}/>
      </g>;
    }
    // tower (default)
    return <g>
      <ellipse cx={0} cy={6} rx={215} ry={13} fill="#000" opacity={0.15}/>
      <rect x={-148} y={-430} width={296} height={430} fill="#8a6c46" stroke={INK} strokeWidth={3.8}/>
      {[-320, -215, -110].map(y => <line key={y} x1={-148} y1={y} x2={148} y2={y} stroke={INK} strokeWidth={4}/>)}
      {[-90, 30].map(x => <line key={x} x1={x} y1={-430} x2={x} y2={0} stroke={INK} strokeWidth={4}/>)}
      <path d="M-162 -430 L162 -430 L132 -478 L-132 -478 Z" fill="#5d4630" stroke={INK} strokeWidth={3.4}/>
      <path d="M60 -300 L148 -300 L148 -196 L104 -196 L104 -252 L60 -252 Z" fill="#6e5136" stroke={INK} strokeWidth={3}/>
      <rect x={-118} y={-392} width={52} height={58} fill="#3d2c1c"/>
      {[-96, 96].map(x => <g key={x}><circle cx={x} cy={-16} r={24} fill="#4a3826" stroke={INK} strokeWidth={3}/><circle cx={x} cy={-16} r={8} fill={GOLD_D}/></g>)}
      <path d="M-148 -478 L-196 -430" stroke={INK} strokeWidth={5}/><path d="M-196 -478 L-160 -462 L-196 -446 Z" fill={MACEDON_RED} stroke={INK} strokeWidth={2.4}/>
    </g>;
  }
  if (p.k === 'knot_ax') {
    // The wagon at Gordium: great wheels, a yoke pole, and the famous
    // tangle of cornel bark that no hand could undo.
    return <g>
      <ellipse cx={0} cy={6} rx={250} ry={12} fill="#000" opacity={0.15}/>
      {[-138, 138].map(x => (
        <g key={x}>
          <circle cx={x} cy={-72} r={72} fill="none" stroke={INK} strokeWidth={9}/>
          <circle cx={x} cy={-72} r={72} fill="none" stroke="#7a6248" strokeWidth={5}/>
          <circle cx={x} cy={-72} r={13} fill="#5d4630" stroke={INK} strokeWidth={3}/>
          {[0, 60, 120].map(a => <line key={a} x1={x - Math.cos(a * Math.PI / 180) * 66} y1={-72 - Math.sin(a * Math.PI / 180) * 66} x2={x + Math.cos(a * Math.PI / 180) * 66} y2={-72 + Math.sin(a * Math.PI / 180) * 66} stroke="#7a6248" strokeWidth={5}/>)}
        </g>
      ))}
      <rect x={-168} y={-196} width={336} height={26} fill="#8a6c46" stroke={INK} strokeWidth={3.4}/>
      <path d="M-168 -196 L-140 -238 L140 -238 L168 -196" fill="#a07c4e" stroke={INK} strokeWidth={3.2}/>
      <path d="M0 -196 L236 -252" stroke="#6e5136" strokeWidth={11} strokeLinecap="round"/>
      <g transform="translate(196,-240)">
        {Array.from({length: 7}, (_, i) => { const a = i * 0.9; return <ellipse key={i} cx={Math.cos(a) * 17} cy={Math.sin(a) * 12} rx={30 - (i % 3) * 5} ry={19 - (i % 2) * 4} fill="none" stroke={i % 2 ? '#8a6c46' : '#6e5136'} strokeWidth={6} transform={`rotate(${i * 24})`}/>; })}
        <circle cx={0} cy={0} r={9} fill="#54432c"/>
      </g>
    </g>;
  }
  if (p.k === 'spear_ax') {
    // The spear at Troy: planted in Asian soil, shield at its foot.
    return <g>
      <ellipse cx={0} cy={4} rx={130} ry={9} fill="#000" opacity={0.15}/>
      <path d="M-90 0 Q0 -26 90 0 L70 8 L-70 8 Z" fill="#8a6c46" stroke={INK} strokeWidth={2.6}/>
      <line x1={-8} y1={-6} x2={64} y2={-330} stroke="#6e5136" strokeWidth={7} strokeLinecap="round"/>
      <path d="M64 -330 l26 -34 l4 44 Z" fill="#c8ccd2" stroke={INK} strokeWidth={2.2}/>
      <circle cx={-58} cy={-52} r={50} fill={GOLD_D} stroke={INK} strokeWidth={3.4}/>
      <circle cx={-58} cy={-52} r={21} fill={GOLD} stroke={INK} strokeWidth={2.4}/>
      <path d="M64 -330 L118 -306 L70 -282 Z" fill={MACEDON_RED} stroke={INK} strokeWidth={2.2}/>
    </g>;
  }
  if (p.k === 'chariot_ax') {
    // Darius's chariot, drawn for this pack 2026-11-27 (fix pass): the
    // kit 'chariot' prop's horse was a blob and its reins floated free of
    // the driver. Here the redrawn horse is joined to the cab by two
    // shaft poles landing on its barrel, and twin reins run in sagging
    // curves from the driver's hands to the bit. The driver stands IN
    // the cab — legs behind the Persian-blue front panel, torso and
    // tiara above it. Feet (horse hooves, wheel) at y=0.
    return <g>
      <ellipse cx={130} cy={6} rx={330} ry={13} fill="#000" opacity={0.15}/>
      <g transform="translate(350,0) scale(0.78)"><HorseBody coat="#6e5136" mane="#3a2c1c"/></g>
      <line x1={96} y1={-96} x2={302} y2={-128} stroke="#6e5136" strokeWidth={7} strokeLinecap="round"/>
      <line x1={96} y1={-78} x2={300} y2={-102} stroke="#6e5136" strokeWidth={7} strokeLinecap="round"/>
      <path d="M64 -206 Q300 -240 514 -194" fill="none" stroke="#3a2c1c" strokeWidth={3.5}/>
      <path d="M64 -197 Q300 -226 512 -186" fill="none" stroke="#3a2c1c" strokeWidth={3}/>
      <circle cx={-6} cy={-64} r={62} fill="none" stroke={INK} strokeWidth={9}/>
      <circle cx={-6} cy={-64} r={62} fill="none" stroke="#7a6248" strokeWidth={5}/>
      <circle cx={-6} cy={-64} r={12} fill="#5d4630" stroke={INK} strokeWidth={3}/>
      {[0, 60, 120].map(a => <line key={a} x1={-6 - Math.cos(a * Math.PI / 180) * 56} y1={-64 - Math.sin(a * Math.PI / 180) * 56} x2={-6 + Math.cos(a * Math.PI / 180) * 56} y2={-64 + Math.sin(a * Math.PI / 180) * 56} stroke="#7a6248" strokeWidth={5}/>)}
      <rect x={-84} y={-100} width={172} height={12} fill="#8a6c46" stroke={INK} strokeWidth={3}/>
      <path d="M88 -88 L88 -196 Q40 -214 -20 -200 L-84 -176 L-84 -88 Z" fill={PERSIA} stroke={INK} strokeWidth={3.2}/>
      <path d="M84 -188 Q40 -204 -16 -192" fill="none" stroke={GOLD} strokeWidth={4}/>
      <path d="M-14 -252 L22 -252 L24 -176 L-12 -174 Z" fill="#8c5a2e" stroke={INK} strokeWidth={2.6}/>
      <circle cx={4} cy={-272} r={15.5} fill="#c98d5f" stroke={INK} strokeWidth={2.4}/>
      <rect x={-12} y={-289} width={32} height={11} fill={GOLD} stroke={INK} strokeWidth={2}/>
      <path d="M18 -240 L58 -210" stroke="#8c5a2e" strokeWidth={9} strokeLinecap="round"/>
    </g>;
  }
  // conquest_map_ax (default) — THE MAP THAT GREW on its parchment board.
  const zones: Record<string, React.ReactNode> = {
    greece: <path d="M-318 -356 Q-272 -392 -238 -356 Q-214 -322 -246 -288 Q-282 -262 -312 -292 Q-334 -326 -318 -356 Z" fill={GOLD} stroke={GOLD_D} strokeWidth={3}/>,
    anatolia: <path d="M-238 -330 Q-160 -362 -104 -322 Q-70 -292 -118 -268 Q-190 -256 -232 -288 Z" fill={GOLD} stroke={GOLD_D} strokeWidth={3}/>,
    levant: <path d="M-104 -300 Q-64 -286 -66 -238 Q-70 -196 -102 -188 Q-128 -230 -104 -300 Z" fill={GOLD} stroke={GOLD_D} strokeWidth={3}/>,
    egypt: <path d="M-176 -206 Q-118 -224 -96 -188 Q-108 -140 -152 -140 Q-186 -166 -176 -206 Z" fill={GOLD} stroke={GOLD_D} strokeWidth={3}/>,
    persia: <path d="M-60 -330 Q60 -366 128 -318 Q160 -262 96 -226 Q10 -204 -48 -252 Q-76 -296 -60 -330 Z" fill={GOLD} stroke={GOLD_D} strokeWidth={3}/>,
    east: <path d="M118 -356 Q196 -380 240 -330 Q262 -282 204 -262 Q140 -268 116 -308 Z" fill={GOLD} stroke={GOLD_D} strokeWidth={3}/>,
    india: <path d="M238 -318 Q306 -330 322 -282 Q330 -224 282 -198 Q238 -216 232 -266 Z" fill={GOLD} stroke={GOLD_D} strokeWidth={3}/>,
  };
  const grown = (keys: string[]) => <g>{keys.map(k => <React.Fragment key={k}>{zones[k]}</React.Fragment>)}</g>;
  return <g>
    <rect x={-16} y={-120} width={26} height={120} fill="#5d4630" stroke={INK} strokeWidth={3}/>
    <rect x={330} y={-120} width={26} height={120} fill="#5d4630" stroke={INK} strokeWidth={3}/>
    <g transform="translate(170,-330)">
      <rect x={-360} y={-190} width={720} height={380} fill="#e8dcc0" stroke={INK} strokeWidth={4}/>
      <rect x={-344} y={-174} width={688} height={348} fill="none" stroke="#b89b62" strokeWidth={2.4}/>
      <path d="M-344 60 Q-200 20 -60 66 Q80 104 220 58 Q300 36 344 62 L344 174 L-344 174 Z" fill="#7fa8c9" opacity={0.55}/>
      <path d="M-344 -96 Q-220 -140 -120 -104 Q-40 -76 60 -118 Q180 -160 344 -110" fill="none" stroke="#b89b62" strokeWidth={2.6} strokeDasharray="9 7"/>
      {state === 'macedon' && grown(['greece'])}
      {state === 'greece' && grown(['greece', 'anatolia'])}
      {state === 'anatolia' && grown(['greece', 'anatolia', 'levant'])}
      {state === 'egypt' && grown(['greece', 'anatolia', 'levant', 'egypt'])}
      {state === 'persia' && grown(['greece', 'anatolia', 'levant', 'egypt', 'persia'])}
      {state === 'east' && grown(['greece', 'anatolia', 'levant', 'egypt', 'persia', 'east'])}
      {state === 'indus' && grown(['greece', 'anatolia', 'levant', 'egypt', 'persia', 'east', 'india'])}
      {state === 'fractured' && <g>
        <path d="M-318 -356 Q-272 -392 -238 -356 Q-214 -322 -246 -288 Q-282 -262 -312 -292 Q-334 -326 -318 -356 Z M-238 -330 Q-160 -362 -104 -322 Q-70 -292 -118 -268 Q-190 -256 -232 -288 Z" fill="#b0532f" stroke={INK} strokeWidth={2.6}/>
        <path d="M-104 -300 Q-64 -286 -66 -238 Q-70 -196 -102 -188 Q-128 -230 -104 -300 Z M-176 -206 Q-118 -224 -96 -188 Q-108 -140 -152 -140 Q-186 -166 -176 -206 Z" fill="#3f8f6f" stroke={INK} strokeWidth={2.6}/>
        <path d="M-60 -330 Q60 -366 128 -318 Q160 -262 96 -226 Q10 -204 -48 -252 Q-76 -296 -60 -330 Z M118 -356 Q196 -380 240 -330 Q262 -282 204 -262 Q140 -268 116 -308 Z M238 -318 Q306 -330 322 -282 Q330 -224 282 -198 Q238 -216 232 -266 Z" fill="#7a5aa0" stroke={INK} strokeWidth={2.6}/>
        <path d="M-238 -356 L-96 -196 M-60 -318 L-104 -200" stroke={INK} strokeWidth={3.4} strokeDasharray="12 9"/>
      </g>}
      <circle cx={-272} cy={-318} r={7} fill={MACEDON_RED} stroke={INK} strokeWidth={2}/>
      <path d="M-272 -356 l4 11 l11 1 l-8 8 l2 11 l-10 -6 l-10 6 l2 -11 l-8 -8 l11 -1 Z" fill={GOLD} stroke={INK} strokeWidth={1.6} transform="translate(0,10)"/>
    </g>
  </g>;
};
export const ALEXANDER_PROPS = ['bucephalus_ax', 'phalanx_ax', 'companions_ax', 'elephant_ax', 'siege_ax', 'knot_ax', 'spear_ax', 'conquest_map_ax', 'chariot_ax'];
export const isAlexanderProp = (k: string) => ALEXANDER_PROPS.includes(k);

// ── BACKDROPS ────────────────────────────────────────────────────────────────
export type AlexanderBgKind = 'pella_ax' | 'granicus_ax' | 'issus_ax' | 'tyre_ax' | 'siwa_ax' | 'gaugamela_ax' | 'persepolis_ax' | 'passes_ax' | 'hydaspes_ax' | 'babylon_ax';
const Palm: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M0 0 Q10 -90 -6 -168" fill="none" stroke="#6e5136" strokeWidth={11} strokeLinecap="round"/>
    {[-70, -38, -6, 26, 58].map((a, i) => <path key={i} d={`M-6 -168 Q${a} ${-216 - Math.abs(a) * 0.4} ${a * 1.9} -178`} fill="none" stroke="#4c7a4f" strokeWidth={8} strokeLinecap="round"/>)}
  </g>
);
// FULL-FRAME BASE (fix pass 2026-11-27): world.tsx's Backdrop returns a
// pack backdrop component DIRECTLY — no sky/ground base is painted by the
// engine on the pack branch, and the computed GROUND colour goes unused
// there. The first cut of this pack painted scenery only (art spanning
// roughly y 100-700), so the sky above the art and the whole floor below
// y700 showed the theme's near-black #16130e — Bruce's render read as
// "most scenes black". Following the house pack convention (the Mongol
// pack paints its own full frame), this wrapper paints the base FIRST —
// a day-sky gradient over y 0-700 and the backdrop's ALEXANDER_GROUND
// colour over y 700-1080 — then the scenery art on top. StageOne's tod
// tint (night 0.42 / dusk 0.14) still applies over the whole scene, so
// night scenes stay night — but lit by a sky, not a void.
export const AlexanderBg: React.FC<{bg: AlexanderBgKind; f: number; cx: number; seed: string}> = (props) => (
  <g>
    <defs>
      <linearGradient id="ax-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#79a6d2"/>
        <stop offset="100%" stopColor="#e6d9b8"/>
      </linearGradient>
    </defs>
    <rect x={-40} y={0} width={2000} height={700} fill="url(#ax-sky)"/>
    <rect x={-40} y={700} width={2000} height={380} fill={ALEXANDER_GROUND[props.bg] ?? '#9a855e'}/>
    <AlexanderArt {...props}/>
  </g>
);
const AlexanderArt: React.FC<{bg: AlexanderBgKind; f: number; cx: number; seed: string}> = ({bg: kind}) => {
  if (kind === 'pella_ax') {
    return <g>
      <path d="M-40 470 L300 190 L470 300 L640 160 L900 430 L1150 240 L1420 420 L1960 260 L1960 700 L-40 700 Z" fill="#7d8a68"/>
      <path d="M640 160 L716 226 L668 244 L616 214 Z" fill="#eef3f8"/>
      <path d="M1080 700 L1080 420 L840 420 L840 700 M900 420 L900 700 M960 420 L960 700 M1020 420 L1020 700" fill="#cbb894" stroke={INK} strokeWidth={3.2}/>
      <path d="M820 420 L1100 420 L1072 384 L848 384 Z" fill="#8a4a3a" stroke={INK} strokeWidth={3}/>
      <path d="M848 384 L1072 384 L960 330 Z" fill="#a85f46" stroke={INK} strokeWidth={3}/>
      {[872, 928, 984, 1040].map(x => <rect key={x} x={x} y={428} width={17} height={180} fill="#e3dbc6" stroke={INK} strokeWidth={2.2}/>)}
      <path d="M-40 700 L1960 700 L1960 640 Q1200 606 700 632 Q300 650 -40 626 Z" fill="#b39d72"/>
      <g transform="translate(300,636)"><path d="M0 0 L0 -150" stroke={INK} strokeWidth={5}/><path d="M0 -150 L84 -134 L0 -116 Z" fill={MACEDON_RED}/><circle cx={20} cy={-134} r={11} fill={GOLD} stroke={INK} strokeWidth={2}/></g>
      <path d="M1560 700 L1560 470 M1620 700 L1620 440 M1680 700 L1680 486" stroke="#4f6a3a" strokeWidth={9} strokeLinecap="round"/>
      <path d="M1500 500 Q1590 420 1690 486 Q1740 520 1690 556 Q1600 580 1506 548 Q1470 530 1500 500 Z" fill="#4f7f3f"/>
    </g>;
  }
  if (kind === 'granicus_ax') {
    return <g>
      <path d="M-40 540 L-40 330 Q480 210 980 300 Q1500 386 1960 300 L1960 540 Z" fill="#7d8a5a"/>
      <path d="M120 380 Q200 330 290 382 Q240 420 160 414 Q100 406 120 380 Z M1420 340 Q1520 292 1610 344 Q1550 384 1460 376 Q1400 368 1420 340 Z M760 300 Q830 262 900 302 Q850 332 786 328 Q744 322 760 300 Z" fill="#4f7f3f"/>
      <rect x={-40} y={540} width={2000} height={160} fill="#3f74a8"/>
      <path d="M-40 576 Q480 564 960 574 Q1440 584 1960 570 L1960 700 L-40 700 Z" fill="#4d84b8" opacity={0.75}/>
      <path d="M140 614 Q240 604 340 614 M760 640 Q880 630 1000 640 M1420 606 Q1540 596 1660 608" stroke="#d8ecfa" strokeWidth={5} fill="none" opacity={0.6}/>
      <path d="M-40 700 L1960 700 L1960 676 Q1100 660 400 672 Q140 678 -40 670 Z" fill="#8a6a44"/>
      {[240, 620, 1180, 1620].map(x => <ellipse key={x} cx={x} cy={688} rx={52} ry={10} fill="#7a6248"/>)}
    </g>;
  }
  if (kind === 'issus_ax') {
    return <g>
      <rect x={-40} y={452} width={470} height={248} fill="#3f74a8"/>
      <path d="M-40 492 Q200 480 430 494 L430 700 L-40 700 Z" fill="#4d84b8" opacity={0.7}/>
      <path d="M30 560 Q120 550 210 560 M60 626 Q160 616 260 628" stroke="#d8ecfa" strokeWidth={5} fill="none" opacity={0.55}/>
      <path d="M430 700 L430 452 Q560 560 640 700 Z" fill="#d9c491"/>
      <path d="M1180 700 L1330 300 L1470 430 L1590 250 L1750 420 L1860 330 L1960 430 L1960 700 Z" fill="#6d6248"/>
      <path d="M1590 250 L1652 316 L1618 330 L1568 300 Z" fill="#8a7a5a"/>
      <path d="M600 700 L1960 700 L1960 640 Q1300 612 760 636 Q660 642 600 648 Z" fill="#b3a06e"/>
      <Palm x={520} y={668} s={0.8}/><Palm x={1830} y={690} s={0.66}/>
    </g>;
  }
  if (kind === 'tyre_ax') {
    return <g>
      <rect x={-40} y={430} width={2000} height={270} fill="#2f6a96"/>
      <path d="M-40 478 Q480 464 960 476 Q1440 488 1960 470 L1960 700 L-40 700 Z" fill="#3d7ca8" opacity={0.7}/>
      <path d="M-40 660 L640 660 L640 700 L-40 700 Z" fill={STONE}/>
      <path d="M-40 660 L640 660 L600 632 L-40 632 Z" fill="#8a7a5e"/>
      {[80, 230, 390, 520].map(x => <circle key={x} cx={x} cy={646} r={12} fill="#7a6a4e"/>)}
      <path d="M620 700 L640 470 L760 420 L1180 420 L1300 470 L1320 700 Z" fill="#8a7a5e"/>
      <path d="M660 430 L660 330 L1260 330 L1260 430" fill="#b09a72" stroke={INK} strokeWidth={3.4}/>
      {[700, 800, 900, 1000, 1100, 1200].map(x => <path key={x} d={`M${x} 330 L${x} 306 L${x + 26} 306 L${x + 26} 330`} fill="#b09a72" stroke={INK} strokeWidth={2.4}/>)}
      <g><rect x={700} y={196} width={86} height={134} fill="#c0aa7e" stroke={INK} strokeWidth={3}/><path d="M692 196 L743 164 L794 196 Z" fill="#8a4a3a"/><rect x={1210} y={216} width={70} height={114} fill="#c0aa7e" stroke={INK} strokeWidth={3}/><path d="M1204 216 L1245 188 L1286 216 Z" fill="#8a4a3a"/></g>
      {[830, 920, 1010, 1100].map((x, i) => <rect key={x} x={x} y={252 + (i % 2) * 26} width={52} height={66} fill="#cbb894" stroke={INK} strokeWidth={2.4}/>)}
      {[856, 946, 1036, 1126].map(x => <rect key={x} x={x - 8} y={272} width={17} height={24} fill="#f7e3a1"/>)}
      <path d="M742 164 L742 108" stroke={INK} strokeWidth={4}/><path d="M742 108 L796 120 L742 132 Z" fill={PERSIA}/>
      <path d="M180 560 Q280 550 380 560 M1420 580 Q1540 570 1660 582" stroke="#cfe9ff" strokeWidth={5} fill="none" opacity={0.5}/>
    </g>;
  }
  if (kind === 'siwa_ax') {
    return <g>
      <path d="M-40 560 Q400 430 900 520 Q1400 600 1960 480 L1960 700 L-40 700 Z" fill="#e0bc76"/>
      <path d="M-40 620 Q500 540 1100 606 Q1600 652 1960 590 L1960 700 L-40 700 Z" fill="#d3ab60"/>
      <g transform="translate(1330,600)">
        <path d="M-170 100 L-170 -120 L-96 -120 L-96 100 M96 100 L96 -120 L170 -120 L170 100" fill="#cbb894" stroke={INK} strokeWidth={3.4}/>
        <path d="M-196 -120 L196 -120 L160 -168 L-160 -168 Z" fill="#b39d72" stroke={INK} strokeWidth={3.2}/>
        <rect x={-34} y={-40} width={68} height={140} fill="#4a3826"/>
        <circle cx={0} cy={-196} r={21} fill={GOLD} stroke={INK} strokeWidth={2.6}/>
      </g>
      <Palm x={240} y={664} s={1}/><Palm x={360} y={680} s={0.8}/><Palm x={120} y={684} s={0.66}/><Palm x={1690} y={660} s={0.9}/><Palm x={1800} y={682} s={0.7}/>
      <ellipse cx={620} cy={668} rx={240} ry={26} fill="#4d84b8"/>
      <ellipse cx={620} cy={662} rx={200} ry={18} fill="#6fa8cf"/>
      {[470, 540, 720, 790].map(x => <path key={x} d={`M${x} 668 q6 -26 0 -40 M${x + 14} 670 q-5 -22 2 -36`} stroke="#4f7f3f" strokeWidth={4} fill="none"/>)}
    </g>;
  }
  if (kind === 'gaugamela_ax') {
    return <g>
      <path d="M-40 540 L-40 470 Q600 420 1100 452 L1420 380 L1700 440 L1960 420 L1960 540 Z" fill="#a08a5e"/>
      <path d="M1420 380 L1490 424 L1452 436 L1396 412 Z" fill="#c9b083"/>
      <rect x={-40} y={540} width={2000} height={160} fill="#c2a468"/>
      <path d="M-40 596 Q700 578 1960 600 L1960 700 L-40 700 Z" fill="#b89a5e" opacity={0.8}/>
      {[300, 760, 1240, 1680].map(x => <path key={x} d={`M${x} 640 q14 -16 30 -4 M${x + 44} 656 q12 -13 26 -3`} stroke="#8a744a" strokeWidth={4} fill="none"/>)}
      <g opacity={0.75}><path d="M104 524 Q170 478 236 524 Z" fill="#7a6248"/><path d="M228 526 Q282 488 336 526 Z" fill="#8a6c46"/></g>
      <path d="M-40 560 Q960 540 1960 562" stroke="#e8d9ae" strokeWidth={10} opacity={0.35} fill="none"/>
    </g>;
  }
  if (kind === 'persepolis_ax') {
    return <g>
      <path d="M-40 470 L500 300 L900 400 L1300 280 L1960 430 L1960 700 L-40 700 Z" fill="#9a7d54"/>
      <rect x={140} y={470} width={1640} height={230} fill="#c0a172"/>
      <rect x={140} y={470} width={1640} height={26} fill="#a8895a"/>
      <path d="M820 700 L860 560 L1060 560 L1100 700 Z" fill="#b39d72" stroke={INK} strokeWidth={3}/>
      {[876, 916, 956, 996, 1036].map((x, i) => <path key={x} d={`M${x} ${672 - i * 24} L${x + 150 - i * 8} ${672 - i * 24}`} stroke={INK} strokeWidth={2.6}/>)}
      {[300, 430, 560, 1230, 1360, 1490, 1620].map((x, i) => (
        <g key={x}>
          <rect x={x} y={i % 3 === 2 ? 330 : 268} width={30} height={i % 3 === 2 ? 140 : 202} fill="#d8c49a" stroke={INK} strokeWidth={2.8}/>
          {i % 3 !== 2 && <g><path d={`M${x - 8} 268 L${x + 15} 238 L${x + 38} 268 Z`} fill="#b39d72" stroke={INK} strokeWidth={2.4}/><circle cx={x + 4} cy={252} r={6} fill="#8a6c46"/><circle cx={x + 26} cy={252} r={6} fill="#8a6c46"/></g>}
        </g>
      ))}
      {[210, 340, 470, 1330, 1460, 1590, 1700].map(x => <rect key={x} x={x} y={520} width={64} height={8} fill="#8a6c46" opacity={0.6}/>)}
      <g transform="translate(660,470)"><path d="M0 0 L0 -120" stroke={INK} strokeWidth={4}/><path d="M0 -120 L62 -108 L0 -94 Z" fill={GOLD_D}/></g>
    </g>;
  }
  if (kind === 'passes_ax') {
    return <g>
      <path d="M-40 560 L240 210 L430 380 L640 130 L880 400 L1120 170 L1360 420 L1600 240 L1960 480 L1960 700 L-40 700 Z" fill="#8d99a6"/>
      <path d="M640 130 L716 210 L668 232 L612 196 Z M1120 170 L1186 240 L1144 258 L1096 226 Z M240 210 L300 272 L262 288 L216 256 Z" fill="#eef3f8"/>
      <path d="M-40 700 L300 470 L560 620 L860 440 L1180 640 L1500 480 L1960 660 L1960 700 Z" fill="#6d7885"/>
      <path d="M240 700 Q420 560 620 606 Q800 646 900 560 Q1080 470 1330 560 Q1560 640 1760 570" fill="none" stroke="#e8eef4" strokeWidth={26} opacity={0.85}/>
      <path d="M240 700 Q420 560 620 606 Q800 646 900 560 Q1080 470 1330 560 Q1560 640 1760 570" fill="none" stroke="#c8d4de" strokeWidth={8} strokeDasharray="26 20"/>
      {[420, 900, 1420].map(x => <path key={x} d={`M${x} 640 l16 -34 l16 34 Z`} fill="#54606c"/>)}
    </g>;
  }
  if (kind === 'hydaspes_ax') {
    return <g>
      <path d="M-40 540 L-40 452 Q960 408 1960 452 L1960 540 Z" fill="#3f6030"/>
      {[140, 420, 760, 1120, 1480, 1780].map((x, i) => <path key={x} d={`M${x} 470 Q${x + 40} ${408 + (i % 3) * 14} ${x + 88} 468 Q${x + 44} 492 ${x} 470 Z`} fill="#4f7f3f"/>)}
      <rect x={-40} y={540} width={2000} height={160} fill="#46603c"/>
      <rect x={-40} y={540} width={2000} height={160} fill="#3d6a8c" opacity={0.88}/>
      <path d="M-40 580 Q480 566 960 578 Q1440 590 1960 574 L1960 700 L-40 700 Z" fill="#4d84b8" opacity={0.55}/>
      <path d="M160 622 Q280 612 400 622 M900 646 Q1040 636 1180 646 M1500 616 Q1620 606 1740 618" stroke="#d8ecfa" strokeWidth={5} fill="none" opacity={0.5}/>
      <path d="M-40 700 L1960 700 L1960 678 Q1000 662 300 674 Q120 680 -40 672 Z" fill="#6d7a3f"/>
      {[300, 900, 1560].map(x => <path key={x} d={`M${x} 690 q8 -22 2 -38 M${x + 20} 692 q-6 -18 4 -32`} stroke="#7fae56" strokeWidth={5} fill="none"/>)}
    </g>;
  }
  // babylon_ax
  return <g>
    <rect x={-40} y={400} width={2000} height={150} fill="#b39d72"/>
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => <path key={i} d={`M${i * 168 - 20} 400 L${i * 168 - 20} 372 L${i * 168 + 42} 372 L${i * 168 + 42} 400`} fill="#b39d72"/>)}
    <g transform="translate(430,550)">
      <path d="M-190 150 L-190 -190 L190 -190 L190 150 Z" fill="#2b5f9e"/>
      <path d="M-190 -190 L190 -190 L150 -238 L-150 -238 Z" fill="#2b5f9e"/>
      {[-120, -40, 40, 120].map(x => <rect key={x} x={x - 21} y={-168} width={42} height={54} fill="#d9a83c" opacity={0.85}/>)}
      <path d="M-52 150 L-52 -60 Q0 -104 52 -60 L52 150 Z" fill="#1d3f68"/>
      {[-96, 0, 96].map(x => <circle key={x} cx={x} cy={-120} r={13} fill="#e8e2d2" opacity={0.8}/>)}
      <path d="M-190 150 L190 150" stroke={INK} strokeWidth={4}/>
    </g>
    <g transform="translate(1420,550)">
      {[0, 1, 2, 3, 4, 5, 6].map(i => <rect key={i} x={-190 + i * 27} y={-60 - i * 56} width={380 - i * 54} height={56} fill={i % 2 ? '#c0a172' : '#b39d72'} stroke={INK} strokeWidth={2.6}/>)}
      <rect x={-24} y={-452} width={48} height={34} fill="#8a6c46" stroke={INK} strokeWidth={2.6}/>
    </g>
    <Palm x={120} y={676} s={0.9}/><Palm x={960} y={690} s={0.72}/><Palm x={1820} y={672} s={0.94}/>
    <path d="M-40 700 L700 700 L700 664 Q340 650 -40 660 Z" fill="#4d84b8" opacity={0.8}/>
  </g>;
};
export const isAlexanderBg = (k: string): k is AlexanderBgKind => ['pella_ax', 'granicus_ax', 'issus_ax', 'tyre_ax', 'siwa_ax', 'gaugamela_ax', 'persepolis_ax', 'passes_ax', 'hydaspes_ax', 'babylon_ax'].includes(k);
export const ALEXANDER_GROUND: Partial<Record<AlexanderBgKind, string>> = {
  pella_ax: '#9a855e', granicus_ax: '#8a6a44', issus_ax: '#9a8a62', tyre_ax: '#7d7466',
  siwa_ax: '#c9a15a', gaugamela_ax: '#b89a62', persepolis_ax: '#c0a172', passes_ax: '#dfe7ee',
  hydaspes_ax: '#6d7a3f', babylon_ax: '#c9b083',
};
