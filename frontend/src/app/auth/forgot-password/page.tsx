'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setStep('otp')
      toast.success('OTP sent to your email')
    } catch {} finally { setLoading(false) }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await authApi.resetPassword({ identifier: email, otp, newPassword })
      toast.success('Password reset successfully!')
      router.push('/auth/login')
    } catch {} finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-[#0f3460] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-2">
            <span className="font-display font-bold text-2xl text-primary">M</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{step === 'email' ? '🔒' : step === 'otp' ? '📧' : '🔑'}</div>
            <h2 className="text-xl font-bold text-primary">
              {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Verify OTP' : 'New Password'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 'email' ? "Enter your email to receive a reset OTP" : step === 'otp' ? `OTP sent to ${email}` : 'Enter your new password'}
            </p>
          </div>

          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="your@email.com" />
              <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Sending...' : 'Send OTP'}</button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('reset') }} className="space-y-4">
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required className="input-field text-center tracking-[0.5em] font-bold text-lg" placeholder="Enter 6-digit OTP" />
              <button type="submit" className="w-full btn-primary">Verify OTP</button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required className="input-field" placeholder="New password (min 8 chars)" />
              <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Resetting...' : 'Reset Password'}</button>
            </form>
          )}

          <Link href="/auth/login" className="block text-center text-sm text-gray-400 mt-5 hover:text-gray-600">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
