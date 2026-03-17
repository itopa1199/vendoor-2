'use client'
import { useRouter, usePathname } from 'next/navigation'
import { MdHome, MdGridView, MdShoppingCart, MdPerson } from 'react-icons/md'
import { useCartStore } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import { cn } from '@/lib/utils'

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const count = useCartStore((s) => s.count())
  const { openCart, openSignIn } = useUIStore()

  const items = [
    { id: 'home', label: 'Home', icon: MdHome, href: '/buyer', action: () => router.push('/buyer') },
    { id: 'cats', label: 'Categories', icon: MdGridView, href: '/buyer/categories', action: () => router.push('/buyer/categories') },
    { id: 'cart', label: 'Cart', icon: MdShoppingCart, href: null, action: openCart, badge: count },
    { id: 'account', label: 'Account', icon: MdPerson, href: null, action: openSignIn },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[400] bg-white border-t border-[#E8E8E8] pb-[max(6px,env(safe-area-inset-bottom))]">
      <div className="flex justify-around">
        {items.map(({ id, label, icon: Icon, href, action, badge }) => {
          const active = href ? (href === '/buyer' ? pathname === '/buyer' : pathname?.startsWith(href)) : false
          return (
            <button key={id} onClick={action}
              className={cn('flex flex-col items-center gap-[2px] px-[10px] pt-[6px] pb-1 text-[10px] font-[800] transition-colors', active ? 'text-[#F85606]' : 'text-[#ABABAB]')}>
              <span className="relative w-6 h-6 flex items-center justify-center">
                <Icon size={24} />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-[1px] -right-[5px] bg-[#F85606] text-white text-[9px] font-[900] min-w-[15px] h-[15px] rounded-full px-[3px] flex items-center justify-center">{badge}</span>
                )}
              </span>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
