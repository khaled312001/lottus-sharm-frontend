'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentItem {
  id: number;
  amount: string;
  currency: 'EGP' | 'USD';
  method: 'STRIPE' | 'VODAFONE_CASH' | 'INSTAPAY' | 'BANK_TRANSFER' | 'CASH';
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  screenshotUrl?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  notes?: string | null;
  booking: {
    id: number;
    reference: string;
    customer: { fullName: string; email: string };
    trip: { translations: Array<{ locale: string; title: string }> };
  };
}

export default function AdminPaymentsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<PaymentItem['status'] | 'ALL'>('UNPAID');

  const load = async () => {
    try {
      const qs = statusFilter === 'ALL' ? '' : `?status=${statusFilter}`;
      const res = await api.get<{ items: PaymentItem[] }>(`/admin/payments${qs}`);
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [statusFilter]);

  const confirmPayment = async (id: number) => {
    if (!window.confirm('تأكيد استلام الدفعة؟')) return;
    try {
      await api.post(`/admin/payments/${id}/confirm`);
      toast.success('تم التأكيد');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">المدفوعات</h2>
      <Card>
        <CardContent className="p-4">
          <select className="h-10 rounded-lg border px-3" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PaymentItem['status'] | 'ALL')}>
            <option value="ALL">كل المدفوعات</option>
            <option value="UNPAID">في انتظار التأكيد</option>
            <option value="PAID">مؤكدة</option>
            <option value="REFUNDED">مستردة</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد مدفوعات</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="py-3 px-3 text-right">رقم الحجز</th>
                  <th className="py-3 px-3 text-right">العميل</th>
                  <th className="py-3 px-3 text-right">المبلغ</th>
                  <th className="py-3 px-3 text-right">الطريقة</th>
                  <th className="py-3 px-3 text-right">الحالة</th>
                  <th className="py-3 px-3 text-right">إثبات</th>
                  <th className="py-3 px-3 text-right">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/20">
                    <td className="py-2 px-3 font-mono text-xs">{p.booking.reference}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold">{p.booking.customer.fullName}</div>
                      <div className="text-xs text-muted-foreground">{p.booking.customer.email}</div>
                    </td>
                    <td className="py-2 px-3 font-bold">{Number(p.amount).toLocaleString()} {p.currency}</td>
                    <td className="py-2 px-3"><Badge variant="secondary">{p.method}</Badge></td>
                    <td className="py-2 px-3"><Badge variant={p.status === 'PAID' ? 'default' : 'secondary'}>{p.status}</Badge></td>
                    <td className="py-2 px-3">
                      {p.screenshotUrl ? (
                        <a href={p.screenshotUrl} target="_blank" rel="noopener" className="text-primary text-xs hover:underline inline-flex items-center gap-1">عرض <ExternalLink className="h-3 w-3" /></a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {p.status === 'UNPAID' && (
                        <Button size="sm" onClick={() => confirmPayment(p.id)}>
                          <CheckCircle2 className="h-4 w-4" /> تأكيد
                        </Button>
                      )}
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
