# Lottus Sharm — Frontend

Next.js 15 (App Router) + TypeScript + Tailwind + next-intl. Public site in 4 languages (AR/EN/RU/IT) and a full Arabic admin dashboard.

## Quick start

```bash
npm install
cp .env.example .env       # set NEXT_PUBLIC_API_URL
npm run dev
# → http://localhost:3000/ar
```

The home page reads from the backend at `NEXT_PUBLIC_API_URL`. Make sure the backend is running first.

## Project structure

```
src/
├── app/
│   ├── layout.tsx                       # root layout (font loader only)
│   ├── sitemap.ts                       # dynamic sitemap (4 langs × all trips/posts)
│   ├── robots.ts
│   └── [locale]/
│       ├── layout.tsx                   # NextIntl provider + dir/lang
│       ├── (public)/                    # public route group
│       │   ├── layout.tsx               # Header + Footer + WhatsAppFAB
│       │   ├── page.tsx                 # Home
│       │   ├── trips/                   # listing + [slug]
│       │   ├── booking/                 # start | success | cancel
│       │   ├── about/ gallery/ contact/ blog/ privacy/ terms/
│       └── admin/                       # Arabic admin (RTL)
│           ├── layout.tsx               # AdminAuthProvider + Shell
│           ├── login/
│           ├── dashboard/
│           ├── trips/                   # CRUD + AI translate
│           ├── blog/ pages/ media/
│           ├── bookings/ payments/ coupons/ customers/
│           ├── reviews/ inquiries/ newsletter/ settings/ users/
├── components/{public,admin,ui}/        # split per area
├── i18n/{routing,request}.ts            # next-intl configuration
├── lib/{api,utils,admin-auth,site-settings}.ts
└── types/api.ts
messages/{ar,en,ru,it}.json              # static UI strings
```

## i18n

- Routing: `/[locale]/...`, default `ar`. RTL is auto-applied for `ar`.
- Translation files: `messages/{locale}.json` (static UI). DB content is fetched per-locale via `/api/public/...?locale=AR`.
- Switch language via `LanguageSwitcher` (header).

## Admin dashboard

Reachable at `/{locale}/admin/login`. Once logged in, JWT is stored in `localStorage` as `lottus_token`. The shell redirects unauthenticated users back to `/admin/login`.

Admin features:
- **Trips** (`/admin/trips`) — full CRUD with 4-language tabs and a one-click **"ترجم للباقي"** button that calls the backend AI translate endpoint to fill EN/RU/IT from the Arabic input. Highlights and bullet lists also support per-item translate.
- **Bookings** — list/filter/search, change status, link to customer WhatsApp.
- **Payments** — review screenshots for manual payments, confirm → marks booking PAID + sends confirmation email.
- **Coupons** — CRUD discount codes (PERCENT / FIXED), usage tracking.
- **Media library** — bulk upload (Sharp generates 3 sizes automatically), shared across trips/blog.
- **Blog / Pages** — rich content editor (HTML), per-language tabs, AI translate, SEO meta fields.
- **Settings** — company name + tagline (×4 lang), socials, payment info, brand colors.
- **Reviews / Inquiries / Newsletter / Users** — operational tools.

## Deployment

CI/CD via `.github/workflows/deploy.yml`. Required secrets:
- `HOST`, `SSH_USER`, `SSH_PORT`, `SSH_KEY`
- `PUBLIC_API_URL` — e.g. `https://lottussharm.com/api`
- `API_INTERNAL_URL` — usually `http://127.0.0.1:4000/api` for SSR
- `SITE_URL` — e.g. `https://lottussharm.com`
- `STRIPE_PUBLISHABLE_KEY`, `GA_ID`

### Nginx reverse proxy (sample)
```nginx
server {
  listen 443 ssl http2;
  server_name lottussharm.com www.lottussharm.com;

  ssl_certificate     /etc/letsencrypt/live/lottussharm.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/lottussharm.com/privkey.pem;

  location /api/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  location /uploads/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_cache_valid 200 30d;
  }
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Tech stack

Next.js 15 · React 19 · TypeScript · Tailwind 3 · next-intl 3 · Radix UI · Stripe.js · React Query · Sonner · Lucide
