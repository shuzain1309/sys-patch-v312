#!/usr/bin/env node
// node src/ci/thumb.js <job.json> <outDir>
// job = {variants:[{id:'A', layout, word, chip, chip2, map, region, map2, region2, arrow, face:{look,expr,upload,upload2,photo,photo2},
//                   portrait64?, portrait264?}]}   (portrait64 = base64 image sent from the dashboard)
// Face order per side: uploaded portrait, fetched photo (public/photos/<id>.jpg), else the stickman. A missing photo never fails a variant.
// Map: frame.mjs picks the view, terrain.py builds the realistic relief (NASA Blue Marble, else elevation tiles, else a flat map; never fails).
// Per variant: still (frame 45 of 60) at 1920x1080 -> 1280x720 JPEG under 1.9 MB, plus a 160 px squint preview. A variant that fails is reported in meta.json, the rest continue.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url'), {execFileSync, spawnSync} = require('child_process');
const {validateBlock} = require('./thumbcheck');
const [jobFile, outDir = 'out/thumbs'] = process.argv.slice(2);
const job = JSON.parse(fs.readFileSync(jobFile, 'utf8'));
fs.mkdirSync(outDir, {recursive: true}); fs.mkdirSync('public/thumb', {recursive: true}); fs.mkdirSync('thumb-work', {recursive: true});
const geoLib = JSON.parse(fs.readFileSync('library/geo.json', 'utf8'));
const lists = {countries: JSON.parse(fs.readFileSync('library/countries.json', 'utf8')), regions: Object.keys(geoLib.regions || {})};
const sh = (cmd, args, o = {}) => execFileSync(cmd, args, {stdio: ['ignore', 'pipe', 'pipe'], timeout: 240000, ...o});
const arr = (m) => (Array.isArray(m) ? m : m ? [m] : []);

