// src/components/SnippetDialog.tsx
// The "Open" view: big autoplaying preview, every control, and the code —
// showing exactly what Copy will give you, tuned values included.
import { useEffect, useState, type RefObject } from "react";
import {
  LANG_LABEL,
  codeWithValues,
  isTuned,
  type CodeLang,
  type ControlValues,
  type SnippetData,
} from "../lib/snippet";
import { highlightInBrowser } from "../lib/highlight-client";
import ControlField from "./ControlField";
import Stage from "./Stage";
import { CloseIcon } from "./icons";

interface SnippetDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  open: boolean;
  snippet: SnippetData;
  values: ControlValues;
  onValueChange: (property: string, value: string) => void;
  onReset: () => void;
  onCopy: (lang: CodeLang) => void;
  copied: CodeLang | null;
  reducedMotion: boolean;
  theme: string;
}

const originalCode = (snippet: SnippetData, lang: CodeLang) =>
  lang === "css" ? snippet.cssCode : lang === "react" ? snippet.reactCode : snippet.htmlCode;

export default function SnippetDialog({
  dialogRef,
  open,
  snippet,
  values,
  onValueChange,
  onReset,
  onCopy,
  copied,
  reducedMotion,
  theme,
}: SnippetDialogProps) {
  const titleId = `${snippet.id}-dialog-title`;

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" aria-labelledby={titleId}>
      <div className="modal-box w-full max-w-5xl p-0">
        <div className="flex items-center justify-between gap-3 border-b border-base-content/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs text-base-content/60">{snippet.category}</p>
            <h2 id={titleId} className="truncate text-lg font-semibold">
              {snippet.title}
            </h2>
          </div>
          <form method="dialog">
            <button className="btn btn-ghost btn-circle btn-sm" aria-label="Close">
              <CloseIcon />
            </button>
          </form>
        </div>
        {/* Mounted only while open: the second preview iframe and any
            browser-side highlighting cost nothing until you ask for them. */}
        {open && (
          <DialogBody
            snippet={snippet}
            values={values}
            onValueChange={onValueChange}
            onReset={onReset}
            onCopy={onCopy}
            copied={copied}
            reducedMotion={reducedMotion}
            theme={theme}
          />
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close dialog">close</button>
      </form>
    </dialog>
  );
}

function DialogBody({
  snippet,
  values,
  onValueChange,
  onReset,
  onCopy,
  copied,
  reducedMotion,
  theme,
}: Omit<SnippetDialogProps, "dialogRef" | "open">) {
  // Opening the dialog is a deliberate act, so the preview plays right away —
  // unless the visitor asked their system to reduce motion.
  const [running, setRunning] = useState(!reducedMotion);
  const [tab, setTab] = useState<CodeLang>("css");
  const tuned = isTuned(snippet, values);

  return (
    <div className="max-h-[calc(100dvh-10rem)] space-y-5 overflow-y-auto px-5 py-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <Stage
          snippet={snippet}
          values={values}
          playing={running}
          pinned={running}
          onTogglePin={() => setRunning((value) => !value)}
          idleLabel="Play"
          theme={theme}
          className="h-64 overflow-hidden rounded-box border border-base-content/10 sm:h-80"
        />

        <section aria-labelledby={`${snippet.id}-adjust`} className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <h3 id={`${snippet.id}-adjust`} className="text-sm font-semibold">
              Adjust
            </h3>
            <button type="button" className="btn btn-ghost btn-xs" onClick={onReset} disabled={!tuned}>
              Reset
            </button>
          </div>
          {snippet.controls.length > 0 ? (
            <div className="space-y-1">
              {snippet.controls.map((control) => (
                <ControlField
                  key={control.property}
                  control={control}
                  value={values[control.property]}
                  onChange={(value) => onValueChange(control.property, value)}
                  idPrefix={`${snippet.id}-dialog`}
                  labelWidth="w-20"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-base-content/60">This snippet has no adjustable values.</p>
          )}
          {tuned && (
            <p className="mt-3 text-xs leading-relaxed text-base-content/60">
              Copied CSS and React include these values.
            </p>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="tablist" aria-label="Code format" className="tabs tabs-box tabs-sm">
            {(["css", "react", "html"] as CodeLang[]).map((lang) => (
              <button
                key={lang}
                type="button"
                role="tab"
                aria-selected={tab === lang}
                className={`tab ${tab === lang ? "tab-active" : ""}`}
                onClick={() => setTab(lang)}
              >
                {LANG_LABEL[lang]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {codeWithValues(snippet, tab, values) !== originalCode(snippet, tab) && (
              <span className="badge badge-soft badge-primary badge-sm">Your values</span>
            )}
            <button type="button" onClick={() => onCopy(tab)} className="btn btn-primary btn-sm">
              {copied === tab ? "Copied" : `Copy ${LANG_LABEL[tab]}`}
            </button>
          </div>
        </div>
        <CodeView snippet={snippet} lang={tab} values={values} />
      </section>

      {snippet.notesHtml && (
        <div
          className="snippet-notes border-t border-base-content/10 pt-4"
          dangerouslySetInnerHTML={{ __html: snippet.notesHtml }}
        />
      )}
    </div>
  );
}

/**
 * Untuned code uses the build-time highlight. Tuned code is highlighted in the
 * browser; while that catches up, the last highlighted version stays on screen
 * so dragging a slider never flashes uncoloured text.
 */
function CodeView({ snippet, lang, values }: { snippet: SnippetData; lang: CodeLang; values: ControlValues }) {
  const code = codeWithValues(snippet, lang, values);
  const isOriginal = code === originalCode(snippet, lang);
  const [tuned, setTuned] = useState<{ lang: CodeLang; code: string; html: string } | null>(null);

  useEffect(() => {
    if (isOriginal || lang === "html") return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      highlightInBrowser(code, lang === "react" ? "tsx" : "css")
        .then((html) => {
          if (!cancelled) setTuned({ lang, code, html });
        })
        .catch(() => {
          /* Keep showing the last good highlight. */
        });
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [code, isOriginal, lang]);

  const html =
    isOriginal || !tuned || tuned.lang !== lang ? snippet.highlighted[lang] : tuned.html;
  const current = isOriginal || tuned?.code === code;

  return (
    <div
      role="tabpanel"
      aria-busy={!current}
      data-current={current}
      className="code-block overflow-hidden rounded-box border border-base-content/10"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
