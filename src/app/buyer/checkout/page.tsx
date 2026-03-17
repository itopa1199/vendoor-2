'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { MdLock, MdLocalShipping, MdVerified } from 'react-icons/md'
import { SiPaystack } from 'react-icons/si'
import { FaShoppingCart } from 'react-icons/fa'
import { useCart } from '@/hooks/useCart'
import { billingApi, orderApi } from '@/lib/api'
import { ngn, parseImages, isValidEmail, isValidPhone } from '@/lib/utils'

declare global { interface Window { PaystackPop?: { setup: (c: { key: string; email: string; amount: number; currency: string; ref: string; onClose: () => void; callback: (r: { reference: string }) => void }) => { openIframe: () => void } } } }

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', note: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!isValidPhone(form.phone)) e.phone = 'Valid phone required'
    if (!isValidEmail(form.email)) e.email = 'Valid email required'
    if (!form.address.trim()) e.address = 'Delivery address required'
    setErrors(e); return !Object.keys(e).length
  }

  const handlePay = async () => {
    if (!validate()) return
    if (!items.length) { toast.error('Cart is empty'); return }
    setLoading(true)
    try {
      await billingApi.save(form.address)
      const ref = 'VND-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase()
      if (!window.PaystackPop) {
        await new Promise<void>((res) => { const s = document.createElement('script'); s.src = 'https://js.paystack.co/v1/inline.js'; s.onload = () => res(); document.head.appendChild(s) })
      }
      window.PaystackPop!.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY ?? 'pk_test_placeholder',
        email: form.email, amount: Math.round(total) * 100, currency: 'NGN', ref,
        onClose: () => { setLoading(false); toast.error('Payment cancelled') },
        callback: async (r) => {
          try { await orderApi.checkout(r.reference); clearCart(); router.push(`/buyer/success?ref=${r.reference}`) }
          catch { toast.error('Order confirmation failed. Contact support.') }
          finally { setLoading(false) }
        },
      }).openIframe()
    } catch { toast.error('Something went wrong. Try again.'); setLoading(false) }
  }

  if (!items.length) return (
    <div className="max-w-[860px] mx-auto px-[14px] py-12 text-center">
      <FaShoppingCart size={56} className="mx-auto mb-4 text-[#D0D0D0]" />
      <p className="font-[800] text-lg mb-2">Cart is empty</p>
      <button onClick={() => router.push('/buyer')} className="mt-4 px-6 py-3 bg-[#F85606] text-white font-[800] rounded-[6px] hover:bg-[#e84e05] transition-colors">Continue Shopping</button>
    </div>
  )

  const inp = (k: keyof typeof form) => `w-full px-[14px] py-[11px] border-[1.5px] rounded-[10px] text-sm outline-none transition-colors ${errors[k] ? 'border-red-400 focus:border-red-500' : 'border-[#D0D0D0] focus:border-[#F85606]'}`

  return (
    <div className="page-enter">
      <div className="bg-white py-[9px] border-b border-[#E8E8E8] mb-[10px]">
        <div className="max-w-[860px] mx-auto px-[14px] text-xs text-[#757575]">
          <button onClick={() => router.push('/buyer')} className="hover:text-[#F85606]">Home</button> › <span className="text-[#1A1A1A]">Checkout</span>
        </div>
      </div>
      <div className="max-w-[860px] mx-auto px-[14px] pb-8">
        <div className="grid md:grid-cols-[1fr_340px] gap-4 items-start">
          <div className="space-y-4">
            <div className="bg-white rounded-[6px] p-[18px] shadow-[var(--sh)]">
              <h2 className="text-[16px] font-[800] mb-4 pb-[10px] border-b border-[#E8E8E8] flex items-center gap-2">
                <MdLocalShipping size={18} className="text-[#F85606]" /> Delivery Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div><label className="block text-[11px] font-[800] text-[#757575] uppercase tracking-[.06em] mb-[5px]">Full Name</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Chidi Okonkwo" className={inp('name')} />{errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}</div>
                <div><label className="block text-[11px] font-[800] text-[#757575] uppercase tracking-[.06em] mb-[5px]">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="08012345678" className={inp('phone')} />{errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}</div>
              </div>
              <div className="mb-3"><label className="block text-[11px] font-[800] text-[#757575] uppercase tracking-[.06em] mb-[5px]">Email</label><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="chidi@email.com" className={inp('email')} />{errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}</div>
              <div className="mb-3"><label className="block text-[11px] font-[800] text-[#757575] uppercase tracking-[.06em] mb-[5px]">Delivery Address</label><input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Block C, Hall 3, Room 204…" className={inp('address')} />{errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}</div>
              <div><label className="block text-[11px] font-[800] text-[#757575] uppercase tracking-[.06em] mb-[5px]">Note (optional)</label><input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Special instructions?" className="w-full px-[14px] py-[11px] border-[1.5px] border-[#D0D0D0] rounded-[10px] text-sm outline-none focus:border-[#F85606] transition-colors" /></div>
            </div>

            <div className="bg-white rounded-[6px] p-[18px] shadow-[var(--sh)]">
              <h2 className="text-[16px] font-[800] mb-3 pb-[10px] border-b border-[#E8E8E8] flex items-center gap-2">
                <MdLock size={18} className="text-[#00853D]" /> Secure Payment
              </h2>
              <p className="text-[13px] text-[#757575] mb-4">100% secured by Paystack. We never store card details.</p>
              <button onClick={handlePay} disabled={loading}
                className="w-full py-[14px] bg-[#011B33] text-white text-[15px] font-[800] rounded-[6px] hover:bg-[#022444] transition-colors disabled:opacity-60 flex items-center justify-center gap-3">
                {loading ? '⏳ Processing…' : (
                  <>
                    <MdLock size={17} />
                    Pay with Paystack
                    <SiPaystack size={17} className="ml-1 opacity-80" />
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-[#757575]">
                <span className="flex items-center gap-1"><MdLock size={12} /> SSL Encrypted</span>
                <span className="flex items-center gap-1"><MdVerified size={12} className="text-[#00853D]" /> Verified Secure</span>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-[6px] p-[18px] shadow-[var(--sh)] sticky top-[108px]">
            <h2 className="text-[16px] font-[800] mb-4 pb-[10px] border-b border-[#E8E8E8] flex items-center gap-2">
              <FaShoppingCart size={15} className="text-[#F85606]" /> Order Summary
            </h2>
            {items.map((item) => {
              const img = parseImages(item.images)[0]
              return (
                <div key={item.product_uuid} className="flex gap-[10px] py-[9px] border-b border-[#E8E8E8]">
                  <div className="w-12 h-12 rounded-[6px] flex-shrink-0 overflow-hidden bg-[#F5F5F5] flex items-center justify-center">
                    {img ? <img src={img} alt={item.name} className="w-full h-full object-cover" /> : <FaShoppingCart size={18} className="text-[#D0D0D0]" />}
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-[13px] font-[700] truncate">{item.name}</p><p className="text-[12px] text-[#757575]">×{item.quantity}</p></div>
                  <span className="text-[14px] font-[900] text-[#F85606] flex-shrink-0">{ngn(item.price * item.quantity)}</span>
                </div>
              )
            })}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[13px]"><span>Subtotal</span><span>{ngn(total)}</span></div>
              <div className="flex justify-between text-[13px]">
                <span className="flex items-center gap-1"><MdLocalShipping size={13} className="text-[#00853D]" /> Delivery</span>
                <span className="text-[#00853D] font-[700]">Free</span>
              </div>
              <div className="flex justify-between text-[16px] font-[800] border-t-2 border-[#E8E8E8] pt-2 mt-2">
                <span>Total</span><span className="text-[#F85606] text-[19px]">{ngn(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
