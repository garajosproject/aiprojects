import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserOutlined, DownloadOutlined, FilterOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import Header from '../../components/layout/Header'
import StatusBadge from '../../components/ui/StatusBadge'
import TabBar from '../../components/ui/TabBar'
import { patients, type Patient } from '../../data/mock'

// ── WhatsApp icon ──────────────────────────────────────────────────────────────
function WaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="4" fill="#25D366" />
      <path
        d="M9 3.5C5.96 3.5 3.5 5.96 3.5 9c0 1.1.3 2.13.82 3.01L3.5 14.5l2.56-.8A5.47 5.47 0 009 14.5c3.04 0 5.5-2.46 5.5-5.5S12.04 3.5 9 3.5zm0 1c2.5 0 4.5 2 4.5 4.5S11.5 13.5 9 13.5c-.94 0-1.82-.28-2.55-.76l-.18-.12-1.5.47.48-1.46-.13-.19A4.47 4.47 0 014.5 9C4.5 6.5 6.5 4.5 9 4.5zm-1.9 2.4c-.1 0-.27.04-.41.2-.14.16-.55.54-.55 1.32 0 .78.57 1.53.65 1.63.08.1 1.1 1.72 2.72 2.34.38.16.67.26.9.33.38.12.72.1 1 .06.3-.05.94-.38 1.07-.75.13-.37.13-.68.09-.75-.04-.07-.15-.11-.31-.19-.16-.08-.94-.46-1.08-.52-.15-.06-.25-.08-.36.08-.1.17-.4.52-.5.62-.09.1-.18.12-.34.04-.16-.08-.68-.25-1.3-.8-.48-.43-.8-.96-.9-1.12-.09-.16 0-.25.07-.33.07-.08.16-.2.24-.3.08-.1.1-.17.16-.28.05-.11.02-.2-.02-.28-.04-.08-.36-.87-.5-1.19-.13-.31-.27-.27-.36-.27z"
        fill="white"
      />
    </svg>
  )
}

// ── Patient status badge (exact Figma colors) ──────────────────────────────────
function StatusLabel({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    'Active':       { bg: '#D8F5CE', text: '#336B1F' },
    'Onboarding':   { bg: '#D1D5E3', text: '#062886' },
    'Plan Expired': { bg: '#FFE5E5', text: '#812222' },
    'In Active':    { bg: '#EEF1F3', text: '#434D56' },
  }
  const s = map[status] ?? { bg: '#EEF1F3', text: '#434D56' }
  return (
    <span
      className="inline-block self-start px-2.5 py-0.5 rounded-lg text-xs font-bold"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  )
}

