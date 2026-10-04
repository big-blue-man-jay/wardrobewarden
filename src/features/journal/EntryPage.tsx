import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { BottomActionBar } from '../../components/layout/BottomActionBar';
import { PageHeader } from '../../components/layout/PageHeader';
import { ItemPicker } from '../../components/items/ItemPicker';
import { PhotoPicker } from '../../components/items/PhotoPicker';
import { Collage } from '../../components/looks/Collage';
import { LookPicker } from '../../components/looks/LookPicker';
import { Button } from '../../components/ui/Button';
import { ChipSelect, FieldLabel } from '../../components/ui/Chip';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, LayersIcon, TrashIcon } from '../../components/ui/icons';
import { RatingStars } from '../../components/ui/RatingStars';
import { TextArea } from '../../components/ui/TextField';
import { useToast } from '../../components/ui/Toast';
import { OCCASIONS, type OccasionId } from '../../config/tags';
import { useItems } from '../../db/items';
import { deleteEntry, saveEntry, useEntry } from '../../db/journal';
import { useLook } from '../../db/looks';
import type { Item, Rating } from '../../db/types';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import { preparePhoto } from '../../image/resize';
import { addDays, formatDay, isValidISODate, todayISO, weekdayLong } from '../../lib/dates';
import { orderForOutfit } from '../../lib/looks';

interface Draft {
  itemIds: string[];
  lookId?: string;
  photo?: Blob;
  photoThumb?: Blob;
  rating?: Rating;
  occasion?: OccasionId;
  note: string;
}

/** One journal day: what I wore (pieces or a saved look), optional photo, rating, occasion and note. */
export function EntryPage() {
  const { date } = useParams();
  if (!isValidISODate(date)) return <Navigate to="/journal" replace />;
  // Re-mount per day so the draft resets when stepping between days.
  return <EntryEditor key={date} date={date} />;
}

