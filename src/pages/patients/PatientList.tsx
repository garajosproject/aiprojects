import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserOutlined, DownloadOutlined, FilterOutlined, LeftOutlined, RightOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons'
import Header from '../../components/layout/Header'
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

// ── Patient status badge ───────────────────────────────────────────────────────
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

// ── Avatar ─────────────────────────────────────────────────────────────────────
function PatientAvatar({ name, status }: { name: string; status: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2)
  const badgeColor = status === 'Plan Expired' ? '#FF4242' : '#65D83C'
  return (
    <div className="relative flex-shrink-0 w-10 h-10">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-[#133696]">
        {initials}
      </div>
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: badgeColor }} />
    </div>
  )
}

// ── Plan pill ──────────────────────────────────────────────────────────────────
function PlanPill({ months, days }: { months: number; days: number }) {
  if (months === 0 && days === 0) return (
    <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#EEF1F3] text-[#434D56]">12 Months</span>
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

// ── Patient row card ───────────────────────────────────────────────────────────
function PatientCard({ patient }: { patient: Patient }) {
  const isExpired = patient.status === 'Plan Expired'
  return (
    <div className={`flex items-start gap-6 p-4 rounded-lg border border-[#D9DEE2] bg-white mb-3 last:mb-0 hover:shadow-sm transition-shadow ${isExpired ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3 w-56 flex-shrink-0">
        <PatientAvatar name={patient.name} status={patient.status} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <Link to={`/patients/${patient.slug || patient.id}`} className="text-sm font-semibold text-[#133696] hover:underline leading-5 underline" style={{ textDecorationSkipInk: 'none' }}>
            {patient.name}
          </Link>
          <p className="text-xs text-[#434D56] leading-5 whitespace-nowrap">{patient.age} Yr, {patient.gender}, {patient.city}</p>
          <div className="flex items-center gap-1">
            <WaIcon />
            <span className="text-xs font-bold text-[#434D56] leading-5">{patient.phone}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <StatusLabel status={patient.status} />
        {isExpired
          ? <p className="text-xs text-[#FF4242] leading-5">Plan Expired</p>
          : <p className="text-xs text-[#434D56] leading-5">Last Activity: {patient.lastActivity}</p>}
        <p className="text-xs text-[#434D56] leading-5">Renewal on · {patient.renewalDate}</p>
      </div>

      <div className="flex flex-col gap-2 w-80 flex-shrink-0">
        <PlanPill months={patient.planMonths} days={patient.planDays} />
        <p className="text-xs text-[#434D56] leading-5">Current BMI, Current Weight · {patient.currentBMI}, {patient.currentWeight}Kg</p>
        <p className="text-xs text-[#434D56] leading-5">Starting BP, Sugar · {patient.bloodPressure}, {patient.sugarLevel}</p>
      </div>

      <div className="flex flex-col gap-2 w-44 flex-shrink-0">
        <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#EEF1F3] text-[#434D56] w-fit">Assigned Team</span>
        <div className="flex items-center gap-1.5 border border-[#EEF1F3] rounded-lg px-2 py-1">
          <div className="w-4 h-4 rounded-md bg-blue-100 flex items-center justify-center text-[10px] font-semibold text-[#133696] flex-shrink-0">
            {patient.assignedDoctor.replace('Dr. ', '').charAt(0)}
          </div>
          <span className="text-xs text-[#434D56] truncate">{patient.assignedDoctor}</span>
        </div>
        <div className="flex items-center gap-1.5 border border-[#EEF1F3] rounded-lg px-2 py-1">
          <div className="w-4 h-4 rounded-md bg-pink-100 flex items-center justify-center text-[10px] font-semibold text-pink-600 flex-shrink-0">
            {patient.assignedCoach.charAt(0)}
          </div>
          <span className="text-xs text-[#434D56] truncate">{patient.assignedCoach}</span>
        </div>
      </div>
    </div>
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function CustomPagination({ current, total }: { current: number; total: number }) {
  const pages = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-[#1A2128]">
        <span className="font-normal">Total Result:  </span>
        <span className="font-semibold">50/{total.toLocaleString()}</span>
      </p>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-[#E9EFFF] text-[#434D56] hover:border-[#133696] transition-colors">
          <LeftOutlined style={{ fontSize: 12 }} />
        </button>
        {pages.map(p => (
          <button key={p} className={`w-10 h-10 flex items-center justify-center rounded-full text-base transition-colors ${p === current ? 'bg-[#E9EFFF] border border-[#133696] text-[#133696]' : 'border border-[#E9EFFF] text-[#1A2128] hover:border-[#133696] hover:text-[#133696]'}`}>
            {p}
          </button>
        ))}
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-[#1A2128]">…</button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-[#E9EFFF] text-[#434D56] hover:border-[#133696] transition-colors">
          <RightOutlined style={{ fontSize: 12 }} />
        </button>
      </div>
    </div>
  )
}

// ── Filter chip ────────────────────────────────────────────────────────────────
function Chip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return selected ? (
    <button
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-[3px] rounded-lg text-[13px] font-semibold text-white transition-colors"
      style={{ background: '#3C5DB7' }}
    >
      {label}
      <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20">
        <CloseOutlined style={{ fontSize: 9, color: '#fff' }} />
      </span>
    </button>
  ) : (
    <button
      onClick={onToggle}
      className="inline-flex items-center px-3 py-[3px] rounded-lg text-[13px] font-semibold text-[#A9B2B9] border border-[#EEF1F3] hover:border-[#3C5DB7] hover:text-[#3C5DB7] transition-colors"
    >
      {label}
    </button>
  )
}

// ── Filter section header ──────────────────────────────────────────────────────
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-2 py-2">
      <p className="text-sm font-normal text-[#1A2128]">{title}</p>
      {children}
    </div>
  )
}

// ── City / Doctor search data ──────────────────────────────────────────────────
const ALL_CITIES = ['Mumbai', 'Delhi', 'Banglore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad']
const ALL_DOCTORS = [
  'Ankur Bhatia', 'Dr. Ankur Gualti', 'Dr. Ankur Shah',
  'Dr. Priya Mehta', 'Dr. Rahul Joshi', 'Dr. Sneha Patil',
]

// ── Filter Panel ───────────────────────────────────────────────────────────────
interface FilterState {
  dateRange: string[]
  gender: string[]
  bmiGroup: string[]
  cities: string[]
  doctors: string[]
}

const defaultFilters: FilterState = {
  dateRange: [],
  gender: [],
  bmiGroup: [],
  cities: [],
  doctors: [],
}

function FilterPanel({ onClose, onApply, onClearAll }: { onClose: () => void; onApply: (f: FilterState) => void; onClearAll: () => void }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [citySearch, setCitySearch] = useState('')
  const [doctorSearch, setDoctorSearch] = useState('')
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false)
  const doctorRef = useRef<HTMLDivElement>(null)

  // close doctor dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (doctorRef.current && !doctorRef.current.contains(e.target as Node)) {
        setShowDoctorDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function toggle(key: keyof FilterState, value: string) {
    setFilters(prev => {
      const arr = prev[key] as string[]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  function removeCity(city: string) { toggle('cities', city) }
  function removeDoctor(d: string) { toggle('doctors', d) }

  const filteredCities = ALL_CITIES.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase()) && !filters.cities.includes(c)
  )
  const filteredDoctors = ALL_DOCTORS.filter(d =>
    d.toLowerCase().includes(doctorSearch.toLowerCase())
  )

  const hasFilters = Object.values(filters).some(arr => arr.length > 0)

  function clearAll() {
    setFilters(defaultFilters)
    setCitySearch('')
    setDoctorSearch('')
    onClearAll()
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-[420px] bg-white z-50 flex flex-col shadow-2xl"
        style={{ animation: 'slideInRight 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <p className="text-base font-semibold text-[#1A2128]">Apply Filter</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EEF1F3] transition-colors">
            <CloseOutlined style={{ fontSize: 16, color: '#434D56' }} />
          </button>
        </div>
        <div className="h-px bg-[#D9DEE2] mx-6 flex-shrink-0" />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">

          {/* Date Range */}
          <FilterSection title="Date Range">
            <div className="flex flex-wrap gap-2">
              {['Recent', 'Last Week', 'Last Month', 'Custom Date'].map(opt => (
                <Chip key={opt} label={opt} selected={filters.dateRange.includes(opt)} onToggle={() => toggle('dateRange', opt)} />
              ))}
            </div>
          </FilterSection>

          {/* Gender */}
          <FilterSection title="Gender">
            <div className="flex flex-wrap gap-2">
              {['Male', 'Female', 'Other'].map(opt => (
                <Chip key={opt} label={opt} selected={filters.gender.includes(opt)} onToggle={() => toggle('gender', opt)} />
              ))}
            </div>
          </FilterSection>

          {/* BMI Group */}
          <FilterSection title="BMI Group">
            <div className="flex flex-col gap-2">
              {[
                'Underweight: Below 18.5',
                'Healthy Weight: 18.5 to 24.9',
                'Overweight: 25.0 to 29.9',
                'Obesity: 30 or higher',
              ].map(opt => (
                <Chip key={opt} label={opt} selected={filters.bmiGroup.includes(opt)} onToggle={() => toggle('bmiGroup', opt)} />
              ))}
            </div>
          </FilterSection>

          {/* City */}
          <FilterSection title="City">
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] border border-[#D9DEE2] bg-white">
              <SearchOutlined style={{ fontSize: 14, color: '#A9B2B9' }} />
              <input
                type="text"
                placeholder="Search City"
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
                className="flex-1 text-sm text-[#434D56] placeholder-[#A9B2B9] outline-none bg-transparent"
              />
            </div>

            {/* City suggestions (when typing) */}
            {citySearch && filteredCities.length > 0 && (
              <div className="border border-[#D9DEE2] rounded-[10px] overflow-hidden">
                {filteredCities.slice(0, 5).map(city => (
                  <button
                    key={city}
                    onClick={() => { toggle('cities', city); setCitySearch('') }}
                    className="w-full text-left px-3 py-2 text-sm text-[#434D56] hover:bg-[#E9EFFF] transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}

            {/* Selected cities */}
            {filters.cities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.cities.map(city => (
                  <button
                    key={city}
                    onClick={() => removeCity(city)}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-[3px] rounded-lg text-[13px] font-semibold text-white transition-colors"
                    style={{ background: '#3C5DB7' }}
                  >
                    {city}
                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20">
                      <CloseOutlined style={{ fontSize: 9, color: '#fff' }} />
                    </span>
                  </button>
                ))}
                {/* Unselected suggestion chips */}
                {ALL_CITIES.filter(c => !filters.cities.includes(c)).slice(0, 3).map(city => (
                  <button
                    key={city}
                    onClick={() => toggle('cities', city)}
                    className="inline-flex items-center px-3 py-[3px] rounded-lg text-[13px] font-semibold border border-[#EEF1F3] text-[#3C5DB7] hover:border-[#3C5DB7] transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}

            {!citySearch && filters.cities.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {ALL_CITIES.slice(0, 4).map(city => (
                  <button
                    key={city}
                    onClick={() => toggle('cities', city)}
                    className="inline-flex items-center px-3 py-[3px] rounded-lg text-[13px] font-semibold border border-[#EEF1F3] text-[#3C5DB7] hover:border-[#3C5DB7] transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </FilterSection>

          {/* Doctor and Health Coach */}
          <FilterSection title="Doctor and Health Coach">
            <div ref={doctorRef} className="relative">
              <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] border border-[#D9DEE2] bg-white">
                <SearchOutlined style={{ fontSize: 14, color: '#A9B2B9' }} />
                <input
                  type="text"
                  placeholder="Search doctor or health coach"
                  value={doctorSearch}
                  onChange={e => { setDoctorSearch(e.target.value); setShowDoctorDropdown(true) }}
                  onFocus={() => setShowDoctorDropdown(true)}
                  className="flex-1 text-sm text-[#133696] placeholder-[#A9B2B9] outline-none bg-transparent"
                />
                {doctorSearch && (
                  <button onClick={() => { setDoctorSearch(''); setShowDoctorDropdown(false) }}>
                    <CloseOutlined style={{ fontSize: 12, color: '#A9B2B9' }} />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDoctorDropdown && filteredDoctors.length > 0 && (
                <div className="border border-[#D9DEE2] rounded-[10px] overflow-hidden mt-1 bg-white shadow-sm">
                  {filteredDoctors.map((doc, i) => (
                    <button
                      key={doc}
                      onClick={() => { toggle('doctors', doc); setDoctorSearch(''); setShowDoctorDropdown(false) }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-[#434D56] transition-colors ${i === 1 ? 'bg-[#E9EFFF]' : 'hover:bg-[#E9EFFF]'}`}
                    >
                      {doc}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-[315deg]">
                        <path d="M2 10L10 2M10 2H4M10 2V8" stroke="#A9B2B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected doctors */}
            {filters.doctors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {filters.doctors.map(doc => (
                  <button
                    key={doc}
                    onClick={() => removeDoctor(doc)}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-[3px] rounded-lg text-[13px] font-semibold text-white"
                    style={{ background: '#3C5DB7' }}
                  >
                    {doc}
                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20">
                      <CloseOutlined style={{ fontSize: 9, color: '#fff' }} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </FilterSection>

        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-[#D9DEE2]">
          <div className="flex gap-3">
            <button
              onClick={clearAll}
              className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold border border-[#EEF1F3] text-[#A9B2B9] hover:border-[#A9B2B9] transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => { onApply(filters); onClose() }}
              className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: hasFilters ? '#3C5DB7' : '#A9B2B9', cursor: hasFilters ? 'pointer' : 'default' }}
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}

// ── Tabs ───────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',        label: 'All Patients (24,000)' },
  { key: 'active',     label: 'Active Patients (18,000)' },
  { key: 'onboarding', label: 'Onboarding (2,000)' },
  { key: 'inactive',   label: 'In Active Patients (2,000)' },
]

// ── Main page ──────────────────────────────────────────────────────────────────
export default function PatientList() {
  const [activeTab, setActiveTab] = useState('all')
  const [showFilter, setShowFilter] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null)

  const filtered =
    activeTab === 'all'        ? patients :
    activeTab === 'active'     ? patients.filter(p => p.status === 'Active') :
    activeTab === 'onboarding' ? patients.filter(p => p.status === 'Onboarding') :
    patients.filter(p => p.status === 'In Active')

  const activeFilterCount = appliedFilters
    ? Object.values(appliedFilters).reduce((sum, arr) => sum + arr.length, 0)
    : 0

  return (
    <div className="flex flex-col h-full">
      <Header title="Patient" icon={<UserOutlined />} searchPlaceholder="Search Patients" showSearch />

      <div className="flex-1 overflow-auto p-5 bg-[#EEF1F3]">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D9DEE2]">
            <div className="flex items-center gap-3">
              <div className="w-[18px] h-[18px] rounded border-2 border-[#A9B2B9]" />
              <button
                onClick={() => setShowFilter(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-sm font-semibold transition-colors relative"
                style={{ border: '1px solid #133696', background: 'rgba(19,54,150,0.08)', color: '#133696' }}
              >
                <FilterOutlined style={{ fontSize: 14 }} />
                Apply Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#3C5DB7] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Clear filter pill — visible only when filters are active */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setAppliedFilters(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: '#FFE5E5', color: '#812222' }}
                >
                  <CloseOutlined style={{ fontSize: 10 }} />
                  Clear Filter ({activeFilterCount})
                </button>
              )}
            </div>
            <button className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-sm font-semibold" style={{ background: '#EEF1F3', color: '#A9B2B9' }}>
              <DownloadOutlined style={{ fontSize: 14 }} />
              Download
            </button>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-4 pb-0">
            <TabBar tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
          </div>

          {/* List */}
          <div className="px-5 pt-4 pb-2">
            {filtered.length === 0
              ? <div className="py-16 text-center text-sm text-[#A9B2B9]">No patients in this category</div>
              : filtered.map(p => <PatientCard key={p.id} patient={p} />)
            }
          </div>

          {/* Pagination */}
          <div className="px-5 border-t border-[#EEF1F3]">
            <CustomPagination current={1} total={24000} />
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <FilterPanel
          onClose={() => setShowFilter(false)}
          onApply={(f) => setAppliedFilters(f)}
          onClearAll={() => setAppliedFilters(null)}
        />
      )}
    </div>
  )
}
