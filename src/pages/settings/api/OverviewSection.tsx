import { mockIncomingApis, mockOutgoingApis, mockTokens, mockLogs } from './mock'
import { formatDate } from './utils'
import { MethodBadge, StatusBadge, getResponseTimeColor } from './shared'

interface OverviewSectionProps {
  onTabChange: (tab: string) => void
  canCreate: boolean
}

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: string; color: string }) {
  return (
    <div className="bg-white border border-[#D9DEE2] rounded-xl shadow-sm p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#A9B2B9] font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#1A2128] mt-0.5">{value}</p>
        {sub && <p className="text-xs text-[#A9B2B9] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function OverviewSection({ onTabChange, canCreate }: OverviewSectionProps) {
  const activeIncoming = mockIncomingApis.filter(a => a.status === 'Active').length
  const activeOutgoing = mockOutgoingApis.filter(a => a.status === 'Active').length
  const activeTokens = mockTokens.filter(t => t.status === 'Active').length
  const recentLogs = mockLogs.slice(0, 8)
  const last24hRequests = mockLogs.filter(l => {
    const logTime = new Date(l.timestamp).getTime()
    const cutoff = new Date('2024-04-03T16:00:00Z').getTime() - 24 * 3600000
    return logTime >= cutoff
  }).length

  const allApis = [
    ...mockIncomingApis.map(a => ({ name: a.name, status: a.status, lastUsed: a.lastUsed, type: 'in' })),
    ...mockOutgoingApis.map(a => ({ name: a.name, status: a.status, lastUsed: a.lastTested, type: 'out' })),
  ]

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Incoming APIs"
          value={mockIncomingApis.length}
          sub={`${activeIncoming} active (${Math.round(activeIncoming / mockIncomingApis.length * 100)}%)`}
          icon="📥"
          color="bg-[#E9EFFF]"
        />
        <StatCard
          label="Outgoing APIs"
          value={mockOutgoingApis.length}
          sub={`${activeOutgoing} active (${Math.round(activeOutgoing / mockOutgoingApis.length * 100)}%)`}
          icon="📤"
          color="bg-green-50"
        />
        <StatCard
          label="Active Tokens"
          value={activeTokens}
          sub={`${mockTokens.length - activeTokens} revoked`}
          icon="🔑"
          color="bg-yellow-50"
        />
        <StatCard
          label="Requests (24h)"
          value={last24hRequests.toLocaleString()}
          sub="From all APIs"
          icon="📊"
          color="bg-purple-50"
        />
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white border border-[#D9DEE2] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#D9DEE2]">
            <p className="text-sm font-semibold text-[#1A2128]">Recent Activity</p>
          </div>
          <div className="divide-y divide-[#D9DEE2]">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <MethodBadge method={log.method} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A2128] truncate">{log.endpoint}</p>
                    <p className="text-xs text-[#A9B2B9]">{log.apiName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className={`text-xs font-semibold ${getResponseTimeColor(log.responseTime)}`}>
                    {log.responseTime}ms
                  </span>
                  <StatusBadge status={log.status === 'Success' ? 'Active' : 'Inactive'} />
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-[#D9DEE2]">
            <button
              onClick={() => onTabChange('logs')}
              className="text-sm text-[#133696] font-medium hover:underline"
            >
              View all logs →
            </button>
          </div>
        </div>

        {/* API Health */}
        <div className="bg-white border border-[#D9DEE2] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#D9DEE2]">
            <p className="text-sm font-semibold text-[#1A2128]">API Health</p>
          </div>
          <div className="divide-y divide-[#D9DEE2]">
            {allApis.map((api, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${api.status === 'Active' ? 'bg-green-500' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-[#1A2128]">{api.name}</p>
                    <p className="text-xs text-[#A9B2B9]">{api.type === 'in' ? 'Incoming' : 'Outgoing'} · Last: {formatDate(api.lastUsed)}</p>
                  </div>
                </div>
                <StatusBadge status={api.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-[#D9DEE2] rounded-xl shadow-sm p-5">
        <p className="text-sm font-semibold text-[#1A2128] mb-4">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          {canCreate && (
            <>
              <button
                onClick={() => onTabChange('incoming')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:bg-[#0f2a7a] transition-colors"
              >
                <span>📥</span>
                New Incoming API
              </button>
              <button
                onClick={() => onTabChange('outgoing')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E9EFFF] text-[#133696] rounded-[10px] text-sm font-semibold hover:bg-[#d8e2ff] transition-colors"
              >
                <span>📤</span>
                New Outgoing API
              </button>
              <button
                onClick={() => onTabChange('tokens')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E9EFFF] text-[#133696] rounded-[10px] text-sm font-semibold hover:bg-[#d8e2ff] transition-colors"
              >
                <span>🔑</span>
                Generate Token
              </button>
            </>
          )}
          <button
            onClick={() => onTabChange('logs')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E9EFFF] text-[#133696] rounded-[10px] text-sm font-semibold hover:bg-[#d8e2ff] transition-colors"
          >
            <span>📋</span>
            View Logs
          </button>
        </div>
      </div>
    </div>
  )
}
