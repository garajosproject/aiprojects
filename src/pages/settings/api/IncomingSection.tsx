import { useState } from 'react'
import { mockIncomingApis } from './mock'
import { IncomingApi, HttpMethod, AuthType, SchemaField } from './types'
import { generateApiKey, maskValue, formatDate, generateApiSetup } from './utils'
import { MethodBadge, StatusBadge, Toggle, CopyButton, ApiKeyCell, ApiModal } from './shared'

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
const AUTH_TYPES: AuthType[] = ['None', 'API Key', 'Bearer Token']

interface SchemaRow {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  description: string
}

interface IncomingSectionProps {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export default function IncomingSection({ canCreate, canEdit, canDelete }: IncomingSectionProps) {
  const [apis, setApis] = useState<IncomingApi[]>(mockIncomingApis)
  const [showModal, setShowModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)

  const [formName, setFormName] = useState('')
  const [formEndpoint, setFormEndpoint] = useState('')
  const [formMethod, setFormMethod] = useState<HttpMethod>('GET')
  const [formAuth, setFormAuth] = useState<AuthType>('None')
  const [formApiKey, setFormApiKey] = useState(generateApiKey())
  const [schemaRows, setSchemaRows] = useState<SchemaRow[]>([
    { name: '', type: 'string', required: false, description: '' }
  ])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<ReturnType<typeof generateApiSetup> | null>(null)

  const resetForm = () => {
    setFormName('')
    setFormEndpoint('')
    setFormMethod('GET')
    setFormAuth('None')
    setFormApiKey(generateApiKey())
    setSchemaRows([{ name: '', type: 'string', required: false, description: '' }])
    setFormErrors({})
  }

  const addSchemaRow = () => {
    setSchemaRows(prev => [...prev, { name: '', type: 'string', required: false, description: '' }])
  }

