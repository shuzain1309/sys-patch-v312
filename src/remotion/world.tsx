// Vidfactory world kit: everything is drawn in code (SVG). No image files.
// Stickman rig (poses, blink, breathing, lip-sync), 25 props, parallax backdrops, a Stage engine.
// Copy once to src/remotion/world.tsx next to kit.tsx. Do not edit per video.
import React from 'react';
import {Easing, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadHand} from '@remotion/google-fonts/PatrickHand';

export const HAND = typeof window === 'undefined' ? 'sans-serif' : loadHand('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
export const INK = '#241c17';
export const CHAR = 1.3; // global stickman scale (reference channels draw big characters)
export type WordT = {w: string; s: number; e: number};

const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const rad = (d: number) => (d * Math.PI) / 180;
const P = (x: number, y: number, l: number, d: number): [number, number] => [x + l * Math.sin(rad(d)), y + l * Math.cos(rad(d))];
const OL = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const mix = (hex: string, k: number) => {
  // k<0 darken, k>0 lighten
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.round(Math.min(255, Math.max(0, ((n >> s) & 255) + (k < 0 ? ((n >> s) & 255) * k : (255 - ((n >> s) & 255)) * k))));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};
const pop = (f: number, fps: number, at: number) => {
  const p = spring({frame: f - at, fps, config: {damping: 13, stiffness: 150}});
  return {o: clamp01(p * 3), k: Math.max(0, p)};
};

// ===================== STICKMAN =====================
export type PoseName = 'idle' | 'point' | 'wave' | 'shrug' | 'think' | 'shock' | 'cheer' | 'open' | 'walk' | 'run' | 'attack' | 'fall' | 'salute' | 'cower' | 'sit' | 'kneel' | 'bow' | 'block';
export type Face = 'smile' | 'neutral' | 'shock' | 'sad' | 'angry';
type Ang = [number, number];
const POSES: Record<Exclude<PoseName, 'walk' | 'run'>, {l: Ang; r: Ang}> = {
  attack: {l: [-14, -8], r: [110, 100]},
  fall: {l: [-100, -112], r: [104, 118]},
  salute: {l: [-14, -8], r: [96, 100]},
  cower: {l: [-150, -30], r: [150, 30]},
  idle: {l: [-14, -8], r: [14, 8]},
  point: {l: [-14, -8], r: [80, 88]},
  wave: {l: [-14, -8], r: [140, 158]},
  shrug: {l: [-40, -130], r: [40, 130]},
  think: {l: [-14, -8], r: [24, 160]},
  shock: {l: [-128, -150], r: [128, 150]},
  cheer: {l: [-138, -158], r: [138, 158]},
  open: {l: [-68, -84], r: [68, 84]},
  sit: {l: [-8, 20], r: [8, -20]},
  kneel: {l: [-12, 10], r: [12, -10]},
  bow: {l: [-6, -2], r: [6, 2]},
  block: {l: [-72, -100], r: [50, 66]},
};
const LEAN: Partial<Record<PoseName, number>> = {walk: 2, run: 12, attack: 10, cower: 14, bow: 38, kneel: 6, block: 8};

export type Hair = 'none' | 'short' | 'long' | 'topknot' | 'curly' | 'wild' | 'parted' | 'bald';
export type Outfit = 'tunic' | 'robe' | 'coat' | 'dress' | 'armor' | 'toga';
export type Look = {hat: 'none' | 'explorer' | 'top' | 'crown' | 'cap' | 'helmet' | 'straw' | 'bowler' | 'tricorn' | 'bun' | 'laurel' | 'crest' | 'hood'; shirt: string; pants: string; skin: string; extra?: 'scarf' | 'beard' | 'apron'; ec?: string; cape?: string; toga?: string; armor?: boolean;
  outfit?: Outfit; hair?: Hair; hc?: string; facial?: 'full' | 'goatee' | 'stache' | 'long'; trim?: string; sleeve?: string; bare?: boolean; shoes?: string; fc?: string; glasses?: boolean};
export const LOOKS: Record<string, Look> = {
  narrator: {hat: 'explorer', shirt: '#d9c79a', pants: '#6b5a45', skin: '#f3dcc6', extra: 'scarf', ec: '#c0392b', hair: 'short', hc: '#a8a8a8', facial: 'stache', trim: '#8a6d3b', shoes: '#5a4632'},
  merchant: {hat: 'top', shirt: '#2b2d42', pants: '#2b2d42', skin: '#efd3b8', outfit: 'coat', trim: '#c9a84a', hair: 'short', hc: '#3b2a20', facial: 'stache'},
  banker: {hat: 'bowler', shirt: '#44464f', pants: '#2f3038', skin: '#eed2b6', outfit: 'coat', trim: '#d8d8d8', hair: 'short', hc: '#6d5a48', facial: 'full', ec: '#6d5a48'},
  king: {hat: 'crown', shirt: '#6a2c91', pants: '#4a1d68', skin: '#f0d2b6', outfit: 'robe', trim: '#f2c230', cape: '#8e2a2a', hair: 'long', hc: '#d8d8d8', facial: 'long', ec: '#d8d8d8', shoes: '#3a2a1a'},
  soldier: {hat: 'helmet', shirt: '#9a2a2a', pants: '#3d3d4d', skin: '#e7c4a4', outfit: 'coat', trim: '#d9b24a', shoes: '#2a2a2a'},
  sailor: {hat: 'tricorn', shirt: '#e8e8e8', pants: '#2d4a7a', skin: '#dcb592', hair: 'long', hc: '#4a3426', facial: 'goatee', trim: '#2d4a7a'},
  worker: {hat: 'cap', shirt: '#8a6a4a', pants: '#4d4033', skin: '#d7a985', hair: 'short', hc: '#3b2a20', facial: 'stache', shoes: '#3a2a1a'},
  farmer: {hat: 'straw', shirt: '#5d8a4a', pants: '#6b5a45', skin: '#d9b08c', extra: 'apron', ec: '#e9dcb8', hair: 'short', hc: '#6d5a48', bare: false},
  woman: {hat: 'bun', shirt: '#c0526b', pants: '#6d3f4d', skin: '#e8c4a6', outfit: 'dress', trim: '#f0d9a8', hc: '#5a3a28'},
  blue: {hat: 'none', shirt: '#3b6fb6', pants: '#26467a', skin: '#e9c9a8', hair: 'short', hc: '#4a3426'},
  green: {hat: 'none', shirt: '#3f9d63', pants: '#276b43', skin: '#dcb58f', hair: 'parted', hc: '#2f2a22'},
  // ---- Rome pack
  senator: {hat: 'none', shirt: '#efe9dc', pants: '#efe9dc', skin: '#efd3b8', toga: '#efe9dc', trim: '#8a2b9a', hair: 'bald', hc: '#b8b8b8', shoes: '#8a5a33'},
  caesar: {hat: 'laurel', shirt: '#efe9dc', pants: '#efe9dc', skin: '#efd3b8', toga: '#f3eee2', cape: '#7b2d8e', trim: '#7b2d8e', hair: 'bald', hc: '#8a7a6a', shoes: '#8a5a33'},
  emperor: {hat: 'laurel', shirt: '#7b2d8e', pants: '#7b2d8e', skin: '#efd3b8', outfit: 'robe', toga: undefined, cape: '#5d1f6e', trim: '#f2c230', hair: 'curly', hc: '#4a3426', shoes: '#8a5a33'},
  legionary: {hat: 'helmet', shirt: '#b53a32', pants: '#6b5a45', skin: '#e7c4a4', armor: true, bare: true, trim: '#c4a24a', shoes: '#7a5230'},
  centurion: {hat: 'crest', shirt: '#b53a32', pants: '#6b5a45', skin: '#e0b896', armor: true, bare: true, cape: '#a8242c', trim: '#c4a24a', facial: 'stache', hc: '#3b2a20', shoes: '#7a5230'},
  barbarian: {hat: 'none', shirt: '#7a5a3a', pants: '#4a3a2a', skin: '#e9c9a8', extra: 'beard', ec: '#c9892f', hair: 'wild', hc: '#c9892f', facial: 'full', bare: true, shoes: '#4a3a2a'},
  gaul: {hat: 'none', shirt: '#2f6f8a', pants: '#8a6b3a', skin: '#f0d2b6', extra: 'beard', ec: '#d9a441', hair: 'wild', hc: '#d9a441', facial: 'stache', trim: '#d9a441', shoes: '#4a3a2a'},
  hannibal: {hat: 'crest', shirt: '#2b2f3a', pants: '#2b2f3a', skin: '#b98a63', armor: true, cape: '#5a1f1f', trim: '#c4a24a', facial: 'goatee', hc: '#1f1a17', bare: true, shoes: '#2a2a2a'},
  vestal: {hat: 'hood', shirt: '#f4f1e6', pants: '#f4f1e6', skin: '#f0d6bd', outfit: 'robe', trim: '#d8c48a'},
  plotter: {hat: 'hood', shirt: '#33343f', pants: '#2a2b33', skin: '#e3c3a2', outfit: 'robe', trim: '#555769', facial: 'goatee', hc: '#1f1a17'},
  shepherd: {hat: 'straw', shirt: '#8a7a55', pants: '#5a4a35', skin: '#d6ad88', hair: 'short', hc: '#5a4a35', facial: 'full', ec: '#6d5a48'},
  // ---- generic history cast
  queen: {hat: 'crown', shirt: '#2f6f8a', pants: '#2f6f8a', skin: '#f0d2b6', outfit: 'dress', trim: '#f2c230', hair: 'long', hc: '#5a3a28', cape: '#7b2d8e'},
  general: {hat: 'cap', shirt: '#4a5a3a', pants: '#3a4a2f', skin: '#e7c4a4', outfit: 'coat', trim: '#d9b24a', hair: 'short', hc: '#3b2a20', facial: 'stache', shoes: '#2a2a2a'},
  monk: {hat: 'none', shirt: '#8a5a33', pants: '#8a5a33', skin: '#efd3b8', outfit: 'robe', trim: '#d8c48a', hair: 'bald', hc: '#5a4a35', shoes: '#5a4632'},
  scholar: {hat: 'none', shirt: '#3b5a8a', pants: '#3b5a8a', skin: '#efd3b8', outfit: 'robe', trim: '#d8d8d8', hair: 'topknot', hc: '#1f1a17', facial: 'goatee', shoes: '#2a2a2a'},
  // narrator costumes by topic (set THEME.narrator): same guide, dressed for the era
  narrator_rome: {hat: 'laurel', shirt: '#efe9dc', pants: '#efe9dc', skin: '#f3dcc6', toga: '#efe9dc', trim: '#8a2b9a', hair: 'short', hc: '#a8a8a8', facial: 'stache', shoes: '#8a5a33'},
  narrator_war: {hat: 'helmet', shirt: '#6b5a45', pants: '#4a3a2a', skin: '#f3dcc6', outfit: 'coat', trim: '#c4a24a', facial: 'stache', hc: '#a8a8a8', shoes: '#2a2a2a'},
  narrator_medieval: {hat: 'hood', shirt: '#5a4a7a', pants: '#3a3050', skin: '#f3dcc6', outfit: 'robe', trim: '#d8c48a', facial: 'long', hc: '#c8c8c8', fc: '#c8c8c8', shoes: '#3a2a1a'},
  narrator_modern: {hat: 'cap', shirt: '#3b5a8a', pants: '#2f3038', skin: '#f3dcc6', outfit: 'coat', trim: '#d8d8d8', hair: 'short', hc: '#a8a8a8', facial: 'stache', shoes: '#2a2a2a'},
  // Fact Check Frank: shown translucent (ghost) with a FACT CHECK badge. v0 design, awaiting brand sheet
  frank: {hat: 'none', shirt: '#3f7fbf', pants: '#2f4f7a', skin: '#f3dcc6', outfit: 'coat', trim: '#f2c230', hair: 'parted', hc: '#5a3a28', glasses: true, shoes: '#22304a'},
  peasant: {hat: 'straw', shirt: '#a8946a', pants: '#6b5a45', skin: '#d9b08c', hair: 'short', hc: '#4a3426', shoes: '#5a4632'},
};

export type Held = 'sword' | 'spear' | 'torch' | 'scroll' | 'dagger' | 'goblet' | 'standard' | 'lyre' | 'coin' | 'magnifier';
export type ActorT = {who?: string; x: number | [number, number]; y?: number; s?: number; pose?: PoseName; face?: Face; flip?: boolean; say?: string; at?: number; talk?: boolean; look?: string | Look; raw?: boolean; held?: Held; shield?: boolean; fa?: number; hide?: number; ghost?: number};

const Hat: React.FC<{k: Look['hat']; top: number; skin: string}> = ({k, top, skin}) => {
  switch (k) {
    case 'explorer': return (<g {...OL}><ellipse cx={0} cy={top + 10} rx={74} ry={13} fill="#b8935a" /><path d={`M-48 ${top + 8} Q-46 ${top - 40} 0 ${top - 42} Q46 ${top - 40} 48 ${top + 8}Z`} fill="#c9a56a" /><path d={`M-47 ${top - 4} Q0 ${top + 6} 47 ${top - 4}`} fill="none" stroke="#8a3b2e" strokeWidth={9} /></g>);
    case 'top': return (<g {...OL}><ellipse cx={0} cy={top + 8} rx={62} ry={11} fill="#1f1f27" /><rect x={-36} y={top - 74} width={72} height={80} rx={6} fill="#26262f" /><rect x={-36} y={top - 12} width={72} height={14} fill="#8a2b2b" /></g>);
    case 'crown': return (<g {...OL}><path d={`M-40 ${top + 10} L-46 ${top - 38} L-22 ${top - 14} L0 ${top - 48} L22 ${top - 14} L46 ${top - 38} L40 ${top + 10}Z`} fill="#f2c230" /><circle cx={0} cy={top - 6} r={7} fill="#d63b3b" /><circle cx={-24} cy={top - 2} r={5} fill="#3b82d6" /><circle cx={24} cy={top - 2} r={5} fill="#3b82d6" /></g>);
    case 'cap': return (<g {...OL}><path d={`M-50 ${top + 14} Q-48 ${top - 30} 0 ${top - 30} Q48 ${top - 30} 50 ${top + 14}Z`} fill="#4b5d73" /><path d={`M10 ${top + 10} L74 ${top + 14} Q70 ${top + 24} 10 ${top + 20}Z`} fill="#3a4859" /></g>);
    case 'helmet': return (<g {...OL}><path d={`M-52 ${top + 18} Q-54 ${top - 36} 0 ${top - 38} Q54 ${top - 36} 52 ${top + 18}Z`} fill="#b9c0c9" /><path d={`M0 ${top - 38} Q-10 ${top - 74} 22 ${top - 70} Q8 ${top - 56} 12 ${top - 36}Z`} fill="#c0392b" /><rect x={-5} y={top - 10} width={10} height={34} fill="#8f98a3" /></g>);
    case 'straw': return (<g {...OL}><ellipse cx={0} cy={top + 12} rx={86} ry={15} fill="#e4c673" /><path d={`M-46 ${top + 10} Q-44 ${top - 34} 0 ${top - 34} Q44 ${top - 34} 46 ${top + 10}Z`} fill="#edd58a" /><path d={`M-46 ${top - 2} Q0 ${top + 8} 46 ${top - 2}`} fill="none" stroke="#a5532e" strokeWidth={8} /></g>);
    case 'bowler': return (<g {...OL}><ellipse cx={0} cy={top + 12} rx={64} ry={11} fill="#2a2a2f" /><path d={`M-44 ${top + 12} Q-44 ${top - 40} 0 ${top - 40} Q44 ${top - 40} 44 ${top + 12}Z`} fill="#35353c" /></g>);
    case 'tricorn': return (<g {...OL}><path d={`M-78 ${top + 14} L0 ${top - 42} L78 ${top + 14} Q0 ${top + 30} -78 ${top + 14}Z`} fill="#2b2d42" /><path d={`M-78 ${top + 14} Q0 ${top + 30} 78 ${top + 14}`} fill="none" stroke="#d9b24a" strokeWidth={5} /></g>);
    case 'laurel': return (<g {...OL}>{Array.from({length: 9}, (_, i) => { const a = Math.PI * (0.08 + i * 0.105); return <ellipse key={i} cx={-Math.cos(a) * 52} cy={top + 20 - Math.sin(a) * 28} rx={11} ry={6} fill="#3f9a4a" transform={`rotate(${-30 + i * 8} ${-Math.cos(a) * 52} ${top + 20 - Math.sin(a) * 28})`} />; })}</g>);
    case 'crest': return (<g {...OL}><path d={`M-52 ${top + 18} Q-54 ${top - 36} 0 ${top - 38} Q54 ${top - 36} 52 ${top + 18}Z`} fill="#c4a24a" /><path d={`M-60 ${top - 30} Q0 ${top - 92} 60 ${top - 30} L48 ${top - 24} Q0 ${top - 70} -48 ${top - 24}Z`} fill="#b3202a" /><rect x={-5} y={top - 10} width={10} height={34} fill="#a0842f" /></g>);
    case 'hood': return (<g {...OL}><path d={`M-64 ${top + 74} Q-72 ${top - 40} 0 ${top - 46} Q72 ${top - 40} 64 ${top + 74} Q40 ${top + 30} 0 ${top + 28} Q-40 ${top + 30} -64 ${top + 74}Z`} fill="#3a3b48" /></g>);
    case 'bun': return (<g {...OL}><circle cx={0} cy={top - 34} r={20} fill="#5a3a28" /><path d={`M-50 ${top + 36} Q-56 ${top - 20} 0 ${top - 18} Q56 ${top - 20} 50 ${top + 36} Q40 ${top + 4} 0 ${top + 2} Q-40 ${top + 4} -50 ${top + 36}Z`} fill="#5a3a28" /></g>);
    default: return null;
  }
};

const HeldArt: React.FC<{k: Held; f: number}> = ({k, f}) => {
  switch (k) {
    case 'sword': return (<g {...OL}><rect x={-26} y={-8} width={52} height={12} rx={4} fill="#c4a24a" /><rect x={-7} y={-2} width={14} height={34} fill="#6b3a2a" /><path d="M-9 -8 L-9 -150 L0 -176 L9 -150 L9 -8Z" fill="#dfe5ec" /><path d="M0 -10 V-160" stroke="#9aa5b1" strokeWidth={3} /></g>);
    case 'dagger': return (<g {...OL}><rect x={-14} y={-6} width={28} height={9} rx={3} fill="#c4a24a" /><rect x={-5} y={0} width={10} height={24} fill="#6b3a2a" /><path d="M-7 -6 L-7 -66 L0 -84 L7 -66 L7 -6Z" fill="#dfe5ec" /></g>);
    case 'spear': return (<g {...OL}><rect x={-4} y={-230} width={8} height={290} fill="#8a5a33" /><path d="M-14 -226 L0 -290 L14 -226Z" fill="#dfe5ec" /></g>);
    case 'standard': return (<g {...OL}><rect x={-4} y={-330} width={8} height={380} fill="#8a5a33" /><rect x={-34} y={-300} width={68} height={10} fill="#c4a24a" /><path d="M0 -380 L-44 -350 L-30 -338 L0 -352 L30 -338 L44 -350Z" fill="#e2b84a" /><circle cx={0} cy={-350} r={8} fill="#e2b84a" /><rect x={-22} y={-280} width={44} height={50} fill="#b3202a" /></g>);
    case 'torch': return (<g {...OL}><rect x={-6} y={-70} width={12} height={90} fill="#6b4a2a" /><g transform="translate(0 -66) scale(0.5)"><Flame f={f} k={3} w={40} h={110} /></g></g>);
    case 'scroll': return (<g {...OL}><rect x={-34} y={-70} width={68} height={86} rx={8} fill="#f3e6bf" /><rect x={-40} y={-76} width={80} height={12} rx={6} fill="#a8793f" /><rect x={-40} y={10} width={80} height={12} rx={6} fill="#a8793f" /><path d="M-20 -46 H20 M-20 -26 H20 M-20 -6 H8" stroke="#8a6a3a" strokeWidth={3} /></g>);
    case 'goblet': return (<g {...OL}><path d="M-22 -50 L22 -50 L14 -10 L-14 -10Z" fill="#e2b84a" /><rect x={-4} y={-10} width={8} height={26} fill="#e2b84a" /><rect x={-16} y={14} width={32} height={8} rx={3} fill="#e2b84a" /></g>);
    case 'lyre': return (<g {...OL}><path d="M-34 -80 Q-40 -20 0 -10 Q40 -20 34 -80" fill="none" strokeWidth={9} stroke="#c4a24a" />{[-18, -6, 6, 18].map((x, i) => <path key={i} d={`M${x} -80 V-18`} stroke="#8a6a3a" strokeWidth={2.5} />)}</g>);
    case 'magnifier': return (<g {...OL}><rect x={-4} y={-4} width={8} height={46} rx={4} fill="#6b3a2a" /><circle cx={0} cy={-34} r={30} fill="#bfe6ff" fillOpacity={0.45} stroke="#c4a24a" strokeWidth={7} /><path d="M-16 -44 Q-8 -54 6 -52" fill="none" stroke="#fff" strokeWidth={4} /></g>);
    case 'coin': return (<g {...OL}><circle cx={0} cy={-24} r={26} fill="#f6cf4a" /><circle cx={0} cy={-24} r={17} fill="none" stroke="#b8860b" strokeWidth={3} /></g>);
  }
};

const HAIRLESS: Look['hat'][] = ['helmet', 'crest', 'hood', 'bun'];
const outfitOf = (l: Look): Outfit => l.outfit ?? (l.armor ? 'armor' : l.toga ? 'toga' : 'tunic');

// hair that sits behind the head (long styles) and in front of it (fringe), both drawn from the head centre
const HairBack: React.FC<{k: Hair; y: number; c: string}> = ({k, y, c}) => {
  if (k === 'long') return <path d={`M-58 ${y - 6} Q-76 ${y + 70} -50 ${y + 104} L50 ${y + 104} Q76 ${y + 70} 58 ${y - 6}Z`} fill={c} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  if (k === 'wild') return <path d={`M-60 ${y - 10} L-78 ${y + 30} L-62 ${y + 36} L-74 ${y + 78} L-44 ${y + 66} L-30 ${y + 96} L0 ${y + 72} L30 ${y + 96} L44 ${y + 66} L74 ${y + 78} L62 ${y + 36} L78 ${y + 30} L60 ${y - 10}Z`} fill={c} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  return null;
};
const HairFront: React.FC<{k: Hair; y: number; c: string}> = ({k, y, c}) => {
  const S = {fill: c, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  switch (k) {
    case 'short': case 'long': return <path d={`M-56 ${y - 2} Q-62 ${y - 66} 0 ${y - 66} Q62 ${y - 66} 56 ${y - 2} Q50 ${y - 30} 30 ${y - 40} Q0 ${y - 28} -30 ${y - 42} Q-50 ${y - 30} -56 ${y - 2}Z`} {...S} />;
    case 'parted': return <g><path d={`M-56 ${y - 2} Q-62 ${y - 66} 0 ${y - 66} Q62 ${y - 66} 56 ${y - 2} Q52 ${y - 32} 14 ${y - 44} Q-30 ${y - 34} -56 ${y - 2}Z`} {...S} /><path d={`M14 ${y - 62} Q16 ${y - 50} 14 ${y - 44}`} fill="none" stroke={INK} strokeWidth={2.5} /></g>;
    case 'topknot': return <g><circle cx={0} cy={y - 76} r={15} {...S} /><path d={`M-12 ${y - 62} h24`} stroke={INK} strokeWidth={4} /><path d={`M-56 ${y - 2} Q-62 ${y - 66} 0 ${y - 66} Q62 ${y - 66} 56 ${y - 2} Q50 ${y - 28} 0 ${y - 30} Q-50 ${y - 28} -56 ${y - 2}Z`} {...S} /></g>;
    case 'curly': return <g {...S}>{Array.from({length: 7}, (_, i) => { const a = Math.PI * (0.06 + i * 0.148); return <circle key={i} cx={-Math.cos(a) * 52} cy={y - 8 - Math.sin(a) * 52} r={14} />; })}</g>;
    case 'wild': return <path d={`M-58 ${y} Q-66 ${y - 70} -20 ${y - 70} L-10 ${y - 84} L2 ${y - 70} L16 ${y - 86} L24 ${y - 68} Q66 ${y - 68} 58 ${y} Q46 ${y - 24} 24 ${y - 36} L8 ${y - 22} L-8 ${y - 38} L-28 ${y - 30} Q-48 ${y - 22} -58 ${y}Z`} {...S} />;
    case 'bald': return <g {...S}><path d={`M-55 ${y + 6} Q-60 ${y - 20} -50 ${y - 30} Q-54 ${y - 8} -46 ${y + 12}Z`} /><path d={`M55 ${y + 6} Q60 ${y - 20} 50 ${y - 30} Q54 ${y - 8} 46 ${y + 12}Z`} /></g>;
    default: return null;
  }
};
const Facial: React.FC<{k?: Look['facial']; y: number; c: string}> = ({k, y, c}) => {
  const S = {fill: c, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  if (!k) return null;
  const stache = <path d={`M-30 ${y + 14} Q-14 ${y + 4} 0 ${y + 14} Q14 ${y + 4} 30 ${y + 14} Q18 ${y + 30} 0 ${y + 22} Q-18 ${y + 30} -30 ${y + 14}Z`} {...S} />;
  if (k === 'stache') return stache;
  if (k === 'goatee') return <g><path d={`M-16 ${y + 36} Q0 ${y + 82} 16 ${y + 36} Q0 ${y + 44} -16 ${y + 36}Z`} {...S} />{stache}</g>;
  const ext = k === 'long' ? 70 : 0;
  return <g><path d={`M-52 ${y - 4} Q-56 ${y + 66 + ext} 0 ${y + 76 + ext * 1.6} Q56 ${y + 66 + ext} 52 ${y - 4} Q40 ${y + 24} 0 ${y + 20} Q-40 ${y + 24} -52 ${y - 4}Z`} {...S} />{stache}</g>;
};

export const Actor: React.FC<{a: ActorT; words?: WordT[]; seed?: string}> = ({a, words, seed = 'a'}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: d} = useVideoConfig();
  const look: Look = typeof a.look === 'object' ? a.look : LOOKS[a.look ?? a.who ?? 'blue'] ?? LOOKS.blue;
  const ph = random(`${seed}ph`) * 6;
  const x = Array.isArray(a.x) ? interpolate(f, [0, d * 0.85], a.x, {...C, easing: Easing.inOut(Easing.quad)}) : a.x;
  const moving = Array.isArray(a.x) && a.x[0] !== a.x[1] && f < d * 0.85;
  const fallen = a.fa !== undefined && f >= a.fa * d;
  const pose: PoseName = fallen ? 'fall' : a.pose ?? (moving ? 'walk' : 'idle');
  const fr = pose === 'fall' ? (a.fa !== undefined ? interpolate(f, [a.fa * d, a.fa * d + 9], [0, 1], {...C, easing: Easing.in(Easing.quad)}) : 1) : 0;
  const gone = a.hide !== undefined && f >= a.hide * d ? 0 : 1;
  const sw = Math.sin(f / 22 + ph) * 3;
  const w = f / (pose === 'run' ? 3.4 : 6);
  let L: Ang, R: Ang, LL: Ang, RL: Ang;
  if (pose === 'walk' || pose === 'run') {
    const am = pose === 'run' ? 55 : 30;
    L = [-Math.sin(w) * am, -Math.sin(w) * am - 10];
    R = [Math.sin(w) * am, Math.sin(w) * am + 10];
    LL = [Math.sin(w) * am, Math.sin(w) * am - 12];
    RL = [-Math.sin(w) * am, -Math.sin(w) * am - 12];
  } else {
    const p = POSES[pose];
    L = [p.l[0] - sw, p.l[1] - sw];
    R = [p.r[0] + sw, p.r[1] + sw + (pose === 'wave' ? Math.sin(f / 4) * 22 : 0)];
    LL = [-5, -3];
    RL = [5, 3];
    if (pose === 'sit') { LL = [88, 2]; RL = [92, -2]; }
    if (pose === 'kneel') { LL = [-24, -86]; RL = [76, -6]; }
    if (pose === 'attack') {
      const k = Math.sin(f / 3.2);
      R = [105 + k * 55, 95 + k * 75];
    }
    if (pose === 'cower') {
      L = [L[0] + Math.sin(f / 2) * 3, L[1]];
      R = [R[0] - Math.sin(f / 2) * 3, R[1]];
    }
    if (pose === 'cheer') {
      L = [L[0], L[1] + Math.sin(f / 4) * 8];
      R = [R[0], R[1] - Math.sin(f / 4) * 8];
    }
  }
  const t = f / fps;
  const wd = words?.find((q) => t >= q.s && t <= q.e);
  const open = a.talk ? (words?.length ? (wd ? 0.35 + 0.65 * Math.abs(Math.sin(f * 0.9)) : 0.04) : Math.abs(Math.sin(f * 0.4)) * 0.8) : 0;
  if (a.talk && pose !== 'walk' && pose !== 'run') {
    R = [R[0] + Math.sin(f / 5) * 4 * (wd ? 1 : 0.3), R[1] + Math.sin(f / 5 + 1) * 6 * (wd ? 1 : 0.3)];
  }
  const blink = (f + Math.floor(ph * 20)) % 110 < 4;
  const face: Face = a.face ?? 'smile';
  const bob = pose === 'walk' || pose === 'run' ? -Math.abs(Math.sin(w)) * (pose === 'run' ? 12 : 7) : pose === 'cheer' ? -Math.abs(Math.sin(f / 4)) * 14 : Math.sin(f / 14 + ph) * 1.6;
  const dy = pose === 'sit' ? 74 : pose === 'kneel' ? 64 : 0; // body drops; legs fold
  const lean = LEAN[pose] ?? 0;
  const hipY = -150 + dy, shY = -268 + dy, headY = -340 + dy + bob * 0.4, HR = 58;
  const SHX = 26; // half shoulder width
  const shL: [number, number] = [-SHX + 2, shY + 10 + bob * 0.5], shR: [number, number] = [SHX - 2, shY + 10 + bob * 0.5];
  const arm = (sh: [number, number], ang: Ang) => {
    const el = P(sh[0], sh[1], 62, ang[0]);
    const hd = P(el[0], el[1], 62, ang[1]);
    return {el, hd};
  };
  const aL = arm(shL, L), aR = arm(shR, R);
  const leg = (hx: number, ang: Ang) => {
    const kn = P(hx, hipY + 4, 75, ang[0]);
    const ft = P(kn[0], kn[1], 75, ang[1]);
    return {kn, ft};
  };
  const lL = leg(-11, LL), lR = leg(11, RL);
  const e = a.at !== undefined ? pop(f, fps, a.at * d) : {o: 1, k: 1};
  const s = (a.s ?? 1) * (a.raw ? 1 : CHAR);
  const out = outfitOf(look);
  const hair: Hair = look.hair ?? (HAIRLESS.includes(look.hat) ? 'none' : 'short');
  const hc = look.hc ?? '#4a3426';
  const facial = look.facial ?? (look.extra === 'beard' ? 'full' : undefined);
  const fc = look.fc ?? (look.extra === 'beard' && look.ec ? look.ec : hc); // facial hair colour: never the scarf/apron colour
  const trim = look.trim ?? mix(look.shirt, -0.35);
  const shoes = look.shoes ?? '#3b2c22';
  const sleeve = look.bare || out === 'armor' ? look.skin : look.sleeve ?? look.shirt;
  const ls = (p: [number, number][], w2: number, col: string) => <polyline points={p.map((q) => q.join(',')).join(' ')} fill="none" stroke={col} strokeWidth={w2} strokeLinecap="round" strokeLinejoin="round" />;
  const limb = (p: [number, number][], w2: number, col: string) => (<g>{ls(p, w2 + 6, INK)}{ls(p, w2, col)}</g>);
  const sleeved = (sh: [number, number], ar: {el: [number, number]; hd: [number, number]}) => (
    <g>{limb([sh, ar.el], 19, sleeve)}{limb([ar.el, ar.hd], out === 'robe' || out === 'coat' ? 17 : look.bare || out === 'armor' ? 15 : 17, out === 'robe' || out === 'coat' ? sleeve : look.bare || out === 'armor' ? look.skin : sleeve)}
      {(out === 'coat' || out === 'robe') && <circle cx={ar.hd[0]} cy={ar.hd[1]} r={11} fill={trim} stroke={INK} strokeWidth={3} />}</g>);
  const hand = (p: [number, number]) => <g><circle cx={p[0]} cy={p[1]} r={10} fill={look.skin} stroke={INK} strokeWidth={3} /></g>;
  const shoe = (ft: [number, number], dir: number) => <path d={`M${ft[0] - 12 * dir} ${ft[1] - 12} Q${ft[0] - 12 * dir} ${ft[1] - 20} ${ft[0] - 2 * dir} ${ft[1] - 19} L${ft[0] + 10 * dir} ${ft[1] - 14} Q${ft[0] + 30 * dir} ${ft[1] - 12} ${ft[0] + 28 * dir} ${ft[1] + 1} L${ft[0] - 12 * dir} ${ft[1] + 1}Z`} fill={shoes} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  const browY = headY - 22;
  const sayT = a.say ? a.say.split(' ') : [];
  const bx = 0;
  const sway = Math.sin(f / 8) * 6 + (pose === 'walk' || pose === 'run' ? Math.sin(w) * 10 : 0);
  const longGarment = out === 'robe' || out === 'dress';
  const hem = longGarment ? -16 + dy * 0.2 : 0;
  const legCol = out === 'armor' && look.bare ? look.skin : look.pants;
  return (
    <g transform={`translate(${x} ${a.y ?? 940}) scale(${(a.flip ? -1 : 1) * s * e.k} ${s * e.k})`} opacity={e.o * gone * (a.ghost ?? 1) * (a.ghost !== undefined ? 0.92 + Math.sin(f / 9 + ph) * 0.08 : 1)}>
      {a.ghost !== undefined && <g fill="#9fd8ff"><ellipse cx={0} cy={-200} rx={170} ry={280} opacity={0.08} /><ellipse cx={0} cy={-200} rx={135} ry={245} opacity={0.1} /><ellipse cx={0} cy={-200} rx={100} ry={210} opacity={0.12} /></g>}
      {a.ghost === undefined && <ellipse cx={0} cy={4} rx={86} ry={13} fill="#000" opacity={0.18} />}
      <g transform={`rotate(${-fr * 88})`}>
      {look.cape && <path d={`M-18 ${shY + 4} Q${-64 - sway} ${hipY - 20} ${-40 - sway * 1.6} ${hipY + 96} L22 ${hipY + 50} L18 ${shY + 4}Z`} fill={look.cape} stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
      {/* legs */}
      {!longGarment && <g>{limb([[-11, hipY + 4], lL.kn, lL.ft], 20, legCol)}{limb([[11, hipY + 4], lR.kn, lR.ft], 20, legCol)}</g>}
      {longGarment && <g>{limb([[-11, hipY + 4], lL.kn, lL.ft], 18, look.pants)}{limb([[11, hipY + 4], lR.kn, lR.ft], 18, look.pants)}</g>}
      {longGarment && (() => {
        const wide = out === 'dress' ? 30 : 20, top = out === 'dress' ? hipY - 2 : hipY + 26;
        return (<g stroke={INK} strokeWidth={3} strokeLinejoin="round"><path d={`M-${SHX - 1} ${top} Q-${SHX + wide + 14} ${hipY + 90} -${SHX + wide + sway * 0.3} ${hem} L${SHX + wide - sway * 0.3} ${hem} Q${SHX + wide + 14} ${hipY + 90} ${SHX - 1} ${top}Z`} fill={look.shirt} /><path d={`M-${SHX + wide + sway * 0.3} ${hem - 8} L${SHX + wide - sway * 0.3} ${hem - 8}`} stroke={trim} strokeWidth={9} /></g>);
      })()}
      {shoe(lL.ft, 1)}{shoe(lR.ft, 1)}
      {out === 'armor' && <g stroke={INK} strokeWidth={2.5}>{[lL, lR].map((q, i) => <path key={i} d={`M${q.ft[0] - 8} ${q.ft[1] - 14} L${q.kn[0] - 8} ${q.kn[1] + 22} M${q.ft[0] + 8} ${q.ft[1] - 14} L${q.kn[0] + 8} ${q.kn[1] + 22}`} />)}</g>}
      {/* upper body leans about the hip */}
      <g transform={`rotate(${lean} 0 ${hipY})`}>
      {sleeved(shL, aL)}
      {/* torso: a shaped garment instead of a tube */}
      <path d={`M-${SHX} ${shY + 8} Q-${SHX} ${shY - 6} -14 ${shY - 6} L14 ${shY - 6} Q${SHX} ${shY - 6} ${SHX} ${shY + 8} L${SHX - 5} ${hipY - 6} L${SHX - 1} ${hipY + 26} L-${SHX - 1} ${hipY + 26} L-${SHX - 5} ${hipY - 6}Z`} fill={out === 'armor' ? look.shirt : look.shirt} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      <path d={`M${SHX - 9} ${shY + 2} L${SHX - 5} ${hipY - 6} L${SHX - 1} ${hipY + 26} L${SHX - 12} ${hipY + 26}Z`} fill={mix(look.shirt, -0.16)} opacity={0.7} />
      {out === 'coat' && <g stroke={INK} strokeWidth={3}><path d={`M-${SHX - 1} ${hipY + 26} L-${SHX + 3} ${hipY + 62} L${SHX + 3} ${hipY + 62} L${SHX - 1} ${hipY + 26}Z`} fill={look.shirt} /><path d={`M0 ${shY - 4} V${hipY + 62}`} />{[0, 1, 2].map((i) => <circle key={i} cx={8} cy={shY + 24 + i * 28} r={3.5} fill={trim} stroke="none" />)}<path d={`M-14 ${shY - 6} L0 ${shY + 20} L14 ${shY - 6}Z`} fill={trim} /><rect x={-SHX + 1} y={hipY - 14} width={SHX * 2 - 2} height={11} fill={mix(look.pants, -0.1)} /><rect x={-9} y={hipY - 15} width={18} height={13} rx={2} fill={trim} /><rect x={-SHX - 4} y={shY - 4} width={14} height={9} rx={3} fill={trim} /><rect x={SHX - 10} y={shY - 4} width={14} height={9} rx={3} fill={trim} /></g>}
      {out === 'tunic' && <g stroke={INK} strokeWidth={3}><rect x={-SHX + 2} y={hipY - 12} width={SHX * 2 - 4} height={10} fill={mix(look.shirt, -0.3)} /><path d={`M-12 ${shY - 6} Q0 ${shY + 8} 12 ${shY - 6}`} fill="none" /></g>}
      {out === 'robe' && <g stroke={INK} strokeWidth={3}><path d={`M-12 ${shY - 6} L0 ${hipY + 26} L12 ${shY - 6}`} fill="none" stroke={trim} strokeWidth={6} /><rect x={-SHX + 1} y={hipY - 14} width={SHX * 2 - 2} height={12} fill={trim} /></g>}
      {out === 'dress' && <g stroke={INK} strokeWidth={3}><rect x={-SHX + 1} y={hipY - 16} width={SHX * 2 - 2} height={11} fill={trim} /><path d={`M-14 ${shY - 6} Q0 ${shY + 14} 14 ${shY - 6}`} fill="none" stroke={trim} strokeWidth={5} /></g>}
      {out === 'toga' && <g stroke={INK} strokeWidth={3} strokeLinejoin="round"><path d={`M-${SHX + 2} ${shY - 2} L${SHX + 4} ${shY + 20} L${SHX + 6} ${hipY + 74} L-${SHX + 6} ${hipY + 74} L-${SHX - 4} ${shY + 54}Z`} fill={look.toga} /><path d={`M-${SHX + 2} ${shY - 2} L${SHX + 6} ${hipY + 56}`} fill="none" stroke={trim} strokeWidth={9} />{[0, 1, 2].map((i) => <path key={i} d={`M-${SHX - 2} ${shY + 56 + i * 26} Q0 ${shY + 64 + i * 26} ${SHX + 4} ${shY + 52 + i * 26}`} fill="none" strokeWidth={2} opacity={0.55} />)}</g>}
      {out === 'armor' && <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
        {[-20, -10, 0, 10, 20].map((o, i) => <rect key={i} x={o - 5} y={hipY + 20} width={10} height={36} rx={4} fill={look.shirt} />)}
        <path d={`M-${SHX - 3} ${shY + 2} Q-${SHX} ${shY - 6} -12 ${shY - 6} L12 ${shY - 6} Q${SHX} ${shY - 6} ${SHX - 3} ${shY + 2} L${SHX - 6} ${hipY - 4} L-${SHX - 6} ${hipY - 4}Z`} fill="#b9c0c9" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-${SHX - 5} ${shY + 14 + i * 20} Q0 ${shY + 20 + i * 20} ${SHX - 5} ${shY + 14 + i * 20}`} fill="none" />)}
        <ellipse cx={-SHX - 2} cy={shY + 6} rx={15} ry={11} fill="#b9c0c9" /><ellipse cx={SHX + 2} cy={shY + 6} rx={15} ry={11} fill="#b9c0c9" />
        <rect x={-SHX} y={hipY - 14} width={SHX * 2} height={11} fill={trim} /><circle cx={0} cy={hipY - 8} r={5} fill="#e2b84a" /></g>}
      {look.extra === 'apron' && <rect x={-17} y={shY + 34} width={34} height={96} rx={8} fill={look.ec} stroke={INK} strokeWidth={3} />}
      {look.extra === 'scarf' && <g fill={look.ec} stroke={INK} strokeWidth={3} strokeLinejoin="round"><ellipse cx={0} cy={shY - 4} rx={26} ry={10} /><path d={`M8 ${shY} L${28 + sway * 0.4} ${shY + 70} L10 ${shY + 60} L0 ${shY + 8}Z`} /></g>}
      {sleeved(shR, aR)}
      {hand(aL.hd)}{hand(aR.hd)}
      {a.held && <g transform={`translate(${aR.hd[0]} ${aR.hd[1]}) rotate(${pose === 'attack' ? Math.sin(f / 3.2) * 70 + 20 : pose === 'point' || pose === 'salute' ? 78 : pose === 'cheer' ? 12 : -8})`}><HeldArt k={a.held} f={f} /></g>}
      {a.shield && <g transform={`translate(${aL.hd[0] - 6} ${aL.hd[1] - 8})`}><rect x={-34} y={-58} width={68} height={112} rx={14} fill="#b3202a" stroke={INK} strokeWidth={4} /><rect x={-34} y={-58} width={68} height={112} rx={14} fill="none" stroke="#e2b84a" strokeWidth={5} /><circle cx={0} cy={-2} r={13} fill="#e2b84a" stroke={INK} strokeWidth={3} /></g>}
      {/* neck + head */}
      <path d={`M0 ${shY - 10} L0 ${headY + HR - 8}`} stroke={INK} strokeWidth={20} strokeLinecap="round" />
      <path d={`M0 ${shY - 10} L0 ${headY + HR - 8}`} stroke={look.skin} strokeWidth={14} strokeLinecap="round" />
      <HairBack k={hair} y={headY} c={hc} />
      <ellipse cx={-56} cy={headY + 6} rx={9} ry={13} fill={look.skin} stroke={INK} strokeWidth={3} />
      <ellipse cx={56} cy={headY + 6} rx={9} ry={13} fill={look.skin} stroke={INK} strokeWidth={3} />
      <ellipse cx={0} cy={headY} rx={56} ry={HR} fill={look.skin} stroke={INK} strokeWidth={4} />
      <path d={`M-46 ${headY + 36} Q0 ${headY + 66} 46 ${headY + 36}`} fill="none" stroke={mix(look.skin, -0.12)} strokeWidth={5} opacity={0.5} />
      <HairFront k={hair} y={headY} c={hc} />
      {/* face */}
      <ellipse cx={-30} cy={headY + 16} rx={9} ry={6} fill="#e57373" opacity={0.28} /><ellipse cx={30} cy={headY + 16} rx={9} ry={6} fill="#e57373" opacity={0.28} />
      {blink ? (<g stroke={INK} strokeWidth={4} strokeLinecap="round"><path d={`M-27 ${headY - 2} h15`} /><path d={`M12 ${headY - 2} h15`} /></g>) : (<g><g fill="#fff" stroke={INK} strokeWidth={2.5}><ellipse cx={-19} cy={headY - 2} rx={face === 'shock' ? 10 : 8.5} ry={face === 'shock' ? 11 : 9.5} /><ellipse cx={19} cy={headY - 2} rx={face === 'shock' ? 10 : 8.5} ry={face === 'shock' ? 11 : 9.5} /></g><g fill={INK}><circle cx={-18} cy={headY - 1} r={face === 'shock' ? 3.2 : 4.6} /><circle cx={20} cy={headY - 1} r={face === 'shock' ? 3.2 : 4.6} /></g></g>)}
      {look.glasses && <g fill="#bfe6ff" fillOpacity={0.3} stroke={INK} strokeWidth={3.5}><circle cx={-19} cy={headY - 2} r={15} /><circle cx={19} cy={headY - 2} r={15} /><path d={`M-4 ${headY - 3} h8`} fill="none" /></g>}
      <path d={`M3 ${headY + 2} Q11 ${headY + 14} 0 ${headY + 17}`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <g stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
        {face === 'angry' ? (<><path d={`M-32 ${browY + 2} L-8 ${browY + 14}`} /><path d={`M32 ${browY + 2} L8 ${browY + 14}`} /></>) : face === 'sad' ? (<><path d={`M-32 ${browY + 12} L-8 ${browY}`} /><path d={`M32 ${browY + 12} L8 ${browY}`} /></>) : face === 'shock' ? (<><path d={`M-31 ${browY - 8} Q-19 ${browY - 16} -7 ${browY - 8}`} /><path d={`M31 ${browY - 8} Q19 ${browY - 16} 7 ${browY - 8}`} /></>) : (<><path d={`M-31 ${browY + 2} Q-19 ${browY - 5} -7 ${browY + 2}`} /><path d={`M31 ${browY + 2} Q19 ${browY - 5} 7 ${browY + 2}`} /></>)}
      </g>
      <Facial k={facial} y={headY} c={fc} />
      <g stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none">
        {a.talk ? null : face === 'smile' ? <path d={`M-16 ${headY + 28} Q0 ${headY + 42} 16 ${headY + 28}`} /> : face === 'sad' || face === 'angry' ? <path d={`M-14 ${headY + 38} Q0 ${headY + 26} 14 ${headY + 38}`} /> : face === 'neutral' ? <path d={`M-12 ${headY + 33} h24`} /> : null}
      </g>
      {a.talk && <ellipse cx={0} cy={headY + 34} rx={face === 'shock' ? 11 : 13} ry={3 + open * 11} fill="#5a1f1f" stroke={INK} strokeWidth={3} />}
      {!a.talk && face === 'shock' && <ellipse cx={0} cy={headY + 36} rx={10} ry={13} fill="#5a1f1f" stroke={INK} strokeWidth={3} />}
      <Hat k={look.hat} top={headY - HR + 4} skin={look.skin} />
      </g>
      </g>
      {a.say && fr === 0 && (() => {
        const at0 = (a.at ?? 0) * d;
        const all = sayT;
        const lines: string[][] = [[]];
        all.forEach((wd2, i) => {
          const cur = lines[lines.length - 1];
          if (cur.join(' ').length + wd2.length > 24 && cur.length) lines.push([]);
          lines[lines.length - 1].push(`${i}|${wd2}`);
        });
        const shown = Math.round(interpolate(f, [at0 + 8, at0 + 8 + all.length * 4], [0, all.length], C));
        const bw = Math.min(760, 80 + Math.max(...lines.map((l) => l.join(' ').length)) * 19);
        const bh = 36 + lines.length * 52;
        const by = headY - 150 - bh;
        return (
          <g transform={`scale(${a.flip ? -1 : 1} 1)`} opacity={clamp01(interpolate(f, [at0 + 4, at0 + 10], [0, 1], C))}>
            <path d={`M${bx - 22} ${by + bh - 2} L${bx - 4} ${headY - 104} L${bx + 24} ${by + bh - 2}Z`} fill="#fff" stroke={INK} strokeWidth={3} />
            <rect x={bx - bw / 2} y={by} width={bw} height={bh} rx={26} fill="#fff" stroke={INK} strokeWidth={3} />
            {lines.map((l, li) => (
              <text key={li} x={bx} y={by + 58 + li * 52} textAnchor="middle" fontFamily={HAND} fontSize={42} fill={INK}>
                {l.filter((q) => Number(q.split('|')[0]) < shown).map((q) => q.split('|')[1]).join(' ')}
              </text>
            ))}
          </g>
        );
      })()}
    </g>
  );
};

// ===================== PROPS =====================
export type PropKind = 'house' | 'tudor' | 'church' | 'cactus' | 'tree' | 'skyscraper' | 'factory' | 'mountain' | 'ship' | 'wall' | 'flag' | 'coins' | 'crown' | 'bank' | 'fire' | 'smoke' | 'sun' | 'moon' | 'cloud' | 'sign' | 'banner' | 'crowd' | 'crate' | 'road' | 'waves' | 'column' | 'temple' | 'arch' | 'colosseum' | 'wolf' | 'elephant' | 'standard' | 'tent' | 'torch' | 'throne' | 'basket' | 'shieldwall' | 'river' | 'birds' | 'galley' | 'tower' | 'stonewall' | 'hill' | 'balcony' | 'rubble' | 'cabbage' | 'legion' | 'troop';
export type PropT = {k: PropKind; x: number; y: number; s?: number; d?: number; c?: string; t?: string; n?: number; at?: number; flip?: boolean; kind?: TroopKind; form?: 'block' | 'line' | 'wedge' | 'scatter'; fight?: boolean; march?: boolean; c2?: string};

const Shadow: React.FC<{w: number}> = ({w}) => <ellipse cx={0} cy={4} rx={w} ry={w / 12} fill="#000" opacity={0.16} />;
const Smoke: React.FC<{x: number; y: number; f: number; col?: string}> = ({x, y, f, col = '#f2f2f2'}) => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => {
      const t = (((f + i * 18) % 90) / 90);
      return <circle key={i} cx={x + Math.sin(t * 6 + i) * 14 + t * 24} cy={y - t * 170} r={14 + t * 30} fill={col} opacity={0.75 * (1 - t)} />;
    })}
  </g>
);
const bands = (k: string, u: number): [number, number, string][] => {
  if (k === 'us') {
    const out: [number, number, string][] = Array.from({length: 13}, (_, i): [number, number, string] => [i / 13, (i + 1) / 13, i % 2 ? '#fff' : '#b22234']);
    if (u < 0.4) out.push([0, 0.54, '#3c3b6e']);
    return out;
  }
  if (k === 'mx') return [[0, 1, u < 0.33 ? '#006847' : u < 0.66 ? '#f4f4f4' : '#ce1126']];
  if (k === 'es') return [[0, 0.25, '#aa151b'], [0.25, 0.75, '#f1bf00'], [0.75, 1, '#aa151b']];
  if (k === 'fr') return [[0, 1, u < 0.33 ? '#0055a4' : u < 0.66 ? '#fff' : '#ef4135']];
  if (k === 'uk') return u > 0.4 && u < 0.6 ? [[0, 1, '#fff'], [0, 1, u > 0.45 && u < 0.55 ? '#c8102e' : '#fff']] : [[0, 1, '#012169'], [0.4, 0.6, '#fff'], [0.45, 0.55, '#c8102e']];
  return [[0, 1, k === 'red' ? '#c0392b' : '#2f6fb5']];
};
const Flag: React.FC<{kind: string; f: number}> = ({kind, f}) => {
  const N = 22, W = 170, H = 106;
  return (
    <g>
      <rect x={-4} y={-300} width={8} height={300} fill="#6b5a45" stroke={INK} strokeWidth={2.5} />
      <circle cx={0} cy={-304} r={7} fill="#f2c230" stroke={INK} strokeWidth={2} />
      {Array.from({length: N}, (_, i) => {
        const u = i / N;
        const dy = Math.sin(i * 0.55 - f * 0.22) * 7 * u;
        return (
          <g key={i} transform={`translate(${4 + u * W} ${-292 + dy})`}>
            {bands(kind, u).map(([a, b, c], j) => <rect key={j} x={0} y={a * H} width={W / N + 0.8} height={(b - a) * H + 0.5} fill={c} />)}
          </g>
        );
      })}
      {kind === 'mx' && <circle cx={4 + W / 2} cy={-292 + H / 2 + Math.sin(0.55 * N * 0.5 - f * 0.22) * 3.5} r={13} fill="#8a5a33" />}
      <path d={`M4 -292 H${4 + W} V${-292 + H} H4Z`} fill="none" stroke={INK} strokeWidth={0} />
    </g>
  );
};
const Flame: React.FC<{f: number; k: number; w: number; h: number}> = ({f, k, w, h}) => {
  const fl = 1 + Math.sin(f * 0.45 + k * 2.3) * 0.14, sw = Math.sin(f * 0.3 + k) * 7;
  return (
    <g transform={`scale(1 ${fl})`}>
      <path d={`M${-w} 0 Q${-w * 0.9} ${-h * 0.5} ${sw} ${-h} Q${w * 0.9} ${-h * 0.5} ${w} 0Z`} fill="#f26b1d" />
      <path d={`M${-w * 0.6} 0 Q${-w * 0.5} ${-h * 0.45} ${sw * 0.7} ${-h * 0.72} Q${w * 0.5} ${-h * 0.45} ${w * 0.6} 0Z`} fill="#fbb02d" />
      <path d={`M${-w * 0.3} 0 Q${-w * 0.25} ${-h * 0.25} ${sw * 0.4} ${-h * 0.4} Q${w * 0.25} ${-h * 0.25} ${w * 0.3} 0Z`} fill="#ffe27a" />
    </g>
  );
};


// ===================== TROOPS (armies are instanced, never one Actor per soldier) =====================
// Each soldier type is drawn ONCE per scene in <defs> (3 poses) and placed with <use>, so 400 soldiers cost ~400 nodes.
export type TroopKind = 'legion' | 'barbarian' | 'gaul' | 'generic';
const TROOP: Record<TroopKind, {tunic: string; helm: string | null; shield: string; skin: string; hair?: string; round?: boolean; weapon: 'spear' | 'axe' | 'sword'}> = {
  legion: {tunic: '#b53a32', helm: '#b9c0c9', shield: '#a8242c', skin: '#e7c4a4', weapon: 'spear'},
  barbarian: {tunic: '#7a5a3a', helm: null, shield: '#8a6b3a', skin: '#e9c9a8', hair: '#c9892f', round: true, weapon: 'axe'},
  gaul: {tunic: '#2f6f8a', helm: null, shield: '#d9a441', skin: '#f0d2b6', hair: '#d9a441', round: true, weapon: 'sword'},
  generic: {tunic: '#4a6a9a', helm: '#8a8f99', shield: '#3a4a6a', skin: '#e7c4a4', weapon: 'spear'},
};
const SoldierDef: React.FC<{id: string; k: TroopKind; col?: string; col2?: string}> = ({id, k, col, col2}) => {
  const T = TROOP[k];
  const tunic = col ?? T.tunic, shield = col2 ?? T.shield;
  const S = {stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
  const body = (legs: string, arm: string, wpn: React.ReactNode) => (
    <g>
      <path d={legs} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={legs} stroke={mix(tunic, -0.35)} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      {wpn}
      <rect x={-13} y={-74} width={26} height={44} rx={7} fill={tunic} {...S} />
      <rect x={-13} y={-36} width={26} height={7} fill={mix(tunic, -0.4)} {...S} />
      <path d={arm} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" /><path d={arm} stroke={T.skin} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={-86} r={12} fill={T.skin} {...S} />
      <circle cx={-4} cy={-87} r={1.8} fill={INK} /><circle cx={5} cy={-87} r={1.8} fill={INK} /><path d="M-3 -80 q3 2 6 0" fill="none" stroke={INK} strokeWidth={1.8} />
      {T.helm ? <g><path d="M-13 -87 Q-13 -106 0 -106 Q13 -106 13 -87Z" fill={T.helm} {...S} /><rect x={-1.5} y={-108} width={3} height={7} fill="#a8242c" stroke="none" /></g>
        : <path d={`M-13 -88 Q-15 -108 0 -106 Q15 -108 13 -88 Q9 -98 0 -98 Q-9 -98 -13 -88Z`} fill={T.hair} {...S} />}
      {T.round ? <g><circle cx={-24} cy={-52} r={19} fill={shield} {...S} /><circle cx={-24} cy={-52} r={5} fill="#e2b84a" {...S} /></g>
        : <g><rect x={-37} y={-76} width={22} height={46} rx={7} fill={shield} {...S} /><circle cx={-26} cy={-53} r={5} fill="#e2b84a" {...S} /></g>}
    </g>
  );
  const w = (a: number): React.ReactNode =>
    T.weapon === 'spear' ? <g transform={`rotate(${a} 17 -56)`}><path d="M17 -10 V-128" stroke={INK} strokeWidth={5} /><path d="M17 -10 V-128" stroke="#8a5a33" strokeWidth={2.5} /><path d="M12 -124 L17 -142 L22 -124Z" fill="#dfe5ec" {...S} /></g>
    : T.weapon === 'axe' ? <g transform={`rotate(${a} 17 -56)`}><path d="M17 -20 V-100" stroke={INK} strokeWidth={5} /><path d="M17 -20 V-100" stroke="#8a5a33" strokeWidth={2.5} /><path d="M17 -100 Q40 -104 38 -80 Q26 -84 17 -80Z" fill="#aeb6c0" {...S} /></g>
    : <g transform={`rotate(${a} 17 -56)`}><path d="M17 -52 V-106" stroke="#dfe5ec" strokeWidth={5} {...S} /><rect x={11} y={-56} width={12} height={5} fill="#c4a24a" {...S} /></g>;
  return (
    <>
      <g id={`${id}a`}>{body('M-7 0 L-5 -32 M8 0 L5 -32', 'M12 -66 L19 -56', w(0))}</g>
      <g id={`${id}b`}>{body('M-4 -2 L-5 -32 M13 0 L5 -32', 'M12 -66 L19 -56', w(0))}</g>
      <g id={`${id}c`}>{body('M-7 0 L-5 -32 M8 0 L5 -32', 'M12 -66 L26 -64', w(72))}</g>
    </>
  );
};
const formation = (n: number, form: string, rows: number | undefined, seed: string) => {
  const out: {x: number; y: number; r: number}[] = [];
  const cols = form === 'line' ? n : Math.max(2, Math.round(Math.sqrt(n * 1.7)));
  const R = form === 'line' ? 1 : rows ?? Math.ceil(n / cols);
  if (form === 'wedge') {
    for (let r = 0, k = 0; k < n; r++) for (let c = 0; c <= r * 2 && k < n; c++, k++) out.push({x: (c - r) * 40, y: -r * 26, r});
  } else if (form === 'scatter') {
    for (let k = 0; k < n; k++) out.push({x: (random(`${seed}x${k}`) - 0.5) * 70 * cols, y: -random(`${seed}y${k}`) * 26 * R, r: Math.floor(random(`${seed}y${k}`) * R)});
  } else {
    for (let k = 0; k < n; k++) { const r = Math.floor(k / cols), c = k % cols; out.push({x: (c - (cols - 1) / 2) * 44 + (r % 2) * 10 + (random(`${seed}j${k}`) - 0.5) * 6, y: -r * 26, r}); }
  }
  return out;
};
const Troop: React.FC<{p: PropT; f: number; seed: string}> = ({p, f, seed}) => {
  const kind: TroopKind = p.kind ?? 'legion';
  const id = `tp${seed.replace(/[^a-zA-Z0-9]/g, '')}`;
  const n = Math.min(p.n ?? 24, 600);
  const pts = formation(n, p.form ?? 'block', undefined, id);
  const maxR = Math.max(...pts.map((q) => q.r), 1);
  const items = pts.map((q, i) => ({...q, i, sc: 1 - (q.r / maxR) * 0.28 + (random(`${id}s${i}`) - 0.5) * 0.06})).sort((a, b) => a.y - b.y);
  return (
    <g>
      <defs><SoldierDef id={id} k={kind} col={p.c} col2={p.c2} /></defs>
      {items.map((q) => {
        const ph = f / 6 + q.i * 0.9 + random(`${id}p${q.i}`) * 6;
        const v = p.fight ? (Math.sin(ph * 1.1) > 0.35 ? 'c' : 'a') : p.march ? (Math.floor(ph / 1.2) % 2 ? 'a' : 'b') : 'a';
        const bob = p.fight ? -Math.abs(Math.sin(ph * 0.9)) * 5 : p.march ? -Math.abs(Math.sin(ph * 0.9)) * 4 : Math.sin(f / 14 + q.i) * 0.8;
        return <use key={q.i} href={`#${id}${v}`} transform={`translate(${q.x} ${q.y + bob}) scale(${q.sc * 1.35})`} />;
      })}
    </g>
  );
};

const PropArt: React.FC<{p: PropT; f: number; seed: string}> = ({p, f, seed}) => {
  const c = p.c;
  switch (p.k) {
    case 'house': {
      const col = c ?? '#e8c99b';
      return (<g {...OL}><Shadow w={170} /><rect x={-130} y={-190} width={260} height={190} fill={col} /><rect x={-130} y={-190} width={56} height={190} fill="#000" opacity={0.07} stroke="none" /><rect x={-144} y={-214} width={288} height={26} fill={mix(col, -0.16)} />
        {[-92, 30].map((wx, i) => (<g key={i}><rect x={wx} y={-150} width={56} height={60} fill="#8ec9ee" /><path d={`M${wx + 28} -150 v60 M${wx} -120 h56`} stroke={INK} strokeWidth={2.5} /></g>))}<rect x={44} y={-118} width={56} height={118} fill="#8a5a33" /><circle cx={56} cy={-60} r={4} fill="#f2c230" /></g>);
    }
    case 'tudor': {
      const lit = p.t === 'lit';
      return (<g {...OL}><Shadow w={120} /><rect x={-80} y={-180} width={160} height={180} fill="#efe4c8" /><rect x={-100} y={-300} width={200} height={122} fill="#efe4c8" /><path d="M-100 -300 L100 -180 M100 -300 L-100 -180 M0 -300 V-180 M-100 -240 H100" stroke="#5a3d2a" strokeWidth={6} fill="none" /><path d="M-80 -180 V0 M80 -180 V0 M-80 -90 H80" stroke="#5a3d2a" strokeWidth={6} fill="none" />
        <path d={`M-118 -298 L0 -400 L118 -298Z`} fill={c ?? '#8a4b3a'} /><rect x={50} y={-420} width={26} height={60} fill="#7a5a48" />
        {[-52, 20].map((wx, i) => (<rect key={i} x={wx} y={-150} width={34} height={44} fill={lit ? '#ffb347' : '#8ec9ee'} />))}{[-60, 28].map((wx, i) => (<rect key={i} x={wx} y={-270} width={32} height={42} fill={lit ? '#ffb347' : '#8ec9ee'} />))}<rect x={-18} y={-80} width={36} height={80} fill="#6b4226" /></g>);
    }
    case 'church': return (<g {...OL}><Shadow w={150} /><rect x={-110} y={-170} width={220} height={170} fill="#d9d2c3" /><rect x={-34} y={-330} width={68} height={160} fill="#d9d2c3" /><path d="M-44 -330 L0 -450 L44 -330Z" fill="#6c5a5a" /><path d="M0 -450 v-34 M-12 -468 h24" stroke={INK} strokeWidth={5} /><path d="M-24 0 v-60 a24 24 0 0 1 48 0 v60Z" fill="#6b4226" /><circle cx={0} cy={-250} r={14} fill="#8ec9ee" /><rect x={-86} y={-130} width={30} height={50} rx={15} fill="#8ec9ee" /><rect x={56} y={-130} width={30} height={50} rx={15} fill="#8ec9ee" /></g>);
    case 'cactus': return (<g {...OL}><Shadow w={50} />{[[0, 0, 0, -190, 42], [0, -80, -52, -80, 26], [-52, -80, -52, -140, 26], [0, -110, 50, -110, 26], [50, -110, 50, -160, 26]].map(([x1, y1, x2, y2, w], i) => (<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={w + 6} strokeLinecap="round" /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c ?? '#3f9a4a'} strokeWidth={w} strokeLinecap="round" /></g>))}</g>);
    case 'tree': {
      const sw = Math.sin(f / 30 + p.x) * 2.5;
      return (<g {...OL}><Shadow w={80} /><rect x={-14} y={-120} width={28} height={120} fill="#7a5233" /><g transform={`rotate(${sw} 0 -110)`}><circle cx={0} cy={-190} r={70} fill={c ?? '#4f9d4a'} /><circle cx={-52} cy={-150} r={50} fill={mix(c ?? '#4f9d4a', -0.1)} /><circle cx={54} cy={-152} r={52} fill={c ?? '#4f9d4a'} /></g></g>);
    }
    case 'skyscraper': {
      const h = p.n ?? 380, w = 130, col = c ?? '#d9c7a3', rows = Math.floor(h / 46);
      return (<g {...OL}><Shadow w={w * 0.7} /><rect x={-w / 2} y={-h} width={w} height={h} fill={col} /><rect x={-w / 2} y={-h} width={26} height={h} fill="#000" opacity={0.07} stroke="none" /><path d={`M0 ${-h} v-50`} stroke={INK} strokeWidth={4} />
        {Array.from({length: rows * 3}, (_, i) => {
          const r = Math.floor(i / 3), cc = i % 3, lit = random(`${seed}${p.x}${i}`) > 0.45;
          return <rect key={i} x={-w / 2 + 14 + cc * 36} y={-h + 18 + r * 46} width={24} height={28} fill={lit ? '#ffe9a8' : '#8fb4d9'} strokeWidth={1.5} />;
        })}</g>);
    }
    case 'factory': return (<g {...OL}><Shadow w={170} /><rect x={-150} y={-140} width={300} height={140} fill={c ?? '#b9604a'} />{[-150, -50, 50].map((x, i) => <path key={i} d={`M${x} -140 L${x} -190 L${x + 100} -140Z`} fill={mix(c ?? '#b9604a', -0.12)} />)}{[-110, -20, 70].map((x, i) => <rect key={i} x={x} y={-100} width={50} height={46} fill="#9ed0ef" />)}<rect x={96} y={-300} width={44} height={170} fill="#8a4b3a" /><rect x={90} y={-312} width={56} height={16} fill="#6e3a2d" /><Smoke x={118} y={-318} f={f} /></g>);
    case 'mountain': {
      const col = c ?? '#8f8174';
      return (<g {...OL}><path d="M-300 0 L-60 -330 L-10 -270 L70 -400 L330 0Z" fill={col} /><path d="M70 -400 L330 0 L120 0 L90 -190Z" fill="#000" opacity={0.1} stroke="none" /><path d="M-60 -330 L-100 -270 L-70 -285 L-48 -250 L-10 -270Z M70 -400 L26 -320 L58 -334 L80 -296 L112 -330Z" fill="#fff" /></g>);
    }
    case 'ship': {
      const bob = Math.sin(f / 18 + p.x) * 7, rot = Math.sin(f / 22) * 2.5;
      return (<g {...OL} transform={`translate(0 ${bob}) rotate(${rot})`}><path d="M-170 -60 L170 -60 L120 10 L-120 10Z" fill="#7a4a2a" /><path d="M-170 -60 L170 -60 L160 -44 L-160 -44Z" fill="#a8693a" /><path d="M0 -60 V-330" stroke={INK} strokeWidth={8} /><path d="M-8 -320 Q-140 -230 -130 -110 L-8 -90Z" fill="#f6f1e4" /><path d="M8 -310 Q130 -230 120 -110 L8 -90Z" fill="#fffaf0" /><path d="M0 -330 l56 14 l-56 14Z" fill="#c0392b" /></g>);
    }
    case 'wall': {
      const n = p.n ?? 12;
      return (<g {...OL}><Shadow w={n * 14} />{Array.from({length: n}, (_, i) => (<g key={i}><rect x={(i - n / 2) * 26} y={-360} width={24} height={360} fill={i % 2 ? '#a5593a' : '#8f4a2f'} /><path d={`M${(i - n / 2) * 26} -360 l12 -14 l12 14`} fill="#6e3a24" /></g>))}<rect x={(-n / 2) * 26 - 6} y={-372} width={n * 26 + 12} height={14} fill="#5d3322" /></g>);
    }
    case 'flag': return <Flag kind={p.t ?? 'blue'} f={f} />;
    case 'coins': return (<g {...OL}>{Array.from({length: p.n ?? 8}, (_, i) => (<g key={i}><ellipse cx={(i % 2) * 5} cy={-i * 16 - 8} rx={60} ry={16} fill="#d9a521" /><ellipse cx={(i % 2) * 5} cy={-i * 16 - 16} rx={60} ry={16} fill="#f6cf4a" /></g>))}</g>);
    case 'crown': return (<g {...OL}><path d="M-60 0 L-70 -80 L-32 -42 L0 -100 L32 -42 L70 -80 L60 0Z" fill="#f2c230" /><circle cx={0} cy={-30} r={9} fill="#d63b3b" /></g>);
    case 'bank': return (<g {...OL}><Shadow w={260} /><rect x={-250} y={-30} width={500} height={30} fill="#cfc8b8" /><rect x={-230} y={-70} width={460} height={40} fill="#ddd6c6" />{[-190, -95, 0, 95, 190].map((x, i) => (<rect key={i} x={x - 22} y={-290} width={44} height={220} fill="#efe9db" />))}<path d="M-250 -290 L0 -400 L250 -290Z" fill="#d6cfbd" /><rect x={-250} y={-310} width={500} height={22} fill="#c9c1ae" /></g>);

    case 'column': return (<g {...OL}><Shadow w={60} /><rect x={-44} y={-26} width={88} height={26} fill="#dcd5c3" /><rect x={-32} y={p.t === 'broken' ? -190 : -300} width={64} height={p.t === 'broken' ? 164 : 274} fill="#f1ebdc" />{[-18, 0, 18].map((x, i) => <path key={i} d={`M${x} ${p.t === 'broken' ? -186 : -296} V-30`} stroke="#cfc7b2" strokeWidth={3} />)}{p.t === 'broken' ? <path d="M-32 -190 L-12 -214 L6 -192 L24 -208 L32 -190Z" fill="#f1ebdc" /> : <rect x={-48} y={-326} width={96} height={28} fill="#e6dfcd" />}</g>);
    case 'temple': return (<g {...OL}><Shadow w={300} /><rect x={-290} y={-24} width={580} height={24} fill="#cfc8b8" /><rect x={-270} y={-48} width={540} height={24} fill="#ddd6c6" />{[-216, -130, -43, 43, 130, 216].map((x, i) => <rect key={i} x={x - 20} y={-300} width={40} height={252} fill="#f1ebdc" />)}<rect x={-280} y={-324} width={560} height={26} fill="#e6dfcd" /><path d="M-290 -324 L0 -440 L290 -324Z" fill={p.c ?? '#c96b4b'} /><circle cx={0} cy={-372} r={18} fill="#e2b84a" /></g>);
    case 'arch': return (<g {...OL}><Shadow w={200} /><rect x={-190} y={-300} width={90} height={300} fill="#e3dccb" /><rect x={100} y={-300} width={90} height={300} fill="#e3dccb" /><path d="M-100 -300 L-100 -170 A100 100 0 0 1 100 -170 L100 -300Z" fill="#d6cfbd" /><path d="M-100 0 V-170 A100 100 0 0 1 100 -170 V0Z" fill="#7a9bb5" opacity={0.55} /><rect x={-200} y={-390} width={400} height={90} fill="#efe9db" /><text x={0} y={-326} textAnchor="middle" fontFamily={HAND} fontSize={46} fill={INK} stroke="none">{p.t ?? 'S P Q R'}</text></g>);
    case 'colosseum': return (<g {...OL}><Shadow w={380} /><path d="M-360 0 L-360 -210 Q0 -300 360 -210 L360 0Z" fill="#d9c9a6" />{[0, 1, 2].map((r) => Array.from({length: 11}, (_, i) => <path key={`${r}${i}`} d={`M${-320 + i * 64} ${-30 - r * 62} v-30 a14 14 0 0 1 28 0 v30Z`} fill="#6b5a45" />))}<path d="M-360 -210 Q0 -300 360 -210" fill="none" strokeWidth={8} /><path d="M-30 0 v-60 a30 30 0 0 1 60 0 v60Z" fill="#3a2e22" /><path d="M-360 0 L-360 -210 Q-300 -226 -240 -230 L-240 0Z" fill="#000" opacity={0.08} stroke="none" /></g>);
    case 'wolf': {
      const tail = Math.sin(f / 7) * 10, br = Math.sin(f / 12) * 2;
      return (<g {...OL}><Shadow w={100} /><path d={`M-76 -78 Q${-120 + tail} ${-110} ${-124 + tail} ${-70}`} fill="none" stroke={INK} strokeWidth={22} /><path d={`M-76 -78 Q${-120 + tail} ${-110} ${-124 + tail} ${-70}`} fill="none" stroke="#8d8f94" strokeWidth={14} />{[-52, -30, 40, 62].map((x, i) => <rect key={i} x={x - 8} y={-60} width={16} height={60} rx={6} fill="#7c7e83" />)}<ellipse cx={0} cy={-84 + br} rx={86} ry={42} fill="#8d8f94" /><ellipse cx={4} cy={-62} rx={60} ry={20} fill="#c4c5c9" stroke="none" /><path d={`M62 -100 Q${96} ${-150 + (p.t === 'howl' ? -40 : 0)} 112 ${-118 + (p.t === 'howl' ? -60 : 0)} L152 ${-96 + (p.t === 'howl' ? -86 : 0)} L116 ${-82 + (p.t === 'howl' ? -40 : 0)} Q84 ${-70} 62 ${-80}Z`} fill="#8d8f94" /><path d={`M96 ${-134 + (p.t === 'howl' ? -40 : 0)} l8 -26 l16 22Z`} fill="#6e7075" /><circle cx={112} cy={-112 + (p.t === 'howl' ? -52 : 0)} r={5} fill={INK} /><circle cx={152} cy={-96 + (p.t === 'howl' ? -86 : 0)} r={6} fill={INK} /></g>);
    }
    case 'elephant': {
      const sw = Math.sin(f / 16) * 14, bob = Math.sin(f / 10) * 3;
      return (<g {...OL} transform={`translate(0 ${bob})`}><Shadow w={190} />{[-120, -60, 60, 120].map((x, i) => <rect key={i} x={x - 24} y={-110} width={48} height={110 - (i % 2 ? Math.abs(Math.sin(f / 10)) * 10 : 0)} rx={14} fill="#8a8f98" />)}<ellipse cx={0} cy={-190} rx={175} ry={105} fill="#9aa0aa" /><path d="M-170 -200 q-30 30 -10 80" fill="none" strokeWidth={8} /><rect x={-70} y={-300} width={150} height={44} rx={14} fill="#a8242c" /><path d="M120 -240 Q220 -270 214 -170 Q210 -80 ${176 + sw} -40 q-14 20 ${-10 + sw * 0.4} 6 Q130 -90 150 -170Z" fill="#9aa0aa" /><circle cx={196} cy={-206} r={9} fill={INK} /><path d="M188 -150 Q250 -130 262 -80" fill="none" stroke="#f4f1e6" strokeWidth={16} /><ellipse cx={118} cy={-208} rx={46} ry={62} fill="#868c96" /></g>);
    }
    case 'standard': return (<g {...OL}><Shadow w={30} /><rect x={-4} y={-380} width={8} height={380} fill="#8a5a33" /><rect x={-36} y={-340} width={72} height={10} fill="#c4a24a" /><path d={`M0 -440 L-50 -410 L-34 -396 L0 -412 L34 -396 L50 -410Z`} fill="#e2b84a" /><circle cx={0} cy={-410} r={9} fill="#e2b84a" /><rect x={-26} y={-326} width={52} height={64} fill="#b3202a" /><text x={0} y={-290} textAnchor="middle" fontFamily={HAND} fontSize={22} fill="#e2b84a" stroke="none">S P Q R</text></g>);
    case 'tent': return (<g {...OL}><Shadow w={140} /><path d="M-140 0 L0 -190 L140 0Z" fill="#efe4c8" /><path d="M-70 0 L0 -190 L30 0Z" fill="#c0392b" opacity={0.85} /><path d="M-30 0 L0 -90 L30 0Z" fill="#3a2e22" /></g>);
    case 'torch': return (<g {...OL}><rect x={-6} y={-150} width={12} height={150} fill="#6b4a2a" /><g transform="translate(0 -146) scale(0.8)"><Flame f={f} k={2} w={40} h={110} /></g></g>);
    case 'throne': return (<g {...OL}><Shadow w={90} /><rect x={-70} y={-110} width={140} height={110} fill="#e2b84a" /><rect x={-60} y={-100} width={120} height={50} fill="#a8242c" /><rect x={-70} y={-300} width={140} height={190} rx={14} fill="#e2b84a" /><rect x={-48} y={-276} width={96} height={140} rx={8} fill="#a8242c" /><circle cx={0} cy={-318} r={14} fill="#e2b84a" /></g>);
    case 'basket': return (<g {...OL}><Shadow w={90} /><ellipse cx={0} cy={-34} rx={78} ry={40} fill="#b98a55" />{p.t === 'babies' && [-26, 26].map((x, i) => <g key={i}><circle cx={x} cy={-70 + Math.sin(f / 9 + i * 2) * 3} r={24} fill="#f3dcc6" /><circle cx={x - 8} cy={-72} r={3} fill={INK} /><circle cx={x + 8} cy={-72} r={3} fill={INK} /><path d={`M${x - 7} -60 q7 6 14 0`} fill="none" stroke={INK} strokeWidth={2.5} /></g>)}<path d="M-70 -38 Q0 -6 70 -38 L60 -6 Q0 24 -60 -6Z" fill="#9a6f3f" />{[-40, -14, 14, 40].map((x, i) => <path key={i} d={`M${x} -30 V4`} stroke="#7a5233" strokeWidth={3} />)}</g>);
    case 'shieldwall': return (<g {...OL}>{Array.from({length: p.n ?? 6}, (_, i) => { const x = (i - (p.n ?? 6) / 2) * 62; return (<g key={i} transform={`translate(${x} ${Math.sin(f / 9 + i) * 2})`}><rect x={-24} y={-170} width={48} height={20} fill="#c4a24a" /><path d="M-22 -150 a22 22 0 0 1 44 0Z" fill="#b9c0c9" /><rect x={-28} y={-150} width={56} height={150} rx={10} fill="#b3202a" /><circle cx={0} cy={-76} r={11} fill="#e2b84a" /><rect x={-2} y={-300} width={5} height={150} fill="#8a5a33" /></g>); })}</g>);
    case 'river': return (<g><rect x={-(p.n ?? 1900) / 2} y={-90} width={p.n ?? 1900} height={180} fill="#3f8fcf" stroke={INK} strokeWidth={3} />{Array.from({length: 9}, (_, i) => <path key={i} d={`M${-(p.n ?? 1900) / 2 + i * 230 + ((f * 3) % 230)} ${-40 + (i % 3) * 40} q30 -16 60 0 t60 0`} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.7} />)}</g>);
    case 'birds': return (<g fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round">{Array.from({length: p.n ?? 6}, (_, i) => { const t = ((f * (1.6 + (i % 3) * 0.4) + i * 140) % 1500) - 200, fl = Math.sin(f / 3 + i) * 14; return <path key={i} d={`M${t} ${-(i % 4) * 46 + Math.sin(t / 90) * 18} q14 ${-18 + fl} 28 0 q14 ${-18 + fl} 28 0`} />; })}</g>);
    case 'galley': {
      const bob = Math.sin(f / 18 + p.x) * 6, ro = Math.sin(f / 7) * 22;
      return (<g {...OL} transform={`translate(0 ${bob})`}><path d="M-190 -60 L190 -70 L240 -30 L205 -6 L-160 10 L-200 -20Z" fill="#6e4325" /><path d="M-190 -60 L190 -70 L186 -52 L-186 -42Z" fill="#a8693a" /><path d="M214 -20 L282 -16 L214 -2Z" fill="#8a6a3a" />{Array.from({length: 6}, (_, i) => <path key={i} d={`M${-130 + i * 54} -30 L${-150 + i * 54 + ro} 40`} stroke={INK} strokeWidth={7} fill="none" />)}<rect x={-6} y={-300} width={12} height={240} fill="#8a5a33" /><path d="M-100 -296 H100 L90 -130 H-90Z" fill="#b3202a" /><path d="M-100 -296 H100" stroke="#e2b84a" strokeWidth={8} />{p.t === 'corvus' && <path d="M200 -76 L330 -150 L346 -128 L214 -60Z" fill="#8a5a33" />}</g>);
    }
    case 'tower': return (<g {...OL}><Shadow w={90} /><rect x={-70} y={-340} width={140} height={340} fill="#bdb6a6" />{[-70, -30, 10, 50].map((x, i) => <rect key={i} x={x} y={-376} width={26} height={40} fill="#bdb6a6" />)}<rect x={-18} y={-240} width={36} height={70} rx={18} fill="#3a2e22" />{[-80, -20].map((y, i) => <path key={i} d={`M-70 ${y} H70`} stroke="#9a9384" strokeWidth={3} />)}</g>);
    case 'stonewall': { const n = p.n ?? 10; return (<g {...OL}><Shadow w={n * 22} />{Array.from({length: n}, (_, i) => <g key={i}><rect x={(i - n / 2) * 44} y={-150} width={44} height={150} fill={i % 2 ? '#bdb6a6' : '#c9c2b2'} /><rect x={(i - n / 2) * 44 + 4} y={-190} width={36} height={40} fill="#bdb6a6" /></g>)}</g>); }
    case 'hill': return (<g {...OL}><path d={`M${-(p.n ?? 420)} 0 Q0 ${-(p.n ?? 420) * 0.7} ${p.n ?? 420} 0Z`} fill={p.c ?? '#7fb35a'} /></g>);
    case 'balcony': return (<g {...OL}><Shadow w={190} /><rect x={-190} y={-30} width={380} height={30} fill="#d6cfbd" /><rect x={-190} y={-130} width={380} height={14} fill="#d6cfbd" />{Array.from({length: 9}, (_, i) => <rect key={i} x={-176 + i * 44} y={-116} width={16} height={86} rx={5} fill="#efe9db" />)}<rect x={-190} y={-30} width={380} height={400} fill="#c9c2b2" /></g>);
    case 'rubble': return (<g {...OL}>{[[-40, -14, 30], [0, -20, 40], [46, -12, 26], [-8, -44, 28]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r / 2 + 6} fill={i % 2 ? '#bdb6a6' : '#a8a292'} />)}</g>);
    case 'cabbage': return (<g {...OL}><Shadow w={60} /><circle cx={0} cy={-50} r={48} fill="#7dbb4e" /><path d="M-40 -50 Q0 -90 40 -50 M-30 -30 Q0 -62 30 -30" fill="none" stroke="#4f8a30" strokeWidth={4} /></g>);
    case 'troop': return <Troop p={p} f={f} seed={seed} />;
    case 'legion': return (<g>{Array.from({length: p.n ?? 12}, (_, i) => { const col = i % 4, row = Math.floor(i / 4); return <g key={i} transform={`translate(${col * 78 - 120 + Math.sin(f / 5 + i) * 0} ${-row * 26 + Math.abs(Math.sin(f / 6 + col)) * -5}) scale(0.4)`}><Actor a={{x: 0, y: 0, look: 'legionary', pose: 'idle', held: 'spear', shield: true, raw: true}} seed={`${seed}l${i}`} /></g>; })}</g>);
    case 'fire': return (<g><Flame f={f} k={0} w={60 * (p.s ?? 1)} h={170} /><g transform="translate(-44 0)"><Flame f={f} k={1} w={40} h={110} /></g><g transform="translate(46 0)"><Flame f={f} k={2} w={44} h={130} /></g></g>);
    case 'smoke': return <Smoke x={0} y={0} f={f} col={c ?? '#cfcfcf'} />;
    case 'sun': return (<g><circle cx={0} cy={0} r={130} fill="#fff3b0" opacity={0.35} /><circle cx={0} cy={0} r={74} fill="#ffe27a" stroke={INK} strokeWidth={0} /></g>);
    case 'moon': return (<g><circle r={110} fill="#fff" opacity={0.12} /><circle r={62} fill="#f4f1e0" /><circle cx={-18} cy={-10} r={10} fill="#d9d5c0" /><circle cx={20} cy={18} r={14} fill="#d9d5c0" /></g>);
    case 'cloud': return (<g fill="#fff" opacity={0.95}><ellipse cx={0} cy={0} rx={110} ry={34} /><circle cx={-40} cy={-22} r={42} /><circle cx={24} cy={-34} r={52} /><circle cx={70} cy={-10} r={34} /></g>);
    case 'sign': return (<g {...OL}><rect x={-6} y={-200} width={12} height={200} fill="#6b5a45" /><rect x={-130} y={-290} width={260} height={100} rx={10} fill={c ?? '#f3e2b3'} /><text x={0} y={-226} textAnchor="middle" fontFamily={HAND} fontSize={44} fill={INK} stroke="none">{p.t}</text></g>);
    case 'banner': {
      const w = 80 + (p.t?.length ?? 6) * 26;
      return (<g {...OL}><rect x={-w / 2} y={-34} width={w} height={68} rx={8} fill={c ?? '#f6c945'} /><rect x={-w / 2 + 6} y={-28} width={w - 12} height={56} rx={5} fill="none" stroke="#b8860b" strokeWidth={2} /><text x={0} y={14} textAnchor="middle" fontFamily={HAND} fontSize={44} fontWeight={700} fill={INK} stroke="none">{p.t}</text></g>);
    }
    case 'crowd': return (<g>{Array.from({length: p.n ?? 6}, (_, i) => {
      const set = p.t === 'roman' ? ['senator', 'senator', 'merchant', 'senator', 'farmer', 'senator'] : p.t === 'legion' ? ['legionary'] : p.t === 'barb' ? ['barbarian', 'barbarian', 'gaul'] : p.t === 'gaul' ? ['gaul'] : ['blue', 'green', 'worker', 'farmer', 'woman', 'merchant'];
      const lk = set[i % set.length];
      return <g key={i} transform={`translate(${i * 70 - ((p.n ?? 6) * 70) / 2} ${(i % 2) * 16}) scale(0.42)`}><Actor a={{x: 0, y: 0, look: lk, pose: i % 3 === 0 ? 'cheer' : 'idle', raw: true}} seed={`${seed}c${i}`} /></g>;
    })}</g>);
    case 'crate': return (<g {...OL}><rect x={-50} y={-80} width={100} height={80} fill="#b98a55" /><path d="M-50 -80 L50 0 M50 -80 L-50 0" stroke="#7a5233" strokeWidth={5} /></g>);
    case 'road': return (<g><rect x={-(p.n ?? 1800) / 2} y={-40} width={p.n ?? 1800} height={80} fill={c ?? '#5b606b'} stroke={INK} strokeWidth={3} />{Array.from({length: Math.floor((p.n ?? 1800) / 120)}, (_, i) => <rect key={i} x={-(p.n ?? 1800) / 2 + 20 + i * 120} y={-4} width={70} height={8} fill="#f2e08a" />)}</g>);
    case 'waves': return (<g fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.7}>{Array.from({length: 8}, (_, i) => <path key={i} d={`M${i * 240 - 100 + Math.sin(f / 20 + i) * 20} ${Math.sin(i * 2) * 14} q40 -22 80 0 t80 0`} />)}</g>);
    default: return null;
  }
};

