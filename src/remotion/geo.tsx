// Vidfactory geo kit v2: satellite-style maps drawn in code (no image files).
// Projection is computed ONCE per scene; zoom/pan are SVG transforms, so textures stay glued to the land and frames render fast.
// Deps: npm i d3-geo topojson-client world-atlas
import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoOrthographic, geoMercator, geoPath, geoGraticule10, geoInterpolate, geoDistance, geoTransform, geoCentroid, geoArea} from 'd3-geo';
import {placeLabels, textBox, closeRing} from './geolabels';
import {resolveGeo} from './georesolve';
import geoLib from '../../library/geo.json'; // prebuilt places, historical regions and rivers (Egypt pack); scripts use {place:'Thebes'}, {ref:'upper_egypt'}, {ref:'nile'}
import {feature, mesh} from 'topojson-client';
import w110 from 'world-atlas/countries-110m.json';
import w50 from 'world-atlas/countries-50m.json';
import {Actor, CornerFigure, HAND, INK, MapClash, PoseName} from './world';
import {FocusOverlay, FocusT} from './germany_pack';

const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const feats = (w: any): any[] => (feature(w, w.objects.countries) as any).features;
const F110 = feats(w110), F50 = feats(w50);

type GeoStrict = {
  mode?: 'globe' | 'flat';
  from: {lon: number; lat: number; k?: number}; // k = zoom (1 = whole globe / whole world)
  to?: {lon: number; lat: number; k?: number};
  hi?: Record<string, string>; // country name (world-atlas spelling) -> fill colour, e.g. {'United Kingdom': '#d9455a'}
  dash?: string[]; // extra dashed white outline
  pins?: {name: string; lon: number; lat: number; at?: number}[];
  routes?: {a: [number, number]; b: [number, number]; color?: string; at?: number; arrow?: boolean; t?: string}[]; // arrow = arrowhead at the moving head instead of the dot; t = a label riding the arc, landing as the arrow lands
  labels?: {t: string; sub?: string; lon: number; lat: number; at?: number; size?: number; kind?: 'city' | 'sea' | 'river' | 'mountain'}[];
  names?: boolean | string[];
  lines?: {name?: string; pts: [number, number][]; color?: string; width?: number; at?: number}[];
  regions?: {name: string; pts: [number, number][]; color: string; sub?: string; at?: number; pulse?: boolean}[]; // pulse = a glow flash as the fill lands (the "lights up" read)
};
// What a script writes. Anywhere a lon/lat is needed you can give {place:'Thebes'} instead (library/geo.json); regions and lines can be {ref:'upper_egypt'} / {ref:'nile'}.
type Loc = {lon?: number; lat?: number; place?: string; k?: number};
export type GeoT = Omit<GeoStrict, 'from' | 'to' | 'pins' | 'labels' | 'regions' | 'lines'> & {
  from: Loc; to?: Loc; // k = zoom (1 = whole globe / whole world)
  pins?: {name?: string; place?: string; lon?: number; lat?: number; at?: number}[];
  labels?: {t?: string; place?: string; sub?: string; lon?: number; lat?: number; at?: number; size?: number; kind?: 'city' | 'sea' | 'river' | 'mountain'}[]; // sub = smaller yellow line (reference style); kind picks the style
  names?: boolean | string[]; // true = name every highlighted country; or a list of country names to label (neighbours, no fill needed)
  lines?: {ref?: string; name?: string; pts?: [number, number][]; color?: string; width?: number; at?: number}[]; // rivers and borders: lon/lat polyline or {ref:'nile'}
  regions?: {ref?: string; name?: string; pts?: [number, number][]; color?: string; sub?: string; at?: number; pulse?: boolean}[]; // historical polities: lon/lat outline or {ref:'new_kingdom_empire'}, filled and named; pulse = glow flash as the fill lands
  hiAt?: Record<string, number>; // timed hi fills: country name -> scene fraction at which its fill fades in (read from the raw scene object, like texture/presenter, so resolveGeo cannot strip it); unlisted countries render statically
  hiPulse?: string[]; // country names whose hi fill flashes a glow pulse as it lands (expects a matching hiAt entry)
  focus?: FocusT | FocusT[]; // grey scrim with a circular void on the year badge (default) or at x,y,r; `at`/`to` = fractions of the scene
  clash?: {lon?: number; lat?: number; place?: string; a?: string; b?: string; at?: number; s?: number}[]; // army clash art (small armies, swords, fire) at map points; a/b = the two sides' colours; at = fraction of the scene
  texture?: boolean; // K2 (2026-11-18): deterministic relief texture under the territory fills + a gentle sea grain; DEFAULT ON — texture:false restores the flat look
  approx?: boolean; // 6.i.7: draw the tiny "Borders approximate" disclaimer, bottom-right — set on scenes showing modern (post-1900) borders
  twobeat?: boolean; // 6.i.4: two-beat reveal — fills land first, labels/pins second; DEFAULT ON when the scene has fills, twobeat:false restores legacy timing
  presenter?: {lon?: number; lat?: number; place?: string; corner?: 'bl' | 'br' | 'tl' | 'tr'; point?: string; pointLon?: number; pointLat?: number; pointPlace?: string; stand?: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | 'auto'; at?: number; s?: number}; // K1 (2026-11-18): the presenter on the map; point = the name of a pin in pins[] for his pointer to touch. When pointing, his position is DERIVED FROM THE STICK (stand = direction he stands relative to the target, default 'auto'); lon/lat/place only place him when he is not pointing
  cor?: PoseName | boolean; // PRESENTER CORNER (2026-11-19, Bruce): true = pose 'idle', a PoseName = that pose — the presenter stands at the right corner of the frame for the whole scene, the way the retired narrator overlay used to. Read from the raw scene object (like presenter/focus) so resolveGeo cannot strip it; skipped when the scene already carries the geo presenter. GeoMap receives no word timings, so on maps he stands posed without lip-sync rather than being skipped.
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

export const GeoMap: React.FC<{g: GeoT; seed: string}> = ({g: gRaw, seed}) => {
  const g = React.useMemo(() => resolveGeo(gRaw as any, geoLib as any) as unknown as GeoStrict, [JSON.stringify(gRaw)]);
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
  const biome = tex('biome', 1024), cloud = tex('cloud', 512), shade = tex('shade', 512);
  const useTex = (gRaw as any).texture !== false; // K2: read from the raw script object (like clash/focus) so resolveGeo cannot strip it
  const at = (v: number | undefined) => spring({frame: f - (v ?? 0) * d, fps, config: {damping: 13, stiffness: 150}});
  const op = (v: number) => Math.min(1, Math.max(0, v));
  const hiNames = Object.keys(g.hi ?? {});
  const twoBeat = (gRaw as any).twobeat !== false && (hiNames.length > 0 || (g.regions ?? []).length > 0); // 6.i.4 two-beat reveal: fills first, names second
  const dAt = (v: number | undefined) => (twoBeat ? Math.min(0.9, (v ?? 0) + 0.18) : v);
  const hiAt = ((gRaw as any).hiAt ?? {}) as Record<string, number>; // timed hi fills: raw-read like texture/presenter so resolveGeo cannot strip them
  const hiPulse = ((gRaw as any).hiPulse ?? []) as string[];
  const pulseP = (landAt: number) => { const pp = (f - landAt * d) / Math.max(1, 0.8 * fps); return pp >= 0 && pp <= 1 ? pp : -1; }; // landing pulse: progress 0..1 over ~0.8 s from the landing moment, -1 = inactive; frame-based, deterministic
  const pulseG = (dd: string, col: string, pp: number, key: string) => (
    <g key={key}>
      <path d={dd} fill="#ffffff" opacity={(1 - pp) * 0.38} />
      <path d={dd} fill={col} opacity={(1 - pp) * 0.45} />
      <path d={dd} fill="none" stroke="#ffffff" strokeWidth={sw(6 + pp * 16)} strokeLinejoin="round" opacity={(1 - pp) * 0.8} />
    </g>
  );
  // ---- map naming: auto country names, historical regions, collision-free placement. Placement is solved at the END camera state and
  // applied as fixed pixel offsets, so labels glide with the map instead of hopping while it zooms. Never allowed to break a render. ----
  const mEnd = to.k / kmax;
  const named = React.useMemo(() => {
    type It = {id: string; kind: 'name' | 'region' | 'label' | 'pin'; t: string; sub?: string; pt: number[]; fs: number; style?: string; at?: number; must: boolean; prio: number; dx: number; dy: number; dropped: boolean};
    const items: It[] = [];
    try {
      const pp = geoPath(geo.proj) as any;
      const wanted = [...(g.names === true ? Object.keys(g.hi ?? {}) : Array.isArray(g.names) ? g.names : [])];
      wanted.forEach((nm) => {
        const ft = geo.FS.find((q: any) => q.properties?.name === nm);
        if (!ft) return;
        let target: any = ft;
        if (ft.geometry?.type === 'MultiPolygon') { // the biggest piece only (France without Guiana, Russia without far islands)
          const big = ft.geometry.coordinates.map((c: any) => ({c, a: geoArea({type: 'Polygon', coordinates: c} as any)})).sort((a: any, b: any) => b.a - a.a)[0];
          target = {type: 'Polygon', coordinates: big.c};
        }
        const ll = geoCentroid(target as any) as [number, number];
        const pt = geo.proj(ll);
        if (!pt || !geo.visible(ll)) return;
        const bb = pp.bounds(target), wid = (bb[1][0] - bb[0][0]) * mEnd, isHi = !!g.hi?.[nm];
        const fs = Math.max(30, Math.min(84, wid / Math.max(3, nm.length * 0.62)));
        if (!isHi && wid < 70) return;
        items.push({id: `n:${nm}`, kind: 'name', t: nm, pt, fs, must: isHi, prio: isHi ? 20 : 10, dx: 0, dy: 0, dropped: false});
      });
      (g.regions ?? []).forEach((r, i) => {
        const ring = closeRing(r.pts), ll = geoCentroid({type: 'Polygon', coordinates: [ring]} as any) as [number, number], pt = geo.proj(ll);
        if (pt) items.push({id: `r:${i}`, kind: 'region', t: r.name, sub: r.sub, pt, fs: 60, at: r.at, must: true, prio: 30, dx: 0, dy: 0, dropped: false});
      });
      (g.pins ?? []).forEach((pn, i) => { const pt = geo.proj([pn.lon, pn.lat]); if (pt) items.push({id: `p:${i}`, kind: 'pin', t: pn.name, pt, fs: 46, must: true, prio: 100, dx: 0, dy: 0, dropped: false}); });
      (g.labels ?? []).forEach((lb, i) => { const pt = geo.proj([lb.lon, lb.lat]); if (pt) items.push({id: `l:${i}`, kind: 'label', t: lb.t, sub: lb.sub, pt, fs: lb.size ?? (lb.kind === 'sea' ? 56 : lb.kind ? 42 : 72), style: lb.kind, at: lb.at, must: true, prio: 50, dx: 0, dy: 0, dropped: false}); });
      const end = (pt: number[]) => [960 + mEnd * (pt[0] - 960), 540 + mEnd * (pt[1] - 540)];
      const placed = placeLabels(items.map((it) => { const e = end(it.pt), b = textBox(it.t, it.fs, it.sub); return {id: it.id, x: e[0], y: e[1] + (it.kind === 'pin' ? 8 : 0), w: b.w, h: b.h + (it.kind === 'pin' ? 60 : 0), prio: it.prio, must: it.must}; }));
      placed.forEach((p: any, i) => { if (p.dropped) items[i].dropped = true; else { items[i].dx = p.dx; items[i].dy = p.dy; } });
    } catch (e) { console.warn('map naming skipped:', e); }
    return items;
  }, [seed, JSON.stringify(g.names), JSON.stringify(g.regions), JSON.stringify(g.labels), JSON.stringify(g.pins), JSON.stringify(g.hi), mEnd]);
  const linePaths = (g.lines ?? []).map((l) => { try { return (geoPath(geo.proj) as any)({type: 'LineString', coordinates: l.pts}) as string; } catch (e) { return ''; } });
  const regionPaths = (g.regions ?? []).map((r) => { try { const ring = closeRing(r.pts); const big = geoArea({type: 'Polygon', coordinates: [ring]} as any) > 2 * Math.PI; return (geoPath(geo.proj) as any)({type: 'Polygon', coordinates: [big ? ring.slice().reverse() : ring]}) as string; } catch (e) { return ''; } });
  const rp = (coords: any) => { const pp = geoPath(geo.proj) as any; return (pp({type: 'LineString', coordinates: coords}) ?? '') as string; };
  const R = geo.R * m;
  // army clashes: read from the raw script object (resolveGeo is not touched); {place} or {lon,lat}; hidden when off-screen or on the far side of the globe
  const clashItems = ((gRaw as any).clash ?? []).flatMap((c: any) => {
    const ll = (c.place ? (geoLib as any).places?.[c.place] : c.lon !== undefined ? [c.lon, c.lat] : null) as [number, number] | null;
    const xy = ll ? geo.proj(ll) : null;
    if (!ll || !xy || !geo.visible(ll)) return [];
    const q = sc(xy);
    return [{x: q[0], y: q[1], a: c.a, b: c.b, at: c.at, s: c.s}];
  });

  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id={`oc${seed}`} cx="0.45" cy="0.4" r="0.85"><stop offset="0" stopColor="#0d4a9a" /><stop offset="0.6" stopColor="#08306b" /><stop offset="1" stopColor="#031330" /></radialGradient>
        <radialGradient id={`sp${seed}`} cx="0.5" cy="0.5" r="0.8"><stop offset="0" stopColor="#0c1530" /><stop offset="1" stopColor="#02040b" /></radialGradient>
        <radialGradient id={`sh${seed}`} cx="0.36" cy="0.3" r="0.8"><stop offset="0.45" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#010a1c" stopOpacity={0.7} /></radialGradient>
        <radialGradient id={`vg${seed}`}><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.5} /></radialGradient>
        {biome && <pattern id={`bi${seed}`} patternUnits="userSpaceOnUse" width={T} height={T}><image href={biome} width={T} height={T} /></pattern>}
        {cloud && <pattern id={`cl${seed}`} patternUnits="userSpaceOnUse" width={1500} height={1500} patternTransform={`translate(${f * 0.6} ${f * 0.12})`}><image href={cloud} width={1500} height={1500} /></pattern>}
        {useTex && shade && <pattern id={`rel${seed}`} patternUnits="userSpaceOnUse" width={T} height={T}><image href={shade} width={T} height={T} /></pattern>}
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
        {useTex && shade && <rect width={1920} height={1080} fill={`url(#rel${seed})`} opacity={0.05} />}
        <g transform={tf}>
          {/* continental shelf glow: two soft strokes on the coarse coastline */}
          {[44, 16].map((w, i) => <path key={w} d={geo.shelf} fill="none" stroke="#2f8fe0" strokeWidth={sw(w)} strokeLinejoin="round" opacity={[0.12, 0.22][i]} />)}
          <path d={geo.grat} fill="none" stroke="#9fd2ff" strokeWidth={sw(0.7)} opacity={0.14} />
          <path d={L.land} fill={biome ? `url(#bi${seed})` : '#5b8f55'} />
          {useTex && shade && <path d={L.land} fill={`url(#rel${seed})`} opacity={0.16} />} {/* K2: relief shading over the base land, UNDER the hi/region fills (0.86/0.82 alpha) and every label/pin */}
          <path d={L.land} fill="none" stroke="#14301f" strokeWidth={sw(1.1)} opacity={0.65} />
          <path d={L.borders} fill="none" stroke="#fff" strokeWidth={sw(0.9)} opacity={0.22} />
          {hiNames.map((n) => {
            const dd = geo.one(li, n), col = g.hi![n];
            if (!dd) return null;
            const timed = hiAt[n] !== undefined;
            return (
              <g key={n} opacity={timed ? op(at(hiAt[n]) * 3) : undefined}>
                <path d={dd} fill="none" stroke="#fff" strokeWidth={sw(14)} opacity={0.14} strokeLinejoin="round" />
                <path d={dd} fill={col} opacity={0.86} />
                <path d={dd} fill="none" stroke="#fff" strokeWidth={sw(3.2)} strokeLinejoin="round" />
              </g>
            );
          })}
          {hiPulse.map((n) => { const dd = geo.one(li, n); if (!dd || hiAt[n] === undefined) return null; const pp = pulseP(hiAt[n]); return pp < 0 ? null : pulseG(dd, g.hi?.[n] ?? '#ffffff', pp, `hp:${n}`); })}
          {(g.regions ?? []).map((r, i) => regionPaths[i] ? (<g key={`rg${i}`} opacity={op(at(r.at) * 3)}><path d={regionPaths[i]} fill="none" stroke="#fff" strokeWidth={sw(14)} opacity={0.14} strokeLinejoin="round" /><path d={regionPaths[i]} fill={r.color} opacity={0.82} /><path d={regionPaths[i]} fill="none" stroke="#fff" strokeWidth={sw(3.2)} strokeLinejoin="round" /></g>) : null)}
          {(g.regions ?? []).map((r, i) => { if (!regionPaths[i]) return null; const want = (r as any).pulse ?? (gRaw as any).regions?.[i]?.pulse; if (!want) return null; const pp = pulseP(r.at ?? 0); return pp < 0 ? null : pulseG(regionPaths[i], r.color, pp, `rp${i}`); })}
          {(g.lines ?? []).map((l, i) => { if (!linePaths[i]) return null; const a0 = (l.at ?? 0.1) * d, prog = interpolate(f, [a0, a0 + Math.max(30, d * 0.4)], [0, 1], {...C, easing: Easing.inOut(Easing.quad)}); return (<g key={`ln${i}`}><path d={linePaths[i]} pathLength={1} fill="none" stroke={INK} strokeWidth={sw((l.width ?? 7) + 4)} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1" strokeDashoffset={1 - prog} opacity={0.55} /><path d={linePaths[i]} pathLength={1} fill="none" stroke={l.color ?? '#4fb3e8'} strokeWidth={sw(l.width ?? 7)} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1" strokeDashoffset={1 - prog} /></g>); })}
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
        if (prog <= 0) return null;
        const ip = geoInterpolate(r.a, r.b);
        const col = r.color ?? '#ffd24a';
        const headLL = ip(prog) as [number, number];
        const hp = geo.proj(headLL);
        const head = (() => {
          if (!hp || !geo.visible(headLL)) return null;
          const q = sc(hp);
          const dot = <circle key="dot" cx={q[0]} cy={q[1]} r={12} fill={col} stroke={INK} strokeWidth={3} />;
          if (!(r as any).arrow) return dot;
          // arrowhead: a filled triangle at the head, oriented along the arc tangent in projected screen space (same pattern as the head dot)
          const pA = geo.proj(ip(Math.max(0, prog - 0.02)) as [number, number]), pB = geo.proj(ip(Math.min(1, prog + 0.02)) as [number, number]);
          if (!pA || !pB) return dot;
          const qA = sc(pA), qB = sc(pB);
          let dx = qB[0] - qA[0], dy = qB[1] - qA[1];
          const dl = Math.hypot(dx, dy);
          if (dl < 0.5) return dot;
          dx /= dl; dy /= dl;
          const AL = 30, AW = 12; // arrowhead length / half-width in screen px, proportional to the route's 6-unit screen width
          const tip: [number, number] = [q[0] + dx * AL * 0.45, q[1] + dy * AL * 0.45];
          const bc: [number, number] = [q[0] - dx * AL * 0.55, q[1] - dy * AL * 0.55];
          return <polygon key="ah" points={`${tip[0]},${tip[1]} ${bc[0] - dy * AW},${bc[1] + dx * AW} ${bc[0] + dy * AW},${bc[1] - dx * AW}`} fill={col} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
        })();
        const lbl = (() => {
          const t = (r as any).t as string | undefined;
          if (!t) return null;
          const lo = interpolate(prog, [0.8, 1], [0, 1], C); // the label lands as the arrow lands
          if (lo <= 0) return null;
          const midLL = ip(0.5) as [number, number];
          const mp = geo.proj(midLL);
          if (!mp || !geo.visible(midLL)) return null;
          const mq = sc(mp);
          return <text key="rl" x={mq[0]} y={mq[1]} textAnchor="middle" dominantBaseline="middle" fontFamily={HAND} fontSize={48} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={lo}>{t}</text>;
        })();
        if (!head && !lbl) return null;
        return <g key={`h${i}`}>{head}{lbl}</g>;
      })}
      {named.filter((it) => (it.kind === 'name' || it.kind === 'region') && !it.dropped).map((it) => {
        const q = sc(it.pt), e = at(dAt(it.at));
        return (
          <g key={it.id} opacity={op(e * 3)}>
            <text x={q[0] + it.dx} y={q[1] + it.dy} textAnchor="middle" fontFamily={HAND} fontSize={it.fs} fill="#fff" stroke={INK} strokeWidth={Math.max(6, it.fs * 0.12)} paintOrder="stroke" letterSpacing={it.kind === 'name' ? 1 : 0}>{it.t}</text>
            {it.sub && <text x={q[0] + it.dx} y={q[1] + it.dy + it.fs * 0.78} textAnchor="middle" fontFamily={HAND} fontSize={it.fs * 0.62} fill="#ffe14a" stroke={INK} strokeWidth={7} paintOrder="stroke">{it.sub}</text>}
          </g>
        );
      })}
      {(g.pins ?? []).map((pn, i) => {
        const xy = geo.proj([pn.lon, pn.lat]);
        if (!xy || !geo.visible([pn.lon, pn.lat])) return null;
        const q = sc(xy), e = at(dAt(pn.at));
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
      {clashItems.length > 0 && <MapClash f={f} d={d} items={clashItems} />}
      {(g.labels ?? []).map((lb, i) => {
        const xy = geo.proj([lb.lon, lb.lat]);
        if (!xy || !geo.visible([lb.lon, lb.lat])) return null;
        const nm = named.find((q) => q.id === `l:${i}`), q = sc(xy), a0 = (dAt(lb.at) ?? 0) * d, ox = nm?.dx ?? 0, oy = nm?.dy ?? 0;
        const typed = (from: number, len: number, per: number) => (len <= 0 ? 0 : Math.round(interpolate(f, [from, from + len * per], [0, len], C)));
        const n = typed(a0, lb.t.length, 2.2);
        const n2 = typed(a0 + lb.t.length * 2.2 + 6, lb.sub?.length ?? 0, 2);
        const fs = lb.size ?? (lb.kind === 'sea' ? 56 : lb.kind ? 42 : 72), kind = lb.kind;
        const txt = lb.t.slice(0, n);
        return (
          <g key={i}>
            {kind === 'city' && <circle cx={q[0]} cy={q[1]} r={8} fill="#fff" stroke={INK} strokeWidth={3} opacity={op(at(dAt(lb.at)) * 3)} />}
            {kind === 'mountain' && <path d={`M${q[0] - 14} ${q[1] + 8} L${q[0]} ${q[1] - 16} L${q[0] + 14} ${q[1] + 8}Z`} fill="#fff" stroke={INK} strokeWidth={3} opacity={op(at(dAt(lb.at)) * 3)} />}
            <text x={q[0] + ox} y={q[1] + oy + (kind === 'city' || kind === 'mountain' ? -26 : 0)} textAnchor="middle" fontFamily={HAND} fontSize={fs} fontStyle={kind === 'sea' || kind === 'river' || kind === 'mountain' ? 'italic' : 'normal'} letterSpacing={kind === 'sea' ? 9 : 0} fill={kind === 'sea' ? '#cfe9ff' : '#fff'} stroke={kind === 'sea' ? '#0b2a52' : INK} strokeWidth={kind === 'sea' ? 6 : kind ? 6 : 9} paintOrder="stroke" opacity={kind === 'sea' ? 0.92 : 1}>{txt}</text>
            {lb.sub && <text x={q[0] + ox} y={q[1] + oy + fs * 0.78} textAnchor="middle" fontFamily={HAND} fontSize={fs * 0.62} fill="#ffe14a" stroke={INK} strokeWidth={7} paintOrder="stroke">{lb.sub.slice(0, n2)}</text>}
          </g>
        );
      })}
      {(gRaw as any).approx && <text x={1890} y={1054} textAnchor="end" fontFamily={HAND} fontSize={19} fill="#ffffff" opacity={0.55}>Borders approximate</text>}
      {(() => {
        const pr = (gRaw as any).presenter as any; // K1: read from the raw script object, like clash
        if (!pr) return null;
        const S = (pr.s ?? 0.45) * 1.3;
        const pin = pr.point ? (g.pins ?? []).find((pn: any) => pn.name === pr.point) : undefined;
        const tll = (pin ? [pin.lon, pin.lat] : pr.pointLon !== undefined ? [pr.pointLon, pr.pointLat] : pr.pointPlace ? (geoLib as any).places?.[pr.pointPlace] : null) as [number, number] | null;
        let tgt: [number, number] | null = null;
        if (tll) { const xy = geo.proj(tll); if (xy && geo.visible(tll)) { const q = sc(xy); tgt = [q[0], q[1]]; } }
        const drawPres = (pos: [number, number], point: boolean) => {
          const flip = point && tgt ? tgt[0] < pos[0] : false;
          const hand: [number, number] = [pos[0] + (flip ? -1 : 1) * 130 * S, pos[1] - 245 * S];
          return (
            <g>
              {point && tgt && (<g><line x1={hand[0]} y1={hand[1]} x2={tgt[0]} y2={tgt[1]} stroke={INK} strokeWidth={9} strokeLinecap="round" /><line x1={hand[0]} y1={hand[1]} x2={tgt[0]} y2={tgt[1]} stroke="#8a5a33" strokeWidth={5} strokeLinecap="round" /><circle cx={tgt[0]} cy={tgt[1]} r={13 + Math.sin(f / 6) * 2.5} fill="none" stroke="#ffd24a" strokeWidth={4} /></g>)}
              <g transform={`translate(${pos[0]} ${pos[1]})`}><Actor a={{look: 'presenter', x: 0, y: 0, s: pr.s ?? 0.45, pose: point ? 'point' : 'idle', held: point ? 'pointer' : undefined, flip, at: pr.at ?? 0, ns: true}} seed="pres" /></g>
            </g>
          );
        };
        if (pr.corner) { const pos: [number, number] = pr.corner === 'bl' ? [180, 950] : pr.corner === 'br' ? [1740, 950] : pr.corner === 'tl' ? [180, 330] : [1740, 330]; return drawPres(pos, !!tgt); }
        if (tgt) {
          // Stick-derived placement (Bruce, 2026-11-18): the presenter NEVER stands on the
          // region he indicates. Only the TIP of his stick touches the target T; his feet
          // anchor sits exactly one stick-length L from T along the stand direction, and
          // the drawn stick runs from his hand to the tip on T — place the tip, the man
          // follows the stick. L = the pointer's drawn length (322 units in the held-item
          // art in world.tsx) in the same screen scale as the hand offsets (x1.3 x s).
          // Recomputed per frame from T, so he glides with the camera as before.
          const L = 322 * S;
          const DIRS: Record<string, [number, number]> = {n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0], ne: [0.7071, -0.7071], nw: [-0.7071, -0.7071], se: [0.7071, 0.7071], sw: [-0.7071, 0.7071]};
          const anchorFor = (dir: string): [number, number] => [tgt[0] + DIRS[dir][0] * L, tgt[1] + DIRS[dir][1] * L];
          const farSide = (A: [number, number]): boolean => { // invert the screen anchor back to lon/lat; he hides when his STAND point rotates to the globe's far side (T's own visibility is already checked above)
            const inv = (geo.proj as any).invert as ((pt: [number, number]) => [number, number] | null) | undefined;
            if (!inv) return false;
            const llA = inv([cx + (A[0] - 960) / m, cy + (A[1] - 540) / m]);
            return !!llA && !geo.visible(llA);
          };
          const sN = pr.s ?? 0.45, figH = 615 * sN, figHW = 170 * sN, MG = 12; // his figure box: ~615 units tall at s=1, ~340 wide, feet at the anchor
          const pen = (A: [number, number]): number => Math.max(0, MG - (A[0] - figHW)) + Math.max(0, (A[0] + figHW) - (1920 - MG)) + Math.max(0, MG - (A[1] - figH)) + Math.max(0, A[1] - (1080 - MG)); // total frame overflow in px; 0 = the whole figure is in frame
          let pos: [number, number] | null = null;
          if (pr.stand && pr.stand !== 'auto' && DIRS[pr.stand]) { const A = anchorFor(pr.stand); if (!farSide(A)) pos = A; }
          else { // 'auto' (default): evaluate the 4 diagonals, then the 4 cardinals. Among the directions that keep the whole figure in frame, prefer the anchor FARTHEST from frame centre — he tends to stand toward the open edge/sea rather than across the map's middle. If none keeps him fully in frame, take the least-overflow direction: minimal overflow, never a fallback onto the target.
            const ORDER = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
            const cands = ORDER.map((dir) => ({dir, A: anchorFor(dir)})).filter((c) => !farSide(c.A));
            if (!cands.length) return null;
            const fitting = cands.filter((c) => pen(c.A) === 0);
            if (fitting.length) { let best = fitting[0]; for (const c of fitting) { const d2 = (c.A[0] - 960) ** 2 + (c.A[1] - 540) ** 2, b2 = (best.A[0] - 960) ** 2 + (best.A[1] - 540) ** 2; if (d2 > b2) best = c; } pos = best.A; }
            else { let best = cands[0]; for (const c of cands) if (pen(c.A) < pen(best.A)) best = c; pos = best.A; }
          }
          if (!pos) return null;
          return drawPres(pos, true);
        }
        // Not pointing: legacy stand placement (lon/lat or library place), idle, no stick.
        const ll = (pr.place ? (geoLib as any).places?.[pr.place] : pr.lon !== undefined ? [pr.lon, pr.lat] : null) as [number, number] | null;
        const xy = ll ? geo.proj(ll) : null;
        if (!ll || !xy || !geo.visible(ll)) return null;
        const q = sc(xy);
        return drawPres([q[0], q[1]], false);
      })()}
      {(gRaw as any).focus && <FocusOverlay focus={(gRaw as any).focus} f={f} d={d} seed={seed} />}
      {(gRaw as any).cor && !(gRaw as any).presenter && <CornerFigure cor={(gRaw as any).cor} seed={`${seed}cor`} />}
    </svg>
  );
};
