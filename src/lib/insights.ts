import { FORGOTTEN_AFTER_DAYS } from '../config/app';
import { CATEGORIES, COLORS, type CategoryId } from '../config/tags';
import type { Item, JournalEntry } from '../db/types';
import { costPerWear, daysIdle, NO_WEAR, type WearStats } from '../db/wear';
import { addMonths, daysBetween, monthKey } from './dates';

export interface Ranked {
  item: Item;
  wear: WearStats;
  cpw?: number;
  idle: number;
}

export interface Insights {
  totalItems: number;
  totalValue: number;
  pricedItems: number;
  /** Average cost per wear over priced pieces that have been worn. */
  avgCpw?: number;
  byCategory: { id: CategoryId; label: string; count: number }[];
  /** By main color, in palette order; only colors that occur. */
  byColor: { id: string; count: number }[];
  /** Every piece, ordered by its main color (palette order) for the palette grid. */
  palette: Item[];
  idle: Ranked[]; // worn before, not in 60+ days (longest idle first)
  neverWorn: Ranked[]; // oldest first
  mostWorn: Ranked[];
  leastWorn: Ranked[];
  bestValue: Ranked[]; // lowest cost per wear, worn & priced
  worstValue: Ranked[]; // highest cost per wear; never-worn priced pieces count at full price
}

const COLOR_ORDER = new Map(COLORS.map((c, i) => [c.id, i]));
const colorRank = (i: Item) => COLOR_ORDER.get(i.colors[0] ?? '') ?? COLORS.length;

export function computeInsights(items: Item[], wearMap: Map<string, WearStats>, today: string, top = 5): Insights {
  const ranked: Ranked[] = items.map((item) => {
    const wear = wearMap.get(item.id) ?? NO_WEAR;
    return { item, wear, cpw: costPerWear(item.price, wear.count), idle: daysIdle(item, wear, today) };
  });
  const priced = ranked.filter((r) => r.item.price !== undefined);
  const wornPriced = priced.filter((r) => r.wear.count > 0);
  const byName = (a: Ranked, b: Ranked) => a.item.name.localeCompare(b.item.name);

  const colorCounts = new Map<string, number>();
  for (const i of items) if (i.colors[0]) colorCounts.set(i.colors[0], (colorCounts.get(i.colors[0]) ?? 0) + 1);

  return {
    totalItems: items.length,
    totalValue: priced.reduce((s, r) => s + r.item.price!, 0),
    pricedItems: priced.length,
    avgCpw: wornPriced.length ? wornPriced.reduce((s, r) => s + r.cpw!, 0) / wornPriced.length : undefined,
    byCategory: CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      count: items.filter((i) => i.category === c.id).length,
    }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count),
    byColor: COLORS.filter((c) => colorCounts.has(c.id)).map((c) => ({ id: c.id, count: colorCounts.get(c.id)! })),
    palette: [...items].sort((a, b) => colorRank(a) - colorRank(b) || a.name.localeCompare(b.name)),
    idle: ranked
      .filter((r) => r.wear.count > 0 && daysBetween(r.wear.last!, today) >= FORGOTTEN_AFTER_DAYS)
      .sort((a, b) => b.idle - a.idle),
    neverWorn: ranked.filter((r) => r.wear.count === 0).sort((a, b) => a.item.createdAt - b.item.createdAt),
    mostWorn: ranked
      .filter((r) => r.wear.count > 0)
      .sort((a, b) => b.wear.count - a.wear.count || byName(a, b))
      .slice(0, top),
    leastWorn: [...ranked].sort((a, b) => a.wear.count - b.wear.count || b.idle - a.idle || byName(a, b)).slice(0, top),
    bestValue: [...wornPriced].sort((a, b) => a.cpw! - b.cpw! || byName(a, b)).slice(0, top),
    worstValue: [...priced].sort((a, b) => b.cpw! - a.cpw! || byName(a, b)).slice(0, top),
  };
}

/** Days logged per month for the last `months` months (oldest first), plus each month's length. */
export function loggedPerMonth(entries: Pick<JournalEntry, 'date'>[], today: string, months = 6) {
  const current = monthKey(today);
  const counts = new Map<string, number>();
  for (const e of entries) counts.set(monthKey(e.date), (counts.get(monthKey(e.date)) ?? 0) + 1);
  return Array.from({ length: months }, (_, i) => {
    const month = addMonths(current, i - months + 1);
    const [y, m] = month.split('-').map(Number);
    const days = month === current ? Number(today.slice(8, 10)) : new Date(y, m, 0).getDate();
    return { month, count: counts.get(month) ?? 0, days, current: month === current };
  });
}

// ---- Duplicate check ----

/** Pieces with the same category, type and main color. */
export function findSimilar(
  items: Item[],
  draft: { category?: CategoryId; subcategory?: string; colors: string[] },
): Item[] {
  if (!draft.category || draft.colors.length === 0) return [];
  return items.filter(
    (i) =>
      i.category === draft.category &&
      (i.subcategory ?? '') === (draft.subcategory ?? '') &&
      i.colors[0] === draft.colors[0],
  );
}

const UNCOUNTABLE = new Set(['jewelry']);

/** "t-shirt" → "t-shirts", "watch" → "watches", "jeans" stays "jeans". */
export function pluralize(word: string): string {
  const last = word.split(' ').pop()!;
  if (UNCOUNTABLE.has(last)) return word;
  if (/(ss|ch|sh|x)$/.test(word)) return `${word}es`;
  if (word.endsWith('s')) return word;
  return `${word}s`;
}