export const Icon: React.FC<{k: string; size?: number}> = ({k, size = 100}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{overflow: 'visible'}}>
    <g {...OL}>
      {k === 'coin' && (<><circle r={34} fill="#f6cf4a" /><circle r={25} fill="none" strokeWidth={2} /><text y={12} textAnchor="middle" fontFamily={HAND} fontSize={38} fill={INK} stroke="none">$</text></>)}
      {k === 'book' && (<><path d="M-36 -26 H0 V30 H-36Z M0 -26 H36 V30 H0Z" fill="#fff" /><path d="M-28 -12 h20 M-28 0 h20 M8 -12 h20 M8 0 h20" strokeWidth={2} /></>)}
      {k === 'house' && (<><path d="M-34 4 L0 -32 L34 4Z" fill="#c0634a" /><rect x={-26} y={4} width={52} height={32} fill="#f1dcae" /><rect x={-7} y={14} width={14} height={22} fill="#8a5a33" /></>)}
      {k === 'chat' && (<><path d="M-38 -26 H38 V16 H8 L-8 34 V16 H-38Z" fill="#fff" /><path d="M-22 -10 h44 M-22 2 h28" strokeWidth={3} /></>)}
      {k === 'music' && (<><path d="M-10 -30 V18 M-10 -30 L24 -38 V10" fill="none" strokeWidth={5} /><ellipse cx={-20} cy={22} rx={14} ry={10} fill="#8a5a33" /><ellipse cx={14} cy={14} rx={14} ry={10} fill="#8a5a33" /></>)}
      {k === 'food' && (<><ellipse cx={0} cy={6} rx={38} ry={22} fill="#e2a64e" /><path d="M-20 -2 q6 -10 12 0 M0 -4 q6 -10 12 0 M16 4 q6 -10 12 0" fill="none" strokeWidth={3} /></>)}
      {k === 'ship' && (<><path d="M-36 12 H36 L24 34 H-24Z" fill="#7a4a2a" /><path d="M0 12 V-36" strokeWidth={4} /><path d="M2 -34 Q30 -16 26 6 H2Z" fill="#fff" /></>)}
      {k === 'crown' && (<><path d="M-34 24 L-40 -20 L-16 0 L0 -34 L16 0 L40 -20 L34 24Z" fill="#f2c230" /></>)}
      {k === 'factory' && (<><rect x={-36} y={-4} width={72} height={38} fill="#b9604a" /><rect x={14} y={-38} width={14} height={36} fill="#8a4b3a" /><path d="M-36 -4 l18 -16 v16 l18 -16 v16Z" fill="#a24f3b" /></>)}
    </g>
  </svg>
);


