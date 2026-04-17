export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_hunter_assignments: {
        Row: {
          agent_id: string
          connected_at: string | null
          created_at: string | null
          data_scope: string
          hunter_id: string
          id: string
          initiated_by: string
          status: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          connected_at?: string | null
          created_at?: string | null
          data_scope?: string
          hunter_id: string
          id?: string
          initiated_by?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          connected_at?: string | null
          created_at?: string | null
          data_scope?: string
          hunter_id?: string
          id?: string
          initiated_by?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_hunter_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_hunter_assignments_hunter_id_fkey"
            columns: ["hunter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_inbox_sources: {
        Row: {
          alias_email: string
          created_at: string | null
          hunter_id: string
          id: string
          last_received_at: string | null
          listings_count: number | null
          source_name: string
          status: string
        }
        Insert: {
          alias_email: string
          created_at?: string | null
          hunter_id: string
          id?: string
          last_received_at?: string | null
          listings_count?: number | null
          source_name: string
          status?: string
        }
        Update: {
          alias_email?: string
          created_at?: string | null
          hunter_id?: string
          id?: string
          last_received_at?: string | null
          listings_count?: number | null
          source_name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_inbox_sources_hunter_id_fkey"
            columns: ["hunter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_invite_log: {
        Row: {
          channel: string
          clicked: boolean | null
          delivered: boolean | null
          error: string | null
          id: string
          listing_id: string | null
          opened: boolean | null
          prospective_agent_id: string
          sent_at: string
          template: string
        }
        Insert: {
          channel?: string
          clicked?: boolean | null
          delivered?: boolean | null
          error?: string | null
          id?: string
          listing_id?: string | null
          opened?: boolean | null
          prospective_agent_id: string
          sent_at?: string
          template: string
        }
        Update: {
          channel?: string
          clicked?: boolean | null
          delivered?: boolean | null
          error?: string | null
          id?: string
          listing_id?: string | null
          opened?: boolean | null
          prospective_agent_id?: string
          sent_at?: string
          template?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_invite_log_prospective_agent_id_fkey"
            columns: ["prospective_agent_id"]
            isOneToOne: false
            referencedRelation: "prospective_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_matches: {
        Row: {
          agent_id: string
          created_at: string
          expires_at: string | null
          id: string
          match_score: number
          score_breakdown: Json | null
          search_request_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["agent_match_status"]
        }
        Insert: {
          agent_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          match_score: number
          score_breakdown?: Json | null
          search_request_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["agent_match_status"]
        }
        Update: {
          agent_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          match_score?: number
          score_breakdown?: Json | null
          search_request_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["agent_match_status"]
        }
        Relationships: [
          {
            foreignKeyName: "agent_matches_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_matches_search_request_id_fkey"
            columns: ["search_request_id"]
            isOneToOne: false
            referencedRelation: "search_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_profiles: {
        Row: {
          agency_name: string | null
          branch_manager: string | null
          coverage_areas: Json | null
          data_source: string | null
          email: string | null
          focus: string | null
          languages: string[] | null
          license_number: string | null
          partner_agreement_signed_at: string | null
          partner_agreement_version: string | null
          phone: string | null
          portal_presence: string[] | null
          postcode: string | null
          price_bands: Json | null
          property_types: string[] | null
          raw_address: string | null
          service_types: string[] | null
          source_url: string | null
          subscription_tier: string | null
          user_id: string
          verified_at: string | null
          website: string | null
        }
        Insert: {
          agency_name?: string | null
          branch_manager?: string | null
          coverage_areas?: Json | null
          data_source?: string | null
          email?: string | null
          focus?: string | null
          languages?: string[] | null
          license_number?: string | null
          partner_agreement_signed_at?: string | null
          partner_agreement_version?: string | null
          phone?: string | null
          portal_presence?: string[] | null
          postcode?: string | null
          price_bands?: Json | null
          property_types?: string[] | null
          raw_address?: string | null
          service_types?: string[] | null
          source_url?: string | null
          subscription_tier?: string | null
          user_id: string
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          agency_name?: string | null
          branch_manager?: string | null
          coverage_areas?: Json | null
          data_source?: string | null
          email?: string | null
          focus?: string | null
          languages?: string[] | null
          license_number?: string | null
          partner_agreement_signed_at?: string | null
          partner_agreement_version?: string | null
          phone?: string | null
          portal_presence?: string[] | null
          postcode?: string | null
          price_bands?: Json | null
          property_types?: string[] | null
          raw_address?: string | null
          service_types?: string[] | null
          source_url?: string | null
          subscription_tier?: string | null
          user_id?: string
          verified_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_responses: {
        Row: {
          agent_match_id: string
          created_at: string
          hunter_action: Database["public"]["Enums"]["hunter_action"] | null
          id: string
          message: string
          priority_tier: Database["public"]["Enums"]["response_priority"] | null
          properties: Json | null
          relevance_score: number | null
        }
        Insert: {
          agent_match_id: string
          created_at?: string
          hunter_action?: Database["public"]["Enums"]["hunter_action"] | null
          id?: string
          message: string
          priority_tier?:
            | Database["public"]["Enums"]["response_priority"]
            | null
          properties?: Json | null
          relevance_score?: number | null
        }
        Update: {
          agent_match_id?: string
          created_at?: string
          hunter_action?: Database["public"]["Enums"]["hunter_action"] | null
          id?: string
          message?: string
          priority_tier?:
            | Database["public"]["Enums"]["response_priority"]
            | null
          properties?: Json | null
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_responses_agent_match_id_fkey"
            columns: ["agent_match_id"]
            isOneToOne: true
            referencedRelation: "agent_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_staging: {
        Row: {
          created_at: string | null
          id: number
          location: string | null
          name: string
          processed: boolean | null
          profile_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          location?: string | null
          name: string
          processed?: boolean | null
          profile_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          location?: string | null
          name?: string
          processed?: boolean | null
          profile_url?: string | null
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          created_at: string | null
          ends_at: string
          id: string
          is_booked: boolean | null
          listing_id: string
          owner_id: string
          starts_at: string
          timezone: string
          viewing_id: string | null
        }
        Insert: {
          created_at?: string | null
          ends_at: string
          id?: string
          is_booked?: boolean | null
          listing_id: string
          owner_id: string
          starts_at: string
          timezone?: string
          viewing_id?: string | null
        }
        Update: {
          created_at?: string | null
          ends_at?: string
          id?: string
          is_booked?: boolean | null
          listing_id?: string
          owner_id?: string
          starts_at?: string
          timezone?: string
          viewing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_slot_viewing"
            columns: ["viewing_id"]
            isOneToOne: false
            referencedRelation: "viewings"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_records: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_records_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_agents: {
        Row: {
          agent_id: string
          blocked_at: string
          hunter_id: string
          reason: string | null
        }
        Insert: {
          agent_id: string
          blocked_at?: string
          hunter_id: string
          reason?: string | null
        }
        Update: {
          agent_id?: string
          blocked_at?: string
          hunter_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_agents_hunter_id_fkey"
            columns: ["hunter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_consent: {
        Row: {
          agent_outreach: boolean | null
          consented_at: string | null
          created_at: string
          id: string
          phone_allowed: boolean | null
          revoked_at: string | null
          search_request_id: string
        }
        Insert: {
          agent_outreach?: boolean | null
          consented_at?: string | null
          created_at?: string
          id?: string
          phone_allowed?: boolean | null
          revoked_at?: string | null
          search_request_id: string
        }
        Update: {
          agent_outreach?: boolean | null
          consented_at?: string | null
          created_at?: string
          id?: string
          phone_allowed?: boolean | null
          revoked_at?: string | null
          search_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_consent_search_request_id_fkey"
            columns: ["search_request_id"]
            isOneToOne: false
            referencedRelation: "search_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      country_config: {
        Row: {
          code: string
          created_at: string | null
          currency: string
          default_units: string | null
          is_active: boolean | null
          legal_notes: string | null
          legal_tenure_models: string[] | null
          name: string
          name_local: string
          required_listing_fields: string[] | null
        }
        Insert: {
          code: string
          created_at?: string | null
          currency: string
          default_units?: string | null
          is_active?: boolean | null
          legal_notes?: string | null
          legal_tenure_models?: string[] | null
          name: string
          name_local: string
          required_listing_fields?: string[] | null
        }
        Update: {
          code?: string
          created_at?: string | null
          currency?: string
          default_units?: string | null
          is_active?: boolean | null
          legal_notes?: string | null
          legal_tenure_models?: string[] | null
          name?: string
          name_local?: string
          required_listing_fields?: string[] | null
        }
        Relationships: []
      }
      hunter_consent_log: {
        Row: {
          agent_id: string | null
          created_at: string | null
          event_type: string
          hunter_id: string
          id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          event_type: string
          hunter_id: string
          id?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          event_type?: string
          hunter_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunter_consent_log_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunter_consent_log_hunter_id_fkey"
            columns: ["hunter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hunter_preference_tags: {
        Row: {
          created_at: string | null
          id: string
          sentiment: string
          source: string
          tag_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          sentiment: string
          source?: string
          tag_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          sentiment?: string
          source?: string
          tag_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunter_preference_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "property_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunter_preference_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hunter_profiles: {
        Row: {
          agent_assistance_consented: boolean | null
          brief_updated_at: string | null
          budget_max: number | null
          budget_min: number | null
          currency: string | null
          dealbreakers: string[] | null
          early_access_tier: string
          finance_status: string | null
          identity_verified: boolean | null
          intent: string | null
          min_bedrooms: number | null
          mortgage_verified: boolean | null
          must_haves: string[] | null
          profile_complete: boolean | null
          property_types: string[] | null
          readiness_score: number
          renter_ready: boolean | null
          search_status: string | null
          target_areas: Json | null
          timeline: string | null
          user_id: string
        }
        Insert: {
          agent_assistance_consented?: boolean | null
          brief_updated_at?: string | null
          budget_max?: number | null
          budget_min?: number | null
          currency?: string | null
          dealbreakers?: string[] | null
          early_access_tier?: string
          finance_status?: string | null
          identity_verified?: boolean | null
          intent?: string | null
          min_bedrooms?: number | null
          mortgage_verified?: boolean | null
          must_haves?: string[] | null
          profile_complete?: boolean | null
          property_types?: string[] | null
          readiness_score?: number
          renter_ready?: boolean | null
          search_status?: string | null
          target_areas?: Json | null
          timeline?: string | null
          user_id: string
        }
        Update: {
          agent_assistance_consented?: boolean | null
          brief_updated_at?: string | null
          budget_max?: number | null
          budget_min?: number | null
          currency?: string | null
          dealbreakers?: string[] | null
          early_access_tier?: string
          finance_status?: string | null
          identity_verified?: boolean | null
          intent?: string | null
          min_bedrooms?: number | null
          mortgage_verified?: boolean | null
          must_haves?: string[] | null
          profile_complete?: boolean | null
          property_types?: string[] | null
          readiness_score?: number
          renter_ready?: boolean | null
          search_status?: string | null
          target_areas?: Json | null
          timeline?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunter_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inbound_leads: {
        Row: {
          channel: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          link_clicked_at: string | null
          listing_id: string | null
          matched_by: string | null
          raw_message: string | null
          reply_channel: string | null
          reply_link: string | null
          reply_sent_at: string | null
          source: string | null
          status: string
          updated_at: string | null
          viewing_id: string | null
        }
        Insert: {
          channel: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          link_clicked_at?: string | null
          listing_id?: string | null
          matched_by?: string | null
          raw_message?: string | null
          reply_channel?: string | null
          reply_link?: string | null
          reply_sent_at?: string | null
          source?: string | null
          status?: string
          updated_at?: string | null
          viewing_id?: string | null
        }
        Update: {
          channel?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          link_clicked_at?: string | null
          listing_id?: string | null
          matched_by?: string | null
          raw_message?: string | null
          reply_channel?: string | null
          reply_link?: string | null
          reply_sent_at?: string | null
          source?: string | null
          status?: string
          updated_at?: string | null
          viewing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inbound_leads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbound_leads_viewing_id_fkey"
            columns: ["viewing_id"]
            isOneToOne: false
            referencedRelation: "viewings"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_memories: {
        Row: {
          confidence: number
          created_at: string
          deleted_at: string | null
          field: string
          flow_id: string
          id: string
          source: string
          user_id: string
          value: Json | null
        }
        Insert: {
          confidence?: number
          created_at?: string
          deleted_at?: string | null
          field: string
          flow_id: string
          id?: string
          source: string
          user_id: string
          value?: Json | null
        }
        Update: {
          confidence?: number
          created_at?: string
          deleted_at?: string | null
          field?: string
          flow_id?: string
          id?: string
          source?: string
          user_id?: string
          value?: Json | null
        }
        Relationships: []
      }
      intake_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          data: Json | null
          fields_from_memory: number | null
          fields_total: number | null
          flow_id: string
          id: string
          messages: Json | null
          user_id: string
          voice_used: boolean | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data?: Json | null
          fields_from_memory?: number | null
          fields_total?: number | null
          flow_id: string
          id?: string
          messages?: Json | null
          user_id: string
          voice_used?: boolean | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data?: Json | null
          fields_from_memory?: number | null
          fields_total?: number | null
          flow_id?: string
          id?: string
          messages?: Json | null
          user_id?: string
          voice_used?: boolean | null
        }
        Relationships: []
      }
      listing_agent_assignments: {
        Row: {
          accepted_at: string | null
          agent_id: string
          can_edit_listing: boolean
          can_manage_viewings: boolean
          can_message_buyers: boolean
          can_negotiate: boolean
          created_at: string
          crm_connected: boolean
          fee_amount: number | null
          fee_currency: string | null
          fee_type: string | null
          id: string
          invited_at: string
          listing_id: string
          notes: string | null
          owner_id: string
          revoked_at: string | null
          revoked_reason: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          tier: Database["public"]["Enums"]["collaboration_tier"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          agent_id: string
          can_edit_listing?: boolean
          can_manage_viewings?: boolean
          can_message_buyers?: boolean
          can_negotiate?: boolean
          created_at?: string
          crm_connected?: boolean
          fee_amount?: number | null
          fee_currency?: string | null
          fee_type?: string | null
          id?: string
          invited_at?: string
          listing_id: string
          notes?: string | null
          owner_id: string
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          tier?: Database["public"]["Enums"]["collaboration_tier"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          agent_id?: string
          can_edit_listing?: boolean
          can_manage_viewings?: boolean
          can_message_buyers?: boolean
          can_negotiate?: boolean
          created_at?: string
          crm_connected?: boolean
          fee_amount?: number | null
          fee_currency?: string | null
          fee_type?: string | null
          id?: string
          invited_at?: string
          listing_id?: string
          notes?: string | null
          owner_id?: string
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          tier?: Database["public"]["Enums"]["collaboration_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_agent_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_agent_assignments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_agent_assignments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_features: {
        Row: {
          feature_key: string
          listing_id: string
          value: string | null
        }
        Insert: {
          feature_key: string
          listing_id: string
          value?: string | null
        }
        Update: {
          feature_key?: string
          listing_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_features_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_media: {
        Row: {
          caption: string | null
          caption_de: string | null
          created_at: string | null
          height_px: number | null
          id: string
          is_primary: boolean | null
          listing_id: string
          sort_order: number | null
          thumb_url: string | null
          type: string
          url: string
          width_px: number | null
        }
        Insert: {
          caption?: string | null
          caption_de?: string | null
          created_at?: string | null
          height_px?: number | null
          id?: string
          is_primary?: boolean | null
          listing_id: string
          sort_order?: number | null
          thumb_url?: string | null
          type: string
          url: string
          width_px?: number | null
        }
        Update: {
          caption?: string | null
          caption_de?: string | null
          created_at?: string | null
          height_px?: number | null
          id?: string
          is_primary?: boolean | null
          listing_id?: string
          sort_order?: number | null
          thumb_url?: string | null
          type?: string
          url?: string
          width_px?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_media_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_portal_status: {
        Row: {
          error_message: string | null
          external_id: string | null
          last_sync_at: string | null
          listing_id: string
          portal_id: string
          retry_count: number | null
          status: string | null
        }
        Insert: {
          error_message?: string | null
          external_id?: string | null
          last_sync_at?: string | null
          listing_id: string
          portal_id: string
          retry_count?: number | null
          status?: string | null
        }
        Update: {
          error_message?: string | null
          external_id?: string | null
          last_sync_at?: string | null
          listing_id?: string
          portal_id?: string
          retry_count?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_lps_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_portal_status_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portal_config"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_tags: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          listing_id: string
          source: string
          tag_id: number
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          listing_id: string
          source?: string
          tag_id: number
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          listing_id?: string
          source?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_tags_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "property_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address_line1: string
          address_line2: string | null
          agent_id: string | null
          bathrooms: number | null
          bedrooms: number | null
          brief_agent_count: number | null
          brief_sent_at: string | null
          city: string
          construction_year: number | null
          country_code: string
          country_fields: Json | null
          created_at: string | null
          currency: string
          description: string | null
          description_de: string | null
          floor: number | null
          id: string
          intent: string
          kaution: number | null
          key_features: string[] | null
          key_features_de: string[] | null
          last_feed_at: string | null
          lat: number | null
          lng: number | null
          nebenkosten: number | null
          owner_id: string
          place_id: string
          portal_status: Json | null
          postcode: string
          pre_market_opt_in: boolean
          preferred_completion: string | null
          price_qualifier: string | null
          property_type: string
          published_at: string | null
          region: string | null
          rent_period: string | null
          rent_price: number | null
          sale_price: number | null
          seller_situation: string | null
          short_id: string | null
          size_sqm: number | null
          slug: string | null
          status: string
          tenure: string | null
          title: string | null
          title_de: string | null
          total_floors: number | null
          updated_at: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          agent_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          brief_agent_count?: number | null
          brief_sent_at?: string | null
          city: string
          construction_year?: number | null
          country_code: string
          country_fields?: Json | null
          created_at?: string | null
          currency?: string
          description?: string | null
          description_de?: string | null
          floor?: number | null
          id?: string
          intent: string
          kaution?: number | null
          key_features?: string[] | null
          key_features_de?: string[] | null
          last_feed_at?: string | null
          lat?: number | null
          lng?: number | null
          nebenkosten?: number | null
          owner_id: string
          place_id: string
          portal_status?: Json | null
          postcode: string
          pre_market_opt_in?: boolean
          preferred_completion?: string | null
          price_qualifier?: string | null
          property_type: string
          published_at?: string | null
          region?: string | null
          rent_period?: string | null
          rent_price?: number | null
          sale_price?: number | null
          seller_situation?: string | null
          short_id?: string | null
          size_sqm?: number | null
          slug?: string | null
          status?: string
          tenure?: string | null
          title?: string | null
          title_de?: string | null
          total_floors?: number | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          agent_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          brief_agent_count?: number | null
          brief_sent_at?: string | null
          city?: string
          construction_year?: number | null
          country_code?: string
          country_fields?: Json | null
          created_at?: string | null
          currency?: string
          description?: string | null
          description_de?: string | null
          floor?: number | null
          id?: string
          intent?: string
          kaution?: number | null
          key_features?: string[] | null
          key_features_de?: string[] | null
          last_feed_at?: string | null
          lat?: number | null
          lng?: number | null
          nebenkosten?: number | null
          owner_id?: string
          place_id?: string
          portal_status?: Json | null
          postcode?: string
          pre_market_opt_in?: boolean
          preferred_completion?: string | null
          price_qualifier?: string | null
          property_type?: string
          published_at?: string | null
          region?: string | null
          rent_period?: string | null
          rent_price?: number | null
          sale_price?: number | null
          seller_situation?: string | null
          short_id?: string | null
          size_sqm?: number | null
          slug?: string | null
          status?: string
          tenure?: string | null
          title?: string | null
          title_de?: string | null
          total_floors?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "country_config"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          listing_id: string | null
          offer_id: string | null
          subject: string | null
          viewing_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          offer_id?: string | null
          subject?: string | null
          viewing_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          offer_id?: string | null
          subject?: string | null
          viewing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_viewing_id_fkey"
            columns: ["viewing_id"]
            isOneToOne: false
            referencedRelation: "viewings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          body: string
          channel: string
          id: string
          sender_id: string
          sent_at: string | null
          thread_id: string
        }
        Insert: {
          attachments?: Json | null
          body: string
          channel?: string
          id?: string
          sender_id: string
          sent_at?: string | null
          thread_id: string
        }
        Update: {
          attachments?: Json | null
          body?: string
          channel?: string
          id?: string
          sender_id?: string
          sent_at?: string | null
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      mortgage_referrals: {
        Row: {
          annual_income_pence: number | null
          created_at: string
          deposit_pence: number | null
          id: string
          listing_id: string | null
          partner: string
          partner_ref: string | null
          property_value_pence: number | null
          referral_fee_pence: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_income_pence?: number | null
          created_at?: string
          deposit_pence?: number | null
          id?: string
          listing_id?: string | null
          partner: string
          partner_ref?: string | null
          property_value_pence?: number | null
          referral_fee_pence?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_income_pence?: number | null
          created_at?: string
          deposit_pence?: number | null
          id?: string
          listing_id?: string | null
          partner?: string
          partner_ref?: string | null
          property_value_pence?: number | null
          referral_fee_pence?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mortgage_referrals_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortgage_referrals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          actor_id: string | null
          body: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          id: string
          metadata: Json | null
          read_at: string | null
          source_id: string | null
          source_type: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          actor_id?: string | null
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          actor_id?: string | null
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          agent_id: string | null
          amount: number
          conditions: string | null
          created_at: string | null
          currency: string
          employment_type: string | null
          expires_at: string | null
          finance_status: string | null
          hunter_id: string
          id: string
          listing_id: string
          message: string | null
          move_in_date: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          amount: number
          conditions?: string | null
          created_at?: string | null
          currency?: string
          employment_type?: string | null
          expires_at?: string | null
          finance_status?: string | null
          hunter_id: string
          id?: string
          listing_id: string
          message?: string | null
          move_in_date?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number
          conditions?: string | null
          created_at?: string | null
          currency?: string
          employment_type?: string | null
          expires_at?: string | null
          finance_status?: string | null
          hunter_id?: string
          id?: string
          listing_id?: string
          message?: string | null
          move_in_date?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_hunter_id_fkey"
            columns: ["hunter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_profiles: {
        Row: {
          company_name: string | null
          default_city: string | null
          default_currency: string | null
          default_intent: string | null
          default_postcode: string | null
          default_price_qualifier: string | null
          default_property_type: string | null
          default_region: string | null
          default_rent_period: string | null
          tax_id: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          company_name?: string | null
          default_city?: string | null
          default_currency?: string | null
          default_intent?: string | null
          default_postcode?: string | null
          default_price_qualifier?: string | null
          default_property_type?: string | null
          default_region?: string | null
          default_rent_period?: string | null
          tax_id?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          company_name?: string | null
          default_city?: string | null
          default_currency?: string | null
          default_intent?: string | null
          default_postcode?: string | null
          default_price_qualifier?: string | null
          default_property_type?: string | null
          default_region?: string | null
          default_rent_period?: string | null
          tax_id?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_profiles: {
        Row: {
          coverage_areas: Json | null
          service_types: string[] | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          coverage_areas?: Json | null
          service_types?: string[] | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          coverage_areas?: Json | null
          service_types?: string[] | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          period_end: string
          period_start: string
          referrer_id: string
          sepa_reference: string | null
          status: string
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          period_end: string
          period_start: string
          referrer_id: string
          sepa_reference?: string | null
          status?: string
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          period_end?: string
          period_start?: string
          referrer_id?: string
          sepa_reference?: string | null
          status?: string
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "referrers"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_config: {
        Row: {
          auth_type: string | null
          cost_per_listing: number | null
          country_code: string
          currency: string | null
          display_name: string
          feed_format: string | null
          id: string
          is_active: boolean | null
          max_photos: number | null
          min_photos: number | null
          notes: string | null
          slug: string
          website_url: string | null
        }
        Insert: {
          auth_type?: string | null
          cost_per_listing?: number | null
          country_code: string
          currency?: string | null
          display_name: string
          feed_format?: string | null
          id?: string
          is_active?: boolean | null
          max_photos?: number | null
          min_photos?: number | null
          notes?: string | null
          slug: string
          website_url?: string | null
        }
        Update: {
          auth_type?: string | null
          cost_per_listing?: number | null
          country_code?: string
          currency?: string | null
          display_name?: string
          feed_format?: string | null
          id?: string
          is_active?: boolean | null
          max_photos?: number | null
          min_photos?: number | null
          notes?: string | null
          slug?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_config_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "country_config"
            referencedColumns: ["code"]
          },
        ]
      }
      portal_credentials: {
        Row: {
          created_at: string | null
          environment: string | null
          id: string
          key_name: string
          key_value: string
          portal_id: string
        }
        Insert: {
          created_at?: string | null
          environment?: string | null
          id?: string
          key_name: string
          key_value: string
          portal_id: string
        }
        Update: {
          created_at?: string | null
          environment?: string | null
          id?: string
          key_name?: string
          key_value?: string
          portal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_credentials_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portal_config"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_field_mappings: {
        Row: {
          id: string
          internal_field: string
          is_required: boolean | null
          portal_field: string
          portal_id: string
          transform: Json | null
        }
        Insert: {
          id?: string
          internal_field: string
          is_required?: boolean | null
          portal_field: string
          portal_id: string
          transform?: Json | null
        }
        Update: {
          id?: string
          internal_field?: string
          is_required?: boolean | null
          portal_field?: string
          portal_id?: string
          transform?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_field_mappings_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portal_config"
            referencedColumns: ["id"]
          },
        ]
      }
      property_matches: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          hunter_id: string
          id: string
          match_breakdown: Json | null
          match_score: number
          price: number | null
          received_at: string | null
          source_id: string
          status: string
          tenure: string | null
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          hunter_id: string
          id?: string
          match_breakdown?: Json | null
          match_score: number
          price?: number | null
          received_at?: string | null
          source_id: string
          status?: string
          tenure?: string | null
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          hunter_id?: string
          id?: string
          match_breakdown?: Json | null
          match_score?: number
          price?: number | null
          received_at?: string | null
          source_id?: string
          status?: string
          tenure?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_matches_hunter_id_fkey"
            columns: ["hunter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_matches_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "agent_inbox_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      property_tags: {
        Row: {
          category: string
          country_codes: string[] | null
          created_at: string | null
          icon: string | null
          id: number
          intent_filter: string | null
          label_de: string
          label_en: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          category: string
          country_codes?: string[] | null
          created_at?: string | null
          icon?: string | null
          id?: number
          intent_filter?: string | null
          label_de: string
          label_en: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          category?: string
          country_codes?: string[] | null
          created_at?: string | null
          icon?: string | null
          id?: number
          intent_filter?: string | null
          label_de?: string
          label_en?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      prospective_agents: {
        Row: {
          address: string | null
          agency_name: string
          agent_name: string | null
          city: string | null
          coverage_postcodes: string[] | null
          created_at: string
          email: string | null
          id: string
          invited_at: string | null
          invited_count: number
          last_invited_at: string | null
          match_score: number | null
          matched_listing_id: string | null
          phone: string | null
          postcode: string | null
          postcode_prefix: string | null
          rating: number | null
          registered_user_id: string | null
          review_count: number | null
          source: string
          source_id: string | null
          source_url: string | null
          specialties: string[] | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          agency_name: string
          agent_name?: string | null
          city?: string | null
          coverage_postcodes?: string[] | null
          created_at?: string
          email?: string | null
          id?: string
          invited_at?: string | null
          invited_count?: number
          last_invited_at?: string | null
          match_score?: number | null
          matched_listing_id?: string | null
          phone?: string | null
          postcode?: string | null
          postcode_prefix?: string | null
          rating?: number | null
          registered_user_id?: string | null
          review_count?: number | null
          source: string
          source_id?: string | null
          source_url?: string | null
          specialties?: string[] | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          agency_name?: string
          agent_name?: string | null
          city?: string | null
          coverage_postcodes?: string[] | null
          created_at?: string
          email?: string | null
          id?: string
          invited_at?: string | null
          invited_count?: number
          last_invited_at?: string | null
          match_score?: number | null
          matched_listing_id?: string | null
          phone?: string | null
          postcode?: string | null
          postcode_prefix?: string | null
          rating?: number | null
          registered_user_id?: string | null
          review_count?: number | null
          source?: string
          source_id?: string | null
          source_url?: string | null
          specialties?: string[] | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospective_agents_registered_user_id_fkey"
            columns: ["registered_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_coverage_areas: {
        Row: {
          area_name: string | null
          created_at: string
          id: string
          postcode_prefix: string
          provider_id: string
        }
        Insert: {
          area_name?: string | null
          created_at?: string
          id?: string
          postcode_prefix: string
          provider_id: string
        }
        Update: {
          area_name?: string | null
          created_at?: string
          id?: string
          postcode_prefix?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_coverage_areas_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_portfolio: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          provider_id: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          provider_id: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          provider_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "provider_portfolio_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_reviews: {
        Row: {
          body: string | null
          category_id: string | null
          created_at: string
          id: string
          provider_id: string
          quote_request_id: string | null
          rating: number
          status: string
          title: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          provider_id: string
          quote_request_id?: string | null
          rating: number
          status?: string
          title?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          quote_request_id?: string | null
          rating?: number
          status?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_reviews_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_reviews_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_services: {
        Row: {
          category_id: string
          created_at: string
          custom_price: string | null
          id: string
          max_price_pence: number | null
          min_price_pence: number | null
          provider_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          custom_price?: string | null
          id?: string
          max_price_pence?: number | null
          min_price_pence?: number | null
          provider_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          custom_price?: string | null
          id?: string
          max_price_pence?: number | null
          min_price_pence?: number | null
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          accreditation_body: string | null
          accreditation_ref: string | null
          accreditation_verified: boolean
          avg_rating: number | null
          business_name: string
          claimed_at: string | null
          created_at: string
          description_de: string | null
          description_en: string | null
          email: string | null
          featured_until: string | null
          id: string
          is_featured: boolean
          logo_url: string | null
          phone: string | null
          review_count: number
          slug: string | null
          source: string | null
          source_url: string | null
          status: string
          stripe_connect_id: string | null
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          accreditation_body?: string | null
          accreditation_ref?: string | null
          accreditation_verified?: boolean
          avg_rating?: number | null
          business_name: string
          claimed_at?: string | null
          created_at?: string
          description_de?: string | null
          description_en?: string | null
          email?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean
          logo_url?: string | null
          phone?: string | null
          review_count?: number
          slug?: string | null
          source?: string | null
          source_url?: string | null
          status?: string
          stripe_connect_id?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          accreditation_body?: string | null
          accreditation_ref?: string | null
          accreditation_verified?: boolean
          avg_rating?: number | null
          business_name?: string
          claimed_at?: string | null
          created_at?: string
          description_de?: string | null
          description_en?: string | null
          email?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean
          logo_url?: string | null
          phone?: string | null
          review_count?: number
          slug?: string | null
          source?: string | null
          source_url?: string | null
          status?: string
          stripe_connect_id?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          budget_pence: number | null
          category_id: string
          created_at: string
          details: string | null
          id: string
          listing_id: string | null
          postcode: string
          preferred_date: string | null
          provider_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_pence?: number | null
          category_id: string
          created_at?: string
          details?: string | null
          id?: string
          listing_id?: string | null
          postcode: string
          preferred_date?: string | null
          provider_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_pence?: number | null
          category_id?: string
          created_at?: string
          details?: string | null
          id?: string
          listing_id?: string | null
          postcode?: string
          preferred_date?: string | null
          provider_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          price_pence: number
          provider_id: string
          quote_request_id: string
          status: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          price_pence: number
          provider_id: string
          quote_request_id: string
          status?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          price_pence?: number
          provider_id?: string
          quote_request_id?: string
          status?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_events: {
        Row: {
          approved_at: string | null
          created_at: string | null
          currency: string
          id: string
          milestone: string
          paid_at: string | null
          referral_id: string
          status: string
          value: number
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          milestone: string
          paid_at?: string | null
          referral_id: string
          status?: string
          value?: number
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          milestone?: string
          paid_at?: string | null
          referral_id?: string
          status?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          device_fp: string | null
          id: string
          ip_address: unknown
          referred_role: string
          referred_user_id: string
          referrer_id: string
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          device_fp?: string | null
          id?: string
          ip_address?: unknown
          referred_role: string
          referred_user_id: string
          referrer_id: string
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          device_fp?: string | null
          id?: string
          ip_address?: unknown
          referred_role?: string
          referred_user_id?: string
          referrer_id?: string
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "referrers"
            referencedColumns: ["id"]
          },
        ]
      }
      referrers: {
        Row: {
          country_code: string | null
          created_at: string | null
          iban: string | null
          id: string
          payout_method: string | null
          referrer_code: string
          status: string
          stripe_connect_id: string | null
          total_earned: number | null
          type: string
          user_id: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          iban?: string | null
          id?: string
          payout_method?: string | null
          referrer_code: string
          status?: string
          stripe_connect_id?: string | null
          total_earned?: number | null
          type: string
          user_id?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          iban?: string | null
          id?: string
          payout_method?: string | null
          referrer_code?: string
          status?: string
          stripe_connect_id?: string | null
          total_earned?: number | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      search_requests: {
        Row: {
          areas: Json
          bedrooms_max: number | null
          bedrooms_min: number | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          currency: string | null
          hunter_id: string
          id: string
          intent: string
          languages: string[] | null
          notes: string | null
          property_types: string[] | null
          radius_km: number | null
          status: string | null
          timeline: string | null
          updated_at: string | null
        }
        Insert: {
          areas?: Json
          bedrooms_max?: number | null
          bedrooms_min?: number | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          currency?: string | null
          hunter_id: string
          id?: string
          intent: string
          languages?: string[] | null
          notes?: string | null
          property_types?: string[] | null
          radius_km?: number | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Update: {
          areas?: Json
          bedrooms_max?: number | null
          bedrooms_min?: number | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          currency?: string | null
          hunter_id?: string
          id?: string
          intent?: string
          languages?: string[] | null
          notes?: string | null
          property_types?: string[] | null
          radius_km?: number | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description_de: string | null
          description_en: string | null
          icon: string | null
          id: string
          is_active: boolean
          name_de: string
          name_en: string
          phase: string
          revenue_model: string | null
          revenue_per_unit: string | null
          slug: string
          sort_order: number
          tier: string
          typical_price_gbp: string | null
        }
        Insert: {
          created_at?: string
          description_de?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name_de: string
          name_en: string
          phase?: string
          revenue_model?: string | null
          revenue_per_unit?: string | null
          slug: string
          sort_order?: number
          tier: string
          typical_price_gbp?: string | null
        }
        Update: {
          created_at?: string
          description_de?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name_de?: string
          name_en?: string
          phase?: string
          revenue_model?: string | null
          revenue_per_unit?: string | null
          slug?: string
          sort_order?: number
          tier?: string
          typical_price_gbp?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          address: string | null
          category: Database["public"]["Enums"]["service_category"]
          completed_at: string | null
          country: string | null
          created_at: string
          currency: string | null
          deliverables: Json | null
          description: string | null
          final_amount: number | null
          id: string
          listing_id: string | null
          metadata: Json | null
          partner_id: string | null
          postcode: string | null
          preferred_date: string | null
          preferred_time: string | null
          quoted_amount: number | null
          rating: number | null
          requester_id: string
          review: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["service_request_status"]
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          category: Database["public"]["Enums"]["service_category"]
          completed_at?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          deliverables?: Json | null
          description?: string | null
          final_amount?: number | null
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          partner_id?: string | null
          postcode?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          quoted_amount?: number | null
          rating?: number | null
          requester_id: string
          review?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["service_request_status"]
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: Database["public"]["Enums"]["service_category"]
          completed_at?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          deliverables?: Json | null
          description?: string | null
          final_amount?: number | null
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          partner_id?: string | null
          postcode?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          quoted_amount?: number | null
          rating?: number | null
          requester_id?: string
          review?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["service_request_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          amount: number
          country_code: string | null
          created_at: string | null
          currency: string
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          name_de: string | null
          period: string
          stripe_price_id: string | null
          target_role: string | null
        }
        Insert: {
          amount: number
          country_code?: string | null
          created_at?: string | null
          currency?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          name_de?: string | null
          period: string
          stripe_price_id?: string | null
          target_role?: string | null
        }
        Update: {
          amount?: number
          country_code?: string | null
          created_at?: string | null
          currency?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_de?: string | null
          period?: string
          stripe_price_id?: string | null
          target_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plans_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "country_config"
            referencedColumns: ["code"]
          },
        ]
      }
      thread_participants: {
        Row: {
          joined_at: string | null
          last_read_at: string | null
          thread_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          last_read_at?: string | null
          thread_id: string
          user_id: string
        }
        Update: {
          joined_at?: string | null
          last_read_at?: string | null
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          is_active: boolean | null
          onboarded_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          is_active?: boolean | null
          onboarded_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          is_active?: boolean | null
          onboarded_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          country_code: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          language: string | null
          phone: string | null
          referrer_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          country_code?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          language?: string | null
          phone?: string | null
          referrer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          country_code?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          language?: string | null
          phone?: string | null
          referrer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_referrer"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "referrers"
            referencedColumns: ["id"]
          },
        ]
      }
      viewings: {
        Row: {
          agent_id: string | null
          created_at: string | null
          duration_min: number | null
          hunter_id: string
          hunter_notes: string | null
          id: string
          listing_id: string
          owner_notes: string | null
          scheduled_at: string | null
          slot_id: string | null
          status: string
          timezone: string
          type: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          duration_min?: number | null
          hunter_id: string
          hunter_notes?: string | null
          id?: string
          listing_id: string
          owner_notes?: string | null
          scheduled_at?: string | null
          slot_id?: string | null
          status?: string
          timezone?: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          duration_min?: number | null
          hunter_id?: string
          hunter_notes?: string | null
          id?: string
          listing_id?: string
          owner_notes?: string | null
          scheduled_at?: string | null
          slot_id?: string | null
          status?: string
          timezone?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_hunter_id_fkey"
            columns: ["hunter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "availability_slots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      bulk_insert_agents: { Args: { agents: Json }; Returns: number }
      bulk_insert_agents_v2: { Args: { agents: Json }; Returns: number }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      enrich_agent_profiles: { Args: { enrichments: Json }; Returns: number }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      expire_stale_agent_matches: { Args: never; Returns: number }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      gettransactionid: { Args: never; Returns: unknown }
      has_role: { Args: { required_role: string }; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      process_staged_agents: { Args: never; Returns: number }
      score_tag_match: {
        Args: { p_hunter_id: string; p_listing_id: string }
        Returns: number
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      stage_agents: { Args: { data: string }; Returns: number }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      agent_match_status: "pending" | "sent" | "responded" | "expired"
      assignment_status:
        | "invited"
        | "accepted"
        | "active"
        | "paused"
        | "revoked"
      collaboration_tier: "advisory" | "assisted" | "managed"
      hunter_action: "promoted" | "dismissed" | "blocked"
      notification_channel: "in_app" | "email" | "push" | "sms"
      notification_status: "unread" | "read" | "archived"
      response_priority: "top_match" | "other" | "low_relevance" | "spam"
      service_category:
        | "photography"
        | "floorplan"
        | "epc"
        | "survey"
        | "conveyancing"
        | "cleaning"
        | "staging"
        | "drone"
        | "other"
      service_request_status:
        | "pending"
        | "quoted"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_match_status: ["pending", "sent", "responded", "expired"],
      assignment_status: ["invited", "accepted", "active", "paused", "revoked"],
      collaboration_tier: ["advisory", "assisted", "managed"],
      hunter_action: ["promoted", "dismissed", "blocked"],
      notification_channel: ["in_app", "email", "push", "sms"],
      notification_status: ["unread", "read", "archived"],
      response_priority: ["top_match", "other", "low_relevance", "spam"],
      service_category: [
        "photography",
        "floorplan",
        "epc",
        "survey",
        "conveyancing",
        "cleaning",
        "staging",
        "drone",
        "other",
      ],
      service_request_status: [
        "pending",
        "quoted",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
    },
  },
} as const
