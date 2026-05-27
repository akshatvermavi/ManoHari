'use client'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/api'
import ProductCard from '@/components/product/ProductCard'
import Link from 'next/link'

export default function NewArrivals() {
  const { data, isLoading } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productApi.getNewArrivals().then((r) => r.data.data),
  })

  if (isLoading) return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Array(5).fill(0).map((_, i) => <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  )

  if (!data?.length) return null

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title">New Arrivals</h2>
        <Link href="/search?sort=newest" className="text-sm text-gold font-semibold hover:underline">View All →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data.slice(0, 10).map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
