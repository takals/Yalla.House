-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260725064956.

-- Every foreign key in public lacking a supporting index. Unindexed FKs force a
-- sequential scan on the child table for each parent DELETE/UPDATE, and make joins
-- across the listing/viewing/messaging graph scale badly. Additive and reversible.

CREATE INDEX IF NOT EXISTS idx_agent_hunter_assignments_agent_id ON public.agent_hunter_assignments (agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_inbound_emails_agent_user_id ON public.agent_inbound_emails (agent_user_id);
CREATE INDEX IF NOT EXISTS idx_agent_inbound_listings_reviewed_by ON public.agent_inbound_listings (reviewed_by);
CREATE INDEX IF NOT EXISTS idx_agent_inbound_listings_agent_user_id ON public.agent_inbound_listings (agent_user_id);
CREATE INDEX IF NOT EXISTS idx_agent_inbox_sources_hunter_id ON public.agent_inbox_sources (hunter_id);
CREATE INDEX IF NOT EXISTS idx_agent_invites_converted_assignment_id ON public.agent_invites (converted_assignment_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_owner_id ON public.availability_slots (owner_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_viewing_id ON public.availability_slots (viewing_id);
CREATE INDEX IF NOT EXISTS idx_billing_records_plan_id ON public.billing_records (plan_id);
CREATE INDEX IF NOT EXISTS idx_billing_records_user_id ON public.billing_records (user_id);
CREATE INDEX IF NOT EXISTS idx_blackout_dates_owner_id ON public.blackout_dates (owner_id);
CREATE INDEX IF NOT EXISTS idx_blocked_agents_agent_id ON public.blocked_agents (agent_id);
CREATE INDEX IF NOT EXISTS idx_hunter_consent_log_agent_id ON public.hunter_consent_log (agent_id);
CREATE INDEX IF NOT EXISTS idx_inbound_leads_viewing_id ON public.inbound_leads (viewing_id);
CREATE INDEX IF NOT EXISTS idx_listing_media_listing_id ON public.listing_media (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_portal_status_portal_id ON public.listing_portal_status (portal_id);
CREATE INDEX IF NOT EXISTS idx_listing_status_log_changed_by ON public.listing_status_log (changed_by);
CREATE INDEX IF NOT EXISTS idx_listings_agent_id ON public.listings (agent_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_viewing_id ON public.message_threads (viewing_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_offer_id ON public.message_threads (offer_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_listing_id ON public.message_threads (listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_referrals_listing_id ON public.mortgage_referrals (listing_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_user_id ON public.newsletter_subscribers (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_template_id ON public.notification_log (template_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_listing_id ON public.notification_log (listing_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_listing_id ON public.notification_templates (listing_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON public.notifications (actor_id);
CREATE INDEX IF NOT EXISTS idx_offers_agent_id ON public.offers (agent_id);
CREATE INDEX IF NOT EXISTS idx_payouts_referrer_id ON public.payouts (referrer_id);
CREATE INDEX IF NOT EXISTS idx_portal_config_country_code ON public.portal_config (country_code);
CREATE INDEX IF NOT EXISTS idx_portal_credentials_portal_id ON public.portal_credentials (portal_id);
CREATE INDEX IF NOT EXISTS idx_portal_field_mappings_portal_id ON public.portal_field_mappings (portal_id);
CREATE INDEX IF NOT EXISTS idx_property_matches_source_id ON public.property_matches (source_id);
CREATE INDEX IF NOT EXISTS idx_prospective_agents_registered_user_id ON public.prospective_agents (registered_user_id);
CREATE INDEX IF NOT EXISTS idx_provider_portfolio_provider_id ON public.provider_portfolio (provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_reviews_category_id ON public.provider_reviews (category_id);
CREATE INDEX IF NOT EXISTS idx_provider_reviews_user_id ON public.provider_reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON public.providers (user_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_category_id ON public.quote_requests (category_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_listing_id ON public.quote_requests (listing_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_provider_id ON public.quote_requests (provider_id);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_request_id ON public.quotes (quote_request_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals (referred_user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_country_code ON public.subscription_plans (country_code);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON public.thread_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_users_referrer_id ON public.users (referrer_id);
CREATE INDEX IF NOT EXISTS idx_viewings_agent_id ON public.viewings (agent_id);
CREATE INDEX IF NOT EXISTS idx_viewings_hunter_id ON public.viewings (hunter_id);
CREATE INDEX IF NOT EXISTS idx_viewings_listing_id ON public.viewings (listing_id);
CREATE INDEX IF NOT EXISTS idx_viewings_slot_id ON public.viewings (slot_id);
