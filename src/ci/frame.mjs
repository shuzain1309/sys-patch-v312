// Where the subject goes in the thumbnail map and how big it is. Numbers measured from the two reference thumbnails (scaled to 1920x1080):
//   subject centre at 47.5% of the width and 50% of the height; the subject fills about 62% of the height;
//   its width is 38% of the frame for a country-sized subject (Iran, 19 degrees wide) and 18% for a tiny one (Macedon, 3 degrees): linear in between.
// The Remotion still and terrain.py both use this view, so the vector overlay and the terrain image line up exactly.
import {createRequire} from 'module';
import {geoArea, geoBounds} from 'd3-geo';
import {feature} from 'topojson-client';
const require = createRequire(import.meta.url);
const w50 = require('world-atlas/countries-50m.json');
const FEATS = feature(w50, w50.objects.countries).features;
const DEG = 180 / Math.PI, mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + lat / DEG / 2));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** spec = {names: [country], pts: [[lon,lat]...] (empire outline)}; box = {x, y, w, h} = the part of the canvas this map owns (P2 uses half the frame) */
export function viewFor(spec, box = {x: 0, y: 0, w: 1920, h: 1080}) {
  let W = 1e9, E = -1e9, S = 90, N = -90;
  const add = (w, s, e, n) => { if (w > e) e += 360; W = Math.min(W, w); E = Math.max(E, e); S = Math.min(S, s); N = Math.max(N, n); };
  for (const nm of spec.names || []) {
    const ft = FEATS.find((q) => q.properties && q.properties.name === nm);
    if (!ft) continue;
    const polys = ft.geometry.type === 'MultiPolygon' ? ft.geometry.coordinates : [ft.geometry.coordinates];
    const big = polys.map((c) => ({c, a: geoArea({type: 'Polygon', coordinates: c})})).sort((a, b) => b.a - a.a)[0]; // mainland only
    const [[w, s], [e, n]] = geoBounds({type: 'Polygon', coordinates: big.c});
    add(w, s, e, n);
  }
  const p = spec.pts || [];
  if (p.length) add(Math.min(...p.map((q) => q[0])), Math.min(...p.map((q) => q[1])), Math.max(...p.map((q) => q[0])), Math.max(...p.map((q) => q[1])));
  if (W > E) return {lon: 0, lat: 20, s: 300, tx: box.x + box.w * 0.475, ty: box.y + box.h * 0.5, ok: false};
  const spanDeg = E - W, dl = Math.max(spanDeg / DEG, 0.02), dpsi = Math.max(mercY(N) - mercY(S), 0.02);
  const wfrac = 0.18 + 0.20 * clamp((spanDeg - 3) / 16, 0, 1); // 18% at 3 degrees wide, 38% at 19 degrees and more
  const s = clamp(Math.min(wfrac * box.w / dl, 0.62 * box.h / dpsi), 240, 300 * 80);
  const lat = Math.atan(Math.sinh((mercY(N) + mercY(S)) / 2)) * DEG;
  return {lon: (W + E) / 2, lat, s, tx: box.x + box.w * 0.475, ty: box.y + box.h * 0.5, ok: true, bbox: {W, E, S, N}};
}
