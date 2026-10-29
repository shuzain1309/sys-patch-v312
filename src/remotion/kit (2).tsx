// Vidfactory scene kit. Copy ONCE to src/remotion/kit.tsx. Do not edit per video.
// Per-video work = title_script.tsx (data only). Rules: no CSS transitions, no Math.random, no Date.
import React from 'react';
import {AbsoluteFill, Easing, Img, Sequence, getInputProps, getRemotionEnvironment, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {flip} from '@remotion/transitions/flip';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {Stage, NarratorOverlay, Paper, Icon, Weather, HAND, INK, StageT, PropT, ActorT, PoseName, Face, WeatherKind} from './world';
import {GeoMap, GeoT} from './geo';

// ---------- types ----------
export type Tr = 'fade' | 'slide' | 'wipe' | 'flip' | 'none'; // transition INTO this scene
type Base = {id: string; tr?: Tr; hue?: number; year?: string; nar?: PoseName | true; face?: Face; fx?: WeatherKind | WeatherKind[]; sfx?: [number, string, number?][]}; // sfx = scripted sound cues [fractionOfScene, key, volume]. Keys ending _loop loop for the whole scene. year = corner badge; nar = narrator stickman overlay (lip-synced)
export type Scene = Base &
  (
    | {type: 'kinetic'; text: string; hi?: string[]}
    | {type: 'stat'; value: number; label: string; prefix?: string; suffix?: string; decimals?: number}
    | {type: 'photo'; src: string; title?: string; move?: 'in' | 'out' | 'left' | 'right'}
    | {type: 'chapter'; n: number; title: string; kicker?: string; lines?: string[]; st?: StageT}
    | {type: 'quote'; text: string; by: string}
    | {type: 'compare'; unit?: string; a: {label: string; value: number}; b: {label: string; value: number}}
    | {type: 'timeline'; items: {year: string; label: string}[]}
    | {type: 'bars'; title: string; data: {label: string; value: number}[]}
    | {type: 'list'; items: string[]}
    | {type: 'character'; who: string; pose: string; say: string}
    | {type: 'stage'; st: StageT}
    | {type: 'geo'; geo: GeoT}
    | {type: 'pie'; title: string; slices: {label: string; value: number; color?: string}[]}
    | {type: 'line'; title: string; points: {x: string; y: number}[]; unit?: string}
    | {type: 'versus'; aTitle: string; bTitle: string; rows: {icon: string; label: string}[]}
    | {type: 'custom'; render: React.FC<{frames: number}>}
  );
export type Theme = {fps: number; hue: number; bg: string; fg: string; accent: string; accent2: string; music?: string};
export type {StageT, GeoT, PropT, ActorT, PoseName, Face, WeatherKind};
export type Timing = {seconds: number; words?: {w: string; s: number; e: number}[]}; // s,e = seconds from scene start

// ---------- helpers ----------
const font = (f: () => {fontFamily: string}) => (typeof window === 'undefined' ? 'sans-serif' : f().fontFamily);
const BODY = font(() => loadInter('normal', {weights: ['700', '800'], subsets: ['latin']})); // few weights = few font requests
const HEAD = font(() => loadAnton('normal', {weights: ['400'], subsets: ['latin']}));
const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const useP = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: d} = useVideoConfig();
  return {f, fps, d};
};
const sp = (f: number, fps: number, delay = 0) => spring({frame: f - delay, fps, config: {damping: 14, stiffness: 140}});
const op = (v: number) => Math.min(1, Math.max(0, v));
const rise = (f: number, at: number, px = 40) => ({
  opacity: op(interpolate(f, [at, at + 14], [0, 1], C)),
  translate: `0 ${interpolate(f, [at, at + 14], [px, 0], {...C, easing: OUT})}px`,
});

// ---------- always-on layers (kill the "slideshow" look) ----------
const Bg: React.FC<{hue: number; T: Theme; seed: string}> = ({hue, T, seed}) => {
  const {f} = useP();
  const blob = (i: number) => {
    const x = 50 + 38 * Math.sin(f / 90 + i * 2.1 + random(`${seed}x${i}`) * 6);
    const y = 50 + 32 * Math.cos(f / 110 + i * 1.7 + random(`${seed}y${i}`) * 6);
    return `radial-gradient(circle at ${x}% ${y}%, hsla(${hue + i * 14},62%,40%,0.30), transparent 46%)`;
  };
  return <AbsoluteFill style={{background: `${blob(0)}, ${blob(1)}, ${blob(2)}, ${T.bg}`}} />;
};

