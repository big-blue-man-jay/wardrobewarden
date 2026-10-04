import type { CategoryId, OccasionId, SeasonId } from '../../config/tags';
import type { Rating } from '../types';
import type { GarmentSpec } from './garments';

/** Demo closet: ~20 pieces, 4 looks and a couple of weeks of journal days (relative to today). */

const ALL: SeasonId[] = ['spring', 'summer', 'autumn', 'winter'];

export interface DemoItem {
  key: string;
  name: string;
  category: CategoryId;
  subcategory: string;
  colors: string[];
  seasons: SeasonId[];
  occasions: OccasionId[];
  material?: string;
  brand?: string;
  size?: string;
  price?: number;
  purchaseDate?: string;
  boughtAt?: string;
  condition?: 'new' | 'secondhand';
  notes?: string;
  favorite?: boolean;
  art: GarmentSpec;
}

const solid = (color: string) => ({ kind: 'solid', color }) as const;

export const ITEMS: DemoItem[] = [
  { key: 'tee-white', name: 'White tee', category: 'top', subcategory: 't-shirt', colors: ['white'], seasons: ALL, occasions: ['casual', 'lounge'], material: 'cotton', brand: 'Uniqlo', size: 'M', price: 15, purchaseDate: '2024-04', boughtAt: 'Uniqlo', condition: 'new', favorite: true, art: { shape: 'tshirt', fill: solid('#fbfaf6') } },
  { key: 'tee-black', name: 'Black tee', category: 'top', subcategory: 't-shirt', colors: ['black'], seasons: ALL, occasions: ['casual', 'going-out'], material: 'cotton', brand: 'COS', size: 'M', price: 25, purchaseDate: '2023', condition: 'new', art: { shape: 'tshirt', fill: solid('#222222') } },
  { key: 'oxford', name: 'Light blue oxford shirt', category: 'top', subcategory: 'shirt', colors: ['light-blue'], seasons: ['spring', 'autumn', 'winter'], occasions: ['work', 'casual'], material: 'cotton', brand: 'Brooks Brothers', size: 'M', price: 89, purchaseDate: '2022-09-14', boughtAt: 'Department store', condition: 'new', notes: 'Iron on medium. Sleeves run slightly long.', art: { shape: 'shirt', fill: solid('#b4cde6') } },
  { key: 'breton', name: 'Breton stripe top', category: 'top', subcategory: 't-shirt', colors: ['multicolor', 'navy', 'white'], seasons: ['spring', 'summer', 'autumn'], occasions: ['casual'], material: 'cotton', brand: 'Saint James', size: 'M', price: 70, purchaseDate: '2023-05', condition: 'new', art: { shape: 'longsleeve', fill: { kind: 'stripes', color: '#f8f6f0', stripe: '#24315a' } } },
  { key: 'sweater-navy', name: 'Navy merino sweater', category: 'top', subcategory: 'sweater', colors: ['navy'], seasons: ['autumn', 'winter'], occasions: ['work', 'casual'], material: 'wool', brand: 'John Smedley', size: 'M', price: 140, purchaseDate: '2021-11', condition: 'new', favorite: true, notes: 'Hand wash cold, dry flat.', art: { shape: 'sweater', fill: solid('#26345a') } },
  { key: 'hoodie', name: 'Grey hoodie', category: 'top', subcategory: 'hoodie', colors: ['grey'], seasons: ['spring', 'autumn', 'winter'], occasions: ['lounge', 'casual', 'sport'], material: 'cotton', brand: 'Champion', size: 'L', price: 55, purchaseDate: '2020', condition: 'new', art: { shape: 'hoodie', fill: solid('#a3a4a6') } },
  { key: 'cardigan', name: 'Oatmeal cardigan', category: 'top', subcategory: 'cardigan', colors: ['beige'], seasons: ['spring', 'autumn'], occasions: ['casual', 'work'], material: 'knit', size: 'M', price: 22, purchaseDate: '2024-02', boughtAt: 'Vinted', condition: 'secondhand', notes: 'Found it secondhand, barely worn.', art: { shape: 'cardigan', fill: solid('#ddcfb6'), accent: '#7a6248' } },
  { key: 'jeans-blue', name: 'Blue straight jeans', category: 'bottom', subcategory: 'jeans', colors: ['blue'], seasons: ALL, occasions: ['casual'], material: 'denim', brand: "Levi's", size: '32/32', price: 99, purchaseDate: '2023-03', condition: 'new', favorite: true, art: { shape: 'jeans', fill: solid('#3d5f92'), accent: '#d4a24c' } },
  { key: 'jeans-black', name: 'Black slim jeans', category: 'bottom', subcategory: 'jeans', colors: ['black'], seasons: ALL, occasions: ['casual', 'going-out'], material: 'denim', size: '32/32', price: 80, purchaseDate: '2022', condition: 'new', art: { shape: 'jeans', fill: solid('#2a2a2c'), accent: '#77777a' } },
  { key: 'chinos', name: 'Olive chinos', category: 'bottom', subcategory: 'chinos', colors: ['olive'], seasons: ['spring', 'summer', 'autumn'], occasions: ['work', 'casual'], material: 'cotton', brand: 'Dockers', size: '32', price: 59, purchaseDate: '2024-05-20', condition: 'new', art: { shape: 'trousers', fill: solid('#6e6c3f') } },
  { key: 'trousers', name: 'Grey wool trousers', category: 'bottom', subcategory: 'trousers', colors: ['grey'], seasons: ['autumn', 'winter'], occasions: ['work', 'formal'], material: 'wool', size: '32', price: 120, purchaseDate: '2023-10', condition: 'new', art: { shape: 'trousers', fill: solid('#7d7f84') } },
  { key: 'skirt', name: 'Burgundy pleated skirt', category: 'bottom', subcategory: 'skirt', colors: ['burgundy'], seasons: ['autumn', 'winter'], occasions: ['going-out', 'work'], material: 'synthetic', size: 'M', price: 18, purchaseDate: '2024', boughtAt: 'Flea market', condition: 'secondhand', notes: 'Bought on a whim at the flea market.', art: { shape: 'skirt', fill: solid('#6d2232') } },
  { key: 'dress', name: 'Floral summer dress', category: 'dress', subcategory: 'casual-dress', colors: ['multicolor', 'beige'], seasons: ['spring', 'summer'], occasions: ['casual', 'going-out'], material: 'linen', price: 75, purchaseDate: '2025-06', condition: 'new', art: { shape: 'dress', fill: { kind: 'floral', color: '#f1e5d1', dots: ['#c4473a', '#4f7d4f', '#e3b64a'] } } },
  { key: 'coat', name: 'Camel wool coat', category: 'outerwear', subcategory: 'coat', colors: ['beige'], seasons: ['autumn', 'winter'], occasions: ['work', 'formal', 'casual'], material: 'wool', brand: 'Arket', size: 'M', price: 260, purchaseDate: '2021', condition: 'new', favorite: true, notes: 'Dry clean only.', art: { shape: 'coat', fill: solid('#c19a6b'), accent: '#5b4128' } },
  { key: 'blazer', name: 'Navy blazer', category: 'outerwear', subcategory: 'blazer', colors: ['navy'], seasons: ['spring', 'autumn', 'winter'], occasions: ['work', 'formal'], material: 'wool', size: '50', price: 160, purchaseDate: '2022-02', condition: 'new', art: { shape: 'blazer', fill: solid('#25304d'), accent: '#c8b27a' } },
  { key: 'raincoat', name: 'Yellow raincoat', category: 'outerwear', subcategory: 'raincoat', colors: ['yellow'], seasons: ['spring', 'autumn'], occasions: ['casual'], material: 'synthetic', brand: 'Rains', size: 'M', price: 90, purchaseDate: '2023-04', condition: 'new', art: { shape: 'coat', fill: solid('#e6c13f'), accent: '#3a3a3a' } },
  { key: 'sneakers', name: 'White leather sneakers', category: 'shoes', subcategory: 'sneakers', colors: ['white'], seasons: ['spring', 'summer', 'autumn'], occasions: ['casual'], material: 'leather', brand: 'Veja', size: '43', price: 120, purchaseDate: '2024-03-02', condition: 'new', favorite: true, art: { shape: 'sneakers', fill: solid('#f7f6f2'), accent: '#d6d0c4' } },
  { key: 'boots', name: 'Brown Chelsea boots', category: 'shoes', subcategory: 'boots', colors: ['brown'], seasons: ['spring', 'autumn', 'winter'], occasions: ['casual', 'work'], material: 'leather', size: '43', price: 180, purchaseDate: '2022-10', condition: 'new', art: { shape: 'boots', fill: solid('#7a5135'), accent: '#33241a' } },
  { key: 'loafers', name: 'Black loafers', category: 'shoes', subcategory: 'loafers', colors: ['black'], seasons: ALL, occasions: ['work', 'formal'], material: 'leather', size: '43', price: 140, purchaseDate: '2023', condition: 'new', art: { shape: 'loafers', fill: solid('#232323'), accent: '#4a4a4a' } },
  { key: 'tote', name: 'Tan leather tote', category: 'bag', subcategory: 'tote', colors: ['brown'], seasons: ALL, occasions: ['work', 'casual'], material: 'leather', price: 95, purchaseDate: '2023-08', condition: 'new', art: { shape: 'tote', fill: solid('#b07a4a') } },
  { key: 'scarf', name: 'Red wool scarf', category: 'accessory', subcategory: 'scarf', colors: ['red'], seasons: ['autumn', 'winter'], occasions: ['casual', 'work'], material: 'wool', price: 35, purchaseDate: '2019', condition: 'new', notes: 'Gift from my sister.', art: { shape: 'scarf', fill: solid('#b8322b') } },
  { key: 'sunglasses', name: 'Tortoise sunglasses', category: 'accessory', subcategory: 'sunglasses', colors: ['brown'], seasons: ['spring', 'summer'], occasions: ['casual'], price: 120, purchaseDate: '2024-06', condition: 'new', art: { shape: 'sunglasses', fill: solid('#3a2f27'), accent: '#7a5135' } },
  { key: 'watch', name: 'Steel watch', category: 'accessory', subcategory: 'watch', colors: ['brown', 'grey'], seasons: ALL, occasions: ['work', 'casual', 'formal'], material: 'leather', price: 250, purchaseDate: '2018', condition: 'new', art: { shape: 'watch', fill: solid('#6b4630'), accent: '#b9bcc0' } },
];

