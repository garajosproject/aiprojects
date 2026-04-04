import { useState, useMemo } from 'react'
import { mockLogs, mockIncomingApis } from './mock'
import { ApiLog, HttpMethod } from './types'
import { getResponseTimeColor } from './utils'
import { MethodBadge } from './shared'

type DateRange = 'last_hour' | 'last_24h' | 'last_7d' | 'all'

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: 'last_hour', label: 'Last hour' },
  { value: 'last_24h', label: 'Last 24h' },
  { value: 'last_7d', label: 'Last 7 days' },
  { value: 'all', label: 'All time' },
]

function StatusCodeBadge({ code }: { code: number }) {
  const color = code < 300 ? 'bg-green-100 text-green-700' : code < 400 ? 'bg-blue-100 text-blue-700' : code < 500 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{code}</span>
}

function LogRow({ log }: { log: ApiLog }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr className={`hover:bg-gray-50 transition-colors ${expanded ? 'bg-[#EEF1F3]' : ''}`}>
        <td className="px-5 py-3 text-xs text-[#A9B2B9] whitespace-nowrap">
          {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          <br />
          <span className="text-[10px]">{new Date(log.timestamp).toLocaleDateString()}</span>
        </td>
        <td className="px-4 py-3">
          <p className="text-xs font-semibold text-[#1A2128]">{log.apiName}</p>
        </td>
        <td className="px-4 py-3">
          <code className="text-xs font-mono text-[#434D56]">{log.endpoint}</code>
        </td>
        <td className="px-4 py-3"><MethodBadge method={log.method} /></td>
        <td className="px-4 py-3"><StatusCodeBadge code={log.statusCode} /></td>
        <td className="px-4 py-3">
          <span className={`text-xs font-semibold ${getResponseTimeColor(log.responseTime)}`}>
            {log.responseTime}ms
          </span>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              log.status === 'Success' ? 'bg-[#D8F5CE] text-[#336B1F]' : 'bg-[#FFE5E5] text-[#812222]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Success' ? 'bg-[#336B1F]' : 'bg-[#812222]'}`} />
            {log.status}
          </span>
        </td>
        <td className="px-5 py-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#133696] font-medium hover:underline"
          >
            {expanded ? 'Hide' : 'Details'}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#EEF1F3]">
          <td colSpan={8} className="px-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              {log.requestBody && (
                <div>
                  <p className="text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide mb-2">Request Body</p>
                  <pre className="bg-white border border-[#D9DEE2] rounded-lg p-3 text-xs font-mono text-[#434D56] overflow-x-auto max-h-36">
                    {(() => { try { return JSON.stringify(JSON.parse(log.requestBody!), null, 2) } catch { return log.requestBody } })()}
                  </pre>
                </div>
              )}
              {log.error && (
                <div>
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Error</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-700">{log.error}</p>
                  </div>
                </div>
              )}
              {!log.requestBody && !log.error && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide mb-2">Response</p>
                  <pre className="bg-white border border-[#D9DEE2] rounded-lg p-3 text-xs font-mono text-[#434D56] overflow-x-auto max-h-36">
                    {JSON.stringify({ status: log.statusCode, timestamp: log.timestamp, responseTime: `${log.responseTime}ms` }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function LogsSection() {
  const [search, setSearch] = useState('')
  const [filterApi, setFilterApi] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMethod, setFilterMethod] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange>('last_24h')

  const now = new Date('2024-04-03T16:00:00Z')

  const filtered = useMemo(() => {
    return mockLogs.filter(log => {
      if (search && !log.endpoint.toLowerCase().includes(search.toLowerCase()) && !log.apiName.toLowerCase().includes(search.toLowerCase())) return false
      if (filterApi !== 'all' && log.apiId !== filterApi) return false
      if (filterStatus !== 'all' && log.status !== filterStatus) return false
      if (filterMethod !== 'all' && log.method !== filterMethod) return false

      const logTime = new Date(log.timestamp).getTime()
      if (dateRange === 'last_hour' && now.getTime() - logTime > 3600000) return false
      if (dateRange === 'last_24h' && now.getTime() - logTime > 86400000) return false
      if (dateRange === 'last_7d' && now.getTime() - logTime > 7 * 86400000) return false

      return true
    })
  }, [search, filterApi, filterStatus, filterMethod, dateRange])

  const totalRequests = filtered.length
  const successCount = filtered.filter(l => l.status === 'Success').length
  const failedCount = filtered.filter(l => l.status === 'Failed').length
  const avgResponseTime = filtered.length > 0
    ? Math.round(filtered.reduce((sum, l) => sum + l.responseTime, 0) / filtered.length)
    : 0
  const successRate = totalRequests > 0 ? Math.round(successCount / totalRequests * 100) : 0

  return (
    <div className="space-y-5">
      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: totalRequests, sub: 'In selected range', color: 'text-[#133696]' },
          { label: 'Success Rate', value: `${successRate}%`, sub: `${successCount} successful`, color: 'text-green-600' },
          { label: 'Avg Response Time', value: `${avgResponseTime}ms`, sub: avgResponseTime < 100 ? 'Excellent' : avgResponseTime < 500 ? 'Good' : 'Slow', color: getResponseTimeColor(avgResponseTime) },
          { label: 'Failed Requests', value: failedCount, sub: `${100 - successRate}% failure rate`, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-[#D9DEE2] rounded-xl shadow-sm p-4">
            <p className="text-xs text-[#A9B2B9] font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#A9B2B9] mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#D9DEE2] rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9B2B9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full h-10 pl-9 pr-4 border border-[#D9DEE2] rounded-lg text-sm text-[#1A2128] placeholder:text-[#A9B2B9] outline-none focus:border-[#133696]"
              placeholder="Search by endpoint or API name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* API Filter */}
          <select
            className="h-10 px-3 border border-[#D9DEE2] rounded-lg text-sm bg-white text-[#1A2128] outline-none focus:border-[#133696]"
            value={filterApi}
            onChange={e => setFilterApi(e.target.value)}
          >
            <option value="all">All APIs</option>
            {mockIncomingApis.map(api => (
              <option key={api.id} value={api.id}>{api.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="h-10 px-3 border border-[#D9DEE2] rounded-lg text-sm bg-white text-[#1A2128] outline-none focus:border-[#133696]"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>

          {/* Method Filter */}
          <select
            className="h-10 px-3 border border-[#D9DEE2] rounded-lg text-sm bg-white text-[#1A2128] outline-none focus:border-[#133696]"
            value={filterMethod}
            onChange={e => setFilterMethod(e.target.value)}
          >
            <option value="all">All Methods</option>
            {(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as HttpMethod[]).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex border border-[#D9DEE2] rounded-lg overflow-hidden">
            {DATE_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setDateRange(r.value)}
                className={`px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  dateRange === r.value
                    ? 'bg-[#133696] text-white'
                    : 'text-[#434D56] hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-[#D9DEE2] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EEF1F3] border-b border-[#D9DEE2]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">API Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Endpoint</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Method</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Status Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Response Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DEE2]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#A9B2B9] text-sm">
                    No logs match your filters
                  </td>
                </tr>
              ) : (
                filtered.map(log => <LogRow key={log.id} log={log} />)
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-[#D9DEE2] text-xs text-[#A9B2B9]">
          Showing {filtered.length} of {mockLogs.length} log entries
        </div>
      </div>
    </div>
  )
}
