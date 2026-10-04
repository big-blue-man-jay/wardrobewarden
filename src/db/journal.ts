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
