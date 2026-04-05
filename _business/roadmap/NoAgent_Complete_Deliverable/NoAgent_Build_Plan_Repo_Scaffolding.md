# NoAgent — Implementation Blueprint & Repo Scaffolding

## Prompt 2 Deliverable: Build Plan for Immediate Dev Execution

---

## 1. Mono-Repo Structure

We use **Turborepo** as the monorepo orchestrator. It gives us incremental builds, task caching, parallel execution, and a clear dependency graph — all without the weight of Nx. Package manager: **pnpm** (strict dependency hoisting, faster installs, disk-efficient).

```
noagent/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # PR checks (lint, typecheck, test, scan)
│   │   ├── deploy-staging.yml        # Auto-deploy to staging on merge to main
│   │   ├── deploy-production.yml     # Manual promote to production
│   │   └── scheduled-scans.yml       # Weekly dependency + DAST scans
│   ├── CODEOWNERS
│   └── pull_request_template.md
│
├── apps/
│   ├── web/                          # Next.js 14 App Router — public site + seller/buyer dashboards
│   │   ├── app/
│   │   │   ├── (public)/             # Route group: marketing pages (SSG)
│   │   │   │   ├── page.tsx          # Homepage
│   │   │   │   ├── how-it-works/
│   │   │   │   ├── pricing/
│   │   │   │   └── sell-property-in/
│   │   │   │       └── [area]/       # Programmatic SEO pages (ISR)
│   │   │   │           └── page.tsx
│   │   │   ├── (auth)/               # Route group: auth pages
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── verify/
│   │   │   ├── (dashboard)/          # Route group: authenticated user dashboards
│   │   │   │   ├── layout.tsx        # Sidebar + auth guard
│   │   │   │   ├── listings/
│   │   │   │   │   ├── page.tsx      # My listings
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx  # Multi-step listing creator
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx  # Listing management
│   │   │   │   │       ├── enquiries/
│   │   │   │   │       ├── viewings/
│   │   │   │   │       └── offers/
│   │   │   │   ├── inbox/
│   │   │   │   ├── viewings/
│   │   │   │   ├── deals/
│   │   │   │   │   └── [id]/         # Deal Room
│   │   │   │   ├── services/
│   │   │   │   ├── billing/
│   │   │   │   └── settings/
│   │   │   ├── property/
│   │   │   │   └── [slug]/           # Public listing page (SSR)
│   │   │   │       └── page.tsx
│   │   │   ├── search/               # Marketplace search
│   │   │   │   └── page.tsx
│   │   │   ├── api/                  # Next.js API routes (BFF layer)
│   │   │   │   └── [...trpc]/        # tRPC handler (see Section 5)
│   │   │   │       └── route.ts
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                   # Design system primitives (Button, Input, Modal, etc.)
│   │   │   ├── listings/             # Listing-specific components
│   │   │   ├── deals/                # Deal Room components
│   │   │   ├── messaging/
│   │   │   ├── maps/                 # Map + geo components
│   │   │   └── layouts/              # Shell, Sidebar, Header
│   │   ├── lib/
│   │   │   ├── trpc.ts              # tRPC client setup
│   │   │   └── utils.ts
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── admin/                        # Separate Next.js app — admin console
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── moderation/
│   │   │   │   ├── users/
│   │   │   │   ├── listings/
│   │   │   │   ├── disputes/
│   │   │   │   ├── jurisdictions/
│   │   │   │   ├── audit-logs/
│   │   │   │   └── analytics/
│   │   │   └── api/[...trpc]/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── workers/                      # Background job processors (Node.js / BullMQ)
│       ├── src/
│       │   ├── index.ts              # Worker entry point — registers all queues
│       │   ├── queues/
│       │   │   ├── email.queue.ts
│       │   │   ├── sms.queue.ts
│       │   │   ├── media.queue.ts
│       │   │   ├── risk.queue.ts
│       │   │   ├── viewing-reminder.queue.ts
│       │   │   ├── deal-nudge.queue.ts
│       │   │   ├── referencing.queue.ts
│       │   │   ├── verification.queue.ts
│       │   │   ├── search-index.queue.ts
│       │   │   ├── payout.queue.ts
│       │   │   └── listing-expire.queue.ts
│       │   ├── processors/           # Handler functions per queue
│       │   │   ├── email.processor.ts
│       │   │   ├── sms.processor.ts
│       │   │   ├── media.processor.ts
│       │   │   └── ...
│       │   ├── cron/                 # Cron job definitions
│       │   │   ├── viewing-reminders.cron.ts
│       │   │   ├── deal-nudges.cron.ts
│       │   │   ├── listing-expiry.cron.ts
│       │   │   └── payout-scan.cron.ts
│       │   └── lib/
│       │       ├── redis.ts
│       │       └── logger.ts
│       ├── Dockerfile
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── db/                           # Prisma schema + migrations + client
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Single source of truth for data model
│   │   │   ├── migrations/           # Versioned SQL migrations
│   │   │   │   ├── 20260201000000_init/
│   │   │   │   │   └── migration.sql
│   │   │   │   ├── 20260208000000_add_offers/
│   │   │   │   │   └── migration.sql
│   │   │   │   └── ...
│   │   │   └── seed.ts               # Seed script (see Section 9)
│   │   ├── src/
│   │   │   ├── index.ts              # Re-exports Prisma client
│   │   │   └── types.ts              # Generated + custom types
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/                          # tRPC router definitions (shared between web + admin)
│   │   ├── src/
│   │   │   ├── root.ts              # Root router (merges all sub-routers)
│   │   │   ├── trpc.ts              # tRPC init, context, middleware
│   │   │   ├── routers/
│   │   │   │   ├── auth.router.ts
│   │   │   │   ├── listing.router.ts
│   │   │   │   ├── enquiry.router.ts
│   │   │   │   ├── message.router.ts
│   │   │   │   ├── viewing.router.ts
│   │   │   │   ├── offer.router.ts
│   │   │   │   ├── application.router.ts
│   │   │   │   ├── dealRoom.router.ts
│   │   │   │   ├── marketplace.router.ts
│   │   │   │   ├── billing.router.ts
│   │   │   │   ├── review.router.ts
│   │   │   │   ├── verification.router.ts
│   │   │   │   ├── moderation.router.ts   # Admin-only
│   │   │   │   └── analytics.router.ts    # Admin-only
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts      # JWT verification
│   │   │   │   ├── rbac.middleware.ts      # Role + resource access checks
│   │   │   │   ├── rateLimit.middleware.ts
│   │   │   │   └── audit.middleware.ts     # Audit log writer
│   │   │   ├── services/                  # Business logic layer
│   │   │   │   ├── listing.service.ts
│   │   │   │   ├── offer.service.ts
│   │   │   │   ├── dealRoom.service.ts
│   │   │   │   ├── pricing.service.ts
│   │   │   │   ├── risk.service.ts
│   │   │   │   ├── media.service.ts
│   │   │   │   └── ...
│   │   │   └── lib/
│   │   │       ├── errors.ts              # Typed error classes
│   │   │       ├── validators.ts          # Zod schemas (shared input validation)
│   │   │       └── constants.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── shared/                       # Shared types, utils, constants
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── listing.types.ts
│   │   │   │   ├── user.types.ts
│   │   │   │   ├── offer.types.ts
│   │   │   │   ├── dealRoom.types.ts
│   │   │   │   ├── enums.ts            # All enums (ListingStatus, OfferStatus, etc.)
│   │   │   │   └── index.ts
│   │   │   ├── validators/
│   │   │   │   ├── listing.schema.ts    # Zod schemas used by both client + server
│   │   │   │   ├── offer.schema.ts
│   │   │   │   ├── application.schema.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   │   ├── currency.ts
│   │   │   │   ├── dates.ts
│   │   │   │   ├── slugify.ts
│   │   │   │   ├── pricing.ts
│   │   │   │   └── permissions.ts       # Permission check helpers
│   │   │   └── constants/
│   │   │       ├── jurisdictions.ts
│   │   │       ├── milestones.ts
│   │   │       └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── email/                        # Email template rendering
│   │   ├── src/
│   │   │   ├── templates/
│   │   │   │   ├── welcome.tsx        # React Email templates
│   │   │   │   ├── enquiry-received.tsx
│   │   │   │   ├── viewing-reminder.tsx
│   │   │   │   ├── offer-received.tsx
│   │   │   │   ├── deal-room-created.tsx
│   │   │   │   └── ...
│   │   │   ├── render.ts             # Template → HTML renderer
│   │   │   └── send.ts               # Postmark/SendGrid send wrapper
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── config/                       # Shared config (ESLint, TS base, Tailwind preset)
│       ├── eslint/
│       │   └── base.js
│       ├── typescript/
│       │   └── base.json
│       ├── tailwind/
│       │   └── preset.ts
│       └── package.json
│
├── infra/
│   ├── terraform/                    # Infrastructure as Code
│   │   ├── environments/
│   │   │   ├── staging/
│   │   │   │   ├── main.tf
│   │   │   │   └── terraform.tfvars
│   │   │   └── production/
│   │   │       ├── main.tf
│   │   │       └── terraform.tfvars
│   │   ├── modules/
│   │   │   ├── rds/                  # PostgreSQL (RDS)
│   │   │   ├── redis/                # ElastiCache
│   │   │   ├── s3/                   # File storage + CDN
│   │   │   ├── ecs/                  # Worker processes
│   │   │   ├── secrets/              # Secrets Manager
│   │   │   └── monitoring/           # CloudWatch alarms
│   │   └── backend.tf               # Remote state (S3 + DynamoDB lock)
│   ├── docker/
│   │   ├── docker-compose.yml        # Local dev (Postgres + Redis + MinIO)
│   │   ├── docker-compose.test.yml   # CI test environment
│   │   └── Dockerfile.workers        # Worker container
│   └── scripts/
│       ├── setup-local.sh            # One-command local setup
│       ├── seed-db.sh
│       ├── reset-db.sh
│       └── generate-migration.sh
│
├── docs/
│   ├── architecture/
│   │   └── overview.md
│   ├── api/
│   │   └── openapi.yaml
│   ├── runbooks/
│   │   ├── deploy-rollback.md
│   │   └── incident-response.md
│   ├── playbooks/
│   │   ├── moderation.md
│   │   └── support.md
│   └── adr/                          # Architecture Decision Records
│       ├── 001-trpc-over-rest.md
│       ├── 002-prisma-orm.md
│       ├── 003-turborepo.md
│       └── 004-clerk-auth.md
│
├── turbo.json                        # Turborepo pipeline config
├── pnpm-workspace.yaml
├── package.json                      # Root — scripts + devDependencies
├── .env.example                      # Template for local env vars
├── .gitignore
├── .nvmrc                            # Node version (20 LTS)
└── README.md
```

