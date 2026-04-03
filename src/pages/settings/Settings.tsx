import { useState } from 'react'
import { Input, Button } from 'antd'
import {
  SettingOutlined, SearchOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined, ClockCircleOutlined, EyeOutlined, EyeInvisibleOutlined,
} from '@ant-design/icons'
import Header from '../../components/layout/Header'
import TabBar from '../../components/ui/TabBar'
import { settingsCategories } from '../../data/mock'

const SETTINGS_TABS = [
  { key: 'categories',    label: 'Manage Categories/Tags/Routines' },
  { key: 'global-config', label: 'Global Configuration' },
  { key: 'audit',         label: 'Audit' },
  { key: 'subscriptions', label: 'Manage Subscriptions' },
]

const subNavItems = [
  'Patient Status',
  'Article Categories',
  'Team Status',
  'Medicine Name',
  'Exercise Routine',
  'Diet Routine',
  'Focus Area',
  'Food List',
  'Duration',
]

function CategoriesPanel() {
  const [activeSubNav, setActiveSubNav] = useState('Patient Status')

  return (
    <div className="flex gap-4 mt-4">
      {/* Sub-nav */}
      <div className="w-56 flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {subNavItems.map(item => (
          <button
            key={item}
            onClick={() => setActiveSubNav(item)}
            className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-50 last:border-b-0 transition-colors ${
              activeSubNav === item
                ? 'bg-brand-blue-light text-brand-navy font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder={`Search ${activeSubNav}`}
          className="rounded-lg mb-3"
        />
        <Button
          block
          className="mb-4 rounded-lg border-dashed border-brand-blue text-brand-blue font-medium"
        >
          <PlusOutlined /> Add New Status
        </Button>

        <div className="space-y-3">
          {settingsCategories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: cat.color }} />
                <div>
                  <p className="text-sm font-medium text-gray-700">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-xs text-gray-400">
                  <p>Created by · {cat.createdBy}</p>
                  <p>Created at · {cat.createdAt}</p>
                </div>
                <button className="text-gray-400 hover:text-brand-blue p-1 rounded">
                  <EditOutlined />
                </button>
                <button className="text-gray-400 hover:text-red-500 p-1 rounded">
                  <DeleteOutlined />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center text-gray-400 text-sm">
      {title} — coming soon
    </div>
  )
}

// ── Global Configuration ──────────────────────────────────────────────────────

const API_KEYS = [
  { id: 'google-map', label: 'Google Map Key', value: '1232sk7xpa9mNqL8scvdsa' },
  { id: 'zoho-auth', label: 'Zoho Auth Token', value: '1232xT4rKwpZ2sYscvdsa' },
  { id: 'edm-api', label: 'EDM API Key', value: '1232mBn3Qv6cJhRscvdsa' },
  { id: 'edm-magic', label: 'EDM Magic Key', value: '1232dLp5WsE8uNyTscvdsa' },
]

function maskValue(value: string) {
  const start = value.slice(0, 4)
  const end = value.slice(-6)
  return `${start}${'*'.repeat(12)}${end}`
}

function ApiKeyField({ label, value }: { label: string; value: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="w-full">
      {/* Label */}
      <p
        className="text-xs font-bold mb-2 leading-[18px]"
        style={{ color: '#A9B2B9' }}
      >
        {label}
      </p>

      {/* Input row */}
      <div
        className="flex items-center rounded-[10px] border px-3 h-12"
        style={{ background: '#EEF1F3', borderColor: '#D9DEE2' }}
      >
        {/* Clock icon */}
        <ClockCircleOutlined
          className="flex-shrink-0 mr-2"
          style={{ color: '#A9B2B9', fontSize: 16 }}
        />

        {/* Value */}
        <span
          className="flex-1 text-base leading-6 select-all font-mono"
          style={{ color: '#7B858F' }}
        >
          {visible ? value : maskValue(value)}
        </span>

        {/* Eye toggle */}
        <button
          onClick={() => setVisible(v => !v)}
          className="flex-shrink-0 ml-2 p-0.5"
          style={{ color: '#A9B2B9' }}
          aria-label={visible ? 'Hide key' : 'Show key'}
        >
          {visible
            ? <EyeOutlined style={{ fontSize: 16 }} />
            : <EyeInvisibleOutlined style={{ fontSize: 16 }} />
          }
        </button>
      </div>
    </div>
  )
}

function GlobalConfigPanel() {
  return (
    <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
        <p className="text-base font-semibold leading-5" style={{ color: '#133696' }}>
          API List
        </p>
        <p className="text-sm" style={{ color: '#A9B2B9' }}>
          Last Edit · 30 Sep 2022
        </p>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-8 p-8">
        {API_KEYS.map(key => (
          <ApiKeyField key={key.id} label={key.label} value={key.value} />
        ))}
      </div>

      {/* Gray footer strip — matches the Figma grey bottom area */}
      <div className="h-16" style={{ background: '#EEF1F3' }} />
    </div>
  )
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('categories')

  return (
    <div>
      <Header title="Settings" icon={<SettingOutlined />} showSearch={false} />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 pt-4 mb-0">
          <TabBar tabs={SETTINGS_TABS} activeKey={activeTab} onChange={setActiveTab} />
        </div>
        {activeTab === 'categories'    && <CategoriesPanel />}
        {activeTab === 'global-config' && <GlobalConfigPanel />}
        {activeTab === 'audit'         && <Placeholder title="Audit" />}
        {activeTab === 'subscriptions' && <Placeholder title="Manage Subscriptions" />}
      </div>
    </div>
  )
}
