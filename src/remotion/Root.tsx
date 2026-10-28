import React from 'react';
import {Composition} from 'remotion';
import {Video, total, fps} from './current_script';
export const Root: React.FC = () => <Composition id="Main" component={Video} durationInFrames={total} fps={fps} width={1920} height={1080} />;
