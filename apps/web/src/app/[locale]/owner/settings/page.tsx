import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { User, Building2, Bell, Globe, AlertTriangle, ChevronRight, Mail, MessageSquare } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { SettingsForm } from './settings-form'
import { ListingDefaultsForm } from './listing-defaults-form'

interface OwnerProfile {
  user_id: string
  company_name: string | null
  tax_id: string | null
  default_intent: string | null
  default_property_type: string | null
  default_currency: string | null
  default_price_qualifier: string | null
  default_rent_period: string | null
  default_city: string | null
  default_postcode: string | null
  default_region: string | null
}

export default async function OwnerSettingsPage() {
  const t = await getTranslations('ownerSettings')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const [userResult, profileResult, listingsResult] = await Promise.all([
    (supabase.from('users') as any)
      .select('full_name, email, phone')
      .eq('id', userId)
      .maybeSingle(),
    (supabase.from('owner_profiles') as any)
      .select('company_name, tax_id, default_intent, default_property_type, default_currency, default_price_qualifier, default_rent_period, default_city, default_postcode, default_region')
      .eq('user_id', userId)
      .maybeSingle(),
    (supabase.from('listings') as any)
      .select('id, short_id, title, title_de, address_line1, city, status')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false }),
  ])

  const userProfile = userResult.data
  const ownerProfile = profileResult.data as OwnerProfile | null
  const listings = (listingsResult.data ?? []) as Array<{
    id: string
    short_id: string | null
    title: string | null
    title_de: string | null
    address_line1: string | null
    city: string | null
    status: string | null
  }>

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">{t('pageTitle')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('pageDescription')}</p>
      </div>

      {/* Personal + Business — editable via client component */}
      <SettingsForm
        userProfile={{
          full_name: userProfile?.full_name ?? '',
          email: user?.email || 'preview@yalla.house',
          phone: userProfile?.phone ?? '',
        }}
        ownerProfile={{
          company_name: ownerProfile?.company_name ?? '',
          tax_id: ownerProfile?.tax_id ?? '',
        }}
        translations={{
          sectionPersonal: t('sectionPersonal'),
          sectionBusiness: t('sectionBusiness'),
          labelFullName: t('labelFullName'),
          labelEmail: t('labelEmail'),
          labelPhone: t('labelPhone'),
          labelCompanyName: t('labelCompanyName'),
          labelTaxId: t('labelTaxId'),
          labelReadOnly: t('labelReadOnly'),
          buttonEdit: t('buttonEdit'),
          buttonAdd: t('buttonAdd'),
          notSet: t('notSet'),
        }}
      />

      {/* Notification Preferences Card */}
      <SettingsSection icon={Bell} title={t('sectionNotifications')}>
        <p className="text-xs text-text-muted mb-3">{t('notifDescription')}</p>

        {/* Global prefs link */}
        <Link
          href="/settings/notifications"
          className="flex items-center justify-between py-3 border-b border-[#F0F0F0] group hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Bell size={16} className="text-[#D4764E]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">{t('notifGlobalPrefs')}</div>
              <div className="text-xs text-text-muted">{t('notifGlobalPrefsDesc')}</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400 group-hover:text-[#D4764E] transition-colors" />
        </Link>

        {/* Per-listing template links */}
        {listings.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t('notifMessageTemplates')}
            </div>
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/owner/${listing.id}/settings/notifications`}
                className="flex items-center justify-between py-3 border-b border-[#F0F0F0] last:border-b-0 group hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Mail size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      {listing.title || listing.title_de || listing.address_line1 || listing.short_id || t('notifUntitledListing')}
                    </div>
                    <div className="text-xs text-text-muted">
                      {listing.city ? `${listing.city} · ` : ''}{t('notifCustomiseTemplates')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    listing.status === 'live' ? 'bg-green-50 text-green-700' :
                    listing.status === 'draft' ? 'bg-gray-100 text-gray-500' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {listing.status ?? 'draft'}
                  </span>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-[#D4764E] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </SettingsSection>

      {/* Listing Defaults — editable via client component */}
      <ListingDefaultsForm
        defaults={{
          default_intent: ownerProfile?.default_intent ?? '',
          default_property_type: ownerProfile?.default_property_type ?? '',
          default_currency: ownerProfile?.default_currency ?? 'EUR',
          default_price_qualifier: ownerProfile?.default_price_qualifier ?? '',
          default_rent_period: ownerProfile?.default_rent_period ?? '',
          default_city: ownerProfile?.default_city ?? '',
          default_postcode: ownerProfile?.default_postcode ?? '',
          default_region: ownerProfile?.default_region ?? '',
        }}
        translations={{
          sectionListingDefaults: t('sectionListingDefaults'),
          defaultsDescription: t('defaultsDescription'),
          labelIntent: t('labelIntent'),
          intentSale: t('intentSale'),
          intentRent: t('intentRent'),
          intentBoth: t('intentBoth'),
          labelPropertyType: t('labelPropertyType'),
          typeHouse: t('typeHouse'),
          typeFlat: t('typeFlat'),
          typeApartment: t('typeApartment'),
          typeVilla: t('typeVilla'),
          typeCommercial: t('typeCommercial'),
          typeLand: t('typeLand'),
          typeOther: t('typeOther'),
          labelCurrency: t('labelCurrency'),
          labelPriceQualifier: t('labelPriceQualifier'),
          qualFixedPrice: t('qualFixedPrice'),
          qualOffersOver: t('qualOffersOver'),
          qualGuidePrice: t('qualGuidePrice'),
          qualPOA: t('qualPOA'),
          qualVB: t('qualVB'),
          labelRentPeriod: t('labelRentPeriod'),
          periodPCM: t('periodPCM'),
          periodPW: t('periodPW'),
          periodPQ: t('periodPQ'),
          periodPA: t('periodPA'),
          labelCity: t('labelCity'),
          placeholderCity: t('placeholderCity'),
          labelPostcode: t('labelPostcode'),
          labelRegion: t('labelRegion'),
          placeholderRegion: t('placeholderRegion'),
          saveDefaults: t('saveDefaults'),
          saving: t('saving'),
          savedDefaults: t('savedDefaults'),
          buttonEdit: t('buttonEdit'),
          notSet: t('notSet'),
        }}
      />

      {/* Danger Zone Card */}
      <SettingsSection icon={AlertTriangle} title={t('sectionDangerZone')} isDanger>
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm font-semibold text-text-primary">{t('labelDeleteAccount')}</div>
            <div className="text-xs text-text-muted mt-0.5">
              {t('deleteAccountWarning')}
            </div>
          </div>
          <button
            disabled
            className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg bg-red-50 hover:bg-red-50 cursor-not-allowed opacity-60"
          >
            {t('buttonDelete')}
          </button>
        </div>
      </SettingsSection>
    </div>
  )
}

// ========== Sub-components ==========

interface SettingsSectionProps {
  icon?: any
  title: string
  badge?: string
  isDanger?: boolean
  children: React.ReactNode
}

function SettingsSection({ icon: Icon, title, badge, isDanger, children }: SettingsSectionProps) {
  const borderClass = isDanger ? 'border-2 border-red-200' : 'border border-border-default'
  const bgClass = isDanger ? 'bg-white' : 'bg-white'

  return (
    <div className={`${bgClass} rounded-2xl ${borderClass} p-6 space-y-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className={isDanger ? 'text-red-600' : 'text-text-primary'} />}
          <h2 className={`font-bold ${isDanger ? 'text-red-600' : 'text-text-primary'} text-base`}>{title}</h2>
        </div>
        {badge && (
          <span className="text-xs font-medium text-text-muted bg-[#F0F0F0] px-2 py-1 rounded">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

interface SettingItemProps {
  label: string
  value: string
  actionLabel: string
  isReadOnly?: boolean
}

function SettingItem({ label, value, actionLabel, isReadOnly }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F0F0F0] last:border-b-0">
      <div className="flex-1">
        <div className="text-sm font-semibold text-text-primary">{label}</div>
        <div className="text-sm text-text-secondary mt-0.5">{value}</div>
      </div>
      {isReadOnly ? (
        <span className="text-xs text-text-muted">{actionLabel}</span>
      ) : (
        <button className="text-xs font-semibold text-brand hover:text-[#BF6840] transition-colors">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

interface NotificationToggleProps {
  label: string
  description: string
  disabled?: boolean
}

function NotificationToggle({ label, description, disabled }: NotificationToggleProps) {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-[#F0F0F0] last:border-b-0 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <div className="text-sm font-semibold text-text-primary">{label}</div>
        <div className="text-xs text-text-muted mt-0.5">{description}</div>
      </div>
      <div className="w-10 h-6 bg-[#E2E4EB] rounded-full relative cursor-not-allowed">
        <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm transition-transform" />
      </div>
    </div>
  )
}
