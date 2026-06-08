/**
 * One-time OAuth helper. Run `npm run auth`, approve in the browser, and it
 * prints the refresh token to paste into your .env / deployment secrets.
 *
 * Requires YT_CLIENT_ID and YT_CLIENT_SECRET in the environment (from a Google
 * Cloud OAuth "Desktop app" client). The loopback redirect below is allowed for
 * Desktop clients without any extra registration.
 */

import 'dotenv/config';
import http from 'node:http';
import { google } from 'googleapis';

const PORT = 53682;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/oauth2callback`;
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
];

const clientId = process.env.YT_CLIENT_ID;
const clientSecret = process.env.YT_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  throw new Error('Set YT_CLIENT_ID and YT_CLIENT_SECRET first (see .env.example).');
}

const oauth2 = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
const authUrl = oauth2.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent', // force a refresh token even on repeat runs
  scope: SCOPES,
});

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/oauth2callback')) {
    res.writeHead(404);
    res.end();
    return;
  }
  const code = new URL(req.url, REDIRECT_URI).searchParams.get('code');
  if (!code) {
    res.writeHead(400);
    res.end('Missing authorization code.');
    return;
  }
  try {
    const { tokens } = await oauth2.getToken(code);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>✅ Authorized. You can close this tab.</h1>');
    console.log('\n--- Add this line to your .env (and your deployment secrets) ---\n');
    console.log(`YT_REFRESH_TOKEN=${tokens.refresh_token ?? '(none returned — re-run with prompt=consent)'}\n`);
  } catch (err) {
    res.writeHead(500);
    res.end('Token exchange failed.');
    console.error(err);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log('1) Open this URL in your browser and approve access:\n');
  console.log(`   ${authUrl}\n`);
  console.log('2) After approving, the refresh token will be printed here.');
});
