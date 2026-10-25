// Vidfactory geo kit: animated globe / flat maps drawn from vector data (no satellite images, no tiles, no tokens).
// Deps: npm i d3-geo topojson-client world-atlas. Copy once to src/remotion/geo.tsx.
import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoOrthographic, geoMercator, geoPath, geoGraticule10, geoInterpolate, geoDistance} from 'd3-geo';
import {feature} from 'topojson-client';
import w110 from 'world-atlas/countries-110m.json';
import w50 from 'world-atlas/countries-50m.json';
import {HAND, INK} from './world';

const feats = (w: any): any[] => (feature(w, w.objects.countries) as any).features;
const F110 = feats(w110);
const F50 = feats(w50);
const LAND = ['#5e9a62', '#6aa56a', '#7bab62', '#8aa862', '#6f9b6e', '#74a85a'];
const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type GeoT = {
  mode?: 'globe' | 'flat';
  from: {lon: number; lat: number; k?: number}; // k = zoom (1 = whole globe / whole world)
  to?: {lon: number; lat: number; k?: number};
  hi?: Record<string, string>; // country name (world-atlas spelling) -> fill colour
  dash?: string[]; // countries that get a white dashed outline
  pins?: {name: string; lon: number; lat: number; at?: number}[];
  routes?: {a: [number, number]; b: [number, number]; color?: string; at?: number}[];
  labels?: {t: string; lon: number; lat: number; at?: number; size?: number}[];
};

