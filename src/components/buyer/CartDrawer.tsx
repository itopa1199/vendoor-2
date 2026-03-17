'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ShoppingCart } from 'lucide-react'
import { useUIStore } from '@/store/ui'
import { useCart } from '@/hooks/useCart'
import { parseImages, ngn } from '@/lib/utils'

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore()
  const { items, total, updateQuantity, removeFromCart } = useCart()
  const router = useRouter()

  useEffect(() => { document.body.style.overflow = cartOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [cartOpen])

  return (
    <>
      <div className={`fixed inset-0 bg-black/45 z-[500] transition-opacity duration-[280ms] ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeCart} />
      <div className={`fixed right-0 top-0 bottom-0 w-[380px] max-w-full bg-white z-[501] flex flex-col transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-5 py-[14px] bg-[#F85606] flex items-center justify-between flex-shrink-0">
          <h2 className="text-white text-base font-[800]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Cart ({items.length})</h2>
          <button onClick={closeCart} className="text-white/80 hover:text-white"><X size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#757575]">
              <ShoppingCart size={56} className="text-[#ABABAB]" />
              <strong className="text-[15px]">Your cart is empty</strong>
              <span className="text-[13px]">Browse products and add items</span>
            </div>
          ) : items.map((item) => {
            const imgs = parseImages(item.images)
            return (
              <div key={item.product_uuid} className="flex gap-3 py-3 border-b border-[#E8E8E8]">
                <div className="w-16 h-16 rounded-[6px] flex-shrink-0 overflow-hidden bg-[#F5F5F5] flex items-center justify-center">
                  {imgs[0] ? <img src={imgs[0]} alt={item.name} className="w-full h-full object-cover" /> : <ShoppingCart size={20} className="text-[#ABABAB]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-[700] truncate">{item.name}</p>
                  <p className="text-[11px] text-[#757575]">{item.vendor_name}</p>
                  <p className="text-[15px] font-[900] text-[#F85606] mt-1">{ngn(item.price * item.quantity)}</p>
                  <div className="flex items-center gap-2 mt-[6px]">
                    <button onClick={() => updateQuantity(item.product_uuid, item.quantity - 1)} className="w-6 h-6 rounded-[4px] bg-[#F5F5F5] border border-[#D0D0D0] flex items-center justify-center text-sm font-[700] hover:border-[#F85606] hover:text-[#F85606]">−</button>
                    <span className="text-[13px] font-[800] min-w-[20px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_uuid, item.quantity + 1)} className="w-6 h-6 rounded-[4px] bg-[#F5F5F5] border border-[#D0D0D0] flex items-center justify-center text-sm font-[700] hover:border-[#F85606] hover:text-[#F85606]">+</button>
                    <button onClick={() => removeFromCart(item.product_uuid)} className="ml-1 text-[10px] text-[#E01D1D] font-[700]">Remove</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {items.length > 0 && (
          <div className="px-4 py-[14px] border-t border-[#E8E8E8] flex-shrink-0">
            <div className="flex justify-between mb-3 text-[15px] font-[700]">
              <span>Total</span>
              <span className="text-[#F85606] text-[20px] font-[900]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>{ngn(total)}</span>
            </div>
            <button onClick={() => { closeCart(); router.push('/buyer/checkout') }}
              className="w-full py-[14px] bg-[#F85606] text-white text-[15px] font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors">
              Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
