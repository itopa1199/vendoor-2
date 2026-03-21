'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  MdFlashOn, MdLocalShipping, MdVerified, MdStorefront,
  MdPhone, MdHome, MdLocalGroceryStore,
} from 'react-icons/md'
import {
  FaMobileAlt, FaLaptop, FaTshirt, FaMale, FaSprayCan,
  FaShoppingCart, FaDumbbell, FaLeaf, FaStar,
} from 'react-icons/fa'
import { BsDropletFill } from 'react-icons/bs'
import { productsApi, vendorsApi } from '@/lib/api'
import type { Product, Vendor } from '@/types'
import ProductCard from '@/components/buyer/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { ngn, dedupe } from '@/lib/utils'

const SLIDES = [
  { tag: 'Flash Sale', title: 'Up to 60% off Electronics', sub: 'Phones, laptops, earbuds — shipped same day', cat: 'smartphones', bg: 'linear-gradient(135deg,#1a1a2e,#0f3460)' },
  { tag: 'New Arrivals', title: 'Fresh Fashion Drop', sub: 'Latest styles, campus-ready fits', cat: 'womens-clothing', bg: 'linear-gradient(135deg,#2d0a00,#f85606)' },
  { tag: 'Groceries', title: 'Order by 2pm, Get Today', sub: 'Same-day delivery on food & groceries', cat: 'groceries', bg: 'linear-gradient(135deg,#003d1a,#00853D)' },
  { tag: 'Beauty Deals', title: 'Glow Up Season', sub: 'Skincare, fragrances, beauty essentials', cat: 'beauty', bg: 'linear-gradient(135deg,#1a0030,#7c3aed)' },
]

const CATEGORIES = [
  { slug: 'smartphones', label: 'Phones', icon: FaMobileAlt, color: '#0066CC' },
  { slug: 'laptops', label: 'Laptops', icon: FaLaptop, color: '#7C3AED' },
  { slug: 'womens-clothing', label: "Women's", icon: FaTshirt, color: '#E01D1D' },
  { slug: 'mens-clothing', label: "Men's", icon: FaMale, color: '#1A1A1A' },
  { slug: 'beauty', label: 'Beauty', icon: FaSprayCan, color: '#F85606' },
  { slug: 'groceries', label: 'Groceries', icon: FaShoppingCart, color: '#00853D' },
  { slug: 'home-decoration', label: 'Home', icon: MdHome, color: '#B45309' },
  { slug: 'sports-accessories', label: 'Sports', icon: FaDumbbell, color: '#0066CC' },
  { slug: 'fragrances', label: 'Fragrances', icon: FaLeaf, color: '#7C3AED' },
  { slug: 'skin-care', label: 'Skincare', icon: BsDropletFill, color: '#0891B2' },
]

const SECTIONS = [
  { label: 'Phones & Tablets', cat: 'smartphones' },
  { label: 'Laptops & Computing', cat: 'laptops' },
  { label: 'Fashion', cat: 'womens-clothing' },
  { label: 'Beauty & Health', cat: 'beauty' },
  { label: 'Groceries & Food', cat: 'groceries' },
]

function Countdown({ seconds }: { seconds: number }) {
  const [s, setS] = useState(seconds)
  useEffect(() => { const t = setInterval(() => setS((v) => Math.max(0, v - 1)), 1000); return () => clearInterval(t) }, [])
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return (
    <div className="flex items-center gap-[5px]">
      {[h, m, sec].map((v, i) => (
        <span key={i} className="flex items-center gap-[5px]">
          <span className="bg-black/30 text-white font-[800] text-base min-w-[34px] h-[34px] rounded-[5px] flex items-center justify-center">{v}</span>
          {i < 2 && <span className="text-white/80 font-[900]">:</span>}
        </span>
      ))}
    </div>
  )
}

