'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { api } from './api';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'EDITOR';
}

interface AdminCtx {
  user: AdminUser | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AdminCtx | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('lotus_token') : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.get<{ user: { sub: number; email: string; role: AdminUser['role'] } }>(
        '/auth/me',
        { token: stored },
      );
      setUser({ id: data.user.sub, email: data.user.email, name: data.user.email, role: data.user.role });
      setToken(stored);
    } catch {
      localStorage.removeItem('lotus_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ user: AdminUser; accessToken: string }>('/auth/login', { email, password });
    localStorage.setItem('lotus_token', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    router.push('/admin/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('lotus_token');
    setUser(null);
    setToken(null);
    router.push('/admin/login');
  };

  return <Ctx.Provider value={{ user, loading, token, login, logout }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

export function useAdminApi() {
  const { token } = useAdminAuth();
  return {
    get: <T,>(p: string) => api.get<T>(p, { token: token || undefined }),
    post: <T,>(p: string, body?: unknown) => api.post<T>(p, body, { token: token || undefined }),
    patch: <T,>(p: string, body?: unknown) => api.patch<T>(p, body, { token: token || undefined }),
    delete: <T,>(p: string) => api.delete<T>(p, { token: token || undefined }),
    upload: async <T,>(p: string, formData: FormData) => {
      return api.post<T>(p, formData, { token: token || undefined });
    },
  };
}
