import { useState } from 'react'
import { Input, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

// FitPlus cross/plus SVG icon — matches the Figma blue medical cross
function FitPlusIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Vertical bar of cross */}
      <rect x="13" y="3" width="10" height="30" rx="5" fill="#3C5DB7" />
      {/* Horizontal bar of cross */}
      <rect x="3" y="13" width="30" height="10" rx="5" fill="#3C5DB7" />
      {/* Center overlap highlight */}
      <rect x="13" y="13" width="10" height="10" rx="2" fill="#5B7FE0" />
    </svg>
  )
}

// Phone icon matching Figma design
function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400">
      <path
        d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.39 21 3 13.61 3 4.5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.21 2.2z"
        fill="currentColor"
      />
    </svg>
  )
}

// Send icon matching Figma
function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#A9B2B9" />
    </svg>
  )
}

export default function SignIn() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendOTP = () => {
    if (!phone) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
    }, 900)
  }

  const handleVerifyOTP = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/')
    }, 800)
  }

  const isActive = step === 'phone' ? phone.length >= 10 : otp.length === 6

  return (
    <div className="flex h-screen w-full bg-[#F0F2F5]">

      {/* ── LEFT: Hero image ──────────────────────────────────────────────── */}
      <div className="hidden md:block relative w-1/2 overflow-hidden">
        <img
          src="https://www.figma.com/api/mcp/asset/f03d6703-b890-4302-9647-78cf67f151c5"
          alt="FitPlus — healthcare delivery"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // fallback to unsplash if figma asset expires
            const t = e.currentTarget
            t.onerror = null
            t.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1024&fit=crop'
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Watermark FitPlus logo on photo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="opacity-30">
            <svg width="220" height="220" viewBox="0 0 36 36" fill="none">
              <rect x="13" y="3" width="10" height="30" rx="5" fill="white" />
              <rect x="3" y="13" width="30" height="10" rx="5" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Sign in card ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-10 py-10 bg-[#F0F2F5]">
        <div
          className="bg-white rounded-xl w-full flex flex-col justify-between"
          style={{
            maxWidth: 560,
            minHeight: 600,
            padding: 64,
            boxShadow: '0px 6px 12px 0px rgba(28, 39, 49, 0.05)',
          }}
        >
          {/* Top section */}
          <div className="flex flex-col gap-16">

            {/* FitPlus Logo */}
            <div className="flex items-center gap-2">
              <FitPlusIcon size={34} />
              <span
                className="font-medium text-[#48494A]"
                style={{ fontSize: 36, fontFamily: 'Inter, sans-serif', lineHeight: 1 }}
              >
                FitPlus
              </span>
            </div>

            {/* Tagline */}
            <p
              className="text-black leading-8"
              style={{ fontSize: 24, fontFamily: 'Lato, Inter, sans-serif', fontWeight: 400 }}
            >
              Building the Future of<br />Healthcare Delivery
            </p>

            {/* Form */}
            <div className="flex flex-col gap-4">
              <p
                className="font-bold text-[#434D56]"
                style={{ fontSize: 14, lineHeight: '20px' }}
              >
                Sign In
              </p>

              {step === 'phone' ? (
                <>
                  {/* Phone input */}
                  <div
                    className="flex items-center gap-2 border border-[#D9DEE2] rounded-[10px] px-3"
                    style={{ height: 48, width: '100%' }}
                  >
                    <PhoneIcon />
                    <input
                      type="tel"
                      placeholder="Registered Mobile Number"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      className="flex-1 outline-none text-gray-800 placeholder-[#7B858F] bg-transparent"
                      style={{ fontSize: 16, fontFamily: 'Inter, sans-serif' }}
                      onKeyDown={e => e.key === 'Enter' && isActive && handleSendOTP()}
                    />
                  </div>

                  {/* Send OTP button */}
                  <button
                    onClick={handleSendOTP}
                    disabled={!isActive || loading}
                    className="flex items-center justify-center gap-2 rounded-[10px] transition-all"
                    style={{
                      height: 50,
                      background: isActive ? '#1B2559' : '#EEF1F3',
                      cursor: isActive ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <SendIcon />
                    <span
                      className="font-semibold"
                      style={{
                        fontSize: 15,
                        color: isActive ? 'white' : '#A9B2B9',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {loading ? 'Sending…' : 'Send OTP'}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {/* Phone display */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <PhoneIcon />
                    <span className="font-medium text-gray-700">+91 {phone}</span>
                    <button
                      onClick={() => { setStep('phone'); setOtp('') }}
                      className="text-brand-blue text-xs underline ml-1"
                    >
                      Change
                    </button>
                  </div>

                  {/* OTP input */}
                  <div
                    className="flex items-center gap-2 border border-[#D9DEE2] rounded-[10px] px-3"
                    style={{ height: 48 }}
                  >
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="flex-1 outline-none text-gray-800 placeholder-[#7B858F] bg-transparent tracking-widest"
                      style={{ fontSize: 16, fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em' }}
                      onKeyDown={e => e.key === 'Enter' && isActive && handleVerifyOTP()}
                      autoFocus
                    />
                  </div>

                  {/* Verify button */}
                  <button
                    onClick={handleVerifyOTP}
                    disabled={!isActive || loading}
                    className="flex items-center justify-center gap-2 rounded-[10px] transition-all"
                    style={{
                      height: 50,
                      background: isActive ? '#1B2559' : '#EEF1F3',
                      cursor: isActive ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <span
                      className="font-semibold"
                      style={{
                        fontSize: 15,
                        color: isActive ? 'white' : '#A9B2B9',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {loading ? 'Verifying…' : 'Verify & Sign In'}
                    </span>
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    Didn't receive OTP?{' '}
                    <button
                      onClick={() => { setStep('phone'); handleSendOTP() }}
                      className="text-brand-blue underline"
                    >
                      Resend
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-[14px] text-black leading-5">to know more about us visit</p>
            <a
              href="https://www.fitplus.com/"
              className="text-[#3C5DB7] text-[14px] leading-5 hover:underline"
            >
              https://www.fitplus.com/
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
