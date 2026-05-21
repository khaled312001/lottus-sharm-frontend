'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useAdminApi, useAdminAuth } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload, Trash2, Loader2, Play, X, Image as ImageIcon, Video as VideoIcon,
  ChevronLeft, ChevronRight, Folder, FolderPlus, FolderInput, CheckSquare, Square,
  FolderOpen, Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';
import type { MediaDTO } from '@/types/api';
import { cn } from '@/lib/utils';

// Special folder sentinels
const ALL = '__ALL__';
const UNFILED = '__UNFILED__';

export default function AdminMediaPage() {
  const api = useAdminApi();
  const { token } = useAdminAuth();
  const [items, setItems] = useState<MediaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [folder, setFolder] = useState<string>(ALL);
  const [extraFolders, setExtraFolders] = useState<string[]>([]); // locally-created, still empty
  const [preview, setPreview] = useState<MediaDTO | null>(null);
  const [page, setPage] = useState(1);
  // Selection / move
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [moving, setMoving] = useState(false);
  const pageSize = 24;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ items: MediaDTO[]; total: number }>('/admin/media?pageSize=500');
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  // ===== Folders (derived from items + locally-created empties) =====
  const folders = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((m) => {
      if (m.category) map.set(m.category, (map.get(m.category) || 0) + 1);
    });
    extraFolders.forEach((f) => { if (!map.has(f)) map.set(f, 0); });
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [items, extraFolders]);

  const unfiledCount = items.filter((m) => !m.category).length;

  // ===== Upload (into the currently-open folder, if any) =====
  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append('files', f));
      // Drop new uploads into the open folder (not ALL / not UNFILED)
      if (folder !== ALL && folder !== UNFILED) form.append('category', folder);
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
      setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const createFolder = () => {
    const name = prompt('اسم المجلد الجديد (مثلاً: رحلة راس محمد، التقييمات...)')?.trim();
    if (!name) return;
    if (folders.some((f) => f.name === name)) {
      setFolder(name);
      return;
    }
    setExtraFolders((prev) => [...prev, name]);
    setFolder(name);
    toast.success(`تم إنشاء المجلد "${name}" — ارفع أو انقل صور إليه`);
  };

  // ===== Selection / move =====
  const toggleSelect = (id: number) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const exitSelect = () => { setSelectMode(false); setSelected(new Set()); };

  const moveSelected = async (target: string) => {
    if (selected.size === 0) return;
    const ids = [...selected];
    // target '' clears the folder (backend trims empty → null)
    const category = target === UNFILED ? '' : target;
    setMoving(true);
    try {
      await Promise.all(ids.map((id) => api.patch(`/admin/media/${id}`, { category })));
      toast.success(`تم نقل ${ids.length} ملف${target === UNFILED ? ' (بدون مجلد)' : ` إلى "${target}"`}`);
      exitSelect();
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setMoving(false);
    }
  };

  // ===== Filtering =====
  const filtered = items.filter((m) => {
    if (filter !== 'ALL' && m.type !== filter) return false;
    if (folder === ALL) return true;
    if (folder === UNFILED) return !m.category;
    return m.category === folder;
  });
  const imageCount = items.filter((m) => m.type === 'IMAGE').length;
  const videoCount = items.filter((m) => m.type === 'VIDEO').length;

  useEffect(() => { setPage(1); }, [filter, folder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(pageStart, pageStart + pageSize);

  const gotoPage = (p: number) => {
    setPage(p);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const folderLabel = folder === ALL ? 'كل الملفات' : folder === UNFILED ? 'بدون مجلد' : folder;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">مكتبة الميديا</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} ملف · {imageCount} صورة · {videoCount} فيديو · {folders.length} مجلد
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={createFolder}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border border-accent/30 text-primary text-sm font-semibold hover:bg-accent/10"
          >
            <FolderPlus className="h-4 w-4" /> مجلد جديد
          </button>
          <button
            onClick={() => (selectMode ? exitSelect() : setSelectMode(true))}
            className={cn(
              'inline-flex items-center gap-2 h-11 px-4 rounded-lg border text-sm font-semibold transition-colors',
              selectMode ? 'bg-accent text-primary border-accent' : 'border-accent/30 text-primary hover:bg-accent/10',
            )}
          >
            <CheckSquare className="h-4 w-4" /> {selectMode ? 'إنهاء التحديد' : 'تحديد للنقل'}
          </button>
          <label className="cursor-pointer">
            <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => upload(e.target.files)} />
            <span className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              رفع ملفات{folder !== ALL && folder !== UNFILED ? ` → ${folder}` : ''}
            </span>
          </label>
        </div>
      </div>

      {/* ===== Folders bar ===== */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" /> المجلدات
          </div>
          <div className="flex flex-wrap gap-2">
            <FolderChip
              label="كل الملفات" count={items.length} active={folder === ALL}
              icon={FolderOpen} onClick={() => setFolder(ALL)}
            />
            <FolderChip
              label="بدون مجلد" count={unfiledCount} active={folder === UNFILED}
              icon={Folder} onClick={() => setFolder(UNFILED)}
            />
            {folders.map((f) => (
              <FolderChip
                key={f.name} label={f.name} count={f.count} active={folder === f.name}
                icon={Folder} onClick={() => setFolder(f.name)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== Type tabs ===== */}
      <div className="inline-flex bg-white border rounded-lg p-1 gap-1">
        {([
          { v: 'ALL',   label: 'الكل',     icon: null,       count: filtered.length },
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
          </button>
        ))}
      </div>

      {/* ===== Selection / move bar ===== */}
      {selectMode && (
        <div className="sticky top-2 z-20 flex flex-wrap items-center gap-3 bg-primary text-cream rounded-xl px-4 py-3 shadow-lg">
          <span className="font-bold text-sm inline-flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            {selected.size} محدد
          </span>
          <button
            onClick={() => setSelected(new Set(filtered.map((m) => m.id)))}
            className="text-xs font-semibold underline-offset-2 hover:underline"
          >
            تحديد كل المعروض
          </button>
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())} className="text-xs font-semibold underline-offset-2 hover:underline opacity-80">
              مسح التحديد
            </button>
          )}
          <div className="flex items-center gap-2 ms-auto">
            <FolderInput className="h-4 w-4 opacity-80" />
            <span className="text-xs font-semibold">نقل إلى:</span>
            <select
              disabled={selected.size === 0 || moving}
              defaultValue=""
              onChange={(e) => { if (e.target.value) void moveSelected(e.target.value); e.target.value = ''; }}
              className="h-9 rounded-lg border-0 bg-cream/15 text-cream px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 [&>option]:text-primary"
            >
              <option value="" disabled>اختر مجلد...</option>
              <option value={UNFILED}>— بدون مجلد —</option>
              {folders.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>
            {moving && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Folder className="h-10 w-10 mx-auto mb-2 opacity-30" />
              لا توجد ملفات في «{folderLabel}»
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {pageItems.map((m) => {
                const isSel = selected.has(m.id);
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden border group cursor-pointer transition-all',
                      isSel && 'ring-2 ring-accent ring-offset-2',
                    )}
                    onClick={() => (selectMode ? toggleSelect(m.id) : setPreview(m))}
                  >
                    {m.type === 'IMAGE' ? (
                      <Image src={m.thumbnailUrl || m.url} alt={m.altAr || m.altEn || ''} fill sizes="120px" className="object-cover" />
                    ) : (
                      <>
                        {m.thumbnailUrl ? (
                          <Image src={m.thumbnailUrl} alt="" fill sizes="120px" className="object-cover" />
                        ) : (
                          <video src={m.url} preload="metadata" muted playsInline className="w-full h-full object-cover bg-black" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                          <Play className="h-7 w-7 text-white drop-shadow-lg" fill="currentColor" />
                        </div>
                        <span className="absolute top-1 start-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white tracking-wider">VIDEO</span>
                      </>
                    )}

                    {/* Folder badge */}
                    {m.category && !selectMode && (
                      <span className="absolute bottom-1 start-1 max-w-[90%] truncate inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/65 text-white text-[9px] font-semibold">
                        <Folder className="h-2.5 w-2.5 shrink-0" /> {m.category}
                      </span>
                    )}

                    {/* Selection checkbox */}
                    {selectMode ? (
                      <div className="absolute top-1.5 start-1.5 z-10">
                        {isSel
                          ? <CheckSquare className="h-5 w-5 text-accent drop-shadow" fill="currentColor" />
                          : <Square className="h-5 w-5 text-white/90 drop-shadow" />}
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); del(m.id); }}
                        className="absolute top-1.5 end-1.5 z-10 p-1.5 rounded-full bg-red-600 text-white shadow-lg ring-2 ring-white/80 hover:bg-red-700 active:scale-95 transition-transform"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

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
              <video src={preview.url} controls autoPlay playsInline className="max-h-[80vh] max-w-full rounded-lg shadow-2xl bg-black" />
            )}
            <div className="text-center text-white/70 text-xs font-mono">
              {preview.category && <><span className="opacity-60">المجلد:</span> {preview.category} · </>}
              <span className="opacity-60">URL:</span> {preview.url}
              {preview.width && preview.height && (
                <> · <span className="opacity-60">{preview.width}×{preview.height}</span></>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FolderChip({
  label, count, active, icon: Icon, onClick,
}: {
  label: string; count: number; active: boolean;
  icon: typeof Folder; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors',
        active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-primary/80 border-accent/20 hover:bg-accent/10 hover:text-primary',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="max-w-[160px] truncate">{label}</span>
      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums', active ? 'bg-white/20' : 'bg-muted')}>{count}</span>
    </button>
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
