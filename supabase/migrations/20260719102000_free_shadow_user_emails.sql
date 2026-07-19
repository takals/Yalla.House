-- Scraped directory imports created shadow public.users rows holding real agent
-- emails under the users_email_key unique constraint. That blocks those agents
-- from ever signing up (auth callback upsert conflicts on email, silently fails,
-- leaving no users row → all FK inserts break). Contact emails properly live on
-- agent_profiles.email, so namespace the shadow rows' emails out of the way.
-- NOTE: future collector imports must namespace shadow emails the same way.
UPDATE public.users u
SET email = 'shadow+' || u.id || '@import.yalla.house'
WHERE u.id NOT IN (SELECT id FROM auth.users)
  AND u.id IN (SELECT user_id FROM agent_profiles WHERE data_source IS NOT NULL)
  AND u.email NOT LIKE 'shadow+%@import.yalla.house';