// ===================== WEATHER =====================
export type WeatherKind = 'rain' | 'snow' | 'fog' | 'storm' | 'wind' | 'embers';
export const Weather: React.FC<{k: WeatherKind | WeatherKind[]; seed?: string}> = ({k, seed = 'w'}) => {
  const f = useCurrentFrame();
  const kinds = Array.isArray(k) ? k : [k];
  const has = (x: WeatherKind) => kinds.includes(x);
  const heavy = has('storm');
  const flash = heavy && (f % 97 < 3 || (f % 97 > 6 && f % 97 < 8)) ? 0.55 : 0;
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {(has('rain') || heavy) && (<g>
        <rect width={1920} height={1080} fill="#0a1a33" opacity={heavy ? 0.32 : 0.16} />
        {Array.from({length: heavy ? 260 : 170}, (_, i) => {
          const sp = 26 + random(`${seed}rs${i}`) * 20, len = 34 + random(`${seed}rl${i}`) * 42;
          const x = random(`${seed}rx${i}`) * 2300 - 200 - ((f * sp * 0.22) % 2300);
          const y = ((random(`${seed}ry${i}`) * 1400 + f * sp) % 1400) - 150;
          return <line key={i} x1={x} y1={y} x2={x - len * 0.26} y2={y + len} stroke="#fff" strokeWidth={2 + (i % 3)} strokeLinecap="round" opacity={0.28 + random(`${seed}ro${i}`) * 0.4} />;
        })}
      </g>)}
      {has('snow') && Array.from({length: 120}, (_, i) => {
        const r = 3 + random(`${seed}sr${i}`) * 6, sp = 2 + random(`${seed}ss${i}`) * 3.5;
        const x = random(`${seed}sx${i}`) * 1920 + Math.sin(f / 30 + i) * 40;
        const y = ((random(`${seed}sy${i}`) * 1200 + f * sp) % 1200) - 60;
        return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.85} />;
      })}
      {has('fog') && [0, 1, 2, 3].map((i) => (<ellipse key={i} cx={((f * (0.5 + i * 0.2) + i * 600) % 2600) - 340} cy={620 + i * 90} rx={700} ry={120} fill="#e8eef5" opacity={0.2} />))}
      {has('wind') && Array.from({length: 40}, (_, i) => {
        const y = random(`${seed}wy${i}`) * 1000, sp = 30 + random(`${seed}ws${i}`) * 40;
        const x = ((random(`${seed}wx${i}`) * 2400 + f * sp) % 2600) - 300;
        return <path key={i} d={`M${x} ${y} q60 -14 120 0 t120 0`} fill="none" stroke="#fff" strokeWidth={3} opacity={0.35} strokeLinecap="round" />;
      })}
      {has('embers') && Array.from({length: 50}, (_, i) => {
        const x = random(`${seed}ex${i}`) * 1920 + Math.sin(f / 18 + i) * 30, sp = 1.5 + random(`${seed}es${i}`) * 3;
        const y = 1100 - ((random(`${seed}ey${i}`) * 1100 + f * sp) % 1100);
        return <circle key={i} cx={x} cy={y} r={2 + (i % 4)} fill={i % 2 ? '#ffb347' : '#ff6a2a'} opacity={0.8} />;
      })}
      {flash > 0 && <rect width={1920} height={1080} fill="#fff" opacity={flash} />}
    </svg>
  );
};

