import { addDays, todayISO } from '../../lib/dates';
import { newId } from '../../lib/id';
import { db } from '../db';
import { getSetting, setSetting } from '../settings';
import type { Item, JournalEntry, Look } from '../types';
import { ENTRIES, ITEMS, LOOKS } from './demoData';
import { garmentPhotoSvg, garmentSvg, svgBlob } from './garments';

const BACKDROPS = ['#d9d0c3', '#b9a78f', '#c8ccd2', '#e2dbcf', '#a9b3a4'];

export async function seedDemoData(): Promise<void> {
  const now = Date.now();
  const today = todayISO();
  const ids = new Map<string, string>();

  const items: Item[] = ITEMS.map((d, i) => {
    const id = newId();
    ids.set(d.key, id);
    const { key: _key, art, favorite, ...fields } = d;
    const cutout = svgBlob(garmentSvg(art));
    // Spread "added" dates over the past few months so "newest" sorting is meaningful.
    const createdAt = now - (40 + i * 5) * 86_400_000;
    return {
      ...fields,
      id,
      favorite: favorite ?? false,
      photoOriginal: svgBlob(garmentPhotoSvg(art, BACKDROPS[i % BACKDROPS.length])),
      photoCutout: cutout,
      preferOriginal: false,
      thumbnail: cutout,
      isDemo: true,
      createdAt,
      updatedAt: createdAt,
    };
  });

  const looks: Look[] = LOOKS.map((l, i) => ({
    id: newId(),
    name: l.name,
    itemIds: l.items.map((k) => ids.get(k)!),
    occasions: l.occasions,
    seasons: l.seasons,
    isDemo: true,
    createdAt: now - (40 - i) * 86_400_000,
    updatedAt: now - (40 - i) * 86_400_000,
  }));

  const entries: JournalEntry[] = ENTRIES.map((e) => {
    const look = e.look !== undefined ? looks[e.look] : undefined;
    const date = addDays(today, -e.daysAgo);
    return {
      id: newId(),
      date,
      itemIds: look ? [...look.itemIds] : e.items!.map((k) => ids.get(k)!),
      lookId: look?.id,
      rating: e.rating,
      occasion: e.occasion,
      note: e.note,
      isDemo: true,
      createdAt: now - e.daysAgo * 86_400_000,
      updatedAt: now - e.daysAgo * 86_400_000,
    };
  });

  await db.transaction('rw', db.items, db.looks, db.journal, db.settings, async () => {
    // Never overwrite a real journal day with a demo one.
    const taken = new Set((await db.journal.toArray()).map((e) => e.date));
    await db.items.bulkAdd(items);
    await db.looks.bulkAdd(looks);
    await db.journal.bulkAdd(entries.filter((e) => !taken.has(e.date)));
    await setSetting('demoSeeded', true);
  });
}

/** Seeds on the very first launch only (so removed demo data never comes back on its own). */
export async function ensureSeeded(): Promise<void> {
  if (await getSetting('demoSeeded')) return;
  if ((await db.items.count()) > 0) {
    await setSetting('demoSeeded', true);
    return;
  }
  await seedDemoData();
}

export async function hasDemoData(): Promise<boolean> {
  const [i, l, j] = await Promise.all([
    db.items.filter((x) => x.isDemo).count(),
    db.looks.filter((x) => x.isDemo).count(),
    db.journal.filter((x) => x.isDemo).count(),
  ]);
  return i + l + j > 0;
}

/** Removes all demo records, and strips demo pieces from any looks/entries I created myself. */
export async function removeDemoData(): Promise<void> {
  await db.transaction('rw', db.items, db.looks, db.journal, async () => {
    const demoItems = new Set((await db.items.toArray()).filter((i) => i.isDemo).map((i) => i.id));
    const demoLooks = new Set((await db.looks.toArray()).filter((l) => l.isDemo).map((l) => l.id));
    await db.items.bulkDelete([...demoItems]);
    await db.looks.bulkDelete([...demoLooks]);
    await db.journal.filter((e) => e.isDemo).delete();
    await db.looks.toCollection().modify((l) => {
      l.itemIds = l.itemIds.filter((id) => !demoItems.has(id));
    });
    await db.journal.toCollection().modify((e) => {
      e.itemIds = e.itemIds.filter((id) => !demoItems.has(id));
      if (e.lookId && demoLooks.has(e.lookId)) delete e.lookId;
    });
  });
}
