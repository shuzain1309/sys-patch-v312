import React from "react";
import { Composition, Still } from "remotion";
import { VideoComposition } from "./VideoComposition";
import { Thumb } from "./Thumbnail";

const DEF: any = {
  fps: 30, width: 1920, height: 1080, totalFrames: 30, scenes: [], thumbnail: {}, variant: 0,
  brand: { colors: { bg: "#000", primary: "#fff", text: "#fff" }, fonts: [], texts: [], captions: { enabled: false } },
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="Video"
      component={VideoComposition as any}
      durationInFrames={30}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={DEF}
      calculateMetadata={({ props }: any) => ({
        durationInFrames: props.totalFrames,
        fps: props.fps,
        width: props.width,
        height: props.height,
      })}
    />
    <Still id="Thumb" component={Thumb as any} width={1280} height={720} defaultProps={DEF} />
  </>
);
