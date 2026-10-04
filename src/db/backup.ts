import { strFromU8, strToU8, unzip, zip, type Zippable } from 'fflate';
import type { Item, JournalEntry, Look, SettingRow } from './types';

/**
 * Backup format: a .zip with `data.json` (all records) and `images/…` (every photo as its own file).
 * Pure functions here (testable); reading/writing the database lives in backupDb.ts.
 */

export const BACKUP_FORMAT = 'wardrobe-warden-backup';
export const BACKUP_VERSION = 1;

export interface BackupData {
  items: Item[];
  looks: Look[];
  journal: JournalEntry[];
  settings: SettingRow[];
}

type BlobKeys<T> = { [K in keyof T]-?: NonNullable<T[K]> extends Blob ? K : never }[keyof T];
type Serialized<T> = Omit<T, BlobKeys<T>> & { [K in BlobKeys<T>]?: string };

interface Manifest {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  items: Serialized<Item>[];
  looks: Look[];
  journal: Serialized<JournalEntry>[];
  settings: SettingRow[];
}

const ITEM_BLOBS = ['photoOriginal', 'photoCutout', 'thumbnail'] as const;
const ENTRY_BLOBS = ['photo', 'photoThumb'] as const;

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};
const MIME = Object.fromEntries(Object.entries(EXT).map(([m, e]) => [e, m]));

function promisify<T>(fn: (cb: (err: Error | null, data: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => fn((err, data) => (err ? reject(err) : resolve(data))));
}

export interface BackupSummary {
  exportedAt: string;
  items: number;
  looks: number;
  entries: number;
}

export async function buildBackup(data: BackupData, now = new Date()): Promise<Uint8Array> {
  const files: Zippable = {};
  const addBlob = async (owner: string, field: string, blob: Blob | undefined) => {
    if (!blob) return undefined;
    const path = `images/${owner}-${field}.${EXT[blob.type] ?? 'bin'}`;
    files[path] = [new Uint8Array(await blob.arrayBuffer()), { level: 0 }]; // photos are already compressed
    return path;
  };
  const serialize = async <T extends { id: string }>(record: T, keys: readonly string[]) => {
    const out: Record<string, unknown> = { ...record };
    for (const k of keys)
      out[k] = await addBlob(record.id, k, (record as Record<string, unknown>)[k] as Blob | undefined);
    return out;
  };
  const manifest: Manifest = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    items: (await Promise.all(data.items.map((i) => serialize(i, ITEM_BLOBS)))) as Serialized<Item>[],
    looks: data.looks,
    journal: (await Promise.all(data.journal.map((e) => serialize(e, ENTRY_BLOBS)))) as Serialized<JournalEntry>[],
    settings: data.settings,
  };
  files['data.json'] = [strToU8(JSON.stringify(manifest, null, 1)), { level: 6 }];
  return promisify<Uint8Array>((cb) => zip(files, cb));
}

export class BackupError extends Error {}

export async function parseBackup(bytes: Uint8Array): Promise<{ data: BackupData; summary: BackupSummary }> {
  let files: Record<string, Uint8Array>;
  try {
    files = await promisify<Record<string, Uint8Array>>((cb) => unzip(bytes, cb));
  } catch {
    throw new BackupError("That file isn't a zip backup.");
  }
  if (!files['data.json']) throw new BackupError('No data.json in this zip. Is it a Wardrobe Warden backup?');
  let manifest: Manifest;
  try {
    manifest = JSON.parse(strFromU8(files['data.json']));
  } catch {
    throw new BackupError('The backup data is damaged.');
  }
  if (manifest.format !== BACKUP_FORMAT) throw new BackupError("This zip isn't a Wardrobe Warden backup.");
  if (manifest.version > BACKUP_VERSION) throw new BackupError('This backup is from a newer version of the app.');
  if (!Array.isArray(manifest.items) || !Array.isArray(manifest.looks) || !Array.isArray(manifest.journal)) {
    throw new BackupError('The backup data is incomplete.');
  }

  const toBlob = (path: string | undefined, required: boolean, what: string): Blob | undefined => {
    if (!path) {
      if (required) throw new BackupError(`Missing photo for ${what}.`);
      return undefined;
    }
    const content = files[path];
    if (!content) throw new BackupError(`Photo ${path} is missing from the backup.`);
    return new Blob([content.slice()], { type: MIME[path.split('.').pop() ?? ''] ?? 'application/octet-stream' });
  };

  const items: Item[] = manifest.items.map((s) => ({
    ...(s as Omit<Item, 'photoOriginal' | 'photoCutout' | 'thumbnail'>),
    photoOriginal: toBlob(s.photoOriginal, true, s.name)!,
    photoCutout: toBlob(s.photoCutout, false, s.name),
    thumbnail: toBlob(s.thumbnail, true, s.name)!,
  }));
  const journal: JournalEntry[] = manifest.journal.map((s) => ({
    ...(s as Omit<JournalEntry, 'photo' | 'photoThumb'>),
    photo: toBlob(s.photo, false, s.date),
    photoThumb: toBlob(s.photoThumb, false, s.date),
  }));

  return {
    data: { items, looks: manifest.looks, journal, settings: manifest.settings ?? [] },
    summary: {
      exportedAt: manifest.exportedAt,
      items: items.length,
      looks: manifest.looks.length,
      entries: journal.length,
    },
  };
}
