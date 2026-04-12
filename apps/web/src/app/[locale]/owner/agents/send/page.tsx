import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft, Mail, Eye, CheckCircle2, Clock, ArrowRight } from 'lucide-react'

interface Props {
  searchParams: Promise<{ agents?: string }>
}

export default async function SendBriefPage({ searchParams }: Props) {
  const { agents: agentIds } = await searchParams
  const t = await getTranslations('ownerAgents')

  // Mock selected agents
  const selectedAgentIds = agentIds?.split(',') || []
  const allAgents: Record<string, { name: string; contact: string }> = {
    'agent-1': { name: 'John Smith & Co', contact: 'john@johnsmith.co.uk' },
    'agent-2': { name: 'London Heights Estates', contact: 'hello@londonheights.co.uk' },
    'agent-3': { name: 'City Centre Properties', contact: 'info@citycentre.co.uk' },
    'agent-4': { name: 'Riverside Lettings & Sales', contact: 'sales@riverside.co.uk' },
    'agent-5': { name: 'Tower Bridge Area Agents', contact: 'hello@towerbridgeagents.co.uk' },
  }

  const selectedAgents = selectedAgentIds
    .map(id => allAgents[id as string])
    .filter(Boolean)

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/owner/agents/search" className="inline-flex items-center gap-2 text-[#D4764E] font-semibold text-sm mb-4 hover:gap-3 transition-all">
          <ArrowLeft size={16} />
          {t('sendBackButton')}
        </Link>
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">{t('sendPageTitle')}</h1>
        <p className="text-[#5E6278]">{t('sendPageDescription')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Property Brief */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Brief Card */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
            <h2 className="font-bold text-[#0F1117] mb-4">{t('briefPropertyTitle')}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#5E6278] font-semibold uppercase tracking-wider mb-1">{t('briefAddress')}</p>
                <p className="font-semibold text-[#0F1117]">124 Shoreditch High Street</p>
                <p className="text-sm text-[#5E6278]">London, E1 6JE</p>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#E2E4EB]">
                <div>
                  <p className="text-xs text-[#5E6278] font-semibold uppercase tracking-wider mb-1">{t('briefBedrooms')}</p>
                  <p className="font-semibold text-[#0F1117]">3 bedrooms</p>
                </div>
                <div>
                  <p className="text-xs text-[#5E6278] font-semibold uppercase tracking-wider mb-1">{t('briefProperty')}</p>
                  <p className="font-semibold text-[#0F1117]">Converted Warehouse</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#5E6278] font-semibold uppercase tracking-wider mb-1">{t('briefDescription')}</p>
                <p className="text-sm text-[#5E6278]">
                  Spacious, light-filled apartment with high ceilings in a converted warehouse. Private terrace with views across East London.
                </p>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
            <h2 className="font-bold text-[#0F1117] mb-6">{t('sendWhatNextTitle')}</h2>
            <div className="space-y-4">
              {[
                { icon: <Mail size={18} />, title: t('sendStep1Title'), desc: t('sendStep1Desc') },
                { icon: <Eye size={18} />, title: t('sendStep2Title'), desc: t('sendStep2Desc') },
                { icon: <CheckCircle2 size={18} />, title: t('sendStep3Title'), desc: t('sendStep3Desc') },
                { icon: <Clock size={18} />, title: t('sendStep4Title'), desc: t('sendStep4Desc') },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#D4764E]/10 flex items-center justify-center flex-shrink-0 text-[#D4764E]">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#0F1117] mb-1">{step.title}</p>
                    <p className="text-sm text-[#5E6278]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Agents & Actions */}
        <div className="space-y-6">
          {/* Selected Agents Card */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6 sticky top-8">
            <h2 className="font-bold text-[#0F1117] mb-4">{t('sendSelectedAgentsTitle')}</h2>

            {selectedAgents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#5E6278] mb-4">{t('sendNoAgentsSelected')}</p>
                <Link href="/owner/agents/search">
                  <button className="text-sm font-semibold text-[#D4764E]">
                    {t('sendSelectAgentsLink')}
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {selectedAgents.map((agent, idx) => (
                    <div key={idx} className="bg-[#EDEEF2] rounded-lg p-3">
                      <p className="font-semibold text-sm text-[#0F1117]">{agent.name}</p>
                      <p className="text-xs text-[#5E6278]">{agent.contact}</p>
                    </div>
                  ))}
                </div>

                <Link href="/owner/agents/search">
                  <button className="w-full text-sm font-semibold text-[#5E6278] py-2 mb-4 hover:text-[#0F1117] transition-colors flex items-center justify-center gap-2">
                    <ArrowRight size={14} />
                    {t('sendAddMoreAgents')}
                  </button>
                </Link>

                <div className="space-y-3">
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E2E4EB] text-[#0F1117] font-semibold rounded-lg hover:bg-[#EDEEF2] transition-colors">
                    <Eye size={16} />
                    {t('sendPreviewEmail')}
                  </button>
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D4764E] text-white font-semibold rounded-lg hover:bg-[#C26039] transition-colors">
                    <Mail size={16} />
                    {t('sendBriefNow')}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
            <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-2">{t('sendInfoLabel')}</p>
            <p className="text-sm text-green-700">{t('sendInfoText')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
