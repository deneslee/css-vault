---
title: "Snippet Title"
category: "Buttons"
tags: ["example", "animation"]
defaultSpeed: 1.0
cssCode: |
  .example-element {
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
htmlCode: |
  <button class="example-element">Click me</button>
reactCode: |
  import React from 'react';

  export function ExampleSnippet() {
    return <button className="example-element">Click me</button>;
  }
---

### Implementation Notes

Add any documentation, explanations, or notes regarding the snippet implementation here.
