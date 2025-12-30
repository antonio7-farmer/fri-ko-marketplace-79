import React from 'react';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';

interface PageLayoutProps {
  // Layout variants
  variant?: 'standard' | 'transparent-header' | 'full-screen' | 'custom-header';

  // Header configuration
  header?: {
    show?: boolean;
    className?: string;
    children?: React.ReactNode;
  };

  // Bottom navigation
  showBottomNav?: boolean;

  // Background color (Tailwind class)
  background?: string;

  // Content padding
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
  variant = 'standard',
  header = { show: true },
  showBottomNav = true,
  background = 'bg-[#E8F5E9]',
  contentPadding = { x: 'px-6', y: 'py-6' },
  loading = false,
  children,
  className,
  contentClassName
}) => {
  const { show: showHeader = true, className: headerClassName, children: headerChildren } = header;

  // Container classes
  const containerClasses = cn(
    'min-h-screen',
    background,
    showBottomNav && 'pb-bottom-nav', // Dynamic bottom padding with safe area
    variant === 'full-screen' && 'h-screen flex flex-col',
    className
  );

  // Content classes
  const contentClasses = cn(
    contentPadding.x,
    contentPadding.y,
    contentClassName
  );

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22C55E]"></div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Header */}
      {showHeader && variant === 'standard' && (
        <header className={cn('sticky-header bg-white', headerClassName)}>
          {headerChildren}
        </header>
      )}

      {showHeader && variant === 'transparent-header' && (
        <header className={cn('fixed-header-transparent', headerClassName)}>
          {headerChildren}
        </header>
      )}

      {showHeader && variant === 'custom-header' && (
        <div className={cn('safe-top', headerClassName)}>
          {headerChildren}
        </div>
      )}

      {/* Main Content */}
      <main className={contentClasses}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNav />}
    </div>
  );
};
