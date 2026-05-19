'use client';

import { useState, useMemo } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import {
  LayoutDashboard, Map, CalendarCheck, Users, CreditCard, Tag, FileText, FolderOpen,
  Settings, Star, Mail, MessageSquare, MessagesSquare, UserCog, Image as ImageIcon, X, Send, BarChart3, Search,
  QrCode, BedDouble, Car,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { title: 'الرئيسية', items: [
    { href: '/admin/dashboard' as const, icon: LayoutDashboard, label: 'لوحة التحكم' },
    { href: '/admin/reports' as const,   icon: BarChart3,       label: 'التقارير' },
  ]},
  { title: 'العمليات', items: [
    { href: '/admin/bookings' as const, icon: CalendarCheck, label: 'الحجوزات' },
    { href: '/admin/customers' as const, icon: Users, label: 'العملاء' },
    { href: '/admin/payments' as const, icon: CreditCard, label: 'المدفوعات' },
    { href: '/admin/coupons' as const, icon: Tag, label: 'كوبونات الخصم' },
  ]},
  { title: 'المحتوى', items: [
    { href: '/admin/trips' as const, icon: Map, label: 'الرحلات' },
    { href: '/admin/hotels' as const, icon: BedDouble, label: 'الفنادق' },
    { href: '/admin/transfers' as const, icon: Car, label: 'خدمات النقل' },
    { href: '/admin/blog' as const, icon: FileText, label: 'المدونة' },
    { href: '/admin/pages' as const, icon: FolderOpen, label: 'الصفحات' },
    { href: '/admin/media' as const, icon: ImageIcon, label: 'مكتبة الميديا' },
    { href: '/admin/reviews' as const, icon: Star, label: 'التقييمات' },
    { href: '/admin/comments' as const, icon: MessagesSquare, label: 'التعليقات' },
  ]},
  { title: 'التواصل', items: [
    { href: '/admin/inquiries' as const, icon: MessageSquare, label: 'الرسائل' },
    { href: '/admin/newsletter' as const, icon: Send, label: 'النشرة البريدية' },
    { href: '/admin/email' as const, icon: Mail, label: 'البريد الإلكتروني' },
    { href: '/admin/qr-codes' as const, icon: QrCode, label: 'رموز QR' },
  ]},
  { title: 'الإعدادات', items: [
    { href: '/admin/settings' as const, icon: Settings, label: 'إعدادات الموقع' },
    { href: '/admin/users' as const, icon: UserCog, label: 'المستخدمون' },
  ]},
];

export function AdminSidebar({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname() || '';
  const [q, setQ] = useState('');

  // Filter sections by the search query (case-insensitive, matches label, also Arabic chars)
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return SECTIONS;
    return SECTIONS
      .map((s) => ({
        ...s,
        items: s.items.filter((i) => i.label.toLowerCase().includes(needle)),
      }))
      .filter((s) => s.items.length > 0);
  }, [q]);

  const totalMatches = filtered.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <Link href="/admin/dashboard" onClick={onItemClick} className="flex items-center gap-2 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-cream font-bold flex-shrink-0">L</div>
          <div className="min-w-0">
            <div className="font-extrabold text-sm truncate">لوتس شرم</div>
            <div className="text-[10px] text-muted-foreground">لوحة التحكم</div>
          </div>
        </Link>
        {onItemClick && (
          <button onClick={onItemClick} className="lg:hidden p-1.5 rounded-md hover:bg-muted" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search filter */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في القائمة..."
            className="w-full ps-9 pe-8 py-2 rounded-lg bg-muted/40 border border-transparent focus:border-accent/60 focus:bg-white outline-none text-sm transition-colors"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              aria-label="Clear"
              className="absolute end-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {q && (
          <p className="text-[11px] text-muted-foreground mt-1.5 px-1">
            {totalMatches > 0 ? `${totalMatches} نتيجة` : 'لا توجد نتائج'}
          </p>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            <Search className="h-5 w-5 mx-auto mb-2 opacity-40" />
            لا توجد نتائج للبحث
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.title}>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 px-2">{s.title}</div>
              <ul className="space-y-0.5">
                {s.items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onItemClick}
                        className={cn(
                          'flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm transition-colors',
                          active ? 'bg-primary text-cream font-semibold' : 'hover:bg-muted text-foreground/80',
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {q ? <Highlight text={item.label} q={q} /> : item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </nav>
    </div>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  const needle = q.trim();
  if (!needle) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(needle.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent/30 text-current rounded px-0.5">{text.slice(idx, idx + needle.length)}</mark>
      {text.slice(idx + needle.length)}
    </>
  );
}
