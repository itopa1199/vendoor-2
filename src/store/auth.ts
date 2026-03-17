'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { refreshJwtToken } from '@/lib/axios'
import type { AuthUser, AccountType, SignInResponse } from '@/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  tokenExpiry: number | null
  refreshToken: string | null
  accountType: AccountType | null
  setAuth: (d: SignInResponse) => void
  clearAuth: () => void
  refreshIfNeeded: () => Promise<void>
  isAuthenticated: () => boolean
  isVendor: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, token: null, tokenExpiry: null, refreshToken: null, accountType: null,

      setAuth: (d) => {
        Cookies.set('vd_jwt', d.jwt_token, { expires: 7, sameSite: 'lax' })
        Cookies.set('vd_expiry', String(d.jwt_expiry), { expires: 7, sameSite: 'lax' })
        Cookies.set('vd_refresh', d.jwt_refresh, { expires: 30, sameSite: 'lax' })
        Cookies.set('vd_uuid', d.data.uuid, { expires: 30, sameSite: 'lax' })
        set({ user: d.data, token: d.jwt_token, tokenExpiry: d.jwt_expiry, refreshToken: d.jwt_refresh, accountType: d.data.account_type ?? 'user' })
      },

      clearAuth: () => {
        ;['vd_jwt', 'vd_expiry', 'vd_refresh', 'vd_uuid'].forEach((k) => Cookies.remove(k))
        set({ user: null, token: null, tokenExpiry: null, refreshToken: null, accountType: null })
      },

      refreshIfNeeded: async () => {
        const { token, tokenExpiry } = get()
        if (!token || !tokenExpiry) return
        if (tokenExpiry - Math.floor(Date.now() / 1000) < 300) {
          const fresh = await refreshJwtToken()
          if (fresh) set({ token: fresh.jwt_token, tokenExpiry: fresh.jwt_expiry })
        }
      },

      isAuthenticated: () => {
        const { token, tokenExpiry } = get()
        return !!token && !!tokenExpiry && tokenExpiry > Math.floor(Date.now() / 1000)
      },

      isVendor: () => get().accountType === 'vendor',
    }),
    { name: 'vd-auth', partialize: (s) => ({ user: s.user, token: s.token, tokenExpiry: s.tokenExpiry, refreshToken: s.refreshToken, accountType: s.accountType }) }
  )
)
