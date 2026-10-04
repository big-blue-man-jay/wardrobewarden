import type { CategoryId } from '../config/tags';
import type { Item } from '../db/types';

export type SlotId = 'top' | 'bottom' | 'layer' | 'shoes' | 'bag' | 'accessories';

export interface SlotDef {
  id: SlotId;
  label: string;
  categories: CategoryId[];
  /** For the layer slot: which top types count as layers (cardigans, sweaters…). */
  layerTopTypes?: string[];
  multiple?: boolean;
}

export const SLOTS: SlotDef[] = [
  { id: 'top', label: 'Top', categories: ['top'] },
  { id: 'bottom', label: 'Bottom or dress', categories: ['bottom', 'dress'] },
  {
    id: 'layer',
    label: 'Layer / outerwear',
    categories: ['outerwear', 'top'],
    layerTopTypes: ['cardigan', 'sweater', 'hoodie', 'sweatshirt', 'shirt'],
  },
  { id: 'shoes', label: 'Shoes', categories: ['shoes'] },
  { id: 'bag', label: 'Bag', categories: ['bag'] },
  { id: 'accessories', label: 'Accessories', categories: ['accessory'], multiple: true },
];

export type SlotMap = Record<SlotId, string[]>;

export const emptySlots = (): SlotMap => ({ top: [], bottom: [], layer: [], shoes: [], bag: [], accessories: [] });

/** Can this piece go into this slot? */
export function fitsSlot(item: Pick<Item, 'category' | 'subcategory'>, slot: SlotDef): boolean {
  if (slot.id === 'layer' && item.category === 'top') {
    return !item.subcategory || slot.layerTopTypes!.includes(item.subcategory);
  }
  return slot.categories.includes(item.category);
}

/** Puts a piece into the slot its category belongs to. A second top becomes the layer. */
export function placeItem(slots: SlotMap, item: Pick<Item, 'id' | 'category'>): SlotMap {
  const next = { ...slots };
  const set = (id: SlotId) => {
    next[id] = id === 'accessories' ? [...new Set([...next[id], item.id])] : [item.id];
  };
  switch (item.category) {
    case 'top':
      set(next.top.length === 0 || next.top[0] === item.id ? 'top' : next.layer.length === 0 ? 'layer' : 'top');
      break;
    case 'bottom':
    case 'dress':
      set('bottom');
      break;
    case 'outerwear':
      set('layer');
      break;
    case 'shoes':
      set('shoes');
      break;
    case 'bag':
      set('bag');
      break;
    case 'accessory':
      set('accessories');
      break;
  }
  return next;
}

/** Rebuilds slots from a stored, ordered list of pieces (looks and journal entries only store item ids). */
export function slotsFromItems(items: Pick<Item, 'id' | 'category'>[]): SlotMap {
  return items.reduce(placeItem, emptySlots());
}

/** Stored order: slot by slot, so a top saved before a cardigan stays the top. */
export function itemIdsFromSlots(slots: SlotMap): string[] {
  return SLOTS.flatMap((s) => slots[s.id]);
}

// ---- Flat-lay collage layout ----

export interface Placement {
  itemId: string;
  /** Percent of canvas width. */
  left: number;
  size: number;
  /** Percent of canvas height (the canvas is 4:5). */
  top: number;
  z: number;
}

const ACCESSORY_SPOTS = [
  { left: 72, top: 4, size: 22 },
  { left: 75, top: 23, size: 20 },
  { left: 3, top: 55, size: 22 },
  { left: 4, top: 76, size: 21 },
  { left: 73, top: 78, size: 21 },
  { left: 3, top: 36, size: 19 },
];

/** Arranges pieces like a tidy flat-lay: layer and top up top, bottom below, shoes at the bottom, bag and accessories around. */
export function collageLayout(slots: SlotMap, isDress: boolean): Placement[] {
  const out: Placement[] = [];
  const put = (itemId: string | undefined, left: number, top: number, size: number, z: number) => {
    if (itemId) out.push({ itemId, left, top, size, z });
  };
  const [top] = slots.top;
  const [layer] = slots.layer;
  const [bottom] = slots.bottom;
  const dressAlone = isDress && !top;

  if (layer) put(layer, top || dressAlone ? 5 : 30, 4, top || dressAlone ? 40 : 40, 1);
  if (top) put(top, layer ? 38 : 31, layer ? 7 : 4, 38, 2);
  if (bottom) {
    if (dressAlone) put(bottom, layer ? 38 : 26, 5, layer ? 46 : 48, 2);
    else put(bottom, 31, 37, 38, 1);
  }
  put(slots.shoes[0], 33, 73, 32, 3);
  put(slots.bag[0], 66, 50, 30, 3);
  slots.accessories.forEach((id, i) => {
    const spot = ACCESSORY_SPOTS[i % ACCESSORY_SPOTS.length];
    const wrap = Math.floor(i / ACCESSORY_SPOTS.length);
    put(id, spot.left + wrap * 4, spot.top + wrap * 4, spot.size, 4 + i);
  });
  return out;
}
