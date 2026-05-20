'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminApi, useAdminAuth } from '@/lib/admin-auth';
import { API_BASE } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Send, Paperclip, Loader2, MessageCircle, ArrowRight, Search, FileText, CheckCheck, Check, Phone, Mail,
} from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
  customerId: number;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  lastBody: string;
  lastAt: string;
  lastFromAdmin: boolean;
  unread: number;
  total: number;
}
interface ChatMsg {
  id: number;
  fromAdmin: boolean;
  body: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  createdAt: string;
  pending?: boolean;
}
interface CustomerInfo {
  id: number; fullName: string | null; email: string | null; phone: string | null; avatarUrl: string | null; country: string | null;
}

const LIST_POLL = 8000;
const THREAD_POLL = 3500;

export default function AdminChatPage() {
  const api = useAdminApi();
  const { token } = useAdminAuth();
  const params = useSearchParams();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [info, setInfo] = useState<CustomerInfo | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState('');
  const [loadingThread, setLoadingThread] = useState(false);
  const lastIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<number | null>(null);
  activeRef.current = activeId;

  const scrollToEnd = useCallback((smooth = true) => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }));
  }, []);

  const loadConvos = useCallback(async () => {
    try {
      const r = await api.get<{ items: Conversation[] }>('/admin/chat/conversations');
      setConvos(r.items);
    } catch { /* ignore */ }
  }, [api]);

  // Initial + polling conversation list
  useEffect(() => { void loadConvos(); }, [loadConvos]);
  useEffect(() => {
    const t = setInterval(loadConvos, LIST_POLL);
    return () => clearInterval(t);
  }, [loadConvos]);

  // Deep-link ?c=<id>
  useEffect(() => {
    const c = Number(params.get('c'));
    if (c) setActiveId(c);
  }, [params]);

  const openThread = useCallback(async (cid: number) => {
    setActiveId(cid);
    setLoadingThread(true);
    setMsgs([]);
    lastIdRef.current = 0;
    try {
      const r = await api.get<{ customer: CustomerInfo; items: ChatMsg[] }>(`/admin/chat/${cid}`);
      setInfo(r.customer);
      setMsgs(r.items);
      lastIdRef.current = r.items.reduce((m, x) => Math.max(m, x.id), 0);
      scrollToEnd(false);
      // refresh unread badges
      void loadConvos();
    } catch {
      toast.error('تعذّر فتح المحادثة');
    } finally { setLoadingThread(false); }
  }, [api, scrollToEnd, loadConvos]);

  useEffect(() => {
    if (activeId) void openThread(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Live thread polling
  useEffect(() => {
    if (!activeId) return;
    const poll = async () => {
      if (!activeRef.current) return;
      try {
        const r = await api.get<{ items: ChatMsg[] }>(`/admin/chat/${activeRef.current}/poll?since=${lastIdRef.current}`);
        if (r.items.length) {
          setMsgs((prev) => {
            const map = new Map<number, ChatMsg>();
            prev.filter((m) => !m.pending).forEach((m) => map.set(m.id, m));
            r.items.forEach((m) => map.set(m.id, m));
            const next = [...map.values()].sort((a, b) => a.id - b.id);
            lastIdRef.current = Math.max(lastIdRef.current, ...next.map((m) => m.id));
            return next;
          });
          scrollToEnd();
        }
      } catch { /* ignore */ }
    };
    const t = setInterval(poll, THREAD_POLL);
    return () => clearInterval(t);
  }, [activeId, api, scrollToEnd]);

  const send = async () => {
    const body = text.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    const opt: ChatMsg = { id: -Date.now(), fromAdmin: true, body, createdAt: new Date().toISOString(), pending: true };
    setMsgs((p) => [...p, opt]);
    setText('');
    scrollToEnd();
    try {
      const res = await api.post<ChatMsg>(`/admin/chat/${activeId}`, { body });
      setMsgs((p) => p.filter((m) => m.id !== opt.id).concat(res).sort((a, b) => a.id - b.id));
      lastIdRef.current = Math.max(lastIdRef.current, res.id);
      void loadConvos();
    } catch {
      setMsgs((p) => p.filter((m) => m.id !== opt.id));
      setText(body);
      toast.error('فشل الإرسال');
    } finally { setSending(false); }
  };

  const onPickFile = async (file: File | undefined) => {
    if (!file || !activeId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch(`${API_BASE}/admin/chat/upload`, {
        method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: 'include', body: fd,
      });
      const uj = await up.json();
      if (!up.ok || !uj?.ok) throw new Error('upload');
      const res = await api.post<ChatMsg>(`/admin/chat/${activeId}`, { body: '', attachmentUrl: uj.data.url, attachmentType: uj.data.type });
      setMsgs((p) => p.concat(res).sort((a, b) => a.id - b.id));
      lastIdRef.current = Math.max(lastIdRef.current, res.id);
    } catch {
      toast.error('تعذّر رفع الملف');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const filtered = convos.filter((c) => {
    const n = q.trim().toLowerCase();
    if (!n) return true;
    return (c.fullName || '').toLowerCase().includes(n) || (c.email || '').toLowerCase().includes(n) || c.lastBody.toLowerCase().includes(n);
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold inline-flex items-center gap-2"><MessageCircle className="h-6 w-6 text-accent" /> المحادثات المباشرة</h2>
        <p className="text-xs text-muted-foreground mt-0.5">دردشة لحظية مع العملاء — ترد هنا وتظهر فوراً في حسابهم.</p>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-4 h-[calc(100vh-220px)] min-h-[520px]">
        {/* ===== Conversation list ===== */}
        <div className={cn('bg-white rounded-2xl border border-accent/15 shadow-sm flex flex-col overflow-hidden', activeId && 'hidden lg:flex')}>
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في المحادثات..." className="w-full ps-9 pe-3 py-2 rounded-lg bg-muted/40 border border-transparent focus:border-accent/60 focus:bg-white outline-none text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-12 px-4 text-sm text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                لا توجد محادثات بعد
              </div>
            ) : (
              <ul className="divide-y divide-muted">
                {filtered.map((c) => (
                  <li key={c.customerId}>
                    <button
                      type="button"
                      onClick={() => setActiveId(c.customerId)}
                      className={cn('w-full text-start flex items-start gap-3 p-3 hover:bg-muted/40 transition-colors', activeId === c.customerId && 'bg-accent/10')}
                    >
                      <Avatar name={c.fullName} url={c.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-primary truncate">{c.fullName || c.email || `#${c.customerId}`}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{relTime(c.lastAt)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground truncate">
                            {c.lastFromAdmin && <span className="text-accent-700">أنت: </span>}{c.lastBody || '📎 مرفق'}
                          </span>
                          {c.unread > 0 && (
                            <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">{c.unread}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ===== Thread ===== */}
        <div className={cn('bg-white rounded-2xl border border-accent/15 shadow-sm flex flex-col overflow-hidden', !activeId && 'hidden lg:flex')}>
          {!activeId ? (
            <div className="flex-1 grid place-items-center text-muted-foreground">
              <div className="text-center"><MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />اختر محادثة للبدء</div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b bg-gradient-to-br from-primary via-primary to-primary-900 text-cream">
                <button type="button" onClick={() => setActiveId(null)} className="lg:hidden p-1 -ms-1 rounded hover:bg-cream/10" aria-label="Back">
                  <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                </button>
                <Avatar name={info?.fullName} url={info?.avatarUrl} dark />
                <div className="min-w-0 flex-1">
                  <div className="font-bold leading-tight truncate">{info?.fullName || info?.email || `#${activeId}`}</div>
                  <div className="text-[11px] text-cream/70 flex items-center gap-2 truncate">
                    {info?.phone && <a href={`tel:${info.phone}`} className="inline-flex items-center gap-1 hover:text-accent" dir="ltr"><Phone className="h-3 w-3" />{info.phone}</a>}
                    {info?.email && <a href={`mailto:${info.email}`} className="inline-flex items-center gap-1 hover:text-accent truncate"><Mail className="h-3 w-3" />{info.email}</a>}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#f5efe2]" style={{ backgroundImage: 'radial-gradient(rgba(201,168,106,0.10) 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
                {loadingThread ? (
                  <div className="h-full grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
                ) : msgs.length === 0 ? (
                  <div className="h-full grid place-items-center text-sm text-muted-foreground">ابدأ المحادثة برسالة</div>
                ) : (
                  msgs.map((m) => <Bubble key={m.id} m={m} />)
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-accent/15 p-2.5 flex items-end gap-2">
                <input ref={fileRef} type="file" accept="image/*,video/*,application/pdf" className="hidden" onChange={(e) => onPickFile(e.target.files?.[0])} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Attach" className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full text-accent-700 hover:bg-accent/10 disabled:opacity-50">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                </button>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1}
                  placeholder="اكتب ردك…"
                  className="flex-1 resize-none max-h-28 rounded-2xl border border-accent/20 bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 focus:bg-white"
                />
                <button type="button" onClick={send} disabled={sending || !text.trim()} aria-label="Send" className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-accent text-primary hover:bg-accent-400 shadow-md shadow-accent/30 disabled:opacity-40 active:scale-95">
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 scale-x-[-1]" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, url, dark }: { name?: string | null; url?: string | null; dark?: boolean }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />;
  }
  return (
    <span className={cn('inline-flex items-center justify-center w-10 h-10 rounded-full font-bold shrink-0', dark ? 'bg-accent/20 text-accent border border-accent/40' : 'bg-primary/10 text-primary')}>
      {initial}
    </span>
  );
}

function Bubble({ m }: { m: ChatMsg }) {
  const mine = m.fromAdmin;
  const time = new Date(m.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[78%] rounded-2xl px-3 py-2 shadow-sm text-sm leading-relaxed', mine ? 'bg-primary text-cream rounded-br-md' : 'bg-white text-foreground border border-accent/15 rounded-bl-md')} dir="auto">
        {m.attachmentUrl && m.attachmentType === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer"><img src={m.attachmentUrl} alt="" className="rounded-lg mb-1 max-h-60 object-cover" /></a>
        )}
        {m.attachmentUrl && m.attachmentType === 'video' && <video src={m.attachmentUrl} controls className="rounded-lg mb-1 max-h-60 w-full bg-black" />}
        {m.attachmentUrl && m.attachmentType === 'file' && (
          <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" className={cn('flex items-center gap-2 mb-1 underline', mine ? 'text-cream' : 'text-accent-700')}><FileText className="h-4 w-4" /> ملف مرفق</a>
        )}
        {m.body && <span className="whitespace-pre-wrap break-words">{m.body}</span>}
        <span className={cn('flex items-center gap-1 justify-end mt-0.5 text-[10px]', mine ? 'text-cream/60' : 'text-muted-foreground')}>
          {time}{mine && (m.pending ? <Check className="h-3 w-3" /> : <CheckCheck className="h-3 w-3" />)}
        </span>
      </div>
    </div>
  );
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'الآن';
  if (min < 60) return `${min}د`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}س`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}ي`;
  return new Date(iso).toLocaleDateString('ar-EG');
}
