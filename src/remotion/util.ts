import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

export const J = (p: string) => staticFile("job/" + p);
export const B = (p: string) => staticFile("job/brand/" + p);
export const ff = (f: string) => `"${f}", sans-serif`;

// loads user-uploaded fonts from brand/config.json before any frame renders
export const useFonts = (brand: any) => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(
      (brand.fonts || []).map((f: any) =>
        new FontFace(f.family, `url(${B(f.file)})`).load().then((x) => document.fonts.add(x))
      )
    )
      .catch(() => {})
      .finally(() => continueRender(h));
  }, []);
};