---

## 2. Local Dev Setup

### Prerequisites

- Node.js 20 LTS (enforced via `.nvmrc` + `engines` in `package.json`)
- pnpm 9+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- Docker Desktop (for local Postgres, Redis, MinIO)

### One-Command Setup

```bash
#!/usr/bin/env bash
# infra/scripts/setup-local.sh

set -euo pipefail

echo "=== NoAgent Local Dev Setup ==="

# 1. Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js required. Install via nvm."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm required. Run: corepack enable"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker required."; exit 1; }

# 2. Install dependencies
echo "Installing dependencies..."
pnpm install

# 3. Copy env template
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from template — fill in your API keys."
fi

# 4. Start infrastructure (Postgres 16 + Redis 7 + MinIO)
echo "Starting local infrastructure..."
docker compose -f infra/docker/docker-compose.yml up -d

# 5. Wait for Postgres to be ready
echo "Waiting for Postgres..."
until docker compose -f infra/docker/docker-compose.yml exec -T postgres pg_isready -U noagent; do
  sleep 1
done

# 6. Run database migrations
echo "Running migrations..."
pnpm --filter @noagent/db db:migrate:dev

# 7. Seed database
echo "Seeding database..."
pnpm --filter @noagent/db db:seed

# 8. Generate Prisma client
echo "Generating Prisma client..."
pnpm --filter @noagent/db db:generate

echo ""
echo "=== Setup complete ==="
echo "Run 'pnpm dev' to start all apps."
echo "  Web:    http://localhost:3000"
echo "  Admin:  http://localhost:3001"
echo "  DB:     postgresql://noagent:noagent@localhost:5432/noagent"
echo "  Redis:  redis://localhost:6379"
echo "  MinIO:  http://localhost:9000 (access: minioadmin / minioadmin)"
```

### docker-compose.yml (Local Dev)

```yaml
# infra/docker/docker-compose.yml
version: "3.9"

services:
  postgres:
    image: postgis/postgis:16-3.4
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: noagent
      POSTGRES_PASSWORD: noagent
      POSTGRES_DB: noagent
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U noagent"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"  # Console
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - miniodata:/data

  # Create default buckets on startup
  minio-setup:
    image: minio/mc:latest
    depends_on:
      minio:
        condition: service_started
    entrypoint: >
      /bin/sh -c "
      sleep 3;
      mc alias set local http://minio:9000 minioadmin minioadmin;
      mc mb local/noagent-media --ignore-existing;
      mc mb local/noagent-documents --ignore-existing;
      mc anonymous set download local/noagent-media;
      "

volumes:
  pgdata:
  miniodata:
```

### .env.example

```bash
# Database
DATABASE_URL="postgresql://noagent:noagent@localhost:5432/noagent"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Storage (MinIO locally, S3 in production)
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_MEDIA_BUCKET="noagent-media"
S3_DOCUMENTS_BUCKET="noagent-documents"
CDN_URL="http://localhost:9000/noagent-media"  # CloudFront URL in prod

# Email (Postmark)
POSTMARK_API_KEY="test-api-key"
POSTMARK_FROM_EMAIL="noreply@noagent.com"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_FROM_NUMBER="+44..."

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Identity Verification (Onfido)
ONFIDO_API_KEY="api_sandbox_..."
ONFIDO_WEBHOOK_SECRET="..."

# Observability
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="sntrys_..."
LOG_LEVEL="debug"  # debug | info | warn | error

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"
NODE_ENV="development"
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "test:integration": {
      "dependsOn": ["^build"],
      "env": ["DATABASE_URL", "REDIS_URL"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "env": ["DATABASE_URL", "REDIS_URL", "NEXT_PUBLIC_APP_URL"]
    },
    "db:migrate:dev": {
      "cache": false
    },
    "db:generate": {},
    "db:seed": {
      "cache": false
    }
  }
}
```

