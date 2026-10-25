// Vidfactory scene kit. Copy ONCE to src/remotion/kit.tsx. Do not edit per video.
// Per-video work = title_script.tsx (data only). Rules: no CSS transitions, no Math.random, no Date.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {flip} from '@remotion/transitions/flip';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {Stage, NarratorOverlay, Paper, Icon, HAND, INK, StageT, PropT, ActorT, PoseName, Face} from './world';
import {GeoMap, GeoT} from './geo';

// ---------- types ----------
export type Tr = 'fade' | 'slide' | 'wipe' | 'flip' | 'none'; // transition INTO this scene
type Base = {id: string; tr?: Tr; hue?: number; year?: string; nar?: PoseName | true; face?: Face}; // year = corner badge; nar = narrator stickman overlay (lip-synced)
export type Scene = Base &
  (
    | {type: 'kinetic'; text: string; hi?: string[]}
    | {type: 'stat'; value: number; label: string; prefix?: string; suffix?: string; decimals?: number}
    | {type: 'photo'; src: string; title?: string; move?: 'in' | 'out' | 'left' | 'right'}
    | {type: 'chapter'; n: number; title: string}
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
export type Theme = {fps: number; hue: number; bg: string; fg: string; accent: string; accent2: string; captions: boolean; music?: string};
export type {StageT, GeoT, PropT, ActorT, PoseName, Face};
export type Timing = {seconds: number; words?: {w: string; s: number; e: number}[]}; // s,e = seconds from scene start

// ---------- helpers ----------
const font = (f: () => {fontFamily: string}) => (typeof window === 'undefined' ? 'sans-serif' : f().fontFamily);
const BODY = font(() => loadInter());
const HEAD = font(() => loadAnton());
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

const Captions: React.FC<{T: Theme; tm?: Timing}> = ({T, tm}) => {
  const {f, fps} = useP();
  const w = tm?.words;
  if (!w?.length) return null;
  const t = f / fps;
  let a = w.findIndex((x) => t < x.e);
  if (a < 0) a = w.length - 1;
  const g = Math.floor(a / 4) * 4;
  return (
    <div style={{position: 'absolute', left: 120, right: 120, bottom: 100, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 56}}>
      {w.slice(g, g + 4).map((x, k) => (
        <span key={k} style={{color: g + k === a ? T.accent : T.fg, margin: '0 10px', textShadow: '0 4px 18px rgba(0,0,0,.7)'}}>{x.w}</span>
      ))}
    </div>
  );
};

// ---------- scene types ----------
type S<K extends Scene['type']> = {s: Extract<Scene, {type: K}>; T: Theme};

const Kinetic: React.FC<S<'kinetic'>> = ({s, T}) => {
  const {f, fps, d} = useP();
  const words = s.text.split(' ');
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '100px 160px'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 30px', maxWidth: 1560, fontFamily: HEAD, fontSize: words.length > 6 ? 104 : 130, lineHeight: 1.08, textTransform: 'uppercase', textAlign: 'center'}}>
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

const Chapter: React.FC<S<'chapter'>> = ({s, T}) => {
  const {f} = useP();
  const w = interpolate(f, [0, 22], [0, 1], {...C, easing: OUT});
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: '0 160px'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${w * 38}%`, background: T.accent, opacity: 0.14}} />
      <div style={{fontFamily: HEAD, fontSize: 420, lineHeight: 0.9, color: 'transparent', WebkitTextStroke: `4px ${T.accent}`, translate: `${(1 - w) * -200}px 0`, opacity: op(w)}}>{String(s.n).padStart(2, '0')}</div>
      <div style={{fontFamily: HEAD, fontSize: 120, textTransform: 'uppercase', ...rise(f, 12)}}>{s.title}</div>
      <div style={{height: 6, width: interpolate(f, [18, 50], [0, 900], {...C, easing: OUT}), background: T.accent2, marginTop: 24}} />
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
    case 'chapter': return <Chapter s={s} T={T} />;
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

const FULL = ['photo', 'stage', 'geo']; // own full-bleed art: no default bg/camera/particles
const PAPERS = ['pie', 'line', 'versus']; // light paper infographic look

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
        <AbsoluteFill style={{paddingRight: s.nar ? 460 : 0}}><Camera dir={i % 2 ? 1 : -1}><Body s={s} T={T} tm={tm} /></Camera></AbsoluteFill>
      </>
    ) : (
      <>
        <Bg hue={s.hue ?? T.hue} T={T} seed={s.id} />
        <AbsoluteFill style={{paddingRight: s.nar ? 460 : 0}}><Camera dir={i % 2 ? 1 : -1}><Body s={s} T={T} tm={tm} /></Camera></AbsoluteFill>
        <Particles T={T} seed={s.id} />
      </>
    )}
    {s.nar && <NarratorOverlay cfg={{pose: s.nar === true ? 'idle' : s.nar, face: s.face}} words={tm?.words} />}
    {s.year && <YearBadge y={s.year} T={T} />}
    {T.captions && <Captions T={T} tm={tm} />}
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
      {hasAudio && <Audio src={staticFile('narration.mp3')} />}
      {T.music && <Audio src={staticFile(T.music)} volume={0.07} loop />}
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
