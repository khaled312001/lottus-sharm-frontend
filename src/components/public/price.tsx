'use client';

import { useCurrency, type CurrencyCode } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface PriceProps {
  /** Amount in the source currency. */
  amount: number;
  /** Currency the `amount` is denominated in. Defaults to EGP. */
  from?: CurrencyCode;
  /** Optional className for the wrapping span. */
  className?: string;
  /** Show currency code on hover via title. */
  showOriginal?: boolean;
}

/**
 * Live-converted price display. Reads the user's selected currency from
 * CurrencyContext and converts the amount on the fly.
 */
export function Price({ amount, from = 'EGP', className, showOriginal }: PriceProps) {
  const { format } = useCurrency();
  const txt = format(amount, from);
  const title = showOriginal ? `${amount.toLocaleString()} ${from}` : undefined;
  return (
    <span className={cn('tabular-nums', className)} title={title}>
      {txt}
    </span>
  );
}
