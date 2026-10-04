import { describe, expect, it } from 'vitest';
import type { Item } from '../db/types';
import type { WearStats } from '../db/wear';
import { activeChips, EMPTY_FILTER, filterAndSort, type ItemFilter } from './filters';

const blob = new Blob();
const item = (id: string, over: Partial<Item>): Item => ({
  id,
  name: id,
  category: 'top',
  colors: [],
  seasons: [],
  occasions: [],
  favorite: false,
  photoOriginal: blob,
  thumbnail: blob,
  preferOriginal: false,
  isDemo: false,
  createdAt: 0,
  updatedAt: 0,
  ...over,
});

const items = [
  item('tee', { name: 'White tee', subcategory: 't-shirt', colors: ['white'], seasons: ['summer'], price: 15, createdAt: 3, brand: 'Uniqlo' }),
  item('shirt', { name: 'Blue shirt', subcategory: 'shirt', colors: ['light-blue', 'white'], price: 90, createdAt: 2, notes: 'Iron on medium', favorite: true }),
  item('jeans', { name: 'Black jeans', category: 'bottom', subcategory: 'jeans', colors: ['black'], seasons: ['winter'], createdAt: 1, material: 'denim' }),
  item('boots', { name: 'Brown boots', category: 'shoes', subcategory: 'boots', colors: ['brown'], price: 200, createdAt: 4 }),
];
const wear = new Map<string, WearStats>([
  ['tee', { count: 10, first: '2026-01-01', last: '2026-10-01' }],
  ['shirt', { count: 2, first: '2026-01-01', last: '2026-06-01' }],
  ['boots', { count: 4, first: '2026-02-01', last: '2026-09-15' }],
]);
const run = (f: Partial<ItemFilter>, sort: Parameters<typeof filterAndSort>[3] = 'newest') =>
  filterAndSort(items, wear, { ...EMPTY_FILTER, ...f }, sort, '2026-10-04').map((i) => i.id);

describe('filters', () => {
  it('ORs within a group and ANDs across groups', () => {
    expect(run({ colors: ['white', 'black'] })).toEqual(['tee', 'shirt', 'jeans']);
    expect(run({ colors: ['white'], categories: ['top'], favorites: true })).toEqual(['shirt']);
    expect(run({ seasons: ['winter'] })).toEqual(['jeans']);
    expect(run({ materials: ['denim'] })).toEqual(['jeans']);
    expect(run({ brands: ['Uniqlo'] })).toEqual(['tee']);
  });

  it('narrows only the category a type belongs to', () => {
    expect(run({ categories: ['top', 'shoes'], subcategories: ['shirt'] })).toEqual(['boots', 'shirt']);
  });

  it('filters by wear status', () => {
    expect(run({ wear: ['never'] })).toEqual(['jeans']);
    expect(run({ wear: ['idle'] })).toEqual(['shirt']);
    expect(run({ wear: ['idle', 'never'] })).toEqual(['shirt', 'jeans']);
  });

  it('searches name, brand and notes (all words, accent-insensitive)', () => {
    expect(run({ query: 'iron' })).toEqual(['shirt']);
    expect(run({ query: 'uniqlo white' })).toEqual(['tee']);
    expect(run({ query: 'BLÄCK' })).toEqual(['jeans']);
  });

  it('sorts', () => {
    expect(run({}, 'newest')).toEqual(['boots', 'tee', 'shirt', 'jeans']);
    expect(run({}, 'name')).toEqual(['jeans', 'shirt', 'boots', 'tee']);
    expect(run({}, 'most-worn')).toEqual(['tee', 'boots', 'shirt', 'jeans']);
    expect(run({}, 'least-worn')).toEqual(['jeans', 'shirt', 'boots', 'tee']);
    expect(run({}, 'last-worn')).toEqual(['tee', 'boots', 'shirt', 'jeans']);
    expect(run({}, 'price')).toEqual(['boots', 'shirt', 'tee', 'jeans']);
    // cpw: tee 1.5, boots 50, shirt 45 → tee, shirt, boots; jeans (no price) last
    expect(run({}, 'cpw')).toEqual(['tee', 'shirt', 'boots', 'jeans']);
    // a priced but never-worn piece ranks after worn ones
    const cheapUnworn = [...items, item('scarf', { name: 'Scarf', price: 5 })];
    expect(filterAndSort(cheapUnworn, wear, EMPTY_FILTER, 'cpw', '2026-10-04').map((i) => i.id)).toEqual(['tee', 'shirt', 'boots', 'jeans', 'scarf']);
  });

  it('lists removable chips', () => {
    const f: ItemFilter = { ...EMPTY_FILTER, colors: ['olive'], favorites: true, wear: ['never'] };
    const chips = activeChips(f);
    expect(chips.map((c) => c.label)).toEqual(['Favorites', 'Never worn', 'Olive']);
    expect(chips[2].remove(f).colors).toEqual([]);
  });
});
