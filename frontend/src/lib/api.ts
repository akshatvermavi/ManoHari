// import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
// import Cookies from 'js-cookie'
// import toast from 'react-hot-toast'

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

// const api: AxiosInstance = axios.create({
//   baseURL: API_URL,
//   headers: { 'Content-Type': 'application/json' },
// })

// api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//   const token = Cookies.get('accessToken')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const original = error.config
//     if (error.response?.status === 401 && !original._retry) {
//       original._retry = true
//       const refreshToken = Cookies.get('refreshToken')
//       if (refreshToken) {
//         try {
//           const res = await axios.post(`${API_URL}/auth/refresh-token?refreshToken=${refreshToken}`)
//           const { accessToken } = res.data.data
//           Cookies.set('accessToken', accessToken, { expires: 1 })
//           original.headers.Authorization = `Bearer ${accessToken}`
//           return api(original)
//         } catch {
//           Cookies.remove('accessToken')
//           Cookies.remove('refreshToken')
//           window.location.href = '/auth/login'
//         }
//       }
//     }
//     const message = error.response?.data?.message || 'Something went wrong'
//     if (error.response?.status !== 401) toast.error(message)
//     return Promise.reject(error)
//   }
// )

// export default api

// // ─── Auth ───
// export const authApi = {
//   registerEmail: (data: any) => api.post('/auth/register/email', data),
//   verifyEmail: (data: any) => api.post('/auth/verify/email-otp', data),
//   registerPhone: (data: any) => api.post('/auth/register/phone', data),
//   verifyPhone: (data: any) => api.post('/auth/verify/phone-otp', data),
//   login: (data: any) => api.post('/auth/login', data),
//   sendPhoneOtp: (phone: string) => api.post(`/auth/send-otp/phone?phoneNumber=${phone}`),
//   loginPhoneOtp: (data: any) => api.post('/auth/login/phone-otp', data),
//   forgotPassword: (email: string) => api.post(`/auth/forgot-password?email=${email}`),
//   resetPassword: (data: any) => api.post('/auth/reset-password', data),
//   resendOtp: (identifier: string, type: string) =>
//     api.post(`/auth/resend-otp?identifier=${identifier}&type=${type}`),
// }

// // ─── Products ───
// export const productApi = {
//   getAll: (params?: any) => api.get('/products', { params }),
//   getById: (id: string) => api.get(`/products/${id}`),
//   getFeatured: () => api.get('/products/featured'),
//   getNewArrivals: () => api.get('/products/new-arrivals'),
//   getByCategory: (category: string, params?: any) =>
//     api.get(`/products/category/${category}`, { params }),
// }

// // ─── Search ───
// export const searchApi = {
//   search: (q: string, page = 0, size = 20) =>
//     api.get('/search', { params: { q, page, size } }),
//   suggestions: (q: string) => api.get('/search/suggestions', { params: { q } }),
//   suggestProducts: (q: string, limit = 6) =>
//     api.get('/search/suggest-products', { params: { q, limit } }),
// }

// // ─── Cart ───
// export const cartApi = {
//   get: () => api.get('/cart'),
//   add: (data: any) => api.post('/cart/add', data),
//   update: (productId: string, quantity: number, color?: string, size?: string) =>
//     api.put(`/cart/update/${productId}`, null, { params: { quantity, color, size } }),
//   remove: (productId: string, color?: string, size?: string) =>
//     api.delete(`/cart/remove/${productId}`, { params: { color, size } }),
//   clear: () => api.delete('/cart/clear'),
// }

// // ─── Orders ───
// export const orderApi = {
//   create: (data: any) => api.post('/orders', data),
//   verifyPayment: (data: any) => api.post('/orders/verify-payment', data),
//   getAll: (page = 0, size = 10) => api.get('/orders', { params: { page, size } }),
//   getById: (id: string) => api.get(`/orders/${id}`),
//   cancel: (id: string) => api.post(`/orders/${id}/cancel`),
// }

// // ─── User ───
// export const userApi = {
//   getProfile: () => api.get('/users/me'),
//   updateProfile: (data: any) => api.put('/users/me', data),
//   updateAvatar: (file: File) => {
//     const form = new FormData()
//     form.append('file', file)
//     return api.post('/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
//   },
//   getAddresses: () => api.get('/users/me/addresses'),
//   addAddress: (data: any) => api.post('/users/me/addresses', data),
//   updateAddress: (id: string, data: any) => api.put(`/users/me/addresses/${id}`, data),
//   deleteAddress: (id: string) => api.delete(`/users/me/addresses/${id}`),
// }

// // ─── Admin ───
// export const adminApi = {
//   getDashboard: () => api.get('/admin/dashboard/stats'),
//   getProducts: (params?: any) => api.get('/admin/products', { params }),
//   createProduct: (formData: FormData) =>
//     api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
//   updateProduct: (id: string, formData: FormData) =>
//     api.put(`/admin/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
//   deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
//   toggleProduct: (id: string) => api.patch(`/admin/products/${id}/toggle`),
//   getOrders: (params?: any) => api.get('/admin/orders', { params }),
//   updateOrderStatus: (id: string, status: string, message?: string) =>
//     api.patch(`/admin/orders/${id}/status`, null, { params: { status, message } }),
//   getUsers: (params?: any) => api.get('/admin/users', { params }),
//   toggleUser: (id: string) => api.patch(`/admin/users/${id}/status`),
//   createAdmin: (data: any) => api.post('/admin/create-admin', data),
// }

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios'

