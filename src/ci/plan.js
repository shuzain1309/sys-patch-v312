// Computes total frames exactly like kit.tsx (cumulative seconds -> round) and splits into render chunks.
const fs = require('fs');
const {fps} = JSON.parse(fs.readFileSync('meta.json', 'utf8'));
const timings = JSON.parse(fs.readFileSync('public/timings.json', 'utf8'));
const ids = JSON.parse(fs.readFileSync('narration.json', 'utf8')).map((x) => x.id);
let cum = 0;
for (const id of ids) {
  if (!timings[id]) throw new Error('no timing for ' + id);
  cum += timings[id].seconds;
}
const total = Math.round(cum * fps);
const size = Number(process.env.CHUNK_FRAMES || 7200);
const include = [];
for (let a = 0, i = 0; a < total; a += size, i++) include.push({i, a, b: Math.min(a + size, total) - 1});
if (include.length > 250) throw new Error('too many chunks, raise CHUNK_FRAMES');
fs.writeFileSync('plan.json', JSON.stringify({fps, total, include}));
const out = `matrix=${JSON.stringify({include})}\ncount=${include.length}\ntotal=${total}\n`;
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, out); else console.log(out);
console.log(`total ${total} frames (${(total / fps / 60).toFixed(1)} min), ${include.length} chunks`);
