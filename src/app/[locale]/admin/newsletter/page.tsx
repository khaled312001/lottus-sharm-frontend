'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Sub {
  id: number;
  email: string;
  locale: string;
  isActive: boolean;
  subscribedAt: string;
}

export default function AdminNewsletterPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<Sub[]>([]);

  const load = async () => {
    try {
      const res = await api.get<{ items: Sub[] }>('/admin/newsletter');
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const del = async (id: number) => {
    if (!confirm('حذف المشترك؟')) return;
    try { await api.delete(`/admin/newsletter/${id}`); void load(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  const exportCsv = () => {
    const csv = ['email,locale,subscribed_at', ...items.map((i) => `${i.email},${i.locale},${i.subscribedAt}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lotus-newsletter-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">النشرة البريدية ({items.length})</h2>
        <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> تصدير CSV</Button>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr><th className="py-3 px-3 text-right">البريد الإلكتروني</th><th className="py-3 px-3 text-right">اللغة</th><th className="py-3 px-3 text-right">تاريخ الاشتراك</th><th className="py-3 px-3 text-right">حذف</th></tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t hover:bg-muted/20">
                  <td className="py-2 px-3">{s.email}</td>
                  <td className="py-2 px-3">{s.locale}</td>
                  <td className="py-2 px-3 text-xs">{new Date(s.subscribedAt).toLocaleDateString('ar-EG')}</td>
                  <td className="py-2 px-3"><Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
