import { BellOutlined, SearchOutlined } from '@ant-design/icons'
import { Badge, Input } from 'antd'

interface HeaderProps {
  title: string
  icon?: React.ReactNode
  searchPlaceholder?: string
  showSearch?: boolean
  breadcrumb?: React.ReactNode
}

export default function Header({ title, icon, searchPlaceholder = 'Search', showSearch = true, breadcrumb }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6 gap-4">
      {/* Page title / breadcrumb */}
      <div className="flex items-center gap-2 text-gray-700 font-medium min-w-0">
        {breadcrumb ?? (
          <>
            {icon && <span className="text-gray-400">{icon}</span>}
            <span className="text-sm">{title}</span>
          </>
        )}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="flex-1 max-w-sm mx-4">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder={searchPlaceholder}
            className="rounded-lg border-gray-200"
            style={{ background: '#F9FAFB' }}
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-4">
        {/* Bell */}
        <Badge count={2} size="small">
          <BellOutlined className="text-xl text-gray-500 cursor-pointer" />
        </Badge>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}
