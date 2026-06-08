/**
 * Renders a thumbnail PNG and writes the publishing metadata JSON for a spec.
 *
 *   npm run thumbnail          # the 3 times table
 *   npm run thumbnail -- 7
 *   npm run thumbnail -- mixed
 *
 * Outputs out/<id>.thumbnail.png and out/<id>.metadata.json.
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildMetadata } from './engine/metadata';
import { OUT_DIR, bundleProject, renderThumbnail } from './pipeline/render';
import { specFromArg } from './pipeline/specFromArg';

const spec = specFromArg(process.argv[2]);

console.log('Bundling Remotion project…');
const serveUrl = await bundleProject();

const pngPath = await renderThumbnail(serveUrl, spec);
const metadata = buildMetadata(spec);
const metaPath = path.join(OUT_DIR, `${spec.id}.metadata.json`);
await writeFile(metaPath, `${JSON.stringify(metadata, null, 2)}\n`);

console.log(`✅ Thumbnail → ${pngPath}`);
console.log(`✅ Metadata  → ${metaPath}`);
console.log(`\nTitle: ${metadata.title}\nTags:  ${metadata.tags.length} tags`);
