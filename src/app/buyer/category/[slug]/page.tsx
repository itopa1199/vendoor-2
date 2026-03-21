'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productsApi } from '@/lib/api'
import { dedupe } from '@/lib/utils'
import type { Product } from '@/types'
import ProductCard from '@/components/buyer/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

const LABELS: Record<string, string> = {
  smartphones: 'Phones & Tablets', laptops: 'Laptops & Computing',
  'womens-clothing': "Women's Fashion", 'mens-clothing': "Men's Fashion",
  beauty: 'Beauty & Health', fragrances: 'Fragrances',
  'home-decoration': 'Home Decor', groceries: 'Groceries & Food',
  'sports-accessories': 'Sports & Fitness', 'skin-care': 'Skincare',
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('')
  const label = LABELS[slug] ?? slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  useEffect(() => {
    setLoading(true)
    productsApi.fetch({ category: slug, limit: 40 })
      .then((r) => { const p = dedupe(r.data.products ?? [], 'product_uuid'); setProducts(p); setFiltered(p) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [slug])

  const handleSort = (v: string) => {
    setSort(v)
    const s = [...products]
    if (v === 'asc') s.sort((a, b) => a.price - b.price)
    else if (v === 'desc') s.sort((a, b) => b.price - a.price)
    setFiltered(s)
  }

  return (
    <div className="page-enter">
      <div className="bg-white py-[9px] border-b border-[#E8E8E8] mb-[10px]">
        <div className="max-w-[1280px] mx-auto px-[14px] flex items-center gap-[5px] text-xs text-[#757575]">
          <button onClick={() => router.push('/buyer')} className="hover:text-[#F85606]">Home</button>
          <span>›</span><span className="text-[#1A1A1A]">{label}</span>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-[14px] pb-6">
        <div className="bg-white rounded-[6px] px-4 py-3 mb-3 flex items-center gap-3 flex-wrap shadow-[var(--sh)]">
          <p className="text-[13px] text-[#757575]">{loading ? 'Loading…' : `${filtered.length} products`}</p>
          <select value={sort} onChange={(e) => handleSort(e.target.value)}
            className="ml-auto px-3 py-2 border-[1.5px] border-[#D0D0D0] rounded-[6px] text-[13px] font-[700] outline-none bg-white cursor-pointer">
            <option value="">Sort: Relevance</option>
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </select>
        </div>
        <div className="grid md:grid-cols-[200px_1fr] gap-[14px] items-start">
          <div className="hidden md:block bg-white rounded-[6px] p-[14px] shadow-[var(--sh)] sticky top-[108px]">
            <h3 className="font-[800] text-[14px] mb-3 pb-2 border-b-2 border-[#F85606]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Filters</h3>
            <p className="text-[11px] font-[900] uppercase tracking-[.06em] text-[#757575] mb-2">Price Range</p>
            {['Under ₦10,000', '₦10k – ₦50k', '₦50k – ₦150k', 'Above ₦150k'].map((l) => (
              <label key={l} className="flex items-center gap-2 py-1 cursor-pointer text-[13px]">
                <input type="checkbox" className="accent-[#F85606] w-[14px] h-[14px]" />{l}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[10px]">
            {loading ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : filtered.length > 0 ? filtered.map((p) => <ProductCard key={p.product_uuid} product={p} />)
              : <p className="col-span-full text-center py-12 text-[#757575]">No products found in this category.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