### Root package.json (scripts)

```json
{
  "name": "noagent",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "test:integration": "turbo test:integration",
    "test:e2e": "turbo test:e2e",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "clean": "turbo clean && rm -rf node_modules",
    "setup": "bash infra/scripts/setup-local.sh",
    "db:migrate": "pnpm --filter @noagent/db db:migrate:dev",
    "db:seed": "pnpm --filter @noagent/db db:seed",
    "db:studio": "pnpm --filter @noagent/db db:studio",
    "db:reset": "pnpm --filter @noagent/db db:reset"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

---

## 3. Database Migration Strategy

### Tool: Prisma Migrate

Chosen because it generates SQL migrations from the schema, supports team review workflows, and integrates natively with our Prisma ORM layer.

### Workflow

```
Developer creates/edits schema.prisma
        │
        ▼
pnpm db:migrate:dev --name "describe_change"
        │
        ├── Generates SQL migration file in prisma/migrations/
        ├── Applies migration to local dev DB
        └── Regenerates Prisma client
        │
        ▼
Developer reviews generated SQL, commits migration + schema change
        │
        ▼
PR review — reviewer checks both schema.prisma diff AND generated SQL
        │
        ▼
CI runs: prisma migrate deploy (applies pending migrations to test DB)
        │
        ▼
Merge to main → staging deploy runs prisma migrate deploy
        │
        ▼
Production promote → prisma migrate deploy against prod DB
```

### Migration Conventions

```
prisma/migrations/
├── 20260201000000_init/
│   └── migration.sql          # Initial schema: users, listings, core tables
├── 20260208000000_add_offers/
│   └── migration.sql          # Offer + negotiation tables
├── 20260215000000_add_deal_rooms/
│   └── migration.sql          # Deal room + milestones + stakeholders + documents
└── ...
```

**Naming convention:** `YYYYMMDDHHMMSS_descriptive_snake_case`

### Rules

1. **Never edit a deployed migration.** Create a new migration to alter/fix.
2. **Every migration must be reversible.** Write a companion `down.sql` for manual rollback (Prisma doesn't auto-generate rollbacks — store them alongside).
3. **No data mutations in schema migrations.** Data migrations (backfills) go in separate scripts in `prisma/data-migrations/` and are run explicitly.
4. **PostGIS extensions** initialised in the first migration:

```sql
-- 20260201000000_init/migration.sql (excerpt)
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- trigram index for fuzzy text search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

5. **Indexes are migration-concern, not afterthought.** Every migration that adds a query pattern also adds the supporting index.

### Prisma Schema Excerpt (Core Tables)

```prisma
// packages/db/prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions", "fullTextSearch"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis, pg_trgm, uuid_ossp(map: "uuid-ossp")]
}

enum UserRole {
  SELLER
  LANDLORD
  PORTFOLIO_LANDLORD
  BUYER
  TENANT
  DELEGATE
  PROVIDER
  VERIFIER
  SUPPORT
  TRUST_SAFETY
  ADMIN
}

enum VerificationTier {
  UNVERIFIED
  ID_VERIFIED
  OWNERSHIP_VERIFIED
  ENHANCED_VERIFIED
}

enum ListingType {
  SALE
  RENTAL
}

enum ListingStatus {
  DRAFT
  ACTIVE
  UNDER_OFFER
  LET_AGREED
  SOLD
  LET
  WITHDRAWN
  EXPIRED
}

enum OfferStatus {
  SUBMITTED
  VIEWED
  COUNTERED
  ACCEPTED
  REJECTED
  WITHDRAWN
  EXPIRED
}

model User {
  id                String            @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  clerkId           String            @unique @map("clerk_id")
  email             String            @unique
  phone             String?           @unique
  name              String
  roles             UserRole[]
  verificationTier  VerificationTier  @default(UNVERIFIED) @map("verification_tier")
  status            String            @default("active")  // active | suspended | banned
  jurisdictionId    String?           @map("jurisdiction_id") @db.VarChar(10)
  metadata          Json?
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")
  lastLoginAt       DateTime?         @map("last_login_at")

  listings          Listing[]
  enquiriesSent     Enquiry[]         @relation("EnquirySender")
  viewingsAsBuyer   Viewing[]         @relation("ViewingBuyer")
  viewingsAsSeller  Viewing[]         @relation("ViewingSeller")
  offersMade        Offer[]
  reviewsGiven      Review[]          @relation("ReviewAuthor")
  reviewsReceived   Review[]          @relation("ReviewSubject")
  auditLogs         AuditLog[]
  conversations     ConversationParticipant[]

  @@map("users")
}

model Listing {
  id                String          @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  ownerId           String          @map("owner_id") @db.Uuid
  type              ListingType
  status            ListingStatus   @default(DRAFT)
  jurisdictionId    String          @map("jurisdiction_id") @db.VarChar(10)

  // Address
  addressLine1      String          @map("address_line_1")
  addressLine2      String?         @map("address_line_2")
  city              String
  postcode          String
  countryCode       String          @map("country_code") @db.Char(2)
  latitude          Float?
  longitude         Float?

  // Property details
  propertyType      String          @map("property_type")
  tenure            String?
  bedrooms          Int             @db.SmallInt
  bathrooms         Int             @db.SmallInt
  receptions        Int             @default(0) @db.SmallInt
  areaSqft          Int?            @map("area_sqft")
  condition         String?
  features          String[]
  description       String

  // Pricing
  price             Int             // smallest currency unit
  pricingStrategy   String?         @map("pricing_strategy")
  pricingConfidence Int?            @map("pricing_confidence") @db.SmallInt
  verificationTier  VerificationTier @default(UNVERIFIED) @map("verification_tier")

  // Timestamps
  publishedAt       DateTime?       @map("published_at")
  expiresAt         DateTime?       @map("expires_at")
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")

  // Jurisdiction-specific data
  metadata          Json?

  // Relations
  owner             User            @relation(fields: [ownerId], references: [id])
  media             ListingMedia[]
  enquiries         Enquiry[]
  viewings          Viewing[]
  offers            Offer[]
  rentalDetails     RentalDetails?
  leaseholdDetails  LeaseholdDetails?

  @@index([ownerId])
  @@index([status, type])
  @@index([postcode])
  @@index([status, type, jurisdictionId])
  @@index([publishedAt])
  @@map("listings")
}

// ... additional models follow the same pattern from the Prompt 1 data model
```

---

## 4. RBAC Middleware Approach