export default function BuyerHomePage() {
  const router = useRouter()
  const [heroIdx, setHeroIdx] = useState(0)
  const [prods, setProds] = useState<Record<string, Product[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [vendors, setVendors] = useState<Vendor[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startHeroTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setHeroIdx((i) => (i + 1) % SLIDES.length), 4500)
  }

  useEffect(() => {
    startHeroTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    SECTIONS.forEach(async ({ cat }) => {
      setLoading((l) => ({ ...l, [cat]: true }))
      try {
        const r = await productsApi.fetch({ category: cat, limit: 10 })
        setProds((p) => ({ ...p, [cat]: dedupe(r.data.products ?? [], 'product_uuid') }))
      } catch {} finally { setLoading((l) => ({ ...l, [cat]: false })) }
    })
    vendorsApi.browse().then((r) => setVendors(r.data.vendors ?? [])).catch(() => {})
  }, [])

  const goSlide = (i: number) => { setHeroIdx(i); startHeroTimer() }
  const sl = SLIDES[heroIdx]

  return (
    <div className="page-enter">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#1a1a1a] mb-[10px]" style={{ height: 300 }}>
        <div className="flex h-full transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ transform: `translateX(-${heroIdx * 100}%)`, width: `${SLIDES.length * 100}%` }}>
          {SLIDES.map((s, i) => (
            <div key={i} className="relative flex items-center overflow-hidden flex-shrink-0"
              style={{ width: `${100 / SLIDES.length}%`, background: s.bg }}>
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
              <div className="relative z-10 px-11 max-w-[540px]">
                <span className="inline-block bg-[#FFC200] text-black text-[10px] font-[900] px-[10px] py-[3px] rounded-full uppercase tracking-[.07em] mb-[10px]">{s.tag}</span>
                <h1 className="text-white font-[800] leading-[1.15] mb-2 text-[clamp(18px,3vw,32px)]">{s.title}</h1>
                <p className="text-white/80 text-[13px] mb-4 hidden sm:block">{s.sub}</p>
                <button onClick={() => router.push(`/buyer/category/${s.cat}`)}
                  className="inline-flex items-center gap-2 bg-[#F85606] text-white px-[22px] py-[10px] rounded-[6px] text-[14px] font-[800] hover:bg-[#e84e05] hover:translate-x-1 transition-all">
                  Shop Now →
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 flex gap-[6px] z-20">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goSlide(i)}
              className={`h-[7px] rounded-full transition-all duration-300 ${i === heroIdx ? 'w-5 bg-white' : 'w-[7px] bg-white/50'}`} />
          ))}
        </div>
        <button onClick={() => goSlide((heroIdx - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[34px] h-[34px] bg-white/80 rounded-full flex items-center justify-center hover:bg-white z-20">‹</button>
        <button onClick={() => goSlide((heroIdx + 1) % SLIDES.length)}
          className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[34px] h-[34px] bg-white/80 rounded-full flex items-center justify-center hover:bg-white z-20">›</button>
      </div>

      {/* Flash Sale */}
      <div className="bg-white mb-[10px]">
        <div className="bg-gradient-to-r from-[#E01D1D] to-[#FF4444] px-4 py-[10px] flex items-center gap-3 flex-wrap">
          <span className="text-white font-[800] text-base flex items-center gap-2">
            <MdFlashOn size={20} /> Flash Sale
          </span>
          <span className="text-white/80 text-[13px]">Ends in:</span>
          <div className="ml-auto"><Countdown seconds={9900} /></div>
        </div>
        <div className="scroll-x px-4 py-3 pb-4">
          {loading['smartphones']
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex-shrink-0 w-[175px]"><ProductCardSkeleton /></div>)
            : (prods['smartphones'] ?? []).slice(0, 6).map((p) => <div key={p.product_uuid} className="flex-shrink-0 w-[175px]"><ProductCard product={p} /></div>)}
        </div>
      </div>

      {/* Spotlight Vendors */}
      {vendors.length > 0 && (
        <div className="bg-gradient-to-r from-[#FFF8E6] to-[#FEF0CC] border-y-2 border-[#FFC200] mb-[10px] py-[14px]">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="font-[800] text-[15px] flex items-center gap-2">
              <FaStar className="text-[#FFC200]" size={15} /> Spotlight Vendors
            </h2>
            <button onClick={() => router.push('/buyer/vendors')} className="text-[12px] font-[700] text-[#F85606]">See all →</button>
          </div>
          <div className="scroll-x px-4 pb-1">
            {vendors.slice(0, 8).map((v) => (
              <div key={v.uuid} onClick={() => router.push(`/buyer/vendor/${v.uuid}`)}
                className="flex-shrink-0 w-[180px] bg-white rounded-[10px] border-2 border-[#F5D77A] overflow-hidden cursor-pointer hover:-translate-y-1 hover:border-[#F85606] transition-all">
                <div className="h-[80px] flex items-center justify-center bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] relative">
                  {v.profile_photo
                    ? <img src={v.profile_photo} alt={v.name} className="w-12 h-12 rounded-full object-cover" />
                    : <MdStorefront size={36} className="text-[#F85606] opacity-60" />}
                  <span className="absolute top-[6px] left-[6px] bg-[#FFC200] text-black text-[9px] font-[900] px-2 py-[2px] rounded-full flex items-center gap-[3px]">
                    <FaStar size={8} /> Spotlight
                  </span>
                </div>
                <div className="p-[10px_12px]">
                  <p className="text-[13px] font-[800] truncate">{v.name}</p>
                  <p className="text-[11px] text-[#757575] truncate">{v.email}</p>
                </div>
                <div className="bg-[#F85606] text-white text-center py-[6px] text-[11px] font-[800]">Visit Store →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="bg-white mb-[10px] px-4 py-[14px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-[800] text-[15px]">Shop by Category</h2>
          <button onClick={() => router.push('/buyer/categories')} className="text-[12px] font-[700] text-[#F85606]">All →</button>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-[10px]">
          {CATEGORIES.map((c) => {
            const Icon = c.icon
            return (
              <button key={c.slug} onClick={() => router.push(`/buyer/category/${c.slug}`)}
                className="flex flex-col items-center gap-[5px] group">
                <div className="w-[54px] h-[54px] rounded-[14px] bg-[#F5F5F5] flex items-center justify-center group-hover:bg-[#FFF3EE] transition-colors">
                  <Icon size={24} style={{ color: c.color }} />
                </div>
                <span className="text-[11px] font-[700] text-center leading-[1.2]">{c.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-white mb-[10px] px-4 py-4 grid grid-cols-3 gap-3">
        {[
          { icon: MdLocalShipping, label: 'Fast Delivery', sub: 'Same-day orders', color: '#0066CC' },
          { icon: MdVerified, label: 'Verified Vendors', sub: 'Trusted sellers', color: '#00853D' },
          { icon: FaStar, label: '5-Star Service', sub: 'Rated by buyers', color: '#F85606' },
        ].map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: color + '18' }}>
              <Icon size={20} style={{ color }} />
            </div>
            <p className="text-[12px] font-[700]">{label}</p>
            <p className="text-[10px] text-[#757575]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Deal banners */}
      <div className="grid grid-cols-2 gap-[10px] px-[14px] mb-[10px]">
        <button onClick={() => router.push('/buyer/category/smartphones')}
          className="rounded-[10px] p-[16px] min-h-[105px] flex flex-col justify-end hover:scale-[.99] transition-transform"
          style={{ background: 'linear-gradient(135deg,#1a1a2e,#0f3460)' }}>
          <span className="text-[10px] font-[900] text-[#FFC200] uppercase tracking-[.06em] mb-1 flex items-center gap-1">
            <MdFlashOn size={12} /> Trending
          </span>
          <span className="text-white font-[800] text-[16px] leading-[1.2] block mb-2">Top Phones &amp; Gadgets</span>
          <span className="inline-block bg-[#FFC200] text-black text-[11px] font-[800] px-3 py-1 rounded-full self-start">Shop Now →</span>
        </button>
        <button onClick={() => router.push('/buyer/category/beauty')}
          className="rounded-[10px] p-[16px] min-h-[105px] flex flex-col justify-end hover:scale-[.99] transition-transform"
          style={{ background: 'linear-gradient(135deg,#3d0050,#7c3aed)' }}>
          <span className="text-[10px] font-[900] text-[#e9d5ff] uppercase tracking-[.06em] mb-1 flex items-center gap-1">
            <FaSprayCan size={11} /> Beauty Deals
          </span>
          <span className="text-white font-[800] text-[16px] leading-[1.2] block mb-2">Up to 40% Off</span>
          <span className="inline-block bg-white text-[#7C3AED] text-[11px] font-[800] px-3 py-1 rounded-full self-start">Explore →</span>
        </button>
      </div>

      {/* Product sections */}
      {SECTIONS.map(({ label, cat }) => (
        <div key={cat} className="bg-white mb-[10px]">
          <div className="flex items-center justify-between px-4 pt-3">
            <h2 className="font-[800] text-[15px]">{label}</h2>
            <button onClick={() => router.push(`/buyer/category/${cat}`)}
              className="bg-[#F85606] text-white text-[11px] font-[800] px-[14px] py-[5px] rounded-full hover:bg-[#e84e05] transition-colors">
              See all
            </button>
          </div>
          <div className="scroll-x px-[14px] py-3 pb-4">
            {loading[cat]
              ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex-shrink-0 w-[195px]"><ProductCardSkeleton /></div>)
              : (prods[cat] ?? []).map((p) => <div key={p.product_uuid} className="flex-shrink-0 w-[195px]"><ProductCard product={p} /></div>)}
          </div>
        </div>
      ))}
    </div>
  )
}
