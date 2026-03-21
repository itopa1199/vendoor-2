'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MdShoppingCart, MdFavoriteBorder, MdFavorite, MdStar } from 'react-icons/md'
import { ngn, parseImages } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types'

export default function ProductCard({ product, className }: { product: Product; className?: string }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [wished, setWished] = useState(false)
  const [adding, setAdding] = useState(false)
  const imgs = parseImages(product.images)

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setAdding(true)
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
    setTimeout(() => setAdding(false), 800)
  }

  const handleWish = (e: React.MouseEvent) => {
    e.stopPropagation()
    setWished((w) => !w)
  }

  return (
    <div
      onClick={() => router.push(`/buyer/product/${product.product_uuid}`)}
      className={`bg-white rounded-[10px] overflow-hidden cursor-pointer border border-[#E8E8E8] flex flex-col hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,.12)] transition-all duration-200 ${className ?? ''}`}>

      {/* Image */}
      <div className="relative overflow-hidden bg-[#F5F5F5] flex items-center justify-center h-[160px]">
        {imgs[0]
          ? <img src={imgs[0]} alt={product.name} className="w-full h-full object-cover" />
          : <MdShoppingCart size={40} className="text-[#D0D0D0]" />}

        {/* Wishlist */}
        <button
          onClick={handleWish}
          className="absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-white/92 flex items-center justify-center shadow-sm hover:scale-110 transition-all">
          {wished
            ? <MdFavorite size={16} className="text-[#e11d48]" />
            : <MdFavoriteBorder size={16} className="text-[#ABABAB]" />}
        </button>
      </div>

      {/* Body */}
      <div className="px-3 pb-3 pt-3 flex flex-col flex-1">
        <p className="text-[13px] font-[700] leading-[1.4] mb-1 line-clamp-2 min-h-[37px]">{product.name}</p>
        <p className="text-[11px] text-[#757575] mb-[4px] truncate">{product.vendor_name}</p>

        {/* Stars */}
        <div className="flex items-center gap-[3px] mb-[6px]">
          {[...Array(5)].map((_, i) => (
            <MdStar key={i} size={12} className={i < 4 ? 'text-[#FFC200]' : 'text-[#E0E0E0]'} />
          ))}
          <span className="text-[10px] text-[#ABABAB] ml-1">(128)</span>
        </div>

        <p className="text-[16px] font-[900] text-[#F85606] mb-2">{ngn(product.price)}</p>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          className={`mt-auto w-full py-[9px] text-[12px] font-[800] rounded-[6px] transition-all flex items-center justify-center gap-[5px] ${
            adding
              ? 'bg-[#00853D] text-white scale-95'
              : 'bg-[#F85606] text-white hover:bg-[#e84e05]'
          }`}>
          <MdShoppingCart size={14} />
          {adding ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
