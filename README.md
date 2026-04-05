# Yalla.House

**UK flat-fee property selling platform.** No commission, no agent. Sellers list directly on Rightmove & Zoopla and keep every pound.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend (prototype)** | Vanilla HTML5, CSS3 custom properties, ES5 JS |
| **Frontend (production)** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **i18n** | next-intl v3 — German-first (DE default, EN prefixed) |
| **Monorepo** | pnpm workspaces + Turborepo |
| **Background jobs** | Inngest |
| **Payments** | Stripe (Connect for referrer payouts) |
| **Icons** | Lucide |
| **Font** | Plus Jakarta Sans |

## Repository Layout

```
├── Website/                  ← Vanilla HTML/CSS/JS prototype (8 pages)
├── apps/
│   └── web/                  ← Next.js 14 production app
│       └── src/app/[locale]/ ← Route structure (DE-first i18n)
│           ├── (public)/     ← Unauthenticated pages
│           ├── owner/        ← Property owner dashboard
│           ├── hunter/       ← Home hunter dashboard
│           ├── agent/        ← Field agent dashboard
│           ├── admin/        ← Yalla admin dashboard
│           └── auth/         ← Authentication flow
├── packages/
│   ├── db/                   ← @yalla/db — Supabase types & client
│   ├── integrations/         ← @yalla/integrations — Portal sync, pricing
│   └── ui/                   ← @yalla/ui — Shared React components
├── supabase/
│   ├── migrations/           ← Database schema (30+ tables)
│   └── seed.sql              ← Development seed data
├── _business/                ← Branding, legal, business docs
├── .claude/                  ← AI agent rules, skills & config
│   ├── rules/                ← Code style, frontend, dashboard rules
│   └── skills/               ← 9 design & output skills
└── AGENTS.md                 ← Cross-tool agent instructions
```

## User Roles

| Role | Description |
|---|---|
| **Owner** | Property sellers — list, manage viewings, review offers |
| **Hunter** | Buyers & renters — browse, book viewings, submit offers |
| **Agent** | Field agents — manage assigned hunters, conduct viewings |
| **Partner** | Service providers — photography, surveys, energy certs |
| **Referrer** | Affiliate partners — earn per milestone |
| **Admin** | Platform operations |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Type-check
pnpm type-check

# Generate Supabase types
pnpm db:generate-types
```

## Environment Variables

Copy `.env.example` and fill in your keys:

```bash
cp .env.example .env.local
```

Required: Supabase URL/keys, Stripe keys, Inngest event key.

## Connected Services

| Service | Purpose |
|---|---|
| **Supabase** | Database, auth, storage, edge functions |
| **Stripe** | Payments, subscriptions, Connect payouts |
| **Inngest** | Background jobs (portal sync, referrals) |
| **Figma** | Design system (MCP-connected) |
| **Notion** | Project management (MCP-connected) |
| **Google Workspace** | Business docs (admin@yalla.house) |

## License

Private — all rights reserved.
