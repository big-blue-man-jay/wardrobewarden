import { categoryLabel, colorLabel, subcategoryLabel, type CategoryId } from '../config/tags';

/** Name generated from tags when I leave the name empty, e.g. "Black jeans". */
export function generateItemName(category: CategoryId | undefined, subcategory?: string, colors: string[] = []): string {
  if (!category) return '';
  const kind = (subcategory ? subcategoryLabel(category, subcategory) : categoryLabel(category)).toLowerCase();
  const main = colors[0];
  const color = !main ? '' : main === 'multicolor' ? 'Patterned' : colorLabel(main);
  const name = color ? `${color} ${kind}` : kind;
  return name.charAt(0).toUpperCase() + name.slice(1);
}
