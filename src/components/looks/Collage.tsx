import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { Item } from '../../db/types';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import { collageLayout, slotsFromItems, type Placement } from '../../lib/looks';
import { showsCutout } from '../items/ItemThumb';

/** Flat-lay of a look's pieces on a neutral 4:5 canvas. Scales to any width. */
export function Collage({ items, className = '', empty }: { items: Item[]; className?: string; empty?: React.ReactNode }) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const slots = slotsFromItems(items);
  const isDress = !!slots.bottom[0] && byId.get(slots.bottom[0])?.category === 'dress';
  const placements = collageLayout(slots, isDress);
  return (
    <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-tile ${className}`}>
      {placements.length === 0 && empty}
      {placements.map((p) => {
        const item = byId.get(p.itemId);
        return item ? <Piece key={p.itemId} item={item} p={p} /> : null;
      })}
    </div>
  );
}

function Piece({ item, p }: { item: Item; p: Placement }) {
  const url = useBlobUrl(item.thumbnail);
  const cutout = showsCutout(item);
  return (
    <div
      className="animate-backdrop absolute flex aspect-square items-center justify-center"
      style={{ left: `${p.left}%`, top: `${p.top}%`, width: `${p.size}%`, zIndex: p.z }}
    >
      {url && (
        <img
          src={url}
          alt={item.name}
          draggable={false}
          className={
            cutout
              ? 'max-h-full max-w-full object-contain drop-shadow-[0_2px_3px_rgba(38,37,34,0.18)]'
              : 'h-full w-full rounded-lg object-cover shadow-sm'
          }
        />
      )}
    </div>
  );
}

/** Collage for stored item ids (looks list, journal). */
export function CollageById({ itemIds, className }: { itemIds: string[]; className?: string }) {
  const items = useLiveQuery(
    async () => (await db.items.bulkGet(itemIds)).filter((i): i is Item => !!i),
    [itemIds.join(',')],
  );
  return <Collage items={items ?? []} className={className} />;
}
