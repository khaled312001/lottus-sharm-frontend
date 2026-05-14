import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default async function BookingSuccess({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; manual?: string; method?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  return <SuccessClient reference={sp.ref} manual={sp.manual === '1'} method={sp.method} />;
}

function SuccessClient({ reference, manual, method }: { reference?: string; manual?: boolean; method?: string }) {
  const t = useTranslations('booking');
  return (
    <section className="container py-20 max-w-2xl text-center">
      <CheckCircle2 className="h-20 w-20 mx-auto text-green-600 mb-6" />
      <h1 className="text-3xl font-extrabold mb-3">{t('success')}</h1>
      <p className="text-muted-foreground mb-6">{t('successDesc')}</p>
      {reference && (
        <div className="rounded-2xl bg-muted/30 p-6 mb-8 inline-block">
          <div className="text-sm text-muted-foreground mb-1">{t('yourReference')}</div>
          <div className="font-mono text-2xl font-bold text-primary">{reference}</div>
        </div>
      )}
      {manual && method && method !== 'CASH' && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm mb-6">
          <p className="font-semibold mb-2">{t('manualInstructions')}</p>
          {method === 'VODAFONE_CASH' && <p>فودافون كاش: <strong dir="ltr">01090767278</strong></p>}
          {method === 'INSTAPAY' && <p>InstaPay: <strong>lottussharm</strong></p>}
          {method === 'BANK_TRANSFER' && <p>بنك أبو ظبي الإسلامي — <strong dir="ltr">100001177381</strong></p>}
        </div>
      )}
      <Button asChild>
        <Link href="/trips">Back to trips</Link>
      </Button>
    </section>
  );
}
