interface StatusBadgeProps {
  status: string
}

const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  Active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Onboarding: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Plan Expired': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  'In Active': { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
  Live: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Draft: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  Unpublished: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
  'Super Admin': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  Admin: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Doctor: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Health Coach': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  Busy: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'On leave': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Medical Goal': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {status}
    </span>
  )
}
