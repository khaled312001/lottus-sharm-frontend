import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default async function BookingCancel({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="container py-20 max-w-2xl text-center">
      <XCircle className="h-20 w-20 mx-auto text-red-600 mb-6" />
      <h1 className="text-3xl font-extrabold mb-3">{locale === 'ar' ? 'تم إلغاء الدفع' : 'Payment cancelled'}</h1>
      <p className="text-muted-foreground mb-6">{locale === 'ar' ? 'لم يتم إتمام عملية الدفع. يمكنك المحاولة مرة أخرى.' : 'Payment was not completed. You can try again.'}</p>
      <Button asChild><Link href="/trips">{locale === 'ar' ? 'العودة للرحلات' : 'Back to trips'}</Link></Button>
    </section>
  );
}
