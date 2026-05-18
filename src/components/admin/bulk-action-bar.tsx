'use client';

import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating bottom action bar that appears when N rows are selected.
 * Pair with a per-row checkbox that calls onToggle(id).
 */
export function BulkActionBar({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'fixed bottom-4 inset-x-4 md:inset-x-auto md:start-1/2 md:-translate-x-1/2 rtl:md:translate-x-1/2 z-40 transition-all duration-200',
        count > 0 ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <div className="inline-flex items-center gap-3 bg-primary text-cream rounded-2xl shadow-2xl shadow-primary-900/30 border border-accent/30 px-3 py-2 backdrop-blur">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-cream/10"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold tabular-nums whitespace-nowrap">
          {count} <span className="font-normal opacity-80">محدد</span>
        </span>
        <div className="w-px h-5 bg-cream/20" />
        <div className="flex items-center gap-1">{children}</div>
      </div>
    </div>
  );
}

export function BulkActionButton({
  onClick,
  variant = 'default',
  children,
  disabled,
}: {
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
  children: ReactNode;
  disabled?: boolean;
}) {
  const color =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : variant === 'success'
      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
      : 'bg-cream/10 hover:bg-cream/20 text-cream';
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn('h-8 text-xs font-bold rounded-lg px-3', color)}
    >
      {children}
    </Button>
  );
}