export const GeoMap: React.FC<{g: GeoT; seed: string}> = ({g, seed}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: d} = useVideoConfig();
  const globe = (g.mode ?? 'globe') === 'globe';
  const p = interpolate(f, [0, d], [0, 1], {...C, easing: Easing.inOut(Easing.quad)});
  const to = g.to ?? g.from;
  let dl = to.lon - g.from.lon;
  if (dl > 180) dl -= 360;
  if (dl < -180) dl += 360;
  const lon = g.from.lon + dl * p + (g.to ? 0 : f * 0.015);
  const lat = g.from.lat + (to.lat - g.from.lat) * p;
  const k = Math.exp(Math.log(g.from.k ?? 1) + (Math.log(to.k ?? g.from.k ?? 1) - Math.log(g.from.k ?? 1)) * p);
  const proj: any = globe
    ? geoOrthographic().rotate([-lon, -lat]).translate([960, 540]).scale(430 * k).clipAngle(90)
    : geoMercator().center([lon, lat]).translate([960, 540]).scale(300 * k);
  const path: any = geoPath(proj);
  const FS = k >= 2.2 || !globe ? F50 : F110;
  const visible = (ll: [number, number]) => !globe || geoDistance([lon, lat], ll) < Math.PI / 2 - 0.05;
  const at = (v: number | undefined) => spring({frame: f - (v ?? 0) * d, fps, config: {damping: 13, stiffness: 150}});
  const op = (v: number) => Math.min(1, Math.max(0, v));
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id={`oc${seed}`} cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#2c78c4" /><stop offset="1" stopColor="#0b2b58" /></radialGradient>
        <radialGradient id={`sh${seed}`} cx="0.35" cy="0.3" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#020b1f" stopOpacity={0.6} /></radialGradient>
        <radialGradient id={`sp${seed}`} cx="0.5" cy="0.5" r="0.8"><stop offset="0" stopColor="#101a3a" /><stop offset="1" stopColor="#03060f" /></radialGradient>
        <radialGradient id={`at${seed}`}><stop offset="0.9" stopColor="#6fd0ff" stopOpacity={0.5} /><stop offset="1" stopColor="#6fd0ff" stopOpacity={0} /></radialGradient>
      </defs>
      {globe ? (
        <>
          <rect width={1920} height={1080} fill={`url(#sp${seed})`} />
          {Array.from({length: 70}, (_, i) => <circle key={i} cx={random(`${seed}x${i}`) * 1920} cy={random(`${seed}y${i}`) * 1080} r={1 + random(`${seed}r${i}`) * 2} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(f / 25 + i))} />)}
          <circle cx={960} cy={540} r={430 * k * 1.06} fill={`url(#at${seed})`} />
          <path d={path({type: 'Sphere'})} fill={`url(#oc${seed})`} />
        </>
      ) : (
        <rect width={1920} height={1080} fill={`url(#oc${seed})`} />
      )}
      <path d={path(geoGraticule10())} fill="none" stroke="#9fd2ff" strokeWidth={0.8} opacity={0.22} />
      {FS.map((ft: any, i: number) => {
        const nm = ft.properties?.name as string;
        const hot = g.hi?.[nm];
        return <path key={i} d={path(ft) ?? ''} fill={hot ?? LAND[i % LAND.length]} stroke={hot ? '#fff' : '#2c4f35'} strokeWidth={hot ? 1.6 : 0.6} opacity={hot ? 1 : 0.94} />;
      })}
      {(g.dash ?? []).map((nm) => {
        const ft = FS.find((q: any) => q.properties?.name === nm);
        return ft ? <path key={nm} d={path(ft) ?? ''} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="12 9" strokeDashoffset={-f * 0.6} /> : null;
      })}
      {globe && <path d={path({type: 'Sphere'})} fill={`url(#sh${seed})`} />}
      {(g.routes ?? []).map((r, i) => {
        const prog = interpolate(f, [(r.at ?? 0.1) * d, (r.at ?? 0.1) * d + Math.max(30, d * 0.5)], [0, 1], {...C, easing: Easing.inOut(Easing.quad)});
        const ip = geoInterpolate(r.a, r.b);
        const coords = Array.from({length: 49}, (_, j) => ip(j / 48));
        const head = proj(ip(prog));
        return (
          <g key={i}>
            <path d={path({type: 'LineString', coordinates: coords}) ?? ''} fill="none" stroke={r.color ?? '#ffd24a'} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - prog} />
            {head && visible(ip(prog) as [number, number]) && prog > 0 && <circle cx={head[0]} cy={head[1]} r={11} fill={r.color ?? '#ffd24a'} stroke={INK} strokeWidth={3} />}
          </g>
        );
      })}
      {(g.pins ?? []).map((pn, i) => {
        const xy = proj([pn.lon, pn.lat]);
        if (!xy || !visible([pn.lon, pn.lat])) return null;
        const e = at(pn.at);
        return (
          <g key={i} transform={`translate(${xy[0]} ${xy[1]})`} opacity={op(e * 3)}>
            <circle r={14 + ((f * 0.6) % 40)} fill="none" stroke="#ffd24a" strokeWidth={3} opacity={1 - ((f * 0.6) % 40) / 40} />
            <g transform={`translate(0 ${-(1 - op(e)) * 80}) scale(${Math.max(0, e)})`}>
              <path d="M0 0 C-22 -26 -22 -58 0 -58 C22 -58 22 -26 0 0Z" fill="#ffd24a" stroke={INK} strokeWidth={3} transform="translate(0 0)" />
              <circle cy={-40} r={7} fill={INK} />
            </g>
            <text y={34} textAnchor="middle" fontFamily={HAND} fontSize={44} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">{pn.name}</text>
          </g>
        );
      })}
      {(g.labels ?? []).map((lb, i) => {
        const xy = proj([lb.lon, lb.lat]);
        if (!xy || !visible([lb.lon, lb.lat])) return null;
        const n = Math.round(interpolate(f, [(lb.at ?? 0) * d, (lb.at ?? 0) * d + lb.t.length * 2.2], [0, lb.t.length], C));
        return <text key={i} x={xy[0]} y={xy[1]} textAnchor="middle" fontFamily={HAND} fontSize={lb.size ?? 56} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">{lb.t.slice(0, n)}</text>;
      })}
    </svg>
  );
};