// ===================== BACKDROPS + STAGE =====================
export type BgKind = 'desert' | 'grass' | 'sea' | 'street' | 'interior';
export type Tod = 'day' | 'dusk' | 'night' | 'fire';
export type TextT = {t: string; x: number; y: number; at?: number; size?: number; color?: string};
export type StageT = {shake?: {at: number; amp?: number}; flash?: {at: number; c?: string}; bars?: boolean; spot?: {x: number; y: number; r?: number}; bg: BgKind; tod?: Tod; props?: PropT[]; actors?: ActorT[]; texts?: TextT[]; fx?: WeatherKind | WeatherKind[]; cam?: {x?: [number, number]; z?: [number, number]; at?: [number, number]}; shots?: ShotT[]; labels?: LabelT[]};
// Screen-space labels that follow the camera: name (anchored to an actor), faction pill, place, date chip, fact-check badge
export type LabelT = {k: 'name' | 'faction' | 'place' | 'date' | 'fact'; t: string; sub?: string; actor?: number; x?: number; y?: number; c?: string; at?: number; until?: number; below?: boolean};
// camera helpers: `cam: bust(actor)` frames head and shoulders of that actor, `cam: pushIn(actor)` a slow push toward the face
export const bust = (a: ActorT, z = 2.3): NonNullable<StageT['cam']> => { const x = Array.isArray(a.x) ? a.x[1] : a.x; return {at: [x, (a.y ?? 940) - 300 * CHAR * (a.s ?? 1)], z: [z, z]}; };
export const pushIn = (a: ActorT, from = 1.6, to = 2.4): NonNullable<StageT['cam']> => ({...bust(a), z: [from, to]});
// A scene can cut between camera set-ups: each shot overrides the base stage (cam, actors, props...) until `until` (0..1 of the scene).
export type ShotT = {until: number; st: Partial<Omit<StageT, 'shots'>>};
export const shotSpans = (st: StageT): {st: StageT; a0: number; a1: number}[] => {
  if (!st.shots?.length) return [{st, a0: 0, a1: 1}];
  let a0 = 0;
  return st.shots.map((sh, i) => { const a1 = i === st.shots!.length - 1 ? 1 : Math.min(1, Math.max(a0, sh.until)); const o = {st: {...st, ...sh.st, shots: undefined} as StageT, a0, a1}; a0 = a1; return o; });
};
const SKY: Record<Tod, [string, string]> = {day: ['#69bff0', '#e8f7ff'], dusk: ['#323c7c', '#f7ab6c'], night: ['#050919', '#1c2a58'], fire: ['#2a0a0a', '#ff8a3a']};
const GROUND: Record<BgKind, string> = {desert: '#dcae72', grass: '#86bb5f', sea: '#2f86c4', street: '#9096a0', interior: '#a06f44'};
const HZ = 700;

