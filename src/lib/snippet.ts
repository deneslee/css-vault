// src/lib/snippet.ts
// Shared shapes between the Astro page (build time) and the React island.

export interface SnippetControl {
  label: string;
  property: string;
  type: "range" | "color";
  default: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface SnippetData {
  id: string;
  title: string;
  category: string;
  tags: string[];
  previewScale: number;
  controls: SnippetControl[];
  /** Exactly what gets copied. */
  cssCode: string;
  htmlCode: string;
  reactCode: string;
  /** cssCode/htmlCode with root-relative asset URLs rebased onto the site's base path. */
  previewCss: string;
  previewHtml: string;
  /** Shiki output (dual light/dark theme). */
  highlighted: { css: string; react: string; html: string };
  /** Rendered markdown body. */
  notesHtml: string;
}

export type CodeLang = "css" | "react" | "html";

export const LANG_LABEL: Record<CodeLang, string> = {
  css: "CSS",
  react: "React",
  html: "HTML",
};

export function formatControlValue(control: SnippetControl, raw: string) {
  return control.type === "range" && control.unit ? `${raw}${control.unit}` : raw;
}

export function defaultControlValues(snippet: SnippetData) {
  const values: Record<string, string> = {};
  for (const control of snippet.controls) values[control.property] = control.default;
  return values;
}

/**
 * Rewrites root-relative URLs ("/assets/x.png") so they resolve under a base
 * path ("/css-vault/assets/x.png"). Protocol-relative ("//cdn") and absolute
 * URLs are left alone.
 */
export function rebaseAssetUrls(code: string, base: string) {
  const prefix = base.replace(/\/+$/, "");
  if (!prefix) return code;
  return code
    .replace(/url\(\s*(['"]?)\/(?!\/)/g, `url($1${prefix}/`)
    .replace(/\b(src|href|srcset)=(['"])\/(?!\/)/g, `$1=$2${prefix}/`);
}

// Runtime rules injected ahead of the snippet's own CSS. Animations (including
// ones on ::before/::after) stay paused until the card adds `is-playing`.
// !important is needed because an `animation:` shorthand in the snippet resets
// animation-play-state to running.
const PREVIEW_RUNTIME_CSS = `
html, body { margin: 0; height: 100%; background: transparent; overflow: hidden; }
body { display: grid; place-items: center; font-family: system-ui, sans-serif; }
.preview-root { transform: scale(var(--preview-scale, 1)); transform-origin: center; }
.preview-root, .preview-root *, .preview-root *::before, .preview-root *::after {
  animation-play-state: paused !important;
}
.preview-root.is-playing, .preview-root.is-playing *,
.preview-root.is-playing *::before, .preview-root.is-playing *::after {
  animation-play-state: running !important;
}`;

export function buildPreviewDocument(snippet: SnippetData) {
  // Guard against a stray "</style>" inside snippet CSS ending the tag early.
  const css = snippet.previewCss.replace(/<\/style/gi, "<\\/style");
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>${PREVIEW_RUNTIME_CSS}</style>
<style>${css}</style>
</head>
<body>
<div class="preview-root" style="--preview-scale: ${snippet.previewScale}">${snippet.previewHtml}</div>
</body>
</html>`;
}
