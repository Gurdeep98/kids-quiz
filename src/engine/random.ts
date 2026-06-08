/**
 * Deterministic randomness. Every generated video is reproducible from its
 * seed, which means tests are stable and any published video can be rebuilt
 * byte-for-byte from the seed stored in its {@link import('./types').VideoSpec}.
 */

/** A pseudo-random number generator: returns a float in [0, 1). */
export type Rng = () => number;

/**
 * mulberry32 — a tiny, fast PRNG. Same seed → same sequence. Good enough for
 * shuffling quiz questions; not for anything cryptographic.
 */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random integer in [min, max], inclusive at both ends. */
export function randInt(rng: Rng, min: number, max: number): number {
  if (max < min) throw new Error(`randInt: max (${max}) < min (${min})`);
  return min + Math.floor(rng() * (max - min + 1));
}

/** Returns a new array shuffled with Fisher–Yates. Does not mutate the input. */
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/** Picks a uniformly random element. Throws on empty input. */
export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) throw new Error('pick: empty array');
  return items[Math.floor(rng() * items.length)]!;
}
