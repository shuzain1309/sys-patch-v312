import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { B, J, ff, useFonts } from "./util";

// All brand positions/sizes are percentages -> identical to the dashboard editor preview.
// size = font size in % of frame height (vh), x/y = top-left in % of frame, w = % of frame width.

const Bg: React.FC<{ s: any; brand: any }> = ({ s, brand }) => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig(); // inside Sequence = scene length
  const v = s.visual;
  if (v.type === "image" && v.file) {
    const t = f / d;
    const scale = 1 + 0.12 * (v.motion === "zoom-out" ? 1 - t : t);
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img src={J(v.file)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
      </AbsoluteFill>
    );
  }
  if (v.type === "video" && v.file)
    return <OffthreadVideo src={J(v.file)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${brand.colors.bg}, ${brand.colors.primary}44)`,
        justifyContent: "center", alignItems: "center",
      }}
    >
      {v.text && (
        <div style={{ color: brand.colors.text, fontFamily: ff(brand.captions.font), fontSize: "9vh", fontWeight: 800, textAlign: "center", padding: "0 10%" }}>
          {v.text}
        </div>
      )}
    </AbsoluteFill>
  );
};

const Char: React.FC<{ ch: any; brand: any }> = ({ ch, brand }) => {
  const c = brand.characters?.[ch.name];
  if (!c) return null;
  const x = ch.pos === "left" ? 2 : ch.pos === "center" ? (100 - c.w) / 2 : 98 - c.w;
  return <Img src={B(c.file)} style={{ position: "absolute", bottom: 0, left: `${x}%`, width: `${c.w}%` }} />;
};

const Pop: React.FC<{ text: string; brand: any }> = ({ text, brand }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const sc = interpolate(f, [0, 8], [0.85, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute", left: "8%", right: "8%", top: "30%", textAlign: "center", opacity: o, transform: `scale(${sc})`,
        fontFamily: ff(brand.captions.font), fontWeight: 900, fontSize: "11vh", lineHeight: 1.05, textTransform: "uppercase",
        color: brand.colors.primary, WebkitTextStroke: "0.5vh #000", paintOrder: "stroke fill",
      }}
    >
      {text}
    </div>
  );
};

const Flash: React.FC = () => {
  const f = useCurrentFrame(); // pattern interrupt on "reset" beats
  return <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 6], [0.45, 0], { extrapolateRight: "clamp" }) }} />;
};

const Caps: React.FC<{ words: any[]; c: any }> = ({ words, c }) => {
  const f = useCurrentFrame();
  if (!c.enabled || !words.length) return null;
  let i = words.findIndex((w) => f < w.to);
  if (i < 0) i = words.length - 1;
  const g = Math.floor(i / c.maxWords) * c.maxWords;
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: `${c.y}%`, textAlign: "center", fontFamily: ff(c.font), fontWeight: 800,
        fontSize: `${c.size}vh`, color: c.color, textShadow: "0 0.4vh 1.2vh #000", textTransform: "uppercase",
      }}
    >
      {words.slice(g, g + c.maxWords).map((w, k) => (
        <span key={k} style={{ color: g + k === i ? c.highlight : c.color, marginRight: "0.3em" }}>{w.text}</span>
      ))}
    </div>
  );
};

const BrandLayer: React.FC<{ brand: any }> = ({ brand }) => {
  const w = brand.watermark;
  return (
    <AbsoluteFill>
      {w?.enabled && w.file && (
        <Img src={B(w.file)} style={{ position: "absolute", left: `${w.x}%`, top: `${w.y}%`, width: `${w.w}%`, opacity: w.opacity }} />
      )}
      {(brand.texts || []).map((t: any) => (
        <div
          key={t.id}
          style={{
            position: "absolute", left: `${t.x}%`, top: `${t.y}%`, fontFamily: ff(t.font), fontSize: `${t.size}vh`,
            fontWeight: t.weight, color: t.color, opacity: t.opacity, whiteSpace: "pre", lineHeight: 1.1,
            textShadow: t.shadow ? "0 0.3vh 0.9vh rgba(0,0,0,.7)" : "none",
          }}
        >
          {t.text}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ s: any; brand: any }> = ({ s, brand }) => (
  <AbsoluteFill>
    <Bg s={s} brand={brand} />
    {s.character && <Char ch={s.character} brand={brand} />}
    {s.overlay_text && s.visual.type !== "card" && <Pop text={s.overlay_text} brand={brand} />}
    {s.beat === "reset" && <Flash />}
    <Caps words={s.words} c={brand.captions} />
  </AbsoluteFill>
);

export const VideoComposition: React.FC<any> = ({ scenes, brand }) => {
  useFonts(brand);
  return (
    <AbsoluteFill style={{ background: brand.colors.bg }}>
      {scenes.map((s: any) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur}>
          <SceneView s={s} brand={brand} />
        </Sequence>
      ))}
      <BrandLayer brand={brand} />
    </AbsoluteFill>
  );
};
