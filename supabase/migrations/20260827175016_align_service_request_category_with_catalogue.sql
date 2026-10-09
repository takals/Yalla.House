-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260827175016.

-- service_requests.category was an enum of 9 labels (photography, floorplan,
-- epc, survey, conveyancing, cleaning, staging, drone, other) while the rest of
-- the product speaks in service_categories.slug (20 values). partner_profiles
-- .service_types holds slugs, and route-service-request matches
-- service_types.includes(category) — so a request could never be routed unless
-- its category happened to be one of the four labels that spell the same in
-- both vocabularies. Move the column onto the catalogue so there is one
-- vocabulary end to end. Safe to convert in place: the table has no rows.

ALTER TABLE public.service_requests
  ALTER COLUMN category TYPE text USING category::text;

ALTER TABLE public.service_requests
  ADD CONSTRAINT service_requests_category_fkey
  FOREIGN KEY (category) REFERENCES public.service_categories(slug)
  ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS service_requests_open_pool_idx
  ON public.service_requests (category, status)
  WHERE partner_id IS NULL;

-- A verified partner could not see an unrouted job: the only SELECT policy for
-- partners was auth.uid() = partner_id, so every request the router notified
-- them about returned nothing on /partner/requests. Open the pool, but only to
-- partners we have verified and only for the categories they actually offer.
DROP POLICY IF EXISTS svcr_partner_open_pool ON public.service_requests;
CREATE POLICY svcr_partner_open_pool ON public.service_requests
  FOR SELECT TO authenticated
  USING (
    partner_id IS NULL
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.partner_profiles pp
      WHERE pp.user_id = auth.uid()
        AND pp.verified_at IS NOT NULL
        AND pp.service_types @> ARRAY[service_requests.category]
    )
  );
