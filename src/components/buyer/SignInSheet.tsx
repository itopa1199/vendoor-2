'use client'
import { useRouter } from 'next/navigation'
import { MdStorefront, MdShoppingBag, MdListAlt, MdLogout } from 'react-icons/md'
import { useUIStore } from '@/store/ui'
import { useAuthStore } from '@/store/auth'

export default function SignInSheet() {
  const { signInOpen, closeSignIn } = useUIStore()
  const { user, isAuthenticated, isVendor, clearAuth } = useAuthStore()
  const router = useRouter()

  if (!signInOpen) return null
  const go = (path: string) => { closeSignIn(); router.push(path) }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[600]" onClick={closeSignIn} />
      <div className="fixed bottom-0 left-0 right-0 z-[601] flex justify-center">
        <div className="bg-white rounded-t-[20px] w-full max-w-[480px] px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-5 slide-up" onClick={(e) => e.stopPropagation()}>
          <div className="w-[34px] h-1 bg-[#D0D0D0] rounded-full mx-auto mb-5" />

          {isAuthenticated() ? (
            <>
              <div className="flex items-center gap-4 mb-5 p-4 bg-[#F5F5F5] rounded-[12px]">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isVendor() ? 'bg-[#E8F7EF]' : 'bg-[#FFF3EE]'}`}>
                  {isVendor() ? <MdStorefront size={26} className="text-[#00853D]" /> : <MdShoppingBag size={24} className="text-[#F85606]" />}
                </div>
                <div>
                  <p className="font-[800] text-[15px]">{user?.name}</p>
                  <p className="text-[12px] text-[#757575]">{user?.email}</p>
                  <span className={`text-[10px] font-[800] px-2 py-[2px] rounded-full mt-1 inline-block ${isVendor() ? 'bg-[#E8F7EF] text-[#00853D]' : 'bg-[#FFF3EE] text-[#F85606]'}`}>
                    {isVendor() ? '🏪 Vendor' : '🛍️ Customer'}
                  </span>
                </div>
              </div>

              {isVendor() && (
                <button onClick={() => go('/vendor/dashboard')}
                  className="w-full py-[13px] bg-[#00853D] text-white font-[800] rounded-[10px] hover:bg-[#006b31] transition-colors mb-2 flex items-center justify-center gap-2">
                  <MdStorefront size={18} /> Go to Vendor Dashboard →
                </button>
              )}
              <button onClick={() => go('/buyer/orders')}
                className="w-full py-[13px] bg-[#F5F5F5] text-[#1A1A1A] font-[700] rounded-[10px] border border-[#E8E8E8] hover:bg-[#EBEBEB] transition-colors mb-2 flex items-center justify-center gap-2">
                <MdListAlt size={17} /> My Orders
              </button>
              <button onClick={() => { clearAuth(); closeSignIn() }}
                className="w-full py-[12px] text-[#E01D1D] font-[700] text-[13px] flex items-center justify-center gap-2">
                <MdLogout size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <h2 className="text-[20px] font-[800] text-center mb-1">Join Vendoor</h2>
              <p className="text-[13px] text-[#757575] text-center mb-5">Sign in to track orders, get deals, or start selling</p>
              <button onClick={() => go('/auth')}
                className="w-full py-[14px] bg-[#F85606] text-white text-[15px] font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors mb-2">
                Sign In →
              </button>
              <button onClick={() => go('/auth?mode=signup')}
                className="w-full py-[14px] bg-[#F5F5F5] text-[#1A1A1A] font-[700] text-[14px] rounded-[10px] border border-[#E8E8E8] hover:bg-[#EBEBEB] transition-colors">
                Create Account
              </button>
              <button onClick={closeSignIn} className="block w-full text-center mt-3 text-[13px] text-[#757575]">Continue as guest</button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
