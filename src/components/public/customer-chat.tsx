'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Loader2, MessageCircle, Check, CheckCheck, FileText, Phone } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { L, cn, buildWhatsAppLink } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatMsg {
  id: number;
  fromAdmin: boolean;
  body: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  createdAt: string;
  pending?: boolean;
}

const POLL_MS = 3500;

export function CustomerChat({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const [items, setItems] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const lastIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const scrollToEnd = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });
  }, []);

  const merge = useCallback((incoming: ChatMsg[]) => {
    if (!incoming.length) return;
    setItems((prev) => {
      const map = new Map<number, ChatMsg>();
      prev.filter((m) => !m.pending).forEach((m) => map.set(m.id, m));
      incoming.forEach((m) => map.set(m.id, m));
      const next = [...map.values()].sort((a, b) => a.id - b.id);
      lastIdRef.current = Math.max(lastIdRef.current, ...next.map((m) => m.id));
      return next;
    });
    scrollToEnd();
  }, [scrollToEnd]);

  // Initial load
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/auth/customer/chat`, { credentials: 'include' });
        const j = await r.json();
        if (alive && j?.ok) {
          setItems(j.data.items);
          lastIdRef.current = j.data.items.reduce((m: number, x: ChatMsg) => Math.max(m, x.id), 0);
          scrollToEnd(false);
        }
      } catch { /* ignore */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [scrollToEnd]);

  // Live polling for admin replies
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch(`${API_BASE}/auth/customer/chat/poll?since=${lastIdRef.current}`, { credentials: 'include' });
        const j = await r.json();
        if (j?.ok && j.data.items.length) merge(j.data.items);
      } catch { /* offline */ }
    };
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [merge]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    const optimistic: ChatMsg = { id: -Date.now(), fromAdmin: false, body, createdAt: new Date().toISOString(), pending: true };
    setItems((p) => [...p, optimistic]);
    setText('');
    scrollToEnd();
    try {
      const r = await fetch(`${API_BASE}/auth/customer/chat`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error('fail');
      setItems((p) => p.filter((m) => m.id !== optimistic.id));
      merge([j.data]);
    } catch {
      setItems((p) => p.filter((m) => m.id !== optimistic.id));
      setText(body);
      toast.error(L(locale, { ar: 'فشل الإرسال', en: 'Send failed', de: 'Senden fehlgeschlagen', ru: 'Ошибка', it: 'Invio fallito' }) as string);
    } finally { setSending(false); }
  };

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch(`${API_BASE}/auth/customer/chat/upload`, { method: 'POST', credentials: 'include', body: fd });
      const uj = await up.json();
      if (!up.ok || !uj?.ok) throw new Error('upload');
      const r = await fetch(`${API_BASE}/auth/customer/chat`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: '', attachmentUrl: uj.data.url, attachmentType: uj.data.type }),
      });
      const j = await r.json();
      if (j?.ok) merge([j.data]);
    } catch {
      toast.error(L(locale, { ar: 'تعذّر رفع الملف', en: 'Upload failed', de: 'Upload fehlgeschlagen', ru: 'Ошибка загрузки', it: 'Caricamento fallito' }) as string);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-accent/15 shadow-sm overflow-hidden flex flex-col h-[70vh] max-h-[640px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-primary via-primary to-primary-900 text-cream">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 border border-accent/40">
          <MessageCircle className="h-5 w-5 text-accent" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-bold leading-tight">{L(locale, { ar: 'الدردشة مع فريق لوتس شرم', en: 'Chat with Lotus Sharm', de: 'Chat mit Lotus Sharm', ru: 'Чат с Lotus Sharm', it: 'Chat con Lotus Sharm' })}</div>
          <div className="text-[11px] text-cream/70 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {L(locale, { ar: 'نرد عادةً خلال دقائق', en: 'We usually reply in minutes', de: 'Wir antworten meist in Minuten', ru: 'Обычно отвечаем за минуты', it: 'Rispondiamo in pochi minuti' })}
          </div>
        </div>
        <a href={buildWhatsAppLink('201090767278')} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366] text-white hover:bg-[#1ea954] transition-colors">
          <Phone className="h-4 w-4" />
        </a>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#f5efe2]"
        style={{ backgroundImage: 'radial-gradient(rgba(201,168,106,0.10) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      >
        {loading ? (
          <div className="h-full grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
        ) : items.length === 0 ? (
          <div className="h-full grid place-items-center text-center px-6">
            <div>
              <MessageCircle className="h-10 w-10 text-accent/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {L(locale, { ar: 'ابدأ المحادثة — اكتب سؤالك وفريقنا هيرد عليك هنا مباشرة.', en: 'Start the conversation — our team replies right here.', de: 'Starten Sie das Gespräch — unser Team antwortet hier direkt.', ru: 'Начните чат — команда ответит здесь.', it: 'Inizia la chat — il team risponde qui.' })}
              </p>
            </div>
          </div>
        ) : (
          items.map((m) => <Bubble key={m.id} m={m} isAr={isAr} locale={locale} />)
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-accent/15 bg-white p-2.5 flex items-end gap-2">
        <input ref={fileRef} type="file" accept="image/*,video/*,application/pdf" className="hidden" onChange={(e) => onPickFile(e.target.files?.[0])} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label="Attach"
          className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full text-accent-700 hover:bg-accent/10 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1}
          placeholder={L(locale, { ar: 'اكتب رسالتك…', en: 'Type a message…', de: 'Nachricht schreiben…', ru: 'Введите сообщение…', it: 'Scrivi un messaggio…' }) as string}
          dir={isAr ? 'rtl' : 'ltr'}
          className="flex-1 resize-none max-h-28 rounded-2xl border border-accent/20 bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 focus:bg-white transition-colors"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !text.trim()}
          aria-label="Send"
          className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-accent text-primary hover:bg-accent-400 shadow-md shadow-accent/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className={cn('h-5 w-5', isAr && 'scale-x-[-1]')} />}
        </button>
      </div>
    </div>
  );
}

function Bubble({ m, isAr, locale }: { m: ChatMsg; isAr: boolean; locale: string }) {
  const mine = !m.fromAdmin;
  const time = new Date(m.createdAt).toLocaleTimeString(isAr ? 'ar-EG' : locale, { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3 py-2 shadow-sm text-sm leading-relaxed',
          mine ? 'bg-primary text-cream rounded-br-md' : 'bg-white text-foreground border border-accent/15 rounded-bl-md',
        )}
        dir="auto"
      >
        {m.attachmentUrl && m.attachmentType === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer"><img src={m.attachmentUrl} alt="" className="rounded-lg mb-1 max-h-60 object-cover" /></a>
        )}
        {m.attachmentUrl && m.attachmentType === 'video' && (
          <video src={m.attachmentUrl} controls className="rounded-lg mb-1 max-h-60 w-full bg-black" />
        )}
        {m.attachmentUrl && m.attachmentType === 'file' && (
          <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" className={cn('flex items-center gap-2 mb-1 underline', mine ? 'text-cream' : 'text-accent-700')}>
            <FileText className="h-4 w-4" /> {L(locale, { ar: 'ملف مرفق', en: 'Attached file', de: 'Anhang', ru: 'Файл', it: 'Allegato' })}
          </a>
        )}
        {m.body && <span className="whitespace-pre-wrap break-words">{m.body}</span>}
        <span className={cn('flex items-center gap-1 justify-end mt-0.5 text-[10px]', mine ? 'text-cream/60' : 'text-muted-foreground')}>
          {time}
          {mine && (m.pending ? <Check className="h-3 w-3" /> : <CheckCheck className="h-3 w-3" />)}
        </span>
      </div>
    </div>
  );
}