### Architecture: Three-Layer Auth Stack

```
Request
  │
  ▼
Layer 1: isAuthenticated        — Verify JWT, attach user to context
  │
  ▼
Layer 2: requireRole(roles[])   — Check user has at least one required role
  │
  ▼
Layer 3: requireAccess(check)   — Resource-level ownership/permission check
  │
  ▼
Handler (router procedure)
```

### Implementation (tRPC Middleware)

```typescript
// packages/api/src/trpc.ts

import { initTRPC, TRPCError } from "@trpc/server";
import { type Context } from "./context";
import { type UserRole } from "@noagent/shared";
import { db } from "@noagent/db";

const t = initTRPC.context<Context>().create();

// ── Layer 1: Authentication ─────────────────────────────────────
export const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }

  const user = await db.user.findUnique({
    where: { clerkId: ctx.auth.userId },
    select: {
      id: true,
      email: true,
      name: true,
      roles: true,
      verificationTier: true,
      status: true,
      jurisdictionId: true,
    },
  });

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
  }

  if (user.status === "banned") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Account suspended" });
  }

  return next({ ctx: { ...ctx, user } });
});

// ── Layer 2: Role Check ─────────────────────────────────────────
export function requireRole(...allowedRoles: UserRole[]) {
  return t.middleware(async ({ ctx, next }) => {
    const user = ctx.user; // Set by isAuthenticated

    const hasRole = user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Requires one of: ${allowedRoles.join(", ")}`,
      });
    }

    return next({ ctx });
  });
}

// ── Layer 3: Resource Access Check ──────────────────────────────
export type AccessCheckFn = (ctx: {
  user: Context["user"];
  input: unknown;
  db: typeof db;
}) => Promise<boolean>;

export function requireAccess(checkFn: AccessCheckFn) {
  return t.middleware(async ({ ctx, input, next }) => {
    const allowed = await checkFn({ user: ctx.user!, input, db });

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied to this resource",
      });
    }

    return next({ ctx });
  });
}

// ── Audit Logger Middleware ─────────────────────────────────────
export function auditLog(action: string) {
  return t.middleware(async ({ ctx, input, next }) => {
    const result = await next({ ctx });

    // Fire-and-forget audit write (don't block response)
    if (ctx.user) {
      db.auditLog
        .create({
          data: {
            userId: ctx.user.id,
            action,
            targetType: extractTargetType(input),
            targetId: extractTargetId(input),
            ipAddress: ctx.ip,
            userAgent: ctx.userAgent,
            metadata: { input: sanitize(input) },
          },
        })
        .catch((err) => console.error("Audit log write failed:", err));
    }

    return result;
  });
}

// ── Procedure Builders ──────────────────────────────────────────
export const publicProcedure = t.procedure;

export const authedProcedure = t.procedure.use(isAuthenticated);

export const sellerProcedure = t.procedure
  .use(isAuthenticated)
  .use(requireRole("SELLER", "LANDLORD", "PORTFOLIO_LANDLORD", "DELEGATE", "ADMIN"));

export const adminProcedure = t.procedure
  .use(isAuthenticated)
  .use(requireRole("ADMIN", "TRUST_SAFETY"));
```

### Usage in Routers

```typescript
// packages/api/src/routers/listing.router.ts

import { z } from "zod";
import { router, sellerProcedure, authedProcedure, publicProcedure, requireAccess, auditLog } from "../trpc";
import { createListingSchema, updateListingSchema } from "@noagent/shared/validators";
import { listingService } from "../services/listing.service";

// ── Access check: user owns this listing (or is admin) ─────────
const ownsListing = requireAccess(async ({ user, input, db }) => {
  const { id } = input as { id: string };
  if (user.roles.includes("ADMIN")) return true;

  const listing = await db.listing.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!listing) return false;

  // Check direct ownership
  if (listing.ownerId === user.id) return true;

  // Check delegate access
  const delegate = await db.delegate.findFirst({
    where: {
      delegateId: user.id,
      delegatorId: listing.ownerId,
      active: true,
      OR: [
        { listingScope: { isEmpty: true } },    // all listings
        { listingScope: { has: id } },           // specific listing
      ],
    },
  });

  return !!delegate;
});

export const listingRouter = router({
  // Public: search listings
  search: publicProcedure
    .input(z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
      radiusKm: z.number().min(1).max(50).default(10),
      type: z.enum(["SALE", "RENTAL"]).optional(),
      priceMin: z.number().int().positive().optional(),
      priceMax: z.number().int().positive().optional(),
      bedroomsMin: z.number().int().min(0).optional(),
      propertyType: z.string().optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      return listingService.search(input);
    }),

  // Public: get listing by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      return listingService.getById(input.id);
    }),

  // Seller: create listing
  create: sellerProcedure
    .input(createListingSchema)
    .use(auditLog("listing.create"))
    .mutation(async ({ ctx, input }) => {
      return listingService.create(ctx.user.id, input);
    }),

  // Owner: update listing
  update: sellerProcedure
    .input(z.object({ id: z.string().uuid() }).merge(updateListingSchema))
    .use(ownsListing)
    .use(auditLog("listing.update"))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return listingService.update(id, data);
    }),

  // Owner: publish listing
  publish: sellerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .use(ownsListing)
    .use(auditLog("listing.publish"))
    .mutation(async ({ ctx, input }) => {
      return listingService.publish(input.id, ctx.user.id);
    }),

  // Owner: get enquiries for own listing
  getEnquiries: sellerProcedure
    .input(z.object({
      listingId: z.string().uuid(),
      status: z.enum(["new", "read", "responded", "archived", "spam"]).optional(),
    }))
    .use(requireAccess(async ({ user, input, db }) => {
      const { listingId } = input as { listingId: string };
      const listing = await db.listing.findUnique({
        where: { id: listingId },
        select: { ownerId: true },
      });
      return listing?.ownerId === user.id || user.roles.includes("ADMIN");
    }))
    .query(async ({ input }) => {
      return listingService.getEnquiries(input.listingId, input.status);
    }),
});
```

---

## 5. API Approach: tRPC — Justification

### Why tRPC over REST

| Factor | tRPC | REST |
|--------|------|------|
| **Type safety** | End-to-end from DB → API → client. Refactors propagate automatically. Zero runtime type mismatches. | Requires OpenAPI codegen or manual type sync. Drift is common. |
| **Developer velocity** | No API client generation step. Import router type → use it. | Need to maintain Swagger/OpenAPI, generate clients, keep in sync. |
| **Validation** | Zod schemas shared between client + server. Single source of truth. | Validation logic duplicated or requires codegen from OpenAPI. |
| **Monorepo fit** | Native — import types across packages. | Works but requires extra tooling for type sharing. |
| **Subscriptions** | Built-in WebSocket support for real-time messaging (Phase 2). | Need separate WebSocket implementation. |
| **External consumers** | Weaker (no standard REST contract). | Stronger (standard HTTP contract). |

**Decision:** Use tRPC for all internal APIs (web app ↔ server, admin ↔ server). If/when we need external API consumers (portal partners, third-party integrations), we expose a thin REST adapter layer over the same service functions — the business logic stays in one place.

### tRPC Client Setup (Next.js)

```typescript
// apps/web/lib/trpc.ts

