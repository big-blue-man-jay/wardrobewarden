import { expect, it } from 'vitest';
import { generateItemName } from './naming';

it('generates names from tags', () => {
  expect(generateItemName('bottom', 'jeans', ['black'])).toBe('Black jeans');
  expect(generateItemName('top', 't-shirt', ['light-blue', 'white'])).toBe('Light blue t-shirt');
  expect(generateItemName('top', undefined, ['multicolor'])).toBe('Patterned top');
  expect(generateItemName('shoes', 'sneakers')).toBe('Sneakers');
  expect(generateItemName(undefined)).toBe('');
});
