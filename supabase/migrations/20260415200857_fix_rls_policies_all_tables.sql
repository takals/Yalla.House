-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260415200857.

-- Reference data: public read
DROP POLICY IF EXISTS "country_config_public_read" ON country_config;
CREATE POLICY "country_config_public_read" ON country_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "property_tags_public_read" ON property_tags;
CREATE POLICY "property_tags_public_read" ON property_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "plans_public_read" ON subscription_plans;
CREATE POLICY "plans_public_read" ON subscription_plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "portal_config_public_read" ON portal_config;
CREATE POLICY "portal_config_public_read" ON portal_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "portal_field_mappings_public_read" ON portal_field_mappings;
CREATE POLICY "portal_field_mappings_public_read" ON portal_field_mappings FOR SELECT USING (true);

-- User profiles: own row
DROP POLICY IF EXISTS "hunter_profiles_own" ON hunter_profiles;
CREATE POLICY "hunter_profiles_own" ON hunter_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_profiles_own" ON owner_profiles;
CREATE POLICY "owner_profiles_own" ON owner_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "partner_profiles_own" ON partner_profiles;
CREATE POLICY "partner_profiles_own" ON partner_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_roles_own" ON user_roles;
CREATE POLICY "user_roles_own" ON user_roles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Availability slots
DROP POLICY IF EXISTS "slots_owner_manage" ON availability_slots;
CREATE POLICY "slots_owner_manage" ON availability_slots FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "slots_public_read" ON availability_slots;
CREATE POLICY "slots_public_read" ON availability_slots FOR SELECT USING (is_booked = false AND starts_at > now());

-- Viewings
DROP POLICY IF EXISTS "viewings_hunter" ON viewings;
CREATE POLICY "viewings_hunter" ON viewings FOR ALL USING (auth.uid() = hunter_id);
DROP POLICY IF EXISTS "viewings_agent" ON viewings;
CREATE POLICY "viewings_agent" ON viewings FOR ALL USING (auth.uid() = agent_id);
DROP POLICY IF EXISTS "viewings_owner" ON viewings;
CREATE POLICY "viewings_owner" ON viewings FOR SELECT USING (listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid()));

-- Listing media
DROP POLICY IF EXISTS "listing_media_public_read" ON listing_media;
CREATE POLICY "listing_media_public_read" ON listing_media FOR SELECT USING (listing_id IN (SELECT id FROM listings WHERE status IN ('active','under_offer')));
DROP POLICY IF EXISTS "listing_media_owner_manage" ON listing_media;
CREATE POLICY "listing_media_owner_manage" ON listing_media FOR ALL USING (listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid()));

-- Listing features
DROP POLICY IF EXISTS "listing_features_public_read" ON listing_features;
CREATE POLICY "listing_features_public_read" ON listing_features FOR SELECT USING (listing_id IN (SELECT id FROM listings WHERE status IN ('active','under_offer')));
DROP POLICY IF EXISTS "listing_features_owner_manage" ON listing_features;
CREATE POLICY "listing_features_owner_manage" ON listing_features FOR ALL USING (listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid()));

-- Listing portal status
DROP POLICY IF EXISTS "listing_portal_status_owner" ON listing_portal_status;
CREATE POLICY "listing_portal_status_owner" ON listing_portal_status FOR ALL USING (listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid()));

-- Listing agent assignments
DROP POLICY IF EXISTS "laa_agent" ON listing_agent_assignments;
CREATE POLICY "laa_agent" ON listing_agent_assignments FOR ALL USING (auth.uid() = agent_id);
DROP POLICY IF EXISTS "laa_owner" ON listing_agent_assignments;
CREATE POLICY "laa_owner" ON listing_agent_assignments FOR SELECT USING (listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid()));

-- Notifications
DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Message threads
DROP POLICY IF EXISTS "threads_participant" ON message_threads;
CREATE POLICY "threads_participant" ON message_threads FOR ALL USING (id IN (SELECT thread_id FROM thread_participants WHERE user_id = auth.uid()));

-- Thread participants
DROP POLICY IF EXISTS "tp_own" ON thread_participants;
CREATE POLICY "tp_own" ON thread_participants FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "tp_thread_members" ON thread_participants;
CREATE POLICY "tp_thread_members" ON thread_participants FOR SELECT USING (thread_id IN (SELECT thread_id FROM thread_participants WHERE user_id = auth.uid()));

-- Referrers
DROP POLICY IF EXISTS "referrers_own" ON referrers;
CREATE POLICY "referrers_own" ON referrers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Referral events
DROP POLICY IF EXISTS "referral_events_own" ON referral_events;
CREATE POLICY "referral_events_own" ON referral_events FOR SELECT USING (true);

-- Payouts
DROP POLICY IF EXISTS "payouts_own" ON payouts;
CREATE POLICY "payouts_own" ON payouts FOR SELECT USING (referrer_id IN (SELECT id FROM referrers WHERE user_id = auth.uid()));

-- Portal credentials: admin-only (deny all via API, service role only)
DROP POLICY IF EXISTS "portal_credentials_deny" ON portal_credentials;
CREATE POLICY "portal_credentials_deny" ON portal_credentials FOR SELECT USING (false);

-- Agent staging: deny via API
DROP POLICY IF EXISTS "agent_staging_deny" ON agent_staging;
CREATE POLICY "agent_staging_deny" ON agent_staging FOR SELECT USING (false);
