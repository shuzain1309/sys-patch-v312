// Vidfactory world kit: everything is drawn in code (SVG). No image files.
// Stickman rig (poses, blink, breathing, lip-sync), 25 props, parallax backdrops, a Stage engine.
// Copy once to src/remotion/world.tsx next to kit.tsx. Do not edit per video.
import React from 'react';
import libLooks from '../../library/looks.json'; // reusable looks added over time (merged by the dashboard); same fields as Look
import {Easing, continueRender, delayRender, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadHand} from '@remotion/google-fonts/PatrickHand';
import {fit, measure, placeBox, SAFE, Rect} from './textfit';

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

export type Hair = 'none' | 'short' | 'long' | 'topknot' | 'curly' | 'wild' | 'parted' | 'bald' | 'bob';
export type Outfit = 'tunic' | 'robe' | 'coat' | 'dress' | 'armor' | 'toga' | 'kilt' | 'sheath';
export type Look = {hat: 'none' | 'explorer' | 'top' | 'crown' | 'cap' | 'helmet' | 'straw' | 'bowler' | 'tricorn' | 'bun' | 'laurel' | 'crest' | 'hood' | 'dome' | 'greathelm' | 'morion' | 'turban' | 'nemes' | 'whitecrown' | 'redcrown' | 'pschent' | 'khepresh' | 'linen' | 'jackal' | 'falcon' | 'diadem' | 'fez' | 'bork' | 'mitre' | 'biretta' | 'beret' | 'cavalier' | 'peruke' | 'bicorne' | 'phrygian' | 'plume' | 'bearskin' | 'shako' | 'busby' | 'czapka' | 'casque' | 'ushanka' | 'boyar' | 'mongol' | 'peaked'; shirt: string; pants: string; skin: string; extra?: 'scarf' | 'beard' | 'apron'; ec?: string; cape?: string; toga?: string; armor?: boolean;
  trim?: string; outfit?: Outfit; hair?: Hair; hc?: string; facial?: 'full' | 'goatee' | 'stache' | 'long' | 'ceremonial'; sleeve?: string; bare?: boolean; shoes?: string; fc?: string; glasses?: boolean; era?: string; kohl?: boolean};
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

// Per-video and library characters. A script can do:  registerLooks(BIBLE.looks); registerFactions(BIBLE.factions);
Object.assign(LOOKS, libLooks as unknown as Record<string, Look>);
export const registerLooks = (o: Record<string, Look> | undefined) => { if (o) Object.assign(LOOKS, o); };
export type Faction = {c: string; c2?: string; kind?: TroopKind};
export const FACTIONS: Record<string, Faction> = {};
export const registerFactions = (o: Record<string, Faction> | undefined) => { if (o) Object.assign(FACTIONS, o); };

export type Held = 'sword' | 'spear' | 'torch' | 'scroll' | 'dagger' | 'goblet' | 'standard' | 'lyre' | 'coin' | 'magnifier' | 'khopesh' | 'ankh' | 'bow' | 'crook' | 'musket' | 'saber' | 'lance' | 'eagle' | 'baton' | 'spyglass';
export type ActorT = {who?: string; x: number | [number, number]; y?: number; s?: number; pose?: PoseName; face?: Face; flip?: boolean; say?: string; at?: number; talk?: boolean; look?: string | Look; raw?: boolean; held?: Held; shield?: boolean; fa?: number; hide?: number; ghost?: number; ns?: boolean};

