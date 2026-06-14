/**
 * Renders a VideoSpec to an MP4 (with voiceover, unless --silent).
 *
 *   npm run render            # the 3 times table
 *   npm run render -- 7       # the 7 times table
 *   npm run render -- mixed   # a mixed speed quiz
 *   npm run render -- 7 --silent   # no narration
 */

import 'dotenv/config';
import { bundleProject, renderVideo } from './pipeline/render';
import { specFromArg } from './pipeline/specFromArg';
import { prepareNarration } from './tts/prepare';

const argv = process.argv.slice(2);
const silent = argv.includes('--silent') || process.env.VOICE === 'off';
const positional = argv.find((a) => !a.startsWith('--'));

let spec = specFromArg(positional);

// Synthesize narration BEFORE bundling — the bundler snapshots public/ at bundle time.
if (!silent) {
  spec = await prepareNarration(spec);
}

console.log('Bundling Remotion project…');
const serveUrl = await bundleProject();

console.log(`Rendering "${spec.title}"…`);
const output = await renderVideo(serveUrl, spec, (p) =>
  process.stdout.write(`\r  ${(p * 100).toFixed(0)}%   `),
);

console.log(`\n✅ Done: ${output}`);
