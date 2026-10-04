import { useState } from 'react';
import { Link } from 'react-router';
import { PhotoPicker } from '../../components/items/PhotoPicker';
import { ThumbStrip } from '../../components/items/ThumbStrip';
import { useToast } from '../../components/ui/Toast';
import { setDayPhoto } from '../../db/journal';
import type { JournalEntry } from '../../db/types';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import { preparePhoto } from '../../image/resize';

/** Today's outfit photo, or a shortcut to snap it. */
export function TodayOutfit({ date, entry }: { date: string; entry: JournalEntry | null }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const photoUrl = useBlobUrl(entry?.photo);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const { photo, thumbnail } = await preparePhoto(file);
      await setDayPhoto(date, photo, thumbnail);
      toast('Outfit photo saved');
    } catch (err) {
      console.error(err);
      toast("Couldn't read that photo. Try another one.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <h2 className="mb-2 font-serif text-xl">Today's outfit</h2>
      {photoUrl ? (
        <div>
          <Link to={`/journal/${date}`} className="tap block overflow-hidden rounded-3xl bg-tile">
            <img src={photoUrl} alt="Today's outfit" className="aspect-[4/5] w-full object-cover" />
          </Link>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {entry && entry.itemIds.length > 0 ? <ThumbStrip itemIds={entry.itemIds} max={5} /> : <TagPiecesLink date={date} />}
            <PhotoPicker compact onPick={upload} />
          </div>
        </div>
      ) : busy ? (
        <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-tile text-sm text-muted">Saving photo…</div>
      ) : (
        <div className="rounded-3xl border border-line bg-card p-4">
          {entry && entry.itemIds.length > 0 ? (
            <>
              <p className="mb-3 text-sm text-muted">Logged today:</p>
              <Link to={`/journal/${date}`} className="tap mb-4 block">
                <ThumbStrip itemIds={entry.itemIds} max={6} />
              </Link>
              <p className="mb-2 text-sm text-muted">Add a mirror photo?</p>
            </>
          ) : (
            <p className="mb-3 text-[15px]">
              Not logged yet. Snap a mirror photo, or <TagPiecesLink date={date} />.
            </p>
          )}
          <PhotoPicker onPick={upload} />
        </div>
      )}
    </section>
  );
}

function TagPiecesLink({ date }: { date: string }) {
  return (
    <Link to={`/journal/${date}`} className="text-accent underline underline-offset-2">
      pick the pieces you're wearing
    </Link>
  );
}
