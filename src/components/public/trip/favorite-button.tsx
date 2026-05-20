'use client';

import { useEffect, useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, usePathname } from '@/i18n/routing';
import { useCustomer } from '@/lib/customer-auth';
import { API_BASE } from '@/lib/api';
import { L, cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

interface FavoriteIndex {
  ids: Set<number>;
  loading: boolean;
  toggle: (tripId: number) => Promise<void>;
}

// Local cache of the customer's favorite trip IDs — shared via window.
const CACHE_KEY = '__lotus_fav_ids__';
function getCache(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  const w = window as unknown as { [CACHE_KEY]?: Set<number> };
  if (!w[CACHE_KEY]) w[CACHE_KEY] = new Set();
  return w[CACHE_KEY]!;
}

function useFavorites(): FavoriteIndex {
  const { customer } = useCustomer();
  const [ids, setIds] = useState<Set<number>>(getCache());
  const [loading, setLoading] = useState(false);

  // Fetch once when customer logs in
  useEffect(() => {
    if (!customer) { setIds(new Set()); return; }
    if (ids.size > 0) return; // already cached
    setLoading(true);
    fetch(`${API_BASE}/auth/customer/me/favorites`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        if (j?.ok) {
          const next = new Set<number>(j.data.tripIds || []);
          const cache = getCache();
          cache.clear();
          next.forEach((id) => cache.add(id));
          setIds(new Set(next));
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id]);

  const toggle = async (tripId: number) => {
    const res = await fetch(`${API_BASE}/auth/customer/me/favorites/toggle`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId }),
    });
    const j = await res.json();
    if (!res.ok || !j?.ok) throw new Error(j?.error?.message || 'Failed');
    const cache = getCache();
    if (j.data.favorited) cache.add(tripId); else cache.delete(tripId);
    setIds(new Set(cache));
  };

  return { ids, loading, toggle };
}

export function FavoriteButton({
  tripId,
  size = 'md',
  className,
}: {
  tripId: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const { customer } = useCustomer();
  const { ids, toggle } = useFavorites();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [bump, setBump] = useState(false);

  const active = ids.has(tripId);
  const dim = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' }[size];
  const icon = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' }[size];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!customer) {
      // Redirect to login with return path
      const next = pathname || '/';
      router.push(`/login?next=${encodeURIComponent(next)}` as never);
      toast.info(L(locale, {
        ar: 'سجّل دخولك لحفظ الرحلة في مفضلاتك',
        en: 'Sign in to save trips to favorites', de: 'Sign in to save trips to favorites',
        ru: 'Войдите, чтобы добавить в избранное',
        it: 'Accedi per salvare nei preferiti',
      }) as string);
      return;
    }
    setBump(true);
    setTimeout(() => setBump(false), 320);
    startTransition(() => {
      toggle(tripId)
        .then(() => {
          toast.success(L(locale, {
            ar: active ? 'أُزيلت من المفضلات' : 'أُضيفت لمفضلاتك',
            en: active ? 'Removed from favorites' : 'Added to favorites',
            de: active ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt',
            ru: active ? 'Удалено из избранного' : 'Добавлено в избранное',
            it: active ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti',
          }) as string);
        })
        .catch((err) => toast.error(err.message || 'Error'));
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200 backdrop-blur',
        dim,
        active
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 hover:bg-rose-600'
          : 'bg-cream/90 text-primary hover:bg-cream hover:scale-110 hover:text-rose-500',
        bump && 'scale-125',
        className,
      )}
    >
      <Heart className={cn(icon, 'transition-transform', active && 'fill-current')} />
    </button>
  );
}
