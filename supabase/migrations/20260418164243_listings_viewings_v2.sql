-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260418164243.

-- =============================================================================
-- LISTINGS & VIEWINGS V2 — Lifecycle, Calendar, Notifications
-- =============================================================================

-- 1. Expand listing statuses: add 'deleted'
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check CHECK (status IN (
  'draft','preview','active','paused','under_offer','sold','let','archived','deleted'
));

-- Add soft-delete timestamp + viewing settings
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS viewing_settings jsonb DEFAULT '{"slot_duration_min":30,"buffer_min":10,"max_per_day":8,"advance_days":14,"min_notice_hours":24}'::jsonb;

-- 2. Expand viewings: add open_house type, video_room_url, cancellation fields, feedback
ALTER TABLE viewings DROP CONSTRAINT IF EXISTS viewings_type_check;
ALTER TABLE viewings ADD CONSTRAINT viewings_type_check CHECK (type IN ('in_person','virtual','online','open_house'));

ALTER TABLE viewings
  ADD COLUMN IF NOT EXISTS video_room_url text,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_by text CHECK (cancelled_by IN ('owner','hunter','system')),
  ADD COLUMN IF NOT EXISTS feedback_hunter jsonb,
  ADD COLUMN IF NOT EXISTS feedback_owner jsonb;

-- 3. Expand availability_slots for recurring/open-house
ALTER TABLE availability_slots
  ADD COLUMN IF NOT EXISTS day_of_week smallint CHECK (day_of_week BETWEEN 0 AND 6),
  ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS booked_count integer DEFAULT 0;

-- 4. Blackout dates
CREATE TABLE IF NOT EXISTS blackout_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES users(id),
  date date NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, date)
);

ALTER TABLE blackout_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blackout_owner_all" ON blackout_dates
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 5. Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email','sms')),
  subject text,
  body_template text NOT NULL,
  is_active boolean DEFAULT true,
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_tpl_owner" ON notification_templates
  FOR ALL USING (
    listing_id IS NULL OR
    auth.uid() IN (SELECT owner_id FROM listings WHERE id = notification_templates.listing_id)
  );

-- 6. Notification log
CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  viewing_id uuid REFERENCES viewings(id),
  listing_id uuid REFERENCES listings(id),
  template_id uuid REFERENCES notification_templates(id),
  channel text NOT NULL CHECK (channel IN ('email','sms','whatsapp','push')),
  event_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent','failed','bounced','delivered')) DEFAULT 'sent',
  provider_id text,
  error_detail text,
  sent_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_log_user ON notification_log(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_log_viewing ON notification_log(viewing_id) WHERE viewing_id IS NOT NULL;

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_log_own" ON notification_log
  FOR SELECT USING (auth.uid() = user_id);

-- 7. Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT true,
  whatsapp_enabled boolean DEFAULT true,
  phone_number text,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_pref_own" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Listing status transition log (audit trail)
CREATE TABLE IF NOT EXISTS listing_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid REFERENCES users(id),
  reason text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_log_listing ON listing_status_log(listing_id, created_at DESC);

ALTER TABLE listing_status_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "status_log_owner" ON listing_status_log
  FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM listings WHERE id = listing_status_log.listing_id)
  );

-- 9. Function to log listing status changes automatically
CREATE OR REPLACE FUNCTION log_listing_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO listing_status_log (listing_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_listing_status_log ON listings;
CREATE TRIGGER trg_listing_status_log
  AFTER UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION log_listing_status_change();

-- 10. Seed default notification templates
INSERT INTO notification_templates (event_type, channel, subject, body_template, is_active) VALUES
  ('viewing_booked', 'email', 'Your viewing at {{address}} is confirmed!', 'Hi {{hunter_name}},\n\nYour viewing has been booked:\n\nProperty: {{address}}\nDate: {{date}}\nTime: {{time}}\nType: {{viewing_type}}\n\n{{#if video_link}}Join your video call: {{video_link}}{{/if}}\n\nWe look forward to seeing you!\n\nYalla.House', true),
  ('viewing_booked', 'sms', NULL, 'Yalla.House: Viewing confirmed at {{address}} on {{date}} at {{time}}. {{#if video_link}}Join: {{video_link}}{{/if}}', true),
  ('viewing_booked_owner', 'email', 'New viewing booked for {{address}}', 'Hi {{owner_name}},\n\n{{hunter_name}} has booked a viewing:\n\nProperty: {{address}}\nDate: {{date}}\nTime: {{time}}\nType: {{viewing_type}}\nContact: {{hunter_email}}\n\nManage your viewings at yalla.house/owner/viewings\n\nYalla.House', true),
  ('reminder_24h', 'email', 'Reminder: viewing tomorrow at {{time}}', 'Hi {{hunter_name}},\n\nJust a reminder about your viewing tomorrow:\n\nProperty: {{address}}\nTime: {{time}}\n\n{{#if video_link}}Join your video call: {{video_link}}{{/if}}\n{{#if parking_notes}}Parking: {{parking_notes}}{{/if}}\n\nYalla.House', true),
  ('reminder_24h', 'sms', NULL, 'Yalla.House: Viewing reminder - {{address}} tomorrow at {{time}}. {{#if video_link}}Join: {{video_link}}{{/if}}', true),
  ('reminder_1h', 'sms', NULL, 'Yalla.House: Your viewing at {{address}} starts in 1 hour! {{#if video_link}}Join: {{video_link}}{{else}}Address: {{full_address}}{{/if}}', true),
  ('viewing_cancelled', 'email', 'Your viewing has been cancelled', 'Hi {{hunter_name}},\n\nYour viewing at {{address}} on {{date}} has been cancelled.\n\n{{#if reason}}Reason: {{reason}}{{/if}}\n\nBook a new time: {{rebook_link}}\n\nYalla.House', true),
  ('viewing_cancelled', 'sms', NULL, 'Yalla.House: Your viewing at {{address}} on {{date}} has been cancelled. Rebook: {{rebook_link}}', true),
  ('post_viewing_hunter', 'email', 'How was your viewing at {{address}}?', 'Hi {{hunter_name}},\n\nThanks for viewing {{address}}! Wed love to hear your thoughts.\n\nShare your feedback: {{feedback_link}}\n\nYalla.House', true),
  ('post_viewing_owner', 'email', 'Viewing feedback for {{address}}', 'Hi {{owner_name}},\n\nYour viewing with {{hunter_name}} at {{address}} is complete.\n\nInterest level: {{interest_level}}\n\nView details at yalla.house/owner/viewings\n\nYalla.House', true),
  ('listing_live', 'email', 'Your listing is now live!', 'Hi {{owner_name}},\n\nGreat news! {{address}} is now live on Rightmove and Zoopla.\n\nView your listing: {{listing_link}}\nManage viewings: yalla.house/owner/viewings\n\nYalla.House', true),
  ('listing_under_offer', 'email', 'Listing under offer: {{address}}', 'Hi {{owner_name}},\n\n{{address}} is now marked as Under Offer. Pending viewings have been paused.\n\nManage at yalla.house/owner\n\nYalla.House', true),
  ('price_changed', 'email', 'Price update: {{address}}', 'Hi {{hunter_name}},\n\nA property you saved has updated its price:\n\n{{address}}\nNew price: {{new_price}}\n\nView listing: {{listing_link}}\n\nYalla.House', true)
ON CONFLICT DO NOTHING;
