import { describe, expect, it } from 'vitest';
import { costPerWear, daysIdle, isForgotten, wearByItem } from './wear';

describe('wear stats', () => {
  const entries = [
    { date: '2026-09-01', itemIds: ['a', 'b'] },
    { date: '2026-09-20', itemIds: ['a'] },
    { date: '2026-08-15', itemIds: ['a', 'a'] }, // duplicates count once per day
  ];

  it('derives counts and first/last worn from entries', () => {
    const map = wearByItem(entries);
    expect(map.get('a')).toEqual({ count: 3, first: '2026-08-15', last: '2026-09-20' });
    expect(map.get('b')).toEqual({ count: 1, first: '2026-09-01', last: '2026-09-01' });
    expect(map.get('c')).toBeUndefined();
  });

  it('computes cost per wear', () => {
    expect(costPerWear(90, 3)).toBe(30);
    expect(costPerWear(90, 0)).toBe(90);
    expect(costPerWear(undefined, 4)).toBeUndefined();
  });

  it('counts idle days from last wear, or from when the piece was added', () => {
    const added = { createdAt: new Date(2026, 6, 1).getTime() }; // 1 Jul
    expect(daysIdle(added, { count: 1, last: '2026-09-20' }, '2026-10-04')).toBe(14);
    expect(daysIdle(added, { count: 0 }, '2026-10-04')).toBe(95);
    expect(isForgotten(added, { count: 0 }, '2026-10-04')).toBe(true);
    expect(isForgotten({ createdAt: new Date(2026, 8, 20).getTime() }, { count: 0 }, '2026-10-04')).toBe(false);
  });
});
