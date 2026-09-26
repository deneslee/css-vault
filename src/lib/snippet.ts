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
  primary?: boolean;
  reactProp?: string;
}

export interface SnippetData {
  id: string;
  title: string;
  category: string;
  tags: string[];
  previewScale: number;
  previewScroll: boolean;
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

/** The control shown directly on the card. */
export function primaryControl(snippet: SnippetData) {
  return snippet.controls.find((c) => c.primary) ?? snippet.controls[0];
}

export type ControlValues = Record<string, string>;

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A var() fallback: anything up to the closing paren, allowing one level of
// nested parens such as rgba(0, 0, 0, 0.5).
const FALLBACK = String.raw`[^()]*(?:\([^()]*\)[^()]*)*`;

/**
 * Rewrites every `var(--prop, fallback)` in the CSS to use the tuned value
 * as its fallback, so the copied CSS looks exactly like the tuned preview.
 * Controls whose value is still the default are left untouched.
 */
export function bakeCss(css: string, controls: SnippetControl[], values: ControlValues) {
  let out = css;
  for (const control of controls) {
    const value = values[control.property];
    if (value === undefined || value === control.default) continue;
    const pattern = new RegExp(
      String.raw`var\(\s*(${escapeRegExp(control.property)})\s*,\s*${FALLBACK}\)`,
      "g",
    );
    out = out.replace(pattern, `var($1, ${formatControlValue(control, value)})`);
  }
  return out;
}

/**
 * Replaces the default value of each control's `reactProp` in the component's
 * destructured props, e.g. `duration = 1.8` → `duration = 3.2`.
 */
export function bakeReact(code: string, controls: SnippetControl[], values: ControlValues) {
  let out = code;
  for (const control of controls) {
    const value = values[control.property];
    if (!control.reactProp || value === undefined || value === control.default) continue;
    const literal = control.type === "range" ? String(Number(value)) : `'${value}'`;
    const pattern = new RegExp(
      String.raw`(\b${escapeRegExp(control.reactProp)}\s*=(?!=)\s*)(?:'[^']*'|"[^"]*"|[^,}\s)]+)`,
    );
    out = out.replace(pattern, `$1${literal}`);
  }
  return out;
}

export function codeWithValues(
  snippet: SnippetData,
  lang: CodeLang,
  values: ControlValues,
): string {
  if (lang === "css") return bakeCss(snippet.cssCode, snippet.controls, values);
  if (lang === "react") return bakeReact(snippet.reactCode, snippet.controls, values);
  return snippet.htmlCode;
}

export function isTuned(snippet: SnippetData, values: ControlValues) {
  return snippet.controls.some((c) => values[c.property] !== c.default);
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

// Scroll previews: a tall mock page to scroll through. Nothing is paused —
// scroll-driven animations only move when the page scrolls.
const SCROLL_RUNTIME_CSS = `
html { background: transparent; scrollbar-width: thin; }
body { margin: 0; font-family: system-ui, sans-serif; }
.preview-filler { display: grid; gap: 10px; max-width: 520px; margin: 0 auto; padding: 32px 24px 48px; }
.preview-filler i { display: block; height: 9px; border-radius: 5px; background: currentColor; opacity: 0.12; }
.preview-filler b { display: block; height: 15px; width: 45%; border-radius: 5px; background: currentColor; opacity: 0.22; margin-top: 14px; }`;

const FILLER_WIDTHS = [100, 94, 97, 72, 100, 88, 96, 60, 100, 91, 83, 98, 55, 100, 90, 95, 68, 100, 86, 93, 40];

function scrollFiller() {
  const rows = FILLER_WIDTHS.map((w, i) =>
    i % 7 === 0 ? "<b></b>" : `<i style="width:${w}%"></i>`,
  ).join("");
  return `<div class="preview-filler" aria-hidden="true">${rows}${rows}</div>`;
}

export function buildPreviewDocument(snippet: SnippetData) {
  // Guard against a stray "</style>" inside snippet CSS ending the tag early.
  const css = snippet.previewCss.replace(/<\/style/gi, "<\\/style");
  const runtime = snippet.previewScroll ? SCROLL_RUNTIME_CSS : PREVIEW_RUNTIME_CSS;
  const content = snippet.previewScroll ? snippet.previewHtml + scrollFiller() : snippet.previewHtml;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>${runtime}</style>
<style>${css}</style>
</head>
<body>
<div class="preview-root" style="--preview-scale: ${snippet.previewScale}">${content}</div>
</body>
</html>`;
}
