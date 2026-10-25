import {Composition} from 'remotion';
import {Video, total, fps} from './current_script';
export const Root = () => <Composition id="Main" component={Video} durationInFrames={total} fps={fps} width={1920} height={1080} />;
