// Vidfactory geo kit v2: satellite-style maps drawn in code (no image files).
// Projection is computed ONCE per scene; zoom/pan are SVG transforms, so textures stay glued to the land and frames render fast.
// Deps: npm i d3-geo topojson-client world-atlas
import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoOrthographic, geoMercator, geoPath, geoGraticule10, geoInterpolate, geoDistance, geoTransform} from 'd3-geo';
import {feature, mesh} from 'topojson-client';
import w110 from 'world-atlas/countries-110m.json';
import w50 from 'world-atlas/countries-50m.json';
import {HAND, INK} from './world';

const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const feats = (w: any): any[] => (feature(w, w.objects.countries) as any).features;
const F110 = feats(w110), F50 = feats(w50);

export type GeoT = {
  mode?: 'globe' | 'flat';
  from: {lon: number; lat: number; k?: number}; // k = zoom (1 = whole globe / whole world)
  to?: {lon: number; lat: number; k?: number};
  hi?: Record<string, string>; // country name (world-atlas spelling) -> fill colour, e.g. {'United Kingdom': '#d9455a'}
  dash?: string[]; // extra dashed white outline
  pins?: {name: string; lon: number; lat: number; at?: number}[];
  routes?: {a: [number, number]; b: [number, number]; color?: string; at?: number}[];
  labels?: {t: string; sub?: string; lon: number; lat: number; at?: number; size?: number}[]; // sub = smaller yellow line (reference style)
};

