'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { productsApi } from '@/lib/api'
import { dedupe } from '@/lib/utils'
import type { Product, Vendor } from '@/types'
import ProductCard from '@/components/buyer/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

export default function SearchPage() {
  const params = useSearchParams()
  const router = useRouter()
  const q = params.get('q') ?? ''
  const [products, setProducts] = useState<Product[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    productsApi.search(q)
      .then((r) => { setProducts(dedupe(r.data.products ?? [], 'product_uuid')); setVendors(dedupe(r.data.vendors ?? [], 'uuid')) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [q])

  return (
    <div className="page-enter max-w-[1280px] mx-auto px-[14px] py-4">
      <div className="bg-white rounded-[6px] px-4 py-3 mb-4 shadow-[var(--sh)]">
        <p className="text-[13px] text-[#757575]">
          {loading ? 'Searching…' : <>{products.length} results for <strong className="text-[#1A1A1A]">"{q}"</strong></>}
        </p>
      </div>
      {vendors.length > 0 && (
        <div className="mb-5">
          <h2 className="font-[800] text-[15px] mb-3" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Vendors</h2>
          <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] pb-2">
            {vendors.map((v) => (
              <button key={v.uuid} onClick={() => router.push(`/buyer/vendor/${v.uuid}`)}
                className="flex-shrink-0 flex items-center gap-3 bg-white rounded-[10px] border border-[#E8E8E8] px-4 py-3 hover:border-[#F85606] transition-colors">
                {v.profile_photo ? <img src={v.profile_photo} alt={v.name} className="w-9 h-9 rounded-full object-cover" /> : <span className="text-xl">🏪</span>}
                <span className="text-[13px] font-[700]">{v.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[10px]">
        {loading ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.length > 0 ? products.map((p) => <ProductCard key={p.product_uuid} product={p} />)
          : !loading && <div className="col-span-full text-center py-16 text-[#757575]"><p className="text-5xl mb-4">🔍</p><p className="font-[700]">No results for "{q}"</p></div>}
      </div>
    </div>
  )
}
