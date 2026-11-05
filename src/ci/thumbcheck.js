// Shared by CI (extract.js, thumb.js) and the dashboard: checks a THUMB spec. No dependencies.
// lists = {countries: [world-atlas names], regions: [library/geo.json region keys]}
const LAYOUTS = ['P1', 'P2', 'P3'];
const EXPR = ['smile', 'neutral', 'shock', 'sad', 'angry'];

function validateThumb(t, lists, where = 'THUMB') {
  const errors = [], warnings = [];
  const e = (m) => errors.push(`${where}: ${m}`), w = (m) => warnings.push(`${where}: ${m}`);
  if (!t || typeof t !== 'object') return {errors: [`${where}: not an object`], warnings};
  if (!LAYOUTS.includes(t.layout)) e(`layout must be one of ${LAYOUTS.join(', ')}`);
  const words = String(t.word || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) e('word is empty');
  else {
    if (words.length > 2) e(`word has ${words.length} words; use 1 or 2 (it must read at 160 px wide)`);
    if (String(t.word).length > 18) e('word is over 18 characters');
    else if (String(t.word).length > 11) w('word is long; it will shrink and get harder to read on a phone');
  }
  for (const k of ['chip', 'chip2']) if (t[k] !== undefined && String(t[k]).length > 24) e(`${k} is over 24 characters`);
  const names = Array.isArray(t.map) ? t.map : t.map ? [t.map] : [];
  if (!names.length && !t.region && !t.geo) e('give a map: "map" (country names) or "region" (empire from the library)');
  if (names.length > 4) e('map: at most 4 countries');
  const names2 = Array.isArray(t.map2) ? t.map2 : t.map2 ? [t.map2] : [];
  const bad2 = names2.filter((n) => !lists.countries.includes(n));
  if (bad2.length) e(`unknown country name(s) in map2: ${bad2.join(', ')}`);
  if (t.region2 && !lists.regions.includes(t.region2)) e(`unknown region2 "${t.region2}"`);
  const bad = names.filter((n) => !lists.countries.includes(n));
  if (bad.length) e(`unknown country name(s): ${bad.join(', ')} (world-atlas spelling, e.g. "United States of America")`);
  if (t.region && !lists.regions.includes(t.region)) e(`unknown region "${t.region}" (library/geo.json: ${lists.regions.join(', ') || 'none'})`);
  if (t.layout === 'P2' && !t.chip2) w('P2 (split) looks best with chip and chip2, one year per side');
  if (t.arrow && typeof t.arrow === 'object' && (typeof t.arrow.lon !== 'number' || typeof t.arrow.lat !== 'number')) e('arrow must be true or {lon, lat}');
  if (t.face) {
    if (t.face.expr && !EXPR.includes(t.face.expr)) e(`face.expr must be one of ${EXPR.join(', ')}`);
    for (const k of ['upload', 'upload2', 'photo', 'photo2']) if (t.face[k] !== undefined && !/^[a-z0-9_]+$/.test(t.face[k])) e(`face.${k} must be lower-case letters, digits, underscore`);
  }
  return {errors, warnings};
}

// whole block: base spec + up to 2 variants (each overrides the base)
function validateBlock(b, lists) {
  const errors = [], warnings = [];
  const one = (t, where) => { const r = validateThumb(t, lists, where); errors.push(...r.errors); warnings.push(...r.warnings); };
  one({...b, variants: undefined}, 'THUMB A');
  if (b.variants !== undefined && !Array.isArray(b.variants)) errors.push('THUMB: variants must be a list');
  else if ((b.variants || []).length > 2) errors.push('THUMB: at most 2 variants (A + 2 = 3 thumbnails for the Studio A/B test)');
  else (b.variants || []).forEach((v, i) => one({...b, ...v, variants: undefined}, `THUMB ${'BC'[i]}`));
  return {errors, warnings};
}
const expand = (b) => [{...b, variants: undefined}, ...(b.variants || []).slice(0, 2).map((v) => ({...b, ...v, variants: undefined}))].map((v, i) => ({...v, id: 'ABC'[i]}));

module.exports = {validateThumb, validateBlock, expand, LAYOUTS};
