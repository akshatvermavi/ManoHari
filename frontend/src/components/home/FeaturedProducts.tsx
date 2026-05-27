'use client'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/api'
import ProductCard from '@/components/product/ProductCard'
import Link from 'next/link'

export default function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productApi.getFeatured().then((r) => r.data.data),
  })

  if (isLoading) return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )

  if (!data?.length) return null

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title">Featured Products</h2>
        <Link href="/search?featured=true" className="text-sm text-gold font-semibold hover:underline">View All →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
