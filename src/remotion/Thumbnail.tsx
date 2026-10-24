import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { B, J, ff, useFonts } from "./util";

// text uses *word* to mark highlighted words. variant 0/1/2 = different layout/colour for A/B tests.
export const Thumb: React.FC<any> = ({ brand, thumbnail: t = {}, variant = 0 }) => {
  useFonts(brand);
  const v = variant % 3;
  const left = v !== 1;
  const ch = brand.characters?.[t.character];
  const w = brand.watermark;
  return (
    <AbsoluteFill style={{ background: brand.colors.bg }}>
      {t.bg && (
        <Img
          src={J(t.bg)}
          style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1 + v * 0.1})`, filter: "brightness(.65) saturate(1.3)" }}
        />
      )}
      <AbsoluteFill style={{ background: `linear-gradient(${left ? 90 : 270}deg, #000c, #0000 70%)` }} />
      {ch && <Img src={B(ch.file)} style={{ position: "absolute", bottom: 0, height: "92%", [left ? "right" : "left"]: "2%" }} />}
      <div
        style={{
          position: "absolute", [left ? "left" : "right"]: "4%", top: "12%", width: "58%", textAlign: left ? "left" : "right",
          fontFamily: ff(brand.captions.font), fontWeight: 900, fontSize: "13vh", lineHeight: 1, textTransform: "uppercase",
          color: "#fff", WebkitTextStroke: "0.6vh #000", paintOrder: "stroke fill", textShadow: "0 1vh 2vh #000",
        }}
      >
        {String(t.text || "").split("*").map((s, i) => (
          <span key={i} style={{ color: i % 2 ? (v === 2 ? "#ff3b30" : brand.colors.primary) : "#fff" }}>{s}</span>
        ))}
      </div>
      {w?.enabled && w.file && (
        <Img src={B(w.file)} style={{ position: "absolute", left: `${w.x}%`, top: `${w.y}%`, width: `${w.w}%`, opacity: w.opacity }} />
      )}
    </AbsoluteFill>
  );
};
