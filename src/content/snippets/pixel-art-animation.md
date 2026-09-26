---
title: "Pixel Art Sprite Runner"
category: "Sprites & Pixel Art"
tags: ["pixel-art", "steps", "animation"]
defaultSpeed: 0.8
cssCode: |
  .pixel-runner {
    width: 64px;
    height: 64px;
    image-rendering: pixelated;
    background: url('/sprites/runner.png') 0 0 / 512px 64px;
    animation: run var(--run-speed, 0.8s) steps(8) infinite;
  }

  @keyframes run {
    to {
      background-position: -512px 0;
    }
  }
htmlCode: |
  <div class="pixel-runner"></div>
reactCode: |
  import React from 'react';
  import { Box } from '@mantine/core';
  import classes from './PixelRunner.module.css';

  interface RunnerProps {
    speed?: number;
  }

  export function PixelRunner({ speed = 0.8 }: RunnerProps) {
    return (
      <Box
        className={classes.pixelRunner}
        style={{ '--run-speed': `${speed}s` } as React.CSSProperties}
      />
    );
  }
---

### Implementation Notes

Using `steps(8)` ensures the background shifts discretely across each sprite frame rather than interpolating linearly. The `--run-speed` CSS custom property makes dynamic speed alterations effortless in React without touching keyframes.
