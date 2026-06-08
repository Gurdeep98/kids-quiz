/** Config for the Remotion CLI / studio (the programmatic render in src/render.ts sets its own options). */

import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
