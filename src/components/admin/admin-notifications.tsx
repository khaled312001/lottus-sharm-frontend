'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Bell, X, Check, Calendar, Star, MessageSquare, Mail, type LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAdminAuth } from '@/lib/admin-auth';
import { API_BASE } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export type AdminNotification = {
  id: string;
  type: 'booking' | 'review' | 'comment' | 'contact';
  title: string;
  body?: string;
  link?: string;
  createdAt: string;
  read?: boolean;
};

interface NotifCtx {
  items: AdminNotification[];
  unread: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clear: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const Ctx = createContext<NotifCtx | null>(null);

const STORAGE_KEY = 'lotus_admin_notifs';
const SOUND_KEY = 'lotus_admin_sound';

const ICONS: Record<AdminNotification['type'], LucideIcon> = {
  booking: Calendar,
  review: Star,
  comment: MessageSquare,
  contact: Mail,
};

const TYPE_STYLES: Record<AdminNotification['type'], string> = {
  booking: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  review:  'bg-amber-100 text-amber-700 border-amber-300',
  comment: 'bg-sky-100 text-sky-700 border-sky-300',
  contact: 'bg-violet-100 text-violet-700 border-violet-300',
};

// Two soft synthesised chimes — distinct per category — so admins can tell
// what arrived without looking at the screen.
function playChime(type: AdminNotification['type']) {
  if (typeof window === 'undefined') return;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const now = ctx.currentTime;
    const tones: Record<AdminNotification['type'], number[]> = {
      booking: [880, 1320],   // bright two-tone — money sound
      review:  [988, 1175],    // softer two-tone
      comment: [659, 784],     // mid two-tone
      contact: [523, 659, 784], // three-tone alert
    };
    const seq = tones[type];
    seq.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.13);
      gain.gain.setValueAtTime(0, now + i * 0.13);
      gain.gain.linearRampToValueAtTime(0.22, now + i * 0.13 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.13 + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.13);
      osc.stop(now + i * 0.13 + 0.3);
    });
    // Close the context after the sound finishes
    setTimeout(() => ctx.close().catch(() => undefined), 1200);
  } catch { /* ignore audio errors */ }
}

export function AdminNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAdminAuth();
  const [items, setItems] = useState<AdminNotification[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(SOUND_KEY) !== 'off';
  });
  const esRef = useRef<EventSource | null>(null);

  const unread = items.filter((n) => !n.read).length;

  const persist = useCallback((next: AdminNotification[]) => {
    setItems(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 50)));
    }
  }, []);

  const markAllRead = useCallback(() => {
    persist(items.map((n) => ({ ...n, read: true })));
  }, [items, persist]);

  const markRead = useCallback((id: string) => {
    persist(items.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, [items, persist]);

  const clear = useCallback(() => persist([]), [persist]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((s) => {
      const next = !s;
      if (typeof window !== 'undefined') localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
      return next;
    });
  }, []);

  // SSE connection — re-opens when auth changes
  useEffect(() => {
    if (!token || !user) return;
    // SSE doesn't support custom headers in the standard EventSource API.
    // We pass the token as a query param; the auth middleware reads from it.
    const url = `${API_BASE}/admin/notifications/stream?access_token=${encodeURIComponent(token)}`;
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.addEventListener('notify', (evt) => {
      try {
        const data = JSON.parse((evt as MessageEvent).data) as AdminNotification;
        persist([{ ...data, read: false }, ...items].slice(0, 50));
        if (soundEnabled) playChime(data.type);
        // Toast with link
        const Icon = ICONS[data.type];
        toast.custom(() => (
          <div className="flex items-start gap-3 bg-white border border-accent/25 rounded-xl shadow-2xl shadow-primary-900/20 p-3 pe-4 max-w-sm">
            <span className={cn('inline-flex items-center justify-center w-9 h-9 rounded-xl border shrink-0', TYPE_STYLES[data.type])}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-primary text-sm leading-tight">{data.title}</div>
              {data.body && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{data.body}</div>}
              {data.link && (
                <Link href={data.link as never} className="inline-block mt-1.5 text-xs font-bold text-accent-700 hover:text-accent">
                  عرض ←
                </Link>
              )}
            </div>
          </div>
        ), { duration: 6000 });
      } catch { /* ignore */ }
    });

    es.onerror = () => {
      // EventSource auto-reconnects; nothing to do
    };

    return () => {
      es.close();
      esRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id, soundEnabled]);

  return (
    <Ctx.Provider value={{ items, unread, markAllRead, markRead, clear, soundEnabled, toggleSound }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdminNotifications must be used inside AdminNotificationsProvider');
  return ctx;
}

// ============== Bell with dropdown ==============
export function NotificationBell() {
  const { items, unread, markAllRead, markRead, clear, soundEnabled, toggleSound } = useAdminNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-primary hover:bg-muted transition-colors',
          open && 'bg-muted',
        )}
        aria-label="Notifications"
      >
        <Bell className={cn('h-5 w-5', unread > 0 && 'animate-wiggle')} />
        {unread > 0 && (
          <>
            <span className="absolute top-1.5 end-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping opacity-75" />
            <span className="absolute top-1 end-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold tabular-nums">
              {unread > 99 ? '99+' : unread}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 end-0 w-[min(380px,calc(100vw-2rem))] bg-white border border-accent/25 rounded-2xl shadow-2xl shadow-primary-900/15 overflow-hidden z-50" style={{ animation: 'card-float-in 0.2s ease-out' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-primary">الإشعارات</h3>
              {unread > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                  {unread} جديد
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSound}
                title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
                className={cn(
                  'inline-flex items-center justify-center w-7 h-7 rounded-md text-xs transition-colors',
                  soundEnabled ? 'text-accent-700 hover:bg-accent/10' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {soundEnabled ? '🔔' : '🔕'}
              </button>
              {items.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={markAllRead}
                    title="قراءة الكل"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={clear}
                    title="حذف الكل"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-8 px-4 text-sm text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                لا توجد إشعارات
              </div>
            ) : (
              <ul className="divide-y divide-muted">
                {items.map((n) => {
                  const Icon = ICONS[n.type];
                  return (
                    <li key={n.id} className={cn('hover:bg-muted/40 transition-colors', !n.read && 'bg-accent/5')}>
                      <Link
                        href={(n.link as never) || ('/admin' as never)}
                        onClick={() => { markRead(n.id); setOpen(false); }}
                        className="flex items-start gap-3 p-3"
                      >
                        <span className={cn('inline-flex items-center justify-center w-8 h-8 rounded-lg border shrink-0', TYPE_STYLES[n.type])}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <div className="font-bold text-primary text-sm leading-tight flex-1">{n.title}</div>
                            {!n.read && <span className="inline-block w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />}
                          </div>
                          {n.body && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>}
                          <div className="text-[10px] text-muted-foreground mt-1">{formatRelative(n.createdAt)}</div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'الآن';
  if (min < 60) return `قبل ${min} د`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `قبل ${hrs} س`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `قبل ${days} ي`;
  return new Date(iso).toLocaleDateString('ar-EG');
}
