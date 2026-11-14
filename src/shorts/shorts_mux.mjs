// shorts_mux.mjs — workflow helper for the shorts lane (NOT imported by render
// code). Mixes whatever audio EXISTS onto the silent rendered video:
//   narration, SFX cues and a music bed.
// Narration comes in two shapes: --narrationdir DIR with one file per scene
// (DIR/<scene>.mp3 — the pilot's pre-generated voice, each line placed at its
// measured scene start from the timing table), or a single --narration FILE
// starting at 0. A file whose cue is missing is skipped with a warning —
// never fatal (house rule: missing audio prunes to silence). If no audio
// exists at all, the video is copied through unchanged and a warning printed.
//
// Usage (pilot):
//   node src/shorts/shorts_mux.mjs --video out/short-video.mp4 \
//     --timing out/shorts-timing.json --cues out/shorts-cues.json \
//     --narrationdir src/shorts/audio/narration \
//     --sfxdir src/shorts/audio/sfx --musicdir src/shorts/audio/music \
//     --out out/alaska.mp4

import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {readFileSync} from 'node:fs';

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, '')] = argv[i + 1];

const video = args.video;
const out = args.out;
const timing = JSON.parse(readFileSync(args.timing, 'utf8'));
const cues = JSON.parse(readFileSync(args.cues, 'utf8'));
const sfxDir = args.sfxdir ?? 'sfx-real';
const musicDir = args.musicdir ?? 'music-real';
const total = timing.totalSeconds;

const inputs = ['-i', video];
const filters = [];
const mixLabels = [];
let inputIdx = 1; // 0 = video

const addInput = (file, extra = []) => {
  inputs.push(...extra, '-i', file);
  return inputIdx++;
};

if (args.narrationdir) {
  // Per-line narration: place each scene's file at its measured scene start.
  const sceneIds = Object.keys(timing.scenes).sort(
    (a, b) => timing.scenes[a].start - timing.scenes[b].start,
  );
  let placed = 0;
  sceneIds.forEach((id, n) => {
    const f = ['mp3', 'wav', 'm4a']
      .map((ext) => join(args.narrationdir, `${id}.${ext}`))
      .find((p) => existsSync(p));
    if (!f) {
      console.log(`::warning::shorts_mux: narration line missing, pruned to silence: ${id}`);
      return;
    }
    const atMs = Math.round(timing.scenes[id].start * 1000);
    const idx = addInput(f);
    filters.push(`[${idx}:a]adelay=${atMs}|${atMs},volume=1.0[narr${n}]`);
    mixLabels.push(`[narr${n}]`);
    placed++;
  });
  if (!placed) {
    console.log('::warning::shorts_mux: narration dir given but no line files found — continuing without voice');
  }
} else if (args.narration && existsSync(args.narration)) {
  const idx = addInput(args.narration);
  filters.push(`[${idx}:a]volume=1.0[narr]`);
  mixLabels.push('[narr]');
} else {
  console.log('::warning::shorts_mux: no narration file — continuing without voice');
}

// Music: first non-null entry wins; loops under the whole short, low volume.
const musicEntry = (cues.music ?? []).find((m) => m.key);
if (musicEntry) {
  const f = join(musicDir, `${musicEntry.key}.mp3`);
  if (existsSync(f)) {
    const idx = addInput(f, ['-stream_loop', '-1']);
    filters.push(`[${idx}:a]atrim=0:${total},volume=0.16[mus]`);
    mixLabels.push('[mus]');
  } else {
    console.log(`::warning::shorts_mux: music file missing, pruned to silence: ${f}`);
  }
}

(cues.sfx ?? []).forEach((cue, n) => {
  const t = timing.scenes[cue.scene];
  if (!t) {
    console.log(`::warning::shorts_mux: sfx cue for unknown scene ${cue.scene} skipped`);
    return;
  }
  const f = join(sfxDir, `${cue.key}.mp3`);
  if (!existsSync(f)) {
    console.log(`::warning::shorts_mux: sfx file missing, pruned to silence: ${f}`);
    return;
  }
  const atMs = Math.round((t.start + cue.at * t.dur) * 1000);
  const idx = addInput(f);
  filters.push(`[${idx}:a]adelay=${atMs}|${atMs},volume=0.9[sfx${n}]`);
  mixLabels.push(`[sfx${n}]`);
});

if (!mixLabels.length) {
  console.log('::warning::shorts_mux: no audio inputs at all — copying silent video through');
  const r = spawnSync('ffmpeg', ['-y', '-i', video, '-c', 'copy', out], {stdio: 'inherit'});
  process.exit(r.status ?? 1);
}

// normalize=0 keeps each layer at its authored level; the limiter after the
// mix catches stacked peaks (voice + SFX + music) before they can clip.
filters.push(`${mixLabels.join('')}amix=inputs=${mixLabels.length}:duration=longest:normalize=0[pre]`);
filters.push(`[pre]alimiter=limit=0.85:level=false[mix]`);
const ffArgs = [
  '-y',
  ...inputs,
  '-filter_complex',
  filters.join(';'),
  '-map',
  '0:v',
  '-map',
  '[mix]',
  '-c:v',
  'copy',
  '-c:a',
  'aac',
  '-b:a',
  '160k',
  '-t',
  String(total),
  out,
];
const r = spawnSync('ffmpeg', ffArgs, {stdio: 'inherit'});
if (r.status !== 0) {
  console.error('shorts_mux: ffmpeg failed');
  process.exit(r.status ?? 1);
}
console.log(`shorts_mux: wrote ${out} (${mixLabels.length} audio layers, ${total}s)`);