const Particles: React.FC<{T: Theme; seed: string}> = ({T, seed}) => {
  const {f} = useP();
  return (
    <AbsoluteFill>
      {Array.from({length: 16}, (_, i) => {
        const r = 3 + random(`${seed}r${i}`) * 7;
        const v = 0.3 + random(`${seed}v${i}`) * 0.9;
        const y = ((((random(`${seed}y${i}`) * 1200 - f * v * 2) % 1200) + 1200) % 1200) - 60;
        return <div key={i} style={{position: 'absolute', left: random(`${seed}x${i}`) * 1920, top: y, width: r, height: r, borderRadius: '50%', background: T.accent, opacity: 0.25}} />;
      })}
    </AbsoluteFill>
  );
};

const Camera: React.FC<{dir: number; children: React.ReactNode}> = ({dir, children}) => {
  const {f, d} = useP();
  const t = interpolate(f, [0, d], [0, 1], {...C, easing: Easing.inOut(Easing.quad)});
  return <AbsoluteFill style={{scale: String(1 + 0.07 * t), translate: `${dir * -40 * t}px ${-14 * t}px`}}>{children}</AbsoluteFill>;
};

// ---------- scene types ----------
type S<K extends Scene['type']> = {s: Extract<Scene, {type: K}>; T: Theme};

const Kinetic: React.FC<S<'kinetic'>> = ({s, T}) => {
  const {f, fps, d} = useP();
  const words = s.text.split(' ');
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '100px 160px'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 30px', maxWidth: '100%', fontFamily: HEAD, fontSize: words.length > 6 ? 104 : 130, lineHeight: 1.08, textTransform: 'uppercase', textAlign: 'center'}}>
        {words.map((w, i) => {
          const p = sp(f, fps, Math.round((i / words.length) * d * 0.6));
          const hot = s.hi?.includes(w.toLowerCase().replace(/[^a-z0-9]/g, ''));
          return <span key={i} style={{margin: hot ? '0 16px' : 0, opacity: op(p), translate: `0 ${(1 - op(p)) * 60}px`, scale: String((hot ? 1.12 : 1) * (0.8 + 0.2 * p)), color: hot ? T.accent : T.fg}}>{w}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const Stat: React.FC<S<'stat'>> = ({s, T}) => {
  const {f, fps} = useP();
  const v = interpolate(f, [8, 8 + fps * 1.8], [0, s.value], {...C, easing: OUT});
  const ring = interpolate(f, [0, fps * 1.8], [0, 1], {...C, easing: OUT});
  const dec = s.decimals ?? 0;
  const txt = `${s.prefix ?? ''}${v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec})}${s.suffix ?? ''}`;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <svg width={780} height={780} viewBox="0 0 100 100" style={{position: 'absolute', rotate: `${-90 + f * 0.25}deg`}}>
        <circle cx={50} cy={50} r={46} fill="none" stroke={T.fg} strokeOpacity={0.12} strokeWidth={0.8} />
        <circle cx={50} cy={50} r={46} fill="none" stroke={T.accent} strokeWidth={1.4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring * 0.78} />
      </svg>
      <div style={{fontFamily: HEAD, fontSize: 220, scale: String(0.9 + 0.1 * op(sp(f, fps)))}}>{txt}</div>
      <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 52, color: T.accent2, ...rise(f, 20)}}>{s.label}</div>
    </AbsoluteFill>
  );
};

const Photo: React.FC<S<'photo'>> = ({s, T}) => {
  const {f, d} = useP();
  const t = interpolate(f, [0, d], [0, 1], C);
  const m = s.move ?? 'in';
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <Img src={staticFile(s.src)} style={{width: '100%', height: '100%', objectFit: 'cover', scale: String(m === 'out' ? 1.28 - 0.2 * t : 1.06 + 0.2 * t), translate: `${m === 'left' ? -70 * t : m === 'right' ? 70 * t : 0}px 0`}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle, transparent 45%, rgba(0,0,0,.7) 100%)'}} />
      {s.title && (
        <div style={{position: 'absolute', left: 120, bottom: 190, fontFamily: HEAD, fontSize: 84, textTransform: 'uppercase', borderLeft: `10px solid ${T.accent}`, paddingLeft: 28, color: T.fg, ...rise(f, 10)}}>{s.title}</div>
      )}
    </AbsoluteFill>
  );
};

