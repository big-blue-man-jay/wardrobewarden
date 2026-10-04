import { db } from './db';
import { buildBackup, parseBackup, type BackupData, type BackupSummary } from './backup';
import { setSetting } from './settings';

/** Settings that describe this device rather than my wardrobe, so they aren't exported. */
const DEVICE_SETTINGS = new Set(['lastBackupAt']);

export async function exportAll(): Promise<{ bytes: Uint8Array; summary: BackupSummary }> {
  const [items, looks, journal, settings] = await Promise.all([
    db.items.toArray(),
    db.looks.toArray(),
    db.journal.toArray(),
    db.settings.toArray(),
  ]);
  const data: BackupData = { items, looks, journal, settings: settings.filter((s) => !DEVICE_SETTINGS.has(s.key)) };
  const bytes = await buildBackup(data);
  await setSetting('lastBackupAt', Date.now());
  return {
    bytes,
    summary: {
      exportedAt: new Date().toISOString(),
      items: items.length,
      looks: looks.length,
      entries: journal.length,
    },
  };
}

/** Reads a backup without touching the database (to show a confirmation first). */
export const readBackup = parseBackup;

/** Replaces everything on this device with the backup's contents. */
export async function importAll(data: BackupData): Promise<void> {
  await db.transaction('rw', db.items, db.looks, db.journal, db.settings, async () => {
    const keep = (await db.settings.toArray()).filter((s) => DEVICE_SETTINGS.has(s.key));
    await Promise.all([db.items.clear(), db.looks.clear(), db.journal.clear(), db.settings.clear()]);
    await db.items.bulkAdd(data.items);
    await db.looks.bulkAdd(data.looks);
    await db.journal.bulkAdd(data.journal);
    await db.settings.bulkPut([...data.settings.filter((s) => !DEVICE_SETTINGS.has(s.key)), ...keep]);
    // Never re-seed demo data on top of an imported closet.
    await db.settings.put({ key: 'demoSeeded', value: true });
  });
}
