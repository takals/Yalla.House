# Yalla.House — Agent Instructions

> This file is read by all AI agents working on this repo (Cowork, Antigravity, Claude Code, Cursor, etc.)

## Project

Yalla.House — UK flat-fee property selling platform. German-first (DE default locale). No commission, no agent. Sellers list directly on Rightmove & Zoopla and keep every pound.

## Repository Layout

```
├── Website/           ← Vanilla HTML/CSS/JS prototype (8 pages)
├── apps/web/          ← Next.js 14 production app (App Router, RSC, Tailwind, next-intl)
├── packages/db/       ← @yalla/db — Supabase types & client
├── packages/integrations/ ← @yalla/integrations — portal sync, pricing utils
├── packages/ui/       ← @yalla/ui — shared React components
├── supabase/          ← Migrations, seed, config
├── .claude/           ← AI agent rules & skills
│   ├── CLAUDE.md      ← Project instructions entry point
│   ├── rules/         ← Detailed rules by scope (code-style, frontend, dashboards, public-pages)
│   └── skills/        ← Design skill files (taste-skill, output-skill, etc.)
└── AGENTS.md          ← This file
```

## Key Conventions

- **Monorepo:** pnpm workspaces + Turborepo
- **Type-check:** `pnpm turbo typecheck` must pass with 0 errors
- **i18n:** German first. `messages/de.json` + `messages/en.json`. Always add both.
- **Supabase queries:** Use `.select('*')` with explicit type annotations to avoid `never` inference
- **Styling:** Tailwind with brand tokens (`bg-brand`, `bg-bg`, `bg-surface`, `rounded-card`)
- **Server Components** by default. Only add `'use client'` when needed.

## Git Workflow

- **GitHub** (`takals/Yalla.House`) is the single source of truth
- Always pull before starting work
- Commit with clear messages describing what changed and why
- Push when a logical unit of work is complete
- Branch for large features; commit to `main` for small fixes

## Connected Services

| Service | Purpose |
|---------|---------|
| Supabase | Database, auth, edge functions |
| Figma | Design files |
| Notion | Project management |
| Google Workspace | Business docs (`admin@yalla.house`) |
| Inngest | Background jobs |

## Rules Reference

Read `.claude/CLAUDE.md` for the full rules index. Key files:

- `.claude/rules/code-style.md` — formatting, naming, JS patterns
- `.claude/rules/frontend/react.md` — Next.js, Tailwind, i18n, data fetching
- `.claude/rules/frontend/vanilla.md` — design tokens, component specs
- `.claude/rules/dashboards.md` — dashboard layout rules
- `.claude/rules/public-pages.md` — public page patterns
