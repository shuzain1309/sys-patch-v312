// Thumbnail still, 1920x1080 (thumb.js exports 1280x720). Every size and position below was MEASURED from two reference thumbnails
// (IRAN, ALEXANDER; 347x195 px each, scaled x5.53 to 1920 wide). Source numbers are in references/thumbnails.md.
//   word box   : flush in the top-left corner (0,0), 183 px tall, 33 px from the box edge to the first white pixel (CSS padding 24/16 because of letter side-bearings), cap height 83 px, white on black, no outline
//   chip box   : 11 px below the word box, flush left, 116 px tall, cap height 50 px, white on black, no outline
//   subject    : centre at 47.5% x 50% of the frame, about 62% of the frame height (framing is computed by src/ci/frame.mjs)
//   portrait   : about 94% of the frame height, bleeding off the right and bottom edges, no outline
//   subject on map: vivid red with its own relief, thin white edge, red neon glow; country borders thin white; sea bright blue
// Layouts: P1 portrait + map, P2 split (two maps, two portraits), P3 = P1 with a white arrow at the subject ("WHY?").
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont as loadMont} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {geoArea, geoMercator, geoPath} from 'd3-geo';
import {feature, mesh} from 'topojson-client';
import w50 from 'world-atlas/countries-50m.json';
import geoLib from '../../library/geo.json';
import {Actor} from './world';

const WORD = typeof window === 'undefined' ? 'sans-serif' : loadMont('normal', {weights: ['800'], subsets: ['latin']}).fontFamily;
const CHIP = typeof window === 'undefined' ? 'sans-serif' : loadInter('normal', {weights: ['700'], subsets: ['latin']}).fontFamily;
const W = 1920, H = 1080;
export type View = {lon: number; lat: number; s: number; tx: number; ty: number};
export type ThumbProps = {
  layout: 'P1' | 'P2' | 'P3'; word: string; chip?: string; chip2?: string;
  map?: string[] | string; region?: string; map2?: string[] | string; region2?: string; // the subject(s) to paint red
  view?: View; view2?: View; terrain?: string; relief?: string; terrain2?: string; relief2?: string; // from frame.mjs / terrain.py (public/ paths)
  arrow?: boolean | {lon: number; lat: number};
  portrait?: string; portrait2?: string; cut?: boolean; cut2?: boolean; // cut = background already removed
  face?: {look?: string; expr?: 'smile' | 'neutral' | 'shock' | 'sad' | 'angry'};
};

const COUNTRIES: any[] = (feature(w50 as any, (w50 as any).objects.countries) as any).features;
const toArr = (m?: string[] | string) => (Array.isArray(m) ? m : m ? [m] : []);

// ---------- text boxes (measured) ----------
const Box: React.FC<{text: string; kind: 'word' | 'chip'; left: number; top: number}> = ({text, kind, left, top}) => {
  const word = kind === 'word';
  let fs = word ? 119 : 69; // cap height 83 px (Montserrat 0.70 em) and 50 px (Inter 0.727 em)
  if (word) { const est = text.length * 0.8 * fs; if (est + 40 > 1190) fs = (fs * (1190 - 40)) / est; } // very long words shrink; the box still hugs the text
  return (
    <div style={{position: 'absolute', left, top, background: '#000', color: '#fff', fontFamily: word ? WORD : CHIP, fontWeight: word ? 800 : 700, fontSize: fs, lineHeight: 1, whiteSpace: 'nowrap',
      padding: word ? `${36 * fs / 119}px 16px ${28 * fs / 119}px 24px` : '29px 16px 19px 15px', letterSpacing: word ? undefined : '-0.035em', textTransform: word ? 'uppercase' : undefined}}>{text}</div>
  );
};

