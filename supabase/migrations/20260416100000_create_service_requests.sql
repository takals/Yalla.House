-- Service Requests table: Service Partner routing
-- Enums (service_category, service_request_status) already exist

CREATE TABLE IF NOT EXISTS service_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      uuid REFERENCES listings(id) ON DELETE SET NULL,
  requester_id    uuid NOT NULL REFERENCES users(id),
  partner_id      uuid REFERENCES users(id),
  category        service_category       NOT NULL,
  status          service_request_status NOT NULL DEFAULT 'pending',
  title           text NOT NULL,
  description     text,
  preferred_date  date,
  preferred_time  text,
  address         text,
  postcode        text,
  quoted_amount   integer,
  final_amount    integer,
  currency        char(3) DEFAULT 'GBP',
  scheduled_at    timestamptz,
  completed_at    timestamptz,
  deliverables    jsonb DEFAULT '[]'::jsonb,
  rating          smallint CHECK (rating BETWEEN 1 AND 5),
  review          text,
  country         char(2) DEFAULT 'GB',
  metadata        jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_svcr_listing    ON service_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_svcr_requester  ON service_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_svcr_partner    ON service_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_svcr_status     ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_svcr_category   ON service_requests(category);
CREATE INDEX IF NOT EXISTS idx_svcr_postcode   ON service_requests(postcode);

CREATE TRIGGER trg_svcr_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "svcr_requester" ON service_requests
  FOR ALL USING (auth.uid() = requester_id);

CREATE POLICY "svcr_partner_read" ON service_requests
  FOR SELECT USING (auth.uid() = partner_id);

CREATE POLICY "svcr_partner_update" ON service_requests
  FOR UPDATE USING (auth.uid() = partner_id)
  WITH CHECK (auth.uid() = partner_id);

CREATE POLICY "svcr_listing_owner" ON service_requests
  FOR SELECT USING (
    listing_id IS NOT NULL AND
    auth.uid() IN (SELECT owner_id FROM listings WHERE id = service_requests.listing_id)
  );
