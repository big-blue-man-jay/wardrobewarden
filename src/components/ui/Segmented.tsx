export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="grid rounded-full border border-line bg-card p-1 text-sm"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      role="tablist"
    >
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`tap rounded-full px-2 py-2 ${value === o.id ? 'bg-ink text-paper' : 'text-muted'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
