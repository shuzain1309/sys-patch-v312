// shorts_root.tsx — the shorts lane's OWN Remotion root. It registers ONLY
// shorts compositions. The longform Root (src/remotion/Root.tsx) is a different
// file and is never touched: the two lanes share a repo, not an entry point.

import React from 'react';
import {Composition} from 'remotion';
import {AlaskaShortVideo, ALASKA_FPS, ALASKA_TOTAL_FRAMES} from './alaska_short';
import {SHORTS_H, SHORTS_W} from './shorts_kit';

export const ShortsRoot: React.FC = () => (
  <>
    <Composition
      id="AlaskaShort"
      component={AlaskaShortVideo}
      durationInFrames={ALASKA_TOTAL_FRAMES}
      fps={ALASKA_FPS}
      width={SHORTS_W}
      height={SHORTS_H}
    />
  </>
);
