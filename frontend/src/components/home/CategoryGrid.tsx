'use client'
import Link from 'next/link'

const CATS = [
  { label: 'Men', emoji: '👔', href: '/search?category=men', color: 'from-blue-900 to-blue-700' },
  { label: 'Women', emoji: '👗', href: '/search?category=women', color: 'from-pink-700 to-rose-500' },
  { label: 'Kids', emoji: '🧸', href: '/search?category=kids', color: 'from-yellow-600 to-orange-500' },
  { label: 'Beauty', emoji: '💄', href: '/search?category=beauty', color: 'from-purple-700 to-purple-500' },
  { label: 'Footwear', emoji: '👟', href: '/search?category=footwear', color: 'from-green-800 to-green-600' },
  { label: 'Accessories', emoji: '👜', href: '/search?category=accessories', color: 'from-gray-700 to-gray-500' },
]

export default function CategoryGrid() {
  return (
    <div className="container-custom py-8">
      <h2 className="section-title mb-6">Shop by Category</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {CATS.map((cat) => (
          <Link key={cat.label} href={cat.href}
            className={`bg-gradient-to-br ${cat.color} rounded-xl p-4 text-white text-center hover:scale-105 transition-transform cursor-pointer`}>
            <div className="text-3xl mb-2">{cat.emoji}</div>
            <p className="text-xs font-semibold">{cat.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
