'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  locale: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<Inquiry[]>([]);

  const load = async () => {
    try {
      const res = await api.get<{ items: Inquiry[] }>('/admin/contact');
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const markRead = async (id: number) => {
    try { await api.patch(`/admin/contact/${id}`); void load(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };
  const del = async (id: number) => {
    if (!confirm('حذف الرسالة؟')) return;
    try { await api.delete(`/admin/contact/${id}`); void load(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">الإشعارات</h2>
      <Card>
        <CardContent className="p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">لا توجد رسائل</p>
          ) : items.map((r) => (
            <div key={r.id} className={`border rounded-lg p-4 ${r.isRead ? 'bg-white' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {r.name} {!r.isRead && <Badge variant="accent">جديد</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <a href={`mailto:${r.email}`} className="text-primary hover:underline">{r.email}</a>
                    {r.phone && <> · <a href={`https://wa.me/${r.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="text-primary hover:underline" dir="ltr">{r.phone}</a></>}
                    · {new Date(r.createdAt).toLocaleString('ar-EG')}
                  </div>
                  {r.subject && <div className="font-semibold text-sm mt-1">{r.subject}</div>}
                </div>
                <div className="flex gap-1">
                  {!r.isRead && <Button size="sm" variant="outline" onClick={() => markRead(r.id)}><Check className="h-4 w-4" /></Button>}
                  <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap mt-2">{r.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
