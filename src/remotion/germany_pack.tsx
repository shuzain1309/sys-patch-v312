// Germany pack for the Vidfactory kit. Pure SVG, deterministic (no Math.random, no Date, no CSS animation).
// Contents: FocusOverlay (grey scrim + circular void synced to narration), country characters, 27 props, 6 backgrounds.
// Imported by world.tsx (props, backgrounds, stage overlay) and geo.tsx (map overlay). Do not edit per video.
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

// ================= GREY FOCUS OVERLAY =================
// A dark scrim over the whole frame with a hard-edged circular void. Measured from the reference frame (1366x768 -> 1920x1080):
// scrim #10131a at 52%, void radius 329 centred on the year badge. `at`/`to` are fractions of the scene (same rule as texts.at).
export type FocusT = {at: number; to?: number; x?: number; y?: number; r?: number};
export const YEAR_SPOT = {x: 163, y: 104, r: 329};
export const FocusOverlay: React.FC<{focus?: FocusT | FocusT[]; f: number; d: number; seed: string}> = ({focus, f, d, seed}) => {
  const list = focus ? (Array.isArray(focus) ? focus : [focus]) : [];
  return (
    <g>
      {list.map((q, i) => {
        const a = q.at * d, b = Math.min(d, (q.to ?? q.at + 0.2) * d);
        if (f < a - 1 || f > b + 1) return null;
        const o = Math.min(interpolate(f, [a, a + 7], [0, 1], C), interpolate(f, [b - 8, b], [1, 0], C));
        const r = (q.r ?? YEAR_SPOT.r) * interpolate(f, [a, a + 12], [2.1, 1], {...C, easing: Easing.out(Easing.cubic)});
        const id = `fo${seed}${i}`;
        return (
          <g key={i}>
            <defs><mask id={id}><rect width={1920} height={1080} fill="#fff" /><circle cx={q.x ?? YEAR_SPOT.x} cy={q.y ?? YEAR_SPOT.y} r={r} fill="#000" /></mask></defs>
            <rect width={1920} height={1080} fill="#10131a" opacity={0.52 * o} mask={`url(#${id})`} />
          </g>
        );
      })}
    </g>
  );
};

