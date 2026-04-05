import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button, Tag, Select } from 'antd'
import {
  PhoneOutlined, MailOutlined, PlusOutlined, UploadOutlined,
  CloseOutlined, CheckOutlined, SyncOutlined,
} from '@ant-design/icons'
import { FileText, Upload, RefreshCw, Download } from 'lucide-react'
import GenerateReportModal from './GenerateReportModal'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, AreaChart, Area,
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

// ── Timeline event types ──────────────────────────────────────────────────────
type TLEventType = 'milestone' | 'prescription' | 'goal' | 'note' | 'visit' | 'report' | 'plan' | 'edit'

interface TLItem {
  id: string
  type: TLEventType
  label: string
  timestamp: string
  by: string
  role: string
  content: React.ReactNode
}

const EVENT_STYLE: Record<TLEventType, { bg: string; border: string; badge: string; dot: string }> = {
  milestone:   { bg: 'bg-green-50',  border: 'border-green-100',  badge: 'bg-green-500',   dot: 'bg-green-500' },
  prescription:{ bg: 'bg-orange-50', border: 'border-orange-100', badge: 'bg-orange-500',  dot: 'bg-orange-400' },
  goal:        { bg: 'bg-blue-50',   border: 'border-blue-100',   badge: 'bg-[#133696]',   dot: 'bg-blue-500' },
  note:        { bg: 'bg-amber-50',  border: 'border-amber-100',  badge: 'bg-amber-500',   dot: 'bg-amber-400' },
  visit:       { bg: 'bg-purple-50', border: 'border-purple-100', badge: 'bg-purple-600',  dot: 'bg-purple-500' },
  report:      { bg: 'bg-gray-50',   border: 'border-gray-100',   badge: 'bg-gray-600',    dot: 'bg-gray-400' },
  plan:        { bg: 'bg-[#E9EFFF]', border: 'border-[#C7D3F5]', badge: 'bg-[#133696]',   dot: 'bg-[#133696]' },
  edit:        { bg: 'bg-slate-50',  border: 'border-slate-100', badge: 'bg-slate-500',   dot: 'bg-slate-400' },
}

