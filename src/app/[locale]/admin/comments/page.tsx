'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Trash2, MessageSquare, Mail, Search, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { BulkActionBar, BulkActionButton } from '@/components/admin/bulk-action-bar';

interface CommentRow {
  id: number;
  tripId: number;
  authorName: string;
  authorEmail?: string | null;
  content: string;
  locale: 'AR' | 'EN' | 'RU' | 'IT' | 'DE';
  isApproved: boolean;
  createdAt: string;
  trip?: { slug: string };
}

type Filter = 'all' | 'pending' | 'approved';

export default function AdminCommentsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<CommentRow[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearSel = () => setSelected(new Set());

  const bulkSet = async (isApproved: boolean) => {
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => api.patch(`/admin/comments/${id}`, { isApproved })));
      setItems((p) => p.map((c) => (selected.has(c.id) ? { ...c, isApproved } : c)));
      toast.success(`تم ${isApproved ? 'قبول' : 'تعليق'} ${ids.length}`);
      clearSel();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };
  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (!confirm(`حذف ${ids.length} تعليق نهائياً؟`)) return;
    try {
      await Promise.all(ids.map((id) => api.delete(`/admin/comments/${id}`)));
      setItems((p) => p.filter((c) => !selected.has(c.id)));
      toast.success(`تم حذف ${ids.length}`);
      clearSel();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ items: CommentRow[] }>('/admin/comments');
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const toggle = async (id: number, isApproved: boolean) => {
    try {
      await api.patch(`/admin/comments/${id}`, { isApproved });
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, isApproved } : c)));
      toast.success(isApproved ? 'تم القبول' : 'تم التعليق');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const del = async (id: number) => {
    if (!confirm('حذف التعليق نهائياً؟')) return;
    try {
      await api.delete(`/admin/comments/${id}`);
      setItems((prev) => prev.filter((c) => c.id !== id));
      toast.success('تم الحذف');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const filtered = items.filter((c) => {
    if (filter === 'pending' && c.isApproved) return false;
    if (filter === 'approved' && !c.isApproved) return false;
    if (q.trim()) {
      const n = q.trim().toLowerCase();
      return (
        c.authorName.toLowerCase().includes(n) ||
        c.content.toLowerCase().includes(n) ||
        (c.authorEmail || '').toLowerCase().includes(n) ||
        (c.trip?.slug || '').toLowerCase().includes(n)
      );
    }
    return true;
  });

  const pendingCount = items.filter((c) => !c.isApproved).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-accent" /> التعليقات
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} تعليق إجمالي
            {pendingCount > 0 && (
              <> · <span className="text-amber-700 font-bold">{pendingCount} في انتظار المراجعة</span></>
            )}
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          {loading ? 'جاري التحميل…' : 'تحديث'}
        </Button>
      </div>

      {/* Filters + search */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border bg-white overflow-hidden">
            {(['all', 'pending', 'approved'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  'px-3 py-2 text-sm font-semibold transition-colors ' +
                  (filter === f ? 'bg-primary text-cream' : 'hover:bg-muted text-foreground/70')
                }
              >
                {f === 'all' && `الكل (${items.length})`}
                {f === 'pending' && `في الانتظار (${pendingCount})`}
                {f === 'approved' && `مقبول (${items.length - pendingCount})`}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في الاسم أو النص..."
              className="w-full h-10 ps-9 pe-3 rounded-lg bg-muted/40 border border-transparent focus:border-accent/60 focus:bg-white outline-none text-sm transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {loading ? (
            <p className="text-center text-muted-foreground py-12">جاري التحميل…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
              {q || filter !== 'all' ? 'لا توجد نتائج للفلتر' : 'لا توجد تعليقات بعد'}
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                className={
                  'border rounded-lg p-4 transition-colors ' +
                  (selected.has(c.id) ? 'ring-2 ring-accent bg-accent/5 border-accent/40' : c.isApproved ? 'bg-white' : 'bg-amber-50/50 border-amber-200/70')
                }
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div className="min-w-0 flex-1 flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-accent cursor-pointer"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                    />
                    <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-primary">{c.authorName}</span>
                      <span className="text-xs text-muted-foreground">({c.locale})</span>
                      <Badge variant={c.isApproved ? 'default' : 'secondary'} className={c.isApproved ? '' : 'bg-amber-200 text-amber-900 hover:bg-amber-200'}>
                        {c.isApproved ? 'مقبول' : 'في الانتظار'}
                      </Badge>
                    </div>
                    {c.authorEmail && (
                      <a href={`mailto:${c.authorEmail}`} className="inline-flex items-center gap-1 text-xs text-accent-700 hover:text-accent mt-1">
                        <Mail className="h-3 w-3" />
                        {c.authorEmail}
                      </a>
                    )}
                    {c.trip?.slug && (
                      <div className="text-xs text-muted-foreground mt-1">
                        على رحلة: <a href={`/ar/trips/${c.trip.slug}`} target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">{c.trip.slug}</a>
                      </div>
                    )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <Button
                      size="sm"
                      variant={c.isApproved ? 'outline' : 'default'}
                      onClick={() => void toggle(c.id, !c.isApproved)}
                      title={c.isApproved ? 'إخفاء' : 'قبول'}
                    >
                      {c.isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => void del(c.id)} title="حذف">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mt-2">{c.content}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <BulkActionBar count={selected.size} onClear={clearSel}>
        <BulkActionButton variant="success" onClick={() => void bulkSet(true)}><Check className="h-3.5 w-3.5" /> قبول</BulkActionButton>
        <BulkActionButton onClick={() => void bulkSet(false)}><X className="h-3.5 w-3.5" /> إخفاء</BulkActionButton>
        <BulkActionButton variant="danger" onClick={() => void bulkDelete()}><Trash2 className="h-3.5 w-3.5" /> حذف</BulkActionButton>
      </BulkActionBar>
    </div>
  );
}
