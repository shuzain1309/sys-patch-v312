// Mongol pack for the Vidfactory kit. Pure SVG, deterministic (no Math.random, no Date, no CSS animation).
// Contents: 7 props (incl. the standard_mg signature prop with 6 era states) and 4 backgrounds.
// Imported by world.tsx (props, backgrounds) exactly like portugal_pack / afghanistan_pack. Do not edit per video.
// First built for: "How the Mongols Conquered the World in 40 Minutes" (Zeus History, 2026-11-19).
import React from 'react';
import {HAND, INK} from './world';
import type {PropT} from './world';

const OL = {stroke: '#241c17', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;

// ================= PROPS =================
export type MongolKind = 'standard_mg' | 'ger_mg' | 'cangue_mg' | 'paiza_mg' | 'brocade_mg' | 'dummy_mg' | 'yam_mg';
const SET = new Set<string>(['standard_mg', 'ger_mg', 'cangue_mg', 'paiza_mg', 'brocade_mg', 'dummy_mg', 'yam_mg']);
export const isMongolProp = (k: string) => SET.has(k);

export const MongolProp: React.FC<{p: PropT; f: number; d?: number; seed: string}> = ({p, f, seed}) => {
  const t = p.t ?? '';
  switch (p.k as MongolKind) {
    case 'standard_mg': { // THE signature prop: the sülde, the Khan's war standard. t = era state: lone|nine|gold|storm|four|faded.
      const st = t || 'nine';
      const pole = '#5a4632';
      const tailC = st === 'faded' ? '#b8ab90' : '#f2ead6';
      const tail = (x: number, len: number, sway: number) => (
        <path d={`M${x} -292 q${sway} ${len * 0.4} ${sway * 0.6} ${len} q${-sway * 0.5} ${-len * 0.3} 0 ${-len * 0.55} q${-sway * 0.4} ${-len * 0.3} ${-sway * 0.6} ${-len * 0.45}Z`} fill={tailC} />
      );
      if (st === 'four') return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={190} ry={13} fill="#000" opacity={0.16} stroke="none" />
          {[-138, -46, 46, 138].map((x, i) => (
            <g key={i} transform={`translate(${x} 0)`}>
              <path d="M-30 0 L0 -18 L30 0Z" fill="#8a7a5f" />
              <rect x={-5} y={-238} width={10} height={224} fill={pole} />
              <path d="M0 -238 L-9 -268 L0 -258 L9 -268Z" fill="#c9962e" />
              {tail(-14, 74, 5)} {tail(0, 88, -4)} {tail(14, 74, 6)}
            </g>))}
        </g>);
      const tails = st === 'lone' ? [0] : [-56, -42, -28, -14, 0, 14, 28, 42, 56];
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={120} ry={13} fill="#000" opacity={0.16} stroke="none" />
          <path d="M-52 0 L0 -26 L52 0Z" fill="#8a7a5f" />
          <rect x={-7} y={-330} width={14} height={312} fill={pole} />
          <path d="M0 -330 L-13 -368 L0 -352 L13 -368Z" fill="#c9962e" />
          <circle cx={0} cy={-300} r={17} fill="#c9962e" />
          {st === 'gold' && <circle cx={0} cy={-300} r={26} fill="none" stroke="#e8c14a" strokeWidth={5} />}
          {tails.map((x, i) => (<g key={i} transform={`translate(${x} 0)`}>{tail(0, st === 'faded' ? 96 : 118, (i % 3 - 1) * 7)}</g>))}
          {st === 'storm' && (<g stroke="#f2ead6" strokeWidth={4} opacity={0.7}><path d="M-90 -250 H-160" /><path d="M-84 -214 H-140" /><path d="M90 -232 H150" /></g>)}
          {st === 'faded' && <path d="M-7 -330 L4 -240 L-4 -150 L5 -60" fill="none" stroke="#241c17" strokeWidth={4} opacity={0.55} />}
        </g>);
    }
    case 'ger_mg': { // A ger: white felt tent, rope bands, door, smoke hole. t:'open' shows the door ajar with firelight.
      const open = t === 'open';
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={170} ry={14} fill="#000" opacity={0.16} stroke="none" />
          <path d="M-160 0 L-138 -120 Q0 -168 138 -120 L160 0Z" fill="#efe6d0" />
          <path d="M-138 -120 Q0 -168 138 -120" fill="none" stroke="#b09a72" strokeWidth={6} />
          <path d="M-152 -58 Q0 -104 152 -58" fill="none" stroke="#a03a2e" strokeWidth={7} />
          <path d="M-146 -92 Q0 -136 146 -92" fill="none" stroke="#b09a72" strokeWidth={5} />
          <circle cx={0} cy={-152} r={17} fill="#8a6a44" />
          <path d="M-8 -152 L0 -186 L8 -152Z" fill="#5a4632" />
          <rect x={-27} y={-86} width={54} height={86} fill={open ? '#e8a33d' : '#7a4a2a'} />
          <rect x={-27} y={-86} width={54} height={86} fill="none" stroke="#5a3a22" strokeWidth={5} />
          {open && <path d="M27 -86 L52 -70 L52 0 L27 0Z" fill="#7a4a2a" />}
        </g>);
    }
    case 'cangue_mg': { // The wooden collar (cangue) a prisoner wore: two planks locked around the neck hole, on a stand for display beats.
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={130} ry={12} fill="#000" opacity={0.16} stroke="none" />
          <rect x={-10} y={-96} width={20} height={96} fill="#5a4632" />
          <path d="M-46 0 L0 -14 L46 0Z" fill="#8a7a5f" />
          <g transform="rotate(-4 0 -150)">
            <rect x={-120} y={-196} width={240} height={42} fill="#a8845c" />
            <rect x={-120} y={-152} width={240} height={42} fill="#96754a" />
            <circle cx={0} cy={-153} r={24} fill="#3a2c1c" />
            <rect x={-120} y={-160} width={240} height={14} fill="#7a5c38" />
            <circle cx={-96} cy={-174} r={6} fill="#5a4632" /><circle cx={96} cy={-174} r={6} fill="#5a4632" />
          </g>
          <path d="M60 -196 L96 -228" stroke="#5a4632" strokeWidth={6} />
          <rect x={90} y={-246} width={34} height={22} fill="#8a2f2f" />
        </g>);
    }
    case 'paiza_mg': { // The paiza: a metal passport tablet of the yam relay, hung on a post. t = inscription lines count is fixed; colour by metal.
      const gold = t === 'gold';
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={100} ry={11} fill="#000" opacity={0.16} stroke="none" />
          <rect x={-8} y={-300} width={16} height={300} fill="#5a4632" />
          <path d="M-40 0 L0 -16 L40 0Z" fill="#8a7a5f" />
          <path d="M0 -292 L-52 -262 M0 -292 L52 -262" stroke="#5a4632" strokeWidth={5} fill="none" />
          <rect x={-52} y={-262} width={104} height={168} rx={14} fill={gold ? '#d9a441' : '#9aa3ae'} />
          <rect x={-38} y={-246} width={76} height={136} rx={9} fill="none" stroke={gold ? '#8a6a1f' : '#5d6068'} strokeWidth={4} />
          <g stroke={gold ? '#8a6a1f' : '#43464d'} strokeWidth={5}>
            <path d="M-24 -214 H24" /><path d="M-24 -186 H24" /><path d="M-24 -158 H10" />
          </g>
          <circle cx={0} cy={-232} r={7} fill={gold ? '#8a6a1f' : '#43464d'} stroke="none" />
        </g>);
    }
    case 'brocade_mg': { // A roll of gold brocade: Chinese silk, Tibetan gold thread, Persian weaving — the Pax in one object.
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={140} ry={12} fill="#000" opacity={0.16} stroke="none" />
          <path d="M-120 0 L-104 -128 Q0 -152 104 -128 L120 0Z" fill="#7a1f2b" />
          <path d="M-104 -128 Q0 -152 104 -128 L96 -96 Q0 -118 -96 -96Z" fill="#93313f" />
          <g stroke="#e8c14a" strokeWidth={4} fill="none" opacity={0.9}>
            <path d="M-84 -70 q21 -16 42 0 q21 16 42 0 q21 -16 42 0" />
            <path d="M-84 -44 q21 -16 42 0 q21 16 42 0 q21 -16 42 0" />
            <circle cx={-42} cy={-96} r={7} /><circle cx={42} cy={-96} r={7} />
          </g>
          <g transform="translate(96 -120) rotate(24)">
            <rect x={-13} y={0} width={26} height={120} fill="#d9a441" />
            <rect x={-13} y={0} width={26} height={16} fill="#b8862e" />
          </g>
        </g>);
    }
    case 'dummy_mg': { // A straw dummy rider tied to a spare horse — the trick that doubled an army.
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={130} ry={12} fill="#000" opacity={0.16} stroke="none" />
          <path d="M-88 -64 q-14 -44 16 -66 l20 -6 q34 -20 62 -6 l52 10 q30 4 34 30 l4 30 q2 20 -16 24 l-14 2 10 52 -20 2 -16 -50 -52 2 -14 48 -20 -2 8 -54 q-22 -2 -26 -20Z" fill="#6b4a2f" />
          <circle cx={66} cy={-128} r={21} fill="#7a5636" />
          <path d="M58 -140 l26 -8 M84 -148 l-4 16" stroke="#241c17" strokeWidth={4} />
          <path d="M-88 -64 q-30 6 -34 -18 q22 -8 34 2" fill="#5d3d24" />
          <rect x={-38} y={-118} width={64} height={40} rx={8} fill="#8a2f2f" />
          <g>
            <rect x={-16} y={-196} width={34} height={76} rx={12} fill="#c9a86a" />
            <circle cx={1} cy={-212} r={17} fill="#d9b878" />
            <path d="M-16 -222 q17 -20 34 0 l0 8 -34 0Z" fill="#5d6068" />
            <path d="M-14 -160 L-44 -104 M18 -160 L44 -110" stroke="#c9a86a" strokeWidth={11} strokeLinecap="round" />
            <path d="M-2 -196 L-2 -120" stroke="#8a6a44" strokeWidth={5} />
          </g>
        </g>);
    }
    case 'yam_mg': { // A yam relay post: station board, bell, and the horse post — fresh horses a day's ride apart.
      return (
        <g {...OL}>
          <ellipse cx={0} cy={6} rx={120} ry={12} fill="#000" opacity={0.16} stroke="none" />
          <rect x={-9} y={-268} width={18} height={268} fill="#5a4632" />
          <path d="M-44 0 L0 -15 L44 0Z" fill="#8a7a5f" />
          <rect x={-64} y={-268} width={128} height={52} fill="#7a5c38" />
          <g stroke="#e8dcc0" strokeWidth={5}><path d="M-44 -242 H44" /><path d="M-44 -226 H26" /></g>
          <path d="M64 -240 q26 6 22 30 q-3 16 -20 14" fill="#d9a441" />
          <circle cx={70} cy={-196} r={5} fill="#8a6a1f" stroke="none" />
          <path d="M-9 -120 H84" stroke="#5a4632" strokeWidth={9} />
          <circle cx={88} cy={-112} r={10} fill="#9aa3ae" />
        </g>);
    }
    default: return null;
  }
};

