'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CustomerItem {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  country?: string | null;
  language: string;
  createdAt: string;
  _count?: { bookings: number };
}

export default function AdminCustomersPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get<{ items: CustomerItem[] }>(`/admin/customers${qs}`);
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">العملاء</h2>
      <Card>
        <CardContent className="p-4 flex gap-2 items-center">
          <Input placeholder="بحث (اسم، إيميل، هاتف)" className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
          <Button onClick={load} variant="outline">بحث</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="py-3 px-3 text-right">الاسم</th>
                <th className="py-3 px-3 text-right">الإيميل</th>
                <th className="py-3 px-3 text-right">الهاتف</th>
                <th className="py-3 px-3 text-right">الجنسية</th>
                <th className="py-3 px-3 text-right">عدد الحجوزات</th>
                <th className="py-3 px-3 text-right">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">لا يوجد عملاء</td></tr>
              ) : items.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/20">
                  <td className="py-2 px-3 font-semibold">{c.fullName}</td>
                  <td className="py-2 px-3">{c.email}</td>
                  <td className="py-2 px-3" dir="ltr">{c.phone}</td>
                  <td className="py-2 px-3">{c.country || '—'}</td>
                  <td className="py-2 px-3 font-bold">{c._count?.bookings ?? 0}</td>
                  <td className="py-2 px-3 text-xs">{new Date(c.createdAt).toLocaleDateString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
