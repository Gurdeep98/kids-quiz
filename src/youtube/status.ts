/**
 * Lists your channel's most recent uploads (including private ones), so you can
 * confirm what the pipeline has published. Run `npm run status`.
 */

import 'dotenv/config';
import { makeYouTube } from './client';

const youtube = makeYouTube();
const res = await youtube.search.list({
  part: ['snippet'],
  forMine: true,
  type: ['video'],
  order: 'date',
  maxResults: 5,
});

const items = res.data.items ?? [];
if (items.length === 0) {
  console.log('No videos found on the channel yet.');
} else {
  console.log(`Recent uploads (${items.length}):`);
  for (const item of items) {
    console.log(`  • ${item.snippet?.title}`);
    console.log(`    https://youtu.be/${item.id?.videoId}`);
  }
}