// ================= COUNTRY CHARACTERS (map-shaped, stick arms and legs) =================
const OUT: Record<string, [number, number][]> = {
  de: [[6.0, 50.8], [6.4, 51.8], [7.0, 52.0], [7.2, 53.35], [8.1, 53.5], [8.7, 53.9], [8.6, 54.9], [9.4, 54.8], [10.2, 54.4], [10.9, 54.0], [12.1, 54.2], [13.4, 54.6], [14.2, 53.9], [14.4, 53.2], [14.1, 52.8], [14.7, 52.1], [15.0, 51.3], [14.8, 50.9], [14.3, 50.9], [13.5, 50.7], [12.5, 50.3], [12.1, 50.3], [12.5, 49.7], [13.8, 48.8], [13.0, 48.3], [13.0, 47.5], [12.2, 47.7], [10.9, 47.5], [10.2, 47.3], [9.6, 47.5], [8.5, 47.6], [7.6, 47.6], [7.6, 48.0], [7.8, 49.0], [8.2, 49.0], [7.0, 49.2], [6.4, 49.5], [6.4, 50.1], [6.1, 50.2]],
  pl: [[14.2, 53.9], [16.0, 54.3], [18.5, 54.8], [19.6, 54.4], [22.8, 54.4], [23.5, 53.9], [23.5, 52.3], [23.9, 51.6], [24.1, 50.5], [22.6, 49.1], [19.5, 49.4], [18.8, 49.5], [17.7, 50.3], [16.4, 50.6], [15.0, 51.0], [14.7, 52.1], [14.1, 52.8], [14.4, 53.2]],
  fr: [[-4.7, 48.4], [-1.8, 48.6], [-1.2, 49.7], [1.6, 50.1], [2.5, 51.1], [4.2, 49.9], [6.1, 49.5], [8.2, 49.0], [7.6, 47.6], [6.1, 46.3], [7.0, 45.9], [7.5, 43.8], [3.1, 43.0], [3.0, 42.4], [-1.8, 43.3], [-1.2, 45.5], [-1.2, 46.2], [-2.2, 47.2], [-4.4, 47.9]],
  ru: [[28, 60], [30, 66], [38, 69], [50, 68], [60, 69], [62, 60], [58, 53], [48, 46], [40, 45], [38, 48], [33, 52], [28, 56]],
};
const COL: Record<string, string> = {de: '#e2b84a', pl: '#d63a3a', fr: '#3b6fb6', ru: '#3f9d63'};
const shapePath = (k: string, H: number) => {
  const pts = OUT[k] ?? OUT.de, lat0 = pts.reduce((s, q) => s + q[1], 0) / pts.length, cs = Math.cos((lat0 * Math.PI) / 180);
  const xy = pts.map(([lo, la]) => [lo * cs, -la] as [number, number]);
  const x0 = Math.min(...xy.map((q) => q[0])), x1 = Math.max(...xy.map((q) => q[0])), y0 = Math.min(...xy.map((q) => q[1])), y1 = Math.max(...xy.map((q) => q[1]));
  const sc = H / (y1 - y0);
  return {d: 'M' + xy.map(([x, y]) => `${((x - (x0 + x1) / 2) * sc).toFixed(1)} ${((y - y1) * sc).toFixed(1)}`).join(' L') + 'Z', w: (x1 - x0) * sc, H};
};
export const Country: React.FC<{t?: string; c?: string; m?: string; f: number; seed: string}> = ({t = 'de', c, m = 'smile', f, seed}) => {
  const H = t === 'ru' ? 200 : 250, sh = shapePath(t, H), col = c ?? COL[t] ?? '#e2b84a', L = 74, gaze = Math.sin(f / 26) * 5;
  const ey = -(L + H * 0.5), emx = 26;
  return (
    <g {...OL}>
      <path d={`M-22 ${-L} L-30 -8 L-46 -2 M22 ${-L} L30 -8 L46 -2`} fill="none" strokeWidth={5} />
      <path d={`M${-sh.w / 2} ${-L - H * 0.55} L${-sh.w / 2 - 54} ${-L - H * 0.45 + Math.sin(f / 9) * 8} M${sh.w / 2} ${-L - H * 0.55} L${sh.w / 2 + 54} ${-L - H * 0.5 - Math.sin(f / 9) * 8}`} fill="none" strokeWidth={5} />
      <g transform={`translate(0 ${-L})`}>
        <clipPath id={`cc${seed}`}><rect x={0} y={-400} width={400} height={400} /></clipPath>
        <path d={sh.d} fill={col} />
        <path d={sh.d} fill={shade(col, -0.16)} stroke="none" clipPath={`url(#cc${seed})`} />
        <path d={sh.d} fill="none" />
        {[-emx, emx].map((x, i) => (<g key={i}><ellipse cx={x} cy={ey + L} rx={15} ry={19} fill="#fff" /><circle cx={x + gaze * (m === 'shock' ? 0.3 : 1)} cy={ey + L + 2} r={m === 'shock' ? 4 : 7} fill={INK} stroke="none" /></g>))}
        {m === 'angry' && <path d={`M-44 ${ey + L - 32} L-12 ${ey + L - 20} M44 ${ey + L - 32} L12 ${ey + L - 20}`} strokeWidth={6} fill="none" />}
        {m === 'smile' && <path d={`M-18 ${ey + L + 38} Q0 ${ey + L + 54} 18 ${ey + L + 38}`} fill="none" />}
        {(m === 'sad' || m === 'sweat') && <path d={`M-18 ${ey + L + 50} Q0 ${ey + L + 34} 18 ${ey + L + 50}`} fill="none" />}
        {m === 'shock' && <ellipse cx={0} cy={ey + L + 46} rx={9} ry={13} fill={INK} />}
        {m === 'angry' && <path d={`M-16 ${ey + L + 46} H16`} strokeWidth={5} fill="none" />}
        {(m === 'sweat' || m === 'sad') && [0, 1].map((i) => (<path key={i} transform={`translate(${sh.w / 2 - 20 + i * 22} ${-H * 0.8 + ((f * 2 + i * 30) % 60)})`} d="M0 -14 Q9 0 0 8 Q-9 0 0 -14Z" fill="#6ec1ff" strokeWidth={2} />))}
        {m === 'fire' && [-70, -10, 50].map((x, i) => (<path key={i} transform={`translate(${x} ${-H + 10})`} d={`M0 0 Q-22 -30 -6 -60 Q${4 + Math.sin(f / 3 + i) * 6} -36 14 -64 Q34 -30 20 0Z`} fill={i % 2 ? '#ffb21f' : '#ff5a1f'} />))}
      </g>
    </g>
  );
};

// ================= PROPS =================
export const GERMANY_PROPS = ['cake', 'seesaw', 'country', 'folder', 'stamp', 'paper', 'newspaper', 'wheelbarrow', 'banknotes', 'balloon', 'plane', 'beetle', 'brandenburg', 'wallseg', 'bulb', 'ballotbox', 'medal', 'eyes', 'barrel', 'inkwell', 'inkstain', 'sausage', 'coaster', 'tablet', 'briefcase', 'gavel', 'tvset'] as const;
export type GermanyKind = (typeof GERMANY_PROPS)[number];
const SET = new Set<string>(GERMANY_PROPS);
export const isGermanyProp = (k: string) => SET.has(k);
const pop01 = (f: number, a: number) => interpolate(f, [a, a + 8], [0, 1], {...C, easing: Easing.out(Easing.back(2))});

