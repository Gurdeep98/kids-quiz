import { describe, expect, it } from 'vitest';
import { buildMixedQuizVideo, buildTimesTableVideo } from './curriculum';

describe('buildTimesTableVideo', () => {
  it('builds a complete, well-formed spec with defaults', () => {
    const spec = buildTimesTableVideo(3);
    expect(spec.id).toBe('times-table-3');
    expect(spec.topic).toBe('times-tables');
    expect(spec.title).toContain('3 Times Table');
    expect(spec.questions).toHaveLength(12);
    expect(spec.fps).toBe(30);
    expect(spec.ageRange).toEqual([7, 9]);
  });

  it('populates narration text on cards and questions', () => {
    const spec = buildTimesTableVideo(3);
    expect(spec.intro.narration).toBe("Let's practise the 3 times table. Get ready!");
    expect(spec.outro.narration).toContain('Subscribe');
    expect(spec.questions[0]!.narration).toEqual({ question: 'What is 3 times 1?', answer: '3' });
    // audio paths are not set by the engine — that's the TTS step's job
    expect(spec.intro.audioSrc).toBeUndefined();
    expect(spec.questions[0]!.questionAudioSrc).toBeUndefined();
  });

  it('assigns sequential indices and per-question timing', () => {
    const spec = buildTimesTableVideo(4);
    spec.questions.forEach((q, i) => {
      expect(q.index).toBe(i);
      expect(q.timing).toEqual({ countdownSeconds: 3, revealSeconds: 2 });
    });
  });

  it('computes total duration in seconds and frames consistently', () => {
    const spec = buildTimesTableVideo(6);
    // intro 3 + 12 questions × (3 + 2) + outro 4 = 67s; at 30fps = 2010 frames
    expect(spec.totalDurationSeconds).toBe(67);
    expect(spec.totalDurationFrames).toBe(2010);
    expect(spec.totalDurationFrames).toBe(Math.round(spec.totalDurationSeconds * spec.fps));
  });

  it('honours timing and fps overrides', () => {
    const spec = buildTimesTableVideo(2, {
      countdownSeconds: 4,
      revealSeconds: 1,
      introSeconds: 2,
      outroSeconds: 2,
      fps: 60,
    });
    // intro 2 + 12 × (4 + 1) + outro 2 = 64s; at 60fps = 3840 frames
    expect(spec.totalDurationSeconds).toBe(64);
    expect(spec.totalDurationFrames).toBe(3840);
  });

  it('is reproducible for the same table', () => {
    expect(buildTimesTableVideo(8)).toEqual(buildTimesTableVideo(8));
  });
});

describe('buildMixedQuizVideo', () => {
  it('defaults to 10 questions and is reproducible by seed', () => {
    const a = buildMixedQuizVideo({ tables: [2, 3, 4, 5, 10], seed: 42 });
    const b = buildMixedQuizVideo({ tables: [2, 3, 4, 5, 10], seed: 42 });
    expect(a.questions).toHaveLength(10);
    expect(a).toEqual(b);
  });

  it('computes duration from the requested count', () => {
    const spec = buildMixedQuizVideo({ tables: [2, 3], count: 6, seed: 1 });
    // intro 3 + 6 × (3 + 2) + outro 4 = 37s
    expect(spec.totalDurationSeconds).toBe(37);
    expect(spec.questions).toHaveLength(6);
  });
});
