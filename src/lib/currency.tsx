'use client';

/**
 * Currency context + helpers.
 *
 * - Stores the selected currency in localStorage.
 * - Fetches live exchange rates from open.er-api.com (free, no API key, ECB-sourced).
 *   Rates are keyed on EGP since most local trip prices are stored in EGP.
 * - Caches rates for 6 hours in localStorage so users only fetch once per session.
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export type CurrencyCode = 'EGP' | 'USD' | 'EUR' | 'GBP' | 'RUB';

interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  symbolLeft: boolean;        // true = $100, false = 100 ج.م
  arName: string;
  enName: string;
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  EGP: { code: 'EGP', symbol: 'ج.م',  symbolLeft: false, arName: 'جنيه مصري',    enName: 'EGP', flag: '🇪🇬' },
  USD: { code: 'USD', symbol: '$',    symbolLeft: true,  arName: 'دولار أمريكي',  enName: 'USD', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€',    symbolLeft: true,  arName: 'يورو',          enName: 'EUR', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£',    symbolLeft: true,  arName: 'جنيه إسترليني', enName: 'GBP', flag: '🇬🇧' },
  RUB: { code: 'RUB', symbol: '₽',    symbolLeft: false, arName: 'روبل روسي',     enName: 'RUB', flag: '🇷🇺' },
};

const STORAGE_KEY = 'lotus_currency';
const RATES_KEY = 'lotus_currency_rates_v2';
const RATES_TTL_MS = 6 * 60 * 60 * 1000; // 6h

// Conservative fallback rates (against EGP) used until the live API responds.
// These are ballpark values; the live rates override them on first fetch.
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  EGP: 1,
  USD: 0.020,   // 1 EGP ≈ 0.02 USD (= ~50 EGP/USD)
  EUR: 0.018,
  GBP: 0.015,
  RUB: 1.85,
};

interface RatesEnvelope {
  base: 'EGP';
  rates: Record<CurrencyCode, number>;
  fetchedAt: number;
  source: 'live' | 'fallback';
}

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  ratesUpdatedAt: number | null;
  convert: (amount: number, from: CurrencyCode) => number;
  format: (amount: number, from: CurrencyCode) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function defaultCurrencyForLocale(locale: string): CurrencyCode {
  switch (locale) {
    case 'en': return 'USD';
    case 'ru': return 'RUB';
    case 'it': return 'EUR';
    case 'ar':
    default:   return 'EGP';
  }
}

function readStoredCurrency(): CurrencyCode | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v && v in CURRENCIES) return v as CurrencyCode;
  } catch {/* ignore */}
  return null;
}

function readCachedRates(): RatesEnvelope | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(RATES_KEY);
    if (!raw) return null;
    const env = JSON.parse(raw) as RatesEnvelope;
    if (Date.now() - env.fetchedAt > RATES_TTL_MS) return null;
    return env;
  } catch {
    return null;
  }
}

async function fetchLiveRates(): Promise<RatesEnvelope> {
  // open.er-api.com supports CORS, free, no key. Updated daily.
  // 1 EGP = X target currency.
  const res = await fetch('https://open.er-api.com/v6/latest/EGP', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('rates http ' + res.status);
  const data = await res.json() as { result?: string; rates?: Record<string, number> };
  if (data.result !== 'success' || !data.rates) throw new Error('rates bad payload');
  const out: Record<CurrencyCode, number> = { ...FALLBACK_RATES };
  for (const k of Object.keys(CURRENCIES) as CurrencyCode[]) {
    if (typeof data.rates[k] === 'number') out[k] = data.rates[k];
  }
  return { base: 'EGP', rates: out, fetchedAt: Date.now(), source: 'live' };
}

export function CurrencyProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(defaultCurrencyForLocale(locale));
  const [env, setEnv] = useState<RatesEnvelope>({
    base: 'EGP',
    rates: FALLBACK_RATES,
    fetchedAt: 0,
    source: 'fallback',
  });

  // Initial hydration — read from storage, fetch rates if stale
  useEffect(() => {
    const stored = readStoredCurrency();
    if (stored) setCurrencyState(stored);

    const cached = readCachedRates();
    if (cached) {
      setEnv(cached);
    } else {
      fetchLiveRates()
        .then((live) => {
          setEnv(live);
          try { window.localStorage.setItem(RATES_KEY, JSON.stringify(live)); } catch {/* ignore */}
        })
        .catch(() => {/* keep fallback */});
    }
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try { window.localStorage.setItem(STORAGE_KEY, c); } catch {/* ignore */}
  }, []);

  const convert = useCallback((amount: number, from: CurrencyCode): number => {
    if (from === currency) return amount;
    // Convert from `from` → EGP → currency
    const inEgp = from === 'EGP' ? amount : amount / env.rates[from];
    const out = currency === 'EGP' ? inEgp : inEgp * env.rates[currency];
    return out;
  }, [currency, env]);

  const format = useCallback((amount: number, from: CurrencyCode): string => {
    const converted = convert(amount, from);
    const meta = CURRENCIES[currency];
    // Round small currencies to 2 decimals; large (RUB) to whole
    const decimals = currency === 'RUB' ? 0 : converted < 100 ? 2 : 0;
    const num = converted.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return meta.symbolLeft ? `${meta.symbol}${num}` : `${num} ${meta.symbol}`;
  }, [convert, currency]);

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    setCurrency,
    rates: env.rates,
    ratesUpdatedAt: env.fetchedAt || null,
    convert,
    format,
  }), [currency, setCurrency, env, convert, format]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Safe default when used outside provider (e.g. SSR partial render)
    return {
      currency: 'EGP',
      setCurrency: () => {},
      rates: FALLBACK_RATES,
      ratesUpdatedAt: null,
      convert: (a) => a,
      format: (a, f) => {
        const meta = CURRENCIES[f] ?? CURRENCIES.EGP;
        return meta.symbolLeft ? `${meta.symbol}${a.toLocaleString()}` : `${a.toLocaleString()} ${meta.symbol}`;
      },
    };
  }
  return ctx;
}
