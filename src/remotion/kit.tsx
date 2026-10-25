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

// ---------- types ----------
export type Tr = 'fade' | 'slide' | 'wipe' | 'flip' | 'none'; // transition INTO this scene
type Base = {id: string; tr?: Tr; hue?: number};
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
    | {type: 'custom'; render: React.FC<{frames: number}>}
  );
export type Theme = {fps: number; hue: number; bg: string; fg: string; accent: string; accent2: string; captions: boolean; music?: string};
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
    return `radial-gradient(circle at ${x}% ${y}%, hsla(${hue + i * 28},70%,45%,0.38), transparent 46%)`;
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
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 30px', fontFamily: HEAD, fontSize: 130, lineHeight: 1.08, textTransform: 'uppercase', textAlign: 'center'}}>
        {words.map((w, i) => {
          const p = sp(f, fps, Math.round((i / words.length) * d * 0.6));
          const hot = s.hi?.includes(w.toLowerCase().replace(/[^a-z0-9]/g, ''));
          return <span key={i} style={{opacity: op(p), translate: `0 ${(1 - op(p)) * 60}px`, scale: String((hot ? 1.12 : 1) * (0.8 + 0.2 * p)), color: hot ? T.accent : T.fg}}>{w}</span>;
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

const Body: React.FC<{s: Scene; T: Theme}> = ({s, T}) => {
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
    case 'custom': return <s.render frames={d} />;
  }
};

const SceneView: React.FC<{s: Scene; i: number; T: Theme; tm?: Timing}> = ({s, i, T, tm}) => (
  <AbsoluteFill style={{color: T.fg}}>
    <Bg hue={s.hue ?? T.hue} T={T} seed={s.id} />
    {s.type === 'photo' ? <Body s={s} T={T} /> : <Camera dir={i % 2 ? 1 : -1}><Body s={s} T={T} /></Camera>}
    {s.type !== 'photo' && <Particles T={T} seed={s.id} />}
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