import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@noagent/api";

export const trpc = createTRPCReact<AppRouter>();
```

```typescript
// apps/web/app/api/[...trpc]/route.ts

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@noagent/api";
import { createContext } from "@noagent/api/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
  });

export { handler as GET, handler as POST };
```

### tRPC Context (attaches auth + request metadata)

```typescript
// packages/api/src/context.ts

import { auth } from "@clerk/nextjs/server";

export async function createContext(req: Request) {
  const session = await auth();

  return {
    auth: session,
    ip: req.headers.get("x-forwarded-for") ?? "unknown",
    userAgent: req.headers.get("user-agent") ?? "unknown",
    user: null as any, // populated by isAuthenticated middleware
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

---

## 6. CI Pipeline YAML (GitHub Actions)

```yaml
# .github/workflows/ci.yml

name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: "20"
  PNPM_VERSION: "9"

jobs:
  # ─── Lint + Typecheck + Unit Tests ────────────────────────────
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm --filter @noagent/db db:generate

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Unit Tests
        run: pnpm test -- --coverage
        env:
          NODE_ENV: test

      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  # ─── Integration Tests (needs DB) ────────────────────────────
  integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:16-3.4
        env:
          POSTGRES_USER: noagent
          POSTGRES_PASSWORD: noagent
          POSTGRES_DB: noagent_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U noagent"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm --filter @noagent/db db:generate

      - name: Run Migrations
        run: pnpm --filter @noagent/db db:migrate:deploy
        env:
          DATABASE_URL: "postgresql://noagent:noagent@localhost:5432/noagent_test"

      - name: Integration Tests
        run: pnpm test:integration
        env:
          DATABASE_URL: "postgresql://noagent:noagent@localhost:5432/noagent_test"
          REDIS_URL: "redis://localhost:6379"
          NODE_ENV: test

  # ─── Security Scanning ───────────────────────────────────────
  security:
    name: Security Scans
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile

      - name: Dependency Vulnerability Scan
        run: pnpm audit --audit-level=critical
        continue-on-error: false

      - name: SAST (Snyk Code)
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
        continue-on-error: false

      - name: Secrets Scan
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified

  # ─── Build ───────────────────────────────────────────────────
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [quality]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm --filter @noagent/db db:generate

      - name: Build All
        run: pnpm build
        env:
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_placeholder"
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_placeholder"
          NEXT_PUBLIC_APP_URL: "https://staging.noagent.com"

  # ─── E2E Tests (on merge to main only) ──────────────────────
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [build, integration]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    services:
      postgres:
        image: postgis/postgis:16-3.4
        env:
          POSTGRES_USER: noagent
          POSTGRES_PASSWORD: noagent
          POSTGRES_DB: noagent_e2e
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U noagent"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile

      - name: Install Playwright Browsers
        run: pnpm --filter @noagent/web exec playwright install --with-deps chromium

      - name: Setup DB + Seed
        run: |
          pnpm --filter @noagent/db db:generate
          pnpm --filter @noagent/db db:migrate:deploy
          pnpm --filter @noagent/db db:seed
        env:
          DATABASE_URL: "postgresql://noagent:noagent@localhost:5432/noagent_e2e"

      - name: Start App
        run: pnpm --filter @noagent/web build && pnpm --filter @noagent/web start &
        env:
          DATABASE_URL: "postgresql://noagent:noagent@localhost:5432/noagent_e2e"
          REDIS_URL: "redis://localhost:6379"
          NODE_ENV: test

      - name: Wait for app
        run: npx wait-on http://localhost:3000 --timeout 30000

      - name: Run E2E Tests
        run: pnpm test:e2e
        env:
          PLAYWRIGHT_BASE_URL: "http://localhost:3000"

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

### Deploy to Staging (separate workflow)

```yaml
# .github/workflows/deploy-staging.yml

name: Deploy Staging

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Deploy Web to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_WEB }}

      - name: Run DB Migrations (Staging)
        run: |
          pnpm install --frozen-lockfile
          pnpm --filter @noagent/db db:generate
          pnpm --filter @noagent/db db:migrate:deploy
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}

      - name: Deploy Workers (ECS)
        run: |
          aws ecs update-service \
            --cluster noagent-staging \
            --service workers \
            --force-new-deployment
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: eu-west-2
```

---

## 7. Testing Structure

### Directory Layout

```
apps/web/
├── __tests__/
│   ├── e2e/                          # Playwright E2E tests
│   │   ├── seller-listing-flow.spec.ts
│   │   ├── buyer-enquiry-flow.spec.ts
│   │   ├── viewing-booking.spec.ts
│   │   ├── offer-negotiation.spec.ts
│   │   ├── deal-room.spec.ts
│   │   ├── rental-application.spec.ts
│   │   ├── service-marketplace.spec.ts
│   │   ├── admin-moderation.spec.ts
│   │   ├── billing.spec.ts
│   │   └── fixtures/
│   │       ├── auth.fixture.ts       # Test user login helpers
│   │       └── data.fixture.ts       # Test data factories
│   └── components/                   # Component-level tests (React Testing Library)
│       ├── ListingCard.test.tsx
│       ├── OfferForm.test.tsx
│       └── ...
│
├── playwright.config.ts
└── vitest.config.ts

packages/api/
├── src/
│   └── routers/
│       ├── __tests__/                # Integration tests per router
│       │   ├── listing.router.test.ts
│       │   ├── offer.router.test.ts
│       │   ├── dealRoom.router.test.ts
│       │   ├── application.router.test.ts
│       │   ├── marketplace.router.test.ts
│       │   ├── billing.router.test.ts
│       │   └── helpers/
│       │       ├── setup.ts          # Test DB setup/teardown
│       │       ├── factories.ts      # Entity factories
│       │       └── mockAuth.ts       # Auth context mocks
│       └── ...
│   └── services/
│       └── __tests__/                # Unit tests for business logic
│           ├── listing.service.test.ts
│           ├── pricing.service.test.ts
│           ├── risk.service.test.ts
│           └── offer.service.test.ts

packages/shared/
├── src/
│   ├── utils/__tests__/
│   │   ├── currency.test.ts
│   │   ├── slugify.test.ts
│   │   └── permissions.test.ts
│   └── validators/__tests__/
│       ├── listing.schema.test.ts
│       └── offer.schema.test.ts
```

### Test Framework Config

**Unit + Integration: Vitest** (faster than Jest for TypeScript, native ESM, compatible API)

```typescript
// packages/api/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/routers/__tests__/helpers/setup.ts"],
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

### Integration Test Helper (DB setup/teardown)

```typescript
// packages/api/src/routers/__tests__/helpers/setup.ts

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

beforeAll(async () => {
  // Run migrations against test DB
  execSync("pnpm --filter @noagent/db db:migrate:deploy", {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });
});

afterEach(async () => {
  // Clean all tables between tests (order matters for FK constraints)
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    AND tablename NOT IN ('_prisma_migrations', 'spatial_ref_sys')
  `;

  for (const { tablename } of tablenames) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
    );
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
```

### Entity Factories

```typescript
// packages/api/src/routers/__tests__/helpers/factories.ts

