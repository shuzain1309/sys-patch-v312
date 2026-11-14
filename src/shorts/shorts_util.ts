// shorts_util.ts — tiny deterministic helpers for the shorts engine.
// Copied-in-spirit from house conventions (the longform kit forbids Math.random
// and Date at render); nothing here imports longform code.

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// Smoothstep easing for camera moves and colour flips.
export const easeInOut = (t: number): number => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

export const easeOut = (t: number): number => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

// Pop-in with a slight overshoot, driven by scene progress (0..1) and an `at` offset.
export const popScale = (progress: number, at = 0, dur = 0.14): number => {
  const t = clamp((progress - at) / dur, 0, 1);
  if (t <= 0) return 0;
  const c = 1.70158;
  const u = t - 1;
  return 1 + (c + 1) * u * u * u + c * u * u; // easeOutBack
};

// Deterministic pseudo-random from a string seed (mulberry32 over an FNV hash).
export const sRand = (seed: string): (() => number) => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Split a narration line into words (the caption + timing unit everywhere).
export const wordsOf = (text: string): string[] =>
  text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);

// Crude text width estimate (serif/sans average) for label placement only.
export const estTextW = (text: string, fontPx: number, serif = false): number =>
  text.length * fontPx * (serif ? 0.58 : 0.54);
