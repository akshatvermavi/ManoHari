'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Heart, User, Search, Menu, X, ChevronDown, LogOut, Package, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { searchApi } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'

const CATEGORIES = [
  { label: 'MEN', sub: ['Clothing', 'Footwear', 'Accessories', 'Ethnic Wear', 'Innerwear'] },
  { label: 'WOMEN', sub: ['Tops & Tees', 'Dresses', 'Ethnic Wear', 'Footwear', 'Accessories'] },
  { label: 'KIDS', sub: ['Boys', 'Girls', 'Footwear', 'Accessories'] },
  { label: 'BEAUTY', sub: ['Skincare', 'Haircare', 'Makeup', 'Fragrances'] },
  { label: 'HOME & KITCHEN', sub: ['Bedding', 'Decor', 'Kitchen', 'Bath'] },
]

interface SuggestedProduct {
  id: string
  title: string
  images: string[]
  price: number
  discountedPrice?: number
}

export default function Navbar() {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore()
  const { totalItems } = useCartStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestedProduct[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      searchApi.suggestProducts(debouncedSearch, 6).then((res) => {
        setSuggestions(res.data.data || [])
        setShowSuggestions(true)
      }).catch(() => {})
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestions(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-primary text-white text-xs text-center py-1.5 hidden md:block">
        🎉 Big Bold Sale – Up to 90% OFF | Starts 28th May
      </div>

      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-gold font-display font-bold text-sm">M</span>
            </div>
            <span className="font-display font-bold text-xl text-primary hidden sm:block">ManoHari</span>
          </Link>

          {/* Search bar */}
          <div ref={searchRef} className="relative flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ManoHari..."
                  className="w-full border border-gray-200 rounded-full px-5 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 bg-gray-50"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-dropdown absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                <p className="text-xs text-gray-400 px-4 py-2 border-b">Suggestions</p>
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {product.images?.[0] && (
                      <Image src={product.images[0]} alt={product.title} width={44} height={44}
                        className="rounded-lg object-cover w-11 h-11 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                      <p className="text-xs text-gold font-semibold">
                        ₹{product.discountedPrice ?? product.price}
                        {product.discountedPrice && (
                          <span className="text-gray-400 line-through ml-1">₹{product.price}</span>
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
                <button
                  onClick={handleSearch}
                  className="w-full text-center text-sm text-primary font-medium py-3 hover:bg-gray-50 border-t"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Mobile search */}
            <button className="md:hidden text-gray-600" onClick={() => router.push('/search')}>
              <Search size={20} />
            </button>

            {/* Auth / Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-primary"
                >
                  {user?.profileImage
                    ? <Image src={user.profileImage} alt={user.name} width={32} height={32} className="rounded-full w-8 h-8 object-cover" />
                    : <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
                      </div>
                  }
                  <ChevronDown size={14} className="hidden sm:block" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold text-sm text-gray-800 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || user?.phoneNumber}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={15} /> My Profile
                      </Link>
                      <Link href="/orders" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Package size={15} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link href="/admin/dashboard" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary font-medium hover:bg-gray-50">
                          <Settings size={15} /> Admin Panel
                        </Link>
                      )}
                      <button onClick={() => { logout(); setProfileOpen(false) }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 w-full">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-primary">
                <User size={20} />
                <span className="hidden sm:block">Sign In</span>
              </Link>
            )}

            {/* Wishlist */}
            <button className="text-gray-600 hover:text-primary hidden sm:block">
              <Heart size={20} />
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative text-gray-600 hover:text-primary">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-600">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Desktop nav categories */}
        <nav className="hidden md:flex items-center gap-0 border-t border-gray-100">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.label}
              className="relative group"
              onMouseEnter={() => setActiveCategory(cat.label)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <button className="flex items-center gap-1 px-4 py-3 text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
                {cat.label}
                <ChevronDown size={14} />
              </button>
              {activeCategory === cat.label && (
                <div className="absolute top-full left-0 bg-white shadow-lg border-t-2 border-gold rounded-b-xl p-4 min-w-[180px] z-50 animate-fade-in">
                  {cat.sub.map((sub) => (
                    <Link
                      key={sub}
                      href={`/search?category=${encodeURIComponent(cat.label.toLowerCase())}&sub=${encodeURIComponent(sub)}`}
                      className="block py-2 px-3 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t animate-slide-down px-4 pb-4">
          <form onSubmit={handleSearch} className="my-3">
            <div className="relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." className="input-field pr-10" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search size={16} className="text-gray-400" />
              </button>
            </div>
          </form>
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="py-2 border-b border-gray-50">
              <p className="font-semibold text-sm text-gray-800 mb-1">{cat.label}</p>
              <div className="flex flex-wrap gap-2">
                {cat.sub.map((sub) => (
                  <Link key={sub} href={`/search?category=${cat.label.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-xs text-gray-500 hover:text-primary px-2 py-1 bg-gray-50 rounded">
                    {sub}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
