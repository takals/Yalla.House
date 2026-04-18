-- Migration: Add notification preference/log columns + seed default templates
-- Created: 2026-04-18

-- =============================================================================
-- 1. Schema additions
-- =============================================================================

-- Add phone_verified, timezone, push_enabled to notification_preferences
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Europe/London';
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS push_enabled boolean DEFAULT false;

-- Add retries column to notification_log
ALTER TABLE notification_log ADD COLUMN IF NOT EXISTS retries integer DEFAULT 0;

-- =============================================================================
-- 2. Seed default notification templates (listing_id = NULL = platform defaults)
-- =============================================================================

-- Email templates
INSERT INTO notification_templates (listing_id, event_type, channel, subject, body_template, is_active, is_custom) VALUES
  (NULL, 'viewing_confirmed_hunter', 'email',
    'Viewing confirmed — {{listingTitle}}',
    E'Hi {{hunterName}},\n\nYour viewing for {{listingTitle}} in {{listingCity}} has been confirmed.\n\nDate: {{viewingDate}}\nTime: {{viewingTime}}\n{{#if videoLink}}Video link: {{videoLink}}{{/if}}\n\nView your dashboard: {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_confirmed_owner', 'email',
    'Viewing confirmed — {{hunterName}}',
    E'Hi {{ownerName}},\n\nA viewing for {{listingTitle}} has been confirmed with {{hunterName}}.\n\nDate: {{viewingDate}}\nTime: {{viewingTime}}\n\nView details: {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_reminder_24h_hunter', 'email',
    'Reminder: viewing tomorrow — {{listingTitle}}',
    E'Hi {{hunterName}},\n\nJust a reminder that your viewing at {{listingTitle}} is scheduled for tomorrow.\n\nDate: {{viewingDate}}\nTime: {{viewingTime}}\n{{#if videoLink}}Video link: {{videoLink}}{{/if}}\n\nView details: {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_reminder_24h_owner', 'email',
    'Reminder: viewing tomorrow — {{listingTitle}}',
    E'Hi {{ownerName}},\n\nReminder: a viewing for {{listingTitle}} is scheduled for tomorrow with {{hunterName}}.\n\nDate: {{viewingDate}}\nTime: {{viewingTime}}\n\nView details: {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_reminder_1h_hunter', 'email',
    'Your viewing is in 1 hour — {{listingTitle}}',
    E'Hi {{hunterName}},\n\nYour viewing at {{listingTitle}} starts in 1 hour.\n\n{{#if videoLink}}Join video call: {{videoLink}}{{/if}}\n\nView details: {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_reminder_1h_owner', 'email',
    'Viewing in 1 hour — {{listingTitle}}',
    E'Hi {{ownerName}},\n\nThe viewing for {{listingTitle}} with {{hunterName}} starts in 1 hour.\n\nView details: {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_checkin_hunter', 'email',
    'How was your viewing? — {{listingTitle}}',
    E'Hi {{hunterName}},\n\nWe hope your viewing at {{listingTitle}} went well. We would love to hear your feedback.\n\nLeave feedback: {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_completed_owner', 'email',
    'Viewing summary — {{listingTitle}}',
    E'Hi {{ownerName}},\n\nThe viewing for {{listingTitle}} has been completed. Check your dashboard for any hunter feedback.\n\nView details: {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_request_owner', 'email',
    'New viewing request — {{listingTitle}}',
    E'Hi {{ownerName}},\n\n{{hunterName}} has requested a viewing for {{listingTitle}}.\n\nReview and respond: {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_declined_hunter', 'email',
    'Viewing update — {{listingTitle}}',
    E'Hi {{hunterName}},\n\nUnfortunately, the owner cannot offer a viewing for {{listingTitle}} at this time.\n\nBrowse more listings: {{dashboardUrl}}',
    true, false);

-- SMS templates (subject = NULL for SMS)
INSERT INTO notification_templates (listing_id, event_type, channel, subject, body_template, is_active, is_custom) VALUES
  (NULL, 'viewing_confirmed_hunter', 'sms',
    NULL,
    'Yalla.House: Your viewing for {{listingTitle}} is confirmed — {{viewingDate}} at {{viewingTime}}. Details: {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_reminder_24h_hunter', 'sms',
    NULL,
    'Yalla.House: Reminder — viewing tomorrow at {{viewingTime}} for {{listingTitle}}. {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_reminder_1h_hunter', 'sms',
    NULL,
    'Yalla.House: Your viewing at {{listingTitle}} starts in 1 hour. {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_request_owner', 'sms',
    NULL,
    'Yalla.House: New viewing request for {{listingTitle}} from {{hunterName}}. Review: {{dashboardUrl}}',
    true, false),

  (NULL, 'viewing_confirmed_owner', 'sms',
    NULL,
    'Yalla.House: Viewing confirmed — {{hunterName}} on {{viewingDate}} at {{viewingTime}}. {{dashboardUrl}}',
    true, false);
