'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAdminApi, useAdminAuth } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Loader2, Play, X, Image as ImageIcon, Video as VideoIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';
import type { MediaDTO } from '@/types/api';
import { cn } from '@/lib/utils';

export default function AdminMediaPage() {
  const api = useAdminApi();
  const { token } = useAdminAuth();
  const [items, setItems] = useState<MediaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [preview, setPreview] = useState<MediaDTO | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const load = async () => {
    setLoading(true);
    try {
      // Backend caps pageSize at 500 — fetch the max in one shot so the
      // client-side filter/pagination here sees the full library.
      const res = await api.get<{ items: MediaDTO[]; total: number }>('/admin/media?pageSize=500');
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append('files', f));
      const res = await fetch(`${API_BASE}/admin/media/upload`, {
        method: 'POST',
        body: form,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error?.message || 'Upload failed');
      toast.success(`تم رفع ${json.data.items.length} ملف`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setUploading(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm('حذف الملف؟')) return;
    try {
      await api.delete(`/admin/media/${id}`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const filtered = items.filter((m) => filter === 'ALL' || m.type === filter);
  const imageCount = items.filter((m) => m.type === 'IMAGE').length;
  const videoCount = items.filter((m) => m.type === 'VIDEO').length;

  // Reset to page 1 whenever the filter changes
  useEffect(() => { setPage(1); }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(pageStart, pageStart + pageSize);

  const gotoPage = (p: number) => {
    setPage(p);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">مكتبة الميديا</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} ملف · {imageCount} صورة · {videoCount} فيديو
          </p>
        </div>
        <label className="cursor-pointer">
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => upload(e.target.files)} />
          <span className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            رفع ملفات
          </span>
        </label>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-white border rounded-lg p-1 gap-1">
        {([
          { v: 'ALL',   label: 'الكل',     icon: null,       count: items.length },
          { v: 'IMAGE', label: 'الصور',    icon: ImageIcon,  count: imageCount },
          { v: 'VIDEO', label: 'الفيديوهات', icon: VideoIcon, count: videoCount },
        ] as const).map((t) => (
          <button
            key={t.v}
            onClick={() => setFilter(t.v)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors',
              filter === t.v ? 'bg-primary text-white' : 'hover:bg-muted',
            )}
          >
            {t.icon && <t.icon className="h-3.5 w-3.5" />}
            <span>{t.label}</span>
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums', filter === t.v ? 'bg-white/20' : 'bg-muted')}>{t.count}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد ملفات</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {pageItems.map((m) => (
                <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden border group cursor-pointer" onClick={() => setPreview(m)}>
                  {m.type === 'IMAGE' ? (
                    <Image src={m.thumbnailUrl || m.url} alt={m.altAr || m.altEn || ''} fill sizes="120px" className="object-cover" />
                  ) : (
                    <>
                      {m.thumbnailUrl ? (
                        <Image src={m.thumbnailUrl} alt="" fill sizes="120px" className="object-cover" />
                      ) : (
                        // Use the actual video element as the thumbnail (first frame).
                        // metadata preload is enough for browsers to render the poster frame.
                        // Disable controls in the grid — the click opens the lightbox.
                        <video
                          src={m.url}
                          preload="metadata"
                          muted
                          playsInline
                          className="w-full h-full object-cover bg-black"
                        />
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                        <Play className="h-7 w-7 text-white drop-shadow-lg" fill="currentColor" />
                      </div>
                      <span className="absolute top-1 start-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white tracking-wider">VIDEO</span>
                    </>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); del(m.id); }}
                    className="absolute top-1.5 end-1.5 z-10 p-1.5 rounded-full bg-red-600 text-white shadow-lg ring-2 ring-white/80 hover:bg-red-700 active:scale-95 transition-transform"
                    aria-label="حذف"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > pageSize && (
            <MediaPagination
              page={safePage}
              totalPages={totalPages}
              total={filtered.length}
              pageStart={pageStart}
              pageSize={pageSize}
              onGo={gotoPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Lightbox preview */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setPreview(null)}
        >
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 end-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {preview.type === 'IMAGE' ? (
              <img src={preview.url} alt="" className="max-h-[80vh] max-w-full rounded-lg shadow-2xl" />
            ) : (
              <video
                src={preview.url}
                controls
                autoPlay
                playsInline
                className="max-h-[80vh] max-w-full rounded-lg shadow-2xl bg-black"
              />
            )}
            <div className="text-center text-white/70 text-xs font-mono">
              <span className="opacity-60">URL:</span> {preview.url}
              {preview.width && preview.height && (
                <> · <span className="opacity-60">{preview.width}×{preview.height}</span></>
              )}
              {(() => {
                const sb = (preview as unknown as { sizeBytes?: number }).sizeBytes;
                return sb ? <> · {(sb / 1024 / 1024).toFixed(2)} MB</> : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaPagination({
  page, totalPages, total, pageStart, pageSize, onGo,
}: {
  page: number; totalPages: number; total: number; pageStart: number; pageSize: number;
  onGo: (p: number) => void;
}) {
  const first = pageStart + 1;
  const last = Math.min(pageStart + pageSize, total);

  // Windowed list around the current page
  const windowed: (number | 'gap')[] = [];
  const push = (v: number | 'gap') => { if (windowed[windowed.length - 1] !== v) windowed.push(v); };
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) push(p);
    else if (p === 2 || p === totalPages - 1) push('gap');
  }

  return (
    <nav className="mt-6 flex flex-col items-center gap-3" aria-label="Pagination">
      <div className="text-xs text-muted-foreground tabular-nums">
        يعرض {first}–{last} من {total}
      </div>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => onGo(Math.max(1, page - 1))}
          disabled={page === 1}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-accent/25 text-primary bg-white hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {windowed.map((p, i) => (
          p === 'gap' ? (
            <span key={`gap-${i}`} className="w-10 text-center text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onGo(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-lg text-sm font-semibold tabular-nums transition-colors border',
                p === page
                  ? 'bg-primary text-white border-primary shadow'
                  : 'bg-white text-primary/80 border-accent/20 hover:bg-accent/10 hover:text-primary',
              )}
            >
              {p}
            </button>
          )
        ))}

        <button
          type="button"
          onClick={() => onGo(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-accent/25 text-primary bg-white hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="الصفحة التالية"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
