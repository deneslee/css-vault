// src/components/SnippetCard.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LANG_LABEL,
  buildPreviewDocument,
  defaultControlValues,
  formatControlValue,
  type CodeLang,
  type SnippetData,
} from "../lib/snippet";
import type { Theme } from "./Navbar";

interface SnippetCardProps {
  snippet: SnippetData;
  theme: Theme;
  activeTag: string | null;
  onTagSelect: (tag: string) => void;
  onCopied: (message: string) => void;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const hoverQuery = "(hover: hover)";

export default function SnippetCard({ snippet, theme, activeTag, onTagSelect, onCopied }: SnippetCardProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [values, setValues] = useState(() => defaultControlValues(snippet));
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const [codeTab, setCodeTab] = useState<CodeLang>("css");
  const [copied, setCopied] = useState<CodeLang | null>(null);

  // Hovering (or focusing) the card plays it; the stage button keeps it
  // playing, which is also how touch and reduced-motion users start it.
  const playing = pinned || (hovered && !reducedMotion);

  useEffect(() => {
    const motion = window.matchMedia(reducedMotionQuery);
    const hover = window.matchMedia(hoverQuery);
    const update = () => {
      setReducedMotion(motion.matches);
      setCanHover(hover.matches);
    };
    update();
    motion.addEventListener("change", update);
    hover.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      hover.removeEventListener("change", update);
    };
  }, []);

  const srcDoc = useMemo(() => buildPreviewDocument(snippet), [snippet]);

  // Push live state into the preview document. It's a same-origin srcdoc
  // frame, so the parent can reach its DOM directly — no reload per change.
  const syncPreview = useCallback(() => {
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    const root = doc?.querySelector<HTMLElement>(".preview-root");
    if (!frame || !doc || !root) return;
    for (const control of snippet.controls) {
      root.style.setProperty(control.property, formatControlValue(control, values[control.property]));
    }
    root.classList.toggle("is-playing", playing);
    // Plain text in a snippet should follow the site theme.
    doc.body.style.color = getComputedStyle(frame).color;
  }, [snippet.controls, values, playing]);

  useEffect(() => {
    syncPreview();
  }, [syncPreview, theme]);

  const codeFor = (lang: CodeLang) =>
    lang === "css" ? snippet.cssCode : lang === "react" ? snippet.reactCode : snippet.htmlCode;

  async function copy(lang: CodeLang) {
    try {
      await navigator.clipboard.writeText(codeFor(lang));
      setCopied(lang);
      onCopied(`Copied ${LANG_LABEL[lang]} for ${snippet.title}`);
      window.setTimeout(() => setCopied((current) => (current === lang ? null : current)), 1800);
    } catch {
      onCopied("Copying failed. Your browser blocked clipboard access.");
    }
  }

  const resetControls = () => setValues(defaultControlValues(snippet));
  const isDirty = snippet.controls.some((c) => values[c.property] !== c.default);

