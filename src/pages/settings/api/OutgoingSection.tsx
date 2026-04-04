import { useState } from 'react'
import { mockOutgoingApis } from './mock'
import { OutgoingApi, HttpMethod, AuthType, FieldMapping } from './types'
import { formatDate } from './utils'
import { MethodBadge, StatusBadge, ApiModal } from './shared'

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
const AUTH_TYPES: AuthType[] = ['None', 'API Key', 'Bearer Token']
const TRANSFORMS = ['none', 'uppercase', 'lowercase', 'format_date', 'trim', 'json_stringify']

interface TestResult {
  status: number
  body: string
  time: number
  success: boolean
}

interface OutgoingSectionProps {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export default function OutgoingSection({ canCreate, canEdit, canDelete }: OutgoingSectionProps) {
  const [apis, setApis] = useState<OutgoingApi[]>(mockOutgoingApis)
  const [showModal, setShowModal] = useState(false)
  const [testPanelApi, setTestPanelApi] = useState<OutgoingApi | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  const [wizardStep, setWizardStep] = useState(1)
  const [formName, setFormName] = useState('')
  const [formEndpoint, setFormEndpoint] = useState('')
  const [formMethod, setFormMethod] = useState<HttpMethod>('POST')
  const [formAuth, setFormAuth] = useState<AuthType>('None')
  const [formAuthValue, setFormAuthValue] = useState('')
  const [showAuthValue, setShowAuthValue] = useState(false)
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Authorization', value: '' },
  ])
  const [mappings, setMappings] = useState<{ internalField: string; externalField: string; transform: string }[]>([
    { internalField: '', externalField: '', transform: 'none' }
  ])

  const resetForm = () => {
    setWizardStep(1)
    setFormName('')
    setFormEndpoint('')
    setFormMethod('POST')
    setFormAuth('None')
    setFormAuthValue('')
    setShowAuthValue(false)
    setHeaders([
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Authorization', value: '' },
    ])
    setMappings([{ internalField: '', externalField: '', transform: 'none' }])
  }

  const handleSave = () => {
    const headerMap: Record<string, string> = {}
    headers.filter(h => h.key.trim()).forEach(h => { headerMap[h.key] = h.value })

    const fieldMappings: FieldMapping[] = mappings
      .filter(m => m.internalField.trim())
      .map((m, i) => ({
        id: `fm-new-${i}`,
        internalField: m.internalField,
        externalField: m.externalField,
        transform: m.transform,
      }))

    const newApi: OutgoingApi = {
      id: `out-${Date.now()}`,
      name: formName,
      endpoint: formEndpoint,
      method: formMethod,
      authType: formAuth,
      status: 'Active',
      headers: headerMap,
      fieldMappings,
      createdAt: new Date().toISOString(),
      lastTested: new Date().toISOString(),
    }
    setApis(prev => [newApi, ...prev])
    setShowModal(false)
    resetForm()
  }

  const deleteApi = (id: string) => {
    if (confirm('Delete this API?')) setApis(prev => prev.filter(a => a.id !== id))
  }

  const handleTest = (api: OutgoingApi) => {
    setTestPanelApi(api)
    setTestResult(null)
  }

  const sendTest = async () => {
    if (!testPanelApi) return
    setTestLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    const success = Math.random() > 0.3
    const time = Math.floor(Math.random() * 400) + 80
    setTestResult({
      status: success ? 200 : 500,
      body: success
        ? JSON.stringify({ success: true, data: { id: `obj_${Math.random().toString(36).slice(2, 10)}`, timestamp: new Date().toISOString() } }, null, 2)
        : JSON.stringify({ error: 'Internal Server Error', message: 'Failed to connect to external service' }, null, 2),
      time,
      success,
    })
    setTestLoading(false)
  }

  const stepLabels = ['Basic Config', 'Headers', 'Field Mapping']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A2128]">Outgoing APIs</h2>
          <p className="text-sm text-[#A9B2B9]">{apis.length} integrations configured</p>
        </div>
        {canCreate && (
          <button
            onClick={() => { resetForm(); setShowModal(true) }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add API
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#D9DEE2] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EEF1F3] border-b border-[#D9DEE2]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Integration</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Method</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Auth</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Last Tested</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DEE2]">
              {apis.map(api => (
                <tr key={api.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#1A2128]">{api.name}</p>
                    <p className="text-xs text-[#A9B2B9] font-mono mt-0.5 truncate max-w-xs">{api.endpoint}</p>
                  </td>
                  <td className="px-4 py-4"><MethodBadge method={api.method} /></td>
                  <td className="px-4 py-4"><span className="text-sm text-[#434D56]">{api.authType}</span></td>
                  <td className="px-4 py-4"><StatusBadge status={api.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {api.lastResponse && (
                        <span className={`w-2 h-2 rounded-full ${api.lastResponse.success ? 'bg-green-500' : 'bg-red-500'}`} />
                      )}
                      <span className="text-xs text-[#A9B2B9]">{formatDate(api.lastTested)}</span>
                      {api.lastResponse && (
                        <span className={`text-xs font-semibold ${api.lastResponse.success ? 'text-green-600' : 'text-red-500'}`}>
                          {api.lastResponse.status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <button className="text-xs text-[#133696] font-medium hover:underline">Configure</button>
                      )}
                      <button
                        onClick={() => handleTest(api)}
                        className="text-xs text-green-600 font-medium hover:underline"
                      >
                        Test
                      </button>
                      {canDelete && (
                        <button onClick={() => deleteApi(api.id)} className="text-xs text-red-500 font-medium hover:underline">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add API Modal - 3 Step Wizard */}
      <ApiModal
        open={showModal}
        onClose={() => { setShowModal(false); resetForm() }}
        title={`Add Outgoing API — Step ${wizardStep}: ${stepLabels[wizardStep - 1]}`}
        size="lg"
        footer={
          <>
            {wizardStep > 1 && (
              <button
                onClick={() => setWizardStep(s => s - 1)}
                className="px-5 py-2.5 bg-[#E9EFFF] text-[#133696] rounded-[10px] text-sm font-semibold hover:bg-[#d8e2ff] transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={() => { setShowModal(false); resetForm() }}
              className="px-5 py-2.5 bg-[#E9EFFF] text-[#133696] rounded-[10px] text-sm font-semibold hover:bg-[#d8e2ff] transition-colors"
            >
              Cancel
            </button>
            {wizardStep < 3 ? (
              <button
                onClick={() => setWizardStep(s => s + 1)}
                disabled={wizardStep === 1 && (!formName.trim() || !formEndpoint.trim())}
                className="px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Save Integration
              </button>
            )}
          </>
        }
      >
        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-6">
          {stepLabels.map((label, i) => {
            const step = i + 1
            const done = step < wizardStep
            const active = step === wizardStep
            return (
              <div key={i} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    done ? 'bg-green-500 text-white' : active ? 'bg-[#133696] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {done ? '✓' : step}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-[#133696]' : 'text-[#A9B2B9]'}`}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && <div className="flex-1 h-px bg-[#D9DEE2] mx-3" />}
              </div>
            )
          })}
        </div>

        {/* Step 1: Basic Config */}
        {wizardStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1A2128] block mb-1.5">Integration Name</label>
              <input
                className="w-full border border-[#D9DEE2] rounded-[10px] h-12 px-4 text-sm outline-none focus:border-[#133696]"
                placeholder="e.g. Zoho CRM Sync"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A2128] block mb-1.5">Endpoint URL</label>
              <input
                className="w-full border border-[#D9DEE2] rounded-[10px] h-12 px-4 text-sm outline-none focus:border-[#133696]"
                placeholder="https://api.example.com/v1/resource"
                value={formEndpoint}
                onChange={e => setFormEndpoint(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A2128] block mb-1.5">HTTP Method</label>
              <div className="flex gap-2 flex-wrap">
                {HTTP_METHODS.map(m => (
                  <button
                    key={m}
                    onClick={() => setFormMethod(m)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                      formMethod === m ? 'bg-[#133696] text-white border-[#133696]' : 'bg-white text-[#434D56] border-[#D9DEE2] hover:border-[#133696]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A2128] block mb-1.5">Auth Type</label>
              <select
                className="w-full border border-[#D9DEE2] rounded-[10px] h-12 px-4 text-sm outline-none focus:border-[#133696] bg-white"
                value={formAuth}
                onChange={e => setFormAuth(e.target.value as AuthType)}
              >
                {AUTH_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {formAuth !== 'None' && (
              <div>
                <label className="text-sm font-medium text-[#1A2128] block mb-1.5">
                  {formAuth === 'API Key' ? 'API Key Value' : 'Bearer Token'}
                </label>
                <div className="relative">
                  <input
                    type={showAuthValue ? 'text' : 'password'}
                    className="w-full border border-[#D9DEE2] rounded-[10px] h-12 px-4 pr-10 text-sm outline-none focus:border-[#133696]"
                    placeholder={formAuth === 'API Key' ? 'Enter your API key' : 'Enter bearer token'}
                    value={formAuthValue}
                    onChange={e => setFormAuthValue(e.target.value)}
                  />
                  <button
                    onClick={() => setShowAuthValue(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9B2B9] hover:text-[#133696]"
                  >
                    {showAuthValue ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Headers */}
        {wizardStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#1A2128]">Request Headers</p>
              <button
                onClick={() => setHeaders(prev => [...prev, { key: '', value: '' }])}
                className="text-xs text-[#133696] font-medium hover:underline"
              >
                + Add Header
              </button>
            </div>
            <div className="space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="flex-1 h-10 px-3 border border-[#D9DEE2] rounded-lg text-sm outline-none focus:border-[#133696]"
                    placeholder="Header name"
                    value={h.key}
                    onChange={e => setHeaders(prev => prev.map((x, idx) => idx === i ? { ...x, key: e.target.value } : x))}
                  />
                  <input
                    className="flex-1 h-10 px-3 border border-[#D9DEE2] rounded-lg text-sm outline-none focus:border-[#133696]"
                    placeholder="Header value"
                    value={h.value}
                    onChange={e => setHeaders(prev => prev.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))}
                  />
                  {headers.length > 1 && (
                    <button onClick={() => setHeaders(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Field Mapping */}
        {wizardStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#1A2128]">Field Mappings</p>
              <button
                onClick={() => setMappings(prev => [...prev, { internalField: '', externalField: '', transform: 'none' }])}
                className="text-xs text-[#133696] font-medium hover:underline"
              >
                + Add Mapping
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide px-1">
              <span>Internal Field</span>
              <span>External Field</span>
              <span>Transform</span>
            </div>
            <div className="space-y-2">
              {mappings.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="flex-1 h-10 px-3 border border-[#D9DEE2] rounded-lg text-sm outline-none focus:border-[#133696]"
                    placeholder="e.g. firstName"
                    value={m.internalField}
                    onChange={e => setMappings(prev => prev.map((x, idx) => idx === i ? { ...x, internalField: e.target.value } : x))}
                  />
                  <input
                    className="flex-1 h-10 px-3 border border-[#D9DEE2] rounded-lg text-sm outline-none focus:border-[#133696]"
                    placeholder="e.g. First_Name"
                    value={m.externalField}
                    onChange={e => setMappings(prev => prev.map((x, idx) => idx === i ? { ...x, externalField: e.target.value } : x))}
                  />
                  <select
                    className="h-10 px-2 border border-[#D9DEE2] rounded-lg text-sm bg-white outline-none focus:border-[#133696]"
                    value={m.transform}
                    onChange={e => setMappings(prev => prev.map((x, idx) => idx === i ? { ...x, transform: e.target.value } : x))}
                  >
                    {TRANSFORMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {mappings.length > 1 && (
                    <button onClick={() => setMappings(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </ApiModal>

      {/* Test Panel Drawer */}
      {testPanelApi && (
        <div className="fixed inset-0 z-50" onClick={(e) => { if (e.target === e.currentTarget) { setTestPanelApi(null); setTestResult(null) } }}>
          <div
            className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl border-l border-[#D9DEE2] flex flex-col"
            style={{ animation: 'slideInRight 0.2s ease-out' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9DEE2]">
              <div>
                <h3 className="text-base font-bold text-[#1A2128]">Test API</h3>
                <p className="text-xs text-[#A9B2B9]">{testPanelApi.name}</p>
              </div>
              <button onClick={() => { setTestPanelApi(null); setTestResult(null) }} className="text-[#A9B2B9] hover:text-[#1A2128]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center gap-2 bg-[#EEF1F3] rounded-xl p-3">
                <MethodBadge method={testPanelApi.method} />
                <code className="text-xs font-mono text-[#434D56] flex-1 break-all">{testPanelApi.endpoint}</code>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide mb-2">Headers</p>
                <div className="bg-[#EEF1F3] rounded-xl p-3 space-y-1">
                  {Object.entries(testPanelApi.headers).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-xs font-mono">
                      <span className="text-[#133696] font-semibold">{k}:</span>
                      <span className="text-[#434D56]">{v.length > 20 ? v.slice(0, 20) + '...' : v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {testPanelApi.fieldMappings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide mb-2">Request Body Preview</p>
                  <pre className="bg-[#EEF1F3] rounded-xl p-3 text-xs font-mono text-[#434D56] overflow-x-auto">
                    {JSON.stringify(
                      Object.fromEntries(testPanelApi.fieldMappings.map(m => [m.externalField, `<${m.internalField}>`])),
                      null, 2
                    )}
                  </pre>
                </div>
              )}

              {testResult && (
                <div className={`border rounded-xl overflow-hidden ${testResult.success ? 'border-green-200' : 'border-red-200'}`}>
                  <div className={`px-4 py-2.5 flex items-center justify-between ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                        {testResult.status}
                      </span>
                      <span className={`text-xs ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResult.success ? 'OK' : 'Error'}
                      </span>
                    </div>
                    <span className="text-xs text-[#A9B2B9]">{testResult.time}ms</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[#434D56] overflow-x-auto max-h-48 bg-white">
                    {testResult.body}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#D9DEE2]">
              <button
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={sendTest}
                disabled={testLoading}
              >
                {testLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : 'Send Test Request'}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
