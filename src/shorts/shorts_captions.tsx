// shorts_captions.tsx — burned-in, word-timed captions (native Shorts grammar;
// the longform lane forbids in-picture captions, this lane REQUIRES them).
//
// TIMING MODEL (single source of truth — shorts_extract.mjs duplicates these
// constants for the workflow's audio step; change them together):
//   PRIMARY (pilot): scene seconds = MEASURED voice seconds + SCENE_PAD_S,
//     from shorts_timing_data.ts — the pilot ships pre-generated narration
//     (audio/narration/*.mp3) and the picture is timed to the real voice.
//   FALLBACK (no measured entry for the scene): the word-count estimate
//     scene seconds = words / PACE_WPM * 60 + SCENE_PAD_S, min MIN_SCENE_S.
//     PACE_WPM 175 is the measured effective pace of the house TTS across the
//     Korea (7,220 words -> 41:19) and Iran (6,838 words -> 38:18) renders.
// Word timings inside a scene are proportional to word length (chars + 1),
// grouped 2-5 words per caption card, current word highlighted gold; the
// group boundaries scale with the (measured) scene duration, so captions
// track the shipped voice.

import React from 'react';
import {clamp, wordsOf} from './shorts_util';
import {MEASURED_VOICE_SECONDS} from './shorts_timing_data';

export const PACE_WPM = 175;
export const SCENE_PAD_S = 0.4;
export const MIN_SCENE_S = 1.1;

export const sceneSecondsFor = (text: string, sceneId?: string): number => {
  const measured = sceneId ? MEASURED_VOICE_SECONDS[sceneId] : undefined;
  if (measured !== undefined) {
    return Math.max(MIN_SCENE_S, measured + SCENE_PAD_S);
  }
  const words = wordsOf(text).length;
  return Math.max(MIN_SCENE_S, (words / PACE_WPM) * 60 + SCENE_PAD_S);
};

export interface CaptionGroup {
  words: string[];
  startW: number; // cumulative weight at group start
  endW: number; // cumulative weight at group end
}

const weight = (w: string): number => w.length + 1;

export const buildCaptionGroups = (text: string): {groups: CaptionGroup[]; totalW: number} => {
  const words = wordsOf(text);
  const totalW = words.reduce((a, w) => a + weight(w), 0);
  const groups: CaptionGroup[] = [];
  let cur: string[] = [];
  let curChars = 0;
  let acc = 0;
  const flush = () => {
    if (!cur.length) return;
    const gw = cur.reduce((a, w) => a + weight(w), 0);
    groups.push({words: cur, startW: acc, endW: acc + gw});
    acc += gw;
    cur = [];
    curChars = 0;
  };
  for (const w of words) {
    cur.push(w);
    curChars += w.length + 1;
    if ((cur.length >= 3 && curChars >= 11) || cur.length >= 5 || curChars >= 21) flush();
  }
  flush();
  // Never leave a 1-word orphan group at the end: fold it into the previous
  // group so every card carries 2-5 words.
  if (groups.length > 1 && groups[groups.length - 1].words.length === 1) {
    const orphan = groups.pop() as CaptionGroup;
    const prev = groups[groups.length - 1];
    prev.words = [...prev.words, ...orphan.words];
    prev.endW = orphan.endW;
  }
  return {groups, totalW};
};

export interface ShortCaptionsProps {
  text: string;
  frame: number; // local frame inside the scene
  durationFrames: number;
}

export const ShortCaptions: React.FC<ShortCaptionsProps> = ({text, frame, durationFrames}) => {
  const {groups, totalW} = buildCaptionGroups(text);
  if (!groups.length || totalW === 0) return null;
  const frac = clamp(frame / Math.max(1, durationFrames), 0, 1);
  const atW = frac * totalW;
  const gi = groups.findIndex((g) => atW >= g.startW && atW < g.endW);
  const group = groups[gi === -1 ? groups.length - 1 : gi];
  // word-level highlight inside the group
  let wAcc = group.startW;
  const spans = group.words.map((w) => {
    const start = wAcc;
    wAcc += weight(w);
    return {w, active: atW >= start && atW < wAcc, done: atW >= wAcc};
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 296,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: 920,
          textAlign: 'center',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontWeight: 800,
          fontSize: 56,
          lineHeight: 1.18,
          letterSpacing: 0.2,
        }}
      >
        {spans.map((s, i) => (
          <span
            key={i}
            style={{
              color: s.active ? '#ffd94a' : '#ffffff',
              textShadow:
                '0 3px 0 rgba(0,0,0,0.55), 0 0 14px rgba(0,0,0,0.45), 2px 0 0 rgba(0,0,0,0.35), -2px 0 0 rgba(0,0,0,0.35)',
            }}
          >
            {s.w}
            {i < spans.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};
