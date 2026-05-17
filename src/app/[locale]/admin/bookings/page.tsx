'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminApi, useAdminAuth } from '@/lib/admin-auth';
import { API_BASE } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Calendar as CalIcon, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BookingItem {
  id: number;
  reference: string;
  bookingDate: string;
  adultsCount: number;
  childrenCount: number;
  total: string;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  customer: { fullName: string; email: string; phone: string };
  trip: { translations: Array<{ locale: string; title: string }> };
  createdAt: string;
  notes?: string | null;
}

const STATUS_LABELS: Record<BookingItem['status'], string> = {
  PENDING: 'معلق',
  CONFIRMED: 'مؤكد',
  CANCELLED: 'ملغي',
  COMPLETED: 'مكتمل',
};

export default function AdminBookingsPage() {
  const api = useAdminApi();
  const { token } = useAdminAuth();
  const [items, setItems] = useState<BookingItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingItem['status'] | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calMonth, setCalMonth] = useState(() => new Date());

  const downloadCSV = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/exports/bookings.csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم تصدير CSV');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (search) qs.set('search', search);
      if (statusFilter !== 'ALL') qs.set('status', statusFilter);
      const res = await api.get<{ items: BookingItem[] }>(`/admin/bookings?${qs}`);
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [statusFilter]);

  const updateStatus = async (id: number, status: BookingItem['status']) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status });
      toast.success('تم التحديث');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  // Group bookings by date for the calendar view
  const byDate = useMemo(() => {
    const map = new Map<string, BookingItem[]>();
    items.forEach((b) => {
      const key = new Date(b.bookingDate).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    return map;
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">إدارة الحجوزات <span className="text-sm font-normal text-muted-foreground">({items.length})</span></h2>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border bg-white overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={cn('px-3 py-2 text-xs font-semibold inline-flex items-center gap-1.5', view === 'list' ? 'bg-primary text-cream' : 'hover:bg-muted')}
            >
              <List className="h-3.5 w-3.5" /> قائمة
            </button>
            <button
              onClick={() => setView('calendar')}
              className={cn('px-3 py-2 text-xs font-semibold inline-flex items-center gap-1.5', view === 'calendar' ? 'bg-primary text-cream' : 'hover:bg-muted')}
            >
              <CalIcon className="h-3.5 w-3.5" /> تقويم
            </button>
          </div>
          <Button variant="outline" onClick={downloadCSV} className="text-xs">
            <Download className="h-3.5 w-3.5" /> تصدير CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2 items-center">
          <Input placeholder="بحث (رقم، اسم، إيميل)..." className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
          <select className="h-11 rounded-lg border px-3" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingItem['status'] | 'ALL')}>
            <option value="ALL">كل الحالات</option>
            <option value="PENDING">معلق</option>
            <option value="CONFIRMED">مؤكد</option>
            <option value="CANCELLED">ملغي</option>
            <option value="COMPLETED">مكتمل</option>
          </select>
          <Button onClick={load} variant="outline">تطبيق</Button>
        </CardContent>
      </Card>

      {/* Calendar view */}
      {view === 'calendar' && (
        <Card>
          <CardContent className="p-4">
            <CalendarView month={calMonth} setMonth={setCalMonth} byDate={byDate} />
          </CardContent>
        </Card>
      )}

      {view === 'list' && (
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center">جاري التحميل...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد حجوزات</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="py-3 px-3 text-right">المرجع</th>
                  <th className="py-3 px-3 text-right">العميل</th>
                  <th className="py-3 px-3 text-right">الرحلة</th>
                  <th className="py-3 px-3 text-right">التاريخ</th>
                  <th className="py-3 px-3 text-right">الأشخاص</th>
                  <th className="py-3 px-3 text-right">المبلغ</th>
                  <th className="py-3 px-3 text-right">الدفع</th>
                  <th className="py-3 px-3 text-right">الحالة</th>
                  <th className="py-3 px-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id} className="border-t hover:bg-muted/20">
                    <td className="py-2 px-3 font-mono text-xs">{b.reference}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold">{b.customer.fullName}</div>
                      <div className="text-xs text-muted-foreground">{b.customer.email}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">{b.customer.phone}</div>
                    </td>
                    <td className="py-2 px-3 max-w-[200px]"><div className="line-clamp-2">{b.trip.translations.find((t) => t.locale === 'AR')?.title || b.trip.translations[0]?.title}</div></td>
                    <td className="py-2 px-3 text-xs">{new Date(b.bookingDate).toLocaleDateString('ar-EG')}</td>
                    <td className="py-2 px-3">{b.adultsCount}+{b.childrenCount}</td>
                    <td className="py-2 px-3 font-bold">{Number(b.total).toLocaleString()} {b.currency}</td>
                    <td className="py-2 px-3">
                      <Badge variant={b.paymentStatus === 'PAID' ? 'default' : 'secondary'}>{b.paymentStatus}</Badge>
                    </td>
                    <td className="py-2 px-3">
                      <select
                        className="h-8 rounded-md border px-2 text-xs bg-white"
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value as BookingItem['status'])}
                      >
                        {Object.entries(STATUS_LABELS).map(([v, label]) => (
                          <option key={v} value={v}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <a href={`https://wa.me/${b.customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">WhatsApp</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}

// ============== Calendar View ==============
function CalendarView({
  month, setMonth, byDate,
}: {
  month: Date;
  setMonth: (d: Date) => void;
  byDate: Map<string, BookingItem[]>;
}) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDow = new Date(year, m, 1).getDay();
  const days = new Date(year, m + 1, 0).getDate();
  const cells: ({ day: number; date: string } | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    cells.push({ day: d, date: new Date(year, m, d).toISOString().slice(0, 10) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const todayISO = new Date().toISOString().slice(0, 10);
  const monthName = month.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

  const statusColor: Record<BookingItem['status'], string> = {
    PENDING:   'bg-amber-500',
    CONFIRMED: 'bg-emerald-500',
    CANCELLED: 'bg-rose-500',
    COMPLETED: 'bg-sky-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(new Date(year, m - 1, 1))} className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="font-serif font-bold text-lg text-primary">{monthName}</div>
        <button onClick={() => setMonth(new Date(year, m + 1, 1))} className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1 text-center text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
        {['أحد','إثن','ثلا','أرب','خمي','جمع','سبت'].map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c) return <div key={i} />;
          const list = byDate.get(c.date) || [];
          const isToday = c.date === todayISO;
          return (
            <div
              key={i}
              className={cn(
                'min-h-[88px] rounded-lg border p-1.5 flex flex-col text-start transition-colors',
                isToday ? 'bg-accent/10 border-accent/40' : 'bg-white border-accent/15 hover:border-accent/30',
              )}
            >
              <div className={cn('text-xs font-bold mb-1', isToday ? 'text-accent-700' : 'text-primary')}>{c.day}</div>
              <div className="space-y-1 overflow-y-auto">
                {list.slice(0, 3).map((b) => (
                  <a
                    key={b.id}
                    href={`#booking-${b.id}`}
                    title={`${b.customer.fullName} — ${b.trip.translations.find((t) => t.locale === 'AR')?.title || ''}`}
                    className="block text-[10px] truncate px-1 py-0.5 rounded bg-muted/60 hover:bg-muted text-primary"
                  >
                    <span className={cn('inline-block w-1.5 h-1.5 rounded-full me-1 align-middle', statusColor[b.status])} />
                    {b.customer.fullName}
                  </a>
                ))}
                {list.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">+{list.length - 3} {list.length - 3 === 1 ? 'حجز' : 'حجوزات'}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as BookingItem['status'][]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={cn('inline-block w-2 h-2 rounded-full', statusColor[s])} />
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
