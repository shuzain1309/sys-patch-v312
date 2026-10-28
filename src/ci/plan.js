// Total frames exactly like kit.tsx (cumulative seconds -> round), then split into render chunks that fill every parallel runner.
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
const par = Number(process.env.MAX_PARALLEL || 20);      // free plan: 20 concurrent jobs
const minChunk = Number(process.env.MIN_CHUNK || 900);   // below this, job start-up (about 3 min) dominates
const maxChunk = Number(process.env.MAX_CHUNK || 14000); // keeps one chunk far from the 6 hour job limit
let n = Math.min(par, Math.max(1, Math.ceil(total / minChunk)));
if (Math.ceil(total / n) > maxChunk) n = Math.ceil(total / maxChunk);
const size = Math.ceil(total / n);
const include = [];
for (let i = 0, a = 0; a < total; i++, a += size) include.push({i, a, b: Math.min(a + size, total) - 1});
if (include.length > 250) throw new Error('too many chunks');
const est = Number(process.env.RENDER_FPS_EST || 3);
const wall = Math.ceil(include.length / par) * (size / est / 60 + 5);
fs.writeFileSync('plan.json', JSON.stringify({fps, total, include}));
const out = `matrix=${JSON.stringify({include})}\ncount=${include.length}\ntotal=${total}\n`;
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, out); else console.log(out);
console.log(`total ${total} frames (${(total / fps / 60).toFixed(1)} min video) -> ${include.length} chunks of about ${size} frames, ${par} in parallel`);
console.log(`estimated render time at ${est} fps per runner: about ${Math.round(wall)} min (not counting voice and upload)`);