export const LOOKS: { name: string; items: string[]; occasions: OccasionId[]; seasons: SeasonId[] }[] = [
  { name: 'Office classic', items: ['oxford', 'trousers', 'blazer', 'loafers', 'tote', 'watch'], occasions: ['work'], seasons: ['spring', 'autumn', 'winter'] },
  { name: 'Weekend easy', items: ['tee-white', 'jeans-blue', 'sneakers', 'sunglasses'], occasions: ['casual'], seasons: ['spring', 'summer'] },
  { name: 'Cozy autumn', items: ['sweater-navy', 'jeans-black', 'coat', 'boots', 'scarf'], occasions: ['casual', 'work'], seasons: ['autumn', 'winter'] },
  { name: 'Summer picnic', items: ['dress', 'sneakers', 'tote', 'sunglasses'], occasions: ['casual', 'going-out'], seasons: ['summer'] },
];

/** daysAgo → entry. Recent two weeks (with a couple of missed days) plus a few older days. */
export const ENTRIES: { daysAgo: number; items?: string[]; look?: number; rating?: Rating; occasion?: OccasionId; note?: string }[] = [
  { daysAgo: 1, look: 0, rating: 4, occasion: 'work', note: 'Big presentation. Felt sharp.' },
  { daysAgo: 2, items: ['hoodie', 'jeans-black', 'sneakers'], rating: 3, occasion: 'lounge' },
  { daysAgo: 3, look: 2, rating: 5, occasion: 'casual', note: 'Perfect crisp autumn day.' },
  { daysAgo: 4, items: ['oxford', 'sweater-navy', 'chinos', 'boots', 'watch'], rating: 4, occasion: 'work' },
  { daysAgo: 6, items: ['breton', 'jeans-blue', 'sneakers', 'sunglasses'], rating: 4, occasion: 'casual' },
  { daysAgo: 7, items: ['tee-black', 'jeans-black', 'coat', 'boots'], rating: 5, occasion: 'going-out', note: 'Dinner with friends.' },
  { daysAgo: 8, look: 0, rating: 3, occasion: 'work' },
  { daysAgo: 10, items: ['cardigan', 'tee-white', 'chinos', 'sneakers', 'tote'], rating: 4, occasion: 'work' },
  { daysAgo: 11, items: ['hoodie', 'jeans-blue', 'sneakers'], rating: 3, occasion: 'lounge' },
  { daysAgo: 12, items: ['sweater-navy', 'trousers', 'loafers', 'watch'], rating: 4, occasion: 'work' },
  { daysAgo: 13, look: 1, rating: 5, occasion: 'casual', note: 'Sunny Sunday market.' },
  { daysAgo: 14, items: ['tee-white', 'jeans-blue', 'coat', 'boots', 'scarf'], rating: 4, occasion: 'casual' },
  { daysAgo: 75, look: 3, rating: 5, occasion: 'casual', note: 'Last warm day by the lake.' },
  { daysAgo: 90, items: ['dress', 'sneakers', 'tote'], rating: 4, occasion: 'going-out' },
  { daysAgo: 110, items: ['raincoat', 'breton', 'jeans-blue', 'boots'], rating: 3, occasion: 'casual' },
];
