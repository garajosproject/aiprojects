import { useState, useEffect, useRef } from 'react'
import { Switch, Spin } from 'antd'
import {
  FileText, Printer, Mail, Download, X, ChevronLeft,
  ChevronRight, Clock, Eye, RefreshCw, Check, Trash2, Pencil, Plus,
} from 'lucide-react'
import { Patient, articles } from '../../data/mock'

// ── Base mock data ────────────────────────────────────────────────────────────
const BASE_PRESCRIPTIONS = [
  { id: 'rx1', name: 'Multivitamin Daily', generic: 'Vitamin B-Complex + C + D3', schedule: 'Morning', days: '30/30 Days' },
  { id: 'rx2', name: 'Whey Protein 25g', generic: 'Whey Protein Isolate', schedule: 'Post-Workout', days: '60/90 Days' },
  { id: 'rx3', name: 'Omega-3 Fish Oil', generic: 'EPA + DHA 1000mg', schedule: 'Night', days: '10/30 Days' },
  { id: 'rx4', name: 'Vitamin D3 60K IU', generic: 'Cholecalciferol', schedule: 'Weekly', days: '2/8 Weeks' },
]
const BASE_GOALS = [
  { id: 'g1', title: 'Lose 10 kg in 3 months', status: 'In Progress' },
  { id: 'g2', title: 'Daily 8,000–10,000 steps', status: 'Active' },
  { id: 'g3', title: '4 workout sessions per week', status: 'Active' },
]
const BASE_NOTES = [
  { id: 'n1', text: 'Patient showing consistent progress. Weight reduced by 9 kg in 8 weeks. Advised to maintain current caloric deficit and increase protein intake.', date: '06 Apr 2026', author: 'Dr. Ankur Gulati' },
  { id: 'n2', text: 'Blood sugar levels improving. Fasting glucose down to 102 mg/dL from 118 mg/dL. Continue monitoring. No medication changes needed.', date: '22 Mar 2026', author: 'Dr. Ankur Gulati' },
  { id: 'n3', text: 'Step goal consistently met (avg 8,400/day). Sleep improving. Coach recommends adding strength training 2x/week.', date: '10 Mar 2026', author: 'Mahesh Patil' },
]
const MOCK_HISTORY = [
  { id: '1', date: '06 Apr 2026', generatedBy: 'Dr. Ankur Gulati', sections: ['Prescriptions', 'Goals', 'Notes'], pages: 3 },
  { id: '2', date: '15 Mar 2026', generatedBy: 'Mahesh Patil', sections: ['Goals', 'Articles', 'Notes'], pages: 2 },
  { id: '3', date: '02 Feb 2026', generatedBy: 'Dr. Ankur Gulati', sections: ['Prescriptions', 'Articles'], pages: 2 },
]
const STATUS_COLORS: Record<string, string> = {
  'In Progress': 'bg-blue-50 text-blue-700',
  'Active': 'bg-green-50 text-green-700',
  'Completed': 'bg-gray-100 text-gray-500',
}

const DEFAULT_TASKS = [
  { id: 't1', text: 'Schedule next doctor consultation within 7 days', selected: true },
  { id: 't2', text: 'Complete weekly body measurement and log to system', selected: true },
  { id: 't3', text: 'Review and renew active prescriptions before expiry', selected: true },
  { id: 't4', text: 'Complete pending health profile questionnaire', selected: true },
]

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 'select' | 'preview' | 'options' | 'generating' | 'output'
type ModalTab = 'new' | 'history'

interface DataSections { drugs: boolean; goals: boolean; articles: boolean; notes: boolean }
interface ReportOptions { includeSummary: boolean; includeTasks: boolean; dateFrom: string; dateTo: string }

interface EPrescription { id: string; name: string; generic: string; schedule: string; days: string }
interface EGoal        { id: string; title: string; status: string }
interface ENote        { id: string; text: string; date: string; author: string }
interface EArticle     { id: string; title: string }
interface ETask        { id: string; text: string; selected: boolean }

interface ReportResult {
  summary: string | null
  recommendations: string[]
  upcomingTasks: string[]
  prescriptions: EPrescription[]
  goals: EGoal[]
  notes: ENote[]
  articles: EArticle[]
}

interface Props { open: boolean; onClose: () => void; patient: Patient }

// ── AI report generator (uses final edited data) ───────────────────────────
function buildAutoSummary(
  patient: Patient,
  data: { prescriptions: EPrescription[]; goals: EGoal[] }
): string {
  const weightLoss = patient.startingWeight - patient.currentWeight
  const bmiTrend = patient.currentBMI < patient.startingBMI ? 'improved' : 'stable'
  const activeGoals = data.goals.filter(g => g.status !== 'Completed').length
  return (
    `${patient.name} has shown consistent progress with a ${weightLoss} kg weight reduction since joining on ${patient.memberSince}. ` +
    `Current BMI of ${patient.currentBMI} (down from ${patient.startingBMI}) and blood pressure ${patient.bloodPressure} indicate ${bmiTrend} health metrics. ` +
    `Sugar levels at ${patient.sugarLevel} remain under monitored range. ` +
    `${data.prescriptions.length} active prescriptions are in place and ${activeGoals} health goals are currently active, ` +
    `overseen by ${patient.assignedDoctor} and Health Coach ${patient.assignedCoach}.`
  )
}

