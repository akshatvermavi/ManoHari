'use client'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Package, ShoppingCart, Users, IndianRupee, TrendingUp, Clock, CheckCircle, Truck } from 'lucide-react'
import Link from 'next/link'

const StatCard = ({ title, value, icon: Icon, color, sub }: any) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-primary mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
)

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard().then((r) => r.data.data),
    refetchInterval: 30000,
  })

  if (isLoading) return (
    <div>
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    </div>
  )

  const STATUS_ORDER_CARDS = [
    { title: 'Pending', value: stats?.pendingOrders, icon: Clock, color: 'bg-yellow-500' },
    { title: 'Confirmed', value: stats?.confirmedOrders, icon: CheckCircle, color: 'bg-blue-500' },
    { title: 'Shipped', value: stats?.shippedOrders, icon: Truck, color: 'bg-indigo-500' },
    { title: 'Delivered', value: stats?.deliveredOrders, icon: CheckCircle, color: 'bg-green-500' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Products" value={stats?.totalProducts?.toLocaleString()} icon={Package} color="bg-primary" />
        <StatCard title="Total Orders" value={stats?.totalOrders?.toLocaleString()} icon={ShoppingCart} color="bg-gold-dark" />
        <StatCard title="Total Users" value={stats?.totalUsers?.toLocaleString()} icon={Users} color="bg-purple-500" />
        <StatCard title="Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon={IndianRupee} color="bg-green-500" sub="From delivered orders" />
      </div>

      {/* Order status breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STATUS_ORDER_CARDS.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary font-medium hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order #', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).map((order: any) => (
                <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders?id=${order.id}`} className="font-medium text-primary hover:underline">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-semibold">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <span className={`badge text-xs ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{order.status}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
              {!stats?.recentOrders?.length && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
