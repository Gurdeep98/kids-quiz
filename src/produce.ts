/**
 * The one-shot publishing pipeline: schedule → render video → render thumbnail
 * + metadata → upload to YouTube.
 *
 *   npm run produce -- --dry-run            # render everything, skip the upload
 *   npm run produce                         # today's scheduled video (private)
 *   npm run produce -- --visibility=unlisted
 *   npm run produce -- --date=2026-03-01    # the video scheduled for a date
 *   npm run produce -- 7                     # force a specific table (ignores schedule)
 */

import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildMetadata } from './engine/metadata';
import { OUT_DIR, bundleProject, renderThumbnail, renderVideo } from './pipeline/render';
import { specFromArg } from './pipeline/specFromArg';
import { videoForDate } from './schedule';
import { type Visibility, uploadVideo } from './youtube/upload';

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const visibility = (flag(argv, '--visibility') ?? 'private') as Visibility;
const dateFlag = flag(argv, '--date');
const positional = argv.find((a) => !a.startsWith('--'));

// A positional table arg overrides the schedule; otherwise use the calendar.
const spec = positional
  ? specFromArg(positional)
  : videoForDate(dateFlag ? new Date(dateFlag) : new Date()).spec;

console.log(`▶ Producing "${spec.title}"`);
console.log(`  visibility=${visibility}${dryRun ? '  (DRY RUN — no upload)' : ''}\n`);

const serveUrl = await bundleProject();

const videoPath = await renderVideo(serveUrl, spec, (p) =>
  process.stdout.write(`\r  rendering video… ${(p * 100).toFixed(0)}%   `),
);
process.stdout.write('\n');

const thumbnailPath = await renderThumbnail(serveUrl, spec);
const metadata = buildMetadata(spec);
const metaPath = path.join(OUT_DIR, `${spec.id}.metadata.json`);
await writeFile(metaPath, `${JSON.stringify(metadata, null, 2)}\n`);

console.log(`  ✓ video:     ${videoPath}`);
console.log(`  ✓ thumbnail: ${thumbnailPath}`);
console.log(`  ✓ metadata:  ${metaPath}`);

if (dryRun) {
  console.log('\n🟡 Dry run complete — everything above is ready to publish. Skipping upload.');
} else {
  console.log('\n⬆ Uploading to YouTube…');
  const { url, thumbnailSet } = await uploadVideo({ videoPath, thumbnailPath, metadata, visibility });
  console.log(`\n✅ Published (${visibility}): ${url}`);
  console.log(`   Custom thumbnail: ${thumbnailSet ? 'set' : 'skipped (channel not verified — using auto thumbnail)'}`);
}

/** Reads `--name value` or `--name=value` from argv. */
function flag(args: string[], name: string): string | undefined {
  const withEquals = args.find((a) => a.startsWith(`${name}=`));
  if (withEquals) return withEquals.slice(name.length + 1);
  const i = args.indexOf(name);
  if (i >= 0) {
    const next = args[i + 1];
    if (next && !next.startsWith('--')) return next;
  }
  return undefined;
}