const Hat: React.FC<{k: Look['hat']; top: number; skin: string; col?: string}> = ({k, top, skin, col}) => {
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
    case 'dome': return (<g {...OL}><path d={`M-54 ${top + 20} Q-56 ${top - 40} 0 ${top - 40} Q56 ${top - 40} 54 ${top + 20}Z`} fill="#8f98a3" /><path d={`M-54 ${top + 8} Q0 ${top + 18} 54 ${top + 8}`} fill="none" stroke="#c4a24a" strokeWidth={7} /><rect x={-6} y={top - 4} width={12} height={46} fill="#7f8794" /><path d={`M0 ${top - 40} V${top + 8}`} stroke="#7f8794" strokeWidth={6} /></g>);
    case 'greathelm': return (<g {...OL}><path d={`M-58 ${top + 78} L-58 ${top - 20} Q-58 ${top - 52} 0 ${top - 52} Q58 ${top - 52} 58 ${top - 20} L58 ${top + 78}Z`} fill="#aeb6c0" /><rect x={-46} y={top + 6} width={92} height={12} rx={4} fill="#1f1f27" /><path d={`M0 ${top - 52} V${top + 78} M-30 ${top + 40} h60`} stroke="#7f8794" strokeWidth={4} fill="none" />{[-30, -14, 2, 18].map((x, i) => <circle key={i} cx={x + 6} cy={top + 52 + (i % 2) * 8} r={2.5} fill="#1f1f27" />)}</g>);
    case 'morion': return (<g {...OL}><path d={`M-80 ${top + 16} Q0 ${top - 6} 80 ${top + 16} Q60 ${top + 26} 0 ${top + 22} Q-60 ${top + 26} -80 ${top + 16}Z`} fill="#9aa3ae" /><path d={`M-48 ${top + 14} Q-44 ${top - 36} 0 ${top - 36} Q44 ${top - 36} 48 ${top + 14}Z`} fill="#aeb6c0" /><path d={`M-6 ${top - 36} Q0 ${top - 62} 6 ${top - 36}Z`} fill="#9aa3ae" /></g>);
    case 'fez': return (<g {...OL}><path d={`M-40 ${top + 14} L-34 ${top - 46} H34 L40 ${top + 14}Z`} fill="#b3202a" /><path d={`M0 ${top - 46} Q30 ${top - 40} 36 ${top - 10}`} fill="none" stroke="#f2c230" strokeWidth={4} /><circle cx={36} cy={top - 8} r={5} fill="#f2c230" /></g>);
    case 'bork': return (<g {...OL}><path d={`M-50 ${top + 16} Q-50 ${top - 50} 0 ${top - 56} Q50 ${top - 50} 50 ${top + 16}Z`} fill="#f1ece0" /><path d={`M-50 ${top + 16} Q-82 ${top + 8} -78 ${top + 72} L-50 ${top + 40}Z`} fill="#f1ece0" /><rect x={-10} y={top - 6} width={20} height={20} rx={4} fill="#f2c230" /></g>);
    case 'turban': return (<g {...OL}><path d={`M-58 ${top + 22} Q-66 ${top - 40} 0 ${top - 48} Q66 ${top - 40} 58 ${top + 22} Q0 ${top + 6} -58 ${top + 22}Z`} fill="#efe9dc" />{[0, 1, 2].map((i) => <path key={i} d={`M${-52 + i * 6} ${top + 8 - i * 14} Q0 ${top - 6 - i * 14} ${52 - i * 6} ${top + 8 - i * 14}`} fill="none" strokeWidth={2.5} opacity={0.6} />)}<circle cx={0} cy={top - 8} r={8} fill="#2b5fb4" /></g>);
    case 'nemes': return (<g {...OL}><path d={`M-62 ${top + 96} L-58 ${top - 6} Q-56 ${top - 44} 0 ${top - 44} Q56 ${top - 44} 58 ${top - 6} L62 ${top + 96} L40 ${top + 96} L36 ${top + 20} Q0 ${top + 6} -36 ${top + 20} L-40 ${top + 96}Z`} fill="#2b5fb4" />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-58 ${top - 8 + i * 12} Q0 ${top - 16 + i * 12} 58 ${top - 8 + i * 12}`} fill="none" stroke="#e2b84a" strokeWidth={4} />)}<path d={`M-6 ${top - 40} Q0 ${top - 66} 6 ${top - 40}Z`} fill="#e2b84a" /></g>);
    case 'whitecrown': return (<g {...OL}><path d={`M-34 ${top + 12} Q-40 ${top - 44} -22 ${top - 84} Q-14 ${top - 134} 0 ${top - 138} Q14 ${top - 134} 22 ${top - 84} Q40 ${top - 44} 34 ${top + 12}Z`} fill="#f1ece0" /></g>);
    case 'redcrown': return (<g {...OL}><path d={`M-44 ${top + 12} L-44 ${top - 24} L-8 ${top - 34} L-8 ${top - 92} L28 ${top - 92} L36 ${top - 30} L44 ${top - 22} L44 ${top + 12}Z`} fill="#c0392b" /><path d={`M-8 ${top - 34} Q-34 ${top - 62} -18 ${top - 80}`} fill="none" stroke="#e2b84a" strokeWidth={5} /></g>);
    case 'pschent': return (<g {...OL}><path d={`M-44 ${top + 12} L-44 ${top - 22} L-12 ${top - 30} L-12 ${top - 50} L12 ${top - 50} L12 ${top - 30} L44 ${top - 22} L44 ${top + 12}Z`} fill="#c0392b" /><path d={`M-14 ${top - 40} Q-20 ${top - 92} -10 ${top - 120} Q0 ${top - 150} 10 ${top - 120} Q20 ${top - 92} 14 ${top - 40}Z`} fill="#f1ece0" /></g>);
    case 'khepresh': return (<g {...OL}><path d={`M-54 ${top + 14} Q-58 ${top - 52} 0 ${top - 68} Q58 ${top - 52} 54 ${top + 14}Z`} fill="#2b5fb4" />{[[-26, -20], [0, -34], [26, -20], [-14, 0], [14, 0], [0, -10]].map((q, i) => <circle key={i} cx={q[0]} cy={top + q[1]} r={4.5} fill="#e2b84a" stroke="none" />)}<path d={`M-54 ${top + 10} Q0 ${top + 20} 54 ${top + 10}`} fill="none" stroke="#e2b84a" strokeWidth={7} /><path d={`M0 ${top + 4} Q-8 ${top - 14} 0 ${top - 24} Q8 ${top - 14} 0 ${top + 4}Z`} fill="#e2b84a" /></g>);
    case 'linen': return (<g {...OL}><path d={`M-58 ${top + 24} Q-62 ${top - 34} 0 ${top - 40} Q62 ${top - 34} 58 ${top + 24} L60 ${top + 84} L40 ${top + 84} L38 ${top + 28} Q0 ${top + 10} -38 ${top + 28} L-40 ${top + 84} L-60 ${top + 84}Z`} fill="#efe9dc" />{[0, 1, 2, 3].map((i) => <path key={i} d={`M-56 ${top + 12 - i * 10} Q0 ${top + 2 - i * 10} 56 ${top + 12 - i * 10}`} fill="none" strokeWidth={2} opacity={0.4} />)}</g>);
    case 'diadem': return (<g {...OL}><path d={`M-56 ${top + 14} Q0 ${top - 6} 56 ${top + 14} L56 ${top + 24} Q0 ${top + 4} -56 ${top + 24}Z`} fill="#e2b84a" /><path d={`M0 ${top + 6} Q-10 ${top - 12} 0 ${top - 26} Q10 ${top - 12} 0 ${top + 6}Z`} fill="#2f9e5a" /><circle cx={0} cy={top - 18} r={4} fill="#c0392b" stroke="none" /></g>);
    case 'jackal': { const c = top + 54; return (<g {...OL}><path d={`M-52 ${c - 20} L-46 ${c - 120} L-18 ${c - 58}Z M52 ${c - 20} L46 ${c - 120} L18 ${c - 58}Z`} fill="#26262d" /><path d={`M-40 ${c - 66} L-42 ${c - 100} L-26 ${c - 70}Z M40 ${c - 66} L42 ${c - 100} L26 ${c - 70}Z`} fill="#8a5a5a" stroke="none" /><ellipse cx={0} cy={c} rx={56} ry={58} fill="#26262d" /><path d={`M-24 ${c + 6} Q0 ${c - 6} 24 ${c + 6} L16 ${c + 66} Q0 ${c + 76} -16 ${c + 66}Z`} fill="#3a3a44" /><ellipse cx={0} cy={c + 62} rx={13} ry={9} fill="#0e0e12" /><circle cx={-27} cy={c - 6} r={8} fill="#e2b84a" /><circle cx={27} cy={c - 6} r={8} fill="#e2b84a" /><circle cx={-27} cy={c - 6} r={3.5} fill={INK} stroke="none" /><circle cx={27} cy={c - 6} r={3.5} fill={INK} stroke="none" /><path d={`M-14 ${c + 40} Q0 ${c + 46} 14 ${c + 40}`} fill="none" strokeWidth={3} /></g>); }
    case 'falcon': { const c = top + 54; return (<g {...OL}><ellipse cx={0} cy={c} rx={56} ry={58} fill="#7a5a3a" /><path d={`M-56 ${c - 6} Q-30 ${c - 62} 0 ${c - 60} Q30 ${c - 62} 56 ${c - 6} Q30 ${c - 26} 0 ${c - 28} Q-30 ${c - 26} -56 ${c - 6}Z`} fill="#4a3a2a" /><circle cx={-26} cy={c - 2} r={13} fill="#e2b84a" /><circle cx={26} cy={c - 2} r={13} fill="#e2b84a" /><circle cx={-26} cy={c - 2} r={5.5} fill={INK} stroke="none" /><circle cx={26} cy={c - 2} r={5.5} fill={INK} stroke="none" /><path d={`M-14 ${c + 6} Q0 ${c - 2} 14 ${c + 6} Q16 ${c + 44} 0 ${c + 66} Q-16 ${c + 44} -14 ${c + 6}Z`} fill="#e2b84a" /><path d={`M0 ${c + 8} V${c + 56}`} stroke={INK} strokeWidth={2.5} /><path d={`M-26 ${c + 14} Q-26 ${c + 44} -38 ${c + 56} M26 ${c + 14} Q26 ${c + 44} 38 ${c + 56}`} fill="none" strokeWidth={4} /></g>); }
    case 'hood': return (<g {...OL}><path d={`M-64 ${top + 74} Q-72 ${top - 40} 0 ${top - 46} Q72 ${top - 40} 64 ${top + 74} Q40 ${top + 30} 0 ${top + 28} Q-40 ${top + 30} -64 ${top + 74}Z`} fill="#3a3b48" /></g>);
    case 'mitre': return (<g {...OL}><path d={`M-46 ${top + 14} Q-54 ${top - 70} 0 ${top - 124} Q54 ${top - 70} 46 ${top + 14}Z`} fill="#f4f1e6" /><path d={`M-46 ${top + 8} Q0 ${top + 20} 46 ${top + 8}`} fill="none" stroke="#e2b84a" strokeWidth={10} /><path d={`M0 ${top - 98} V${top - 40} M-20 ${top - 70} H20`} stroke={col ?? '#c0392b'} strokeWidth={8} fill="none" /></g>);
    case 'biretta': return (<g {...OL}><path d={`M-48 ${top + 14} Q-50 ${top - 26} -24 ${top - 32} L24 ${top - 32} Q50 ${top - 26} 48 ${top + 14}Z`} fill={col ?? '#b3202a'} /><path d={`M-14 ${top - 32} L-8 ${top + 6} M0 ${top - 32} V${top + 6} M14 ${top - 32} L8 ${top + 6}`} fill="none" strokeWidth={2.5} opacity={0.5} /><circle cx={0} cy={top - 38} r={7} fill={col ?? '#b3202a'} /></g>);
    case 'beret': return (<g {...OL}><path d={`M-58 ${top + 18} Q-66 ${top - 22} -8 ${top - 32} Q52 ${top - 36} 64 ${top - 6} Q68 ${top + 12} 50 ${top + 18}Z`} fill={col ?? '#3a2a4f'} /><path d={`M34 ${top - 22} Q96 ${top - 72} 90 ${top - 2}`} fill="none" stroke="#f1ece0" strokeWidth={8} /><path d={`M34 ${top - 22} Q90 ${top - 60} 86 ${top - 6}`} fill="none" strokeWidth={2.5} /></g>);
    case 'cavalier': return (<g {...OL}><ellipse cx={0} cy={top + 14} rx={88} ry={14} fill={col ?? '#4a3426'} /><path d={`M-46 ${top + 12} Q-46 ${top - 40} 0 ${top - 40} Q46 ${top - 40} 46 ${top + 12}Z`} fill={col ?? '#4a3426'} /><path d={`M-46 ${top - 2} Q0 ${top + 8} 46 ${top - 2}`} fill="none" stroke="#e2b84a" strokeWidth={7} /><path d={`M-30 ${top - 10} Q-86 ${top - 70} -96 ${top - 8} Q-56 ${top - 36} -26 ${top - 4}Z`} fill="#f4f1e6" /></g>);
    case 'peruke': return (<g {...OL}><path d={`M-60 ${top + 96} Q-80 ${top - 6} -42 ${top - 40} Q0 ${top - 64} 42 ${top - 40} Q80 ${top - 6} 60 ${top + 96} Q50 ${top + 70} 46 ${top + 36} Q32 ${top - 4} 0 ${top - 8} Q-32 ${top - 4} -46 ${top + 36} Q-50 ${top + 70} -60 ${top + 96}Z`} fill={col ?? '#e9e4d8'} />{[-1, 1].map((sg) => [0, 1, 2].map((i) => <circle key={`${sg}${i}`} cx={sg * (58 - i * 3)} cy={top + 56 + i * 16} r={11} fill={col ?? '#e9e4d8'} />))}</g>);
    case 'bicorne': return (<g {...OL}><path d={`M-88 ${top + 10} Q-60 ${top - 38} 0 ${top - 34} Q60 ${top - 38} 88 ${top + 10} Q44 ${top + 26} 0 ${top + 16} Q-44 ${top + 26} -88 ${top + 10}Z`} fill="#1f1f27" /><circle cx={34} cy={top - 14} r={7} fill="#c0392b" /><path d={`M-88 ${top + 10} Q0 ${top - 10} 88 ${top + 10}`} fill="none" stroke={col ?? '#e2b84a'} strokeWidth={4} /></g>);
    case 'phrygian': return (<g {...OL}><path d={`M-52 ${top + 16} Q-56 ${top - 30} -4 ${top - 42} Q44 ${top - 50} 70 ${top - 22} Q52 ${top - 14} 52 ${top + 16}Z`} fill="#c0392b" /><circle cx={22} cy={top - 2} r={9} fill="#f4f1e6" /><circle cx={22} cy={top - 2} r={4.5} fill="#2b5fb4" stroke="none" /></g>);
    case 'plume': return (<g {...OL}>{Array.from({length: 9}, (_, i) => { const a = -80 + i * 20, px = Math.sin(rad(a)) * 58, py = top + 8 - Math.cos(rad(a)) * 58; return <ellipse key={i} cx={px} cy={py} rx={11} ry={38} fill={i % 2 ? '#2f9e9e' : col ?? '#2f9e5a'} transform={`rotate(${a} ${px} ${py})`} />; })}<rect x={-52} y={top - 2} width={104} height={16} rx={6} fill="#e2b84a" /></g>);
    case 'ushanka': return (<g {...OL}><path d={`M-52 ${top + 20} Q-56 ${top - 34} 0 ${top - 36} Q56 ${top - 34} 52 ${top + 20}Z`} fill={col ?? '#6b5a4a'} /><path d={`M-52 ${top + 14} Q-70 ${top + 40} -56 ${top + 62} Q-44 ${top + 50} -48 ${top + 20}Z M52 ${top + 14} Q70 ${top + 40} 56 ${top + 62} Q44 ${top + 50} 48 ${top + 20}Z`} fill={col ?? '#6b5a4a'} /><rect x={-9} y={top - 22} width={18} height={18} rx={3} fill="#c0392b" /></g>);
    case 'boyar': return (<g {...OL}><path d={`M-44 ${top + 14} L-52 ${top - 78} H52 L44 ${top + 14}Z`} fill={col ?? '#7a4a2a'} /><path d={`M-48 ${top + 6} Q0 ${top + 20} 48 ${top + 6}`} fill="none" stroke="#e2b84a" strokeWidth={6} /><path d={`M-52 ${top - 78} Q0 ${top - 96} 52 ${top - 78}`} fill="#9a6a3a" /></g>);
    case 'mongol': return (<g {...OL}><path d={`M-50 ${top + 16} Q-52 ${top - 20} -8 ${top - 50} L0 ${top - 74} L8 ${top - 50} Q52 ${top - 20} 50 ${top + 16}Z`} fill={col ?? '#2f6f9a'} /><path d={`M-54 ${top + 6} Q0 ${top + 22} 54 ${top + 6} L50 ${top + 26} Q0 ${top + 38} -50 ${top + 26}Z`} fill="#5a3a22" /><path d={`M-14 ${top - 54} Q-46 ${top - 30} -52 ${top - 12}`} fill="none" stroke="#c0392b" strokeWidth={5} /></g>);
    case 'peaked': return (<g {...OL}><path d={`M-52 ${top + 16} Q-54 ${top - 26} 0 ${top - 28} Q54 ${top - 26} 52 ${top + 16}Z`} fill={col ?? '#4a5a3a'} /><path d={`M-50 ${top + 4} Q0 ${top + 14} 50 ${top + 4}`} fill="none" stroke="#c0392b" strokeWidth={8} /><path d={`M8 ${top + 12} L70 ${top + 16} Q64 ${top + 26} 8 ${top + 22}Z`} fill="#1f1f27" /><path d={`M0 ${top - 8} l5 12 h-10z`} fill="#e2b84a" /></g>);
    case 'shako': return (<g {...OL}><path d={`M-44 ${top + 14} L-40 ${top - 76} L-54 ${top - 92} H54 L40 ${top - 76} L44 ${top + 14}Z`} fill="#26262f" /><path d={`M-43 ${top - 4} H43`} fill="none" stroke="#e2b84a" strokeWidth={6} /><path d={`M-40 ${top - 76} H40`} fill="none" stroke="#e2b84a" strokeWidth={4} /><rect x={-15} y={top - 56} width={30} height={24} rx={5} fill="#e2b84a" /><path d={`M4 ${top - 92} Q-4 ${top - 130} 8 ${top - 152}`} fill="none" stroke={col ?? '#c0392b'} strokeWidth={13} /></g>);
    case 'bearskin': return (<g {...OL}><path d={`M-50 ${top + 16} Q-64 ${top - 66} -36 ${top - 118} Q0 ${top - 136} 36 ${top - 118} Q64 ${top - 66} 50 ${top + 16}Z`} fill="#2a211c" />{[-30, -10, 12, 30].map((x, i) => <path key={i} d={`M${x} ${top - 108 + (i % 2) * 8} Q${x + 4} ${top - 70} ${x - 2} ${top - 30}`} fill="none" stroke="#4a3a30" strokeWidth={3.5} />)}<ellipse cx={0} cy={top - 28} rx={15} ry={19} fill="#e2b84a" /><path d={`M26 ${top - 112} Q44 ${top - 162} 26 ${top - 176} Q18 ${top - 140} 12 ${top - 114}Z`} fill={col ?? '#c0392b'} /></g>);
    case 'busby': return (<g {...OL}><path d={`M-48 ${top + 14} Q-56 ${top - 58} 0 ${top - 64} Q56 ${top - 58} 48 ${top + 14}Z`} fill="#3a2a22" /><path d={`M16 ${top - 60} Q72 ${top - 56} 62 ${top - 4} Q46 ${top - 26} 18 ${top - 36}Z`} fill={col ?? '#a8242c'} /><path d={`M-18 ${top - 62} Q-24 ${top - 104} -10 ${top - 120}`} fill="none" stroke="#f4f1e6" strokeWidth={11} /><path d={`M-48 ${top - 2} Q0 ${top + 8} 48 ${top - 2}`} fill="none" stroke="#e2b84a" strokeWidth={5} /></g>);
    case 'czapka': return (<g {...OL}><path d={`M-42 ${top + 14} L-38 ${top - 40} L-68 ${top - 78} L68 ${top - 78} L38 ${top - 40} L42 ${top + 14}Z`} fill={col ?? '#2b4a8a'} /><path d={`M-38 ${top - 40} H38`} fill="none" stroke="#e2b84a" strokeWidth={5} /><path d={`M-68 ${top - 78} L0 ${top - 90} L68 ${top - 78}`} fill="#f4f1e6" /><circle cx={0} cy={top - 18} r={11} fill="#e2b84a" /><path d={`M0 ${top - 90} Q10 ${top - 130} 0 ${top - 148}`} fill="none" stroke="#f4f1e6" strokeWidth={9} /></g>);
    case 'casque': return (<g {...OL}><path d={`M-6 ${top - 38} Q44 ${top - 96} 88 ${top - 6} Q70 ${top - 34} 44 ${top - 28} Q14 ${top - 30} -6 ${top - 30}Z`} fill="#1f1f27" /><path d={`M-52 ${top + 18} Q-54 ${top - 36} 0 ${top - 38} Q54 ${top - 36} 52 ${top + 18}Z`} fill="#c9d0d8" /><path d={`M-52 ${top + 2} Q0 ${top + 14} 52 ${top + 2}`} fill="none" stroke="#e2b84a" strokeWidth={7} /><path d={`M0 ${top - 38} V${top - 4}`} fill="none" stroke="#9aa5b1" strokeWidth={5} /></g>);
    case 'bun': return (<g {...OL}><circle cx={0} cy={top - 34} r={20} fill="#5a3a28" /><path d={`M-50 ${top + 36} Q-56 ${top - 20} 0 ${top - 18} Q56 ${top - 20} 50 ${top + 36} Q40 ${top + 4} 0 ${top + 2} Q-40 ${top + 4} -50 ${top + 36}Z`} fill="#5a3a28" /></g>);
    default: return null;
  }
};

const HeldArt: React.FC<{k: Held; f: number}> = ({k, f}) => {
  switch (k) {
    case 'sword': return (<g {...OL}><rect x={-26} y={-8} width={52} height={12} rx={4} fill="#c4a24a" /><rect x={-7} y={-2} width={14} height={34} fill="#6b3a2a" /><path d="M-9 -8 L-9 -150 L0 -176 L9 -150 L9 -8Z" fill="#dfe5ec" /><path d="M0 -10 V-160" stroke="#9aa5b1" strokeWidth={3} /></g>);
    case 'khopesh': return (<g {...OL}><rect x={-18} y={-6} width={36} height={9} rx={3} fill="#c4a24a" /><rect x={-5} y={0} width={10} height={26} fill="#6b3a2a" /><path d="M-7 -6 L-7 -80 Q-6 -134 46 -150 Q78 -150 80 -122 L62 -122 Q60 -128 50 -126 Q10 -112 7 -80 L7 -6Z" fill="#c9a86a" /></g>);
    case 'ankh': return (<g><g fill="none" strokeLinecap="round"><ellipse cx={0} cy={-50} rx={17} ry={24} stroke={INK} strokeWidth={14} /><path d="M0 -26 V36 M-24 -8 H24" stroke={INK} strokeWidth={14} /><ellipse cx={0} cy={-50} rx={17} ry={24} stroke="#e2b84a" strokeWidth={8} /><path d="M0 -26 V36 M-24 -8 H24" stroke="#e2b84a" strokeWidth={8} /></g></g>);
    case 'bow': return (<g {...OL}><path d="M-6 -96 Q58 -10 -6 76" fill="none" stroke="#6b3a2a" strokeWidth={9} /><path d="M-6 -96 L-6 76" stroke="#e9e2cc" strokeWidth={2.5} /></g>);
    case 'crook': return (<g {...OL}><rect x={-4} y={-140} width={8} height={196} fill="#e2b84a" /><path d="M0 -140 Q0 -176 -30 -168 Q-44 -160 -36 -144" fill="none" stroke="#e2b84a" strokeWidth={8} /><path d="M0 -100 H0" /><path d="M-4 -110 h8 M-4 -80 h8 M-4 -50 h8" stroke="#2b5fb4" strokeWidth={5} /></g>);
    case 'dagger': return (<g {...OL}><rect x={-14} y={-6} width={28} height={9} rx={3} fill="#c4a24a" /><rect x={-5} y={0} width={10} height={24} fill="#6b3a2a" /><path d="M-7 -6 L-7 -66 L0 -84 L7 -66 L7 -6Z" fill="#dfe5ec" /></g>);
    case 'spear': return (<g {...OL}><rect x={-4} y={-230} width={8} height={290} fill="#8a5a33" /><path d="M-14 -226 L0 -290 L14 -226Z" fill="#dfe5ec" /></g>);
    case 'standard': return (<g {...OL}><rect x={-4} y={-330} width={8} height={380} fill="#8a5a33" /><rect x={-34} y={-300} width={68} height={10} fill="#c4a24a" /><path d="M0 -380 L-44 -350 L-30 -338 L0 -352 L30 -338 L44 -350Z" fill="#e2b84a" /><circle cx={0} cy={-350} r={8} fill="#e2b84a" /><rect x={-22} y={-280} width={44} height={50} fill="#b3202a" /></g>);
    case 'torch': return (<g {...OL}><rect x={-6} y={-70} width={12} height={90} fill="#6b4a2a" /><g transform="translate(0 -66) scale(0.5)"><Flame f={f} k={3} w={40} h={110} /></g></g>);
    case 'scroll': return (<g {...OL}><rect x={-34} y={-70} width={68} height={86} rx={8} fill="#f3e6bf" /><rect x={-40} y={-76} width={80} height={12} rx={6} fill="#a8793f" /><rect x={-40} y={10} width={80} height={12} rx={6} fill="#a8793f" /><path d="M-20 -46 H20 M-20 -26 H20 M-20 -6 H8" stroke="#8a6a3a" strokeWidth={3} /></g>);
    case 'goblet': return (<g {...OL}><path d="M-22 -50 L22 -50 L14 -10 L-14 -10Z" fill="#e2b84a" /><rect x={-4} y={-10} width={8} height={26} fill="#e2b84a" /><rect x={-16} y={14} width={32} height={8} rx={3} fill="#e2b84a" /></g>);
    case 'lyre': return (<g {...OL}><path d="M-34 -80 Q-40 -20 0 -10 Q40 -20 34 -80" fill="none" strokeWidth={9} stroke="#c4a24a" />{[-18, -6, 6, 18].map((x, i) => <path key={i} d={`M${x} -80 V-18`} stroke="#8a6a3a" strokeWidth={2.5} />)}</g>);
    case 'magnifier': return (<g {...OL}><rect x={-4} y={-4} width={8} height={46} rx={4} fill="#6b3a2a" /><circle cx={0} cy={-34} r={30} fill="#bfe6ff" fillOpacity={0.45} stroke="#c4a24a" strokeWidth={7} /><path d="M-16 -44 Q-8 -54 6 -52" fill="none" stroke="#fff" strokeWidth={4} /></g>);
    case 'musket': return (<g {...OL}><rect x={-5} y={-64} width={10} height={116} rx={3} fill="#7a5230" /><rect x={-3.5} y={-180} width={7} height={120} fill="#8f98a3" /><rect x={-7} y={-110} width={14} height={7} fill="#c4a24a" /><path d="M-3 -180 L0 -232 L3 -180Z" fill="#dfe5ec" /></g>);
    case 'saber': return (<g {...OL}><rect x={-22} y={-6} width={44} height={9} rx={3} fill="#c4a24a" /><rect x={-5} y={0} width={10} height={26} fill="#6b3a2a" /><path d="M-6 -6 Q-10 -92 16 -158 Q24 -160 22 -146 Q6 -86 6 -6Z" fill="#dfe5ec" /></g>);
    case 'lance': return (<g {...OL}><rect x={-3.5} y={-310} width={7} height={372} fill="#8a5a33" /><path d="M-8 -306 L0 -362 L8 -306Z" fill="#dfe5ec" /><path d={`M3 -296 Q${30 + Math.sin(f / 5) * 6} -290 52 ${-276 + Math.sin(f / 6) * 4} Q30 -268 3 -262Z`} fill="#c0392b" /></g>);
    case 'eagle': return (<g {...OL}><rect x={-4} y={-330} width={8} height={380} fill="#8a5a33" /><path d="M0 -376 L-44 -400 L-32 -372 L-48 -360 L-18 -352 L0 -334 L18 -352 L48 -360 L32 -372 L44 -400Z" fill="#e2b84a" /><circle cx={0} cy={-380} r={8} fill="#e2b84a" /><rect x={-30} y={-312} width={20} height={56} fill="#2b4a8a" /><rect x={-10} y={-312} width={20} height={56} fill="#f4f1e6" /><rect x={10} y={-312} width={20} height={56} fill="#c0392b" /><rect x={-34} y={-320} width={68} height={8} fill="#c4a24a" /></g>);
    case 'baton': return (<g {...OL}><rect x={-7} y={-76} width={14} height={82} rx={3} fill="#2b4a8a" />{[-60, -42, -24].map((y, i) => <circle key={i} cx={0} cy={y} r={3.4} fill="#e2b84a" stroke="none" />)}<rect x={-9} y={-80} width={18} height={8} fill="#e2b84a" /><rect x={-9} y={2} width={18} height={8} fill="#e2b84a" /></g>);
    case 'spyglass': return (<g {...OL}><g transform="rotate(28 0 0)"><rect x={-6} y={-110} width={12} height={96} rx={3} fill="#a8793f" /><rect x={-9} y={-132} width={18} height={26} rx={3} fill="#c4a24a" /><rect x={-7} y={-18} width={14} height={14} rx={3} fill="#6b3a2a" /></g></g>);
    case 'coin': return (<g {...OL}><circle cx={0} cy={-24} r={26} fill="#f6cf4a" /><circle cx={0} cy={-24} r={17} fill="none" stroke="#b8860b" strokeWidth={3} /></g>);
  }
};

const HAIRLESS: Look['hat'][] = ['peruke', 'mitre', 'biretta', 'helmet', 'crest', 'hood', 'bun', 'greathelm', 'turban', 'nemes', 'jackal', 'falcon', 'linen', 'bearskin', 'shako', 'busby', 'czapka', 'casque', 'ushanka', 'boyar', 'mongol'];
const outfitOf = (l: Look): Outfit => l.outfit ?? (l.armor ? 'armor' : l.toga ? 'toga' : 'tunic');

// hair that sits behind the head (long styles) and in front of it (fringe), both drawn from the head centre
const HairBack: React.FC<{k: Hair; y: number; c: string}> = ({k, y, c}) => {
  if (k === 'bob') return <path d={`M-62 ${y - 10} Q-70 ${y + 50} -60 ${y + 70} L60 ${y + 70} Q70 ${y + 50} 62 ${y - 10}Z`} fill={c} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  if (k === 'long') return <path d={`M-58 ${y - 6} Q-76 ${y + 70} -50 ${y + 104} L50 ${y + 104} Q76 ${y + 70} 58 ${y - 6}Z`} fill={c} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  if (k === 'wild') return <path d={`M-60 ${y - 10} L-78 ${y + 30} L-62 ${y + 36} L-74 ${y + 78} L-44 ${y + 66} L-30 ${y + 96} L0 ${y + 72} L30 ${y + 96} L44 ${y + 66} L74 ${y + 78} L62 ${y + 36} L78 ${y + 30} L60 ${y - 10}Z`} fill={c} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  return null;
};
const HairFront: React.FC<{k: Hair; y: number; c: string}> = ({k, y, c}) => {
  const S = {fill: c, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  switch (k) {
    case 'short': case 'long': return <path d={`M-56 ${y - 2} Q-62 ${y - 66} 0 ${y - 66} Q62 ${y - 66} 56 ${y - 2} Q50 ${y - 30} 30 ${y - 40} Q0 ${y - 28} -30 ${y - 42} Q-50 ${y - 30} -56 ${y - 2}Z`} {...S} />;
    case 'bob': return <g><path d={`M-58 ${y - 2} Q-64 ${y - 68} 0 ${y - 68} Q64 ${y - 68} 58 ${y - 2} L58 ${y - 28} L-58 ${y - 28}Z`} {...S} /><path d={`M-58 ${y - 28} H58`} stroke={INK} strokeWidth={2} opacity={0.4} /></g>;
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
  if (k === 'ceremonial') return <g><path d={`M-10 ${y + 48} L-8 ${y + 112} Q0 ${y + 124} 8 ${y + 112} L10 ${y + 48}Z`} fill={c} {...S} />{[0, 1, 2, 3].map((i) => <path key={i} d={`M-9 ${y + 62 + i * 14} H9`} stroke={INK} strokeWidth={2} />)}</g>;
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
  const bareArms = !!look.bare || out === 'armor' || out === 'kilt' || out === 'sheath';
  const sleeve = bareArms ? look.skin : look.sleeve ?? look.shirt;
  const ls = (p: [number, number][], w2: number, col: string) => <polyline points={p.map((q) => q.join(',')).join(' ')} fill="none" stroke={col} strokeWidth={w2} strokeLinecap="round" strokeLinejoin="round" />;
  const limb = (p: [number, number][], w2: number, col: string) => (<g>{ls(p, w2 + 6, INK)}{ls(p, w2, col)}</g>);
  const sleeved = (sh: [number, number], ar: {el: [number, number]; hd: [number, number]}) => (
    <g>{limb([sh, ar.el], 19, sleeve)}{limb([ar.el, ar.hd], out === 'robe' || out === 'coat' ? 17 : bareArms ? 15 : 17, out === 'robe' || out === 'coat' ? sleeve : bareArms ? look.skin : sleeve)}
      {(out === 'coat' || out === 'robe') && <circle cx={ar.hd[0]} cy={ar.hd[1]} r={11} fill={trim} stroke={INK} strokeWidth={3} />}</g>);
  const hand = (p: [number, number]) => <g><circle cx={p[0]} cy={p[1]} r={10} fill={look.skin} stroke={INK} strokeWidth={3} /></g>;
  const shoe = (ft: [number, number], dir: number) => <path d={`M${ft[0] - 12 * dir} ${ft[1] - 12} Q${ft[0] - 12 * dir} ${ft[1] - 20} ${ft[0] - 2 * dir} ${ft[1] - 19} L${ft[0] + 10 * dir} ${ft[1] - 14} Q${ft[0] + 30 * dir} ${ft[1] - 12} ${ft[0] + 28 * dir} ${ft[1] + 1} L${ft[0] - 12 * dir} ${ft[1] + 1}Z`} fill={shoes} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  const browY = headY - 22;
  const sayT = a.say ? a.say.split(' ') : [];
  const sway = Math.sin(f / 8) * 6 + (pose === 'walk' || pose === 'run' ? Math.sin(w) * 10 : 0);
  const longGarment = out === 'robe' || out === 'dress' || out === 'sheath';
  const hem = longGarment ? -16 + dy * 0.2 : 0;
  const legCol = (out === 'armor' && look.bare) || out === 'kilt' ? look.skin : look.pants;
  return (
    <g transform={`translate(${x} ${a.y ?? 940}) scale(${(a.flip ? -1 : 1) * s * e.k} ${s * e.k})`} opacity={e.o * gone * (a.ghost ?? 1) * (a.ghost !== undefined ? 0.92 + Math.sin(f / 9 + ph) * 0.08 : 1)}>
      {a.ghost !== undefined && <g fill="#9fd8ff"><ellipse cx={0} cy={-200} rx={170} ry={280} opacity={0.08} /><ellipse cx={0} cy={-200} rx={135} ry={245} opacity={0.1} /><ellipse cx={0} cy={-200} rx={100} ry={210} opacity={0.12} /></g>}
      {a.ghost === undefined && !a.ns && <ellipse cx={0} cy={4} rx={86} ry={13} fill="#000" opacity={0.18} />}
      <g transform={`rotate(${-fr * 88})`}>
      {look.cape && <path d={`M-18 ${shY + 4} Q${-64 - sway} ${hipY - 20} ${-40 - sway * 1.6} ${hipY + 96} L22 ${hipY + 50} L18 ${shY + 4}Z`} fill={look.cape} stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
      {/* legs */}
      {!longGarment && <g>{limb([[-11, hipY + 4], lL.kn, lL.ft], 20, legCol)}{limb([[11, hipY + 4], lR.kn, lR.ft], 20, legCol)}</g>}
      {longGarment && <g>{limb([[-11, hipY + 4], lL.kn, lL.ft], 18, look.pants)}{limb([[11, hipY + 4], lR.kn, lR.ft], 18, look.pants)}</g>}
      {longGarment && (() => {
        const wide = out === 'dress' ? 30 : out === 'sheath' ? 8 : 20, flare = out === 'sheath' ? 2 : 14, top = out === 'dress' || out === 'sheath' ? hipY - 2 : hipY + 26;
        return (<g stroke={INK} strokeWidth={3} strokeLinejoin="round"><path d={`M-${SHX - 1} ${top} Q-${SHX + wide + flare} ${hipY + 90} -${SHX + wide + sway * 0.3} ${hem} L${SHX + wide - sway * 0.3} ${hem} Q${SHX + wide + flare} ${hipY + 90} ${SHX - 1} ${top}Z`} fill={look.shirt} /><path d={`M-${SHX + wide + sway * 0.3} ${hem - 8} L${SHX + wide - sway * 0.3} ${hem - 8}`} stroke={trim} strokeWidth={9} /></g>);
      })()}
      {shoe(lL.ft, 1)}{shoe(lR.ft, 1)}
      {out === 'armor' && <g stroke={INK} strokeWidth={2.5}>{[lL, lR].map((q, i) => <path key={i} d={`M${q.ft[0] - 8} ${q.ft[1] - 14} L${q.kn[0] - 8} ${q.kn[1] + 22} M${q.ft[0] + 8} ${q.ft[1] - 14} L${q.kn[0] + 8} ${q.kn[1] + 22}`} />)}</g>}
      {/* upper body leans about the hip */}
      <g transform={`rotate(${lean} 0 ${hipY})`}>
      {sleeved(shL, aL)}
      {/* torso: a shaped garment instead of a tube */}
      <path d={`M-${SHX} ${shY + 8} Q-${SHX} ${shY - 6} -14 ${shY - 6} L14 ${shY - 6} Q${SHX} ${shY - 6} ${SHX} ${shY + 8} L${SHX - 5} ${hipY - 6} L${SHX - 1} ${hipY + 26} L-${SHX - 1} ${hipY + 26} L-${SHX - 5} ${hipY - 6}Z`} fill={out === 'kilt' ? look.skin : look.shirt} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      <path d={`M${SHX - 9} ${shY + 2} L${SHX - 5} ${hipY - 6} L${SHX - 1} ${hipY + 26} L${SHX - 12} ${hipY + 26}Z`} fill={mix(look.shirt, -0.16)} opacity={0.7} />
      {out === 'coat' && <g stroke={INK} strokeWidth={3}><path d={`M-${SHX - 1} ${hipY + 26} L-${SHX + 3} ${hipY + 62} L${SHX + 3} ${hipY + 62} L${SHX - 1} ${hipY + 26}Z`} fill={look.shirt} /><path d={`M0 ${shY - 4} V${hipY + 62}`} />{[0, 1, 2].map((i) => <circle key={i} cx={8} cy={shY + 24 + i * 28} r={3.5} fill={trim} stroke="none" />)}<path d={`M-14 ${shY - 6} L0 ${shY + 20} L14 ${shY - 6}Z`} fill={trim} /><rect x={-SHX + 1} y={hipY - 14} width={SHX * 2 - 2} height={11} fill={mix(look.pants, -0.1)} /><rect x={-9} y={hipY - 15} width={18} height={13} rx={2} fill={trim} /><rect x={-SHX - 4} y={shY - 4} width={14} height={9} rx={3} fill={trim} /><rect x={SHX - 10} y={shY - 4} width={14} height={9} rx={3} fill={trim} /></g>}
      {out === 'tunic' && <g stroke={INK} strokeWidth={3}><rect x={-SHX + 2} y={hipY - 12} width={SHX * 2 - 4} height={10} fill={mix(look.shirt, -0.3)} /><path d={`M-12 ${shY - 6} Q0 ${shY + 8} 12 ${shY - 6}`} fill="none" /></g>}
      {out === 'robe' && <g stroke={INK} strokeWidth={3}><path d={`M-12 ${shY - 6} L0 ${hipY + 26} L12 ${shY - 6}`} fill="none" stroke={trim} strokeWidth={6} /><rect x={-SHX + 1} y={hipY - 14} width={SHX * 2 - 2} height={12} fill={trim} /></g>}
      {out === 'dress' && <g stroke={INK} strokeWidth={3}><rect x={-SHX + 1} y={hipY - 16} width={SHX * 2 - 2} height={11} fill={trim} /><path d={`M-14 ${shY - 6} Q0 ${shY + 14} 14 ${shY - 6}`} fill="none" stroke={trim} strokeWidth={5} /></g>}
      {out === 'toga' && <g stroke={INK} strokeWidth={3} strokeLinejoin="round"><path d={`M-${SHX + 2} ${shY - 2} L${SHX + 4} ${shY + 20} L${SHX + 6} ${hipY + 74} L-${SHX + 6} ${hipY + 74} L-${SHX - 4} ${shY + 54}Z`} fill={look.toga} /><path d={`M-${SHX + 2} ${shY - 2} L${SHX + 6} ${hipY + 56}`} fill="none" stroke={trim} strokeWidth={9} />{[0, 1, 2].map((i) => <path key={i} d={`M-${SHX - 2} ${shY + 56 + i * 26} Q0 ${shY + 64 + i * 26} ${SHX + 4} ${shY + 52 + i * 26}`} fill="none" strokeWidth={2} opacity={0.55} />)}</g>}
      {(out === 'kilt' || out === 'sheath') && (() => {
        const cols = [trim, '#2b5fb4', '#e2b84a'];
        return (<g stroke={INK} strokeWidth={3} strokeLinejoin="round">
          {out === 'kilt' && <g><path d={`M-${SHX} ${hipY - 8} L${SHX} ${hipY - 8} L${SHX + 14} ${hipY + 82} L-${SHX + 14} ${hipY + 82}Z`} fill={look.shirt} />
            {[-18, -9, 0, 9, 18].map((o, i) => <path key={i} d={`M${o} ${hipY} L${o * 1.5} ${hipY + 80}`} fill="none" strokeWidth={2} opacity={0.35} />)}
            <path d={`M-6 ${hipY + 2} L14 ${hipY + 2} L26 ${hipY + 82} L4 ${hipY + 82}Z`} fill={mix(look.shirt, -0.07)} />
            <rect x={-SHX - 1} y={hipY - 16} width={SHX * 2 + 2} height={14} fill={trim} /><rect x={-7} y={hipY - 17} width={14} height={16} rx={3} fill="#e2b84a" /></g>}
          {out === 'sheath' && <g><path d={`M-14 ${shY - 6} L0 ${shY + 24} L14 ${shY - 6}Z`} fill={look.skin} /><path d={`M-${SHX - 4} ${shY + 4} L-${SHX - 4} ${shY + 60}`} fill="none" strokeWidth={2} opacity={0.3} /></g>}
          {[0, 1, 2].map((i) => <path key={i} d={`M-${27 - i * 3} ${shY - 4} Q0 ${shY + 34 + i * 13} ${27 - i * 3} ${shY - 4}`} fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" />)}
          {[0, 1, 2].map((i) => <path key={i} d={`M-${27 - i * 3} ${shY - 4} Q0 ${shY + 34 + i * 13} ${27 - i * 3} ${shY - 4}`} fill="none" stroke={cols[i]} strokeWidth={7} strokeLinecap="round" />)}
        </g>);
      })()}
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
      {look.kohl && <g stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none"><path d={`M-30 ${headY - 2} L-44 ${headY + 1} M30 ${headY - 2} L44 ${headY + 1}`} /><path d={`M-29 ${headY - 9} Q-19 ${headY - 15} -9 ${headY - 9} M29 ${headY - 9} Q19 ${headY - 15} 9 ${headY - 9}`} /></g>}
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
      <Hat k={look.hat} top={headY - HR + 4} skin={look.skin} col={look.trim} />
      </g>
      </g>
      {a.say && fr === 0 && (() => {
        const at0 = (a.at ?? 0) * d;
        const all = sayT;
        const FB = fit(a.say ?? '', {fs: 42, minFs: 28, maxW: 640, maxLines: 4}), lns = FB.lines;
        let wi = 0; const lines: string[][] = lns.map((ln) => ln.split(' ').map((wd2) => `${wi++}|${wd2}`));
        const shown = all.length ? Math.round(interpolate(f, [at0 + 8, at0 + 8 + all.length * 4], [0, all.length], C)) : 0;
        const bw = FB.w + 70, bh = 30 + lines.length * FB.lh;
        const ax0 = Array.isArray(a.x) ? a.x[1] : a.x, sc0 = CHAR * (a.s ?? 1);
        const bx = Math.max(SAFE.l - ax0 + (bw / 2) * sc0, Math.min(SAFE.r - ax0 - (bw / 2) * sc0, 0)) / sc0;
        const by = headY - 150 - bh;
        return (
          <g transform={`scale(${a.flip ? -1 : 1} 1)`} opacity={clamp01(interpolate(f, [at0 + 4, at0 + 10], [0, 1], C))}>
            <path d={`M${-22} ${by + bh - 2} L${-4} ${headY - 104} L${24} ${by + bh - 2}Z`} fill="#fff" stroke={INK} strokeWidth={3} />
            <rect x={bx - bw / 2} y={by} width={bw} height={bh} rx={26} fill="#fff" stroke={INK} strokeWidth={3} />
            {lines.map((l, li) => (
              <text key={li} x={bx} y={by + 22 + FB.fs * 0.85 + li * FB.lh} textAnchor="middle" fontFamily={HAND} fontSize={FB.fs} fill={INK}>
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
export type PropKind = 'house' | 'tudor' | 'church' | 'cactus' | 'tree' | 'skyscraper' | 'factory' | 'mountain' | 'ship' | 'wall' | 'flag' | 'coins' | 'crown' | 'bank' | 'fire' | 'smoke' | 'sun' | 'moon' | 'cloud' | 'sign' | 'banner' | 'crowd' | 'crate' | 'road' | 'waves' | 'column' | 'temple' | 'arch' | 'colosseum' | 'wolf' | 'elephant' | 'standard' | 'tent' | 'torch' | 'throne' | 'basket' | 'shieldwall' | 'river' | 'birds' | 'galley' | 'tower' | 'stonewall' | 'hill' | 'balcony' | 'rubble' | 'cabbage' | 'legion' | 'troop' | 'horse' | 'catapult' | 'ram' | 'siegetower' | 'ballista' | 'gate' | 'longship' | 'fleet' | 'photo' | 'pyramid' | 'sphinx' | 'obelisk' | 'palm' | 'reeds' | 'nileboat' | 'chariot' | 'sarcophagus' | 'pylon' | 'glyphs' | 'goldmask' | 'scales' | 'rosetta' | 'lighthouse' | 'mudbrick' | 'shaduf' | 'camel' | 'mosque' | 'minaret' | 'bombard' | 'cage' | 'cauldron' | 'tulips' | 'cup' | 'silkcord' | 'crescent' | 'tug' | 'trench' | 'steamship' | 'bazaar' | 'serail' | 'chain' | 'scroll' | 'press' | 'caravel' | 'galleon' | 'teocalli' | 'cannon' | 'book' | 'telescope' | 'orrery' | 'globe' | 'guillotine' | 'bastille' | 'versailles' | 'mirror' | 'door' | 'wagon' | 'crop' | 'constantinople' | 'duomo' | 'potosi' | 'scaffold' | 'bed' | 'ceiling' | 'castlewin' | 'bridge' | 'kremlin' | 'gunline' | 'rocket' | 'stbasil' | 'izba' | 'perun' | 'tank' | 'train' | 'sputnik' | 'sub' | 'reactor' | 'winterpalace' | 'emblem' | 'console' | 'watchtower' | 'yurt' | 'icehole' | 'bell' | 'dome' | 'masada' | 'jtemple' | 'sepulchre' | 'menorah' | 'truecross' | 'jar' | 'key' | 'shells' | 'jet' | 'desk' | 'watertower' | 'podium' | 'crossflag' | 'seder';
export type PropT = {k: PropKind; x: number; y: number; s?: number; d?: number; c?: string; t?: string; n?: number; at?: number; flip?: boolean; kind?: TroopKind; form?: 'block' | 'line' | 'wedge' | 'scatter' | 'square'; fight?: boolean; march?: boolean; c2?: string; rider?: string; rider2?: string; fac?: string; held?: Held; src?: string; w?: number; h?: number; ship?: 'galley' | 'longship' | 'ship'};

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
  if (k === 'ru') return [[0, 0.333, '#f4f4f4'], [0.333, 0.667, '#1c57a5'], [0.667, 1, '#d52b1e']];
  if (k === 'ukr') return [[0, 0.5, '#0057b7'], [0.5, 1, '#ffd700']];
  if (k === 'ussr') return u > 0.07 && u < 0.3 ? [[0, 1, '#c0392b'], [0.1, 0.4, '#f2c230']] : [[0, 1, '#c0392b']];
  if (k === 'imp') return [[0, 0.333, '#1f1f27'], [0.333, 0.667, '#e2b84a'], [0.667, 1, '#f4f4f4']];
  if (k === 'mx') return [[0, 1, u < 0.33 ? '#006847' : u < 0.66 ? '#f4f4f4' : '#ce1126']];
  if (k === 'es') return [[0, 0.25, '#aa151b'], [0.25, 0.75, '#f1bf00'], [0.75, 1, '#aa151b']];
  if (k === 'fr') return [[0, 1, u < 0.33 ? '#0055a4' : u < 0.66 ? '#fff' : '#ef4135']];
  if (k === 'uk') return u > 0.4 && u < 0.6 ? [[0, 1, '#fff'], [0, 1, u > 0.45 && u < 0.55 ? '#c8102e' : '#fff']] : [[0, 1, '#012169'], [0.4, 0.6, '#fff'], [0.45, 0.55, '#c8102e']];
  return [[0, 1, k === 'red' || k === 'ot' || k === 'tr' ? '#c0392b' : '#2f6fb5']];
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
      {(kind === 'ot' || kind === 'tr') && <g transform={`translate(${4 + W / 2 - 14} ${-292 + H / 2 + Math.sin(0.55 * N * 0.5 - f * 0.22) * 3.5})`}><path d="M10 -28 A30 30 0 1 0 10 28 A24 24 0 1 1 10 -28Z" fill="#fff" /><path d="M34 -9 L37 -1 L45 -1 L39 4 L41 12 L34 7 L27 12 L29 4 L23 -1 L31 -1Z" fill="#fff" /></g>}
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
export type TroopKind = 'legion' | 'barbarian' | 'gaul' | 'generic' | 'cavalry' | 'egyptian' | 'nubian' | 'chariot' | 'elephant' | 'napoleonic' | 'redcoat' | 'rifleman' | 'guard';
const TROOP: Record<TroopKind, {tunic: string; helm: string | null; shield: string; skin: string; hair?: string; round?: boolean; bare?: boolean; weapon: 'spear' | 'axe' | 'sword' | 'bow' | 'musket'; hat?: 'shako' | 'bearskin'; plume?: string}> = {
  legion: {tunic: '#b53a32', helm: '#b9c0c9', shield: '#a8242c', skin: '#e7c4a4', weapon: 'spear'},
  barbarian: {tunic: '#7a5a3a', helm: null, shield: '#8a6b3a', skin: '#e9c9a8', hair: '#c9892f', round: true, weapon: 'axe'},
  gaul: {tunic: '#2f6f8a', helm: null, shield: '#d9a441', skin: '#f0d2b6', hair: '#d9a441', round: true, weapon: 'sword'},
  generic: {tunic: '#4a6a9a', helm: '#8a8f99', shield: '#3a4a6a', skin: '#e7c4a4', weapon: 'spear'},
  cavalry: {tunic: '#b53a32', helm: '#b9c0c9', shield: '#a8242c', skin: '#e7c4a4', weapon: 'spear'},
  egyptian: {tunic: '#efe9dc', helm: '#efe9dc', shield: '#a9743a', skin: '#c28a5a', bare: true, weapon: 'spear'},
  nubian: {tunic: '#c0392b', helm: null, shield: '#6b4630', skin: '#6b4630', hair: '#15151c', bare: true, weapon: 'bow'},
  chariot: {tunic: '#e2b84a', helm: '#efe9dc', shield: '#2b5fb4', skin: '#c28a5a', weapon: 'bow'},
  elephant: {tunic: '#a8242c', helm: '#b9c0c9', shield: '#e2b84a', skin: '#e7c4a4', weapon: 'spear'},
  napoleonic: {tunic: '#2b4a8a', helm: null, shield: '#efe9dc', skin: '#e7c4a4', hair: '#3b2a20', weapon: 'musket', hat: 'shako', plume: '#c0392b'},
  redcoat: {tunic: '#b3202a', helm: null, shield: '#e9e2cc', skin: '#e7c4a4', hair: '#3b2a20', weapon: 'musket', hat: 'shako', plume: '#efe9dc'},
  rifleman: {tunic: '#2f5d3a', helm: null, shield: '#3a2a1a', skin: '#e7c4a4', hair: '#3b2a20', weapon: 'musket', hat: 'shako', plume: '#1f1f27'},
  guard: {tunic: '#2b4a8a', helm: null, shield: '#efe9dc', skin: '#e7c4a4', hair: '#3b2a20', weapon: 'musket', hat: 'bearskin', plume: '#c0392b'},
};
const HorseDef: React.FC<{id: string; col?: string; col2?: string}> = ({id, col, col2}) => {
  const T = TROOP.cavalry, tunic = col ?? T.tunic, coat = col2 ?? '#8a5a33';
  const S = {stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
  const leg = (x: number, a: number, b: number) => <g><path d={`M${x} -62 L${x + a} -30 L${x + b} 0`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={`M${x} -62 L${x + a} -30 L${x + b} 0`} stroke={coat} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>;
  const horse = (fl: [number, number], bl: [number, number], fr: [number, number], br: [number, number], rider: number) => (
    <g>
      {leg(-34, br[0], br[1])}{leg(36, fr[0], fr[1])}
      <path d="M-62 -70 Q-84 -60 -80 -30" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" /><path d="M-62 -70 Q-84 -60 -80 -30" fill="none" stroke={mix(coat, -0.4)} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={0} cy={-76} rx={64} ry={30} fill={coat} {...S} />
      <path d="M44 -88 Q70 -128 92 -126 L112 -108 L96 -92 Q80 -96 62 -66Z" fill={coat} {...S} /><circle cx={98} cy={-112} r={2.5} fill={INK} />
      {leg(-44, bl[0], bl[1])}{leg(26, fl[0], fl[1])}
      <path d="M-40 -100 Q0 -112 40 -100 L40 -84 Q0 -94 -40 -84Z" fill={tunic} {...S} />
      <g transform={`translate(0 ${rider})`}>
        <rect x={-12} y={-146} width={24} height={44} rx={7} fill={tunic} {...S} />
        <circle cx={0} cy={-158} r={11} fill={T.skin} {...S} />
        <path d="M-12 -160 Q-12 -178 0 -178 Q12 -178 12 -160Z" fill={T.helm!} {...S} />
        <path d="M10 -128 L26 -112" stroke={T.skin} strokeWidth={5} strokeLinecap="round" />
        <path d="M24 -96 L52 -190" stroke={INK} strokeWidth={5} /><path d="M24 -96 L52 -190" stroke="#8a5a33" strokeWidth={2.5} /><path d="M47 -184 L54 -204 L58 -182Z" fill="#dfe5ec" {...S} />
      </g>
    </g>
  );
  return (
    <>
      <g id={`${id}a`}>{horse([30, 46], [-30, -52], [34, 52], [-34, -60], 0)}</g>
      <g id={`${id}b`}>{horse([12, 8], [-8, -14], [14, 10], [-10, -16], -4)}</g>
      <g id={`${id}c`}>{horse([44, 62], [-46, -70], [40, 58], [-50, -66], 2)}</g>
    </>
  );
};

const ChariotDef: React.FC<{id: string; col?: string; col2?: string}> = ({id, col, col2}) => {
  const coat = '#7a5a3a', cart = col ?? '#e2b84a', trim = col2 ?? '#2b5fb4';
  const S = {stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
  const leg = (x: number, a: number, b: number) => <g><path d={`M${x} -62 L${x + a} -30 L${x + b} 0`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={`M${x} -62 L${x + a} -30 L${x + b} 0`} stroke={coat} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>;
  const man = (x: number, bow: boolean) => (<g><rect x={x - 8} y={-120} width={16} height={38} rx={5} fill="#c28a5a" {...S} /><circle cx={x} cy={-130} r={9} fill="#c28a5a" {...S} /><path d={`M${x - 10} -134 Q${x} -150 ${x + 10} -134Z`} fill={trim} {...S} />{bow && <path d={`M${x + 12} -140 Q${x + 36} -108 ${x + 12} -76`} fill="none" stroke={INK} strokeWidth={4} />}</g>);
  const frame = (fl: [number, number], bl: [number, number], fr: [number, number], br: [number, number], rot: number) => (
    <g>
      <g><circle cx={-92} cy={-30} r={30} fill="#8a5a33" {...S} />{[0, 45, 90, 135].map((a) => <path key={a} d={`M${-92 + 30 * Math.cos(rad(a + rot))} ${-30 + 30 * Math.sin(rad(a + rot))} L${-92 - 30 * Math.cos(rad(a + rot))} ${-30 - 30 * Math.sin(rad(a + rot))}`} stroke={INK} strokeWidth={3} />)}</g>
      <path d="M-134 -82 L-60 -82 L-52 -42 L-126 -42Z" fill={cart} {...S} />{man(-112, false)}{man(-84, true)}
      <path d="M-56 -66 L52 -94" stroke={INK} strokeWidth={6} /><path d="M-56 -66 L52 -94" stroke="#8a5a33" strokeWidth={3} />
      <g transform="translate(62 0)">
        {leg(-34, br[0], br[1])}{leg(36, fr[0], fr[1])}
        <ellipse cx={0} cy={-76} rx={64} ry={30} fill={coat} {...S} /><path d="M44 -88 Q70 -128 92 -126 L112 -108 L96 -92 Q80 -96 62 -66Z" fill={coat} {...S} />
        <path d="M-40 -100 Q0 -112 40 -100 L40 -84 Q0 -94 -40 -84Z" fill={trim} {...S} />
        {leg(-44, bl[0], bl[1])}{leg(26, fl[0], fl[1])}
      </g>
    </g>
  );
  return (
    <>
      <g id={`${id}a`}>{frame([30, 46], [-30, -52], [34, 52], [-34, -60], 0)}</g>
      <g id={`${id}b`}>{frame([12, 8], [-8, -14], [14, 10], [-10, -16], 25)}</g>
      <g id={`${id}c`}>{frame([44, 62], [-46, -70], [40, 58], [-50, -66], 50)}</g>
    </>
  );
};

const ElephantDef: React.FC<{id: string; col?: string; col2?: string}> = ({id, col, col2}) => {
  const hide = '#8d8d96', blanket = col ?? '#a8242c', trim = col2 ?? '#e2b84a';
  const S = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
  const leg = (x: number, d: number) => <path d={`M${x} -80 L${x + d} -36 L${x + d * 1.3} 0`} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const legC = (x: number, d: number) => <path d={`M${x} -80 L${x + d} -36 L${x + d * 1.3} 0`} stroke={hide} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const pose = (a: number, tr: number) => (
    <g>
      {leg(-56, -a)}{legC(-56, -a)}{leg(52, a)}{legC(52, a)}
      <ellipse cx={0} cy={-128} rx={96} ry={66} fill={hide} {...S} />
      <path d="M-56 -178 Q0 -202 56 -178 L62 -112 Q0 -96 -62 -112Z" fill={blanket} {...S} /><path d="M-62 -112 Q0 -96 62 -112" fill="none" stroke={trim} strokeWidth={6} />
      <rect x={-34} y={-228} width={68} height={50} rx={8} fill="#8a5a33" {...S} /><circle cx={-12} cy={-244} r={11} fill="#e7c4a4" {...S} /><circle cx={14} cy={-244} r={11} fill="#e7c4a4" {...S} />
      <path d="M-24 -250 Q-24 -266 -12 -266 Q0 -266 0 -250Z M2 -250 Q2 -266 14 -266 Q26 -266 26 -250Z" fill="#b9c0c9" {...S} /><path d="M30 -236 L40 -330" stroke={INK} strokeWidth={5} />
      <ellipse cx={104} cy={-150} rx={42} ry={46} fill={hide} {...S} /><ellipse cx={80} cy={-150} rx={22} ry={36} fill={mix(hide, -0.15)} {...S} />
      <path d={`M132 -140 Q${160 + tr} -90 ${140 + tr} -30 Q${136 + tr} -10 ${150 + tr} -6`} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" /><path d={`M132 -140 Q${160 + tr} -90 ${140 + tr} -30 Q${136 + tr} -10 ${150 + tr} -6`} fill="none" stroke={hide} strokeWidth={18} strokeLinecap="round" />
      <path d="M120 -118 Q158 -108 168 -66" fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" /><path d="M120 -118 Q158 -108 168 -66" fill="none" stroke="#f4efe2" strokeWidth={7} strokeLinecap="round" />
      <circle cx={112} cy={-164} r={4.5} fill={INK} stroke="none" />
      <path d="M-92 -130 Q-112 -120 -108 -84" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
    </g>
  );
  return (
    <>
      <g id={`${id}a`}>{pose(22, 0)}</g>
      <g id={`${id}b`}>{pose(0, 10)}</g>
      <g id={`${id}c`}>{pose(-22, 0)}</g>
    </>
  );
};
const SoldierDef: React.FC<{id: string; k: TroopKind; col?: string; col2?: string}> = ({id, k, col, col2}) => {
  if (k === 'elephant') return <ElephantDef id={id} col={col} col2={col2} />;
  if (k === 'chariot') return <ChariotDef id={id} col={col} col2={col2} />;
  if (k === 'cavalry') return <HorseDef id={id} col={col} col2={col2} />;
  const T = TROOP[k];
  const tunic = col ?? T.tunic, shield = col2 ?? T.shield;
  const S = {stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
  const body = (legs: string, arm: string, wpn: React.ReactNode) => (
    <g>
      <path d={legs} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={legs} stroke={mix(tunic, -0.35)} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      {wpn}
      {T.bare ? (<g><rect x={-13} y={-74} width={26} height={30} rx={7} fill={T.skin} {...S} /><path d="M-14 -48 L14 -48 L17 -22 L-17 -22Z" fill={tunic} {...S} /><rect x={-14} y={-50} width={28} height={7} fill="#c4a24a" {...S} /></g>) : (<g><rect x={-13} y={-74} width={26} height={44} rx={7} fill={tunic} {...S} /><rect x={-13} y={-36} width={26} height={7} fill={mix(tunic, -0.4)} {...S} /></g>)}
      <path d={arm} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" /><path d={arm} stroke={T.skin} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={-86} r={12} fill={T.skin} {...S} />
      <circle cx={-4} cy={-87} r={1.8} fill={INK} /><circle cx={5} cy={-87} r={1.8} fill={INK} /><path d="M-3 -80 q3 2 6 0" fill="none" stroke={INK} strokeWidth={1.8} />
      {T.hat === 'shako' ? <g><path d="M-10 -92 L-9 -120 L-13 -126 H13 L9 -120 L10 -92Z" fill="#26262f" {...S} /><rect x={-3.5} y={-112} width={7} height={7} fill="#e2b84a" stroke="none" /><path d="M0 -126 Q-2 -138 3 -144" fill="none" stroke={T.plume ?? '#c0392b'} strokeWidth={3.2} strokeLinecap="round" /></g>
        : T.hat === 'bearskin' ? <g><path d="M-12 -90 Q-16 -122 -7 -134 Q0 -138 7 -134 Q16 -122 12 -90Z" fill="#2a211c" {...S} /><rect x={-3.5} y={-112} width={7} height={8} fill="#e2b84a" stroke="none" /><path d="M7 -132 Q14 -148 8 -152 Q4 -142 3 -134Z" fill={T.plume ?? '#c0392b'} stroke="none" /></g>
        : T.helm ? <g><path d="M-13 -87 Q-13 -106 0 -106 Q13 -106 13 -87Z" fill={T.helm} {...S} /><rect x={-1.5} y={-108} width={3} height={7} fill="#a8242c" stroke="none" /></g>
        : <path d={`M-13 -88 Q-15 -108 0 -106 Q15 -108 13 -88 Q9 -98 0 -98 Q-9 -98 -13 -88Z`} fill={T.hair} {...S} />}
      {T.round ? <g><circle cx={-24} cy={-52} r={19} fill={shield} {...S} /><circle cx={-24} cy={-52} r={5} fill="#e2b84a" {...S} /></g>
        : <g><rect x={-37} y={-76} width={22} height={46} rx={7} fill={shield} {...S} /><circle cx={-26} cy={-53} r={5} fill="#e2b84a" {...S} /></g>}
    </g>
  );
  const w = (a: number): React.ReactNode =>
    T.weapon === 'musket' ? <g transform={`rotate(${a} 17 -56)`}><path d="M17 -6 V-124" stroke={INK} strokeWidth={5} /><path d="M17 -6 V-52" stroke="#7a5230" strokeWidth={2.8} /><path d="M17 -52 V-124" stroke="#8f98a3" strokeWidth={2.2} /><path d="M13.5 -120 L17 -142 L20.5 -120Z" fill="#dfe5ec" {...S} /></g>
    : T.weapon === 'bow' ? <g transform={`rotate(${a * 0.3} 17 -56)`}><path d="M24 -108 Q62 -58 24 -8" fill="none" stroke={INK} strokeWidth={5} /><path d="M24 -108 Q62 -58 24 -8" fill="none" stroke="#8a5a33" strokeWidth={2.5} /><path d="M24 -108 L24 -8" stroke="#e9e2cc" strokeWidth={1.5} /></g>
    : T.weapon === 'spear' ? <g transform={`rotate(${a} 17 -56)`}><path d="M17 -10 V-128" stroke={INK} strokeWidth={5} /><path d="M17 -10 V-128" stroke="#8a5a33" strokeWidth={2.5} /><path d="M12 -124 L17 -142 L22 -124Z" fill="#dfe5ec" {...S} /></g>
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
const formation = (n: number, form: string, rows: number | undefined, seed: string, dx = 44, dy = 26) => {
  const out: {x: number; y: number; r: number}[] = [];
  const cols = form === 'line' ? n : Math.max(2, Math.round(Math.sqrt(n * 1.7)));
  const R = form === 'line' ? 1 : rows ?? Math.ceil(n / cols);
  if (form === 'wedge') {
    for (let r = 0, k = 0; k < n; r++) for (let c = 0; c <= r * 2 && k < n; c++, k++) out.push({x: (c - r) * (dx - 4), y: -r * dy, r});
  } else if (form === 'square') {  // hollow infantry square: front and back ranks, two flanks, bayonets out
    const side = Math.max(4, Math.round(n / 4)), H = Math.max(2, Math.round(side * 0.55));
    for (let k = 0; k < n; k++) {
      const e = k % 4, i = Math.floor(k / 4) % side, u = i - (side - 1) / 2;
      if (e === 0) out.push({x: u * dx, y: 0, r: 0});
      else if (e === 1) out.push({x: u * dx, y: -H * dy, r: H});
      else { const rr = (i % (H - 1)) + 1; out.push({x: (e === 2 ? -1 : 1) * (side / 2) * dx, y: -rr * dy, r: rr}); }
    }
  } else if (form === 'scatter') {
    for (let k = 0; k < n; k++) out.push({x: (random(`${seed}x${k}`) - 0.5) * (dx * 1.6) * cols, y: -random(`${seed}y${k}`) * dy * R, r: Math.floor(random(`${seed}y${k}`) * R)});
  } else {
    for (let k = 0; k < n; k++) { const r = Math.floor(k / cols), c = k % cols; out.push({x: (c - (cols - 1) / 2) * dx + (r % 2) * (dx * 0.23) + (random(`${seed}j${k}`) - 0.5) * 6, y: -r * dy, r}); }
  }
  return out;
};
const Troop: React.FC<{p: PropT; f: number; seed: string}> = ({p, f, seed}) => {
  const F = p.fac ? FACTIONS[p.fac] : undefined;
  const kind: TroopKind = p.kind ?? F?.kind ?? 'legion';
  const id = `tp${seed.replace(/[^a-zA-Z0-9]/g, '')}`;
  const n = Math.min(p.n ?? 24, 600);
  const cav = kind === 'cavalry' || kind === 'chariot' || kind === 'elephant', pts = formation(n, p.form ?? 'block', undefined, id, kind === 'chariot' ? 230 : kind === 'elephant' ? 250 : cav ? 112 : 44, kind === 'chariot' ? 60 : kind === 'elephant' ? 70 : cav ? 46 : 26);
  const maxR = Math.max(...pts.map((q) => q.r), 1);
  const items = pts.map((q, i) => ({...q, i, sc: 1 - (q.r / maxR) * 0.28 + (random(`${id}s${i}`) - 0.5) * 0.06})).sort((a, b) => a.y - b.y);
  return (
    <g>
      <defs><SoldierDef id={id} k={kind} col={p.c ?? F?.c} col2={p.c2 ?? F?.c2} /></defs>
      {items.map((q) => {
        const ph = f / 6 + q.i * 0.9 + random(`${id}p${q.i}`) * 6;
        const v = cav ? (p.fight || p.march ? ['a', 'b', 'c', 'b'][Math.floor(ph / 1.1) % 4] : 'b') : p.fight ? (Math.sin(ph * 1.1) > 0.35 ? 'c' : 'a') : p.march ? (Math.floor(ph / 1.2) % 2 ? 'a' : 'b') : 'a';
        const bob = cav && (p.fight || p.march) ? -Math.abs(Math.sin(ph * 0.9)) * 7 : p.fight ? -Math.abs(Math.sin(ph * 0.9)) * 5 : p.march ? -Math.abs(Math.sin(ph * 0.9)) * 4 : Math.sin(f / 14 + q.i) * 0.8;
        return <use key={q.i} href={`#${id}${v}`} transform={`translate(${q.x} ${q.y + bob}) scale(${q.sc * (kind === 'chariot' ? 0.9 : kind === 'elephant' ? 0.85 : cav ? 1.05 : 1.35)})`} />;
      })}
    </g>
  );
};

