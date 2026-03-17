'use client'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cart'
import { cartApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useUIStore } from '@/store/ui'
import type { CartItem } from '@/types'

export function useCart() {
  const store = useCartStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const openCart = useUIStore((s) => s.openCart)

  const addToCart = (item: CartItem) => {
    store.addItem(item)
    toast.success('Added to cart')
    openCart()
    if (isAuthenticated()) {
      cartApi.add(item.product_uuid, item.quantity).catch(() => {})
    }
  }

  const removeFromCart = (uuid: string) => {
    store.removeItem(uuid)
    if (isAuthenticated()) cartApi.remove(uuid).catch(() => {})
  }

  const updateQuantity = (uuid: string, qty: number) => {
    store.updateQty(uuid, qty)
    if (isAuthenticated()) cartApi.update(uuid, qty).catch(() => {})
  }

  const syncFromServer = async () => {
    try {
      const res = await cartApi.get()
      if (res.data.cart?.length) store.setItems(res.data.cart)
    } catch {}
  }

  return {
    items: store.items,
    total: store.total(),
    count: store.count(),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart: store.clearCart,
    syncFromServer,
  }
}
