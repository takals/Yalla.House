-- providers, provider_services and provider_coverage_areas all had RLS ENABLED
-- and ZERO policies, so nobody but the service role could read a single row.
-- The marketplace counted 0 providers in every category and the category pages
-- showed an empty directory no matter how many providers existed. The
-- marketplace is a public directory, so listed providers should be readable by
-- anyone; contact details should not be, which is handled by column privileges
-- below rather than by the row policy.

DROP POLICY IF EXISTS providers_public_read ON public.providers;
CREATE POLICY providers_public_read ON public.providers
  FOR SELECT USING (status = 'active');

-- A provider still sees their own row while it is pending or suspended.
DROP POLICY IF EXISTS providers_owner_read ON public.providers;
CREATE POLICY providers_owner_read ON public.providers
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS provider_services_public_read ON public.provider_services;
CREATE POLICY provider_services_public_read ON public.provider_services
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.providers p
            WHERE p.id = provider_services.provider_id
              AND (p.status = 'active' OR p.user_id = auth.uid()))
  );

DROP POLICY IF EXISTS provider_coverage_public_read ON public.provider_coverage_areas;
CREATE POLICY provider_coverage_public_read ON public.provider_coverage_areas
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.providers p
            WHERE p.id = provider_coverage_areas.provider_id
              AND (p.status = 'active' OR p.user_id = auth.uid()))
  );

-- No public contact details: in-app messaging only. RLS is row-level, so the
-- email and phone columns are withheld with column privileges instead. The
-- service role is unaffected, so registration and the sign-in claim still
-- read and write them.
REVOKE SELECT (email, phone) ON public.providers FROM anon;
REVOKE SELECT (email, phone) ON public.providers FROM authenticated;
