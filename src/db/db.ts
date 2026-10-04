import Dexie, { type EntityTable } from 'dexie';
import type { Item, JournalEntry, Look, SettingRow } from './types';

export class WardrobeDB extends Dexie {
  items!: EntityTable<Item, 'id'>;
  looks!: EntityTable<Look, 'id'>;
  journal!: EntityTable<JournalEntry, 'id'>;
  settings!: EntityTable<SettingRow, 'key'>;

  constructor() {
    // Dexie's optimistic live-query cache occasionally served a deleted look after an add → update → delete
    // sequence; with a personal-sized closet, plain re-querying is fast enough and always correct.
    super('wardrobe-warden', { cache: 'disabled' });
    // Only indexed fields are listed (booleans can't be IndexedDB keys, so isDemo/favorite aren't indexed). Add a new version() block for schema changes; never edit old ones.
    this.version(1).stores({
      items: 'id, category, createdAt',
      looks: 'id, createdAt, *itemIds',
      journal: 'id, &date, lookId, *itemIds',
      settings: 'key',
    });
  }
}

export const db = new WardrobeDB();

/** Ask the browser not to evict our data under storage pressure. Best effort. */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    // ignore: not supported or denied
  }
}
