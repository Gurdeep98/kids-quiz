/**
 * Core domain types for the math-video question engine.
 *
 * The engine turns a request like "I want a 3-times-table video" into a fully
 * specified {@link VideoSpec} — the single contract the renderer consumes as
 * input. Keeping this boundary clean lets the engine be tested in isolation and
 * means the renderer never has to know how questions are produced.
 */

export type Operation = 'multiply' | 'add' | 'subtract' | 'divide';

/** Kid-friendly colour palette the renderer maps to concrete styles. */
export type ThemeName = 'candy' | 'ocean' | 'space';

export interface Question {
  /** Content-derived id, e.g. "multiply-3-4". Not guaranteed unique within a set. */
  id: string;
  operation: Operation;
  /** The numbers involved, in display order, e.g. [3, 4] for "3 × 4". */
  operands: number[];
  /** Human-readable prompt without the answer, e.g. "3 × 4". */
  prompt: string;
  /** The correct numeric answer. */
  answer: number;
}

export interface QuestionTiming {
  /** Seconds the question shows with a ticking countdown before the reveal. */
  countdownSeconds: number;
  /** Seconds the answer stays on screen after the reveal. */
  revealSeconds: number;
}

export interface TimedQuestion extends Question {
  /** 0-based position within the video — unique and stable, ideal for render keys. */
  index: number;
  timing: QuestionTiming;
}

/** A non-question screen, such as the intro or outro. */
export interface Card {
  title: string;
  subtitle: string;
  durationSeconds: number;
}

export interface VideoSpec {
  /** Stable slug for the video, e.g. "times-table-3". */
  id: string;
  /** Topic family, e.g. "times-tables". */
  topic: string;
  /** On-screen / upload title. */
  title: string;
  /** Inclusive age range the content is tuned for, e.g. [7, 9]. */
  ageRange: [number, number];
  theme: ThemeName;
  /** Frames per second the renderer should use. */
  fps: number;
  /** Seed used to generate this video — regenerating with it reproduces the video exactly. */
  seed: number;
  intro: Card;
  questions: TimedQuestion[];
  outro: Card;
  /** Total runtime in seconds (intro + every question + outro). */
  totalDurationSeconds: number;
  /** Total runtime in frames — feed directly to the renderer's durationInFrames. */
  totalDurationFrames: number;
}
