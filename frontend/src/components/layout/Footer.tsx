import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-primary font-display font-bold text-sm">M</span>
              </div>
              <span className="font-display font-bold text-xl text-gold">ManoHari</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your one-stop fashion destination. Shop 27L+ styles from 6000+ brands.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Facebook size={18} /></a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-gold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Men', 'Women', 'Kids', 'Beauty', 'Home & Kitchen'].map((cat) => (
                <li key={cat}>
                  <Link href={`/search?category=${cat.toLowerCase()}`} className="hover:text-white transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-gold mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['My Orders', 'Returns & Exchanges', 'Shipping Info', 'Size Guide', 'FAQs'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail size={15} />
                <span>support@manohari.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} />
                <span>+91 76340 66879</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 flex-shrink-0" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ManoHari. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