const Hills: React.FC<{seed: string; base: number; amp: number; col: string; dx: number}> = ({seed, base, amp, col, dx}) => {
  const a = 190 + random(`${seed}a`) * 90, b = random(`${seed}b`) * 6;
  const pts: string[] = [];
  for (let x = -800; x <= 2720; x += 60) pts.push(`${x},${base - amp * (0.55 + 0.45 * Math.sin(x / a + b)) - amp * 0.28 * Math.sin(x / 83 + b * 2)}`);
  return <path d={`M-800 1100 L${pts.join(' L')} L2720 1100Z`} fill={col} stroke={INK} strokeWidth={2.5} transform={`translate(${dx} 0)`} />;
};

const Backdrop: React.FC<{bg: BgKind; tod: Tod; f: number; cx: number; seed: string}> = ({bg, tod, f, cx, seed}) => {
  const [t1, t2] = SKY[tod];
  const gc = GROUND[bg];
  const night = tod === 'night' || tod === 'fire';
  if (bg === 'interior') {
    return (
      <g>
        <rect width={1920} height={1080} fill="#d8c8a8" />
        {Array.from({length: 24}, (_, i) => <rect key={i} x={i * 90} y={0} width={45} height={760} fill="#000" opacity={0.035} />)}
        <rect y={730} width={1920} height={34} fill="#6d4a2c" stroke={INK} strokeWidth={3} />
        <rect y={764} width={1920} height={320} fill={gc} />
        {Array.from({length: 10}, (_, i) => <path key={i} d={`M${i * 220 - 300 + (i % 2) * 40} 764 L${i * 330 - 700} 1080`} stroke="#000" opacity={0.12} strokeWidth={3} />)}
      </g>
    );
  }
  return (
    <g>
      <defs>
        <linearGradient id={`sky${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t1} /><stop offset="1" stopColor={t2} /></linearGradient>
        <radialGradient id={`glow${seed}`}><stop offset="0" stopColor="#fff6c8" stopOpacity={0.9} /><stop offset="1" stopColor="#fff6c8" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={1920} height={HZ + 40} fill={`url(#sky${seed})`} />
      {night && Array.from({length: 40}, (_, i) => <circle key={i} cx={random(`${seed}sx${i}`) * 1920} cy={random(`${seed}sy${i}`) * 520} r={1.5 + random(`${seed}sr${i}`) * 2} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 20 + i))} />)}
      {tod === 'night' ? (<g transform={`translate(${1500 - cx * 0.05} 170)`}><PropArt p={{k: 'moon', x: 0, y: 0}} f={f} seed={seed} /></g>) : (<g transform={`translate(${1480 - cx * 0.05} ${tod === 'dusk' ? 470 : 190})`}><circle r={300} fill={`url(#glow${seed})`} /><circle r={72} fill={tod === 'fire' ? '#ffb347' : '#ffe27a'} /></g>)}
      {[0, 1, 2, 3].map((i) => (<g key={i} transform={`translate(${((random(`${seed}cx${i}`) * 2400 + f * (0.25 + i * 0.1) - cx * 0.1) % 2500) - 300} ${90 + i * 70 + random(`${seed}cy${i}`) * 50}) scale(${0.8 + random(`${seed}cs${i}`) * 0.7})`} opacity={night ? 0.25 : 1}><PropArt p={{k: 'cloud', x: 0, y: 0}} f={f} seed={seed} /></g>))}
      {bg !== 'sea' && bg !== 'street' && <Hills seed={`${seed}h1`} base={HZ - 20} amp={150} col={mix(gc, bg === 'grass' ? -0.18 : -0.1)} dx={-cx * 0.15} />}
      {bg === 'street' && <g transform={`translate(${-cx * 0.15} 0)`}>{Array.from({length: 22}, (_, i) => {
        const h = 120 + random(`${seed}bh${i}`) * 260;
        return <rect key={i} x={-600 + i * 150} y={HZ - h} width={120} height={h + 10} fill="#8795b3" stroke={INK} strokeWidth={2.5} opacity={0.85} />;
      })}</g>}
      {bg !== 'sea' && <Hills seed={`${seed}h2`} base={HZ + 20} amp={90} col={mix(gc, -0.04)} dx={-cx * 0.3} />}
      <rect y={HZ} width={1920} height={400} fill={gc} stroke={INK} strokeWidth={0} />
      <rect y={HZ} width={1920} height={5} fill={INK} opacity={0.4} />
      {bg === 'sea' && (<g><rect y={HZ - 6} width={1920} height={400} fill="#2f86c4" /><rect y={HZ - 6} width={1920} height={110} fill="#5aa9dc" opacity={0.55} /><PropArt p={{k: 'waves', x: 0, y: 0}} f={f} seed={seed} />{[0, 1, 2].map((i) => <g key={i} transform={`translate(0 ${HZ + 50 + i * 110})`}><PropArt p={{k: 'waves', x: 0, y: 0}} f={f + i * 14} seed={seed} /></g>)}</g>)}
      {bg !== 'sea' && <rect y={HZ + 5} width={1920} height={380} fill="#000" opacity={0.04} />}
    </g>
  );
};


