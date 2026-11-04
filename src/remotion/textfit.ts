// textfit.ts: THE TEXT RULES. Single source of truth, imported by world.tsx and kit.tsx. Do not edit per video.
// Guarantees, for every piece of text the kit draws (typed texts, labels, signs, banners, speech bubbles, chapter cards,
// kinetic words, stats, lists, chart labels, photo captions):
//   1. Nothing leaves the safe frame (SAFE). Too wide => wrap, then shrink, then (last resort) shrink below the minimum.
//   2. Nothing sits behind another element: year badge, FACT CHECK badge, narrator overlay and other text boxes are
//      "avoid" rectangles; a text box that would overlap one is moved to the nearest free spot inside SAFE.
//   3. Boards (sign, banner, arch, photo caption) grow to fit the sentence (wrap to lines, widen both sides, never spill).
// Deterministic (no DOM measuring): average em widths per font with corrections for narrow, wide and capital letters.
export type Rect = {x0: number; y0: number; x1: number; y1: number};
export type FontK = 'hand' | 'head' | 'body'; // hand = Patrick Hand, head = Anton (caps), body = Inter 700/800
export const SAFE = {l: 90, r: 1830, t: 70, b: 1010}; // 80 px side margin, 70 px top/bottom (title-safe at 1920x1080)
const EM: Record<FontK, number> = {hand: 0.47, head: 0.44, body: 0.58};
const NARROW = "ilj't.,:;!|1 ()";
const WIDE = 'WMmw@%QOGDHN';

export const measure = (t: string, fs: number, font: FontK = 'hand'): number => {
  let em = 0;
  for (const ch of t) {
    let k = EM[font];
    if (NARROW.includes(ch)) k *= 0.55;
    else if (WIDE.includes(ch)) k *= 1.3;
    else if (ch >= 'A' && ch <= 'Z' && font !== 'head') k *= 1.15;
    em += k;
  }
  return em * fs;
};

const greedy = (words: string[], maxW: number, fs: number, font: FontK): string[] => {
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const nx = cur ? `${cur} ${w}` : w;
    if (!cur || measure(nx, fs, font) <= maxW) cur = nx;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
};

export type Fit = {lines: string[]; fs: number; w: number; h: number; lh: number};
/** Fit text into maxW x maxLines: wrap, shrink to minFs, balance the lines. Never returns something wider than maxW. */
export const fit = (t: string, o: {fs: number; minFs?: number; maxW: number; maxLines?: number; font?: FontK; lh?: number}): Fit => {
  const font = o.font ?? 'hand', maxLines = o.maxLines ?? 2, lhk = o.lh ?? 1.15;
  const words = (t || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return {lines: [''], fs: o.fs, w: 0, h: o.fs * lhk, lh: o.fs * lhk};
  const widest = (ls: string[], s: number) => Math.max(...ls.map((l) => measure(l, s, font)));
  const bad = (ls: string[], s: number) => ls.length > maxLines || widest(ls, s) > o.maxW + 0.5;
  const minFs = o.minFs ?? Math.round(o.fs * 0.55);
  let fs = o.fs, lines = greedy(words, o.maxW, fs, font);
  while (bad(lines, fs) && fs > minFs) { fs = Math.max(minFs, fs * 0.93); lines = greedy(words, o.maxW, fs, font); }
  while (bad(lines, fs) && fs > 14) { fs *= 0.93; lines = greedy(words, o.maxW, fs, font); } // last resort: legibility loses to staying in frame
  if (lines.length > 1) { // balance: narrowest width that keeps the same number of lines
    const n = lines.length;
    let lo = Math.max(...words.map((w) => measure(w, fs, font))), hi = widest(lines, fs);
    for (let i = 0; i < 9 && hi - lo > 4; i++) { const mid = (lo + hi) / 2; if (greedy(words, mid, fs, font).length <= n) hi = mid; else lo = mid; }
    lines = greedy(words, hi + 1, fs, font);
  }
  return {lines, fs, w: widest(lines, fs), h: lines.length * fs * lhk, lh: fs * lhk};
};

const hit = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
const box = (x: number, y: number, w: number, h: number): Rect => ({x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2});
/** Place a w x h box centred near (cx, cy): clamp into SAFE, then move to the nearest spot that overlaps nothing in `avoid`. */
export const placeBox = (cx: number, cy: number, w: number, h: number, avoid: Rect[] = []): {x: number; y: number; moved: boolean} => {
  const cl = (x: number, y: number) => ({
    x: w >= SAFE.r - SAFE.l ? (SAFE.l + SAFE.r) / 2 : Math.min(SAFE.r - w / 2, Math.max(SAFE.l + w / 2, x)),
    y: h >= SAFE.b - SAFE.t ? (SAFE.t + SAFE.b) / 2 : Math.min(SAFE.b - h / 2, Math.max(SAFE.t + h / 2, y)),
  });
  const free = (p: {x: number; y: number}) => !avoid.some((r) => hit(box(p.x, p.y, w, h), r));
  const base = cl(cx, cy);
  if (free(base)) return {...base, moved: Math.abs(base.x - cx) > 1 || Math.abs(base.y - cy) > 1};
  const st = h + 14, dys = [0, st, -st, 2 * st, -2 * st, 3 * st, -3 * st], dxs = [0, 240, -240, 480, -480, 760, -760];
  const cands = dys.flatMap((dy) => dxs.map((dx) => ({dx, dy}))).sort((a, b) => Math.abs(a.dx) * 0.7 + Math.abs(a.dy) - (Math.abs(b.dx) * 0.7 + Math.abs(b.dy)));
  for (const c of cands) { const p = cl(cx + c.dx, cy + c.dy); if (free(p)) return {...p, moved: true}; }
  return {...base, moved: true};
};

/** Rectangles the scene's overlays occupy. Pass the result as `avoid` to Stage so stage text never hides behind them. */
export const avoidRects = (o: {year?: string; nar?: boolean; fact?: boolean; extra?: Rect[]}): Rect[] => {
  const r: Rect[] = [];
  if (o.year) r.push({x0: 40, y0: 36, x1: 48 + measure(o.year, 56) + 62, y1: 136}); // year badge (top-left)
  if (o.nar) r.push({x0: 1360, y0: 500, x1: 1920, y1: 1080}); // narrator overlay (right third, lower half)
  if (o.fact) r.push({x0: 1590, y0: 24, x1: 1900, y1: 116}); // FACT CHECK badge (top-right)
  return r.concat(o.extra ?? []);
};
export const boxOf = box;
