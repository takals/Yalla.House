-- =============================================================================
-- PASSPORT READINESS BADGES
-- Adds verification status columns to hunter_profiles so agents can see at a
-- glance which hunters are verified, financed, and ready to move.
-- =============================================================================

ALTER TABLE hunter_profiles
  ADD COLUMN IF NOT EXISTS mortgage_verified  boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS identity_verified  boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_complete   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS renter_ready       boolean DEFAULT false;

-- Auto-compute profile_complete when key fields are filled
-- (trigger runs on INSERT or UPDATE to hunter_profiles)
CREATE OR REPLACE FUNCTION compute_profile_complete()
RETURNS trigger AS $$
BEGIN
  NEW.profile_complete := (
    NEW.intent IS NOT NULL
    AND NEW.target_areas IS NOT NULL
    AND jsonb_array_length(COALESCE(NEW.target_areas, '[]'::jsonb)) > 0
    AND NEW.budget_max IS NOT NULL
    AND NEW.property_types IS NOT NULL
    AND array_length(NEW.property_types, 1) > 0
    AND NEW.finance_status IS NOT NULL
    AND NEW.timeline IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_profile_complete ON hunter_profiles;
CREATE TRIGGER trg_compute_profile_complete
  BEFORE INSERT OR UPDATE ON hunter_profiles
  FOR EACH ROW EXECUTE FUNCTION compute_profile_complete();
