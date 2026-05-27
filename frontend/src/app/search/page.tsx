'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import ShopLayout from '@/components/layout/ShopLayout'
import ProductCard from '@/components/product/ProductCard'
import { searchApi, productApi } from '@/lib/api'
import { SlidersHorizontal, X } from 'lucide-react'

const SORT_OPTIONS = [
  { label: 'Relevance', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Top Rated', value: 'rating' },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const [sort, setSort] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['search', q, category, sort, minPrice, maxPrice, page],
    queryFn: async () => {
      if (q) {
        return searchApi.search(q, page, 20).then((r) => r.data.data)
      }
      return productApi.getAll({
        page, size: 20, category: category || undefined,
        minPrice: minPrice || undefined, maxPrice: maxPrice || undefined,
        sortBy: sort.includes('price') ? 'price' : sort === 'newest' ? 'createdAt' : 'createdAt',
        sortDir: sort === 'price_asc' ? 'asc' : 'desc',
      }).then((r) => r.data.data)
    },
  })

  const products = q ? (data || []) : (data?.content || [])
  const totalPages = data?.totalPages || 1

  return (
    <ShopLayout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-primary">
              {q ? `Results for "${q}"` : category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'All Products'}
            </h1>
            {data?.totalElements && (
              <p className="text-sm text-gray-500 mt-0.5">{data.totalElements.toLocaleString()} products found</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gold">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-400">
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          {filtersOpen && (
            <div className="w-56 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)}><X size={16} /></button>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Price Range</p>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                      className="input-field text-xs py-2" />
                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                      className="input-field text-xs py-2" />
                  </div>
                </div>
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); setSort('') }}
                  className="w-full text-sm text-accent hover:underline">Clear All</button>
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Try a different search or filter</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                      className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Prev</button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + Math.max(0, page - 2)).map((p) => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium ${p === page ? 'bg-primary text-white' : 'hover:bg-gray-50 border'}`}>
                        {p + 1}
                      </button>
                    ))}
                    <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                      className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