const LabelArt: React.FC<{l: LabelT; x: number; y: number; f: number; d: number}> = ({l, x, y, f, d}) => {
  const p = pop(f, 30, (l.at ?? 0) * d), out = l.until !== undefined ? clamp01((l.until * d - f) / 6) : 1;
  const tw = (s: string, fs: number) => s.length * fs * 0.52 + 36;
  const body = (() => {
    switch (l.k) {
      case 'name': { const w = Math.max(tw(l.t, 34), l.sub ? tw(l.sub, 24) : 0), h = l.sub ? 88 : 56; return (<g><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="#fffaf0" stroke={INK} strokeWidth={3} /><text y={l.sub ? -6 : 11} textAnchor="middle" fontFamily={HAND} fontSize={34} fontWeight={700} fill={INK}>{l.t}</text>{l.sub && <text y={28} textAnchor="middle" fontFamily={HAND} fontSize={24} fill="#6b5a45">{l.sub}</text>}</g>); }
      case 'faction': { const w = tw(l.t, 30) + 10; return (<g><rect x={-w / 2} y={-22} width={w} height={44} rx={9} fill={l.c ?? '#c0392b'} stroke="#fff" strokeWidth={3} /><text y={10} textAnchor="middle" fontFamily={HAND} fontSize={30} fontWeight={700} fill="#fff" letterSpacing={1.5}>{l.t.toUpperCase()}</text></g>); }
      case 'place': return <text textAnchor="middle" fontFamily={HAND} fontSize={50} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke" strokeLinejoin="round">{l.t}</text>;
      case 'date': { const w = tw(l.t, 36); return (<g><rect x={0} y={-24} width={w} height={50} rx={10} fill="#1f2433" opacity={0.88} /><text x={w / 2} y={12} textAnchor="middle" fontFamily={HAND} fontSize={36} fill="#fff">{l.t}</text></g>); }
      case 'fact': return (<g><rect x={-140} y={-28} width={280} height={56} rx={12} fill="#f2c230" stroke={INK} strokeWidth={4} /><circle cx={-106} cy={0} r={18} fill="#2f9e5a" stroke={INK} strokeWidth={3} /><path d="M-116 0 L-108 8 L-95 -8" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /><text x={22} y={11} textAnchor="middle" fontFamily={HAND} fontSize={32} fontWeight={700} fill={INK} letterSpacing={1}>FACT CHECK</text></g>);
    }
  })();
  return <g transform={`translate(${x} ${y + (1 - p.k) * 14})`} opacity={p.o * out}>{body}</g>;
};

