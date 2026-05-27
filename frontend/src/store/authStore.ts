// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
// import Cookies from 'js-cookie'

// interface User {
//   id: string
//   name: string
//   email?: string
//   phoneNumber?: string
//   profileImage?: string
//   role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
//   emailVerified: boolean
//   phoneVerified: boolean
// }

// interface AuthState {
//   user: User | null
//   accessToken: string | null
//   isAuthenticated: boolean
//   isAdmin: boolean
//   setAuth: (user: User, accessToken: string, refreshToken: string) => void
//   updateUser: (user: Partial<User>) => void
//   logout: () => void
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       user: null,
//       accessToken: null,
//       isAuthenticated: false,
//       isAdmin: false,

//       setAuth: (user, accessToken, refreshToken) => {
//         Cookies.set('accessToken', accessToken, { expires: 1 })
//         Cookies.set('refreshToken', refreshToken, { expires: 7 })
//         set({
//           user,
//           accessToken,
//           isAuthenticated: true,
//           isAdmin: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
//         })
//       },

//       updateUser: (partial) =>
//         set((state) => ({
//           user: state.user ? { ...state.user, ...partial } : null,
//         })),

//       logout: () => {
//         Cookies.remove('accessToken')
//         Cookies.remove('refreshToken')
//         set({ user: null, accessToken: null, isAuthenticated: false, isAdmin: false })
//       },
//     }),
//     { name: 'manohari-auth', partialize: (state) => ({ user: state.user, isAdmin: state.isAdmin }) }
//   )
// )

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
  id: string
  name: string
  email?: string
  phoneNumber?: string
  profileImage?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  emailVerified: boolean
  phoneVerified: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isAdmin: boolean

  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string
  ) => void

  updateUser: (user: Partial<User>) => void

  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAdmin: false,

      setAuth: (user, accessToken, refreshToken) => {
        Cookies.set('accessToken', accessToken, {
          expires: 1,
        })

        Cookies.set('refreshToken', refreshToken, {
          expires: 7,
        })

        set({
          user,
          accessToken,
          isAuthenticated: true,
          isAdmin:
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN',
        })
      },

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...partialUser,
              }
            : null,
        })),

      logout: () => {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isAdmin: false,
        })
      },
    }),

    {
      name: 'manohari-auth',

      partialize: (state) => ({
        user: state.user,
        isAdmin: state.isAdmin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)