// ---------- procedural satellite textures (tileable value noise, generated once per browser tab) ----------
const cache: Record<string, string> = {};
const hash = (x: number, y: number, s: number) => { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const vnoise = (x: number, y: number, per: number, s: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const g = (a: number, b: number) => hash(((a % per) + per) % per, ((b % per) + per) % per, s);
  return g(xi, yi) * (1 - u) * (1 - v) + g(xi + 1, yi) * u * (1 - v) + g(xi, yi + 1) * (1 - u) * v + g(xi + 1, yi + 1) * u * v;
};
const fbm = (x: number, y: number, base: number, oct: number, s: number) => {
  let a = 0.5, t = 0, per = base, n = 0;
  for (let o = 0; o < oct; o++) { t += a * vnoise(x * per, y * per, per, s + o); n += a; a *= 0.5; per *= 2; }
  return t / n;
};
const lerp3 = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const RAMP = [[0, [52, 104, 62]], [0.3, [74, 122, 70]], [0.46, [112, 140, 78]], [0.58, [156, 150, 92]], [0.7, [184, 160, 108]], [0.82, [136, 112, 84]], [1, [200, 190, 175]]] as [number, number[]][];
const ramp = (t: number) => { for (let i = 1; i < RAMP.length; i++) if (t <= RAMP[i][0]) { const [t0, c0] = RAMP[i - 1], [t1, c1] = RAMP[i]; return lerp3(c0, c1, (t - t0) / (t1 - t0)); } return RAMP[RAMP.length - 1][1]; };
const tex = (kind: 'biome' | 'shade' | 'cloud', size: number): string => {
  if (typeof document === 'undefined') return '';
  const key = kind + size;
  if (cache[key]) return cache[key];
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d')!, img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size, o = (y * size + x) * 4;
    if (kind === 'biome') {
      const h = fbm(u, v, 3, 5, 11), m = fbm(u, v, 5, 4, 71);
      const col = ramp(Math.min(1, Math.max(0, h * 1.05 + (m - 0.5) * 0.45 - 0.2)));
      const e = 1 / size, hh = (a: number, b: number) => fbm(a, b, 4, 6, 33);
      const k = 1 + Math.max(-0.45, Math.min(0.45, (-(hh(u + e, v) - hh(u - e, v)) - (hh(u, v + e) - hh(u, v - e))) * size * 0.5));
      img.data[o] = Math.min(255, col[0] * k); img.data[o + 1] = Math.min(255, col[1] * k); img.data[o + 2] = Math.min(255, col[2] * k); img.data[o + 3] = 255;
    } else if (kind === 'shade') {
      const e = 1 / size, h = (a: number, b: number) => fbm(a, b, 4, 6, 33);
      const dx = h(u + e, v) - h(u - e, v), dy = h(u, v + e) - h(u, v - e);
      const l = 128 + Math.max(-110, Math.min(110, (-dx - dy) * size * 1.1));
      img.data[o] = img.data[o + 1] = img.data[o + 2] = l; img.data[o + 3] = 255;
    } else {
      const n = fbm(u, v, 3, 6, 5), a = Math.max(0, Math.min(1, (n - 0.56) * 4.2));
      img.data[o] = img.data[o + 1] = img.data[o + 2] = 255; img.data[o + 3] = a * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return (cache[key] = c.toDataURL('image/png'));
};

export const GeoMap: React.FC<{g: GeoT; seed: string}> = ({g, seed}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: d} = useVideoConfig();
  const globe = (g.mode ?? 'globe') === 'globe';
  const from = {k: 1, ...g.from}, to = {...from, ...(g.to ?? {})};
  const kmax = Math.max(from.k, to.k);

  const geo = React.useMemo(() => {
    const R = 430 * kmax;
    const proj: any = globe
      ? geoOrthographic().rotate([-to.lon, -to.lat]).translate([960, 540]).scale(R).clipAngle(90)
      : geoMercator().center([to.lon, to.lat]).translate([960, 540]).scale(300 * kmax);
    const useFine = kmax >= 2.2 || !globe;
    const FS = useFine ? F50 : F110;
    const W: any = useFine ? w50 : w110;
    const all = {type: 'FeatureCollection', features: FS};
    const bordersGeo = mesh(W, W.objects.countries, (a: any, b: any) => a !== b);
    const visible = (ll: [number, number]) => !globe || geoDistance([to.lon, to.lat], ll) < Math.PI / 2 - 0.04;
    const fp = proj([from.lon, from.lat]);
    const fromPt = (fp && (!globe || geoDistance([to.lon, to.lat], [from.lon, from.lat]) < 1.2) ? fp : [960, 540]) as [number, number];
    // Speed: the whole-world path has ~100k vertices and Chrome re-rasterises it every frame. So we draw level-of-detail
    // paths, each clipped to the part of the world that is actually on screen while that LOD is used, and thinned to ~1 screen pixel.
    const LODS = [{tol: 10, mmax: 0.1}, {tol: 3, mmax: 0.3}, {tol: 1, mmax: 1.01}];
    const lodOf = (m: number) => LODS.findIndex((l) => m <= l.mmax);
    const rects: any[] = LODS.map(() => null);
    for (let i = 0; i <= 40; i++) {
      const pp = i / 40, kk = Math.exp(Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * Math.min(1, Math.max(0, (1 - Math.cos(Math.PI * pp)) / 2)));
      const mm = kk / kmax, cxp = fromPt[0] + (960 - fromPt[0]) * pp, cyp = fromPt[1] + (540 - fromPt[1]) * pp, hx = (960 / mm) * 1.25, hy = (540 / mm) * 1.25, l = lodOf(mm);
      const r = rects[l];
      rects[l] = r ? [[Math.min(r[0][0], cxp - hx), Math.min(r[0][1], cyp - hy)], [Math.max(r[1][0], cxp + hx), Math.max(r[1][1], cyp + hy)]] : [[cxp - hx, cyp - hy], [cxp + hx, cyp + hy]];
    }
    const mk = (l: number) => {
      const dec = geoTransform({
        lineStart() { this.last = null; this.stream.lineStart(); },
        point(x: number, y: number) { const q = this.last; if (!q || (x - q[0]) ** 2 + (y - q[1]) ** 2 >= LODS[l].tol ** 2) { this.last = [x, y]; this.stream.point(x, y); } },
      } as any);
      proj.clipExtent(rects[l]);
      const pth: any = geoPath({stream: (s: any) => proj.stream(dec.stream(s))} as any);
      return {
        pth,
        land: pth(all) as string,
        borders: pth(bordersGeo) as string,
        one: new Map<string, string>(),
      };
    };
    const lod = LODS.map((_, l) => (rects[l] ? mk(l) : null));
    // shelf glow only needs a very rough coastline (soft wide strokes are costly on detailed paths)
    const un = rects.filter(Boolean).reduce((a: any, r: any) => (a ? [[Math.min(a[0][0], r[0][0]), Math.min(a[0][1], r[0][1])], [Math.max(a[1][0], r[1][0]), Math.max(a[1][1], r[1][1])]] : r), null);
    const shelfDec = geoTransform({
      lineStart() { this.last = null; this.stream.lineStart(); },
      point(x: number, y: number) { const q = this.last; if (!q || (x - q[0]) ** 2 + (y - q[1]) ** 2 >= 18 ** 2) { this.last = [x, y]; this.stream.point(x, y); } },
    } as any);
    proj.clipExtent(un);
    const shelf = (geoPath({stream: (s: any) => proj.stream(shelfDec.stream(s))} as any) as any)(all) as string;
    proj.clipExtent(null);
    const gp: any = geoPath(proj);
    return {
      proj, FS, visible, fromPt, R, lod, lodOf, LODS, rects, shelf,
      grat: gp(geoGraticule10()) as string,
      one: (l: number, name: string) => {
        const L = lod[l]!; if (!L.one.has(name)) { proj.clipExtent(rects[l]); const ft = FS.find((q: any) => q.properties?.name === name); L.one.set(name, ft ? (L.pth(ft) as string) : ''); proj.clipExtent(null); }
        return L.one.get(name)!;
      },
    };
  }, [seed]);

  const p = interpolate(f, [0, d], [0, 1], {...C, easing: Easing.inOut(Easing.cubic)});
  const k = Math.exp(Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * p);
  const m = k / kmax;
  const cx = geo.fromPt[0] + (960 - geo.fromPt[0]) * p, cy = geo.fromPt[1] + (540 - geo.fromPt[1]) * p;
  const tf = `translate(960 540) scale(${m}) translate(${-cx} ${-cy})`;
  const sc = (pt: number[]) => [960 + m * (pt[0] - cx), 540 + m * (pt[1] - cy)];
  const li = Math.max(0, Math.min(geo.lod.length - 1, geo.lodOf(m)));
  const L = geo.lod[li] || geo.lod.find((x: any) => x)!;
  const sw = (w: number) => w / m; // keep line widths constant on screen without vector-effect
  const T = 2400; // texture tile size in projection units
  const biome = tex('biome', 1024), cloud = tex('cloud', 512);
  const at = (v: number | undefined) => spring({frame: f - (v ?? 0) * d, fps, config: {damping: 13, stiffness: 150}});
  const op = (v: number) => Math.min(1, Math.max(0, v));
  const hiNames = Object.keys(g.hi ?? {});
  const rp = (coords: any) => { const pp = geoPath(geo.proj) as any; return (pp({type: 'LineString', coordinates: coords}) ?? '') as string; };
  const R = geo.R * m;

  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id={`oc${seed}`} cx="0.45" cy="0.4" r="0.85"><stop offset="0" stopColor="#0d4a9a" /><stop offset="0.6" stopColor="#08306b" /><stop offset="1" stopColor="#031330" /></radialGradient>
        <radialGradient id={`sp${seed}`} cx="0.5" cy="0.5" r="0.8"><stop offset="0" stopColor="#0c1530" /><stop offset="1" stopColor="#02040b" /></radialGradient>
        <radialGradient id={`sh${seed}`} cx="0.36" cy="0.3" r="0.8"><stop offset="0.45" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#010a1c" stopOpacity={0.7} /></radialGradient>
        <radialGradient id={`vg${seed}`}><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.5} /></radialGradient>
        {biome && <pattern id={`bi${seed}`} patternUnits="userSpaceOnUse" width={T} height={T}><image href={biome} width={T} height={T} /></pattern>}
        {cloud && <pattern id={`cl${seed}`} patternUnits="userSpaceOnUse" width={1500} height={1500} patternTransform={`translate(${f * 0.6} ${f * 0.12})`}><image href={cloud} width={1500} height={1500} /></pattern>}
        {globe && <clipPath id={`sph${seed}`}><circle cx={960} cy={540} r={R} /></clipPath>}
      </defs>
      {globe ? (
        <>
          <rect width={1920} height={1080} fill={`url(#sp${seed})`} />
          {Array.from({length: 90}, (_, i) => <circle key={i} cx={random(`${seed}x${i}`) * 1920} cy={random(`${seed}y${i}`) * 1080} r={0.8 + random(`${seed}r${i}`) * 1.8} fill="#fff" opacity={0.25 + 0.5 * Math.abs(Math.sin(f / 30 + i))} />)}
          <circle cx={960} cy={540} r={R * 1.045} fill="#5ec8ff" opacity={0.22} />
          <circle cx={960} cy={540} r={R * 1.02} fill="#8fe0ff" opacity={0.25} />
        </>
      ) : (
        <rect width={1920} height={1080} fill={`url(#oc${seed})`} />
      )}
      <g clipPath={globe ? `url(#sph${seed})` : undefined}>
        {globe && <circle cx={960} cy={540} r={R} fill={`url(#oc${seed})`} />}
        <g transform={tf}>
          {/* continental shelf glow: two soft strokes on the coarse coastline */}
          {[44, 16].map((w, i) => <path key={w} d={geo.shelf} fill="none" stroke="#2f8fe0" strokeWidth={sw(w)} strokeLinejoin="round" opacity={[0.12, 0.22][i]} />)}
          <path d={geo.grat} fill="none" stroke="#9fd2ff" strokeWidth={sw(0.7)} opacity={0.14} />
          <path d={L.land} fill={biome ? `url(#bi${seed})` : '#5b8f55'} />
          <path d={L.land} fill="none" stroke="#14301f" strokeWidth={sw(1.1)} opacity={0.65} />
          <path d={L.borders} fill="none" stroke="#fff" strokeWidth={sw(0.9)} opacity={0.22} />
          {hiNames.map((n) => {
            const dd = geo.one(li, n), col = g.hi![n];
            if (!dd) return null;
            return (
              <g key={n}>
                <path d={dd} fill="none" stroke="#fff" strokeWidth={sw(14)} opacity={0.14} strokeLinejoin="round" />
                <path d={dd} fill={col} opacity={0.86} />
                <path d={dd} fill="none" stroke="#fff" strokeWidth={sw(3.2)} strokeLinejoin="round" />
              </g>
            );
          })}
          {(g.dash ?? []).map((n) => { const dd = geo.one(li, n); return dd ? <path key={n} d={dd} fill="none" stroke="#fff" strokeWidth={sw(3)} strokeDasharray={`${12 / m} ${9 / m}`} strokeDashoffset={-f * 0.6 / m} /> : null; })}
          {(g.routes ?? []).map((r, i) => {
            const prog = interpolate(f, [(r.at ?? 0.1) * d, (r.at ?? 0.1) * d + Math.max(30, d * 0.5)], [0, 1], {...C, easing: Easing.inOut(Easing.quad)});
            const ip = geoInterpolate(r.a, r.b);
            const coords = Array.from({length: 49}, (_, j) => ip(j / 48));
            return <path key={i} d={rp(coords)} fill="none" stroke={r.color ?? '#ffd24a'} strokeWidth={sw(6)} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - prog} />;
          })}
        </g>
        {cloud && <rect width={1920} height={1080} fill={`url(#cl${seed})`} opacity={0.26} />}
        {globe && <circle cx={960} cy={540} r={R} fill={`url(#sh${seed})`} />}
      </g>
      <rect width={1920} height={1080} fill={`url(#vg${seed})`} />
      {(g.routes ?? []).map((r, i) => {
        const prog = interpolate(f, [(r.at ?? 0.1) * d, (r.at ?? 0.1) * d + Math.max(30, d * 0.5)], [0, 1], {...C, easing: Easing.inOut(Easing.quad)});
        const hp = geo.proj(geoInterpolate(r.a, r.b)(prog));
        if (!hp || prog <= 0 || !geo.visible(geoInterpolate(r.a, r.b)(prog) as [number, number])) return null;
        const q = sc(hp);
        return <circle key={`h${i}`} cx={q[0]} cy={q[1]} r={12} fill={r.color ?? '#ffd24a'} stroke={INK} strokeWidth={3} />;
      })}
      {(g.pins ?? []).map((pn, i) => {
        const xy = geo.proj([pn.lon, pn.lat]);
        if (!xy || !geo.visible([pn.lon, pn.lat])) return null;
        const q = sc(xy), e = at(pn.at);
        return (
          <g key={i} transform={`translate(${q[0]} ${q[1]})`} opacity={op(e * 3)}>
            <circle r={14 + ((f * 0.6) % 40)} fill="none" stroke="#ffd24a" strokeWidth={3} opacity={1 - ((f * 0.6) % 40) / 40} />
            <g transform={`translate(0 ${-(1 - op(e)) * 80}) scale(${Math.max(0, e)})`}>
              <path d="M0 0 C-22 -26 -22 -58 0 -58 C22 -58 22 -26 0 0Z" fill="#ffd24a" stroke={INK} strokeWidth={3} />
              <circle cy={-40} r={7} fill={INK} />
            </g>
            <text y={38} textAnchor="middle" fontFamily={HAND} fontSize={46} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">{pn.name}</text>
          </g>
        );
      })}
      {(g.labels ?? []).map((lb, i) => {
        const xy = geo.proj([lb.lon, lb.lat]);
        if (!xy || !geo.visible([lb.lon, lb.lat])) return null;
        const q = sc(xy), a0 = (lb.at ?? 0) * d;
        const n = Math.round(interpolate(f, [a0, a0 + lb.t.length * 2.2], [0, lb.t.length], C));
        const n2 = Math.round(interpolate(f, [a0 + lb.t.length * 2.2 + 6, a0 + lb.t.length * 2.2 + 6 + (lb.sub?.length ?? 0) * 2], [0, lb.sub?.length ?? 0], C));
        return (
          <g key={i}>
            <text x={q[0]} y={q[1]} textAnchor="middle" fontFamily={HAND} fontSize={lb.size ?? 72} fill="#fff" stroke={INK} strokeWidth={9} paintOrder="stroke">{lb.t.slice(0, n)}</text>
            {lb.sub && <text x={q[0]} y={q[1] + (lb.size ?? 72) * 0.78} textAnchor="middle" fontFamily={HAND} fontSize={(lb.size ?? 72) * 0.62} fill="#ffe14a" stroke={INK} strokeWidth={7} paintOrder="stroke">{lb.sub.slice(0, n2)}</text>}
          </g>
        );
      })}
    </svg>
  );
};
