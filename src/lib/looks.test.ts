import { describe, expect, it } from 'vitest';
import type { CategoryId } from '../config/tags';
import { collageLayout, fitsSlot, itemIdsFromSlots, SLOTS, slotsFromItems } from './looks';

const it_ = (id: string, category: CategoryId, subcategory?: string) => ({ id, category, subcategory });
const slot = (id: string) => SLOTS.find((s) => s.id === id)!;

describe('look slots', () => {
  it('rebuilds slots from stored item order; a second top becomes the layer', () => {
    const items = [it_('tee', 'top'), it_('jeans', 'bottom'), it_('cardigan', 'top'), it_('boots', 'shoes'), it_('belt', 'accessory'), it_('watch', 'accessory')];
    const slots = slotsFromItems(items);
    expect(slots).toEqual({ top: ['tee'], bottom: ['jeans'], layer: ['cardigan'], shoes: ['boots'], bag: [], accessories: ['belt', 'watch'] });
    expect(itemIdsFromSlots(slots)).toEqual(['tee', 'jeans', 'cardigan', 'boots', 'belt', 'watch']);
  });

  it('puts dresses in the bottom slot and outerwear in the layer slot', () => {
    expect(slotsFromItems([it_('dress', 'dress'), it_('coat', 'outerwear')])).toMatchObject({ bottom: ['dress'], layer: ['coat'] });
  });

  it('only allows layering tops in the layer slot', () => {
    expect(fitsSlot(it_('c', 'top', 'cardigan'), slot('layer'))).toBe(true);
    expect(fitsSlot(it_('t', 'top', 't-shirt'), slot('layer'))).toBe(false);
    expect(fitsSlot(it_('j', 'outerwear', 'jacket'), slot('layer'))).toBe(true);
    expect(fitsSlot(it_('d', 'dress'), slot('bottom'))).toBe(true);
  });

  it('lays out every piece exactly once', () => {
    const slots = slotsFromItems([it_('a', 'top'), it_('b', 'bottom'), it_('c', 'outerwear'), it_('d', 'shoes'), it_('e', 'bag'), it_('f', 'accessory')]);
    const placed = collageLayout(slots, false).map((p) => p.itemId).sort();
    expect(placed).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });
});