export const GermanyProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p, f, seed}) => {
  const c = p.c, t = p.t ?? '';
  switch (p.k as GermanyKind) {
    case 'cake': return (
      <g {...OL}><ellipse cy={-4} rx={140} ry={11} fill="#d9d4c5" /><rect x={-112} y={-86} width={224} height={80} rx={6} fill={p.c2 ?? '#25262c'} />
        <rect x={-78} y={-152} width={156} height={66} rx={6} fill={c ?? '#d9433a'} /><path d="M-78 -152 l13 14 l13 -14 l13 14 l13 -14 l13 14 l13 -14 l13 14 l13 -14 l13 14 l13 -14 l13 14 l13 -14" fill="#fff3d0" />
        {[-80, -27, 27, 80].map((x, i) => <circle key={i} cx={x} cy={-46} r={7} fill={['#d9433a', '#3b82d6', '#f2c230', '#3f9d63'][i]} />)}
        {[-45, -15, 15, 45].map((x, i) => (<g key={i}><rect x={x - 5} y={-184} width={10} height={32} fill="#fff3d0" /><ellipse cx={x} cy={-196 + Math.sin(f / 3 + i) * 2} rx={6} ry={11} fill="#ffb21f" stroke="none" /></g>))}
        <T y={-208} t={t} fs={62} fill="#fff" /></g>);
    case 'seesaw': {
      const mode = t || 'mid', tgt = mode === 'weak' ? -13 : mode === 'strong' ? 13 : 0;
      const ang = mode === 'swing' ? Math.sin(f / 30) * 13 : interpolate(f, [(p.at ?? 0) * 60, (p.at ?? 0) * 60 + 26], [0, tgt], {...C, easing: Easing.out(Easing.back(1.4))});
      const box = (x: number, out: boolean, hot: boolean, hc: string) => (
        <g transform={`translate(${x} -150)`}><rect x={-62} y={-62} width={124} height={124} rx={14} fill="#f6f1e2" stroke={hot ? hc : INK} strokeWidth={hot ? 7 : 3} />
          <g transform="scale(0.34) translate(0 20)"><Country t="de" f={f} seed={`${seed}${x}`} m="smile" /></g>
          {[0, 1, 2, 3].map((i) => { const a = (i * Math.PI) / 2 + Math.PI / 4, ix = Math.cos(a), iy = Math.sin(a); return <path key={i} d={out ? `M${ix * 26} ${iy * 26 - 6} L${ix * 52} ${iy * 52 - 6} m${-iy * 8 - ix * 8} ${ix * 8 - iy * 8} L${ix * 52} ${iy * 52 - 6} L${iy * 8 - ix * 8 + ix * 52} ${-ix * 8 - iy * 8 + iy * 52 - 6}` : `M${ix * 52} ${iy * 52 - 6} L${ix * 26} ${iy * 26 - 6} m${-iy * 8 + ix * 8} ${ix * 8 + iy * 8} L${ix * 26} ${iy * 26 - 6} L${iy * 8 + ix * 8 + ix * 26} ${-ix * 8 + iy * 8 + iy * 26 - 6}`} stroke="#c0392b" strokeWidth={5} fill="none" />; })}
        </g>);
      return (
        <g {...OL}><path d="M-80 0 L0 -112 L80 0Z" fill="#7a4a2a" />
          <g transform={`rotate(${ang} 0 -112)`}><rect x={-330} y={-126} width={660} height={16} rx={6} fill="#b0783f" />
            {box(-250, false, mode === 'weak', '#d9433a')}{box(250, true, mode === 'strong', '#e2b84a')}
            <g transform="translate(0 -126) scale(0.5)"><Country t="de" f={f} seed={seed} m={mode === 'weak' ? 'sad' : mode === 'strong' ? 'angry' : 'smile'} /></g>
            <T x={-250} y={52} t="TOO WEAK" fs={44} fill="#d9433a" sw={0} r={-ang} /><T x={250} y={52} t="TOO STRONG" fs={44} fill="#c9892f" sw={0} r={-ang} /></g></g>);
    }
    case 'country': return <g transform={`scale(${p.flip ? -1 : 1} 1)`}><Country t={t || 'de'} c={c} m={p.m} f={f} seed={seed} /></g>;
    case 'folder': return (
      <g {...OL}><path d="M-170 0 V-250 H-60 L-44 -276 H170 V0Z" fill="#d9bb7a" /><rect x={-150} y={-238} width={320} height={238} fill="#e6c98a" />
        <T x={-6} y={-178} t={t} fs={44} fill={INK} sw={0} />{[0, 1, 2, 3].map((i) => <path key={i} d={`M-120 ${-130 + i * 24} H${80 - (i % 2) * 40}`} stroke="#9a8460" strokeWidth={9} />)}
        {p.tx && <g transform={`translate(0 -52) rotate(-8) scale(${pop01(f, (p.ts ?? 0.5) * 60)})`} opacity={pop01(f, (p.ts ?? 0.5) * 60)}><rect x={-150} y={-30} width={300} height={56} fill="none" stroke="#c0392b" strokeWidth={6} /><T y={10} t={p.tx} fs={36} fill="#c0392b" sw={0} /></g>}</g>);
    case 'stamp': { const k = pop01(f, (p.ts ?? p.at ?? 0) * 60); const w = Math.max(220, t.length * 30 + 40); return (<g transform={`rotate(-8) scale(${k})`} opacity={k}><rect x={-w / 2} y={-44} width={w} height={74} fill="none" stroke={c ?? '#c0392b'} strokeWidth={7} rx={6} /><T y={10} t={t} fs={50} fill={c ?? '#c0392b'} sw={0} /></g>); }
    case 'paper': return (
      <g {...OL}><rect x={-120} y={-310} width={240} height={310} fill="#fbf6e6" /><T y={-262} t={t} fs={34} fill={INK} sw={0} />{Array.from({length: 9}, (_, i) => <path key={i} d={`M-90 ${-224 + i * 26} H${90 - (i % 3) * 30}`} stroke="#a9a08a" strokeWidth={6} />)}
        {p.tx && <g transform={`translate(0 -120) rotate(-10) scale(${pop01(f, (p.ts ?? 0.6) * 60)})`}><rect x={-100} y={-28} width={200} height={52} fill="#fbf6e6" fillOpacity={0.7} stroke="#c0392b" strokeWidth={6} /><T y={10} t={p.tx} fs={34} fill="#c0392b" sw={0} /></g>}</g>);
    case 'newspaper': return (
      <g {...OL} transform="rotate(-4)"><rect x={-190} y={-260} width={380} height={260} fill="#efe9d6" /><T y={-218} t="THE DAILY" fs={34} fill={INK} sw={0} /><path d="M-170 -204 H170" strokeWidth={4} /><T y={-146} t={t} fs={50} fill={INK} sw={0} />{[0, 1, 2].map((i) => <path key={i} d={`M${-165 + i * 118} -100 h100 M${-165 + i * 118} -78 h100 M${-165 + i * 118} -56 h100 M${-165 + i * 118} -34 h70`} stroke="#9a937f" strokeWidth={6} />)}</g>);
    case 'wheelbarrow': return (
      <g {...OL}><circle cx={90} cy={-34} r={34} fill="#3a3a40" /><circle cx={90} cy={-34} r={10} fill="#bdb6a6" /><path d="M-130 -150 L-40 -64 H130 L150 -140Z" fill="#8a5a33" />
        {Array.from({length: p.n ?? 6}, (_, i) => <rect key={i} x={-90 + (i % 3) * 66} y={-190 - Math.floor(i / 3) * 34} width={60} height={32} fill={['#9bb36a', '#b9a36a', '#9a8fb3'][i % 3]} />)}<path d="M-130 -150 L-210 -70 M-40 -64 L-110 -4 M-210 -70 l-10 66" fill="none" strokeWidth={6} /></g>);
    case 'banknotes': {
      if (t === 'kite') { const sw = Math.sin(f / 14) * 12; return (<g {...OL} transform={`rotate(${sw})`}><path d="M0 -240 L60 -170 L0 -90 L-60 -170Z" fill="#b9c98a" /><path d="M0 -240 V-90 M-60 -170 H60" strokeWidth={2} /><path d={`M0 -90 Q${-30 + sw} -50 ${10 - sw} -20 T0 40`} fill="none" strokeWidth={3} />{[-40, -4, 30].map((y, i) => <rect key={i} x={-9 + Math.sin(f / 8 + i) * 8} y={y} width={18} height={11} fill="#b9c98a" />)}</g>); }
      return (<g {...OL}>{Array.from({length: p.n ?? 4}, (_, i) => <rect key={i} x={-90 + (i % 2) * 14} y={-34 - i * 26} width={180} height={28} fill={i % 2 ? '#a9bc7a' : '#b9c98a'} />)}<T y={-34 - (p.n ?? 4) * 26 - 14} t={t} fs={40} fill="#fff" /></g>);
    }
    case 'balloon': { const by = Math.sin(f / 20) * 10; return (
      <g {...OL} transform={`translate(0 ${by})`}><ellipse cx={0} cy={-360} rx={150} ry={170} fill="#d9a05a" />{['#c0392b', '#e2b84a', '#3b6fb6', '#3f9d63', '#b0783f', '#8e5aa8'].map((col, i) => <path key={i} d={`M${-150 + i * 50} ${-360 - 130 * Math.sin(Math.acos((-150 + i * 50) / 150 || 1e-3))} Q${-150 + i * 50 + 25} -360 ${-150 + i * 50 + 50} ${-360 + 60} L${-150 + i * 50} ${-360 + 60}Z`} fill={col} opacity={0.9} />)}
        <path d="M-60 -200 L-34 -80 M60 -200 L34 -80 M0 -190 V-80" fill="none" strokeWidth={3} /><rect x={-40} y={-80} width={80} height={56} fill="#8a5a33" />{[-22, 0, 22].map((x, i) => <circle key={i} cx={x} cy={-86} r={12} fill="#f0d2b6" />)}</g>); }
    case 'plane': { const n = p.n ?? 3; return (
      <g {...OL}><path d="M-230 -50 Q-240 -90 -180 -96 H180 Q250 -96 270 -60 L250 -34 H-180Z" fill="#c9ced6" /><path d="M-220 -90 L-290 -190 H-250 L-170 -92Z" fill="#aeb6c0" /><path d="M-40 -84 L-90 -20 H20 L60 -84Z" fill="#aeb6c0" /><rect x={90} y={-82} width={44} height={22} fill="#8ec9ee" />
        {[-20, 60].map((x, i) => <path key={i} d={`M${x} -30 v${24 + Math.sin(f * 2 + i) * 6}`} strokeWidth={5} />)}{Array.from({length: n}, (_, i) => { const u = ((f / 80 + i / n) % 1), px = 40 - u * 120 + i * 6, py = -20 + u * 260; return u > 0.04 ? (<g key={i} transform={`translate(${px} ${py})`}><path d="M-20 0 Q0 -26 20 0Z" fill="#fff" /><path d="M-20 0 L0 24 L20 0" fill="none" strokeWidth={2} /><rect x={-6} y={24} width={12} height={8} fill="#8a5a33" /></g>) : null; })}</g>); }
    case 'beetle': return (
      <g {...OL}><path d="M-170 -34 Q-176 -92 -100 -112 Q-40 -170 40 -150 Q120 -130 160 -80 Q182 -56 176 -34Z" fill={c ?? '#3f8fc4'} /><path d="M-60 -114 Q-20 -156 36 -142 L40 -100 H-60Z" fill="#cfe6f4" /><path d="M-10 -142 V-100" strokeWidth={4} />{[-100, 100].map((x) => <g key={x}><circle cx={x} cy={-30} r={34} fill="#2b2d33" /><circle cx={x} cy={-30} r={14} fill="#c9ced6" /></g>)}<circle cx={166} cy={-70} r={9} fill="#fff3a0" /></g>);
    case 'brandenburg': return (
      <g {...OL}><rect x={-250} y={-60} width={500} height={60} fill="#cbbf9d" />{[-210, -126, -42, 42, 126, 210].map((x) => <rect key={x} x={x - 20} y={-300} width={40} height={240} fill="#d9cfb0" />)}<rect x={-270} y={-340} width={540} height={42} fill="#cbbf9d" /><rect x={-80} y={-390} width={160} height={50} fill="#d9cfb0" />
        <path d="M-70 -392 q10 -60 40 -40 q10 -44 30 -10 q20 -34 30 10 q30 -20 40 40Z" fill="#6f8a6a" /><circle cx={0} cy={-448} r={14} fill="#6f8a6a" /></g>);
    case 'wallseg': return (
      <g {...OL}>{Array.from({length: p.n ?? 4}, (_, i) => (<g key={i} transform={`translate(${i * 132 - ((p.n ?? 4) - 1) * 66} 0)`}><rect x={-62} y={-240} width={124} height={240} fill="#c3c3bd" /><rect x={-68} y={-262} width={136} height={30} rx={15} fill="#a9a9a3" /><path d="M-62 -130 H62" strokeWidth={2} opacity={0.5} /></g>))}
        <path d={`M${-((p.n ?? 4) * 66)} -276 ${Array.from({length: (p.n ?? 4) * 6}, (_, i) => `q10 ${i % 2 ? 14 : -14} 22 0`).join(' ')}`} fill="none" strokeWidth={3} /></g>);
    case 'bulb': { const g = 0.6 + Math.sin(f / 8) * 0.2; return (<g {...OL}><circle cy={-60} r={90} fill="#ffe98a" opacity={g * 0.35} stroke="none" /><path d="M-24 -20 V-40 Q-56 -60 -52 -88 Q-48 -132 0 -132 Q48 -132 52 -88 Q56 -60 24 -40 V-20Z" fill="#ffe27a" /><rect x={-24} y={-20} width={48} height={22} rx={4} fill="#aeb6c0" /></g>); }
    case 'ballotbox': return (<g {...OL}><rect x={-90} y={-130} width={180} height={130} fill="#3b6fb6" /><rect x={-50} y={-122} width={100} height={12} fill={INK} /><rect x={-34} y={-168 + Math.min(40, (f % 60) * 1.4)} width={68} height={44} fill="#fff" /><T y={-50} t={t} fs={36} /></g>);
    case 'medal': return (<g {...OL}><path d="M-40 -230 L-12 -140 H12 L40 -230Z" fill="#c0392b" /><circle cy={-110} r={64} fill="#f2c230" /><circle cy={-110} r={46} fill="#f7d96a" /><T y={-96} t={t || '1'} fs={52} fill={INK} sw={0} /></g>);
    case 'eyes': { const gx = Math.sin(f / 25 + (p.x % 7)) * 9, gy = Math.cos(f / 31) * 5; return (<g {...OL}>{[-30, 30].map((x) => (<g key={x}><ellipse cx={x} cy={-40} rx={32} ry={38} fill="#fff" /><circle cx={x + gx} cy={-40 + gy} r={14} fill={INK} /><circle cx={x + gx + 5} cy={-46 + gy} r={4} fill="#fff" stroke="none" /></g>))}</g>); }
    case 'barrel': return (<g {...OL}><path d="M-70 0 Q-92 -70 -70 -140 H70 Q92 -70 70 0Z" fill="#9a6a3a" />{[-110, -70, -30].map((y) => <path key={y} d={`M-80 ${y} Q0 ${y + 12} 80 ${y}`} fill="none" strokeWidth={5} stroke="#5a3a1f" />)}{t && <T y={-80} t={t} fs={34} />}</g>);
    case 'inkwell': return (<g {...OL}><path d="M-34 0 V-44 Q-34 -66 0 -66 Q34 -66 34 -44 V0Z" fill="#2b2d42" /><path d="M10 -64 Q60 -170 110 -230 Q70 -170 24 -62Z" fill="#f4f1e6" /></g>);
    case 'inkstain': return (<g stroke="none" fill="#2b2433" opacity={0.9}><path d="M-60 -60 Q-90 -110 -30 -130 Q10 -170 50 -120 Q100 -100 70 -50 Q60 -10 10 -30 Q-40 0 -60 -60Z" />{[-30, 8, 44].map((x, i) => <path key={i} d={`M${x} -40 q4 ${30 + i * 18} 0 ${50 + i * 24} q-6 -20 0 -50Z`} />)}</g>);
    case 'sausage': return (<g {...OL}><ellipse cy={-8} rx={150} ry={20} fill="#efe9d6" />{[-1, 1].map((s, i) => <path key={i} d={`M${s * 100 - 80} ${-40 - i * 4} q0 -26 80 -26 q80 0 80 26 q0 26 -80 26 q-80 0 -80 -26Z`} transform={`translate(${s * 30} ${i * 18})`} fill={i ? '#a9552e' : '#c06a3a'} />)}<T y={-110} t={t || '?'} fs={44} /></g>);
    case 'coaster': {
      const xs = [0, 1, 2, 3, 4, 5, 6].map((i) => i * 330), ys = [-230, -380, -170, -430, -150, -300, -480];
      const a = p.n ?? 0, b = p.ts ?? 6, u = interpolate(f, [(p.at ?? 0) * 60, (p.at ?? 0) * 60 + 150], [a, b], {...C, easing: Easing.inOut(Easing.cubic)});
      const i0 = Math.min(5, Math.floor(u)), fr = u - i0, cx = xs[i0] + (xs[i0 + 1] - xs[i0]) * fr, cy = ys[i0] + (ys[i0 + 1] - ys[i0]) * fr, ang = (Math.atan2(ys[i0 + 1] - ys[i0], xs[i0 + 1] - xs[i0]) * 180) / Math.PI;
      return (<g {...OL}>{xs.map((x, i) => <path key={i} d={`M${x} 0 L${x + 6} ${ys[i]}`} stroke="#8a7a62" strokeWidth={9} />)}<path d={'M' + xs.map((x, i) => `${x} ${ys[i]}`).join(' L')} fill="none" stroke="#b9382f" strokeWidth={16} /><path d={'M' + xs.map((x, i) => `${x} ${ys[i] - 10}`).join(' L')} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="14 10" />
        <g transform={`translate(${cx} ${cy - 22}) rotate(${ang})`}><rect x={-34} y={-24} width={68} height={32} rx={8} fill="#2b2d33" /><g transform="translate(0 -4) scale(0.2)"><Country t="de" f={f} seed={seed} m={fr > 0.5 && ys[i0 + 1] < ys[i0] ? 'smile' : 'shock'} /></g><circle cx={-20} cy={12} r={9} fill="#2b2d33" /><circle cx={20} cy={12} r={9} fill="#2b2d33" /></g></g>);
    }
    case 'tablet': return (<g {...OL}><rect x={-60} y={-90} width={120} height={90} rx={8} fill="#8a5a33" /><rect x={-48} y={-78} width={96} height={66} fill="#d9c79a" />{[0, 1, 2].map((i) => <path key={i} d={`M-36 ${-62 + i * 18} H${24 - i * 8}`} stroke="#8a6d3b" strokeWidth={4} />)}</g>);
    case 'briefcase': return (<g {...OL}><rect x={-70} y={-84} width={140} height={84} rx={8} fill="#6b4a2a" /><path d="M-24 -84 V-104 H24 V-84" fill="none" strokeWidth={6} /><rect x={-8} y={-52} width={16} height={14} fill="#d8b24a" /></g>);
    case 'gavel': return (<g {...OL}><rect x={-10} y={-120} width={20} height={120} fill="#8a5a33" transform="rotate(24)" /><rect x={-60} y={-150} width={120} height={46} rx={8} fill="#6b4a2a" transform="rotate(24 0 -120)" /></g>);
    case 'tvset': return (<g {...OL}><rect x={-120} y={-200} width={240} height={190} rx={14} fill="#6b4a2a" /><rect x={-100} y={-182} width={170} height={150} rx={10} fill="#bfe3ef" /><circle cx={96} cy={-150} r={10} fill="#d8b24a" /><circle cx={96} cy={-110} r={10} fill="#d8b24a" />{t && <T x={-15} y={-100} t={t} fs={40} fill={INK} sw={0} />}</g>);
    default: return null;
  }
};

