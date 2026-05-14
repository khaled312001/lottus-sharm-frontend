'use client';

import { Link, usePathname } from '@/i18n/routing';
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Users,
  CreditCard,
  Tag,
  FileText,
  FolderOpen,
  Settings,
  Star,
  Mail,
  MessageSquare,
  UserCog,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  {
    title: 'الرئيسية',
    items: [{ href: '/admin/dashboard' as const, icon: LayoutDashboard, label: 'لوحة التحكم' }],
  },
  {
    title: 'المحتوى',
    items: [
      { href: '/admin/trips' as const, icon: Map, label: 'الرحلات' },
      { href: '/admin/blog' as const, icon: FileText, label: 'المدونة' },
      { href: '/admin/pages' as const, icon: FolderOpen, label: 'الصفحات' },
      { href: '/admin/media' as const, icon: ImageIcon, label: 'مكتبة الميديا' },
      { href: '/admin/reviews' as const, icon: Star, label: 'التقييمات' },
    ],
  },
  {
    title: 'العمليات',
    items: [
      { href: '/admin/bookings' as const, icon: CalendarCheck, label: 'الحجوزات' },
      { href: '/admin/payments' as const, icon: CreditCard, label: 'المدفوعات' },
      { href: '/admin/coupons' as const, icon: Tag, label: 'كوبونات الخصم' },
      { href: '/admin/customers' as const, icon: Users, label: 'العملاء' },
    ],
  },
  {
    title: 'التواصل',
    items: [
      { href: '/admin/inquiries' as const, icon: MessageSquare, label: 'الرسائل' },
      { href: '/admin/newsletter' as const, icon: Mail, label: 'النشرة البريدية' },
    ],
  },
  {
    title: 'الإعدادات',
    items: [
      { href: '/admin/settings' as const, icon: Settings, label: 'إعدادات الموقع' },
      { href: '/admin/users' as const, icon: UserCog, label: 'المستخدمون' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname() || '';
  return (
    <aside className="w-64 bg-white border-l h-screen sticky top-0 overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold">L</div>
          <div>
            <div className="font-extrabold text-sm">لوتتس شرم</div>
            <div className="text-[10px] text-muted-foreground">لوحة التحكم</div>
          </div>
        </Link>
      </div>
      <nav className="p-3 space-y-5">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 px-2">{s.title}</div>
            <ul className="space-y-0.5">
              {s.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                        active ? 'bg-primary text-white font-semibold' : 'hover:bg-muted text-foreground/80',
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
