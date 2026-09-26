---
title: "Pixel Art Sprite Runner"
category: "Sprites & Pixel Art"
tags: ["pixel-art", "steps", "animation"]
previewScale: 2
controls:
  - label: "Cycle"
    property: "--run-speed"
    reactProp: "speed"
    type: "range"
    default: 0.8
    min: 0.2
    max: 2
    step: 0.05
    unit: "s"
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
  <div class="pixel-runner" role="img" aria-label="Running character"></div>
reactCode: |
  // PixelRunner.tsx — put this snippet's CSS in PixelRunner.css next to this file
  import type { CSSProperties } from 'react';
  import './PixelRunner.css';

  interface PixelRunnerProps {
    /** Seconds for one full 8-frame run cycle. */
    speed?: number;
  }

  export function PixelRunner({ speed = 0.8 }: PixelRunnerProps) {
    return (
      <div
        className="pixel-runner"
        role="img"
        aria-label="Running character"
        style={{ '--run-speed': `${speed}s` } as CSSProperties}
      />
    );
  }
---

### Implementation notes

`steps(8)` moves the background in whole-frame jumps instead of sliding it smoothly, so each of the 8 frames shows crisply. The `--run-speed` custom property changes the pace without touching the keyframes.
