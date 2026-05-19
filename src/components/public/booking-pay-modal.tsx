'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import { X, Upload, FileCheck2, Loader2, CheckCircle2, Phone, Mail, User, Copy, Check, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { TripDTO } from '@/types/api';
import { L, cn } from '@/lib/utils';
import { API_BASE, api } from '@/lib/api';
import { toast } from 'sonner';

interface SiteSettings {
  vodafoneCash?: string | null;
  instaPay?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccount?: string | null;
  bankIban?: string | null;
}

interface BookingPayload {
  fullName: string;
  email: string;
  phone: string;
  date: string;
  adults: number;
  children: number;
  isLocal: boolean;
  travelerType?: 'ADULT' | 'GEN_Z';
  isMarried?: boolean;
  notes?: string;
}

type PayMethod = 'VODAFONE_CASH' | 'INSTAPAY' | 'BANK_TRANSFER' | 'CASH';

export function BookingPayModal({
  trip, payload, total, currency, onClose, onSuccess,
}: {
  trip: TripDTO;
  payload: BookingPayload;
  total: number;
  currency: 'EGP' | 'USD';
  onClose: () => void;
  onSuccess: (reference: string) => void;
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const fileRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [method, setMethod] = useState<PayMethod>('VODAFONE_CASH');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api.get<SiteSettings>('/public/settings').then(setSettings).catch(() => setSettings({}));
  }, []);

  // Auto-pick a method based on locality
  useEffect(() => {
    setMethod(payload.isLocal ? 'VODAFONE_CASH' : 'BANK_TRANSFER');
  }, [payload.isLocal]);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
      toast.success(L(locale, { ar: 'تم النسخ', en: 'Copied', ru: 'Скопировано', it: 'Copiato' }) as string);
    } catch { /* ignore */ }
  };

  const onFileChange = (f: File | null) => {
    if (!f) { setFile(null); setPreview(null); return; }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const isCashOnArrival = method === 'CASH';
  const submit = async () => {
    if (!isCashOnArrival && !file) {
      return toast.error(L(locale, { ar: 'ارفع صورة الإيصال أولاً', en: 'Please attach the receipt', ru: 'Прикрепите чек', it: 'Allega la ricevuta' }) as string);
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('tripId', String(trip.id));
      fd.append('bookingDate', payload.date);
      fd.append('adultsCount', String(payload.adults));
      fd.append('childrenCount', String(payload.children));
      fd.append('customerType', payload.isLocal ? 'LOCAL' : 'FOREIGN');
      fd.append('fullName', payload.fullName);
      fd.append('phone', payload.phone);
      if (payload.email) fd.append('email', payload.email);
      fd.append('language', locale.toUpperCase());
      fd.append('method', method);
      if (payload.travelerType) fd.append('travelerType', payload.travelerType);
      if (payload.isMarried) fd.append('isMarried', 'true');
      if (payload.notes) fd.append('notes', payload.notes);
      if (file) fd.append('receipt', file);

      const res = await fetch(`${API_BASE}/public/bookings/with-receipt`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error?.message || 'Submit failed');
      setSuccess(data.data.reference);
      onSuccess(data.data.reference);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Success view =====
  if (success) {
    return (
      <Modal onClose={onClose}>
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-primary mb-2">
            {L(locale, { ar: 'تم استلام حجزك!', en: 'Booking received!', ru: 'Бронь получена!', it: 'Prenotazione ricevuta!' })}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mb-4">
            {L(locale, {
              ar: 'فريقنا هيراجع الإيصال ويأكد الحجز خلال ساعات. هتوصلك رسالة على واتساب والإيميل.',
              en: 'Our team will review the receipt and confirm within hours. You\'ll get a WhatsApp + email confirmation.',
              ru: 'Команда проверит чек и подтвердит за несколько часов. Вы получите уведомление.',
              it: 'Il team verificherà la ricevuta e confermerà in poche ore. Riceverai conferma via WhatsApp ed email.',
            })}
          </p>
          <div className="inline-flex flex-col items-center gap-1 px-5 py-3 rounded-xl bg-accent/10 border border-accent/30">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              {L(locale, { ar: 'رقم الحجز', en: 'Booking reference', ru: 'Номер брони', it: 'N° prenotazione' })}
            </span>
            <span className="font-mono font-bold text-lg text-accent-700">{success}</span>
          </div>
          <Button onClick={onClose} className="mt-6 w-full">
            {L(locale, { ar: 'إغلاق', en: 'Close', ru: 'Закрыть', it: 'Chiudi' })}
          </Button>
        </div>
      </Modal>
    );
  }

  const methods: { key: PayMethod; ar: string; en: string; ru: string; it: string; instructions: { ar: string; en: string; ru: string; it: string } | null; details: { label: string; value: string; copy: boolean }[] }[] = [
    {
      key: 'VODAFONE_CASH',
      ar: 'فودافون كاش', en: 'Vodafone Cash', ru: 'Vodafone Cash', it: 'Vodafone Cash',
      instructions: {
        ar: 'حول المبلغ على الرقم وارفع صورة الإيصال هنا',
        en: 'Transfer to the number and upload your receipt below',
        ru: 'Переведите на номер и загрузите чек',
        it: 'Trasferisci al numero e carica la ricevuta',
      },
      details: settings?.vodafoneCash ? [{ label: 'رقم الفودافون كاش / Number', value: settings.vodafoneCash, copy: true }] : [],
    },
    {
      key: 'INSTAPAY',
      ar: 'إنستا باي', en: 'InstaPay', ru: 'InstaPay', it: 'InstaPay',
      instructions: {
        ar: 'حول عبر InstaPay على العنوان أدناه وارفع الإيصال',
        en: 'Send via InstaPay to the handle below and upload the receipt',
        ru: 'Через InstaPay и загрузите чек',
        it: 'Via InstaPay e carica la ricevuta',
      },
      details: settings?.instaPay ? [{ label: 'InstaPay', value: settings.instaPay, copy: true }] : [],
    },
    {
      key: 'BANK_TRANSFER',
      ar: 'تحويل بنكي / IBAN', en: 'Bank transfer / IBAN', ru: 'Банковский перевод / IBAN', it: 'Bonifico / IBAN',
      instructions: {
        ar: 'حول على الحساب البنكي وارفع نسخة من الإيصال',
        en: 'Wire to the bank account and upload a copy of the receipt',
        ru: 'Перевод на банк и загрузите чек',
        it: 'Bonifico al conto e carica la ricevuta',
      },
      details: [
        ...(settings?.bankName ? [{ label: 'البنك / Bank', value: settings.bankName, copy: false }] : []),
        ...(settings?.bankAccountName ? [{ label: 'اسم الحساب / Account name', value: settings.bankAccountName, copy: false }] : []),
        ...(settings?.bankAccount ? [{ label: 'رقم الحساب / Account number', value: settings.bankAccount, copy: true }] : []),
        ...(settings?.bankIban ? [{ label: 'IBAN', value: settings.bankIban, copy: true }] : []),
      ],
    },
    {
      key: 'CASH',
      ar: 'نقدي عند الوصول', en: 'Cash on arrival', ru: 'Наличные', it: 'Contanti',
      instructions: {
        ar: 'تأكيد الحجز عبر واتساب أولاً، الدفع نقداً قبل بداية الرحلة',
        en: 'Confirm via WhatsApp first, pay cash before trip start',
        ru: 'Подтверждение через WhatsApp, наличные перед туром',
        it: 'Conferma via WhatsApp prima, contanti all\'inizio tour',
      },
      details: [],
    },
  ];

  const current = methods.find((m) => m.key === method)!;

  return (
    <Modal onClose={onClose}>
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h3 className="font-serif text-xl font-bold text-primary">
            {L(locale, { ar: 'حجز وادفع', en: 'Book & pay', ru: 'Бронь и оплата', it: 'Prenota e paga' })}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {L(locale, {
              ar: 'ارفع إيصال الدفع وفريقنا هيأكد الحجز.',
              en: 'Upload your payment receipt and our team will confirm.',
              ru: 'Загрузите чек, команда подтвердит бронь.',
              it: 'Carica la ricevuta, il team confermerà.',
            })}
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-md hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Booking summary */}
        <div className="rounded-xl bg-accent/8 border border-accent/25 p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
            {L(locale, { ar: 'ملخص الحجز', en: 'Booking summary', ru: 'Сводка', it: 'Riepilogo' })}
          </div>
          <div className="font-bold text-primary text-sm leading-snug">
            {trip.tr?.title || trip.translations.find((t) => t.locale === 'AR')?.title || trip.slug}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
            <div>{L(locale, { ar: 'التاريخ', en: 'Date', ru: 'Дата', it: 'Data' })}: <span className="text-foreground font-semibold">{payload.date}</span></div>
            <div>{L(locale, { ar: 'الإجمالي', en: 'Total', ru: 'Итого', it: 'Totale' })}: <span className="text-foreground font-bold tabular-nums">{total.toLocaleString()} {currency}</span></div>
            <div>{L(locale, { ar: 'البالغين', en: 'Adults', ru: 'Взрослые', it: 'Adulti' })}: <span className="text-foreground font-semibold">{payload.adults}</span></div>
            {payload.children > 0 && (
              <div>{L(locale, { ar: 'الأطفال', en: 'Children', ru: 'Дети', it: 'Bambini' })}: <span className="text-foreground font-semibold">{payload.children}</span></div>
            )}
            <div className="col-span-2 inline-flex items-center gap-1.5">
              <User className="h-3 w-3 text-accent" />
              <span className="text-foreground font-semibold">{payload.fullName}</span>
              <span>·</span>
              <Phone className="h-3 w-3 text-accent" />
              <span className="font-mono" dir="ltr">{payload.phone}</span>
              {payload.email && (<><span>·</span><Mail className="h-3 w-3 text-accent" /><span dir="ltr">{payload.email}</span></>)}
            </div>
          </div>
        </div>

        {/* Method picker */}
        <div>
          <label className="block text-xs font-bold text-primary/80 uppercase tracking-wider mb-2">
            {L(locale, { ar: 'اختر طريقة الدفع', en: 'Choose payment method', ru: 'Способ оплаты', it: 'Metodo di pagamento' })}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {methods.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMethod(m.key)}
                className={cn(
                  'rounded-xl px-3 py-2.5 text-start transition-all border-2 text-sm',
                  method === m.key
                    ? 'bg-primary text-cream border-primary shadow-md'
                    : 'bg-white text-primary border-accent/20 hover:border-accent/50',
                )}
              >
                <span className="font-bold leading-tight">{L(locale, m)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Method details */}
        <div className="rounded-xl border-2 border-accent/25 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 p-4">
          {current.instructions && (
            <p className="text-sm text-primary/85 leading-relaxed mb-3 inline-flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              {L(locale, current.instructions)}
            </p>
          )}
          {current.details.length > 0 ? (
            <div className="space-y-2">
              {current.details.map((d, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold shrink-0">{d.label}</span>
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold font-mono text-end break-all">{d.value}</span>
                    {d.copy && (
                      <button
                        type="button"
                        onClick={() => copy(d.value, `${current.key}-${i}`)}
                        className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
                        aria-label="Copy"
                      >
                        {copied === `${current.key}-${i}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {L(locale, {
                ar: 'الدفع نقداً عند الوصول — لسنا بحاجة لإيصال مسبق، فقط أرفق صورة لتأكيد هويتك.',
                en: 'Cash on arrival — attach an ID or any reference image to confirm.',
                ru: 'Наличные при встрече — прикрепите ID или фото для подтверждения.',
                it: 'Contanti all\'arrivo — allega un documento o foto di riferimento.',
              })}
            </p>
          )}
        </div>

        {/* File upload */}
        <div>
          <label className="block text-xs font-bold text-primary/80 uppercase tracking-wider mb-2">
            {L(locale, { ar: 'صورة الإيصال', en: 'Payment receipt', ru: 'Чек оплаты', it: 'Ricevuta' })}
            <span className="text-accent ms-1">*</span>
          </label>
          {!file ? (
            <label className="flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-dashed border-accent/30 hover:border-accent/60 hover:bg-accent/5 cursor-pointer transition-colors text-primary/75">
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              />
              <Upload className="h-5 w-5 text-accent" />
              <span className="text-sm font-bold">
                {L(locale, { ar: 'اختر الصورة (أو PDF)', en: 'Choose file (image or PDF)', ru: 'Выбрать файл', it: 'Scegli file' })}
              </span>
            </label>
          ) : (
            <div className="rounded-xl border-2 border-accent/30 p-3 bg-white">
              <div className="flex items-center gap-3">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <FileCheck2 className="h-7 w-7 text-accent" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{file.name}</div>
                  <div className="text-[11px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button onClick={() => onFileChange(null)} className="p-2 rounded-md hover:bg-red-50 text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 z-10">
        <Button variant="outline" onClick={onClose}>
          {L(locale, { ar: 'إلغاء', en: 'Cancel', ru: 'Отмена', it: 'Annulla' })}
        </Button>
        <Button onClick={submit} disabled={submitting || (!isCashOnArrival && !file)} className="bg-primary text-cream hover:bg-primary/90">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {L(locale, { ar: 'إرسال الحجز للمراجعة', en: 'Submit booking', ru: 'Отправить', it: 'Invia prenotazione' })}
        </Button>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  if (!mounted) return null;
  // CRITICAL: portal to document.body so the fixed positioning escapes any
  // ancestor with a `transform` (which would otherwise become the modal's
  // containing block and clip it inside the booking widget).
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
