import type { CategoryId, OccasionId, SeasonId } from '../config/tags';

export type { CategoryId, OccasionId, SeasonId };

export interface Item {
  id: string;
  name: string;
  category: CategoryId;
  subcategory?: string;          // must be valid for the category (see config/tags.ts)
  colors: string[];              // color IDs; the first one is the "main" color
  seasons: SeasonId[];
  occasions: OccasionId[];
  material?: string;             // material ID
  brand?: string;
  size?: string;
  price?: number;
  purchaseDate?: string;         // 'YYYY', 'YYYY-MM' or 'YYYY-MM-DD'
  boughtAt?: string;
  condition?: 'new' | 'secondhand';
  notes?: string;
  favorite: boolean;
  photoOriginal: Blob;
  photoCutout?: Blob;
  /** True when I chose to keep the original photo instead of the cutout. */
  preferOriginal: boolean;
  /** Small version of whichever photo is shown, for grids. */
  thumbnail: Blob;
  isDemo: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Look {
  id: string;
  name: string;
  itemIds: string[];
  occasions: OccasionId[];
  seasons: SeasonId[];
  isDemo: boolean;
  createdAt: number;
  updatedAt: number;
}

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface JournalEntry {
  id: string;
  date: string;                  // 'YYYY-MM-DD', unique
  itemIds: string[];
  lookId?: string;               // if logged from a saved look
  photo?: Blob;                  // optional mirror selfie
  photoThumb?: Blob;             // small version of the selfie for the calendar
  rating?: Rating;
  occasion?: OccasionId;
  note?: string;
  isDemo: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SettingRow {
  key: string;
  value: unknown;
}
