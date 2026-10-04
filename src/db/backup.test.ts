import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { buildBackup, parseBackup, BackupError, type BackupData } from './backup';
import type { Item, JournalEntry, Look } from './types';

const jpeg = new Blob([new Uint8Array([0xff, 0xd8, 1, 2, 3])], { type: 'image/jpeg' });
const png = new Blob([new Uint8Array([0x89, 0x50, 9, 9])], { type: 'image/png' });

const item: Item = {
  id: 'i1',
  name: 'Black jeans',
  category: 'bottom',
  subcategory: 'jeans',
  colors: ['black'],
  seasons: ['winter'],
  occasions: ['casual'],
  price: 80,
  purchaseDate: '2023-05',
  favorite: true,
  photoOriginal: jpeg,
  photoCutout: png,
  preferOriginal: false,
  thumbnail: png,
  isDemo: false,
  createdAt: 1,
  updatedAt: 2,
};
const look: Look = {
  id: 'l1',
  name: 'Easy',
  itemIds: ['i1'],
  occasions: [],
  seasons: [],
  isDemo: false,
  createdAt: 1,
  updatedAt: 1,
};
const entry: JournalEntry = {
  id: 'j1',
  date: '2026-10-01',
  itemIds: ['i1'],
  photo: jpeg,
  photoThumb: jpeg,
  rating: 4,
  isDemo: false,
  createdAt: 1,
  updatedAt: 1,
};
const data: BackupData = {
  items: [item],
  looks: [look],
  journal: [entry, { ...entry, id: 'j2', date: '2026-10-02', photo: undefined, photoThumb: undefined }],
  settings: [{ key: 'currency', value: 'EUR' }],
};

describe('backup', () => {
  it('round-trips records and photos', async () => {
    const bytes = await buildBackup(data, new Date('2026-10-04T10:00:00Z'));
    const { data: back, summary } = await parseBackup(bytes);
    expect(summary).toEqual({ exportedAt: '2026-10-04T10:00:00.000Z', items: 1, looks: 1, entries: 2 });
    const [i] = back.items;
    expect({ ...i, photoOriginal: 0, photoCutout: 0, thumbnail: 0 }).toEqual({
      ...item,
      photoOriginal: 0,
      photoCutout: 0,
      thumbnail: 0,
    });
    expect(i.photoOriginal.type).toBe('image/jpeg');
    expect(new Uint8Array(await i.photoCutout!.arrayBuffer())).toEqual(new Uint8Array([0x89, 0x50, 9, 9]));
    expect(back.journal[1].photo).toBeUndefined();
    expect(back.looks).toEqual([look]);
    expect(back.settings).toEqual(data.settings);
  });

  it('rejects files that are not backups', async () => {
    await expect(parseBackup(new Uint8Array([1, 2, 3]))).rejects.toBeInstanceOf(BackupError);
    await expect(parseBackup(zipSync({ 'data.json': strToU8('{"format":"other"}') }))).rejects.toThrow(
      /isn't a Wardrobe Warden backup/,
    );
  });

  it('rejects a backup with a missing photo', async () => {
    const manifest = {
      format: 'wardrobe-warden-backup',
      version: 1,
      exportedAt: '',
      items: [{ ...item, photoOriginal: 'images/x.jpg', thumbnail: 'images/y.png', photoCutout: undefined }],
      looks: [],
      journal: [],
      settings: [],
    };
    await expect(parseBackup(zipSync({ 'data.json': strToU8(JSON.stringify(manifest)) }))).rejects.toThrow(/missing/);
  });
});
