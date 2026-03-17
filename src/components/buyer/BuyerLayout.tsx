'use client'
import { useEffect } from 'react'
import BuyerHeader from './BuyerHeader'
import BottomNav from './BottomNav'
import CartDrawer from './CartDrawer'
import SignInSheet from './SignInSheet'
import { useAuthStore } from '@/store/auth'

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const refreshIfNeeded = useAuthStore((s) => s.refreshIfNeeded)
  useEffect(() => {
    refreshIfNeeded()
    const t = setInterval(refreshIfNeeded, 60_000)
    return () => clearInterval(t)
  }, [refreshIfNeeded])

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <BuyerHeader />
      <main className="pb-[72px]">{children}</main>
      <BottomNav />
      <CartDrawer />
      <SignInSheet />
    </div>
  )
}
