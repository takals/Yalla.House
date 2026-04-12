-- promote-admin.sql
-- Run AFTER admin@yalla.house has logged in for the first time.
-- The auth callback will have created a public.users row with the
-- Supabase Auth UUID. This script assigns roles, creates an owner
-- profile, and transfers listings from the original Tarek account.
--
-- Usage: paste into Supabase SQL Editor or run via MCP execute_sql.

BEGIN;

-- 1. Look up the admin user (created by first login)
DO $$
DECLARE
  v_admin_id uuid;
  v_old_id   uuid := '242d8f37-81d5-469c-bef8-db366dba1b05'; -- original Tarek account
BEGIN
  SELECT id INTO v_admin_id
    FROM public.users
   WHERE email = 'admin@yalla.house'
   LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'admin@yalla.house has not logged in yet — no public.users row found';
  END IF;

  -- 2. Assign admin + owner roles (skip if already exist)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_admin_id, 'admin'), (v_admin_id, 'owner')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- 3. Create owner profile
  INSERT INTO public.owner_profiles (user_id, company_name, phone, address_line1, city, postcode)
  VALUES (
    v_admin_id,
    'Yalla.House',
    '+44 000 000 0000',
    'Platform Admin',
    'London',
    'SW1A 1AA'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 4. Update the admin user's display name
  UPDATE public.users
     SET full_name = 'Yalla Admin'
   WHERE id = v_admin_id;

  -- 5. Transfer listings from old account to admin
  UPDATE public.listings
     SET owner_id = v_admin_id
   WHERE owner_id = v_old_id;

  -- 6. Transfer message threads
  UPDATE public.thread_participants
     SET user_id = v_admin_id
   WHERE user_id = v_old_id;

  UPDATE public.messages
     SET sender_id = v_admin_id
   WHERE sender_id = v_old_id;

  -- 7. Transfer viewings ownership (where the old user was the owner)
  -- Viewings reference listing_id, so they follow automatically.
  -- But if there are any direct user references, update them too.

  -- 8. Transfer offers
  -- Offers reference listing_id so they also follow automatically.

  -- 9. Optionally demote old account (keep as regular owner for testing)
  -- DELETE FROM public.user_roles WHERE user_id = v_old_id AND role = 'owner';

  RAISE NOTICE 'admin@yalla.house (%) promoted successfully. % listings transferred.',
    v_admin_id,
    (SELECT count(*) FROM public.listings WHERE owner_id = v_admin_id);
END $$;

COMMIT;
