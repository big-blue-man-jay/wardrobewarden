import { useLiveQuery } from 'dexie-react-hooks';
import { FORGOTTEN_AFTER_DAYS } from '../config/app';
import { daysBetween, toISODate, todayISO } from '../lib/dates';
import { db } from './db';
import type { Item, JournalEntry } from './types';

/** Everything about how often a piece is worn — always derived from journal entries. */
export interface WearStats {
  count: number;
  first?: string; // 'YYYY-MM-DD'
  last?: string;
}

export const NO_WEAR: WearStats = { count: 0 };

export function wearByItem(entries: Pick<JournalEntry, 'date' | 'itemIds'>[]): Map<string, WearStats> {
  const map = new Map<string, WearStats>();
  for (const e of entries) {
    for (const id of new Set(e.itemIds)) {
      const s = map.get(id);
      if (!s) map.set(id, { count: 1, first: e.date, last: e.date });
      else {
        s.count += 1;
        if (e.date < s.first!) s.first = e.date;
        if (e.date > s.last!) s.last = e.date;
      }
    }
  }
  return map;
}

/** Price ÷ times worn. Undefined without a price; equals the price until first worn. */
export function costPerWear(price: number | undefined, count: number): number | undefined {
  if (price === undefined) return undefined;
  return count > 0 ? price / count : price;
}

/** Days since last worn; if never worn, days since the piece was added. */
export function daysIdle(item: Pick<Item, 'createdAt'>, wear: WearStats, today = todayISO()): number {
  const since = wear.last ?? toISODate(new Date(item.createdAt));
  return Math.max(0, daysBetween(since, today));
}

export function isForgotten(item: Pick<Item, 'createdAt'>, wear: WearStats, today = todayISO()): boolean {
  return daysIdle(item, wear, today) >= FORGOTTEN_AFTER_DAYS;
}

/** Wear stats for every piece, kept live. */
export function useWearMap(): Map<string, WearStats> | undefined {
  return useLiveQuery(async () => wearByItem(await db.journal.toArray()), []);
}

/** Journal entries a piece appears in, newest first. */
export function useItemEntries(itemId: string | undefined): JournalEntry[] | undefined {
  return useLiveQuery(
    async () => {
      if (!itemId) return [];
      const entries = await db.journal.where('itemIds').equals(itemId).toArray();
      return entries.sort((a, b) => b.date.localeCompare(a.date));
    },
    [itemId],
  );
}
