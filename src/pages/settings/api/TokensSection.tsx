import { useState } from 'react'
import { mockTokens } from './mock'
import { ApiToken, Role } from './types'
import { generateToken, maskValue, formatDate } from './utils'
import { StatusBadge, CopyButton, ApiModal } from './shared'

const ROLES: Role[] = ['Super Admin', 'Doctor', 'Coach']

const roleColors: Record<Role, string> = {
  'Super Admin': 'bg-[#E9EFFF] text-[#133696]',
  'Doctor': 'bg-green-100 text-green-700',
  'Coach': 'bg-orange-100 text-orange-700',
}

const rolePermissions: Record<Role, string[]> = {
  'Super Admin': ['Full read/write all APIs', 'Manage tokens', 'Delete resources', 'View all logs'],
  'Doctor': ['Read-only patient APIs', 'View appointments', 'Access health reports', 'View own logs'],
  'Coach': ['Limited to wellness APIs', 'View coaching data', 'No API management access'],
}

interface TokensSectionProps {
  canCreate: boolean
  canEdit: boolean
  canViewTokens: boolean
  isCoach: boolean
}

export default function TokensSection({ canCreate, canEdit, canViewTokens, isCoach }: TokensSectionProps) {
  const [tokens, setTokens] = useState<ApiToken[]>(mockTokens)
  const [showModal, setShowModal] = useState(false)
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null)
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set())

  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState<Role>('Doctor')
  const [formHasExpiry, setFormHasExpiry] = useState(false)
  const [formExpiry, setFormExpiry] = useState('')

  const toggleTokenVisibility = (id: string) => {
    setVisibleTokens(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreate = () => {
    if (!formName.trim()) return
    const token = generateToken()
    const newToken: ApiToken = {
      id: `tok-${Date.now()}`,
      name: formName,
      token,
      status: 'Active',
      role: formRole,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      expiresAt: formHasExpiry && formExpiry ? new Date(formExpiry).toISOString() : undefined,
      usageCount: 0,
    }
    setTokens(prev => [newToken, ...prev])
    setNewlyCreatedToken(token)
    setFormName('')
    setFormRole('Doctor')
    setFormHasExpiry(false)
    setFormExpiry('')
  }

  const handleRevoke = (id: string) => {
    if (confirm('Revoke this token? This action cannot be undone.')) {
      setTokens(prev => prev.map(t => t.id === id ? { ...t, status: 'Revoked' } : t))
    }
  }

  const handleRegenerate = (id: string) => {
    const newTok = generateToken()
    setTokens(prev => prev.map(t => t.id === id ? { ...t, token: newTok, lastUsed: new Date().toISOString() } : t))
    alert(`Token regenerated. New token:\n${newTok}\n\nSave this — it won't be shown again.`)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A2128]">API Tokens</h2>
          <p className="text-sm text-[#A9B2B9]">{tokens.filter(t => t.status === 'Active').length} active tokens</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate New Token
          </button>
        )}
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-2 gap-4">
        {tokens.map(token => {
          const isVisible = visibleTokens.has(token.id) && !isCoach
          const canSeeToken = canViewTokens

          return (
            <div key={token.id} className="bg-white border border-[#D9DEE2] rounded-xl shadow-sm p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[#1A2128] text-sm">{token.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${roleColors[token.role]}`}>
                    {token.role}
                  </span>
                </div>
                <StatusBadge status={token.status} />
              </div>

              {/* Token Value */}
              <div className="bg-[#EEF1F3] rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-[#434D56] break-all">
                    {canSeeToken && isVisible ? token.token : maskValue(token.token)}
                  </code>
                  {canSeeToken && !isCoach && (
                    <button
                      onClick={() => toggleTokenVisibility(token.id)}
                      className="text-[#A9B2B9] hover:text-[#133696] flex-shrink-0"
                    >
                      {isVisible ? (
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
                  )}
                  {canSeeToken && <CopyButton value={token.token} />}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[#A9B2B9]">Usage Count</p>
                  <p className="font-semibold text-[#1A2128]">{token.usageCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[#A9B2B9]">Last Used</p>
                  <p className="font-semibold text-[#1A2128]">{formatDate(token.lastUsed)}</p>
                </div>
                <div>
                  <p className="text-[#A9B2B9]">Created</p>
                  <p className="font-semibold text-[#1A2128]">{formatDate(token.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[#A9B2B9]">Expires</p>
                  <p className={`font-semibold ${token.expiresAt ? 'text-[#1A2128]' : 'text-[#A9B2B9]'}`}>
                    {token.expiresAt ? formatDate(token.expiresAt) : 'Never'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {canEdit && token.status === 'Active' && (
                <div className="flex gap-2 pt-1 border-t border-[#D9DEE2]">
                  <button
                    onClick={() => handleRegenerate(token.id)}
                    className="flex-1 py-1.5 text-xs font-semibold text-[#133696] bg-[#E9EFFF] hover:bg-[#d8e2ff] rounded-lg transition-colors"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => handleRevoke(token.id)}
                    className="flex-1 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              )}
              {token.status === 'Revoked' && (
                <div className="pt-1 border-t border-[#D9DEE2]">
                  <p className="text-xs text-center text-[#A9B2B9]">This token has been revoked</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Generate Token Modal */}
      <ApiModal
        open={showModal}
        onClose={() => { setShowModal(false); setNewlyCreatedToken(null) }}
        title="Generate New Token"
        size="md"
        footer={
          newlyCreatedToken ? (
            <button
              onClick={() => { setShowModal(false); setNewlyCreatedToken(null) }}
              className="px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-[#E9EFFF] text-[#133696] rounded-[10px] text-sm font-semibold hover:bg-[#d8e2ff] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formName.trim()}
                className="px-5 py-2.5 bg-[#133696] text-white rounded-[10px] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Token
              </button>
            </>
          )
        }
      >
        {newlyCreatedToken ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-yellow-800">Save this token now!</p>
                <p className="text-xs text-yellow-700">It won't be shown again after you close this window.</p>
              </div>
            </div>
            <div className="bg-[#EEF1F3] rounded-xl p-4">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-[#133696] break-all">{newlyCreatedToken}</code>
                <CopyButton value={newlyCreatedToken} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-[#1A2128] block mb-1.5">Token Name</label>
              <input
                className="w-full border border-[#D9DEE2] rounded-[10px] h-12 px-4 text-sm outline-none focus:border-[#133696]"
                placeholder="e.g. Production Admin Token"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2128] block mb-1.5">Role</label>
              <div className="flex gap-2">
                {ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => setFormRole(r)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      formRole === r ? 'bg-[#133696] text-white border-[#133696]' : 'bg-white text-[#434D56] border-[#D9DEE2] hover:border-[#133696]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Permissions Info */}
            <div className="bg-[#EEF1F3] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#A9B2B9] uppercase tracking-wide mb-2">{formRole} Permissions</p>
              <ul className="space-y-1">
                {rolePermissions[formRole].map((perm, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#434D56]">
                    <span className="text-[#133696]">•</span>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>

            {/* Expiry Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1A2128]">Set Expiry Date</p>
                <p className="text-xs text-[#A9B2B9]">Token will expire automatically</p>
              </div>
              <button
                onClick={() => setFormHasExpiry(!formHasExpiry)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${formHasExpiry ? 'bg-[#133696]' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${formHasExpiry ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {formHasExpiry && (
              <div>
                <label className="text-sm font-medium text-[#1A2128] block mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  className="w-full h-12 px-4 border border-[#D9DEE2] rounded-[10px] text-sm text-[#1A2128] outline-none focus:border-[#133696] bg-white"
                  value={formExpiry}
                  onChange={e => setFormExpiry(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>
        )}
      </ApiModal>
    </div>
  )
}
