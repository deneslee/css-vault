// src/lib/highlight-client.ts
// Browser-side highlighting for tuned code. Untuned code is highlighted at
// build time; this only loads (CSS + TSX grammars, two themes) the first time
// someone views code with their own values baked in.
import type { HighlighterCore } from "shiki/core";

let highlighter: Promise<HighlighterCore> | null = null;

function getHighlighter() {
  highlighter ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
    ]);
    return createHighlighterCore({
      themes: [
        import("@shikijs/themes/github-dark-default"),
        import("@shikijs/themes/github-light-default"),
      ],
      langs: [import("@shikijs/langs/css"), import("@shikijs/langs/tsx")],
      engine: createJavaScriptRegexEngine(),
    });
  })();
  return highlighter;
}

export async function highlightInBrowser(code: string, lang: "css" | "tsx") {
  const h = await getHighlighter();
  return h.codeToHtml(code.trimEnd(), {
    lang,
    themes: { dark: "github-dark-default", light: "github-light-default" },
    defaultColor: false,
  });
}