import { prisma } from "./setup";
import { faker } from "@faker-js/faker";
import type { ListingType, ListingStatus, UserRole } from "@prisma/client";

export async function createTestUser(overrides: Partial<{
  roles: UserRole[];
  verificationTier: string;
}> = {}) {
  return prisma.user.create({
    data: {
      clerkId: `clerk_test_${faker.string.alphanumeric(24)}`,
      email: faker.internet.email(),
      name: faker.person.fullName(),
      roles: overrides.roles ?? ["SELLER"],
      verificationTier: overrides.verificationTier ?? "UNVERIFIED",
      status: "active",
      jurisdictionId: "GB-ENG",
    },
  });
}

export async function createTestListing(
  ownerId: string,
  overrides: Partial<{
    type: ListingType;
    status: ListingStatus;
    price: number;
  }> = {}
) {
  return prisma.listing.create({
    data: {
      ownerId,
      type: overrides.type ?? "SALE",
      status: overrides.status ?? "DRAFT",
      jurisdictionId: "GB-ENG",
      addressLine1: faker.location.streetAddress(),
      city: faker.location.city(),
      postcode: "SW11 1AB",
      countryCode: "GB",
      latitude: 51.4621,
      longitude: -0.1682,
      propertyType: "flat",
      tenure: "leasehold",
      bedrooms: 2,
      bathrooms: 1,
      receptions: 1,
      areaSqft: 750,
      description: faker.lorem.paragraphs(2),
      price: overrides.price ?? 45000000, // £450,000 in pence
      features: ["garden", "parking"],
    },
  });
}

export async function createTestOffer(
  listingId: string,
  buyerId: string,
  overrides: Partial<{ amount: number; status: string }> = {}
) {
  return prisma.offer.create({
    data: {
      listingId,
      buyerId,
      amount: overrides.amount ?? 44000000,
      conditions: { subjectToSurvey: true, subjectToMortgage: false },
      chainStatus: "FIRST_TIME_BUYER",
      strengthScore: 75,
      status: overrides.status ?? "SUBMITTED",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}
```

### Example Integration Test

```typescript
// packages/api/src/routers/__tests__/listing.router.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { createTestUser, createTestListing } from "./helpers/factories";
import { createCaller } from "../helpers/testCaller";

describe("listing.router", () => {
  describe("create", () => {
    it("allows a seller to create a listing", async () => {
      const seller = await createTestUser({ roles: ["SELLER"] });
      const caller = createCaller({ userId: seller.clerkId });

      const listing = await caller.listing.create({
        type: "SALE",
        jurisdictionId: "GB-ENG",
        addressLine1: "42 Lavender Gardens",
        city: "London",
        postcode: "SW11 1DJ",
        countryCode: "GB",
        propertyType: "flat",
        tenure: "leasehold",
        bedrooms: 2,
        bathrooms: 1,
        description: "Charming two-bedroom flat with garden views.",
        price: 45000000,
        features: ["garden"],
      });

      expect(listing.id).toBeDefined();
      expect(listing.status).toBe("DRAFT");
      expect(listing.ownerId).toBe(seller.id);
    });

    it("rejects creation by a buyer role", async () => {
      const buyer = await createTestUser({ roles: ["BUYER"] });
      const caller = createCaller({ userId: buyer.clerkId });

      await expect(
        caller.listing.create({
          type: "SALE",
          jurisdictionId: "GB-ENG",
          addressLine1: "42 Lavender Gardens",
          city: "London",
          postcode: "SW11 1DJ",
          countryCode: "GB",
          propertyType: "flat",
          bedrooms: 2,
          bathrooms: 1,
          description: "Should fail.",
          price: 45000000,
          features: [],
        })
      ).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("publish", () => {
    it("transitions listing from DRAFT to ACTIVE", async () => {
      const seller = await createTestUser({ roles: ["SELLER"] });
      const listing = await createTestListing(seller.id);
      const caller = createCaller({ userId: seller.clerkId });

      // Add required media first (minimum 5 photos to publish)
      await createTestMedia(listing.id, 5);

      const published = await caller.listing.publish({ id: listing.id });

      expect(published.status).toBe("ACTIVE");
      expect(published.publishedAt).toBeDefined();
    });

    it("prevents another user from publishing someone else's listing", async () => {
      const seller = await createTestUser({ roles: ["SELLER"] });
      const otherSeller = await createTestUser({ roles: ["SELLER"] });
      const listing = await createTestListing(seller.id);
      const caller = createCaller({ userId: otherSeller.clerkId });

      await expect(
        caller.listing.publish({ id: listing.id })
      ).rejects.toThrow("Access denied");
    });
  });
});
```

### E2E Test Example (Playwright)

```typescript
// apps/web/__tests__/e2e/seller-listing-flow.spec.ts

import { test, expect } from "@playwright/test";
import { loginAsSeller } from "./fixtures/auth.fixture";

test.describe("Seller Listing Flow", () => {
  test("seller can create, fill, and publish a listing", async ({ page }) => {
    await loginAsSeller(page);

    // Navigate to create listing
    await page.goto("/listings/new");
    await expect(page.getByRole("heading", { name: /create listing/i })).toBeVisible();

    // Step 1: Property type
    await page.getByLabel(/listing type/i).selectOption("SALE");
    await page.getByLabel(/property type/i).selectOption("flat");
    await page.getByRole("button", { name: /next/i }).click();

    // Step 2: Address
    await page.getByLabel(/address line 1/i).fill("42 Lavender Gardens");
    await page.getByLabel(/city/i).fill("London");
    await page.getByLabel(/postcode/i).fill("SW11 1DJ");
    await page.getByRole("button", { name: /next/i }).click();

    // Step 3: Details
    await page.getByLabel(/bedrooms/i).fill("2");
    await page.getByLabel(/bathrooms/i).fill("1");
    await page.getByLabel(/description/i).fill("Beautiful two-bedroom flat with period features and garden views.");
    await page.getByRole("button", { name: /next/i }).click();

    // Step 4: Pricing
    await page.getByLabel(/asking price/i).fill("450000");
    await page.getByRole("button", { name: /next/i }).click();

    // Step 5: Photos (upload test images)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      "tests/fixtures/images/photo1.jpg",
      "tests/fixtures/images/photo2.jpg",
      "tests/fixtures/images/photo3.jpg",
      "tests/fixtures/images/photo4.jpg",
      "tests/fixtures/images/photo5.jpg",
    ]);
    await expect(page.getByText(/5 photos uploaded/i)).toBeVisible();
    await page.getByRole("button", { name: /next/i }).click();

    // Step 6: Review + Publish
    await expect(page.getByText("42 Lavender Gardens")).toBeVisible();
    await expect(page.getByText("£450,000")).toBeVisible();
    await page.getByRole("button", { name: /publish/i }).click();

    // Verify published
    await expect(page.getByText(/your listing is live/i)).toBeVisible();
    await expect(page).toHaveURL(/\/listings\/[a-f0-9-]+/);
  });
});
```

### Playwright Config

```typescript
// apps/web/playwright.config.ts

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html"], ["github"]] : [["html"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm --filter @noagent/web dev",
        port: 3000,
        reuseExistingServer: true,
      },
});
```

---

## 8. Observability Wiring

### Sentry (Error Tracking)

```typescript
// apps/web/sentry.client.config.ts

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],
});
```

```typescript
// apps/web/sentry.server.config.ts

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
});
```

```typescript
// apps/web/next.config.ts

