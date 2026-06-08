/** The three on-screen scenes: intro card, question (countdown → reveal), outro card. */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { Card, TimedQuestion } from '../engine/types';
import { FONT_FAMILY, type Palette } from './theme';

export const IntroCard: React.FC<{ card: Card; palette: Palette }> = ({ card, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12 } });
  const scale = interpolate(enter, [0, 1], [0.6, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 90,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div style={{ transform: `scale(${scale})` }}>
        <div style={{ fontSize: 96, fontWeight: 900, color: palette.text, lineHeight: 1.08 }}>
          {card.title}
        </div>
        <div style={{ fontSize: 60, marginTop: 48, fontWeight: 800, color: palette.accent }}>
          {card.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const QuestionScene: React.FC<{
  question: TimedQuestion;
  countdownFrames: number;
  index: number;
  total: number;
  palette: Palette;
}> = ({ question, countdownFrames, index, total, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealed = frame >= countdownFrames;

  // Question pops in.
  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const promptScale = interpolate(enter, [0, 1], [0.7, 1]);

  // Whole seconds remaining: 3, 2, 1.
  const remaining = Math.max(1, Math.ceil((countdownFrames - frame) / fps));

  // Countdown ring drains from full to empty.
  const progress = interpolate(frame, [0, countdownFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Answer pops in at the reveal.
  const revealSpring = spring({ frame: frame - countdownFrames, fps, config: { damping: 10 } });
  const answerScale = interpolate(revealSpring, [0, 1], [0.2, 1]);

  const size = 280;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONT_FAMILY,
        color: palette.text,
      }}
    >
      <div style={{ position: 'absolute', top: 110, fontSize: 46, fontWeight: 800, opacity: 0.65 }}>
        {`Question ${index + 1} / ${total}`}
      </div>

      <div style={{ transform: `scale(${promptScale})`, fontSize: 180, fontWeight: 900, letterSpacing: 2 }}>
        {question.prompt}
      </div>

      <div style={{ height: 70 }} />

      {revealed ? (
        <div style={{ transform: `scale(${answerScale})`, fontSize: 200, fontWeight: 900, color: palette.good }}>
          {`= ${question.answer}`}
        </div>
      ) : (
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={palette.track} strokeWidth={stroke} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={palette.accent}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 150,
              fontWeight: 900,
              color: palette.accent,
            }}
          >
            {remaining}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const OutroCard: React.FC<{ card: Card; palette: Palette }> = ({ card, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12 } });
  const scale = interpolate(enter, [0, 1], [0.5, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 90,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div style={{ transform: `scale(${scale})` }}>
        <div style={{ fontSize: 130, fontWeight: 900, color: palette.text }}>{card.title}</div>
        <div style={{ fontSize: 58, marginTop: 48, fontWeight: 800, color: palette.accent }}>
          {card.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
