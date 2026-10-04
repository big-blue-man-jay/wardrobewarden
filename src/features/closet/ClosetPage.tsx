import { Link } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader';
import { ItemGrid } from '../../components/items/ItemGrid';
import { EmptyState } from '../../components/ui/EmptyState';
import { GearIcon, HangerIcon } from '../../components/ui/icons';
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
          <Link to="/settings" className="tap rounded-full p-2 text-muted" aria-label="Settings">
            <GearIcon />
          </Link>
        }
      />
      <div className="mx-auto max-w-3xl px-4">
        {items && items.length === 0 && (
          <EmptyState icon={<HangerIcon size={28} />} title="Your closet is empty">
            Tap the <strong>+</strong> button below and choose <em>Add piece</em> to photograph your first item.
          </EmptyState>
        )}
        {items && items.length > 0 && <ItemGrid items={items} />}
      </div>
    </div>
  );
}
