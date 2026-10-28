// Vidfactory world kit: everything is drawn in code (SVG). No image files.
// Stickman rig (poses, blink, breathing, lip-sync), 25 props, parallax backdrops, a Stage engine.
// Copy once to src/remotion/world.tsx next to kit.tsx. Do not edit per video.
import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
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
export type PoseName = 'idle' | 'point' | 'wave' | 'shrug' | 'think' | 'shock' | 'cheer' | 'open' | 'walk';
export type Face = 'smile' | 'neutral' | 'shock' | 'sad' | 'angry';
type Ang = [number, number];
const POSES: Record<Exclude<PoseName, 'walk'>, {l: Ang; r: Ang}> = {
  idle: {l: [-14, -8], r: [14, 8]},
  point: {l: [-14, -8], r: [80, 88]},
  wave: {l: [-14, -8], r: [140, 158]},
  shrug: {l: [-40, -130], r: [40, 130]},
  think: {l: [-14, -8], r: [24, 160]},
  shock: {l: [-128, -150], r: [128, 150]},
  cheer: {l: [-138, -158], r: [138, 158]},
  open: {l: [-68, -84], r: [68, 84]},
};
export type Look = {hat: 'none' | 'explorer' | 'top' | 'crown' | 'cap' | 'helmet' | 'straw' | 'bowler' | 'tricorn' | 'bun'; shirt: string; pants: string; skin: string; extra?: 'scarf' | 'beard' | 'apron'; ec?: string};
export const LOOKS: Record<string, Look> = {
  narrator: {hat: 'explorer', shirt: '#efe6cf', pants: '#6b5a45', skin: '#f3dcc6', extra: 'scarf', ec: '#c0392b'},
  merchant: {hat: 'top', shirt: '#2b2d42', pants: '#2b2d42', skin: '#efd3b8'},
  banker: {hat: 'bowler', shirt: '#44464f', pants: '#2f3038', skin: '#eed2b6', extra: 'beard', ec: '#6d5a48'},
  king: {hat: 'crown', shirt: '#6a2c91', pants: '#4a1d68', skin: '#f0d2b6', extra: 'beard', ec: '#d8d8d8'},
  soldier: {hat: 'helmet', shirt: '#9a2a2a', pants: '#3d3d4d', skin: '#e7c4a4'},
  sailor: {hat: 'tricorn', shirt: '#e8e8e8', pants: '#2d4a7a', skin: '#dcb592'},
  worker: {hat: 'cap', shirt: '#8a6a4a', pants: '#4d4033', skin: '#d7a985'},
  farmer: {hat: 'straw', shirt: '#5d8a4a', pants: '#6b5a45', skin: '#d9b08c', extra: 'apron', ec: '#e9dcb8'},
  woman: {hat: 'bun', shirt: '#c0526b', pants: '#6d3f4d', skin: '#e8c4a6'},
  blue: {hat: 'none', shirt: '#3b6fb6', pants: '#26467a', skin: '#e9c9a8'},
  green: {hat: 'none', shirt: '#3f9d63', pants: '#276b43', skin: '#dcb58f'},
};
export type ActorT = {who?: string; x: number | [number, number]; y?: number; s?: number; pose?: PoseName; face?: Face; flip?: boolean; say?: string; at?: number; talk?: boolean; look?: string | Look; raw?: boolean};

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
    case 'bun': return (<g {...OL}><circle cx={0} cy={top - 34} r={20} fill="#5a3a28" /><path d={`M-50 ${top + 36} Q-56 ${top - 20} 0 ${top - 18} Q56 ${top - 20} 50 ${top + 36} Q40 ${top + 4} 0 ${top + 2} Q-40 ${top + 4} -50 ${top + 36}Z`} fill="#5a3a28" /></g>);
    default: return null;
  }
};

