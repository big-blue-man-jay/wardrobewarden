import { useParams } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { useItem } from '../../db/items';
import { useBlobUrl } from '../../hooks/useBlobUrl';

// M1 preview; the full profile ("Steckbrief") comes in M2.
export function ItemPage() {
  const { id } = useParams();
  const item = useItem(id);
  const url = useBlobUrl(item ? (item.preferOriginal ? item.photoOriginal : (item.photoCutout ?? item.photoOriginal)) : undefined);
  if (item === null) {
    return (
      <div>
        <PageHeader title="Not found" back backTo="/closet" />
        <EmptyState title="This piece doesn't exist anymore" />
      </div>
    );
  }
  return (
    <div className="animate-page">
      <PageHeader title={item?.name ?? ''} back backTo="/closet" />
      <div className="mx-auto max-w-xl px-4">
        <div className="flex aspect-square items-center justify-center rounded-3xl bg-tile">
          {url && <img src={url} alt={item?.name} className="h-[85%] w-[85%] object-contain" />}
        </div>
      </div>
    </div>
  );
}
