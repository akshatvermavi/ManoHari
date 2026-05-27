'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { UserPlus, ToggleLeft, ToggleRight, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' })
  const [creating, setCreating] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => adminApi.getUsers({ page, size: 20 }).then((r) => r.data.data),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User status updated') },
  })

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await adminApi.createAdmin(adminForm)
      toast.success(`Admin ${adminForm.email} created!`)
      setShowCreateAdmin(false)
      setAdminForm({ name: '', email: '', password: '' })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create admin')
    } finally { setCreating(false) }
  }

  const users = data?.content || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.totalElements || 0} registered users</p>
        </div>
        <button onClick={() => setShowCreateAdmin(true)} className="btn-primary flex items-center gap-2 text-sm">
          <UserPlus size={16} /> Create Admin
        </button>
      </div>

      {/* Create Admin modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Shield size={20} className="text-gold" />
              <h2 className="font-bold text-lg text-primary">Create New Admin</h2>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                <input value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} required className="input-field" placeholder="Admin name" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                <input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required className="input-field" placeholder="admin@manohari.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                <input type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required minLength={8} className="input-field" placeholder="Min 8 characters" />
              </div>
              <p className="text-xs text-gray-400 bg-blue-50 p-3 rounded-lg">⚠️ Only SUPER_ADMIN can create new admins. This admin will have full product and order management access.</p>
              <div className="flex gap-3">
                <button type="submit" disabled={creating} className="flex-1 btn-primary">
                  {creating ? 'Creating...' : 'Create Admin'}
                </button>
                <button type="button" onClick={() => setShowCreateAdmin(false)} className="btn-outline px-5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['User', 'Contact', 'Role', 'Verified', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No users found</td></tr>
              ) : users.map((user: any) => (
                <tr key={user.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {user.profileImage
                        ? <Image src={user.profileImage} alt={user.name} width={36} height={36} className="rounded-full w-9 h-9 object-cover" />
                        : <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center font-bold text-primary">{user.name?.[0]}</div>
                      }
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    <div>{user.email}</div>
                    {user.phoneNumber && <div>{user.phoneNumber}</div>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${user.role === 'SUPER_ADMIN' ? 'bg-gold/20 text-gold-dark' : user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-0.5">
                      {user.email && <span className={`text-xs ${user.emailVerified ? 'text-green-600' : 'text-gray-400'}`}>{user.emailVerified ? '✓' : '✗'} Email</span>}
                      {user.phoneNumber && <span className={`text-xs ${user.phoneVerified ? 'text-green-600' : 'text-gray-400'}`}>{user.phoneVerified ? '✓' : '✗'} Phone</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.active ? 'Active' : 'Blocked'}</span>
                  </td>
                  <td className="px-5 py-3">
                    {user.role !== 'SUPER_ADMIN' && (
                      <button onClick={() => { if (confirm('Toggle user status?')) toggleMutation.mutate(user.id) }}
                        className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors ${user.active ? 'text-green-500' : 'text-red-400'}`}>
                        {user.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40">Prev</button>
            <span className="px-3 py-1.5 text-sm text-gray-500">Page {page + 1} of {data.totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= data.totalPages - 1} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
