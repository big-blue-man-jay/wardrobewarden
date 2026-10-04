import { describe, expect, it } from 'vitest';
import type { Item } from '../db/types';
import type { WearStats } from '../db/wear';
import { computeInsights, findSimilar, loggedPerMonth, pluralize } from './insights';

const blob = new Blob();
const item = (id: string, over: Partial<Item>): Item => ({
  id, name: id, category: 'top', colors: [], seasons: [], occasions: [], favorite: false,
  photoOriginal: blob, thumbnail: blob, preferOriginal: false, isDemo: false,
  createdAt: new Date(2026, 0, 1).getTime(), updatedAt: 0, ...over,
});

const items = [
  item('tee', { colors: ['white'], subcategory: 't-shirt', price: 20 }),
  item('tee2', { colors: ['white', 'navy'], subcategory: 't-shirt', price: 30 }),
  item('jeans', { category: 'bottom', subcategory: 'jeans', colors: ['blue'], price: 100 }),
  item('skirt', { category: 'bottom', subcategory: 'skirt', colors: ['black'], price: 50 }),
  item('scarf', { category: 'accessory', colors: ['red'] }),
];
const wear = new Map<string, WearStats>([
  ['tee', { count: 10, first: '2026-05-01', last: '2026-10-01' }],
  ['tee2', { count: 1, first: '2026-06-01', last: '2026-06-01' }],
  ['jeans', { count: 4, first: '2026-05-01', last: '2026-09-30' }],
]);

describe('insights', () => {
  const ins = computeInsights(items, wear, '2026-10-04');

  it('totals value over priced pieces and averages cost per wear over worn ones', () => {
    expect(ins.totalValue).toBe(200);
    expect(ins.pricedItems).toBe(4);
    expect(ins.avgCpw).toBeCloseTo((2 + 30 + 25) / 3);
  });

  it('breaks down by category and main color', () => {
    expect(ins.byCategory.map((c) => [c.id, c.count])).toEqual([['top', 2], ['bottom', 2], ['accessory', 1]]);
    expect(ins.byColor).toEqual([{ id: 'black', count: 1 }, { id: 'white', count: 2 }, { id: 'blue', count: 1 }, { id: 'red', count: 1 }]);
    expect(ins.palette.map((i) => i.id)).toEqual(['skirt', 'tee', 'tee2', 'jeans', 'scarf']);
  });

  it('finds forgotten pieces', () => {
    expect(ins.idle.map((r) => r.item.id)).toEqual(['tee2']);
    expect(ins.neverWorn.map((r) => r.item.id).sort()).toEqual(['scarf', 'skirt']);
  });

  it('ranks wear and value', () => {
    expect(ins.mostWorn.map((r) => r.item.id)).toEqual(['tee', 'jeans', 'tee2']);
    expect(ins.leastWorn[0].wear.count).toBe(0);
    expect(ins.bestValue.map((r) => r.item.id)).toEqual(['tee', 'jeans', 'tee2']);
    expect(ins.worstValue.map((r) => r.item.id)).toEqual(['skirt', 'tee2', 'jeans', 'tee']);
  });

  it('counts logged days per month, current month up to today', () => {
    const months = loggedPerMonth([{ date: '2026-10-01' }, { date: '2026-10-03' }, { date: '2026-09-15' }], '2026-10-04', 3);
    expect(months).toEqual([
      { month: '2026-08', count: 0, days: 31, current: false },
      { month: '2026-09', count: 1, days: 30, current: false },
      { month: '2026-10', count: 2, days: 4, current: true },
    ]);
  });
});

describe('duplicate check', () => {
  it('matches category, type and main color', () => {
    expect(findSimilar(items, { category: 'top', subcategory: 't-shirt', colors: ['white'] }).map((i) => i.id)).toEqual(['tee', 'tee2']);
    expect(findSimilar(items, { category: 'top', subcategory: 't-shirt', colors: ['navy'] })).toEqual([]);
    expect(findSimilar(items, { category: 'top', colors: [] })).toEqual([]);
  });
  it('pluralizes garment names', () => {
    expect(pluralize('black t-shirt')).toBe('black t-shirts');
    expect(pluralize('black jeans')).toBe('black jeans');
    expect(pluralize('steel watch')).toBe('steel watches');
    expect(pluralize('red casual dress')).toBe('red casual dresses');
    expect(pluralize('gold jewelry')).toBe('gold jewelry');
  });
});
