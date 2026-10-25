// Validates the decrypted script and extracts narration in SCENES order -> narration.json, meta.json
const fs = require('fs');
const src = fs.readFileSync('src/remotion/current_script.tsx', 'utf8');
const m = src.match(/\/\*LINES\*\/([\s\S]*?)\/\*LINES\*\//);
if (!m) throw new Error('LINES block missing');
const lines = JSON.parse(m[1]);
const ids = [...src.matchAll(/\{id:\s*['"](s\d+)['"]/g)].map((x) => x[1]);
if (!ids.length) throw new Error('no scenes found');
if (new Set(ids).size !== ids.length) throw new Error('duplicate scene ids');
const missing = ids.filter((i) => !(i in lines));
const extra = Object.keys(lines).filter((i) => !ids.includes(i));
if (missing.length || extra.length) throw new Error(`id mismatch. missing line: ${missing}; extra line: ${extra}`);
const slug = (src.match(/slug:\s*'([^']+)'/) || [])[1] || 'video';
const fps = Number((src.match(/fps:\s*(\d+)/) || [])[1] || 30);
fs.writeFileSync('narration.json', JSON.stringify(ids.map((id) => ({id, text: lines[id]}))));
fs.writeFileSync('meta.json', JSON.stringify({slug, fps, scenes: ids.length}));
console.log(`ok: ${ids.length} scenes, ${Object.values(lines).join(' ').split(/\s+/).length} words, ${fps} fps, slug ${slug}`);