function EntryEditor({ date }: { date: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const entry = useEntry(date);
  const allItems = useItems();
  const today = todayISO();
  const isFuture = date > today;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [sheet, setSheet] = useState<'items' | 'look' | 'delete' | null>(null);
  const [busyPhoto, setBusyPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draft || entry === undefined) return;
    setDraft({
      itemIds: entry?.itemIds ?? [],
      lookId: entry?.lookId,
      photo: entry?.photo,
      photoThumb: entry?.photoThumb,
      rating: entry?.rating,
      occasion: entry?.occasion,
      note: entry?.note ?? '',
    });
  }, [entry, draft]);

  const look = useLook(draft?.lookId);
  const photoUrl = useBlobUrl(draft?.photo);
  const byId = useMemo(() => new Map((allItems ?? []).map((i) => [i.id, i])), [allItems]);
  const items = (draft?.itemIds ?? []).map((id) => byId.get(id)).filter((i): i is Item => !!i);

  if (!draft || !allItems) return <PageHeader title={formatDay(date)} back backTo="/journal" />;

  const set = (changes: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...changes } : d));
  const setItems = (ids: string[]) => {
    const ordered = orderForOutfit(ids.map((id) => byId.get(id)).filter((i): i is Item => !!i)).map((i) => i.id);
    // Keep the link to a saved look only while the pieces still match it.
    const stillLook =
      look && ordered.length === look.itemIds.length && look.itemIds.every((id) => ordered.includes(id));
    set({ itemIds: ordered, lookId: stillLook ? draft.lookId : undefined });
  };

  const pickPhoto = async (file: File) => {
    setBusyPhoto(true);
    try {
      const { photo, thumbnail } = await preparePhoto(file);
      set({ photo, photoThumb: thumbnail });
    } catch {
      toast("Couldn't read that photo. Try another one.");
    } finally {
      setBusyPhoto(false);
    }
  };

  const isEmpty = draft.itemIds.length === 0 && !draft.photo && !draft.rating && !draft.occasion && !draft.note.trim();

  const save = async () => {
    setSaving(true);
    if (isEmpty && entry) {
      await deleteEntry(date);
      toast('Day cleared');
    } else {
      await saveEntry(date, { ...draft, note: draft.note.trim() || undefined, isDemo: entry?.isDemo });
      toast(draft.itemIds.length ? `Saved. Wear counts updated for ${draft.itemIds.length} pieces` : 'Saved');
    }
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/journal', { replace: true });
  };

  const step = (delta: number) => navigate(`/journal/${addDays(date, delta)}`, { replace: true });

  return (
    <>
      <div className="animate-page">
        <PageHeader
          title={date === today ? 'Today' : weekdayLong(date)}
          subtitle={formatDay(date)}
          back
          backTo="/journal"
          actions={
            <>
              <button onClick={() => step(-1)} className="tap rounded-full p-2 text-muted" aria-label="Previous day">
                <ChevronLeftIcon />
              </button>
              <button
                onClick={() => step(1)}
                disabled={addDays(date, 1) > today}
                className="tap rounded-full p-2 text-muted disabled:opacity-30"
                aria-label="Next day"
              >
                <ChevronRightIcon />
              </button>
            </>
          }
        />

        <div className="mx-auto max-w-xl space-y-7 px-4 pb-32">
          {isFuture && (
            <p className="rounded-xl bg-accent-soft p-3 text-sm text-accent">
              This day hasn't happened yet. You can log it once it has.
            </p>
          )}

          <section>
            <FieldLabel hint="Optional">Outfit photo</FieldLabel>
            {photoUrl ? (
              <div className="relative">
                <img src={photoUrl} alt="Outfit" className="aspect-[4/5] w-full rounded-3xl object-cover" />
                <button
                  onClick={() => set({ photo: undefined, photoThumb: undefined })}
                  className="tap absolute top-3 right-3 rounded-full bg-card/90 p-2 backdrop-blur"
                  aria-label="Remove photo"
                >
                  <CloseIcon size={20} />
                </button>
                <div className="mt-3 flex justify-center">
                  <PhotoPicker compact onPick={pickPhoto} />
                </div>
              </div>
            ) : busyPhoto ? (
              <div className="flex aspect-[2/1] items-center justify-center rounded-3xl bg-tile text-sm text-muted">
                Preparing photo…
              </div>
            ) : (
              <PhotoPicker onPick={pickPhoto} />
            )}
          </section>

          <section>
            <FieldLabel hint={look ? `From look: ${look.name}` : undefined}>What I wore</FieldLabel>
            {items.length > 0 && (
              <>
                <Collage items={items} className="mx-auto mb-3 max-w-[16rem]" />
                <ul className="mb-3 flex flex-wrap gap-2">
                  {items.map((i) => (
                    <li key={i.id}>
                      <button
                        onClick={() => setItems(draft.itemIds.filter((x) => x !== i.id))}
                        className="tap flex items-center gap-1 rounded-full border border-line bg-card py-1.5 pr-2 pl-3 text-sm"
                        aria-label={`Remove ${i.name}`}
                      >
                        {i.name}
                        <CloseIcon size={14} className="text-muted" />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setSheet('items')}>
                {items.length ? 'Change pieces' : 'Pick pieces'}
              </Button>
              <Button variant="secondary" onClick={() => setSheet('look')}>
                <LayersIcon size={18} /> Saved look
              </Button>
            </div>
          </section>

          <section>
            <FieldLabel>How did it feel?</FieldLabel>
            <RatingStars value={draft.rating} onChange={(rating) => set({ rating })} />
          </section>

          <section>
            <FieldLabel hint="Optional">Occasion</FieldLabel>
            <ChipSelect options={OCCASIONS} value={draft.occasion} onChange={(occasion) => set({ occasion })} />
          </section>

          <TextArea
            label="Note"
            value={draft.note}
            onChange={(e) => set({ note: e.target.value })}
            placeholder="Where you went, compliments, what you'd change…"
          />

          {entry && (
            <section className="grid grid-cols-2 gap-2 border-t border-line pt-5">
              {entry.itemIds.length > 0 ? (
                <Link
                  to={`/looks/new?items=${entry.itemIds.join(',')}`}
                  className="tap flex min-h-12 items-center justify-center rounded-xl border border-line bg-card font-medium"
                >
                  Save as look
                </Link>
              ) : (
                <span />
              )}
              <Button variant="ghost" className="text-accent" onClick={() => setSheet('delete')}>
                <TrashIcon size={18} /> Delete day
              </Button>
            </section>
          )}
        </div>
      </div>

      <BottomActionBar>
        <Button className="w-full" disabled={saving || isFuture || (isEmpty && !entry)} onClick={save}>
          {isEmpty && entry ? 'Clear this day' : entry ? 'Save changes' : 'Save day'}
        </Button>
      </BottomActionBar>

      {sheet === 'items' && (
        <ItemPicker
          open
          title="What did you wear?"
          candidates={allItems}
          selected={draft.itemIds}
          multiple
          onChange={setItems}
          onClose={() => setSheet(null)}
        />
      )}
      <LookPicker
        open={sheet === 'look'}
        onClose={() => setSheet(null)}
        onPick={(l) => set({ itemIds: [...l.itemIds], lookId: l.id })}
      />
      <ConfirmDialog
        open={sheet === 'delete'}
        title="Delete this day?"
        confirmLabel="Delete day"
        danger
        onCancel={() => setSheet(null)}
        onConfirm={async () => {
          await deleteEntry(date);
          toast('Day deleted');
          navigate('/journal', { replace: true });
        }}
      >
        The pieces stay in your closet; their wear counts go down by one.
      </ConfirmDialog>
    </>
  );
}
