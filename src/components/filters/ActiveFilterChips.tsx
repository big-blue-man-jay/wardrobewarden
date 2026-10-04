import { activeChips, type ItemFilter } from '../../lib/filters';
import { CloseIcon } from '../ui/icons';

/** Active filters as removable chips, in one horizontally scrolling row. */
export function ActiveFilterChips({ filter, onChange, onClear }: { filter: ItemFilter; onChange: (f: ItemFilter) => void; onClear: () => void }) {
  const chips = activeChips(filter);
  if (chips.length === 0) return null;
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={() => onChange(c.remove(filter))}
          className="tap flex shrink-0 items-center gap-1 rounded-full bg-accent-soft py-1.5 pr-2 pl-3 text-sm text-accent"
          aria-label={`Remove filter ${c.label}`}
        >
          {c.label}
          <CloseIcon size={14} />
        </button>
      ))}
      {chips.length > 1 && (
        <button onClick={onClear} className="tap shrink-0 px-2 text-sm text-muted underline underline-offset-2">
          Clear all
        </button>
      )}
    </div>
  );
}
