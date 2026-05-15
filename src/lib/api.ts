// Axios-style API client.
// - On the SERVER inside the Hostinger combined Node process: invokes the
//   Express handler in-process via globalThis.__lottus_express__ (avoids
//   HTTP loopback deadlock under Passenger).
// - In the BROWSER: regular fetch to NEXT_PUBLIC_API_URL.

const isServer = typeof window === 'undefined';
const BROWSER_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'https://lotussharm.com/api';
const SERVER_FALLBACK_BASE =
  (typeof process !== 'undefined' && (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL)) ||
  'https://lotussharm.com/api';

export const API_BASE = isServer ? SERVER_FALLBACK_BASE : BROWSER_BASE;

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

interface RequestInit2 extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string;
}

// =====================================================================
// In-process Express invocation (server-side, same Node process)
// =====================================================================
type ExpressHandler = (req: unknown, res: unknown) => void;

function getInProcessExpress(): ExpressHandler | null {
  if (!isServer) return null;
  const g = globalThis as unknown as { __lottus_express__?: ExpressHandler };
  return g.__lottus_express__ || null;
}

interface MockResult {
  status: number;
  body: string;
  headers: Record<string, string>;
}

function invokeExpress(method: string, path: string, body?: unknown, token?: string): Promise<MockResult> {
  return new Promise((resolve, reject) => {
    const app = getInProcessExpress();
    if (!app) { reject(new Error('no in-process express')); return; }

    // Build mock req / res — Express's app(req, res) is a (req, res) handler
    // node:http IncomingMessage / ServerResponse are heavy; we use lightweight
    // duck-typed objects with the methods Express middleware actually touches.
    const bodyStr = body !== undefined ? JSON.stringify(body) : undefined;
    const headers: Record<string, string> = {
      host: 'lotussharm.com',
      'x-forwarded-proto': 'https',
      'user-agent': 'LottusSSR/1.0',
      accept: 'application/json',
    };
    if (bodyStr) {
      headers['content-type'] = 'application/json';
      headers['content-length'] = String(Buffer.byteLength(bodyStr));
    }
    if (token) headers.authorization = `Bearer ${token}`;

    const req = new (require('events').EventEmitter)();
    req.method = method;
    req.url = path;
    req.headers = headers;
    req.httpVersion = '1.1';
    req.complete = false;
    req.socket = { remoteAddress: '127.0.0.1', encrypted: true };
    req.connection = req.socket;
    // express.json() parses chunks; we'll push the body
    req.pipe = function () { return this; };
    req.unpipe = function () { return this; };
    req.setEncoding = function () { return this; };
    req.pause = function () { return this; };
    req.resume = function () { return this; };

    const chunks: Buffer[] = [];
    let statusCode = 200;
    const resHeaders: Record<string, string> = {};
    let ended = false;

    const res = new (require('events').EventEmitter)();
    res.statusCode = 200;
    res.headersSent = false;
    res.locals = {};
    res.setHeader = function (k: string, v: string) { resHeaders[k.toLowerCase()] = String(v); return this; };
    res.getHeader = function (k: string) { return resHeaders[k.toLowerCase()]; };
    res.removeHeader = function (k: string) { delete resHeaders[k.toLowerCase()]; };
    res.writeHead = function (code: number, h?: Record<string, string>) {
      statusCode = code; res.statusCode = code;
      if (h) for (const k of Object.keys(h)) resHeaders[k.toLowerCase()] = String(h[k]);
      res.headersSent = true;
      return this;
    };
    res.write = function (chunk: unknown) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      return true;
    };
    res.end = function (chunk?: unknown) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      if (ended) return;
      ended = true;
      res.headersSent = true;
      const body = Buffer.concat(chunks).toString('utf-8');
      resolve({ status: res.statusCode || statusCode, body, headers: resHeaders });
    };
    res.status = function (code: number) { res.statusCode = code; return this; };
    res.json = function (obj: unknown) {
      resHeaders['content-type'] = 'application/json';
      res.end(JSON.stringify(obj));
      return this;
    };
    res.send = function (data: unknown) {
      if (typeof data === 'object') res.json(data);
      else res.end(String(data));
      return this;
    };
    res.sendStatus = function (code: number) { res.statusCode = code; res.end(); return this; };

    // Hand to Express
    try { app(req, res); } catch (e) { reject(e); return; }

    // Emit the body so express.json() can parse it
    if (bodyStr) {
      setImmediate(() => {
        req.emit('data', Buffer.from(bodyStr));
        req.complete = true;
        req.emit('end');
      });
    } else {
      setImmediate(() => { req.complete = true; req.emit('end'); });
    }

    // Safety timeout
    setTimeout(() => {
      if (!ended) {
        ended = true;
        resolve({ status: 504, body: '{"ok":false,"error":{"code":"TIMEOUT","message":"in-process timeout"}}', headers: {} });
      }
    }, 8000);
  });
}

// =====================================================================
// Public request function
// =====================================================================
async function request<T>(path: string, init: RequestInit2 = {}): Promise<T> {
  const method = init.method || 'GET';

  // Server-side: try in-process Express first (avoids loopback deadlock)
  if (isServer && getInProcessExpress() && (path.startsWith('/auth') || path.startsWith('/public') || path.startsWith('/admin'))) {
    const apiPath = path.startsWith('/api') ? path : `/api${path}`;
    try {
      const r = await invokeExpress(method, apiPath, init.body, init.token);
      let json: ApiResponse<T>;
      try { json = JSON.parse(r.body) as ApiResponse<T>; }
      catch { throw new Error(`Bad response (${r.status})`); }
      if (r.status >= 200 && r.status < 300 && json.ok) return json.data as T;
      throw new Error(json.error?.message || `Request failed (${r.status})`);
    } catch (err) {
      // Fall through to HTTP fetch as last resort
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[api] in-process call failed, falling back to fetch:', err);
      }
    }
  }

  const headers = new Headers(init.headers || {});
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (init.token) headers.set('Authorization', `Bearer ${init.token}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      method,
      headers,
      credentials: 'include',
      body: init.body instanceof FormData ? init.body : init.body ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
      signal: controller.signal,
    });
    let json: ApiResponse<T>;
    try { json = (await res.json()) as ApiResponse<T>; }
    catch { throw new Error(`Bad response (${res.status})`); }
    if (!res.ok || !json.ok) throw new Error(json.error?.message || `Request failed (${res.status})`);
    return json.data as T;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: <T>(p: string, init?: RequestInit2) => request<T>(p, { ...init, method: 'GET' }),
  post: <T>(p: string, body?: unknown, init?: RequestInit2) => request<T>(p, { ...init, method: 'POST', body }),
  patch: <T>(p: string, body?: unknown, init?: RequestInit2) => request<T>(p, { ...init, method: 'PATCH', body }),
  delete: <T>(p: string, init?: RequestInit2) => request<T>(p, { ...init, method: 'DELETE' }),
};
