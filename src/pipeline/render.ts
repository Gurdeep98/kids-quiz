/**
 * Rendering pipeline. Bundles the Remotion project once, then renders the video
 * and/or the thumbnail from that same bundle. Shared by the render/thumbnail
 * CLIs and the produce orchestrator so nothing bundles twice in one run.
 */

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { buildThumbnailModel } from '../engine/metadata';
import type { VideoSpec } from '../engine/types';

export const OUT_DIR = path.resolve('out');

/** Bundles src/index.ts into a servable Remotion site. Reuse the result. */
export function bundleProject(): Promise<string> {
  return bundle({ entryPoint: path.resolve('src/index.ts') });
}

export async function renderVideo(
  serveUrl: string,
  spec: VideoSpec,
  onProgress?: (progress: number) => void,
): Promise<string> {
  await mkdir(OUT_DIR, { recursive: true });
  const outputLocation = path.join(OUT_DIR, `${spec.id}.mp4`);
  const composition = await selectComposition({ serveUrl, id: 'MathQuiz', inputProps: { spec } });
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    inputProps: { spec },
    onProgress: onProgress ? ({ progress }) => onProgress(progress) : undefined,
  });
  return outputLocation;
}

export async function renderThumbnail(serveUrl: string, spec: VideoSpec): Promise<string> {
  await mkdir(OUT_DIR, { recursive: true });
  const output = path.join(OUT_DIR, `${spec.id}.thumbnail.png`);
  const model = buildThumbnailModel(spec);
  const composition = await selectComposition({ serveUrl, id: 'Thumbnail', inputProps: { model } });
  await renderStill({ composition, serveUrl, output, inputProps: { model } });
  return output;
}
