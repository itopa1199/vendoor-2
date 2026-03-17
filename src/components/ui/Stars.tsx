'use client'
import { Star } from 'lucide-react'
export default function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  const filled = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-[2px]">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} width={size} height={size}
          className={i < filled ? 'fill-[#FFC200] text-[#FFC200]' : 'fill-[#E0E0E0] text-[#E0E0E0]'} />
      ))}
    </span>
  )
}
