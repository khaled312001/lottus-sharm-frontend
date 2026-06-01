// Single source of truth for the EasyKash-backed payment options shown across
// the site (home EasyCash section + footer strip). Each entry points at the
// real official brand asset stored under /public/payment-icons/.

export type PaymentMethod = {
  name: string;
  src: string;
  /** Optional suffix shown after the logo (e.g. "6m" for NBE 6-month plan). */
  suffix?: string;
  /** True when this option is an instalment plan, false for one-shot payments. */
  installment?: boolean;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  // Pay now
  { name: 'Visa',          src: '/payment-icons/visa.svg' },
  { name: 'Mastercard',    src: '/payment-icons/mastercard.svg' },
  { name: 'Apple Pay',     src: '/payment-icons/applepay.svg' },
  { name: 'Meeza',         src: '/payment-icons/meeza.png' },
  { name: 'Mobile Wallet', src: '/payment-icons/vodafone-cash.png' },
  { name: 'Contact',       src: '/payment-icons/contact.png' },
  // Instalments
  { name: 'NBE 6m',        src: '/payment-icons/nbe.png',         suffix: '6m',  installment: true },
  { name: 'NBE 12m',       src: '/payment-icons/nbe.png',         suffix: '12m', installment: true },
  { name: 'NBE 18m',       src: '/payment-icons/nbe.png',         suffix: '18m', installment: true },
  { name: 'valU',          src: '/payment-icons/valu.png',                       installment: true },
  { name: 'Aman',          src: '/payment-icons/aman.png',                       installment: true },
  { name: 'Souhoola',      src: '/payment-icons/souhoola.png',                   installment: true },
  { name: 'Forsa',         src: '/payment-icons/forsa.png',                      installment: true },
  { name: 'Tru',           src: '/payment-icons/tru.png',                        installment: true },
  { name: 'Klivvr',        src: '/payment-icons/klivvr.png',                     installment: true },
];
