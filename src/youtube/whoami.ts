/**
 * Sanity check: confirms the credentials in .env work and prints which channel
 * they're connected to. Run `npm run whoami` before your first upload to be sure
 * you're pointed at the right channel.
 */

import 'dotenv/config';
import { makeYouTube } from './client';

const youtube = makeYouTube();
const res = await youtube.channels.list({ part: ['snippet', 'statistics'], mine: true });

const channel = res.data.items?.[0];
if (!channel) {
  console.error('❌ Authenticated, but no channel found for this account.');
  process.exit(1);
}

console.log(`✅ Connected to: ${channel.snippet?.title}`);
console.log(`   Channel ID:   ${channel.id}`);
console.log(`   Subscribers:  ${channel.statistics?.subscriberCount ?? 'hidden'}`);
console.log(`   Videos:       ${channel.statistics?.videoCount ?? '0'}`);
