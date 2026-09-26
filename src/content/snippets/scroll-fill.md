---
title: "Scroll Fill Bar"
category: "Scroll Effects"
tags: ["scroll", "scroll-driven", "animation-timeline", "progress"]
previewScroll: true
controls:
  - label: "Color"
    property: "--bar-color"
    reactProp: "color"
    type: "color"
    default: "#6b63ff"
  - label: "Height"
    property: "--bar-height"
    reactProp: "height"
    type: "range"
    default: 4
    min: 2
    max: 12
    step: 1
    unit: "px"
cssCode: |
  .scroll-fill {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 100;
    height: var(--bar-height, 4px);
    background: var(--bar-color, #6b63ff);
    transform-origin: 0 50%;
    /* The shorthand resets animation-timeline, so the timeline must come after it. */
    animation: scroll-fill auto linear both;
    animation-timeline: scroll(root block);
  }

  @keyframes scroll-fill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  /* Browsers without scroll-driven animations would show a full, static bar. */
  @supports not (animation-timeline: scroll()) {
    .scroll-fill { display: none; }
  }
htmlCode: |
  <div class="scroll-fill" aria-hidden="true"></div>
reactCode: |
  // ScrollFill.tsx — put this snippet's CSS in ScrollFill.css next to this file
  import type { CSSProperties } from 'react';
  import './ScrollFill.css';

  interface ScrollFillProps {
    color?: string;
    /** Bar thickness in px. */
    height?: number;
  }

  export function ScrollFill({ color = '#6b63ff', height = 4 }: ScrollFillProps) {
    return (
      <div
        className="scroll-fill"
        aria-hidden="true"
        style={{
          '--bar-color': color,
          '--bar-height': `${height}px`,
        } as CSSProperties}
      />
    );
  }
---

### Implementation notes

A reading-progress bar with no JavaScript. `animation-timeline: scroll(root block)` ties the keyframes to how far the page has scrolled instead of to time: at the top the bar is `scaleX(0)`, at the bottom `scaleX(1)`.

- Put `animation-timeline` **after** the `animation` shorthand; the shorthand resets the timeline, which silently turns it back into a time-based animation.
- The duration is `auto`: with a scroll timeline, progress comes from the scroll position, not from seconds.
- Animating `transform` (not `width`) keeps it on the compositor, so it stays smooth on long pages.
- Browser support: Chromium and Safari 26+. The `@supports` block hides the bar elsewhere instead of showing it stuck at full width.
