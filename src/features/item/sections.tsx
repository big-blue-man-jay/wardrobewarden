import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link } from 'react-router';
import { EntryThumb } from '../../components/journal/EntryThumb';
import { ThumbStrip } from '../../components/items/ThumbStrip';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Swatch } from '../../components/ui/Chip';
import { ChevronRightIcon } from '../../components/ui/icons';
import {
  categoryLabel,
  getColor,
  materialLabel,
  occasionLabel,
  seasonLabel,
  subcategoryLabel,
  SEASONS,
} from '../../config/tags';
import { db } from '../../db/db';
import { useSetting } from '../../db/settings';
import type { Item, JournalEntry } from '../../db/types';
import { costPerWear, type WearStats } from '../../db/wear';
import { formatDay, formatOwnedFor, formatPartialDate } from '../../lib/dates';
import { formatMoney, plural } from '../../lib/format';
import type { EditorKind } from './editors';
import { FactRow, ProfileSection } from './ProfileSection';

type OpenEditor = (kind: EditorKind) => void;

const join = (labels: string[]) => labels.filter(Boolean).join(', ');

export function BasicsSection({ item, edit }: { item: Item; edit: OpenEditor }) {
  const open = () => edit('basics');
  const allSeasons = SEASONS.every((s) => item.seasons.includes(s.id));
  return (
    <ProfileSection title="Basics" onEdit={open}>
      <FactRow label="Type" onAdd={open}>
        {join([categoryLabel(item.category), item.subcategory ? subcategoryLabel(item.category, item.subcategory) : ''])}
      </FactRow>
      <FactRow label="Colors" onAdd={open}>
        {item.colors.length > 0 && (
          <span className="flex flex-wrap justify-end gap-x-3 gap-y-1">
            {item.colors.map((id) => {
              const c = getColor(id);
              return (
                <span key={id} className="inline-flex items-center gap-1.5">
                  {c && <Swatch color={c} size={14} />}
                  {c?.label ?? id}
                </span>
              );
            })}
          </span>
        )}
      </FactRow>
      <FactRow label="Seasons" onAdd={open}>
        {allSeasons ? 'All seasons' : join(item.seasons.map(seasonLabel))}
      </FactRow>
      <FactRow label="Occasions" onAdd={open}>
        {join(item.occasions.map(occasionLabel))}
      </FactRow>
      <FactRow label="Material" onAdd={open}>
        {materialLabel(item.material)}
      </FactRow>
      <FactRow label="Brand" onAdd={open}>
        {item.brand}
      </FactRow>
      <FactRow label="Size" onAdd={open}>
        {item.size}
      </FactRow>
    </ProfileSection>
  );
}

export function PurchaseSection({ item, edit }: { item: Item; edit: OpenEditor }) {
  const currency = useSetting('currency');
  const open = () => edit('purchase');
  const owned = formatOwnedFor(item.purchaseDate);
  return (
    <ProfileSection title="Purchase" onEdit={open}>
      <FactRow label="Bought" onAdd={open}>
        {item.purchaseDate && (
          <>
            {formatPartialDate(item.purchaseDate)}
            {owned && <span className="block text-xs text-muted">Owned for {owned}</span>}
          </>
        )}
      </FactRow>
      <FactRow label="Price" onAdd={open}>
        {formatMoney(item.price, currency)}
      </FactRow>
      <FactRow label="Where" onAdd={open}>
        {item.boughtAt}
      </FactRow>
      <FactRow label="Condition" onAdd={open}>
        {item.condition && (item.condition === 'new' ? 'New' : 'Secondhand')}
      </FactRow>
    </ProfileSection>
  );
}

export function UsageSection({ item, wear }: { item: Item; wear: WearStats }) {
  const currency = useSetting('currency');
  const looks = useLiveQuery(() => db.looks.where('itemIds').equals(item.id).toArray(), [item.id]);
  const [showLooks, setShowLooks] = useState(false);
  const cpw = costPerWear(item.price, wear.count);
  return (
    <ProfileSection title="Usage">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Times worn" value={String(wear.count)} />
        <Stat
          label="Cost per wear"
          value={cpw === undefined ? '–' : formatMoney(cpw, currency)}
          hint={item.price === undefined ? 'Add a price' : wear.count === 0 ? 'Not worn yet' : undefined}
        />
        <Stat label="First worn" value={wear.first ? formatDay(wear.first) : 'Not yet'} />
        <Stat label="Last worn" value={wear.last ? formatDay(wear.last) : 'Not yet'} />
      </div>
      <button
        onClick={() => setShowLooks(true)}
        disabled={!looks?.length}
        className="tap mt-2 flex w-full items-center justify-between rounded-xl bg-card px-4 py-3 text-left disabled:active:scale-100"
      >
        <span>In {plural(looks?.length ?? 0, 'saved look')}</span>
        {!!looks?.length && <ChevronRightIcon size={18} className="text-muted" />}
      </button>
      <BottomSheet open={showLooks} onClose={() => setShowLooks(false)} title="Looks with this piece">
        <ul className="space-y-3">
          {looks?.map((look) => (
            <li key={look.id}>
              <Link to={`/looks/${look.id}`} className="tap block rounded-2xl border border-line p-3">
                <p className="mb-2 font-medium">{look.name}</p>
                <ThumbStrip itemIds={look.itemIds} />
              </Link>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </ProfileSection>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-card px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-serif text-xl">{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function WearHistorySection({ entries }: { entries: JournalEntry[] }) {
  return (
    <ProfileSection title="Wear history">
      {entries.length === 0 ? (
        <p className="text-sm text-muted">Not in the journal yet. Log it as worn and it shows up here.</p>
      ) : (
        <ul className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2">
          {entries.map((e) => (
            <li key={e.id} className="w-20 shrink-0 snap-start">
              <Link to={`/journal/${e.date}`} className="tap block">
                <EntryThumb entry={e} />
                <p className="mt-1 truncate text-center text-xs text-muted">{formatDay(e.date).replace(/^\w+, /, '')}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ProfileSection>
  );
}

export function NotesSection({ item, edit }: { item: Item; edit: OpenEditor }) {
  return (
    <ProfileSection title="Notes" onEdit={item.notes ? () => edit('notes') : undefined}>
      {item.notes ? (
        <p className="text-[15px] leading-relaxed whitespace-pre-line">{item.notes}</p>
      ) : (
        <button onClick={() => edit('notes')} className="tap text-sm text-accent/80">
          + Add notes: fit, care, the story behind it
        </button>
      )}
    </ProfileSection>
  );
}
