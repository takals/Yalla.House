import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft, Mail, Eye, MousePointerClick, MessageSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default async function TrackingPage() {
  const t = await getTranslations('ownerAgents')

  // Mock tracking data
  const trackingData = [
    {
      agentName: 'John Smith & Co',
      sentTime: '2 hours ago',
      status: 'delivered',
      delivered: true,
      opened: true,
      clicked: true,
      responded: false,
      responseTime: null,
    },
    {
      agentName: 'London Heights Estates',
      sentTime: '2 hours ago',
      status: 'proposal',
      delivered: true,
      opened: true,
      clicked: true,
      responded: true,
      responseTime: '45 minutes ago',
    },
    {
      agentName: 'City Centre Properties',
      sentTime: '2 hours ago',
      status: 'opened',
      delivered: true,
      opened: true,
      clicked: false,
      responded: false,
      responseTime: null,
    },
    {
      agentName: 'Riverside Lettings & Sales',
      sentTime: '2 hours ago',
      status: 'delivered',
      delivered: true,
      opened: false,
      clicked: false,
      responded: false,
      responseTime: null,
    },
    {
      agentName: 'Tower Bridge Area Agents',
      sentTime: '1 hour ago',
      status: 'delivered',
      delivered: true,
      opened: false,
      clicked: false,
      responded: false,
      responseTime: null,
    },
  ]

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      delivered: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        icon: <Clock size={14} />,
      },
      opened: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: <Eye size={14} />,
      },
      proposal: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        icon: <CheckCircle2 size={14} />,
      },
    }
    const cfg = config[status] || config.delivered
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
        {cfg.icon}
        {t(`trackingStatus.${status}`)}
      </div>
    )
  }

  const renderCheckmark = (active: boolean) => {
    return (
      <div className="flex justify-center">
        {active ? (
          <CheckCircle2 size={18} className="text-green-600" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-[#D9DCE4] bg-transparent" />
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/owner/agents" className="inline-flex items-center gap-2 text-[#D4764E] font-semibold text-sm mb-4 hover:gap-3 transition-all">
          <ArrowLeft size={16} />
          {t('trackingBackButton')}
        </Link>
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">{t('trackingPageTitle')}</h1>
        <p className="text-[#5E6278]">{t('trackingPageDescription')}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('trackingTotalSent'), value: '5', color: 'border-blue-200 bg-blue-50' },
          { label: t('trackingDelivered'), value: '5', color: 'border-green-200 bg-green-50' },
          { label: t('trackingOpened'), value: '3', color: 'border-purple-200 bg-purple-50' },
          { label: t('trackingProposals'), value: '1', color: 'border-amber-200 bg-amber-50' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-xl border-2 ${stat.color} p-4`}
          >
            <p className="text-xs text-[#5E6278] font-semibold mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[#0F1117]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tracking Table */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 bg-[#EDEEF2] px-6 py-4 text-xs font-bold text-[#5E6278] uppercase tracking-wider border-b border-[#E2E4EB]">
          <div className="col-span-4">{t('trackingColumnAgent')}</div>
          <div className="col-span-2">{t('trackingColumnSent')}</div>
          <div className="col-span-5 flex justify-between px-2">
            <div className="flex items-center gap-2" title={t('trackingColumnDelivered')}>
              <Mail size={14} />
              <span className="hidden sm:inline">Delivered</span>
            </div>
            <div className="flex items-center gap-2" title={t('trackingColumnOpened')}>
              <Eye size={14} />
              <span className="hidden sm:inline">Opened</span>
            </div>
            <div className="flex items-center gap-2" title={t('trackingColumnClicked')}>
              <MousePointerClick size={14} />
              <span className="hidden sm:inline">Clicked</span>
            </div>
            <div className="flex items-center gap-2" title={t('trackingColumnResponded')}>
              <MessageSquare size={14} />
              <span className="hidden sm:inline">Replied</span>
            </div>
          </div>
          <div className="col-span-1">{t('trackingColumnStatus')}</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[#E2E4EB]">
          {trackingData.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[#FAFBFC] transition-colors">
              <div className="col-span-4">
                <p className="font-semibold text-[#0F1117]">{row.agentName}</p>
                <p className="text-xs text-[#5E6278]">{row.sentTime}</p>
              </div>
              <div className="col-span-2 text-sm text-[#5E6278]">{row.sentTime}</div>
              <div className="col-span-5 flex justify-between px-2">
                {renderCheckmark(row.delivered)}
                {renderCheckmark(row.opened)}
                {renderCheckmark(row.clicked)}
                {renderCheckmark(row.responded)}
              </div>
              <div className="col-span-1">
                {getStatusBadge(row.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-900 mb-1">{t('trackingInfoTitle')}</p>
              <p className="text-sm text-blue-800">{t('trackingInfoText')}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
          <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">{t('trackingTipLabel')}</p>
          <p className="text-sm text-green-700">{t('trackingTipText')}</p>
        </div>
      </div>
    </div>
  )
}
