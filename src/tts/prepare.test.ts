import { mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { buildTimesTableVideo } from '../engine';
import { cacheKey, prepareNarration } from './prepare';

const tmpDirs: string[] = [];
async function tempAudioDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'mathshorts-audio-'));
  tmpDirs.push(dir);
  return dir;
}
afterAll(async () => {
  await Promise.all(tmpDirs.map((d) => rm(d, { recursive: true, force: true })));
});

describe('cacheKey', () => {
  it('is stable and varies by text and voice signature', () => {
    expect(cacheKey('sig', 'hello')).toBe(cacheKey('sig', 'hello'));
    expect(cacheKey('sig', 'hello')).not.toBe(cacheKey('sig', 'world'));
    expect(cacheKey('voiceA', 'hello')).not.toBe(cacheKey('voiceB', 'hello'));
  });
});

describe('prepareNarration', () => {
  it('synthesizes every line, writes files, and fills audio paths', async () => {
    const audioDir = await tempAudioDir();
    const publicDir = path.dirname(audioDir);
    let calls = 0;
    const synth = async (text: string) => {
      calls++;
      return Buffer.from(`audio:${text}`);
    };

    const spec = buildTimesTableVideo(3); // intro + outro + 12 questions
    const out = await prepareNarration(spec, { synth, signature: 'test', audioDir, publicDir });

    expect(out.intro.audioSrc).toBeTruthy();
    expect(out.outro.audioSrc).toBeTruthy();
    for (const q of out.questions) {
      expect(q.questionAudioSrc).toBeTruthy();
      expect(q.answerAudioSrc).toBeTruthy();
    }

    const files = await readdir(audioDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files.every((f) => f.endsWith('.mp3'))).toBe(true);

    // Second run reuses the on-disk cache — no new synth calls.
    const before = calls;
    const out2 = await prepareNarration(spec, { synth, signature: 'test', audioDir, publicDir });
    expect(calls).toBe(before);
    expect(out2.intro.audioSrc).toBe(out.intro.audioSrc);
  });

  it('returns the spec unchanged when there is no API key and no injected synth', async () => {
    const spec = buildTimesTableVideo(3);
    const out = await prepareNarration(spec, { env: {} });
    expect(out).toBe(spec);
    expect(out.intro.audioSrc).toBeUndefined();
  });
});
