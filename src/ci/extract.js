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
console.log(`ok: ${allIds.length} scenes, ${chapters.length} chapters, ${Object.values(lines).join(' ').split(/\s+/).length} words, ${fps} fps, ${warnings.length} warnings`);
