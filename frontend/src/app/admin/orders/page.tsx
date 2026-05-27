'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Eye, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
}

export default function AdminOrdersPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () => adminApi.getOrders({ page, size: 20, status: statusFilter || undefined }).then((r) => r.data.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order status updated'); setUpdatingId(null) },
  })

  const orders = data?.content || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.totalElements || 0} total orders</p>
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
          className="input-field w-40 text-sm">
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="font-bold text-lg text-primary">Order #{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-400">{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Status update */}
              <div className="flex items-center gap-3">
                <span className={`badge ${STATUS_COLORS[selectedOrder.status]}`}>{selectedOrder.status}</span>
                <select defaultValue={selectedOrder.status}
                  onChange={(e) => statusMutation.mutate({ id: selectedOrder.id, status: e.target.value })}
                  className="input-field text-sm w-40">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Items</h3>
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.productTitle}</p>
                      <p className="text-xs text-gray-400">
                        {item.color && `Color: ${item.color} · `}{item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold">₹{item.totalPrice?.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              {/* Shipping */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                  <p className="font-medium">{selectedOrder.shippingAddress?.fullName}</p>
                  <p>{selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city}</p>
                  <p>{selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  <p className="text-gray-400">📞 {selectedOrder.shippingAddress?.phone}</p>
                </div>
              </div>
              {/* Payment */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Payment</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Status:</span> <span className={`font-medium ${selectedOrder.payment?.status === 'SUCCESS' ? 'text-green-600' : 'text-yellow-600'}`}>{selectedOrder.payment?.status}</span></div>
                  <div><span className="text-gray-500">Amount:</span> <span className="font-medium">₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span></div>
                  {selectedOrder.payment?.razorpayPaymentId && <div className="col-span-2"><span className="text-gray-500">Payment ID:</span> <span className="font-mono text-xs">{selectedOrder.payment.razorpayPaymentId}</span></div>}
                </div>
              </div>
              {/* Status history */}
              {selectedOrder.statusHistory?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Status History</h3>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((h: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className={`badge ${STATUS_COLORS[h.status] || 'bg-gray-100 text-gray-600'} mt-0.5`}>{h.status}</span>
                        <div>
                          <p className="text-gray-600">{h.message}</p>
                          <p className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order #', 'Customer ID', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No orders found</td></tr>
              ) : orders.map((order: any) => (
                <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{order.userId?.slice(-8)}</td>
                  <td className="px-4 py-3 text-gray-600">{order.items?.length}</td>
                  <td className="px-4 py-3 font-bold">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${order.payment?.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.payment?.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {updatingId === order.id ? (
                      <select autoFocus defaultValue={order.status}
                        onChange={(e) => statusMutation.mutate({ id: order.id, status: e.target.value })}
                        onBlur={() => setUpdatingId(null)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <button onClick={() => setUpdatingId(order.id)}
                        className={`badge ${STATUS_COLORS[order.status]} flex items-center gap-1`}>
                        {order.status} <ChevronDown size={10} />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedOrder(order)} className="text-primary hover:text-primary-light p-1.5 hover:bg-gray-100 rounded-lg">
                      <Eye size={15} />
                    </button>
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
