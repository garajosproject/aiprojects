import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button, Tag, Select } from 'antd'
import {
  PhoneOutlined, MailOutlined, PlusOutlined, UploadOutlined,
  CloseOutlined, CheckOutlined, SyncOutlined,
} from '@ant-design/icons'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer,
} from 'recharts'
import Header from '../../components/layout/Header'
import StatusBadge from '../../components/ui/StatusBadge'
import TabBar from '../../components/ui/TabBar'
import { patients } from '../../data/mock'

// ── helpers ────────────────────────────────────────────────────────────────────
function getWeightColor(weight: number) {
  if (weight <= 82) return '#22c55e'
  if (weight <= 90) return '#f59e0b'
  return '#ef4444'
}

function Avatar({ name, size = 80 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="rounded-full bg-blue-100 flex items-center justify-center font-bold text-brand-navy flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      {initials}
    </div>
  )
}

// ── Body diagram SVG ────────────────────────────────────────────────────────────
function BodyDiagram() {
  return (
    <svg viewBox="0 0 100 200" className="w-full" style={{ maxHeight: 160 }}>
      {/* Head */}
      <ellipse cx="50" cy="22" rx="14" ry="16" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
      {/* Neck */}
      <rect x="44" y="36" width="12" height="8" fill="#e5e7eb" />
      {/* Torso */}
      <rect x="28" y="44" width="44" height="60" rx="8" fill="#dbeafe" stroke="#bfdbfe" strokeWidth="1" />
      {/* Left arm */}
      <rect x="12" y="46" width="16" height="48" rx="7" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
      {/* Right arm */}
      <rect x="72" y="46" width="16" height="48" rx="7" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
      {/* Shorts */}
      <rect x="28" y="104" width="44" height="24" rx="4" fill="#93c5fd" />
      {/* Left leg */}
      <rect x="28" y="126" width="18" height="56" rx="8" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
      {/* Right leg */}
      <rect x="54" y="126" width="18" height="56" rx="8" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
      {/* Waist band */}
      <rect x="28" y="100" width="44" height="6" rx="2" fill="#60a5fa" />
    </svg>
  )
}

// ── Prescription card ──────────────────────────────────────────────────────────
function PrescriptionCard() {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="text-sm font-semibold text-gray-800">T. Oxra Met XR 10/1000</p>
          <p className="text-xs text-gray-400">Dapagliflozin + Metformin</p>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">07:00AM, Today</span>
      </div>
      <div className="flex gap-2 mb-3 mt-2">
        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">
          <CheckOutlined style={{ fontSize: 9 }} /> Morning
        </span>
        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">
          <CloseOutlined style={{ fontSize: 9 }} /> Afternoon
        </span>
        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">
          <CloseOutlined style={{ fontSize: 9 }} /> Night
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: '6.7%' }} />
        </div>
        <span className="text-xs text-gray-400">02/30 Days</span>
      </div>
    </div>
  )
}

