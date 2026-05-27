'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { useState } from 'react'

interface Product {
  id: string
  title: string
  images: string[]
  price: number
  discountedPrice?: number
  discountPercent?: number
  brand?: string
  rating?: number
  reviewCount?: number
  category?: string
}

export default function ProductCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false)
  const displayPrice = product.discountedPrice ?? product.price
  const image = product.images?.[0] || '/placeholder.png'

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded">
              -{product.discountPercent}%
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted) }}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-colors ${wishlisted ? 'text-accent' : 'text-gray-400 hover:text-accent'}`}
          >
            <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
      </Link>

      <div className="p-3">
        {product.brand && (
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{product.brand}</p>
        )}
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-primary transition-colors mb-1.5">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-base font-bold text-primary">₹{displayPrice.toLocaleString('en-IN')}</span>
          {product.discountedPrice && (
            <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>

        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
            {product.reviewCount && (
              <span className="text-xs text-gray-400">({product.reviewCount})</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
