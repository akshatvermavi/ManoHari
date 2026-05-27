import Link from 'next/link'

export default function PromoBanner() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-10">
      <div className="relative bg-gradient-to-r from-primary to-blue-900 rounded-2xl p-8 text-white overflow-hidden">
        <div className="relative z-10">
          <p className="text-gold text-sm font-semibold mb-1">SPECIAL OFFER</p>
          <h3 className="font-display text-2xl font-bold mb-2">Ethnic Wear Fiesta</h3>
          <p className="text-white/70 text-sm mb-4">Kurtas, Sherwanis & more at flat 50% off</p>
          <Link href="/search?category=ethnic" className="bg-gold text-primary text-sm font-bold px-5 py-2.5 rounded-full hover:bg-gold-dark transition-colors">
            Shop Ethnic
          </Link>
        </div>
        <div className="absolute right-4 bottom-0 text-8xl opacity-10">🎽</div>
      </div>
      <div className="relative bg-gradient-to-r from-rose-600 to-pink-500 rounded-2xl p-8 text-white overflow-hidden">
        <div className="relative z-10">
          <p className="text-yellow-200 text-sm font-semibold mb-1">TRENDING</p>
          <h3 className="font-display text-2xl font-bold mb-2">Summer Dresses</h3>
          <p className="text-white/70 text-sm mb-4">Stay cool & stylish this summer</p>
          <Link href="/search?category=women&sub=dresses" className="bg-white text-rose-600 text-sm font-bold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors">
            Shop Dresses
          </Link>
        </div>
        <div className="absolute right-4 bottom-0 text-8xl opacity-10">👗</div>
      </div>
    </div>
  )
}
