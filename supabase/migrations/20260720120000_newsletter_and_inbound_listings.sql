-- Newsletter subscribers + inbound agent-listings pipeline
-- ---------------------------------------------------------------------------
-- Two new capabilities for the agent path:
--   1. newsletter_subscribers — quick, no-account newsletter sign-up (double
--      opt-in). Agents (and anyone) subscribe to the Yalla.House newsletter.
--   2. Inbound listings: agents paste listings@yalla.house into their own
--      property mailouts. We receive those emails (agent_inbound_emails),
--      heuristically parse listing candidates (agent_inbound_listings), and an
--      admin reviews + distributes them to owner/hunter clients.
--
-- RLS: admin-only read. All writes happen through the service role (public API
-- routes + inbound webhook), which bypasses RLS — so no anon policies needed.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. newsletter_subscribers
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text        NOT NULL,
  locale          text        NOT NULL DEFAULT 'en',
  country_code    text,
  role            text,                 -- 'agent' | 'owner' | 'hunter' | null
  source          text,                 -- 'agent_info' | 'agent_profile' | 'footer' | ...
  user_id         uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  confirm_token   uuid        NOT NULL DEFAULT gen_random_uuid(),
  confirmed_at    timestamptz,          -- double opt-in: set when the confirm link is clicked
  unsubscribed_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- One row per email address (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_key
  ON newsletter_subscribers (lower(email));
CREATE INDEX IF NOT EXISTS newsletter_subscribers_confirm_token_idx
  ON newsletter_subscribers (confirm_token);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS newsletter_subscribers_admin_read ON newsletter_subscribers;
CREATE POLICY newsletter_subscribers_admin_read ON newsletter_subscribers
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles
                 WHERE user_roles.user_id = auth.uid()
                   AND user_roles.role = 'admin'
                   AND user_roles.is_active));

COMMENT ON TABLE newsletter_subscribers IS
  'Newsletter sign-ups (double opt-in). Written via service role from public API routes.';

-- ────────────────────────────────────────────────────────────────────────────
-- 2. agent_inbound_emails — raw emails received at listings@yalla.house
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_inbound_emails (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_message_id text,             -- de-dupe key from the mail provider, if present
  from_email       text,
  from_name        text,
  to_email         text,
  subject          text,
  text_body        text,
  html_body        text,
  headers          jsonb       NOT NULL DEFAULT '{}'::jsonb,
  attachments      jsonb       NOT NULL DEFAULT '[]'::jsonb,
  agent_user_id    uuid        REFERENCES public.users(id) ON DELETE SET NULL, -- matched agent, if any
  status           text        NOT NULL DEFAULT 'received',  -- received | parsed | error | ignored
  parse_error      text,
  listing_count    int         NOT NULL DEFAULT 0,
  received_at      timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS agent_inbound_emails_provider_msg_idx
  ON agent_inbound_emails (provider_message_id) WHERE provider_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS agent_inbound_emails_from_idx ON agent_inbound_emails (lower(from_email));
CREATE INDEX IF NOT EXISTS agent_inbound_emails_received_idx ON agent_inbound_emails (received_at DESC);

ALTER TABLE agent_inbound_emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_inbound_emails_admin_read ON agent_inbound_emails;
CREATE POLICY agent_inbound_emails_admin_read ON agent_inbound_emails
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles
                 WHERE user_roles.user_id = auth.uid()
                   AND user_roles.role = 'admin'
                   AND user_roles.is_active));

COMMENT ON TABLE agent_inbound_emails IS
  'Raw emails received at listings@yalla.house (agents forward their property mailouts here).';

-- ────────────────────────────────────────────────────────────────────────────
-- 3. agent_inbound_listings — parsed listing candidates from those emails
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_inbound_listings (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id       uuid        NOT NULL REFERENCES agent_inbound_emails(id) ON DELETE CASCADE,
  agent_user_id  uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  title          text,
  price_text     text,
  price_amount   numeric,
  currency       text,
  location       text,
  postcode       text,
  country_code   text,
  property_type  text,
  bedrooms       int,
  url            text,
  description    text,
  raw            jsonb       NOT NULL DEFAULT '{}'::jsonb,
  status         text        NOT NULL DEFAULT 'new',   -- new | approved | rejected | distributed
  reviewed_by    uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at    timestamptz,
  distributed_at timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_inbound_listings_status_idx ON agent_inbound_listings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_inbound_listings_email_idx ON agent_inbound_listings (email_id);

ALTER TABLE agent_inbound_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_inbound_listings_admin_read ON agent_inbound_listings;
CREATE POLICY agent_inbound_listings_admin_read ON agent_inbound_listings
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles
                 WHERE user_roles.user_id = auth.uid()
                   AND user_roles.role = 'admin'
                   AND user_roles.is_active));

COMMENT ON TABLE agent_inbound_listings IS
  'Listing candidates parsed from inbound agent emails. Admin reviews + distributes to clients.';
