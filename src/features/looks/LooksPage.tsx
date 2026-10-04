import { PageHeader } from '../../components/layout/PageHeader';
import { ThumbStrip } from '../../components/items/ThumbStrip';
import { EmptyState } from '../../components/ui/EmptyState';
import { LayersIcon } from '../../components/ui/icons';
import { useLooks } from '../../db/looks';

// M1 preview list; the builder and collage cards come in M4.
export function LooksPage() {
  const looks = useLooks();
  return (
    <div className="animate-page">
      <PageHeader title="Looks" />
      <div className="mx-auto max-w-3xl space-y-3 px-4">
        {looks?.length === 0 && (
          <EmptyState icon={<LayersIcon size={28} />} title="No looks yet">
            The outfit builder arrives in M4.
          </EmptyState>
        )}
        {looks?.map((look) => (
          <div key={look.id} className="rounded-2xl border border-line bg-card p-3">
            <p className="mb-2 font-serif text-lg">{look.name}</p>
            <ThumbStrip itemIds={look.itemIds} />
          </div>
        ))}
      </div>
    </div>
  );
}