function generateHealthReport(
  patient: Patient,
  opts: ReportOptions,
  data: { prescriptions: EPrescription[]; goals: EGoal[]; notes: ENote[] },
  overrides?: { summary?: string; tasks?: string[] }
): ReportResult {
  const summary = opts.includeSummary
    ? (overrides?.summary || buildAutoSummary(patient, data))
    : null

  const recommendations = opts.includeSummary ? [
    `Maintain daily caloric intake aligned with the ${patient.planType} nutritional guidelines.`,
    `Continue weight monitoring — target BMI below 25 within the next plan cycle.`,
    `Blood pressure readings should be logged weekly and shared with ${patient.assignedDoctor}.`,
    `Hydration goal: minimum 2.5L of water daily alongside prescribed supplements.`,
    data.prescriptions.length > 0
      ? `Ensure consistent intake of ${data.prescriptions[0].name} as prescribed.`
      : `Adhere to all prescribed supplement schedules without skipping.`,
  ] : []

  const upcomingTasks = opts.includeTasks
    ? (overrides?.tasks ?? DEFAULT_TASKS.map(t => t.text))
    : []

  return {
    summary, recommendations, upcomingTasks,
    prescriptions: data.prescriptions,
    goals: data.goals,
    notes: data.notes,
    articles: [],
  }
}

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ['Select', 'Preview', 'Options', 'Generate']
const STEP_KEYS: Step[] = ['select', 'preview', 'options', 'generating']

