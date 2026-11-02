// Validates the decrypted script and extracts everything CI needs: narration (SCENES order), chapters, SEO, meta.
const fs = require('fs');
const {qa} = require('./qa');
const src = fs.readFileSync('src/remotion/current_script.tsx', 'utf8');
const block = (tag) => { const m = src.match(new RegExp(`/\\*${tag}\\*/([\\s\\S]*?)/\\*${tag}\\*/`)); return m ? JSON.parse(m[1]) : null; };
const lines = block('LINES');
if (!lines) throw new Error('LINES block missing');
const seo = block('SEO');
const re = /\{id:\s*['"](s\d+)['"]\s*,\s*type:\s*['"](\w+)['"]/g;
const hits = [...src.matchAll(re)].map((m) => ({id: m[1], type: m[2], at: m.index}));
const allIds = [...src.matchAll(/\{id:\s*['"](s\d+)['"]/g)].map((x) => x[1]);
if (!allIds.length) throw new Error('no scenes found');
if (new Set(allIds).size !== allIds.length) throw new Error('duplicate scene ids');
const missing = allIds.filter((i) => !(i in lines)), extra = Object.keys(lines).filter((i) => !allIds.includes(i));
if (missing.length || extra.length) throw new Error(`id mismatch. missing line: ${missing}; extra line: ${extra}`);
const typeOf = Object.fromEntries(hits.map((h) => [h.id, h.type]));
const chapters = hits.filter((h) => h.type === 'chapter').map((h, i, arr) => {
  const seg = src.slice(h.at, (arr[i + 1] || {at: h.at + 3000}).at);
  const t = seg.match(/title:\s*(?:'([^']+)'|"([^"]+)")/);
  return {id: h.id, title: t ? t[1] || t[2] : `Chapter ${i + 1}`};
});
let lexicon = {};
try { lexicon = JSON.parse(fs.readFileSync('src/tts/lexicon.json', 'utf8')); } catch (e) {}
const {errors, warnings} = qa(lines, lexicon);
// audio: a MUSIC track with no file fails NOW (not after a 30 minute render); an unknown effect key only warns and is skipped at render
const have = (d) => new Set(fs.existsSync(d) ? fs.readdirSync(d).map((f) => f.replace(/\.[^.]+$/, '')) : []);
const music = block('MUSIC') || [], haveMusic = have('music-real'), haveSfx = have('sfx-real');
for (const c of music) {
  if (!allIds.includes(c.from)) errors.push(`MUSIC: scene ${c.from} does not exist`);
  if (c.key && !haveMusic.has(c.key)) errors.push(`MUSIC: no file music-real/${c.key}.* (add the key to music-name.json and run fetch-music)`);
}
const sfxKeys = new Set([...src.matchAll(/sfx:\s*\[((?:\s*\[[^\]]*\]\s*,?)+)\s*\]/g)].flatMap((m) => [...m[1].matchAll(/['"]([a-z_0-9]+)['"]/g)].map((x) => x[1])));
// photos: every photos/<id>.jpg used in the script must be declared in PHOTOS (fetched in CI with licence checks); photos.json feeds src/ci/photos.py
const photos = block('PHOTOS') || [];
fs.writeFileSync('photos.json', JSON.stringify(photos));
const declared = new Set(photos.map((x) => x.id)), used = new Set([...src.matchAll(/['"]photos\/([a-z0-9_]+)\.jpg['"]/g)].map((m) => m[1]));
for (const x of photos) if (!/^[a-z0-9_]+$/.test(x.id || '') || !(x.file || x.q)) errors.push(`PHOTOS: entry ${JSON.stringify(x).slice(0, 80)} needs an id (a-z 0-9 _) and a "file" or "q"`);
for (const u of used) if (!declared.has(u)) errors.push(`photos/${u}.jpg is used but not declared in PHOTOS`);
for (const d of declared) if (!used.has(d)) warnings.push(`PHOTOS: "${d}" is declared but never used`);
// characters: an unknown look would silently draw a generic blue figure; fail instead. Allowed values are read from world.tsx so they cannot drift.
const world = fs.existsSync('src/remotion/world.tsx') ? fs.readFileSync('src/remotion/world.tsx', 'utf8') : '';
const union = (re) => ((world.match(re) || [, ''])[1].match(/'(\w+)'/g) || []).map((s) => s.slice(1, -1));
const ENUM = {hat: union(/export type Look = \{hat: ([^;]+);/), outfit: union(/export type Outfit = ([^;]+);/), hair: union(/export type Hair = ([^;]+);/), facial: union(/facial\?: ([^;]+);/)};
const builtin = [...(world.match(/^  (\w+): \{hat:/gm) || [])].map((s) => s.trim().split(':')[0]);
const libFile = fs.existsSync('library/looks.json') ? JSON.parse(fs.readFileSync('library/looks.json', 'utf8')) : {};
const bible = block('BIBLE') || {};
const knownLooks = new Set([...builtin, ...Object.keys(libFile), ...Object.keys(bible.looks || {})]);
const HEX = /^#[0-9a-fA-F]{6}$/, COLORS = ['shirt', 'pants', 'skin', 'hc', 'fc', 'trim', 'sleeve', 'shoes', 'cape', 'toga', 'ec'];
const OLD = {ancient: ['tricorn', 'top', 'bowler', 'cap', 'morion', 'greathelm', 'turban'], 'early-medieval': ['tricorn', 'top', 'bowler', 'cap', 'laurel', 'morion'], medieval: ['tricorn', 'top', 'bowler', 'cap', 'laurel', 'crest', 'morion']};
const checkLook = (name, l, where) => {
  for (const k of ['hat', 'outfit', 'hair', 'facial']) if (l[k] !== undefined && ENUM[k].length && !ENUM[k].includes(l[k])) errors.push(`${where} look "${name}": ${k} "${l[k]}" is not one of ${ENUM[k].join(', ')}`);
  for (const k of COLORS) if (l[k] !== undefined && !HEX.test(l[k])) errors.push(`${where} look "${name}": ${k} "${l[k]}" must be a #rrggbb colour`);
  if (!l.hat || !l.shirt || !l.pants || !l.skin) errors.push(`${where} look "${name}" needs hat, shirt, pants, skin`);
  if (l.era && (OLD[l.era] || []).includes(l.hat)) warnings.push(`${where} look "${name}": hat "${l.hat}" looks out of place in era "${l.era}"`);
  if (l.era && ['ancient', 'early-medieval', 'medieval'].includes(l.era) && (l.outfit === 'coat' || l.glasses)) warnings.push(`${where} look "${name}": ${l.glasses ? 'glasses' : 'a coat uniform'} looks out of place in era "${l.era}"`);
};
Object.entries(libFile).forEach(([k, l]) => checkLook(k, l, 'library'));
Object.entries(bible.looks || {}).forEach(([k, l]) => checkLook(k, l, 'BIBLE'));
for (const m of new Set([...src.matchAll(/\b(?:look|rider):\s*['"]([\w]+)['"]/g)].map((x) => x[1]))) if (!knownLooks.has(m)) errors.push(`look "${m}" does not exist (built in, library/looks.json, or BIBLE.looks). It would be drawn as a generic blue figure.`);
const facs = new Set(Object.keys(bible.factions || {}));
for (const m of new Set([...src.matchAll(/\bfac:\s*['"]([^'"]+)['"]/g)].map((x) => x[1]))) if (!facs.has(m)) errors.push(`faction "${m}" is not declared in BIBLE.factions`);
// map library: {place:'X'} and {ref:'X'} must exist in library/geo.json (a typo would silently draw nothing)
const geoLib = fs.existsSync('library/geo.json') ? JSON.parse(fs.readFileSync('library/geo.json', 'utf8')) : {};
for (const m of new Set([...src.matchAll(/\bplace:\s*['"]([^'"]+)['"]/g)].map((x) => x[1]))) if (!(geoLib.places || {})[m]) errors.push(`map place "${m}" is not in library/geo.json (use lon/lat, or add it)`);
for (const m of new Set([...src.matchAll(/\bref:\s*['"]([^'"]+)['"]/g)].map((x) => x[1]))) if (!(geoLib.regions || {})[m] && !(geoLib.lines || {})[m]) errors.push(`map ref "${m}" is not a region or line in library/geo.json`);
// render-cost guardrails (measured: a normal stage ~65 ms/frame, 170 soldiers ~100 ms, 600 soldiers ~190 ms)
const starts = [...src.matchAll(/\{id:\s*['"](s\d+)['"]/g)].map((m) => ({id: m[1], at: m.index}));
starts.forEach((s, i) => {
  const chunk = src.slice(s.at, i + 1 < starts.length ? starts[i + 1].at : src.length);
  const army = [...chunk.matchAll(/k:\s*['"]troop['"][^}]*?\bn:\s*(\d+)/g)].reduce((a, m) => a + Number(m[1]), 0);
  if (army > 600) errors.push(`${s.id}: ${army} soldiers in one scene (max 600; use fewer or split the scene into shots)`);
  if (/look:\s*['"]frank['"]/.test(chunk) && !/ghost:/.test(chunk)) warnings.push(`${s.id}: Fact Check Frank without ghost: 0.6 (he should be translucent)`);
});
const unknownSfx = [...sfxKeys].filter((k) => !haveSfx.has(k));
if (unknownSfx.length) warnings.push(`sfx keys with no recording (skipped): ${unknownSfx.join(', ')}`);
warnings.slice(0, 40).forEach((w) => console.log(`::warning::${w}`));
if (errors.length) { errors.forEach((e) => console.log(`::error::${e}`)); throw new Error(`${errors.length} script error(s)`); }
if (!seo) console.log('::warning::No SEO block in the script; YouTube metadata will use the title only');
const slug = (src.match(/slug:\s*'([^']+)'/) || [])[1] || 'video';
const title = (src.match(/title:\s*'([^']+)'/) || [])[1] || slug;
const fps = Number((src.match(/fps:\s*(\d+)/) || [])[1] || 30);
fs.writeFileSync('narration.json', JSON.stringify(allIds.map((id) => ({id, text: lines[id], type: typeOf[id] || 'scene'}))));
fs.writeFileSync('chapters.json', JSON.stringify(chapters));
fs.writeFileSync('seo.json', JSON.stringify(seo || {title, description: title + '\n\n{{CHAPTERS}}', tags: [], categoryId: '27'}));
fs.writeFileSync('meta.json', JSON.stringify({slug, fps, scenes: allIds.length}));
console.log(`ok: ${allIds.length} scenes, ${chapters.length} chapters, ${Object.values(lines).join(' ').split(/\s+/).length} words, ${fps} fps, ${warnings.length} warnings, ${music.length} music cues`);
