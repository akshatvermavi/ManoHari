'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    id: 1,
    title: 'Bigger. Bolder. Never Gets Older.',
    subtitle: 'Big Bold Sale – Up to 90% OFF',
    cta: 'Shop Now',
    href: '/search',
    bg: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    badge: 'Sale Starts 28th May',
  },
  {
    id: 2,
    title: "Women's Summer Collection",
    subtitle: 'Fresh styles, fresh you. Explore 500+ new arrivals.',
    cta: 'Explore Women',
    href: '/search?category=women',
    bg: 'from-[#2d1b69] via-[#11998e] to-[#38ef7d]',
    badge: 'New Arrivals',
  },
  {
    id: 3,
    title: "Men's Ethnic Wear",
    subtitle: 'Sherwani, Kurtas, Suits — crafted for every occasion.',
    cta: 'Shop Ethnic',
    href: '/search?category=men',
    bg: 'from-[#c94b4b] via-[#4b134f] to-[#c94b4b]',
    badge: 'Trending Now',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[current]

  return (
    <div className={`relative bg-gradient-to-r ${slide.bg} text-white overflow-hidden`}
      style={{ minHeight: '420px', transition: 'background 0.5s' }}>
      <div className="container-custom flex items-center py-16 md:py-24 relative z-10">
        <div className="max-w-xl">
          <span className="inline-block bg-gold/20 text-gold border border-gold/30 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            {slide.badge}
          </span>
          <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight mb-4">
            {slide.title}
          </h1>
          <p className="text-white/80 text-lg mb-8">{slide.subtitle}</p>
          <div className="flex gap-3 flex-wrap">
            <Link href={slide.href}
              className="bg-gold text-primary px-8 py-3.5 rounded-full font-bold hover:bg-gold-dark transition-all text-sm uppercase tracking-wide">
              {slide.cta}
            </Link>
            <Link href="/search"
              className="border border-white/40 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-all text-sm">
              Explore All
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative circles */}
      <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute right-32 bottom-0 w-96 h-96 rounded-full bg-white/5 translate-y-1/3" />

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-gold' : 'w-2 bg-white/40'}`} />
        ))}
      </div>

      {/* Arrows */}
      <button onClick={() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
        <ChevronLeft size={20} />
      </button>
      <button onClick={() => setCurrent((c) => (c + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
