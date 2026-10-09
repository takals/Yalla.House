-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260725071604.

-- The old policy was: INSERT TO PUBLIC WITH CHECK (true) — an untrusted client could
-- set ANY column, including pipeline-internal state: status='converted', a forged
-- viewing_id, reply_sent_at, or a reply_link pointing anywhere (a phishing vector,
-- since that link is presumably surfaced to staff or the lead).
--
-- This replaces it with a policy that still accepts a normal public lead submission
-- (listing_id, channel, source, contact_*, raw_message) but rejects any attempt to
-- write pipeline fields, and caps free-text length to stop payload stuffing.
--
-- Safe either way: if leads are inserted server-side with the service role, that role
-- bypasses RLS entirely and this changes nothing. If they are inserted from the
-- browser with the anon key, a legitimate submission still passes.
--
-- NOT constrained: `channel` — the table is empty so the permitted values could not be
-- observed, and guessing them would silently reject real leads. Add a CHECK constraint
-- once the vocabulary is known.

DROP POLICY IF EXISTS "Service can insert leads" ON public.inbound_leads;

CREATE POLICY "Public can submit leads with safe fields only"
  ON public.inbound_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- new leads only enter the pipeline at the start
    status = 'pending'
    -- pipeline-internal columns must not be client-supplied
    AND matched_by     IS NULL
    AND reply_sent_at  IS NULL
    AND reply_channel  IS NULL
    AND reply_link     IS NULL
    AND link_clicked_at IS NULL
    AND viewing_id     IS NULL
    -- payload-stuffing limits
    AND length(coalesce(raw_message,   '')) <= 5000
    AND length(coalesce(contact_name,  '')) <= 200
    AND length(coalesce(contact_email, '')) <= 320
    AND length(coalesce(contact_phone, '')) <= 32
    AND length(coalesce(source,        '')) <= 200
    AND length(channel) <= 50
  );
