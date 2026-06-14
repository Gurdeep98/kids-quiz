/**
 * Curriculum layer. Turns raw questions into a complete {@link VideoSpec}:
 * attaches per-question timing, adds intro/outro cards, and computes total
 * runtime in both seconds and frames so the renderer can use it directly.
 */

import type { Card, Question, ThemeName, TimedQuestion, VideoSpec } from './types';
import { createRng } from './random';
import { generateMixedTimesTables, generateTimesTable } from './generators';
import { introNarration, outroNarration, spokenAnswer, spokenPrompt } from './narration';

export interface VideoBuildOptions {
  /** Frames per second. Default 30. */
  fps?: number;
  /** Colour theme. Default 'candy'. */
  theme?: ThemeName;
  /** Inclusive age range. Default [7, 9]. */
  ageRange?: [number, number];
  /** Per-question countdown seconds. Default 3. */
  countdownSeconds?: number;
  /** Per-question answer-reveal seconds. Default 2. */
  revealSeconds?: number;
  /** Intro card seconds. Default 3. */
  introSeconds?: number;
  /** Outro card seconds. Default 4. */
  outroSeconds?: number;
}

const DEFAULTS = {
  fps: 30,
  theme: 'candy' as ThemeName,
  ageRange: [7, 9] as [number, number],
  countdownSeconds: 3,
  revealSeconds: 2,
  introSeconds: 3,
  outroSeconds: 4,
};

interface AssembleArgs {
  id: string;
  topic: string;
  title: string;
  seed: number;
  questions: Question[];
  opts: VideoBuildOptions;
  /** Spoken intro line; defaults to the generic quiz line. */
  introLine?: string;
}

/** Shared assembly: timing + cards + narration + duration math. The one place runtime is computed. */
function assemble({ id, topic, title, seed, questions, opts, introLine }: AssembleArgs): VideoSpec {
  const o = { ...DEFAULTS, ...stripUndefined(opts) };

  const timed: TimedQuestion[] = questions.map((q, index) => ({
    ...q,
    index,
    timing: { countdownSeconds: o.countdownSeconds, revealSeconds: o.revealSeconds },
    narration: { question: spokenPrompt(q), answer: spokenAnswer(q) },
  }));

  const intro: Card = {
    title,
    subtitle: 'Get ready… ⏱️',
    durationSeconds: o.introSeconds,
    narration: introLine ?? introNarration(),
  };
  const outro: Card = {
    title: 'Well done! 🌟',
    subtitle: 'Subscribe for a new quiz every day!',
    durationSeconds: o.outroSeconds,
    narration: outroNarration(),
  };

  const questionsSeconds = timed.reduce(
    (sum, q) => sum + q.timing.countdownSeconds + q.timing.revealSeconds,
    0,
  );
  const totalDurationSeconds = o.introSeconds + questionsSeconds + o.outroSeconds;
  const totalDurationFrames = Math.round(totalDurationSeconds * o.fps);

  return {
    id,
    topic,
    title,
    ageRange: o.ageRange,
    theme: o.theme,
    fps: o.fps,
    seed,
    intro,
    questions: timed,
    outro,
    totalDurationSeconds,
    totalDurationFrames,
  };
}

export interface TimesTableVideoOptions extends VideoBuildOptions {
  /** First multiplier, inclusive. Default 1. */
  from?: number;
  /** Last multiplier, inclusive. Default 12. */
  to?: number;
  /** Shuffle question order? Default false (ascending — better for learning a single table). */
  shuffle?: boolean;
  /** Seed for reproducibility. Defaults to the table number. */
  seed?: number;
}

/** Builds a single-table drill video, e.g. "The 3 Times Table". */
export function buildTimesTableVideo(table: number, opts: TimesTableVideoOptions = {}): VideoSpec {
  const seed = opts.seed ?? table;
  const questions = generateTimesTable({
    table,
    from: opts.from,
    to: opts.to,
    shuffle: opts.shuffle,
    rng: createRng(seed),
  });
  return assemble({
    id: `times-table-${table}`,
    topic: 'times-tables',
    title: `The ${table} Times Table — Can You Beat the Clock? ⏱️`,
    seed,
    questions,
    opts,
    introLine: introNarration(table),
  });
}

export interface MixedQuizVideoOptions extends VideoBuildOptions {
  /** Tables to draw from, e.g. [2, 3, 4, 5, 10]. */
  tables: number[];
  /** Number of questions. Default 10. */
  count?: number;
  /** Seed — required so a mixed quiz can be reproduced. */
  seed: number;
  factorFrom?: number;
  factorTo?: number;
}

/** Builds a mixed-tables "beat the clock" speed quiz. */
export function buildMixedQuizVideo(opts: MixedQuizVideoOptions): VideoSpec {
  const count = opts.count ?? 10;
  const questions = generateMixedTimesTables({
    tables: opts.tables,
    count,
    rng: createRng(opts.seed),
    factorFrom: opts.factorFrom,
    factorTo: opts.factorTo,
  });
  return assemble({
    id: `mixed-quiz-${opts.seed}`,
    topic: 'times-tables',
    title: `Times Tables Speed Quiz — ${count} Questions! ⏱️`,
    seed: opts.seed,
    questions,
    opts,
  });
}

/** Drops keys whose value is undefined so they don't clobber DEFAULTS on spread. */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
}
