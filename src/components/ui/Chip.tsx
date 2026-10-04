import type { ReactNode } from 'react';
import type { ColorTag, Tag } from '../../config/tags';

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

/** Large, thumb-friendly toggle chip. */
export function Chip({ selected, onClick, children, className = '' }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`tap inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[15px] transition-colors ${
        selected ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-ink'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Swatch({ color, size = 18 }: { color: ColorTag; size?: number }) {
  const style = color.pattern
    ? { background: 'conic-gradient(#c0332b, #e8c547, #3d7d4f, #2f62b0, #6f4a8e, #c0332b)' }
    : { background: color.hex };
  return (
    <span
      className="inline-block shrink-0 rounded-full ring-1 ring-ink/15"
      style={{ ...style, width: size, height: size }}
      aria-hidden="true"
    />
  );
}

interface GroupProps<T extends Tag> {
  options: readonly T[];
  render?: (option: T) => ReactNode;
}

/** Single-select chip row. Tapping the selected chip again clears it (unless `required`). */
export function ChipSelect<T extends Tag>({
  options,
  value,
  onChange,
  required,
  render,
}: GroupProps<T> & { value: string | undefined; onChange: (v: T['id'] | undefined) => void; required?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o.id}
          selected={value === o.id}
          onClick={() => onChange(value === o.id && !required ? undefined : o.id)}
        >
          {render ? render(o) : o.label}
        </Chip>
      ))}
    </div>
  );
}

/** Multi-select chip row. */
export function ChipMulti<T extends Tag>({
  options,
  value,
  onChange,
  render,
  extra,
}: GroupProps<T> & { value: readonly string[]; onChange: (v: T['id'][]) => void; extra?: ReactNode }) {
  const toggle = (id: T['id']) =>
    onChange(value.includes(id) ? (value.filter((v) => v !== id) as T['id'][]) : ([...value, id] as T['id'][]));
  return (
    <div className="flex flex-wrap gap-2">
      {extra}
      {options.map((o) => (
        <Chip key={o.id} selected={value.includes(o.id)} onClick={() => toggle(o.id)}>
          {render ? render(o) : o.label}
        </Chip>
      ))}
    </div>
  );
}

/** Label + optional hint above a chip group or input. */
export function FieldLabel({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <h3 className="text-sm font-medium tracking-wide text-muted uppercase">{children}</h3>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
