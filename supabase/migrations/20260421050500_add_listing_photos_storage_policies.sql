-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260421050500.

-- Allow authenticated users to upload files to listing-photos bucket
CREATE POLICY "Authenticated users can upload listing photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-photos');

-- Allow anyone to read listing photos (public bucket)
CREATE POLICY "Public can read listing photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-photos');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update listing photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listing-photos');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete listing photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listing-photos');