const PRESETS: StageT[] = [
  {bg: 'sea', tod: 'dusk', props: [{k: 'ship', x: 620, y: 790, s: 1.5}, {k: 'ship', x: 1380, y: 760, s: 0.8}, {k: 'cloud', x: 300, y: 200, d: 0.2}]},
  {bg: 'grass', tod: 'night', fx: 'fog', props: [{k: 'tree', x: 260, y: 840}, {k: 'tudor', x: 1450, y: 810, t: 'lit'}, {k: 'tree', x: 1750, y: 860, s: 1.2}]},
  {bg: 'desert', tod: 'day', props: [{k: 'mountain', x: 1000, y: 720, s: 1.7, d: 0.3}, {k: 'cactus', x: 320, y: 910}, {k: 'cactus', x: 1700, y: 930, s: 1.2}]},
  {bg: 'street', tod: 'dusk', props: [{k: 'skyscraper', x: 380, y: 860, n: 460}, {k: 'factory', x: 1250, y: 880}, {k: 'skyscraper', x: 700, y: 860, n: 320, c: '#c9b79a'}]},
  {bg: 'interior', tod: 'day', props: [{k: 'bank', x: 960, y: 770, s: 0.95}]},
];
const Chapter: React.FC<S<'chapter'> & {tm?: Timing}> = ({s, T, tm}) => {
  const {f, fps, d} = useP();
  const st = s.st ?? PRESETS[(s.n - 1) % PRESETS.length];
  const w = s.title.split(' ');
  const lines = s.lines ?? (w.length < 3 ? [s.title] : [w.slice(0, Math.ceil(w.length / 2)).join(' '), w.slice(Math.ceil(w.length / 2)).join(' ')]);
  const cols = ['#ffd84a', '#ffffff', '#ffd84a'];
  let delay = 14;
  return (
    <AbsoluteFill>
      <Stage st={st} words={tm?.words} seed={s.id} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.05) 0%, rgba(0,0,0,.45) 100%)'}} />
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: HAND, fontSize: 52, letterSpacing: 6, color: T.accent2, ...rise(f, 6)}}>CHAPTER {s.n}</div>
      {s.kicker && <div style={{position: 'absolute', top: 200, width: '100%', textAlign: 'center', fontFamily: HAND, fontSize: 62, color: '#bfe3ff', textShadow: '0 4px 14px rgba(0,0,0,.6)', ...rise(f, 30)}}>{s.kicker}</div>}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingTop: 120}}>
        {lines.map((ln, li) => {
          const start = delay;
          delay += ln.length * 1.3 + 8;
          const size = lines.length === 1 ? 168 : li === 0 ? 120 : 156;
          return (
            <div key={li} style={{display: 'flex', gap: size * 0.12, fontFamily: HAND, fontSize: size, lineHeight: 1.1, color: cols[li % 3], textTransform: 'uppercase', whiteSpace: 'pre', WebkitTextStroke: '12px #241c17', paintOrder: 'stroke fill'} as any}>
              {ln.split('').map((ch, ci) => {
                const p = sp(f, fps, start + ci * 1.3);
                return <span key={ci} style={{display: 'inline-block', opacity: op(p * 2), translate: `0 ${(1 - op(p)) * 60 + Math.sin(f / 16 + ci) * 3}px`, scale: String(0.5 + 0.5 * p), rotate: `${(1 - op(p)) * (ci % 2 ? 14 : -14)}deg`}}>{ch}</span>;
              })}
            </div>
          );
        })}
        <div style={{height: 8, borderRadius: 4, marginTop: 28, background: T.accent, width: interpolate(f, [delay, delay + 26], [0, 900], {...C, easing: OUT})}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Quote: React.FC<S<'quote'>> = ({s, T}) => {
  const {f, fps, d} = useP();
  const words = s.text.split(' ');
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: '0 220px'}}>
      <div style={{position: 'absolute', top: 120, left: 150, fontFamily: HEAD, fontSize: 480, color: T.accent, opacity: 0.35, scale: String(op(sp(f, fps)))}}>“</div>
      <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 84, lineHeight: 1.2}}>
        {words.map((w, i) => (
          <span key={i} style={{opacity: op(interpolate(f, [(i / words.length) * d * 0.6, (i / words.length) * d * 0.6 + 8], [0, 1], C)), marginRight: 18}}>{w}</span>
        ))}
      </div>
      <div style={{marginTop: 40, fontFamily: BODY, fontSize: 48, color: T.accent2, ...rise(f, Math.round(d * 0.65))}}>— {s.by}</div>
    </AbsoluteFill>
  );
};

