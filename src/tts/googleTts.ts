/**
 * Google Cloud Text-to-Speech via the REST endpoint, authenticated with a
 * simple API key (`?key=`). Uses the global fetch in Node 23 — no extra deps.
 *
 * Fallback: if your org disallows API keys for this API, swap the `?key=` auth
 * for an OAuth2 access token in an `Authorization: Bearer` header (e.g. minted
 * from a service-account key via google-auth-library). The request body is
 * identical either way.
 */

const ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

export interface VoiceOptions {
  apiKey: string;
  languageCode?: string; // default 'en-US'
  voiceName?: string; // default 'en-US-Neural2-F' (warm, clear)
  speakingRate?: number; // default 1.0
}

/** Synthesizes `text` to MP3 bytes. Throws on a non-OK response. */
export async function synthesize(text: string, opts: VoiceOptions): Promise<Buffer> {
  const languageCode = opts.languageCode ?? 'en-US';
  const voiceName = opts.voiceName ?? 'en-US-Neural2-F';
  const speakingRate = opts.speakingRate ?? 1.0;

  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(opts.apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode, name: voiceName },
      audioConfig: { audioEncoding: 'MP3', speakingRate },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Google TTS failed (${res.status} ${res.statusText}): ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { audioContent?: string };
  if (!data.audioContent) throw new Error('Google TTS returned no audioContent.');
  return Buffer.from(data.audioContent, 'base64');
}

/** Reads voice options from the environment. Returns null if no API key is set. */
export function voiceOptionsFromEnv(env: NodeJS.ProcessEnv = process.env): VoiceOptions | null {
  const apiKey = env.GOOGLE_TTS_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    voiceName: env.TTS_VOICE,
    speakingRate: env.TTS_RATE ? Number(env.TTS_RATE) : undefined,
  };
}