const TIMELINE_EVENTS: TLItem[] = [
  {
    id: 't1',
    type: 'milestone',
    label: '🎉 Weight Milestone Reached!',
    timestamp: '06 Apr 2026 · 09:00AM',
    by: 'Dr. Ankur Gulati', role: 'Endocrinologist',
    content: (
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-1">Lost 9 kg in 8 Weeks</p>
        <p className="text-xs text-gray-500 mb-3">Chetan reached 85 kg from 94 kg — exceeding the 8-week target. BMI improved from 30.7 → 27.8. Excellent adherence to diet and workout plan.</p>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs bg-white border border-green-200 text-green-700 rounded-lg px-2.5 py-0.5">↓ 9 kg lost</span>
          <span className="text-xs bg-white border border-green-200 text-green-700 rounded-lg px-2.5 py-0.5">BMI 27.8</span>
          <span className="text-xs bg-white border border-green-200 text-green-700 rounded-lg px-2.5 py-0.5">On Track ✓</span>
        </div>
      </div>
    ),
  },
  {
    id: 't2',
    type: 'note',
    label: 'Coach Note Added',
    timestamp: '01 Apr 2026 · 11:15AM',
    by: 'Mahesh Patil', role: 'Health Coach · Zeel Fitness',
    content: (
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-1">Weekly Progress Note</p>
        <p className="text-xs text-gray-500 leading-relaxed">"Step goal consistently met this week — averaging 8,400 steps/day. Sleep quality has improved. Recommending adding 2× strength training sessions per week from next cycle. Keep protein intake ≥ 120g/day."</p>
        <div className="flex gap-2 mt-2">
          <span className="text-xs bg-white border border-amber-200 text-amber-700 rounded-lg px-2.5 py-0.5">8,400 avg steps</span>
          <span className="text-xs bg-white border border-amber-200 text-amber-700 rounded-lg px-2.5 py-0.5">Sleep improved</span>
        </div>
      </div>
    ),
  },
  {
    id: 't3',
    type: 'visit',
    label: 'Doctor Consultation',
    timestamp: '22 Mar 2026 · 10:30AM',
    by: 'Dr. Ankur Gulati', role: 'Endocrinologist',
    content: (
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-1">Month-1 Health Review</p>
        <p className="text-xs text-gray-500 leading-relaxed mb-2">Fasting glucose down to 102 mg/dL from 118 mg/dL. Blood pressure 124/82 mmHg — improving. No medication changes required. Follow-up in 3 weeks.</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Glucose', value: '102 mg/dL', color: 'text-green-600' },
            { label: 'BP', value: '124/82 mmHg', color: 'text-blue-600' },
            { label: 'Weight', value: '88 kg', color: 'text-gray-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg p-2 border border-purple-100 text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">{s.label}</p>
              <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'e1',
    type: 'edit',
    label: '✏️ Record Edited',
    timestamp: '28 Mar 2026 · 04:10PM',
    by: 'Mahesh Patil', role: 'Health Coach · Zeel Fitness',
    content: (
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">Goal Progress Updated</p>
        <div className="space-y-1.5">
          {[
            { field: 'Daily Steps Goal', from: '6,200 steps', to: '8,400 steps', color: 'text-green-600' },
            { field: 'Workout Sessions', from: '2/4 this week', to: '3/4 this week', color: 'text-blue-600' },
          ].map(log => (
            <div key={log.field} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-100">
              <span className="text-[10px] font-semibold text-[#A9B2B9] w-28 flex-shrink-0">{log.field}</span>
              <span className="text-xs text-gray-400 line-through">{log.from}</span>
              <span className="text-[10px] text-gray-400">→</span>
              <span className={`text-xs font-semibold ${log.color}`}>{log.to}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 't4',
    type: 'goal',
    label: 'New Goal Assigned',
    timestamp: '15 Mar 2026 · 09:00AM',
    by: 'Mahesh Patil', role: 'Health Coach · Zeel Fitness',
    content: (
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">4 Workout Sessions Per Week</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-white border border-blue-200 text-blue-700 rounded-lg px-2.5 py-0.5">✓ 4 sessions/week</span>
          <span className="text-xs bg-white border border-blue-200 text-blue-700 rounded-lg px-2.5 py-0.5">✓ Weekly</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }} />
          </div>
          <span className="text-xs text-gray-400">3/4 this week</span>
        </div>
      </div>
    ),
  },
  {
    id: 't5',
    type: 'prescription',
    label: 'Prescription Updated',
    timestamp: '10 Mar 2026 · 08:45AM',
    by: 'Dr. Ankur Gulati', role: 'Endocrinologist',
    content: (
      <div className="space-y-2.5">
        {[
          { name: 'Omega-3 Fish Oil 1000mg', generic: 'EPA + DHA', schedule: 'Night', days: '10/30 Days', pct: 33 },
          { name: 'Vitamin D3 60K IU', generic: 'Cholecalciferol', schedule: 'Weekly', days: '2/8 Weeks', pct: 25 },
        ].map((rx, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border border-orange-100">
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <p className="text-sm font-semibold text-gray-800">{rx.name}</p>
                <p className="text-xs text-gray-400">{rx.generic}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{rx.schedule}</span>
            </div>
            <div className="flex gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">
                <CheckOutlined style={{ fontSize: 9 }} /> Morning
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">
                <CloseOutlined style={{ fontSize: 9 }} /> Afternoon
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${rx.pct}%` }} />
              </div>
              <span className="text-xs text-gray-400">{rx.days}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'e2',
    type: 'edit',
    label: '✏️ Record Edited',
    timestamp: '08 Mar 2026 · 11:30AM',
    by: 'Dr. Ankur Gulati', role: 'Endocrinologist',
    content: (
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">Prescription Dosage Adjusted</p>
        <div className="space-y-1.5">
          {[
            { field: 'Multivitamin', from: 'Evening', to: 'Morning', color: 'text-orange-600' },
            { field: 'Whey Protein', from: '20g', to: '25g post-workout', color: 'text-orange-600' },
            { field: 'Course Duration', from: '60 Days', to: '90 Days', color: 'text-blue-600' },
          ].map(log => (
            <div key={log.field} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-100">
              <span className="text-[10px] font-semibold text-[#A9B2B9] w-28 flex-shrink-0">{log.field}</span>
              <span className="text-xs text-gray-400 line-through">{log.from}</span>
              <span className="text-[10px] text-gray-400">→</span>
              <span className={`text-xs font-semibold ${log.color}`}>{log.to}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#A9B2B9] mt-2">Reason: Adjusted to align with revised weekly plan</p>
      </div>
    ),
  },
  {
    id: 't6',
    type: 'report',
    label: 'Lab Report Uploaded',
    timestamp: '25 Feb 2026 · 02:00PM',
    by: 'Dr. Ankur Gulati', role: 'Endocrinologist',
    content: (
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-1 uppercase tracking-wide">Fasting Blood Panel — Feb 2026</p>
        <p className="text-xs text-gray-500 mb-3">Complete blood count, lipid profile, HbA1c, fasting glucose. Results show improvement across all metabolic markers compared to baseline.</p>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 bg-white hover:border-[#133696] hover:text-[#133696] transition-colors">
            <Download size={11} /> Download Report
          </button>
          <span className="text-xs bg-green-100 text-green-700 rounded-lg px-2.5 py-1 font-medium">All Normal ✓</span>
        </div>
      </div>
    ),
  },
  {
    id: 't7',
    type: 'plan',
    label: '🚀 Plan Started',
    timestamp: '10 Feb 2026 · 10:00AM',
    by: 'Dr. Ankur Gulati', role: 'Endocrinologist',
    content: (
      <div>
        <p className="text-sm font-semibold text-[#133696] mb-1">Weight Loss 3 Month Programme — Onboarding Complete</p>
        <p className="text-xs text-gray-500 leading-relaxed mb-3">Chetan joined FitPlus on a personalised 3-month weight loss plan. Starting stats recorded. Diet plan, supplement stack, and daily goal routine assigned. Next check-in in 2 weeks.</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Starting Weight', value: '94 kg' },
            { label: 'Starting BMI', value: '30.7' },
            { label: 'Target Weight', value: '84 kg' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg p-2 border border-[#C7D3F5] text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">{s.label}</p>
              <p className="text-xs font-bold text-[#133696]">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

// ── Timeline event card ───────────────────────────────────────────────────────
function TimelineEventCard({ event }: { event: TLItem }) {
  const s = EVENT_STYLE[event.type]
  const labelMap: Record<TLEventType, string> = {
    milestone: 'Milestone', prescription: 'Medical Goal', goal: 'Goal',
    note: 'Coach Note', visit: 'Doctor Visit', report: 'Report', plan: 'Plan Started',
  }
  return (
    <div className="relative pl-5 pb-6 last:pb-0">
      {/* Vertical line */}
      <div className="absolute left-1.5 top-2 bottom-0 w-px bg-gray-100 last:hidden" />
      {/* Dot */}
      <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white ${s.dot}`} style={{ boxShadow: '0 0 0 1px #e5e7eb' }} />

      {/* Timestamp + meta */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-gray-600">{event.label}</span> · {event.timestamp}
        </p>
        <button className="text-[#A9B2B9] hover:text-[#133696] transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      {/* Author */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${event.type === 'note' || event.type === 'goal' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
          {event.by.replace('Dr. ', '').charAt(0)}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-700 leading-tight">{event.by}</p>
          <p className="text-[10px] text-gray-400 leading-tight">{event.role}</p>
        </div>
      </div>

      {/* Card */}
      <div className={`rounded-lg p-4 border ${s.bg} ${s.border}`}>
        <span className={`inline-block text-white text-xs px-3 py-0.5 rounded-lg font-medium mb-3 ${s.badge}`}>
          {labelMap[event.type]}
        </span>
        {event.content}
      </div>
    </div>
  )
}

// ── Note Modal ──────────────────────────────────────────────────────────────────
function NoteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('Dr. Nitin Patil')

  function handleSave() {
    // In a real app, persist to state/backend
    setText('')
    onClose()
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl border border-[#D9DEE2] w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#133696]">Add Note</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <CloseOutlined />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#434D56] block mb-1">Author</label>
            <input
              className="w-full border border-[#D9DEE2] rounded-lg px-3 py-2 text-sm text-[#1A2128] placeholder:text-[#A9B2B9] focus:outline-none focus:border-[#133696] transition-colors"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Author name"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#434D56] block mb-1">Note</label>
            <textarea
              className="w-full border border-[#D9DEE2] rounded-lg px-3 py-2 text-sm text-[#1A2128] placeholder:text-[#A9B2B9] focus:outline-none focus:border-[#133696] transition-colors resize-none"
              rows={4}
              placeholder="Write your note here…"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#434D56] border border-[#D9DEE2] hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#133696] text-white hover:bg-[#0f2a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Timeline tab ────────────────────────────────────────────────────────────────
function TimelineTab({
  onNewPrescription,
  onNewGoal,
  onAddNote,
  onUploadReport,
}: {
  onNewPrescription: () => void
  onNewGoal: () => void
  onAddNote: () => void
  onUploadReport: () => void
}) {
  const [activeFilter, setActiveFilter] = useState<TLEventType | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [showDateFilter, setShowDateFilter] = useState(false)

  const FILTER_CHIPS: { key: TLEventType | 'all'; label: string }[] = [
    { key: 'all',          label: 'All' },
    { key: 'milestone',    label: '🎉 Milestone' },
    { key: 'prescription', label: '💊 Prescription' },
    { key: 'goal',         label: '🎯 Goal' },
    { key: 'visit',        label: '🩺 Doctor Visit' },
    { key: 'note',         label: '📝 Note' },
    { key: 'report',       label: '📄 Report' },
    { key: 'edit',         label: '✏️ Edit Log' },
  ]

  function parseDate(ts: string): Date {
    return new Date(ts.split('·')[0].trim())
  }

  const filtered = TIMELINE_EVENTS.filter(e => {
    if (activeFilter !== 'all' && e.type !== activeFilter) return false
    if (dateFrom && parseDate(e.timestamp) < new Date(dateFrom)) return false
    if (dateTo   && parseDate(e.timestamp) > new Date(dateTo))   return false
    return true
  })

  const hasDateFilter = dateFrom || dateTo

  return (
    <div className="pb-4 -mx-5">

      {/* ── Section 1 : Add Event ──────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-[#EEF1F3]">
        <Button icon={<PlusOutlined />} size="small" className="rounded-lg text-xs border-gray-300" onClick={onNewPrescription}>
          New Prescription
        </Button>
        <Button icon={<PlusOutlined />} size="small" className="rounded-lg text-xs border-gray-300" onClick={onNewGoal}>
          New Routine (Goal)
        </Button>
        <Button icon={<PlusOutlined />} size="small" className="rounded-lg text-xs border-gray-300" onClick={onAddNote}>
          Note
        </Button>
        <Button icon={<UploadOutlined />} size="small" className="rounded-lg text-xs border-gray-300" onClick={onUploadReport}>
          Upload Report
        </Button>
      </div>

      {/* ── Section 2 : Quick Filters ──────────────────────────────────── */}
      <div className="px-5 py-3 border-b border-[#EEF1F3] space-y-2 bg-[#FAFBFC]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_CHIPS.map(chip => (
            <button key={chip.key} onClick={() => setActiveFilter(chip.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border
                ${activeFilter === chip.key
                  ? 'bg-[#133696] text-white border-[#133696]'
                  : 'bg-white text-[#434D56] border-[#D9DEE2] hover:border-[#133696] hover:text-[#133696]'}`}>
              {chip.label}
            </button>
          ))}
          <button onClick={() => setShowDateFilter(v => !v)}
            className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors
              ${hasDateFilter
                ? 'bg-[#E9EFFF] text-[#133696] border-[#133696]'
                : 'bg-white text-[#434D56] border-[#D9DEE2] hover:border-[#133696] hover:text-[#133696]'}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {hasDateFilter ? `${dateFrom || '…'} → ${dateTo || 'Today'}` : 'Date Range'}
            {hasDateFilter && (
              <span onClick={e => { e.stopPropagation(); setDateFrom(''); setDateTo('') }}
                className="ml-0.5 hover:text-red-400">✕</span>
            )}
          </button>
        </div>

        {showDateFilter && (
          <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-[#D9DEE2]">
            <span className="text-[10px] text-[#A9B2B9] font-medium">From</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border border-[#D9DEE2] rounded-lg px-2 py-1 text-xs text-[#434D56] focus:outline-none focus:border-[#133696] bg-white" />
            <span className="text-[10px] text-[#A9B2B9] font-medium">To</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border border-[#D9DEE2] rounded-lg px-2 py-1 text-xs text-[#434D56] focus:outline-none focus:border-[#133696] bg-white" />
            <button onClick={() => setShowDateFilter(false)}
              className="ml-auto text-[11px] text-[#133696] font-semibold hover:underline px-1">Done</button>
          </div>
        )}
      </div>

      {/* ── Section 3 : Events ─────────────────────────────────────────── */}
      <div className="px-5 pt-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#A9B2B9]">No events match the selected filter.</div>
        ) : (
          filtered.map(event => <TimelineEventCard key={event.id} event={event} />)
        )}
      </div>

    </div>
  )
}

// ── Goal tab ───────────────────────────────────────────────────────────────────
const MOCK_GOALS = [
  { id: '1', name: 'Lose 10 kg in 3 months', value: '9 kg lost', frequency: 'Weekly check-in', progress: 9, total: 10, coach: 'Mr. Mahesh Patil', org: 'Zeel Fitness', date: '10 Feb 2026 · 10:00AM' },
  { id: '2', name: 'Daily Steps Goal', value: '8,000–10,000 steps', frequency: 'Daily', progress: 7500, total: 10000, coach: 'Mr. Mahesh Patil', org: 'Zeel Fitness', date: '10 Feb 2026 · 9:00AM' },
  { id: '3', name: 'Workout Sessions', value: '4 sessions/week', frequency: 'Weekly', progress: 3, total: 4, coach: 'Mr. Mahesh Patil', org: 'Zeel Fitness', date: '10 Feb 2026 · 8:00AM' },
]

function GoalTab({ patientId }: { patientId: string }) {
  return (
    <div className="pb-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => window.location.href = `/patients/${patientId}/goal/new`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D9DEE2] text-sm font-medium text-[#434D56] hover:border-[#133696] hover:text-[#133696] transition-colors bg-white"
        >
          <span className="text-base leading-none">+</span> Add Goal
        </button>
      </div>

      {MOCK_GOALS.map(goal => (
        <div key={goal.id} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">New Goal Assigned</span> {goal.date}
            </p>
            <button className="text-[#A9B2B9] hover:text-[#133696]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
              {goal.coach.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{goal.coach}</p>
              <p className="text-xs text-gray-400">{goal.org}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <span className="inline-block bg-[#133696] text-white text-xs px-3 py-0.5 rounded-lg font-medium mb-3">Goal</span>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">{goal.name}</p>
              <span className="text-xs text-gray-400">07:00AM, Today</span>
            </div>
            <div className="flex gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-700 rounded-lg px-2.5 py-0.5">
                ✓ {goal.value}
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-700 rounded-lg px-2.5 py-0.5">
                ✓ {goal.frequency}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(goal.progress / goal.total) * 100}%` }} />
              </div>
              <span className="text-xs text-gray-400">{goal.progress}/{goal.total}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Reports tab ────────────────────────────────────────────────────────────────
const MOCK_REPORTS = [
  { id: '1', title: 'PRELIMINARY EXAMINATION REPORT - FIELD', file: 'Autopsy Report 28 Jan 2022', doctor: 'Dr. Sameer Gulati', role: 'Consultant Endocrinologist & Metabolic physician', date: '28 Oct 2022 · 1:30PM', description: 'TO WHERE REMAINS FOUND AND CONTACT MATERIAL TO BODY' },
]

function ReportsTab({ patientId, onGenerate }: { patientId: string; onGenerate: () => void }) {
  return (
    <div className="pb-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => window.location.href = `/patients/${patientId}/report/new`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D9DEE2] text-sm font-medium text-[#434D56] hover:border-[#133696] hover:text-[#133696] transition-colors bg-white"
        >
          <Upload size={13} /> Upload Report
        </button>
        <button
          onClick={onGenerate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#133696] text-white text-sm font-semibold hover:bg-[#0f2a7a] transition-colors"
        >
          <FileText size={13} /> Generate Report
        </button>
      </div>

      {MOCK_REPORTS.map(report => (
        <div key={report.id} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">Report Uploaded</span> {report.date}
            </p>
            <button className="text-[#A9B2B9] hover:text-[#133696]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
              {report.doctor.replace('Dr. ', '').charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{report.doctor}</p>
              <p className="text-xs text-gray-400">{report.role}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <span className="inline-block bg-gray-700 text-white text-xs px-3 py-0.5 rounded-lg font-medium mb-3">Report</span>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{report.title}</p>
              <span className="text-xs text-gray-400">07:00AM, Today</span>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 bg-white hover:border-[#133696] hover:text-[#133696] transition-colors mb-3">
              <Download size={12} /> {report.file}
            </button>
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">DESCRIPTION</span> · {report.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Health Profile tab ─────────────────────────────────────────────────────────
const HEALTH_ENERGY = [
  { d: 'Mon', v: 60 }, { d: 'Tue', v: 75 }, { d: 'Wed', v: 55 }, { d: 'Thu', v: 90 },
  { d: 'Fri', v: 70 }, { d: 'Sat', v: 110 }, { d: 'Sun', v: 99 },
]
const HEALTH_BP = [2, 9, 16, 23, 30].map(d => ({
  d, v: [40, 65, 80, 55, 70, 90, 45, 60, 85, 35, 75, 95, 50, 65, 40, 80, 55, 70, 45, 90, 60, 75, 85, 50, 65, 40, 70, 55, 80, 65][d % 30]
}))
const HEALTH_HRV = ['Wed','Thu','Fri','Sat','Sun','Mon','Tue'].map((d, i) => ({
  d, v: [20, 35, 15, 90, 45, 70, 55][i]
}))

function HealthMetricCard({ title, value, unit, subtitle, children, timePeriods }: {
  title: string; value: string; unit: string; subtitle?: string; children: React.ReactNode; timePeriods?: string[]
}) {
  const [period, setPeriod] = useState('6M')
  const periods = timePeriods ?? ['D', 'W', 'M', '6M']
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-800">{value}</span>
          <span className="text-xs text-gray-400 ml-1">{unit}</span>
        </div>
      </div>
      <div className="my-3">{children}</div>
      <div className="flex gap-1 justify-center">
        {periods.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`w-8 h-7 rounded-md text-xs font-medium transition-colors
              ${period === p ? 'bg-gray-100 text-gray-800 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

function HealthProfileTab() {
  return (
    <div className="pb-4">
      {/* Apple Health banner */}
      <div className="flex items-center justify-between mb-4 p-3 bg-pink-50 rounded-lg border border-pink-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">❤️</span>
          <div>
            <span className="text-sm font-semibold text-gray-800">Apple Health</span>
            <span className="text-xs text-gray-400 ml-2">Last Update: 29 Oct 2022</span>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#133696] text-white text-xs font-semibold hover:bg-[#0f2a7a] transition-colors">
          <RefreshCw size={11} /> Sync Data
        </button>
      </div>

      {/* 2×2 metric cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Energy */}
        <HealthMetricCard title="🔥 Active Energy" value="99" unit="kcal" subtitle="Energy level has increased significantly">
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={HEALTH_ENERGY} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#f97316" strokeWidth={2} fill="url(#energyGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </HealthMetricCard>

        {/* Water Level */}
        <HealthMetricCard title="💧 Water Level" value="22" unit="%" subtitle="Energy level has increased significantly">
          <div className="flex flex-col items-center py-2">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e0f2fe" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40 * 0.22} ${2 * Math.PI * 40}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] text-gray-400 leading-tight">Daily</p>
                <p className="text-[10px] text-gray-400 leading-tight">10:11 AM</p>
                <p className="text-sm font-bold text-blue-600 leading-tight">1Ltr<span className="text-gray-400 font-normal">/3Ltr</span></p>
              </div>
            </div>
          </div>
        </HealthMetricCard>

        {/* Blood Pressure */}
        <HealthMetricCard title="❤️ Blood Pressure" value="99" unit="ms" subtitle="Energy level has increased significantly">
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={HEALTH_BP} margin={{ top: 4, bottom: 0, left: 0, right: 0 }} barSize={6}>
              <Bar dataKey="v" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </HealthMetricCard>

        {/* Heart Rate Variability */}
        <HealthMetricCard title="❤️ Heart Rate Variability" value="99" unit="ms" subtitle="Energy level has increased significantly">
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={HEALTH_HRV} margin={{ top: 4, bottom: 0, left: 0, right: 0 }} barSize={18}>
              <Bar dataKey="v" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </HealthMetricCard>
      </div>
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────────
export default function PatientProfile() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const patient = patients.find(p => p.slug === slug) ?? patients[0]
  const [activeTab, setActiveTab] = useState('timeline')
  const [weightRange, setWeightRange] = useState('6')
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)

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

            {/* Patient bio card — two-part split */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex overflow-hidden">

              {/* ── PART 1 : Avatar + info ─────────────────────────────── */}
              <div className="flex items-start gap-4 p-5 flex-1 min-w-0">
                <Avatar name={patient.name} size={80} />

                <div className="flex flex-col min-w-0 w-full">
                  <h2 className="text-base font-bold text-[#1A2128] leading-snug mb-0.5">{patient.name}</h2>
                  <p className="text-sm text-[#434D56] mb-3">
                    {patient.age} Yr, {patient.gender} · {patient.city}
                  </p>

                  {/* Divider */}
                  <div className="w-full h-px bg-[#EEF1F3] mb-3" />

                  {/* Plan duration + Extend Plan */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="bg-[#EEF1F3] text-[#434D56] rounded-lg px-2.5 py-1 text-xs">
                      <span className="font-bold">{patient.planMonths} Month</span> · {patient.planDays} Days
                    </span>
                    <Button
                      size="small"
                      type="primary"
                      icon={<SyncOutlined />}
                      className="rounded-lg text-xs bg-brand-navy border-brand-navy"
                    >
                      Extend Plan
                    </Button>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col gap-1.5">
                    <a href={`tel:${patient.phone}`} className="flex items-center gap-2 text-[#1A2128] hover:text-green-600 transition-colors">
                      <PhoneOutlined className="text-green-500" style={{ fontSize: 14 }} />
                      <span className="text-sm font-medium">{patient.phone}</span>
                    </a>
                    <a href={`mailto:${patient.email}`} className="flex items-center gap-2 text-[#1A2128] hover:text-blue-600 transition-colors">
                      <MailOutlined className="text-blue-400" style={{ fontSize: 14 }} />
                      <span className="text-sm">{patient.email}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="w-px bg-[#EEF1F3] self-stretch flex-shrink-0" />

              {/* ── PART 2 : Badges ───────────────────────────────────── */}
              <div className="flex flex-col gap-2 p-5 w-44 flex-shrink-0">
                <StatusBadge status={patient.status} />
                <span
                  className="inline-block px-3 py-1 rounded-lg text-xs font-semibold border w-fit"
                  style={{ background: '#E9EFFF', color: '#133696', borderColor: '#C7D3F5' }}
                >
                  {patient.planType}
                </span>
                {patient.tag && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 w-fit">
                    🟢 {patient.tag}
                  </span>
                )}
              </div>

            </div>

            {/* Tabs + content */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
              {/* Tab header */}
              <div className="px-5 pt-1">
                <TabBar tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
              </div>

              {/* Tab body */}
              <div className="p-5">
                {activeTab === 'timeline' && (
                  <TimelineTab
                    onNewPrescription={() => navigate(`/patients/${patient.slug}/prescription/new`)}
                    onNewGoal={() => navigate(`/patients/${patient.slug}/goal/new`)}
                    onAddNote={() => setNoteModalOpen(true)}
                    onUploadReport={() => navigate(`/patients/${patient.slug}/report/new`)}
                  />
                )}
                {activeTab === 'health' && <HealthProfileTab />}
                {activeTab === 'prescription' && (
                  <div className="py-12 text-center text-gray-400 text-sm">Prescription data coming soon</div>
                )}
                {activeTab === 'goal' && <GoalTab patientId={patient.slug} />}
                {activeTab === 'reports' && <ReportsTab patientId={patient.slug} onGenerate={() => setReportModalOpen(true)} />}
                {activeTab === 'notes' && (
                  <div className="py-12 text-center text-gray-400 text-sm">Notes coming soon</div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <div className="w-72 flex-shrink-0 space-y-4">

            {/* Member Since + Renewal on */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-3">
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-[#A9B2B9] mb-0.5">Member Since</p>
                  <p className="text-sm font-semibold text-[#1A2128]">{patient.memberSince}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A9B2B9] mb-0.5">Renewal on</p>
                  <p className="text-sm font-semibold text-[#1A2128]">{patient.renewalDate}</p>
                  <p className="text-xs text-orange-500 font-medium mt-0.5">(1 Month Left)</p>
                </div>
              </div>
            </div>

            {/* Doctor & Coach assignment */}
            <div className="bg-white rounded-lg border border-[#EEF1F3] shadow-sm p-4 space-y-4">

              {/* Doctor */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between bg-white border border-[#EEF1F3] rounded-lg pl-1.5 pr-2 py-1 w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 flex-shrink-0">
                      {patient.assignedDoctor.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div className="leading-tight">
                      <p className="text-[10px] font-bold text-[#434D56]">Doctor</p>
                      <p className="text-xs text-[#1A2128]">{patient.assignedDoctor}</p>
                    </div>
                  </div>
                  <button className="text-[#133696] hover:opacity-70 transition-opacity ml-2 flex-shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-[#A9B2B9]">Since: {patient.memberSince}</p>
              </div>

              {/* Health Coach */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between bg-white border border-[#EEF1F3] rounded-lg pl-1.5 pr-2 py-1 w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-[10px] font-bold text-pink-600 flex-shrink-0">
                      {patient.assignedCoach.charAt(0)}
                    </div>
                    <div className="leading-tight">
                      <p className="text-[10px] font-bold text-[#434D56]">Health Coach</p>
                      <p className="text-xs text-[#1A2128]">{patient.assignedCoach}</p>
                    </div>
                  </div>
                  <button className="text-[#133696] hover:opacity-70 transition-opacity ml-2 flex-shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-[#A9B2B9]">Since: {patient.memberSince}</p>
              </div>

              {/* Assign button */}
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-[#A9B2B9] text-[13px] font-semibold text-[#A9B2B9] hover:border-[#133696] hover:text-[#133696] transition-colors">
                <PlusOutlined style={{ fontSize: 12 }} />
                Assign
              </button>
            </div>

            {/* Body stats */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
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
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
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

      <GenerateReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        patient={patient}
      />

      <NoteModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
      />
    </div>
  )
}
