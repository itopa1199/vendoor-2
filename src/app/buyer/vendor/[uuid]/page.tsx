'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { vendorsApi, productsApi } from '@/lib/api'
import type { Vendor, Product } from '@/types'
import ProductCard from '@/components/buyer/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import Stars from '@/components/ui/Stars'

export default function VendorProfilePage() {
  const { uuid } = useParams<{ uuid: string }>()
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uuid) return
    setLoading(true)
    Promise.all([vendorsApi.view(uuid), productsApi.fetch({ vendor_uuid: uuid, limit: 40 })])
      .then(([vr, pr]) => { setVendor(vr.data.vendor ?? null); setProducts(pr.data.products ?? []) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [uuid])

  if (loading) return <div className="max-w-[1280px] mx-auto px-[14px] py-6"><div className="skeleton h-[180px] rounded-[10px] mb-4" /><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[10px]">{Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div></div>
  if (!vendor) return <div className="p-8 text-center text-[#757575]">Vendor not found.</div>

  return (
    <div className="page-enter">
      <div className="bg-white py-[9px] border-b border-[#E8E8E8] mb-[10px]">
        <div className="max-w-[1280px] mx-auto px-[14px] text-xs text-[#757575]">
          <button onClick={() => router.push('/buyer')} className="hover:text-[#F85606]">Home</button> › <button onClick={() => router.push('/buyer/vendors')} className="hover:text-[#F85606]">Vendors</button> › <span className="text-[#1A1A1A]">{vendor.name}</span>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-[14px] pb-8">
        <div className="bg-white rounded-[10px] shadow-[var(--sh)] overflow-hidden mb-4">
          <div className="h-[150px] flex items-center justify-center bg-gradient-to-br from-[#FFF8E6] to-[#FEF0CC] relative">
            <span className="text-7xl opacity-40">🏪</span>
            <div className="absolute top-3 right-3 bg-[#FFC200] text-black text-[10px] font-[900] px-3 py-1 rounded-full">★ Verified</div>
          </div>
          <div className="px-6 pb-6 -mt-8 relative">
            <div className="w-[72px] h-[72px] rounded-[18px] border-[3px] border-white shadow-md bg-[#F5F5F5] overflow-hidden flex items-center justify-center mb-3">
              {vendor.profile_photo ? <img src={vendor.profile_photo} alt={vendor.name} className="w-full h-full object-cover" /> : <span className="text-3xl">🏪</span>}
            </div>
            <h1 className="text-[22px] font-[800]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>{vendor.name}</h1>
            <p className="text-[13px] text-[#757575] mt-1">{vendor.email}</p>
            <div className="flex gap-5 mt-4 p-4 bg-[#F5F5F5] rounded-[10px] border border-[#E8E8E8]">
              <div className="text-center flex-1"><p className="text-[18px] font-[700] text-[#F85606]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>{products.length}</p><p className="text-[11px] text-[#757575]">Products</p></div>
              <div className="text-center flex-1"><Stars rating={4.8} size={13} className="justify-center" /><p className="text-[11px] text-[#757575] mt-1">Rating</p></div>
              <div className="text-center flex-1"><p className="text-[18px] font-[700] text-[#00853D]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>4.2k</p><p className="text-[11px] text-[#757575]">Sales</p></div>
            </div>
          </div>
        </div>
        <h2 className="font-[800] text-[15px] mb-3" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Products ({products.length})</h2>
        {products.length === 0
          ? <div className="bg-white rounded-[10px] p-12 text-center shadow-[var(--sh)] text-[#757575]"><p className="text-4xl mb-3">📦</p><p className="font-[700]">No products listed yet</p></div>
          : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[10px]">{products.map((p) => <ProductCard key={p.product_uuid} product={p} />)}</div>}
      </div>
    </div>
  )
}
