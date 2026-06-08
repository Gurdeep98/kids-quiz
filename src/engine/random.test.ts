import { describe, expect, it } from 'vitest';
import { createRng, pick, randInt, shuffle } from './random';

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(123);
    const b = createRng(123);
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = Array.from({ length: 5 }, createRng(1));
    const b = Array.from({ length: 5 }, createRng(2));
    expect(a).not.toEqual(b);
  });

  it('stays within [0, 1)', () => {
    const rng = createRng(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('randInt', () => {
  it('stays within the inclusive range and reaches both ends', () => {
    const rng = createRng(7);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const v = randInt(rng, 1, 6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      expect(Number.isInteger(v)).toBe(true);
      seen.add(v);
    }
    expect(seen.has(1)).toBe(true);
    expect(seen.has(6)).toBe(true);
  });

  it('throws when max < min', () => {
    expect(() => randInt(createRng(1), 5, 4)).toThrow();
  });
});

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(createRng(9), input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort((a, b) => a - b)).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]); // unchanged
  });

  it('is deterministic for the same seed', () => {
    const a = shuffle(createRng(9), [1, 2, 3, 4, 5]);
    const b = shuffle(createRng(9), [1, 2, 3, 4, 5]);
    expect(a).toEqual(b);
  });
});

describe('pick', () => {
  it('returns an element of the array', () => {
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(pick(createRng(i), arr));
    }
  });

  it('throws on empty input', () => {
    expect(() => pick(createRng(1), [])).toThrow();
  });
});
