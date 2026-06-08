/**
 * Question generators. These produce raw {@link Question}s with no timing or
 * presentation concerns — the curriculum layer wraps them into a VideoSpec.
 */

import type { Operation, Question } from './types';
import { type Rng, pick, randInt, shuffle } from './random';

const SYMBOLS: Record<Operation, string> = {
  multiply: '×',
  add: '+',
  subtract: '−', // U+2212 minus sign — reads cleaner on screen than a hyphen
  divide: '÷',
};

/** Builds a single question, computing its prompt and answer for the operation. */
export function makeQuestion(operation: Operation, a: number, b: number): Question {
  let answer: number;
  switch (operation) {
    case 'multiply':
      answer = a * b;
      break;
    case 'add':
      answer = a + b;
      break;
    case 'subtract':
      answer = a - b;
      break;
    case 'divide':
      if (b === 0) throw new Error('makeQuestion: division by zero');
      answer = a / b;
      break;
  }
  return {
    id: `${operation}-${a}-${b}`,
    operation,
    operands: [a, b],
    prompt: `${a} ${SYMBOLS[operation]} ${b}`,
    answer,
  };
}

export interface TimesTableOptions {
  /** Which table, e.g. 3 for the 3× table. Must be a positive integer. */
  table: number;
  /** First multiplier, inclusive. Default 1. */
  from?: number;
  /** Last multiplier, inclusive. Default 12. */
  to?: number;
  /** Shuffle the order? Requires `rng`. Default false (ascending). */
  shuffle?: boolean;
  rng?: Rng;
}

/** Generates one full times table, e.g. 3×1 … 3×12. */
export function generateTimesTable(opts: TimesTableOptions): Question[] {
  const { table, from = 1, to = 12, shuffle: doShuffle = false, rng } = opts;
  if (!Number.isInteger(table) || table < 1) {
    throw new Error(`generateTimesTable: table must be a positive integer, got ${table}`);
  }
  if (!Number.isInteger(from) || !Number.isInteger(to) || to < from) {
    throw new Error(`generateTimesTable: invalid multiplier range ${from}..${to}`);
  }
  const multipliers: number[] = [];
  for (let m = from; m <= to; m++) multipliers.push(m);
  const ordered = doShuffle
    ? shuffle(orRequireRng(rng, 'generateTimesTable: shuffle requires an rng'), multipliers)
    : multipliers;
  return ordered.map((m) => makeQuestion('multiply', table, m));
}

export interface MixedTimesTablesOptions {
  /** Tables to draw from, e.g. [2, 3, 4, 5, 10]. */
  tables: number[];
  /** How many questions to produce. */
  count: number;
  rng: Rng;
  /** Multiplier range, inclusive. Defaults 1..12. */
  factorFrom?: number;
  factorTo?: number;
  /** Allow the same a×b to appear more than once. Default false. */
  allowDuplicates?: boolean;
}

/** Generates a random mixed-tables quiz ("beat the clock" style). */
export function generateMixedTimesTables(opts: MixedTimesTablesOptions): Question[] {
  const { tables, count, rng, factorFrom = 1, factorTo = 12, allowDuplicates = false } = opts;
  if (tables.length === 0) throw new Error('generateMixedTimesTables: tables is empty');
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`generateMixedTimesTables: count must be a positive integer, got ${count}`);
  }
  if (factorTo < factorFrom) {
    throw new Error(`generateMixedTimesTables: invalid factor range ${factorFrom}..${factorTo}`);
  }

  const maxUnique = tables.length * (factorTo - factorFrom + 1);
  if (!allowDuplicates && count > maxUnique) {
    throw new Error(
      `generateMixedTimesTables: requested ${count} unique questions but only ${maxUnique} are possible`,
    );
  }

  const questions: Question[] = [];
  const seen = new Set<string>();
  let guard = 0;
  const guardLimit = count * 50 + 100;
  while (questions.length < count) {
    if (guard++ > guardLimit) {
      throw new Error('generateMixedTimesTables: gave up trying to fill unique questions');
    }
    const q = makeQuestion('multiply', pick(rng, tables), randInt(rng, factorFrom, factorTo));
    if (!allowDuplicates && seen.has(q.id)) continue;
    seen.add(q.id);
    questions.push(q);
  }
  return questions;
}

function orRequireRng(rng: Rng | undefined, message: string): Rng {
  if (!rng) throw new Error(message);
  return rng;
}
