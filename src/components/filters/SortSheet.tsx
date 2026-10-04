import { SORT_OPTIONS, type SortKey } from '../../lib/filters';
import { BottomSheet } from '../ui/BottomSheet';
import { CheckIcon } from '../ui/icons';

export function SortSheet({ open, onClose, value, onChange }: { open: boolean; onClose: () => void; value: SortKey; onChange: (s: SortKey) => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Sort by">
      <ul className="divide-y divide-line">
        {SORT_OPTIONS.map((o) => (
          <li key={o.id}>
            <button
              onClick={() => {
                onChange(o.id);
                onClose();
              }}
              className="tap flex min-h-12 w-full items-center justify-between text-left"
            >
              <span className={value === o.id ? 'font-medium' : ''}>{o.label}</span>
              {value === o.id && <CheckIcon size={20} className="text-accent" />}
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
