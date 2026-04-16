'use client'

import { User, Building2 } from 'lucide-react'
import { useAuthAction } from '@/lib/use-auth-action'
import { EditableField } from './editable-field'
import { updateUserProfileAction, updateOwnerProfileAction } from './actions'

interface SettingsFormProps {
  userProfile: {
    full_name: string
    email: string
    phone: string
  }
  ownerProfile: {
    company_name: string
    tax_id: string
  }
  translations: {
    sectionPersonal: string
    sectionBusiness: string
    labelFullName: string
    labelEmail: string
    labelPhone: string
    labelCompanyName: string
    labelTaxId: string
    labelReadOnly: string
    buttonEdit: string
    buttonAdd: string
    notSet: string
  }
}

export function SettingsForm({ userProfile, ownerProfile, translations: t }: SettingsFormProps) {
  const { handleAuthRequired } = useAuthAction()

  const createSaveHandler = (action: (data: any) => Promise<any>) => async (value: string) => {
    const result = await action({ full_name: value } as any)
    if (handleAuthRequired(result)) return { error: 'Please log in to save changes' }
    return result
  }

  const updateUserWithAuth = async (data: any) => {
    const result = await updateUserProfileAction(data)
    if (handleAuthRequired(result)) return { error: 'Please log in to save changes' }
    return result
  }

  const updateOwnerWithAuth = async (data: any) => {
    const result = await updateOwnerProfileAction(data)
    if (handleAuthRequired(result)) return { error: 'Please log in to save changes' }
    return result
  }

  return (
    <>
      {/* Personal Information Card */}
      <div className="bg-white rounded-2xl border border-border-default p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <User size={20} className="text-text-primary" />
          <h2 className="font-bold text-text-primary text-base">{t.sectionPersonal}</h2>
        </div>
        <EditableField
          label={t.labelFullName}
          value={userProfile.full_name || t.notSet}
          placeholder={t.labelFullName}
          actionLabel={t.buttonEdit}
          onSave={async (value) => updateUserWithAuth({ full_name: value })}
        />
        <EditableField
          label={t.labelEmail}
          value={userProfile.email}
          placeholder=""
          actionLabel={t.labelReadOnly}
          isReadOnly
          onSave={async () => ({ success: true })}
        />
        <EditableField
          label={t.labelPhone}
          value={userProfile.phone || t.notSet}
          placeholder="+49..."
          actionLabel={t.buttonEdit}
          onSave={async (value) => updateUserWithAuth({ phone: value })}
        />
      </div>

      {/* Company Details Card */}
      <div className="bg-white rounded-2xl border border-border-default p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Building2 size={20} className="text-text-primary" />
          <h2 className="font-bold text-text-primary text-base">{t.sectionBusiness}</h2>
        </div>
        <EditableField
          label={t.labelCompanyName}
          value={ownerProfile.company_name || t.notSet}
          placeholder={t.labelCompanyName}
          actionLabel={ownerProfile.company_name ? t.buttonEdit : t.buttonAdd}
          onSave={async (value) => updateOwnerWithAuth({ company_name: value })}
        />
        <EditableField
          label={t.labelTaxId}
          value={ownerProfile.tax_id || t.notSet}
          placeholder={t.labelTaxId}
          actionLabel={ownerProfile.tax_id ? t.buttonEdit : t.buttonAdd}
          onSave={async (value) => updateOwnerWithAuth({ tax_id: value })}
        />
      </div>
    </>
  )
}
