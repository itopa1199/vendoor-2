'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { vendorsApi } from '@/lib/api'
import { dedupe } from '@/lib/utils'
import type { Vendor } from '@/types'
import Stars from '@/components/ui/Stars'

export default function VendorsPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { vendorsApi.browse().then((r) => setVendors(dedupe(r.data.vendors ?? [], 'uuid'))).catch(() => {}).finally(() => setLoading(false)) }, [])
  return (
    <div className="page-enter">
      <div className="max-w-[1280px] mx-auto px-[14px] py-4">
        <h1 className="font-[800] text-[18px] mb-4" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>⭐ All Verified Vendors</h1>
        {loading ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[14px]">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton h-[200px] rounded-[10px]" />)}</div>
          : vendors.length === 0 ? <div className="bg-white rounded-[10px] p-12 text-center text-[#757575] shadow-[var(--sh)]"><p className="text-4xl mb-3">🏪</p><p className="font-[700]">No vendors yet</p></div>
          : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[14px]">
              {vendors.map((v) => (
                <div key={v.uuid} onClick={() => router.push(`/buyer/vendor/${v.uuid}`)}
                  className="bg-white rounded-[10px] border-2 border-[#F5D77A] overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(248,86,6,.18)] hover:border-[#F85606] transition-all">
                  <div className="h-[90px] flex items-center justify-center bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] relative">
                    {v.profile_photo ? <img src={v.profile_photo} alt={v.name} className="w-12 h-12 rounded-full object-cover" /> : <span className="text-4xl">🏪</span>}
                    <span className="absolute top-[7px] left-[7px] bg-[#FFC200] text-black text-[9px] font-[900] px-2 py-[2px] rounded-full">★ Spotlight</span>
                  </div>
                  <div className="p-[10px_12px]">
                    <p className="text-[13px] font-[800] truncate">{v.name}</p>
                    <p className="text-[11px] text-[#757575] truncate">{v.email}</p>
                    <Stars rating={4.7} size={10} className="mt-[5px]" />
                  </div>
                  <div className="bg-[#F85606] text-white text-center py-[6px] text-[11px] font-[800]">Visit Store →</div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
