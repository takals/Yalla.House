-- Role-check helper + tightened INSERT policies
-- Ensures users can only insert into tables matching their active role

-- Helper: check if the current user has a specific active role
CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = required_role
      AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = '';

-- Agent profiles: only users with 'agent' role can insert
CREATE POLICY "agent_profiles_insert_role_check" ON agent_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND public.has_role('agent')
  );

-- Owner profiles: only users with 'owner' role can insert
CREATE POLICY "owner_profiles_insert_role_check" ON owner_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND public.has_role('owner')
  );

-- Hunter profiles: only users with 'hunter' role can insert
CREATE POLICY "hunter_profiles_insert_role_check" ON hunter_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND public.has_role('hunter')
  );

-- Listings: replace broad ALL policy with scoped ones
DO $$ BEGIN
  DROP POLICY IF EXISTS "listings_owner_all" ON listings;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "listings_owner_select" ON listings
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "listings_owner_insert" ON listings
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id
    AND public.has_role('owner')
  );

CREATE POLICY "listings_owner_update" ON listings
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "listings_owner_delete" ON listings
  FOR DELETE USING (auth.uid() = owner_id);

-- Allow agents to read listings they're assigned to
CREATE POLICY "listings_agent_read" ON listings
  FOR SELECT USING (
    id IN (
      SELECT listing_id FROM listing_agent_assignments
      WHERE agent_id = auth.uid() AND status IN ('accepted', 'active')
    )
  );
