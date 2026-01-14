'use client';

import React from 'react';
import { cn } from '@/lib/cn';

// ============================================
// BASE SKELETON
// ============================================
interface SkeletonBaseProps {
  className?: string;
}

function SkeletonBase({ className }: SkeletonBaseProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-primary-800 via-primary-700 to-primary-800 bg-[length:200%_100%]',
        'rounded-xl',
        className
      )}
      style={{
        animation: 'shimmer 2s infinite linear',
        backgroundSize: '200% 100%',
      }}
    />
  );
}

// ============================================
// SKELETON TEXT
// ============================================
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: 'full' | 'half' | 'three-quarters';
}

function SkeletonText({ lines = 3, className, lastLineWidth = 'three-quarters' }: SkeletonTextProps) {
  const lastWidthClass = {
    'full': 'w-full',
    'half': 'w-1/2',
    'three-quarters': 'w-3/4',
  }[lastLineWidth];

  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? lastWidthClass : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

// ============================================
// SKELETON AVATAR
// ============================================
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <SkeletonBase
      className={cn('rounded-full', sizeClasses[size], className)}
    />
  );
}

// ============================================
// SKELETON CARD
// ============================================
interface SkeletonCardProps {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
  className?: string;
}

function SkeletonCard({ hasImage = false, hasAvatar = false, lines = 3, className }: SkeletonCardProps) {
  return (
    <div className={cn('glass-card rounded-2xl p-4 space-y-4', className)}>
      {/* Image placeholder */}
      {hasImage && (
        <SkeletonBase className="w-full h-40 rounded-xl" />
      )}

      {/* Header with optional avatar */}
      <div className="flex items-center gap-3">
        {hasAvatar && <SkeletonAvatar size="md" />}
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-3/4" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
      </div>

      {/* Content lines */}
      <SkeletonText lines={lines} />
    </div>
  );
}

// ============================================
// SKELETON BUTTON
// ============================================
interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  width?: 'auto' | 'full';
  className?: string;
}

function SkeletonButton({ size = 'md', width = 'auto', className }: SkeletonButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-28',
    lg: 'h-12 w-36',
  };

  return (
    <SkeletonBase
      className={cn(
        'rounded-xl',
        width === 'full' ? 'w-full' : sizeClasses[size],
        className
      )}
    />
  );
}

// ============================================
// SKELETON TABLE
// ============================================
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header row */}
      <div className="flex gap-4 pb-2 border-b border-primary-700/30">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBase key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonBase key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
// SKELETON LIST ITEM
// ============================================
interface SkeletonListItemProps {
  hasIcon?: boolean;
  hasAction?: boolean;
  className?: string;
}

function SkeletonListItem({ hasIcon = true, hasAction = false, className }: SkeletonListItemProps) {
  return (
    <div className={cn('flex items-center gap-3 p-3', className)}>
      {hasIcon && <SkeletonBase className="w-8 h-8 rounded-lg shrink-0" />}
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-4 w-3/4" />
        <SkeletonBase className="h-3 w-1/2" />
      </div>
      {hasAction && <SkeletonBase className="w-6 h-6 rounded-lg shrink-0" />}
    </div>
  );
}

// ============================================
// SKELETON INPUT
// ============================================
interface SkeletonInputProps {
  hasLabel?: boolean;
  className?: string;
}

function SkeletonInput({ hasLabel = true, className }: SkeletonInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {hasLabel && <SkeletonBase className="h-3 w-24" />}
      <SkeletonBase className="h-10 w-full rounded-xl" />
    </div>
  );
}

// ============================================
// EXPORT
// ============================================
export const Skeleton = {
  Base: SkeletonBase,
  Text: SkeletonText,
  Avatar: SkeletonAvatar,
  Card: SkeletonCard,
  Button: SkeletonButton,
  Table: SkeletonTable,
  ListItem: SkeletonListItem,
  Input: SkeletonInput,
};

export default Skeleton;
