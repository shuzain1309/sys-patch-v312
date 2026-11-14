// shorts_actors.tsx — chibi figurines for the shorts lane: round heads, dot eyes,
// era dress from simple look definitions, gag faces. Original code for this lane;
// the longform stickman rig (world.tsx) is NOT used or imported.

import React from 'react';
import type {ShortActor, ShortLook} from './shorts_types';
import {popScale} from './shorts_util';

const FaceDraw: React.FC<{face: ShortActor['face']}> = ({face}) => {
  switch (face) {
    case 'smug':
      return (
        <>
          <path d="M-34,-268 h24 M10,-268 h24" stroke="#26221e" strokeWidth={5} strokeLinecap="round" />
          <path d="M-36,-292 q12,-7 24,-2 M12,-294 q12,-5 24,2" fill="none" stroke="#26221e" strokeWidth={4} strokeLinecap="round" />
          <path d="M-6,-228 q16,8 30,-2" fill="none" stroke="#26221e" strokeWidth={5} strokeLinecap="round" />
        </>
      );
    case 'shock':
      return (
        <>
          <circle cx={-22} cy={-262} r={11} fill="#fff" stroke="#26221e" strokeWidth={3} />
          <circle cx={22} cy={-262} r={11} fill="#fff" stroke="#26221e" strokeWidth={3} />
          <circle cx={-22} cy={-262} r={4.5} fill="#26221e" />
          <circle cx={22} cy={-262} r={4.5} fill="#26221e" />
          <path d="M-38,-292 q14,-9 28,-3 M10,-295 q14,-6 28,3" fill="none" stroke="#26221e" strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={0} cy={-226} rx={10} ry={13} fill="#7a3b2e" stroke="#26221e" strokeWidth={3} />
        </>
      );
    case 'laugh':
      return (
        <>
          <path d="M-36,-258 q12,-12 24,0 M12,-258 q12,-12 24,0" fill="none" stroke="#26221e" strokeWidth={5} strokeLinecap="round" />
          <path d="M-18,-238 q18,20 36,0 q-4,18 -18,18 q-14,0 -18,-18" fill="#7a3b2e" stroke="#26221e" strokeWidth={3} />
        </>
      );
    case 'stern':
      return (
        <>
          <circle cx={-22} cy={-258} r={5} fill="#26221e" />
          <circle cx={22} cy={-258} r={5} fill="#26221e" />
          <path d="M-38,-282 l30,8 M38,-282 l-30,8" stroke="#26221e" strokeWidth={5} strokeLinecap="round" />
          <path d="M-14,-226 h28" stroke="#26221e" strokeWidth={5} strokeLinecap="round" />
        </>
      );
    case 'sad':
      return (
        <>
          <circle cx={-22} cy={-258} r={5} fill="#26221e" />
          <circle cx={22} cy={-258} r={5} fill="#26221e" />
          <path d="M-38,-284 q14,-6 28,2 M10,-282 q14,-8 28,-2" fill="none" stroke="#26221e" strokeWidth={4} strokeLinecap="round" />
          <path d="M-14,-222 q14,-10 28,0" fill="none" stroke="#26221e" strokeWidth={5} strokeLinecap="round" />
        </>
      );
    default: // neutral
      return (
        <>
          <circle cx={-22} cy={-260} r={5.5} fill="#26221e" />
          <circle cx={22} cy={-260} r={5.5} fill="#26221e" />
          <path d="M-12,-230 q12,9 24,0" fill="none" stroke="#26221e" strokeWidth={5} strokeLinecap="round" />
        </>
      );
  }
};

