-- Add buyer_status to hunter_profiles
-- Values: mortgage_in_principle, cash_buyer, first_time_buyer, in_chain, selling_to_buy, exploring

ALTER TABLE hunter_profiles
  ADD COLUMN IF NOT EXISTS buyer_status text,
  ADD COLUMN IF NOT EXISTS phone text;

-- Update the compute_profile_complete trigger to include buyer_status
CREATE OR REPLACE FUNCTION compute_profile_complete()
RETURNS trigger AS $$
BEGIN
  NEW.profile_complete := (
    NEW.intent IS NOT NULL
    AND NEW.budget_max IS NOT NULL
    AND NEW.timeline IS NOT NULL
    AND NEW.buyer_status IS NOT NULL
    AND NEW.target_areas IS NOT NULL
    AND jsonb_array_length(COALESCE(NEW.target_areas, '[]'::jsonb)) > 0
    AND NEW.property_types IS NOT NULL
    AND array_length(NEW.property_types, 1) > 0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN hunter_profiles.buyer_status IS 'Buyer qualification: mortgage_in_principle, cash_buyer, first_time_buyer, in_chain, selling_to_buy, exploring';
