// src/components/Navbar.tsx
import { useEffect, useRef, useState, type RefObject } from "react";

export type Theme = "vault-dark" | "vault-light";

interface NavbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  theme: Theme;
  onToggleTheme: () => void;
  githubUrl: string;
}

const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");

export default function Navbar({
  search,
  onSearchChange,
  searchRef,
  theme,
  onToggleTheme,
  githubUrl,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    // Taps on a snippet preview land inside its iframe and never reach this
    // document; the window losing focus to the frame is the signal instead.
    const onBlur = () => setMenuOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onBlur);
    };
  }, [menuOpen]);

  const links = [
    { href: `${base}#snippets`, label: "Snippets" },
    { href: `${base}#about`, label: "About" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-base-content/10 bg-base-100/85 backdrop-blur-md">
      <div className="navbar mx-auto max-w-7xl gap-2 px-3 sm:px-6">
        {/* Burger (mobile) */}
        <div ref={menuRef} className="relative md:hidden">
          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <BurgerIcon />}
          </button>
          {menuOpen && (
            <ul
              id="mobile-menu"
              className="menu absolute left-0 top-full z-40 mt-2 w-52 rounded-box border border-base-content/10 bg-base-100 p-2 shadow-xl"
            >
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <GitHubIcon /> GitHub
                </a>
              </li>
            </ul>
          )}
        </div>

        {/* Brand */}
        <a href={base} className="flex shrink-0 items-center gap-2.5 rounded-field px-1">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-content shadow-md shadow-primary/30">
            <BracketsIcon />
          </span>
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">CSS Vault</span>
        </a>

        {/* Search */}
        <label className="input input-sm mx-1 min-w-0 flex-1 md:input-md sm:mx-3 md:max-w-md lg:mx-auto">
          <SearchIcon />
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                onSearchChange("");
                event.currentTarget.blur();
              }
            }}
            placeholder="Search snippets, categories, tags"
            aria-label="Search snippets"
            className="grow"
          />
          <kbd className="kbd kbd-sm hidden sm:inline-flex" aria-hidden="true">
            /
          </kbd>
        </label>

        {/* Links (desktop) */}
        <nav className="hidden md:block" aria-label="Main">
          <ul className="menu menu-horizontal gap-1 px-0 font-medium">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
            <li>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
                <GitHubIcon />
              </a>
            </li>
          </ul>
        </nav>

        {/* Theme toggle */}
        <label
          className="btn btn-ghost btn-circle btn-sm swap swap-rotate md:btn-md"
          aria-label={theme === "vault-dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          <input
            type="checkbox"
            checked={theme === "vault-light"}
            onChange={onToggleTheme}
            aria-label="Light theme"
          />
          <SunIcon className="swap-on" />
          <MoonIcon className="swap-off" />
        </label>
      </div>
    </header>
  );
}

function BurgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function BracketsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="size-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="size-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={`size-5 ${className ?? ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={`size-5 ${className ?? ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 14.5A8.5 8.5 0 119.5 3.5a6.6 6.6 0 0011 11z" />
    </svg>
  );
}
