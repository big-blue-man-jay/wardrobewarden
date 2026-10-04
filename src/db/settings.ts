import { useLiveQuery } from 'dexie-react-hooks';
import { DEFAULT_CURRENCY } from '../config/app';
import type { OccasionId, SeasonId } from '../config/tags';
import { db } from './db';

/** All settings with their defaults. Add new keys here. */
export interface Settings {
  currency: string;
  backgroundRemoval: boolean;
  lastSeasons: SeasonId[];
  lastOccasions: OccasionId[];
  /** Set after the background-removal model has been downloaded once (it's then cached for offline use). */
  bgModelReady: boolean;
  /** When I last exported a backup (ms). */
  lastBackupAt: number | null;
  /** Set once demo data has been loaded (or skipped) so it isn't re-added after removal. */
  demoSeeded: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  currency: DEFAULT_CURRENCY,
  backgroundRemoval: true,
  lastSeasons: [],
  lastOccasions: [],
  demoSeeded: false,
  bgModelReady: false,
  lastBackupAt: null,
};

export async function getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]> {
  const row = await db.settings.get(key);
  return (row?.value as Settings[K] | undefined) ?? DEFAULT_SETTINGS[key];
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value });
}

export function useSetting<K extends keyof Settings>(key: K): Settings[K] {
  return useLiveQuery(() => getSetting(key), [key]) ?? DEFAULT_SETTINGS[key];
}
