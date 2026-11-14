// alaska_short.tsx — ONE shorts script: "Alaska: the 2-cent state".
// Data only (narration + scene list + cue sheet), rendered by shorts_kit.tsx.
// STANDALONE shorts-lane file: it imports only sibling shorts_* modules.
// Facts verified 2026-11-14 (see alaska-script.md in the bundle for sources):
// treaty signed 30 Mar 1867 after an all-night negotiation; $7.2M; 586,412 sq mi
// (just under 2 cents an acre); Seward / Alexander II / Edouard de Stoeckl;
// Crimean War + British Canada threat; fur trade collapse; gold rushes of the
// 1890s; Prudhoe Bay oil 1968. Mockery was real but NOT universal — the hook
// says "half the country laughed" on purpose.

import type {ShortCues, ShortLook, ShortScene, ShortScriptData} from './shorts_types';
import {makeShort} from './shorts_kit';

export const META = {title: 'Alaska: The 2-Cent State', slug: 'alaska-two-cent-state'};

// NARRATION: strict JSON between the two markers (the render-short workflow
// extracts it with a regex -> TTS). One entry per scene id. Numbers are written
// as words so the voice reads them naturally.
export const LINES: Record<string, string> = /*LINES*/ {
  "s001": "America bought its biggest state for two cents an acre, and half the country laughed.",
  "s002": "Rewind: eighteen sixty-seven, and Russia needs Alaska gone.",
  "s003": "Russia had just lost the Crimean War, and Alaska was a colony thousands of miles from home.",
  "s004": "The fur trade that paid for Alaska was dying, and supply ships cost a fortune.",
  "s005": "Worse, Britain, Russia's great rival, ruled Canada next door. One more war, and Britain could take Alaska for free.",
  "s006": "So the Tsar's minister in Washington, Edouard de Stoeckl, got his orders: sell Alaska to America.",
  "s007": "He and Secretary of State William Seward haggled through the night. By four in the morning, it was signed.",
  "s008": "Price: seven point two million dollars, two cents an acre.",
  "s009": "The critics howled: Seward's Folly. An icebox. A polar bear garden.",
  "s010": "Then came the gold rushes of the eighteen nineties.",
  "s011": "In nineteen sixty-eight, oil: Prudhoe Bay, North America's largest oil field.",
  "s012": "Two cents an acre. Some folly.",
  "s013": "The full stories are on the channel."
}/*LINES*/;

// AUDIO CUES: strict JSON between the two markers. Keys name files in this
// bundle's own audio tree (src/shorts/audio/sfx/<key>.mp3 and
// src/shorts/audio/music/<key>.mp3 — see audio/SOURCES.md). All pilot cues
// ship with real files; a cue whose file is missing is skipped with a
// warning — never fatal.
export const CUES: ShortCues = /*CUES*/ {
  "sfx": [
    {"scene": "s001", "at": 0.32, "key": "pop"},
    {"scene": "s002", "at": 0.0, "key": "rewind"},
    {"scene": "s004", "at": 0.2, "key": "ship_creak"},
    {"scene": "s005", "at": 0.05, "key": "whoosh"},
    {"scene": "s006", "at": 0.28, "key": "paper_rustle"},
    {"scene": "s007", "at": 0.45, "key": "cha_ching"},
    {"scene": "s008", "at": 0.42, "key": "stamp_thud"},
    {"scene": "s009", "at": 0.12, "key": "crowd_laugh"},
    {"scene": "s010", "at": 0.35, "key": "coin_drop"},
    {"scene": "s011", "at": 0.3, "key": "drum_sting"}
  ],
  "music": [
    {"from": "s001", "key": "shorts_playful_1"}
  ]
}/*CUES*/;

// Chibi looks (shorts BIBLE). Colours are this lane's own; nothing is shared
// with the longform BIBLE.
export const LOOKS: Record<string, ShortLook> = {
  tsar: {coat: '#5b3a6e', trim: '#e8bc4a', hat: 'crown'},
  stoeckl: {coat: '#37455c', trim: '#c8a24a', hat: 'tophat'},
  seward: {coat: '#2e4a3a', trim: '#c8a24a', hat: 'bowler', hair: '#d8d8d8'},
  senator: {coat: '#54443a', hat: 'bowler'},
  senator2: {coat: '#3a4a54', hat: 'tophat'},
};

