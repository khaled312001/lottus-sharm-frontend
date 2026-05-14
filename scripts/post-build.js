#!/usr/bin/env node
/**
 * Lotus Sharm — post-build hook.
 *
 * Runs after `next build` completes (via the npm `postbuild` lifecycle).
 * Its job: take the Hostinger/Next-generated `.next/standalone/server.js` and
 * prepend our Express-mounting patch, so a SINGLE Node process serves
 * BOTH the Next.js frontend AND the Express backend (/api, /uploads, /webhooks).
 *
 * This is necessary because Hostinger's shared plan only allocates ONE Node.js
 * Application per domain (no separate subdomain Node app), so the backend has
 * to ride inside the frontend's Passenger process.
 *
 * When Hostinger redeploys (git pull → npm install → npm run build), this
 * script ALWAYS re-applies the patch — the site self-heals.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STANDALONE_SERVER = path.join(ROOT, '.next', 'standalone', 'server.js');
const PATCH_TEMPLATE = path.join(ROOT, 'combined-server-template.js');
const PATCH_MARKER = '>>> LOTUS COMBINED-SERVER PATCH BEGIN >>>';

function log(msg) {
  console.log(`[postbuild] ${msg}`);
}

function bail(msg) {
  console.error(`[postbuild] ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(STANDALONE_SERVER)) {
  log(`no standalone server.js at ${STANDALONE_SERVER} — skipping patch (no output:standalone build?)`);
  process.exit(0);
}

if (!fs.existsSync(PATCH_TEMPLATE)) {
  bail(`missing combined-server-template.js at ${PATCH_TEMPLATE}`);
}

const current = fs.readFileSync(STANDALONE_SERVER, 'utf-8');
if (current.includes(PATCH_MARKER)) {
  log('patch already applied — skipping prepend');
} else {
  const patch = fs.readFileSync(PATCH_TEMPLATE, 'utf-8');
  const patched = patch + '\n' + current;
  fs.writeFileSync(STANDALONE_SERVER, patched, 'utf-8');
  log(`✅ patched ${STANDALONE_SERVER} (now ${patched.length} bytes; original ${current.length})`);
}

// Next.js standalone output doesn't bundle public/ or .next/static — copy
// them so the standalone build is fully self-contained and Hostinger's deploy
// includes the static assets (hero slides, logo, etc.).
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
  return true;
}

const PUBLIC_SRC = path.join(ROOT, 'public');
const PUBLIC_DST = path.join(ROOT, '.next', 'standalone', 'public');
if (copyDir(PUBLIC_SRC, PUBLIC_DST)) {
  log(`✅ copied public/ → .next/standalone/public/`);
}

const STATIC_SRC = path.join(ROOT, '.next', 'static');
const STATIC_DST = path.join(ROOT, '.next', 'standalone', '.next', 'static');
if (copyDir(STATIC_SRC, STATIC_DST)) {
  log(`✅ copied .next/static → .next/standalone/.next/static`);
}
