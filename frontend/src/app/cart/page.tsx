'use client'
import { useEffect } from 'react'
import ShopLayout from '@/components/layout/ShopLayout'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function CartPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { setCart } = useCartStore()
  const qc = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get().then((r) => r.data.data),
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (cart) setCart(cart.items, cart.totalAmount)
  }, [cart])

  const removeMutation = useMutation({
    mutationFn: ({ productId, color, size }: any) => cartApi.remove(productId, color, size),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['cart'] }); toast.success('Removed from cart') },
  })

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity, color, size }: any) => cartApi.update(productId, quantity, color, size),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  })

  if (!isAuthenticated) return (
    <ShopLayout>
      <div className="container-custom py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Please sign in to view your cart</p>
        <Link href="/auth/login" className="btn-primary">Sign In</Link>
      </div>
    </ShopLayout>
  )

  if (isLoading) return (
    <ShopLayout>
      <div className="container-custom py-10">
        <div className="h-8 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
        {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl mb-3 animate-pulse" />)}
      </div>
    </ShopLayout>
  )

  const items = cart?.items || []
  const total = cart?.totalAmount || 0
  const delivery = total >= 499 ? 0 : 49
  const grandTotal = total + delivery

  return (
    <ShopLayout>
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold text-primary mb-6">
          My Cart <span className="text-gray-400 font-normal text-lg">({items.length} items)</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={80} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to get started</p>
            <Link href="/" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="card flex gap-4 p-4">
                  <div className="relative w-24 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.productImage && (
                      <Image src={item.productImage} alt={item.productTitle} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.productId}`}
                      className="font-medium text-gray-800 hover:text-primary text-sm line-clamp-2">{item.productTitle}</Link>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      {item.color && <span>Color: {item.color}</span>}
                      {item.size && <span>Size: {item.size}</span>}
                    </div>
                    <p className="font-bold text-primary mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateMutation.mutate({ productId: item.productId, quantity: item.quantity - 1, color: item.color, size: item.size })}
                          className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600">
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateMutation.mutate({ productId: item.productId, quantity: item.quantity + 1, color: item.color, size: item.size })}
                          className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        <button onClick={() => removeMutation.mutate({ productId: item.productId, color: item.color, size: item.size })}
                          className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div className="card p-6 sticky top-24">
                <h2 className="font-bold text-lg text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charges</span>
                    <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>
                      {delivery === 0 ? 'FREE' : `₹${delivery}`}
                    </span>
                  </div>
                  {delivery === 0 && (
                    <p className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                      🎉 You've unlocked free delivery!
                    </p>
                  )}
                  {delivery > 0 && (
                    <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                      Add ₹{(499 - total).toFixed(0)} more for free delivery
                    </p>
                  )}
                  <div className="border-t pt-3 flex justify-between font-bold text-lg text-primary">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <button onClick={() => router.push('/checkout')}
                  className="w-full btn-primary mt-5 flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
                <Link href="/" className="block text-center text-sm text-gray-500 mt-3 hover:text-primary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  )
}
