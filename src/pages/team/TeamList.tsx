import { useState } from 'react'
import { Button, Checkbox } from 'antd'
import { FilterOutlined, TeamOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import StatusBadge from '../../components/ui/StatusBadge'
import TabBar from '../../components/ui/TabBar'
import { teamMembers, type TeamMember } from '../../data/mock'

function RoleBadge({ role, status }: { role: string; status: string }) {
  const roleColors: Record<string, string> = {
    'Super Admin': 'bg-blue-50 text-blue-800 border-blue-200',
    'Admin': 'bg-purple-50 text-purple-700 border-purple-200',
    'Doctor': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Health Coach': 'bg-pink-50 text-pink-700 border-pink-200',
  }
  const isActive = status === 'Active'
  const cls = roleColors[role] ?? 'bg-gray-100 text-gray-600 border-gray-200'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {role}
      {!isActive && (
        <>
          <span className="text-gray-300">·</span>
          <span className="text-orange-500">{status}</span>
        </>
      )}
    </span>
  )
}

function MemberRow({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-center gap-4 py-4 px-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <Checkbox />
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
          {member.name.charAt(0)}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            member.status === 'Active' ? 'bg-green-400' :
            member.status === 'Busy' ? 'bg-orange-400' :
            member.status === 'On leave' ? 'bg-yellow-400' : 'bg-gray-300'
          }`}
        />
      </div>

      {/* Name + phone */}
      <div className="w-44 flex-shrink-0">
        <Link to={`/team/${member.id}`} className="text-sm font-semibold text-brand-blue hover:underline">
          {member.name}{member.isYou ? ' (You)' : ''}
        </Link>
        <p className="text-xs text-gray-400">{member.phone}</p>
      </div>

      {/* Role */}
      <div className="w-44 flex-shrink-0">
        <RoleBadge role={member.role} status={member.status} />
        <p className="text-xs text-gray-400 mt-1">Member Since · {member.memberSince}</p>
      </div>

      {/* Assign patients */}
      <div className="w-36 flex-shrink-0">
        <p className="text-xs text-gray-400">
          Assign Patients · {typeof member.assignedPatients === 'number' ? member.assignedPatients : 'NA'}
        </p>
      </div>

      {/* Languages */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 truncate">{member.languages.join(', ')}</p>
      </div>

      {/* Edit */}
      <Link
        to={`/team/${member.id}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
        style={{ background: '#E9EFFF', color: '#133696' }}
      >
        <EditOutlined style={{ fontSize: 11 }} />
        Edit Profile
      </Link>
    </div>
  )
}

export default function TeamList() {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all' ? teamMembers
    : activeTab === 'super-admin' ? teamMembers.filter(m => m.role === 'Super Admin')
    : activeTab === 'admin' ? teamMembers.filter(m => m.role === 'Admin')
    : activeTab === 'doctor' ? teamMembers.filter(m => m.role === 'Doctor')
    : teamMembers.filter(m => m.role === 'Health Coach')

  return (
    <div>
      <Header
        title="Team"
        icon={<TeamOutlined />}
        searchPlaceholder="Search team member by name/phone no"
        showSearch
      />
      <div className="p-6">
        {/* Top actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Checkbox />
            <Button icon={<FilterOutlined />} className="rounded-lg text-sm">Apply Filter</Button>
          </div>
          <div className="flex gap-2">
            <Button className="rounded-lg text-sm text-gray-500">Change Role</Button>
            <Button className="rounded-lg text-sm text-gray-500">Remove Access</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="rounded-lg text-sm"
            >
              <Link to="/team/new" className="text-white">Add Team Member</Link>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-4">
            <TabBar
              activeKey={activeTab}
              onChange={setActiveTab}
              tabs={[
                { key: 'all',          label: `All Team Members (${teamMembers.length})` },
                { key: 'super-admin',  label: `Super Admin (${teamMembers.filter(m => m.role === 'Super Admin').length})` },
                { key: 'admin',        label: `Admin (${teamMembers.filter(m => m.role === 'Admin').length})` },
                { key: 'doctor',       label: `Doctor (${teamMembers.filter(m => m.role === 'Doctor').length})` },
                { key: 'health-coach', label: `Health Coach (${teamMembers.filter(m => m.role === 'Health Coach').length})` },
              ]}
            />
          </div>
          {filtered.map(member => (
            <MemberRow key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  )
}
