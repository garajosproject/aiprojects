import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Upload } from 'lucide-react'
import Header from '../../components/layout/Header'
import { patients } from '../../data/mock'

const inputCls = 'w-full border border-[#D9DEE2] rounded-lg px-3 py-2.5 text-sm text-[#1A2128] placeholder:text-[#A9B2B9] focus:outline-none focus:border-[#133696] transition-colors'

export default function UploadReportForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const patient = patients.find(p => p.slug === slug) ?? patients[0]

  const [reportName, setReportName] = useState('')
  const [description, setDescription] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
  }

  function handleUpload() {
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
            <span className="text-gray-700 font-medium">Upload Report</span>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-5 bg-[#EEF1F3]">
        <h1 className="text-base font-bold text-[#133696] mb-4">Upload Report</h1>

        <div className="bg-white rounded-lg border border-[#D9DEE2] p-6 space-y-5">

          {/* Report Name + Upload Document */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434D56]">Report Name</label>
              <input
                className={inputCls}
                placeholder="Drink Water"
                value={reportName}
                onChange={e => setReportName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434D56]">Goal type</label>
              <label className="flex items-center gap-2 px-4 py-2.5 border border-[#D9DEE2] rounded-lg text-sm font-medium text-[#434D56] cursor-pointer hover:border-[#133696] hover:text-[#133696] transition-colors w-fit">
                <Upload size={15} />
                {fileName ? fileName : 'Upload Document'}
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {/* Description Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434D56]">Description Note</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={4}
              placeholder="Result of report"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Upload Result */}
          <button
            onClick={handleUpload}
            className="w-full py-3 rounded-lg bg-[#133696] text-white font-semibold text-sm hover:bg-[#0f2a7a] transition-colors"
          >
            Upload Result
          </button>
        </div>
      </div>
    </div>
  )
}
