// Lottus Sharm — combined server template.
// scripts/post-build.js prepends this content to .next/standalone/server.js so
// Express backend gets mounted alongside Next.js inside a single Node process.
// Also exposes the Express app on globalThis.__lottus_express__ so the
// Next.js SSR layer can call it directly (no HTTP loopback deadlock).
// =====================================================================
// >>> LOTUS COMBINED-SERVER PATCH BEGIN >>>
(() => {
  const path = require('path');
  const fs = require('fs');
  const http = require('http');

  const BACKEND_DIR = '/home/u405809647/lottus-backend';
  const BACKEND_DIST = path.join(BACKEND_DIR, 'dist');

  // Load backend .env into process.env
  try {
    const envFile = fs.readFileSync(path.join(BACKEND_DIR, '.env'), 'utf-8');
    for (const line of envFile.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx < 0) continue;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
    console.log('[combined] backend .env loaded');
  } catch (e) {
    console.warn('[combined] backend .env not loaded:', e.message);
  }

  process.env.UPLOAD_DIR = path.join(BACKEND_DIR, 'uploads');

  let expressApp = null;
  try {
    const mod = require(path.join(BACKEND_DIST, 'app.js'));
    expressApp = (mod.buildApp || mod.default || (() => null))();
    // Expose for direct SSR invocation (avoids loopback deadlock under Passenger)
    globalThis.__lottus_express__ = expressApp;
    console.log('[combined] Express backend mounted (' + (expressApp ? 'OK' : 'NOT LOADED') + ')');
  } catch (e) {
    console.error('[combined] FAILED to load Express backend:', e && (e.stack || e.message || e));
  }

  function isApiPath(url) {
    return (
      url === '/api' || url.startsWith('/api/') ||
      url === '/uploads' || url.startsWith('/uploads/') ||
      url.startsWith('/webhooks')
    );
  }

  const _origCreateServer = http.createServer;
  http.createServer = function patchedCreate(...args) {
    let handler;
    let opts;
    if (args.length === 1 && typeof args[0] === 'function') {
      handler = args[0];
    } else if (args.length === 1 && typeof args[0] === 'object') {
      opts = args[0];
    } else if (args.length >= 2) {
      opts = args[0];
      handler = args[1];
    }
    const wrapped = function (req, res) {
      try {
        if (expressApp && req.url && isApiPath(req.url)) {
          return expressApp(req, res);
        }
      } catch (err) {
        console.error('[combined] express error:', err);
      }
      if (handler) return handler.call(this, req, res);
      res.statusCode = 404;
      res.end('Not found');
    };
    const srv = _origCreateServer.apply(this, opts ? [opts, wrapped] : [wrapped]);
    console.log('[combined] http.createServer intercepted');
    return srv;
  };
})();
// <<< LOTUS COMBINED-SERVER PATCH END <<<
// =====================================================================
