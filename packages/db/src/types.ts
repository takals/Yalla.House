// =============================================================================
// Supabase Database Types
// Run `pnpm db:generate-types` to regenerate from the live Supabase schema.
// This file is a hand-written placeholder until the Supabase project is provisioned.
// =============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ListingStatus =
  | 'draft' | 'preview' | 'active' | 'paused'
  | 'under_offer' | 'sold' | 'let' | 'archived'

export type ListingIntent = 'sale' | 'rent' | 'both'

export type PropertyType =
  | 'house' | 'flat' | 'apartment' | 'villa'
  | 'commercial' | 'land' | 'other'

export type UserRole = 'owner' | 'hunter' | 'agent' | 'partner' | 'referrer' | 'admin'

export type PortalSyncStatus =
  | 'pending' | 'queued' | 'published' | 'failed' | 'paused' | 'withdrawn'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string | null
          avatar_url: string | null
          country_code: string | null
          language: string
          referrer_id: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      user_roles: {
        Row: {
          user_id: string
          role: UserRole
          is_active: boolean
          onboarded_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['user_roles']['Row'], 'is_active'>
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>
      }
      owner_profiles: {
        Row: {
          user_id: string
          company_name: string | null
          tax_id: string | null
          verified_at: string | null
        }
        Insert: Database['public']['Tables']['owner_profiles']['Row']
        Update: Partial<Database['public']['Tables']['owner_profiles']['Row']>
      }
      hunter_profiles: {
        Row: {
          user_id: string
          budget_min: number | null
          budget_max: number | null
          currency: string
          target_areas: Json | null
          property_types: string[] | null
          intent: string | null
          timeline: string | null
          agent_assistance_consented: boolean
          min_bedrooms: number | null
          must_haves: string[] | null
          dealbreakers: string[] | null
          finance_status: string | null
          brief_updated_at: string | null
          search_status: 'actively_searching' | 'thinking_about_it' | 'just_exploring' | 'need_to_sell_first' | 'waiting_for_right_one' | null
          early_access_tier: 'none' | 'standard' | 'priority'
          readiness_score: number
          mortgage_verified: boolean
          identity_verified: boolean
          profile_complete: boolean
          renter_ready: boolean
        }
        Insert: Database['public']['Tables']['hunter_profiles']['Row']
        Update: Partial<Database['public']['Tables']['hunter_profiles']['Row']>
      }
      agent_profiles: {
        Row: {
          user_id: string
          agency_name: string | null
          license_number: string | null
          coverage_areas: Json | null
          property_types: string[] | null
          price_bands: Json | null
          languages: string[]
          focus: string
          verified_at: string | null
          subscription_tier: string
        }
        Insert: Database['public']['Tables']['agent_profiles']['Row']
        Update: Partial<Database['public']['Tables']['agent_profiles']['Row']>
      }
      partner_profiles: {
        Row: {
          user_id: string
          service_types: string[] | null
          coverage_areas: Json | null
          verified_at: string | null
        }
        Insert: Database['public']['Tables']['partner_profiles']['Row']
        Update: Partial<Database['public']['Tables']['partner_profiles']['Row']>
      }
      country_config: {
        Row: {
          code: string
          name: string
          name_local: string
          currency: string
          default_units: string
          legal_tenure_models: string[] | null
          required_listing_fields: string[] | null
          legal_notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['country_config']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['country_config']['Insert']>
      }
      portal_config: {
        Row: {
          id: string
          country_code: string
          slug: string
          display_name: string
          website_url: string | null
          feed_format: string | null
          auth_type: string | null
          cost_per_listing: number | null
          currency: string | null
          min_photos: number
          max_photos: number | null
          is_active: boolean
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['portal_config']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['portal_config']['Insert']>
      }
      portal_credentials: {
        Row: {
          id: string
          portal_id: string
          key_name: string
          key_value: string
          environment: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['portal_credentials']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['portal_credentials']['Insert']>
      }
      portal_field_mappings: {
        Row: {
          id: string
          portal_id: string
          internal_field: string
          portal_field: string
          transform: Json | null
          is_required: boolean
        }
        Insert: Omit<Database['public']['Tables']['portal_field_mappings']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['portal_field_mappings']['Insert']>
      }
      listings: {
        Row: {
          id: string
          place_id: string
          owner_id: string
          agent_id: string | null
          country_code: string
          status: ListingStatus
          intent: ListingIntent
          address_line1: string
          address_line2: string | null
          city: string
          region: string | null
          postcode: string
          lat: number | null
          lng: number | null
          property_type: PropertyType
          bedrooms: number | null
          bathrooms: number | null
          size_sqm: number | null
          floor: number | null
          total_floors: number | null
          construction_year: number | null
          tenure: string | null
          sale_price: number | null
          rent_price: number | null
          rent_period: string | null
          currency: string
          price_qualifier: string | null
          title: string | null
          title_de: string | null
          description: string | null
          description_de: string | null
          key_features: string[] | null
          key_features_de: string[] | null
          seller_situation: string | null
          preferred_completion: string | null
          nebenkosten: number | null
          kaution: number | null
          energy_class: string | null
          country_fields: Json
          portal_status: Json
          last_feed_at: string | null
          created_at: string
          updated_at: string
          published_at: string | null
          slug: string | null
          short_id: string | null
          pre_market_opt_in: boolean
        }
        Insert: Omit<Database['public']['Tables']['listings']['Row'],
          'id' | 'place_id' | 'slug' | 'short_id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['listings']['Insert']>
      }
      listing_media: {
        Row: {
          id: string
          listing_id: string
          type: 'photo' | 'floorplan' | 'energy_cert' | 'video' | 'document' | '360_tour'
          url: string
          thumb_url: string | null
          caption: string | null
          caption_de: string | null
          sort_order: number
          is_primary: boolean
          width_px: number | null
          height_px: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['listing_media']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['listing_media']['Insert']>
      }
      listing_features: {
        Row: {
          listing_id: string
          feature_key: string
          value: string | null
        }
        Insert: Database['public']['Tables']['listing_features']['Row']
        Update: Partial<Database['public']['Tables']['listing_features']['Insert']>
      }
      availability_slots: {
        Row: {
          id: string
          listing_id: string
          owner_id: string
          starts_at: string
          ends_at: string
          timezone: string
          is_booked: boolean
          viewing_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['availability_slots']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['availability_slots']['Insert']>
      }
      viewings: {
        Row: {
          id: string
          listing_id: string
          hunter_id: string
          agent_id: string | null
          slot_id: string | null
          scheduled_at: string | null
          timezone: string
          duration_min: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          type: 'in_person' | 'virtual'
          hunter_notes: string | null
          owner_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['viewings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['viewings']['Insert']>
      }
      offers: {
        Row: {
          id: string
          listing_id: string
          hunter_id: string
          agent_id: string | null
          type: 'sale_offer' | 'rental_application'
          amount: number
          currency: string
          status: 'submitted' | 'under_review' | 'accepted' | 'declined' | 'withdrawn' | 'expired'
          conditions: string | null
          finance_status: string | null
          move_in_date: string | null
          employment_type: string | null
          message: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['offers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['offers']['Insert']>
      }
      message_threads: {
        Row: {
          id: string
          listing_id: string | null
          viewing_id: string | null
          offer_id: string | null
          subject: string | null
          last_message_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['message_threads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['message_threads']['Insert']>
      }
      thread_participants: {
        Row: {
          thread_id: string
          user_id: string
          joined_at: string
          last_read_at: string | null
        }
        Insert: Database['public']['Tables']['thread_participants']['Row']
        Update: Partial<Database['public']['Tables']['thread_participants']['Insert']>
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          sender_id: string
          body: string
          attachments: Json
          channel: 'in_app' | 'whatsapp' | 'email' | 'sms'
          sent_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'sent_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      referrers: {
        Row: {
          id: string
          user_id: string
          referrer_code: string
          type: 'street_team' | 'organic' | 'agent' | 'partner'
          country_code: string | null
          payout_method: 'stripe_connect' | 'bank_transfer' | 'sepa' | null
          stripe_connect_id: string | null
          iban: string | null
          total_earned: number
          status: 'active' | 'suspended' | 'closed'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['referrers']['Row'], 'id' | 'total_earned' | 'created_at'>
        Update: Partial<Database['public']['Tables']['referrers']['Insert']>
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_user_id: string
          referred_role: 'owner' | 'hunter' | 'agent' | 'partner'
          utm_source: string | null
          device_fp: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['referrals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['referrals']['Insert']>
      }
      referral_events: {
        Row: {
          id: string
          referral_id: string
          milestone: 'SIGNUP' | 'LISTING_DRAFT' | 'LISTING_PUBLISHED' | 'FIRST_BOOKING' | 'PAID_PLAN' | 'AGENT_ACTIVATED'
          value: number
          currency: string
          status: 'pending' | 'approved' | 'paid' | 'rejected'
          approved_at: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['referral_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['referral_events']['Insert']>
      }
      payouts: {
        Row: {
          id: string
          referrer_id: string
          amount: number
          currency: string
          period_start: string
          period_end: string
          status: 'pending' | 'processing' | 'paid' | 'failed'
          stripe_transfer_id: string | null
          sepa_reference: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payouts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payouts']['Insert']>
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          name_de: string | null
          target_role: string | null
          country_code: string | null
          amount: number
          currency: string
          period: 'monthly' | 'annual' | 'one_off'
          features: Json
          stripe_price_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscription_plans']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subscription_plans']['Insert']>
      }
      billing_records: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          amount: number
          currency: string
          type: 'subscription' | 'listing_package' | 'service' | 'addon'
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['billing_records']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['billing_records']['Insert']>
      }
      listing_portal_status: {
        Row: {
          listing_id: string
          portal_id: string
          status: PortalSyncStatus
          external_id: string | null
          last_sync_at: string | null
          submitted_at: string | null
          live_at: string | null
          error_message: string | null
          validation_errors: Json
          retry_count: number
          portal_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['listing_portal_status']['Row'], 'retry_count'>
        Update: Partial<Database['public']['Tables']['listing_portal_status']['Row']>
      }
      comms_events: {
        Row: {
          id: string
          channel: 'voice' | 'sms' | 'whatsapp'
          from_number: string
          to_number: string
          message_body: string | null
          match_type: 'refcode' | 'portal_url' | 'address' | 'none' | null
          listing_id: string | null
          event_type: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['comms_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['comms_events']['Insert']>
      }
      sms_sessions: {
        Row: {
          from_number: string
          state: 'awaiting_input' | 'awaiting_disambiguation' | 'matched'
          candidates: Json
          listing_id: string | null
          expires_at: string
          updated_at: string
        }
        Insert: Database['public']['Tables']['sms_sessions']['Row']
        Update: Partial<Database['public']['Tables']['sms_sessions']['Row']>
      }
      agent_hunter_assignments: {
        Row: {
          id: string
          hunter_id: string
          agent_id: string
          status: 'invited' | 'active' | 'paused' | 'ignored' | 'disconnected'
          data_scope: 'brief_only' | 'brief_and_contact'
          initiated_by: 'hunter' | 'agent'
          connected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['agent_hunter_assignments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['agent_hunter_assignments']['Insert']>
      }
      agent_inbox_sources: {
        Row: {
          id: string
          hunter_id: string
          source_name: string
          alias_email: string
          status: 'active' | 'muted'
          last_received_at: string | null
          listings_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['agent_inbox_sources']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['agent_inbox_sources']['Insert']>
      }
      property_matches: {
        Row: {
          id: string
          hunter_id: string
          source_id: string
          address: string
          price: number | null
          currency: string
          bedrooms: number | null
          bathrooms: number | null
          tenure: string | null
          description: string | null
          match_score: number
          match_breakdown: Json
          status: 'new' | 'saved' | 'dismissed' | 'archived'
          received_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['property_matches']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['property_matches']['Insert']>
      }
      hunter_consent_log: {
        Row: {
          id: string
          hunter_id: string
          agent_id: string | null
          event_type: 'brief_shared' | 'contact_shared' | 'data_paused' | 'data_resumed' | 'agent_disconnected' | 'data_deleted'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['hunter_consent_log']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['hunter_consent_log']['Insert']>
      }
      listing_agent_assignments: {
        Row: {
          id: string
          listing_id: string
          agent_id: string
          owner_id: string
          tier: 'advisory' | 'assisted' | 'managed'
          status: 'invited' | 'accepted' | 'active' | 'paused' | 'revoked'
          can_edit_listing: boolean
          can_manage_viewings: boolean
          can_negotiate: boolean
          can_message_buyers: boolean
          fee_type: 'flat' | 'percentage' | 'none' | null
          fee_amount: number | null
          fee_currency: string | null
          invited_at: string
          accepted_at: string | null
          revoked_at: string | null
          revoked_reason: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['listing_agent_assignments']['Row'],
          'id' | 'invited_at' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['listing_agent_assignments']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
