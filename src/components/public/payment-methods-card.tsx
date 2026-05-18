'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Copy, Check, Phone, Building2, ShieldCheck, Banknote } from 'lucide-react';
import { L, cn } from '@/lib/utils';
import { VodafoneCashIcon, InstaPayIcon, AdibBankIcon, IbanIcon, CashIcon } from './payment-icons';
import { toast } from 'sonner';

export interface PaymentMethodsData {
  vodafoneCash?: string | null;
  instaPay?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccount?: string | null;
  bankIban?: string | null;
}

interface Method {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  title: { ar: string; en: string; ru: string; it: string };
  rows: { label: { ar: string; en: string; ru: string; it: string }; value: string; copy?: boolean; dir?: 'ltr' | 'rtl' }[];
  audience?: 'local' | 'foreign' | 'both';
  accent: string;
}

export function PaymentMethodsCard({
  data, customerType = 'both', compact = false,
}: {
  data: PaymentMethodsData;
  customerType?: 'local' | 'foreign' | 'both';
  compact?: boolean;
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success(L(locale, { ar: 'تم النسخ', en: 'Copied', ru: 'Скопировано', it: 'Copiato' }) as string);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error(L(locale, { ar: 'تعذر النسخ', en: 'Copy failed', ru: 'Не удалось', it: 'Errore' }) as string);
    }
  };

  // For foreigners we lead with IBAN since they likely won't have Vodafone/InstaPay.
  const allMethods: Method[] = [
    {
      key: 'vodafone',
      icon: VodafoneCashIcon,
      title: { ar: 'فودافون كاش', en: 'Vodafone Cash', ru: 'Vodafone Cash', it: 'Vodafone Cash' },
      audience: 'local',
      accent: 'border-red-500/30 bg-red-500/5',
      rows: data.vodafoneCash ? [
        { label: { ar: 'الرقم', en: 'Number', ru: 'Номер', it: 'Numero' }, value: data.vodafoneCash, copy: true, dir: 'ltr' },
      ] : [],
    },
    {
      key: 'instapay',
      icon: InstaPayIcon,
      title: { ar: 'إنستا باي', en: 'InstaPay', ru: 'InstaPay', it: 'InstaPay' },
      audience: 'local',
      accent: 'border-purple-500/30 bg-purple-500/5',
      rows: data.instaPay ? [
        { label: { ar: 'العنوان', en: 'Handle', ru: 'Адрес', it: 'Handle' }, value: data.instaPay, copy: true, dir: 'ltr' },
      ] : [],
    },
    {
      key: 'bank',
      icon: AdibBankIcon,
      title: { ar: 'تحويل بنكي', en: 'Bank transfer', ru: 'Банк. перевод', it: 'Bonifico' },
      audience: 'both',
      accent: 'border-blue-500/30 bg-blue-500/5',
      rows: [
        ...(data.bankName ? [{ label: { ar: 'البنك', en: 'Bank', ru: 'Банк', it: 'Banca' }, value: data.bankName }] : []),
        ...(data.bankAccountName ? [{ label: { ar: 'اسم الحساب', en: 'Account name', ru: 'Имя счёта', it: 'Intestatario' }, value: data.bankAccountName }] : []),
        ...(data.bankAccount ? [{ label: { ar: 'رقم الحساب', en: 'Account number', ru: 'Номер счёта', it: 'N° conto' }, value: data.bankAccount, copy: true, dir: 'ltr' as const }] : []),
      ],
    },
    {
      key: 'iban',
      icon: IbanIcon,
      title: { ar: 'IBAN (تحويل دولي)', en: 'IBAN (international)', ru: 'IBAN', it: 'IBAN' },
      audience: 'foreign',
      accent: 'border-teal-500/30 bg-teal-500/5',
      rows: data.bankIban ? [
        { label: { ar: 'رقم الـ IBAN', en: 'IBAN', ru: 'IBAN', it: 'IBAN' }, value: data.bankIban, copy: true, dir: 'ltr' as const },
        ...(data.bankAccountName ? [{ label: { ar: 'المستفيد', en: 'Beneficiary', ru: 'Получатель', it: 'Beneficiario' }, value: data.bankAccountName }] : []),
      ] : [],
    },
    {
      key: 'cash',
      icon: CashIcon,
      title: { ar: 'نقدي عند الوصول', en: 'Cash on arrival', ru: 'Наличные', it: 'Contanti' },
      audience: 'both',
      accent: 'border-emerald-500/30 bg-emerald-500/5',
      rows: [
        { label: { ar: 'التفاصيل', en: 'Details', ru: 'Детали', it: 'Dettagli' },
          value: isAr
            ? 'يمكن الدفع نقداً للمرشد عند بداية الرحلة (يتطلب تأكيداً مسبقاً عبر واتساب)'
            : 'Pay the guide in cash at the start of the trip (please confirm by WhatsApp first)' },
      ],
    },
  ];

  // Filter by audience and skip empty
  const methods = allMethods.filter((m) => {
    if (m.rows.length === 0) return false;
    if (customerType === 'both') return true;
    if (m.audience === 'both') return true;
    return m.audience === customerType;
  });

  if (methods.length === 0) return null;

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {methods.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.key} className={cn('rounded-xl border-2 p-4', m.accent, compact && 'p-3')}>
            <div className="flex items-center gap-3 mb-2.5">
              <Icon className={cn(compact ? 'h-9 w-9' : 'h-11 w-11', 'shrink-0 rounded-lg')} />
              <h4 className="font-bold text-base text-foreground leading-tight">
                {L(locale, m.title)}
              </h4>
            </div>
            <div className="space-y-1.5">
              {m.rows.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold shrink-0">
                    {L(locale, r.label)}
                  </span>
                  <span className="flex items-center gap-1.5 min-w-0 text-end" dir={r.dir}>
                    <span className={cn('font-bold truncate', r.dir === 'ltr' && 'font-mono tracking-wider')}>{r.value}</span>
                    {r.copy && (
                      <button
                        type="button"
                        onClick={() => copy(r.value, `${m.key}-${idx}`)}
                        className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Copy"
                      >
                        {copied === `${m.key}-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-[11px] text-muted-foreground text-center pt-1 inline-flex items-center justify-center gap-1.5 w-full">
        <ShieldCheck className="h-3 w-3 text-emerald-600" />
        {L(locale, {
          ar: 'بعد التحويل ارفع صورة الإيصال هنا لتأكيد الحجز خلال ساعات',
          en: 'After transfer, upload your receipt here to confirm within hours',
          ru: 'После перевода загрузите чек — подтвердим в течение часов',
          it: 'Dopo il bonifico, carica la ricevuta — confermiamo entro poche ore',
        })}
      </p>
    </div>
  );
}
