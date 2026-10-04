import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { BottomActionBar } from '../../components/layout/BottomActionBar';
import { PageHeader } from '../../components/layout/PageHeader';
import { ItemPicker } from '../../components/items/ItemPicker';
import { ItemThumb } from '../../components/items/ItemThumb';
import { OccasionsField, SeasonsField } from '../../components/items/TagFields';
import { Collage } from '../../components/looks/Collage';
import { Button } from '../../components/ui/Button';
import { PlusIcon } from '../../components/ui/icons';
import { TextField } from '../../components/ui/TextField';
import { useToast } from '../../components/ui/Toast';
import type { OccasionId, SeasonId } from '../../config/tags';
import { db } from '../../db/db';
import { useItems } from '../../db/items';
import { addLook, updateLook } from '../../db/looks';
import type { Item } from '../../db/types';
import {
  emptySlots,
  fitsSlot,
  itemIdsFromSlots,
  placeItem,
  SLOTS,
  slotsFromItems,
  type SlotDef,
  type SlotId,
  type SlotMap,
} from '../../lib/looks';

/** Outfit builder for new looks (/looks/new?item=… or ?items=a,b) and editing (/looks/:id/edit). */
export function LookBuilderPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const allItems = useItems();
  const existing = useLiveQuery(async () => (id ? ((await db.looks.get(id)) ?? null) : null), [id]);

  const [slots, setSlots] = useState<SlotMap>(emptySlots);
  const [name, setName] = useState('');
  const [occasions, setOccasions] = useState<OccasionId[]>([]);
  const [seasons, setSeasons] = useState<SeasonId[]>([]);
  const [picking, setPicking] = useState<SlotDef | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const byId = useMemo(() => new Map((allItems ?? []).map((i) => [i.id, i])), [allItems]);

  // Initialise once: from the look being edited, or from pieces passed in the URL.
  useEffect(() => {
    if (ready || !allItems || existing === undefined) return;
    const lookup = (ids: string[]) => ids.map((x) => byId.get(x)).filter((i): i is Item => !!i);
    if (existing) {
      setSlots(slotsFromItems(lookup(existing.itemIds)));
      setName(existing.name);
      setOccasions(existing.occasions);
      setSeasons(existing.seasons);
    } else {
      const ids = [params.get('item'), ...(params.get('items')?.split(',') ?? [])].filter((x): x is string => !!x);
      setSlots(lookup(ids).reduce(placeItem, emptySlots()));
    }
    setReady(true);
  }, [ready, allItems, existing, byId, params]);

  const selectedItems = itemIdsFromSlots(slots)
    .map((x) => byId.get(x))
    .filter((i): i is Item => !!i);
  const autoName = suggestName(selectedItems);
  const candidates = useMemo(
    () => (picking && allItems ? allItems.filter((i) => fitsSlot(i, picking)) : []),
    [picking, allItems],
  );

  const setSlot = (slot: SlotId, ids: string[]) => setSlots((s) => ({ ...s, [slot]: ids }));

  const save = async () => {
    setSaving(true);
    const data = { name: name.trim() || autoName, itemIds: itemIdsFromSlots(slots), occasions, seasons };
    if (existing) {
      await updateLook(existing.id, data);
      toast('Look updated');
      if (window.history.state?.idx > 0) navigate(-1);
      else navigate(`/looks/${existing.id}`, { replace: true });
    } else {
      const newId = await addLook(data);
      toast('Look saved');
      navigate(`/looks/${newId}`, { replace: true });
    }
  };

  if (existing === null && id) {
    return <PageHeader title="Look not found" back backTo="/looks" />;
  }

  return (
    <>
      <div className="animate-page">
        <PageHeader title={existing ? 'Edit look' : 'New look'} back backTo="/looks" />
        <div className="mx-auto max-w-xl space-y-6 px-4 pb-32">
          <Collage
            items={selectedItems}
            className="mx-auto max-w-sm"
            empty={
              <div className="absolute inset-0 flex items-center justify-center p-10 text-center text-sm text-muted">
                Pick pieces below and they'll appear here as a flat-lay.
              </div>
            }
          />

          <section className="space-y-2">
            {SLOTS.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                items={slots[slot.id].map((x) => byId.get(x)).filter((i): i is Item => !!i)}
                onOpen={() => setPicking(slot)}
              />
            ))}
          </section>

          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={autoName || 'e.g. Friday office'}
          />
          <OccasionsField value={occasions} onChange={setOccasions} />
          <SeasonsField value={seasons} onChange={setSeasons} />
        </div>
      </div>
      <BottomActionBar>
        <Button className="w-full" disabled={selectedItems.length === 0 || saving} onClick={save}>
          {selectedItems.length === 0 ? 'Pick at least one piece' : existing ? 'Save changes' : 'Save look'}
        </Button>
      </BottomActionBar>

      {picking && (
        <ItemPicker
          open
          title={`Choose ${picking.label.toLowerCase()}`}
          candidates={candidates}
          selected={slots[picking.id]}
          multiple={picking.multiple}
          onChange={(ids) => setSlot(picking.id, ids)}
          onClose={() => setPicking(null)}
        />
      )}
    </>
  );
}

function SlotRow({ slot, items, onOpen }: { slot: SlotDef; items: Item[]; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="tap flex w-full items-center gap-3 rounded-2xl border border-line bg-card p-2.5 text-left"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {items.length > 0 ? (
          <div className="flex shrink-0 gap-1.5">
            {items.slice(0, 4).map((i) => (
              <ItemThumb key={i.id} item={i} className="w-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-line text-muted">
            <PlusIcon size={20} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs text-muted">{slot.label}</p>
          <p className="truncate text-[15px]">
            {items.length === 0 ? <span className="text-muted">Add</span> : items.map((i) => i.name).join(', ')}
          </p>
        </div>
      </div>
      <span className="pr-1 text-sm text-accent">{items.length ? 'Change' : 'Add'}</span>
    </button>
  );
}

/** e.g. "Navy sweater & black jeans". */
function suggestName(items: Item[]): string {
  const main = items
    .filter((i) => i.category === 'top' || i.category === 'bottom' || i.category === 'dress')
    .slice(0, 2);
  const pick = main.length ? main : items.slice(0, 2);
  if (pick.length === 0) return '';
  const [a, b] = pick.map((i) => i.name);
  return b ? `${a} & ${b.charAt(0).toLowerCase()}${b.slice(1)}` : a;
}
