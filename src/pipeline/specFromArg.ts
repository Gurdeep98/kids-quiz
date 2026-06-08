/** Shared CLI helper: turn a command-line argument into a VideoSpec. */

import { buildMixedQuizVideo, buildTimesTableVideo } from '../engine';
import type { VideoSpec } from '../engine/types';

/** `undefined`/number → that times table; "mixed" → a mixed speed quiz. */
export function specFromArg(arg: string | undefined): VideoSpec {
  const value = arg ?? '3';
  return value === 'mixed'
    ? buildMixedQuizVideo({ tables: [2, 3, 4, 5, 10], count: 10, seed: 42 })
    : buildTimesTableVideo(Number(value));
}
