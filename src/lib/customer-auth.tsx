'use client';

/**
 * Customer auth context — wraps the public site. Stores the currently logged-in
 * customer (if any) in React state, exposing a hook for any component.
 *
 * The session itself lives in an httpOnly cookie set by the backend after the
 * Google OAuth code exchange. This context just fetches /api/auth/customer/me
 * once on mount and re-fetches on demand.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { API_BASE } from './api';

export interface CustomerSession {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string;
  country?: string | null;
  language?: string;
}

interface CtxValue {
  customer: CustomerSession | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<CtxValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/auth/customer/me`, { credentials: 'include' });
      if (!r.ok) { setCustomer(null); return; }
      const j = await r.json();
      setCustomer(j?.data || null);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/customer/logout`, { method: 'POST', credentials: 'include' });
    } catch {/* ignore */}
    setCustomer(null);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return <Ctx.Provider value={{ customer, loading, refresh, logout }}>{children}</Ctx.Provider>;
}

export function useCustomer(): CtxValue {
  const v = useContext(Ctx);
  if (!v) {
    return { customer: null, loading: false, refresh: async () => {}, logout: async () => {} };
  }
  return v;
}
