'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, CalendarCheck, Users, DollarSign, Mail } from 'lucide-react';

interface Stats {
  totals: {
    totalTrips: number;
    activeTrips: number;
    totalBookingsMonth: number;
    pendingBookings: number;
    confirmedBookings: number;
    totalCustomers: number;
    revenueMonth: number;
    newInquiries: number;
  };
  recentBookings: Array<{
    id: number;
    reference: string;
    total: string;
    currency: string;
    status: string;
    customer: { fullName: string; email: string };
    trip: { translations: Array<{ locale: string; title: string }> };
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const api = useAdminApi();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/admin/stats/dashboard').then(setStats).catch(() => setStats(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    { label: 'الرحلات النشطة', value: stats?.totals.activeTrips ?? '—', icon: Map, color: 'bg-blue-500' },
    { label: 'حجوزات الشهر', value: stats?.totals.totalBookingsMonth ?? '—', icon: CalendarCheck, color: 'bg-green-500' },
    { label: 'العملاء', value: stats?.totals.totalCustomers ?? '—', icon: Users, color: 'bg-purple-500' },
    { label: 'إيرادات الشهر', value: stats ? `${stats.totals.revenueMonth.toLocaleString()} ج.م` : '—', icon: DollarSign, color: 'bg-amber-500' },
    { label: 'حجوزات معلقة', value: stats?.totals.pendingBookings ?? '—', icon: CalendarCheck, color: 'bg-orange-500' },
    { label: 'رسائل جديدة', value: stats?.totals.newInquiries ?? '—', icon: Mail, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center text-white`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                  <div className="font-bold text-lg">{c.value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>آخر الحجوزات</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats?.recentBookings.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">لا توجد حجوزات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-right">
                    <th className="py-2 px-2">المرجع</th>
                    <th className="py-2 px-2">العميل</th>
                    <th className="py-2 px-2">الرحلة</th>
                    <th className="py-2 px-2">المبلغ</th>
                    <th className="py-2 px-2">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 px-2 font-mono text-xs">{b.reference}</td>
                      <td className="py-2 px-2">{b.customer.fullName}</td>
                      <td className="py-2 px-2 line-clamp-1">{b.trip.translations[0]?.title}</td>
                      <td className="py-2 px-2 font-bold">{Number(b.total).toLocaleString()} {b.currency}</td>
                      <td className="py-2 px-2">
                        <Badge variant={b.status === 'CONFIRMED' ? 'default' : 'secondary'}>{b.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
