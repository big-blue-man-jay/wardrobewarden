import { useBlobUrl } from '../../hooks/useBlobUrl';
import type { Item } from '../../db/types';

/** True when the piece is shown as a cutout (sits on the neutral tile) rather than as a full photo. */
export function showsCutout(item: Pick<Item, 'photoCutout' | 'preferOriginal'>): boolean {
  return !!item.photoCutout && !item.preferOriginal;
}

/** The piece's thumbnail on a soft neutral tile, like a tidy flat-lay. */
export function ItemThumb({
  item,
  className = '',
}: {
  item: Pick<Item, 'thumbnail' | 'name' | 'photoCutout' | 'preferOriginal'>;
  className?: string;
}) {
  const url = useBlobUrl(item.thumbnail);
  const cutout = showsCutout(item);
  return (
    <div className={`flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-tile ${className}`}>
      {url && (
        <img
          src={url}
          alt={item.name}
          className={cutout ? 'h-[86%] w-[86%] object-contain' : 'h-full w-full object-cover'}
          loading="lazy"
          draggable={false}
        />
      )}
    </div>
  );
}