// ---------- hieroglyph-style relief icons (decorative, not real text): eye, ankh, bird, water, sun, reed, scarab ----------
const GlyphIcon: React.FC<{k: number; c: string}> = ({k, c}) => {
  const S = {fill: 'none', stroke: c, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
  switch (k % 7) {
    case 0: return (<g {...S}><path d="M-22 0 Q0 -18 22 0 Q0 18 -22 0Z" /><circle cx={0} cy={0} r={5} fill={c} /><path d="M-6 12 Q-10 28 2 30" /></g>);
    case 1: return (<g {...S}><ellipse cx={0} cy={-14} rx={8} ry={11} /><path d="M0 -3 V26 M-13 6 H13" /></g>);
    case 2: return (<g {...S}><path d="M-20 10 Q-22 -8 -4 -10 Q6 -24 16 -12 L26 -10 L16 -4 Q14 12 -6 14 L-20 24 M-6 14 L-6 28" /></g>);
    case 3: return (<g {...S}><path d="M-24 -10 l8 -8 l8 8 l8 -8 l8 8 l8 -8 M-24 4 l8 -8 l8 8 l8 -8 l8 8 l8 -8 M-24 18 l8 -8 l8 8 l8 -8 l8 8 l8 -8" /></g>);
    case 4: return (<g {...S}><circle cx={0} cy={0} r={15} /><circle cx={0} cy={0} r={4} fill={c} /></g>);
    case 5: return (<g {...S}><path d="M0 24 Q-10 0 0 -26 Q10 0 0 24 M-14 14 Q-14 -2 -6 -10 M14 14 Q14 -2 6 -10" /></g>);
    default: return (<g {...S}><ellipse cx={0} cy={4} rx={16} ry={12} /><path d="M-16 4 H16 M0 -8 V16 M-8 -12 L-14 -22 M8 -12 L14 -22" /></g>);
  }
};
const Glyphs: React.FC<{x: number; y: number; n: number; rows: number; c?: string}> = ({x, y, n, rows, c = '#6b5430'}) => (
  <g transform={`translate(${x} ${y})`} opacity={0.75}>{Array.from({length: rows}, (_, r) => Array.from({length: n}, (_, i) => <g key={`${r}-${i}`} transform={`translate(${(i - (n - 1) / 2) * 62} ${(r - (rows - 1) / 2) * 62}) scale(0.8)`}><GlyphIcon k={r * 3 + i * 2 + r} c={c} /></g>))}</g>
);


// ---------- PHOTO STYLE (permanent): the photo is NEVER cropped or zoomed. It sits whole inside a postage-stamp frame that takes the
// photo's own shape (wide or tall). Used by the full-screen photo scene (kit.tsx) and by the stage prop {k:'photo'}.
const DIMS = new Map<string, {w: number; h: number}>();
export const usePhotoDims = (src: string) => {
  const [d, setD] = React.useState<{w: number; h: number} | null>(() => DIMS.get(src) ?? null);
  const [handle] = React.useState<number | null>(() => (DIMS.has(src) || !src ? null : delayRender(`photo size ${src}`)));
  React.useEffect(() => {
    if (handle === null) return;
    const im = new window.Image();
    const done = (w: number, h: number) => { DIMS.set(src, {w, h}); setD({w, h}); continueRender(handle); };
    im.onload = () => done(im.naturalWidth || 16, im.naturalHeight || 10);
    im.onerror = () => done(16, 10);
    im.src = staticFile(src);
  }, [src, handle]);
  return d;
};
let CREDITS: Record<string, any> | null = null;
/** "commons.wikimedia.org" for a photo whose credit is in public/photos/credits.json (written by photos.py), else null */
export const usePhotoCredit = (src: string): string | null => {
  const [c, setC] = React.useState<Record<string, any> | null>(CREDITS);
  const [handle] = React.useState<number | null>(() => (CREDITS ? null : delayRender('photo credits')));
  React.useEffect(() => {
    if (handle === null) return;
    fetch(staticFile('photos/credits.json')).then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((j) => { CREDITS = j; setC(j); continueRender(handle); });
  }, [handle]);
  const id = src.replace(/^.*\//, '').replace(/\.[a-z0-9]+$/i, '');
  const e = c?.[id];
  if (!e) return null;
  try { return new URL(e.page).hostname.replace(/^www\./, ''); } catch { return e.artist && e.artist !== 'unknown' ? String(e.artist) : null; }
};
/** largest size with the photo's own aspect that fits the box (small photos are scaled up, never cropped) */
export const photoFit = (d: {w: number; h: number} | null, boxW: number, boxH: number) => {
  const k = d ? Math.min(boxW / d.w, boxH / d.h) : Math.min(boxW / 16, boxH / 10);
  return d ? {w: d.w * k, h: d.h * k} : {w: 16 * k, h: 10 * k};
};
/** SVG group centred on (0,0). Frame = photo + border, perforated like a stamp. */
export const StampPhoto: React.FC<{src: string; boxW: number; boxH: number; border?: number; r?: number; pitch?: number; shadow?: boolean}> = ({src, boxW, boxH, border = 22, r = 10.5, pitch = 44, shadow = true}) => {
  const d = usePhotoDims(src);
  const {w, h} = photoFit(d, boxW, boxH);
  const W = w + 2 * border, H = h + 2 * border;
  const id = 'stamp' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const nx = Math.max(3, Math.round(W / pitch)), ny = Math.max(3, Math.round(H / pitch));
  const holes: React.ReactNode[] = [];
  for (let i = 0; i < nx; i++) { const x = -W / 2 + ((i + 0.5) * W) / nx; holes.push(<circle key={`t${i}`} cx={x} cy={-H / 2} r={r} fill="#000" />, <circle key={`b${i}`} cx={x} cy={H / 2} r={r} fill="#000" />); }
  for (let j = 0; j < ny; j++) { const y = -H / 2 + ((j + 0.5) * H) / ny; holes.push(<circle key={`l${j}`} cx={-W / 2} cy={y} r={r} fill="#000" />, <circle key={`r${j}`} cx={W / 2} cy={y} r={r} fill="#000" />); }
  return (
    <g style={{filter: shadow ? 'drop-shadow(0 16px 26px rgba(0,0,0,.45))' : undefined}}>
      <mask id={id} maskUnits="userSpaceOnUse" x={-W / 2 - r} y={-H / 2 - r} width={W + 2 * r} height={H + 2 * r}>
        <rect x={-W / 2 - r} y={-H / 2 - r} width={W + 2 * r} height={H + 2 * r} fill="#fff" />
        {holes}
      </mask>
      <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="#fbfaf4" mask={`url(#${id})`} />
      <image href={staticFile(src)} x={-w / 2} y={-h / 2} width={w} height={h} preserveAspectRatio="xMidYMid slice" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke="rgba(0,0,0,.16)" strokeWidth={2} />
    </g>
  );
};
const PhotoProp: React.FC<{p: PropT}> = ({p}) => {
  const bw = p.w ?? 360, bh = p.h ?? 460, src = p.src ?? '';
  const d = usePhotoDims(src);
  const {h} = photoFit(d, bw, bh);
  const H = h + 2 * 14, top = -92 - H;
  return (
    <g {...OL}><Shadow w={bw / 2 + 30} />
      <path d={`M${-bw / 4} ${top + H} L${-bw / 3} 0 M${bw / 4} ${top + H} L${bw / 3} 0`} stroke="#6b4a2a" strokeWidth={10} fill="none" />
      {src ? <g transform={`translate(0 ${top + H / 2})`} stroke="none"><StampPhoto src={src} boxW={bw} boxH={bh} border={14} r={7} pitch={30} shadow={false} /></g>
        : <text y={-bh / 2 - 80} textAnchor="middle" fontFamily={HAND} fontSize={40} fill="#6b5a45" stroke="none">photo</text>}
      {p.t && <g><rect x={-bw / 2 - 6} y={-86} width={bw + 12} height={46} rx={10} fill="#fffaf0" /><text y={-52} textAnchor="middle" fontFamily={HAND} fontSize={32} fill={INK} stroke="none">{p.t}</text></g>}
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
    case 'horse': {
      const gal = p.t !== 'stand', w = f / 3.2, coat = p.c ?? '#8a5a33', bob = gal ? -Math.abs(Math.sin(w)) * 9 : Math.sin(f / 14) * 1.5;
      const leg = (x: number, off: number) => { const s = gal ? Math.sin(w + off) : 0, a = s * 34, k = gal ? Math.max(0, Math.sin(w + off + 1.2)) * 46 : 0, kn = P(x, -112, 54, a), ft = P(kn[0], kn[1], 54, a - k); const d = `M${x} -112 L${kn[0]} ${kn[1]} L${ft[0]} ${ft[1]}`; return (<g><path d={d} stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={d} stroke={coat} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" /><rect x={ft[0] - 8} y={ft[1] - 6} width={16} height={10} rx={3} fill="#3a2a1a" stroke={INK} strokeWidth={2} /></g>); };
      const tail = Math.sin(w * 0.9) * 14;
      return (
        <g {...OL}><Shadow w={140} />
          {leg(-60, 3.0)}{leg(52, 0.6)}
          {p.rider && <Actor a={{look: p.rider, x: -6, y: -122 + bob, s: 0.5, pose: p.held === 'spear' || p.held === 'sword' ? 'point' : 'idle', face: 'angry', held: p.held, ns: true}} seed={`${seed}rd`} />}
          <g transform={`translate(0 ${bob})`}>
            <path d={`M-96 -150 Q${-150 - tail} ${-140} ${-138 - tail} ${-70}`} fill="none" stroke={INK} strokeWidth={20} strokeLinecap="round" /><path d={`M-96 -150 Q${-150 - tail} ${-140} ${-138 - tail} ${-70}`} fill="none" stroke={mix(coat, -0.4)} strokeWidth={13} strokeLinecap="round" />
            <ellipse cx={0} cy={-150} rx={108} ry={50} fill={coat} />
            <path d="M70 -170 Q112 -240 150 -240 L186 -212 L160 -184 Q134 -190 108 -124Z" fill={coat} />
            <path d="M74 -176 Q94 -236 126 -240 Q108 -206 92 -158Z" fill={mix(coat, -0.4)} />
            <path d="M138 -240 L146 -266 L158 -240Z" fill={coat} /><circle cx={158} cy={-214} r={5} fill={INK} /><path d="M178 -204 q8 6 4 14" fill="none" strokeWidth={2.5} />
            <path d="M-56 -184 Q0 -202 62 -184 L62 -150 Q0 -166 -56 -150Z" fill={p.c2 ?? '#a8242c'} /><path d="M-56 -184 Q0 -202 62 -184" fill="none" stroke="#e2b84a" strokeWidth={5} />
          </g>
          {leg(-72, 2.4)}{leg(40, 0)}
        </g>
      );
    }
    case 'catapult': {
      const per = 84, ph = f % per, fire = p.t === 'fire', lerp = (a: number, b: number, u: number) => a + (b - a) * Math.min(1, Math.max(0, u));
      const th = fire ? (ph < 9 ? lerp(-120, 40, ph / 9) : ph < 24 ? lerp(40, 14, (ph - 9) / 15) : lerp(14, -120, (ph - 24) / 58)) : -120;
      const pv: [number, number] = [0, -140], tip = P(pv[0], pv[1], 0, 0), L = 190, tx = pv[0] + L * Math.sin(rad(th)), ty = pv[1] - L * Math.cos(rad(th));
      const u = fire ? (ph - 9) / 52 : -1, sx = tx + 1000 * u, sy = ty - 640 * u + 820 * u * u;
      return (
        <g {...OL}><Shadow w={170} />
          {[-84, 84].map((x, i) => <g key={i}><circle cx={x} cy={-34} r={34} fill="#6b4a2a" /><circle cx={x} cy={-34} r={9} fill="#3a2a1a" />{[0, 60, 120].map((a) => <path key={a} d={`M${x} -34 L${x + 34 * Math.sin(rad(a))} ${-34 + 34 * Math.cos(rad(a))} M${x} -34 L${x - 34 * Math.sin(rad(a))} ${-34 - 34 * Math.cos(rad(a))}`} strokeWidth={4} />)}</g>)}
          <path d="M-130 -58 L130 -58 L110 -90 L-110 -90Z" fill="#8a5a33" />
          <path d="M-60 -90 L-24 -150 L-10 -150 L-34 -90Z M60 -90 L24 -150 L10 -150 L34 -90Z" fill="#a8693a" /><rect x={-34} y={-156} width={68} height={16} rx={6} fill="#6b4a2a" />
          <path d={`M${pv[0] - 0.35 * L * Math.sin(rad(th))} ${pv[1] + 0.35 * L * Math.cos(rad(th))} L${tx} ${ty}`} stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d={`M${pv[0] - 0.35 * L * Math.sin(rad(th))} ${pv[1] + 0.35 * L * Math.cos(rad(th))} L${tx} ${ty}`} stroke="#a8693a" strokeWidth={14} strokeLinecap="round" />
          <circle cx={tx} cy={ty} r={20} fill="#6b4a2a" />
          {(!fire || ph < 10) && <circle cx={tx} cy={ty - 22} r={20} fill="#9a9a9a" />}
          {fire && ph >= 10 && ph < 70 && <g><circle cx={sx} cy={sy} r={20} fill="#9a9a9a" /></g>}
        </g>
      );
    }
    case 'ram': {
      const hit = p.t === 'hit', sw = hit ? Math.sin(f / 5) * 70 : Math.sin(f / 20) * 10;
      return (
        <g {...OL}><Shadow w={210} />
          {[-120, -40, 40, 120].map((x, i) => <g key={i}><circle cx={x} cy={-28} r={28} fill="#6b4a2a" /><circle cx={x} cy={-28} r={7} fill="#3a2a1a" /></g>)}
          <rect x={-170} y={-58} width={340} height={22} fill="#8a5a33" />
          {[-150, -70, 70, 150].map((x, i) => <rect key={i} x={x - 7} y={-190} width={14} height={134} fill="#6b4a2a" />)}
          <path d="M-190 -184 L0 -270 L190 -184 L190 -150 L-190 -150Z" fill="#9a7650" />
          {[-130, -70, -10, 50, 110].map((x, i) => <path key={i} d={`M${x} -246 L${x + 20} -156`} stroke="#6b4a2a" strokeWidth={3} fill="none" />)}
          <path d="M-190 -150 H190" stroke="#c4a24a" strokeWidth={6} />
          <g transform={`translate(${sw} 0)`}><path d="M-110 -150 L-90 -112 M110 -150 L90 -112" stroke={INK} strokeWidth={4} fill="none" /><rect x={-170} y={-122} width={330} height={34} rx={17} fill="#6b4a2a" /><path d="M160 -124 L222 -105 L160 -86Z" fill="#7f8794" /><path d="M-120 -122 V-88 M-40 -122 V-88 M40 -122 V-88 M120 -122 V-88" stroke="#7f8794" strokeWidth={5} /></g>
        </g>
      );
    }
    case 'siegetower': {
      const down = p.t === 'down', sway = Math.sin(f / 22) * 1.2;
      return (
        <g {...OL} transform={`rotate(${sway} 0 0)`}><Shadow w={130} />
          {[-64, 64].map((x, i) => <g key={i}><circle cx={x} cy={-34} r={34} fill="#6b4a2a" /><circle cx={x} cy={-34} r={8} fill="#3a2a1a" /></g>)}
          <rect x={-96} y={-470} width={192} height={440} fill="#9a7650" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={`M-96 ${-440 + i * 52} H96`} stroke="#6b4a2a" strokeWidth={4} />)}
          {[-70, 0, 70].map((x, i) => <path key={i} d={`M${x} -470 V-30`} stroke="#6b4a2a" strokeWidth={3} opacity={0.6} />)}
          <path d="M-96 -250 L96 -250 M-96 -360 L96 -360" stroke="#c4a24a" strokeWidth={7} />
          {[-300, -190, -80].map((y, i) => <rect key={i} x={20} y={y} width={50} height={14} fill="#2a2018" />)}
          {[-110, -66, -22, 22, 66, 100].map((x, i) => <rect key={i} x={x - 14} y={-508} width={28} height={40} fill="#9a7650" />)}
          <rect x={-100} y={-476} width={200} height={14} fill="#6b4a2a" />
          <rect x={-5} y={-570} width={10} height={90} fill="#6b4a2a" /><path d="M5 -566 L66 -548 L5 -526Z" fill="#b3202a" />
          {down ? <path d="M96 -440 L206 -380 L206 -362 L96 -420Z" fill="#8a5a33" /> : <rect x={96} y={-440} width={16} height={120} fill="#8a5a33" />}
        </g>
      );
    }
    case 'ballista': {
      const per = 70, ph = f % per, fire = p.t === 'fire', pull = fire ? (ph < 40 ? ph / 40 : ph < 46 ? 1 - (ph - 40) / 6 : 0) : 1, bolt = fire && ph >= 42 ? (ph - 42) * 46 : 0;
      return (
        <g {...OL}><Shadow w={120} />
          {[-60, 60].map((x, i) => <g key={i}><circle cx={x} cy={-26} r={26} fill="#6b4a2a" /><circle cx={x} cy={-26} r={6} fill="#3a2a1a" /></g>)}
          <path d="M-90 -50 L110 -50 L90 -84 L-70 -84Z" fill="#8a5a33" /><rect x={-60} y={-104} width={160} height={20} fill="#a8693a" />
          <path d={`M-10 -130 Q${-70 * (0.4 + pull * 0.6)} -170 ${-50 * (0.4 + pull * 0.6)} -250 M-10 -130 Q${-70 * (0.4 + pull * 0.6)} -90 ${-50 * (0.4 + pull * 0.6)} -10`} fill="none" stroke={INK} strokeWidth={16} /><path d={`M-10 -130 Q${-70 * (0.4 + pull * 0.6)} -170 ${-50 * (0.4 + pull * 0.6)} -250`} fill="none" stroke="#a8693a" strokeWidth={9} />
          <path d={`M${-50 * (0.4 + pull * 0.6)} -250 L${-80 * pull + 40} -128 L${-50 * (0.4 + pull * 0.6)} -6`} fill="none" strokeWidth={3} />
          <g transform={`translate(${bolt} 0)`}><path d={`M${-80 * pull + 40} -128 L${120} -128`} stroke={INK} strokeWidth={6} /><path d={`M${-80 * pull + 40} -128 L${120} -128`} stroke="#8a5a33" strokeWidth={3} /><path d="M120 -136 L152 -128 L120 -120Z" fill="#dfe5ec" /></g>
        </g>
      );
    }
    case 'gate': {
      const open = p.t === 'open', n = 1;
      return (
        <g {...OL}><Shadow w={230} />
          {[-190, 190].map((x, i) => <g key={i}><rect x={x - 70} y={-420} width={140} height={420} fill="#bdb6a6" />{[-60, -20, 20, 60].map((o, j) => <rect key={j} x={x + o - 14} y={-458} width={28} height={40} fill="#bdb6a6" />)}<rect x={x - 12} y={-330} width={24} height={50} rx={12} fill="#2a2018" /></g>)}
          <rect x={-130} y={-320} width={260} height={320} fill="#bdb6a6" />{[-110, -66, -22, 22, 66, 110].map((x, i) => <rect key={i} x={x - 16} y={-358} width={32} height={40} fill="#bdb6a6" />)}
          <path d="M-96 0 V-190 Q-96 -270 0 -270 Q96 -270 96 -190 V0Z" fill={open ? '#1b1410' : '#6b4a2a'} />
          {!open && <g stroke="#3a2a1a" strokeWidth={6}><path d="M0 -270 V0 M-96 -150 H96 M-96 -60 H96" /><circle cx={-24} cy={-100} r={8} fill="#c4a24a" /><circle cx={24} cy={-100} r={8} fill="#c4a24a" /></g>}
          {open && <g stroke="#6b6f78" strokeWidth={6}>{[-72, -36, 0, 36, 72].map((x, i) => <path key={i} d={`M${x} -270 V-${210 + (i % 2) * 6}`} />)}<path d="M-92 -250 H92" /></g>}
        </g>
      );
    }
    case 'longship': {
      const bob = Math.sin(f / 16 + p.x) * 7, ro = Math.sin(f / 7) * 18, sail = p.c ?? '#b3202a';
      return (
        <g {...OL} transform={`translate(0 ${bob})`}>
          <path d="M-230 -90 Q-250 -150 -226 -190 Q-200 -170 -196 -120 L190 -110 Q236 -112 270 -176 Q286 -138 252 -70 Q200 -20 120 0 L-150 6 Q-210 -14 -230 -90Z" fill="#6e4325" />
          <path d="M-196 -120 L190 -110 L196 -86 L-200 -92Z" fill="#a8693a" />
          <path d="M-230 -90 Q-262 -150 -240 -214 L-216 -208 Q-236 -166 -214 -128Z" fill="#8a5a33" /><path d="M-232 -204 Q-262 -222 -246 -246 Q-216 -236 -218 -206Z" fill="#8a5a33" /><circle cx={-238} cy={-224} r={4} fill={INK} />
          {Array.from({length: 9}, (_, i) => <circle key={i} cx={-160 + i * 44} cy={-100} r={15} fill={i % 2 ? '#e2b84a' : '#b3202a'} />)}
          {Array.from({length: 6}, (_, i) => <path key={i} d={`M${-120 + i * 54} -76 L${-140 + i * 54 + ro} -6`} stroke={INK} strokeWidth={6} fill="none" />)}
          <rect x={-6} y={-380} width={12} height={290} fill="#8a5a33" />
          <path d="M-110 -370 H110 L96 -180 H-96Z" fill={sail} />{[-60, 0, 60].map((x, i) => <path key={i} d={`M${x} -370 V-180`} stroke="#f4f1e6" strokeWidth={10} />)}<path d="M-110 -370 H110" stroke="#e2b84a" strokeWidth={8} />
        </g>
      );
    }
    case 'fleet': {
      const n = Math.min(p.n ?? 4, 8);
      return (<g>{Array.from({length: n}, (_, i) => { const k = 1 - (i / Math.max(1, n)) * 0.45; return (<g key={i} transform={`translate(${(i - (n - 1) / 2) * 250 * (p.flip ? -1 : 1)} ${-i * 22}) scale(${k})`}><PropArt p={{k: p.ship ?? 'galley', x: i * 37, y: 0, c: p.c}} f={f + i * 9} seed={`${seed}f${i}`} /></g>); }).reverse()}</g>);
    }
    case 'photo': return <PhotoProp p={p} />;
    case 'pyramid': {
      const step = p.t === 'step', col = p.c ?? '#e3c88b', W = 300, H = step ? 300 : 330;
      return (
        <g {...OL}><Shadow w={W + 40} />
          {step ? <g>{[0, 1, 2, 3, 4, 5].map((i) => { const w = W - i * 46, y = -(i + 1) * 50; return <rect key={i} x={-w} y={y} width={w * 2} height={50} fill={i % 2 ? col : mix(col, -0.05)} />; })}</g>
            : <g><path d={`M${-W} 0 L0 ${-H} L${W} 0Z`} fill={col} /><path d={`M0 ${-H} L${W} 0 L${W * 0.28} 0 L0 ${-H * 0.55}Z`} fill={mix(col, -0.2)} stroke="none" /><path d={`M0 ${-H} L${W} 0 L${-W} 0Z`} fill="none" /><path d={`M-24 ${-H + 62} L0 ${-H} L24 ${-H + 62}Z`} fill="#e2b84a" />
              {[1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${-W + i * 38} ${-i * (H / 7.2)} H${W - i * 38}`} stroke={INK} strokeWidth={1.5} opacity={0.25} fill="none" />)}</g>}
        </g>
      );
    }
    case 'sphinx': {
      return (
        <g {...OL}><Shadow w={250} />
          <path d="M-210 0 L-210 -92 Q-206 -128 -150 -134 L20 -134 Q56 -134 64 -108 L70 -70 L210 -70 Q232 -70 232 -44 L232 0Z" fill="#dcc185" />
          <path d="M-150 -134 Q-170 -100 -170 -60 Q-170 -20 -150 0" fill="none" stroke="#b8a066" strokeWidth={8} />
          <path d="M60 -110 L44 -70 L206 -70 L206 -84 L84 -84Z" fill="#cdb176" /><rect x={150} y={-76} width={86} height={76} rx={14} fill="#cdb176" /><rect x={112} y={-48} width={86} height={48} rx={10} fill="#d4b97c" />
          <path d="M30 -134 L40 -258 Q60 -300 104 -300 Q148 -300 160 -250 L170 -140 L132 -122 L100 -124 L62 -122Z" fill="#c9a96d" />
          <path d="M26 -140 L26 -250 Q36 -304 104 -312 Q170 -304 178 -250 L178 -140 L158 -150 L152 -240 L58 -240 L50 -150Z" fill="#2b5fb4" />{[0, 1, 2, 3].map((i) => <path key={i} d={`M32 ${-170 - i * 22} H${70}`} stroke="#e2b84a" strokeWidth={4} />)}
          <ellipse cx={104} cy={-206} rx={44} ry={52} fill="#d4b97c" /><circle cx={88} cy={-216} r={5.5} fill={INK} /><circle cx={120} cy={-216} r={5.5} fill={INK} /><path d="M104 -212 L98 -194 L108 -192" fill="none" strokeWidth={3} /><path d="M92 -178 Q104 -170 116 -178" fill="none" strokeWidth={3.5} />
          <path d="M104 -170 Q100 -130 104 -100" fill="none" strokeWidth={8} stroke="#2b5fb4" />
        </g>
      );
    }
    case 'obelisk': return (<g {...OL}><Shadow w={60} /><path d="M-34 0 L-26 -330 L0 -372 L26 -330 L34 0Z" fill="#c9a98a" /><path d="M0 -372 L26 -330 L34 0 L8 0 L6 -330Z" fill="#b8987a" stroke="none" /><path d="M-26 -330 L0 -372 L26 -330Z" fill="#e2b84a" />{[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M-12 ${-60 - i * 44} h24 M-8 ${-48 - i * 44} h16`} stroke={INK} strokeWidth={3} opacity={0.5} />)}<rect x={-46} y={-16} width={92} height={16} fill="#b8987a" /></g>);
    case 'palm': { const sw = Math.sin(f / 26 + p.x) * 4; return (<g {...OL}><Shadow w={50} /><path d={`M-10 0 Q${-18 + sw} -120 ${-4 + sw} -250 L${10 + sw} -250 Q${-2 + sw} -120 10 0Z`} fill="#8a6a44" />{[-150, -110, -70, -30, 10, 50, 100, 140].map((a, i) => <path key={i} d={`M${sw} -250 Q${Math.sin(rad(a)) * 70 + sw} ${-300 + Math.abs(a) * 0.1} ${Math.sin(rad(a)) * 130 + sw} ${-250 + Math.abs(a) * 0.35}`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />)}{[-150, -110, -70, -30, 10, 50, 100, 140].map((a, i) => <path key={i} d={`M${sw} -250 Q${Math.sin(rad(a)) * 70 + sw} ${-300 + Math.abs(a) * 0.1} ${Math.sin(rad(a)) * 130 + sw} ${-250 + Math.abs(a) * 0.35}`} stroke="#4f9a4a" strokeWidth={9} fill="none" strokeLinecap="round" />)}<circle cx={sw - 6} cy={-244} r={6} fill="#7a4a22" /><circle cx={sw + 8} cy={-240} r={6} fill="#7a4a22" /></g>); }
    case 'reeds': { return (<g {...OL}>{Array.from({length: p.n ?? 9}, (_, i) => { const x = (i - 4) * 16 + (random(`${seed}r${i}`) - 0.5) * 10, h = 120 + random(`${seed}rh${i}`) * 90, sw = Math.sin(f / 22 + i) * 5; return (<g key={i}><path d={`M${x} 0 Q${x + sw} ${-h * 0.6} ${x + sw * 1.6} ${-h}`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" /><path d={`M${x} 0 Q${x + sw} ${-h * 0.6} ${x + sw * 1.6} ${-h}`} stroke="#6fae4a" strokeWidth={4.5} fill="none" strokeLinecap="round" />{i % 3 === 0 && <ellipse cx={x + sw * 1.6} cy={-h - 12} rx={9} ry={16} fill="#8a6a44" />}</g>); })}</g>); }
    case 'nileboat': {
      const kind = p.t ?? 'royal', bob = Math.sin(f / 18 + p.x) * 5, ro = Math.sin(f / 9) * 14;
      if (kind === 'reed') return (<g {...OL} transform={`translate(0 ${bob})`}><path d="M-150 -70 Q-120 -110 -92 -96 Q0 -30 92 -96 Q120 -110 150 -70 Q60 8 0 8 Q-60 8 -150 -70Z" fill="#c9b26a" />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-100 + i * 50} -50 L${-90 + i * 50} -6`} stroke={INK} strokeWidth={2.5} opacity={0.5} />)}<path d="M-96 -92 Q0 -30 96 -92" fill="none" stroke="#8a6a3a" strokeWidth={6} /></g>);
      if (kind === 'felucca') return (<g {...OL} transform={`translate(0 ${bob})`}><path d="M-170 -50 L-150 0 L130 0 L180 -60 Q0 -38 -170 -50Z" fill="#8a5a33" /><rect x={-6} y={-330} width={10} height={290} fill="#6b4a2a" /><path d="M0 -330 L-150 -76 L150 -64Z" fill="#f1ece0" /><path d="M0 -330 L-150 -76" stroke="#6b4a2a" strokeWidth={6} /></g>);
      return (
        <g {...OL} transform={`translate(0 ${bob})`}>
          <path d="M-260 -100 Q-290 -170 -250 -210 Q-236 -150 -214 -118 L-186 -40 Q-170 6 -120 6 L150 6 Q226 -6 240 -80 Q290 -170 250 -210 Q262 -90 232 -48" fill="none" strokeWidth={0} />
          <path d="M-262 -96 Q-292 -180 -246 -214 Q-232 -150 -206 -120 L220 -104 Q238 -150 264 -214 Q300 -176 262 -96 Q220 8 130 6 L-130 6 Q-226 6 -262 -96Z" fill="#c4a24a" />
          <path d="M-206 -120 L220 -104 L226 -78 L-212 -92Z" fill="#2b5fb4" />{Array.from({length: 12}, (_, i) => <rect key={i} x={-190 + i * 34} y={-118 + i * 1.3} width={14} height={22} fill="#e2b84a" stroke="none" />)}
          <rect x={-90} y={-232} width={150} height={118} fill="#f1ece0" /><rect x={-100} y={-244} width={170} height={14} fill="#c0392b" />{[-70, -30, 10, 50].map((x, i) => <rect key={i} x={x} y={-228} width={8} height={112} fill="#c4a24a" />)}
          {Array.from({length: 7}, (_, i) => <path key={i} d={`M${-170 + i * 52} -70 L${-190 + i * 52 + ro} 24`} stroke={INK} strokeWidth={6} fill="none" />)}
        </g>
      );
    }
    case 'chariot': {
      const w = f / 3.2, spin = (f * 14) % 360;
      return (
        <g {...OL}>
          <g><circle cx={-250} cy={-44} r={44} fill="#8a5a33" /><circle cx={-250} cy={-44} r={9} fill="#3a2a1a" />{[0, 45, 90, 135].map((a) => <path key={a} d={`M${-250 + 44 * Math.cos(rad(a + spin))} ${-44 + 44 * Math.sin(rad(a + spin))} L${-250 - 44 * Math.cos(rad(a + spin))} ${-44 - 44 * Math.sin(rad(a + spin))}`} strokeWidth={4} />)}</g>
          <path d="M-310 -118 L-200 -118 L-188 -50 L-300 -50Z" fill="#e2b84a" /><path d="M-310 -118 Q-312 -158 -296 -168 L-200 -168 L-200 -118" fill="#c4a24a" />
          {p.rider !== undefined && <Actor a={{look: p.rider, x: -262, y: -116, s: 0.36, pose: 'idle', face: 'angry', ns: true, held: p.held}} seed={`${seed}c1`} />}
          <Actor a={{look: p.rider2 ?? 'pharaoh_war', x: -226, y: -116, s: 0.36, pose: 'point', face: 'angry', ns: true, held: 'bow'}} seed={`${seed}c2`} />
          <path d="M-196 -100 L40 -140" stroke={INK} strokeWidth={8} fill="none" /><path d="M-196 -100 L40 -140" stroke="#8a5a33" strokeWidth={4} fill="none" />
          <PropArt p={{k: 'horse', x: 0, y: 0, c: p.c ?? '#7a5a3a', c2: p.c2 ?? '#2b5fb4'}} f={f} seed={`${seed}h`} />
        </g>
      );
    }
    case 'sarcophagus': return (<g {...OL}><Shadow w={70} /><path d="M-52 0 L-60 -150 Q-60 -250 -34 -300 Q0 -340 34 -300 Q60 -250 60 -150 L52 0Z" fill="#e2b84a" /><path d="M-34 -300 Q0 -340 34 -300 Q36 -236 0 -214 Q-36 -236 -34 -300Z" fill="#2b5fb4" opacity={0.0} /><ellipse cx={0} cy={-272} rx={28} ry={34} fill="#d4a24a" /><path d="M-38 -296 Q0 -330 38 -296 L40 -240 L28 -250 L28 -290 L-28 -290 L-28 -250 L-40 -240Z" fill="#2b5fb4" /><circle cx={-10} cy={-274} r={4} fill={INK} stroke="none" /><circle cx={10} cy={-274} r={4} fill={INK} stroke="none" /><path d="M-44 -190 Q0 -170 44 -190 M-46 -160 Q0 -140 46 -160 M-48 -130 Q0 -110 48 -130" fill="none" stroke="#2b5fb4" strokeWidth={7} />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-18 ${-100 + i * 18} h36`} stroke={INK} strokeWidth={2.5} opacity={0.5} />)}</g>);
    case 'pylon': return (<g {...OL}><Shadow w={300} />{[-170, 170].map((x, i) => <g key={i}><path d={`M${x - 120} 0 L${x - 96} -420 L${x + 96} -420 L${x + 120} 0Z`} fill="#d9c08a" /><path d={`M${x + (i ? 40 : 10)} -420 L${x + 120} 0 L${x + 70} 0Z`} fill="#c4aa72" stroke="none" /><rect x={x - 100} y={-444} width={200} height={28} fill="#c9b07a" /><Glyphs x={x} y={-330} n={3} rows={4} /><rect x={x - 3} y={-640} width={6} height={200} fill="#8a5a33" /><path d={`M${x + 3} -636 L${x + 44} -620 L${x + 3} -596Z`} fill={i ? '#2b5fb4' : '#c0392b'} /></g>)}<path d="M-58 0 L-58 -250 L58 -250 L58 0Z" fill="#1b1410" /><path d="M-70 -250 H70" stroke="#c9b07a" strokeWidth={14} /><path d="M-100 -330 H100 L90 -300 H-90Z" fill="#c9b07a" /><circle cx={0} cy={-348} r={16} fill="#e2b84a" /></g>);
    case 'glyphs': return (<g {...OL}><rect x={-(p.w ?? 360) / 2} y={-(p.h ?? 420)} width={p.w ?? 360} height={p.h ?? 420} fill={p.c ?? '#d9c08a'} /><Glyphs x={0} y={-(p.h ?? 420) / 2} n={Math.max(2, Math.round((p.w ?? 360) / 90))} rows={Math.max(2, Math.round((p.h ?? 420) / 90))} /></g>);
    case 'goldmask': return (<g {...OL}><Shadow w={90} /><path d="M-70 0 L-74 -120 Q-80 -200 -62 -260 L62 -260 Q80 -200 74 -120 L70 0Z" fill="#2b5fb4" />{[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M-72 ${-30 - i * 36} H72`} stroke="#e2b84a" strokeWidth={9} />)}<path d="M-62 -230 Q-68 -330 0 -350 Q68 -330 62 -230 Q40 -140 0 -130 Q-40 -140 -62 -230Z" fill="#e2b84a" /><path d="M-70 -260 Q-84 -340 -48 -352 L-48 -250Z M70 -260 Q84 -340 48 -352 L48 -250Z" fill="#2b5fb4" /><ellipse cx={-22} cy={-262} rx={14} ry={10} fill="#fff" /><ellipse cx={22} cy={-262} rx={14} ry={10} fill="#fff" /><circle cx={-22} cy={-262} r={5} fill={INK} stroke="none" /><circle cx={22} cy={-262} r={5} fill={INK} stroke="none" /><path d="M-34 -276 H-10 M10 -276 H34" strokeWidth={5} /><path d="M0 -258 L-6 -222 L6 -222Z" fill="#d4a24a" /><path d="M-14 -190 Q0 -184 14 -190" fill="none" strokeWidth={4} /><path d="M-10 -130 L-14 -60 L14 -60 L10 -130Z" fill="#2b5fb4" /></g>);
    case 'scales': return (<g {...OL}><Shadow w={160} /><rect x={-8} y={-340} width={16} height={340} fill="#c4a24a" /><rect x={-40} y={-14} width={80} height={14} fill="#c4a24a" /><path d="M-170 -332 H170" stroke={INK} strokeWidth={12} /><path d="M-170 -332 H170" stroke="#e2b84a" strokeWidth={6} />{[-170, 170].map((x, i) => <g key={i}><path d={`M${x} -332 L${x - 46} -220 M${x} -332 L${x + 46} -220`} strokeWidth={3} fill="none" /><path d={`M${x - 56} -220 H${x + 56} Q${x + 46} -176 ${x} -170 Q${x - 46} -176 ${x - 56} -220Z`} fill="#e2b84a" /></g>)}<path d="M-170 -232 Q-190 -262 -170 -282 Q-150 -262 -170 -232Z" fill="#c0392b" /><path d="M170 -232 Q166 -330 178 -366 Q196 -330 182 -232Z" fill="#f4f1e6" /><path d="M178 -236 V-362" stroke={INK} strokeWidth={2.5} /></g>);
    case 'rosetta': return (<g {...OL}><Shadow w={120} /><path d="M-96 0 L-92 -240 Q-86 -312 -40 -332 Q0 -340 40 -330 Q86 -310 92 -240 L96 0Z" fill="#4a4a52" /><path d="M-86 -168 H86 M-84 -112 H84" stroke="#9a9aa4" strokeWidth={3} />{Array.from({length: 4}, (_, r) => <g key={r}>{Array.from({length: 7}, (_, c) => <rect key={c} x={-72 + c * 21} y={-290 + r * 15} width={14} height={7} fill="#9a9aa4" stroke="none" />)}</g>)}{Array.from({length: 4}, (_, r) => <path key={r} d={`M-76 ${-156 + r * 11} H${76 - (r % 2) * 20}`} stroke="#9a9aa4" strokeWidth={3} strokeLinecap="round" />)}{Array.from({length: 4}, (_, r) => <path key={r} d={`M-76 ${-98 + r * 12} H${70 - (r % 2) * 14}`} stroke="#9a9aa4" strokeWidth={3} strokeLinecap="round" />)}</g>);
    case 'lighthouse': { const fl = f * 0.8; return (<g {...OL}><Shadow w={120} /><path d="M-90 0 L-70 -200 L70 -200 L90 0Z" fill="#e8e0cc" /><path d="M-62 -200 L-48 -380 L48 -380 L62 -200Z" fill="#dcd2b8" /><path d="M-40 -380 L-30 -480 L30 -480 L40 -380Z" fill="#e8e0cc" /><rect x={-44} y={-500} width={88} height={22} fill="#c9b99a" />{[-70, -30, 20].map((x, i) => <rect key={i} x={x} y={-150 - i * 4} width={22} height={44} rx={10} fill="#3a3326" />)}<g transform="translate(0 -520) scale(0.8)"><Flame f={f} k={5} w={60} h={120} /></g><path d={`M0 -540 L${400} ${-560 + Math.sin(rad(fl)) * 40} L${400} ${-500 + Math.sin(rad(fl)) * 40}Z`} fill="#ffe9a0" opacity={0.22} stroke="none" /></g>); }
    case 'mudbrick': return (<g {...OL}><Shadow w={150} /><path d="M-130 0 L-124 -150 L124 -150 L130 0Z" fill="#d1b078" /><rect x={-134} y={-168} width={268} height={22} fill="#c29d62" />{[0, 1, 2].map((r) => <path key={r} d={`M-126 ${-120 + r * 40} H126`} stroke={INK} strokeWidth={1.8} opacity={0.3} />)}<path d="M-30 0 L-30 -90 Q0 -112 30 -90 L30 0Z" fill="#3a2a1a" /><rect x={74} y={-120} width={34} height={32} fill="#3a2a1a" /><path d="M96 -168 L140 -250 M118 -168 L162 -250" stroke="#6b4a2a" strokeWidth={6} /><path d="M104 -190 H152 M120 -218 H160" stroke="#6b4a2a" strokeWidth={5} /></g>);
    case 'shaduf': { const sw = Math.sin(f / 30) * 10; return (<g {...OL}><Shadow w={100} /><rect x={-60} y={-180} width={18} height={180} fill="#a88a5a" /><rect x={42} y={-180} width={18} height={180} fill="#a88a5a" /><g transform={`rotate(${sw} 0 -190)`}><path d="M-150 -170 L150 -210" stroke={INK} strokeWidth={14} /><path d="M-150 -170 L150 -210" stroke="#8a5a33" strokeWidth={8} /><circle cx={-160} cy={-170} r={22} fill="#7a6a5a" /><path d="M140 -208 V-120" stroke={INK} strokeWidth={3} /><path d="M120 -120 H160 L152 -78 H128Z" fill="#b7733a" /></g></g>); }
    case 'camel': { const w = f / 5, bob = Math.sin(w * 2) * 3; const leg = (x: number, off: number) => { const a = Math.sin(w + off) * 22; return (<path d={`M${x} -90 L${x + Math.sin(rad(a)) * 40} -45 L${x + Math.sin(rad(a * 0.4)) * 52} 0`} stroke="#b88a52" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />); };
      return (<g {...OL}><Shadow w={140} />{leg(-70, 0)}{leg(60, 1.6)}<g transform={`translate(0 ${bob})`}><path d="M-100 -110 Q-110 -190 -52 -196 Q-30 -240 0 -200 Q10 -240 40 -200 Q100 -186 110 -120 Q60 -78 -100 -110Z" fill="#c79a5c" /><path d="M100 -140 Q140 -180 150 -250 Q150 -290 180 -290 L206 -280 Q214 -262 192 -256 L176 -236 Q168 -170 130 -120Z" fill="#c79a5c" /><circle cx={178} cy={-276} r={4} fill={INK} stroke="none" /><path d="M-44 -170 H44 L40 -150 H-40Z" fill="#c0392b" /></g>{leg(-52, 3.2)}{leg(78, 4.8)}</g>); }
    case 'caravel': { const bob = Math.sin(f / 18 + p.x) * 6, ro = Math.sin(f / 22) * 2.2; return (<g {...OL} transform={`translate(0 ${bob}) rotate(${ro})`}><path d="M-150 -70 L150 -66 L116 6 L-110 8Z" fill="#7a4a2a" /><path d="M-150 -70 L150 -66 L146 -50 L-146 -52Z" fill="#a8693a" /><path d="M-150 -70 L-176 -116 L-118 -70Z" fill="#6e4325" /><rect x={-146} y={-112} width={52} height={44} fill="#8a5a33" /><rect x={-4} y={-310} width={8} height={246} fill="#8a5a33" /><path d="M-4 -304 L-156 -88 L-4 -96Z" fill="#f6f1e4" /><path d="M4 -256 L124 -88 L4 -92Z" fill="#fffaf0" /><path d="M-66 -190 V-132 M-92 -160 H-40" stroke="#c0392b" strokeWidth={9} fill="none" /><path d="M0 -310 l44 10 l-44 10Z" fill="#c0392b" /></g>); }
    case 'galleon': {
      const bob = Math.sin(f / 20 + p.x) * 6, ro = Math.sin(f / 24) * 2, sail = p.c ?? '#f6f1e4', cross = p.t === 'cross';
      const mast = (x: number, h: number, w: number) => (<g key={x}><rect x={x - 5} y={-h} width={10} height={h - 80} fill="#8a5a33" /><path d={`M${x - w} ${-h + 20} H${x + w} Q${x + w + 8} ${-h + 100} ${x + w - 8} ${-h + 150} H${x - w + 8} Q${x - w - 8} ${-h + 100} ${x - w} ${-h + 20}Z`} fill={sail} />{cross && <path d={`M${x} ${-h + 44} V${-h + 128} M${x - 26} ${-h + 84} H${x + 26}`} stroke="#c0392b" strokeWidth={10} fill="none" />}<path d={`M${x} ${-h} l36 8 l-36 8Z`} fill="#c0392b" /></g>);
      return (<g {...OL} transform={`translate(0 ${bob}) rotate(${ro})`}>{mast(-110, 330, 70)}{mast(20, 380, 80)}{mast(140, 320, 66)}<path d="M-196 -12 L-214 -66 L-214 -198 L-122 -198 L-112 -92 L196 -86 L262 -142 L242 -62 L176 -8Z" fill="#6e4325" /><path d="M-214 -120 L-112 -112 L196 -86 L242 -96 L238 -78 L196 -70 L-112 -94 L-214 -100Z" fill="#e2b84a" />{[-80, -30, 20, 70, 120].map((x, i) => <rect key={i} x={x} y={-56} width={18} height={14} fill="#1b1410" />)}<rect x={-214} y={-198} width={102} height={12} fill="#a8693a" /><path d="M262 -142 L320 -170" stroke={INK} strokeWidth={7} /></g>);
    }
    case 'teocalli': return (<g {...OL}><Shadow w={260} />{[0, 1, 2, 3].map((i) => { const w = 240 - i * 44; return <rect key={i} x={-w} y={-(i + 1) * 52} width={w * 2} height={52} fill={i % 2 ? '#d9c9a6' : '#cdbd96'} />; })}<path d="M-34 0 L-20 -208 L20 -208 L34 0Z" fill="#b8a77f" />{[0, 1, 2, 3].map((i) => <path key={i} d={`M${-30 + i * 3} ${-i * 52 - 26} H${30 - i * 3}`} strokeWidth={2.5} opacity={0.5} />)}<rect x={-86} y={-290} width={60} height={82} fill="#2b5fb4" /><rect x={26} y={-290} width={60} height={82} fill="#c0392b" /><path d="M-96 -290 L-56 -318 L-16 -290Z M16 -290 L56 -318 L96 -290Z" fill="#8a5a33" /></g>);
    case 'stbasil': {
      const dm = (x: number, h: number, w: number, c: string, c2: string) => (<g key={x}><rect x={x - w / 2} y={-h} width={w} height={h} fill="#c4513a" /><path d={`M${x - w / 2 - 6} ${-h} Q${x - w * 0.95} ${-h - w * 0.9} ${x} ${-h - w * 1.5} Q${x + w * 0.95} ${-h - w * 0.9} ${x + w / 2 + 6} ${-h}Z`} fill={c} />{[-1, 0, 1].map((i) => <path key={i} d={`M${x + i * w * 0.2} ${-h - 4} Q${x + i * w * 0.34} ${-h - w * 0.75} ${x} ${-h - w * 1.45}`} fill="none" stroke={c2} strokeWidth={4} />)}<path d={`M${x} ${-h - w * 1.5} V${-h - w * 1.5 - 28}`} stroke="#e2b84a" strokeWidth={5} /></g>);
      return (<g {...OL}><Shadow w={320} /><rect x={-300} y={-120} width={600} height={120} fill="#b94a35" />{[-250, -150, -50, 50, 150, 250].map((x, i) => <rect key={i} x={x - 16} y={-90} width={32} height={50} rx={16} fill="#3a2a22" />)}
        {dm(-230, 180, 62, '#2f7f6a', '#e2b84a')}{dm(230, 190, 62, '#2b5fb4', '#f4f1e6')}{dm(-120, 240, 66, '#e2b84a', '#c0392b')}{dm(120, 240, 66, '#b3202a', '#f2c230')}
        <rect x={-34} y={-400} width={68} height={290} fill="#d9c9aa" /><path d="M-44 -400 L0 -540 L44 -400Z" fill="#2f7f6a" /><path d="M0 -540 V-578" stroke="#e2b84a" strokeWidth={5} />{p.t === 'night' && <rect x={-340} y={-600} width={680} height={600} fill="#0b1020" opacity={0.25} stroke="none" />}</g>);
    }
    case 'izba': return (<g {...OL}><Shadow w={170} /><rect x={-150} y={-120} width={300} height={120} fill="#8a5a33" />{[-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100].map((y, i) => <path key={i} d={`M-150 ${y} H150`} strokeWidth={1.5} opacity={0.5} />).slice(0, 6)}<path d="M-180 -118 L0 -230 L180 -118Z" fill="#e9eef4" /><path d="M-180 -118 L0 -230 L180 -118" fill="none" /><rect x={-110} y={-96} width={54} height={50} fill={p.t === 'lit' ? '#ffd86b' : '#3b5a7a'} /><rect x={-110} y={-96} width={54} height={50} fill="none" stroke="#c0392b" strokeWidth={6} /><rect x={50} y={-90} width={46} height={90} fill="#5a3a22" /><rect x={96} y={-196} width={30} height={60} fill="#7a6a5a" /><Smoke x={111} y={-210} f={f} /></g>);
    case 'perun': return (<g {...OL}><Shadow w={70} /><rect x={-34} y={-300} width={68} height={300} rx={14} fill="#9a6a3a" /><circle cx={0} cy={-290} r={44} fill="#a8793f" /><circle cx={-14} cy={-298} r={5} fill="#241c17" /><circle cx={14} cy={-298} r={5} fill="#241c17" /><path d="M-30 -272 Q0 -250 30 -272 L24 -240 Q0 -226 -24 -240Z" fill="#e2b84a" /><path d="M-40 -330 L-30 -360 L-10 -338 L0 -366 L10 -338 L30 -360 L40 -330Z" fill="#e2b84a" /><path d="M-30 -170 H30 M-30 -120 H30" strokeWidth={5} stroke="#c0392b" /><path d="M20 -230 L36 -200 L26 -200 L38 -170" fill="none" stroke="#f2c230" strokeWidth={6} /></g>);
    case 'tank': { const fire = p.t === 'fire', rec = fire ? Math.max(0, 1 - (f % 40) / 12) * 14 : 0, jig = Math.sin(f / 2) * 1.5; return (<g {...OL}><Shadow w={190} /><g transform={`translate(0 ${jig})`}><rect x={-170} y={-52} width={340} height={52} rx={26} fill="#3a3f36" />{Array.from({length: 6}, (_, i) => <circle key={i} cx={-130 + i * 52} cy={-26} r={17} fill="#59604f" />)}<path d="M-120 -52 L-90 -112 H70 L120 -52Z" fill="#6a7358" /><path d="M-40 -112 L-24 -150 H44 L58 -112Z" fill="#6a7358" /><rect x={58 - rec} y={-136} width={170} height={12} fill="#4a5140" /><circle cx={0} cy={-132} r={7} fill="#c0392b" stroke="none" />{fire && (f % 40) < 8 && <path d={`M${228 - rec} -130 l40 -14 l-8 14 l8 14z`} fill="#fbb02d" stroke="none" />}</g></g>); }
    case 'train': { const roy = p.t === 'royal'; const sealed = p.t === 'sealed'; const sm = (f % 60) / 60; return (<g {...OL}><Shadow w={330} /><path d="M-360 4 H360" strokeWidth={5} /><g><rect x={-60} y={-110} width={300} height={90} fill={roy ? '#2b4a8a' : sealed ? '#4a4a4a' : '#7a2a2a'} />{[-30, 40, 110, 180].map((x, i) => <rect key={i} x={x} y={-88} width={44} height={36} fill={sealed ? '#2a2a2a' : '#ffd86b'} />)}<rect x={-300} y={-100} width={230} height={80} rx={10} fill="#2a2d33" /><rect x={-300} y={-150} width={80} height={50} fill="#2a2d33" /><rect x={-190} y={-150} width={26} height={50} fill="#2a2d33" /><circle cx={-290} cy={-60} r={0} />{[-250, -190, -130, 20, 190].map((x, i) => <circle key={i} cx={x} cy={-14} r={22} fill="#5a5f66" />)}<Smoke x={-177} y={-160 - sm * 20} f={f} col="#cfcfcf" /></g></g>); }
    case 'sputnik': { const a = f / 18; return (<g {...OL}><g transform={`rotate(${Math.sin(a) * 6})`}><circle cx={0} cy={-60} r={34} fill="#cfd6de" />{[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sy], i) => <path key={i} d={`M${sx * 20} ${-60 + sy * 10} L${sx * 150} ${-60 + sy * 78}`} strokeWidth={4} />)}<path d="M-20 -86 Q0 -96 20 -86" fill="none" stroke="#fff" strokeWidth={4} opacity={0.7} />{f % 30 < 15 && <circle cx={-84} cy={-60} r={0} />}</g></g>); }
    case 'sub': { const bob = Math.sin(f / 22) * 4; return (<g {...OL} transform={`translate(0 ${bob})`}><ellipse cx={0} cy={-40} rx={240} ry={38} fill="#3a4a3a" /><rect x={-30} y={-100} width={74} height={50} rx={8} fill="#3a4a3a" /><rect x={20} y={-124} width={6} height={30} /><path d="M-240 -40 L-280 -76 L-264 -40 L-280 -4Z" fill="#2f3b2f" /><circle cx={-110} cy={-40} r={9} fill="#ffd86b" /><circle cx={-70} cy={-40} r={9} fill="#ffd86b" /><circle cx={150} cy={-44} r={6} fill="#c0392b" stroke="none" /></g>); }
    case 'reactor': { const blast = p.t === 'blast'; return (<g {...OL}><Shadow w={230} /><rect x={-210} y={-150} width={420} height={150} fill="#b8b2a4" /><rect x={-130} y={-290} width={260} height={140} fill="#cdc7b8" />{blast ? <path d="M-130 -290 L-100 -330 L-60 -300 L-20 -350 L20 -310 L70 -340 L110 -300 L130 -290Z" fill="#8a8478" /> : <rect x={-100} y={-310} width={200} height={20} fill="#9a9488" />}<rect x={170} y={-380} width={44} height={230} fill="#c0392b" /><rect x={170} y={-300} width={44} height={40} fill="#f4f1e6" />{blast && (<g><g transform="translate(0 -300)"><Flame f={f} k={0} w={110} h={260} /></g><Smoke x={0} y={-360} f={f} col="#6a6560" /></g>)}<g transform="translate(-170 -60)"><path d="M0 0 m0 -30 l26 46 h-52z" fill="#ffd24a" /><circle r={5} cy={6} fill="#241c17" stroke="none" /></g></g>); }
    case 'winterpalace': { const w = 560; return (<g {...OL}><Shadow w={w} /><rect x={-w} y={-200} width={2 * w} height={200} fill="#4f9a86" />{Array.from({length: 22}, (_, i) => <rect key={i} x={-w + 24 + i * 50} y={-170} width={26} height={44} fill="#f2e9c9" />)}{Array.from({length: 22}, (_, i) => <rect key={i} x={-w + 24 + i * 50} y={-96} width={26} height={44} fill="#f2e9c9" />)}{Array.from({length: 23}, (_, i) => <rect key={i} x={-w + 10 + i * 50} y={-206} width={10} height={206} fill="#f4f1e6" opacity={0.7} stroke="none" />)}<rect x={-w} y={-216} width={2 * w} height={16} fill="#f4f1e6" /><path d="M-90 -200 L0 -290 L90 -200Z" fill="#f4f1e6" />{[-w + 8, w - 8].map((x, i) => <rect key={i} x={x - 8} y={-232} width={16} height={32} fill="#e2b84a" />)}</g>); }
    case 'emblem': { const t = p.t ?? 'eagle'; return (<g {...OL}>{t === 'sickle' ? (<g><circle cx={0} cy={-100} r={86} fill="#c0392b" /><path d="M-40 -60 Q-70 -150 10 -170 Q-40 -140 -22 -66Z" fill="#f2c230" /><path d="M10 -170 L40 -60" strokeWidth={12} stroke="#f2c230" /><path d="M-34 -150 h70 l-12 22 h-46z" fill="#f2c230" stroke="none" /></g>) : t === 'star' ? <path d="M0 -190 L30 -118 L108 -112 L48 -62 L66 14 L0 -26 L-66 14 L-48 -62 L-108 -112 L-30 -118Z" fill="#c0392b" /> : (<g><path d="M0 -40 Q-130 -60 -110 -190 Q-60 -150 -30 -170 Q-20 -230 0 -240 Q20 -230 30 -170 Q60 -150 110 -190 Q130 -60 0 -40Z" fill="#2a2a30" /><circle cx={-24} cy={-206} r={22} fill="#2a2a30" /><circle cx={24} cy={-206} r={22} fill="#2a2a30" /><path d="M-24 -226 L-40 -218 L-24 -210Z M24 -226 L40 -218 L24 -210Z" fill="#e2b84a" /><path d="M-50 -250 h100 l-12 20 h-76z" fill="#e2b84a" /><rect x={-26} y={-150} width={52} height={64} rx={10} fill="#a8242c" /></g>)}</g>); }
    case 'console': { const al = p.t === 'alert'; const on = al && Math.floor(f / 8) % 2 === 0; return (<g {...OL}><Shadow w={190} /><rect x={-180} y={-150} width={360} height={150} fill="#3a4048" /><rect x={-150} y={-136} width={300} height={74} fill={on ? '#a8242c' : '#0f2a1f'} />{al ? <path d="M-110 -100 H110" stroke={on ? '#ffd2d2' : '#7f2a2a'} strokeWidth={8} /> : [-100, -60, -20, 20, 60, 100].map((x, i) => <path key={i} d={`M${x - 14} ${-84 - (i % 3) * 14} h28`} stroke="#7fe3a8" strokeWidth={5} />)}{[-120, -70, 70, 120].map((x, i) => <circle key={i} cx={x} cy={-30} r={9} fill={i % 2 ? '#e2b84a' : '#4a6a9a'} />)}<circle cx={0} cy={-30} r={20} fill={al ? '#d52b1e' : '#7a2a2a'} /></g>); }
    case 'watchtower': return (<g {...OL}><Shadow w={120} />{[-50, 50].map((x, i) => <path key={i} d={`M${x} 0 L${x * 0.7} -240`} strokeWidth={9} stroke="#5a4a3a" />)}<path d="M-30 -120 H30 M-40 -60 H40" strokeWidth={6} stroke="#5a4a3a" /><rect x={-66} y={-300} width={132} height={64} fill="#6a5a48" /><path d="M-80 -300 L0 -350 L80 -300Z" fill="#4a3a2e" /><path d={`M-14 -276 L${-14 + 130} ${-236 + Math.sin(f / 20) * 30} L${-14 + 130} ${-256 + Math.sin(f / 20) * 30}Z`} fill="#fff2a8" opacity={0.35} stroke="none" /></g>);
    case 'yurt': return (<g {...OL}><Shadow w={150} /><path d="M-130 0 V-90 Q0 -210 130 -90 V0Z" fill="#efe7d3" /><path d="M-130 -90 Q0 -130 130 -90" fill="none" /><rect x={-26} y={-76} width={52} height={76} rx={6} fill="#a8242c" /><path d="M0 -176 V-204" strokeWidth={4} /><path d="M0 -204 l40 -8 l-8 18z" fill="#c0392b" /></g>);
    case 'icehole': return (<g {...OL}><ellipse cx={0} cy={0} rx={220} ry={34} fill="#cfe6f2" /><ellipse cx={0} cy={2} rx={120} ry={18} fill="#1d3a55" />{[-170, 150].map((x, i) => <path key={i} d={`M${x} 0 l${i ? 40 : -40} 8`} strokeWidth={2} opacity={0.5} />)}<path d="M-60 -2 Q0 12 60 -2" fill="none" stroke="#6fb0d6" strokeWidth={3} /></g>);
    case 'bell': { const sw = Math.sin(f / 10) * 8; return (<g {...OL}><rect x={-70} y={-330} width={140} height={20} fill="#6a4a2a" /><g transform={`rotate(${sw} 0 -320)`}><path d="M-14 -320 V-300 M14 -320 V-300" strokeWidth={5} /><path d="M-70 -120 Q-80 -220 -40 -290 Q0 -310 40 -290 Q80 -220 70 -120 Q0 -100 -70 -120Z" fill="#c4a24a" /><circle cx={0} cy={-104} r={12} fill="#6a4a2a" /></g></g>); }
    case 'bridge': {
      const w = (p.n ?? 640) / 2, pont = p.t === 'pontoon', burn = p.t === 'burning', na = Math.max(2, Math.round(w / 110));
      return (<g {...OL}><Shadow w={w} />
        {pont ? (<g>{Array.from({length: na * 2}, (_, i) => { const x = -w + 44 + i * ((2 * w - 88) / (na * 2 - 1)); return <path key={i} d={`M${x - 46} -34 Q${x} 12 ${x + 46} -34Z`} fill="#6b4a2a" transform={`translate(0 ${Math.sin(f / 16 + i) * 3})`} />; })}<rect x={-w} y={-52} width={2 * w} height={18} fill="#a8793f" />{Array.from({length: na * 4}, (_, i) => <path key={i} d={`M${-w + 10 + i * ((2 * w - 20) / (na * 4))} -52 v18`} strokeWidth={2} opacity={0.5} />)}</g>)
        : (<g><rect x={-w} y={-76} width={2 * w} height={76} fill="#bdb6a6" />{Array.from({length: na}, (_, i) => { const cx = -w + (i + 0.5) * ((2 * w) / na); return <path key={i} d={`M${cx - 38} 0 V-26 Q${cx} -72 ${cx + 38} -26 V0Z`} fill="#4a6a8a" />; })}<rect x={-w - 6} y={-112} width={2 * w + 12} height={36} fill="#a9a393" />{Array.from({length: Math.floor(w / 24)}, (_, i) => <path key={i} d={`M${-w + 24 + i * 48} -112 v36`} strokeWidth={2} opacity={0.45} />)}</g>)}
        {burn && (<g><g transform={`translate(${-w * 0.5} ${pont ? -50 : -112})`}><Flame f={f} k={0} w={70} h={190} /></g><g transform={`translate(${w * 0.2} ${pont ? -50 : -112})`}><Flame f={f} k={1} w={60} h={160} /></g><Smoke x={-w * 0.5} y={pont ? -60 : -120} f={f} col="#7a7570" /></g>)}</g>);
    }
    case 'kremlin': {
      const dome = (x: number, h: number, col: string) => (<g key={x}><rect x={x - 28} y={-h} width={56} height={h} fill="#d9c9aa" /><rect x={x - 12} y={-h + 40} width={24} height={44} rx={12} fill="#3a2a22" /><path d={`M${x - 36} ${-h} Q${x - 48} ${-h - 54} ${x} ${-h - 100} Q${x + 48} ${-h - 54} ${x + 36} ${-h}Z`} fill={col} /><path d={`M${x} ${-h - 100} V${-h - 126}`} stroke="#e2b84a" strokeWidth={5} /><circle cx={x} cy={-h - 128} r={6} fill="#e2b84a" /></g>);
      return (<g {...OL}><Shadow w={400} /><rect x={-400} y={-130} width={800} height={130} fill="#a8443a" />{Array.from({length: 26}, (_, i) => <rect key={i} x={-398 + i * 31} y={-152} width={22} height={24} fill="#a8443a" />)}{dome(-290, 230, '#2f7f6a')}{dome(-90, 320, '#e2b84a')}{dome(100, 270, '#b3202a')}{dome(300, 220, '#2b5fb4')}
        {p.t === 'burning' && [-320, -150, 20, 200, 340].map((x, i) => <g key={i} transform={`translate(${x} ${-120 - (i % 2) * 30})`}><Flame f={f} k={i} w={64} h={180} /></g>)}{p.t === 'burning' && <Smoke x={-60} y={-340} f={f} col="#4a4540" />}</g>);
    }
    case 'gunline': { const n = Math.min(p.n ?? 6, 10); return (<g>{Array.from({length: n}, (_, i) => <g key={i} transform={`translate(${(i - (n - 1) / 2) * 128} ${(i % 2) * 14}) scale(0.62)`}><PropArt p={{k: 'cannon', x: 0, y: 0, t: p.t === 'fire' ? 'fire' : undefined}} f={f + i * 17} seed={`${seed}g${i}`} /></g>)}</g>); }
    case 'rocket': {
      const t = (f % 150) / 150, out = Math.min(1, t / 0.55), back = Math.max(0, (t - 0.55) / 0.45), x = out * 520 - back * 700, y = -150 - Math.sin(out * Math.PI) * 70 + back * 110, dir = back > 0 ? -1 : 1;
      return (<g {...OL}><path d="M-30 0 L0 -90 L30 0" fill="none" stroke="#6b4a2a" strokeWidth={6} /><g transform={`translate(${x} ${y}) scale(${dir} 1)`}><path d="M-150 0 H-24" stroke="#8a5a33" strokeWidth={6} /><rect x={-30} y={-13} width={66} height={26} rx={6} fill="#6b727c" /><path d="M36 -13 L70 0 L36 13Z" fill="#c0392b" /><path d="M-30 -13 L-48 -26 L-30 -4Z M-30 13 L-48 26 L-30 4Z" fill="#6b727c" /><path d={`M-30 0 L${-72 - (f % 4) * 8} -11 L${-72 - (f % 4) * 8} 11Z`} fill="#fbb02d" stroke="none" /></g></g>);
    }
    case 'cannon': {
      const t = (f % 110) / 110, fire = p.t === 'fire', rec = fire ? (t < 0.1 ? (-22 * t) / 0.1 : -22 * Math.max(0, 1 - (t - 0.1) / 0.25)) : 0;
      return (<g {...OL}><Shadow w={130} /><g transform={`translate(${rec} 0)`}><g transform="rotate(-14 -10 -70)"><path d="M-90 -86 L104 -100 L104 -64 L-90 -56Z" fill="#3a3d44" /><circle cx={-92} cy={-71} r={13} fill="#3a3d44" /><rect x={92} y={-108} width={16} height={52} rx={4} fill="#4a4e57" /></g><path d="M-100 -50 L100 -50 L84 -26 L-70 -26Z" fill="#8a5a33" /><circle cx={-6} cy={-34} r={36} fill="#6b4a2a" /><circle cx={-6} cy={-34} r={8} fill="#3a2a1a" />{[0, 60, 120].map((a2) => <path key={a2} d={`M${-6 + 36 * Math.cos(rad(a2))} ${-34 + 36 * Math.sin(rad(a2))} L${-6 - 36 * Math.cos(rad(a2))} ${-34 - 36 * Math.sin(rad(a2))}`} strokeWidth={4} />)}</g>{fire && t < 0.16 && <circle cx={118} cy={-98} r={34 * (1 - t * 5.5)} fill="#fbb02d" stroke="none" />}{fire && <Smoke x={120} y={-100} f={f} col="#d9d4c8" />}</g>);
    }
    case 'book': return (<g {...OL}><Shadow w={130} /><path d="M-124 0 H124 L112 -12 H-112Z" fill={c ?? '#7a3b2a'} /><path d="M-112 -12 Q-56 -34 0 -12 Q56 -34 112 -12 L112 -128 Q56 -150 0 -128 Q-56 -150 -112 -128Z" fill="#f6efd8" /><path d="M0 -12 V-128" />{[0, 1, 2, 3, 4, 5].map((i) => <g key={i} strokeWidth={3} opacity={0.6}><path d={`M-96 ${-104 + i * 14} H-14`} /><path d={`M14 ${-104 + i * 14} H${i % 2 ? 80 : 96}`} /></g>)}<rect x={-96} y={-120} width={26} height={22} fill="#c0392b" stroke="none" /></g>);
    case 'telescope': return (<g {...OL}><Shadow w={80} /><path d="M0 -130 L-56 0 M0 -130 L8 0 M0 -130 L64 0" stroke={INK} strokeWidth={9} fill="none" /><g transform="rotate(38 0 -130)"><rect x={-18} y={-380} width={36} height={250} rx={6} fill="#c4a24a" /><rect x={-24} y={-392} width={48} height={30} rx={6} fill="#8a6a2a" /><rect x={-18} y={-300} width={36} height={10} fill="#6b4a2a" /><rect x={-14} y={-200} width={28} height={10} fill="#6b4a2a" /></g></g>);
    case 'orrery': {
      const mode = p.t ?? 'sun', C0 = -210, kep = mode === 'kepler', geo = mode === 'geo';
      const planets = [[100, '#8ab4d9', 0.031, 9], [170, '#d98a5a', 0.021, 12], [250, '#e8d27a', 0.014, 15]] as const;
      if (kep) { const rx = 330, e = 0.5, ry = rx * Math.sqrt(1 - e * e), M = f / 40, E = M + e * Math.sin(M) + 0.5 * e * e * Math.sin(2 * M);
        return (<g {...OL}><ellipse cx={-rx * e} cy={C0} rx={rx} ry={ry} fill="none" stroke="#9fb4d9" strokeWidth={4} strokeDasharray="10 10" /><circle cx={0} cy={C0} r={36} fill="#ffe27a" /><circle cx={rx * (Math.cos(E) - e)} cy={C0 + ry * Math.sin(E)} r={14} fill="#4f86c6" /></g>); }
      if (geo) return (<g {...OL}><ellipse cx={0} cy={C0} rx={330} ry={120} fill="none" stroke="#9fb4d9" strokeWidth={3} strokeDasharray="4 12" />{Array.from({length: 14}, (_, i) => { const a = (i / 14) * 6.283 + f * 0.004; return <circle key={i} cx={Math.cos(a) * 330} cy={C0 + Math.sin(a) * 120} r={5} fill="#fff" stroke="none" />; })}<ellipse cx={0} cy={C0} rx={200} ry={72} fill="none" stroke="#e8d27a" strokeWidth={3} opacity={0.6} /><circle cx={0} cy={C0} r={34} fill="#3f8fcf" /><path d={`M-16 ${C0 - 12} Q-4 ${C0 - 26} 10 ${C0 - 12} Q16 ${C0 + 2} 0 ${C0 + 10} Q-14 ${C0 + 6} -16 ${C0 - 12}Z`} fill="#4f9d4a" stroke="none" /><circle cx={Math.cos(f * 0.05) * 90} cy={C0 + Math.sin(f * 0.05) * 32} r={9} fill="#e9e5d2" /><circle cx={Math.cos(f * 0.012 + 2) * 200} cy={C0 + Math.sin(f * 0.012 + 2) * 72} r={26} fill="#ffe27a" /></g>);
      return (<g {...OL}>{planets.map(([rx], i) => <ellipse key={i} cx={0} cy={C0} rx={rx} ry={rx * 0.36} fill="none" stroke="#9fb4d9" strokeWidth={3} opacity={0.7} />)}<circle cx={0} cy={C0} r={40} fill="#ffe27a" />{planets.map(([rx, col, sp, r], i) => { const a = f * sp + i * 2.1; return <circle key={i} cx={Math.cos(a) * rx} cy={C0 + Math.sin(a) * rx * 0.36} r={r + 5} fill={col} />; })}</g>);
    }
    case 'globe': {
      const id = `gl${seed.replace(/[^a-zA-Z0-9]/g, '')}`, off = (f * 0.9) % 330;
      const land = (dx: number) => (<g transform={`translate(${dx} 0)`} fill="#4f9d4a" stroke={INK} strokeWidth={3}><path d="M-80 -200 Q-50 -250 -10 -228 Q20 -204 -14 -170 Q-50 -150 -80 -170Z" /><path d="M30 -160 Q70 -190 96 -150 Q80 -110 52 -104 Q24 -120 30 -160Z" /><path d="M-60 -130 Q-30 -150 -12 -118 Q-26 -84 -52 -92Z" /></g>);
      return (<g {...OL}><Shadow w={100} /><path d="M-66 0 H66 L44 -34 H-44Z" fill="#6b4a2a" /><rect x={-7} y={-70} width={14} height={40} fill="#c4a24a" /><clipPath id={id}><circle cx={0} cy={-176} r={112} /></clipPath><circle cx={0} cy={-176} r={112} fill="#3f8fcf" /><g clipPath={`url(#${id})`}>{land(-off)}{land(330 - off)}{land(-330 - off)}</g><circle cx={0} cy={-176} r={112} fill="none" />{[-56, 0, 56].map((x, i) => <ellipse key={i} cx={0} cy={-176} rx={Math.abs(x) + 2} ry={112} fill="none" strokeWidth={1.8} opacity={0.35} />)}<path d="M-112 -176 H112" strokeWidth={1.8} opacity={0.35} />{p.t === 'line' && <path d="M26 -288 V-64" stroke="#c0392b" strokeWidth={7} />}</g>);
    }
    case 'guillotine': { const drop = p.t === 'down'; return (<g {...OL}><Shadow w={110} /><rect x={-96} y={-30} width={192} height={30} fill="#6b4a2a" /><rect x={-70} y={-360} width={16} height={332} fill="#8a5a33" /><rect x={54} y={-360} width={16} height={332} fill="#8a5a33" /><rect x={-80} y={-380} width={160} height={24} fill="#6b4a2a" /><path d={`M-52 ${drop ? -90 : -310} H52 L52 ${drop ? -60 : -280} Z`} fill="#dfe5ec" /><path d="M-54 -78 H54 V-60 H-54Z" fill="#8a5a33" /></g>); }
    case 'bastille': {
      const tw = (x: number, h: number) => (<g key={x}><rect x={x - 62} y={-h} width={124} height={h} fill="#a9a393" />{[-46, -16, 14, 44].map((o, i) => <rect key={i} x={x + o - 11} y={-h - 30} width={22} height={34} fill="#a9a393" />)}<path d={`M${x - 62} ${-h * 0.5} H${x + 62}`} strokeWidth={3} opacity={0.5} /><rect x={x - 5} y={-h + 60} width={10} height={36} fill="#2a2018" /></g>);
      return (<g {...OL}><Shadow w={380} />{tw(-290, 390)}{tw(290, 390)}<rect x={-230} y={-290} width={460} height={290} fill="#bdb6a6" />{Array.from({length: 10}, (_, i) => <rect key={i} x={-224 + i * 46} y={-322} width={30} height={34} fill="#bdb6a6" />)}{tw(-110, 340)}{tw(110, 340)}{[-170, -60, 60, 170].map((x, i) => <rect key={i} x={x - 6} y={-200} width={12} height={40} fill="#2a2018" />)}<path d="M-40 0 V-100 Q0 -140 40 -100 V0Z" fill="#3a2a1a" />{p.t === 'storm' && <Smoke x={-120} y={-330} f={f} col="#8a8480" />}</g>);
    }
    case 'versailles': {
      const wing = (x: number, w: number) => (<g key={x}><rect x={x} y={-200} width={w} height={200} fill="#e9dfc6" />{Array.from({length: Math.floor(w / 46)}, (_, i) => <g key={i}><rect x={x + 12 + i * 46} y={-170} width={26} height={54} fill="#8ec9ee" /><rect x={x + 12 + i * 46} y={-86} width={26} height={54} fill="#8ec9ee" /></g>)}<path d={`M${x - 8} -200 L${x + 24} -250 H${x + w - 24} L${x + w + 8} -200Z`} fill="#5f6b7a" /></g>);
      return (<g {...OL}><Shadow w={460} />{wing(-460, 300)}{wing(160, 300)}<rect x={-160} y={-230} width={320} height={230} fill="#efe6cf" />{[-120, -72, -24, 24, 72, 120].map((x, i) => <rect key={i} x={x - 10} y={-200} width={20} height={190} fill="#f7f1df" />)}<path d="M-176 -230 H176 L140 -300 H-140Z" fill="#5f6b7a" /><rect x={-176} y={-244} width={352} height={14} fill="#e2b84a" /><path d="M-30 0 V-80 a30 30 0 0 1 60 0 V0Z" fill="#3a2a22" /><rect x={-12} y={-330} width={24} height={34} fill="#e2b84a" /></g>);
    }
    case 'mirror': return (<g {...OL}><Shadow w={60} /><path d="M-56 0 V-250 a56 56 0 0 1 112 0 V0Z" fill="#e2b84a" /><path d="M-40 -8 V-250 a40 40 0 0 1 80 0 V-8Z" fill="#cfe9f7" /><path d="M-24 -40 L18 -180 M-4 -30 L30 -130" stroke="#fff" strokeWidth={7} opacity={0.7} fill="none" /></g>);
    case 'door': { const th = p.t === 'theses'; return (<g {...OL}><rect x={-130} y={-400} width={260} height={400} fill="#bdb6a6" /><path d="M-96 0 V-250 Q-96 -330 0 -350 Q96 -330 96 -250 V0Z" fill="#6b4a2a" /><path d="M0 -350 V0 M-96 -230 H96 M-96 -110 H96" stroke="#3a2a1a" strokeWidth={6} fill="none" /><circle cx={-18} cy={-130} r={8} fill="#c4a24a" /><circle cx={18} cy={-130} r={8} fill="#c4a24a" />{th && <g><rect x={-50} y={-290} width={44} height={62} fill="#f6efd8" transform="rotate(-4 -28 -260)" />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-44 ${-280 + i * 11} H-12`} stroke="#6b5430" strokeWidth={2.5} />)}<rect x={8} y={-296} width={44} height={62} fill="#f6efd8" transform="rotate(3 30 -266)" />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M14 ${-286 + i * 11} H46`} stroke="#6b5430" strokeWidth={2.5} />)}</g>}</g>); }
    case 'wagon': {
      const spin = (f * 6) % 360, wh = (x: number) => (<g><circle cx={x} cy={-40} r={40} fill="#8a5a33" />{[0, 45, 90, 135].map((a) => <path key={a} d={`M${x + 40 * Math.cos(rad(a + spin))} ${-40 + 40 * Math.sin(rad(a + spin))} L${x - 40 * Math.cos(rad(a + spin))} ${-40 - 40 * Math.sin(rad(a + spin))}`} strokeWidth={3.5} />)}<circle cx={x} cy={-40} r={7} fill="#3a2a1a" /></g>);
      return (<g {...OL}><Shadow w={140} />{wh(-70)}{wh(70)}<path d="M-110 -80 H110 L96 -128 H-96Z" fill="#a8693a" />{p.t === 'cover' && <path d="M-100 -128 Q0 -250 100 -128Z" fill="#f1ece0" />}<path d="M110 -92 L190 -108" stroke={INK} strokeWidth={8} /></g>);
    }
    case 'crop': {
      const t = p.t ?? 'potato', n = p.n ?? 9;
      const items = Array.from({length: n}, (_, i) => ({x: ((i % 3) - 1) * 34 + (random(`${seed}c${i}`) - 0.5) * 12, y: -60 - Math.floor(i / 3) * 24 - (i % 2) * 6}));
      const art = (q: {x: number; y: number}, i: number) => {
        switch (t) {
          case 'tomato': return <g key={i}><circle cx={q.x} cy={q.y} r={19} fill="#d63b3b" /><path d={`M${q.x - 9} ${q.y - 16} l9 6 l9 -6`} stroke="#3f8a45" strokeWidth={4} fill="none" /></g>;
          case 'corn': return <g key={i}><ellipse cx={q.x} cy={q.y} rx={11} ry={27} fill="#f2c230" /><path d={`M${q.x - 10} ${q.y + 24} Q${q.x} ${q.y - 10} ${q.x - 14} ${q.y - 20}`} fill="none" stroke="#6fae4a" strokeWidth={6} /></g>;
          case 'chili': return <path key={i} d={`M${q.x - 14} ${q.y - 20} Q${q.x + 10} ${q.y - 6} ${q.x + 4} ${q.y + 24} Q${q.x - 8} ${q.y + 4} ${q.x - 14} ${q.y - 20}Z`} fill="#c0392b" />;
          case 'cocoa': return <ellipse key={i} cx={q.x} cy={q.y} rx={14} ry={22} fill="#8a4b2a" transform={`rotate(${(i % 3) * 20 - 20} ${q.x} ${q.y})`} />;
          case 'sugar': return <rect key={i} x={q.x - 14} y={q.y - 14} width={28} height={28} rx={4} fill="#f4f1e6" />;
          case 'nutmeg': return <g key={i}><circle cx={q.x} cy={q.y} r={15} fill="#8a6a44" /><path d={`M${q.x - 14} ${q.y} Q${q.x} ${q.y - 14} ${q.x + 14} ${q.y}`} stroke="#c0392b" strokeWidth={5} fill="none" /></g>;
          case 'silver': return <path key={i} d={`M${q.x - 18} ${q.y + 12} L${q.x - 8} ${q.y - 16} L${q.x + 12} ${q.y - 16} L${q.x + 20} ${q.y + 12}Z`} fill="#dfe5ec" />;
          default: return <ellipse key={i} cx={q.x} cy={q.y} rx={20} ry={14} fill="#b98a55" transform={`rotate(${(i % 3) * 25 - 25} ${q.x} ${q.y})`} />;
        }
      };
      if (t === 'dung') return (<g {...OL}><Shadow w={100} /><path d="M-90 0 Q-70 -70 -20 -78 Q10 -110 46 -76 Q92 -62 96 0Z" fill="#6b4a2a" />{[0, 1, 2].map((i) => <path key={i} d={`M${-30 + i * 30} -90 q8 -14 0 -28`} fill="none" stroke="#fff" strokeWidth={4} opacity={0.5} />)}</g>);
      if (t === 'cane') return (<g {...OL}><Shadow w={90} />{Array.from({length: 6}, (_, i) => <g key={i} transform={`rotate(${Math.sin(f / 30 + i) * 2} ${(i - 2.5) * 22} 0)`}><rect x={(i - 2.5) * 22 - 6} y={-200 - (i % 3) * 24} width={12} height={200 + (i % 3) * 24} fill="#9bb54a" />{[0, 1, 2].map((k) => <path key={k} d={`M${(i - 2.5) * 22 - 6} ${-60 - k * 52} h12`} />)}<path d={`M${(i - 2.5) * 22} ${-200 - (i % 3) * 24} l-24 -22 M${(i - 2.5) * 22} ${-200 - (i % 3) * 24} l24 -22`} stroke="#4f9d4a" strokeWidth={6} fill="none" /></g>)}</g>);
      return (<g {...OL}><Shadow w={90} /><path d="M-62 -52 Q-70 0 -40 0 H40 Q70 0 62 -52Z" fill="#b98a55" /><path d="M-62 -52 H62" strokeWidth={5} />{items.map(art)}</g>);
    }
    case 'constantinople': {
      const ot = p.t === 'ottoman', col = '#d9ccb0';
      return (<g {...OL}><Shadow w={420} /><rect x={-420} y={-120} width={840} height={120} fill="#c9bfa4" />{[-400, -330, -260, -190, -120, 120, 190, 260, 330, 400].map((x, i) => <rect key={i} x={x - 12} y={-150} width={24} height={34} fill="#c9bfa4" />)}<rect x={-170} y={-210} width={340} height={210} fill={col} /><path d="M-150 -210 Q-150 -380 0 -380 Q150 -380 150 -210Z" fill="#8f98a8" /><path d="M-150 -210 Q-150 -380 0 -380 Q-50 -320 -56 -210Z" fill="#000" opacity={0.1} stroke="none" />{[-190, 190].map((x, i) => <path key={i} d={`M${x - 56} -210 Q${x - 56} -300 ${x} -300 Q${x + 56} -300 ${x + 56} -210Z`} fill="#8f98a8" />)}{[-110, -55, 0, 55, 110].map((x, i) => <path key={i} d={`M${x - 10} -170 v-30 a10 10 0 0 1 20 0 v30Z`} fill="#3a4a63" />)}{ot ? <g>{[-300, 300].map((x, i) => <g key={i}><rect x={x - 12} y={-420} width={24} height={300} fill="#ece4d0" /><path d={`M${x - 16} -420 L${x} -490 L${x + 16} -420Z`} fill="#7f8fa3" /></g>)}<g transform="translate(0 -398) scale(0.5)"><path d="M20 -62 A52 52 0 1 0 20 42 A42 42 0 1 1 20 -62Z" fill="#f2c230" /></g></g> : <path d="M0 -380 v-40 M-14 -404 h28" stroke={INK} strokeWidth={6} />}{[-340, -150, 150, 340].map((x, i) => <g key={i}><rect x={x - 34} y={-190} width={68} height={190} fill="#bdb6a6" />{[-22, 0, 22].map((o, j) => <rect key={j} x={x + o - 7} y={-216} width={14} height={30} fill="#bdb6a6" />)}</g>)}</g>);
    }
    case 'duomo': return (<g {...OL}><Shadow w={300} /><rect x={-230} y={-210} width={300} height={210} fill="#efe9db" />{Array.from({length: 6}, (_, i) => <path key={i} d={`M${-210 + i * 48} 0 V-80 a15 15 0 0 1 30 0 V0Z`} fill="#3f7a54" />)}<path d="M-170 -210 L-170 -250 L10 -250 L10 -210Z" fill="#e5dfcf" /><path d="M-150 -250 Q-150 -470 -80 -470 Q-10 -470 -10 -250Z" fill="#b5532f" />{[-120, -80, -40].map((x, i) => <path key={i} d={`M-80 -470 Q${x * 1.1 - 40} -350 ${x} -250`} fill="none" strokeWidth={3} opacity={0.55} />)}<path d="M-100 -470 h40 v-44 h-40Z" fill="#efe9db" /><path d="M-80 -514 v-30 M-92 -530 h24" strokeWidth={5} /><circle cx={-80} cy={-552} r={8} fill="#e2b84a" /><rect x={110} y={-420} width={70} height={420} fill="#efe9db" />{[-340, -260, -180, -100].map((y, i) => <rect key={i} x={126} y={y} width={38} height={50} rx={19} fill="#3a4a63" />)}<path d="M110 -420 h70" strokeWidth={6} /></g>);
    case 'potosi': { const tw = (f % 60) / 60; return (<g {...OL}><Shadow w={300} /><path d="M-330 0 L-60 -380 L40 -420 L330 0Z" fill="#a8583a" /><path d="M40 -420 L330 0 L140 0 L90 -240Z" fill="#000" opacity={0.12} stroke="none" /><path d="M-60 -380 L-90 -330 L-60 -346 L-34 -310 L40 -420Z" fill="#c9835f" stroke="none" />{[[-130, -90], [-20, -150], [100, -80], [180, -40]].map(([x, y], i) => <path key={i} d={`M${x - 22} ${y} v-34 a22 22 0 0 1 44 0 v34Z`} fill="#2a1a12" />)}<path d="M-210 -30 Q-120 -110 -20 -130 M60 -60 Q140 -70 200 -30" fill="none" stroke="#e9d9b0" strokeWidth={5} strokeDasharray="10 8" />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-90 + i * 64} ${-230 + (i % 2) * 40} l6 12 l12 6 l-12 6 l-6 12 l-6 -12 l-12 -6 l12 -6Z`} fill="#fff" stroke="none" opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 9 + i * 1.7 + tw))} />)}</g>); }
    case 'scaffold': return (<g {...OL}><Shadow w={200} /><rect x={-200} y={-90} width={400} height={90} fill="#2a2a30" />{[-160, -80, 0, 80, 160].map((x, i) => <path key={i} d={`M${x} -90 V0`} stroke="#555" strokeWidth={3} />)}<rect x={-230} y={-106} width={460} height={18} fill="#6b4a2a" /><path d="M-60 -106 H60 L52 -140 H-52Z" fill="#1b1b20" /><rect x={-26} y={-168} width={52} height={32} rx={6} fill="#5a3d2a" /><path d="M200 -88 L260 0 M200 -70 H260" strokeWidth={5} fill="none" /></g>);
    case 'bed': return (<g {...OL}><Shadow w={200} /><rect x={-190} y={-60} width={380} height={60} fill="#6b3a2a" /><rect x={-176} y={-110} width={352} height={52} rx={10} fill="#f4efe4" /><rect x={-176} y={-110} width={130} height={36} rx={14} fill="#fff" /><path d="M-60 -110 H176 V-76 H-60Z" fill="#a8242c" />{[-190, 170].map((x, i) => <rect key={i} x={x} y={-330} width={20} height={330} fill="#8a5a33" />)}<path d="M-210 -330 H210 L190 -380 H-190Z" fill="#a8242c" /><path d="M-210 -330 H210" stroke="#e2b84a" strokeWidth={9} />{[-170, -110, -50, 10, 70, 130, 190].map((x, i) => <path key={i} d={`M${x} -330 v26`} stroke="#e2b84a" strokeWidth={5} />)}<path d="M-190 -330 L-176 -130 M190 -330 L176 -130" stroke="#a8242c" strokeWidth={18} /></g>);
    case 'ceiling': return (<g {...OL}><path d="M-380 -250 Q-380 -560 0 -560 Q380 -560 380 -250Z" fill="#d9ccae" />{[[-250, -430, '#4f86c6'], [-60, -490, '#e0a458'], [130, -490, '#d9695f'], [260, -420, '#6bbf8a']].map(([x, y, col], i) => <rect key={i} x={(x as number) - 60} y={y as number} width={120} height={110} rx={10} fill={col as string} opacity={0.85} />)}<path d="M-380 -250 H380" strokeWidth={8} /><rect x={-330} y={-300} width={660} height={16} fill="#8a5a33" />{[-300, -100, 100, 300].map((x, i) => <path key={i} d={`M${x} -284 V0`} stroke="#6b4a2a" strokeWidth={14} />)}</g>);
    case 'castlewin': { const open = p.t !== 'closed'; return (<g {...OL}><rect x={-190} y={-480} width={380} height={480} fill="#bdb6a6" />{[0, 1, 2, 3, 4, 5, 6].map((r) => <path key={r} d={`M-190 ${-r * 68} H190`} stroke="#9a9384" strokeWidth={3} />)}<rect x={-70} y={-380} width={140} height={210} rx={4} fill={open ? '#1b1410' : '#6b4a2a'} /><path d="M-70 -380 Q0 -440 70 -380Z" fill="#bdb6a6" />{open ? <g><path d="M-70 -380 L-130 -366 L-130 -184 L-70 -170Z" fill="#6b4a2a" /><path d="M70 -380 L130 -366 L130 -184 L70 -170Z" fill="#6b4a2a" /></g> : <path d="M0 -380 V-170" stroke="#3a2a1a" strokeWidth={5} />}<rect x={-90} y={-170} width={180} height={18} fill="#a9a393" /></g>); }
    case 'troop': return <Troop p={p} f={f} seed={seed} />;
    case 'legion': return (<g>{Array.from({length: p.n ?? 12}, (_, i) => { const col = i % 4, row = Math.floor(i / 4); return <g key={i} transform={`translate(${col * 78 - 120 + Math.sin(f / 5 + i) * 0} ${-row * 26 + Math.abs(Math.sin(f / 6 + col)) * -5}) scale(0.4)`}><Actor a={{x: 0, y: 0, look: 'legionary', pose: 'idle', held: 'spear', shield: true, raw: true}} seed={`${seed}l${i}`} /></g>; })}</g>);
    case 'fire': return (<g><Flame f={f} k={0} w={60 * (p.s ?? 1)} h={170} /><g transform="translate(-44 0)"><Flame f={f} k={1} w={40} h={110} /></g><g transform="translate(46 0)"><Flame f={f} k={2} w={44} h={130} /></g></g>);
    case 'smoke': return <Smoke x={0} y={0} f={f} col={c ?? '#cfcfcf'} />;
    case 'sun': return (<g><circle cx={0} cy={0} r={130} fill="#fff3b0" opacity={0.35} /><circle cx={0} cy={0} r={74} fill="#ffe27a" stroke={INK} strokeWidth={0} /></g>);
    case 'moon': return (<g><circle r={110} fill="#fff" opacity={0.12} /><circle r={62} fill="#f4f1e0" /><circle cx={-18} cy={-10} r={10} fill="#d9d5c0" /><circle cx={20} cy={18} r={14} fill="#d9d5c0" /></g>);
    case 'cloud': return (<g fill="#fff" opacity={0.95}><ellipse cx={0} cy={0} rx={110} ry={34} /><circle cx={-40} cy={-22} r={42} /><circle cx={24} cy={-34} r={52} /><circle cx={70} cy={-10} r={34} /></g>);
    case 'sign': {
      const F = fit(p.t ?? '', {fs: 44, minFs: 24, maxW: 600, maxLines: 3}), bw = Math.max(260, F.w + 56), bh = Math.max(100, F.h + 44), sc = p.s ?? 1;
      const hl = (bw / 2) * sc, shift = Math.max(SAFE.l + hl - p.x, Math.min(SAFE.r - hl - p.x, 0)) / sc, sh = Math.min(shift, 0) + Math.max(shift, 0);
      return (<g {...OL}><rect x={-6} y={-200} width={12} height={200} fill="#6b5a45" /><g transform={`translate(${sh} 0)`}><rect x={-bw / 2} y={-190 - bh} width={bw} height={bh} rx={10} fill={c ?? '#f3e2b3'} />{F.lines.map((ln, i) => <text key={i} x={0} y={-190 - bh + 22 + F.fs * 0.85 + i * F.lh} textAnchor="middle" fontFamily={HAND} fontSize={F.fs} fill={INK} stroke="none">{ln}</text>)}</g></g>);
    }
    case 'banner': {
      const F = fit(p.t ?? '', {fs: 44, minFs: 26, maxW: 1100, maxLines: 2}), bw = F.w + 80, bh = F.h + 28, sc = p.s ?? 1;
      const hl = (bw / 2) * sc, sh = Math.max(SAFE.l + hl - p.x, Math.min(SAFE.r - hl - p.x, 0)) / sc;
      return (<g {...OL} transform={`translate(${sh} 0)`}><rect x={-bw / 2} y={-bh / 2} width={bw} height={bh} rx={8} fill={c ?? '#f6c945'} /><rect x={-bw / 2 + 6} y={-bh / 2 + 6} width={bw - 12} height={bh - 12} rx={5} fill="none" stroke="#b8860b" strokeWidth={2} />{F.lines.map((ln, i) => <text key={i} x={0} y={-bh / 2 + 14 + F.fs * 0.85 + i * F.lh} textAnchor="middle" fontFamily={HAND} fontSize={F.fs} fontWeight={700} fill={INK} stroke="none">{ln}</text>)}</g>);
    }
    case 'crowd': return (<g>{Array.from({length: p.n ?? 6}, (_, i) => {
      const set = p.t === 'roman' ? ['senator', 'senator', 'merchant', 'senator', 'farmer', 'senator'] : p.t === 'legion' ? ['legionary'] : p.t === 'barb' ? ['barbarian', 'barbarian', 'gaul'] : p.t === 'gaul' ? ['gaul'] : ['blue', 'green', 'worker', 'farmer', 'woman', 'merchant'];
      const lk = set[i % set.length];
      return <g key={i} transform={`translate(${i * 70 - ((p.n ?? 6) * 70) / 2} ${(i % 2) * 16}) scale(0.42)`}><Actor a={{x: 0, y: 0, look: lk, pose: i % 3 === 0 ? 'cheer' : 'idle', raw: true}} seed={`${seed}c${i}`} /></g>;
    })}</g>);
    case 'crate': return (<g {...OL}><rect x={-50} y={-80} width={100} height={80} fill="#b98a55" /><path d="M-50 -80 L50 0 M50 -80 L-50 0" stroke="#7a5233" strokeWidth={5} /></g>);
    case 'road': return (<g><rect x={-(p.n ?? 1800) / 2} y={-40} width={p.n ?? 1800} height={80} fill={c ?? '#5b606b'} stroke={INK} strokeWidth={3} />{Array.from({length: Math.floor((p.n ?? 1800) / 120)}, (_, i) => <rect key={i} x={-(p.n ?? 1800) / 2 + 20 + i * 120} y={-4} width={70} height={8} fill="#f2e08a" />)}</g>);
    case 'waves': return (<g fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.7}>{Array.from({length: 8}, (_, i) => <path key={i} d={`M${i * 240 - 100 + Math.sin(f / 20 + i) * 20} ${Math.sin(i * 2) * 14} q40 -22 80 0 t80 0`} />)}</g>);
    case 'mosque': { const col = c ?? '#e9e1cf', dm = '#7f8fa3'; return (<g {...OL}><Shadow w={300} />
      {[-235, 235].map((x, i) => (<g key={i}><rect x={x - 14} y={-430} width={28} height={430} fill={col} /><rect x={x - 22} y={-310} width={44} height={10} fill={mix(col, -0.2)} /><path d={`M${x - 18} -430 L${x} -530 L${x + 18} -430Z`} fill={dm} /><path d={`M${x} -530 v-22`} strokeWidth={4} /><circle cx={x} cy={-558} r={7} fill="#f2c230" /></g>))}
      <rect x={-200} y={-150} width={400} height={150} fill={col} /><rect x={-200} y={-150} width={60} height={150} fill="#000" opacity={0.06} stroke="none" />
      <path d="M-200 -150 Q-200 -230 -140 -230 Q-100 -230 -100 -150Z M200 -150 Q200 -230 140 -230 Q100 -230 100 -150Z" fill={dm} />
      <path d="M-125 -150 Q-125 -340 0 -340 Q125 -340 125 -150Z" fill={dm} /><path d="M-125 -150 Q-125 -340 0 -340 Q-40 -280 -45 -150Z" fill="#000" opacity={0.1} stroke="none" /><path d="M0 -340 v-34" strokeWidth={4} /><circle cx={0} cy={-382} r={8} fill="#f2c230" />
      {[-80, -30, 30, 80].map((x, i) => <path key={i} d={`M${x - 10} -90 v-26 a10 10 0 0 1 20 0 v26Z`} fill="#3a4a63" />)}<path d="M-26 0 v-52 a26 26 0 0 1 52 0 v52Z" fill="#6b4226" /></g>); }
    case 'minaret': { const col = c ?? '#e9e1cf'; return (<g {...OL}><Shadow w={50} /><rect x={-16} y={-440} width={32} height={440} fill={col} /><rect x={-26} y={-320} width={52} height={12} fill={mix(col, -0.2)} /><path d="M-20 -440 L0 -550 L20 -440Z" fill="#7f8fa3" /><path d="M0 -550 v-24" strokeWidth={4} /><circle cx={0} cy={-580} r={7} fill="#f2c230" />{[-250, -150, -60].map((y, i) => <rect key={i} x={-5} y={y} width={10} height={26} rx={5} fill="#3a4a63" />)}</g>); }
    case 'bombard': { const t = (f % 150) / 150, fire = p.t === 'fire'; const rec = fire ? (t < 0.08 ? -34 * (t / 0.08) : -34 * Math.max(0, 1 - (t - 0.08) / 0.25)) : 0; const bx = 215 + Math.max(0, t - 0.08) * 2300, by = -66 - Math.sin(Math.max(0, t - 0.08) * 7) * 90;
      return (<g {...OL}><Shadow w={260} /><rect x={-170} y={-40} width={380} height={26} fill="#7a5233" /><rect x={-150} y={-14} width={40} height={14} fill="#5a3d2a" /><rect x={110} y={-14} width={40} height={14} fill="#5a3d2a" /><path d="M-150 -40 L-110 -80 H-80 L-60 -40Z" fill="#8a5a33" />
        <g transform={`translate(${rec} 0)`}><path d="M-170 -62 L205 -88 L205 -38 L-170 -30Z" fill="#6a6f78" />{[-120, -40, 40, 120].map((x, i) => <path key={i} d={`M${x} ${-58 - (x + 170) * 0.07} V${-32 + (x + 170) * 0.0}`} stroke={INK} strokeWidth={6} />)}<ellipse cx={205} cy={-63} rx={12} ry={26} fill="#2b2d33" /></g>
        {fire && t < 0.2 && <circle cx={230} cy={-63} r={30 * (1 - t * 3.5)} fill="#fbb02d" />}{fire && t > 0.06 && t < 0.5 && <circle cx={bx} cy={by} r={20} fill="#8f8a80" />}{fire && <Smoke x={230} y={-70} f={f} col="#d9d4c8" />}</g>); }
    case 'cage': return (<g {...OL}><Shadow w={150} /><rect x={-120} y={-250} width={240} height={250} fill="#1a1412" opacity={0.3} />{Array.from({length: 8}, (_, i) => <rect key={i} x={-116 + i * 33} y={-250} width={10} height={250} fill="#6b6f78" />)}<rect x={-132} y={-266} width={264} height={18} fill="#4a4e57" /><rect x={-132} y={-14} width={264} height={14} fill="#4a4e57" /></g>);
    case 'cauldron': { const pot = (<g><path d="M-80 -96 Q-92 -12 -52 -2 H52 Q92 -12 80 -96Z" fill="#b87333" /><ellipse cx={0} cy={-96} rx={80} ry={16} fill="#d9954f" /><ellipse cx={0} cy={-96} rx={66} ry={10} fill="#5a3a1e" /><circle cx={-88} cy={-70} r={10} fill="none" strokeWidth={5} /><circle cx={88} cy={-70} r={10} fill="none" strokeWidth={5} /></g>);
      return (<g {...OL}><Shadow w={100} />{p.t === 'flip' ? <g transform="translate(0 -98) scale(1 -1)">{pot}</g> : <>{pot}{[0, 1, 2].map((i) => { const u = ((f + i * 20) % 60) / 60; return <circle key={i} cx={-26 + i * 26} cy={-110 - u * 70} r={8 + u * 10} fill="#fff" opacity={0.7 * (1 - u)} stroke="none" />; })}</>}</g>); }
    case 'tulips': { const n = p.n ?? 7; return (<g {...OL}>{Array.from({length: n}, (_, i) => { const x = (i - (n - 1) / 2) * 46, sw = Math.sin(f / 26 + i) * 3, h = 90 + ((i * 37) % 50), col = ['#d63b3b', '#f2c230', '#e86fa5', '#f07f2a'][i % 4]; return (<g key={i} transform={`translate(${x} 0) rotate(${sw})`}><path d={`M0 0 V${-h}`} stroke="#3f8a45" strokeWidth={6} fill="none" /><path d={`M0 ${-h * 0.35} q-30 -6 -28 -44 q24 8 28 44Z`} fill="#4f9d4a" /><path d={`M-17 ${-h} Q-20 ${-h - 36} 0 ${-h - 44} Q20 ${-h - 36} 17 ${-h}Z`} fill={col} /></g>); })}</g>); }
    case 'cup': return (<g {...OL}><Shadow w={44} /><path d="M-34 -52 H34 L26 0 H-26Z" fill="#f4efe4" /><path d="M34 -42 q28 4 18 24 q-6 8 -20 8" fill="none" strokeWidth={6} /><ellipse cx={0} cy={-52} rx={34} ry={8} fill="#4a2c1a" />{[0, 1, 2].map((i) => { const u = ((f + i * 22) % 66) / 66; return <path key={i} d={`M${-12 + i * 12} ${-62 - u * 50} q6 -10 0 -18`} fill="none" stroke="#fff" strokeWidth={4} opacity={0.8 * (1 - u)} />; })}</g>);
    case 'silkcord': { const sw = Math.sin(f / 24) * 3; return (<g transform={`rotate(${sw} 0 -330)`}><path d="M0 -330 C-80 -250 -80 -120 0 -90 C80 -120 80 -250 0 -330" fill="none" stroke={INK} strokeWidth={15} strokeLinecap="round" /><path d="M0 -330 C-80 -250 -80 -120 0 -90 C80 -120 80 -250 0 -330" fill="none" stroke={c ?? '#a8242c'} strokeWidth={9} strokeLinecap="round" /><g {...OL}><rect x={-7} y={-92} width={14} height={20} fill="#f2c230" /><path d="M-10 -72 L-14 -30 M0 -72 V-26 M10 -72 L14 -30" stroke="#a8242c" strokeWidth={5} /></g></g>); }
    case 'crescent': return (<g {...OL}><path d="M20 -62 A52 52 0 1 0 20 42 A42 42 0 1 1 20 -62Z" fill={c ?? '#f2c230'} /><path d="M52 -10 L55 -1 L65 -1 L57 5 L60 14 L52 9 L44 14 L47 5 L39 -1 L49 -1Z" fill={c ?? '#f2c230'} /></g>);
    case 'tug': { const sw = Math.sin(f / 14) * 6; return (<g {...OL}><Shadow w={30} /><rect x={-4} y={-430} width={8} height={430} fill="#8a5a33" /><circle cx={0} cy={-446} r={14} fill="#f2c230" /><path d="M-30 -400 H30" strokeWidth={6} /><path d={`M-24 -400 Q${-30 + sw} -340 ${-18 + sw} -280 L-6 -400Z M24 -400 Q${30 - sw} -340 ${18 - sw} -280 L6 -400Z M0 -400 Q${sw} -330 ${sw * 0.5} -250 L-8 -400 L8 -400Z`} fill="#efe9dc" /></g>); }
    case 'trench': { const w = p.n ?? 700; return (<g {...OL}><rect x={-w / 2} y={-34} width={w} height={34} fill="#5a4630" />{Array.from({length: Math.floor(w / 70)}, (_, i) => <ellipse key={i} cx={-w / 2 + 36 + i * 70} cy={-38} rx={34} ry={16} fill={i % 2 ? '#b8a37a' : '#a38d63'} />)}{Array.from({length: Math.floor(w / 220)}, (_, i) => <path key={i} d={`M${-w / 2 + 110 + i * 220} -50 l60 -70`} strokeWidth={6} />)}</g>); }
    case 'steamship': { const bob = Math.sin(f / 18 + p.x) * 5, col = c ?? '#6a6f78'; return (<g {...OL} transform={`translate(0 ${bob})`}><path d="M-240 -72 L240 -72 L196 8 L-206 8Z" fill={col} /><rect x={-130} y={-120} width={210} height={50} fill={mix(col, 0.12)} /><rect x={-40} y={-168} width={64} height={48} fill={mix(col, 0.2)} />{[-100, 20].map((x, i) => (<g key={i}><rect x={x} y={-250} width={32} height={132} fill="#3a3d44" /><rect x={x} y={-250} width={32} height={16} fill="#c0392b" /></g>))}<path d="M150 -92 L230 -108 M-170 -92 L-230 -104" strokeWidth={9} /><Smoke x={-84} y={-250} f={f} col="#8a8a8a" /><Smoke x={36} y={-250} f={f + 30} col="#8a8a8a" /></g>); }
    case 'bazaar': return (<g {...OL}><Shadow w={170} /><rect x={-132} y={-210} width={12} height={210} fill="#8a5a33" /><rect x={120} y={-210} width={12} height={210} fill="#8a5a33" />{Array.from({length: 6}, (_, i) => <path key={i} d={`M${-144 + i * 48} -236 h48 v62 q-24 14 -48 0Z`} fill={i % 2 ? (c ?? '#c0392b') : '#f4efe4'} />)}<rect x={-144} y={-90} width={288} height={90} fill="#b98a55" />{[-90, -40, 10, 60, 100].map((x, i) => <circle key={i} cx={x} cy={-102} r={15} fill={['#d63b3b', '#f2c230', '#7bc47f', '#f07f2a', '#d63b3b'][i]} />)}</g>);
    case 'serail': { const col = c ?? '#e3d8bf'; return (<g {...OL}><Shadow w={320} /><rect x={-300} y={-150} width={600} height={150} fill={col} />{Array.from({length: 14}, (_, i) => <rect key={i} x={-298 + i * 43} y={-166} width={26} height={18} fill={col} />)}{[-250, -90, 90, 250].map((x, i) => (<g key={i}><rect x={x - 30} y={-250} width={60} height={250} fill={mix(col, -0.06)} /><path d={`M${x - 38} -250 L${x} -350 L${x + 38} -250Z`} fill="#8a3b2e" /></g>))}<path d="M-40 0 V-90 a40 40 0 0 1 80 0 V0Z" fill="#3a2a22" /><path d="M-300 -150 H300" strokeWidth={5} /></g>); }
    case 'chain': { const w = p.n ?? 800, k = Math.floor(w / 28); return (<g {...OL}>{Array.from({length: k}, (_, i) => { const u = i / (k - 1), y = Math.sin(u * Math.PI) * 24 - 80; return <ellipse key={i} cx={-w / 2 + u * w} cy={y} rx={17} ry={9} fill="none" stroke="#5a5f68" strokeWidth={7} transform={`rotate(${i % 2 ? 90 : 0} ${-w / 2 + u * w} ${y})`} />; })}<rect x={-w / 2 - 14} y={-110} width={28} height={110} fill="#6a6f78" /><rect x={w / 2 - 14} y={-110} width={28} height={110} fill="#6a6f78" /></g>); }
    case 'scroll': return (<g {...OL}><Shadow w={100} /><rect x={-92} y={-150} width={184} height={150} rx={8} fill="#efe4c8" /><ellipse cx={-92} cy={-75} rx={12} ry={75} fill="#d9c9a0" /><ellipse cx={92} cy={-75} rx={12} ry={75} fill="#d9c9a0" />{[-110, -88, -66, -44, -22].map((y, i) => <path key={i} d={`M-66 ${y} H${i % 2 ? 50 : 66}`} stroke="#6b5430" strokeWidth={4} />)}<circle cx={52} cy={-26} r={14} fill="#a8242c" /></g>);
    case 'press': { const lv = Math.sin(f / 22) * 24; return (<g {...OL}><Shadow w={110} /><rect x={-80} y={-34} width={160} height={34} fill="#7a5233" /><rect x={-70} y={-250} width={16} height={218} fill="#8a5a33" /><rect x={54} y={-250} width={16} height={218} fill="#8a5a33" /><rect x={-78} y={-268} width={156} height={22} fill="#7a5233" /><rect x={-5} y={-250} width={10} height={140} fill="#6a6f78" /><path d={`M${-70 + lv} -214 L${70 + lv} -222`} strokeWidth={9} /><rect x={-50} y={-110} width={100} height={14} fill="#6a6f78" /><rect x={-44} y={-76} width={88} height={42} fill="#fffaf0" /></g>); }
    case 'dome': { const gold = c ?? '#f2b630'; return (<g {...OL}><Shadow w={230} /><path d="M-200 0 V-120 L-150 -190 H150 L200 -120 V0Z" fill="#3f78b8" /><path d="M-200 -120 L-150 -190 H150 L200 -120Z" fill="#2f5f9a" />
      {Array.from({length: 9}, (_, i) => <path key={i} d={`M${-168 + i * 42} -30 v-54 a14 14 0 0 1 28 0 v54Z`} fill="#e9f1fa" strokeWidth={2} />)}<rect x={-200} y={-132} width={400} height={12} fill="#e9f1fa" strokeWidth={2} />
      <path d="M-112 -190 V-215 Q-112 -380 0 -380 Q112 -380 112 -215 V-190Z" fill={gold} /><path d="M-112 -190 V-215 Q-112 -380 0 -380 Q-46 -300 -50 -190Z" fill="#000" opacity={0.12} stroke="none" /><path d="M0 -380 v-40" strokeWidth={4} /><circle cx={0} cy={-428} r={8} fill={gold} /></g>); }
    case 'masada': { const g = p.t === 'ramp' ? Math.min(1, f / 150) : 0, tx = -480 + 248 * g, ty = -330 * g; return (<g {...OL}><Shadow w={380} />
      <path d="M-330 0 L-290 -150 L-250 -330 L-210 -350 H190 L240 -340 L280 -160 L330 0Z" fill="#c9a574" /><path d="M-330 0 L-290 -150 L-250 -330 L-210 -350 L-190 -200 L-210 0Z" fill="#000" opacity={0.1} stroke="none" />
      {[-60, -160, -250].map((y, i) => <path key={i} d={`M${-300 + i * 18} ${y} H${300 - i * 22}`} stroke="#8a6f48" strokeWidth={3} opacity={0.5} fill="none" />)}
      <rect x={-210} y={-376} width={400} height={26} fill="#e6d3ab" />{Array.from({length: 12}, (_, i) => <rect key={i} x={-210 + i * 34} y={-394} width={20} height={18} fill="#e6d3ab" />)}<path d="M0 -394 v-62" strokeWidth={4} /><path d="M0 -456 h46 v28 h-46Z" fill="#fbfaf4" />
      {g > 0 && <path d={`M-480 0 L${tx} ${ty} L${tx + 40} ${ty} L-250 0Z`} fill="#b08a5a" />}</g>); }
    case 'jtemple': { const burn = p.t === 'burn'; return (<g {...OL}><Shadow w={400} /><rect x={-380} y={-130} width={760} height={130} fill="#e0d2b0" />{Array.from({length: 7}, (_, i) => <path key={i} d={`M${-285 + i * 95} -130 V0`} stroke="#a99a78" strokeWidth={3} />)}<path d="M-380 -80 H380 M-380 -40 H380" stroke="#a99a78" strokeWidth={3} />
      <rect x={-150} y={-300} width={300} height={170} fill={burn ? '#6a4a3a' : '#f3ead0'} /><rect x={-90} y={-420} width={180} height={122} fill={burn ? '#5a3d30' : '#f7f0da'} /><rect x={-96} y={-434} width={192} height={16} fill={burn ? '#3a2a22' : '#d9b24a'} />
      {[-120, -60, 0, 60, 120].map((x, i) => <rect key={i} x={x - 9} y={-290} width={18} height={158} fill={burn ? '#4a3228' : '#e9dfc0'} strokeWidth={2} />)}
      {burn && [-150, -50, 50, 150].map((x, i) => <g key={i} transform={`translate(${x} ${-130 - (i % 2) * 150})`}><Flame f={f} k={i} w={56} h={160} /></g>)}{burn && <Smoke x={-60} y={-434} f={f} col="#3a2a2a" />}{burn && <Smoke x={60} y={-434} f={f + 25} col="#3a2a2a" />}</g>); }
    case 'sepulchre': return (<g {...OL}><Shadow w={200} /><rect x={-170} y={-150} width={340} height={150} fill="#d9ccaa" /><rect x={-170} y={-150} width={50} height={150} fill="#000" opacity={0.07} stroke="none" /><rect x={110} y={-300} width={60} height={150} fill="#cfc19c" /><path d="M104 -300 L140 -352 L176 -300Z" fill="#8a7a62" />
      <path d="M-110 -150 Q-110 -290 0 -290 Q110 -290 110 -150Z" fill="#8f9aa6" /><rect x={-12} y={-322} width={24} height={34} fill="#d9ccaa" /><path d="M0 -322 v-44 M-14 -348 h28" strokeWidth={5} /><path d="M-60 0 V-64 a26 26 0 0 1 52 0 V0Z M8 0 V-64 a26 26 0 0 1 52 0 V0Z" fill="#5a3d2a" /></g>);
    case 'menorah': { const gold = c ?? '#f2b630'; return (<g {...OL}><Shadow w={90} /><path d="M-44 0 H44 L30 -24 H-30Z" fill={gold} />{[-3, -2, -1, 1, 2, 3].map((i) => <g key={i}><path d={`M0 -70 Q${i * 30} -70 ${i * 30} -130 V-236`} fill="none" stroke={INK} strokeWidth={18} /><path d={`M0 -70 Q${i * 30} -70 ${i * 30} -130 V-236`} fill="none" stroke={gold} strokeWidth={11} /></g>)}<path d="M0 -24 V-236" stroke={INK} strokeWidth={18} /><path d="M0 -24 V-236" stroke={gold} strokeWidth={11} />
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => <ellipse key={i} cx={i * 30} cy={-258} rx={8} ry={14 + Math.sin(f / 4 + i) * 2.5} fill="#ffcf4a" strokeWidth={2} />)}</g>); }
    case 'truecross': return (<g {...OL}><Shadow w={70} />{p.t === 'glow' && <circle cx={0} cy={-190} r={150} fill="#fff3b0" opacity={0.35 + 0.1 * Math.sin(f / 10)} stroke="none" />}<rect x={-16} y={-330} width={32} height={330} fill="#8a5a33" /><rect x={-86} y={-270} width={172} height={30} fill="#8a5a33" /><path d="M-6 -320 V-10 M-80 -255 H80" stroke="#5a3d22" strokeWidth={2.5} fill="none" /></g>);
    case 'jar': return (<g {...OL}><Shadow w={70} /><path d="M-40 -150 Q-78 -90 -50 -22 Q-40 0 0 0 Q40 0 50 -22 Q78 -90 40 -150Z" fill={c ?? '#b9774a'} /><rect x={-34} y={-172} width={68} height={26} rx={6} fill={mix(c ?? '#b9774a', -0.15)} /><path d="M-60 -92 Q0 -70 60 -92" fill="none" stroke="#7a4a2c" strokeWidth={4} />{p.t === 'open' && <path d="M-22 -172 q-4 -50 6 -86 q8 4 4 86Z M10 -172 q8 -40 28 -70 q4 8 -12 70Z" fill="#efe4c8" />}</g>);
    case 'key': { const sw = Math.sin(f / 40) * 2, iron = c ?? '#7a7f88'; return (<g {...OL} transform={`rotate(${sw} 0 -330)`}><circle cx={0} cy={-290} r={38} fill="none" stroke={INK} strokeWidth={22} /><circle cx={0} cy={-290} r={38} fill="none" stroke={iron} strokeWidth={14} /><rect x={-18} y={-258} width={36} height={14} fill={iron} /><rect x={-9} y={-246} width={18} height={196} fill={iron} /><path d="M9 -92 H48 V-72 H28 V-56 H48 V-36 H9Z" fill={iron} /></g>); }
    case 'shells': { const n = p.n ?? 6; return (<g {...OL}>{Array.from({length: n}, (_, i) => { const x = (i - (n - 1) / 2) * 74, bob = Math.sin(f / 20 + i) * 2; return (<g key={i} transform={`translate(${x} ${bob})`}><path d="M0 0 Q-34 -6 -32 -34 Q-16 -58 0 -58 Q16 -58 32 -34 Q34 -6 0 0Z" fill="#fbf1e2" /><path d="M0 0 V-52 M-14 -4 L-22 -42 M14 -4 L22 -42" fill="none" stroke="#c8a98a" strokeWidth={2.5} /><text x={0} y={-14} textAnchor="middle" fontFamily={HAND} fontSize={24} fill={INK} stroke="none">{i + 1}</text></g>); })}</g>); }
    case 'jet': { const t = p.t === 'fly' ? ((f % 120) / 120) * 2400 - 600 : 0; return (<g {...OL} transform={`translate(${t} 0)`}><path d="M-120 -40 L100 -34 Q140 -30 160 -26 Q140 -18 100 -14 L-120 -14Z" fill="#9aa3ae" /><path d="M-120 -40 L-150 -78 L-124 -78 L-90 -40Z" fill="#7d8794" /><path d="M-30 -30 L-90 4 L-60 4 L20 -22Z" fill="#7d8794" /><path d="M20 -38 Q50 -56 72 -38Z" fill="#8ec9ee" /><path d="M-120 -26 l-44 4 l44 4Z" fill="#ffb347" /></g>); }
    case 'desk': return (<g {...OL}><Shadow w={120} /><rect x={-110} y={-70} width={220} height={16} fill="#8a5a33" /><rect x={-98} y={-54} width={14} height={54} fill="#6b4226" /><rect x={84} y={-54} width={14} height={54} fill="#6b4226" /><rect x={-60} y={-92} width={90} height={22} fill="#efe4c8" /><path d="M30 -72 L58 -134 L66 -130 L42 -72Z" fill="#f4efe4" /><circle cx={-76} cy={-82} r={9} fill="#2b2d33" /></g>);
    case 'watertower': return (<g {...OL}><Shadow w={70} /><path d="M-60 0 L-40 -190 M60 0 L40 -190 M-20 0 V-190 M20 0 V-190" fill="none" strokeWidth={8} /><path d="M-80 -190 H80 L66 -330 Q0 -352 -66 -330Z" fill="#cfd4da" /><path d="M-70 -250 H70" strokeWidth={3} /><path d="M-66 -330 L0 -392 L66 -330Z" fill="#8a9099" /></g>);
    case 'podium': return (<g {...OL}><Shadow w={60} /><path d="M-56 0 L-44 -150 H44 L56 0Z" fill="#7a5233" /><path d="M-62 -150 H62 L52 -176 H-52Z" fill="#8a5a33" /><path d="M0 -176 v-40" strokeWidth={5} /><circle cx={0} cy={-224} r={9} fill="#2b2d33" /></g>);
    case 'crossflag': { const sw = Math.sin(f / 12) * 4; return (<g {...OL}><rect x={-3} y={-380} width={7} height={380} fill="#8a5a33" /><path d={`M4 -372 Q70 ${-384 + sw} 140 -372 L140 -270 Q70 ${-282 - sw} 4 -270Z`} fill="#fbfaf4" /><path d="M72 -368 V-274 M30 -322 H116" stroke="#c0392b" strokeWidth={20} /></g>); }
    case 'seder': return (<g {...OL}><Shadow w={150} /><rect x={-170} y={-96} width={340} height={14} fill="#8a5a33" /><path d="M-150 -82 V0 M150 -82 V0" strokeWidth={10} /><path d="M-170 -96 H170 L150 -60 H-150Z" fill="#fffaf0" /><ellipse cx={-70} cy={-104} rx={52} ry={10} fill="#e9f1fa" /><ellipse cx={70} cy={-104} rx={40} ry={8} fill="#e9f1fa" /><path d="M118 -104 l10 -40 h28 l10 40Z" fill="#a8242c" />{[-8, 24].map((x, i) => <g key={i}><rect x={x} y={-150} width={10} height={46} fill="#fffaf0" /><ellipse cx={x + 5} cy={-162} rx={6} ry={12 + Math.sin(f / 5 + i) * 2} fill="#ffcf4a" stroke="none" /></g>)}</g>);
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
export type BgKind = 'desert' | 'grass' | 'sea' | 'street' | 'interior' | 'steppe' | 'snow' | 'mountains' | 'forest' | 'battlefield' | 'harbor' | 'castle' | 'palace' | 'nile' | 'pyramids' | 'temple' | 'tomb' | 'cathedral' | 'workshop' | 'salon' | 'jerusalem' | 'judean' | 'coast';
export type Tod = 'day' | 'dusk' | 'night' | 'fire';
export type TextT = {t: string; x: number; y: number; at?: number; size?: number; color?: string};
export type StageT = {shake?: {at: number; amp?: number}; flash?: {at: number; c?: string}; bars?: boolean; spot?: {x: number; y: number; r?: number}; bg: BgKind; tod?: Tod; props?: PropT[]; actors?: ActorT[]; texts?: TextT[]; fx?: WeatherKind | WeatherKind[]; cam?: {x?: [number, number]; z?: [number, number]; at?: [number, number]}; shots?: ShotT[]; labels?: LabelT[]};
// Screen-space labels that follow the camera: name (anchored to an actor), faction pill, place, date chip, fact-check badge
export type LabelT = {k: 'name' | 'faction' | 'place' | 'date' | 'fact'; t: string; fac?: string; sub?: string; actor?: number; x?: number; y?: number; c?: string; at?: number; until?: number; below?: boolean};
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
const GROUND: Record<BgKind, string> = {desert: '#dcae72', grass: '#86bb5f', sea: '#2f86c4', street: '#9096a0', interior: '#a06f44', steppe: '#cdb26a', snow: '#eef3f8', mountains: '#8a9a6a', forest: '#4f7f3f', battlefield: '#7a6244', harbor: '#9a7b52', castle: '#8f8a7a', palace: '#d9d2c1', nile: '#9fb35a', pyramids: '#e0c48a', temple: '#cdbf9a', tomb: '#6b5440', cathedral: '#8c8578', workshop: '#8a6a44', salon: '#c9b690', jerusalem: '#d6c19b', judean: '#d3bd92', coast: '#ecd9a8'};
const HZ = 700;

const Hills: React.FC<{seed: string; base: number; amp: number; col: string; dx: number}> = ({seed, base, amp, col, dx}) => {
  const a = 190 + random(`${seed}a`) * 90, b = random(`${seed}b`) * 6;
  const pts: string[] = [];
  for (let x = -800; x <= 2720; x += 60) pts.push(`${x},${base - amp * (0.55 + 0.45 * Math.sin(x / a + b)) - amp * 0.28 * Math.sin(x / 83 + b * 2)}`);
  return <path d={`M-800 1100 L${pts.join(' L')} L2720 1100Z`} fill={col} stroke={INK} strokeWidth={2.5} transform={`translate(${dx} 0)`} />;
};


// ---------- extra backgrounds: a far layer (behind the ground line) and a near layer (on the ground) ----------
const FarExtra: React.FC<{bg: BgKind; seed: string; cx: number; f: number}> = ({bg, seed, cx, f}) => {
  const S = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;

  if (bg === 'jerusalem') {
    return (<g transform={`translate(${-cx * 0.12} 0)`} stroke={INK} strokeWidth={3} strokeLinejoin="round">
      {[[120, 150], [330, 210], [560, 130], [760, 180], [1240, 170], [1470, 120], [1700, 200]].map(([x, h], i) => (<g key={i}><rect x={x - 80} y={HZ - 4 - h} width={160} height={h} fill={i % 2 ? '#e6d3ab' : '#dcc79e'} /><path d={`M${x - 34} ${HZ - 4 - h + 60} v-26 a16 16 0 0 1 32 0 v26Z M${x + 12} ${HZ - 4 - h + 60} v-26 a16 16 0 0 1 32 0 v26Z`} fill="#8a6f48" strokeWidth={2} /></g>))}
      <path d={`M900 ${HZ - 70} V${HZ - 130} Q900 ${HZ - 260} 1000 ${HZ - 260} Q1100 ${HZ - 260} 1100 ${HZ - 130} V${HZ - 70}Z`} fill="#f2b630" /><path d={`M1000 ${HZ - 260} v-28`} strokeWidth={4} />
      <rect x={880} y={HZ - 100} width={240} height={96} fill="#3f78b8" /><rect x={1830} y={HZ - 340} width={40} height={336} fill="#e6d3ab" /><path d={`M1824 ${HZ - 340} L1850 ${HZ - 410} L1876 ${HZ - 340}Z`} fill="#8a6f48" />
      <path d={`M-100 ${HZ - 4} V${HZ - 86} H2100 V${HZ - 4}Z`} fill="#d3bc90" />{Array.from({length: 40}, (_, i) => <rect key={i} x={-90 + i * 54} y={HZ - 104} width={30} height={20} fill="#d3bc90" strokeWidth={2.5} />)}
    </g>);
  }
  if (bg === 'judean') {
    return (<g transform={`translate(${-cx * 0.12} 0)`} stroke={INK} strokeWidth={3} strokeLinejoin="round">
      <path d={`M-100 ${HZ - 4} L-40 ${HZ - 140} L260 ${HZ - 150} L330 ${HZ - 60} L520 ${HZ - 90} L600 ${HZ - 210} L980 ${HZ - 220} L1060 ${HZ - 80} L1400 ${HZ - 120} L1480 ${HZ - 190} L1840 ${HZ - 196} L1920 ${HZ - 70} L2100 ${HZ - 100} V${HZ - 4}Z`} fill="#cdb084" />
      <path d={`M600 ${HZ - 210} L980 ${HZ - 220} L980 ${HZ - 4} L600 ${HZ - 4}Z`} fill="#000" opacity={0.08} stroke="none" />
      {[0, 1, 2].map((i) => <path key={i} d={`M-100 ${HZ - 40 - i * 36} H2100`} stroke="#8a6f48" strokeWidth={2.5} opacity={0.35} />)}
    </g>);
  }
  if (bg === 'coast') {
    return (<g><rect y={HZ - 64} width={1920} height={72} fill="#4fa3d8" stroke="none" /><rect y={HZ - 64} width={1920} height={20} fill="#8fcbee" opacity={0.7} stroke="none" />{Array.from({length: 9}, (_, i) => <path key={i} d={`M${i * 260 - 100 + ((f * 1.5) % 260)} ${HZ - 30 + (i % 3) * 12} q30 -12 60 0 t60 0`} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.65} />)}</g>);
  }
  if (bg === 'mountains' || bg === 'snow') {
    return (<g transform={`translate(${-cx * 0.22} 0)`}>{Array.from({length: 9}, (_, i) => {
      const x = -300 + i * 300 + random(`${seed}m${i}`) * 120, h = 230 + random(`${seed}mh${i}`) * 230, y0 = HZ - 8;
      return (<g key={i}><path d={`M${x - 270} ${y0} L${x} ${y0 - h} L${x + 270} ${y0}Z`} fill={bg === 'snow' ? '#a9b6c8' : '#7d8794'} {...S} /><path d={`M${x - 73} ${y0 - h * 0.73} L${x} ${y0 - h} L${x + 73} ${y0 - h * 0.73} L${x + 34} ${y0 - h * 0.8} L${x} ${y0 - h * 0.7} L${x - 34} ${y0 - h * 0.8}Z`} fill="#fff" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" /></g>);
    })}</g>);
  }
  if (bg === 'forest') {
    return (<g transform={`translate(${-cx * 0.3} 0)`}>{Array.from({length: 34}, (_, i) => {
      const x = -200 + i * 80 + random(`${seed}t${i}`) * 40, h = 150 + random(`${seed}th${i}`) * 130;
      return (<g key={i}><rect x={x - 6} y={HZ - 30} width={12} height={34} fill="#5a3a22" />{[0, 1, 2].map((k) => <path key={k} d={`M${x - 52 + k * 10} ${HZ - 30 - k * h * 0.28} L${x} ${HZ - 30 - h * (0.45 + k * 0.28)} L${x + 52 - k * 10} ${HZ - 30 - k * h * 0.28}Z`} fill={k % 2 ? '#2f6a3c' : '#3a7d46'} {...S} />)}</g>);
    })}</g>);
  }
  if (bg === 'pyramids') {
    return (<g transform={`translate(${-cx * 0.12} 0)`} stroke={INK} strokeWidth={3} strokeLinejoin="round">{[[300, 140, 150], [640, 190, 210], [1020, 120, 130], [1500, 110, 120]].map(([x, h, w], i) => (<g key={i}><path d={`M${x - w} ${HZ - 4} L${x} ${HZ - 4 - h * 1.5} L${x + w} ${HZ - 4}Z`} fill="#e8cf93" /><path d={`M${x} ${HZ - 4 - h * 1.5} L${x + w} ${HZ - 4} L${x + w * 0.3} ${HZ - 4}Z`} fill="#cbb078" stroke="none" /></g>))}</g>);
  }
  if (bg === 'nile') {
    return (<g>
      <g transform={`translate(${-cx * 0.1} 0)`} stroke={INK} strokeWidth={3} strokeLinejoin="round"><path d={`M-100 ${HZ - 4} L-60 ${HZ - 70} L260 ${HZ - 84} L420 ${HZ - 40} L700 ${HZ - 96} L1100 ${HZ - 70} L1380 ${HZ - 110} L1700 ${HZ - 60} L2100 ${HZ - 80} L2100 ${HZ - 4}Z`} fill="#d9b878" /></g>
      <g transform={`translate(${-cx * 0.2} 0)`}>{Array.from({length: 11}, (_, i) => { const x = i * 190 + random(`${seed}pl${i}`) * 80; return (<g key={i} transform={`translate(${x} ${HZ - 2}) scale(0.34)`} stroke={INK} strokeWidth={5}><path d="M-6 0 Q-12 -80 -2 -170 L8 -170 Q-2 -80 6 0Z" fill="#8a6a44" />{[-120, -70, -20, 30, 90].map((a, k) => <path key={k} d={`M0 -170 Q${Math.sin(rad(a)) * 60} ${-206} ${Math.sin(rad(a)) * 110} ${-170 + Math.abs(a) * 0.3}`} fill="none" stroke="#4f9a4a" strokeWidth={10} strokeLinecap="round" />)}</g>); })}</g>
    </g>);
  }
  if (bg === 'castle') {
    return (<g transform={`translate(${-cx * 0.18} 0)`} stroke={INK} strokeWidth={3} strokeLinejoin="round">
      <rect x={-300} y={HZ - 190} width={2600} height={200} fill="#b3ad9c" />
      {Array.from({length: 60}, (_, i) => <rect key={i} x={-300 + i * 44} y={HZ - 226} width={26} height={38} fill="#b3ad9c" />)}
      {Array.from({length: 6}, (_, i) => { const x = 140 + i * 420; return (<g key={i}><rect x={x - 60} y={HZ - 330} width={120} height={340} fill="#a7a190" />{[-48, -16, 16, 48].map((o, j) => <rect key={j} x={x + o - 11} y={HZ - 364} width={22} height={36} fill="#a7a190" />)}<rect x={x - 12} y={HZ - 250} width={24} height={52} rx={12} fill="#2a2018" /></g>); })}
      {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${280 + i * 520} ${HZ - 330})`}><rect x={-3} y={-60} width={6} height={64} fill="#6b4a2a" /><path d="M3 -58 L50 -44 L3 -28Z" fill={i % 2 ? '#b3202a' : '#2b5fb4'} /></g>)}
    </g>);
  }
  if (bg === 'battlefield') {
    return (<g>
      <rect y={HZ - 150} width={1920} height={150} fill="#3a2a22" opacity={0.28} />
      {Array.from({length: 7}, (_, i) => { const x = 140 + i * 280 + random(`${seed}bf${i}`) * 90, rise = ((f * 0.6 + i * 40) % 200); return (<g key={i} transform={`translate(${x - cx * 0.2} ${HZ - 20})`} opacity={0.5}>{[0, 1, 2, 3].map((k) => <circle key={k} cx={Math.sin((rise + k * 30) / 30) * 14} cy={-k * 46 - rise * 0.5} r={30 + k * 9} fill="#4a3f3b" />)}<g transform="translate(0 -4) scale(0.6)"><Flame f={f + i * 5} k={i} w={50} h={90} /></g></g>); })}
    </g>);
  }
  return null;
};
const NearExtra: React.FC<{bg: BgKind; seed: string; cx: number; f: number}> = ({bg, seed, cx, f}) => {
  if (bg === 'steppe') {
    return (<g stroke="#a08a44" strokeWidth={3} strokeLinecap="round" opacity={0.8}>{Array.from({length: 80}, (_, i) => { const x = random(`${seed}g${i}`) * 1920, y = HZ + 20 + random(`${seed}gy${i}`) * 330, sw = Math.sin(f / 18 + i) * 3; return <path key={i} d={`M${x} ${y} q${sw} -14 ${sw * 2} -26 M${x + 6} ${y} q${sw} -12 ${sw * 2 + 4} -22`} fill="none" />; })}</g>);
  }
  if (bg === 'battlefield') {
    return (<g>{Array.from({length: 9}, (_, i) => <ellipse key={i} cx={random(`${seed}mu${i}`) * 1920} cy={HZ + 40 + random(`${seed}mv${i}`) * 300} rx={60 + random(`${seed}mr${i}`) * 80} ry={10 + random(`${seed}mq${i}`) * 14} fill="#4f3d2b" opacity={0.5} />)}
      {Array.from({length: 7}, (_, i) => { const x = 100 + i * 290 + random(`${seed}st${i}`) * 80, y = HZ + 60 + random(`${seed}sy${i}`) * 240; return <path key={i} d={`M${x} ${y} L${x + 26} ${y - 74}`} stroke="#6b4a2a" strokeWidth={6} strokeLinecap="round" />; })}</g>);
  }
  if (bg === 'snow') {
    return (<g fill="#fff" opacity={0.9}>{Array.from({length: 60}, (_, i) => { const x = (random(`${seed}sn${i}`) * 1980 + Math.sin(f / 30 + i) * 20 - 30) % 1920, y = (random(`${seed}sm${i}`) * 1080 + f * (1.4 + (i % 4) * 0.4)) % 1080; return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} />; })}</g>);
  }
  if (bg === 'harbor') {
    return (<g>
      <rect y={HZ - 6} width={1920} height={96} fill="#2f86c4" /><rect y={HZ - 6} width={1920} height={30} fill="#5aa9dc" opacity={0.55} />
      {Array.from({length: 7}, (_, i) => <path key={i} d={`M${i * 300 - 100 + ((f * 2) % 300)} ${HZ + 30 + (i % 3) * 22} q30 -14 60 0 t60 0`} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.6} />)}
      <rect y={HZ + 90} width={1920} height={14} fill="#6d4a2c" stroke={INK} strokeWidth={3} />
      {Array.from({length: 18}, (_, i) => <path key={i} d={`M${i * 120 - 40} ${HZ + 104} L${i * 190 - 360} 1080`} stroke="#000" opacity={0.16} strokeWidth={3} />)}
      {Array.from({length: 8}, (_, i) => <g key={i}><rect x={150 + i * 240} y={HZ + 56} width={16} height={46} fill="#5a3a22" stroke={INK} strokeWidth={3} /></g>)}
    </g>);
  }
  if (bg === 'nile') {
    return (<g>
      <rect y={HZ + 2} width={1920} height={100} fill="#3f93b8" /><rect y={HZ + 2} width={1920} height={26} fill="#78c0d8" opacity={0.6} />
      {Array.from({length: 9}, (_, i) => <path key={i} d={`M${((i * 260 - 80 + f * 1.6) % 2100) - 100} ${HZ + 34 + (i % 3) * 24} q26 -12 52 0 t52 0`} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.55} />)}
      <path d={`M0 ${HZ + 100} Q480 ${HZ + 84} 960 ${HZ + 100} T1920 ${HZ + 96} V${HZ + 130} H0Z`} fill="#b8a468" stroke={INK} strokeWidth={3} />
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M0 ${HZ + 150 + i * 56} H1920`} stroke="#6f8a3a" strokeWidth={3} opacity={0.25} />)}
    </g>);
  }
  if (bg === 'castle') {
    return (<g stroke="#000" opacity={0.14}>{Array.from({length: 14}, (_, i) => <path key={i} d={`M${i * 160 - 100} ${HZ + 10} L${i * 260 - 600} 1080`} strokeWidth={3} />)}{[0, 1, 2, 3].map((i) => <path key={i} d={`M0 ${HZ + 70 + i * 90} H1920`} strokeWidth={3} />)}</g>);
  }
  return null;
};
const Backdrop: React.FC<{bg: BgKind; tod: Tod; f: number; cx: number; seed: string}> = ({bg, tod, f, cx, seed}) => {
  const [t1, t2] = SKY[tod];
  const gc = GROUND[bg];
  const night = tod === 'night' || tod === 'fire';
  if (bg === 'temple') {
    return (
      <g stroke={INK} strokeWidth={3}>
        <rect width={1920} height={1080} fill="#2a2118" stroke="none" />
        <rect y={0} width={1920} height={150} fill="#1b1510" stroke="none" />
        {[0, 1, 2].map((i) => <path key={i} d={`M${320 + i * 560} 0 L${200 + i * 560} 150 L${440 + i * 560} 150Z`} fill="#f6dfa0" opacity={0.16} stroke="none" />)}
        <rect y={150} width={1920} height={620} fill="#b99a64" stroke="none" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => { const x = 140 + i * 270, w = 44; return (<g key={i}><rect x={x - w} y={190} width={w * 2} height={540} fill="#d4b878" /><path d={`M${x - w} 190 Q${x} 150 ${x + w} 190Z`} fill="#c9a968" /><rect x={x - w - 8} y={190} width={w * 2 + 16} height={20} fill="#bfa062" /><rect x={x - w - 10} y={716} width={w * 2 + 20} height={22} fill="#bfa062" />{[0, 1, 2].map((k) => <path key={k} d={`M${x - w} ${300 + k * 120} H${x + w}`} stroke="#2b5fb4" strokeWidth={7} />)}<Glyphs x={x} y={460} n={1} rows={4} /></g>); })}
        <rect y={770} width={1920} height={310} fill="#cdbf9a" stroke="none" />
        {Array.from({length: 14}, (_, i) => <path key={i} d={`M${i * 150 - 100} 770 L${i * 300 - 1000} 1080`} opacity={0.2} />)}{[0, 1, 2].map((i) => <path key={i} d={`M0 ${830 + i * 90} H1920`} opacity={0.2} />)}
      </g>
    );
  }
  if (bg === 'tomb') {
    return (
      <g stroke={INK} strokeWidth={3}>
        <rect width={1920} height={1080} fill="#2b2118" stroke="none" />
        <rect y={110} width={1920} height={640} fill="#6b5440" stroke="none" />
        <rect y={160} width={1920} height={56} fill="#2b5fb4" /><rect y={216} width={1920} height={12} fill="#e2b84a" /><rect y={650} width={1920} height={12} fill="#e2b84a" />
        {Array.from({length: 18}, (_, i) => <g key={i} transform={`translate(${60 + i * 108} 188)`}><GlyphIcon k={i} c="#f1ece0" /></g>)}
        {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${240 + i * 480} 440)`}><rect x={-110} y={-170} width={220} height={320} fill="#e8dcc0" opacity={0.92} /><Glyphs x={0} y={-10} n={3} rows={4} c="#7a5a30" /><path d="M-110 -170 H110 V150 H-110Z" fill="none" strokeWidth={4} stroke="#2b5fb4" /></g>)}
        <rect y={750} width={1920} height={330} fill="#4a3a2a" stroke="none" />
        {Array.from({length: 16}, (_, i) => <path key={i} d={`M${i * 140 - 100} 750 L${i * 300 - 1000} 1080`} opacity={0.22} />)}
        {[330, 1590].map((x, i) => <g key={i} transform={`translate(${x} 470)`}><rect x={-5} y={0} width={10} height={90} fill="#6b4a2a" /><g transform="translate(0 -4) scale(0.5)"><Flame f={f + i * 6} k={i} w={60} h={120} /></g><circle cx={0} cy={-40} r={110} fill="#ffb347" opacity={0.1} stroke="none" /></g>)}
      </g>
    );
  }
  if (bg === 'palace') {
    return (
      <g stroke={INK} strokeWidth={3}>
        <rect width={1920} height={1080} fill="#e6dcc3" stroke="none" />
        {Array.from({length: 5}, (_, i) => <g key={i}><rect x={i * 420 - 20 + 60} y={150} width={90} height={620} fill="#f1ead6" /><rect x={i * 420 + 30} y={130} width={190} height={34} fill="#d9cfb4" /><rect x={i * 420 + 30} y={744} width={190} height={30} fill="#d9cfb4" />{[0, 1, 2].map((k) => <path key={k} d={`M${i * 420 + 85 + k * 24} 170 V744`} opacity={0.25} />)}</g>)}
        {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${i * 420 + 240} 250)`}><rect x={-60} y={0} width={120} height={300} fill={i % 2 ? '#7b2d8e' : '#a8242c'} /><path d="M-60 300 L0 340 L60 300" fill={i % 2 ? '#7b2d8e' : '#a8242c'} /><circle cx={0} cy={110} r={34} fill="#e2b84a" /></g>)}
        <rect y={770} width={1920} height={310} fill="#d9d2c1" />
        {Array.from({length: 16}, (_, i) => <path key={i} d={`M${i * 140 - 100} 770 L${i * 300 - 1100} 1080`} opacity={0.2} />)}{[0, 1, 2].map((i) => <path key={i} d={`M0 ${830 + i * 90} H1920`} opacity={0.2} />)}
      </g>
    );
  }
  if (bg === 'cathedral') {
    return (
      <g stroke={INK} strokeWidth={3}>
        <rect width={1920} height={1080} fill="#3a3340" stroke="none" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${i * 480 - 60} 770 V300 Q${i * 480 + 180} 40 ${i * 480 + 420} 300 V770`} fill="#5a5260" opacity={0.9} />)}
        {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${i * 480 + 180} 330)`}><path d="M-60 200 V-20 Q0 -120 60 -20 V200Z" fill={['#2b5fb4', '#a8242c', '#e2b84a', '#3f8a55'][i]} opacity={0.82} /><path d="M0 -110 V200 M-60 80 H60" strokeWidth={5} /><path d="M0 -110 L-34 -40 M0 -110 L34 -40" opacity={0.0} /></g>)}
        {[0, 1, 2, 3, 4].map((i) => <path key={'b' + i} d={`M${i * 480 - 60} 770 V300`} stroke="#2a2430" strokeWidth={22} />)}
        <path d="M0 0 L240 160 L480 0 L720 160 L960 0 L1200 160 L1440 0 L1680 160 L1920 0" fill="none" opacity={0.5} />
        <rect y={770} width={1920} height={310} fill="#7a7468" />
        {Array.from({length: 12}, (_, i) => <path key={'f' + i} d={`M${i * 190 - 100} 770 L${i * 330 - 800} 1080`} opacity={0.2} />)}{[0, 1, 2].map((i) => <path key={'g' + i} d={`M0 ${830 + i * 90} H1920`} opacity={0.2} />)}
        <circle cx={960} cy={500} r={420} fill="#ffe9a8" opacity={0.08} stroke="none" />
      </g>
    );
  }
  if (bg === 'workshop') {
    return (
      <g stroke={INK} strokeWidth={3}>
        <rect width={1920} height={1080} fill="#cdb48a" stroke="none" />
        {Array.from({length: 24}, (_, i) => <rect key={i} x={i * 90} y={0} width={45} height={740} fill="#000" opacity={0.04} stroke="none" />)}
        <rect x={120} y={140} width={420} height={320} fill="#8ec9ee" /><path d="M330 140 V460 M120 300 H540" strokeWidth={8} /><rect x={110} y={460} width={440} height={20} fill="#6d4a2c" />
        <rect x={1000} y={170} width={780} height={26} fill="#6d4a2c" />{Array.from({length: 11}, (_, i) => <rect key={i} x={1020 + i * 70} y={110 + (i % 3) * 8} width={44} height={60 - (i % 3) * 8} fill={['#a8242c', '#2b5fb4', '#3f8a55', '#b98a55'][i % 4]} />)}
        <rect x={1000} y={330} width={780} height={26} fill="#6d4a2c" />{Array.from({length: 9}, (_, i) => <rect key={'t' + i} x={1030 + i * 82} y={270 + (i % 2) * 10} width={50} height={60 - (i % 2) * 10} fill={['#7a3b2a', '#c4a24a', '#3a4a63'][i % 3]} />)}
        <rect y={730} width={1920} height={34} fill="#6d4a2c" /><rect y={764} width={1920} height={320} fill="#a06f44" />
        {Array.from({length: 10}, (_, i) => <path key={'p' + i} d={`M${i * 220 - 300} 764 L${i * 330 - 700} 1080`} opacity={0.14} />)}
      </g>
    );
  }
  if (bg === 'salon') {
    return (
      <g stroke={INK} strokeWidth={3}>
        <rect width={1920} height={1080} fill="#d9c9a0" stroke="none" />
        {Array.from({length: 4}, (_, i) => <g key={i}><rect x={i * 500 + 80} y={120} width={340} height={560} rx={6} fill="#efe3c0" /><rect x={i * 500 + 110} y={150} width={280} height={500} rx={4} fill="#c9b27a" opacity={0.5} stroke="none" /></g>)}
        {[0, 1, 2, 3].map((i) => <rect key={'c' + i} x={i * 500 + 50} y={110} width={20} height={640} fill="#e2b84a" />)}
        {[0, 1, 2].map((i) => <g key={'l' + i} transform={`translate(${i * 640 + 330} 0)`}><path d="M0 0 V110" /><path d="M-60 110 H60 L40 150 H-40Z" fill="#e2b84a" />{[-40, 0, 40].map((x, k) => <g key={k}><rect x={x - 5} y={80} width={10} height={30} fill="#fffaf0" /><ellipse cx={x} cy={72 + Math.sin(f / 4 + k + i) * 2} rx={5} ry={9} fill="#ffb347" stroke="none" /></g>)}</g>)}
        <rect y={730} width={1920} height={34} fill="#8a6a44" /><rect y={764} width={1920} height={320} fill="#b8a27a" />
        {Array.from({length: 14}, (_, i) => <path key={'q' + i} d={`M${i * 160 - 100} 764 L${i * 300 - 900} 1080`} opacity={0.14} />)}
      </g>
    );
  }
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
      {bg !== 'sea' && bg !== 'street' && bg !== 'harbor' && bg !== 'castle' && bg !== 'coast' && <Hills seed={`${seed}h1`} base={HZ - 20} amp={150} col={mix(gc, bg === 'grass' ? -0.18 : -0.1)} dx={-cx * 0.15} />}
      {bg === 'street' && <g transform={`translate(${-cx * 0.15} 0)`}>{Array.from({length: 22}, (_, i) => {
        const h = 120 + random(`${seed}bh${i}`) * 260;
        return <rect key={i} x={-600 + i * 150} y={HZ - h} width={120} height={h + 10} fill="#8795b3" stroke={INK} strokeWidth={2.5} opacity={0.85} />;
      })}</g>}
      <FarExtra bg={bg} seed={seed} cx={cx} f={f} />
      {bg !== 'sea' && <Hills seed={`${seed}h2`} base={HZ + 20} amp={90} col={mix(gc, -0.04)} dx={-cx * 0.3} />}
      <rect y={HZ} width={1920} height={400} fill={gc} stroke={INK} strokeWidth={0} />
      <rect y={HZ} width={1920} height={5} fill={INK} opacity={0.4} />
      {bg === 'sea' && (<g><rect y={HZ - 6} width={1920} height={400} fill="#2f86c4" /><rect y={HZ - 6} width={1920} height={110} fill="#5aa9dc" opacity={0.55} /><PropArt p={{k: 'waves', x: 0, y: 0}} f={f} seed={seed} />{[0, 1, 2].map((i) => <g key={i} transform={`translate(0 ${HZ + 50 + i * 110})`}><PropArt p={{k: 'waves', x: 0, y: 0}} f={f + i * 14} seed={seed} /></g>)}</g>)}
      <NearExtra bg={bg} seed={seed} cx={cx} f={f} />
      {bg !== 'sea' && <rect y={HZ + 5} width={1920} height={380} fill="#000" opacity={0.04} />}
    </g>
  );
};


const LabelArt: React.FC<{l: LabelT; x: number; y: number; f: number; d: number}> = ({l, x, y, f, d}) => {
  const p = pop(f, 30, (l.at ?? 0) * d), out = l.until !== undefined ? clamp01((l.until * d - f) / 6) : 1;
  const clampX = (hw: number, anchorLeft = false) => (anchorLeft ? Math.min(SAFE.r - 2 * hw, Math.max(SAFE.l, x)) : Math.min(SAFE.r - hw, Math.max(SAFE.l + hw, x)));
  const clampY = (hh: number) => Math.min(SAFE.b - hh, Math.max(SAFE.t + hh, y));
  let X = x, Y = y;
  const body = (() => {
    switch (l.k) {
      case 'name': { const F = fit(l.t, {fs: 34, minFs: 22, maxW: 640, maxLines: 2}), S = l.sub ? fit(l.sub, {fs: 24, minFs: 16, maxW: 640, maxLines: 2}) : null; const w = Math.max(F.w, S?.w ?? 0) + 40, h = F.h + (S ? S.h : 0) + 22; X = clampX(w / 2); Y = clampY(h / 2);
        return (<g><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="#fffaf0" stroke={INK} strokeWidth={3} />{F.lines.map((ln, i) => <text key={i} y={-h / 2 + 11 + F.fs * 0.85 + i * F.lh} textAnchor="middle" fontFamily={HAND} fontSize={F.fs} fontWeight={700} fill={INK}>{ln}</text>)}{S && S.lines.map((ln, i) => <text key={'s' + i} y={-h / 2 + 11 + F.h + S.fs * 0.85 + i * S.lh} textAnchor="middle" fontFamily={HAND} fontSize={S.fs} fill="#6b5a45">{ln}</text>)}</g>); }
      case 'faction': { const F = fit(l.t.toUpperCase(), {fs: 30, minFs: 18, maxW: 600, maxLines: 1}), w = F.w + 40 + l.t.length * 1.5; X = clampX(w / 2); Y = clampY(22); return (<g><rect x={-w / 2} y={-22} width={w} height={44} rx={9} fill={l.c ?? (l.fac ? FACTIONS[l.fac]?.c : undefined) ?? '#c0392b'} stroke="#fff" strokeWidth={3} /><text y={F.fs * 0.34} textAnchor="middle" fontFamily={HAND} fontSize={F.fs} fontWeight={700} fill="#fff" letterSpacing={1.5}>{F.lines[0]}</text></g>); }
      case 'place': { const F = fit(l.t, {fs: 50, minFs: 28, maxW: 1500, maxLines: 2}); X = clampX(F.w / 2 + 10); Y = clampY(F.h / 2); return <g>{F.lines.map((ln, i) => <text key={i} y={i * F.lh} textAnchor="middle" fontFamily={HAND} fontSize={F.fs} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke" strokeLinejoin="round">{ln}</text>)}</g>; }
      case 'date': { const F = fit(l.t, {fs: 36, minFs: 22, maxW: 700, maxLines: 1}), w = F.w + 36; X = clampX(w / 2, true); Y = clampY(25); return (<g><rect x={0} y={-24} width={w} height={50} rx={10} fill="#1f2433" opacity={0.88} /><text x={w / 2} y={F.fs * 0.34} textAnchor="middle" fontFamily={HAND} fontSize={F.fs} fill="#fff">{F.lines[0]}</text></g>); }
      case 'fact': X = clampX(140); Y = clampY(28); return (<g><rect x={-140} y={-28} width={280} height={56} rx={12} fill="#f2c230" stroke={INK} strokeWidth={4} /><circle cx={-106} cy={0} r={18} fill="#2f9e5a" stroke={INK} strokeWidth={3} /><path d="M-116 0 L-108 8 L-95 -8" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /><text x={22} y={11} textAnchor="middle" fontFamily={HAND} fontSize={32} fontWeight={700} fill={INK} letterSpacing={1}>FACT CHECK</text></g>);
    }
  })();
  return <g transform={`translate(${X} ${Y + (1 - p.k) * 14})`} opacity={p.o * out}>{body}</g>;
};

const StageOne: React.FC<{st: StageT; words?: WordT[]; seed: string; avoid?: Rect[]}> = ({st, words, seed, avoid}) => {
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
      {(() => {
        const placed: Rect[] = [...(avoid ?? [])];
        return (st.texts ?? []).map((q, i) => {
          const F = fit(q.t, {fs: q.size ?? 84, minFs: 34, maxW: 1500, maxLines: 2}), bw = F.w + 24, bh = F.h + 10;
          const pb = placeBox(q.x, q.y - F.fs * 0.3, bw, bh, placed);
          placed.push({x0: pb.x - bw / 2, y0: pb.y - bh / 2, x1: pb.x + bw / 2, y1: pb.y + bh / 2});
          const at = (q.at ?? 0) * d, total = q.t.length, n = total ? Math.round(interpolate(f, [at, at + total * 2.2], [0, total], C)) : 0;
          let used = 0;
          return (<g key={i}>{F.lines.map((ln, li) => {
            const sh = Math.max(0, Math.min(ln.length, n - used)); used += ln.length + 1;
            return <text key={li} x={pb.x} y={pb.y - bh / 2 + 5 + F.fs * 0.85 + li * F.lh} textAnchor="middle" fontFamily={HAND} fontSize={F.fs} fill={q.color ?? '#fff'} stroke={INK} strokeWidth={9} paintOrder="stroke" strokeLinejoin="round">{ln.slice(0, sh)}<tspan fill="none" stroke="none">{ln.slice(sh)}</tspan></text>;
          })}</g>);
        });
      })()}
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

export const Stage: React.FC<{st: StageT; words?: WordT[]; seed: string; avoid?: Rect[]}> = (props) => {
  const {durationInFrames: d} = useVideoConfig();
  if (!props.st.shots?.length) return <StageOne {...props} />;
  return (
    <>
      {shotSpans(props.st).map((sp, i) => {
        const from = Math.round(sp.a0 * d), len = Math.max(1, Math.round(sp.a1 * d) - from);
        return (<Sequence key={i} from={from} durationInFrames={len} layout="none"><StageOne st={sp.st} words={props.words} seed={`${props.seed}h${i}`} avoid={props.avoid} /></Sequence>);
      })}
    </>
  );
};
