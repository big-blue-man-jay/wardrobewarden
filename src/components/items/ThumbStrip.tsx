import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { ItemThumb } from './ItemThumb';

/** A row of small thumbnails for a list of item ids. */
export function ThumbStrip({ itemIds, max = 6 }: { itemIds: string[]; max?: number }) {
  const items = useLiveQuery(() => db.items.bulkGet(itemIds.slice(0, max)), [itemIds.join(','), max]);
  return (
    <div className="flex gap-1.5">
      {items?.map((item) => item && <ItemThumb key={item.id} item={item} className="w-11 rounded-lg" />)}
      {itemIds.length > max && (
        <div className="flex w-11 items-center justify-center rounded-lg bg-tile text-xs text-muted">
          +{itemIds.length - max}
        </div>
      )}
    </div>
  );
}
