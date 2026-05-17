import type { TripDTO } from '@/types/api';

const PHONE = '201090767278';

/**
 * Build a clean, WhatsApp-friendly booking message.
 * Uses plain text only (no markdown asterisks that can render oddly), one fact per line.
 */
export function buildTripBookingMessage(opts: {
  trip: TripDTO;
  locale: string;
  date?: string;
  adults?: number;
  children?: number;
  isLocal?: boolean;
  fullName?: string;
  phone?: string;
  nationality?: string;
  age?: string | number;
  notes?: string;
}): string {
  const { trip, locale, date, adults = 0, children = 0, isLocal, fullName, phone, nationality, age, notes } = opts;
  const isAr = locale === 'ar';
  const tr = trip.tr || trip.translations.find((x) => x.locale === 'AR') || trip.translations[0];
  const title = tr?.title || trip.slug;

  const unit = isLocal ? Number(trip.priceLocalEGP) : Number(trip.priceForeignUSD);
  const symbol = isLocal ? 'EGP' : 'USD';
  const childPrice = unit * (1 - trip.childDiscount / 100);
  const total = adults * unit + children * childPrice;
  const link = `https://lotussharm.com/${locale}/trips/${trip.slug}`;

  const lines: string[] = [];

  if (isAr) {
    lines.push('السلام عليكم — أريد حجز رحلة');
    lines.push('');
    lines.push(`الرحلة: ${title}`);
    lines.push(`الرابط: ${link}`);
    if (date) lines.push(`التاريخ: ${date}`);
    if (adults || children) {
      const parts: string[] = [];
      if (adults) parts.push(`${adults} بالغ`);
      if (children) parts.push(`${children} طفل`);
      lines.push(`العدد: ${parts.join(' + ')}`);
    }
    if (fullName) lines.push(`الاسم: ${fullName}`);
    if (phone) lines.push(`الهاتف: ${phone}`);
    if (nationality) lines.push(`الجنسية: ${nationality}`);
    if (age) lines.push(`العمر: ${age}`);
    if (total > 0) lines.push(`الإجمالي التقريبي: ${total.toLocaleString('en')} ${symbol}`);
    if (notes) { lines.push(''); lines.push(`ملاحظات: ${notes}`); }
    lines.push('');
    lines.push('شكراً، في انتظار تأكيد الحجز.');
  } else {
    lines.push('Hello — I would like to book a trip');
    lines.push('');
    lines.push(`Trip: ${title}`);
    lines.push(`Link: ${link}`);
    if (date) lines.push(`Date: ${date}`);
    if (adults || children) {
      const parts: string[] = [];
      if (adults) parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
      if (children) parts.push(`${children} child${children !== 1 ? 'ren' : ''}`);
      lines.push(`Guests: ${parts.join(' + ')}`);
    }
    if (fullName) lines.push(`Name: ${fullName}`);
    if (phone) lines.push(`Phone: ${phone}`);
    if (nationality) lines.push(`Nationality: ${nationality}`);
    if (age) lines.push(`Age: ${age}`);
    if (total > 0) lines.push(`Estimated total: ${total.toLocaleString('en')} ${symbol}`);
    if (notes) { lines.push(''); lines.push(`Notes: ${notes}`); }
    lines.push('');
    lines.push('Thank you — awaiting your confirmation.');
  }

  return lines.join('\n');
}

export function buildTripInquiryMessage(trip: TripDTO, locale: string): string {
  const isAr = locale === 'ar';
  const tr = trip.tr || trip.translations.find((x) => x.locale === 'AR') || trip.translations[0];
  const title = tr?.title || trip.slug;
  const link = `https://lotussharm.com/${locale}/trips/${trip.slug}`;
  if (isAr) {
    return [
      'السلام عليكم',
      'أود الاستفسار عن الرحلة التالية:',
      '',
      `الرحلة: ${title}`,
      `الرابط: ${link}`,
      '',
      'برجاء إرسال التفاصيل والأسعار. شكراً.',
    ].join('\n');
  }
  return [
    'Hello,',
    'I would like to inquire about this trip:',
    '',
    `Trip: ${title}`,
    `Link: ${link}`,
    '',
    'Please share details and pricing. Thank you.',
  ].join('\n');
}

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

export function bookingWhatsAppLink(opts: Parameters<typeof buildTripBookingMessage>[0]): string {
  return buildWhatsAppLink(buildTripBookingMessage(opts));
}

export function inquiryWhatsAppLink(trip: TripDTO, locale: string): string {
  return buildWhatsAppLink(buildTripInquiryMessage(trip, locale));
}

/** Simple WhatsApp open link with optional plain-text greeting. */
export function plainWhatsAppLink(message?: string): string {
  if (!message) return `https://wa.me/${PHONE}`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}
