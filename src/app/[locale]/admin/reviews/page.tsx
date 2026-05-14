'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: number;
  tripId: number;
  customerName: string;
  rating: number;
  comment: string;
  locale: string;
  isApproved: boolean;
  createdAt: string;
  trip?: { id: number };
}

export default function AdminReviewsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<Review[]>([]);

  const load = async () => {
    try {
      const res = await api.get<{ items: Review[] }>('/admin/reviews');
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const toggle = async (id: number, isApproved: boolean) => {
    try {
      await api.patch(`/admin/reviews/${id}`, { isApproved });
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const del = async (id: number) => {
    if (!confirm('حذف التقييم؟')) return;
    try { await api.delete(`/admin/reviews/${id}`); void load(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">التقييمات</h2>
      <Card>
        <CardContent className="p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">لا توجد تقييمات</p>
          ) : items.map((r) => (
            <div key={r.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-semibold">{r.customerName}</div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ms-2">{new Date(r.createdAt).toLocaleDateString('ar-EG')}</span>
                    <Badge variant={r.isApproved ? 'default' : 'secondary'} className="ms-2">
                      {r.isApproved ? 'مقبول' : 'في الانتظار'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant={r.isApproved ? 'outline' : 'default'} onClick={() => toggle(r.id, !r.isApproved)}>
                    {r.isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </div>
              </div>
              <p className="text-sm text-foreground/90">{r.comment}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
