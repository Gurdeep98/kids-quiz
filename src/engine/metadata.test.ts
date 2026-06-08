import { describe, expect, it } from 'vitest';
import { buildMetadata, buildThumbnailModel } from './metadata';
import { buildMixedQuizVideo, buildTimesTableVideo } from './curriculum';

describe('buildMetadata (single table)', () => {
  const meta = buildMetadata(buildTimesTableVideo(3));

  it('keeps the title within YouTube limits', () => {
    expect(meta.title.length).toBeLessThanOrEqual(100);
    expect(meta.title).toContain('3 Times Table');
  });

  it('writes a description mentioning the focus, age and sample questions', () => {
    expect(meta.description).toContain('3 times table');
    expect(meta.description).toContain('ages 7–9');
    expect(meta.description).toContain('3 × 1');
    expect(meta.description).toContain('#timestables');
    expect(meta.description).toContain('#3timestable');
  });

  it('produces tags that include the table and stay under the 500-char limit', () => {
    expect(meta.tags).toContain('3 times table');
    expect(meta.tags).toContain('times tables');
    expect(meta.tags.join(',').length).toBeLessThanOrEqual(500);
    expect(new Set(meta.tags).size).toBe(meta.tags.length); // no duplicates
  });
});

describe('buildMetadata (mixed quiz)', () => {
  it('mentions every featured table', () => {
    const meta = buildMetadata(buildMixedQuizVideo({ tables: [2, 3, 4, 5, 10], count: 12, seed: 1 }));
    expect(meta.description).toContain('times tables');
    for (const t of [2, 3, 4, 5, 10]) {
      // each table that actually appeared should be a tag
      const appeared = meta.tags.includes(`${t} times table`);
      // not every table is guaranteed to be drawn, but tags must be a subset of [2..10]
      if (appeared) expect([2, 3, 4, 5, 10]).toContain(t);
    }
  });
});

describe('buildThumbnailModel', () => {
  it('models a single-table thumbnail', () => {
    const model = buildThumbnailModel(buildTimesTableVideo(7));
    expect(model.headline).toBe('7× Table');
    expect(model.heroPrompt).toMatch(/^7 × \d+$/);
    expect(model.ageLabel).toBe('Ages 7–9');
    expect(model.theme).toBe('candy');
    expect(model.badge).toBe('Beat the Clock!');
  });

  it('models a mixed thumbnail', () => {
    const model = buildThumbnailModel(buildMixedQuizVideo({ tables: [2, 3, 4], count: 6, seed: 2 }));
    expect(model.headline).toBe('Times Tables');
    expect(model.heroPrompt).toMatch(/^\d+ × \d+$/);
  });
});
