// shorts_entry.ts — standalone Remotion entry for the shorts lane.
// The render-short workflow renders THIS entry file; the longform entry/root
// is never referenced. Deleting src/shorts/ removes this lane completely.

import {registerRoot} from 'remotion';
import {ShortsRoot} from './shorts_root';

registerRoot(ShortsRoot);