const Compare: React.FC<S<'compare'>> = ({s, T}) => {
  const {f, fps} = useP();
  const mx = Math.max(s.a.value, s.b.value);
  const col = (c: {label: string; value: number}, k: 0 | 1) => {
    const at = 10 + k * 8;
    const p = interpolate(f, [at, at + fps * 1.4], [0, 1], {...C, easing: OUT});
    return (
      <div key={k} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontFamily: HEAD, fontSize: 100}}>{Math.round(c.value * p).toLocaleString('en-US')}{s.unit ?? ''}</div>
        <div style={{width: 280, height: (c.value / mx) * 560 * p, background: k ? T.accent2 : T.accent, borderRadius: '18px 18px 0 0'}} />
        <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 48, marginTop: 20}}>{c.label}</div>
      </div>
    );
  };
  return <AbsoluteFill style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 240, paddingBottom: 150}}>{col(s.a, 0)}{col(s.b, 1)}</AbsoluteFill>;
};

const Timeline: React.FC<S<'timeline'>> = ({s, T}) => {
  const {f, fps, d} = useP();
  const n = s.items.length;
  const [x0, x1] = [240, 1680];
  const lineP = interpolate(f, [0, d * 0.7], [0, 1], {...C, easing: OUT});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: x0, top: 537, height: 6, width: (x1 - x0) * lineP, background: T.accent, borderRadius: 3}} />
      {s.items.map((it, i) => {
        const x = n === 1 ? 960 : x0 + ((x1 - x0) * i) / (n - 1);
        const p = sp(f, fps, Math.round((i / n) * d * 0.7));
        const up = i % 2 === 0;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: 540, opacity: op(p), scale: String(0.4 + 0.6 * p)}}>
            <div style={{position: 'absolute', width: 40, height: 40, borderRadius: '50%', background: T.accent2, translate: '-50% -50%'}} />
            <div style={{position: 'absolute', top: up ? -230 : 50, width: 360, translate: '-50% 0', textAlign: 'center'}}>
              <div style={{fontFamily: HEAD, fontSize: 84, color: T.accent}}>{it.year}</div>
              <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 44, lineHeight: 1.2}}>{it.label}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Bars: React.FC<S<'bars'>> = ({s, T}) => {
  const {f, fps} = useP();
  const mx = Math.max(...s.data.map((r) => r.value));
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: '0 180px', gap: 26}}>
      <div style={{fontFamily: HEAD, fontSize: 84, textTransform: 'uppercase', marginBottom: 20, ...rise(f, 0)}}>{s.title}</div>
      {s.data.map((r, i) => {
        const at = 6 + i * 6;
        const p = interpolate(f, [at, at + fps * 1.2], [0, 1], {...C, easing: OUT});
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 28}}>
            <div style={{width: 380, textAlign: 'right', fontFamily: BODY, fontWeight: 700, fontSize: 44}}>{r.label}</div>
            <div style={{height: 56, width: (r.value / mx) * 1000 * p, background: i % 2 ? T.accent2 : T.accent, borderRadius: 10}} />
            <div style={{fontFamily: HEAD, fontSize: 56, opacity: op(p)}}>{r.value.toLocaleString('en-US')}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const List: React.FC<S<'list'>> = ({s, T}) => {
  const {f, fps} = useP();
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: '0 260px', gap: 34}}>
      {s.items.map((t, i) => {
        const p = sp(f, fps, 8 + i * 10);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 30, opacity: op(p), translate: `${(1 - op(p)) * 300}px 0`}}>
            <div style={{width: 76, height: 76, borderRadius: '50%', background: T.accent, color: T.bg, fontFamily: HEAD, fontSize: 48, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 68}}>{t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Character: React.FC<S<'character'>> = ({s, T}) => {
  const {f, fps, d} = useP();
  const words = s.say.split(' ');
  return (
    <AbsoluteFill>
      {/* sprites: public/characters/<who>_<pose>.png (transparent PNG, committed once) */}
      <Img src={staticFile(`characters/${s.who}_${s.pose}.png`)} style={{position: 'absolute', left: 140, bottom: 60, height: 760, translate: `${(1 - op(sp(f, fps))) * -500}px ${Math.sin(f / 9) * 10}px`}} />
      <div style={{position: 'absolute', left: 900, top: 220, maxWidth: 880, background: T.fg, color: T.bg, padding: 48, borderRadius: 40, fontFamily: BODY, fontWeight: 800, fontSize: 64, lineHeight: 1.2, opacity: op(sp(f, fps, 12)), scale: String(0.8 + 0.2 * sp(f, fps, 12))}}>
        {words.map((w, i) => (
          <span key={i} style={{opacity: op(interpolate(f, [16 + (i / words.length) * d * 0.55, 22 + (i / words.length) * d * 0.55], [0, 1], C)), marginRight: 14}}>{w}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const INKC = '#1f2430';
const PAL = ['#e0a458', '#4f86c6', '#6bbf8a', '#d9695f', '#9b7fd1', '#e8d27a'];

const Pie: React.FC<S<'pie'>> = ({s}) => {
  const {f, fps} = useP();
  const tot = s.slices.reduce((a, b) => a + b.value, 0);
  const sweep = interpolate(f, [6, 6 + fps * 1.6], [0, 1], {...C, easing: OUT});
  let acc = 0;
  const R = 330, cx = 960, cy = 590;
  const big = s.slices.reduce((m, q, i) => (q.value > s.slices[m].value ? i : m), 0);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', fontFamily: HAND, fontSize: 96, color: INKC, ...rise(f, 0)}}>{s.title}</div>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <ellipse cx={cx} cy={cy + R + 20} rx={R * 0.9} ry={26} fill="#000" opacity={0.12} />
        {s.slices.map((q, i) => {
          const a0 = (acc / tot) * Math.PI * 2 * sweep - Math.PI / 2;
          acc += q.value;
          const a1 = (acc / tot) * Math.PI * 2 * sweep - Math.PI / 2;
          const mid = (a0 + a1) / 2;
          const ex = i === big ? 18 * op(sweep) : 0;
          const [x0, y0, x1, y1] = [Math.cos(a0) * R, Math.sin(a0) * R, Math.cos(a1) * R, Math.sin(a1) * R];
          const large = a1 - a0 > Math.PI ? 1 : 0;
          const col = q.color ?? PAL[i % PAL.length];
          return (
            <g key={i} transform={`translate(${cx + Math.cos(mid) * ex} ${cy + Math.sin(mid) * ex})`}>
              <path d={`M0 0 L${x0} ${y0} A${R} ${R} 0 ${large} 1 ${x1} ${y1}Z`} fill={col} stroke={INKC} strokeWidth={4} strokeLinejoin="round" />
              {sweep > 0.95 && <text x={Math.cos(mid) * R * 0.62} y={Math.sin(mid) * R * 0.62} textAnchor="middle" fontFamily={HAND} fontSize={52} fill={INKC}>{q.label}</text>}
              {sweep > 0.95 && <text x={Math.cos(mid) * R * 0.62} y={Math.sin(mid) * R * 0.62 + 46} textAnchor="middle" fontFamily={HAND} fontSize={42} fill={INKC} opacity={0.7}>{Math.round((q.value / tot) * 100)}%</text>}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const LineChart: React.FC<S<'line'>> = ({s}) => {
  const {f, fps} = useP();
  const [x0, x1, yb, yt] = [260, 1660, 900, 300];
  const ys = s.points.map((q) => q.y);
  const [mn, mx] = [Math.min(0, ...ys), Math.max(...ys)];
  const X = (i: number) => x0 + ((x1 - x0) * i) / Math.max(1, s.points.length - 1);
  const Y = (v: number) => yb - ((v - mn) / (mx - mn || 1)) * (yb - yt);
  const prog = interpolate(f, [8, 8 + fps * 2.2], [0, 1], {...C, easing: Easing.inOut(Easing.quad)});
  const dpath = s.points.map((q, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(q.y)}`).join(' ');
  const pk = ys.indexOf(mx);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', fontFamily: HAND, fontSize: 96, color: INKC, ...rise(f, 0)}}>{s.title}</div>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d={`M${x0} ${yt - 30} V${yb} H${x1 + 40}`} fill="none" stroke={INKC} strokeWidth={5} strokeLinecap="round" />
        {s.points.map((q, i) => <text key={i} x={X(i)} y={yb + 56} textAnchor="middle" fontFamily={HAND} fontSize={40} fill={INKC}>{q.x}</text>)}
        <path d={`${dpath} L${X(s.points.length - 1)} ${yb} L${x0} ${yb}Z`} fill="#4f86c6" opacity={0.14 * prog} />
        <path d={dpath} fill="none" stroke="#d9695f" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - prog} />
        {s.points.map((q, i) => {
          const shown = prog >= i / Math.max(1, s.points.length - 1);
          return shown ? <circle key={i} cx={X(i)} cy={Y(q.y)} r={i === pk ? 16 : 10} fill={i === pk ? '#f2c230' : '#fff'} stroke={INKC} strokeWidth={4} /> : null;
        })}
        {prog > 0.98 && <text x={X(pk)} y={Y(mx) - 34} textAnchor="middle" fontFamily={HAND} fontSize={60} fill={INKC}>{mx.toLocaleString('en-US')}{s.unit ?? ''}</text>}
      </svg>
    </AbsoluteFill>
  );
};

const Versus: React.FC<S<'versus'>> = ({s}) => {
  const {f, fps} = useP();
  const ring = (col: string, k: string, x: number, y: number, pp: number) => (
    <div style={{position: 'absolute', left: x - 80, top: y - 80, width: 160, height: 160, borderRadius: '50%', background: '#fff', border: `8px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: String(Math.max(0, pp)), opacity: op(pp * 3)}}>
      <Icon k={k} size={104} />
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 640 - 250, width: 500, top: 90, textAlign: 'center', fontFamily: HAND, fontSize: 70, color: '#2f5f9f', ...rise(f, 0)}}>{s.aTitle}</div>
      <div style={{position: 'absolute', left: 1280 - 250, width: 500, top: 90, textAlign: 'center', fontFamily: HAND, fontSize: 70, color: '#2f8a58', ...rise(f, 4)}}>{s.bTitle}</div>
      {s.rows.map((r, i) => {
        const y = 330 + i * 240, pp = sp(f, fps, 10 + i * 14);
        return (
          <React.Fragment key={i}>
            {ring('#2f5f9f', r.icon, 640, y, pp)}
            {ring('#2f8a58', r.icon, 1280, y, sp(f, fps, 14 + i * 14))}
            <div style={{position: 'absolute', left: 810, width: 300, top: y - 70, textAlign: 'center', fontFamily: HAND, fontSize: 64, color: INKC, opacity: op(pp)}}>
              <div style={{fontSize: 96, lineHeight: '70px'}}>=</div>{r.label}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const Body: React.FC<{s: Scene; T: Theme; tm?: Timing}> = ({s, T, tm}) => {
  const {d} = useP();
  switch (s.type) {
    case 'kinetic': return <Kinetic s={s} T={T} />;
    case 'stat': return <Stat s={s} T={T} />;
    case 'photo': return <Photo s={s} T={T} />;
    case 'chapter': return <Chapter s={s} T={T} tm={tm} />;
    case 'quote': return <Quote s={s} T={T} />;
    case 'compare': return <Compare s={s} T={T} />;
    case 'timeline': return <Timeline s={s} T={T} />;
    case 'bars': return <Bars s={s} T={T} />;
    case 'list': return <List s={s} T={T} />;
    case 'character': return <Character s={s} T={T} />;
    case 'stage': return <Stage st={s.st} words={tm?.words} seed={s.id} />;
    case 'geo': return <GeoMap g={s.geo} seed={s.id} />;
    case 'pie': return <Pie s={s} T={T} />;
    case 'line': return <LineChart s={s} T={T} />;
    case 'versus': return <Versus s={s} T={T} />;
    case 'custom': return <s.render frames={d} />;
  }
};

const wantAudio = () => !getRemotionEnvironment().isRendering || (getInputProps() as any).audio === true; // preview, or the audio-only render (--props '{"audio":true}')

// ---------- sound effects (synthesised by src/tts/sfx.py into public/sfx/*.wav) ----------
type Cue = {at: number; k: string; v?: number; loop?: boolean};
const SFX_GAIN = 0.4; // master gain for every effect, so narration always stays on top
const AMBIENT = false; // looped beds (rain, wind, steps, fire) off: they read as noise
const MUTE = new Set(['pop', 'tick', 'flip', 'whoosh', 'whoosh_long', 'sweep', 'riser', 'riser_short', 'ding']); // synthetic beeps fired on every scene
const POPSFX: Record<string, string> = {fire: 'ignite', coins: 'coin', wolf: 'howl', elephant: 'trumpet', galley: 'horn', standard: 'horn', legion: 'march_hit', shieldwall: 'shield_hit', temple: 'pop', colosseum: 'boom', birds: 'birds', basket: 'pop', throne: 'pop'};
const cuesFor = (s: Scene, i: number, dur: number): Cue[] => {
  const c: Cue[] = [];
  const tr = i === 0 ? 'none' : s.tr ?? 'fade';
  if (tr === 'slide' || tr === 'wipe') c.push({at: 0, k: 'whoosh', v: 0.5});
  if (tr === 'flip') c.push({at: 0, k: 'flip', v: 0.5});
  const fx = ([] as string[]).concat((s.fx as any) ?? [], s.type === 'stage' || s.type === 'chapter' ? (((s.st as any)?.fx as any) ?? []) : []);
  if (fx.includes('rain') || fx.includes('storm')) c.push({at: 0, k: 'rain', v: 0.3, loop: true});
  if (fx.includes('storm')) c.push({at: 0.4, k: 'thunder', v: 0.55});
  if (fx.includes('wind')) c.push({at: 0, k: 'wind', v: 0.25, loop: true});
  switch (s.type) {
    case 'chapter': c.push({at: 0.05, k: 'riser', v: 0.45}, {at: 1.0, k: 'impact', v: 0.75}); break;
    case 'kinetic': c.push({at: 0.25, k: 'thud', v: 0.55}); break;
    case 'stat': c.push({at: 0.15, k: 'riser_short', v: 0.4}, {at: 1.9, k: 'ding', v: 0.45}); break;
    case 'pie': case 'line': case 'compare': case 'bars': c.push({at: 0.2, k: 'sweep', v: 0.45}); break;
    case 'timeline': s.items.forEach((_, j) => c.push({at: (j / s.items.length) * dur * 0.7, k: 'pop'})); break;
    case 'list': s.items.forEach((_, j) => c.push({at: (8 + j * 10) / 30, k: 'pop'})); break;
    case 'versus': s.rows.forEach((_, j) => c.push({at: (10 + j * 14) / 30, k: 'pop'})); break;
    case 'geo': c.push({at: 0.05, k: 'whoosh_long', v: 0.45}); (s.geo.pins ?? []).forEach((q) => c.push({at: (q.at ?? 0) * dur, k: 'pop'})); (s.geo.routes ?? []).forEach((q) => c.push({at: (q.at ?? 0.1) * dur, k: 'sweep', v: 0.4})); break;
    case 'stage': {
      const st = s.st;
      (st.props ?? []).forEach((p) => {
        if (p.at !== undefined) c.push({at: p.at * dur, k: POPSFX[p.k] ?? 'pop', v: p.k === 'fire' ? 0.5 : 0.45});
      });
      (st.actors ?? []).forEach((a) => {
        if (a.at !== undefined) c.push({at: a.at * dur, k: 'pop'});
        if (a.pose === 'attack') [0.18, 0.42, 0.66, 0.86].forEach((q, j) => c.push({at: q * dur, k: j % 2 ? 'sword' : 'slash', v: 0.5}));
        if (a.fa !== undefined) c.push({at: a.fa * dur, k: 'body_fall', v: 0.6});
        if (a.pose === 'cheer') c.push({at: 0.05, k: 'cheer_small', v: 0.3});
        if (Array.isArray(a.x) && a.x[0] !== a.x[1]) c.push({at: 0, k: a.pose === 'run' ? 'run_loop' : 'steps_loop', v: 0.18, loop: true});
      });
      if (st.shake) c.push({at: st.shake.at * dur, k: 'boom', v: 0.6});
      if (st.flash) c.push({at: st.flash.at * dur, k: 'crack', v: 0.5});
      if (st.spot) c.push({at: 0, k: 'tense_loop', v: 0.22, loop: true});
      (st.texts ?? []).forEach((t) => c.push({at: (t.at ?? 0) * dur, k: 'tick', v: 0.35}));
      if ((st.props ?? []).some((p) => p.k === 'fire')) c.push({at: 0, k: 'fire', v: 0.22, loop: true});
      if (st.bg === 'sea') c.push({at: 0, k: 'waves', v: 0.2, loop: true});
      break;
    }
  }
  (s.sfx ?? []).forEach(([a, k, v]) => c.push({at: a * dur, k, v: v ?? 0.55, loop: k.endsWith('_loop')}));
  return c;
};
const SceneSfx: React.FC<{s: Scene; i: number}> = ({s, i}) => {
  const {fps, durationInFrames: d} = useVideoConfig();
  if (!wantAudio()) return null;
  const cues = cuesFor(s, i, d / fps).filter((q) => q.at * fps < d - 3 && (AMBIENT || !q.loop) && !MUTE.has(q.k)).slice(0, 6);
  return (
    <>
      {cues.map((q, j) =>
        q.loop ? (
          <Sequence key={j} from={0} durationInFrames={d}>
            <Audio src={staticFile(`sfx/${q.k}.wav`)} loop volume={(fr: number) => (q.v ?? 0.3) * SFX_GAIN * Math.min(1, fr / 12, Math.max(0, (d - fr) / 12))} />
          </Sequence>
        ) : (
          <Sequence key={j} from={Math.round(q.at * fps)}>
            <Audio src={staticFile(`sfx/${q.k}.wav`)} volume={(q.v ?? 0.45) * SFX_GAIN} />
          </Sequence>
        ),
      )}
    </>
  );
};

const FULL = ['photo', 'stage', 'geo', 'chapter']; // own full-bleed art: no default bg/camera/particles
const PAPERS = ['pie', 'line', 'versus']; // light paper infographic look
const SHIFT = 520; // room for the narrator overlay

const YearBadge: React.FC<{y: string; T: Theme}> = ({y}) => {
  const {f} = useP();
  return <div style={{position: 'absolute', left: 48, top: 44, padding: '6px 26px', borderRadius: 14, background: 'rgba(48,58,82,.88)', color: '#fff', fontFamily: HAND, fontSize: 56, border: `3px solid ${INK}`, ...rise(f, 4, -20)}}>{y}</div>;
};

const SceneView: React.FC<{s: Scene; i: number; T: Theme; tm?: Timing}> = ({s, i, T, tm}) => (
  <AbsoluteFill style={{color: T.fg}}>
    {FULL.includes(s.type) ? (
      <Body s={s} T={T} tm={tm} />
    ) : PAPERS.includes(s.type) ? (
      <>
        <Paper />
        <AbsoluteFill style={{paddingRight: s.nar ? SHIFT : 0}}><Camera dir={i % 2 ? 1 : -1}><Body s={s} T={T} tm={tm} /></Camera></AbsoluteFill>
      </>
    ) : (
      <>
        <Bg hue={s.hue ?? T.hue} T={T} seed={s.id} />
        <AbsoluteFill style={{paddingRight: s.nar ? SHIFT : 0}}><Camera dir={i % 2 ? 1 : -1}><Body s={s} T={T} tm={tm} /></Camera></AbsoluteFill>
        <Particles T={T} seed={s.id} />
      </>
    )}
    {s.fx && <Weather k={s.fx} seed={s.id} />}
    {s.nar && <NarratorOverlay cfg={{pose: s.nar === true ? 'idle' : s.nar, face: s.face}} words={tm?.words} />}
    {s.year && <YearBadge y={s.year} T={T} />}
    <SceneSfx s={s} i={i} />
  </AbsoluteFill>
);

// ---------- assembly ----------
// Scene i lasts frames[i] + (transition into i+1). The overlap eats the extra, so scene i starts exactly where
// its narration starts in narration.mp3. Boundaries come from CUMULATIVE seconds -> no drift over 500 scenes.
const TR = 10; // transition frames
const PRES: Record<Exclude<Tr, 'none'>, any> = {fade: fade(), slide: slide(), wipe: wipe(), flip: flip()}; // any: presentations have differing prop generics

export const makeVideo = (scenes: Scene[], lines: Record<string, string>, T: Theme, timings: Record<string, Timing>) => {
  scenes.forEach((s) => {
    if (!lines[s.id]) throw new Error(`scene ${s.id} has no narration line in LINES`);
  });
  const sec = (s: Scene) => timings[s.id]?.seconds ?? Math.max(2.5, lines[s.id].split(/\s+/).length / 2.6); // estimate until TTS has run
  const B = [0];
  let cum = 0;
  scenes.forEach((s) => {
    cum += sec(s);
    B.push(Math.round(cum * T.fps));
  });
  const trIn = (i: number): Tr => (i === 0 ? 'none' : scenes[i].tr ?? 'fade');
  const hasAudio = Object.keys(timings).length > 0;

  const Video: React.FC = () => (
    <AbsoluteFill style={{backgroundColor: T.bg}}>
      {/* Preview only. CI renders video-only chunks; ffmpeg adds narration.mp3 (+ bgm.mp3) afterwards. */}
      {hasAudio && wantAudio() && <Audio src={staticFile('narration.mp3')} />}
      {T.music && wantAudio() && <Audio src={staticFile(T.music)} volume={0.07} loop />}
      <TransitionSeries>
        {scenes.flatMap((s, i) => {
          const out = i + 1 < scenes.length && trIn(i + 1) !== 'none' ? TR : 0;
          const els: React.ReactElement[] = [];
          if (trIn(i) !== 'none') {
            els.push(<TransitionSeries.Transition key={`t${s.id}`} presentation={PRES[trIn(i) as Exclude<Tr, 'none'>]} timing={linearTiming({durationInFrames: TR})} />);
          }
          els.push(
            <TransitionSeries.Sequence key={s.id} name={s.id} durationInFrames={B[i + 1] - B[i] + out}>
              <SceneView s={s} i={i} T={T} tm={timings[s.id]} />
            </TransitionSeries.Sequence>,
          );
          return els;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
  return {Video, total: B[scenes.length], fps: T.fps};
};
