/** Registers the compositions available to the Remotion studio and renderer. */

import React from 'react';
import { Composition, Still } from 'remotion';
import { buildTimesTableVideo } from '../engine';
import { buildThumbnailModel } from '../engine/metadata';
import type { VideoSpec } from '../engine/types';
import { MathQuiz } from './MathQuiz';
import { Thumbnail } from './Thumbnail';
import { buildTimeline } from './timeline';

// What the studio shows by default; any spec can be supplied at render time.
const defaultSpec = buildTimesTableVideo(3);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MathQuiz"
        component={MathQuiz}
        // Vertical 9:16 for YouTube Shorts / Reels.
        width={1080}
        height={1920}
        fps={defaultSpec.fps}
        durationInFrames={buildTimeline(defaultSpec).totalFrames}
        defaultProps={{ spec: defaultSpec }}
        // Duration and fps follow whatever spec is passed in.
        calculateMetadata={({ props }: { props: { spec: VideoSpec } }) => ({
          durationInFrames: buildTimeline(props.spec).totalFrames,
          fps: props.spec.fps,
        })}
      />
      <Still
        id="Thumbnail"
        component={Thumbnail}
        // Standard 16:9 YouTube thumbnail.
        width={1280}
        height={720}
        defaultProps={{ model: buildThumbnailModel(defaultSpec) }}
      />
    </>
  );
};