// ---------- map: terrain picture + vector overlay in the same projection ----------
const ring = (pts: [number, number][]) => { const r = pts.slice(); if (r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1]) r.push(r[0]); return r; };
const MapLayer: React.FC<{view: View; w: number; h: number; names: string[]; region?: string; terrain?: string; relief?: string}> = ({view, w, h, names, region, terrain, relief}) => {
  const g = React.useMemo(() => {
    const proj = geoMercator().center([view.lon, view.lat]).translate([view.tx, view.ty]).scale(view.s).clipExtent([[-40, -40], [w + 40, h + 40]]);
    const P = geoPath(proj);
    const subj: string[] = names.map((n) => COUNTRIES.find((q) => q.properties?.name === n)).filter(Boolean).map((f) => P(f) || '');
    const pts: [number, number][] | undefined = region ? (geoLib as any).regions?.[region]?.pts : undefined;
    if (pts && pts.length > 2) { const rg = ring(pts); const big = geoArea({type: 'Polygon', coordinates: [rg]} as any) > 2 * Math.PI; subj.push(P({type: 'Polygon', coordinates: [big ? rg.slice().reverse() : rg]} as any) || ''); }
    return {
      subject: subj.join(' '),
      borders: P(mesh(w50 as any, (w50 as any).objects.countries, (a: any, b: any) => a !== b) as any) || '',
      land: terrain ? '' : P(feature(w50 as any, (w50 as any).objects.land) as any) || '',
    };
  }, [JSON.stringify(view), w, h, names.join(), region, !!terrain]);
  const frame = {position: 'absolute', left: 0, top: 0, width: w, height: h} as const;
  return (
    <div style={{...frame, overflow: 'hidden'}}>
      {terrain ? <Img src={staticFile(terrain)} style={frame} /> : (
        <svg width={w} height={h} style={frame}><rect width={w} height={h} fill="#1a73e8" /><path d={g.land} fill="#e6ae2c" /></svg> // no terrain tiles reachable: flat gold land on blue sea
      )}
      <svg width={w} height={h} style={frame}><path d={g.borders} fill="none" stroke="#fff" strokeWidth={3.5} strokeOpacity={0.85} strokeLinejoin="round" /></svg>
      {g.subject && (relief
        ? <Img src={staticFile(relief)} style={{...frame, clipPath: `path('${g.subject}')`}} />
        : <svg width={w} height={h} style={frame}><path d={g.subject} fill="#e3141c" /></svg>)}
      {g.subject && (
        <svg width={w} height={h} style={frame}>
          <defs><filter id="neon" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter></defs>
          <path d={g.subject} fill="none" stroke="#ff1414" strokeWidth={26} strokeLinejoin="round" filter="url(#neon)" opacity={0.95} />
          <path d={g.subject} fill="none" stroke="#ff2b2b" strokeWidth={8} strokeLinejoin="round" />
          <path d={g.subject} fill="none" stroke="#fff" strokeWidth={3} strokeLinejoin="round" strokeOpacity={0.92} />
        </svg>
      )}
    </div>
  );
};

// ---------- portrait ----------
const Paint: React.FC = () => ( // painterly: slight smoothing, saturation, contrast, 16-level posterise, sharpen. No outline.
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id="paint" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.7" result="b" />
      <feColorMatrix in="b" type="saturate" values="1.3" result="s" />
      <feComponentTransfer in="s" result="c"><feFuncR type="linear" slope="1.18" intercept="-0.07" /><feFuncG type="linear" slope="1.18" intercept="-0.07" /><feFuncB type="linear" slope="1.18" intercept="-0.07" /></feComponentTransfer>
      <feComponentTransfer in="c" result="p"><feFuncR type="discrete" tableValues="0 .07 .13 .2 .27 .33 .4 .47 .53 .6 .67 .73 .8 .87 .93 1" /><feFuncG type="discrete" tableValues="0 .07 .13 .2 .27 .33 .4 .47 .53 .6 .67 .73 .8 .87 .93 1" /><feFuncB type="discrete" tableValues="0 .07 .13 .2 .27 .33 .4 .47 .53 .6 .67 .73 .8 .87 .93 1" /></feComponentTransfer>
      <feConvolveMatrix in="p" order="3" kernelMatrix="0 -0.5 0 -0.5 3 -0.5 0 -0.5 0" preserveAlpha="true" />
    </filter>
  </svg>
);
const PH = Math.round(H * 0.94); // portrait height: 94% of the frame (measured 93 to 95%)
const Portrait: React.FC<{src?: string; cut?: boolean; side: 'left' | 'right'; face: ThumbProps['face']; fx: number}> = ({src, cut, side, face, fx}) => {
  if (!src) { // last fallback: the narrator stickman, large, with an expression
    return <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}><Actor a={{look: face?.look ?? 'narrator', x: fx, y: 1330, s: 2.7, pose: 'idle', face: face?.expr ?? 'shock', ns: true}} seed="th" /></svg>;
  }
  const edge = side === 'right' ? 'to right' : 'to left';
  const mask = cut ? undefined : `linear-gradient(${edge}, transparent 0, #000 22%)`; // no cut-out: fade the photo's inner edge into the map
  return (
    <Img src={staticFile(src)} style={{position: 'absolute', [side]: 0, bottom: 0, height: PH, ...(cut ? {width: 'auto', maxWidth: 1010, objectFit: 'contain', objectPosition: `bottom ${side}`} : {width: 880, objectFit: 'cover', objectPosition: '50% 12%'}),
      filter: 'url(#paint) drop-shadow(-4px 2px 10px rgba(0,0,0,.35))', WebkitMaskImage: mask, maskImage: mask}} />
  );
};

