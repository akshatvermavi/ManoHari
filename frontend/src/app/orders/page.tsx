'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import Image from 'next/image'
import { Package, CheckCircle, Truck, Clock, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING:    { color: 'bg-yellow-100 text-yellow-700',  icon: Clock,        label: 'Pending' },
  CONFIRMED:  { color: 'bg-blue-100 text-blue-700',      icon: CheckCircle,  label: 'Confirmed' },
  PROCESSING: { color: 'bg-purple-100 text-purple-700',  icon: Package,      label: 'Processing' },
  SHIPPED:    { color: 'bg-indigo-100 text-indigo-700',  icon: Truck,        label: 'Shipped' },
  DELIVERED:  { color: 'bg-green-100 text-green-700',    icon: CheckCircle,  label: 'Delivered' },
  CANCELLED:  { color: 'bg-red-100 text-red-700',        icon: XCircle,      label: 'Cancelled' },
  REFUNDED:   { color: 'bg-gray-100 text-gray-700',      icon: XCircle,      label: 'Refunded' },
}

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const success = searchParams.get('success')

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    if (success === 'true') {
      toast.success('🎉 Order placed successfully!')
    }
  }, [isAuthenticated, success])

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getAll().then((r) => r.data.data),
    enabled: isAuthenticated,
  })

  const orders = data?.content || []

  return (
    <ShopLayout>
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold text-primary mb-6">My Orders</h1>

        {isLoading && (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="text-center py-20">
            <Package size={80} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link href="/" className="btn-primary">Shop Now</Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order: any) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
            const StatusIcon = cfg.icon
            return (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="font-bold text-primary text-sm">Order #{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${cfg.color} flex items-center gap-1`}>
                      <StatusIcon size={12} /> {cfg.label}
                    </span>
                    <Link href={`/orders/${order.id}`}
                      className="text-sm text-primary font-medium hover:underline">
                      View Details →
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-3 mb-3 overflow-x-auto pb-1">
                  {order.items?.slice(0, 4).map((item: any, i: number) => (
                    <div key={i} className="flex-shrink-0 flex items-center gap-2 bg-gray-50 rounded-lg p-2 pr-3">
                      {item.productImage && (
                        <div className="relative w-10 h-12 rounded overflow-hidden">
                          <Image src={item.productImage} alt={item.productTitle} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-gray-700 max-w-[100px] truncate">{item.productTitle}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <span className="text-xs text-gray-400 flex-shrink-0">+{order.items.length - 4} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    {order.payment?.method && <span className="capitalize">{order.payment.method.toLowerCase()} </span>}
                    {order.payment?.status === 'SUCCESS' && <span className="text-green-600">· Paid</span>}
                  </div>
                  <p className="font-bold text-primary">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ShopLayout>
  )
}
