// Shared tab bar — single source of truth for all tab styling
// Default: text-[#A9B2B9]  |  Hover: text-[#434D56]  |  Active: text-[#133696] + bottom border

export interface TabItem {
  key: string
  label: string
}

interface TabBarProps {
  tabs: TabItem[]
  activeKey: string
  onChange: (key: string) => void
}

export default function TabBar({ tabs, activeKey, onChange }: TabBarProps) {
  return (
    <div className="flex border-b border-[#D9DEE2]">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 pb-3 pt-1 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
            activeKey === tab.key
              ? 'border-[#133696] text-[#133696] font-semibold'
              : 'border-transparent text-[#A9B2B9] font-normal hover:text-[#434D56]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
