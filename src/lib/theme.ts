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
 * Spacing constants for consistent padding and margins
 * Follows Tailwind's spacing scale
 */
export const spacing = {
  // Page-level spacing
  page: {
    x: 'px-6',      // Horizontal padding for pages (24px)
    y: 'py-6',      // Vertical padding for pages (24px)
    top: 'pt-6',    // Top padding (24px)
    bottom: 'pb-6', // Bottom padding (24px)
  },

  // Compact spacing for tighter layouts
  compact: {
    x: 'px-4',
    y: 'py-4',
    top: 'pt-4',
    bottom: 'pb-4',
  },

  // Spacious spacing for breathing room
  spacious: {
    x: 'px-8',
    y: 'py-8',
    top: 'pt-8',
    bottom: 'pb-8',
  },

  // No padding
  none: {
    x: 'px-0',
    y: 'py-0',
    top: 'pt-0',
    bottom: 'pb-0',
  },

  // Component spacing
  card: 'p-4',           // Card internal padding
  cardCompact: 'p-3',    // Compact card padding
  cardSpacious: 'p-6',   // Spacious card padding

  // Gaps between elements
  gap: {
    xs: 'gap-1',   // 4px
    sm: 'gap-2',   // 8px
    md: 'gap-3',   // 12px
    lg: 'gap-4',   // 16px
    xl: 'gap-6',   // 24px
  },

  // Stack spacing (vertical)
  stack: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },
} as const;

/**
 * Safe area utilities for handling mobile device notches and system UI
 * Uses CSS env() variables for iOS/Android safe area insets
 */
export const safeArea = {
  // Individual safe area classes
  top: 'safe-top',                    // Padding top for status bar/notch
  bottom: 'safe-bottom',              // Padding bottom for home indicator
  left: 'safe-left',                  // Padding left (landscape)
  right: 'safe-right',                // Padding right (landscape)
  x: 'safe-x',                        // Padding left and right (horizontal)
  all: 'safe-area-inset',             // All safe areas

  // Bottom navigation spacing (80px nav + safe area)
  bottomNav: 'pb-bottom-nav',

  // Helper to combine safe area with custom padding
  withPadding: (padding: string, safeAreaSide: 'top' | 'bottom' | 'left' | 'right' | 'all') => {
    const safeAreaClass = safeAreaSide === 'all' ? safeArea.all : safeArea[safeAreaSide];
    return `${padding} ${safeAreaClass}`;
  },
} as const;

/**
 * Page layout presets for common page types
 * Use with PageLayout component for consistent layouts
 */
export const layoutPresets = {
  // Standard content page (most common)
  standard: {
    variant: 'standard' as const,
    background: 'bg-[#E8F5E9]',
    contentPadding: { x: spacing.page.x, y: spacing.page.y },
    showBottomNav: true,
  },

  // Full-screen page (e.g., map, camera)
  fullScreen: {
    variant: 'full-screen' as const,
    background: 'bg-[#E8F5E9]',
    contentPadding: { x: spacing.none.x, y: spacing.none.y },
    showBottomNav: true,
  },

  // Scrollable list page
  list: {
    variant: 'standard' as const,
    background: 'bg-[#E8F5E9]',
    contentPadding: { x: spacing.none.x, y: spacing.none.y },
    showBottomNav: true,
  },

  // Detail page with white background
  detail: {
    variant: 'standard' as const,
    background: 'bg-white',
    contentPadding: { x: spacing.page.x, y: spacing.page.y },
    showBottomNav: true,
  },

  // Form page with compact padding
  form: {
    variant: 'standard' as const,
    background: 'bg-[#E8F5E9]',
    contentPadding: { x: spacing.page.x, y: spacing.compact.y },
    showBottomNav: true,
  },

  // Auth pages (login, register) - no bottom nav
  auth: {
    variant: 'custom-header' as const,
    background: 'bg-[#E8F5E9]',
    contentPadding: { x: spacing.page.x, y: spacing.page.y },
    showBottomNav: false,
  },

  // Settings page
  settings: {
    variant: 'standard' as const,
    background: 'bg-[#F3F4F6]',
    contentPadding: { x: spacing.none.x, y: spacing.none.y },
    showBottomNav: true,
  },

  // Chat/messaging page
  chat: {
    variant: 'full-screen' as const,
    background: 'bg-[#E8F5E9]',
    contentPadding: { x: spacing.none.x, y: spacing.none.y },
    showBottomNav: false,
  },

  // Modal/overlay content
  modal: {
    variant: 'custom-header' as const,
    background: 'bg-white',
    contentPadding: { x: spacing.page.x, y: spacing.page.y },
    showBottomNav: false,
  },
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

  // Common flex layouts
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center',
  },
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