import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = { /* ... */ };

export default withSentryConfig(nextConfig, {
  org: "noagent",
  project: "web",
  silent: true,
  widenClientFileUpload: true,      // Upload source maps
  hideSourceMaps: true,              // Don't expose to client
  disableLogger: true,
});
```

### Structured Logging (pino)

```typescript
// packages/api/src/lib/logger.ts

import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: [
      "email",
      "phone",
      "password",
      "token",
      "authorization",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },
  ...(process.env.NODE_ENV !== "production" && {
    transport: { target: "pino-pretty" },
  }),
});

// Request-scoped child logger
export function createRequestLogger(requestId: string, userId?: string) {
  return logger.child({ requestId, userId });
}
```

### Request Logging Middleware (tRPC)

```typescript
// packages/api/src/middleware/logging.middleware.ts

import { logger, createRequestLogger } from "../lib/logger";
import { randomUUID } from "crypto";

export const logRequest = t.middleware(async ({ ctx, path, type, next }) => {
  const requestId = randomUUID();
  const reqLogger = createRequestLogger(requestId, ctx.user?.id);
  const start = performance.now();

  reqLogger.info({ path, type }, "Request started");

  try {
    const result = await next({ ctx: { ...ctx, logger: reqLogger, requestId } });
    const durationMs = Math.round(performance.now() - start);

    reqLogger.info({ path, type, durationMs, ok: result.ok }, "Request completed");
    return result;
  } catch (error) {
    const durationMs = Math.round(performance.now() - start);
    reqLogger.error({ path, type, durationMs, error }, "Request failed");
    throw error;
  }
});
```

### Worker Observability

```typescript
// apps/workers/src/lib/logger.ts

import pino from "pino";

export const workerLogger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: { paths: ["email", "phone"], censor: "[REDACTED]" },
});

// Usage in processor:
// processors/email.processor.ts
import { workerLogger } from "../lib/logger";
import * as Sentry from "@sentry/node";

export async function processEmail(job: Job) {
  const log = workerLogger.child({ jobId: job.id, queue: "email", attemptsMade: job.attemptsMade });

  try {
    log.info({ to: job.data.to, template: job.data.template }, "Sending email");
    await sendEmail(job.data);
    log.info("Email sent successfully");
  } catch (error) {
    log.error({ error }, "Email send failed");
    Sentry.captureException(error, { extra: { jobId: job.id, queue: "email" } });
    throw error; // BullMQ will retry
  }
}
```

### Health Check Endpoint

```typescript
// apps/web/app/api/health/route.ts

import { db } from "@noagent/db";
import { redis } from "@noagent/api/lib/redis";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};

  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");

  return Response.json(
    { status: allOk ? "healthy" : "degraded", checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  );
}
```

---

## 9. Seed Data & Fixture Strategy

### Seed Script

```typescript
// packages/db/prisma/seed.ts

