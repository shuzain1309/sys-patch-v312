// shorts_kit.tsx — the shorts composition engine: scene sequencing, the vertical
// stage (1080 x 1920), map/stage/card/end scene rendering, year badge, captions.
// STANDALONE: imports only 'remotion', 'react' and sibling shorts_* files.
// It never imports the longform kit/world/geo — longform renders cannot be
// affected by this file, and deleting src/shorts/ removes the lane entirely.

import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import type {ShortScene, ShortScriptData} from './shorts_types';
import {clamp, easeInOut, lerp, sRand} from './shorts_util';
import {ShortsMap} from './shorts_map';
import {ShortActorDraw} from './shorts_actors';
import {ShortPropDraw} from './shorts_props';
import {ShortCaptions, sceneSecondsFor} from './shorts_captions';

export const SHORTS_FPS = 30;
export const SHORTS_W = 1080;
export const SHORTS_H = 1920;

export interface SceneRange {
  id: string;
  from: number;
  dur: number;
}

export const computeSceneRanges = (
  data: ShortScriptData,
  fps: number = SHORTS_FPS,
): {ranges: SceneRange[]; total: number} => {
  const ranges: SceneRange[] = [];
  let cursor = 0;
  for (const scene of data.scenes) {
    const text = data.lines[scene.id] ?? '';
    const dur = Math.max(1, Math.round(sceneSecondsFor(text, scene.id) * fps));
    ranges.push({id: scene.id, from: cursor, dur});
    cursor += dur;
  }
  return {ranges, total: cursor};
};

// Alaska's fill state carried across scenes: a scene may set alaskaOwner
// (static), or soldAt (animate to USA inside the scene).
const fillAt = (data: ShortScriptData, sceneIndex: number, scene: ShortScene, progress: number): number => {
  let cur = 0;
  for (let i = 0; i < sceneIndex; i++) {
    const s = data.scenes[i];
    if (s.soldAt !== undefined) cur = 1;
    else if (s.alaskaOwner !== undefined) cur = s.alaskaOwner;
  }
  if (scene.soldAt !== undefined) {
    const t = easeInOut(clamp((progress - scene.soldAt) / 0.22, 0, 1));
    return lerp(cur, 1, t);
  }
  return scene.alaskaOwner !== undefined ? scene.alaskaOwner : cur;
};

const STAGE_BG: Record<string, string> = {
  night: '#16222e',
  teal: '#1d4e54',
  paper: '#e8dcc0',
  dawn: '#2c3e57',
};

const StageBackdrop: React.FC<{bg: string; sceneId: string}> = ({bg, sceneId}) => {
  const stars = React.useMemo(() => {
    const rnd = sRand(`stars-${sceneId}`);
    return Array.from({length: 46}, () => ({x: rnd() * 1080, y: rnd() * 1050, r: 1.4 + rnd() * 2.2, o: 0.25 + rnd() * 0.6}));
  }, [sceneId]);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id={`shortsDawn-${sceneId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c3e57" />
          <stop offset="72%" stopColor="#7a5a43" />
          <stop offset="100%" stopColor="#c98a4b" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill={bg === 'dawn' ? `url(#shortsDawn-${sceneId})` : STAGE_BG[bg] ?? STAGE_BG.night} />
      {(bg === 'night' || bg === 'dawn') &&
        stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} />)}
      <rect x={0} y={1470} width={1080} height={450} fill="rgba(0,0,0,0.18)" />
      <rect x={0} y={1470} width={1080} height={6} fill="rgba(255,255,255,0.14)" />
    </svg>
  );
};

// Actors + props + free texts share one overlay SVG in stage coords.
const Overlay: React.FC<{scene: ShortScene; data: ShortScriptData; progress: number; frame: number}> = ({
  scene,
  data,
  progress,
  frame,
}) => {
  const has =
    (scene.actors && scene.actors.length) || (scene.props && scene.props.length) || (scene.texts && scene.texts.length);
  if (!has) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {(scene.props ?? []).map((p, i) => (
        <ShortPropDraw key={`pr${i}`} prop={p} progress={progress} frame={frame} />
      ))}
      {(scene.actors ?? []).map((a, i) => {
        const look = data.looks[a.look];
        if (!look) return null;
        return <ShortActorDraw key={`ac${i}`} actor={a} look={look} progress={progress} frame={frame} />;
      })}
      {(scene.texts ?? []).map((tx, i) => {
        const on = clamp((progress - (tx.at ?? 0)) / 0.05, 0, 1);
        if (on <= 0) return null;
        return (
          <text
            key={`tx${i}`}
            x={tx.x}
            y={tx.y}
            textAnchor="middle"
            fontFamily={tx.serif === false ? 'Arial, Helvetica, sans-serif' : "Georgia, 'Times New Roman', serif"}
            fontWeight={700}
            fontSize={tx.size ?? 64}
            fill={tx.color ?? '#ffffff'}
            opacity={on}
            style={{textShadow: '0 3px 8px rgba(0,0,0,0.5)'}}
          >
            {tx.t}
          </text>
        );
      })}
    </svg>
  );
};

