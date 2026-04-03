import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons'
import Header from '../../components/layout/Header'
import { patients } from '../../data/mock'

// ── Section card wrapper ───────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-[10px] border border-[#D9DEE2] p-8"
    >
      <p className="text-sm font-semibold text-[#133696] mb-5">{title}</p>
      {children}
    </div>
  )
}

// ── Labeled input ──────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#434D56]">
        {label}
        {required && <span className="text-[#FF4242] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Base input styles ──────────────────────────────────────────────────────────
const inputCls =
  'w-full h-12 px-3 rounded-[10px] border border-[#A9B2B9] text-sm text-[#1A2128] placeholder-[#A9B2B9] outline-none focus:border-[#133696] transition-colors bg-white'

const textareaCls =
  'w-full px-3 py-3 rounded-[10px] border border-[#A9B2B9] text-sm text-[#1A2128] placeholder-[#A9B2B9] outline-none focus:border-[#133696] transition-colors bg-white resize-none'

// ── Medicine entry ─────────────────────────────────────────────────────────────
interface Medicine {
  id: string
  name: string
  morning: boolean
  afternoon: boolean
  night: boolean
  duration: string
  frequency: string
  note: string
}

function MedicineEntry({
  medicine,
  onChange,
  onRemove,
  showRemove,
}: {
  medicine: Medicine
  onChange: (m: Medicine) => void
  onRemove: () => void
  showRemove: boolean
}) {
  const toggle = (key: 'morning' | 'afternoon' | 'night') =>
    onChange({ ...medicine, [key]: !medicine[key] })

  const doseOptions = ['Once daily', 'Twice daily', 'Thrice daily', 'As needed']

  return (
    <div className="rounded-[10px] border border-[#D9DEE2] p-5 bg-[#FAFBFC] space-y-4">
      {/* Medicine name search */}
      <Field label="Medicine Name" required>
        <div className="relative">
          <input
            type="text"
            placeholder="Search medicine name"
            value={medicine.name}
            onChange={e => onChange({ ...medicine, name: e.target.value })}
            className={inputCls + ' pl-9'}
          />
          <SearchOutlined
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B2B9]"
            style={{ fontSize: 14 }}
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        {/* Regimen checkboxes */}
        <Field label="Regimen" required>
          <div className="flex items-center gap-4 h-12">
            {(['morning', 'afternoon', 'night'] as const).map(slot => (
              <label key={slot} className="flex items-center gap-1.5 cursor-pointer select-none">
                <div
                  onClick={() => toggle(slot)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    medicine[slot]
                      ? 'bg-[#133696] border-[#133696]'
                      : 'border-[#A9B2B9] bg-white'
                  }`}
                >
                  {medicine[slot] && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-[#434D56] capitalize">{slot}</span>
              </label>
            ))}
          </div>
        </Field>

        {/* Course duration */}
        <Field label="Course Duration" required>
          <select
            value={medicine.duration}
            onChange={e => onChange({ ...medicine, duration: e.target.value })}
            className={inputCls + ' appearance-none'}
          >
            <option value="">Select duration</option>
            {['7 Days', '10 Days', '14 Days', '21 Days', '30 Days', '45 Days', '60 Days', '90 Days'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Frequency */}
        <Field label="Frequency">
          <select
            value={medicine.frequency}
            onChange={e => onChange({ ...medicine, frequency: e.target.value })}
            className={inputCls + ' appearance-none'}
          >
            <option value="">Select frequency</option>
            {doseOptions.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Field>

        {/* Note */}
        <Field label="Note">
          <input
            type="text"
            placeholder="e.g. Take after meals"
            value={medicine.note}
            onChange={e => onChange({ ...medicine, note: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>

      {/* Remove */}
      {showRemove && (
        <div className="flex justify-end">
          <button
            onClick={onRemove}
            className="flex items-center gap-1 text-xs text-[#FF4242] hover:opacity-80 transition-opacity"
          >
            <DeleteOutlined style={{ fontSize: 12 }} />
            Remove Medicine
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
let _uid = 1
function uid() { return String(++_uid) }

function defaultMedicine(): Medicine {
  return {
    id: uid(),
    name: '',
    morning: false,
    afternoon: false,
    night: false,
    duration: '',
    frequency: '',
    note: '',
  }
}

export default function PrescriptionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patient = patients.find(p => p.id === id) ?? patients[0]

  const [diagnosis, setDiagnosis] = useState('')
  const [medicines, setMedicines] = useState<Medicine[]>([defaultMedicine()])
  const [advice, setAdvice] = useState('')
  const [noteForMe, setNoteForMe] = useState('')
  const [saving, setSaving] = useState(false)

  const updateMedicine = (idx: number, m: Medicine) =>
    setMedicines(prev => prev.map((x, i) => (i === idx ? m : x)))

  const removeMedicine = (idx: number) =>
    setMedicines(prev => prev.filter((_, i) => i !== idx))

  const addMedicine = () => setMedicines(prev => [...prev, defaultMedicine()])

  const canSave = diagnosis.trim() !== '' && advice.trim() !== '' && medicines.some(m => m.name.trim() !== '')

  const handleSave = () => {
    if (!canSave) return
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      navigate(`/patients/${patient.id}`)
    }, 800)
  }

  const breadcrumb = (
    <div className="flex items-center gap-2 text-sm">
      <Link to="/patients" className="text-[#A9B2B9] hover:text-[#133696] transition-colors">
        Patient
      </Link>
      <span className="text-[#A9B2B9]">›</span>
      <Link to={`/patients/${patient.id}`} className="text-[#A9B2B9] hover:text-[#133696] transition-colors">
        {patient.name}
      </Link>
      <span className="text-[#A9B2B9]">›</span>
      <span className="text-[#133696] font-semibold">New Prescription</span>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <Header
        title="New Prescription"
        breadcrumb={breadcrumb}
        showSearch={false}
      />

      <div className="flex-1 overflow-auto p-5 bg-[#EEF1F3]">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* ── Section 1: Observation Details ──────────────────────── */}
          <SectionCard title="Observation Details">
            <Field label="Diagnosis / Chief Complaint" required>
              <textarea
                rows={4}
                placeholder="e.g. Type 2 Diabetes Mellitus with hypertension, BMI 32..."
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className={textareaCls}
              />
            </Field>
          </SectionCard>

          {/* ── Section 2: Add Medicine Goal ────────────────────────── */}
          <SectionCard title="Add Medicine Goal">
            <div className="space-y-4">
              {medicines.map((m, i) => (
                <MedicineEntry
                  key={m.id}
                  medicine={m}
                  onChange={updated => updateMedicine(i, updated)}
                  onRemove={() => removeMedicine(i)}
                  showRemove={medicines.length > 1}
                />
              ))}

              {/* Add medicine button */}
              <button
                onClick={addMedicine}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#3C5DB7' }}
              >
                <PlusOutlined style={{ fontSize: 14 }} />
                Add Medicine
              </button>
            </div>
          </SectionCard>

          {/* ── Section 3: More Details ──────────────────────────────── */}
          <SectionCard title="More Details">
            <Field label="Advice" required>
              <textarea
                rows={4}
                placeholder="General advice for the patient e.g. exercise, diet recommendations..."
                value={advice}
                onChange={e => setAdvice(e.target.value)}
                className={textareaCls}
              />
            </Field>
          </SectionCard>

          {/* ── Section 4: Note for me ───────────────────────────────── */}
          <SectionCard title="Note for Me">
            <Field label="Private Note">
              <textarea
                rows={3}
                placeholder="This note is only visible to you..."
                value={noteForMe}
                onChange={e => setNoteForMe(e.target.value)}
                className={textareaCls}
              />
            </Field>
          </SectionCard>

          {/* ── Save button ──────────────────────────────────────────── */}
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="w-full h-12 rounded-[10px] text-sm font-semibold text-white transition-all"
            style={{
              background: canSave ? '#133696' : '#A9B2B9',
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Saving…' : 'Save Details'}
          </button>

        </div>
      </div>
    </div>
  )
}
