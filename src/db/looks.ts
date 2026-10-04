import { useLiveQuery } from 'dexie-react-hooks';
import { newId } from '../lib/id';
import { db } from './db';
import type { Look } from './types';

export type NewLook = Omit<Look, 'id' | 'createdAt' | 'updatedAt' | 'isDemo'> & Partial<Pick<Look, 'isDemo'>>;

export async function addLook(data: NewLook): Promise<string> {
  const now = Date.now();
  const look: Look = { isDemo: false, ...data, id: newId(), createdAt: now, updatedAt: now };
  await db.looks.add(look);
  return look.id;
}

export async function updateLook(id: string, changes: Partial<Omit<Look, 'id' | 'createdAt'>>): Promise<void> {
  await db.looks.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteLook(id: string): Promise<void> {
  await db.transaction('rw', db.looks, db.journal, async () => {
    await db.looks.delete(id);
    // Journal entries keep their items; they just stop pointing at the deleted look.
    await db.journal
      .where('lookId')
      .equals(id)
      .modify((entry) => {
        delete entry.lookId;
      });
  });
}

export function useLooks(): Look[] | undefined {
  return useLiveQuery(() => db.looks.orderBy('createdAt').reverse().toArray(), []);
}

export function useLook(id: string | undefined): Look | null | undefined {
  return useLiveQuery(async () => (id ? ((await db.looks.get(id)) ?? null) : null), [id]);
}
