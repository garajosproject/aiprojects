import { useState } from 'react'
import OverviewSection from './api/OverviewSection'
import IncomingSection from './api/IncomingSection'
import OutgoingSection from './api/OutgoingSection'
import TokensSection from './api/TokensSection'
import LogsSection from './api/LogsSection'

type Role = 'Super Admin' | 'Doctor' | 'Coach'

const API_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'incoming', label: 'Incoming APIs' },
  { key: 'outgoing', label: 'Outgoing APIs' },
  { key: 'tokens',   label: 'Tokens' },
  { key: 'logs',     label: 'Logs' },
]

export default function ApiManager() {
  const [activeTab, setActiveTab] = useState('overview')
  const [role, setRole] = useState<Role>('Super Admin')

  const canCreate     = role === 'Super Admin'
  const canEdit       = role === 'Super Admin'
  const canDelete     = role === 'Super Admin'
  const canViewTokens = role !== 'Coach'
  const isCoach       = role === 'Coach'

  return (
    <div className="mt-4 space-y-4">

      {/* Header bar */}
      <div className="bg-white rounded-xl border border-[#D9DEE2] shadow-sm px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#E9EFFF] flex items-center justify-center text-base">⚡</div>
          <div>
            <p className="text-sm font-semibold text-[#133696]">API Management</p>
            <p className="text-xs text-[#A9B2B9]">Configure incoming &amp; outgoing API integrations</p>
          </div>
        </div>

        {/* Role switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A9B2B9]">Viewing as:</span>
          {(['Super Admin', 'Doctor', 'Coach'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                role === r
                  ? 'bg-[#133696] text-white'
                  : 'bg-[#EEF1F3] text-[#434D56] hover:bg-[#E9EFFF] hover:text-[#133696]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Internal tab bar */}
      <div className="bg-white rounded-xl border border-[#D9DEE2] shadow-sm px-5 pt-4">
        <div className="flex border-b border-[#D9DEE2]">
          {API_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 pb-3 pt-1 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? 'border-[#133696] text-[#133696] font-semibold'
                  : 'border-transparent text-[#A9B2B9] font-normal hover:text-[#434D56]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewSection onTabChange={setActiveTab} canCreate={canCreate} />
        )}
        {activeTab === 'incoming' && (
          <IncomingSection canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />
        )}
        {activeTab === 'outgoing' && (
          <OutgoingSection canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} />
        )}
        {activeTab === 'tokens' && (
          <TokensSection
            canCreate={canCreate}
            canEdit={canEdit}
            canViewTokens={canViewTokens}
            isCoach={isCoach}
          />
        )}
        {activeTab === 'logs' && <LogsSection />}
      </div>
    </div>
  )
}