// ================= BACKGROUNDS =================
export type MongolBgKind = 'onon_mg' | 'gers_mg' | 'karakorum_mg' | 'steppe_winter_mg';
const BGSET = new Set<string>(['onon_mg', 'gers_mg', 'karakorum_mg', 'steppe_winter_mg']);
export const isMongolBg = (k: string) => BGSET.has(k);
export const MONGOL_GROUND: Record<MongolBgKind, string> = {onon_mg: '#86a860', gers_mg: '#b08954', karakorum_mg: '#a8895a', steppe_winter_mg: '#dfe7ee'};

export const MongolBg: React.FC<{bg: MongolBgKind; f: number; cx: number; seed: string}> = ({bg, f, cx, seed}) => {
  const S = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round'} as const;
  if (bg === 'onon_mg') return (
    <g {...S}><defs><linearGradient id={`on${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f2e3bb" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#on${seed})`} stroke="none" />
      <circle cx={300} cy={118} r={50} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        <path d="M0 620 Q480 480 960 570 Q1440 660 1920 540 V730 H0Z" fill="#8fae5f" />
        <path d="M0 668 Q520 596 1040 650 Q1520 700 1920 636 V730 H0Z" fill="#4a86c5" stroke="none" />
        <path d="M0 690 Q520 622 1040 674" stroke="#bcd8f0" strokeWidth={4} fill="none" opacity={0.6} />
        {[240, 1560].map((x, i) => (<g key={i} transform={`translate(${x} 560)`}><path d="M0 60 q-6 -70 4 -108 M2 -60 q-26 -22 -40 -18 M3 -84 q20 -20 38 -14" stroke="#5d4630" strokeWidth={7} fill="none" /><ellipse cx={0} cy={-108} rx={54} ry={34} fill="#4f7f3f" /></g>))}
      </g>
      <rect y={730} width={1920} height={350} fill="#86a860" />
      <path d="M0 810 H1920 M0 905 H1920" stroke="#6f9150" strokeWidth={4} opacity={0.55} /></g>);
  if (bg === 'gers_mg') return (
    <g {...S}><defs><linearGradient id={`gr${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ec9ee" /><stop offset="1" stopColor="#f7ecc9" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#gr${seed})`} stroke="none" />
      <circle cx={1620} cy={112} r={48} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        <path d="M0 640 Q480 520 960 600 Q1440 680 1920 580 V730 H0Z" fill="#a98a5f" />
        {[180, 620, 1180, 1620].map((x, i) => (<g key={i} transform={`translate(${x} ${640 + (i % 2) * 26}) scale(${i % 2 ? 0.8 : 1})`}>
          <path d="M-92 0 L-78 -66 Q0 -92 78 -66 L92 0Z" fill="#efe6d0" />
          <path d="M-84 -34 Q0 -58 84 -34" fill="none" stroke="#a03a2e" strokeWidth={5} />
          <rect x={-14} y={-46} width={28} height={46} fill="#7a4a2a" />
        </g>))}
        {[420, 980, 1440].map((x, i) => (<g key={i} transform={`translate(${x} 612)`}><path d="M-30 18 q30 -12 60 0 l-6 10 h-48Z" fill="#6b4a2f" /><circle cx={34} cy={2} r={11} fill="#7a5636" /></g>))}
      </g>
      <rect y={730} width={1920} height={350} fill="#b08954" />
      <path d="M0 815 H1920 M0 900 H1920" stroke="#8f6f42" strokeWidth={4} opacity={0.55} /></g>);
  if (bg === 'karakorum_mg') return (
    <g {...S}><defs><linearGradient id={`kk${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#93b8dc" /><stop offset="1" stopColor="#efe0ba" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#kk${seed})`} stroke="none" />
      <circle cx={280} cy={116} r={48} fill="#f7dd8e" stroke="none" opacity={0.9} />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        <path d="M0 646 Q480 536 960 606 Q1440 676 1920 590 V730 H0Z" fill="#9a8256" />
        <rect x={700} y={452} width={520} height={150} fill="#b09a72" />
        <path d="M684 452 H1236 L1170 402 H750Z" fill="#7a5c38" />
        <rect x={912} y={512} width={96} height={90} fill="#5d4630" />
        {[760, 1060].map((x, i) => <rect key={i} x={x} y={486} width={52} height={52} fill="#e8dcc0" />)}
        {[240, 520, 1400, 1680].map((x, i) => (<g key={i} transform={`translate(${x} ${636 + (i % 2) * 22}) scale(0.85)`}>
          <path d="M-92 0 L-78 -66 Q0 -92 78 -66 L92 0Z" fill="#efe6d0" />
          <path d="M-84 -34 Q0 -58 84 -34" fill="none" stroke="#a03a2e" strokeWidth={5} />
          <rect x={-14} y={-46} width={28} height={46} fill="#7a4a2a" />
        </g>))}
        <g transform="translate(960 640)"><rect x={-5} y={-190} width={10} height={190} fill="#5a4632" /><path d="M0 -190 L-8 -214 L0 -204 L8 -214Z" fill="#c9962e" />{[-24, -12, 0, 12, 24].map((x, i) => <path key={i} d={`M${x} -178 q3 22 0 44`} stroke="#f2ead6" strokeWidth={6} fill="none" />)}</g>
      </g>
      <rect y={730} width={1920} height={350} fill="#a8895a" />
      <path d="M0 812 H1920 M0 898 H1920" stroke="#8a6f45" strokeWidth={4} opacity={0.55} /></g>);
  return (
    <g {...S}><defs><linearGradient id={`sw${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#aebfd2" /><stop offset="1" stopColor="#e8eef4" /></linearGradient></defs>
      <rect width={1920} height={730} fill={`url(#sw${seed})`} stroke="none" />
      <circle cx={1560} cy={120} r={44} fill="#f2ead6" stroke="none" opacity={0.75} />
      <g transform={`translate(${-cx * 0.05} 0)`}>
        <path d="M0 630 Q480 520 960 596 Q1440 668 1920 580 V730 H0Z" fill="#eef3f8" />
        {[300, 900, 1500].map((x, i) => (<g key={i} transform={`translate(${x} ${640 + (i % 2) * 24}) scale(0.9)`}>
          <path d="M-92 0 L-78 -66 Q0 -92 78 -66 L92 0Z" fill="#f4f1ea" />
          <path d="M-84 -34 Q0 -58 84 -34" fill="none" stroke="#7a8a9a" strokeWidth={5} />
          <rect x={-14} y={-46} width={28} height={46} fill="#5d4630" />
          <path d="M0 -84 q6 -22 -4 -34" stroke="#c8d2dc" strokeWidth={6} fill="none" opacity={0.8} />
        </g>))}
        <path d="M120 700 q60 -14 130 0 M900 716 q70 -14 150 0 M1560 700 q60 -12 120 0" stroke="#c8d2dc" strokeWidth={5} fill="none" opacity={0.7} />
      </g>
      <rect y={730} width={1920} height={350} fill="#dfe7ee" />
      <path d="M0 815 H1920 M0 900 H1920" stroke="#bfccd8" strokeWidth={4} opacity={0.6} /></g>);
};