const YearBadge: React.FC<{year: string}> = ({year}) => (
  <div
    style={{
      position: 'absolute',
      top: 58,
      left: 44,
      padding: '10px 26px 12px',
      borderRadius: 14,
      background: 'rgba(10,22,28,0.82)',
      border: '3px solid #ffd94a',
      color: '#ffe9a8',
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontWeight: 700,
      fontSize: 44,
      letterSpacing: 2,
    }}
  >
    {year}
  </div>
);

const CardView: React.FC<{scene: ShortScene; end?: boolean}> = ({scene, end}) => (
  <AbsoluteFill style={{background: end ? '#0d1b21' : '#123a40', justifyContent: 'center', alignItems: 'center'}}>
    {end && (
      <div
        style={{
          border: '4px solid #ffd94a',
          borderRadius: 26,
          padding: '54px 60px',
          margin: '0 70px',
          textAlign: 'center',
          background: 'rgba(255,217,74,0.06)',
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            fontSize: 74,
            lineHeight: 1.15,
            color: '#ffffff',
          }}
        >
          {scene.cardText}
        </div>
        {scene.cardSub && (
          <div style={{marginTop: 30, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 40, color: '#ffd94a'}}>
            {scene.cardSub}
          </div>
        )}
      </div>
    )}
    {!end && (
      <>
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            fontSize: 190,
            color: '#ffffff',
            letterSpacing: 4,
            textShadow: '0 8px 30px rgba(0,0,0,0.5)',
          }}
        >
          {scene.cardText}
        </div>
        {scene.cardSub && (
          <div
            style={{
              marginTop: 18,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 54,
              color: '#ffd94a',
              letterSpacing: 3,
            }}
          >
            {scene.cardSub}
          </div>
        )}
      </>
    )}
  </AbsoluteFill>
);

const SceneView: React.FC<{scene: ShortScene; data: ShortScriptData; index: number; durFrames: number}> = ({
  scene,
  data,
  index,
  durFrames,
}) => {
  const frame = useCurrentFrame();
  const progress = clamp(frame / Math.max(1, durFrames), 0, 1);
  const text = data.lines[scene.id] ?? '';
  return (
    <AbsoluteFill style={{background: '#123a40'}}>
      {scene.kind === 'map' && scene.cam && (
        <ShortsMap
          camFrom={scene.cam.from}
          camTo={scene.cam.to}
          progress={progress}
          frame={frame}
          alaskaFill={fillAt(data, index, scene, progress)}
          ellipse={scene.ellipse}
          arrow={scene.arrow}
          pins={scene.pins}
          showLabels={scene.showLabels}
        />
      )}
      {scene.kind === 'stage' && <StageBackdrop bg={scene.bg ?? 'night'} sceneId={scene.id} />}
      {(scene.kind === 'map' || scene.kind === 'stage') && (
        <Overlay scene={scene} data={data} progress={progress} frame={frame} />
      )}
      {scene.kind === 'card' && <CardView scene={scene} />}
      {scene.kind === 'end' && <CardView scene={scene} end />}
      {scene.year && (scene.kind === 'map' || scene.kind === 'stage') && <YearBadge year={scene.year} />}
      <ShortCaptions text={text} frame={frame} durationFrames={durFrames} />
    </AbsoluteFill>
  );
};

export const ShortVideo: React.FC<{data: ShortScriptData}> = ({data}) => {
  const {fps} = useVideoConfig();
  const {ranges} = computeSceneRanges(data, fps);
  return (
    <AbsoluteFill style={{background: '#0d1b21'}}>
      {data.scenes.map((scene, i) => (
        <Sequence key={scene.id} from={ranges[i].from} durationInFrames={ranges[i].dur} premountFor={fps}>
          <SceneView scene={scene} data={data} index={i} durFrames={ranges[i].dur} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// Convenience for script files: build the component + registration numbers.
export const makeShort = (data: ShortScriptData) => {
  const {total} = computeSceneRanges(data, SHORTS_FPS);
  const Component: React.FC = () => <ShortVideo data={data} />;
  return {Component, totalFrames: total, fps: SHORTS_FPS, width: SHORTS_W, height: SHORTS_H};
};
