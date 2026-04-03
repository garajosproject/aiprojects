import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import FitPlusLogo, { FitPlusIcon } from '../ui/FitPlusLogo'

const navItems = [
  { label: 'Home', path: '/', icon: <HomeOutlined />, exact: true },
  { label: 'Patients', path: '/patients', icon: <UserOutlined /> },
  { label: 'Articles', path: '/articles', icon: <FileTextOutlined /> },
  { label: 'Team', path: '/team', icon: <TeamOutlined /> },
  { label: 'Settings', path: '/settings', icon: <SettingOutlined /> },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={`relative flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-44'
      }`}
      style={{ minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100 min-h-[72px]">
        {collapsed
          ? <FitPlusIcon scale={0.72} />
          : <FitPlusLogo scale={0.72} fontSize={18} textColor="#133696" />
        }
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-blue-light text-brand-navy border-l-2 border-brand-blue'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <span className={`text-base ${active ? 'text-brand-navy' : 'text-gray-400'}`}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm z-10"
      >
        {collapsed ? <RightOutlined style={{ fontSize: 10 }} /> : <LeftOutlined style={{ fontSize: 10 }} />}
      </button>
    </aside>
  )
}
