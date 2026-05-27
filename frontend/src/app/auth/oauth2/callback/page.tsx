'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { userApi } from '@/lib/api'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function OAuth2CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refreshToken')
    const error = searchParams.get('error')

    if (error) {
      toast.error('Google sign-in failed')
      router.push('/auth/login')
      return
    }

    if (token && refreshToken) {
      Cookies.set('accessToken', token, { expires: 1 })
      Cookies.set('refreshToken', refreshToken, { expires: 7 })

      userApi.getProfile()
        .then((res) => {
          setAuth(res.data.data, token, refreshToken)
          toast.success('Signed in with Google!')
          router.push('/')
        })
        .catch(() => {
          toast.error('Failed to load profile')
          router.push('/auth/login')
        })
    } else {
      router.push('/auth/login')
    }
  }, [])

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-12 h-12 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gold font-semibold">Signing you in...</p>
      </div>
    </div>
  )
}
