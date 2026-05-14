'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'ar', label: 'العربية', flag: '🇪🇬' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative group">
      <button
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
          isPending && 'opacity-60',
        )}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{LANGS.find((l) => l.code === locale)?.label}</span>
        <span className="sm:hidden">{LANGS.find((l) => l.code === locale)?.flag}</span>
      </button>
      <div className="absolute end-0 top-full mt-1 hidden min-w-[140px] rounded-lg border bg-white p-1 shadow-lg group-hover:block">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() =>
              startTransition(() => router.replace(pathname, { locale: l.code as 'ar' }))
            }
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
              locale === l.code && 'bg-primary/10 text-primary font-semibold',
            )}
          >
            <span>{l.flag}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
