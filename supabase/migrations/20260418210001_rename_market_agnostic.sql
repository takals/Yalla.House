-- Rename German-specific columns to market-agnostic names
-- This allows the schema to work for any country without German naming assumptions

-- Rename pricing columns
ALTER TABLE listings RENAME COLUMN nebenkosten TO service_charge;
ALTER TABLE listings RENAME COLUMN kaution TO deposit_amount;

-- Add aliases as computed columns for backward compat during transition
-- (Not needed — we'll update all code references)

-- Remove DEFAULT 'EUR' from currency — should be set at insert time from country config
ALTER TABLE listings ALTER COLUMN currency DROP DEFAULT;

-- Remove DEFAULT 'DE' from users.country_code — set at insert from locale
ALTER TABLE users ALTER COLUMN country_code DROP DEFAULT;
