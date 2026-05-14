// Axios-like API client (uses fetch). Server-side uses API_INTERNAL_URL, client-side uses NEXT_PUBLIC_API_URL.

const isServer = typeof window === 'undefined';
const BASE = isServer
  ? process.env.API_INTERNAL_URL || 'http://localhost:4000/api'
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

interface RequestInit2 extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, init: RequestInit2 = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (init.token) headers.set('Authorization', `Bearer ${init.token}`);

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    body: init.body instanceof FormData ? init.body : init.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new Error(`Bad response (${res.status})`);
  }
  if (!res.ok || !json.ok) {
    throw new Error(json.error?.message || `Request failed (${res.status})`);
  }
  return json.data as T;
}

export const api = {
  get: <T>(p: string, init?: RequestInit2) => request<T>(p, { ...init, method: 'GET' }),
  post: <T>(p: string, body?: unknown, init?: RequestInit2) => request<T>(p, { ...init, method: 'POST', body }),
  patch: <T>(p: string, body?: unknown, init?: RequestInit2) => request<T>(p, { ...init, method: 'PATCH', body }),
  delete: <T>(p: string, init?: RequestInit2) => request<T>(p, { ...init, method: 'DELETE' }),
};

export const API_BASE = BASE;
