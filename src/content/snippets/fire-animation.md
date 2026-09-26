---
title: "60-Frame Fire Sprite Loop"
category: "Sprites & Pixel Art"
tags: ["fire", "sprite-sheet", "2d-grid", "steps"]
defaultSpeed: 1.8
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
  <div class="pixel-fire"></div>
reactCode: |
  import React from 'react';
  import { Box } from '@mantine/core';
  import classes from './FireSprite.module.css';

  interface FireProps {
    duration?: number;
    scale?: number;
  }

  export function FireSprite({ duration = 1.8, scale = 1 }: FireProps) {
    return (
      <Box
        className={classes.pixelFire}
        style={{
          '--fire-duration': `${duration}s`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        } as React.CSSProperties}
      />
    );
  }
---

### Implementation Details

This sheet uses a 10×6 grid (60 frames). Rather than splitting the sprite into a 3,840px single-row strip, CSS runs two simultaneous `steps()` animations:

1. `fire-x` iterates through the 10 horizontal frames in 1/6th of the total duration.
2. `fire-y` shifts down by 64px every time `fire-x` completes one row cycle.
