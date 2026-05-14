'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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
  const [items, setItems] = useState<BookingItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingItem['status'] | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">إدارة الحجوزات</h2>

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
    </div>
  );
}