// ── Avatar with online/offline badge ──────────────────────────────────────────
function PatientAvatar({ name, status }: { name: string; status: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2)
  const badgeColor = status === 'Plan Expired' ? '#FF4242' : '#65D83C'
  return (
    <div className="relative flex-shrink-0 w-10 h-10">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-[#133696]">
        {initials}
      </div>
      <span
        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
        style={{ background: badgeColor }}
      />
    </div>
  )
}

// ── Plan duration pill ─────────────────────────────────────────────────────────
function PlanPill({ months, days }: { months: number; days: number }) {
  if (months === 0 && days === 0) return (
    <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#EEF1F3] text-[#434D56]">
      12 Months
    </span>
  )
  const unit = months >= 1 ? `${months} Month` : `${days} Week`
  const rest = months >= 1 ? `${days} Days` : ''
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs bg-[#EEF1F3] text-[#434D56]">
      <span className="font-bold">{unit}</span>
      {rest && <span className="font-normal"> · {rest}</span>}
    </span>
  )
}

// ── Single patient row ─────────────────────────────────────────────────────────
function PatientCard({ patient }: { patient: Patient }) {
  const isExpired = patient.status === 'Plan Expired'
  return (
    <div
      className={`flex items-start gap-6 p-4 rounded-lg border border-[#D9DEE2] bg-white mb-3 last:mb-0 transition-shadow hover:shadow-sm ${
        isExpired ? 'opacity-50' : ''
      }`}
    >
      {/* 1 — Avatar + name */}
      <div className="flex items-start gap-3 w-56 flex-shrink-0">
        <PatientAvatar name={patient.name} status={patient.status} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <Link
            to={`/patients/${patient.id}`}
            className="text-sm font-semibold text-[#133696] hover:underline leading-5 underline"
            style={{ textDecorationSkipInk: 'none' }}
          >
            {patient.name}
          </Link>
          <p className="text-xs text-[#434D56] leading-5 whitespace-nowrap">{patient.age} Yr, {patient.gender}, {patient.city}</p>
          <div className="flex items-center gap-1">
            <WaIcon />
            <span className="text-xs font-bold text-[#434D56] leading-5">{patient.phone}</span>
          </div>
        </div>
      </div>

      {/* 2 — Status + activity */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <StatusLabel status={patient.status} />
        {isExpired ? (
          <p className="text-xs text-[#FF4242] leading-5">Plan Expired</p>
        ) : (
          <p className="text-xs text-[#434D56] leading-5">Last Activity: {patient.lastActivity}</p>
        )}
        <p className="text-xs text-[#434D56] leading-5">Renewal on · {patient.renewalDate}</p>
      </div>

      {/* 3 — Plan + health metrics */}
      <div className="flex flex-col gap-2 w-80 flex-shrink-0">
        <PlanPill months={patient.planMonths} days={patient.planDays} />
        <p className="text-xs text-[#434D56] leading-5">
          Current BMI, Current Weight · {patient.currentBMI}, {patient.currentWeight}Kg
        </p>
        <p className="text-xs text-[#434D56] leading-5">
          Starting BP, Sugar · {patient.bloodPressure}, {patient.sugarLevel}
        </p>
      </div>

      {/* 4 — Assigned team */}
      <div className="flex flex-col gap-2 w-44 flex-shrink-0">
        <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#EEF1F3] text-[#434D56] w-fit">
          Assigned Team
        </span>
        <div className="flex items-center gap-1.5 border border-[#EEF1F3] rounded-full px-2 py-1">
          <div className="w-4 h-4 rounded-md bg-blue-100 flex items-center justify-center text-[10px] font-semibold text-[#133696] flex-shrink-0">
            {patient.assignedDoctor.replace('Dr. ', '').charAt(0)}
          </div>
          <span className="text-xs text-[#434D56] truncate">{patient.assignedDoctor}</span>
        </div>
        <div className="flex items-center gap-1.5 border border-[#EEF1F3] rounded-full px-2 py-1 bg-white">
          <div className="w-4 h-4 rounded-md bg-pink-100 flex items-center justify-center text-[10px] font-semibold text-pink-600 flex-shrink-0">
            {patient.assignedCoach.charAt(0)}
          </div>
          <span className="text-xs text-[#434D56] truncate">{patient.assignedCoach}</span>
        </div>
      </div>
    </div>
  )
}

// ── Custom Pagination ──────────────────────────────────────────────────────────
function CustomPagination({ current, total }: { current: number; total: number }) {
  const pages = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-[#1A2128]">
        <span className="font-normal">Total Result:  </span>
        <span className="font-semibold">50/{total.toLocaleString()}</span>
      </p>
      <div className="flex items-center gap-2">
        {/* Prev */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-[#E9EFFF] text-[#434D56] hover:border-[#133696] transition-colors">
          <LeftOutlined style={{ fontSize: 12 }} />
        </button>

        {pages.map(p => (
          <button
            key={p}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-base transition-colors ${
              p === current
                ? 'bg-[#E9EFFF] border border-[#133696] text-[#133696]'
                : 'border border-[#E9EFFF] text-[#1A2128] hover:border-[#133696] hover:text-[#133696]'
            }`}
          >
            {p}
          </button>
        ))}

        <button className="w-10 h-10 flex items-center justify-center rounded-full text-[#1A2128]">
          …
        </button>

        {/* Next */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-[#E9EFFF] text-[#434D56] hover:border-[#133696] transition-colors">
          <RightOutlined style={{ fontSize: 12 }} />
        </button>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',        label: 'All Patients (24,000)' },
  { key: 'active',     label: 'Active Patients (18,000)' },
  { key: 'onboarding', label: 'Onboarding (2,000)' },
  { key: 'inactive',   label: 'In Active Patients (2,000)' },
]


export default function PatientList() {
  const [activeTab, setActiveTab] = useState('all')

  const filtered =
    activeTab === 'all'        ? patients :
    activeTab === 'active'     ? patients.filter(p => p.status === 'Active') :
    activeTab === 'onboarding' ? patients.filter(p => p.status === 'Onboarding') :
    patients.filter(p => p.status === 'In Active')

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Patient"
        icon={<UserOutlined />}
        searchPlaceholder="Search Patients"
        showSearch
      />

      <div className="flex-1 overflow-auto p-5 bg-[#EEF1F3]">
        {/* White card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">

          {/* ── Toolbar ──────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D9DEE2]">
            <div className="flex items-center gap-3">
              {/* Checkbox */}
              <div className="w-[18px] h-[18px] rounded border-2 border-[#A9B2B9]" />

              {/* Apply Filter button — exact Figma style */}
              <button
                className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-sm font-semibold transition-colors"
                style={{
                  border: '1px solid #133696',
                  background: 'rgba(19,54,150,0.08)',
                  color: '#133696',
                }}
              >
                <FilterOutlined style={{ fontSize: 14 }} />
                Apply Filter
              </button>
            </div>

            {/* Download button */}
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-sm font-semibold"
              style={{ background: '#EEF1F3', color: '#A9B2B9' }}
            >
              <DownloadOutlined style={{ fontSize: 14 }} />
              Download
            </button>
          </div>

          {/* ── Tabs ─────────────────────────────────────── */}
          <div className="px-4 pt-4 pb-0">
            <TabBar tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
          </div>

          {/* ── Patient list ──────────────────────────────── */}
          <div className="px-5 pt-4 pb-2">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-[#A9B2B9]">No patients in this category</div>
            ) : (
              filtered.map(p => <PatientCard key={p.id} patient={p} />)
            )}
          </div>

          {/* ── Pagination ────────────────────────────────── */}
          <div className="px-5 border-t border-[#EEF1F3]">
            <CustomPagination current={1} total={24000} />
          </div>
        </div>
      </div>
    </div>
  )
}
