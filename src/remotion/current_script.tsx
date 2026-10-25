// title_script.tsx — ONE file per video. Dashboard commits it as src/remotion/current_script.tsx.
// Data only: narration (LINES) + visuals (SCENES). All rendering lives in ./kit.tsx.
// DEMO TOPIC: "Black Holes". Replace everything below the THEME block.
import {makeVideo, Scene, Theme} from './kit';
import timings from '../../public/timings.json'; // written by CI after TTS+Whisper; stub `{}` until then

export const META = {title: 'What Happens Inside a Black Hole', slug: 'black-holes-demo'};

export const THEME: Theme = {
  fps: 30, // 60 doubles render cost. Flip only if the benchmark allows.
  hue: 225,
  bg: '#070b18',
  fg: '#f4f6ff',
  accent: '#ffcf4a',
  accent2: '#47d4ff',
  captions: true,
  // music: 'bgm.mp3', // file must exist in public/
};

// NARRATION: strict JSON between the two LINES comment markers (CI extracts it with a regex -> TTS). One entry per scene id.
export const LINES: Record<string, string> = /*LINES*/ {
  "s001": "Imagine a place where the rules of space and time simply stop working.",
  "s002": "Chapter one. How you build a monster out of a dying star.",
  "s003": "When a massive star runs out of fuel, nothing is left to hold its own weight up.",
  "s004": "Gravity wins, and the core collapses into a point so dense that light cannot escape.",
  "s005": "The giant at the center of galaxy M87 weighs about six and a half billion Suns.",
  "s006": "Our own Milky Way hosts a far smaller one, roughly four million Suns, about twenty six thousand light years away.",
  "s007": "The idea took a century to go from equations to evidence.",
  "s008": "Physicist Karl Schwarzschild found the first exact solution within months of Einstein's theory.",
  "s009": "Which raises the question everyone asks. What would you actually see if you fell in?",
  "s010": "Three things stand out. Time slows. Space stretches. And there is no turning back.",
  "s011": "Stay with me, because the strangest part is still ahead.",
  "s012": "Next, we cross the event horizon."
}/*LINES*/;

export const SCENES: Scene[] = [
  {id: 's001', type: 'kinetic', text: 'Where the rules of space and time stop', hi: ['stop']},
  {id: 's002', type: 'chapter', n: 1, title: 'Birth of a monster', tr: 'wipe'},
  {id: 's003', type: 'kinetic', text: 'No fuel. No support. Total collapse.', hi: ['collapse'], tr: 'slide'},
  {id: 's004', type: 'stat', value: 100, suffix: '%', label: 'of light trapped', hue: 30},
  {id: 's005', type: 'stat', value: 6.5, suffix: ' billion', decimals: 1, label: 'Suns · M87*', hue: 200},
  {id: 's006', type: 'compare', unit: 'M☉', a: {label: 'Milky Way core (millions)', value: 4}, b: {label: 'M87* (millions)', value: 6500}, tr: 'flip'},
  {id: 's007', type: 'timeline', items: [{year: '1915', label: 'General relativity'}, {year: '1916', label: 'Schwarzschild solution'}, {year: '2019', label: 'First image: M87*'}, {year: '2022', label: 'Our own: Sgr A*'}], tr: 'wipe'},
  {id: 's008', type: 'quote', text: 'Every number on screen needs a source in the research log.', by: 'Vidfactory rule'},
  {id: 's009', type: 'kinetic', text: 'What would you actually see?', hi: ['see'], hue: 300},
  {id: 's010', type: 'list', items: ['Time slows', 'Space stretches', 'No way back']},
  {id: 's011', type: 'bars', title: 'Stay for the strangest part', data: [{label: 'Horizon', value: 40}, {label: 'Spaghettification', value: 85}, {label: 'Singularity', value: 100}]},
  {id: 's012', type: 'chapter', n: 2, title: 'The event horizon', tr: 'slide'},
];

const {Video, total, fps} = makeVideo(SCENES, LINES, THEME, timings as any);
export {Video, total, fps};
