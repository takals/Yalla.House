import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { BarChart3, Users, FileText, Sparkles, ArrowRight } from 'lucide-react'

export default async function OwnerAgentsPage() {
  const t = await getTranslations('ownerAgents')

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">{t('pageTitle')}</h1>
        <p className="text-[#5E6278]">{t('pageDescription')}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12 bg-white rounded-2xl border border-[#E2E4EB] p-8">
        <h2 className="text-sm font-bold text-[#5E6278] uppercase tracking-wider mb-6">{t('progressLabel')}</h2>
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: t('step1'), icon: <FileText size={18} /> },
            { step: 2, label: t('step2'), icon: <Users size={18} /> },
            { step: 3, label: t('step3'), icon: <Sparkles size={18} /> },
            { step: 4, label: t('step4'), icon: <BarChart3 size={18} /> },
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center flex-1">
              <div className={`flex flex-col items-center ${idx < 3 ? 'flex-1' : ''}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    item.step === 2
                      ? 'bg-[#D4764E] text-white'
                      : 'bg-[#E2E4EB] text-[#5E6278]'
                  }`}
                >
                  {item.icon}
                </div>
                <p className={`text-xs font-semibold text-center ${item.step === 2 ? 'text-[#0F1117]' : 'text-[#5E6278]'}`}>
                  {item.label}
                </p>
              </div>
              {idx < 3 && (
                <div className={`h-0.5 flex-1 mx-2 ${item.step < 2 ? 'bg-[#D4764E]' : 'bg-[#E2E4EB]'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search Agents Card */}
        <Link href="/owner/agents/search">
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-[#D4764E]/10 flex items-center justify-center mb-4">
              <Users size={18} className="text-[#D4764E]" />
            </div>
            <h3 className="font-bold text-[#0F1117] mb-2">{t('cardSearchTitle')}</h3>
            <p className="text-sm text-[#5E6278] mb-4 flex-1">{t('cardSearchDesc')}</p>
            <div className="flex items-center gap-1 text-[#D4764E] font-semibold text-sm">
              {t('cardAction')}
              <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        {/* Preview Email Card */}
        <Link href="/owner/agents/send">
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-[#D4764E]/10 flex items-center justify-center mb-4">
              <Sparkles size={18} className="text-[#D4764E]" />
            </div>
            <h3 className="font-bold text-[#0F1117] mb-2">{t('cardPreviewTitle')}</h3>
            <p className="text-sm text-[#5E6278] mb-4 flex-1">{t('cardPreviewDesc')}</p>
            <div className="flex items-center gap-1 text-[#D4764E] font-semibold text-sm">
              {t('cardAction')}
              <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        {/* Track Briefs Card */}
        <Link href="/owner/agents/tracking">
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-[#D4764E]/10 flex items-center justify-center mb-4">
              <BarChart3 size={18} className="text-[#D4764E]" />
            </div>
            <h3 className="font-bold text-[#0F1117] mb-2">{t('cardTrackTitle')}</h3>
            <p className="text-sm text-[#5E6278] mb-4 flex-1">{t('cardTrackDesc')}</p>
            <div className="flex items-center gap-1 text-[#D4764E] font-semibold text-sm">
              {t('cardAction')}
              <ArrowRight size={14} />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