export const SCENES: ShortScene[] = [
  // HOOK — payoff first: the whole USA, Alaska circled, price tag pops in.
  {
    id: 's001',
    kind: 'map',
    cam: {from: {x: 1750, y: 1000, z: 2750}, to: {x: 1750, y: 950, z: 2350}},
    ellipse: {cx: 1740, cy: 580, rx: 440, ry: 340, at: 0.12},
    props: [{k: 'pricetag', x: 838, y: 330, s: 1.15, at: 0.32, t: '2¢ AN ACRE'}],
  },
  // REWIND — big year card.
  {id: 's002', kind: 'card', cardText: '1867', cardSub: '« «  R E W I N D'},
  // BEAT 1a — beaten Russia, far colony. Tsar glares at the map's edge.
  {
    id: 's003',
    kind: 'map',
    year: '1867',
    cam: {from: {x: 680, y: 600, z: 1950}, to: {x: 1080, y: 630, z: 1800}},
    actors: [{look: 'tsar', x: 196, y: 1560, s: 0.82, face: 'stern'}],
  },
  // BEAT 1b — the fur trade dies; the supply ship sails away.
  {
    id: 's004',
    kind: 'map',
    year: '1867',
    cam: {from: {x: 1740, y: 600, z: 1300}, to: {x: 1700, y: 645, z: 1180}},
    props: [{k: 'ship', x: 262, y: 1180, s: 0.95, at: 0.2}],
    texts: [{t: 'THE FUR TRADE IS DYING', x: 540, y: 320, size: 52, at: 0.4, color: '#ffe9a8'}],
  },
  // BEAT 2 — British Canada next door; the threat arrow points at Alaska.
  {
    id: 's005',
    kind: 'map',
    year: '1867',
    cam: {from: {x: 2080, y: 820, z: 1750}, to: {x: 2010, y: 790, z: 1520}},
    arrow: {x1: 2330, y1: 980, x2: 2010, y2: 800, at: 0.45},
  },
  // BEAT 3a — the order: the Tsar points, his minister takes the scroll.
  {
    id: 's006',
    kind: 'stage',
    bg: 'night',
    year: '1867',
    actors: [
      {look: 'tsar', x: 300, y: 1470, s: 1.05, face: 'stern', pose: 'point'},
      {look: 'stoeckl', x: 762, y: 1470, s: 1.0, face: 'neutral', flip: true, at: 0.1},
    ],
    props: [{k: 'scroll', x: 540, y: 1170, s: 0.95, at: 0.28}],
  },
  // BEAT 3b — one night of haggling; the money case lands.
  {
    id: 's007',
    kind: 'stage',
    bg: 'night',
    year: '1867',
    actors: [
      {look: 'stoeckl', x: 312, y: 1470, s: 1.0, face: 'smug', pose: 'point'},
      {look: 'seward', x: 752, y: 1470, s: 1.0, face: 'smug', flip: true, at: 0.08},
    ],
    props: [{k: 'moneycase', x: 540, y: 1150, s: 1.05, at: 0.45, t: '$7.2M'}],
  },
  // THE SALE — the sign flips to SOLD and Alaska changes colour mid-scene.
  {
    id: 's008',
    kind: 'map',
    year: '1867',
    cam: {from: {x: 1740, y: 600, z: 1250}, to: {x: 1740, y: 600, z: 1080}},
    soldAt: 0.42,
    pins: [{x: 2045, y: 1120, t: 'Sitka', at: 0.18}],
    props: [
      {k: 'salesign', x: 800, y: 1230, s: 1.0, at: 0.05, t: '0.42'},
      {k: 'pricetag', x: 300, y: 385, s: 1.1, at: 0.58, t: '2¢ AN ACRE'},
    ],
  },
  // THE MOCKERY — laughing critics, Seward shrugs inside his "icebox".
  {
    id: 's009',
    kind: 'stage',
    bg: 'paper',
    year: '1867',
    actors: [
      {look: 'senator2', x: 322, y: 1365, s: 0.78, face: 'laugh', at: 0.16},
      {look: 'senator', x: 762, y: 1365, s: 0.78, face: 'laugh', flip: true, at: 0.24},
      {look: 'senator', x: 200, y: 1475, s: 0.98, face: 'laugh', at: 0.08},
      {look: 'seward', x: 540, y: 1505, s: 1.02, face: 'smug', pose: 'shrug'},
    ],
    props: [{k: 'iceblock', x: 892, y: 1470, s: 0.8, at: 0.5}],
    texts: [{t: "SEWARD'S FOLLY", x: 540, y: 300, size: 78, at: 0.22, color: '#7a2d20'}],
  },
  // PAYOFF 1 — gold.
  {
    id: 's010',
    kind: 'map',
    year: '1899',
    cam: {from: {x: 1740, y: 620, z: 1350}, to: {x: 1740, y: 600, z: 1180}},
    props: [{k: 'goldpile', x: 296, y: 1260, s: 1.05, at: 0.35}],
  },
  // PAYOFF 2 — oil.
  {
    id: 's011',
    kind: 'map',
    year: '1968',
    cam: {from: {x: 1800, y: 700, z: 1750}, to: {x: 1800, y: 700, z: 1750}},
    props: [{k: 'derrick', x: 806, y: 1340, s: 1.0, at: 0.3}],
  },
  // PAYOFF STAT — wide again, the cent coin front and centre.
  {
    id: 's012',
    kind: 'map',
    cam: {from: {x: 1900, y: 1050, z: 2650}, to: {x: 1850, y: 1000, z: 2400}},
    props: [{k: 'coin', x: 540, y: 470, s: 1.25, at: 0.2, t: '2¢'}],
  },
  // BRIDGE — end card.
  {
    id: 's013',
    kind: 'end',
    cardText: 'THE FULL STORY IS ON THE CHANNEL',
    cardSub: 'HISTORY, ONE MAP AT A TIME',
  },
];

export const SHORT_DATA: ShortScriptData = {
  meta: META,
  lines: LINES,
  scenes: SCENES,
  looks: LOOKS,
  cues: CUES,
};

const made = makeShort(SHORT_DATA);
export const AlaskaShortVideo = made.Component;
export const ALASKA_TOTAL_FRAMES = made.totalFrames;
export const ALASKA_FPS = made.fps;
