'use client';

import { useAdminAuth } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { LogOut, ExternalLink, Menu } from 'lucide-react';
import { Link } from '@/i18n/routing';

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAdminAuth();
  return (
    <header className="bg-white border-b sticky top-0 z-20">
      <div className="px-3 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md hover:bg-muted text-primary"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <h1 className="font-bold text-base md:text-lg truncate">لوحة التحكم</h1>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Link href="/" target="_blank" className="hidden sm:inline-flex items-center gap-1 text-xs md:text-sm text-primary hover:underline">
            <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden md:inline">الموقع</span>
          </Link>
          <span className="hidden md:inline text-sm text-muted-foreground truncate max-w-[200px]">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={() => void logout()} className="text-xs md:text-sm">
            <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" /> <span className="hidden sm:inline">خروج</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
