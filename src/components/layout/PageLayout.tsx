import React from 'react';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import { layoutPresets, spacing, safeArea, colors } from '@/lib/theme';
import { useStatusBar } from '@/hooks/useStatusBar';

type LayoutPreset = keyof typeof layoutPresets;

interface PageLayoutProps {
  // Quick preset (recommended approach)
  preset?: LayoutPreset;

  // Layout variants (can override preset)
  variant?: 'standard' | 'transparent-header' | 'full-screen' | 'custom-header';

  // Header configuration
  header?: {
    show?: boolean;
    className?: string;
    children?: React.ReactNode;
  };

  // Bottom navigation (can override preset)
  showBottomNav?: boolean;

  // Background color (Tailwind class) (can override preset)
  background?: string;

  // Content padding (can override preset)
  contentPadding?: {
    x?: string;
    y?: string;
  };

  // Loading state
  loading?: boolean;

  // Children
  children: React.ReactNode;

  // Additional classes
  className?: string;
  contentClassName?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  preset,
  variant,
  header = { show: true },
  showBottomNav,
  background,
  contentPadding,
  loading = false,
  children,
  className,
  contentClassName
}) => {
  // Apply preset defaults, then allow prop overrides
  const presetConfig = preset ? layoutPresets[preset] : null;

  const finalVariant = variant ?? presetConfig?.variant ?? 'standard';
  const finalShowBottomNav = showBottomNav ?? presetConfig?.showBottomNav ?? true;
  const finalBackground = background ?? presetConfig?.background ?? 'bg-[#E8F5E9]';
  const finalContentPadding = contentPadding ?? presetConfig?.contentPadding ?? { x: spacing.page.x, y: spacing.page.y };

  const { show: showHeader = true, className: headerClassName, children: headerChildren } = header;

  // Configure status bar based on variant
  useStatusBar({
    backgroundColor: finalVariant === 'transparent-header' ? '#00000000' : '#FFFFFF',
    style: 'DARK',
    overlay: true,
  });

  // Container classes
  const containerClasses = cn(
    'min-h-screen',
    finalBackground,
    finalShowBottomNav && safeArea.bottomNav, // Dynamic bottom padding with safe area
    finalVariant === 'full-screen' && 'h-screen flex flex-col',
    className
  );

  // Content classes
  const contentClasses = cn(
    finalContentPadding.x,
    finalContentPadding.y,
    finalVariant === 'full-screen' && 'flex-1 overflow-y-auto',
    contentClassName
  );

  // Loading spinner
  if (loading) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', finalBackground)}>
        <div className={cn('animate-spin rounded-full h-12 w-12 border-b-2', `border-[${colors.primary}]`)}></div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Header */}
      {showHeader && finalVariant === 'standard' && (
        <header className={cn('sticky-header bg-white', headerClassName)}>
          {headerChildren}
        </header>
      )}

      {showHeader && finalVariant === 'transparent-header' && (
        <header className={cn('fixed-header-transparent', headerClassName)}>
          {headerChildren}
        </header>
      )}

      {showHeader && finalVariant === 'custom-header' && (
        <header className={cn('bg-white', safeArea.top, headerClassName)}>
          {headerChildren}
        </header>
      )}

      {showHeader && finalVariant === 'full-screen' && (
        <header className={cn('bg-white flex-shrink-0', safeArea.top, headerClassName)}>
          {headerChildren}
        </header>
      )}

      {/* Main Content */}
      <main className={contentClasses}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {finalShowBottomNav && <BottomNav />}
    </div>
  );
};
