/** Builds an authenticated YouTube Data API client from environment credentials. */

import { google } from 'googleapis';

export interface Credentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

/** Reads the OAuth credentials from the environment, throwing a clear error if absent. */
export function readCredentials(env: NodeJS.ProcessEnv = process.env): Credentials {
  const clientId = env.YT_CLIENT_ID;
  const clientSecret = env.YT_CLIENT_SECRET;
  const refreshToken = env.YT_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing YouTube credentials. Set YT_CLIENT_ID, YT_CLIENT_SECRET and YT_REFRESH_TOKEN ' +
        '(see .env.example, and run `npm run auth` to obtain the refresh token).',
    );
  }
  return { clientId, clientSecret, refreshToken };
}

export function makeOAuthClient(creds: Credentials) {
  const client = new google.auth.OAuth2(creds.clientId, creds.clientSecret);
  client.setCredentials({ refresh_token: creds.refreshToken });
  return client;
}

export function makeYouTube(creds: Credentials = readCredentials()) {
  return google.youtube({ version: 'v3', auth: makeOAuthClient(creds) });
}
