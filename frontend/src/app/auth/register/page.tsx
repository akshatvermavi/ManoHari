'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'email' | 'phone'>('email')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setLoading(true)
    try {
      if (mode === 'email') {
        await authApi.registerEmail({ name: form.name, email: form.email, password: form.password })
        router.push(`/auth/verify-otp?type=email&identifier=${encodeURIComponent(form.email)}`)
        toast.success('OTP sent to your email!')
      } else {
        await authApi.registerPhone({ name: form.name, phoneNumber: form.phone, password: form.password })
        router.push(`/auth/verify-otp?type=phone&identifier=${encodeURIComponent(form.phone)}`)
        toast.success('OTP sent to your phone!')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleGoogleSignup = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-[#0f3460] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center mb-2">
              <span className="font-display font-bold text-2xl text-primary">M</span>
            </div>
            <span className="text-white font-display font-bold text-3xl">ManoHari</span>
          </Link>
          <p className="text-white/60 text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-primary mb-6">Sign Up</h2>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            {(['email', 'phone'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 text-sm py-2 rounded-md font-medium transition-all capitalize ${mode === m ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>
                {m === 'email' ? '📧 Email' : '📱 Phone'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)}
                className="input-field" placeholder="Your name" required />
            </div>

            {mode === 'email' ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                  className="input-field" placeholder="you@example.com" required />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600">+91</span>
                  <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                    className="input-field flex-1" placeholder="10-digit number" maxLength={10} required />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  className="input-field pr-10" placeholder="Min. 8 characters" minLength={8} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
          </div>

          <button onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
