import { FORGOTTEN_AFTER_DAYS } from '../config/app';
import {
  categoryLabel,
  colorLabel,
  materialLabel,
  occasionLabel,
  seasonLabel,
  subcategoryLabel,
  SUBCATEGORIES,
  type CategoryId,
  type OccasionId,
  type SeasonId,
} from '../config/tags';
import type { Item } from '../db/types';
import { costPerWear, NO_WEAR, type WearStats } from '../db/wear';
import { daysBetween } from './dates';

export type WearStatus = 'idle' | 'never';

/** Closet filters. Within a group options are OR'ed; groups are AND'ed together. */
export interface ItemFilter {
  query: string;
  categories: CategoryId[];
  subcategories: string[];
  colors: string[];
  seasons: SeasonId[];
  occasions: OccasionId[];
  materials: string[];
  brands: string[];
  favorites: boolean;
  wear: WearStatus[];
}

export const EMPTY_FILTER: ItemFilter = {
  query: '',
  categories: [],
  subcategories: [],
  colors: [],
  seasons: [],
  occasions: [],
  materials: [],
  brands: [],
  favorites: false,
  wear: [],
};

export const WEAR_STATUS_LABELS: Record<WearStatus, string> = {
  idle: `Not worn in ${FORGOTTEN_AFTER_DAYS}+ days`,
  never: 'Never worn',
};

export type SortKey = 'newest' | 'name' | 'most-worn' | 'least-worn' | 'last-worn' | 'price' | 'cpw';

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'name', label: 'Name (A–Z)' },
  { id: 'most-worn', label: 'Most worn' },
  { id: 'least-worn', label: 'Least worn' },
  { id: 'last-worn', label: 'Recently worn' },
  { id: 'price', label: 'Price (high to low)' },
  { id: 'cpw', label: 'Cost per wear (best value)' },
];

const norm = (s: string) => s.toLocaleLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
const anyOf = <T>(selected: T[], values: T[]) => selected.length === 0 || selected.some((v) => values.includes(v));

export function matchesFilter(item: Item, wear: WearStats, f: ItemFilter, today: string): boolean {
  if (f.favorites && !item.favorite) return false;
  if (!anyOf(f.categories, [item.category])) return false;
  // Types only narrow the categories they belong to, so "Tops: shirt" + "Shoes" still shows all shoes.
  if (f.subcategories.length > 0) {
    const ownTypes = f.subcategories.filter((s) => SUBCATEGORIES[item.category]?.some((x) => x.id === s));
    if (ownTypes.length > 0 && !ownTypes.includes(item.subcategory ?? '')) return false;
    if (ownTypes.length === 0 && f.categories.length === 0) return false;
  }
  if (!anyOf(f.colors, item.colors)) return false;
  if (!anyOf(f.seasons, item.seasons)) return false;
  if (!anyOf(f.occasions, item.occasions)) return false;
  if (!anyOf(f.materials, item.material ? [item.material] : [])) return false;
  if (!anyOf(f.brands, item.brand ? [item.brand] : [])) return false;
  if (f.wear.length > 0) {
    const idle = wear.count > 0 && !!wear.last && daysBetween(wear.last, today) >= FORGOTTEN_AFTER_DAYS;
    const never = wear.count === 0;
    if (!((f.wear.includes('idle') && idle) || (f.wear.includes('never') && never))) return false;
  }
  const q = norm(f.query.trim());
  if (q) {
    const haystack = norm([item.name, item.brand ?? '', item.notes ?? ''].join(' '));
    if (!q.split(/\s+/).every((word) => haystack.includes(word))) return false;
  }
  return true;
}

export function sortItems(items: Item[], wearMap: Map<string, WearStats>, sort: SortKey): Item[] {
  const w = (i: Item) => wearMap.get(i.id) ?? NO_WEAR;
  const byName = (a: Item, b: Item) => a.name.localeCompare(b.name);
  // Ascending on a numeric key; pieces without a value always go last.
  const asc = (key: (i: Item) => number | undefined) => (a: Item, b: Item) => {
    const ka = key(a);
    const kb = key(b);
    if (ka === kb) return byName(a, b);
    if (ka === undefined) return 1;
    if (kb === undefined) return -1;
    return ka - kb;
  };
  const cmp: Record<SortKey, (a: Item, b: Item) => number> = {
    newest: (a, b) => b.createdAt - a.createdAt,
    name: byName,
    'most-worn': (a, b) => w(b).count - w(a).count || byName(a, b),
    'least-worn': (a, b) => w(a).count - w(b).count || byName(a, b),
    'last-worn': (a, b) => (w(b).last ?? '').localeCompare(w(a).last ?? '') || byName(a, b),
    price: asc((i) => (i.price === undefined ? undefined : -i.price)),
    // Never-worn pieces have no real cost-per-wear yet, so they rank after worn ones.
    cpw: asc((i) => (w(i).count > 0 ? costPerWear(i.price, w(i).count) : undefined)),
  };
  return [...items].sort(cmp[sort]);
}

export function filterAndSort(
  items: Item[],
  wearMap: Map<string, WearStats>,
  filter: ItemFilter,
  sort: SortKey,
  today: string,
): Item[] {
  return sortItems(
    items.filter((i) => matchesFilter(i, wearMap.get(i.id) ?? NO_WEAR, filter, today)),
    wearMap,
    sort,
  );
}

export interface ActiveChip {
  key: string;
  label: string;
  remove: (f: ItemFilter) => ItemFilter;
}

/** Every active filter as a removable chip (search query excluded; it has its own clear button). */
export function activeChips(f: ItemFilter): ActiveChip[] {
  const chips: ActiveChip[] = [];
  const list = <K extends keyof ItemFilter>(key: K, label: (id: string) => string) => {
    for (const id of f[key] as string[]) {
      chips.push({
        key: `${key}:${id}`,
        label: label(id),
        remove: (cur) => ({ ...cur, [key]: (cur[key] as string[]).filter((x) => x !== id) }),
      });
    }
  };
  if (f.favorites) chips.push({ key: 'favorites', label: 'Favorites', remove: (cur) => ({ ...cur, favorites: false }) });
  list('wear', (id) => WEAR_STATUS_LABELS[id as WearStatus]);
  list('categories', categoryLabel);
  list('subcategories', subcategoryLabelAny);
  list('colors', colorLabel);
  list('seasons', seasonLabel);
  list('occasions', occasionLabel);
  list('materials', materialLabel);
  list('brands', (b) => b);
  return chips;
}

function subcategoryLabelAny(id: string): string {
  for (const cat of Object.keys(SUBCATEGORIES) as CategoryId[]) {
    if (SUBCATEGORIES[cat].some((s) => s.id === id)) return subcategoryLabel(cat, id);
  }
  return id;
}

export function isFilterEmpty(f: ItemFilter): boolean {
  return activeChips(f).length === 0 && !f.query.trim();
}
