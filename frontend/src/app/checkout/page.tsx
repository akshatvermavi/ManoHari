'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import { useQuery, useMutation } from '@tanstack/react-query'
import { cartApi, orderApi, userApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { Plus, MapPin, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

declare global { interface Window { Razorpay: any } }

export default function CheckoutPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { setCart } = useCartStore()
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [placing, setPlacing] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddr, setNewAddr] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', country: 'India', isDefault: false
  })

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [isAuthenticated])

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get().then((r) => r.data.data),
    enabled: isAuthenticated,
  })

  const { data: addresses, refetch: refetchAddr } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userApi.getAddresses().then((r) => r.data.data),
    enabled: isAuthenticated,
    onSuccess: (data: any[]) => {
      if (data?.length && !selectedAddressId) {
        const def = data.find((a) => a.isDefault) || data[0]
        if (def) setSelectedAddressId(def.id)
      }
    }
  })

  const addAddressMutation = useMutation({
    mutationFn: () => userApi.addAddress(newAddr),
    onSuccess: (res) => {
      const addrs = res.data.data
      refetchAddr()
      const last = addrs[addrs.length - 1]
      if (last) setSelectedAddressId(last.id)
      setShowAddAddress(false)
      toast.success('Address saved!')
    }
  })

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error('Please select a delivery address'); return }
    if (!cart?.items?.length) { toast.error('Your cart is empty'); return }
    setPlacing(true)
    try {
      const res = await orderApi.create({ addressId: selectedAddressId })
      const { orderId, razorpayOrderId, razorpayKeyId, amount, currency } = res.data.data

      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: 'ManoHari',
        description: 'Fashion & Lifestyle',
        order_id: razorpayOrderId,
        prefill: { name: user?.name, email: user?.email, contact: user?.phoneNumber ? `+91${user.phoneNumber}` : '' },
        theme: { color: '#1a1a2e' },
        handler: async (response: any) => {
          try {
            await orderApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId,
            })
            setCart([], 0)
            router.push(`/orders?success=true&orderId=${orderId}`)
          } catch { toast.error('Payment verification failed') }
        },
        modal: { ondismiss: () => setPlacing(false) }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create order')
      setPlacing(false)
    }
  }

  const items = cart?.items || []
  const subtotal = cart?.totalAmount || 0
  const delivery = subtotal >= 499 ? 0 : 49
  const grandTotal = subtotal + delivery

  if (!isAuthenticated) return null

  return (
    <ShopLayout>
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold text-primary mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address + Items */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Address */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <MapPin size={18} className="text-gold" /> Delivery Address
                </h2>
                <button onClick={() => setShowAddAddress(!showAddAddress)}
                  className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                  <Plus size={15} /> Add New
                </button>
              </div>

              {showAddAddress && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                      <input value={newAddr.fullName} onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })} className="input-field text-sm" placeholder="Full name" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Phone *</label>
                      <input value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} className="input-field text-sm" placeholder="Mobile number" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Address Line 1 *</label>
                    <input value={newAddr.addressLine1} onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })} className="input-field text-sm" placeholder="House no, building, street" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Address Line 2</label>
                    <input value={newAddr.addressLine2} onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })} className="input-field text-sm" placeholder="Area, colony (optional)" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">City *</label>
                      <input value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">State *</label>
                      <input value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Pincode *</label>
                      <input value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} className="input-field text-sm" maxLength={6} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={newAddr.isDefault} onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })} className="rounded" />
                    Set as default address
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => addAddressMutation.mutate()} className="btn-primary text-sm py-2 px-5">Save Address</button>
                    <button onClick={() => setShowAddAddress(false)} className="btn-outline text-sm py-2 px-4">Cancel</button>
                  </div>
                </div>
              )}

              {addresses?.length === 0 && !showAddAddress && (
                <div className="text-center py-6 text-gray-400">
                  <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No addresses saved. Add one above.</p>
                </div>
              )}

              <div className="space-y-3">
                {(addresses || []).map((addr: any) => (
                  <label key={addr.id} className={`flex gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-800">{addr.fullName}</p>
                        {addr.isDefault && <span className="badge bg-green-100 text-green-700">Default</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''},<br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">📞 {addr.phone}</p>
                    </div>
                    {selectedAddressId === addr.id && <CheckCircle size={20} className="text-primary flex-shrink-0" />}
                  </label>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-800 mb-4">Order Items ({items.length})</h2>
              <div className="space-y-3">
                {items.map((item: any, i: number) => (
                  <div key={i} className="flex gap-3 py-3 border-b last:border-b-0">
                    <div className="relative w-14 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {item.productImage && <Image src={item.productImage} alt={item.productTitle} fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.productTitle}</p>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {item.color && <span>Color: {item.color} </span>}
                        {item.size && <span>· Size: {item.size} </span>}
                        <span>· Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Price Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Price ({items.length} items)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>
                    {delivery === 0 ? 'FREE' : `₹${delivery}`}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-base text-primary">
                  <span>Total Amount</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {delivery > 0 && (
                <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg mt-3">
                  💡 Add ₹{(499 - subtotal).toFixed(0)} more for FREE delivery
                </p>
              )}

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-600" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span className="text-xs text-gray-600">100% Secure Payments</span>
                </div>
                <button onClick={handlePlaceOrder} disabled={placing || !selectedAddressId || !items.length}
                  className="w-full btn-gold text-base py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  {placing ? (
                    <><span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Processing...</>
                  ) : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
                </button>
              </div>

              <div className="flex justify-center gap-3 mt-4">
                <img src="https://cdn.razorpay.com/static/assets/pay_methods_branding.png" alt="Payment methods" className="h-6 opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
