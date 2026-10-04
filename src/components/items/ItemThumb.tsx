import { useBlobUrl } from '../../hooks/useBlobUrl';
import type { Item } from '../../db/types';

/** The piece's thumbnail on a soft neutral tile, like a tidy flat-lay. */
export function ItemThumb({ item, className = '' }: { item: Pick<Item, 'thumbnail' | 'name'>; className?: string }) {
  const url = useBlobUrl(item.thumbnail);
  return (
    <div className={`flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-tile ${className}`}>
      {url && <img src={url} alt={item.name} className="h-[86%] w-[86%] object-contain" loading="lazy" draggable={false} />}
    </div>
  );
}
