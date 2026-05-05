# Doha Plus Market — دوحة بلس

> Production-grade bilingual digital storefront for selling activation codes and digital products.

Built with **Next.js 16**, **TypeScript**, **Supabase**, and **MyFatoorah** payment gateway.

---

## Features

- 🌍 **Bilingual** — Full Arabic (RTL) and English (LTR) support via `next-intl`
- 💳 **MyFatoorah Payment** — Hosted redirect flow with server-side verification and webhook support
- 🔒 **AES-256-GCM Encryption** — Activation codes encrypted at rest
- 🗄️ **18 Database Tables** — Full PostgreSQL schema with RLS policies
- 👤 **Guest Checkout** — No account required, secure httpOnly cookie sessions
- 📱 **WhatsApp Notifications** — Cloud API integration (configurable)
- 🛡️ **RBAC Admin Dashboard** — Owner/Admin/Support/Analyst roles
- 📊 **Analytics & Audit Logs** — Full event tracking and change history
- ⚡ **Atomic Inventory** — `FOR UPDATE SKIP LOCKED` race-condition-safe code claiming
- 🎨 **Premium UI** — Glassmorphism, gradient animations, micro-interactions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Database | Supabase PostgreSQL + RLS |
| Auth | Supabase Auth (admin email/password) |
| Payments | MyFatoorah (hosted redirect) |
| Styling | Tailwind CSS v4 |
| i18n | next-intl |
| Package Manager | Yarn |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn
- Supabase project

### 1. Install Dependencies

```bash
yarn install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `MYFATOORAH_API_TOKEN` | MyFatoorah API token |
| `APP_ENCRYPTION_KEY` | 64-character hex key for AES-256 |
| `NEXT_PUBLIC_SITE_URL` | Your production domain |

### 3. Database Setup

Run the SQL migrations in your Supabase SQL Editor in order:

1. `src/db/migrations/001_schema.sql` — Tables, enums, functions
2. `src/db/migrations/002_rls_policies.sql` — Row Level Security
3. `src/db/migrations/003_storage.sql` — Storage buckets

### 4. Create First Admin

1. Go to Supabase Dashboard → Authentication → Users → Add User
2. Run `src/db/scripts/create_first_admin.sql` with the new user's UUID

### 5. Development

```bash
yarn dev
```

### 6. Production Build

```bash
yarn build
yarn start
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # Bilingual storefront pages
│   ├── admin/              # Admin dashboard
│   └── api/                # API routes (payment, auth)
├── components/
│   ├── admin/              # Admin dashboard components
│   ├── layout/             # Header, footer, containers
│   ├── marketing/          # Hero, features, FAQ, CTA
│   └── ui/                 # Design system (Button, Card, etc.)
├── db/
│   ├── migrations/         # SQL schema + RLS policies
│   └── scripts/            # Admin setup scripts
├── lib/
│   ├── env.ts              # Client-safe env validation
│   ├── env.server.ts       # Server-only env validation
│   ├── constants.ts        # App constants & TypeScript enums
│   ├── i18n/               # Internationalization config
│   ├── supabase/           # Supabase clients (client/server/admin)
│   └── server/
│       ├── encryption/     # AES-256-GCM + hashing utilities
│       └── services/       # Business logic
│           ├── admin/      # Admin auth & RBAC
│           ├── guest/      # Guest session management
│           ├── myfatoorah/ # Payment gateway integration
│           └── whatsapp/   # WhatsApp notifications
└── styles/
    └── globals.css         # Design tokens & utilities
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server (Turbopack) |
| `yarn build` | Production build |
| `yarn start` | Start production server |
| `yarn lint` | ESLint check |
| `yarn typecheck` | TypeScript type check |

---

## Deployment

Deploy to **Vercel**:

1. Push to GitHub
2. Import project in Vercel
3. Set all environment variables
4. Deploy

---

## Security

- All activation codes encrypted with AES-256-GCM
- Payment verification always done server-side
- Admin routes protected by Supabase Auth + RBAC
- Guest sessions use httpOnly secure cookies
- IP and user agent hashing for privacy
- Full audit trail for admin actions

---

## License

Proprietary — All rights reserved.
