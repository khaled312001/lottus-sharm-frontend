'use client';
import { useEffect, useState, useTransition } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { L, localeToApiCode } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { TripCommentDTO, ApiLocale } from '@/types/api';

function relativeTime(iso: string, locale: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return L(locale, { ar: 'الآن', en: 'just now', ru: 'только что', it: 'ora' });
  if (diff < hour) {
    const n = Math.floor(diff / minute);
    return L(locale, { ar: `قبل ${n}د`, en: `${n}m ago`, ru: `${n} мин назад`, it: `${n}m fa` });
  }
  if (diff < day) {
    const n = Math.floor(diff / hour);
    return L(locale, { ar: `قبل ${n}س`, en: `${n}h ago`, ru: `${n} ч назад`, it: `${n}h fa` });
  }
  const n = Math.floor(diff / day);
  if (n < 30) return L(locale, { ar: `قبل ${n}ي`, en: `${n}d ago`, ru: `${n} дн назад`, it: `${n}g fa` });
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en');
}

export function TripComments({ slug, locale, initialCount = 0 }: { slug: string; locale: string; initialCount?: number }) {
  const apiLocale = localeToApiCode(locale) as ApiLocale;
  const [items, setItems] = useState<TripCommentDTO[]>([]);
  const [total, setTotal] = useState(initialCount);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [pending, startTransition] = useTransition();

  const load = () => {
    api.get<{ items: TripCommentDTO[]; total: number }>(`/public/trips/${slug}/comments`)
      .then((d) => { setItems(d.items); setTotal(d.total); })
      .catch(() => undefined);
  };
  useEffect(() => { load(); }, [slug]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || content.trim().length < 2) {
      toast.error(L(locale, { ar: 'أكمل الحقول من فضلك', en: 'Please complete the fields', ru: 'Заполните поля', it: 'Compila i campi' }));
      return;
    }
    startTransition(() => {
      api.post<TripCommentDTO>(`/public/trips/${slug}/comments`, {
        authorName: name.trim(),
        authorEmail: email.trim() || undefined,
        content: content.trim(),
        locale: apiLocale,
      })
        .then((created) => {
          // optimistic prepend
          setItems((prev) => [created, ...prev]);
          setTotal((n) => n + 1);
          setContent('');
          toast.success(L(locale, { ar: 'تم نشر تعليقك ✓', en: 'Comment posted ✓', ru: 'Комментарий добавлен ✓', it: 'Commento pubblicato ✓' }));
        })
        .catch((e) => toast.error(e.message || 'Error'));
    });
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2.5 mb-3">
        <span className="block w-7 h-px bg-accent" />
        <span className="text-accent uppercase tracking-[0.25em] text-[10px] sm:text-[11px] font-bold">
          {L(locale, { ar: 'النقاشات والتعليقات', en: 'Discussion', ru: 'Обсуждение', it: 'Discussione' })}
        </span>
      </div>
      <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-5 leading-tight text-balance">
        {L(locale, {
          ar: `الأسئلة والتعليقات${total > 0 ? ` (${total})` : ''}`,
          en: `Questions & comments${total > 0 ? ` (${total})` : ''}`,
          ru: `Вопросы и комментарии${total > 0 ? ` (${total})` : ''}`,
          it: `Domande e commenti${total > 0 ? ` (${total})` : ''}`,
        })}
      </h2>

      {/* Composer */}
      <form onSubmit={submit} className="bg-white border border-accent/15 rounded-2xl p-5 md:p-6 card-shadow space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder={L(locale, { ar: 'اسمك', en: 'Your name', ru: 'Ваше имя', it: 'Il tuo nome' })}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            className="px-3 py-2.5 rounded-lg border border-accent/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
            required
          />
          <input
            type="email"
            placeholder={L(locale, { ar: 'بريد إلكتروني (اختياري)', en: 'Email (optional)', ru: 'Email (необязательно)', it: 'Email (opzionale)' })}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            className="px-3 py-2.5 rounded-lg border border-accent/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <textarea
          placeholder={L(locale, { ar: 'اكتب سؤالك أو تعليقك هنا…', en: 'Write your question or comment…', ru: 'Ваш вопрос или комментарий…', it: 'Scrivi qui domanda o commento…' })}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full px-3 py-2.5 rounded-lg border border-accent/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y leading-relaxed"
          required
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] text-muted-foreground">
            {L(locale, {
              ar: 'تظهر التعليقات فور إرسالها وفق سياسة المراجعة',
              en: 'Comments appear instantly, subject to moderation',
              ru: 'Комментарии появляются сразу, при модерации',
              it: 'I commenti appaiono subito, soggetti a moderazione',
            })}
          </p>
          <Button type="submit" disabled={pending} className="gradient-gold text-primary font-bold hover:opacity-90">
            <Send className="h-4 w-4 me-1.5 rtl:rotate-180" />
            {pending
              ? L(locale, { ar: 'جاري النشر…', en: 'Posting…', ru: 'Отправка…', it: 'Invio…' })
              : L(locale, { ar: 'نشر التعليق', en: 'Post comment', ru: 'Отправить', it: 'Pubblica' })}
          </Button>
        </div>
      </form>

      {/* List */}
      {items.length === 0 ? (
        <div className="mt-5 text-center text-sm text-muted-foreground py-6 bg-white/60 rounded-xl border border-dashed border-accent/30">
          <MessageSquare className="h-6 w-6 mx-auto mb-2 text-accent/60" />
          {L(locale, { ar: 'لا توجد تعليقات بعد — ابدأ النقاش!', en: 'No comments yet — start the discussion!', ru: 'Пока нет комментариев — будьте первым!', it: 'Ancora nessun commento — inizia la discussione!' })}
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((c) => (
            <li key={c.id} className="bg-white border border-accent/15 rounded-2xl p-4 sm:p-5 card-shadow hover:border-accent/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-9 h-9 rounded-full gradient-gold text-primary font-bold flex items-center justify-center font-serif text-sm">
                  {c.authorName.trim().charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-primary leading-tight truncate">{c.authorName}</div>
                  <div className="text-[11px] text-muted-foreground">{relativeTime(c.createdAt, locale)}</div>
                </div>
              </div>
              <p className="text-foreground/85 leading-relaxed text-sm md:text-[15px] whitespace-pre-wrap">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
