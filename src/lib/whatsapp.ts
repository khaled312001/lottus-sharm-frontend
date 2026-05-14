import type { TripDTO } from '@/types/api';

const PHONE = '201090767278';

export function buildTripBookingMessage(opts: {
  trip: TripDTO;
  locale: string;
  date?: string;
  adults?: number;
  children?: number;
  isLocal?: boolean;
  fullName?: string;
  phone?: string;
  notes?: string;
}): string {
  const { trip, locale, date, adults = 0, children = 0, isLocal, fullName, phone, notes } = opts;
  const isAr = locale === 'ar';
  const tr = trip.tr || trip.translations.find((x) => x.locale === 'AR') || trip.translations[0];

  const unit = isLocal ? Number(trip.priceLocalEGP) : Number(trip.priceForeignUSD);
  const symbol = isLocal ? 'ج.م' : '$';
  const childPrice = unit * (1 - trip.childDiscount / 100);
  const total = adults * unit + children * childPrice;
  const link = `https://lotussharm.com/${locale}/trips/${trip.slug}`;

  if (isAr) {
    const lines: string[] = [
      '✨ *طلب حجز جديد — لوتس شرم*',
      '',
      `🌴 *الرحلة:* ${tr?.title || trip.slug}`,
      `🔗 *رابط الرحلة:* ${link}`,
    ];
    if (date) lines.push(`📅 *تاريخ الرحلة:* ${date}`);
    if (adults || children) lines.push(`👥 *العدد:* ${adults} بالغ${children ? ` + ${children} طفل` : ''}`);
    if (fullName) lines.push(`🧑 *الاسم:* ${fullName}`);
    if (phone) lines.push(`📞 *التليفون:* ${phone}`);
    if (total > 0) lines.push(`💰 *الإجمالي التقريبي:* ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${symbol}`);
    if (notes) lines.push('', `📝 *ملاحظات:* ${notes}`);
    lines.push('', '_تم الطلب من موقع لوتس شرم — في انتظار التأكيد._');
    return lines.join('\n');
  }

  const lines: string[] = [
    '✨ *New booking — Lotus Sharm*',
    '',
    `🌴 *Trip:* ${tr?.title || trip.slug}`,
    `🔗 *Link:* ${link}`,
  ];
  if (date) lines.push(`📅 *Date:* ${date}`);
  if (adults || children) lines.push(`👥 *Guests:* ${adults} adult${adults !== 1 ? 's' : ''}${children ? ` + ${children} children` : ''}`);
  if (fullName) lines.push(`🧑 *Name:* ${fullName}`);
  if (phone) lines.push(`📞 *Phone:* ${phone}`);
  if (total > 0) lines.push(`💰 *Estimated total:* ${symbol}${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
  if (notes) lines.push('', `📝 *Notes:* ${notes}`);
  lines.push('', '_Sent from the Lotus Sharm website — awaiting confirmation._');
  return lines.join('\n');
}

export function buildTripInquiryMessage(trip: TripDTO, locale: string): string {
  const isAr = locale === 'ar';
  const tr = trip.tr || trip.translations.find((x) => x.locale === 'AR') || trip.translations[0];
  const link = `https://lotussharm.com/${locale}/trips/${trip.slug}`;
  if (isAr) {
    return `مرحباً 👋\nأرغب في الاستفسار عن:\n\n🌴 *${tr?.title}*\n🔗 ${link}\n\nأنتظر تفاصيل وأسعار الرحلة، شكراً.`;
  }
  return `Hello 👋\nI'd like to inquire about:\n\n🌴 *${tr?.title}*\n🔗 ${link}\n\nPlease share details and prices. Thank you.`;
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
