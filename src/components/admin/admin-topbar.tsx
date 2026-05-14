'use client';

import { useAdminAuth } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { LogOut, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/routing';

export function AdminTopbar() {
  const { user, logout } = useAdminAuth();
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="px-6 h-16 flex items-center justify-between gap-3">
        <h1 className="font-bold text-lg">لوحة التحكم</h1>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            <ExternalLink className="h-4 w-4" /> الموقع
          </Link>
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={() => void logout()}>
            <LogOut className="h-4 w-4" /> خروج
          </Button>
        </div>
      </div>
    </header>
  );
}
