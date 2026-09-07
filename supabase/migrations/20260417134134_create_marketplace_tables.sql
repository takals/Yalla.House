-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260417134134.

-- ============================================================
-- MARKETPLACE SCHEMA
-- ============================================================

-- 1. Service Categories (the catalogue of service types)
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_de text NOT NULL,
  description_en text,
  description_de text,
  icon text,                          -- lucide icon name
  tier text NOT NULL CHECK (tier IN ('transaction', 'lettings', 'moving')),
  phase text NOT NULL DEFAULT 'phase_1' CHECK (phase IN ('phase_1', 'phase_2', 'phase_3')),
  revenue_model text,                 -- 'lead_fee', 'commission', 'affiliate', 'subscription', 'introducer'
  typical_price_gbp text,             -- human-readable range e.g. '£800–1,500'
  revenue_per_unit text,              -- e.g. '£25–50 per lead'
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service categories are publicly readable"
  ON public.service_categories FOR SELECT USING (true);

-- 2. Providers (businesses that offer services)
CREATE TABLE public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),  -- null if unclaimed
  business_name text NOT NULL,
  slug text UNIQUE,
  email text,
  phone text,
  website text,
  description_en text,
  description_de text,
  logo_url text,
  status text NOT NULL DEFAULT 'unclaimed' CHECK (status IN ('unclaimed', 'pending', 'active', 'suspended', 'deactivated')),
  -- Accreditations
  accreditation_body text,            -- 'propertymark', 'rics', 'law_society', 'gas_safe', 'niceic', etc.
  accreditation_ref text,             -- registration number
  accreditation_verified boolean NOT NULL DEFAULT false,
  -- Ratings
  avg_rating numeric(3,2) DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  -- Source tracking
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'directory_seed', 'va_outreach', 'organic', 'referral')),
  source_url text,                    -- original directory listing URL
  -- Featured
  is_featured boolean NOT NULL DEFAULT false,
  featured_until timestamptz,
  -- Stripe
  stripe_connect_id text,
  -- Timestamps
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers are publicly readable when active or unclaimed"
  ON public.providers FOR SELECT
  USING (status IN ('active', 'unclaimed'));
CREATE POLICY "Provider can update own profile"
  ON public.providers FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create providers"
  ON public.providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Provider ↔ Service Category junction
CREATE TABLE public.provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  custom_price text,                  -- provider's own pricing text
  min_price_pence int,                -- for sorting/filtering
  max_price_pence int,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, category_id)
);

ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Provider services are publicly readable"
  ON public.provider_services FOR SELECT USING (true);
CREATE POLICY "Provider can manage own services"
  ON public.provider_services FOR ALL
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

-- 4. Provider coverage areas (postcodes/areas they serve)
CREATE TABLE public.provider_coverage_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  postcode_prefix text NOT NULL,      -- e.g. 'IG1', 'E7', 'RM6'
  area_name text,                     -- human-readable e.g. 'Ilford', 'Forest Gate'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, postcode_prefix)
);

ALTER TABLE public.provider_coverage_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coverage areas are publicly readable"
  ON public.provider_coverage_areas FOR SELECT USING (true);
CREATE POLICY "Provider can manage own areas"
  ON public.provider_coverage_areas FOR ALL
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

-- 5. Provider portfolio images
CREATE TABLE public.provider_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Portfolio images are publicly readable"
  ON public.provider_portfolio FOR SELECT USING (true);
CREATE POLICY "Provider can manage own portfolio"
  ON public.provider_portfolio FOR ALL
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

-- 6. Quote requests (user asks for quotes from providers)
CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  category_id uuid NOT NULL REFERENCES public.service_categories(id),
  listing_id uuid REFERENCES public.listings(id),   -- optional: link to property
  provider_id uuid REFERENCES public.providers(id),  -- null = broadcast to top 3
  postcode text NOT NULL,
  details text,                       -- free text description of what they need
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'quoted', 'accepted', 'declined', 'expired')),
  budget_pence int,                   -- optional budget hint
  preferred_date date,                -- when they need the service
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own quote requests"
  ON public.quote_requests FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Providers can see quote requests for them"
  ON public.quote_requests FOR SELECT
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));
CREATE POLICY "Users can create quote requests"
  ON public.quote_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Quotes (provider responds to a quote request)
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id uuid NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.providers(id),
  price_pence int NOT NULL,
  description text,                   -- what's included
  valid_until date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quote request owner can see quotes"
  ON public.quotes FOR SELECT
  USING (quote_request_id IN (SELECT id FROM public.quote_requests WHERE user_id = auth.uid()));
CREATE POLICY "Provider can see and create own quotes"
  ON public.quotes FOR ALL
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

-- 8. Reviews (user reviews a provider after service completion)
CREATE TABLE public.provider_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id),
  category_id uuid REFERENCES public.service_categories(id),
  quote_request_id uuid REFERENCES public.quote_requests(id),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'flagged', 'removed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quote_request_id, user_id)  -- one review per quote request
);

ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are publicly readable"
  ON public.provider_reviews FOR SELECT USING (status = 'published');
CREATE POLICY "Users can create reviews"
  ON public.provider_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 9. Mortgage referrals (introducer model tracking)
CREATE TABLE public.mortgage_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  listing_id uuid REFERENCES public.listings(id),
  partner text NOT NULL,              -- 'habito', 'london_country', 'mojo', 'local_broker'
  property_value_pence int,
  deposit_pence int,
  annual_income_pence int,
  status text NOT NULL DEFAULT 'referred' CHECK (status IN ('referred', 'contacted', 'applied', 'approved', 'completed', 'declined')),
  referral_fee_pence int,             -- what Yalla earns
  partner_ref text,                   -- partner's reference ID
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mortgage_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own mortgage referrals"
  ON public.mortgage_referrals FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create mortgage referrals"
  ON public.mortgage_referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 10. Trigger: auto-update provider avg_rating on new review
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE public.providers SET
    avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.provider_reviews WHERE provider_id = NEW.provider_id AND status = 'published'),
    review_count = (SELECT COUNT(*) FROM public.provider_reviews WHERE provider_id = NEW.provider_id AND status = 'published'),
    updated_at = now()
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_provider_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.provider_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_provider_rating();

-- 11. Indexes for performance
CREATE INDEX idx_providers_status ON public.providers(status);
CREATE INDEX idx_providers_slug ON public.providers(slug);
CREATE INDEX idx_provider_services_category ON public.provider_services(category_id);
CREATE INDEX idx_provider_coverage_postcode ON public.provider_coverage_areas(postcode_prefix);
CREATE INDEX idx_quote_requests_user ON public.quote_requests(user_id);
CREATE INDEX idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX idx_quotes_provider ON public.quotes(provider_id);
CREATE INDEX idx_mortgage_referrals_user ON public.mortgage_referrals(user_id);
CREATE INDEX idx_provider_reviews_provider ON public.provider_reviews(provider_id);