// ================= BACKGROUNDS (full-frame, same layout as workshop/salon: wall or sky above y 730, floor from 764) =================
export const GERMANY_BGS = ['plain', 'town', 'stadium', 'wallnight', 'office', 'ruins', 'bunker'] as const;
export type GermanyBgKind = (typeof GERMANY_BGS)[number];
export const GERMANY_GROUND: Record<GermanyBgKind, string> = {plain: '#c3c3c3', town: '#c8b48a', stadium: '#7bb157', wallnight: '#8c8a8e', office: '#8a5e3a', ruins: '#6f6a64', bunker: '#7c7f84'};
const BGSET = new Set<string>(GERMANY_BGS);
export const isGermanyBg = (k: string) => BGSET.has(k);
export const GermanyBg: React.FC<{bg: GermanyBgKind; f: number; cx: number; seed: string}> = ({bg, f, cx, seed}) => {
  const S = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  if (bg === 'plain') return <rect width={1920} height={1080} fill="#c3c3c3" />;
  if (bg === 'town') return (
    <g {...S}><defs><linearGradient id={`ts${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fb8e6" /><stop offset="1" stopColor="#e9f5ff" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#ts${seed})`} stroke="none" />
      {[0, 1, 2].map((i) => <g key={i} transform={`translate(${(i * 700 + f * 0.3) % 2300 - 250} ${90 + i * 40})`}><ellipse rx={90} ry={30} fill="#fff" stroke="none" /><ellipse cx={50} cy={-14} rx={60} ry={30} fill="#fff" stroke="none" /></g>)}
      {[0, 1, 2, 3, 4, 5].map((i) => { const x = i * 340 - 120 - cx * 0.2, h = 250 + (i % 3) * 50; return (<g key={i} transform={`translate(${x} 0)`}><rect x={0} y={730 - h} width={290} height={h} fill="#f1e4c3" /><path d={`M-24 ${730 - h} L145 ${730 - h - 190} L314 ${730 - h}Z`} fill="#b3412e" />
        {[0, 100, 200].map((b) => <path key={b} d={`M${b + 40} ${730 - h} V730`} stroke="#6b3f24" strokeWidth={9} />)}<path d={`M0 ${730 - h + 90} H290 M0 ${730 - h + 190} H290`} stroke="#6b3f24" strokeWidth={9} /><rect x={110} y={730 - h + 20} width={70} height={60} fill="#9fd0ef" /><rect x={40} y={730 - h + 110} width={60} height={58} fill="#9fd0ef" /><rect x={190} y={730 - h + 110} width={60} height={58} fill="#9fd0ef" /></g>); })}
      <rect y={730} width={1920} height={360} fill="#c8b48a" />{Array.from({length: 18}, (_, i) => <path key={i} d={`M${i * 120 - 40} 740 L${i * 190 - 380} 1080`} opacity={0.14} />)}</g>);
  if (bg === 'stadium') return (
    <g {...S}><rect width={1920} height={160} fill="#8ec9ee" stroke="none" />{Array.from({length: 11}, (_, i) => <g key={i} transform={`translate(${i * 180 + 60} 40)`}><path d="M0 0 V90" /><path d={`M0 6 q${24 + Math.sin(f / 9 + i) * 4} -8 52 0 v34 q-26 -8 -52 0Z`} fill="#fff" /></g>)}
      <rect y={150} width={1920} height={270} fill="#a89684" />{Array.from({length: 5}, (_, r) => Array.from({length: 40}, (_, i) => <circle key={`${r}-${i}`} cx={24 + i * 48 + (r % 2) * 24} cy={185 + r * 50} r={10} fill={['#2d5fb4', '#d9433a', '#e2b84a', '#fff', '#5a4a3a'][(i * 3 + r * 7) % 5]} stroke="none" />))}
      <rect y={420} width={1920} height={310} fill="#c7603a" />{[0, 1, 2, 3].map((i) => <path key={i} d={`M0 ${470 + i * 60} H1920`} stroke="#fff" strokeWidth={4} opacity={0.7} />)}<rect y={730} width={1920} height={360} fill="#7bb157" /></g>);
  if (bg === 'wallnight') return (
    <g {...S}><defs><linearGradient id={`wn${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b2a52" /><stop offset="1" stopColor="#b98a8e" /></linearGradient></defs><rect width={1920} height={760} fill={`url(#wn${seed})`} stroke="none" />
      <rect x={-20} y={200} width={460} height={530} fill="#555a72" />{Array.from({length: 4}, (_, r) => Array.from({length: 4}, (_, i) => <rect key={`${r}${i}`} x={30 + i * 100} y={240 + r * 110} width={56} height={68} fill={(r + i) % 3 ? '#f4d37a' : '#3b4058'} />))}
      <rect x={1500} y={420} width={500} height={310} fill="#e4e1da" /><rect x={1500} y={400} width={500} height={24} fill="#c9c5ba" />
      <rect x={440} y={730} width={1060} height={360} fill="#d9c490" stroke="none" /><rect y={730} width={440} height={360} fill="#8c8a8e" /><rect x={1500} y={730} width={420} height={360} fill="#8c8a8e" /><path d="M440 730 V1080 M1500 730 V1080" /></g>);
  if (bg === 'office') return (
    <g {...S}><rect width={1920} height={1080} fill="#bfa77f" stroke="none" />{Array.from({length: 24}, (_, i) => <rect key={i} x={i * 90} y={0} width={45} height={740} fill="#000" opacity={0.04} stroke="none" />)}<rect y={560} width={1920} height={170} fill="#8a5e3a" /><rect x={160} y={110} width={260} height={330} fill="#9fd0ef" /><path d="M290 110 V440 M160 275 H420" strokeWidth={7} />
      <rect y={730} width={1920} height={34} fill="#5e3f26" /><rect y={764} width={1920} height={320} fill="#8a5e3a" />{Array.from({length: 10}, (_, i) => <path key={i} d={`M${i * 220 - 300} 764 L${i * 330 - 700} 1080`} opacity={0.14} />)}</g>);
  if (bg === 'ruins') return (
    <g {...S}><defs><linearGradient id={`ru${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#58545a" /><stop offset="1" stopColor="#b59b86" /></linearGradient></defs><rect width={1920} height={740} fill={`url(#ru${seed})`} stroke="none" />
      {Array.from({length: 11}, (_, i) => { const x = i * 190 - 100 - cx * 0.2, h = 200 + ((i * 53) % 220); return <path key={i} d={`M${x} 730 V${730 - h} L${x + 40} ${730 - h + 40} L${x + 70} ${730 - h - 20} L${x + 110} ${730 - h + 70} V730Z`} fill={i % 2 ? '#6c6560' : '#7a726b'} />; })}
      {Array.from({length: 5}, (_, i) => <ellipse key={i} cx={300 + i * 360 + Math.sin(f / 40 + i) * 20} cy={250 + (i % 2) * 70} rx={170} ry={46} fill="#444" opacity={0.28} stroke="none" />)}<rect y={730} width={1920} height={360} fill="#6f6a64" /><path d="M0 760 Q300 740 600 770 T1200 760 T1920 770" fill="none" opacity={0.3} /></g>);
  return (
    <g {...S}><rect width={1920} height={1080} fill="#8e9298" stroke="none" />{Array.from({length: 20}, (_, i) => <rect key={i} x={i * 100} y={0} width={50} height={740} fill="#000" opacity={0.05} stroke="none" />)}<rect x={900} y={0} width={4} height={140} fill="#222" /><path d="M850 140 H954 L930 190 H874Z" fill="#e2b84a" /><ellipse cx={902} cy={196} rx={120} ry={20} fill="#ffe27a" opacity={0.3} stroke="none" /><rect y={730} width={1920} height={34} fill="#6a6e74" /><rect y={764} width={1920} height={320} fill="#7c7f84" /></g>);
};
