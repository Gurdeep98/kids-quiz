/** Kid-friendly colour palettes the renderer maps each {@link ThemeName} to. */

import type { ThemeName } from '../engine/types';

export interface Palette {
  /** Full-screen CSS background (a gradient). */
  background: string;
  /** Primary text colour. */
  text: string;
  /** Accent for the countdown ring and subtitles. */
  accent: string;
  /** Muted surface used for the countdown track. */
  track: string;
  /** Colour the answer reveals in. */
  good: string;
}

export const THEMES: Record<ThemeName, Palette> = {
  candy: {
    background: 'linear-gradient(160deg, #ff9a9e 0%, #fad0c4 55%, #fbc2eb 100%)',
    text: '#3a2540',
    accent: '#ff2e74',
    track: 'rgba(255,255,255,0.55)',
    good: '#1f9d57',
  },
  ocean: {
    background: 'linear-gradient(160deg, #2193b0 0%, #6dd5ed 100%)',
    text: '#05303a',
    accent: '#ff8a00',
    track: 'rgba(255,255,255,0.6)',
    good: '#0a6b46',
  },
  space: {
    background: 'linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    text: '#f5f7fa',
    accent: '#ffd166',
    track: 'rgba(255,255,255,0.18)',
    good: '#5ee7a4',
  },
};

/** Heavy, friendly sans-serif. Swappable for @remotion/google-fonts later. */
export const FONT_FAMILY = '"Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif';
