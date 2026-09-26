---
title: "Shimmer Button"
category: "Buttons"
tags: ["button", "shimmer", "gradient", "hover"]
controls:
  - label: "Speed"
    property: "--anim-speed"
    reactProp: "speed"
    type: "range"
    default: 2
    min: 0.5
    max: 5
    step: 0.1
    unit: "s"
  - label: "Base"
    property: "--shimmer-base"
    reactProp: "baseColor"
    type: "color"
    default: "#1e293b"
  - label: "Shine"
    property: "--shimmer-shine"
    reactProp: "shineColor"
    type: "color"
    default: "#475569"
cssCode: |
  .shimmer-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: linear-gradient(
      110deg,
      var(--shimmer-base, #1e293b) 8%,
      var(--shimmer-shine, #475569) 18%,
      var(--shimmer-base, #1e293b) 33%
    );
    background-size: 200% 100%;
    color: #fff;
    font: 500 0.95rem/1 system-ui, sans-serif;
    cursor: pointer;
    animation: shine var(--anim-speed, 2s) linear infinite;
  }

  @keyframes shine {
    to {
      background-position-x: -200%;
    }
  }
htmlCode: |
  <button class="shimmer-btn">Hover me</button>
reactCode: |
  // ShimmerButton.tsx — put this snippet's CSS in ShimmerButton.css next to this file
  import type { ButtonHTMLAttributes, CSSProperties } from 'react';
  import './ShimmerButton.css';

  interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Seconds for one sweep of the shine. */
    speed?: number;
    baseColor?: string;
    shineColor?: string;
  }

  export function ShimmerButton({
    speed = 2,
    baseColor = '#1e293b',
    shineColor = '#475569',
    style,
    children = 'Hover me',
    ...rest
  }: ShimmerButtonProps) {
    return (
      <button
        className="shimmer-btn"
        style={{
          ...style,
          '--anim-speed': `${speed}s`,
          '--shimmer-base': baseColor,
          '--shimmer-shine': shineColor,
        } as CSSProperties}
        {...rest}
      >
        {children}
      </button>
    );
  }
---

### Implementation notes

An angled linear gradient with a single bright band sits on a background twice the button's width. Sliding `background-position-x` across that width sweeps the band over the button in a continuous loop.
