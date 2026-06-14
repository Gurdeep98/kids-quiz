import { describe, expect, it } from 'vitest';
import { makeQuestion } from './generators';
import {
  introNarration,
  outroNarration,
  spokenAnswer,
  spokenOperation,
  spokenPrompt,
} from './narration';

describe('spokenOperation', () => {
  it('maps operations to spoken words', () => {
    expect(spokenOperation('multiply')).toBe('times');
    expect(spokenOperation('add')).toBe('plus');
    expect(spokenOperation('subtract')).toBe('minus');
    expect(spokenOperation('divide')).toBe('divided by');
  });
});

describe('spokenPrompt / spokenAnswer', () => {
  it('reads a multiplication question and its answer', () => {
    const q = makeQuestion('multiply', 3, 7);
    expect(spokenPrompt(q)).toBe('What is 3 times 7?');
    expect(spokenAnswer(q)).toBe('21');
  });

  it('reads other operations', () => {
    expect(spokenPrompt(makeQuestion('add', 4, 5))).toBe('What is 4 plus 5?');
    expect(spokenPrompt(makeQuestion('subtract', 9, 2))).toBe('What is 9 minus 2?');
    expect(spokenPrompt(makeQuestion('divide', 12, 4))).toBe('What is 12 divided by 4?');
  });
});

describe('intro / outro narration', () => {
  it('names the table when given one', () => {
    expect(introNarration(3)).toBe("Let's practise the 3 times table. Get ready!");
  });

  it('uses a generic line for mixed quizzes', () => {
    expect(introNarration()).toBe('Times tables speed quiz. Get ready!');
  });

  it('outro encourages subscribing', () => {
    expect(outroNarration()).toContain('Subscribe');
  });
});
