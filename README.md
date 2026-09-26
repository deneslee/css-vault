# CSS Vault

A personal collection of CSS snippets: animations, sprite loops, scroll effects and small UI details. Each snippet is a card with a live preview you can play, tune and copy as **CSS**, **HTML** or a **React** component.

**Live site:** https://deneslee.github.io/css-vault

## Features

- **Live previews.** Each snippet runs in its own isolated frame, so snippets never clash. Animations stay paused until you hover a card (or press **Play** on touch screens).
- **Tunable values.** Snippets can expose controls such as speed, colour or size. One sits on the card, and the rest are behind **Adjust** and in the **Open** dialog.
- **Copy with your values.** Copied CSS and React include whatever you tuned.
- **Search and tags.** Search matches titles, categories and tags; press <kbd>/</kbd> to jump to the search box.
- **Light and dark themes**, a layout that works down to phone size, and support for the reduced-motion setting.

## Tech stack

| Part | Tool |
| :--- | :--- |
| Framework | [Astro 7](https://astro.build) (static site, content collections) |
| Interactive parts | React 19, rendered as an Astro island |
| Styling | Tailwind CSS 4 + [daisyUI 5](https://daisyui.com) |
| Code highlighting | [Shiki](https://shiki.style) |
| Hosting | GitHub Pages, deployed by GitHub Actions |

## Getting started

Requires Node.js 22.12 or newer and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev
```

Then open http://localhost:4321/css-vault/ (the `/css-vault` part is required, see [Deployment](#deployment)).

| Command | What it does |
| :--- | :--- |
| `pnpm dev` | Start the dev server with live reload |
| `pnpm build` | Build the production site into `dist/` |
| `pnpm preview` | Serve the built site locally, exactly as it will be deployed |
| `pnpm check` | Type-check the project and validate every snippet file |

## Adding a snippet

A snippet is one Markdown file in `src/content/snippets/`. No other file needs to change: the gallery, tags, search and category list pick it up automatically.

1. Copy `src/content/snippets/_template.md` and give it a new name, e.g. `neon-glow.md`.
   Files starting with `_` are ignored, so the template itself never shows up.
2. Fill in the fields (see the [reference](#field-reference) below) and delete the optional ones you don't need.
3. If the snippet uses images, put them in `public/` (e.g. `public/assets/`) and see [Images and other assets](#images-and-other-assets).
4. Save. With `pnpm dev` running, the card appears straight away. If something is wrong, the error names the file and the line.

### Example

A complete snippet with two controls:

```markdown
---
title: "Neon Glow Pulse"
category: "Borders & Shadows"
tags: ["border", "glow", "box-shadow"]
controls:
  - label: "Speed"
    property: "--neon-speed"
    reactProp: "speed"
    type: "range"
    default: 1.5
    min: 0.3
    max: 4
    step: 0.1
    unit: "s"
  - label: "Color"
    property: "--neon-color"
    reactProp: "color"
    type: "color"
    default: "#38bdf8"
cssCode: |
  .neon {
    padding: 1rem 2rem;
    color: var(--neon-color, #38bdf8);
    border: 2px solid currentColor;
    border-radius: 8px;
    font: 600 1rem/1 system-ui, sans-serif;
    animation: neon-pulse var(--neon-speed, 1.5s) ease-in-out infinite alternate;
  }

  @keyframes neon-pulse {
    from { box-shadow: 0 0 4px currentColor; }
    to   { box-shadow: 0 0 24px currentColor; }
  }
htmlCode: |
  <div class="neon">Neon glow</div>
reactCode: |
  // NeonGlow.tsx — put this snippet's CSS in NeonGlow.css next to this file
  import type { CSSProperties } from 'react';
  import './NeonGlow.css';

  export function NeonGlow({ speed = 1.5, color = '#38bdf8' }) {
    return (
      <div
        className="neon"
        style={{ '--neon-speed': `${speed}s`, '--neon-color': color } as CSSProperties}
      >
        Neon glow
      </div>
    );
  }
---

Alternating `box-shadow` keyframes make the glow breathe. Both the colour and
the speed come from custom properties, so they can be tuned without touching
the keyframes.
```

Anything below the closing `---` is regular Markdown. It's shown as notes in the card's **Open** dialog; headings, lists and `inline code` all work.

### Field reference

| Field | Required | Description |
| :--- | :---: | :--- |
| `title` | yes | Card title. Keep it short: it's cut to one line on the card. |
| `category` | yes | Shown as a badge above the title. Searchable. |
| `tags` | no | List of tags for filtering, e.g. `["button", "hover"]`. Extra tags fold into a `+N` pill on the card. |
| `cssCode` | yes | The CSS, exactly as it should be copied. |
| `htmlCode` | yes | The markup the CSS styles. It's what the preview renders, and it's copyable from the ⋯ menu and the dialog. |
| `reactCode` | yes | A React (TSX) version of the snippet, exactly as it should be copied. |
| `controls` | no | Live controls. See [Controls](#controls). |
| `previewScale` | no | Zooms the preview only, e.g. `2` for small pixel sprites. Default `1`. |
| `previewScroll` | no | `true` for scroll-driven animations. See [Scroll-driven snippets](#scroll-driven-snippets). Default `false`. |

### Controls

Each control drives one CSS custom property in the preview.

```yaml
controls:
  - label: "Speed"          # shown next to the input
    property: "--my-speed"  # the custom property your CSS reads
    type: "range"           # "range" (slider) or "color" (colour picker)
    default: 1.5            # starting value
    min: 0.3                # range only
    max: 4                  # range only
    step: 0.1               # range only, default 0.1
    unit: "s"               # range only, appended to the value: "s", "px", "deg"…
    primary: true           # optional: this control is the one shown on the card
    reactProp: "speed"      # optional: the matching prop in reactCode
```

- **Where controls appear.** The card shows one control: the one marked `primary: true`, or the first. A snippet with two or more controls gets an **Adjust** button showing all of them. The **Open** dialog always shows all of them.
- **Always give `var()` a fallback** in your CSS: `var(--my-speed, 1.5s)`. When someone tunes a value and copies the CSS, that fallback is rewritten to their value. Without a fallback there is nothing to rewrite.
- **`reactProp`** names a prop whose default is written as `name = value` in the component's props, e.g. `{ speed = 1.5 }`. When someone tunes the control, copied React code gets the new default (`speed = 0.8`). Range values are written as numbers; colours as strings.

### Images and other assets

Put files in `public/` and reference them from the site root: `url('/assets/my-sprite.png')`.
The site is served from `/css-vault/`, so the preview rewrites these paths automatically. Copied code keeps the path exactly as you wrote it, ready for someone else's project.

### Scroll-driven snippets

Snippets that animate with `animation-timeline: scroll()` need a page to scroll. Set `previewScroll: true` and the preview becomes a tall mock page. It scrolls itself while the card is hovered or playing, and visitors can also scroll it themselves. See `scroll-fill.md`.

### How previews behave

You don't need to do anything for these; they're automatic:

- **Paused until played.** Every animation in a preview starts paused, including ones on `::before` and `::after`. Write your CSS as if it plays normally.
- **One-shot animations replay.** Animations that run once (`forwards`) restart each time the card is hovered or a value changes, so the effect is always visible. Copied code is unchanged.
- **Theme-aware text.** Plain text in a preview follows the site's light or dark theme.

### Common mistakes

- **Indentation in code blocks.** Every line inside `cssCode: |`, `htmlCode: |` and `reactCode: |` must be indented at least two spaces, including closing `}` and `@keyframes` lines. One unindented line breaks the whole file.
- **An empty `controls:` line** is fine and means "no controls". A control with a missing `property`, `type` or `default` is reported as an error.
- **The `animation` shorthand resets other animation properties.** Declare `animation-timeline` after it, not before.

Run `pnpm check` to validate every snippet at once.

## Project structure

```text
src/
├── content/snippets/      One Markdown file per snippet (_template.md is the starter)
├── content.config.ts      Snippet schema: which fields exist and which are required
├── pages/index.astro      Loads snippets, highlights code, renders the page
├── layouts/Layout.astro   HTML shell, theme bootstrap, favicon
├── components/
│   ├── SnippetGallery.tsx Page state: search, tag filter, theme, toasts
│   ├── Navbar.tsx         Burger menu, search, links, theme toggle
│   ├── SnippetCard.tsx    A card: preview, tags, quick control, actions
│   ├── SnippetDialog.tsx  The Open dialog: big preview, all controls, code, notes
│   ├── Stage.tsx          The preview frame and play/pause logic
│   ├── Popover.tsx        Floating panels (bottom sheet on phones)
│   ├── ControlField.tsx   One slider or colour input
│   ├── TagRow.tsx         One-line tag list with the +N overflow pill
│   └── icons.tsx
├── lib/
│   ├── snippet.ts         Types, preview document builder, "copy with your values"
│   └── highlight-client.ts Lazy in-browser highlighting for tuned code
└── styles/global.css      Tailwind, daisyUI themes, preview stage styles
public/                    Images and other files served as-is
```

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages via `.github/workflows/deploy.yml`. It can also be run by hand from the repository's **Actions** tab.

The site lives at a sub-path, configured in `astro.config.mjs`:

```js
site: 'https://deneslee.github.io',
base: '/css-vault',
```

Because of this, links and asset paths inside the site's own code use `import.meta.env.BASE_URL`, and local URLs include `/css-vault/`.