const StageOne: React.FC<{st: StageT; words?: WordT[]; seed: string}> = ({st, words, seed}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: d} = useVideoConfig();
  const tod = st.tod ?? 'day';
  const cx = interpolate(f, [0, d], st.cam?.x ?? [0, 0], {...C, easing: Easing.inOut(Easing.quad)});
  const z = interpolate(f, [0, d], st.cam?.z ?? [1, 1.06], {...C, easing: Easing.inOut(Easing.quad)});
  const sk = st.shake ? Math.max(0, 1 - (f - st.shake.at * d) / 16) * (f >= st.shake.at * d ? 1 : 0) * (st.shake.amp ?? 14) : 0;
  const shx = Math.sin(f * 2.9) * sk, shy = Math.cos(f * 3.7) * sk;
  const fl = st.flash ? Math.max(0, 1 - (f - st.flash.at * d) / 9) * (f >= st.flash.at * d ? 1 : 0) : 0;
  const barH = st.bars ? interpolate(f, [0, 14], [0, 74], C) : 0;
  type Dr = {y: number; el: React.ReactNode};
  const items: Dr[] = [];
  (st.props ?? []).forEach((p, i) => {
    const dd = p.d ?? interpolate(p.y, [690, 960], [0.5, 1], C);
    const e = p.at !== undefined ? pop(f, fps, p.at * d) : {o: 1, k: 1};
    const s = p.s ?? 1;
    items.push({y: p.y, el: (<g key={`p${i}`} transform={`translate(${p.x - cx * dd} ${p.y}) scale(${(p.flip ? -1 : 1) * s * e.k} ${s * e.k})`} opacity={e.o}><PropArt p={p} f={f} seed={`${seed}${i}`} /></g>)});
  });
  (st.actors ?? []).forEach((a, i) => {
    const ax = Array.isArray(a.x) ? a.x : a.x;
    items.push({y: a.y ?? 940, el: (<g key={`a${i}`} transform={`translate(${-cx} 0)`}><Actor a={{...a, x: ax}} words={a.talk ? words : undefined} seed={`${seed}a${i}`} /></g>)});
  });
  items.sort((p, q) => p.y - q.y);
  const tint = tod === 'dusk' ? 'rgba(255,140,60,0.14)' : tod === 'night' ? 'rgba(10,20,70,0.42)' : tod === 'fire' ? `rgba(255,80,10,${0.2 + Math.sin(f / 5) * 0.05})` : 'rgba(0,0,0,0)';
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <defs><radialGradient id={`vg${seed}`}><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.45} /></radialGradient></defs>
      <g transform={`translate(${shx} ${shy}) ${st.cam?.at ? `translate(960 540) scale(${z}) translate(${-st.cam.at[0]} ${-st.cam.at[1]})` : `translate(960 700) scale(${z}) translate(-960 -700)`}`}>
        <Backdrop bg={st.bg} tod={tod} f={f} cx={cx} seed={seed} />
        {items.map((q) => q.el)}
        <rect width={1920} height={1080} fill={tint} />
      </g>
      {st.fx && <Weather k={st.fx} seed={seed} />}
      {st.spot && (<g><defs><radialGradient id={`sp${seed}`} cx={st.spot.x} cy={st.spot.y} r={((st.spot.r ?? 330) * 2)} gradientUnits="userSpaceOnUse"><stop offset="0.35" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.9} /></radialGradient></defs><rect width={1920} height={1080} fill={`url(#sp${seed})`} opacity={interpolate(f, [0, 16], [0, 1], C)} /></g>)}
      <rect width={1920} height={1080} fill={`url(#vg${seed})`} />
      {fl > 0 && <rect width={1920} height={1080} fill={st.flash?.c ?? '#fff'} opacity={fl * 0.9} />}
      {barH > 0 && <g><rect width={1920} height={barH} fill="#000" /><rect y={1080 - barH} width={1920} height={barH} fill="#000" /></g>}
      {(() => {
        // actor labels use the same camera maths as the world group, so they stay at a readable size in close-ups
        const zz = z, ctx = st.cam?.at ? [960 - st.cam.at[0] * zz, 540 - st.cam.at[1] * zz] : [960 - 960 * zz, 700 - 700 * zz];
        const toS = (wx: number, wy: number): [number, number] => [ctx[0] + (wx - cx) * zz, ctx[1] + wy * zz];
        const frank = (st.actors ?? []).some((q) => (q.look ?? q.who) === 'frank');
        const labs: LabelT[] = [...(st.labels ?? []), ...(frank && !(st.labels ?? []).some((q) => q.k === 'fact') ? [{k: 'fact', t: 'FACT CHECK'} as LabelT] : [])];
        return labs.map((l, i) => {
          let x = l.x ?? 960, y = l.y ?? 120;
          if (l.k === 'fact') { x = l.x ?? 1740; y = l.y ?? 70; }
          if (l.k === 'date') { x = l.x ?? 36; y = l.y ?? 60; }
          const a = l.actor !== undefined ? (st.actors ?? [])[l.actor] : undefined;
          if (a) { const ax = Array.isArray(a.x) ? a.x[1] : a.x, sc = (a.s ?? 1) * CHAR; const q = toS(ax, (a.y ?? 940) + (l.below ? 74 : -(404 * sc + (l.sub ? 62 : 38)))); x = q[0]; y = Math.min(1040, Math.max(70, q[1])); }
          return <LabelArt key={i} l={l} x={x} y={y} f={f} d={d} />;
        });
      })()}
      {(st.texts ?? []).map((q, i) => {
        const at = (q.at ?? 0) * d, n = Math.round(interpolate(f, [at, at + q.t.length * 2.2], [0, q.t.length], C));
        return <text key={i} x={q.x} y={q.y} textAnchor="middle" fontFamily={HAND} fontSize={q.size ?? 84} fill={q.color ?? '#fff'} stroke={INK} strokeWidth={9} paintOrder="stroke" strokeLinejoin="round">{q.t.slice(0, n)}</text>;
      })}
    </svg>
  );
};

