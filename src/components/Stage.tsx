// src/components/Stage.tsx
// The live preview: the snippet runs in its own srcdoc iframe (so snippets
// can't clash), paused until `playing`, with control values pushed straight
// into the frame's DOM so nothing reloads while you drag a slider.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildPreviewDocument,
  formatControlValue,
  type ControlValues,
  type SnippetData,
} from "../lib/snippet";

interface StageProps {
  snippet: SnippetData;
  values: ControlValues;
  playing: boolean;
  pinned: boolean;
  onTogglePin: () => void;
  /** Text on the play pill when neither playing nor pinned. */
  idleLabel: string;
  /** Re-sync text colour when the site theme changes. */
  theme: string;
  className?: string;
}

/** One full down-and-back pass of the scroll demo. */
const SCROLL_DEMO_MS = 5000;

export default function Stage({
  snippet,
  values,
  playing,
  pinned,
  onTogglePin,
  idleLabel,
  theme,
  className = "",
}: StageProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = useMemo(() => buildPreviewDocument(snippet), [snippet]);
  // Bumped on every frame load, so effects that touch the frame's document
  // re-run against the real srcdoc document, not the initial about:blank.
  const [loads, setLoads] = useState(0);
  const wasPlaying = useRef(false);
  const lastValues = useRef(values);

  const sync = useCallback(() => {
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    const root = doc?.querySelector<HTMLElement>(".preview-root");
    if (!frame || !doc || !root) return;
    for (const control of snippet.controls) {
      root.style.setProperty(control.property, formatControlValue(control, values[control.property]));
    }
    root.classList.toggle("is-playing", playing);
    // Plain text in a snippet follows the site theme.
    doc.body.style.color = getComputedStyle(frame).color;

    // One-shot animations (e.g. `forwards`) finish and would never move
    // again. Replay them whenever play starts or a value changes, so every
    // hover shows the effect. Only time-based animations: scroll-driven ones
    // are positioned by scrolling, not by currentTime.
    const replay = playing && (!wasPlaying.current || lastValues.current !== values);
    if (replay) {
      for (const animation of doc.getAnimations()) {
        if (animation.timeline === doc.timeline && animation.playState === "finished") {
          animation.currentTime = 0;
        }
      }
    }
    wasPlaying.current = playing;
    lastValues.current = values;
  }, [snippet.controls, values, playing]);

  useEffect(() => {
    sync();
  }, [sync, theme, loads]);

  // Scroll previews: while playing, glide the mock page down and back up so
  // the scroll-driven effect shows without any input. Scrolling yourself
  // (wheel, touch, keys) takes over until the next play.
  useEffect(() => {
    if (!snippet.previewScroll || !playing) return;
    const doc = iframeRef.current?.contentDocument;
    const scroller = doc?.scrollingElement;
    if (!doc || !scroller) return;
    let frame = 0;
    let start: number | undefined;
    const stop = () => cancelAnimationFrame(frame);
    const tick = (now: number) => {
      start ??= now;
      const t = ((now - start) % SCROLL_DEMO_MS) / SCROLL_DEMO_MS;
      const leg = t < 0.5 ? t * 2 : 2 - t * 2; // 0 → 1 → 0
      const eased = 0.5 - Math.cos(leg * Math.PI) / 2;
      scroller.scrollTop = eased * (scroller.scrollHeight - scroller.clientHeight);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const opts = { passive: true } as const;
    doc.addEventListener("wheel", stop, opts);
    doc.addEventListener("touchstart", stop, opts);
    doc.addEventListener("keydown", stop);
    return () => {
      stop();
      doc.removeEventListener("wheel", stop);
      doc.removeEventListener("touchstart", stop);
      doc.removeEventListener("keydown", stop);
    };
  }, [snippet.previewScroll, playing, loads]);

  return (
    <div className={`stage ${className}`} data-playing={playing}>
      <iframe
        ref={iframeRef}
        title={`${snippet.title} preview`}
        srcDoc={srcDoc}
        onLoad={() => setLoads((n) => n + 1)}
        tabIndex={snippet.previewScroll ? 0 : -1}
        className="block h-full w-full border-0 bg-transparent"
        style={{ colorScheme: "normal" }}
      />
      <button
        type="button"
        onClick={onTogglePin}
        aria-pressed={pinned}
        className="btn btn-xs absolute left-3 top-3 gap-2 border-base-content/10 bg-base-100/80 font-medium backdrop-blur"
      >
        <span className="live-dot" aria-hidden="true" />
        {pinned ? "Pause" : playing ? "Playing" : idleLabel}
      </button>
    </div>
  );
}
