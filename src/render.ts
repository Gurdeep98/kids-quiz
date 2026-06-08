/**
 * Renders a VideoSpec to an MP4.
 *
 *   npm run render            # the 3 times table
 *   npm run render -- 7       # the 7 times table
 *   npm run render -- mixed   # a mixed speed quiz
 */

import { bundleProject, renderVideo } from './pipeline/render';
import { specFromArg } from './pipeline/specFromArg';

const spec = specFromArg(process.argv[2]);

console.log('Bundling Remotion project…');
const serveUrl = await bundleProject();

console.log(`Rendering "${spec.title}"…`);
const output = await renderVideo(serveUrl, spec, (p) =>
  process.stdout.write(`\r  ${(p * 100).toFixed(0)}%   `),
);

console.log(`\n✅ Done: ${output}`);