export const NarratorOverlay: React.FC<{cfg: Partial<ActorT>; words?: WordT[]}> = ({cfg, words}) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    <Actor a={{who: 'narrator', x: 1640, y: 1085, s: 1.05, talk: true, flip: true, ...cfg}} words={words} seed="nar" />
  </svg>
);

export const Paper: React.FC = () => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    <defs>
      <pattern id="dots" width="48" height="48" patternUnits="userSpaceOnUse"><circle cx={2} cy={2} r={2} fill="#b9b19c" /></pattern>
      <radialGradient id="pv"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.18} /></radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="#ebe5d4" /><rect width={1920} height={1080} fill="url(#dots)" opacity={0.5} /><rect width={1920} height={1080} fill="url(#pv)" />
  </svg>
);

export const Stage: React.FC<{st: StageT; words?: WordT[]; seed: string}> = (props) => {
  const {durationInFrames: d} = useVideoConfig();
  if (!props.st.shots?.length) return <StageOne {...props} />;
  return (
    <>
      {shotSpans(props.st).map((sp, i) => {
        const from = Math.round(sp.a0 * d), len = Math.max(1, Math.round(sp.a1 * d) - from);
        return (<Sequence key={i} from={from} durationInFrames={len} layout="none"><StageOne st={sp.st} words={props.words} seed={`${props.seed}h${i}`} /></Sequence>);
      })}
    </>
  );
};
