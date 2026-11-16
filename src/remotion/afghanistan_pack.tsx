// Afghanistan pack for the Vidfactory kit. Pure SVG, deterministic (no Math.random, no Date, no CSS animation).
// Contents: 15 props (incl. the flag_af signature prop with 14 era states), 7 backgrounds, 2 hats are in world.tsx (pakol, turban_af).
// Imported by world.tsx (props, backgrounds) exactly like germany_pack / korea_pack / iran_pack / japan_pack. Do not edit per video.
// First built for: "Why Afghanistan Broke Three Empires in 35 Minutes" (Zeus History, 2026-11-15).
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {HAND, INK} from './world';
import type {PropT} from './world';

const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = {stroke: '#241c17' /* = INK; literal on purpose: world.tsx and this file import each other, so INK must not be read at load time */, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16), ch = (s: number) => Math.round(Math.min(255, Math.max(0, ((n >> s) & 255) * (1 + k))));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};
const T: React.FC<{x?: number; y?: number; t: string; fs?: number; fill?: string; sw?: number; a?: 'start' | 'middle' | 'end'; r?: number}> = ({x = 0, y = 0, t, fs = 40, fill = '#fff', sw = 7, a = 'middle', r = 0}) => (
  <text x={x} y={y} textAnchor={a} fontFamily={HAND} fontSize={fs} fill={fill} stroke={INK} strokeWidth={sw} paintOrder="stroke" strokeLinejoin="round" transform={r ? `rotate(${r} ${x} ${y})` : undefined}>{t}</text>
);
const pop01 = (f: number, a: number) => interpolate(f, [a, a + 8], [0, 1], {...C, easing: Easing.out(Easing.back(2))});

// ================= PROPS =================
export type AfghanistanKind = 'flag_af' | 'pass_gate' | 'bamiyan_niche' | 'gandhara_head' | 'coin_kanishka' | 'loya_jirga_tent' | 'stinger_tube' | 'tank_af' | 'durand_stone' | 'silk_bale' | 'lapis' | 'madrassa_book' | 'airport_gate' | 'radio_set' | 'school_desk';
const SET = new Set<string>(['flag_af', 'pass_gate', 'bamiyan_niche', 'gandhara_head', 'coin_kanishka', 'loya_jirga_tent', 'stinger_tube', 'tank_af', 'durand_stone', 'silk_bale', 'lapis', 'madrassa_book', 'airport_gate', 'radio_set', 'school_desk']);
export const isAfghanistanProp = (k: string) => SET.has(k);