// one face slot -> {file: 'thumb/<id><n>.<ext>', cut, source} or null
function face(v, slot) {
  const n = slot === 2 ? '2' : '', f = v.face || {}, base = `thumb-work/${v.id}${n}`;
  let raw = null, source = null;
  const b64 = v[`portrait${slot === 2 ? '2' : ''}64`];
  if (b64) { raw = `${base}.src`; fs.writeFileSync(raw, Buffer.from(b64, 'base64')); source = 'dashboard upload'; }
  const up = f[`upload${n}`];
  if (!raw && up && fs.existsSync(`thumb/uploads/${up}.enc`) && process.env.SCRIPT_KEY) {
    raw = `${base}.src`;
    try { sh('openssl', ['enc', '-d', '-aes-256-cbc', '-pbkdf2', '-iter', '10000', '-md', 'sha256', '-in', `thumb/uploads/${up}.enc`, '-out', raw, '-pass', 'env:SCRIPT_KEY']); source = 'uploaded portrait'; } catch (e) { raw = null; console.log(`::warning::thumb ${v.id}: could not decrypt upload "${up}"`); }
  }
  const ph = f[`photo${n}`];
  if (!raw && ph && fs.existsSync(`public/photos/${ph}.jpg`)) { raw = `public/photos/${ph}.jpg`; source = 'fetched photo'; }
  if (!raw) { if (up || ph) console.log(`::warning::thumb ${v.id}: no usable portrait (${up || ph}); using the stickman`); return null; }
  const png = `${base}.png`; // normalise: whatever came in becomes a png no larger than 1400 px
  try { sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-vf', "scale='min(1400,iw)':-2", '-frames:v', '1', png]); } catch (e) { console.log(`::warning::thumb ${v.id}: unreadable image`); return null; }
  const cutPng = `public/thumb/${v.id}${n}.png`;
  const r = spawnSync('python3', ['-I', path.join(__dirname, 'cutout.py'), png, cutPng], {encoding: 'utf8', timeout: 300000});
  if (r.status === 0 && fs.existsSync(cutPng)) return {file: `thumb/${v.id}${n}.png`, cut: true, source};
  fs.copyFileSync(png, `public/thumb/${v.id}${n}.png`);
  return {file: `thumb/${v.id}${n}.png`, cut: false, source};
}

(async () => {
  const {viewFor} = await import(pathToFileURL(path.join(__dirname, 'frame.mjs')).href);
  const meta = {variants: []};
  const check = validateBlock({...job.variants[0], variants: job.variants.slice(1)}, lists);
  for (const v of job.variants) {
    const m = {id: v.id, ok: false};
    meta.variants.push(m);
    try {
      const bad = check.errors.filter((e) => e.startsWith(`THUMB ${v.id}`));
      if (bad.length) throw new Error(bad.join('; '));
      const a = face(v, 1), b = v.layout === 'P2' ? face(v, 2) : null;
      // ---- map: view (where the subject sits) + terrain pictures; the view is shared by terrain.py and the Remotion overlay
      const pts = (r) => (r && geoLib.regions && geoLib.regions[r] ? geoLib.regions[r].pts : []);
      const p2 = v.layout === 'P2', box = p2 ? {x: 0, y: 0, w: 960, h: 1080} : {x: 0, y: 0, w: 1920, h: 1080};
      const view = viewFor({names: arr(v.map), pts: pts(v.region)}, box);
      const view2 = p2 ? viewFor({names: arr(v.map2 || v.map), pts: pts(v.region2 || v.region)}, box) : null;
      const frames = [{id: v.id, w: box.w, h: box.h, ...view}, ...(p2 ? [{id: v.id + 'b', w: box.w, h: box.h, ...view2}] : [])];
      const tp = `thumb-work/terrain-${v.id}.json`; fs.writeFileSync(tp, JSON.stringify({out: 'public/thumb', frames}));
      let tstat = {};
      try { tstat = JSON.parse(String(spawnSync('python3', ['-I', path.join(__dirname, 'terrain.py'), tp], {encoding: 'utf8', timeout: 400000}).stdout).trim().split('\n').pop() || '{}'); } catch (e) { /* flat map */ }
      const tex = (id) => (tstat[id] && tstat[id] !== 'none' ? {terrain: `thumb/terrain-${id}.png`, relief: `thumb/relief-${id}.png`} : {});
      const props = {layout: v.layout, word: v.word, chip: v.chip, chip2: v.chip2, map: v.map, region: v.region, map2: v.map2, region2: v.region2, arrow: v.arrow, face: {look: v.face?.look, expr: v.face?.expr},
        view, view2, ...tex(v.id), ...(p2 ? {terrain2: tex(v.id + 'b').terrain, relief2: tex(v.id + 'b').relief} : {}),
        portrait: a?.file, cut: a?.cut, portrait2: b?.file, cut2: b?.cut};
      m.face = a ? a.source + (a.cut ? ', background removed' : ', no cut-out') : 'stickman';
      m.map = tstat[v.id] === 'nasa' ? 'NASA Blue Marble relief' : tstat[v.id] === 'terrain' ? 'elevation tiles (fallback)' : 'flat map (no terrain tiles reachable)';
      const pf = `thumb-work/props-${v.id}.json`; fs.writeFileSync(pf, JSON.stringify(props));
      const raw = `thumb-work/raw-${v.id}.png`;
      const args = ['remotion', 'still', 'src/remotion/thumb_index.ts', 'Thumb', raw, `--props=${pf}`, '--frame=45', '--image-format=png', '--log=error', '--timeout=90000'];
      if (process.env.REMOTION_BROWSER) args.push(`--browser-executable=${process.env.REMOTION_BROWSER}`);
      sh('npx', args);
      const jpg = path.join(outDir, `thumb-${v.id}.jpg`);
      for (let q = 2; q <= 24; q += 2) { // smallest q number = best quality; stop at the first file under the YouTube limit
        sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-vf', 'scale=1280:720:flags=lanczos', '-q:v', String(q), jpg]);
        if (fs.statSync(jpg).size < 1900000) break;
      }
      if (fs.statSync(jpg).size >= 2097152) throw new Error('could not get under 2 MB');
      sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', jpg, '-vf', 'scale=160:90:flags=area', path.join(outDir, `thumb-${v.id}-160.png`)]); // squint test preview
      m.ok = true; m.bytes = fs.statSync(jpg).size;
      console.log(`thumb ${v.id}: ${(m.bytes / 1024) | 0} KB, face: ${m.face}, map: ${m.map}`);
    } catch (e) {
      m.error = String(e.stderr || e.message).slice(-400); console.log(`::warning::thumb ${v.id} failed: ${m.error}`);
    }
  }
  meta.warnings = check.warnings; meta.id = job.id;
  fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta));
  process.exit(meta.variants.some((x) => x.ok) ? 0 : 1);
})();
