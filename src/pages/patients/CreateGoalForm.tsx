import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import { patients } from '../../data/mock'

const MEASURE_EVENTS = [
  { id: 'weight', label: 'Weight Training', emoji: '🏋️' },
  { id: 'water', label: 'Water', emoji: '💧' },
  { id: 'medicine', label: 'Medicine', emoji: '💊' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊' },
  { id: 'sports', label: 'Sports', emoji: '🥊' },
  { id: 'cycling', label: 'Cycling', emoji: '🚴' },
  { id: 'running', label: 'Running', emoji: '🏃' },
  { id: 'cold_bath', label: 'Cold Bath', emoji: '🛁' },
]

const GOAL_TYPES = ['Measure', 'Yes/No', 'Count']
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Twice a day']

const inputCls = 'w-full border border-[#D9DEE2] rounded-lg px-3 py-2.5 text-sm text-[#1A2128] placeholder:text-[#A9B2B9] focus:outline-none focus:border-[#133696] transition-colors'
const selectCls = `${inputCls} appearance-none bg-white bg-no-repeat bg-right cursor-pointer pr-8`

export default function CreateGoalForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const patient = patients.find(p => p.slug === slug) ?? patients[0]

  const [goalName, setGoalName] = useState('')
  const [goalType, setGoalType] = useState('Measure')
  const [selectedEvent, setSelectedEvent] = useState('water')
  const [value, setValue] = useState('')
  const [frequency, setFrequency] = useState('Daily')
  const [note, setNote] = useState('')

  function handleSave() {
    navigate(`/patients/${patient.slug}`)
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title=""
        icon={null}
        showSearch={false}
        breadcrumb={
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="4" r="2.5" stroke="#9ca3af" strokeWidth="1.2" />
              <path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <Link to="/patients" className="hover:text-brand-navy">Patient</Link>
            <span className="text-gray-400">›</span>
            <Link to={`/patients/${patient.slug}`} className="hover:text-brand-navy">{patient.name}</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-700 font-medium">New Goal</span>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-5 bg-[#EEF1F3]">
        <h1 className="text-base font-bold text-[#133696] mb-4">Add New Goal</h1>

        <div className="bg-white rounded-lg border border-[#D9DEE2] p-6 space-y-5">

          {/* Goal Name + Goal Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434D56]">Goal Name</label>
              <input
                className={inputCls}
                placeholder="Drink Water"
                value={goalName}
                onChange={e => setGoalName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434D56]">Goal type</label>
              <select className={selectCls} value={goalType} onChange={e => setGoalType(e.target.value)}>
                {GOAL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Measure Event */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#434D56]">Measure Event</label>
            <div className="flex flex-wrap gap-3">
              {MEASURE_EVENTS.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 w-20 transition-all
                    ${selectedEvent === ev.id
                      ? 'border-[#133696] bg-[#E9EFFF]'
                      : 'border-[#D9DEE2] hover:border-gray-300 bg-white'}`}
                >
                  <span className="text-2xl">{ev.emoji}</span>
                  <span className="text-[10px] font-medium text-[#434D56] text-center leading-tight">{ev.label}</span>
                </button>
              ))}
              <button className="flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 border-dashed border-[#D9DEE2] w-20 hover:border-[#133696] transition-colors">
                <span className="text-2xl text-[#A9B2B9]">+</span>
                <span className="text-[10px] font-medium text-[#133696] text-center leading-tight">Add Event</span>
              </button>
            </div>
          </div>

          {/* Value + Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434D56]">Value</label>
              <input
                className={inputCls}
                placeholder="3Ltrs"
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434D56]">Frequency</label>
              <select className={selectCls} value={frequency} onChange={e => setFrequency(e.target.value)}>
                {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434D56]">Note</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Instructions"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-lg bg-[#133696] text-white font-semibold text-sm hover:bg-[#0f2a7a] transition-colors"
          >
            Save Details
          </button>
        </div>
      </div>
    </div>
  )
}
