---
title: "Shimmer Button"
category: "Buttons"
tags: ["button", "shimmer", "gradient", "hover"]
defaultSpeed: 2.0
cssCode: |
  .shimmer-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: linear-gradient(110deg, #1e293b 8%, #334155 18%, #1e293b 33%);
    background-size: 200% 100%;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    animation: shine var(--anim-speed, 2s) linear infinite;
  }

  @keyframes shine {
    to {
      background-position-x: -200%;
    }
  }
htmlCode: |
  <button class="shimmer-btn">Hover Me</button>
reactCode: |
  import React from 'react';

  interface ShimmerButtonProps {
    children?: React.ReactNode;
    speed?: number;
    onClick?: () => void;
  }

  export function ShimmerButton({
    children = 'Hover Me',
    speed = 2,
    onClick,
  }: ShimmerButtonProps) {
    return (
      <button
        className="shimmer-btn"
        style={{ '--anim-speed': `${speed}s` } as React.CSSProperties}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
---

### Implementation Notes

Linear gradient with an angled shine highlight animated across 200% background width creates a smooth continuous shimmer effect.