// flag_af cloth designs by era state. Cloth flies to the right of the pole, top at the pole top.
// Abstract calligraphy strokes only — never real religious text.
const FlagCloth: React.FC<{st: string; top: number; w: number; h: number; f: number}> = ({st, top, w, h, f}) => {
  const wave = Math.sin(f / 9) * 6;
  const edge = `M0 ${top} Q${w * 0.5} ${top - 10 + wave} ${w} ${top + 6} V${top + h} Q${w * 0.5} ${top + h + 12 + wave} 0 ${top + h}Z`;
  const emblem = (col: string) => (<g stroke="none"><circle cx={w * 0.5} cy={top + h / 2} r={h * 0.26} fill="none" stroke={col} strokeWidth={7} /><circle cx={w * 0.5} cy={top + h / 2} r={h * 0.1} fill={col} />{[-1, 1].map((s) => <path key={s} d={`M${w * 0.5 + s * h * 0.34} ${top + h / 2 - h * 0.22} q${s * 10} ${h * 0.22} 0 ${h * 0.44}`} stroke={col} strokeWidth={6} fill="none" />)}</g>);
  const strokes = (col: string, y0: number) => (<g stroke={col} strokeWidth={7} strokeLinecap="round" fill="none">{[0, 1, 2].map((i) => <path key={i} d={`M${w * 0.18 + i * 6} ${y0 + i * h * 0.16} q${w * 0.2} ${-h * 0.1 + (i % 2) * 8} ${w * 0.42} 0 q${w * 0.16} ${h * 0.07} ${w * 0.2} ${-4}`} />)}</g>);
  switch (st) {
    case 'hotak': return <path d={edge} fill="#17171c" />;
    case 'greek': return (<g><path d={edge} fill="#efe6cc" /><circle cx={w * 0.46} cy={top + h / 2} r={h * 0.3} fill="none" stroke="#b0792a" strokeWidth={8} /><circle cx={w * 0.46} cy={top + h / 2} r={h * 0.13} fill="#d9a441" stroke="none" /></g>);
    case 'arab': return (<g><path d={edge} fill="#2e6b46" />{strokes('#f2ead2', top + h * 0.3)}</g>);
    case 'mongol': return (<g><path d={edge} fill="#6d6a63" /><path d={edge} fill="none" stroke="#8a2f2f" strokeWidth={12} />{[-0.3, -0.1, 0.1, 0.3].map((o, i) => <path key={i} d={`M${w * (0.5 + o)} ${top + h} q4 ${26 + (i % 2) * 10} 0 44`} stroke="#2b2622" strokeWidth={7} fill="none" />)}</g>);
    case 'durrani': return (<g><path d={edge} fill="#1f5138" />{emblem('#e8c14a')}<path d={`M0 ${top + h} H${w}`} stroke="#e8c14a" strokeWidth={9} strokeDasharray="12 7" /></g>);
    case 'emir': return (<g><path d={edge} fill="#1c1c22" /><circle cx={w * 0.5} cy={top + h / 2} r={h * 0.3} fill="none" stroke="#f2ead2" strokeWidth={7} /><path d={`M${w * 0.5 - h * 0.16} ${top + h / 2 + h * 0.12} a${h * 0.16} ${h * 0.2} 0 0 1 ${h * 0.32} 0Z`} fill="#f2ead2" stroke="none" /></g>);
    case 'tricolour28': return (<g><path d={edge} fill="#b03a2e" /><path d={`M0 ${top} H${w / 3} V${top + h} H0Z`} fill="#17171c" /><path d={`M${2 * w / 3} ${top} H${w} V${top + h} H${2 * w / 3}Z`} fill="#1f5138" />{emblem('#e8c14a')}</g>);
    case 'red78': return (<g><path d={edge} fill="#b3202a" />{emblem('#f2c230')}</g>);
    case 'green': return (<g><path d={edge} fill="#1f6b3a" />{strokes('#f6f4ec', top + h * 0.26)}<path d={`M0 ${top} H${w} M0 ${top + h} H${w}`} stroke="#f6f4ec" strokeWidth={6} /></g>);
    case 'white': return (<g><path d={edge} fill="#f6f4ec" />{strokes('#26221e', top + h * 0.24)}</g>);
    case 'tricolour': return (<g><path d={edge} fill="#b03a2e" /><path d={`M0 ${top} H${w / 3} V${top + h} H0Z`} fill="#17171c" /><path d={`M${2 * w / 3} ${top} H${w} V${top + h} H${2 * w / 3}Z`} fill="#1f5138" />{emblem('#e8c14a')}</g>);
    case 'torn': return (<g><path d={`M0 ${top} Q${w * 0.5} ${top - 8 + wave} ${w} ${top + 4} L${w * 0.78} ${top + h * 0.5} L${w * 0.9} ${top + h * 0.62} L${w * 0.52} ${top + h * 0.55} L${w * 0.4} ${top + h} Q${w * 0.2} ${top + h + 8} 0 ${top + h}Z`} fill="#7a756c" /><path d={`M${w * 0.2} ${top + 14} L${w * 0.55} ${top + h * 0.5}`} stroke="#3a352e" strokeWidth={6} /></g>);
    default: return <path d={edge} fill="#8a8578" />;
  }
};