  return (
    <article
      className="card border border-base-content/10 bg-base-100 shadow-md transition-[box-shadow,border-color] duration-200 hover:border-primary/40 hover:shadow-xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(false);
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div className="min-w-0">
          <span className="badge badge-soft badge-primary badge-sm font-medium">{snippet.category}</span>
          <h3 className="mt-2 text-lg font-semibold leading-snug">{snippet.title}</h3>
        </div>

        <div className="dropdown dropdown-end">
          <button
            type="button"
            tabIndex={0}
            className="btn btn-ghost btn-circle btn-sm -mr-2 -mt-1"
            aria-label={`More actions for ${snippet.title}`}
          >
            <DotsIcon />
          </button>
          <ul
            tabIndex={0}
            className="menu dropdown-content z-20 mt-1 w-48 rounded-box border border-base-content/10 bg-base-100 p-2 shadow-xl"
          >
            <li>
              <button type="button" onClick={() => copy("html")}>
                Copy HTML
              </button>
            </li>
            <li className={snippet.controls.length === 0 ? "menu-disabled" : undefined}>
              <button type="button" onClick={resetControls} disabled={snippet.controls.length === 0}>
                Reset controls
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Stage */}
      <div className="stage h-52 border-y border-base-content/10" data-playing={playing}>
        <iframe
          ref={iframeRef}
          title={`${snippet.title} preview`}
          srcDoc={srcDoc}
          onLoad={syncPreview}
          tabIndex={-1}
          className="block h-full w-full border-0 bg-transparent"
          style={{ colorScheme: "normal" }}
        />
        <button
          type="button"
          onClick={() => setPinned((value) => !value)}
          aria-pressed={pinned}
          className="btn btn-xs absolute left-3 top-3 gap-2 border-base-content/10 bg-base-100/80 font-medium backdrop-blur"
        >
          <span className="live-dot" aria-hidden="true" />
          {pinned ? "Pause" : playing ? "Playing" : reducedMotion || !canHover ? "Play" : "Hover to play"}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {snippet.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
            {snippet.tags.map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => onTagSelect(tag)}
                  aria-pressed={activeTag === tag}
                  className={`badge badge-sm cursor-pointer ${
                    activeTag === tag ? "badge-primary" : "badge-ghost hover:badge-outline"
                  }`}
                >
                  #{tag}
                </button>
              </li>
            ))}
          </ul>
        )}

        {snippet.controls.length > 0 && (
          <div className="space-y-2.5">
            {snippet.controls.map((control) => {
              const value = values[control.property];
              const id = `${snippet.id}-${control.property}`;
              return (
                <div key={control.property} className="flex items-center gap-3">
                  <label htmlFor={id} className="w-16 shrink-0 text-xs font-medium text-base-content/70">
                    {control.label}
                  </label>
                  {control.type === "color" ? (
                    <>
                      <input
                        id={id}
                        type="color"
                        value={value}
                        onChange={(event) => setValues((prev) => ({ ...prev, [control.property]: event.target.value }))}
                        className="h-7 w-10 cursor-pointer rounded-field border border-base-content/15 bg-transparent p-0.5"
                      />
                      <span className="font-mono text-xs uppercase text-base-content/60">{value}</span>
                    </>
                  ) : (
                    <>
                      <input
                        id={id}
                        type="range"
                        min={control.min}
                        max={control.max}
                        step={control.step ?? 0.1}
                        value={value}
                        onChange={(event) => setValues((prev) => ({ ...prev, [control.property]: event.target.value }))}
                        className="range range-primary range-xs flex-1"
                      />
                      <output htmlFor={id} className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-base-content/70">
                        {formatControlValue(control, value)}
                      </output>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="join">
            <button type="button" onClick={() => copy("css")} className="btn btn-sm btn-outline join-item">
              {copied === "css" ? "Copied" : "Copy CSS"}
            </button>
            <button type="button" onClick={() => copy("react")} className="btn btn-sm btn-outline join-item">
              {copied === "react" ? "Copied" : "React"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="btn btn-sm btn-ghost text-primary"
          >
            Show code
          </button>
        </div>
        {isDirty && (
          <p className="-mt-2 text-xs text-base-content/55">
            Copied code keeps its original defaults. Your adjusted values only change this preview.
          </p>
        )}
      </div>

      {/* Code dialog */}
      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" aria-labelledby={`${snippet.id}-dialog-title`}>
        <div className="modal-box w-full max-w-3xl p-0">
          <div className="flex items-center justify-between gap-3 border-b border-base-content/10 px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs text-base-content/60">{snippet.category}</p>
              <h2 id={`${snippet.id}-dialog-title`} className="truncate text-lg font-semibold">
                {snippet.title}
              </h2>
            </div>
            <form method="dialog">
              <button className="btn btn-ghost btn-circle btn-sm" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </form>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div role="tablist" className="tabs tabs-box tabs-sm">
                {(["css", "react", "html"] as CodeLang[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    role="tab"
                    aria-selected={codeTab === lang}
                    className={`tab ${codeTab === lang ? "tab-active" : ""}`}
                    onClick={() => setCodeTab(lang)}
                  >
                    {LANG_LABEL[lang]}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => copy(codeTab)} className="btn btn-primary btn-sm">
                {copied === codeTab ? "Copied" : `Copy ${LANG_LABEL[codeTab]}`}
              </button>
            </div>

            <div
              role="tabpanel"
              className="code-block overflow-hidden rounded-box border border-base-content/10"
              dangerouslySetInnerHTML={{ __html: snippet.highlighted[codeTab] }}
            />

            {snippet.notesHtml && (
              <div className="snippet-notes border-t border-base-content/10 pt-4" dangerouslySetInnerHTML={{ __html: snippet.notesHtml }} />
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close dialog">close</button>
        </form>
      </dialog>
    </article>
  );
}

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}
