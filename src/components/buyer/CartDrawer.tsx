'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MdClose, MdShoppingCart, MdAdd, MdRemove, MdDelete } from 'react-icons/md'
import { useUIStore } from '@/store/ui'
import { useCart } from '@/hooks/useCart'
import { parseImages, ngn } from '@/lib/utils'

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore()
  const { items, total, updateQuantity, removeFromCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/45 z-[500] transition-opacity duration-[280ms] ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />
      <div className={`fixed right-0 top-0 bottom-0 w-[380px] max-w-full bg-white z-[501] flex flex-col transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="px-5 py-[14px] bg-[#F85606] flex items-center justify-between flex-shrink-0">
          <h2 className="text-white text-[16px] font-[800] flex items-center gap-2">
            <MdShoppingCart size={20} />
            Cart
            <span className="bg-white/20 text-white text-[12px] font-[700] px-[8px] py-[2px] rounded-full ml-1">{items.length}</span>
          </h2>
          <button onClick={closeCart} className="text-white/80 hover:text-white transition-colors p-1"><MdClose size={22} /></button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#757575]">
              <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <MdShoppingCart size={40} className="text-[#D0D0D0]" />
              </div>
              <strong className="text-[15px]">Your cart is empty</strong>
              <span className="text-[13px] text-[#ABABAB]">Browse products and add items</span>
              <button onClick={() => { closeCart(); router.push('/buyer') }}
                className="mt-2 px-5 py-[10px] bg-[#F85606] text-white text-[13px] font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors">
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const imgs = parseImages(item.images)
              return (
                <div key={item.product_uuid} className="flex gap-3 py-3 border-b border-[#F0F0F0]">
                  <div className="w-[60px] h-[60px] rounded-[8px] flex-shrink-0 overflow-hidden bg-[#F5F5F5] flex items-center justify-center">
                    {imgs[0] ? <img src={imgs[0]} alt={item.name} className="w-full h-full object-cover" /> : <MdShoppingCart size={22} className="text-[#D0D0D0]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-[700] truncate leading-tight">{item.name}</p>
                    <p className="text-[11px] text-[#757575] mt-[2px] truncate">{item.vendor_name}</p>
                    <p className="text-[14px] font-[900] text-[#F85606] mt-[4px]">{ngn(item.price * item.quantity)}</p>
                    <div className="flex items-center gap-1 mt-[6px]">
                      <button onClick={() => updateQuantity(item.product_uuid, item.quantity - 1)}
                        className="w-[26px] h-[26px] rounded-[6px] bg-[#F5F5F5] border border-[#E8E8E8] flex items-center justify-center hover:border-[#F85606] hover:text-[#F85606] transition-colors">
                        <MdRemove size={14} />
                      </button>
                      <span className="text-[13px] font-[800] min-w-[24px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_uuid, item.quantity + 1)}
                        className="w-[26px] h-[26px] rounded-[6px] bg-[#F5F5F5] border border-[#E8E8E8] flex items-center justify-center hover:border-[#F85606] hover:text-[#F85606] transition-colors">
                        <MdAdd size={14} />
                      </button>
                      <button onClick={() => removeFromCart(item.product_uuid)}
                        className="ml-2 w-[26px] h-[26px] rounded-[6px] bg-red-50 flex items-center justify-center hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors">
                        <MdDelete size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-4 py-4 border-t border-[#E8E8E8] flex-shrink-0">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-[14px] font-[700] text-[#757575]">Total</span>
              <span className="text-[22px] font-[900] text-[#F85606]">{ngn(total)}</span>
            </div>
            <button onClick={() => { closeCart(); router.push('/buyer/checkout') }}
              className="w-full py-[14px] bg-[#F85606] text-white text-[15px] font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors flex items-center justify-center gap-2">
              <MdShoppingCart size={18} /> Proceed to Checkout
            </button>
            <button onClick={closeCart}
              className="w-full py-[10px] text-[13px] text-[#757575] font-[600] mt-1 hover:text-[#1A1A1A] transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
