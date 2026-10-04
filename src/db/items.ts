import { useLiveQuery } from 'dexie-react-hooks';
import { newId } from '../lib/id';
import { db } from './db';
import type { Item } from './types';

export type NewItem = Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'favorite'> &
  Partial<Pick<Item, 'favorite' | 'isDemo'>>;

export async function addItem(data: NewItem): Promise<string> {
  const now = Date.now();
  const item: Item = { favorite: false, isDemo: false, ...data, id: newId(), createdAt: now, updatedAt: now };
  await db.items.add(item);
  return item.id;
}

export async function updateItem(id: string, changes: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<void> {
  await db.items.update(id, { ...changes, updatedAt: Date.now() });
}

/** Where a piece is referenced, so delete can warn about it. */
export async function itemUsage(id: string): Promise<{ looks: number; entries: number }> {
  const [looks, entries] = await Promise.all([
    db.looks.where('itemIds').equals(id).count(),
    db.journal.where('itemIds').equals(id).count(),
  ]);
  return { looks, entries };
}

/** Deletes the piece and removes it from every look and journal entry. */
export async function deleteItem(id: string): Promise<void> {
  await db.transaction('rw', db.items, db.looks, db.journal, async () => {
    await db.items.delete(id);
    await db.looks
      .where('itemIds')
      .equals(id)
      .modify((look) => {
        look.itemIds = look.itemIds.filter((x) => x !== id);
      });
    await db.journal
      .where('itemIds')
      .equals(id)
      .modify((entry) => {
        entry.itemIds = entry.itemIds.filter((x) => x !== id);
      });
  });
}

export function useItems(): Item[] | undefined {
  return useLiveQuery(() => db.items.orderBy('createdAt').reverse().toArray(), []);
}

export function useItem(id: string | undefined): Item | null | undefined {
  return useLiveQuery(async () => (id ? ((await db.items.get(id)) ?? null) : null), [id]);
}
