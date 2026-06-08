import { describe, expect, it } from 'vitest';
import { dayNumber, playlistLength, videoForDate, videoForSlot } from './schedule';

describe('videoForSlot', () => {
  it('maps the first slots to the 2× … 12× tables in order', () => {
    expect(videoForSlot(0).id).toBe('times-table-2');
    expect(videoForSlot(1).id).toBe('times-table-3');
    expect(videoForSlot(10).id).toBe('times-table-12');
  });

  it('fills the remaining slots with mixed quizzes', () => {
    expect(videoForSlot(11).id).toMatch(/^mixed-quiz-/);
    expect(videoForSlot(12).id).toMatch(/^mixed-quiz-/);
  });

  it('wraps around after a full rotation', () => {
    const length = playlistLength();
    expect(length).toBe(13);
    expect(videoForSlot(length)).toEqual(videoForSlot(0));
    expect(videoForSlot(-1)).toEqual(videoForSlot(length - 1)); // negative slots wrap too
  });
});

describe('dayNumber / videoForDate', () => {
  it('counts whole days from the 2026-01-01 epoch', () => {
    expect(dayNumber(new Date('2026-01-01T00:00:00Z'))).toBe(0);
    expect(dayNumber(new Date('2026-01-02T00:00:00Z'))).toBe(1);
    expect(dayNumber(new Date('2026-01-11T00:00:00Z'))).toBe(10);
  });

  it('picks the 2× table on the epoch day and is stable for a date', () => {
    expect(videoForDate(new Date('2026-01-01T00:00:00Z')).spec.id).toBe('times-table-2');
    expect(videoForDate(new Date('2026-01-01T09:30:00Z')).spec.id).toBe('times-table-2');
  });
});
