'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  setItems: (items: CartItem[]) => void
  addItem: (item: CartItem) => void
  removeItem: (uuid: string) => void
  updateQty: (uuid: string, qty: number) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      addItem: (item) => set((s) => {
        const existing = s.items.find((i) => i.product_uuid === item.product_uuid)
        if (existing) return { items: s.items.map((i) => i.product_uuid === item.product_uuid ? { ...i, quantity: i.quantity + item.quantity } : i) }
        return { items: [...s.items, item] }
      }),
      removeItem: (uuid) => set((s) => ({ items: s.items.filter((i) => i.product_uuid !== uuid) })),
      updateQty: (uuid, qty) => set((s) => ({
        items: qty <= 0 ? s.items.filter((i) => i.product_uuid !== uuid) : s.items.map((i) => i.product_uuid === uuid ? { ...i, quantity: qty } : i),
      })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'vd-cart', partialize: (s) => ({ items: s.items }) }
  )
)
