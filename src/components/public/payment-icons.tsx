/**
 * Branded payment-method icons. Each one is a self-contained SVG, no network
 * dependency. Colors match the official brand palettes so customers recognise
 * them instantly.
 */

interface IconProps { className?: string }

export function VodafoneCashIcon({ className }: IconProps) {
  // Vodafone red speech-mark; the "Cash" wordmark below is a single phrase
  return (
    <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Vodafone Cash">
      <circle cx="32" cy="32" r="32" fill="#E60000" />
      <path
        d="M32 50c-9.94 0-18-8.06-18-18 0-7.74 4.92-14.34 11.78-16.84-.12.94-.18 1.92-.18 2.9 0 6.86 4.42 12.66 10.5 14.7v.04C40.36 35.4 46 41.6 46 49.04c0 .32 0 .64-.02.94A17.9 17.9 0 0 1 32 50z"
        fill="#fff"
      />
    </svg>
  );
}

export function InstaPayIcon({ className }: IconProps) {
  // InstaPay logo approximation — purple gradient with rounded "i"
  return (
    <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="InstaPay">
      <defs>
        <linearGradient id="instapay-grad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#7B2CBF" />
          <stop offset="100%" stopColor="#5A189A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#instapay-grad)" />
      <path
        d="M20 22.5c0-1.4 1.1-2.5 2.5-2.5h19c1.4 0 2.5 1.1 2.5 2.5v.5c0 1.4-1.1 2.5-2.5 2.5h-3.4l-2.8 18.9c-.2 1.4-1.4 2.4-2.8 2.4h-3c-1.4 0-2.6-1-2.8-2.4l-2.4-17.4-3.8-1.5z"
        fill="#fff"
      />
      <circle cx="44" cy="20" r="4" fill="#FFD60A" />
    </svg>
  );
}

export function AdibBankIcon({ className }: IconProps) {
  // ADIB navy + gold accent
  return (
    <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="ADIB Bank">
      <rect width="64" height="64" rx="12" fill="#0B2E5C" />
      <path d="M14 30l18-12 18 12v3H14z" fill="#fff" />
      <rect x="17" y="33" width="4" height="14" fill="#fff" />
      <rect x="25" y="33" width="4" height="14" fill="#fff" />
      <rect x="33" y="33" width="4" height="14" fill="#fff" />
      <rect x="41" y="33" width="4" height="14" fill="#fff" />
      <rect x="13" y="48" width="38" height="3" rx="1" fill="#C9A86A" />
    </svg>
  );
}

export function IbanIcon({ className }: IconProps) {
  // Generic bank wire / IBAN icon — gold accent
  return (
    <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="IBAN">
      <rect width="64" height="64" rx="12" fill="#134949" />
      <text x="32" y="29" textAnchor="middle" fill="#C9A86A" fontSize="13" fontFamily="system-ui" fontWeight="800" letterSpacing="1">IBAN</text>
      <path d="M14 38h36v3H14zm0 6h28v2H14zm0 5h22v2H14z" fill="#C9A86A" opacity="0.85" />
    </svg>
  );
}

export function CashIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Cash">
      <rect width="64" height="64" rx="12" fill="#10796A" />
      <rect x="10" y="20" width="44" height="24" rx="3" fill="#85C7B6" />
      <circle cx="32" cy="32" r="7" fill="#10796A" stroke="#fff" strokeWidth="1.5" />
      <text x="32" y="36" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="system-ui" fontWeight="800">£</text>
      <rect x="13" y="23" width="4" height="4" rx="1" fill="#fff" opacity="0.4" />
      <rect x="47" y="37" width="4" height="4" rx="1" fill="#fff" opacity="0.4" />
    </svg>
  );
}

export function StripeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Card">
      <rect width="64" height="64" rx="12" fill="#635BFF" />
      <path
        d="M30.2 22.4c-3.6 0-6.6 1.9-6.6 5.6 0 5.6 8.4 4.7 8.4 7.2 0 .9-.8 1.4-2.1 1.4-1.7 0-4-.6-6-1.6v5c2 .8 4 1.2 6 1.2 3.7 0 6.8-1.7 6.8-5.5 0-6-8.5-5.1-8.5-7.4 0-.8.7-1.2 1.9-1.2 1.7 0 3.8.5 5.4 1.3v-4.8c-1.7-.7-3.4-1.2-5.3-1.2z"
        fill="#fff"
      />
    </svg>
  );
}
