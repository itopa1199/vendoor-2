'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Heart } from 'lucide-react'
import Stars from '@/components/ui/Stars'
import { ngn, parseImages } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types'

export default function ProductCard({ product, className }: { product: Product; className?: string }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [wished, setWished] = useState(false)
  const imgs = parseImages(product.images)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      product_uuid: product.product_uuid,
      name: product.name,
      price: product.price,
      quantity: 1,
      images: product.images,
      vendor_uuid: product.vendor_uuid ?? '',
      vendor_name: product.vendor_name,
      vendor_photo: product.vendor_photo,
    })
  }

  return (
    <div onClick={() => router.push(`/buyer/product/${product.product_uuid}`)}
      className={`bg-white rounded-[10px] overflow-hidden cursor-pointer border border-[#E8E8E8] flex flex-col hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,.12)] transition-all duration-200 ${className ?? ''}`}>
      <div className="relative overflow-hidden bg-[#F5F5F5] flex items-center justify-center h-[170px]">
        {imgs[0]
          ? <img src={imgs[0]} alt={product.name} className="w-full h-full object-cover" />
          : <span className="text-5xl opacity-20">📦</span>}
        <button onClick={(e) => { e.stopPropagation(); setWished((w) => !w) }}
          className="absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-white/92 flex items-center justify-center shadow-sm hover:scale-110 transition-all">
          <Heart size={15} className={wished ? 'fill-[#e11d48] text-[#e11d48]' : 'text-[#aaa]'} />
        </button>
      </div>
      <div className="px-3 pb-3 pt-3 flex flex-col flex-1">
        <p className="text-[13px] font-[700] leading-[1.4] mb-1 line-clamp-2 min-h-[37px]">{product.name}</p>
        <p className="text-[11px] text-[#757575] mb-[5px] truncate">{product.vendor_name}</p>
        <div className="flex items-center gap-[3px] mb-[6px]"><Stars rating={4.5} size={11} /></div>
        <p className="text-[17px] font-[900] text-[#F85606] mb-2" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>{ngn(product.price)}</p>
        <button onClick={handleAdd}
          className="mt-auto w-full py-[9px] bg-[#F85606] text-white text-[12px] font-[800] rounded-[6px] hover:bg-[#e84e05] transition-colors flex items-center justify-center gap-[5px]">
          <ShoppingCart size={13} /> Add to Cart
        </button>
      </div>
    </div>
  )
}
