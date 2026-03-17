'use client'
import { create } from 'zustand'

interface UIState {
  cartOpen: boolean
  signInOpen: boolean
  openCart: () => void
  closeCart: () => void
  openSignIn: () => void
  closeSignIn: () => void
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  signInOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  openSignIn: () => set({ signInOpen: true }),
  closeSignIn: () => set({ signInOpen: false }),
}))
