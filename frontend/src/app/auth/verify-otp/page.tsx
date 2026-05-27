'use client'
import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function VerifyOtpPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const type = searchParams.get('type') || 'email'
  const identifier = searchParams.get('identifier') || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const newOtp = [...otp]
    newOtp[index] = val.slice(-1)
    setOtp(newOtp)
    if (val && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) refs.current[index - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      refs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) { toast.error('Enter complete OTP'); return }
    setLoading(true)
    try {
      let res
      if (type === 'email') {
        res = await authApi.verifyEmail({ email: identifier, otp: otpString })
      } else {
        res = await authApi.verifyPhone({ phoneNumber: identifier, otp: otpString })
      }
      const { user, accessToken, refreshToken } = res.data.data
      setAuth(user, accessToken, refreshToken)
      toast.success('Verified successfully!')
      router.push('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    try {
      await authApi.resendOtp(identifier, type)
      setCountdown(60)
      toast.success('OTP resent!')
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-[#0f3460] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-2">
            <span className="font-display font-bold text-2xl text-primary">M</span>
          </div>
          <h1 className="text-white font-display font-bold text-3xl">ManoHari</h1>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="text-5xl mb-4">{type === 'email' ? '📧' : '📱'}</div>
          <h2 className="text-xl font-bold text-primary mb-2">Verify Your {type === 'email' ? 'Email' : 'Phone'}</h2>
          <p className="text-gray-500 text-sm mb-1">
            We sent a 6-digit OTP to
          </p>
          <p className="text-primary font-semibold mb-6">{identifier}</p>

          {/* OTP input boxes */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all ${digit ? 'border-gold bg-gold/5' : 'border-gray-200'} focus:border-gold`}
              />
            ))}
          </div>

          <button onClick={handleVerify} disabled={loading || otp.join('').length < 6}
            className="w-full btn-primary mb-4">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-sm text-gray-500">
            Didn't receive?{' '}
            {countdown > 0 ? (
              <span className="text-gray-400">Resend in {countdown}s</span>
            ) : (
              <button onClick={handleResend} className="text-primary font-semibold hover:underline">Resend OTP</button>
            )}
          </div>

          <Link href="/auth/login" className="block text-xs text-gray-400 mt-4 hover:text-gray-600">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
