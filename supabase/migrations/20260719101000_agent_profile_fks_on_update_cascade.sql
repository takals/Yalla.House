-- Claiming a directory profile re-points agent_profiles.user_id (the PK) at the
-- real account. Child rows must follow the PK change instead of blocking it.
ALTER TABLE public.agent_invites
  DROP CONSTRAINT agent_invites_agent_profile_id_fkey,
  ADD CONSTRAINT agent_invites_agent_profile_id_fkey
    FOREIGN KEY (agent_profile_id) REFERENCES public.agent_profiles(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.agent_source_links
  DROP CONSTRAINT agent_source_links_agent_user_id_fkey,
  ADD CONSTRAINT agent_source_links_agent_user_id_fkey
    FOREIGN KEY (agent_user_id) REFERENCES public.agent_profiles(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE;
