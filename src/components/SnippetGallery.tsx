// src/components/SnippetGallery.tsx
import React, { useState, useMemo } from "react";
import SnippetCard, { type SnippetData } from "./SnippetCard";

export default function SnippetGallery({
  snippets,
}: {
  snippets: SnippetData[];
}) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    snippets.forEach((s) => s.tags?.forEach((t) => tags.add(t)));
    return ["all", ...Array.from(tags)];
  }, [snippets]);

  const filteredSnippets = useMemo(() => {
    return snippets.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase());
      const matchesTag = selectedTag === "all" || s.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [snippets, search, selectedTag]);

  return (
    <div className="min-h-screen bg-base-300/30 flex flex-col">
      {/* DaisyUI Sticky Navbar with Search */}
      <header className="sticky top-0 z-30 bg-base-100/90 backdrop-blur border-b border-base-300">
        <div className="navbar max-w-7xl mx-auto px-4 gap-4">
          <div className="flex-1">
            <a
              href="/"
              className="btn btn-ghost text-xl font-bold tracking-tight"
            >
              ⚡ CSS<span className="text-primary">Vault</span>
            </a>
          </div>

          <div className="flex-none gap-2 w-full max-w-xs md:max-w-sm">
            <label className="input input-bordered input-sm flex items-center gap-2 w-full">
              <input
                type="text"
                className="grow"
                placeholder="Search snippets or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`badge badge-lg cursor-pointer transition-colors ${
                selectedTag === tag ?
                  "badge-primary text-primary-content"
                : "badge-outline hover:bg-base-200"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Snippet Grid */}
        {filteredSnippets.length > 0 ?
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSnippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        : <div className="text-center py-20 text-base-content/60">
            <p className="text-lg">No CSS snippets match your search.</p>
          </div>
        }
      </main>
    </div>
  );
}