export const Actor: React.FC<{a: ActorT; words?: WordT[]; seed?: string}> = ({a, words, seed = 'a'}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: d} = useVideoConfig();
  const look: Look = typeof a.look === 'object' ? a.look : LOOKS[a.look ?? a.who ?? 'blue'] ?? LOOKS.blue;
  const ph = random(`${seed}ph`) * 6;
  const x = Array.isArray(a.x) ? interpolate(f, [0, d * 0.85], a.x, {...C, easing: Easing.inOut(Easing.quad)}) : a.x;
  const moving = Array.isArray(a.x) && a.x[0] !== a.x[1] && f < d * 0.85;
  const pose: PoseName = a.pose ?? (moving ? 'walk' : 'idle');
  const sw = Math.sin(f / 22 + ph) * 3;
  const w = f / 6;
  let L: Ang, R: Ang, LL: Ang, RL: Ang;
  if (pose === 'walk') {
    L = [-Math.sin(w) * 30, -Math.sin(w) * 30 - 10];
    R = [Math.sin(w) * 30, Math.sin(w) * 30 + 10];
    LL = [Math.sin(w) * 30, Math.sin(w) * 30 - 12];
    RL = [-Math.sin(w) * 30, -Math.sin(w) * 30 - 12];
  } else {
    const p = POSES[pose];
    L = [p.l[0] - sw, p.l[1] - sw];
    R = [p.r[0] + sw, p.r[1] + sw + (pose === 'wave' ? Math.sin(f / 4) * 22 : 0)];
    LL = [-5, -3];
    RL = [5, 3];
    if (pose === 'cheer') {
      L = [L[0], L[1] + Math.sin(f / 4) * 8];
      R = [R[0], R[1] - Math.sin(f / 4) * 8];
    }
  }
  const t = f / fps;
  const wd = words?.find((q) => t >= q.s && t <= q.e);
  const open = a.talk ? (words?.length ? (wd ? 0.35 + 0.65 * Math.abs(Math.sin(f * 0.9)) : 0.04) : Math.abs(Math.sin(f * 0.4)) * 0.8) : 0;
  if (a.talk && pose !== 'walk') {
    R = [R[0] + Math.sin(f / 5) * 4 * (wd ? 1 : 0.3), R[1] + Math.sin(f / 5 + 1) * 6 * (wd ? 1 : 0.3)];
  }
  const blink = (f + Math.floor(ph * 20)) % 110 < 4;
  const face: Face = a.face ?? 'smile';
  const bob = pose === 'walk' ? -Math.abs(Math.sin(w)) * 7 : pose === 'cheer' ? -Math.abs(Math.sin(f / 4)) * 14 : Math.sin(f / 14 + ph) * 1.6;
  const hipY = -150, shY = -268, headY = -340 + bob * 0.4, HR = 58;
  const shL: [number, number] = [-12, shY + 4 + bob * 0.5], shR: [number, number] = [12, shY + 4 + bob * 0.5];
  const arm = (sh: [number, number], ang: Ang) => {
    const el = P(sh[0], sh[1], 62, ang[0]);
    const hd = P(el[0], el[1], 62, ang[1]);
    return {el, hd};
  };
  const aL = arm(shL, L), aR = arm(shR, R);
  const leg = (hx: number, ang: Ang) => {
    const kn = P(hx, hipY, 75, ang[0]);
    const ft = P(kn[0], kn[1], 75, ang[1]);
    return {kn, ft};
  };
  const lL = leg(-10, LL), lR = leg(10, RL);
  const e = a.at !== undefined ? pop(f, fps, a.at * d) : {o: 1, k: 1};
  const s = (a.s ?? 1) * (a.raw ? 1 : CHAR);
  const ls = (p: [number, number][], w2: number, col: string) => <polyline points={p.map((q) => q.join(',')).join(' ')} fill="none" stroke={col} strokeWidth={w2} strokeLinecap="round" strokeLinejoin="round" />;
  const limb = (p: [number, number][], w2: number, col: string) => (<g>{ls(p, w2 + 6, INK)}{ls(p, w2, col)}</g>);
  const browY = headY - 22;
  const sayT = a.say ? a.say.split(' ') : [];
  const bx = 0;
  return (
    <g transform={`translate(${x} ${a.y ?? 940}) scale(${(a.flip ? -1 : 1) * s * e.k} ${s * e.k})`} opacity={e.o}>
      <ellipse cx={0} cy={4} rx={86} ry={13} fill="#000" opacity={0.18} />
      {limb([[-10, hipY], lL.kn, lL.ft], 14, look.pants)}
      {limb([[10, hipY], lR.kn, lR.ft], 14, look.pants)}
      <path d={`M${lL.ft[0]} ${lL.ft[1]} l16 0`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <path d={`M${lR.ft[0]} ${lR.ft[1]} l16 0`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
      {limb([shL, aL.el, aL.hd], 9, INK)}
      {/* torso */}
      <path d={`M0 ${shY} L0 ${hipY}`} stroke={INK} strokeWidth={52} strokeLinecap="round" />
      <path d={`M0 ${shY} L0 ${hipY - 6}`} stroke={look.shirt} strokeWidth={46} strokeLinecap="round" />
      {look.extra === 'apron' && <rect x={-16} y={shY + 30} width={32} height={90} rx={8} fill={look.ec} stroke={INK} strokeWidth={3} />}
      {look.extra === 'scarf' && <g fill={look.ec} stroke={INK} strokeWidth={3}><ellipse cx={0} cy={shY - 6} rx={28} ry={11} /><path d={`M10 ${shY} L30 ${shY + 74} L12 ${shY + 62} L2 ${shY + 8}Z`} /></g>}
      <rect x={-24} y={hipY - 8} width={48} height={30} rx={8} fill={look.pants} stroke={INK} strokeWidth={3} />
      {limb([shR, aR.el, aR.hd], 9, INK)}
      <circle cx={aL.hd[0]} cy={aL.hd[1]} r={9} fill={look.skin} stroke={INK} strokeWidth={3} />
      <circle cx={aR.hd[0]} cy={aR.hd[1]} r={9} fill={look.skin} stroke={INK} strokeWidth={3} />
      {/* head */}
      <path d={`M0 ${shY - 18} L0 ${headY + HR - 4}`} stroke={INK} strokeWidth={9} />
      <circle cx={0} cy={headY} r={HR} fill={look.skin} stroke={INK} strokeWidth={4} />
      {look.extra === 'beard' && <path d={`M-42 ${headY + 8} Q0 ${headY + 84} 42 ${headY + 8} Q20 ${headY + 24} 0 ${headY + 24} Q-20 ${headY + 24} -42 ${headY + 8}Z`} fill={look.ec} stroke={INK} strokeWidth={3} />}
      {/* face */}
      {blink ? (<g stroke={INK} strokeWidth={4} strokeLinecap="round"><path d={`M-26 ${headY - 2} h14`} /><path d={`M12 ${headY - 2} h14`} /></g>) : (<g fill={INK}><circle cx={-19} cy={headY - 2} r={face === 'shock' ? 6.5 : 5} /><circle cx={19} cy={headY - 2} r={face === 'shock' ? 6.5 : 5} /></g>)}
      <g stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none">
        {face === 'angry' ? (<><path d={`M-30 ${browY + 2} L-8 ${browY + 12}`} /><path d={`M30 ${browY + 2} L8 ${browY + 12}`} /></>) : face === 'sad' ? (<><path d={`M-30 ${browY + 10} L-8 ${browY}`} /><path d={`M30 ${browY + 10} L8 ${browY}`} /></>) : face === 'shock' ? (<><path d={`M-30 ${browY - 6} Q-19 ${browY - 14} -8 ${browY - 6}`} /><path d={`M30 ${browY - 6} Q19 ${browY - 14} 8 ${browY - 6}`} /></>) : (<><path d={`M-30 ${browY} Q-19 ${browY - 5} -8 ${browY}`} /><path d={`M30 ${browY} Q19 ${browY - 5} 8 ${browY}`} /></>)}
        {a.talk ? null : face === 'smile' ? <path d={`M-16 ${headY + 20} Q0 ${headY + 34} 16 ${headY + 20}`} /> : face === 'sad' || face === 'angry' ? <path d={`M-14 ${headY + 30} Q0 ${headY + 18} 14 ${headY + 30}`} /> : face === 'neutral' ? <path d={`M-12 ${headY + 25} h24`} /> : null}
      </g>
      {a.talk && <ellipse cx={0} cy={headY + 26} rx={face === 'shock' ? 11 : 13} ry={3 + open * 11} fill="#5a1f1f" stroke={INK} strokeWidth={3} />}
      {!a.talk && face === 'shock' && <ellipse cx={0} cy={headY + 28} rx={10} ry={13} fill="#5a1f1f" stroke={INK} strokeWidth={3} />}
      <Hat k={look.hat} top={headY - HR + 4} skin={look.skin} />
      {a.say && (() => {
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
export type PropKind = 'house' | 'tudor' | 'church' | 'cactus' | 'tree' | 'skyscraper' | 'factory' | 'mountain' | 'ship' | 'wall' | 'flag' | 'coins' | 'crown' | 'bank' | 'fire' | 'smoke' | 'sun' | 'moon' | 'cloud' | 'sign' | 'banner' | 'crowd' | 'crate' | 'road' | 'waves';
export type PropT = {k: PropKind; x: number; y: number; s?: number; d?: number; c?: string; t?: string; n?: number; at?: number; flip?: boolean};

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
      const lk = ['blue', 'green', 'worker', 'farmer', 'woman', 'merchant'][i % 6];
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
export type StageT = {bg: BgKind; tod?: Tod; props?: PropT[]; actors?: ActorT[]; texts?: TextT[]; fx?: WeatherKind | WeatherKind[]; cam?: {x?: [number, number]; z?: [number, number]}};
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

export const Stage: React.FC<{st: StageT; words?: WordT[]; seed: string}> = ({st, words, seed}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: d} = useVideoConfig();
  const tod = st.tod ?? 'day';
  const cx = interpolate(f, [0, d], st.cam?.x ?? [0, 0], {...C, easing: Easing.inOut(Easing.quad)});
  const z = interpolate(f, [0, d], st.cam?.z ?? [1, 1.06], {...C, easing: Easing.inOut(Easing.quad)});
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
      <g transform={`translate(960 700) scale(${z}) translate(-960 -700)`}>
        <Backdrop bg={st.bg} tod={tod} f={f} cx={cx} seed={seed} />
        {items.map((q) => q.el)}
        <rect width={1920} height={1080} fill={tint} />
      </g>
      {st.fx && <Weather k={st.fx} seed={seed} />}
      <rect width={1920} height={1080} fill={`url(#vg${seed})`} />
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
