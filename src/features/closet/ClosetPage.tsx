import { Link } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader';
import { ItemGrid } from '../../components/items/ItemGrid';
import { EmptyState } from '../../components/ui/EmptyState';
import { GearIcon, HangerIcon, PlusIcon } from '../../components/ui/icons';
import { useItems } from '../../db/items';
import { plural } from '../../lib/format';

export function ClosetPage() {
  const items = useItems();
  return (
    <div className="animate-page">
      <PageHeader
        title="Closet"
        subtitle={items ? plural(items.length, 'piece') : undefined}
        actions={
          <>
            <Link to="/settings" className="tap rounded-full p-2 text-muted" aria-label="Settings">
              <GearIcon />
            </Link>
            <Link
              to="/add"
              className="tap ml-1 flex items-center gap-1 rounded-full bg-ink py-2 pr-4 pl-3 text-sm font-medium text-paper"
            >
              <PlusIcon size={18} /> Add piece
            </Link>
          </>
        }
      />
      <div className="mx-auto max-w-3xl px-4">
        {items && items.length === 0 && (
          <EmptyState icon={<HangerIcon size={28} />} title="Your closet is empty">
            Tap <strong>Add piece</strong> at the top to photograph your first item.
          </EmptyState>
        )}
        {items && items.length > 0 && <ItemGrid items={items} />}
      </div>
    </div>
  );
}
