import { describe, expect, it } from 'vitest';
import { generateMixedTimesTables, generateTimesTable, makeQuestion } from './generators';
import { createRng } from './random';

describe('makeQuestion', () => {
  it('computes prompts and answers per operation', () => {
    expect(makeQuestion('multiply', 3, 4)).toMatchObject({ prompt: '3 × 4', answer: 12 });
    expect(makeQuestion('add', 3, 4)).toMatchObject({ prompt: '3 + 4', answer: 7 });
    expect(makeQuestion('subtract', 9, 4)).toMatchObject({ prompt: '9 − 4', answer: 5 });
    expect(makeQuestion('divide', 12, 4)).toMatchObject({ prompt: '12 ÷ 4', answer: 3 });
  });

  it('throws on division by zero', () => {
    expect(() => makeQuestion('divide', 5, 0)).toThrow(/division by zero/);
  });
});

describe('generateTimesTable', () => {
  it('produces the full table in ascending order by default', () => {
    const qs = generateTimesTable({ table: 3 });
    expect(qs).toHaveLength(12);
    expect(qs.map((q) => q.answer)).toEqual([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]);
    expect(qs[0]!.prompt).toBe('3 × 1');
  });

  it('respects a custom multiplier range', () => {
    const qs = generateTimesTable({ table: 5, from: 1, to: 5 });
    expect(qs.map((q) => q.answer)).toEqual([5, 10, 15, 20, 25]);
  });

  it('shuffles deterministically and keeps the same set', () => {
    const shuffled = generateTimesTable({ table: 7, shuffle: true, rng: createRng(1) });
    const ordered = generateTimesTable({ table: 7 });
    expect(shuffled.map((q) => q.answer).sort((a, b) => a - b)).toEqual(
      ordered.map((q) => q.answer),
    );
    const again = generateTimesTable({ table: 7, shuffle: true, rng: createRng(1) });
    expect(shuffled).toEqual(again);
  });

  it('requires an rng when shuffling', () => {
    expect(() => generateTimesTable({ table: 3, shuffle: true })).toThrow(/requires an rng/);
  });

  it('rejects an invalid table', () => {
    expect(() => generateTimesTable({ table: 0 })).toThrow();
    expect(() => generateTimesTable({ table: 2.5 })).toThrow();
  });
});

describe('generateMixedTimesTables', () => {
  it('produces the requested count, all drawn from the given tables', () => {
    const qs = generateMixedTimesTables({ tables: [2, 3, 4], count: 10, rng: createRng(5) });
    expect(qs).toHaveLength(10);
    for (const q of qs) {
      expect([2, 3, 4]).toContain(q.operands[0]);
      expect(q.operands[1]).toBeGreaterThanOrEqual(1);
      expect(q.operands[1]).toBeLessThanOrEqual(12);
    }
  });

  it('avoids duplicates by default', () => {
    const qs = generateMixedTimesTables({ tables: [2, 3, 4], count: 12, rng: createRng(5) });
    expect(new Set(qs.map((q) => q.id)).size).toBe(12);
  });

  it('is deterministic for the same seed', () => {
    const a = generateMixedTimesTables({ tables: [2, 3, 4, 5], count: 8, rng: createRng(99) });
    const b = generateMixedTimesTables({ tables: [2, 3, 4, 5], count: 8, rng: createRng(99) });
    expect(a).toEqual(b);
  });

  it('throws when more unique questions are requested than possible', () => {
    expect(() =>
      generateMixedTimesTables({ tables: [2], count: 100, rng: createRng(1), factorFrom: 1, factorTo: 12 }),
    ).toThrow(/only 12 are possible/);
  });

  it('allows duplicates when asked', () => {
    const qs = generateMixedTimesTables({
      tables: [2],
      count: 50,
      rng: createRng(1),
      allowDuplicates: true,
    });
    expect(qs).toHaveLength(50);
  });
});