// ── Timeline tab ────────────────────────────────────────────────────────────────
function TimelineTab({ onNewPrescription }: { onNewPrescription: () => void }) {
  return (
    <div className="pb-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button icon={<PlusOutlined />} size="small" className="rounded-lg text-xs border-gray-300" onClick={onNewPrescription}>
          New Prescription
        </Button>
        <Button icon={<PlusOutlined />} size="small" className="rounded-lg text-xs border-gray-300">
          New Routine (Goal)
        </Button>
        <Button icon={<PlusOutlined />} size="small" className="rounded-lg text-xs border-gray-300">
          Note
        </Button>
        <Button icon={<UploadOutlined />} size="small" className="rounded-lg text-xs border-gray-300">
          Upload Report
        </Button>
      </div>

      {/* Milestone entry */}
      <p className="text-xs text-gray-400 mb-3">
        <span className="font-semibold text-gray-600">New Milestone!</span> 28 Oct 2022 · 1:30PM
      </p>

      {/* Medical Goal group */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-100 space-y-3">
        <div>
          <span className="inline-block bg-green-500 text-white text-xs px-3 py-0.5 rounded-full font-medium">
            Medical Goal
          </span>
        </div>
        <PrescriptionCard />
        <PrescriptionCard />
      </div>
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────────
export default function PatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patient = patients.find(p => p.id === id) ?? patients[0]
  const [activeTab, setActiveTab] = useState('timeline')
  const [weightRange, setWeightRange] = useState('6')

  const weightData = [...patient.weightHistory].reverse()

  const tabs = [
    { key: 'timeline', label: 'Timeline' },
    { key: 'health', label: 'Health Profile' },
    { key: 'prescription', label: 'Prescription' },
    { key: 'goal', label: 'Goal' },
    { key: 'reports', label: 'Reports' },
    { key: 'notes', label: 'Notes' },
  ]

  const statsGrid = [
    { label: 'Current BMI', value: `${patient.currentBMI}, ${patient.currentWeight}Kg`, bg: 'bg-green-50', border: 'border-green-100', labelColor: 'text-green-700' },
    { label: 'Starting BMI', value: `${patient.startingBMI}, ${patient.startingWeight}Kg`, bg: 'bg-gray-50', border: 'border-gray-100', labelColor: 'text-gray-500' },
    { label: 'Current Shape', value: patient.bodyShape, bg: 'bg-gray-50', border: 'border-gray-100', labelColor: 'text-gray-500' },
    { label: 'Height', value: patient.height, bg: 'bg-gray-50', border: 'border-gray-100', labelColor: 'text-gray-500' },
    { label: 'Sugar Level', value: patient.sugarLevel, bg: 'bg-green-50', border: 'border-green-100', labelColor: 'text-green-700' },
    { label: 'Blood Pressure', value: patient.bloodPressure, bg: 'bg-blue-50', border: 'border-blue-100', labelColor: 'text-blue-700' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header with breadcrumb */}
      <Header
        title=""
        icon={null}
        showSearch
        searchPlaceholder="Search Patients"
        breadcrumb={
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="4" r="2.5" stroke="#9ca3af" strokeWidth="1.2" />
              <path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <Link to="/patients" className="hover:text-brand-navy transition-colors">Patient</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-700 font-medium">{patient.name}</span>
          </div>
        }
      />

      {/* Page body */}
      <div className="flex-1 overflow-auto p-5 bg-[#EEF1F3]">
        <div className="flex gap-4 items-start">

          {/* ── LEFT MAIN ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Patient bio card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar name={patient.name} size={80} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h2 className="text-lg font-bold text-gray-800">{patient.name}</h2>
                    <StatusBadge status={patient.status} />
                    <Tag className="text-xs font-medium rounded-full border-brand-navy text-brand-navy m-0">
                      {patient.planType}
                    </Tag>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {patient.age} Yr, {patient.gender} · {patient.city}
                  </p>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-gray-100 text-gray-600 rounded-md px-2.5 py-1 text-xs font-medium">
                      {patient.planMonths} Month · {patient.planDays} Days
                    </span>
                    <Button
                      size="small"
                      type="primary"
                      icon={<SyncOutlined />}
                      className="rounded-full text-xs bg-brand-navy border-brand-navy"
                    >
                      Extend Plan
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1.5 text-sm">
                    <a href={`tel:${patient.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-green-600">
                      <PhoneOutlined className="text-green-500 text-base" />
                      <span className="text-sm">{patient.phone}</span>
                    </a>
                    <a href={`mailto:${patient.email}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                      <MailOutlined className="text-blue-400 text-base" />
                      <span className="text-sm">{patient.email}</span>
                    </a>
                  </div>
                </div>

                {/* Member info */}
                <div className="text-right text-xs flex-shrink-0 space-y-2">
                  <div>
                    <p className="text-gray-400">Member Since</p>
                    <p className="font-semibold text-gray-700 text-sm">{patient.memberSince}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Renewal on</p>
                    <p className="font-semibold text-gray-700 text-sm">{patient.renewalDate}</p>
                    <p className="text-orange-500 font-medium text-xs">(1 Month Left)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs + content */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              {/* Tab header */}
              <div className="px-5 pt-1">
                <TabBar tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
              </div>

              {/* Tab body */}
              <div className="p-5">
                {activeTab === 'timeline' && <TimelineTab onNewPrescription={() => navigate(`/patients/${patient.id}/prescription/new`)} />}
                {activeTab === 'health' && (
                  <div className="py-12 text-center text-gray-400 text-sm">Health profile coming soon</div>
                )}
                {activeTab === 'prescription' && (
                  <div className="py-12 text-center text-gray-400 text-sm">Prescription data coming soon</div>
                )}
                {activeTab === 'goal' && (
                  <div className="py-12 text-center text-gray-400 text-sm">Goal data coming soon</div>
                )}
                {activeTab === 'reports' && (
                  <div className="py-12 text-center text-gray-400 text-sm">Reports coming soon</div>
                )}
                {activeTab === 'notes' && (
                  <div className="py-12 text-center text-gray-400 text-sm">Notes coming soon</div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <div className="w-72 flex-shrink-0 space-y-4">

            {/* Doctor & Coach assignment */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex gap-3 mb-3">
                {/* Doctor card */}
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Doctor</span>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                      {patient.assignedDoctor.replace('Dr. ', '').charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate flex-1">
                      {patient.assignedDoctor}
                    </span>
                    <button className="text-gray-300 hover:text-gray-500 ml-auto">
                      <CloseOutlined style={{ fontSize: 10 }} />
                    </button>
                  </div>
                </div>

                {/* Coach card */}
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Health Coach</span>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-xs font-bold text-pink-600 flex-shrink-0">
                      {patient.assignedCoach.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate flex-1">
                      {patient.assignedCoach}
                    </span>
                    <button className="text-gray-300 hover:text-gray-500 ml-auto">
                      <CloseOutlined style={{ fontSize: 10 }} />
                    </button>
                  </div>
                </div>
              </div>

              <Button
                icon={<PlusOutlined />}
                size="small"
                className="w-full rounded-lg text-xs border-gray-300 text-gray-600"
              >
                Assign
              </Button>
            </div>

            {/* Body stats */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400">Last Update: 29 Oct 2022</span>
              </div>

              {/* Body diagram */}
              <div className="flex justify-center mb-4">
                <div className="w-28">
                  <BodyDiagram />
                </div>
              </div>

              {/* Stats grid 2×3 */}
              <div className="grid grid-cols-2 gap-2">
                {statsGrid.map(item => (
                  <div
                    key={item.label}
                    className={`rounded-lg p-2 text-center ${item.bg} border ${item.border}`}
                  >
                    <p className={`text-[10px] font-medium mb-0.5 ${item.labelColor}`}>{item.label}</p>
                    <p className="text-xs font-bold text-gray-800 leading-tight">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weight graph */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-700">Weight Graph</p>
                <Select
                  size="small"
                  value={weightRange}
                  onChange={setWeightRange}
                  options={[
                    { value: '6', label: '6 Month' },
                    { value: '3', label: '3 Month' },
                  ]}
                  className="text-xs"
                  style={{ width: 90 }}
                />
              </div>
              <p className="text-2xl font-bold text-green-600 mb-1 mt-1">
                -{patient.startingWeight - patient.currentWeight}Kg
              </p>

              <ResponsiveContainer width="100%" height={170}>
                <BarChart
                  data={weightData}
                  layout="vertical"
                  margin={{ left: 4, right: 32, top: 4, bottom: 0 }}
                  barSize={12}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis
                    type="number"
                    domain={[60, 100]}
                    tick={{ fontSize: 9, fill: '#9ca3af' }}
                    tickFormatter={v => `${v}Kg`}
                    tickCount={5}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    width={26}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v) => [`${v} Kg`, 'Weight']}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="weight" radius={[0, 3, 3, 0]}>
                    {weightData.map((entry, index) => (
                      <Cell key={index} fill={getWeightColor(entry.weight)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="flex gap-3 mt-1 justify-center">
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Normal
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> Overweight
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Obesity
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
