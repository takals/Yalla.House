-- Fix listings RLS policy to support INSERT operations
-- Issue: FOR ALL without WITH CHECK clause blocks INSERT even when auth.uid() matches owner_id
-- Solution: Add WITH CHECK clause to properly validate INSERT/UPDATE operations

DROP POLICY IF EXISTS "listings_owner_all" ON listings;

CREATE POLICY "listings_owner_all" ON listings
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
