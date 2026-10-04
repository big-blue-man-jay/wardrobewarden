import { useLiveQuery } from 'dexie-react-hooks';
import { newId } from '../lib/id';
import { db } from './db';
import type { JournalEntry } from './types';

export type EntryData = Omit<JournalEntry, 'id' | 'date' | 'createdAt' | 'updatedAt' | 'isDemo'> &
  Partial<Pick<JournalEntry, 'isDemo'>>;

/** Creates or replaces the entry for a day (one entry per day). */
export async function saveEntry(date: string, data: EntryData): Promise<string> {
  return db.transaction('rw', db.journal, async () => {
    const existing = await db.journal.where('date').equals(date).first();
    const now = Date.now();
    const entry: JournalEntry = {
      isDemo: false,
      ...data,
      id: existing?.id ?? newId(),
      date,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await db.journal.put(entry);
    return entry.id;
  });
}

export async function deleteEntry(date: string): Promise<void> {
  await db.journal.where('date').equals(date).delete();
}

export function useJournal(): JournalEntry[] | undefined {
  return useLiveQuery(() => db.journal.orderBy('date').reverse().toArray(), []);
}

export function useEntry(date: string | undefined): JournalEntry | null | undefined {
  return useLiveQuery(
    async () => (date ? ((await db.journal.where('date').equals(date).first()) ?? null) : null),
    [date],
  );
}

/** Adds pieces to a day's entry, creating the entry if needed. Returns false if all were already logged. */
export async function addItemsToDay(date: string, itemIds: string[]): Promise<boolean> {
  return db.transaction('rw', db.journal, async () => {
    const existing = await db.journal.where('date').equals(date).first();
    if (!existing) {
      await saveEntry(date, { itemIds });
      return true;
    }
    const missing = itemIds.filter((id) => !existing.itemIds.includes(id));
    if (missing.length === 0) return false;
    await db.journal.update(existing.id, { itemIds: [...existing.itemIds, ...missing], updatedAt: Date.now() });
    return true;
  });
}

/** Sets (or replaces) a day's outfit photo, keeping the pieces already logged. */
export async function setDayPhoto(date: string, photo: Blob, photoThumb: Blob): Promise<void> {
  await db.transaction('rw', db.journal, async () => {
    const existing = await db.journal.where('date').equals(date).first();
    if (existing) await db.journal.update(existing.id, { photo, photoThumb, updatedAt: Date.now() });
    else await saveEntry(date, { itemIds: [], photo, photoThumb });
  });
}

/** Entries between two dates (inclusive), keyed by date. */
export function useEntriesBetween(from: string, to: string): Map<string, JournalEntry> | undefined {
  return useLiveQuery(
    async () => new Map((await db.journal.where('date').between(from, to, true, true).toArray()).map((e) => [e.date, e])),
    [from, to],
  );
}

/** Logs a saved look on a day, replacing that day's pieces but keeping its photo, rating and note. */
export async function logLookOnDay(date: string, look: { id: string; itemIds: string[] }): Promise<void> {
  await db.transaction('rw', db.journal, async () => {
    const existing = await db.journal.where('date').equals(date).first();
    if (existing) await db.journal.update(existing.id, { itemIds: [...look.itemIds], lookId: look.id, updatedAt: Date.now() });
    else await saveEntry(date, { itemIds: [...look.itemIds], lookId: look.id });
  });
}