import { PrismaClient, UserRole, ListingStatus, ListingType } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── 1. Jurisdiction Configs ─────────────────────────────────
  await prisma.jurisdictionConfig.upsert({
    where: { id: "GB-ENG" },
    update: {},
    create: {
      id: "GB-ENG",
      name: "England",
      active: true,
      config: {
        currency: "GBP",
        locale: "en-GB",
        requiredFields: ["epc_rating", "council_tax_band", "tenure"],
        depositCapWeeks: 5,
        rightToRentRequired: true,
        depositProtectionRequired: true,
        depositProtectionSchemes: ["DPS", "MyDeposits", "TDS"],
        prescribedInfoDeadlineDays: 30,
        saleMilestoneTemplate: "uk_freehold_sale",
        vatRate: 0.2,
        areaUnit: "sq_ft",
        dateFormat: "DD/MM/YYYY",
      },
    },
  });

  await prisma.jurisdictionConfig.upsert({
    where: { id: "GB-SCT" },
    update: {},
    create: {
      id: "GB-SCT",
      name: "Scotland",
      active: true,
      config: {
        currency: "GBP",
        locale: "en-GB",
        requiredFields: ["epc_rating", "council_tax_band"],
        depositCapWeeks: null, // No statutory cap in Scotland
        rightToRentRequired: false,
        depositProtectionRequired: true,
        depositProtectionSchemes: ["SafeDeposits", "MyDeposits"],
        saleMilestoneTemplate: "scotland_sale",
        vatRate: 0.2,
        areaUnit: "sq_ft",
        dateFormat: "DD/MM/YYYY",
      },
    },
  });

  // ── 2. Test Users ───────────────────────────────────────────
  const seller = await prisma.user.create({
    data: {
      clerkId: "clerk_seed_seller_001",
      email: "seller@example.com",
      name: "Sarah Seller",
      phone: "+447700000001",
      roles: ["SELLER"],
      verificationTier: "OWNERSHIP_VERIFIED",
      status: "active",
      jurisdictionId: "GB-ENG",
    },
  });

  const landlord = await prisma.user.create({
    data: {
      clerkId: "clerk_seed_landlord_001",
      email: "landlord@example.com",
      name: "Larry Landlord",
      phone: "+447700000002",
      roles: ["LANDLORD"],
      verificationTier: "ID_VERIFIED",
      status: "active",
      jurisdictionId: "GB-ENG",
    },
  });

  const buyer = await prisma.user.create({
    data: {
      clerkId: "clerk_seed_buyer_001",
      email: "buyer@example.com",
      name: "Ben Buyer",
      phone: "+447700000003",
      roles: ["BUYER"],
      verificationTier: "ID_VERIFIED",
      status: "active",
      jurisdictionId: "GB-ENG",
    },
  });

  const tenant = await prisma.user.create({
    data: {
      clerkId: "clerk_seed_tenant_001",
      email: "tenant@example.com",
      name: "Tara Tenant",
      phone: "+447700000004",
      roles: ["TENANT"],
      verificationTier: "UNVERIFIED",
      status: "active",
      jurisdictionId: "GB-ENG",
    },
  });

  const provider = await prisma.user.create({
    data: {
      clerkId: "clerk_seed_provider_001",
      email: "photographer@example.com",
      name: "Pete Photographer",
      phone: "+447700000005",
      roles: ["PROVIDER"],
      verificationTier: "ID_VERIFIED",
      status: "active",
      jurisdictionId: "GB-ENG",
    },
  });

  const admin = await prisma.user.create({
    data: {
      clerkId: "clerk_seed_admin_001",
      email: "admin@noagent.com",
      name: "Admin User",
      roles: ["ADMIN", "TRUST_SAFETY"],
      verificationTier: "ENHANCED_VERIFIED",
      status: "active",
      jurisdictionId: "GB-ENG",
    },
  });

  // ── 3. Service Provider Profile ─────────────────────────────
  await prisma.serviceProvider.create({
    data: {
      userId: provider.id,
      companyName: "London Property Photos Ltd",
      registrationNumber: "12345678",
      serviceTypes: ["photography", "floorplan"],
      serviceAreas: ["SW11", "SW4", "SW8", "SW9", "SE11"],
      bio: "Professional property photography with next-day delivery.",
      status: "active",
      averageRating: 4.8,
      reviewCount: 47,
      onTimePct: 96.5,
      disputeRate: 1.2,
    },
  });

  // ── 4. Sample Listings (Sale) ───────────────────────────────
  const londonLocations = [
    { addr: "42 Lavender Gardens", city: "London", pc: "SW11 1DJ", lat: 51.4621, lng: -0.1682, beds: 2, price: 45000000 },
    { addr: "15 Abbeville Road", city: "London", pc: "SW4 9LA", lat: 51.4505, lng: -0.1237, beds: 3, price: 72500000 },
    { addr: "8 The Chase", city: "London", pc: "SW4 0NP", lat: 51.4561, lng: -0.1411, beds: 4, price: 125000000 },
    { addr: "99 Northcote Road", city: "London", pc: "SW11 6PL", lat: 51.4598, lng: -0.1672, beds: 1, price: 32000000 },
    { addr: "27 Elspeth Road", city: "London", pc: "SW11 1PY", lat: 51.4625, lng: -0.1640, beds: 2, price: 55000000 },
  ];

  for (const loc of londonLocations) {
    const listing = await prisma.listing.create({
      data: {
        ownerId: seller.id,
        type: "SALE",
        status: "ACTIVE",
        jurisdictionId: "GB-ENG",
        addressLine1: loc.addr,
        city: loc.city,
        postcode: loc.pc,
        countryCode: "GB",
        latitude: loc.lat,
        longitude: loc.lng,
        propertyType: loc.beds >= 3 ? "house" : "flat",
        tenure: loc.beds >= 3 ? "freehold" : "leasehold",
        bedrooms: loc.beds,
        bathrooms: Math.max(1, Math.floor(loc.beds / 2)),
        receptions: loc.beds >= 3 ? 2 : 1,
        areaSqft: loc.beds * 350 + 200,
        description: faker.lorem.paragraphs(3),
        price: loc.price,
        pricingStrategy: "maximize",
        pricingConfidence: faker.number.int({ min: 60, max: 95 }),
        verificationTier: "OWNERSHIP_VERIFIED",
        publishedAt: faker.date.recent({ days: 14 }),
        features: faker.helpers.arrayElements(
          ["garden", "parking", "balcony", "period_features", "modern_kitchen", "ensuite", "storage"],
          faker.number.int({ min: 2, max: 5 })
        ),
      },
    });

    // Add placeholder media entries
    for (let i = 0; i < 6; i++) {
      await prisma.listingMedia.create({
        data: {
          listingId: listing.id,
          type: i === 5 ? "floorplan" : "photo",
          storageKey: `seed/listing-${listing.id}/photo-${i}.jpg`,
          cdnUrl: `https://picsum.photos/seed/${listing.id}-${i}/1200/800`,
          sortOrder: i,
          width: 1200,
          height: 800,
          fileSizeBytes: 150000,
          mimeType: "image/jpeg",
          isVerified: false,
        },
      });
    }
  }

  // ── 5. Sample Listing (Rental) ──────────────────────────────
  const rentalListing = await prisma.listing.create({
    data: {
      ownerId: landlord.id,
      type: "RENTAL",
      status: "ACTIVE",
      jurisdictionId: "GB-ENG",
      addressLine1: "Flat 3, 10 Battersea Rise",
      city: "London",
      postcode: "SW11 1EE",
      countryCode: "GB",
      latitude: 51.4612,
      longitude: -0.1698,
      propertyType: "flat",
      tenure: "leasehold",
      bedrooms: 1,
      bathrooms: 1,
      receptions: 1,
      areaSqft: 480,
      description: "Bright one-bedroom flat in the heart of Battersea.",
      price: 175000, // £1,750/month in pence
      publishedAt: faker.date.recent({ days: 5 }),
      features: ["modern_kitchen", "wooden_floors"],
    },
  });

  await prisma.rentalDetails.create({
    data: {
      listingId: rentalListing.id,
      monthlyRent: 175000,
      depositAmount: 201923,  // 5 weeks at £1,750
      minTermMonths: 12,
      furnished: "PART_FURNISHED",
      billsIncluded: ["water"],
      petsAllowed: "NEGOTIABLE",
      availableFrom: faker.date.soon({ days: 30 }),
      epcRating: "C",
    },
  });

  // ── 6. Sample Enquiry ───────────────────────────────────────
  const sampleListing = await prisma.listing.findFirst({ where: { ownerId: seller.id, status: "ACTIVE" } });

  if (sampleListing) {
    await prisma.enquiry.create({
      data: {
        listingId: sampleListing.id,
        senderId: buyer.id,
        message: "Hi, I'm very interested in this property. I'm a first-time buyer with a mortgage AIP. Would it be possible to arrange a viewing this weekend?",
        preQualResponses: {
          timeline: "within_3_months",
          chainStatus: "first_time_buyer",
          financeStatus: "aip_obtained",
        },
        status: "new",
      },
    });
  }

  // ── 7. Milestone Templates ──────────────────────────────────
  // These would typically be in a separate config table
  // Seeded here for completeness

  console.log("✅ Seed complete.");
  console.log(`   Users: seller, landlord, buyer, tenant, provider, admin`);
  console.log(`   Listings: ${londonLocations.length} sale + 1 rental`);
  console.log(`   Enquiries: 1`);
  console.log(`   Jurisdictions: GB-ENG, GB-SCT`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

### Fixture Strategy Summary

| Context | Strategy | Data Source |
|---------|----------|------------|
| **Local dev** | Full seed script (`pnpm db:seed`) — creates realistic data across all entities | `prisma/seed.ts` |
| **Integration tests** | Factory functions per test — clean DB between tests, create only what's needed | `factories.ts` |
| **E2E tests** | Dedicated seed + Clerk test users (pre-configured in Clerk dashboard) | `seed.ts` + Playwright fixtures |
| **Staging** | Production-like seed (anonymised) + manual test accounts | Separate staging seed script |
| **Load tests** | k6 script generates data via API calls during test setup phase | k6 setup function |

**Key principle:** Tests never depend on each other's data. Integration tests use `TRUNCATE CASCADE` between tests. E2E tests use deterministic seed data that is reset before each test suite run.

---

*End of Prompt 2 Deliverable — Implementation Blueprint & Repo Scaffolding*

*Companion to: NoAgent Complete End-State Deliverable (Prompt 1)*
