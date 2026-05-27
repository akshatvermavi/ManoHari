import ShopLayout from '@/components/layout/ShopLayout'
import HeroBanner from '@/components/home/HeroBanner'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import PromoBanner from '@/components/home/PromoBanner'
import NewArrivals from '@/components/home/NewArrivals'

export default function HomePage() {
  return (
    <ShopLayout>
      <HeroBanner />
      <CategoryGrid />
      <div className="container-custom py-10">
        <FeaturedProducts />
        <PromoBanner />
        <NewArrivals />
      </div>
    </ShopLayout>
  )
}
