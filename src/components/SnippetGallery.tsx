// src/components/SnippetGallery.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Navbar, { type Theme } from "./Navbar";
import SnippetCard from "./SnippetCard";
import type { SnippetData } from "../lib/snippet";

const GITHUB_URL = "https://github.com/deneslee/css-vault";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("css-vault-theme", theme);
  } catch {
    /* Storage unavailable: the theme still applies for this visit. */
  }
}

export default function SnippetGallery({ snippets }: { snippets: SnippetData[] }) {
  // Start from the server-rendered value so hydration matches; the effect
  // below then adopts whatever the pre-paint script in Layout.astro chose.
  const [theme, setTheme] = useState<Theme>("vault-dark");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.documentElement.getAttribute("data-theme") === "vault-light") setTheme("vault-light");
  }, []);

  // "/" focuses search from anywhere on the page.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const snippet of snippets) for (const tag of snippet.tags) tags.add(tag);
    return Array.from(tags).sort();
  }, [snippets]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return snippets.filter((snippet) => {
      const matchesSearch =
        !query ||
        snippet.title.toLowerCase().includes(query) ||
        snippet.category.toLowerCase().includes(query) ||
        snippet.tags.some((tag) => tag.toLowerCase().includes(query.replace(/^#/, "")));
      const matchesTag = !activeTag || snippet.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [snippets, search, activeTag]);

  function toggleTheme() {
    const next: Theme = theme === "vault-dark" ? "vault-light" : "vault-dark";
    applyTheme(next);
    setTheme(next);
  }

  const selectTag = (tag: string | null) => setActiveTag((current) => (current === tag ? null : tag));
  const clearFilters = () => {
    setSearch("");
    setActiveTag(null);
  };

  const filterActive = search.trim() !== "" || activeTag !== null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        search={search}
        onSearchChange={setSearch}
        searchRef={searchRef}
        theme={theme}
        onToggleTheme={toggleTheme}
        githubUrl={GITHUB_URL}
      />

      <main id="snippets" className="mx-auto w-full max-w-7xl flex-1 scroll-mt-20 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Snippets</h1>
            <p className="mt-1 text-sm text-base-content/65" aria-live="polite">
              {filterActive
                ? `Showing ${filtered.length} of ${snippets.length}.`
                : `${snippets.length} snippets. Hover a card, or press Play, to run its animation.`}
            </p>
          </div>
          {filterActive && (
            <button type="button" onClick={clearFilters} className="btn btn-ghost btn-sm">
              Clear filters
            </button>
          )}
        </div>

        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
            className={`badge badge-lg cursor-pointer ${activeTag === null ? "badge-primary" : "badge-outline hover:bg-base-100"}`}
          >
            #all
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => selectTag(tag)}
              aria-pressed={activeTag === tag}
              className={`badge badge-lg cursor-pointer ${activeTag === tag ? "badge-primary" : "badge-outline hover:bg-base-100"}`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                theme={theme}
                activeTag={activeTag}
                onTagSelect={selectTag}
                onCopied={(message) => setToast({ id: Date.now(), message })}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-box border border-dashed border-base-content/20 px-6 py-16 text-center">
            <p className="text-lg font-medium">No snippets match {search.trim() ? `“${search.trim()}”` : "this tag"}.</p>
            <p className="mt-1 text-sm text-base-content/65">Try another word, or pick a different tag.</p>
            <button type="button" onClick={clearFilters} className="btn btn-primary btn-sm mt-5">
              Clear filters
            </button>
          </div>
        )}
      </main>

      <footer id="about" className="scroll-mt-20 border-t border-base-content/10 bg-base-100">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <h2 className="font-semibold">About CSS Vault</h2>
            <p className="mt-2 text-sm leading-relaxed text-base-content/70">
              A personal collection of CSS snippets: animations, sprite loops and small UI effects. Hover a card (or
              press Play) to run its preview, adjust its controls to see how it responds, then copy it as CSS, HTML
              or a React component. Press <kbd className="kbd kbd-xs">/</kbd> to search.
            </p>
          </div>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm self-start">
            View source on GitHub
          </a>
        </div>
      </footer>

      {toast && (
        <div className="toast toast-end toast-bottom z-50" role="status" key={toast.id}>
          <div className="alert alert-success py-2 text-sm shadow-lg">
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