function StepIndicator({ current }: { current: Step }) {
  const idx = STEP_KEYS.indexOf(current)
  return (
    <div className="flex items-center gap-0 mb-5">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
              ${i < idx ? 'bg-[#133696] text-white' : i === idx ? 'bg-[#133696] text-white ring-4 ring-[#E9EFFF]' : 'bg-gray-100 text-gray-400'}`}>
              {i < idx ? <Check size={9} /> : i + 1}
            </div>
            <span className={`text-[11px] font-medium ${i === idx ? 'text-[#133696]' : i < idx ? 'text-gray-500' : 'text-gray-300'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-5 h-px mx-1.5 ${i < idx ? 'bg-[#133696]' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Checkbox section card ─────────────────────────────────────────────────────
function SectionCard({ label, description, dot, checked, onChange }: {
  label: string; description: string; dot: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all
      ${checked ? 'border-[#133696] bg-[#E9EFFF]/40' : 'border-[#D9DEE2] hover:border-gray-300 bg-white'}`}
      onClick={() => onChange(!checked)}
    >
      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors
        ${checked ? 'bg-[#133696] border-[#133696]' : 'border-gray-300'}`}>
        {checked && <Check size={9} className="text-white" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
          <p className="text-sm font-medium text-[#1A2128]">{label}</p>
        </div>
        <p className="text-xs text-[#A9B2B9] mt-0.5">{description}</p>
      </div>
    </label>
  )
}

// ── Inline edit row ───────────────────────────────────────────────────────────
function EditableRow({ children, onRemove, onEdit, isEditing }: {
  children: React.ReactNode; onRemove: () => void; onEdit: () => void; isEditing: boolean
}) {
  return (
    <div className={`group flex items-start gap-2 py-2 px-2 rounded-lg transition-colors ${isEditing ? 'bg-[#E9EFFF]/40' : 'hover:bg-gray-50'}`}>
      <div className="flex-1 min-w-0">{children}</div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
        <button onClick={onEdit}
          className={`p-1 rounded border transition-colors ${isEditing ? 'border-[#133696] bg-[#E9EFFF] text-[#133696]' : 'border-[#D9DEE2] text-[#A9B2B9] hover:border-[#133696] hover:text-[#133696]'}`}
          title="Edit">
          <Pencil size={11} />
        </button>
        <button onClick={onRemove}
          className="p-1 rounded border border-[#D9DEE2] text-[#A9B2B9] hover:border-red-400 hover:text-red-400 transition-colors"
          title="Remove">
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}

// ── Inline text editor ────────────────────────────────────────────────────────
function InlineTextEdit({ value, onChange, onDone }: { value: string; onChange: (v: string) => void; onDone: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  return (
    <div className="mt-1">
      <textarea
        ref={ref}
        rows={3}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-xs text-[#1A2128] border border-[#133696] rounded-lg px-3 py-2 resize-none focus:outline-none bg-white"
      />
      <button onClick={onDone}
        className="mt-1 flex items-center gap-1 px-3 py-1 rounded-lg bg-[#133696] text-white text-[10px] font-semibold hover:bg-[#0f2a7a]">
        <Check size={9} /> Done
      </button>
    </div>
  )
}

// ── Preview Section wrapper ───────────────────────────────────────────────────
function PreviewSection({ title, dot, count, children }: {
  title: string; dot: string; count: number; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
        <p className="text-xs font-semibold text-[#1A2128] flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          {title}
        </p>
        <span className="text-[10px] text-[#A9B2B9] font-medium">{count} item{count !== 1 ? 's' : ''}</span>
      </div>
      <div className="px-2 py-1.5 divide-y divide-gray-50">{children}</div>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function GenerateReportModal({ open, onClose, patient }: Props) {
  const [tab, setTab]       = useState<ModalTab>('new')
  const [step, setStep]     = useState<Step>('select')
  const [sections, setSections] = useState<DataSections>({ drugs: true, goals: true, articles: false, notes: true })
  const [options, setOptions]   = useState<ReportOptions>({ includeSummary: true, includeTasks: true, dateFrom: '', dateTo: '' })
  const [report, setReport]     = useState<ReportResult | null>(null)
  const [historyView, setHistoryView] = useState<string | null>(null)

  // ── Editable data state ───────────────────────────────────────────────────
  const [prescriptions, setPrescriptions] = useState<EPrescription[]>(BASE_PRESCRIPTIONS)
  const [goals, setGoals]                 = useState<EGoal[]>(BASE_GOALS)
  const [notesList, setNotesList]         = useState<ENote[]>(BASE_NOTES)
  const [articlesList, setArticlesList]   = useState<EArticle[]>(
    articles.filter(a => a.status === 'Live').slice(0, 3).map(a => ({ id: a.id, title: a.title }))
  )

  // Editing state: which item is currently in edit mode
  const [editingId, setEditingId] = useState<string | null>(null)

  // Options step — editable summary + task list
  const [summaryText, setSummaryText] = useState('')
  const [editingSummary, setEditingSummary] = useState(false)
  const [editableTasks, setEditableTasks] = useState<ETask[]>(DEFAULT_TASKS)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  useEffect(() => {
    if (open) {
      setStep('select')
      setSections({ drugs: true, goals: true, articles: false, notes: true })
      setOptions({ includeSummary: true, includeTasks: true, dateFrom: '', dateTo: '' })
      setReport(null)
      setHistoryView(null)
      setTab('new')
      setPrescriptions(BASE_PRESCRIPTIONS)
      setGoals(BASE_GOALS)
      setNotesList(BASE_NOTES)
      setArticlesList(articles.filter(a => a.status === 'Live').slice(0, 3).map(a => ({ id: a.id, title: a.title })))
      setEditingId(null)
      setSummaryText('')
      setEditingSummary(false)
      setEditableTasks(DEFAULT_TASKS)
      setEditingTaskId(null)
    }
  }, [open])

  if (!open) return null

  const hasSelection = sections.drugs || sections.goals || sections.articles || sections.notes
  const isWide = step === 'output' || step === 'preview' || step === 'options'

  // ── Generate final report using edited data ───────────────────────────────
  function handleGenerate() {
    setEditingTaskId(null)
    setEditingSummary(false)
    setStep('generating')
    setTimeout(() => {
      const selectedTasks = editableTasks.filter(t => t.selected).map(t => t.text)
      setReport(generateHealthReport(
        patient, options,
        { prescriptions, goals, notes: notesList },
        {
          summary: summaryText || undefined,
          tasks: options.includeTasks ? selectedTasks : [],
        }
      ))
      setStep('output')
    }, 1800)
  }

  // ── Print / Email ─────────────────────────────────────────────────────────
  function handlePrint() {
    const style = document.createElement('style')
    style.id = '__report_print_style__'
    style.innerHTML = `@media print { body > * { display: none !important; } #health-report-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; } }`
    document.head.appendChild(style)
    window.print()
    setTimeout(() => document.getElementById('__report_print_style__')?.remove(), 1000)
  }

  function handleEmail() {
    const subject = encodeURIComponent(`Health Report — ${patient.name}`)
    const body = encodeURIComponent(
      `Dear ${patient.name},\n\nPlease find your health report summary below.\n\n` +
      `Patient: ${patient.name}\nBMI: ${patient.currentBMI}\nWeight: ${patient.currentWeight}kg\n\n` +
      `${report?.summary ?? ''}\n\nFitPlus Health Team`
    )
    window.open(`mailto:${patient.email}?subject=${subject}&body=${body}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={step !== 'generating' ? onClose : undefined} />
      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes dotPulse { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:1;transform:scale(1.35)} }
      `}</style>

      <div
        className={`relative bg-white rounded-lg shadow-2xl border border-[#D9DEE2] flex flex-col overflow-hidden transition-all duration-200
          ${isWide ? 'w-full max-w-2xl max-h-[92vh]' : 'w-full max-w-md'}`}
        style={{ animation: 'scaleIn 0.15s ease-out' }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D9DEE2] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E9EFFF] flex items-center justify-center flex-shrink-0">
              <FileText size={15} className="text-[#133696]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1A2128] leading-tight">Health Report</h2>
              <p className="text-[10px] text-[#A9B2B9] leading-tight">{patient.name}</p>
            </div>
            {step !== 'generating' && step !== 'output' && (
              <div className="ml-3 flex rounded-lg border border-[#D9DEE2] overflow-hidden">
                {(['new', 'history'] as ModalTab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1 text-[11px] font-medium transition-colors
                      ${tab === t ? 'bg-[#133696] text-white' : 'text-[#434D56] hover:bg-gray-50'}`}>
                    {t === 'new' ? 'Generate New' : <span className="flex items-center gap-1"><Clock size={10} /> History</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {step !== 'generating' && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={17} />
            </button>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            HISTORY TAB
        ══════════════════════════════════════════════════════════════════ */}
        {tab === 'history' && (
          <div className="p-5 overflow-y-auto max-h-[70vh]">
            {historyView ? (
              <>
                <button onClick={() => setHistoryView(null)}
                  className="flex items-center gap-1 text-xs text-[#A9B2B9] hover:text-[#133696] mb-4 transition-colors">
                  <ChevronLeft size={12} /> Back to history
                </button>

                {/* Viewed report */}
                <div className="bg-[#133696] rounded-lg p-4 text-white mb-3">
                  <p className="text-[10px] text-blue-200 mb-0.5">FitPlus · Health Report</p>
                  <p className="text-base font-bold">{patient.name}</p>
                  <p className="text-[10px] text-blue-200 mt-0.5">
                    {MOCK_HISTORY.find(h => h.id === historyView)?.date} · by {MOCK_HISTORY.find(h => h.id === historyView)?.generatedBy}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-100 p-4 mb-3">
                  <p className="text-xs font-semibold text-[#1A2128] mb-2">Health Summary</p>
                  <p className="text-xs text-[#434D56] leading-relaxed">
                    {generateHealthReport(patient, options, { prescriptions: BASE_PRESCRIPTIONS, goals: BASE_GOALS, notes: BASE_NOTES }).summary}
                  </p>
                </div>

                {/* Sections included */}
                <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
                  <p className="text-xs font-semibold text-[#A9B2B9] mb-2 uppercase tracking-wide">Included Sections</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_HISTORY.find(h => h.id === historyView)?.sections.map(s => (
                      <span key={s} className="text-[10px] bg-[#E9EFFF] text-[#133696] px-2 py-0.5 rounded-lg">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D9DEE2] text-xs font-medium text-[#434D56] hover:border-[#133696] hover:text-[#133696] transition-colors">
                    <Download size={12} /> Download
                  </button>
                  <button onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D9DEE2] text-xs font-medium text-[#434D56] hover:border-[#133696] hover:text-[#133696] transition-colors">
                    <Printer size={12} /> Print
                  </button>
                  <button onClick={() => { setHistoryView(null); setTab('new'); setStep('select') }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#E9EFFF] text-xs font-semibold text-[#133696] hover:bg-blue-100 transition-colors">
                    <RefreshCw size={12} /> Regenerate
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-[#A9B2B9] mb-3">Previous reports generated for this patient</p>
                <div className="space-y-2">
                  {MOCK_HISTORY.map(h => (
                    <div key={h.id}
                      className="flex items-center gap-3 p-3.5 rounded-lg border border-[#D9DEE2] hover:border-[#133696]/40 hover:bg-[#E9EFFF]/20 transition-all">
                      <div className="w-9 h-9 rounded-lg bg-[#E9EFFF] flex items-center justify-center flex-shrink-0">
                        <FileText size={14} className="text-[#133696]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A2128]">{h.date}</p>
                        <p className="text-[10px] text-[#A9B2B9]">By {h.generatedBy} · {h.pages} pages</p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {h.sections.map(s => (
                            <span key={s} className="text-[10px] bg-[#E9EFFF] text-[#133696] px-1.5 py-0.5 rounded-lg">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => setHistoryView(h.id)}
                          className="p-1.5 rounded-lg border border-[#D9DEE2] text-[#A9B2B9] hover:border-[#133696] hover:text-[#133696] transition-colors" title="View">
                          <Eye size={13} />
                        </button>
                        <button onClick={handlePrint}
                          className="p-1.5 rounded-lg border border-[#D9DEE2] text-[#A9B2B9] hover:border-[#133696] hover:text-[#133696] transition-colors" title="Download">
                          <Download size={13} />
                        </button>
                        <button onClick={() => { setTab('new'); setStep('select') }}
                          className="p-1.5 rounded-lg border border-[#D9DEE2] text-[#A9B2B9] hover:border-[#133696] hover:text-[#133696] transition-colors" title="Regenerate">
                          <RefreshCw size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            NEW REPORT FLOW
        ══════════════════════════════════════════════════════════════════ */}
        {tab === 'new' && (
          <>
            {/* ── STEP 1: SELECT ──────────────────────────────────────────── */}
            {step === 'select' && (
              <div className="px-5 py-4">
                <StepIndicator current="select" />
                <p className="text-xs text-[#A9B2B9] mb-4">Choose which data sources to include in this report.</p>
                <div className="space-y-2.5 mb-5">
                  <SectionCard label="Drugs (Prescriptions)" description={`${BASE_PRESCRIPTIONS.length} active prescriptions`}
                    dot="bg-orange-400" checked={sections.drugs} onChange={v => setSections(s => ({ ...s, drugs: v }))} />
                  <SectionCard label="Goals" description={`${BASE_GOALS.length} health goals tracked`}
                    dot="bg-blue-500" checked={sections.goals} onChange={v => setSections(s => ({ ...s, goals: v }))} />
                  <SectionCard label="Articles" description="3 recommended articles"
                    dot="bg-purple-500" checked={sections.articles} onChange={v => setSections(s => ({ ...s, articles: v }))} />
                  <SectionCard label="Notes" description={`${BASE_NOTES.length} clinical notes`}
                    dot="bg-yellow-500" checked={sections.notes} onChange={v => setSections(s => ({ ...s, notes: v }))} />
                </div>
                <div className="flex gap-3">
                  <button onClick={onClose}
                    className="px-5 py-2.5 rounded-lg border border-[#D9DEE2] text-sm font-medium text-[#434D56] hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={() => setStep('preview')} disabled={!hasSelection}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all
                      ${hasSelection ? 'bg-[#133696] text-white hover:bg-[#0f2a7a]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                    Preview & Edit <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: PREVIEW (EDITABLE) ─────────────────────────────── */}
            {step === 'preview' && (
              <>
                <div className="px-5 pt-4 pb-0 flex-shrink-0">
                  <StepIndicator current="preview" />
                  <p className="text-xs text-[#A9B2B9] mb-3">Review and edit items below. Hover any row to edit or remove it.</p>
                </div>

                <div className="overflow-y-auto flex-1 px-5 pb-2">
                  {/* Prescriptions */}
                  {sections.drugs && prescriptions.length > 0 && (
                    <PreviewSection title="Drugs / Prescriptions" dot="bg-orange-400" count={prescriptions.length}>
                      {prescriptions.map(rx => (
                        <EditableRow key={rx.id}
                          isEditing={editingId === rx.id}
                          onEdit={() => setEditingId(editingId === rx.id ? null : rx.id)}
                          onRemove={() => { setPrescriptions(p => p.filter(x => x.id !== rx.id)); setEditingId(null) }}
                        >
                          <div>
                            {editingId === rx.id ? (
                              <div className="space-y-1.5">
                                <input value={rx.name}
                                  onChange={e => setPrescriptions(p => p.map(x => x.id === rx.id ? { ...x, name: e.target.value } : x))}
                                  className="w-full text-xs font-medium text-[#1A2128] border border-[#133696] rounded-lg px-2 py-1.5 focus:outline-none" />
                                <input value={rx.generic}
                                  onChange={e => setPrescriptions(p => p.map(x => x.id === rx.id ? { ...x, generic: e.target.value } : x))}
                                  className="w-full text-[11px] text-[#A9B2B9] border border-gray-200 rounded-lg px-2 py-1 focus:outline-none" />
                                <div className="flex gap-2">
                                  <input value={rx.schedule}
                                    onChange={e => setPrescriptions(p => p.map(x => x.id === rx.id ? { ...x, schedule: e.target.value } : x))}
                                    className="flex-1 text-[11px] text-[#434D56] border border-gray-200 rounded-lg px-2 py-1 focus:outline-none" />
                                  <input value={rx.days}
                                    onChange={e => setPrescriptions(p => p.map(x => x.id === rx.id ? { ...x, days: e.target.value } : x))}
                                    className="flex-1 text-[11px] text-[#434D56] border border-gray-200 rounded-lg px-2 py-1 focus:outline-none" />
                                </div>
                                <button onClick={() => setEditingId(null)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#133696] text-white text-[10px] font-semibold hover:bg-[#0f2a7a]">
                                  <Check size={9} /> Done
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs font-medium text-[#1A2128]">{rx.name}</p>
                                <p className="text-[10px] text-[#A9B2B9]">{rx.generic} · {rx.schedule} · {rx.days}</p>
                              </>
                            )}
                          </div>
                        </EditableRow>
                      ))}
                    </PreviewSection>
                  )}

                  {/* Goals */}
                  {sections.goals && goals.length > 0 && (
                    <PreviewSection title="Goals" dot="bg-blue-500" count={goals.length}>
                      {goals.map(g => (
                        <EditableRow key={g.id}
                          isEditing={editingId === g.id}
                          onEdit={() => setEditingId(editingId === g.id ? null : g.id)}
                          onRemove={() => { setGoals(gs => gs.filter(x => x.id !== g.id)); setEditingId(null) }}
                        >
                          {editingId === g.id ? (
                            <div className="space-y-1.5">
                              <input value={g.title}
                                onChange={e => setGoals(gs => gs.map(x => x.id === g.id ? { ...x, title: e.target.value } : x))}
                                className="w-full text-xs text-[#1A2128] border border-[#133696] rounded-lg px-2 py-1.5 focus:outline-none" />
                              <select value={g.status}
                                onChange={e => setGoals(gs => gs.map(x => x.id === g.id ? { ...x, status: e.target.value } : x))}
                                className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 focus:outline-none text-[#434D56]">
                                <option>Active</option><option>In Progress</option><option>Completed</option>
                              </select>
                              <button onClick={() => setEditingId(null)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#133696] text-white text-[10px] font-semibold">
                                <Check size={9} /> Done
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-[#434D56]">{g.title}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ml-2 flex-shrink-0 ${STATUS_COLORS[g.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                {g.status}
                              </span>
                            </div>
                          )}
                        </EditableRow>
                      ))}
                    </PreviewSection>
                  )}

                  {/* Articles */}
                  {sections.articles && articlesList.length > 0 && (
                    <PreviewSection title="Articles" dot="bg-purple-500" count={articlesList.length}>
                      {articlesList.map(a => (
                        <EditableRow key={a.id}
                          isEditing={editingId === a.id}
                          onEdit={() => setEditingId(editingId === a.id ? null : a.id)}
                          onRemove={() => { setArticlesList(al => al.filter(x => x.id !== a.id)); setEditingId(null) }}
                        >
                          {editingId === a.id ? (
                            <div className="space-y-1.5">
                              <input value={a.title}
                                onChange={e => setArticlesList(al => al.map(x => x.id === a.id ? { ...x, title: e.target.value } : x))}
                                className="w-full text-xs text-[#1A2128] border border-[#133696] rounded-lg px-2 py-1.5 focus:outline-none" />
                              <button onClick={() => setEditingId(null)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#133696] text-white text-[10px] font-semibold">
                                <Check size={9} /> Done
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-[#434D56]">{a.title}</p>
                          )}
                        </EditableRow>
                      ))}
                    </PreviewSection>
                  )}

                  {/* Notes */}
                  {sections.notes && notesList.length > 0 && (
                    <PreviewSection title="Clinical Notes" dot="bg-yellow-500" count={notesList.length}>
                      {notesList.map(n => (
                        <EditableRow key={n.id}
                          isEditing={editingId === n.id}
                          onEdit={() => setEditingId(editingId === n.id ? null : n.id)}
                          onRemove={() => { setNotesList(nl => nl.filter(x => x.id !== n.id)); setEditingId(null) }}
                        >
                          {editingId === n.id ? (
                            <InlineTextEdit value={n.text}
                              onChange={v => setNotesList(nl => nl.map(x => x.id === n.id ? { ...x, text: v } : x))}
                              onDone={() => setEditingId(null)} />
                          ) : (
                            <>
                              <p className="text-xs text-[#434D56] line-clamp-2 leading-relaxed">{n.text}</p>
                              <p className="text-[10px] text-[#A9B2B9] mt-0.5">{n.date} · {n.author}</p>
                            </>
                          )}
                        </EditableRow>
                      ))}
                    </PreviewSection>
                  )}

                </div>

                <div className="px-5 py-3.5 border-t border-gray-100 flex-shrink-0 flex gap-3">
                  <button onClick={() => setStep('select')}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-lg border border-[#D9DEE2] text-sm font-medium text-[#434D56] hover:bg-gray-50">
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button onClick={() => {
                    setEditingId(null)
                    if (!summaryText) {
                      setSummaryText(buildAutoSummary(patient, { prescriptions, goals }))
                    }
                    setStep('options')
                  }}
                    className="flex-1 py-2.5 rounded-lg bg-[#133696] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#0f2a7a]">
                    Set Options <ChevronRight size={14} />
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 3: OPTIONS ─────────────────────────────────────────── */}
            {step === 'options' && (
              <>
                <div className="px-5 pt-4 pb-0 flex-shrink-0">
                  <StepIndicator current="options" />
                  <p className="text-xs text-[#A9B2B9] mb-3">Review and edit AI content before generating the final report.</p>
                </div>

                <div className="overflow-y-auto flex-1 px-5 pb-2 space-y-2.5">

                  {/* ── Health Summary ────────────────────────────────────── */}
                  <div className="rounded-lg border border-[#D9DEE2] bg-white overflow-hidden">
                    <div className="flex items-center justify-between p-3.5">
                      <div>
                        <p className="text-sm font-medium text-[#1A2128]">Health Summary & Recommendations</p>
                        <p className="text-xs text-[#A9B2B9]">AI-generated health overview and advice</p>
                      </div>
                      <Switch
                        checked={options.includeSummary}
                        onChange={v => {
                          if (v && !summaryText) setSummaryText(buildAutoSummary(patient, { prescriptions, goals }))
                          setOptions(o => ({ ...o, includeSummary: v }))
                        }}
                        size="small"
                      />
                    </div>

                    {options.includeSummary && (
                      <div className="border-t border-[#EEF1F3] px-3.5 pb-3.5 pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-semibold text-[#A9B2B9] uppercase tracking-wide">AI Summary</p>
                          <button
                            onClick={() => setEditingSummary(v => !v)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors
                              ${editingSummary
                                ? 'border-[#133696] bg-[#E9EFFF] text-[#133696]'
                                : 'border-[#D9DEE2] text-[#A9B2B9] hover:border-[#133696] hover:text-[#133696]'}`}>
                            <Pencil size={9} /> {editingSummary ? 'Done' : 'Edit'}
                          </button>
                        </div>
                        {editingSummary ? (
                          <textarea
                            rows={5}
                            value={summaryText}
                            onChange={e => setSummaryText(e.target.value)}
                            className="w-full text-xs text-[#1A2128] border border-[#133696] rounded-lg px-3 py-2 resize-none focus:outline-none bg-white leading-relaxed"
                          />
                        ) : (
                          <p className="text-xs text-[#434D56] leading-relaxed">{summaryText}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Upcoming Tasks ────────────────────────────────────── */}
                  <div className="rounded-lg border border-[#D9DEE2] bg-white overflow-hidden">
                    <div className="flex items-center justify-between p-3.5">
                      <div>
                        <p className="text-sm font-medium text-[#1A2128]">Upcoming Tasks</p>
                        <p className="text-xs text-[#A9B2B9]">Select and edit action items for the report</p>
                      </div>
                      <Switch checked={options.includeTasks} onChange={v => setOptions(o => ({ ...o, includeTasks: v }))} size="small" />
                    </div>

                    {options.includeTasks && (
                      <div className="border-t border-[#EEF1F3] px-2 pb-2.5 pt-1.5">
                        {editableTasks.map(task => (
                          <div key={task.id}
                            className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors
                              ${editingTaskId === task.id ? 'bg-[#E9EFFF]/40' : 'hover:bg-gray-50'}`}>
                            {/* Checkbox */}
                            <button
                              onClick={() => setEditableTasks(ts => ts.map(t => t.id === task.id ? { ...t, selected: !t.selected } : t))}
                              className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors
                                ${task.selected ? 'bg-[#133696] border-[#133696]' : 'border-gray-300 hover:border-[#133696]'}`}>
                              {task.selected && <Check size={9} className="text-white" />}
                            </button>

                            {/* Task text or inline edit */}
                            <div className="flex-1 min-w-0">
                              {editingTaskId === task.id ? (
                                <input
                                  value={task.text}
                                  autoFocus
                                  onChange={e => setEditableTasks(ts => ts.map(t => t.id === task.id ? { ...t, text: e.target.value } : t))}
                                  onBlur={() => setEditingTaskId(null)}
                                  onKeyDown={e => e.key === 'Enter' && setEditingTaskId(null)}
                                  className="w-full text-xs text-[#1A2128] border border-[#133696] rounded px-2 py-1 focus:outline-none"
                                />
                              ) : (
                                <p className={`text-xs leading-tight ${task.selected ? 'text-[#434D56]' : 'text-[#A9B2B9] line-through'}`}>
                                  {task.text}
                                </p>
                              )}
                            </div>

                            {/* Edit / Remove — hover-reveal */}
                            {editingTaskId !== task.id && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button onClick={() => setEditingTaskId(task.id)}
                                  className="p-0.5 rounded border border-[#D9DEE2] text-[#A9B2B9] hover:border-[#133696] hover:text-[#133696] transition-colors"
                                  title="Edit task">
                                  <Pencil size={10} />
                                </button>
                                <button onClick={() => { setEditableTasks(ts => ts.filter(t => t.id !== task.id)); setEditingTaskId(null) }}
                                  className="p-0.5 rounded border border-[#D9DEE2] text-[#A9B2B9] hover:border-red-400 hover:text-red-400 transition-colors"
                                  title="Remove task">
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add task */}
                        <button
                          onClick={() => {
                            const newId = `t${Date.now()}`
                            setEditableTasks(ts => [...ts, { id: newId, text: 'New task', selected: true }])
                            setEditingTaskId(newId)
                          }}
                          className="flex items-center gap-1.5 mt-1 ml-2 text-[11px] text-[#133696] font-medium hover:text-[#0f2a7a] transition-colors">
                          <Plus size={11} /> Add task
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── Date Range ───────────────────────────────────────── */}
                  <div className="p-3.5 rounded-lg border border-[#D9DEE2] bg-white">
                    <p className="text-sm font-medium text-[#1A2128] mb-0.5">
                      Timeline Range
                      <span className="ml-2 text-[10px] font-normal text-[#A9B2B9] bg-gray-100 px-1.5 py-0.5 rounded">optional</span>
                    </p>
                    <p className="text-xs text-[#A9B2B9] mb-3">Restrict report data to a specific date range.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-[#A9B2B9] mb-1 font-medium">From</p>
                        <input type="date"
                          className="w-full border border-[#D9DEE2] rounded-lg px-3 py-2 text-xs text-[#434D56] focus:outline-none focus:border-[#133696] bg-white"
                          value={options.dateFrom} onChange={e => setOptions(o => ({ ...o, dateFrom: e.target.value }))} />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#A9B2B9] mb-1 font-medium">To</p>
                        <input type="date"
                          className="w-full border border-[#D9DEE2] rounded-lg px-3 py-2 text-xs text-[#434D56] focus:outline-none focus:border-[#133696] bg-white"
                          value={options.dateTo} onChange={e => setOptions(o => ({ ...o, dateTo: e.target.value }))} />
                      </div>
                    </div>
                    {options.dateFrom && (
                      <p className="text-[10px] text-[#133696] mt-2 flex items-center gap-1">
                        <Check size={9} /> Filtering: {options.dateFrom} → {options.dateTo || 'Today'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-gray-100 flex-shrink-0 flex gap-3">
                  <button onClick={() => setStep('preview')}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-lg border border-[#D9DEE2] text-sm font-medium text-[#434D56] hover:bg-gray-50">
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button onClick={handleGenerate}
                    className="flex-1 py-2.5 rounded-lg bg-[#133696] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#0f2a7a]">
                    <FileText size={14} /> Generate Report
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 4: GENERATING ──────────────────────────────────────── */}
            {step === 'generating' && (
              <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
                <div className="w-16 h-16 rounded-lg bg-[#E9EFFF] flex items-center justify-center">
                  <Spin size="large" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#1A2128] mb-1">Generating Report…</p>
                  <p className="text-xs text-[#A9B2B9]">Building your report from the edited data</p>
                </div>
                <div className="flex gap-1.5 mt-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-[#133696]"
                      style={{ animation: `dotPulse 1.2s ease-in-out ${i * 0.4}s infinite` }} />
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 5: OUTPUT ──────────────────────────────────────────── */}
            {step === 'output' && report && (
              <>
                {/* Output toolbar */}
                <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#D9DEE2] bg-[#FAFBFC] flex-shrink-0">
                  <button onClick={() => setStep('options')}
                    className="flex items-center gap-1 text-xs text-[#A9B2B9] hover:text-[#133696] transition-colors">
                    <ChevronLeft size={12} /> Back to options
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9DEE2] text-xs font-medium text-[#434D56] hover:border-[#133696] hover:text-[#133696] transition-colors">
                      <Printer size={12} /> Print
                    </button>
                    <button onClick={handleEmail}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9DEE2] text-xs font-medium text-[#434D56] hover:border-[#133696] hover:text-[#133696] transition-colors">
                      <Mail size={12} /> Email
                    </button>
                    <button onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#133696] text-white text-xs font-semibold hover:bg-[#0f2a7a] transition-colors">
                      <Download size={12} /> Download PDF
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 p-5 bg-[#EEF1F3]">
                  <div id="health-report-print" className="space-y-3">

                    {/* Banner */}
                    <div className="bg-[#133696] rounded-lg p-5 text-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] text-blue-200 font-medium tracking-wide uppercase mb-1">FitPlus · Health Report</p>
                          <h1 className="text-xl font-bold leading-tight">{patient.name}</h1>
                          <p className="text-xs text-blue-200 mt-1">{patient.planType} · {today}</p>
                          {options.dateFrom && (
                            <p className="text-[10px] text-blue-300 mt-0.5">Period: {options.dateFrom} → {options.dateTo || 'Today'}</p>
                          )}
                        </div>
                        <FileText size={26} className="text-white/40 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Patient Overview */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                      <p className="text-xs font-semibold text-[#1A2128] mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#133696]" /> Patient Overview
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Age / Gender', value: `${patient.age} yr, ${patient.gender}` },
                          { label: 'City', value: patient.city },
                          { label: 'Member Since', value: patient.memberSince },
                          { label: 'Current BMI', value: `${patient.currentBMI}` },
                          { label: 'Weight Lost', value: `${patient.startingWeight - patient.currentWeight} kg` },
                          { label: 'Blood Pressure', value: patient.bloodPressure },
                        ].map(item => (
                          <div key={item.label} className="bg-gray-50 rounded-lg p-2">
                            <p className="text-[10px] text-[#A9B2B9] mb-0.5">{item.label}</p>
                            <p className="text-[11px] font-semibold text-[#1A2128]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-blue-50 rounded-lg p-2">
                          <p className="text-[10px] text-[#A9B2B9] mb-0.5">Doctor</p>
                          <p className="text-[11px] font-semibold text-[#1A2128]">{patient.assignedDoctor}</p>
                        </div>
                        <div className="bg-pink-50 rounded-lg p-2">
                          <p className="text-[10px] text-[#A9B2B9] mb-0.5">Health Coach</p>
                          <p className="text-[11px] font-semibold text-[#1A2128]">{patient.assignedCoach}</p>
                        </div>
                      </div>
                    </div>

                    {/* Health Summary */}
                    {report.summary && (
                      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                        <p className="text-xs font-semibold text-[#1A2128] mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Health Summary
                        </p>
                        <p className="text-xs text-[#434D56] leading-relaxed">{report.summary}</p>
                        {report.recommendations.length > 0 && (
                          <>
                            <p className="text-[10px] font-semibold text-[#A9B2B9] uppercase tracking-wide mt-3 mb-2">Recommendations</p>
                            <ul className="space-y-1.5">
                              {report.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-[#434D56]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 mt-1.5" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}

                    {/* Prescriptions in report */}
                    {sections.drugs && report.prescriptions.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                        <p className="text-xs font-semibold text-[#1A2128] mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Active Prescriptions
                        </p>
                        <div className="space-y-2">
                          {report.prescriptions.map((rx, i) => (
                            <div key={i} className="flex items-start justify-between py-1.5 border-b border-gray-50 last:border-0">
                              <div>
                                <p className="text-xs font-medium text-[#1A2128]">{rx.name}</p>
                                <p className="text-[10px] text-[#A9B2B9]">{rx.generic}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-[#434D56]">{rx.schedule}</p>
                                <p className="text-[10px] text-[#A9B2B9]">{rx.days}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Goals in report */}
                    {sections.goals && report.goals.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                        <p className="text-xs font-semibold text-[#1A2128] mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Health Goals
                        </p>
                        <div className="space-y-1.5">
                          {report.goals.map((g, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                              <p className="text-xs text-[#434D56]">{g.title}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${STATUS_COLORS[g.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                {g.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes in report */}
                    {sections.notes && report.notes.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                        <p className="text-xs font-semibold text-[#1A2128] mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Clinical Notes
                        </p>
                        <div className="space-y-3">
                          {report.notes.map((n, i) => (
                            <div key={i} className="py-1.5 border-b border-gray-50 last:border-0">
                              <p className="text-xs text-[#434D56] leading-relaxed">{n.text}</p>
                              <p className="text-[10px] text-[#A9B2B9] mt-1">{n.date} · {n.author}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming Tasks */}
                    {report.upcomingTasks.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                        <p className="text-xs font-semibold text-[#1A2128] mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Upcoming Tasks
                        </p>
                        <ul className="space-y-1.5">
                          {report.upcomingTasks.map((task, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-[#434D56]">
                              <div className="w-4 h-4 rounded border-2 border-[#D9DEE2] flex-shrink-0 mt-0.5" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="text-center py-3">
                      <p className="text-[10px] text-[#A9B2B9]">Generated by FitPlus · {today} · Confidential</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
