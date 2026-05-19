'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ImageLightbox } from '@/components/public/image-lightbox';

interface Review {
  id: number;
  tripId: number;
  customerName: string;
  rating: number;
  comment: string;
  locale: string;
  isApproved: boolean;
  images?: string[];
  createdAt: string;
  trip?: { id: number; slug: string; translations?: Array<{ locale: string; title: string }> };
}

interface TripOption { id: number; slug: string; translations: Array<{ locale: string; title: string }> }

export default function AdminReviewsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<Review[]>([]);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; caption?: string } | null>(null);

  const deleteImage = async (reviewId: number, urlToRemove: string) => {
    if (!confirm('حذف هذه الصورة من التقييم؟')) return;
    const review = items.find((r) => r.id === reviewId);
    if (!review || !review.images) return;
    const next = review.images.filter((u) => u !== urlToRemove);
    try {
      await api.patch(`/admin/reviews/${reviewId}/images`, { images: next });
      setItems((prev) => prev.map((r) => (r.id === reviewId ? { ...r, images: next } : r)));
      toast.success('تم حذف الصورة');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };
  const [form, setForm] = useState({
    tripId: 0,
    customerName: '',
    rating: 5,
    comment: '',
    locale: 'AR' as 'AR' | 'EN' | 'RU' | 'IT',
    isApproved: true,
  });

  const load = async () => {
    try {
      const res = await api.get<{ items: Review[] }>('/admin/reviews');
      setItems(res.items);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };
  const loadTrips = async () => {
    try {
      const res = await api.get<{ items: TripOption[] }>('/admin/trips?pageSize=100');
      setTrips(res.items);
      if (res.items[0]) setForm((f) => ({ ...f, tripId: res.items[0].id }));
    } catch { /* silent */ }
  };
  useEffect(() => { void load(); void loadTrips(); /* eslint-disable-next-line */ }, []);

  const toggle = async (id: number, isApproved: boolean) => {
    try { await api.patch(`/admin/reviews/${id}`, { isApproved }); void load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  const del = async (id: number) => {
    if (!confirm('حذف التقييم؟')) return;
    try { await api.delete(`/admin/reviews/${id}`); void load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  const create = async () => {
    if (!form.tripId) return toast.error('اختر رحلة');
    if (!form.customerName.trim()) return toast.error('أدخل اسم العميل');
    if (!form.comment.trim()) return toast.error('أدخل نص التقييم');
    try {
      // Create as approved (public/reviews endpoint allows POST; we'll then toggle if needed)
      await api.post('/public/reviews', {
        tripId: form.tripId,
        customerName: form.customerName.trim(),
        rating: form.rating,
        comment: form.comment.trim(),
        locale: form.locale,
      });
      // Auto-approve via admin
      const last = await api.get<{ items: Review[] }>('/admin/reviews');
      const fresh = last.items[0];
      if (fresh && form.isApproved) {
        await api.patch(`/admin/reviews/${fresh.id}`, { isApproved: true });
      }
      toast.success('تمت إضافة التقييم');
      setForm({ ...form, customerName: '', comment: '', rating: 5 });
      setShowForm(false);
      void load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  const tripTitle = (r: Review) => {
    const trip = r.trip || trips.find((t) => t.id === r.tripId);
    if (!trip) return '';
    return trip.translations?.find((x) => x.locale === 'AR')?.title || trip.translations?.[0]?.title || trip.slug;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">التقييمات ({items.length})</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> {showForm ? 'إلغاء' : 'إضافة تقييم'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">تقييم جديد</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block">الرحلة</label>
              <select className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm" value={form.tripId} onChange={(e) => setForm({ ...form, tripId: Number(e.target.value) })}>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>{t.translations.find((x) => x.locale === 'AR')?.title || t.slug}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">اسم العميل</label>
              <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="مثال: أحمد محمد" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">التقييم</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                    <Star className={`h-7 w-7 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">لغة التعليق</label>
              <select className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm" value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value as 'AR' | 'EN' | 'RU' | 'IT' })}>
                <option value="AR">العربية</option>
                <option value="EN">English</option>
                <option value="RU">Русский</option>
                <option value="IT">Italiano</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold mb-1.5 block">نص التقييم</label>
              <Textarea rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="اكتب نص التقييم..." />
            </div>
            <div className="md:col-span-2 flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.isApproved} onChange={(e) => setForm({ ...form, isApproved: e.target.checked })} />
                <span>مقبول للعرض</span>
              </label>
              <Button onClick={create}>إضافة</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">لا توجد تقييمات</p>
          ) : items.map((r) => (
            <div key={r.id} className={`border rounded-lg p-4 overflow-hidden ${r.isApproved ? 'bg-white' : 'bg-amber-50/40 border-amber-200/60'}`}>
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold break-words">{r.customerName} <span className="text-xs text-muted-foreground font-normal">({r.locale})</span></div>
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ms-2">{new Date(r.createdAt).toLocaleDateString('ar-EG')}</span>
                    <Badge variant={r.isApproved ? 'default' : 'secondary'} className="ms-2">
                      {r.isApproved ? 'مقبول' : 'في الانتظار'}
                    </Badge>
                  </div>
                  {tripTitle(r) && <div className="text-xs text-muted-foreground mt-1">عن رحلة: <span className="text-primary font-semibold">{tripTitle(r)}</span></div>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant={r.isApproved ? 'outline' : 'default'} onClick={() => toggle(r.id, !r.isApproved)}>
                    {r.isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </div>
              </div>
              <p className="text-sm text-foreground/90 mt-2 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{r.comment}</p>
              {r.images && r.images.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="inline-flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-accent-700" />
                      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        صور أرفقها العميل ({r.images.length})
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/70">
                      مرّر فوق الصورة لحذفها · انقر للتكبير
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                    {r.images.map((url, idx) => {
                      const isVideo = /\.(mp4|mov|webm|mkv|avi)(\?|$)/i.test(url);
                      return (
                        <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-accent/20 hover:border-accent transition-colors group">
                          <button
                            type="button"
                            onClick={() => setLightbox({ images: r.images!, index: idx, caption: `${r.customerName} — ${tripTitle(r)}` })}
                            className="absolute inset-0 w-full h-full"
                            aria-label="View"
                          >
                            {isVideo ? (
                              <>
                                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                                <video src={url} muted playsInline preload="metadata" className="w-full h-full object-cover bg-black" />
                                <span className="absolute top-1 start-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white tracking-wider">VIDEO</span>
                                <span className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30">
                                  <span className="w-8 h-8 rounded-full bg-white/95 text-primary flex items-center justify-center">▶</span>
                                </span>
                              </>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteImage(r.id, url); }}
                            aria-label="Delete media"
                            title="حذف"
                            className="absolute top-1 end-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-600/95 text-white shadow-md opacity-0 group-hover:opacity-100 hover:bg-rose-700 hover:scale-110 transition-all z-10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Image lightbox */}
      <ImageLightbox
        open={!!lightbox}
        images={lightbox?.images || []}
        startIndex={lightbox?.index || 0}
        caption={lightbox?.caption}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
