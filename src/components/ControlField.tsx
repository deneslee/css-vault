// src/components/ControlField.tsx
import { formatControlValue, type SnippetControl } from "../lib/snippet";

interface ControlFieldProps {
  control: SnippetControl;
  value: string;
  onChange: (value: string) => void;
  /** Unique per rendering place (card, popover, dialog) so label/for pairs never collide. */
  idPrefix: string;
  labelWidth?: string;
}

export default function ControlField({
  control,
  value,
  onChange,
  idPrefix,
  labelWidth = "w-16",
}: ControlFieldProps) {
  const id = `${idPrefix}-${control.property.slice(2)}`;
  const changed = value !== control.default;

  return (
    <div className="flex h-8 items-center gap-3">
      <label htmlFor={id} className={`${labelWidth} shrink-0 truncate text-xs font-medium text-base-content/70`}>
        {control.label}
      </label>
      {control.type === "color" ? (
        <>
          <input
            id={id}
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-7 w-10 shrink-0 cursor-pointer rounded-field border border-base-content/15 bg-transparent p-0.5"
          />
          <span className="flex-1 font-mono text-xs uppercase text-base-content/60">{value}</span>
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
            onChange={(event) => onChange(event.target.value)}
            className="range range-primary range-xs min-w-0 flex-1"
          />
          <output
            htmlFor={id}
            className={`w-12 shrink-0 text-right font-mono text-xs tabular-nums ${changed ? "text-primary" : "text-base-content/70"}`}
          >
            {formatControlValue(control, value)}
          </output>
        </>
      )}
    </div>
  );
}
