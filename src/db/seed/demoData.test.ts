import { describe, expect, it } from 'vitest';
import { COLORS, MATERIALS, OCCASIONS, SEASONS, isValidSubcategory } from '../../config/tags';
import { ENTRIES, ITEMS, LOOKS } from './demoData';
import { garmentPhotoSvg, garmentSvg } from './garments';

const ids = (list: readonly { id: string }[]) => new Set(list.map((t) => t.id));

describe('demo data', () => {
  it('only uses preset tag ids', () => {
    for (const item of ITEMS) {
      expect(isValidSubcategory(item.category, item.subcategory), item.name).toBe(true);
      item.colors.forEach((c) => expect(ids(COLORS).has(c), `${item.name}: ${c}`).toBe(true));
      item.seasons.forEach((s) => expect(ids(SEASONS).has(s)).toBe(true));
      item.occasions.forEach((o) => expect(ids(OCCASIONS).has(o)).toBe(true));
      if (item.material) expect(ids(MATERIALS).has(item.material), item.name).toBe(true);
    }
  });

  it('references existing pieces and looks', () => {
    const keys = new Set(ITEMS.map((i) => i.key));
    LOOKS.forEach((l) => l.items.forEach((k) => expect(keys.has(k), k).toBe(true)));
    ENTRIES.forEach((e) => {
      if (e.look !== undefined) expect(LOOKS[e.look]).toBeDefined();
      e.items?.forEach((k) => expect(keys.has(k), k).toBe(true));
    });
  });

  it('generates well-formed SVG (no duplicate attributes)', () => {
    for (const item of ITEMS) {
      for (const svg of [garmentSvg(item.art), garmentPhotoSvg(item.art, '#cccccc')]) {
        for (const tag of svg.match(/<[a-zA-Z][^>]*>/g) ?? []) {
          const names = [...tag.matchAll(/\s([a-zA-Z-:]+)="/g)].map((m) => m[1]);
          expect(new Set(names).size, `${item.name}: ${tag}`).toBe(names.length);
        }
      }
    }
  });
});
