'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Check, CreditCard, Wallet, Building2, Banknote } from 'lucide-react';
import { api } from '@/lib/api';
import { localeToApiCode } from '@/lib/utils';
import { toast } from 'sonner';
import type { TripDTO } from '@/types/api';

type PayMethod = 'STRIPE' | 'VODAFONE_CASH' | 'INSTAPAY' | 'BANK_TRANSFER' | 'CASH';

interface Props {
  trip: TripDTO;
  locale: string;
  defaults: { date?: string; adults: number; children: number; customerType: 'LOCAL' | 'FOREIGN' };
}

export function BookingForm({ trip, locale, defaults }: Props) {
  const t = useTranslations('booking');
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pending, start] = useTransition();

  const [date, setDate] = useState(defaults.date || new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [adults, setAdults] = useState(defaults.adults);
  const [children, setChildren] = useState(defaults.children);
  const [customerType, setCustomerType] = useState<'LOCAL' | 'FOREIGN'>(defaults.customerType);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [coupon, setCoupon] = useState('');

  const [method, setMethod] = useState<PayMethod>('STRIPE');

  const isLocal = customerType === 'LOCAL';
  const unit = isLocal ? Number(trip.priceLocalEGP) : Number(trip.priceForeignUSD);
  const symbol = isLocal ? 'ج.م' : '$';
  const childPrice = unit * (1 - trip.childDiscount / 100);
  const subtotal = adults * unit + children * childPrice;

  const submit = () => {
    start(async () => {
      try {
        const booking = await api.post<{ id: number; reference: string }>('/public/bookings', {
          tripId: trip.id,
          bookingDate: date,
          adultsCount: adults,
          childrenCount: children,
          customerType,
          customer: { fullName, email, phone, country, language: localeToApiCode(locale) },
          notes,
          couponCode: coupon || undefined,
        });

        if (method === 'STRIPE') {
          const { url } = await api.post<{ url: string }>('/public/payments/stripe/checkout', {
            bookingId: booking.id,
            locale,
          });
          if (url) window.location.href = url;
        } else {
          await api.post('/public/payments/manual', {
            bookingId: booking.id,
            method,
            amount: subtotal,
          });
          router.push(`/booking/success?ref=${booking.reference}&manual=1&method=${method}`);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex gap-2 text-sm">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>{t('step1')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label={t('tripDate')}>
              <Input type="date" value={date} min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('adults')}>
                <Input type="number" min={1} max={20} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))} />
              </Field>
              <Field label={t('children')}>
                <Input type="number" min={0} max={20} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))} />
              </Field>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isLocal} onChange={(e) => setCustomerType(e.target.checked ? 'LOCAL' : 'FOREIGN')} className="w-4 h-4 accent-primary" />
              <span className="text-sm">{t('isLocal')}</span>
            </label>
            <Button onClick={() => setStep(2)} className="w-full">{t('continue')}</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>{t('step2')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label={t('fullName')}><Input required value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('email')}><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              <Field label={t('phone')}><Input required value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            </div>
            <Field label={t('country')}><Input value={country} onChange={(e) => setCountry(e.target.value)} /></Field>
            <Field label={t('notes')}><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
            <div className="flex gap-2">
              <Input placeholder={t('couponCode')} value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">{t('back')}</Button>
              <Button onClick={() => setStep(3)} className="flex-1" disabled={!fullName || !email || !phone}>{t('continue')}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>{t('step3')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>{trip.tr?.title}</span></div>
              <div className="flex justify-between"><span><Calendar className="inline h-4 w-4 me-1" />{date}</span><span>{adults}+{children}</span></div>
              <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                <span>{t('total')}</span><span className="text-primary">{symbol}{subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="space-y-2">
              <PayOption v="STRIPE" label={t('payOnline')} icon={<CreditCard className="h-5 w-5" />} method={method} setMethod={setMethod} />
              <PayOption v="VODAFONE_CASH" label={t('payVodafone')} icon={<Wallet className="h-5 w-5" />} method={method} setMethod={setMethod} />
              <PayOption v="INSTAPAY" label={t('payInstaPay')} icon={<Wallet className="h-5 w-5" />} method={method} setMethod={setMethod} />
              <PayOption v="BANK_TRANSFER" label={t('payBank')} icon={<Building2 className="h-5 w-5" />} method={method} setMethod={setMethod} />
              <PayOption v="CASH" label={t('payCash')} icon={<Banknote className="h-5 w-5" />} method={method} setMethod={setMethod} />
            </div>

            {method !== 'STRIPE' && method !== 'CASH' && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm">
                <p className="font-semibold mb-1">{t('manualInstructions')}</p>
                {method === 'VODAFONE_CASH' && <p>فودافون كاش: <strong dir="ltr">01090767278</strong></p>}
                {method === 'INSTAPAY' && <p>InstaPay: <strong>lottussharm</strong></p>}
                {method === 'BANK_TRANSFER' && <p>بنك أبو ظبي الإسلامي — <strong dir="ltr">100001177381</strong></p>}
                <p className="mt-1 text-xs">بعد الدفع، تواصل معنا على واتساب بصورة الإيصال + رقم الحجز.</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">{t('back')}</Button>
              <Button onClick={submit} disabled={pending} className="flex-1">{t('confirm')}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PayOption({ v, label, icon, method, setMethod }: { v: PayMethod; label: string; icon: React.ReactNode; method: PayMethod; setMethod: (m: PayMethod) => void }) {
  const selected = method === v;
  return (
    <button
      type="button"
      onClick={() => setMethod(v)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${selected ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
    >
      <span className={selected ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
      {selected && <Check className="h-4 w-4 ms-auto text-primary" />}
    </button>
  );
}
