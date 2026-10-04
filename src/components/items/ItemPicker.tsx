import { useMemo, useState } from 'react';
import type { Item } from '../../db/types';
import { useWearMap } from '../../db/wear';
import { todayISO } from '../../lib/dates';
import { activeChips, EMPTY_FILTER, filterAndSort, type ItemFilter } from '../../lib/filters';
import { plural } from '../../lib/format';
import { ActiveFilterChips } from '../filters/ActiveFilterChips';
import { FilterSheet } from '../filters/FilterSheet';
import { SearchBar } from '../filters/SearchBar';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { CheckIcon, SlidersIcon } from '../ui/icons';
import { ItemThumb } from './ItemThumb';

interface Props {
  open: boolean;
  title: string;
  /** Pieces allowed here (e.g. only shoes for the shoes slot). */
  candidates: Item[];
  selected: string[];
  multiple?: boolean;
  onChange: (ids: string[]) => void;
  onClose: () => void;
}

/** Drawer for choosing pieces, with the same search and filters as the closet. */
export function ItemPicker({ open, title, candidates, selected, multiple, onChange, onClose }: Props) {
  const wear = useWearMap();
  const [filter, setFilter] = useState<ItemFilter>(EMPTY_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const visible = useMemo(
    () => (wear ? filterAndSort(candidates, wear, filter, 'most-worn', todayISO()) : candidates),
    [candidates, wear, filter],
  );
  const count = activeChips(filter).length;

  const tap = (id: string) => {
    if (multiple) onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
    else {
      onChange(selected[0] === id ? [] : [id]);
      onClose();
    }
  };

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={title}>
        <div className="sticky top-14 z-10 -mx-5 space-y-2 bg-card px-5 pb-3">
          <div className="flex items-center gap-2">
            <SearchBar value={filter.query} onChange={(query) => setFilter({ ...filter, query })} />
            <button
              onClick={() => setFilterOpen(true)}
              aria-label="Filter"
              className={`tap relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${count ? 'border-ink bg-ink text-paper' : 'border-line'}`}
            >
              <SlidersIcon size={20} />
              {!!count && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] text-paper">
                  {count}
                </span>
              )}
            </button>
          </div>
          <ActiveFilterChips filter={filter} onChange={setFilter} onClear={() => setFilter({ ...EMPTY_FILTER, query: filter.query })} />
        </div>

        {candidates.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No pieces for this slot yet. Add some in the closet first.</p>
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No pieces match these filters.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-2.5">
            {visible.map((item) => {
              const isSel = selected.includes(item.id);
              return (
                <li key={item.id}>
                  <button onClick={() => tap(item.id)} className="tap relative block w-full text-left" aria-pressed={isSel}>
                    <ItemThumb item={item} className={isSel ? 'ring-2 ring-ink ring-offset-2 ring-offset-card' : ''} />
                    {isSel && (
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-ink p-0.5 text-paper">
                        <CheckIcon size={14} />
                      </span>
                    )}
                    <p className="mt-1 truncate text-xs">{item.name}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="sticky bottom-0 -mx-5 mt-4 flex gap-2 border-t border-line bg-card px-5 pt-3">
          {!multiple && selected.length > 0 && (
            <Button
              variant="ghost"
              className="text-accent"
              onClick={() => {
                onChange([]);
                onClose();
              }}
            >
              Remove
            </Button>
          )}
          <Button className="flex-1" onClick={onClose}>
            {multiple ? `Done${selected.length ? ` (${plural(selected.length, 'piece')})` : ''}` : 'Close'}
          </Button>
        </div>
      </BottomSheet>
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filter={filter}
        onChange={setFilter}
        items={candidates}
        resultCount={visible.length}
      />
    </>
  );
}
