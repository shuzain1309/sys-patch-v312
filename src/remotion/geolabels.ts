// Map label placement (pure, no d3): greedy collision avoidance.
// Each item is a box centred on (x, y) in screen pixels. Higher `prio` is placed first. `must` items are never dropped (they take the
// best spot found, even if it still overlaps); auto names (not `must`) are dropped when no free spot exists, instead of piling up.
export type LabelItem = {id: string; x: number; y: number; w: number; h: number; prio: number; must?: boolean};
export type Placed = {id: string; dx: number; dy: number} | {id: string; dropped: true};

const overlap = (a: {x: number; y: number; w: number; h: number}, b: {x: number; y: number; w: number; h: number}, pad: number) =>
  Math.abs(a.x - b.x) < (a.w + b.w) / 2 + pad && Math.abs(a.y - b.y) < (a.h + b.h) / 2 + pad;

export const placeLabels = (items: LabelItem[], W = 1920, H = 1080, margin = 30, pad = 8): Placed[] => {
  const out = new Map<string, Placed>();
  const taken: {x: number; y: number; w: number; h: number}[] = [];
  const order = [...items].sort((a, b) => b.prio - a.prio || a.id.localeCompare(b.id));
  for (const it of order) {
    const step = Math.max(it.h, 36);
    // spiral of candidate offsets around the anchor: stay close first
    const cand: [number, number][] = [[0, 0]];
    for (let r = 1; r <= 4; r++) for (const [sx, sy] of [[0, -1], [0, 1], [1, 0], [-1, 0], [1, -1], [-1, -1], [1, 1], [-1, 1]]) cand.push([sx * step * r * (sx ? 1.6 : 1), sy * step * r]);
    let best: {dx: number; dy: number; score: number} | null = null;
    for (const [dx, dy] of cand) {
      const box = {x: it.x + dx, y: it.y + dy, w: it.w, h: it.h};
      const inside = box.x - box.w / 2 >= margin && box.x + box.w / 2 <= W - margin && box.y - box.h / 2 >= margin && box.y + box.h / 2 <= H - margin;
      const hits = taken.filter((t) => overlap(box, t, pad)).length;
      if (inside && hits === 0) { best = {dx, dy, score: 0}; break; }
      const score = hits * 10 + (inside ? 0 : 5) + Math.hypot(dx, dy) / 100;
      if (!best || score < best.score) best = {dx, dy, score};
    }
    if (best && best.score === 0) {
      taken.push({x: it.x + best.dx, y: it.y + best.dy, w: it.w, h: it.h});
      out.set(it.id, {id: it.id, dx: best.dx, dy: best.dy});
    } else if (it.must && best) {
      taken.push({x: it.x + best.dx, y: it.y + best.dy, w: it.w, h: it.h});
      out.set(it.id, {id: it.id, dx: best.dx, dy: best.dy});
    } else out.set(it.id, {id: it.id, dropped: true});
  }
  return items.map((i) => out.get(i.id)!);
};

// text box estimate for the handwriting font (stroke included)
export const textBox = (t: string, fs: number, sub?: string) => ({w: Math.max(t.length * fs * 0.5, (sub?.length ?? 0) * fs * 0.62 * 0.5) + 16, h: fs * (sub ? 1.5 : 1.05)});

// A ring given as lon/lat points: close it and make sure d3 sees the SMALL side as the inside (d3 wants clockwise exterior rings).
export const closeRing = (pts: [number, number][]): [number, number][] => {
  const r = pts.length && (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1]) ? [...pts, pts[0]] : pts.slice();
  return r;
};
