// src/components/Popover.tsx
// A button + floating panel built on the browser's Popover API, which gives
// top-layer rendering, outside-click and Esc dismissal for free. The panel is
// positioned next to its button with a few lines of JS (works in every
// browser, unlike CSS anchor positioning) and becomes a bottom sheet on phones.
import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";

interface PopoverProps {
  /** Accessible name for the trigger button. */
  label: string;
  buttonContent: ReactNode;
  buttonClassName?: string;
  /** Which edge of the button the panel lines up with. */
  align?: "start" | "end";
  panelClassName?: string;
  /** Heading shown at the top of the phone bottom sheet. */
  sheetTitle?: string;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode | ((close: () => void) => ReactNode);
}

const GAP = 8;
const phoneQuery = "(max-width: 639px)";

export default function Popover({
  label,
  buttonContent,
  buttonClassName = "btn btn-sm",
  align = "end",
  panelClassName = "w-72",
  sheetTitle,
  onOpenChange,
  children,
}: PopoverProps) {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const close = useCallback(() => panelRef.current?.hidePopover(), []);

  const position = useCallback(() => {
    const button = buttonRef.current;
    const panel = panelRef.current;
    if (!button || !panel) return;
    const sheet = window.matchMedia(phoneQuery).matches;
    panel.dataset.sheet = String(sheet);
    if (sheet) {
      Object.assign(panel.style, { top: "auto", left: "0px", right: "0px", bottom: "0px" });
      return;
    }
    const b = button.getBoundingClientRect();
    const { offsetWidth: w, offsetHeight: h } = panel;
    let top = b.bottom + GAP;
    if (top + h > window.innerHeight - GAP && b.top - GAP - h > GAP) top = b.top - GAP - h;
    let left = align === "end" ? b.right - w : b.left;
    left = Math.min(Math.max(GAP, left), window.innerWidth - w - GAP);
    Object.assign(panel.style, { top: `${top}px`, left: `${left}px`, right: "auto", bottom: "auto" });
  }, [align]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    let frame = 0;
    const reposition = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(position);
    };
    // Clicks inside a preview iframe never reach this document, so the
    // Popover API's light dismiss misses them; the window blurring does not.
    const onBlur = () => panel.hidePopover();
    const onToggle = (event: Event) => {
      const open = (event as ToggleEvent).newState === "open";
      if (open) {
        position();
        window.addEventListener("scroll", reposition, true);
        window.addEventListener("resize", reposition);
        window.addEventListener("blur", onBlur);
      } else {
        window.removeEventListener("scroll", reposition, true);
        window.removeEventListener("resize", reposition);
        window.removeEventListener("blur", onBlur);
      }
      onOpenChangeRef.current?.(open);
    };
    panel.addEventListener("toggle", onToggle);
    return () => {
      panel.removeEventListener("toggle", onToggle);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("blur", onBlur);
      cancelAnimationFrame(frame);
    };
  }, [position]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        popoverTarget={id}
        aria-label={label}
        className={buttonClassName}
      >
        {buttonContent}
      </button>
      <div
        ref={panelRef}
        id={id}
        popover="auto"
        role="dialog"
        aria-label={label}
        className={`popover-panel m-0 rounded-box border border-base-content/10 bg-base-100 p-3 text-base-content shadow-2xl ${panelClassName}`}
      >
        {sheetTitle && (
          <div className="popover-sheet-header mb-2 items-center justify-between">
            <p className="font-semibold">{sheetTitle}</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={close}>
              Done
            </button>
          </div>
        )}
        {typeof children === "function" ? children(close) : children}
      </div>
    </>
  );
}
