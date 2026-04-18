-- Fix infinite recursion in listings RLS policies
-- The listings_agent_read policy does a subquery on listing_agent_assignments,
-- which triggers RLS evaluation on that table, which can recurse back.
-- Solution: use a SECURITY DEFINER function to bypass RLS on the subquery.

-- Step 1: Create a helper function that checks agent assignment without RLS
CREATE OR REPLACE FUNCTION public.is_assigned_agent(p_listing_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.listing_agent_assignments
    WHERE listing_id = p_listing_id
      AND agent_id = auth.uid()
      AND status IN ('accepted', 'active')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = '';

-- Step 2: Drop the problematic policy
DROP POLICY IF EXISTS "listings_agent_read" ON listings;

-- Step 3: Recreate it using the SECURITY DEFINER function (no RLS recursion)
CREATE POLICY "listings_agent_read" ON listings
  FOR SELECT USING (
    public.is_assigned_agent(id)
  );

-- Step 4: Add public SELECT policy for active/under_offer listings
-- so anonymous visitors and hunters can view published listings
DROP POLICY IF EXISTS "listings_public_read" ON listings;
CREATE POLICY "listings_public_read" ON listings
  FOR SELECT USING (
    status IN ('active', 'under_offer')
  );
