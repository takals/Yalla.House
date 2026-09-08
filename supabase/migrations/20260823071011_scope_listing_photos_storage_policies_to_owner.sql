-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260823071011.

-- The listing-photos policies granted UPDATE and DELETE to *any* authenticated
-- user on the whole bucket — the only condition was bucket_id. Any signed-in
-- account could therefore overwrite or delete every listing photo on the
-- platform. INSERT was equally unscoped.
--
-- Objects are stored as "<listing_id>/<file>" (and "<listing_id>/docs/<file>"),
-- so the first path segment identifies the listing. Scope every write to the
-- listing's owner, or an agent assigned to it. The uuid cast is guarded by a
-- shape check so a stray object name can never error the policy.

DROP POLICY IF EXISTS "Users can delete listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing photos" ON storage.objects;

CREATE POLICY "Listing owners can upload listing photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = ((storage.foldername(name))[1])::uuid
        AND (l.owner_id = (SELECT auth.uid()) OR public.is_assigned_agent(l.id))
    )
  );

CREATE POLICY "Listing owners can update listing photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = ((storage.foldername(name))[1])::uuid
        AND (l.owner_id = (SELECT auth.uid()) OR public.is_assigned_agent(l.id))
    )
  );

CREATE POLICY "Listing owners can delete listing photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = ((storage.foldername(name))[1])::uuid
        AND (l.owner_id = (SELECT auth.uid()) OR public.is_assigned_agent(l.id))
    )
  );

-- Public read is intentional: the bucket serves listing images on public pages.
-- Left as-is so nothing breaks; it grants reads, not enumeration of other buckets.
