/**
 * Converts a {@link VideoSpec} into a frame-accurate timeline of segments the
 * renderer lays out with <Sequence>. Summing the per-segment frame counts here
 * (rather than trusting spec.totalDurationFrames) guarantees the composition
 * length always matches the sequences exactly, even with fractional seconds.
 */

import type { TimedQuestion, VideoSpec } from '../engine/types';

export type Segment =
  | { kind: 'intro'; from: number; durationInFrames: number }
  | {
      kind: 'question';
      from: number;
      durationInFrames: number;
      /** Frames of countdown before the answer reveals (relative to the segment). */
      countdownFrames: number;
      question: TimedQuestion;
    }
  | { kind: 'outro'; from: number; durationInFrames: number };

export interface Timeline {
  segments: Segment[];
  totalFrames: number;
}

export function buildTimeline(spec: VideoSpec): Timeline {
  const toFrames = (seconds: number) => Math.round(seconds * spec.fps);
  const segments: Segment[] = [];
  let from = 0;

  const introFrames = toFrames(spec.intro.durationSeconds);
  segments.push({ kind: 'intro', from, durationInFrames: introFrames });
  from += introFrames;

  for (const question of spec.questions) {
    const countdownFrames = toFrames(question.timing.countdownSeconds);
    const durationInFrames = countdownFrames + toFrames(question.timing.revealSeconds);
    segments.push({ kind: 'question', from, durationInFrames, countdownFrames, question });
    from += durationInFrames;
  }

  const outroFrames = toFrames(spec.outro.durationSeconds);
  segments.push({ kind: 'outro', from, durationInFrames: outroFrames });
  from += outroFrames;

  return { segments, totalFrames: from };
}
