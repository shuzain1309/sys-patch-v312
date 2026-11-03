// brand.tsx: channel branding drawn on every frame of every video. Layers come from public/brand.json (same format as the layer-editor template.json).
// x, y = layer centre as a fraction of the frame (clamped so the layer stays inside); w = layer width as a fraction of frame width; size = text height as a fraction of frame height.
// start / end are seconds (end 0 = until the last frame). Image layers read public/brand/<file>. Text fonts: a Google font name below, or a font file at public/fonts/<font>.ttf.
import React from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadCinzel} from '@remotion/google-fonts/Cinzel';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import brand from '../../public/brand.json';

type Layer = any;
const ssr = typeof window === 'undefined';
const GOOGLE: Record<string, () => string> = {
  cinzel: () => loadCinzel('normal', {weights: ['700'], subsets: ['latin']}).fontFamily,
  anton: () => loadAnton('normal', {weights: ['400'], subsets: ['latin']}).fontFamily,
  inter: () => loadInter('normal', {weights: ['700'], subsets: ['latin']}).fontFamily,
};
const FALLBACK = ssr ? 'serif' : GOOGLE.cinzel(); // classical look; used whenever the named font file is not in public/fonts/

const useLayerFont = (name: string) => {
  const key = (name || '').toLowerCase();
  const [family, setFamily] = React.useState<string>(() => (GOOGLE[key] && !ssr ? GOOGLE[key]() : FALLBACK));
  React.useEffect(() => {
    if (!key || GOOGLE[key]) return;
    const h = delayRender(`brand font ${key}`);
    new FontFace(key, `url(${staticFile(`fonts/${key}.ttf`)})`).load().then((f) => { document.fonts.add(f); setFamily(`'${key}', ${FALLBACK}`); }).catch(() => {}).finally(() => continueRender(h));
  }, [key]);
  return family;
};

const shadowCss = (s: any) => (s && s.on ? `${s.dx}px ${s.dy}px ${s.blur}px ${hexA(s.color, s.opacity)}` : 'none');
const hexA = (hex: string, a: number) => { const n = parseInt(hex.replace('#', ''), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

const LayerView: React.FC<{l: Layer; W: number; H: number}> = ({l, W, H}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const family = useLayerFont(l.type === 'text' ? l.font : '');
  const a = Math.round((l.start || 0) * fps), b = l.end ? Math.round(l.end * fps) : durationInFrames;
  if (f < a || f > b) return null;
  const fi = (l.fade_in || 0) * fps, fo = (l.fade_out || 0) * fps;
  let op = l.opacity ?? 1;
  if (fi > 0) op *= interpolate(f, [a, a + fi], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (fo > 0) op *= interpolate(f, [b - fo, b], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bw = (l.w ?? 0.2) * W;
  const sizePx = (l.size ?? 0.04) * H;
  const bh = l.type === 'text' ? sizePx * (l.line_spacing ?? 1.1) * String(l.text || '').split('\n').length : bw; // image height is unknown: only keeps the centre inside the frame
  const cx = Math.min(Math.max(l.x * W, bw / 2), W - bw / 2), cy = Math.min(Math.max(l.y * H, bh / 2), H - bh / 2);
  const box: React.CSSProperties = {position: 'absolute', left: cx - bw / 2, top: cy - bh / 2, width: bw, opacity: op, transform: `rotate(${l.rot || 0}deg)`};
  if (l.type === 'image') {
    if (!l.file) return null;
    return <Img src={staticFile(`brand/${l.file}`)} style={{...box, top: cy - bh / 2, height: 'auto', filter: l.shadow?.on ? `drop-shadow(${shadowCss(l.shadow)})` : undefined}} />;
  }
  return (
    <div style={{...box, height: bh, display: 'flex', alignItems: 'center', justifyContent: l.align === 'left' ? 'flex-start' : l.align === 'right' ? 'flex-end' : 'center', textAlign: l.align || 'center', fontFamily: family, fontSize: sizePx, lineHeight: l.line_spacing ?? 1.1, color: l.color || '#fff', textShadow: shadowCss(l.shadow), whiteSpace: 'pre', letterSpacing: sizePx * 0.12, WebkitTextStroke: l.outline?.on ? `${l.outline.width}px ${l.outline.color}` : undefined, paintOrder: 'stroke fill'} as any}>{l.text}</div>
  );
};

export const BrandLayers: React.FC = () => {
  const {width, height} = useVideoConfig();
  const layers: Layer[] = ((brand as any).layers || []).filter((l: Layer) => l.visible);
  if (!layers.length) return null;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>{layers.map((l) => <LayerView key={l.id} l={l} W={width} H={height} />)}</AbsoluteFill>;
};
