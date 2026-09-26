// src/components/SnippetCard.tsx
// Every section has a fixed height (1-line title, preview, 1-line tags, one
// quick control, actions), so cards line up no matter how many tags or
// controls a snippet has. Extra controls live in the Adjust popover and the
// Open dialog; all three share the same values.
import { useEffect, useRef, useState } from "react";
import {
  LANG_LABEL,
  codeWithValues,
  defaultControlValues,
  isTuned,
  primaryControl,
  type CodeLang,
  type SnippetData,
} from "../lib/snippet";
import type { Theme } from "./Navbar";
import ControlField from "./ControlField";
import Popover from "./Popover";
import SnippetDialog from "./SnippetDialog";
import Stage from "./Stage";
import TagRow from "./TagRow";
import { DotsIcon, ExpandIcon, SlidersIcon } from "./icons";

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
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [values, setValues] = useState(() => defaultControlValues(snippet));
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const [copied, setCopied] = useState<CodeLang | null>(null);

  // The card preview pauses while the dialog shows its own, bigger copy.
  const playing = !dialogOpen && (pinned || adjustOpen || (hovered && !reducedMotion));
  const quick = primaryControl(snippet);
  const tuned = isTuned(snippet, values);

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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setDialogOpen(false);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const setValue = (property: string, value: string) => setValues((prev) => ({ ...prev, [property]: value }));
  const resetValues = () => setValues(defaultControlValues(snippet));

  function openDialog() {
    setDialogOpen(true);
    dialogRef.current?.showModal();
  }

  async function copy(lang: CodeLang) {
    const code = codeWithValues(snippet, lang, values);
    const original = lang === "css" ? snippet.cssCode : lang === "react" ? snippet.reactCode : snippet.htmlCode;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(lang);
      onCopied(
        code === original
          ? `Copied ${LANG_LABEL[lang]} for ${snippet.title}`
          : `Copied ${LANG_LABEL[lang]} with your values for ${snippet.title}`,
      );
      window.setTimeout(() => setCopied((current) => (current === lang ? null : current)), 1800);
    } catch {
      onCopied("Copying failed. Your browser blocked clipboard access.");
    }
  }

  return (
    <article
      className="card rounded-md border border-base-content/10 bg-base-100 shadow-md transition-[box-shadow,border-color] duration-200 hover:border-primary/40 hover:shadow-xl hover:ring-2 hover:ring-primary/40"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(false);
      }}
    >
      {/* Header: category + one-line title */}
      <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div className="min-w-0 flex-1">
          <span className="badge badge-soft badge-primary badge-sm max-w-full truncate font-medium">
            {snippet.category}
          </span>
          <h3 className="mt-2 truncate text-lg font-semibold leading-snug" title={snippet.title}>
            {snippet.title}
          </h3>
        </div>

        <Popover
          label={`More actions for ${snippet.title}`}
          buttonContent={<DotsIcon />}
          buttonClassName="btn btn-ghost btn-circle btn-sm -mr-2 -mt-1"
          panelClassName="w-52 p-2"
          sheetTitle={snippet.title}
        >
          {(close) => (
            <ul className="menu w-full p-0">
              <li>
                <button type="button" onClick={() => { close(); openDialog(); }}>
                  Open details
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { close(); copy("html"); }}>
                  Copy HTML
                </button>
              </li>
              <li className={tuned ? undefined : "menu-disabled"}>
                <button type="button" disabled={!tuned} onClick={() => { resetValues(); close(); }}>
                  Reset values
                </button>
              </li>
            </ul>
          )}
        </Popover>
      </div>

      <Stage
        snippet={snippet}
        values={values}
        playing={playing}
        pinned={pinned}
        onTogglePin={() => setPinned((value) => !value)}
        idleLabel={reducedMotion || !canHover ? "Play" : "Hover to play"}
        theme={theme}
        className="h-52 border-y border-base-content/10"
      />

      <div className="flex flex-col gap-3 p-5">
        <TagRow tags={snippet.tags} activeTag={activeTag} onTagSelect={onTagSelect} />

        {/* Exactly one quick control, or an equally tall placeholder. */}
        {quick ? (
          <ControlField
            control={quick}
            value={values[quick.property]}
            onChange={(value) => setValue(quick.property, value)}
            idPrefix={`${snippet.id}-card`}
          />
        ) : (
          <p className="flex h-8 items-center text-xs text-base-content/50">No adjustable values</p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <div className="join">
            <button type="button" onClick={() => copy("css")} className="btn btn-sm btn-outline join-item">
              {copied === "css" ? "Copied" : "Copy CSS"}
            </button>
            <button type="button" onClick={() => copy("react")} className="btn btn-sm btn-outline join-item">
              {copied === "react" ? "Copied" : "React"}
            </button>
          </div>

          <div className="ml-auto flex items-center gap-1">
            {snippet.controls.length > 1 && (
              <Popover
                label={`Adjust all ${snippet.controls.length} values of ${snippet.title}`}
                buttonContent={
                  <>
                    <SlidersIcon />
                    <span className="hidden sm:inline">Adjust</span>
                    <span className="badge badge-xs badge-primary">{snippet.controls.length}</span>
                  </>
                }
                buttonClassName={`btn btn-sm gap-1.5 ${adjustOpen ? "btn-active" : "btn-ghost"}`}
                panelClassName="w-80"
                sheetTitle="Adjust values"
                onOpenChange={setAdjustOpen}
              >
                <div className="space-y-1">
                  {snippet.controls.map((control) => (
                    <ControlField
                      key={control.property}
                      control={control}
                      value={values[control.property]}
                      onChange={(value) => setValue(control.property, value)}
                      idPrefix={`${snippet.id}-adjust`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-base-content/10 pt-3">
                  <button type="button" className="btn btn-ghost btn-xs" onClick={resetValues} disabled={!tuned}>
                    Reset
                  </button>
                  <span className="text-xs text-base-content/55">
                    {tuned ? "Copy includes these values" : "Using defaults"}
                  </span>
                </div>
              </Popover>
            )}
            <button type="button" onClick={openDialog} className="btn btn-sm btn-ghost gap-1.5 text-primary">
              <ExpandIcon />
              Open
            </button>
          </div>
        </div>
      </div>

      <SnippetDialog
        dialogRef={dialogRef}
        open={dialogOpen}
        snippet={snippet}
        values={values}
        onValueChange={setValue}
        onReset={resetValues}
        onCopy={copy}
        copied={copied}
        reducedMotion={reducedMotion}
        theme={theme}
      />
    </article>
  );
}
