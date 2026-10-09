# Migrations — two version schemes, one history

Files here come from two sources and it matters which:

**Hand-authored (round timestamps, e.g. `20260407000000_initial_schema.sql`).**
Written in the repo and applied by hand or via the SQL editor. They are *not*
recorded in `supabase_migrations.schema_migrations`, so the Supabase CLI does not
know they ran.

**MCP-applied (real timestamps, e.g. `20260906040112_contact_aliases_and_mip_capture.sql`).**
Applied to production through the Supabase MCP `apply_migration`, which records the
exact statements in `supabase_migrations.schema_migrations`. On 2026-09-07 all 44
of these that were missing from the repo were exported straight from that table
(header comment on each). They are byte-identical to what ran.

Consequences:

- `supabase db push` against production would try to re-apply the hand-authored
  files (unknown versions) and skip the MCP ones (known). Do not run it blind.
- The reliable source of truth for *what has run* is the `schema_migrations` table.
  Export check: `SELECT version, name FROM supabase_migrations.schema_migrations`.
- Going forward, apply via MCP `apply_migration` **and** commit the file with the
  version the MCP recorded, so the two histories stay aligned.
