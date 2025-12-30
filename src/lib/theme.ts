/**
 * Theme colors and styling constants
 * Provides a single source of truth for the application's color palette
 */

export const colors = {
  // Primary brand colors
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primaryLight: '#E8F5E9',

  // Neutral colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Special colors
  white: '#FFFFFF',
  black: '#000000',
  gold: '#F59E0B',

  // Background variants
  bg: {
    primary: '#F3F4F6',
    secondary: '#FFFFFF',
    light: '#E8F5E9',
  }
} as const;

/**
 * Common Tailwind class combinations for consistent styling
 */
export const classNames = {
  // Buttons
  button: {
    primary: 'bg-[#22C55E] text-white hover:bg-[#16A34A] transition-all',
    secondary: 'bg-[#F3F4F6] text-[#1F2937] hover:bg-[#E5E7EB] transition-all',
    ghost: 'bg-transparent hover:bg-[#E8F5E9] transition-all',
  },

  // Text colors
  text: {
    primary: 'text-[#1F2937]',
    secondary: 'text-[#6B7280]',
    success: 'text-[#22C55E]',
    muted: 'text-[#9CA3AF]',
  },

  // Borders
  border: {
    default: 'border-[#E5E7EB]',
    primary: 'border-[#22C55E]',
  },

  // Cards and containers
  card: 'bg-white rounded-2xl shadow-md',
  cardHover: 'bg-white rounded-2xl hover:shadow-lg transition-all',
} as const;

/**
 * Get Tailwind background color class
 * @param color - Hex color value
 * @returns Tailwind class string
 */
export const getBgClass = (color: string): string => {
  return `bg-[${color}]`;
};

/**
 * Get Tailwind text color class
 * @param color - Hex color value
 * @returns Tailwind class string
 */
export const getTextClass = (color: string): string => {
  return `text-[${color}]`;
};

/**
 * Get Tailwind border color class
 * @param color - Hex color value
 * @returns Tailwind class string
 */
export const getBorderClass = (color: string): string => {
  return `border-[${color}]`;
};
