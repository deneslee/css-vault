---
title: "60-Frame Fire Sprite Loop"
category: "Sprites & Pixel Art"
tags: ["fire", "sprite-sheet", "2d-grid", "steps"]
previewScale: 2
controls:
  - label: "Duration"
    property: "--fire-duration"
    type: "range"
    default: 1.8
    min: 0.4
    max: 4
    step: 0.1
    unit: "s"
cssCode: |
  .pixel-fire {
    width: 64px;
    height: 64px;
    image-rendering: pixelated;
    background-image: url('/assets/fire_sprite_64.png');
    background-repeat: no-repeat;
    background-size: 640px 384px;
    animation:
      fire-x calc(var(--fire-duration, 1.8s) / 6) steps(10) infinite,
      fire-y var(--fire-duration, 1.8s) steps(6) infinite;
  }

  @keyframes fire-x {
    from { background-position-x: 0px; }
    to   { background-position-x: -640px; }
  }

  @keyframes fire-y {
    from { background-position-y: 0px; }
    to   { background-position-y: -384px; }
  }
htmlCode: |
  <div class="pixel-fire" role="img" aria-label="Animated fire"></div>
reactCode: |
  // FireSprite.tsx — put this snippet's CSS in FireSprite.css next to this file
  import type { CSSProperties } from 'react';
  import './FireSprite.css';

  interface FireSpriteProps {
    /** Seconds for one full pass through all 60 frames. */
    duration?: number;
    scale?: number;
  }

  export function FireSprite({ duration = 1.8, scale = 1 }: FireSpriteProps) {
    return (
      <div
        className="pixel-fire"
        role="img"
        aria-label="Animated fire"
        style={{
          '--fire-duration': `${duration}s`,
          transform: `scale(${scale})`,
        } as CSSProperties}
      />
    );
  }
---

### Implementation details

This sheet is a 10×6 grid (60 frames). Rather than splitting it into a 3,840px single-row strip, CSS runs two `steps()` animations at once:

1. `fire-x` steps through the 10 frames of a row in 1/6 of the total duration.
2. `fire-y` moves down one 64px row each time `fire-x` finishes a row.

Both read `--fire-duration`, so one variable keeps them in sync.
