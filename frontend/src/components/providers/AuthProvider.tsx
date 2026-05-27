// 'use client'
// import { useEffect } from 'react'
// import { useAuthStore } from '@/store/authStore'
// import { userApi } from '@/lib/api'
// import Cookies from 'js-cookie'

// export default function AuthProvider({ children }: { children: React.ReactNode }) {
//   const { setAuth, logout, user } = useAuthStore()

//   useEffect(() => {
//     const token = Cookies.get('accessToken')
//     if (token && !user) {
//       userApi.getProfile()
//         .then((res) => {
//           const { data } = res.data
//           setAuth(data, token, Cookies.get('refreshToken') || '')
//         })
//         .catch(() => logout())
//     }
//   }, [])

//   return <>{children}</>
// }
'use client'

import { ReactNode, useEffect } from 'react'
import Cookies from 'js-cookie'

import { useAuthStore } from '@/store/authStore'
import { userApi } from '@/lib/api'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const { setAuth, logout, user } = useAuthStore()

  useEffect(() => {
    const token = Cookies.get('accessToken')
    const refreshToken = Cookies.get('refreshToken')

    if (!token || user) return

    const fetchProfile = async () => {
      try {
        const res = await userApi.getProfile()

        // adjust according to backend response
        const userData = res?.data?.data || res?.data

        setAuth(userData, token, refreshToken || '')
      } catch (error) {
        console.error('Auth Error:', error)
        logout()
      }
    }

    fetchProfile()
  }, [setAuth, logout, user])

  return <>{children}</>
}