// shorts_extract.mjs — workflow helper for the shorts lane (NOT imported by any
// render code). Extracts the strict-JSON LINES and CUES blocks from a shorts
// script and computes the timing table the mux step needs.
//
// Usage: node src/shorts/shorts_extract.mjs <script.tsx> <outdir>
//
// TIMING: the pilot ships PRE-GENERATED narration, so when
// <script dir>/audio/narration/durations.json exists (ffprobe-measured voice
// seconds per scene — the same data as shorts_timing_data.ts), scene durations
// come from the REAL voice: dur = measured + SCENE_PAD_S, quantised to whole
// frames at FPS exactly as the engine quantises them, so mux placement matches
// the rendered picture frame-for-frame. The word-count model below remains
// ONLY as a fallback for scenes with no measured entry.
// TIMING CONSTANTS duplicate shorts_captions.tsx on purpose (this file is plain
// node and cannot import TSX). Change them together: PACE_WPM 175 is the
// measured effective pace of the house TTS (Korea 7,220 words -> 41:19;
// Iran 6,838 words -> 38:18).

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';

const PACE_WPM = 175;
const SCENE_PAD_S = 0.4;
const MIN_SCENE_S = 1.1;
const FPS = 30;

const [scriptPath, outdir] = process.argv.slice(2);
if (!scriptPath || !outdir) {
  console.error('usage: node shorts_extract.mjs <script.tsx> <outdir>');
  process.exit(1);
}
const src = readFileSync(scriptPath, 'utf8');

const extract = (marker) => {
  const re = new RegExp(`/\\*${marker}\\*/([\\s\\S]*?)/\\*${marker}\\*/`);
  const m = src.match(re);
  if (!m) throw new Error(`marker block ${marker} not found in ${scriptPath}`);
  return JSON.parse(m[1]);
};

const lines = extract('LINES');
const cues = extract('CUES');

const wordsOf = (t) => t.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);

// Measured voice durations shipped with the pilot (may be absent in general).
const durationsPath = join(dirname(scriptPath), 'audio', 'narration', 'durations.json');
const measured = existsSync(durationsPath) ? JSON.parse(readFileSync(durationsPath, 'utf8')) : {};
const hasMeasured = Object.keys(measured).length > 0;
if (hasMeasured) {
  console.log(`shorts_extract: using MEASURED voice durations from ${durationsPath}`);
} else {
  console.log('shorts_extract: no durations.json — falling back to the word-count model');
}

const scenes = {};
let cursor = 0;
let totalWords = 0;
for (const [id, text] of Object.entries(lines)) {
  const words = wordsOf(text).length;
  totalWords += words;
  const voice = measured[id];
  const rawDur =
    voice !== undefined
      ? Math.max(MIN_SCENE_S, voice + SCENE_PAD_S)
      : Math.max(MIN_SCENE_S, (words / PACE_WPM) * 60 + SCENE_PAD_S);
  // Quantise to whole frames exactly like the engine (Math.round in
  // shorts_kit computeSceneRanges) so scene starts line up with the render.
  const dur = Math.round(rawDur * FPS) / FPS;
  scenes[id] = {
    start: Number(cursor.toFixed(3)),
    dur: Number(dur.toFixed(3)),
    words,
    ...(voice !== undefined ? {voiceSeconds: voice, timingSource: 'measured'} : {timingSource: 'word-count'}),
  };
  cursor += dur;
}
const timing = {
  paceWpm: hasMeasured ? null : PACE_WPM,
  timingSource: hasMeasured ? 'measured' : 'word-count',
  fps: FPS,
  totalSeconds: Number(cursor.toFixed(2)),
  totalWords,
  scenes,
};

mkdirSync(outdir, {recursive: true});
writeFileSync(join(outdir, 'shorts-lines.json'), JSON.stringify(lines, null, 2));
writeFileSync(join(outdir, 'shorts-cues.json'), JSON.stringify(cues, null, 2));
writeFileSync(join(outdir, 'shorts-timing.json'), JSON.stringify(timing, null, 2));
console.log(
  `shorts_extract: ${Object.keys(lines).length} lines, ${totalWords} words, total ${timing.totalSeconds}s (timing: ${timing.timingSource})`,
);
