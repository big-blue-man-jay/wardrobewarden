import type { ReactNode } from 'react';
import { PencilIcon } from '../../components/ui/icons';

/** A fact-sheet section. Tapping "Edit" (or any empty "Add" prompt) opens that section's own editor. */
export function ProfileSection({ title, onEdit, children }: { title: string; onEdit?: () => void; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-xl">{title}</h2>
        {onEdit && (
          <button onClick={onEdit} className="tap -mr-2 flex items-center gap-1 rounded-full px-2 py-1 text-sm text-muted">
            <PencilIcon size={16} /> Edit
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

/** Label/value row. Empty values show a subtle "Add" prompt instead of disappearing. */
export function FactRow({ label, children, onAdd }: { label: string; children?: ReactNode; onAdd?: () => void }) {
  const empty = children === undefined || children === null || children === '' || children === false;
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 border-b border-line/60 py-2 last:border-b-0">
      <span className="shrink-0 text-sm text-muted">{label}</span>
      {empty ? (
        <button onClick={onAdd} className="tap rounded-full px-2 py-1 text-sm text-accent/80">
          + Add
        </button>
      ) : (
        <span className="min-w-0 text-right">{children}</span>
      )}
    </div>
  );
}
