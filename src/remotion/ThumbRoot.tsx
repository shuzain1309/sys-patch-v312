// Entry for thumbnails only (src/remotion/thumb_index.ts). Separate from Root.tsx on purpose: Root imports the decrypted video script,
// which does not exist in the thumbnail jobs. Frame 45 of 60 is rendered: the map kit fades regions in, so frame 0 would hide them.
import React from 'react';
import {Composition} from 'remotion';
import {Thumb} from './Thumb';
export const ThumbRoot = () => <Composition id="Thumb" component={Thumb} durationInFrames={60} fps={30} width={1920} height={1080} defaultProps={{layout: 'P1', word: 'WORD'} as any} />;
