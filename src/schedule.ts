/**
 * Content calendar. Maps a calendar date to the video to publish that day, so
 * the publishing job is stateless: the date alone decides the content, and the
 * same date always yields the same (reproducible) video.
 *
 * One rotation = the 2× … 12× tables, then two mixed speed quizzes, repeating.
 */

import { buildMixedQuizVideo, buildTimesTableVideo } from './engine';
import type { VideoSpec } from './engine/types';

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MIXED_PER_ROTATION = 2;
const MS_PER_DAY = 86_400_000;

/** Day 0 of the calendar — 2026-01-01 UTC. */
const EPOCH_DAY = Math.floor(Date.UTC(2026, 0, 1) / MS_PER_DAY);

export interface ScheduledVideo {
  /** Absolute slot index (days since the epoch). */
  slot: number;
  spec: VideoSpec;
}

export function playlistLength(): number {
  return TABLES.length + MIXED_PER_ROTATION;
}

/** The video for an absolute slot index. Wraps around the rotation forever. */
export function videoForSlot(slot: number): VideoSpec {
  const length = playlistLength();
  const i = ((slot % length) + length) % length; // positive modulo
  const table = TABLES[i];
  if (table !== undefined) return buildTimesTableVideo(table);
  // Mixed-quiz slots — seed by index so each is different but reproducible.
  return buildMixedQuizVideo({ tables: [2, 3, 4, 5, 10], count: 10, seed: 1000 + i });
}

/** Whole days from the epoch to the given date (UTC). */
export function dayNumber(date: Date): number {
  return Math.floor(date.getTime() / MS_PER_DAY) - EPOCH_DAY;
}

export function videoForDate(date: Date): ScheduledVideo {
  const slot = dayNumber(date);
  return { slot, spec: videoForSlot(slot) };
}
