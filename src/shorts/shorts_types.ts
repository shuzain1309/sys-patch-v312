// shorts_types.ts — data model for the Zeus Shorts lane (vidfactory-shorts).
// STANDALONE: this file imports nothing from the longform kit (kit.tsx / world.tsx /
// geo.tsx / textfit.ts). Everything the shorts engine needs is defined here or in
// sibling shorts_* files. See MERGE-SAFETY.md in the bundle root.

export type ShortFace = 'neutral' | 'smug' | 'shock' | 'laugh' | 'stern' | 'sad';
export type ShortHat = 'none' | 'crown' | 'ushanka' | 'tophat' | 'bowler' | 'cap';
export type ShortPose = 'idle' | 'point' | 'shrug' | 'wave';

// A reusable chibi look (the shorts equivalent of a longform BIBLE entry).
export interface ShortLook {
  coat: string; // coat / robe colour
  trim?: string; // sash, fur trim, hat band
  skin?: string; // face colour (default '#f2c79b')
  hair?: string; // hair colour; drawn when the hat leaves hair visible
  hat: ShortHat;
}

export interface ShortActor {
  look: string; // key into the script's LOOKS record
  x: number; // stage coords, 1080 x 1920 canvas
  y: number; // baseline (feet)
  s?: number; // scale, 1 = ~340px tall
  face?: ShortFace;
  pose?: ShortPose;
  flip?: boolean;
  at?: number; // scene fraction when the actor pops in (default 0)
}

export type ShortPropKind =
  | 'pricetag' // hanging tag, text in t
  | 'moneycase' // briefcase with a $ band; t = amount label
  | 'salesign' // FOR SALE -> SOLD sign; state flips at scene fraction in t ('0.55')
  | 'ship' // simple sailing ship
  | 'goldpile' // gold nuggets with sparkles
  | 'derrick' // oil derrick + pumpjack silhouette
  | 'scroll' // treaty scroll / document
  | 'iceblock' // an ice cube (the "icebox" gag)
  | 'coin'; // one big cent coin, text in t

export interface ShortProp {
  k: ShortPropKind;
  x: number;
  y: number;
  s?: number;
  at?: number; // scene fraction when the prop pops in (default 0)
  t?: string; // text payload (pricetag / moneycase / coin) or flip fraction (salesign)
  flip?: boolean; // mirror horizontally
}

// Camera over the shorts map, in map units (map space is MAP_W x MAP_H, see shorts_map).
// z = how many map units fit across the 1080px-wide stage.
export interface ShortCam {
  x: number;
  y: number;
  z: number;
}

export interface ShortMapPin {
  x: number; // map units
  y: number;
  t?: string; // small serif label next to the pin
  at?: number;
}

export interface ShortText {
  t: string;
  x: number; // stage coords
  y: number;
  size?: number;
  at?: number;
  color?: string;
  serif?: boolean;
}

export type ShortSceneKind = 'map' | 'stage' | 'card' | 'end';

export interface ShortScene {
  id: string;
  kind: ShortSceneKind;
  year?: string; // year badge, top-left (e.g. '1867'); drawn on map/stage scenes
  // card scenes:
  cardText?: string; // big serif centre text (card kind)
  cardSub?: string; // smaller line under it
  // map scenes:
  cam?: {from: ShortCam; to: ShortCam};
  alaskaOwner?: number; // 0 = Russia fill, 1 = USA fill (static for the scene)
  soldAt?: number; // scene fraction: Alaska fill animates 0 -> 1 around this point
  ellipse?: {cx: number; cy: number; rx: number; ry: number; at?: number};
  arrow?: {x1: number; y1: number; x2: number; y2: number; at?: number};
  pins?: ShortMapPin[];
  showLabels?: boolean; // region labels on the map (default true on map scenes)
  // stage scenes:
  bg?: 'night' | 'teal' | 'paper' | 'dawn';
  // shared overlays (stage coords):
  actors?: ShortActor[];
  props?: ShortProp[];
  texts?: ShortText[];
}

// Audio cue sheet. Strict JSON between the /*CUES*/ markers in the script file;
// the render-short workflow extracts it and shorts_mux.mjs mixes what exists on
// disk. A cue whose file is missing is skipped with a warning — never fatal.
export interface ShortCues {
  sfx: {scene: string; at: number; key: string}[];
  music: {from: string; key: string | null}[];
}

export interface ShortScriptData {
  meta: {title: string; slug: string};
  lines: Record<string, string>;
  scenes: ShortScene[];
  looks: Record<string, ShortLook>;
  cues: ShortCues;
}
