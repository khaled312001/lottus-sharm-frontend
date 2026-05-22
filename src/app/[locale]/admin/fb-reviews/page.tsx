'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaPicker } from '@/components/admin/media-picker';
import { Star, Trash2, Plus, Facebook, ThumbsUp, Pencil, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { MediaDTO } from '@/types/api';

interface FbReview {
  id: number;
  name: string;
  comment: string;
  dateText: string;
  recommends: boolean;
  rating: number;
  profileImage: string | null;
  attachedImages: string[];
  sortOrder: number;
  isActive: boolean;
}

// Wrap a bare URL into a pseudo MediaDTO so MediaPicker can render it.
const toMedia = (url: string, i = 0): MediaDTO => ({ id: -(i + 1), type: 'IMAGE', url, thumbnailUrl: url });

const EMPTY = {
  name: '', comment: '', dateText: '', recommends: true, rating: 5,
  sortOrder: 0, isActive: true,
};

export default function AdminFbReviewsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<FbReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [profile, setProfile] = useState<MediaDTO | null>(null);
  const [images, setImages] = useState<MediaDTO[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get<{ items: FbReview[] }>('/admin/fb-reviews');
      setItems(res.items);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const resetForm = () => {
    setForm({ ...EMPTY });
    setProfile(null);
    setImages([]);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (r: FbReview) => {
    setEditingId(r.id);
    setForm({
      name: r.name, comment: r.comment, dateText: r.dateText, recommends: r.recommends,
      rating: r.rating, sortOrder: r.sortOrder, isActive: r.isActive,
    });
    setProfile(r.profileImage ? toMedia(r.profileImage) : null);
    setImages(r.attachedImages.map((u, i) => toMedia(u, i)));
    setShowForm(true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error('أدخل اسم صاحب التقييم');
    if (!form.comment.trim()) return toast.error('أدخل نص التقييم');
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      comment: form.comment.trim(),
      dateText: form.dateText.trim() || null,
      recommends: form.recommends,
      rating: form.rating,
      profileImage: profile?.url || null,
      attachedImages: images.map((m) => m.url),
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };
    try {
      if (editingId) await api.patch(`/admin/fb-reviews/${editingId}`, payload);
      else await api.post('/admin/fb-reviews', payload);
      toast.success(editingId ? 'تم التحديث' : 'تمت الإضافة');
      resetForm();
      void load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (r: FbReview) => {
    try { await api.patch(`/admin/fb-reviews/${r.id}`, { isActive: !r.isActive }); void load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  const del = async (id: number) => {
    if (!confirm('حذف هذا التقييم نهائياً؟')) return;
    try { await api.delete(`/admin/fb-reviews/${id}`); void load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Facebook className="h-6 w-6 text-[#1877F2]" /> تقييمات فيسبوك ({items.length})
        </h2>
        <Button onClick={() => (showForm ? resetForm() : setShowForm(true))}>
          <Plus className="h-4 w-4" /> {showForm ? 'إلغاء' : 'إضافة تقييم'}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        التقييمات هنا تظهر في الشريط المتحرك بالصفحة الرئيسية وفي صفحة تقييمات فيسبوك — رتّبها بـ «الترتيب» (الأصغر يظهر أولاً).
      </p>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">{editingId ? 'تعديل تقييم' : 'تقييم جديد'}</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block">اسم صاحب التقييم</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: Ahmed El Sharkawy" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">التاريخ (نص حر)</label>
              <Input value={form.dateText} onChange={(e) => setForm({ ...form, dateText: e.target.value })} placeholder="مثال: قبل ٣ أسابيع" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">التقييم (نجوم)</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                    <Star className={`h-7 w-7 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">الترتيب</label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold mb-1.5 block">نص التقييم</label>
              <Textarea rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="اكتب نص التعليق كما هو على فيسبوك..." />
            </div>
            <div>
              <MediaPicker mode="single" label="صورة البروفايل" value={profile} onChange={setProfile} />
            </div>
            <div>
              <MediaPicker mode="multi" label="الصور المرفقة" value={images} onChange={setImages} />
            </div>
            <div className="md:col-span-2 flex items-center gap-6 flex-wrap">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.recommends} onChange={(e) => setForm({ ...form, recommends: e.target.checked })} />
                <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> يوصي بالخدمة</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <span>ظاهر للعملاء</span>
              </label>
              <div className="ms-auto flex gap-2">
                <Button variant="outline" onClick={resetForm} disabled={saving}>إلغاء</Button>
                <Button onClick={save} disabled={saving}>{saving ? 'جارٍ الحفظ…' : editingId ? 'حفظ التعديل' : 'إضافة'}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">لا توجد تقييمات بعد</p>
          ) : items.map((r) => (
            <div key={r.id} className={`border rounded-lg p-4 overflow-hidden ${r.isActive ? 'bg-white' : 'bg-muted/40 border-dashed'}`}>
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {r.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.profileImage} alt={r.name} className="w-10 h-10 rounded-full object-cover border shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0e63d4] flex items-center justify-center text-white font-bold shrink-0">{r.name.charAt(0)}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold break-words flex items-center gap-2">
                      {r.name}
                      <Badge variant="secondary" className="text-[10px]">#{r.sortOrder}</Badge>
                      {!r.isActive && <Badge variant="outline" className="text-[10px]">مخفي</Badge>}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                      ))}
                      {r.dateText && <span className="text-xs text-muted-foreground ms-2">{r.dateText}</span>}
                      {r.recommends && <span className="text-[10px] text-emerald-700 ms-1 inline-flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" /> يوصي</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => toggleActive(r)} title={r.isActive ? 'إخفاء' : 'إظهار'}>
                    {r.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => startEdit(r)} title="تعديل"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(r.id)} title="حذف"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </div>
              </div>
              <p className="text-sm text-foreground/90 mt-2 break-words [overflow-wrap:anywhere] whitespace-pre-wrap line-clamp-3">{r.comment}</p>
              {r.attachedImages.length > 0 && (
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  {r.attachedImages.map((u) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={u} src={u} alt="" className="w-12 h-12 rounded object-cover border" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
