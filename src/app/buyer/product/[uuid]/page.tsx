'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productsApi, reviewsApi } from '@/lib/api'
import type { Product, Review } from '@/types'
import { ngn, parseImages, dedupe } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import Stars from '@/components/ui/Stars'
import ProductCard from '@/components/buyer/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

export default function ProductPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const router = useRouter()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'desc' | 'specs' | 'reviews'>('desc')
  const [mainImg, setMainImg] = useState('')

  useEffect(() => {
    if (!uuid) return
    setLoading(true)
    Promise.all([productsApi.view(uuid), reviewsApi.get(uuid)])
      .then(([pr, rr]) => {
        const p = pr.data.product
        setProduct(p)
        const imgs = parseImages(p?.images ?? '')
        if (imgs[0]) setMainImg(imgs[0])
        setReviews(rr.data.reviews ?? [])
        if (p?.vendor_uuid) {
          productsApi.fetch({ vendor_uuid: p.vendor_uuid, limit: 8 })
            .then((r) => setRelated(dedupe((r.data.products ?? []).filter((x) => x.product_uuid !== uuid), 'product_uuid')))
            .catch(() => {})
        }
      }).catch(() => {}).finally(() => setLoading(false))
  }, [uuid])

  const handleAdd = () => {
    if (!product) return
    addToCart({ product_uuid: product.product_uuid, name: product.name, price: product.price, quantity: qty, images: product.images, vendor_uuid: product.vendor_uuid ?? '', vendor_name: product.vendor_name, vendor_photo: product.vendor_photo })
  }

  if (loading) return (
    <div className="max-w-[1280px] mx-auto px-[14px] py-6">
      <div className="grid md:grid-cols-2 gap-6"><ProductCardSkeleton /><div className="space-y-3"><div className="skeleton h-8 w-3/4" /><div className="skeleton h-5 w-1/2" /><div className="skeleton h-10 w-1/3 mt-4" /></div></div>
    </div>
  )
  if (!product) return <div className="p-8 text-center text-[#757575]">Product not found.</div>

  const imgs = parseImages(product.images)
  const display = mainImg || imgs[0]

  return (
    <div className="page-enter">
      <div className="bg-white py-[9px] border-b border-[#E8E8E8] mb-[10px]">
        <div className="max-w-[1280px] mx-auto px-[14px] flex items-center gap-[5px] text-xs text-[#757575]">
          <button onClick={() => router.push('/buyer')} className="hover:text-[#F85606]">Home</button>
          <span>›</span><button onClick={() => router.back()} className="hover:text-[#F85606]">Products</button>
          <span>›</span><span className="text-[#1A1A1A] line-clamp-1">{product.name}</span>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-[14px]">
        <div className="bg-white rounded-[6px] p-[18px] shadow-[var(--sh)] grid md:grid-cols-2 gap-6 items-start mb-3">
          <div>
            <div className="aspect-square rounded-[6px] overflow-hidden bg-[#F5F5F5] mb-2 flex items-center justify-center">
              {display ? <img src={display} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-8xl opacity-20">📦</span>}
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-[7px] overflow-x-auto [scrollbar-width:none]">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setMainImg(img)}
                    className={`w-[60px] h-[60px] rounded-[6px] overflow-hidden flex-shrink-0 border-2 transition-colors ${mainImg === img ? 'border-[#F85606]' : 'border-[#E8E8E8]'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-[12px] text-[#0066CC] font-[700] mb-1 cursor-pointer" onClick={() => router.push(`/buyer/vendor/${product.vendor_uuid}`)}>{product.vendor_name}</p>
            <h1 className="text-[20px] font-[800] leading-[1.25] mb-2" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>{product.name}</h1>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Stars rating={4.5} size={15} />
              <span className="text-[12px] text-[#0066CC]">({reviews.length} reviews)</span>
            </div>
            <p className="text-[26px] font-[900] text-[#F85606] mb-2" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>{ngn(product.price)}</p>
            <div className="bg-[#E8F7EF] text-[#00853D] text-[12px] font-[700] px-3 py-[7px] rounded-[6px] mb-4 flex items-center gap-2">
              🚚 Free delivery · Ships within 24hrs · 7-day returns
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[13px] font-[700] text-[#757575]">Qty</span>
              <div className="flex items-center border-[1.5px] border-[#D0D0D0] rounded-[6px]">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 flex items-center justify-center text-lg font-[700] hover:bg-[#FFF3EE] hover:text-[#F85606] transition-colors">−</button>
                <span className="px-[14px] text-[15px] font-[800]">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-9 h-9 flex items-center justify-center text-lg font-[700] hover:bg-[#FFF3EE] hover:text-[#F85606] transition-colors">+</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[10px]">
              <button onClick={handleAdd}
                className="py-[13px] bg-[#F85606] text-white text-[14px] font-[800] rounded-[6px] hover:bg-[#e84e05] transition-colors flex items-center justify-center gap-[6px]">
                🛒 Add to Cart
              </button>
              <button onClick={() => { handleAdd(); router.push('/buyer/checkout') }}
                className="py-[13px] bg-[#FFC200] text-black text-[14px] font-[800] rounded-[6px] hover:bg-[#e6af00] transition-colors flex items-center justify-center gap-[6px]">
                ⚡ Buy Now
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[6px] shadow-[var(--sh)] overflow-hidden mb-[10px]">
          <div className="flex border-b border-[#E8E8E8] overflow-x-auto [scrollbar-width:none]">
            {([['desc', 'Description'], ['specs', 'Specifications'], ['reviews', `Reviews (${reviews.length})`]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id as typeof tab)}
                className={`px-[18px] py-[11px] text-[13px] font-[800] whitespace-nowrap border-b-2 -mb-px transition-all ${tab === id ? 'text-[#F85606] border-[#F85606]' : 'text-[#757575] border-transparent hover:text-[#F85606]'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="px-[18px] py-4 text-[14px] text-[#757575] leading-[1.7]">
            {tab === 'desc' && <p>{product.description}</p>}
            {tab === 'specs' && (
              <table className="w-full border-collapse text-[13px]">
                <tbody>
                  {[['Vendor', product.vendor_name], ['Price', ngn(product.price)], ['Category', product.category ?? '—']].map(([k, v]) => (
                    <tr key={k}><td className="py-[8px] px-3 border border-[#E8E8E8] font-[700] bg-[#F5F5F5] w-[35%]">{k}</td><td className="py-[8px] px-3 border border-[#E8E8E8]">{v}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'reviews' && (
              reviews.length === 0
                ? <p className="text-center py-6">No reviews yet. Be the first!</p>
                : reviews.map((r, i) => (
                    <div key={i} className="border-b border-[#E8E8E8] pb-3 mb-3 last:border-0">
                      <div className="flex justify-between mb-1"><strong className="text-[13px]">{r.user_name}</strong><Stars rating={r.rating} size={12} /></div>
                      <p className="text-[13px]">{r.review}</p>
                    </div>
                  ))
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="bg-white mb-[10px]">
            <div className="px-4 pt-3"><h2 className="font-[800] text-[15px]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Related Products</h2></div>
            <div className="scroll-x px-[14px] py-3 pb-4">
              {related.map((p) => <div key={p.product_uuid} className="flex-shrink-0 w-[195px]"><ProductCard product={p} /></div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
