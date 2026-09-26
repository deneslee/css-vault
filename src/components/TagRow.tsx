// src/components/TagRow.tsx
// Tags on exactly one line: as many as fit are shown, the rest fold into a
// "+N" pill that opens them in a popover. Keeps every card the same height.
import { useLayoutEffect, useRef, useState } from "react";
import Popover from "./Popover";

interface TagRowProps {
  tags: string[];
  activeTag: string | null;
  onTagSelect: (tag: string) => void;
}

const MORE_PILL_WIDTH = 44;
const GAP = 6;

export default function TagRow({ tags, activeTag, onTagSelect }: TagRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(tags.length);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;
    const compute = () => {
      const widths = Array.from(measure.children, (child) => (child as HTMLElement).offsetWidth);
      const available = row.clientWidth;
      const total = widths.reduce((sum, w) => sum + w, 0) + GAP * Math.max(0, widths.length - 1);
      if (total <= available) return setVisible(widths.length);
      let used = 0;
      let count = 0;
      for (const w of widths) {
        const next = used + (count ? GAP : 0) + w;
        if (next + GAP + MORE_PILL_WIDTH > available) break;
        used = next;
        count++;
      }
      setVisible(count);
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(row);
    return () => observer.disconnect();
  }, [tags]);

  const tagButton = (tag: string, onClick?: () => void) => (
    <button
      key={tag}
      type="button"
      onClick={() => {
        onTagSelect(tag);
        onClick?.();
      }}
      aria-pressed={activeTag === tag}
      className={`badge badge-sm shrink-0 cursor-pointer whitespace-nowrap ${
        activeTag === tag ? "badge-primary" : "badge-ghost hover:badge-outline"
      }`}
    >
      #{tag}
    </button>
  );

  const hidden = tags.slice(visible);

  return (
    <div className="relative h-6 overflow-hidden">
      {/* Invisible copy used only to measure each tag's natural width. */}
      <div ref={measureRef} aria-hidden="true" className="invisible absolute flex gap-1.5 whitespace-nowrap">
        {tags.map((tag) => (
          <span key={tag} className="badge badge-sm shrink-0">
            #{tag}
          </span>
        ))}
      </div>
      <div ref={rowRef} className="flex h-6 items-center gap-1.5 overflow-hidden" aria-label="Tags" role="group">
        {tags.slice(0, visible).map((tag) => tagButton(tag))}
        {hidden.length > 0 && (
          <Popover
            label={`Show ${hidden.length} more tags`}
            buttonContent={`+${hidden.length}`}
            buttonClassName="badge badge-sm badge-outline shrink-0 cursor-pointer"
            align="start"
            panelClassName="w-60"
            sheetTitle="More tags"
          >
            {(close) => <div className="flex flex-wrap gap-1.5">{hidden.map((tag) => tagButton(tag, close))}</div>}
          </Popover>
        )}
      </div>
    </div>
  );
}