export const AfghanistanProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p, f, seed}) => {
  const c = p.c, t = p.t ?? '';
  switch (p.k as AfghanistanKind) {
    case 'flag_af': { // THE signature prop. t = era state: bare|hotak|greek|arab|mongol|durrani|emir|tricolour28|red78|green|white|tricolour|torn|raised. Pole is part of the prop.
      const st = t || 'tricolour';
      const pole = '#5d4a33', W = 320, H = 196, TOP = -560;
      return (
        <g {...OL}>
          <ellipse cx={30} cy={6} rx={120} ry={14} fill="#000" opacity={0.16} stroke="none" />
          <path d="M-52 0 L-14 -26 H74 L112 0Z" fill="#8a7a5f" />
          <rect x={-9} y={TOP} width={18} height={-TOP} fill={pole} />
          <path d={`M-9 ${TOP} h18 v${-TOP} h-18Z`} fill="#000" opacity={0.12} stroke="none" />
          <circle cx={0} cy={TOP - 16} r={13} fill="#d9a441" />
          {st === 'bare' && <path d={`M9 ${TOP + 30} q26 60 8 130`} fill="none" stroke="#c9a86a" strokeWidth={6} />}
          {st === 'raised' && (<g>{/* a new flag half-way up, still rising */}
            <g transform={`translate(0 ${-interpolate(f, [0, 90], [150, 40], C)})`}><FlagCloth st="tricolour" top={TOP + 210} w={W * 0.82} h={H * 0.82} f={f} /></g>
            <path d={`M9 ${TOP + 16} V-120`} stroke="#c9a86a" strokeWidth={5} /></g>)}
          {st !== 'bare' && st !== 'raised' && <FlagCloth st={st} top={TOP + 8} w={W} h={H} f={f} />}
        </g>);
    }
    case 'pass_gate': { // A mountain door. t = khyber|bolan|oxus. Two rock walls and the gap every army must use.
      const rock = c ?? '#7d7466', rockD = shade(rock, -0.18);
      return (
        <g {...OL}>
          <path d="M-460 0 L-330 -420 L-190 -470 L-120 0Z" fill={rock} />
          <path d="M460 0 L330 -420 L190 -470 L120 0Z" fill={rock} />
          <path d="M-330 -420 L-260 -300 L-310 -180 L-250 -60 L-190 -470Z" fill={rockD} opacity={0.55} stroke="none" />
          <path d="M330 -420 L250 -290 L305 -170 L245 -60 L190 -470Z" fill={rockD} opacity={0.55} stroke="none" />
          <path d="M-190 -470 L-120 0 M190 -470 L120 0" stroke="#e8e2d2" strokeWidth={10} opacity={0.5} />
          {t === 'oxus' && <path d="M-460 0 Q-230 -26 0 0 T460 0 V26 H-460Z" fill="#4f83a8" stroke="none" />}
          {t !== 'oxus' && <path d="M-120 0 Q0 -34 120 0 L96 22 H-96Z" fill={t === 'bolan' ? '#c9a86a' : '#a08b62'} stroke="none" />}
          <path d="M-60 -6 L-30 -34 L0 -8 L28 -30 L54 -4" fill="none" stroke="#5d5344" strokeWidth={6} opacity={0.7} />
        </g>);
    }
    case 'bamiyan_niche': { // The cliff niche at Bamiyan. t:'buddha' shows the standing figure (pre-2001); default is the empty niche.
      return (
        <g {...OL}>
          <path d="M-250 0 L-228 -500 Q0 -548 228 -500 L250 0Z" fill="#c98d54" />
          <path d="M-250 0 L-228 -500 Q0 -548 228 -500 L250 0" fill="none" />
          {[-180, -60, 80, 190].map((x, i) => <path key={i} d={`M${x} ${-470 + (i % 2) * 30} q14 220 -6 460`} stroke="#a96f3a" strokeWidth={9} fill="none" opacity={0.65} />)}
          <path d="M-88 0 V-330 Q0 -392 88 -330 V0Z" fill="#5d4030" />
          <path d="M-88 0 V-330 Q0 -392 88 -330 V0" fill="none" stroke="#3a2a1e" strokeWidth={6} />
          {t === 'buddha' && (<g>
            <path d="M-40 0 V-250 Q0 -282 40 -250 V0Z" fill="#d9c9a8" />
            <circle cx={0} cy={-288} r={30} fill="#e5d3ac" />
            <path d="M-40 -180 H40 M-40 -110 H40" stroke="#b39b6d" strokeWidth={6} />
          </g>)}
          <path d="M-120 0 H120 L96 -18 H-96Z" fill="#a96f3a" />
        </g>);
    }
    case 'gandhara_head': { // Greek face, Buddhist calm: wavy hair, topknot bun, long earlobes, on a museum plinth.
      const stone = c ?? '#b8ab90';
      return (
        <g {...OL}>
          <path d="M-110 0 H110 L92 -34 H-92Z" fill="#6d6250" />
          <rect x={-58} y={-96} width={116} height={64} fill={shade(stone, -0.12)} />
          <path d="M-52 -96 Q-58 -190 -34 -238 Q0 -268 34 -238 Q58 -190 52 -96 Q26 -78 0 -78 Q-26 -78 -52 -96Z" fill={stone} />
          <circle cx={0} cy={-262} r={17} fill={stone} />
          {[-38, -14, 14, 38].map((x, i) => <path key={i} d={`M${x} -252 q6 26 -2 44`} stroke={shade(stone, -0.3)} strokeWidth={6} fill="none" />)}
          <path d="M-34 -176 q12 -8 24 0 M10 -176 q12 -8 24 0" stroke="#4a4234" strokeWidth={5} fill="none" />
          <path d="M0 -168 v22 M-14 -128 q14 8 28 0" stroke="#4a4234" strokeWidth={5} fill="none" />
          <path d="M-56 -150 q-8 34 4 52 M56 -150 q8 34 -4 52" stroke={shade(stone, -0.25)} strokeWidth={7} fill="none" />
        </g>);
    }
    case 'coin_kanishka': { // A gold Kushan coin, enlarged: standing king on one face, letter ticks around the rim.
      const gold = c ?? '#d9a441';
      const tilt = Math.sin(f / 14) * 4;
      return (
        <g {...OL} transform={`rotate(${tilt})`}>
          <circle cx={0} cy={-170} r={150} fill={gold} />
          <circle cx={0} cy={-170} r={150} fill="none" stroke="#a8781f" strokeWidth={10} />
          <circle cx={0} cy={-170} r={126} fill="none" stroke="#a8781f" strokeWidth={5} strokeDasharray="10 12" />
          <path d="M-16 -96 V-216 M-16 -216 L-44 -252 M-16 -216 L14 -248" stroke="#8a5f14" strokeWidth={11} strokeLinecap="round" />
          <circle cx={-16} cy={-272} r={17} fill="none" stroke="#8a5f14" strokeWidth={9} />
          <path d="M14 -248 L52 -206 L30 -196 L8 -226" fill="none" stroke="#8a5f14" strokeWidth={9} />
          {[-90, -45, 0, 45, 90].map((a, i) => <path key={i} d={`M${Math.sin(a * Math.PI / 180) * 108} ${-170 - Math.cos(a * Math.PI / 180) * 108} l${Math.sin(a * Math.PI / 180) * 16} ${-Math.cos(a * Math.PI / 180) * 16}`} stroke="#8a5f14" strokeWidth={7} />)}
          <path d="M-70 -58 H70 L52 -22 H-52Z" fill="#a8781f" />
        </g>);
    }
    case 'loya_jirga_tent': { // The council tent of 1747: broad canvas pavilion, open front, carpet at the threshold.
      return (
        <g {...OL}>
          <path d="M-330 0 L0 -300 L330 0Z" fill="#d9c9a8" />
          <path d="M-330 0 L0 -300 L330 0" fill="none" />
          <path d="M0 -300 V0 M-165 -150 L165 -150" stroke="#b39b6d" strokeWidth={6} opacity={0.8} />
          <path d="M-96 0 V-120 Q0 -158 96 -120 V0Z" fill="#5d4a33" />
          <circle cx={0} cy={-322} r={12} fill="#b03a2e" />
          <path d="M-210 0 H210 L186 20 H-186Z" fill="#8a2f2f" />
          <path d="M-186 6 H186" stroke="#e8c14a" strokeWidth={5} strokeDasharray="16 10" />
        </g>);
    }
    case 'stinger_tube': { // A shoulder-fired missile tube, carried diagonally: tube, grip, sight block, flared ends.
      return (
        <g {...OL} transform="rotate(-24)">
          <rect x={-230} y={-46} width={460} height={64} rx={26} fill="#5a6248" />
          <rect x={-252} y={-58} width={44} height={88} rx={12} fill="#454c38" />
          <rect x={208} y={-58} width={44} height={88} rx={12} fill="#454c38" />
          <rect x={-60} y={-96} width={92} height={52} rx={8} fill="#3a4030" />
          <circle cx={-14} cy={-70} r={11} fill="#8ec9ee" />
          <path d="M60 18 L84 74 H116 L96 18Z" fill="#3a4030" />
          <path d="M-160 18 L-140 62 H-112 L-128 18Z" fill="#3a4030" />
        </g>);
    }
    case 'tank_af': { // Soviet-pattern tank in olive drab, side profile: hull, turret, long barrel, five road wheels.
      const olive = c ?? '#5c6247';
      return (
        <g {...OL}>
          <ellipse cx={0} cy={8} rx={290} ry={16} fill="#000" opacity={0.18} stroke="none" />
          <path d="M-268 -38 L-238 -108 H190 L238 -66 L268 -38Z" fill={olive} />
          <rect x={-268} y={-58} width={536} height={34} rx={16} fill={shade(olive, -0.16)} />
          {[-190, -98, 0, 98, 190].map((x, i) => <g key={i}><circle cx={x} cy={-40} r={30} fill="#3f4433" /><circle cx={x} cy={-40} r={12} fill="#6d7358" stroke="none" /></g>)}
          <path d="M-96 -108 L-70 -168 H120 L150 -108Z" fill={shade(olive, 0.08)} />
          <path d="M138 -146 H330 L336 -132 H140Z" fill="#4a4f3a" />
          <circle cx={10} cy={-178} r={13} fill="#f2ead2" stroke="none" />
          <path d="M-240 -96 l-34 -18 M240 -80 l36 -10" stroke="#3f4433" strokeWidth={9} />
        </g>);
    }
    case 'durand_stone': { // A border pillar of the 1893 line: tapered stone post, plaque with ruled lines (no words).
      return (
        <g {...OL}>
          <path d="M-56 0 L-40 -330 H40 L56 0Z" fill="#9a917e" />
          <path d="M-40 -330 L0 -372 L40 -330Z" fill="#7d7466" />
          <rect x={-30} y={-252} width={60} height={86} fill="#efe6cc" />
          {[-226, -204, -182].map((y, i) => <path key={i} d={`M-20 ${y} H20`} stroke="#6d6250" strokeWidth={6} />)}
          <path d="M-90 0 H90 L70 16 H-70Z" fill="#857c68" />
        </g>);
    }
    case 'silk_bale': { // Trade goods: two roped bales and a rolled carpet leaning on them.
      return (
        <g {...OL}>
          <rect x={-170} y={-118} width={210} height={118} rx={14} fill="#b0894a" />
          <rect x={-52} y={-118} width={212} height={118} rx={14} fill="#9a7a52" />
          <rect x={-120} y={-226} width={200} height={110} rx={14} fill="#a8843f" />
          {[-120, -20, 60].map((x, i) => <path key={i} d={`M${x} -226 V0`} stroke="#6d5636" strokeWidth={7} />)}
          <path d="M-170 -60 H160 M-120 -172 H80" stroke="#6d5636" strokeWidth={7} />
          <g transform="rotate(18 210 -110)"><rect x={186} y={-226} width={52} height={226} rx={24} fill="#8a2f2f" /><path d="M186 -180 H238 M186 -90 H238" stroke="#e8c14a" strokeWidth={7} /></g>
        </g>);
    }
    case 'lapis': { // A chunk of Badakhshan lapis on a trader's cloth: deep blue, gold flecks.
      return (
        <g {...OL}>
          <path d="M-170 0 H170 L130 -22 H-130Z" fill="#7a2e2e" />
          <path d="M-96 -22 L-60 -104 L10 -128 L84 -88 L96 -22Z" fill="#274b9a" />
          <path d="M-60 -104 L10 -128 L30 -60 L-30 -44Z" fill="#31599f" stroke="none" opacity={0.8} />
          {[[-40, -80], [22, -96], [52, -52], [-8, -48], [66, -84]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#e8c14a" stroke="none" />)}
        </g>);
    }
    case 'madrassa_book': { // A great book open on its wooden rehal stand.
      return (
        <g {...OL}>
          <path d="M-90 0 L0 -84 L90 0 M-90 -84 L0 0 L90 -84" stroke="#7a5230" strokeWidth={13} fill="none" />
          <path d="M0 -196 Q-84 -226 -150 -196 V-64 Q-84 -94 0 -64 Q84 -94 150 -64 V-196 Q84 -226 0 -196Z" fill="#efe6cc" />
          <path d="M0 -196 V-64" stroke="#b39b6d" strokeWidth={6} />
          {[-128, -104, -80].map((x, i) => <path key={i} d={`M${x} ${-178 + i * 4} q34 -12 62 -2 M${-x - 62} ${-178 + i * 4} q34 -12 62 -2`} stroke="#8a7a5f" strokeWidth={5} fill="none" />)}
          <path d="M-150 -196 Q-84 -226 0 -196 Q84 -226 150 -196" fill="none" stroke="#8a2f2f" strokeWidth={9} />
        </g>);
    }
    case 'airport_gate': { // The airport fence, 2021: chain-link section, gate frame, a coil of wire on top.
      return (
        <g {...OL}>
          <rect x={-330} y={-330} width={660} height={330} fill="#9aa2a8" opacity={0.28} />
          {[-270, -180, -90, 0, 90, 180, 270].map((x, i) => <path key={i} d={`M${x} -330 V0`} stroke="#6d747a" strokeWidth={5} />)}
          {[-260, -180, -100, -20].map((y, i) => <path key={i} d={`M-330 ${y} H330`} stroke="#6d747a" strokeWidth={5} />)}
          <rect x={-330} y={-330} width={660} height={330} fill="none" stroke="#4c5257" strokeWidth={11} />
          <path d="M0 -330 V0" stroke="#4c5257" strokeWidth={11} />
          {[-300, -200, -100, 0, 100, 200, 300].map((x, i) => <circle key={i} cx={x} cy={-352} r={17} fill="none" stroke="#4c5257" strokeWidth={6} />)}
          <rect x={-352} y={-356} width={16} height={356} fill="#3a3f44" />
          <rect x={336} y={-356} width={16} height={356} fill="#3a3f44" />
        </g>);
    }
    case 'radio_set': { // A field radio: box, dials, handset on a hook, long whip antenna.
      return (
        <g {...OL}>
          <path d="M96 -120 L196 -330" stroke="#3a3f44" strokeWidth={7} strokeLinecap="round" />
          <circle cx={198} cy={-334} r={8} fill="#3a3f44" stroke="none" />
          <rect x={-130} y={-150} width={260} height={150} rx={14} fill="#4c5540" />
          <rect x={-108} y={-128} width={104} height={58} rx={8} fill="#20261c" />
          <path d="M-96 -112 q16 -14 32 0 q16 14 32 0" stroke="#7fae5f" strokeWidth={6} fill="none" />
          {[26, 66].map((x, i) => <g key={i}><circle cx={x} cy={-99} r={17} fill="#2e3324" /><path d={`M${x} -99 l10 -10`} stroke="#c9ccd4" strokeWidth={5} /></g>)}
          {[-88, -52, -16, 20, 56, 92].map((x, i) => <circle key={i} cx={x} cy={-36} r={8} fill="#2e3324" stroke="none" />)}
          <rect x={-168} y={-128} width={30} height={86} rx={12} fill="#333a2a" />
          <path d="M-150 -42 q-16 44 8 66" stroke="#20261c" strokeWidth={7} fill="none" />
        </g>);
    }
    case 'school_desk': { // A school desk and bench, one book left open on top.
      return (
        <g {...OL}>
          <path d="M-140 -84 H140 L122 -52 H-122Z" fill="#8a5f36" />
          <path d="M-122 -52 V0 M122 -52 V0 M-122 -26 H122" stroke="#6d4a28" strokeWidth={10} />
          <path d="M-110 22 H110 M-96 22 V52 M96 22 V52" stroke="#6d4a28" strokeWidth={9} />
          <path d="M-16 -118 Q-52 -132 -84 -120 V-88 Q-52 -100 -16 -88 Q20 -100 52 -88 V-120 Q20 -132 -16 -118Z" fill="#f2ead2" />
          <path d="M-16 -118 V-88" stroke="#b39b6d" strokeWidth={5} />
          <path d="M52 -120 L84 -138 L96 -112 L64 -96Z" fill="#2e5d50" />
        </g>);
    }
  }
  return null;
};

// ================= BACKGROUNDS =================
export type AfghanistanBgKind = 'hindukush' | 'kabul_old' | 'kandahar' | 'bamiyan_valley' | 'khyber' | 'bazaar_af' | 'kabul_modern';
const BGSET = new Set<string>(['hindukush', 'kabul_old', 'kandahar', 'bamiyan_valley', 'khyber', 'bazaar_af', 'kabul_modern']);
export const isAfghanistanBg = (k: string) => BGSET.has(k);
export const AFGHANISTAN_GROUND: Record<AfghanistanBgKind, string> = {hindukush: '#b08954', kabul_old: '#a98a5f', kandahar: '#c2a06b', bamiyan_valley: '#8fae5f', khyber: '#9a8a76', bazaar_af: '#8a6a44', kabul_modern: '#8d8578'};

const Ridge: React.FC<{y: number; col: string; seedN: number; snow?: boolean}> = ({y, col, seedN, snow}) => {
  const pts: string[] = [];
  for (let i = 0; i <= 8; i++) { const x = i * 240; const h = 130 + ((i * 137 + seedN * 61) % 150); pts.push(`${x} ${y - h}`); pts.push(`${x + 120} ${y - 20 - ((i * 89 + seedN * 31) % 60)}`); }
  return (<g stroke="none"><path d={`M0 ${y} ${pts.map((p) => 'L' + p).join(' ')} L1920 ${y}Z`} fill={col} />{snow && [240, 720, 1200, 1680].map((x, i) => <path key={i} d={`M${x} ${y - 218 - (i % 2) * 30} l34 44 l-20 -8 l-14 12 l-16 -14 l-18 6Z`} fill="#eef3f8" opacity={0.92} />)}</g>);
};

export const AfghanistanBg: React.FC<{bg: AfghanistanBgKind; f: number; cx: number; seed: string}> = ({bg, f, cx, seed}) => {
  const S = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  if (bg === 'hindukush') return (
    <g {...S}><defs><linearGradient id={`hk${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7d94b8" /><stop offset="1" stopColor="#e8d9b0" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#hk${seed})`} stroke="none" />
      <circle cx={1620} cy={130} r={46} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <g transform={`translate(${-cx * 0.04} 0)`}><Ridge y={560} col="#5d7186" seedN={3} snow /></g>
      <g transform={`translate(${-cx * 0.09} 0)`}><Ridge y={660} col="#71808a" seedN={7} snow /></g>
      <path d="M0 660 L500 600 L1020 668 L1500 606 L1920 664 V740 H0Z" fill="#a98a5f" stroke="none" />
      <rect y={730} width={1920} height={350} fill="#b08954" />
      {Array.from({length: 12}, (_, i) => <path key={i} d={`M${i * 170 - 30} ${800 + (i % 3) * 80} l26 -12 l22 12 l-10 10 h-36Z`} fill="#96754a" stroke="none" opacity={0.7} />)}</g>);
  if (bg === 'kabul_old') return (
    <g {...S}><defs><linearGradient id={`ko${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f2e3bb" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#ko${seed})`} stroke="none" />
      <g transform={`translate(${-cx * 0.05} 0)`}><Ridge y={600} col="#7d7466" seedN={5} /></g>
      {/* Bala Hissar: the old fortress on its hill */}
      <g transform={`translate(${-cx * 0.1} 0)`}>
        <path d="M620 730 L760 520 H1240 L1340 730Z" fill="#a3804f" />
        <path d="M790 540 H1210 L1180 470 H820Z" fill="#8a6a44" />
        {[830, 960, 1090].map((x, i) => <g key={i}><rect x={x} y={392} width={56} height={86} fill="#77572f" /><path d={`M${x - 8} 392 L${x + 28} 356 L${x + 64} 392Z`} fill="#5d4630" /></g>)}
        <path d="M820 470 H1180" stroke="#5d4630" strokeWidth={8} />
      </g>
      {/* mud-brick houses and one minaret in the foreground rows */}
      {[60, 1420].map((x, i) => (<g key={i} transform={`translate(${x - cx * 0.14} 0)`}>
        <rect x={0} y={560} width={300} height={170} fill={i ? '#b59a68' : '#ab8c5c'} />
        <path d="M-14 560 H314 L282 528 H18Z" fill="#8a6a44" />
        {[36, 128, 220].map((wx, w) => <rect key={w} x={wx} y={606} width={44} height={56} fill="#5d4a33" />)}
        <rect x={128} y={662} width={52} height={68} fill="#4a3826" /></g>))}
      <g transform={`translate(${880 - cx * 0.14} 0)`}><rect x={-20} y={430} width={40} height={300} fill="#c9b184" /><path d="M-30 430 L0 372 L30 430Z" fill="#2e6b6b" /><rect x={-28} y={520} width={56} height={16} fill="#8a6a44" /></g>
      <rect y={730} width={1920} height={350} fill="#a98a5f" />
      <path d="M700 1080 L880 730 H1040 L1220 1080Z" fill="#96754a" stroke="none" opacity={0.75} /></g>);
  if (bg === 'kandahar') return (
    <g {...S}><defs><linearGradient id={`kd${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f7ecc9" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#kd${seed})`} stroke="none" />
      <circle cx={300} cy={120} r={50} fill="#f7dd8e" stroke="none" />
      <g transform={`translate(${-cx * 0.05} 0)`}><Ridge y={590} col="#8a7a5f" seedN={9} /></g>
      {/* the citadel mound */}
      <g transform={`translate(${-cx * 0.1} 0)`}>
        <path d="M240 730 L420 470 H860 L1010 730Z" fill="#b59a68" />
        <path d="M470 500 H810 L780 440 H500Z" fill="#96754a" />
        {[540, 640, 730].map((x, i) => <rect key={i} x={x} y={386} width={44} height={60} fill="#77572f" />)}
      </g>
      {/* the shrine: turquoise dome and two minarets */}
      <g transform={`translate(${1330 - cx * 0.13} 0)`}>
        <rect x={-130} y={560} width={260} height={170} fill="#d9cdb2" />
        <path d="M-90 560 a90 96 0 0 1 180 0Z" fill="#2e8f8a" />
        <path d="M0 452 v-34 M-10 428 h20" stroke="#d9a441" strokeWidth={6} />
        {[-168, 132].map((x, i) => <g key={i}><rect x={x} y={470} width={34} height={260} fill="#c9b184" /><path d={`M${x - 6} 470 L${x + 17} 428 L${x + 40} 470Z`} fill="#2e8f8a" /></g>)}
        {[-84, -28, 28].map((x, i) => <path key={i} d={`M${x} 730 v-84 a20 26 0 0 1 40 0 v84Z`} fill="#5d4a33" />)}
      </g>
      {[120, 560, 1080, 1640].map((x, i) => <g key={i} transform={`translate(${x - cx * 0.16} 0)`}><rect x={-7} y={560} width={14} height={170} fill="#6d5636" /><circle cx={0} cy={520} r={44} fill="#5f7a4a" /><circle cx={-30} cy={548} r={30} fill="#55703f" stroke="none" /></g>)}
      <rect y={730} width={1920} height={350} fill="#c2a06b" /></g>);
  if (bg === 'bamiyan_valley') return (
    <g {...S}><defs><linearGradient id={`bv${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#eef3d8" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#bv${seed})`} stroke="none" />
      <g transform={`translate(${-cx * 0.04} 0)`}><Ridge y={430} col="#71808a" seedN={4} snow /></g>
      {/* the great cliff with its two niches */}
      <g transform={`translate(${-cx * 0.08} 0)`}>
        <path d="M-40 700 L60 300 Q960 210 1860 300 L1960 700Z" fill="#cf9257" />
        {Array.from({length: 9}, (_, i) => <path key={i} d={`M${120 + i * 210} ${330 + (i % 3) * 26} q16 190 -4 350`} stroke="#a96f3a" strokeWidth={10} fill="none" opacity={0.6} />)}
        <path d="M520 690 V470 Q575 420 630 470 V690Z" fill="#5d4030" />
        <path d="M1180 690 V430 Q1245 372 1310 430 V690Z" fill="#5d4030" />
        <path d="M520 690 V470 Q575 420 630 470 M1180 690 V430 Q1245 372 1310 430" fill="none" stroke="#3a2a1e" strokeWidth={6} />
      </g>
      <path d="M0 700 Q480 660 960 700 T1920 700 V740 H0Z" fill="#7fae5f" stroke="none" />
      <path d="M0 716 Q480 690 960 716 T1920 716" stroke="#4f83a8" strokeWidth={13} fill="none" opacity={0.85} />
      <rect y={730} width={1920} height={350} fill="#8fae5f" />
      {Array.from({length: 10}, (_, i) => <path key={i} d={`M${i * 200 - 20} ${810 + (i % 4) * 58} q8 -24 14 0 M${i * 200 + 22} ${810 + (i % 4) * 58} q6 -18 12 0`} stroke="#5f7a38" fill="none" />)}</g>);
  if (bg === 'khyber') return (
    <g {...S}><defs><linearGradient id={`kh${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a8c4de" /><stop offset="1" stopColor="#e8dcc0" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#kh${seed})`} stroke="none" />
      <path d="M0 0 L760 0 L900 730 L0 730Z" fill="#6d6250" />
      <path d="M1920 0 L1160 0 L1020 730 L1920 730Z" fill="#77694f" />
      <path d="M120 0 L700 0 L830 730 L240 730Z" fill="#7d7466" stroke="none" opacity={0.7} />
      <path d="M1800 0 L1220 0 L1090 730 L1680 730Z" fill="#857c68" stroke="none" opacity={0.7} />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${180 + i * 30} ${120 + i * 130} L${640 - i * 8} ${140 + i * 128} M${1740 - i * 30} ${120 + i * 130} L${1280 + i * 8} ${140 + i * 128}`} stroke="#57493a" strokeWidth={7} opacity={0.55} />)}
      {/* the switchback road climbing through the gap */}
      <path d="M960 730 L860 640 L1010 560 L880 480 L1000 410 L900 340" fill="none" stroke="#c9b184" strokeWidth={22} />
      <path d="M960 730 L860 640 L1010 560 L880 480 L1000 410 L900 340" fill="none" stroke="#a98a5f" strokeWidth={5} strokeDasharray="20 16" />
      <rect y={730} width={1920} height={350} fill="#9a8a76" /></g>);
  if (bg === 'bazaar_af') return (
    <g {...S}>
      <rect width={1920} height={1080} fill="#4a3826" stroke="none" />
      {[0, 1, 2].map((i) => { const x = 320 + i * 640; return (<g key={i}>
        <path d={`M${x - 260} 730 V420 Q${x} 240 ${x + 260} 420 V730Z`} fill="#8a6a44" />
        <path d={`M${x - 260} 730 V420 Q${x} 240 ${x + 260} 420 V730`} fill="none" stroke="#5d4630" strokeWidth={10} />
        <path d={`M${x} 268 L${x - 60} 730 L${x + 190} 730Z`} fill="#f6dfa0" opacity={0.13} stroke="none" />
        {[0, 1, 2, 3].map((r) => <path key={r} d={`M${x - 260 + r * 8} ${470 + r * 62} Q${x} ${300 + r * 60} ${x + 260 - r * 8} ${470 + r * 62}`} stroke="#6d5636" strokeWidth={7} fill="none" opacity={0.8} />)}
      </g>); })}
      {/* stall fronts along the bottom */}
      {[60, 700, 1340].map((x, i) => (<g key={i}>
        <rect x={x} y={640} width={520} height={90} fill="#5d4630" />
        <path d={`M${x - 16} 640 L${x + 260} 596 L${x + 536} 640Z`} fill={i % 2 ? '#8a2f2f' : '#2e5d50'} />
        {[0, 1, 2, 3, 4].map((b) => <rect key={b} x={x + 36 + b * 96} y={664} width={64} height={48} fill={['#b0894a', '#7a2e2e', '#31599f', '#c2a06b', '#2e6b46'][b]} />)}
      </g>))}
      <rect y={730} width={1920} height={350} fill="#8a6a44" />
      {Array.from({length: 12}, (_, i) => <path key={i} d={`M${i * 165 - 20} ${790 + (i % 3) * 86} H${i * 165 + 90}`} stroke="#6d5636" strokeWidth={5} opacity={0.6} />)}</g>);
  if (bg === 'kabul_modern') return (
    <g {...S}><defs><linearGradient id={`km${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#93a7bd" /><stop offset="1" stopColor="#ddd3b8" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#km${seed})`} stroke="none" />
      <g transform={`translate(${-cx * 0.04} 0)`}><Ridge y={520} col="#71808a" seedN={6} /></g>
      {/* city blocks */}
      <g transform={`translate(${-cx * 0.1} 0)`}>
        {[40, 300, 560, 1180, 1440, 1700].map((x, i) => { const h = 150 + (i % 3) * 60; return (<g key={i}><rect x={x} y={730 - h} width={210} height={h} fill={i % 2 ? '#a49a86' : '#98917e'} />{[0, 1, 2].map((r) => [0, 1, 2, 3].map((w) => <rect key={r * 4 + w} x={x + 22 + w * 48} y={730 - h + 24 + r * 44} width={28} height={30} fill="#5d6672" />))}</g>); })}
        {/* the airport tower */}
        <g transform="translate(880 0)"><rect x={-16} y={470} width={32} height={260} fill="#8d8578" /><rect x={-52} y={428} width={104} height={48} rx={8} fill="#5d6672" /><path d="M0 428 v-30 M-12 404 h24" stroke="#3a3f44" strokeWidth={6} /></g>
        {/* a jet on climb-out, far off */}
        <g transform={`translate(${1500 - (f % 900) * 0.4} ${210 - (f % 900) * 0.06}) scale(0.5)`}><path d="M-90 0 L60 -14 L110 0 L60 12 L-40 10Z" fill="#c9ccd4" /><path d="M-20 -6 L-52 -44 L-30 -46 L8 -10Z" fill="#aab0b8" /></g>
      </g>
      <rect y={730} width={1920} height={350} fill="#8d8578" />
      <path d="M0 800 H1920 M0 920 H1920" stroke="#6d675c" strokeWidth={6} opacity={0.6} /></g>);
  return null;
};
