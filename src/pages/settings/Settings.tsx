import { useState } from 'react'
import { Input, Button } from 'antd'
import {
  SettingOutlined, SearchOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined,
} from '@ant-design/icons'
import Header from '../../components/layout/Header'
import TabBar from '../../components/ui/TabBar'
import ApiManager from './ApiManager'
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
        {activeTab === 'global-config' && <ApiManager />}
        {activeTab === 'audit'         && <Placeholder title="Audit" />}
        {activeTab === 'subscriptions' && <Placeholder title="Manage Subscriptions" />}
      </div>
    </div>
  )
}
