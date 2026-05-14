'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { TripDTO } from '@/types/api';

export default function AdminTripsPage() {
  const api = useAdminApi();
  const [trips, setTrips] = useState<TripDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get<{ items: TripDTO[] }>('/admin/trips?pageSize=100');
      setTrips(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const del = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف الرحلة؟')) return;
    try {
      await api.delete(`/admin/trips/${id}`);
      toast.success('تم الحذف');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة الرحلات</h2>
        <Button asChild>
          <Link href="/admin/trips/new"><Plus className="h-4 w-4" /> إضافة رحلة</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">جاري التحميل...</div>
          ) : trips.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">لا توجد رحلات</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-right border-b">
                  <th className="py-3 px-4 font-bold">العنوان</th>
                  <th className="py-3 px-4 font-bold">الفئة</th>
                  <th className="py-3 px-4 font-bold">المدة</th>
                  <th className="py-3 px-4 font-bold">السعر (ج.م)</th>
                  <th className="py-3 px-4 font-bold">السعر ($)</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                  <th className="py-3 px-4 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="py-2 px-4">
                      <div className="font-semibold">{t.translations.find((x) => x.locale === 'AR')?.title || t.translations[0]?.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{t.slug}</div>
                    </td>
                    <td className="py-2 px-4"><Badge variant="secondary">{t.category}</Badge></td>
                    <td className="py-2 px-4">{Math.floor(t.durationMinutes / 60)} ساعة</td>
                    <td className="py-2 px-4 font-bold">{Number(t.priceLocalEGP)}</td>
                    <td className="py-2 px-4 font-bold">${Number(t.priceForeignUSD)}</td>
                    <td className="py-2 px-4">
                      {t.isActive ? <Badge>نشط</Badge> : <Badge variant="secondary">غير نشط</Badge>}
                      {t.isFeatured && <Badge variant="accent" className="ms-1">مميز</Badge>}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-1">
                        <Button asChild size="icon" variant="ghost"><Link href={`/admin/trips/${t.id}`}><Edit className="h-4 w-4" /></Link></Button>
                        <Button asChild size="icon" variant="ghost"><a href={`/${'ar'}/trips/${t.slug}`} target="_blank" rel="noopener"><Eye className="h-4 w-4" /></a></Button>
                        <Button size="icon" variant="ghost" onClick={() => del(t.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                      </div>
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
