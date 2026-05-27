'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  LogOut, Menu, X, ChevronRight, Store
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/users', icon: Users, label: 'Users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isAdmin, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    if (!isAdmin) { router.push('/'); return }
  }, [isAuthenticated, isAdmin])

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-primary text-white flex flex-col transition-all duration-300 fixed top-0 left-0 h-full z-40`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gold rounded-lg flex items-center justify-center">
                <span className="font-display font-bold text-primary text-sm">M</span>
              </div>
              <span className="font-display font-bold text-gold">ManoHari</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/60 hover:text-white ml-auto">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Admin Panel</p>
          </div>
        )}

        <nav className="flex-1 p-2 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${active ? 'bg-gold text-primary' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <item.icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-white/10 space-y-1">
          <Link href="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white text-sm transition-all`}>
            <Store size={18} />
            {sidebarOpen && <span>View Store</span>}
          </Link>
          <button onClick={() => { logout(); router.push('/') }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-all">
            <LogOut size={18} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-60' : 'ml-16'} transition-all duration-300`}>
        <div className="min-h-screen p-6">{children}</div>
      </main>
    </div>
  )
}
