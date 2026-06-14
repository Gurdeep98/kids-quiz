/**
 * Narration text generation — pure and deterministic, so the spoken script is
 * decided here and unit-tested, not buried in the renderer or the TTS step.
 *
 * Style: "read question & answer only". The voice reads the question over the
 * countdown ("What is 3 times 7?") and the answer at the reveal ("21"). Lines
 * are kept short so they fit the snappy fixed timing (3s countdown, 2s reveal).
 */

import type { Operation, Question } from './types';

const OPERATION_WORDS: Record<Operation, string> = {
  multiply: 'times',
  add: 'plus',
  subtract: 'minus',
  divide: 'divided by',
};

export function spokenOperation(operation: Operation): string {
  return OPERATION_WORDS[operation];
}

/** e.g. "What is 3 times 7?" */
export function spokenPrompt(question: Question): string {
  const [a, b] = question.operands;
  return `What is ${a} ${spokenOperation(question.operation)} ${b}?`;
}

/**
 * The spoken answer. Just the number, so it comfortably fits the 2s reveal.
 * (Switch to the full equation here if the reveal time is ever lengthened.)
 */
export function spokenAnswer(question: Question): string {
  return `${question.answer}`;
}

/** Short intro line that fits the 3s intro card. */
export function introNarration(table?: number): string {
  return table !== undefined
    ? `Let's practise the ${table} times table. Get ready!`
    : `Times tables speed quiz. Get ready!`;
}

/** Short outro line that fits the 4s outro card. */
export function outroNarration(): string {
  return `Well done! Subscribe for more.`;
}
