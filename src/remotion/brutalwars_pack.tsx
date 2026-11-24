// brutalwars_pack.tsx — MOST BRUTAL WARS PACK (2026-11-23, Most Brutal Wars video)
// The video's signature device: THE LEDGER — one great bound book on a lectern
// in which the wars are entered one page at a time. Each chapter card opens
// the ledger at that war's page: the left page fills with tally rows (the
// count) and the right page carries the rank. States: closed (the hook),
// seven → one (the countdown), verdict (the closing: both pages full, sealed).
// Additive pack: nothing in world.tsx changes except the import and the
// PropArt dispatch.
import React from 'react';
import {INK} from './world';
import type {PropT} from './world';

const LEDGER_STATES = ['closed', 'seven', 'six', 'five', 'four', 'three', 'two', 'one', 'verdict'];
const RANK: Record<string, string> = {seven: '7', six: '6', five: '5', four: '4', three: '3', two: '2', one: '1'};
// tally rows per state — the count visibly grows as the countdown descends
const ROWS: Record<string, number> = {seven: 3, six: 4, five: 6, four: 7, three: 9, two: 11, one: 13, verdict: 13};

export const BrutalWarsProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p}) => {
  const t = p.t ?? 'closed';
  if (p.k === 'ledger_bw') {
    if (t === 'closed') {
      // The shut book: dark boards, brass corners, two straps, a blank
      // title plate. Nothing counted yet.
      return <g>
        <path d="M-118 96 L-96 30 L96 30 L118 96 Z" fill="#5d4630"/>
        <rect x={-104} y={28} width={208} height={10} fill="#6e5136"/>
        <path d="M-128 -84 Q0 -104 128 -84 L128 34 Q0 16 -128 34 Z" fill="#4a2e22" stroke="#2e1c14" strokeWidth={4}/>
        <path d="M-128 -84 Q0 -104 128 -84" fill="none" stroke="#8a6a42" strokeWidth={5}/>
        {[-118, 118].map(x => <path key={x} d={`M${x} -80 L${x} 30`} stroke="#8a6a42" strokeWidth={7}/>)}
        <rect x={-52} y={-58} width={104} height={44} rx={4} fill="#c9a86a" stroke="#8a6a42" strokeWidth={3}/>
        <path d="M-36 -38 L36 -38 M-24 -26 L24 -26" stroke="#6b5322" strokeWidth={3.4}/>
        {[[-120, -76], [120, -76], [-120, 26], [120, 26]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#c9a86a"/>)}
      </g>;
    }
    const rows = ROWS[t] ?? 3;
    const tallyRow = (r: number) => {
      const y = -64 + r * 11.4;
      const groups = 4 + (r % 3);
      return <g key={r} stroke="#5a4632" strokeWidth={2.2}>
        {Array.from({length: groups}, (_, gi) => {
          const x0 = -104 + gi * 25;
          return <g key={gi}>
            {[0, 5, 10, 15].map(dx => <line key={dx} x1={x0 + dx} y1={y - 4} x2={x0 + dx} y2={y + 4}/>)}
            <line x1={x0 - 2} y1={y + 4} x2={x0 + 17} y2={y - 5}/>
          </g>;
        })}
      </g>;
    };
    return <g>
      <path d="M-118 96 L-96 30 L96 30 L118 96 Z" fill="#5d4630"/>
      <rect x={-104} y={28} width={208} height={10} fill="#6e5136"/>
      {/* open pages */}
      <path d="M0 -78 Q-64 -94 -124 -80 L-124 36 Q-62 22 0 34 Z" fill="#e9dcba" stroke="#8a7648" strokeWidth={3}/>
      <path d="M0 -78 Q64 -94 124 -80 L124 36 Q62 22 0 34 Z" fill="#efe3c2" stroke="#8a7648" strokeWidth={3}/>
      <path d="M0 -78 L0 34" stroke="#b39b5e" strokeWidth={3}/>
      {/* the count: tally rows on the left page */}
      {Array.from({length: rows}, (_, r) => tallyRow(r))}
      {t === 'verdict'
        ? <g>
            {Array.from({length: 13}, (_, r) => {
              const y = -64 + r * 11.4;
              return <g key={r} stroke="#5a4632" strokeWidth={2.2}>
                {Array.from({length: 4}, (_, gi) => {
                  const x0 = 14 + gi * 25;
                  return <g key={gi}>
                    {[0, 5, 10, 15].map(dx => <line key={dx} x1={x0 + dx} y1={y - 4} x2={x0 + dx} y2={y + 4}/>)}
                    <line x1={x0 - 2} y1={y + 4} x2={x0 + 17} y2={y - 5}/>
                  </g>;
                })}
              </g>;
            })}
            <circle cx={86} cy={16} r={17} fill="#8a2f23"/>
            <circle cx={86} cy={16} r={11} fill="none" stroke="#c9a86a" strokeWidth={2.4}/>
            <path d="M86 8 L89 14 L95 14 L90 18 L92 24 L86 20 L80 24 L82 18 L77 14 L83 14 Z" fill="#c9a86a"/>
          </g>
        : <g>
            <text x={60} y={6} textAnchor="middle" fontSize={86} fontWeight={700} fill="#8a2f23" fontFamily="Georgia, serif">{RANK[t]}</text>
            <path d="M22 -34 L98 -34 M30 22 L90 22" stroke="#b39b5e" strokeWidth={2.6}/>
          </g>}
    </g>;
  }
  return null;
};
export const BRUTALWARS_PROPS = ['ledger_bw'];
export const isBrutalWarsProp = (k: string) => BRUTALWARS_PROPS.includes(k);
