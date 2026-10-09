-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260417094800.

-- 1. Add search_status to hunter_profiles
-- Tracks how actively the hunter is looking
ALTER TABLE public.hunter_profiles
  ADD COLUMN IF NOT EXISTS search_status text
    CHECK (search_status IN ('actively_searching', 'thinking_about_it', 'just_exploring', 'need_to_sell_first', 'waiting_for_right_one'))
    DEFAULT NULL;

-- 2. Add early_access_tier to hunter_profiles
-- none = no passport, standard = passport complete, priority = mortgage + identity verified
ALTER TABLE public.hunter_profiles
  ADD COLUMN IF NOT EXISTS early_access_tier text
    CHECK (early_access_tier IN ('none', 'standard', 'priority'))
    DEFAULT 'none' NOT NULL;

-- 3. Add readiness_score (computed on write via trigger)
ALTER TABLE public.hunter_profiles
  ADD COLUMN IF NOT EXISTS readiness_score integer DEFAULT 0 NOT NULL;

-- 4. Trigger function to compute readiness_score + early_access_tier on every update
CREATE OR REPLACE FUNCTION public.compute_hunter_readiness()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  score integer := 0;
  tier text := 'none';
BEGIN
  -- Passport completeness (up to 40 points)
  IF NEW.intent IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.target_areas IS NOT NULL AND NEW.target_areas::text != '[]' AND NEW.target_areas::text != 'null' THEN score := score + 5; END IF;
  IF NEW.budget_max IS NOT NULL AND NEW.budget_max > 0 THEN score := score + 5; END IF;
  IF NEW.property_types IS NOT NULL AND array_length(NEW.property_types, 1) > 0 THEN score := score + 5; END IF;
  IF NEW.min_bedrooms IS NOT NULL THEN score := score + 3; END IF;
  IF NEW.finance_status IS NOT NULL AND NEW.finance_status != 'not_specified' THEN score := score + 7; END IF;
  IF NEW.timeline IS NOT NULL AND NEW.timeline != 'flexible' THEN score := score + 5; END IF;
  IF NEW.search_status IS NOT NULL THEN score := score + 5; END IF;

  -- Finance verification (up to 25 points)
  IF NEW.finance_status = 'mortgage_approved' THEN score := score + 15;
  ELSIF NEW.finance_status = 'cash' THEN score := score + 20;
  ELSIF NEW.finance_status = 'mortgage_pending' THEN score := score + 8;
  END IF;

  -- Identity verification (15 points)
  IF NEW.identity_verified THEN score := score + 15; END IF;

  -- Search urgency (up to 15 points)
  IF NEW.search_status = 'actively_searching' THEN score := score + 15;
  ELSIF NEW.search_status = 'need_to_sell_first' THEN score := score + 10;
  ELSIF NEW.search_status = 'thinking_about_it' THEN score := score + 7;
  ELSIF NEW.search_status = 'waiting_for_right_one' THEN score := score + 5;
  ELSIF NEW.search_status = 'just_exploring' THEN score := score + 2;
  END IF;

  -- Timeline bonus (up to 5 points)
  IF NEW.timeline = 'asap' THEN score := score + 5;
  ELSIF NEW.timeline = '3m' THEN score := score + 4;
  ELSIF NEW.timeline = '6m' THEN score := score + 2;
  END IF;

  -- Cap at 100
  IF score > 100 THEN score := 100; END IF;

  NEW.readiness_score := score;

  -- Compute early_access_tier
  -- Priority: mortgage approved/cash + identity verified
  IF (NEW.finance_status IN ('mortgage_approved', 'cash')) AND NEW.identity_verified THEN
    tier := 'priority';
  -- Standard: passport basically complete (intent + budget + areas set)
  ELSIF NEW.intent IS NOT NULL AND NEW.budget_max IS NOT NULL AND NEW.budget_max > 0
        AND NEW.target_areas IS NOT NULL AND NEW.target_areas::text != '[]' AND NEW.target_areas::text != 'null' THEN
    tier := 'standard';
  ELSE
    tier := 'none';
  END IF;

  NEW.early_access_tier := tier;

  -- Also update profile_complete flag
  NEW.profile_complete := (
    NEW.intent IS NOT NULL
    AND NEW.target_areas IS NOT NULL AND NEW.target_areas::text != '[]' AND NEW.target_areas::text != 'null'
    AND NEW.budget_max IS NOT NULL AND NEW.budget_max > 0
    AND NEW.property_types IS NOT NULL AND array_length(NEW.property_types, 1) > 0
    AND NEW.finance_status IS NOT NULL AND NEW.finance_status != 'not_specified'
    AND NEW.timeline IS NOT NULL
    AND NEW.search_status IS NOT NULL
  );

  RETURN NEW;
END;
$$;

-- 5. Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS trg_compute_hunter_readiness ON public.hunter_profiles;
CREATE TRIGGER trg_compute_hunter_readiness
  BEFORE INSERT OR UPDATE ON public.hunter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_hunter_readiness();

-- 6. Add pre_market_opt_in to listings (owners opt in to early viewings)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS pre_market_opt_in boolean DEFAULT false NOT NULL;

-- 7. Recompute existing rows
UPDATE public.hunter_profiles SET readiness_score = readiness_score WHERE true;
