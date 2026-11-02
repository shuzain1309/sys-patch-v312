// Resolve library references in a geo scene: {place:'Thebes'} -> lon/lat, regions {ref:'upper_egypt'}, lines {ref:'nile'}.
// Pure and total: an unknown name is skipped with a warning (CI already fails the script before a render if a name is unknown).
export type GeoLib = {places?: Record<string, [number, number]>; regions?: Record<string, any>; lines?: Record<string, any>};
export const resolveGeo = <T extends Record<string, any>>(g: T, lib: GeoLib): T => {
  const out: any = {...g};
  const P = lib.places ?? {};
  const loc = (o: any) => {
    if (o && o.place) {
      const p = P[o.place];
      if (!p) { console.warn(`geo: unknown place "${o.place}"`); return null; }
      return {...o, lon: o.lon ?? p[0], lat: o.lat ?? p[1]};
    }
    return o;
  };
  if (out.from) out.from = loc(out.from) ?? out.from;
  if (out.to) out.to = loc(out.to) ?? out.to;
  for (const k of ['labels', 'pins', 'routes'] as const) {
    if (!Array.isArray(out[k])) continue;
    out[k] = out[k].map((o: any) => {
      if (k === 'routes') return o; // routes keep explicit points
      const r = loc(o);
      return r && o.place ? {...r, t: o.t ?? o.place, name: o.name ?? o.place} : r;
    }).filter(Boolean);
  }
  const ref = (list: any[] | undefined, table: Record<string, any> | undefined, what: string) =>
    (list ?? []).map((o: any) => { if (!o.ref) return o; const b = table?.[o.ref]; if (!b) { console.warn(`geo: unknown ${what} "${o.ref}"`); return null; } return {...b, ...o}; }).filter(Boolean);
  if (out.regions) out.regions = ref(out.regions, lib.regions, 'region');
  if (out.lines) out.lines = ref(out.lines, lib.lines, 'line');
  return out as T;
};
