/** The top-level composition: lays out every timeline segment as a <Sequence>. */

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { VideoSpec } from '../engine/types';
import { IntroCard, OutroCard, QuestionScene } from './scenes';
import { THEMES } from './theme';
import { buildTimeline } from './timeline';

export const MathQuiz: React.FC<{ spec: VideoSpec }> = ({ spec }) => {
  const palette = THEMES[spec.theme] ?? THEMES.candy;
  const { segments } = buildTimeline(spec);
  const total = spec.questions.length;

  return (
    <AbsoluteFill style={{ background: palette.background }}>
      {segments.map((segment, i) => (
        <Sequence key={i} from={segment.from} durationInFrames={segment.durationInFrames}>
          {segment.kind === 'intro' && <IntroCard card={spec.intro} palette={palette} />}
          {segment.kind === 'question' && (
            <QuestionScene
              question={segment.question}
              countdownFrames={segment.countdownFrames}
              index={segment.question.index}
              total={total}
              palette={palette}
            />
          )}
          {segment.kind === 'outro' && <OutroCard card={spec.outro} palette={palette} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
