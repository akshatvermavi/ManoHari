'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  identifier: z.string().min(1, 'Email or phone required'),
  password: z.string().min(1, 'Password required'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password')
  const [otpSent, setOtpSent] = useState(false)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      const { user, accessToken, refreshToken } = res.data.data
      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome back, ${user.name}!`)
      router.push(user.role !== 'USER' ? '/admin/dashboard' : '/')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleSendOtp = async () => {
    if (!phone) { toast.error('Enter phone number'); return }
    setLoading(true)
    try {
      await authApi.sendPhoneOtp(phone)
      setOtpSent(true)
      toast.success('OTP sent!')
    } catch {} finally { setLoading(false) }
  }

  const handleOtpLogin = async () => {
    setLoading(true)
    try {
      const res = await authApi.loginPhoneOtp({ phoneNumber: phone, otp })
      const { user, accessToken, refreshToken } = res.data.data
      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome back, ${user.name}!`)
      router.push('/')
    } catch {} finally { setLoading(false) }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-[#0f3460] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="font-display font-bold text-2xl text-primary">M</span>
          </div>
          <h1 className="text-white font-display font-bold text-3xl">ManoHari</h1>
          <p className="text-white/60 text-sm mt-1">Fashion & Lifestyle</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-primary mb-6">Sign In</h2>

          {/* Mode tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button onClick={() => setLoginMode('password')}
              className={`flex-1 text-sm py-2 rounded-md font-medium transition-all ${loginMode === 'password' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>
              Password
            </button>
            <button onClick={() => setLoginMode('otp')}
              className={`flex-1 text-sm py-2 rounded-md font-medium transition-all ${loginMode === 'otp' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>
              OTP Login
            </button>
          </div>

          {loginMode === 'password' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email or Phone</label>
                <input {...register('identifier')} className="input-field" placeholder="Enter email or phone" />
                {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                <div className="relative">
                  <input {...register('password')} type={showPass ? 'text' : 'password'} className="input-field pr-10" placeholder="Enter password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-xs text-gold hover:underline">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600">+91</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="input-field flex-1" placeholder="10-digit number" />
                </div>
              </div>
              {otpSent && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Enter OTP</label>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                    maxLength={6} className="input-field tracking-[0.5em] text-center font-bold text-lg" placeholder="● ● ● ● ● ●" />
                </div>
              )}
              {!otpSent ? (
                <button onClick={handleSendOtp} disabled={loading} className="w-full btn-primary">
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              ) : (
                <button onClick={handleOtpLogin} disabled={loading} className="w-full btn-primary">
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              )}
            </div>
          )}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or continue with</span>
            </div>
          </div>

          <button onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