  const removeSchemaRow = (i: number) => {
    setSchemaRows(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateSchemaRow = (i: number, field: keyof SchemaRow, value: string | boolean) => {
    setSchemaRows(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formName.trim()) errors.name = 'Name is required'
    if (!formEndpoint.trim()) errors.endpoint = 'Endpoint is required'
    return errors
  }

  const handleSave = () => {
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    const schema: Record<string, SchemaField> = {}
    schemaRows.filter(r => r.name.trim()).forEach(r => {
      schema[r.name] = { type: r.type, required: r.required, description: r.description }
    })
    const newApi: IncomingApi = {
      id: `inc-${Date.now()}`,
      name: formName,
      endpoint: formEndpoint.startsWith('/api/v1/') ? formEndpoint : `/api/v1/${formEndpoint}`,
      method: formMethod,
      authType: formAuth,
      status: 'Active',
      apiKey: formApiKey,
      schema,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      requestCount: 0,
    }
    setApis(prev => [newApi, ...prev])
    setShowModal(false)
    resetForm()
  }

  const toggleStatus = (id: string) => {
    setApis(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a))
  }

  const deleteApi = (id: string) => {
    if (confirm('Are you sure you want to delete this API?')) {
      setApis(prev => prev.filter(a => a.id !== id))
    }
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setAiResult(null)
    await new Promise(r => setTimeout(r, 1500))
    const result = generateApiSetup(aiPrompt)
    setAiResult(result)
    setAiLoading(false)
  }

  const applyAiResult = () => {
    if (!aiResult) return
    setFormName(aiResult.name)
    setFormEndpoint(aiResult.endpoint)
    setFormMethod(aiResult.method)
    const rows: SchemaRow[] = Object.entries(aiResult.schema).map(([name, field]) => ({
      name,
      type: field.type as SchemaRow['type'],
      required: field.required,
      description: field.description || '',
    }))
    setSchemaRows(rows)
    setShowAIModal(false)
    setShowModal(true)
    setAiPrompt('')
    setAiResult(null)
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A2128]">Incoming APIs</h2>
          <p className="text-sm text-[#A9B2B9]">{apis.length} APIs configured</p>
        </div>
        {canCreate && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E9EFFF] text-[#133696] rounded-[10px] text-sm font-semibold hover:bg-[#d8e2ff] transition-colors"
            >
              <span>✨</span>
              AI Generate
            </button>
            <button
              onClick={() => { resetForm(); setShowModal(true) }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New API
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#D9DEE2] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EEF1F3] border-b border-[#D9DEE2]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">API Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Method</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Auth</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">API Key</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Requests</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Last Used</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DEE2]">
              {apis.map(api => (
                <tr key={api.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#1A2128]">{api.name}</p>
                    <p className="text-xs text-[#A9B2B9] font-mono mt-0.5">{api.endpoint}</p>
                  </td>
                  <td className="px-4 py-4">
                    <MethodBadge method={api.method} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-[#434D56]">{api.authType}</span>
                  </td>
                  <td className="px-4 py-4">
                    {canEdit ? (
                      <Toggle
                        checked={api.status === 'Active'}
                        onChange={() => toggleStatus(api.id)}
                      />
                    ) : (
                      <StatusBadge status={api.status} />
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <ApiKeyCell apiKey={api.apiKey} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-[#1A2128]">{api.requestCount.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-[#A9B2B9]">{formatDate(api.lastUsed)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <button className="text-xs text-[#133696] font-medium hover:underline">Edit</button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => deleteApi(api.id)}
                          className="text-xs text-red-500 font-medium hover:underline"
                        >
                          Delete
                        </button>
                      )}
                      {!canEdit && !canDelete && (
                        <span className="text-xs text-[#A9B2B9]">Read-only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New API Modal */}
      <ApiModal
        open={showModal}
        onClose={() => { setShowModal(false); resetForm() }}
        title="New Incoming API"
        size="lg"
        footer={
          <>
            <button
              onClick={() => { setShowModal(false); resetForm() }}
              className="px-5 py-2.5 bg-[#E9EFFF] text-[#133696] rounded-[10px] text-sm font-semibold hover:bg-[#d8e2ff] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Save API
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-[#1A2128] block mb-1.5">API Name</label>
            <input
              className="w-full border border-[#D9DEE2] rounded-[10px] h-12 px-4 text-sm outline-none focus:border-[#133696]"
              placeholder="e.g. Patient Data API"
              value={formName}
              onChange={e => { setFormName(e.target.value); setFormErrors(p => ({ ...p, name: '' })) }}
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>

          {/* Endpoint */}
          <div>
            <label className="text-sm font-medium text-[#1A2128] block mb-1.5">Endpoint</label>
            <div className="flex items-center border border-[#D9DEE2] rounded-[10px] overflow-hidden focus-within:border-[#133696] bg-white">
              <span className="px-3 py-3 bg-[#EEF1F3] text-sm text-[#A9B2B9] border-r border-[#D9DEE2] whitespace-nowrap h-12 flex items-center">
                /api/v1/
              </span>
              <input
                className="flex-1 px-3 py-3 text-sm text-[#1A2128] outline-none h-12"
                placeholder="patients"
                value={formEndpoint.replace('/api/v1/', '')}
                onChange={e => { setFormEndpoint(e.target.value); setFormErrors(p => ({ ...p, endpoint: '' })) }}
              />
            </div>
            {formErrors.endpoint && <p className="text-xs text-red-500 mt-1">{formErrors.endpoint}</p>}
          </div>

          {/* Method Selector */}
          <div>
            <label className="text-sm font-medium text-[#1A2128] block mb-1.5">HTTP Method</label>
            <div className="flex gap-2">
              {HTTP_METHODS.map(m => (
                <button
                  key={m}
                  onClick={() => setFormMethod(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                    formMethod === m
                      ? 'bg-[#133696] text-white border-[#133696]'
                      : 'bg-white text-[#434D56] border-[#D9DEE2] hover:border-[#133696]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Auth Type */}
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

          {/* Schema Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#1A2128]">Request Schema</label>
              <button
                onClick={addSchemaRow}
                className="text-xs text-[#133696] font-medium hover:underline flex items-center gap-1"
              >
                + Add Field
              </button>
            </div>
            <div className="space-y-2">
              {schemaRows.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="flex-1 h-10 px-3 border border-[#D9DEE2] rounded-lg text-sm outline-none focus:border-[#133696]"
                    placeholder="Field name"
                    value={row.name}
                    onChange={e => updateSchemaRow(i, 'name', e.target.value)}
                  />
                  <select
                    className="h-10 px-2 border border-[#D9DEE2] rounded-lg text-sm outline-none focus:border-[#133696] bg-white"
                    value={row.type}
                    onChange={e => updateSchemaRow(i, 'type', e.target.value)}
                  >
                    {['string', 'number', 'boolean', 'object', 'array'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    className="flex-1 h-10 px-3 border border-[#D9DEE2] rounded-lg text-sm outline-none focus:border-[#133696]"
                    placeholder="Description"
                    value={row.description}
                    onChange={e => updateSchemaRow(i, 'description', e.target.value)}
                  />
                  <label className="flex items-center gap-1 text-xs text-[#434D56] whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={row.required}
                      onChange={e => updateSchemaRow(i, 'required', e.target.checked)}
                      className="accent-[#133696]"
                    />
                    Required
                  </label>
                  {schemaRows.length > 1 && (
                    <button onClick={() => removeSchemaRow(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="bg-[#EEF1F3] rounded-xl p-4">
            <label className="text-sm font-medium text-[#1A2128] block mb-2">Generated API Key</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-white border border-[#D9DEE2] px-3 py-2 rounded-lg text-[#434D56] break-all">
                {maskValue(formApiKey)}
              </code>
              <button
                onClick={() => setFormApiKey(generateApiKey())}
                className="px-3 py-2 bg-[#E9EFFF] text-[#133696] rounded-lg text-xs font-medium hover:bg-[#d8e2ff] transition-colors whitespace-nowrap"
              >
                Regenerate
              </button>
              <CopyButton value={formApiKey} />
            </div>
          </div>
        </div>
      </ApiModal>

      {/* AI Generate Modal */}
      <ApiModal
        open={showAIModal}
        onClose={() => { setShowAIModal(false); setAiPrompt(''); setAiResult(null); setAiLoading(false) }}
        title="AI Generate API"
        size="md"
        footer={
          aiResult ? (
            <>
              <button
                onClick={() => setAiResult(null)}
                className="px-5 py-2.5 bg-[#E9EFFF] text-[#133696] rounded-[10px] text-sm font-semibold hover:bg-[#d8e2ff] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={applyAiResult}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <span>✓</span>
                Use This Setup
              </button>
            </>
          ) : (
            <button
              onClick={handleAiGenerate}
              disabled={!aiPrompt.trim() || aiLoading}
              className="px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? 'Generating...' : 'Generate'}
            </button>
          )
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#1A2128] block mb-1.5">Describe your API purpose</label>
            <textarea
              className="w-full h-28 px-4 py-3 border border-[#D9DEE2] rounded-[10px] text-sm text-[#1A2128] placeholder:text-[#A9B2B9] outline-none focus:border-[#133696] resize-none"
              placeholder="e.g. I need an API to manage patient appointments with doctor scheduling..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              disabled={aiLoading}
            />
          </div>

          {aiLoading && (
            <div className="flex items-center gap-3 p-4 bg-[#E9EFFF] rounded-xl">
              <svg className="animate-spin h-5 w-5 text-[#133696]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-[#133696] font-medium">Generating your API configuration...</p>
            </div>
          )}

          {aiResult && (
            <div className="border border-[#D9DEE2] rounded-xl overflow-hidden">
              <div className="bg-[#EEF1F3] px-4 py-2.5 border-b border-[#D9DEE2]">
                <p className="text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide">Generated Configuration</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#A9B2B9]">Name</p>
                    <p className="text-sm font-semibold text-[#1A2128]">{aiResult.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#A9B2B9]">Method</p>
                    <MethodBadge method={aiResult.method} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#A9B2B9]">Endpoint</p>
                  <code className="text-xs font-mono text-[#133696]">{aiResult.endpoint}</code>
                </div>
                <div>
                  <p className="text-xs text-[#A9B2B9] mb-1">Schema Fields</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(aiResult.schema).map(([name, field]) => (
                      <span key={name} className="px-2 py-0.5 bg-[#E9EFFF] text-[#133696] rounded text-xs font-mono">
                        {name}: {field.type}{field.required ? '*' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#A9B2B9]">{aiResult.description}</p>
              </div>
            </div>
          )}
        </div>
      </ApiModal>
    </div>
  )
}