const Arrow: React.FC<{x: number; y: number}> = ({x, y}) => { // white arrow pointing at the subject, tail lower-left (clear of the text boxes and the portrait)
  const tx = Math.max(300, Math.min(1500, x)), ty = Math.max(300, Math.min(980, y));
  const sx = tx - 330, sy = ty + 150, a = Math.atan2(ty - sy, tx - sx), hl = 130, hx = tx - Math.cos(a) * 20, hy = ty - Math.sin(a) * 20;
  const p = (ang: number) => `${hx - Math.cos(a + ang) * hl},${hy - Math.sin(a + ang) * hl}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <path d={`M${sx} ${sy} L${hx - Math.cos(a) * 60} ${hy - Math.sin(a) * 60}`} stroke="#000" strokeWidth={62} strokeLinecap="round" fill="none" />
      <path d={`M${sx} ${sy} L${hx - Math.cos(a) * 60} ${hy - Math.sin(a) * 60}`} stroke="#fff" strokeWidth={40} strokeLinecap="round" fill="none" />
      <polygon points={`${hx},${hy} ${p(0.5)} ${p(-0.5)}`} fill="#fff" stroke="#000" strokeWidth={14} strokeLinejoin="round" />
    </svg>
  );
};

const FALLBACK: View = {lon: 45, lat: 30, s: 600, tx: 912, ty: 540};
export const Thumb: React.FC<ThumbProps> = (p) => {
  const label = <><Box text={p.word} kind="word" left={0} top={0} />{p.chip && <Box text={p.chip} kind="chip" left={0} top={183 + 11} />}</>;
  if (p.layout === 'P2') {
    const half = W / 2;
    return (
      <AbsoluteFill style={{background: '#1a73e8'}}>
        <Paint />
        <MapLayer view={p.view ?? {...FALLBACK, tx: half * 0.475}} w={half} h={H} names={toArr(p.map)} region={p.region} terrain={p.terrain} relief={p.relief} />
        <div style={{position: 'absolute', left: half, top: 0, width: half, height: H, overflow: 'hidden'}}>
          <MapLayer view={p.view2 ?? p.view ?? {...FALLBACK, tx: half * 0.475}} w={half} h={H} names={toArr(p.map2 ?? p.map)} region={p.region2 ?? p.region} terrain={p.terrain2 ?? p.terrain} relief={p.relief2 ?? p.relief} />
        </div>
        <Portrait src={p.portrait} cut={p.cut} side="left" face={p.face} fx={300} />
        <Portrait src={p.portrait2 ?? p.portrait} cut={p.cut2 ?? p.cut} side="right" face={p.face} fx={1620} />
        <div style={{position: 'absolute', left: half - 4, top: 0, width: 8, height: H, background: '#fff'}} />
        {label}
        {p.chip2 && <Box text={p.chip2} kind="chip" left={half + 4} top={0} />}
      </AbsoluteFill>
    );
  }
  const v = p.view ?? FALLBACK;
  let tip: [number, number] | null = null;
  if (p.layout === 'P3' && p.arrow !== false) {
    const t = typeof p.arrow === 'object' ? geoMercator().center([v.lon, v.lat]).translate([v.tx, v.ty]).scale(v.s)([p.arrow.lon, p.arrow.lat]) : [v.tx, v.ty];
    if (t) tip = [t[0], t[1]];
  }
  return (
    <AbsoluteFill style={{background: '#1a73e8'}}>
      <Paint />
      <MapLayer view={v} w={W} h={H} names={toArr(p.map)} region={p.region} terrain={p.terrain} relief={p.relief} />
      <Portrait src={p.portrait} cut={p.cut} side="right" face={p.face} fx={1560} />
      {tip && <Arrow x={tip[0]} y={tip[1]} />}
      {label}
    </AbsoluteFill>
  );
};
