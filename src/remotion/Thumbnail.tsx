/** The YouTube thumbnail (1280×720 still), reusing the video's theme and font. */

import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { ThumbnailModel } from '../engine/metadata';
import { FONT_FAMILY, THEMES } from './theme';

export const Thumbnail: React.FC<{ model: ThumbnailModel }> = ({ model }) => {
  const palette = THEMES[model.theme] ?? THEMES.candy;

  return (
    <AbsoluteFill style={{ background: palette.background, fontFamily: FONT_FAMILY, color: palette.text }}>
      {/* "Beat the Clock!" badge */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 56,
          background: palette.accent,
          color: '#fff',
          padding: '16px 34px',
          borderRadius: 999,
          fontSize: 42,
          fontWeight: 900,
          transform: 'rotate(-3deg)',
          boxShadow: '0 8px 0 rgba(0,0,0,0.12)',
        }}
      >
        ⏱️ {model.badge}
      </div>

      {/* Age badge */}
      <div style={{ position: 'absolute', top: 64, right: 56, fontSize: 40, fontWeight: 900, opacity: 0.8 }}>
        {model.ageLabel}
      </div>

      {/* Headline */}
      <div
        style={{
          position: 'absolute',
          top: 190,
          left: 56,
          right: 56,
          fontSize: 150,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: -2,
        }}
      >
        {model.headline}
      </div>

      {/* Hero question card */}
      <div
        style={{
          position: 'absolute',
          bottom: 64,
          left: 56,
          background: '#ffffff',
          color: palette.text,
          borderRadius: 44,
          padding: '36px 72px',
          fontSize: 170,
          fontWeight: 900,
          boxShadow: '0 16px 0 rgba(0,0,0,0.12)',
        }}
      >
        {model.heroPrompt} <span style={{ color: palette.accent }}>= ?</span>
      </div>
    </AbsoluteFill>
  );
};
