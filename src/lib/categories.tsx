/**
 * Category utilities and icon mapping
 */

import { Apple, Carrot, Beef, Egg, Milk, MoreHorizontal } from 'lucide-react';
import { CATEGORIES, CategoryValue } from './constants';

/**
 * Get the icon component for a category
 * @param category - The category value
 * @param size - Icon size (default: 16)
 * @param className - Additional CSS classes (default: 'text-[#22C55E]')
 * @returns React icon component
 */
export const getCategoryIcon = (
  category: string,
  size: number = 16,
  className: string = 'text-[#22C55E]'
) => {
  const iconProps = { size, className };

  switch (category) {
    case 'voce':
      return <Apple {...iconProps} />;
    case 'povrce':
      return <Carrot {...iconProps} />;
    case 'meso':
      return <Beef {...iconProps} />;
    case 'jaja':
      return <Egg {...iconProps} />;
    case 'mlijecni':
      return <Milk {...iconProps} />;
    default:
      return <MoreHorizontal {...iconProps} />;
  }
};

/**
 * Get category label from value
 * @param value - The category value
 * @returns Category label or empty string if not found
 */
export const getCategoryLabel = (value: string): string => {
  const category = CATEGORIES.find(cat => cat.value === value);
  return category?.label || '';
};

/**
 * Get unique categories from a list of products
 * @param products - Array of products with category field
 * @returns Array of unique category values
 */
export const getUniqueCategories = <T extends { category: string }>(
  products: T[]
): string[] => {
  const categories = products.map(product => product.category);
  return [...new Set(categories)];
};

/**
 * Check if a category value is valid
 * @param value - The category value to check
 * @returns true if valid category
 */
export const isValidCategory = (value: string): value is CategoryValue => {
  return CATEGORIES.some(cat => cat.value === value);
};
