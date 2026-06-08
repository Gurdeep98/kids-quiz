/** Uploads a rendered video + thumbnail to YouTube via the Data API. */

import { createReadStream } from 'node:fs';
import type { VideoMetadata } from '../engine/metadata';
import { makeYouTube } from './client';

export type Visibility = 'private' | 'unlisted' | 'public';

export interface UploadInput {
  videoPath: string;
  thumbnailPath?: string;
  metadata: VideoMetadata;
  visibility: Visibility;
  /** Children's content must declare this. Defaults to true for this channel. */
  madeForKids?: boolean;
}

export interface UploadResult {
  videoId: string;
  url: string;
  /** False if the custom thumbnail couldn't be set (e.g. channel not yet verified). */
  thumbnailSet: boolean;
}

export async function uploadVideo(
  input: UploadInput,
  youtube = makeYouTube(),
): Promise<UploadResult> {
  const insert = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: input.metadata.title,
        description: input.metadata.description,
        tags: input.metadata.tags,
        categoryId: '27', // Education
      },
      status: {
        privacyStatus: input.visibility,
        selfDeclaredMadeForKids: input.madeForKids ?? true,
      },
    },
    media: { body: createReadStream(input.videoPath) },
  });

  const videoId = insert.data.id;
  if (!videoId) throw new Error('Upload succeeded but no video id was returned.');

  // The video is the important part — a failed custom thumbnail (common on
  // unverified channels) must not lose us the upload. YouTube auto-generates
  // a thumbnail from the video frames either way.
  let thumbnailSet = false;
  if (input.thumbnailPath) {
    try {
      await youtube.thumbnails.set({
        videoId,
        media: { body: createReadStream(input.thumbnailPath) },
      });
      thumbnailSet = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        `⚠ Custom thumbnail not set: ${message}\n` +
          '  Custom thumbnails need a phone-verified channel (youtube.com/verify). ' +
          'The video uploaded fine and uses an auto-generated thumbnail.',
      );
    }
  }

  return { videoId, url: `https://youtu.be/${videoId}`, thumbnailSet };
}
