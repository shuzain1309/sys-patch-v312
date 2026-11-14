// shorts_props.tsx — narrative props for the shorts lane, all drawn in code.
// Local space: origin at the prop's base centre; the kit places them with x/y in
// stage coords (or they ride along inside the stage SVG).

import React from 'react';
import type {ShortProp} from './shorts_types';
import {clamp, popScale} from './shorts_util';

export interface ShortPropDrawProps {
  prop: ShortProp;
  progress: number; // scene progress 0..1 (drives pop-ins and the SOLD flip)
  frame: number;
}

const SERIF = "Georgia, 'Times New Roman', serif";

export const ShortPropDraw: React.FC<ShortPropDrawProps> = ({prop, progress, frame}) => {
  const pop = popScale(progress, prop.at ?? 0);
  if (pop <= 0) return null;
  const s = (prop.s ?? 1) * pop;
  const t = prop.t ?? '';
  const g = (inner: React.ReactNode, extra = '') => (
    <g transform={`translate(${prop.x},${prop.y}) scale(${prop.flip ? -s : s},${s}) ${extra}`}>{inner}</g>
  );

  switch (prop.k) {
    case 'pricetag':
      return g(
        <>
          <path d="M0,-118 L0,-58" stroke="#8a6f3e" strokeWidth={5} />
          <g transform="rotate(-16)">
            <rect x={-105} y={-58} width={210} height={122} rx={18} fill="#f4e3b2" stroke="#8a6f3e" strokeWidth={5} />
            <circle cx={-78} cy={0} r={11} fill="#fff8e6" stroke="#8a6f3e" strokeWidth={4} />
            <text
              x={8}
              y={16}
              textAnchor="middle"
              fontFamily={SERIF}
              fontWeight={700}
              fontSize={Math.min(46, Math.floor(178 / Math.max(1, t.length) / 0.6))}
              fill="#5b421a"
            >
              {t}
            </text>
          </g>
        </>,
      );
    case 'moneycase':
      return g(
        <>
          <rect x={-118} y={-150} width={236} height={150} rx={16} fill="#6b4426" stroke="#3f2812" strokeWidth={5} />
          <rect x={-118} y={-86} width={236} height={26} fill="#3f2812" />
          <rect x={-16} y={-96} width={32} height={42} rx={5} fill="#e8bc4a" stroke="#9a741f" strokeWidth={3} />
          <path d="M-34,-150 v-16 a34,20 0 0 1 68,0 v16" fill="none" stroke="#3f2812" strokeWidth={9} />
          <text x={0} y={-112} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={40} fill="#ffe9a8">
            {t}
          </text>
        </>,
      );
    case 'salesign': {
      const flipAt = t && !Number.isNaN(parseFloat(t)) ? parseFloat(t) : 0.55;
      const sold = progress >= flipAt;
      const stampPop = sold ? popScale(progress, flipAt, 0.1) : 0;
      return g(
        <>
          <rect x={-9} y={-190} width={18} height={190} fill="#7a5a34" stroke="#543e22" strokeWidth={3} />
          <g transform="rotate(-3)">
            <rect x={-160} y={-300} width={320} height={112} rx={10} fill="#f7f1dd" stroke="#7a5a34" strokeWidth={6} />
            <text x={0} y={-226} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={56} fill="#4a3a20">
              FOR SALE
            </text>
          </g>
          {sold && (
            <g transform={`rotate(-11) scale(${stampPop})`}>
              <rect x={-128} y={-292} width={256} height={96} rx={8} fill="rgba(255,250,235,0.92)" stroke="#b3352c" strokeWidth={7} />
              <text x={0} y={-228} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={62} fill="#b3352c" letterSpacing={4}>
                SOLD
              </text>
            </g>
          )}
        </>,
      );
    }
    case 'ship': {
      const bob = Math.sin(frame / 14 + prop.x) * 6;
      return g(
        <>
          <path d="M-130,-38 L130,-38 L96,16 L-96,16 Z" fill="#7a4a28" stroke="#4c2d12" strokeWidth={4} strokeLinejoin="round" />
          <rect x={-6} y={-196} width={10} height={160} fill="#5b3a1e" />
          <rect x={-96} y={-158} width={8} height={122} fill="#5b3a1e" />
          <path d="M4,-192 L4,-96 L84,-96 Z" fill="#f7f1dd" stroke="#cbbd97" strokeWidth={3} />
          <path d="M-2,-192 L-2,-96 L-78,-96 Z" fill="#efe3c2" stroke="#cbbd97" strokeWidth={3} />
          <path d="M-92,-154 L-92,-92 L-34,-92 Z" fill="#f7f1dd" stroke="#cbbd97" strokeWidth={3} />
          <path d="M4,-196 L44,-186 L4,-176 Z" fill="#b3352c" />
          <path d="M-150,26 q25,-12 50,0 t50,0 t50,0 t50,0 t50,0 t50,0" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={5} strokeLinecap="round" />
        </>,
        `translate(0,${bob})`,
      );
    }
    case 'goldpile': {
      const spark = 0.7 + Math.sin(frame / 5 + prop.x) * 0.3;
      return g(
        <>
          <ellipse cx={-58} cy={-12} rx={62} ry={26} fill="#d9a83c" stroke="#9a741f" strokeWidth={3} />
          <ellipse cx={52} cy={-10} rx={56} ry={24} fill="#e3b84e" stroke="#9a741f" strokeWidth={3} />
          <ellipse cx={0} cy={-34} rx={52} ry={26} fill="#f0c95e" stroke="#9a741f" strokeWidth={3} />
          <circle cx={-30} cy={-30} r={9} fill="#ffe9a8" />
          <circle cx={28} cy={-44} r={7} fill="#ffe9a8" />
          <g stroke="#fff3c4" strokeWidth={4} strokeLinecap="round" opacity={spark}>
            <path d="M-84,-64 v22 M-95,-53 h22" />
            <path d="M76,-78 v20 M66,-68 h20" />
          </g>
        </>,
      );
    }
    case 'derrick':
      return g(
        <>
          <g stroke="#223140" strokeWidth={9} strokeLinecap="round">
            <path d="M-70,0 L-18,-300 M70,0 L18,-300 M-18,-300 L18,-300" fill="none" />
            <path d="M-52,-90 L52,-90 M-40,-170 L40,-170 M-30,-240 L30,-240" fill="none" strokeWidth={6} />
            <path d="M-52,-90 L40,-170 M52,-90 L-40,-170 M-40,-170 L30,-240 M40,-170 L-30,-240" fill="none" strokeWidth={4} />
          </g>
          <rect x={-30} y={-330} width={60} height={32} fill="#223140" />
          {/* pumpjack */}
          <g transform="translate(150,0)">
            <path d="M-44,0 L0,-84 L44,0 Z" fill="#223140" />
            <path d="M-6,-84 L96,-104 L104,-88 L2,-66 Z" fill="#223140" />
            <rect x={92} y={-96} width={20} height={58} fill="#223140" />
            <circle cx={0} cy={-84} r={10} fill="#3c5a74" />
          </g>
        </>,
      );
    case 'scroll':
      return g(
        <>
          <rect x={-104} y={-120} width={208} height={120} rx={10} fill="#f1e3bc" stroke="#a8894f" strokeWidth={4} />
          <ellipse cx={-104} cy={-60} rx={16} ry={60} fill="#e3d09e" stroke="#a8894f" strokeWidth={4} />
          <ellipse cx={104} cy={-60} rx={16} ry={60} fill="#e3d09e" stroke="#a8894f" strokeWidth={4} />
          <path d="M-70,-92 h140 M-70,-64 h140 M-70,-36 h86" stroke="#b09468" strokeWidth={6} strokeLinecap="round" />
          <circle cx={52} cy={-30} r={15} fill="#b3352c" stroke="#7e231d" strokeWidth={3} />
        </>,
      );
    case 'iceblock':
      return g(
        <>
          <rect x={-86} y={-160} width={172} height={160} rx={22} fill="rgba(174,220,238,0.85)" stroke="#7fb6cc" strokeWidth={5} />
          <path d="M-58,-128 L-18,-128 M-58,-96 L6,-96" stroke="rgba(255,255,255,0.8)" strokeWidth={8} strokeLinecap="round" />
          <path d="M28,-52 L58,-84" stroke="rgba(255,255,255,0.55)" strokeWidth={6} strokeLinecap="round" />
        </>,
      );
    case 'coin':
      return g(
        <>
          <circle cx={0} cy={-84} r={84} fill="#e8bc4a" stroke="#9a741f" strokeWidth={6} />
          <circle cx={0} cy={-84} r={66} fill="none" stroke="#c39a35" strokeWidth={4} />
          <text x={0} y={-62} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={64} fill="#7a5b12">
            {t || '2¢'}
          </text>
        </>,
      );
    default:
      return null;
  }
};

// Clamp helper re-exported for the kit's sign logic (kept local to avoid cycles).
export const soldProgress = (progress: number, flipAt: number): number =>
  clamp((progress - flipAt) / 0.22, 0, 1);
