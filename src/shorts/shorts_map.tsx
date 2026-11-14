// shorts_map.tsx — the shorts map stage: ONE oversized stylised North-Pacific map
// the camera travels across (never cuts). Parchment-tan relief land on flat teal
// sea, flat colour territory fills, white serif labels printed on the map — the
// GeoGlobeTales-style grammar from SHORTS-PLAN-2026-11-14 §1, drawn as
// hand-authored SVG. No world-atlas / d3 / longform geo.tsx involved: the shapes
// below are simplified originals, drawn for this view only.
//
// Map space: MAP_W x MAP_H units. Camera = {x, y, z}: centre point + how many
// map units fit across the 1080px stage width.

import React from 'react';
import type {ShortCam, ShortMapPin, ShortScene} from './shorts_types';
import {clamp, easeInOut, lerp, sRand} from './shorts_util';

export const MAP_W = 2600;
export const MAP_H = 2000;

export const SEA = '#27686e';
export const PARCHMENT = '#dcc79c';
export const RUSSIA_FILL = '#7f9c5a';
export const USA_FILL = '#3aa79c';
export const CANADA_FILL = '#c05a41';
export const GOLD = '#ffd94a';

const hex = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
export const lerpColor = (a: string, b: string, t: number): string => {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const m = (x: number, y: number) => Math.round(lerp(x, y, clamp(t, 0, 1)));
  return `rgb(${m(r1, r2)},${m(g1, g2)},${m(b1, b2)})`;
};

// ---- Hand-authored simplified coastlines (stylised, not surveyed) ----
const RUSSIA_PATH =
  'M0,150 L240,80 L540,50 L880,55 L1160,105 L1300,215 L1285,360 L1225,455 L1160,540 ' +
  'L1220,655 L1205,875 L1170,1025 L1090,905 L1058,665 L990,715 L885,825 L795,955 ' +
  'L735,1085 L565,1125 L335,1055 L120,985 L0,925 Z';
const ALASKA_PATH =
  'M1355,340 L1555,255 L1700,238 L1830,260 L2045,330 L2125,465 L2055,600 L2125,715 L2070,875 ' +
  'L1955,905 L2035,1005 L2085,1175 L2025,1245 L1940,1085 L1875,960 L1720,950 ' +
  'L1600,880 L1470,900 L1380,760 L1330,565 L1298,520 L1345,430 Z';
const CANADA_PATH =
  'M2145,650 L2600,600 L2600,855 L2485,925 L2545,1035 L2600,1080 L2600,1295 ' +
  'L2380,1340 L2290,1195 L2195,1240 L2120,1085 L2095,930 L2150,760 Z';
const USA_PATH =
  'M1705,1330 L1975,1290 L2240,1300 L2470,1275 L2600,1300 L2600,1620 L2545,1700 ' +
  'L2595,1795 L2560,1900 L2600,1960 L2600,2000 L1650,2000 L1650,1560 L1660,1420 Z';
const ALEUTIANS: [number, number, number, number, number][] = [
  [1470, 945, 55, 16, -18],
  [1330, 990, 50, 14, -22],
  [1200, 1035, 46, 13, -25],
  [1080, 1075, 42, 12, -28],
  [975, 1105, 36, 11, -30],
  [1640, 1005, 42, 20, -15], // Kodiak
];

// Seeded relief ticks (little mountain carets) + sea wave strokes, drawn once.
const reliefTicks = (seed: string, box: [number, number, number, number], n: number) => {
  const rnd = sRand(seed);
  const [x0, y0, x1, y1] = box;
  return Array.from({length: n}, () => {
    const x = x0 + rnd() * (x1 - x0);
    const y = y0 + rnd() * (y1 - y0);
    const s = 12 + rnd() * 14;
    return `M${x - s},${y} L${x},${y - s} L${x + s},${y}`;
  });
};
const RELIEF: string[] = [
  ...reliefTicks('sib', [150, 180, 1000, 900], 16),
  ...reliefTicks('ala', [1450, 380, 1980, 820], 10),
  ...reliefTicks('rock', [1760, 1360, 1980, 1800], 7),
];
const WAVES = (() => {
  const rnd = sRand('pac');
  return Array.from({length: 12}, () => {
    const x = 500 + rnd() * 900;
    const y = 1250 + rnd() * 600;
    return `M${x},${y} q26,-14 52,0 t52,0`;
  });
})();

const Landmass: React.FC<{d: string; fill: string}> = ({d, fill}) => (
  <>
    {/* soft coast shadow, then parchment base, then territory tint, then relief */}
    <path d={d} fill="none" stroke="rgba(20,40,45,0.20)" strokeWidth={16} transform="translate(0,7)" />
    <path d={d} fill={PARCHMENT} stroke="#8a6f3e" strokeWidth={4} strokeLinejoin="round" />
    <path d={d} fill={fill} opacity={0.88} stroke="rgba(60,45,20,0.45)" strokeWidth={2.5} strokeLinejoin="round" />
  </>
);

const MapLabel: React.FC<{x: number; y: number; t: string; size?: number; rot?: number; sub?: boolean}> = ({
  x,
  y,
  t,
  size = 84,
  rot = 0,
  sub = false,
}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <text
      textAnchor="middle"
      fontFamily="Georgia, 'Times New Roman', serif"
      fontWeight={700}
      fontSize={size}
      letterSpacing={size * 0.08}
      fill="rgba(20,30,35,0.35)"
      transform="translate(3,4)"
    >
      {t}
    </text>
    <text
      textAnchor="middle"
      fontFamily="Georgia, 'Times New Roman', serif"
      fontWeight={700}
      fontSize={size}
      letterSpacing={size * 0.08}
      fill={sub ? 'rgba(255,255,255,0.75)' : '#ffffff'}
    >
      {t}
    </text>
  </g>
);

