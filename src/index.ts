/** Remotion entry point. `remotion studio`/`render` load this and read the registered root. */

import { registerRoot } from 'remotion';
import { RemotionRoot } from './remotion/Root';

registerRoot(RemotionRoot);
