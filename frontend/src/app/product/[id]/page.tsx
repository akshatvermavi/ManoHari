'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import ShopLayout from '@/components/layout/ShopLayout'
import { productApi, cartApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { ShoppingBag, Heart, Star, ChevronLeft, ChevronRight, Shield, RefreshCw, Truck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { setCart } = useCartStore()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string>()
  const [selectedSize, setSelectedSize] = useState<string>()
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id).then((r) => r.data.data),
  })

  const handleAddToCart = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    setAdding(true)
    try {
      const res = await cartApi.add({ productId: id, color: selectedColor, size: selectedSize, quantity: qty })
      setCart(res.data.data.items, res.data.data.totalAmount)
      toast.success('Added to cart!')
    } catch {}
    finally { setAdding(false) }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    router.push('/cart')
  }

  if (isLoading) return (
    <ShopLayout>
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-6 bg-gray-200 rounded" style={{ width: `${80-i*10}%` }} />)}
          </div>
        </div>
      </div>
    </ShopLayout>
  )

  if (!product) return <ShopLayout><div className="container-custom py-20 text-center">Product not found</div></ShopLayout>

  const displayPrice = product.discountedPrice ?? product.price
  const images = product.images || []
  const currentVariant = product.variants?.find((v: any) => v.color === selectedColor)

  return (
    <ShopLayout>
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
              {images[selectedImage] && (
                <Image src={images[selectedImage]} alt={product.title} fill
                  className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              )}
              {product.discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-accent text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{product.discountPercent}% OFF
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage((s) => (s - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center hover:shadow-md">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setSelectedImage((s) => (s + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center hover:shadow-md">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-gold' : 'border-gray-200'}`}>
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            {product.brand && <p className="text-sm text-gray-400 font-medium uppercase tracking-widest mb-1">{product.brand}</p>}
            <h1 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">{product.title}</h1>

            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={16} className={s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">₹{displayPrice.toLocaleString('en-IN')}</span>
              {product.discountedPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-green-600 font-semibold text-sm">
                    Save ₹{(product.price - product.discountedPrice).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            {/* Colors */}
            {product.variants?.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Color: <span className="text-gray-500 font-normal">{selectedColor || 'Select'}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v: any) => (
                    <button key={v.color} onClick={() => { setSelectedColor(v.color); setSelectedSize(undefined) }}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${selectedColor === v.color ? 'border-primary bg-primary text-white' : 'border-gray-300 hover:border-gray-400'}`}>
                      {v.colorHex && <span className="inline-block w-3 h-3 rounded-full mr-1.5" style={{ background: v.colorHex }} />}
                      {v.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {currentVariant?.sizes?.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Size: <span className="text-gray-500 font-normal">{selectedSize || 'Select'}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {currentVariant.sizes.map((size: string) => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg border text-sm font-medium transition-all ${selectedSize === size ? 'border-primary bg-primary text-white' : 'border-gray-300 hover:border-gray-400'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <p className="text-sm font-semibold text-gray-700">Qty:</p>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-100">−</button>
                <span className="px-4 py-2 font-medium text-sm">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-gray-100">+</button>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} disabled={adding}
                className="flex-1 btn-outline flex items-center justify-center gap-2">
                <ShoppingBag size={18} />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow}
                className="flex-1 btn-primary flex items-center justify-center gap-2">
                Buy Now
              </button>
              <button className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:border-accent hover:text-accent transition-colors">
                <Heart size={18} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
              <div className="flex flex-col items-center gap-1">
                <Truck size={20} className="text-green-600" />
                <span>Free delivery above ₹499</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw size={20} className="text-blue-600" />
                <span>Easy 30-day returns</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Shield size={20} className="text-gold" />
                <span>100% genuine products</span>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Product Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specifications).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex gap-2 text-sm">
                      <span className="text-gray-500 min-w-[80px]">{k}:</span>
                      <span className="text-gray-800 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