export interface ShortsMapProps {
  camFrom: ShortCam;
  camTo: ShortCam;
  progress: number; // scene progress 0..1
  frame: number; // local frame, for pin pulses
  alaskaFill: number; // 0 = Russia, 1 = USA (already animated by the kit)
  ellipse?: ShortScene['ellipse'];
  arrow?: ShortScene['arrow'];
  pins?: ShortMapPin[];
  showLabels?: boolean;
}

export const ShortsMap: React.FC<ShortsMapProps> = ({
  camFrom,
  camTo,
  progress,
  frame,
  alaskaFill,
  ellipse,
  arrow,
  pins,
  showLabels = true,
}) => {
  const ct = easeInOut(clamp(progress / 0.8, 0, 1)); // camera settles before the scene ends
  const cam = {
    x: lerp(camFrom.x, camTo.x, ct),
    y: lerp(camFrom.y, camTo.y, ct),
    z: lerp(camFrom.z, camTo.z, ct),
  };
  const scale = 1080 / cam.z;
  const alaskaFillColor = lerpColor(RUSSIA_FILL, USA_FILL, alaskaFill);
  const drawOn = (at = 0) => clamp((progress - at) / 0.18, 0, 1);

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <rect width={1080} height={1920} fill={SEA} />
      <g transform={`translate(540,850) scale(${scale}) translate(${-cam.x},${-cam.y})`}>
        <rect x={-2400} y={-2400} width={MAP_W + 4800} height={MAP_H + 4800} fill={SEA} />
        {WAVES.map((d, i) => (
          <path key={`w${i}`} d={d} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={5} strokeLinecap="round" />
        ))}
        <Landmass d={RUSSIA_PATH} fill={RUSSIA_FILL} />
        <Landmass d={CANADA_PATH} fill={CANADA_FILL} />
        <Landmass d={USA_PATH} fill={USA_FILL} />
        {/* Alaska is its own landmass so its fill can change owner */}
        <path d={ALASKA_PATH} fill="none" stroke="rgba(20,40,45,0.20)" strokeWidth={16} transform="translate(0,7)" />
        <path d={ALASKA_PATH} fill={PARCHMENT} stroke="#8a6f3e" strokeWidth={4} strokeLinejoin="round" />
        <path
          d={ALASKA_PATH}
          fill={alaskaFillColor}
          opacity={0.92}
          stroke="rgba(60,45,20,0.45)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {ALEUTIANS.map(([cx, cy, rx, ry, rot], i) => (
          <ellipse
            key={`al${i}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            transform={`rotate(${rot},${cx},${cy})`}
            fill={alaskaFillColor}
            stroke="#8a6f3e"
            strokeWidth={3}
          />
        ))}
        {RELIEF.map((d, i) => (
          <path key={`r${i}`} d={d} fill="none" stroke="rgba(90,66,30,0.35)" strokeWidth={3.5} strokeLinecap="round" />
        ))}
        {arrow && (
          <g opacity={drawOn(arrow.at)}>
            <line
              x1={arrow.x1}
              y1={arrow.y1}
              x2={arrow.x2}
              y2={arrow.y2}
              stroke={GOLD}
              strokeWidth={13}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 * (1 - drawOn(arrow.at))}
            />
            <path
              d={`M${arrow.x2},${arrow.y2} l-44,-8 l20,38 z`}
              fill={GOLD}
              transform={`rotate(${(Math.atan2(arrow.y2 - arrow.y1, arrow.x2 - arrow.x1) * 180) / Math.PI},${arrow.x2},${arrow.y2})`}
            />
          </g>
        )}
        {ellipse && (
          <ellipse
            cx={ellipse.cx}
            cy={ellipse.cy}
            rx={ellipse.rx}
            ry={ellipse.ry}
            fill="none"
            stroke={GOLD}
            strokeWidth={11}
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 * (1 - drawOn(ellipse.at))}
            transform={`rotate(-6,${ellipse.cx},${ellipse.cy})`}
          />
        )}
        {(pins ?? []).map((p, i) => {
          const on = drawOn(p.at);
          if (on <= 0) return null;
          const pulse = 26 + Math.sin(frame / 6 + i) * 6;
          return (
            <g key={`p${i}`} opacity={on}>
              <circle cx={p.x} cy={p.y} r={pulse + 16} fill="none" stroke={GOLD} strokeWidth={4} opacity={0.55} />
              <circle cx={p.x} cy={p.y} r={17} fill={GOLD} stroke="#7a5b12" strokeWidth={4} />
              {p.t && (
                <text
                  x={p.x + 34}
                  y={p.y + 14}
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fontWeight={700}
                  fontSize={46}
                  fill="#ffffff"
                  stroke="rgba(20,30,35,0.4)"
                  strokeWidth={1.5}
                >
                  {p.t}
                </text>
              )}
            </g>
          );
        })}
        {showLabels && (
          <>
            <MapLabel x={600} y={540} t="RUSSIA" rot={-4} />
            <MapLabel x={1745} y={580} t="ALASKA" size={76} />
            <MapLabel x={2335} y={990} t="BRITISH" size={46} />
            <MapLabel x={2335} y={1045} t="CANADA" size={46} />
            <MapLabel x={2170} y={1660} t="UNITED STATES" size={58} />
            <MapLabel x={880} y={1620} t="Pacific Ocean" size={44} sub />
          </>
        )}
      </g>
    </svg>
  );
};
