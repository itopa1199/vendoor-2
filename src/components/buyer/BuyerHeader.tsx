'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { MdSearch, MdShoppingCart, MdPerson, MdStorefront } from 'react-icons/md'
import { FaMobileAlt, FaLaptop, FaTshirt, FaSprayCan, FaShoppingCart, FaCouch, FaDumbbell, GiPerfumeBottle } from 'react-icons/fa'
import { useCartStore } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import { cn } from '@/lib/utils'

const CATS = [
  { slug: 'smartphones', label: 'Phones' },
  { slug: 'laptops', label: 'Laptops' },
  { slug: 'womens-clothing', label: 'Fashion' },
  { slug: 'beauty', label: 'Beauty' },
  { slug: 'groceries', label: 'Groceries' },
  { slug: 'home-decoration', label: 'Home' },
  { slug: 'sports-accessories', label: 'Sports' },
  { slug: 'fragrances', label: 'Fragrances' },
]

export default function BuyerHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const count = useCartStore((s) => s.count())
  const { openCart, openSignIn } = useUIStore()
  const [q, setQ] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) router.push(`/buyer/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="bg-[#F85606] sticky top-0 z-[300]">
      <div className="py-2">
        <div className="max-w-[1280px] mx-auto px-[14px] flex items-center gap-3">
          <button onClick={() => router.push('/buyer')}
            className="text-[22px] font-[800] text-white tracking-tight flex-shrink-0">
            Vend<span className="text-[#FFC200]">oor</span>
          </button>

          <form onSubmit={handleSearch} className="flex-1 flex rounded-[6px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,.2)]">
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands, vendors…"
              className="flex-1 border-none outline-none px-[14px] py-[10px] text-sm min-w-0" />
            <button type="submit" className="bg-[#FFC200] px-[18px] flex items-center justify-center flex-shrink-0 hover:bg-[#e6af00] transition-colors">
              <MdSearch size={20} />
            </button>
          </form>

          <div className="flex items-center gap-1 flex-shrink-0">
            {[
              { icon: MdPerson, label: 'Account', action: openSignIn, badge: 0 },
              { icon: MdShoppingCart, label: 'Cart', action: openCart, badge: count },
              { icon: MdStorefront, label: 'Sell', action: () => router.push('/vendor/dashboard'), badge: 0 },
            ].map(({ icon: Icon, label, action, badge }) => (
              <button key={label} onClick={action}
                className="flex flex-col items-center gap-[1px] px-[10px] py-[5px] rounded-[6px] text-white hover:bg-white/15 transition-colors text-[10px] font-[800] whitespace-nowrap relative">
                <span className="relative">
                  <Icon size={23} />
                  {badge > 0 && (
                    <span className="absolute -top-[3px] -right-[3px] bg-[#FFC200] text-black text-[9px] font-[900] min-w-[15px] h-[15px] rounded-full px-[3px] flex items-center justify-center">{badge}</span>
                  )}
                </span>
                <span className="hidden sm:block">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-[#E8E8E8]">
        <div className="max-w-[1280px] mx-auto px-[14px] flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATS.map((c) => (
            <button key={c.slug} onClick={() => router.push(`/buyer/category/${c.slug}`)}
              className={cn('px-[14px] py-[9px] text-[13px] font-[700] whitespace-nowrap border-b-2 transition-all flex-shrink-0',
                pathname?.includes(`/buyer/category/${c.slug}`) ? 'text-[#F85606] border-[#F85606]' : 'text-[#757575] border-transparent hover:text-[#F85606]')}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
