-- Migration: Shared Infrastructure Layer
-- Adds: notifications, listing_agent_assignments, service_requests
-- Supports: Owner-Agent handover, Service Partner routing, cross-role notifications

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push', 'sms');
CREATE TYPE notification_status  AS ENUM ('unread', 'read', 'archived');
CREATE TYPE collaboration_tier   AS ENUM ('advisory', 'assisted', 'managed');
CREATE TYPE assignment_status    AS ENUM ('invited', 'accepted', 'active', 'paused', 'revoked');
CREATE TYPE service_category     AS ENUM (
  'photography', 'floorplan', 'epc', 'survey',
  'conveyancing', 'cleaning', 'staging', 'drone', 'other'
);
CREATE TYPE service_request_status AS ENUM (
  'pending', 'quoted', 'accepted', 'in_progress',
  'completed', 'cancelled', 'disputed'
);

-- ============================================================
-- 1. NOTIFICATIONS (cross-role)
-- ============================================================

CREATE TABLE notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel       notification_channel NOT NULL DEFAULT 'in_app',
  status        notification_status  NOT NULL DEFAULT 'unread',
  title         text NOT NULL,
  body          text,
  action_url    text,                          -- deep-link into dashboard
  -- context: what triggered this notification
  source_type   text,                          -- 'listing', 'search', 'referral', 'service', 'system'
  source_id     uuid,                          -- FK to the originating record
  actor_id      uuid REFERENCES users(id),     -- who caused it (null for system)
  metadata      jsonb DEFAULT '{}'::jsonb,     -- extra context (match_score, amount, etc.)
  read_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_user_status  ON notifications(user_id, status);
CREATE INDEX idx_notif_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notif_source       ON notifications(source_type, source_id);

-- ============================================================
-- 2. LISTING–AGENT ASSIGNMENTS (Owner-to-Agent handover)
-- ============================================================

CREATE TABLE listing_agent_assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  agent_id        uuid NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  owner_id        uuid NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  tier            collaboration_tier  NOT NULL DEFAULT 'advisory',
  status          assignment_status   NOT NULL DEFAULT 'invited',
  -- permissions granted under this assignment
  can_edit_listing   boolean NOT NULL DEFAULT false,
  can_manage_viewings boolean NOT NULL DEFAULT false,
  can_negotiate      boolean NOT NULL DEFAULT false,
  can_message_buyers boolean NOT NULL DEFAULT false,
  -- commercial terms
  fee_type        text CHECK (fee_type IN ('flat', 'percentage', 'none')),
  fee_amount      integer,           -- minor units or basis points
  fee_currency    char(3) DEFAULT 'GBP',
  -- lifecycle
  invited_at      timestamptz NOT NULL DEFAULT now(),
  accepted_at     timestamptz,
  revoked_at      timestamptz,
  revoked_reason  text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(listing_id, agent_id)
);

CREATE INDEX idx_laa_listing   ON listing_agent_assignments(listing_id);
CREATE INDEX idx_laa_agent     ON listing_agent_assignments(agent_id);
CREATE INDEX idx_laa_owner     ON listing_agent_assignments(owner_id);
CREATE INDEX idx_laa_status    ON listing_agent_assignments(status);

-- ============================================================
-- 3. SERVICE REQUESTS (Service Partner routing)
-- ============================================================

CREATE TABLE service_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      uuid REFERENCES listings(id) ON DELETE SET NULL,
  requester_id    uuid NOT NULL REFERENCES users(id),  -- owner or agent
  partner_id      uuid REFERENCES users(id),           -- assigned partner (null until matched)
  category        service_category       NOT NULL,
  status          service_request_status NOT NULL DEFAULT 'pending',
  -- details
  title           text NOT NULL,
  description     text,
  preferred_date  date,
  preferred_time  text,                -- e.g. 'morning', 'afternoon', '14:00'
  address         text,
  postcode        text,
  -- pricing
  quoted_amount   integer,             -- minor units
  final_amount    integer,             -- minor units
  currency        char(3) DEFAULT 'GBP',
  -- fulfilment
  scheduled_at    timestamptz,
  completed_at    timestamptz,
  deliverables    jsonb DEFAULT '[]'::jsonb,  -- [{url, type, label}]
  -- ratings
  rating          smallint CHECK (rating BETWEEN 1 AND 5),
  review          text,
  -- metadata
  country         char(2) DEFAULT 'GB',
  metadata        jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sr_listing     ON service_requests(listing_id);
CREATE INDEX idx_sr_requester   ON service_requests(requester_id);
CREATE INDEX idx_sr_partner     ON service_requests(partner_id);
CREATE INDEX idx_sr_status      ON service_requests(status);
CREATE INDEX idx_sr_category    ON service_requests(category);
CREATE INDEX idx_sr_postcode    ON service_requests(postcode);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_laa_updated_at
  BEFORE UPDATE ON listing_agent_assignments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sr_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- HELPER: auto-set permissions based on collaboration tier
-- ============================================================

CREATE OR REPLACE FUNCTION apply_tier_permissions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tier = 'advisory' THEN
    NEW.can_edit_listing    := false;
    NEW.can_manage_viewings := false;
    NEW.can_negotiate       := false;
    NEW.can_message_buyers  := false;
  ELSIF NEW.tier = 'assisted' THEN
    NEW.can_edit_listing    := false;
    NEW.can_manage_viewings := true;
    NEW.can_negotiate       := false;
    NEW.can_message_buyers  := true;
  ELSIF NEW.tier = 'managed' THEN
    NEW.can_edit_listing    := true;
    NEW.can_manage_viewings := true;
    NEW.can_negotiate       := true;
    NEW.can_message_buyers  := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_laa_tier_permissions
  BEFORE INSERT OR UPDATE OF tier ON listing_agent_assignments
  FOR EACH ROW EXECUTE FUNCTION apply_tier_permissions();

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_agent_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Notifications: users see only their own
CREATE POLICY "notif_own" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Listing Agent Assignments: owner and agent both have access
CREATE POLICY "laa_owner" ON listing_agent_assignments
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "laa_agent_read" ON listing_agent_assignments
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "laa_agent_update" ON listing_agent_assignments
  FOR UPDATE USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

-- Service Requests: requester, partner, and listing owner
CREATE POLICY "sr_requester" ON service_requests
  FOR ALL USING (auth.uid() = requester_id);

CREATE POLICY "sr_partner_read" ON service_requests
  FOR SELECT USING (auth.uid() = partner_id);

CREATE POLICY "sr_partner_update" ON service_requests
  FOR UPDATE USING (auth.uid() = partner_id)
  WITH CHECK (auth.uid() = partner_id);

CREATE POLICY "sr_listing_owner" ON service_requests
  FOR SELECT USING (
    listing_id IS NOT NULL AND
    auth.uid() IN (SELECT owner_id FROM listings WHERE id = service_requests.listing_id)
  );

-- ============================================================
-- HELPER: create notification (callable from Inngest via RPC)
-- ============================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id     uuid,
  p_title       text,
  p_body        text DEFAULT NULL,
  p_action_url  text DEFAULT NULL,
  p_source_type text DEFAULT NULL,
  p_source_id   uuid DEFAULT NULL,
  p_actor_id    uuid DEFAULT NULL,
  p_channel     notification_channel DEFAULT 'in_app',
  p_metadata    jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO notifications (user_id, channel, title, body, action_url, source_type, source_id, actor_id, metadata)
  VALUES (p_user_id, p_channel, p_title, p_body, p_action_url, p_source_type, p_source_id, p_actor_id, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
