---
# Copy this file to add a snippet. Files starting with "_" are ignored
# by the gallery, so this template never shows up as a card.
title: "Snippet title"
category: "Buttons"
tags: ["example", "animation"]

# Optional: zoom the live preview (handy for 32–64px sprites). Default 1.
previewScale: 1

# Optional: for scroll-driven animations (animation-timeline: scroll()).
# The preview becomes a tall mock page that auto-scrolls while playing.
previewScroll: false

# Optional: live controls. Each one drives a CSS custom property that your
# cssCode reads with var(--name, fallback). Always give var() a fallback:
# Copy rewrites that fallback to the value the visitor tuned.
# The first control (or the one with primary: true) sits on the card; the
# rest open from the card's "Adjust" button and in the Open dialog.
controls:
  - label: "Speed"
    property: "--pulse-speed"
    reactProp: "speed" # optional: prop in reactCode whose default gets the tuned value
    primary: true      # optional: this one is shown on the card
    type: "range"      # range | color
    default: 1
    min: 0.2
    max: 3
    step: 0.1
    unit: "s"          # appended to range values
  - label: "Color"
    property: "--pulse-color"
    type: "color"
    default: "#6b63ff"

# Assets: put images in public/ and reference them from the site root,
# e.g. url('/assets/my-sprite.png'). The preview rewrites these for the
# /css-vault base path automatically; copied code stays as written.
cssCode: |
  .example-element {
    padding: 0.75rem 1.25rem;
    border: 0;
    border-radius: 8px;
    color: #fff;
    background: var(--pulse-color, #6b63ff);
    animation: pulse var(--pulse-speed, 1s) ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
htmlCode: |
  <button class="example-element">Click me</button>
reactCode: |
  // Example.tsx — put this snippet's CSS in Example.css next to this file
  import type { CSSProperties } from 'react';
  import './Example.css';

  export function Example({ speed = 1 }: { speed?: number }) {
    return (
      <button
        className="example-element"
        style={{ '--pulse-speed': `${speed}s` } as CSSProperties}
      >
        Click me
      </button>
    );
  }
---

### Implementation notes

Markdown below the frontmatter appears in the card's "Show code" dialog.
