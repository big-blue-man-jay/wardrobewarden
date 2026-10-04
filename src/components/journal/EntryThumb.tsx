import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { Item, JournalEntry } from '../../db/types';
import { useBlobUrl } from '../../hooks/useBlobUrl';

/** Small square preview of a journal day: the selfie if there is one, otherwise a mini flat-lay of up to 4 pieces. */
export function EntryThumb({ entry, className = '' }: { entry: JournalEntry; className?: string }) {
  const photoUrl = useBlobUrl(entry.photoThumb ?? entry.photo);
  const items = useLiveQuery(
    async (): Promise<(Item | undefined)[]> =>
      entry.photoThumb || entry.photo ? [] : db.items.bulkGet(entry.itemIds.slice(0, 4)),
    [entry.id, entry.itemIds.join(','), !!entry.photoThumb],
  );
  if (photoUrl) {
    return <img src={photoUrl} alt="" className={`aspect-square rounded-xl object-cover ${className}`} />;
  }
  const present = (items ?? []).filter((i): i is Item => !!i);
  return (
    <div
      className={`grid aspect-square gap-0.5 overflow-hidden rounded-xl bg-tile p-1 ${present.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} ${className}`}
    >
      {present.map((item) => (
        <MiniThumb key={item.id} blob={item.thumbnail} />
      ))}
    </div>
  );
}

function MiniThumb({ blob }: { blob: Blob }) {
  const url = useBlobUrl(blob);
  return <div className="flex items-center justify-center">{url && <img src={url} alt="" className="max-h-full max-w-full object-contain" />}</div>;
}
