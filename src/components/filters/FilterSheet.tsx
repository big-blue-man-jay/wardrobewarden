import { useMemo } from 'react';
import {
  CATEGORIES,
  COLORS,
  MATERIALS,
  OCCASIONS,
  SEASONS,
  SUBCATEGORIES,
  categoryLabel,
  type CategoryId,
} from '../../config/tags';
import type { Item } from '../../db/types';
import { activeChips, EMPTY_FILTER, WEAR_STATUS_LABELS, type ItemFilter, type WearStatus } from '../../lib/filters';
import { plural } from '../../lib/format';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Chip, ChipMulti, FieldLabel, Swatch } from '../ui/Chip';

interface Props {
  open: boolean;
  onClose: () => void;
  filter: ItemFilter;
  onChange: (f: ItemFilter) => void;
  /** All pieces (for the brand list). */
  items: Item[];
  resultCount: number;
}

const WEAR_OPTIONS = (Object.keys(WEAR_STATUS_LABELS) as WearStatus[]).map((id) => ({ id, label: WEAR_STATUS_LABELS[id] }));

/** Every filter group as chips. Changes apply immediately; the button shows the live result count. */
export function FilterSheet({ open, onClose, filter: f, onChange, items, resultCount }: Props) {
  const set = <K extends keyof ItemFilter>(key: K, value: ItemFilter[K]) => onChange({ ...f, [key]: value });
  const brands = useMemo(
    () => [...new Set(items.map((i) => i.brand?.trim()).filter((b): b is string => !!b))].sort((a, b) => a.localeCompare(b)),
    [items],
  );

  const setCategories = (cats: CategoryId[]) => {
    // Drop types whose category is no longer selected.
    const allowed = new Set(cats.flatMap((c) => SUBCATEGORIES[c].map((s) => s.id)));
    onChange({ ...f, categories: cats, subcategories: f.subcategories.filter((s) => allowed.has(s)) });
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Filter">
      <div className="space-y-6">
        <section>
          <FieldLabel>Show</FieldLabel>
          <div className="flex flex-wrap gap-2">
            <Chip selected={f.favorites} onClick={() => set('favorites', !f.favorites)}>
              Favorites
            </Chip>
            {WEAR_OPTIONS.map((o) => (
              <Chip
                key={o.id}
                selected={f.wear.includes(o.id)}
                onClick={() => set('wear', f.wear.includes(o.id) ? f.wear.filter((w) => w !== o.id) : [...f.wear, o.id])}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <FieldLabel>Category</FieldLabel>
          <ChipMulti options={CATEGORIES} value={f.categories} onChange={setCategories} />
        </section>

        {f.categories.map((cat) => (
          <section key={cat}>
            <FieldLabel>{categoryLabel(cat)} type</FieldLabel>
            <ChipMulti
              options={SUBCATEGORIES[cat]}
              value={f.subcategories}
              onChange={(v) => set('subcategories', v)}
            />
          </section>
        ))}

        <section>
          <FieldLabel>Colors</FieldLabel>
          <ChipMulti
            options={COLORS}
            value={f.colors}
            onChange={(v) => set('colors', v)}
            render={(c) => (
              <>
                <Swatch color={c} />
                {c.label}
              </>
            )}
          />
        </section>

        <section>
          <FieldLabel>Season</FieldLabel>
          <ChipMulti options={SEASONS} value={f.seasons} onChange={(v) => set('seasons', v)} />
        </section>

        <section>
          <FieldLabel>Occasion</FieldLabel>
          <ChipMulti options={OCCASIONS} value={f.occasions} onChange={(v) => set('occasions', v)} />
        </section>

        <section>
          <FieldLabel>Material</FieldLabel>
          <ChipMulti options={MATERIALS} value={f.materials} onChange={(v) => set('materials', v)} />
        </section>

        {brands.length > 0 && (
          <section>
            <FieldLabel>Brand</FieldLabel>
            <ChipMulti options={brands.map((b) => ({ id: b, label: b }))} value={f.brands} onChange={(v) => set('brands', v)} />
          </section>
        )}
      </div>

      <div className="sticky bottom-0 -mx-5 mt-6 grid grid-cols-[auto_1fr] gap-2 border-t border-line bg-card px-5 pt-3">
        <Button
          variant="ghost"
          disabled={activeChips(f).length === 0}
          onClick={() => onChange({ ...EMPTY_FILTER, query: f.query })}
        >
          Clear
        </Button>
        <Button onClick={onClose}>Show {plural(resultCount, 'piece')}</Button>
      </div>
    </BottomSheet>
  );
}
