'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Image from 'next/image'
import { Camera, User, MapPin, Package, LogOut, Edit2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, user: authUser, updateUser, logout } = useAuthStore()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '' })

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile().then((r) => r.data.data),
    enabled: isAuthenticated,
    onSuccess: (data: any) => {
      setForm({ name: data.name || '', email: data.email || '', phoneNumber: data.phoneNumber || '' })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => userApi.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data.data)
      qc.invalidateQueries({ queryKey: ['profile'] })
      setEditing(false)
      toast.success('Profile updated!')
    }
  })

  const avatarMutation = useMutation({
    mutationFn: (file: File) => userApi.updateAvatar(file),
    onSuccess: (res) => {
      updateUser({ profileImage: res.data.data })
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile photo updated!')
    }
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) avatarMutation.mutate(file)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
    toast.success('Signed out')
  }

  if (!isAuthenticated) { router.push('/auth/login'); return null }

  const p = profile || authUser

  return (
    <ShopLayout>
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="card p-6 text-center">
              <div className="relative inline-block mb-3">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gold/20 mx-auto">
                  {p?.profileImage
                    ? <Image src={p.profileImage} alt={p.name} width={80} height={80} className="object-cover w-full h-full" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{p?.name?.[0]?.toUpperCase()}</span>
                      </div>
                  }
                </div>
                <button onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-light transition-colors">
                  <Camera size={13} className="text-white" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <p className="font-bold text-gray-800">{p?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{p?.email || p?.phoneNumber}</p>
              <span className={`badge mt-2 ${p?.role === 'USER' ? 'bg-blue-100 text-blue-700' : 'bg-gold/20 text-gold-dark'}`}>
                {p?.role}
              </span>
            </div>

            <div className="card mt-3 overflow-hidden">
              {[
                { href: '/profile', icon: User, label: 'My Profile', active: true },
                { href: '/orders', icon: Package, label: 'My Orders', active: false },
                { href: '/profile#addresses', icon: MapPin, label: 'Addresses', active: false },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b last:border-b-0 transition-colors ${item.active ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon size={16} /> {item.label}
                </Link>
              ))}
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-3 space-y-5">

            {/* Personal Info */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-800 text-lg">Personal Information</h2>
                {!editing
                  ? <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"><Edit2 size={14} /> Edit</button>
                  : <div className="flex gap-2">
                      <button onClick={() => updateMutation.mutate(form)} className="flex items-center gap-1 text-sm bg-primary text-white px-3 py-1.5 rounded-lg"><Check size={14} /> Save</button>
                      <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm border border-gray-300 px-3 py-1.5 rounded-lg"><X size={14} /> Cancel</button>
                    </div>
                }
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', value: form.name },
                  { label: 'Email Address', key: 'email', type: 'email', value: form.email },
                  { label: 'Phone Number', key: 'phoneNumber', type: 'tel', value: form.phoneNumber },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">{field.label}</label>
                    {editing
                      ? <input type={field.type} value={field.value}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          className="input-field" />
                      : <p className="text-sm font-medium text-gray-800 py-2.5">
                          {(p as any)?.[field.key] || <span className="text-gray-300">Not set</span>}
                        </p>
                    }
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Account Type</label>
                  <p className="text-sm font-medium text-gray-800 py-2.5 capitalize">
                    {p?.role?.toLowerCase()}
                    {(p as any)?.authProvider === 'GOOGLE' && <span className="ml-2 text-xs text-gray-400">(via Google)</span>}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${p?.emailVerified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {p?.emailVerified ? '✓' : '!'} Email {p?.emailVerified ? 'Verified' : 'Not Verified'}
                </div>
                <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${p?.phoneVerified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {p?.phoneVerified ? '✓' : '!'} Phone {p?.phoneVerified ? 'Verified' : 'Not Verified'}
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="card p-6" id="addresses">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2"><MapPin size={18} /> Saved Addresses</h2>
                <Link href="/checkout" className="text-sm text-primary font-medium hover:underline">Manage Addresses</Link>
              </div>
              {p?.addresses?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No saved addresses</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {p?.addresses?.map((addr: any) => (
                    <div key={addr.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex justify-between mb-1">
                        <p className="font-semibold text-sm text-gray-800">{addr.fullName}</p>
                        {addr.isDefault && <span className="badge bg-green-100 text-green-700 text-xs">Default</span>}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">📞 {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