const HatDraw: React.FC<{look: ShortLook}> = ({look}) => {
  const trim = look.trim ?? '#c8a24a';
  switch (look.hat) {
    case 'crown':
      return (
        <g>
          <path d="M-46,-318 L-46,-356 L-24,-334 L0,-362 L24,-334 L46,-356 L46,-318 Z" fill="#e8bc4a" stroke="#9a741f" strokeWidth={3} strokeLinejoin="round" />
          <rect x={-46} y={-320} width={92} height={10} fill="#c39a35" />
        </g>
      );
    case 'ushanka':
      return (
        <g>
          <path d="M-58,-272 a58,52 0 0 1 116,0 l0,10 -116,0 Z" fill={look.coat} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
          <rect x={-58} y={-276} width={20} height={44} rx={8} fill={look.coat} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
          <rect x={38} y={-276} width={20} height={44} rx={8} fill={look.coat} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
          <rect x={-58} y={-282} width={116} height={14} fill={trim} opacity={0.85} />
        </g>
      );
    case 'tophat':
      return (
        <g fill="#23242c">
          <rect x={-34} y={-392} width={68} height={86} rx={6} />
          <ellipse cx={0} cy={-306} rx={62} ry={11} />
          <rect x={-34} y={-330} width={68} height={14} fill={trim} />
        </g>
      );
    case 'bowler':
      return (
        <g fill="#2c2c30">
          <path d="M-46,-306 a46,34 0 0 1 92,0 Z" />
          <ellipse cx={0} cy={-305} rx={64} ry={10} />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M-52,-300 a52,30 0 0 1 104,0 Z" fill={look.coat} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
          <path d="M-52,-300 q52,16 104,0 l10,12 q-62,14 -124,0 Z" fill={trim} />
        </g>
      );
    default:
      return look.hair ? (
        <path d="M-56,-268 a56,52 0 0 1 112,0 l0,-14 a56,40 0 0 0 -112,0 Z" fill={look.hair} transform="translate(0,-6)" />
      ) : null;
  }
};

export interface ShortActorDrawProps {
  actor: ShortActor;
  look: ShortLook;
  progress: number; // scene progress 0..1
  frame: number;
}

// One chibi figurine. Local drawing space: origin at the feet, ~400 units tall
// at s = 1. The kit positions it with x/y in stage coords.
export const ShortActorDraw: React.FC<ShortActorDrawProps> = ({actor, look, progress, frame}) => {
  const pop = popScale(progress, actor.at ?? 0);
  if (pop <= 0) return null;
  const s = (actor.s ?? 1) * pop;
  const bob = Math.sin(frame / 9 + actor.x) * 4;
  const skin = look.skin ?? '#f2c79b';
  const pose = actor.pose ?? 'idle';
  const armStroke = {stroke: look.coat, strokeWidth: 17, strokeLinecap: 'round' as const, fill: 'none'};
  return (
    <g transform={`translate(${actor.x},${actor.y + bob}) scale(${actor.flip ? -s : s},${s})`}>
      {/* legs + boots */}
      <path d="M-24,-52 L-26,-8 M24,-52 L26,-8" stroke="#3a3f4a" strokeWidth={15} strokeLinecap="round" />
      <path d="M-40,-6 h30 M12,-6 h30" stroke="#26221e" strokeWidth={11} strokeLinecap="round" />
      {/* arms by pose */}
      {pose === 'point' && <path d="M44,-168 L104,-196" {...armStroke} />}
      {pose === 'point' && <path d="M-44,-168 L-58,-104" {...armStroke} />}
      {pose === 'shrug' && <path d="M-44,-168 L-88,-206 M44,-168 L88,-206" {...armStroke} />}
      {pose === 'wave' && <path d="M44,-168 L84,-238" {...armStroke} />}
      {pose === 'wave' && <path d="M-44,-168 L-58,-104" {...armStroke} />}
      {pose === 'idle' && <path d="M-44,-168 L-58,-100 M44,-168 L58,-100" {...armStroke} />}
      {/* coat */}
      <path
        d="M-52,-196 Q0,-214 52,-196 L64,-44 Q0,-28 -64,-44 Z"
        fill={look.coat}
        stroke="rgba(0,0,0,0.28)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {look.trim && <path d="M-40,-200 L52,-72 L52,-44 L12,-44 L-52,-178 Z" fill={look.trim} opacity={0.55} />}
      <circle cx={0} cy={-160} r={6} fill={look.trim ?? '#c8a24a'} />
      <circle cx={0} cy={-122} r={6} fill={look.trim ?? '#c8a24a'} />
      {/* head */}
      <circle cx={0} cy={-256} r={60} fill={skin} stroke="rgba(0,0,0,0.18)" strokeWidth={3} />
      <HatDraw look={look} />
      <FaceDraw face={actor.face ?? 'neutral'} />
    </g>
  );
};
