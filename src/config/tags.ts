/**
 * All preset tags live here. Components and data only ever store the `id`;
 * labels can be renamed freely without breaking saved data.
 * Removing an id that existing items use will make those tags disappear from the UI,
 * so prefer renaming labels over deleting ids.
 */

export interface Tag<Id extends string = string> {
  id: Id;
  label: string;
}

export const CATEGORIES = [
  { id: 'top', label: 'Top' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'dress', label: 'Dress' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'bag', label: 'Bag' },
  { id: 'accessory', label: 'Accessory' },
] as const satisfies readonly Tag[];

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const SUBCATEGORIES: Record<CategoryId, readonly Tag[]> = {
  top: [
    { id: 't-shirt', label: 'T-shirt' },
    { id: 'shirt', label: 'Shirt' },
    { id: 'blouse', label: 'Blouse' },
    { id: 'polo', label: 'Polo' },
    { id: 'tank-top', label: 'Tank top' },
    { id: 'sweater', label: 'Sweater' },
    { id: 'cardigan', label: 'Cardigan' },
    { id: 'hoodie', label: 'Hoodie' },
    { id: 'sweatshirt', label: 'Sweatshirt' },
  ],
  bottom: [
    { id: 'jeans', label: 'Jeans' },
    { id: 'trousers', label: 'Trousers' },
    { id: 'chinos', label: 'Chinos' },
    { id: 'shorts', label: 'Shorts' },
    { id: 'skirt', label: 'Skirt' },
    { id: 'leggings', label: 'Leggings' },
    { id: 'joggers', label: 'Joggers' },
  ],
  dress: [
    { id: 'casual-dress', label: 'Casual dress' },
    { id: 'formal-dress', label: 'Formal dress' },
    { id: 'jumpsuit', label: 'Jumpsuit' },
  ],
  outerwear: [
    { id: 'jacket', label: 'Jacket' },
    { id: 'coat', label: 'Coat' },
    { id: 'blazer', label: 'Blazer' },
    { id: 'vest', label: 'Vest' },
    { id: 'raincoat', label: 'Raincoat' },
  ],
  shoes: [
    { id: 'sneakers', label: 'Sneakers' },
    { id: 'boots', label: 'Boots' },
    { id: 'loafers', label: 'Loafers' },
    { id: 'sandals', label: 'Sandals' },
    { id: 'heels', label: 'Heels' },
    { id: 'flats', label: 'Flats' },
    { id: 'sport-shoes', label: 'Sport shoes' },
  ],
  bag: [
    { id: 'tote', label: 'Tote' },
    { id: 'crossbody', label: 'Crossbody' },
    { id: 'backpack', label: 'Backpack' },
    { id: 'clutch', label: 'Clutch' },
  ],
  accessory: [
    { id: 'belt', label: 'Belt' },
    { id: 'scarf', label: 'Scarf' },
    { id: 'hat', label: 'Hat' },
    { id: 'jewelry', label: 'Jewelry' },
    { id: 'sunglasses', label: 'Sunglasses' },
    { id: 'watch', label: 'Watch' },
  ],
};

export interface ColorTag extends Tag {
  /** CSS color for the swatch. `pattern` swatches are drawn as a multicolor gradient. */
  hex: string;
  pattern?: boolean;
}

export const COLORS: readonly ColorTag[] = [
  { id: 'black', label: 'Black', hex: '#1c1c1c' },
  { id: 'white', label: 'White', hex: '#fbfbf8' },
  { id: 'grey', label: 'Grey', hex: '#9a9a98' },
  { id: 'beige', label: 'Beige', hex: '#d9c6a5' },
  { id: 'brown', label: 'Brown', hex: '#7a5135' },
  { id: 'navy', label: 'Navy', hex: '#1f2d4d' },
  { id: 'blue', label: 'Blue', hex: '#2f62b0' },
  { id: 'light-blue', label: 'Light blue', hex: '#a9c8e8' },
  { id: 'green', label: 'Green', hex: '#3d7d4f' },
  { id: 'olive', label: 'Olive', hex: '#6b6b3a' },
  { id: 'red', label: 'Red', hex: '#c0332b' },
  { id: 'burgundy', label: 'Burgundy', hex: '#6d1f2e' },
  { id: 'pink', label: 'Pink', hex: '#eaa7b8' },
  { id: 'purple', label: 'Purple', hex: '#6f4a8e' },
  { id: 'yellow', label: 'Yellow', hex: '#e8c547' },
  { id: 'orange', label: 'Orange', hex: '#e07b33' },
  { id: 'multicolor', label: 'Multicolor / pattern', hex: '#cccccc', pattern: true },
];

export const SEASONS = [
  { id: 'spring', label: 'Spring' },
  { id: 'summer', label: 'Summer' },
  { id: 'autumn', label: 'Autumn' },
  { id: 'winter', label: 'Winter' },
] as const satisfies readonly Tag[];

export type SeasonId = (typeof SEASONS)[number]['id'];

export const OCCASIONS = [
  { id: 'casual', label: 'Casual' },
  { id: 'work', label: 'Work' },
  { id: 'sport', label: 'Sport' },
  { id: 'formal', label: 'Formal' },
  { id: 'going-out', label: 'Going out' },
  { id: 'lounge', label: 'Lounge' },
] as const satisfies readonly Tag[];

export type OccasionId = (typeof OCCASIONS)[number]['id'];

export const MATERIALS: readonly Tag[] = [
  { id: 'cotton', label: 'Cotton' },
  { id: 'denim', label: 'Denim' },
  { id: 'wool', label: 'Wool' },
  { id: 'linen', label: 'Linen' },
  { id: 'silk', label: 'Silk' },
  { id: 'leather', label: 'Leather' },
  { id: 'synthetic', label: 'Synthetic' },
  { id: 'knit', label: 'Knit' },
];

// ---- Lookup helpers (fall back to the raw id so unknown ids never crash the UI) ----

function labelFrom(list: readonly Tag[], id: string | undefined): string {
  if (!id) return '';
  return list.find((t) => t.id === id)?.label ?? id;
}

export const categoryLabel = (id: string | undefined) => labelFrom(CATEGORIES, id);
export const seasonLabel = (id: string | undefined) => labelFrom(SEASONS, id);
export const occasionLabel = (id: string | undefined) => labelFrom(OCCASIONS, id);
export const materialLabel = (id: string | undefined) => labelFrom(MATERIALS, id);
export const colorLabel = (id: string | undefined) => labelFrom(COLORS, id);

export function subcategoryLabel(category: CategoryId, id: string | undefined): string {
  return labelFrom(SUBCATEGORIES[category] ?? [], id);
}

export function getColor(id: string): ColorTag | undefined {
  return COLORS.find((c) => c.id === id);
}

export function isValidSubcategory(category: CategoryId, sub: string | undefined): boolean {
  return !sub || (SUBCATEGORIES[category] ?? []).some((s) => s.id === sub);
}