import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ================= REQUEST INTERCEPTOR =================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('accessToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ================= RESPONSE INTERCEPTOR =================

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config

    // Handle 401
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      const refreshToken = Cookies.get('refreshToken')

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_URL}/auth/refresh-token`,
            null,
            {
              params: { refreshToken },
            }
          )

          const accessToken = response.data?.data?.accessToken

          if (accessToken) {
            Cookies.set('accessToken', accessToken, {
              expires: 1,
            })

            originalRequest.headers.Authorization = `Bearer ${accessToken}`

            return api(originalRequest)
          }
        } catch (refreshError) {
          Cookies.remove('accessToken')
          Cookies.remove('refreshToken')

          // Prevent SSR issue
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }

          return Promise.reject(refreshError)
        }
      }
    }

    // Error Toast
    const message =
      error.response?.data?.message || 'Something went wrong'

    if (error.response?.status !== 401) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api

// ================= AUTH =================

export const authApi = {
  registerEmail: (data: any) =>
    api.post('/auth/register/email', data),

  verifyEmail: (data: any) =>
    api.post('/auth/verify/email-otp', data),

  registerPhone: (data: any) =>
    api.post('/auth/register/phone', data),

  verifyPhone: (data: any) =>
    api.post('/auth/verify/phone-otp', data),

  login: (data: any) =>
    api.post('/auth/login', data),

  sendPhoneOtp: (phone: string) =>
    api.post('/auth/send-otp/phone', null, {
      params: { phoneNumber: phone },
    }),

  loginPhoneOtp: (data: any) =>
    api.post('/auth/login/phone-otp', data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', null, {
      params: { email },
    }),

  resetPassword: (data: any) =>
    api.post('/auth/reset-password', data),

  resendOtp: (identifier: string, type: string) =>
    api.post('/auth/resend-otp', null, {
      params: { identifier, type },
    }),
}

// ================= PRODUCTS =================

export const productApi = {
  getAll: (params?: any) =>
    api.get('/products', { params }),

  getById: (id: string) =>
    api.get(`/products/${id}`),

  getFeatured: () =>
    api.get('/products/featured'),

  getNewArrivals: () =>
    api.get('/products/new-arrivals'),

  getByCategory: (category: string, params?: any) =>
    api.get(`/products/category/${category}`, { params }),
}

// ================= SEARCH =================

export const searchApi = {
  search: (q: string, page = 0, size = 20) =>
    api.get('/search', {
      params: { q, page, size },
    }),

  suggestions: (q: string) =>
    api.get('/search/suggestions', {
      params: { q },
    }),

  suggestProducts: (q: string, limit = 6) =>
    api.get('/search/suggest-products', {
      params: { q, limit },
    }),
}

// ================= CART =================

export const cartApi = {
  get: () => api.get('/cart'),

  add: (data: any) =>
    api.post('/cart/add', data),

  update: (
    productId: string,
    quantity: number,
    color?: string,
    size?: string
  ) =>
    api.put(`/cart/update/${productId}`, null, {
      params: { quantity, color, size },
    }),

  remove: (
    productId: string,
    color?: string,
    size?: string
  ) =>
    api.delete(`/cart/remove/${productId}`, {
      params: { color, size },
    }),

  clear: () =>
    api.delete('/cart/clear'),
}

// ================= ORDERS =================

export const orderApi = {
  create: (data: any) =>
    api.post('/orders', data),

  verifyPayment: (data: any) =>
    api.post('/orders/verify-payment', data),

  getAll: (page = 0, size = 10) =>
    api.get('/orders', {
      params: { page, size },
    }),

  getById: (id: string) =>
    api.get(`/orders/${id}`),

  cancel: (id: string) =>
    api.post(`/orders/${id}/cancel`),
}

// ================= USER =================

export const userApi = {
  getProfile: () =>
    api.get('/users/me'),

  updateProfile: (data: any) =>
    api.put('/users/me', data),

  updateAvatar: (file: File) => {
    const formData = new FormData()

    formData.append('file', file)

    return api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  getAddresses: () =>
    api.get('/users/me/addresses'),

  addAddress: (data: any) =>
    api.post('/users/me/addresses', data),

  updateAddress: (id: string, data: any) =>
    api.put(`/users/me/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    api.delete(`/users/me/addresses/${id}`),
}

// ================= ADMIN =================

export const adminApi = {
  getDashboard: () =>
    api.get('/admin/dashboard/stats'),

  getProducts: (params?: any) =>
    api.get('/admin/products', { params }),

  createProduct: (formData: FormData) =>
    api.post('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updateProduct: (id: string, formData: FormData) =>
    api.put(`/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteProduct: (id: string) =>
    api.delete(`/admin/products/${id}`),

  toggleProduct: (id: string) =>
    api.patch(`/admin/products/${id}/toggle`),

  getOrders: (params?: any) =>
    api.get('/admin/orders', { params }),

  updateOrderStatus: (
    id: string,
    status: string,
    message?: string
  ) =>
    api.patch(`/admin/orders/${id}/status`, null, {
      params: { status, message },
    }),

  getUsers: (params?: any) =>
    api.get('/admin/users', { params }),

  toggleUser: (id: string) =>
    api.patch(`/admin/users/${id}/status`),

  createAdmin: (data: any) =>
    api.post('/admin/create-admin', data),
}