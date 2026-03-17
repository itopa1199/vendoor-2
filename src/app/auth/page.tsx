'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { isValidEmail, isValidPhone, getDeviceInfo } from '@/lib/utils'
import type { AccountType, SignInResponse } from '@/types'

type Mode = 'signin' | 'signup' | 'otp' | 'forgot'

export default function AuthPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { setAuth, isAuthenticated, isVendor } = useAuthStore()

  const [mode, setMode] = useState<Mode>((params.get('mode') as Mode) ?? 'signin')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // signup
  const [su, setSu] = useState({ name: '', email: '', phone: '', password: '', confirm: '', account_type: 'user' as AccountType })
  // signin
  const [si, setSi] = useState({ contact: '', password: '', by: 'email' as 'email' | 'phone' })
  // otp
  const [otp, setOtp] = useState({ code: '', uuid: '', email: '' })
  // forgot
  const [forgot, setForgot] = useState({ email: '', sent: false })

  useEffect(() => {
    if (isAuthenticated()) router.replace(isVendor() ? '/vendor/dashboard' : '/buyer')
  }, []) // eslint-disable-line

  const go = (accountType: AccountType) => {
    router.push(accountType === 'vendor' ? '/vendor/dashboard' : '/buyer')
  }

  // ── SIGNUP ──────────────────────────────────────────────────────────────────
  const validateSu = () => {
    const e: Record<string, string> = {}
    if (!su.name.trim()) e.name = 'Required'
    if (!isValidEmail(su.email)) e.email = 'Valid email required'
    if (!isValidPhone(su.phone)) e.phone = 'Valid Nigerian phone required'
    if (su.password.length < 8) e.password = 'Min 8 characters'
    if (su.password !== su.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSignup = async () => {
    if (!validateSu()) return
    setLoading(true)
    try {
      const res = await authApi.signUp({ name: su.name, email: su.email, phone: su.phone, password: su.password, account_type: su.account_type })
      if (res.data.status) {
        setOtp({ code: '', uuid: res.data.otp_uuid ?? res.data.email_verification_uuid ?? '', email: su.email })
        setMode('otp')
        toast.success('Check your email for the OTP')
      } else toast.error(res.data.message ?? 'Signup failed')
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Signup failed')
    } finally { setLoading(false) }
  }

  // ── OTP ─────────────────────────────────────────────────────────────────────
  const handleOtp = async () => {
    if (otp.code.length < 4) { toast.error('Enter the OTP'); return }
    setLoading(true)
    try {
      const res = await authApi.verifyOtp({ otp: otp.code, otp_uuid: otp.uuid, email: otp.email })
      const d = res.data
      if (d.status && d.jwt_token && d.data) {
        setAuth({ status: true, message: '', data: d.data, jwt_token: d.jwt_token, jwt_expiry: d.jwt_expiry ?? 0, jwt_refresh: d.jwt_refresh ?? '', jwt_refresh_exp: 0 })
        toast.success(`Welcome, ${d.data.name.split(' ')[0]}! 🎉`)
        go(d.data.account_type)
      } else toast.error(d.message ?? 'Invalid OTP')
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Verification failed')
    } finally { setLoading(false) }
  }

  // ── SIGNIN ──────────────────────────────────────────────────────────────────
  const handleSignin = async () => {
    if (!si.contact.trim()) { toast.error('Enter email or phone'); return }
    if (!si.password) { toast.error('Enter password'); return }
    setLoading(true)
    try {
      const res = await authApi.signIn({
        email: si.by === 'email' ? si.contact : '',
        phone: si.by === 'phone' ? si.contact : '',
        password: si.password,
        device_info: getDeviceInfo(),
      })
      const d = res.data as SignInResponse
      if (d.status) {
        setAuth(d)
        toast.success(`Welcome back, ${d.data.name.split(' ')[0]}!`)
        go(d.data.account_type)
      } else toast.error(d.message ?? 'Login failed')
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid credentials')
    } finally { setLoading(false) }
  }

  // ── FORGOT ──────────────────────────────────────────────────────────────────
  const handleForgot = async () => {
    if (!isValidEmail(forgot.email)) { toast.error('Enter a valid email'); return }
    setLoading(true)
    try {
      await authApi.forgotPassword(forgot.email)
      setForgot((f) => ({ ...f, sent: true }))
    } catch { toast.error('Failed to send reset link') }
    finally { setLoading(false) }
  }

  const inp = (err?: string) => `w-full px-4 py-[13px] border-[1.5px] rounded-[10px] text-[14px] outline-none transition-colors bg-white ${err ? 'border-red-400 focus:border-red-500' : 'border-[#D0D0D0] focus:border-[#F85606]'}`

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-[430px]">
        {/* Logo */}
        <button onClick={() => router.push('/buyer')} className="block text-center mb-7 w-full">
          <span className="text-[32px] font-[800] text-[#F85606]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>
            Vend<span className="text-[#FFC200]">oor</span>
          </span>
          <p className="text-[13px] text-[#757575] mt-1">Nigeria's campus marketplace</p>
        </button>

        <div className="bg-white rounded-[20px] shadow-[0_4px_28px_rgba(0,0,0,.09)]">

          {/* ── SIGN IN ── */}
          {mode === 'signin' && (
            <div className="p-7">
              <h2 className="text-[26px] font-[800] mb-1" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Welcome back</h2>
              <p className="text-[13px] text-[#757575] mb-5">No account? <button onClick={() => { setMode('signup'); setErrors({}) }} className="text-[#F85606] font-[700]">Create one free →</button></p>

              <div className="flex bg-[#F5F5F5] rounded-[10px] p-[3px] mb-4">
                {(['email', 'phone'] as const).map((t) => (
                  <button key={t} onClick={() => setSi((s) => ({ ...s, by: t, contact: '' }))}
                    className={`flex-1 py-[8px] rounded-[8px] text-[13px] font-[800] transition-all ${si.by === t ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-[#757575]'}`}>
                    {t === 'email' ? '✉️ Email' : '📱 Phone'}
                  </button>
                ))}
              </div>

              <div className="space-y-3 mb-2">
                <input type={si.by === 'email' ? 'email' : 'tel'} value={si.contact}
                  onChange={(e) => setSi((s) => ({ ...s, contact: e.target.value }))}
                  placeholder={si.by === 'email' ? 'your@email.com' : '08012345678'} className={inp()} autoFocus />
                <input type="password" value={si.password}
                  onChange={(e) => setSi((s) => ({ ...s, password: e.target.value }))}
                  placeholder="Password" className={inp()} onKeyDown={(e) => e.key === 'Enter' && handleSignin()} />
              </div>

              <div className="flex justify-end mb-5">
                <button onClick={() => setMode('forgot')} className="text-[12px] text-[#F85606] font-[600]">Forgot password?</button>
              </div>

              <button onClick={handleSignin} disabled={loading}
                className="w-full py-[14px] bg-[#F85606] text-white text-[15px] font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors disabled:opacity-60">
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </div>
          )}

          {/* ── SIGN UP ── */}
          {mode === 'signup' && (
            <div className="p-7">
              <h2 className="text-[26px] font-[800] mb-1" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Create Account</h2>
              <p className="text-[13px] text-[#757575] mb-5">Have an account? <button onClick={() => { setMode('signin'); setErrors({}) }} className="text-[#F85606] font-[700]">Sign in</button></p>

              {/* Account type */}
              <div className="mb-4">
                <label className="block text-[11px] font-[800] text-[#757575] uppercase tracking-[.07em] mb-2">Choose Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'user', label: 'Customer', desc: 'Buy products', icon: '🛍️' },
                    { value: 'vendor', label: 'Vendor / Seller', desc: 'Sell products', icon: '🏪' },
                  ] as { value: AccountType; label: string; desc: string; icon: string }[]).map((at) => (
                    <button key={at.value} onClick={() => setSu((s) => ({ ...s, account_type: at.value }))}
                      className={`flex flex-col items-start p-[12px] rounded-[12px] border-2 text-left transition-all ${su.account_type === at.value ? 'border-[#F85606] bg-[#FFF3EE]' : 'border-[#E8E8E8] hover:border-[#F85606]/50'}`}>
                      <span className="text-[22px] mb-[4px]">{at.icon}</span>
                      <span className="text-[13px] font-[800] block">{at.label}</span>
                      <span className="text-[11px] text-[#757575]">{at.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: su.account_type === 'vendor' ? 'Business / Store Name' : 'Full Name', key: 'name', placeholder: su.account_type === 'vendor' ? 'Mama Kitchen' : 'Chidi Okonkwo', type: 'text' },
                  { label: 'Email Address', key: 'email', placeholder: 'you@email.com', type: 'email' },
                  { label: 'Phone Number', key: 'phone', placeholder: '08012345678', type: 'tel' },
                  { label: 'Password', key: 'password', placeholder: 'At least 8 characters', type: 'password' },
                  { label: 'Confirm Password', key: 'confirm', placeholder: 'Repeat password', type: 'password' },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-[800] text-[#757575] uppercase tracking-[.07em] mb-[5px]">{label}</label>
                    <input type={type} value={(su as Record<string, string>)[key]}
                      onChange={(e) => setSu((s) => ({ ...s, [key]: e.target.value }))}
                      placeholder={placeholder} className={inp(errors[key])}
                      onKeyDown={key === 'confirm' ? (e) => e.key === 'Enter' && handleSignup() : undefined} />
                    {errors[key] && <p className="text-[11px] text-red-500 mt-1">{errors[key]}</p>}
                  </div>
                ))}
              </div>

              <button onClick={handleSignup} disabled={loading}
                className="w-full mt-5 py-[14px] bg-[#F85606] text-white text-[15px] font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors disabled:opacity-60">
                {loading ? 'Creating account…' : su.account_type === 'vendor' ? '🏪 Create Vendor Account →' : '🛍️ Create Account →'}
              </button>
              <p className="text-[11px] text-[#ABABAB] text-center mt-3">By signing up, you agree to our Terms & Privacy Policy.</p>
            </div>
          )}

          {/* ── OTP ── */}
          {mode === 'otp' && (
            <div className="p-7 text-center">
              <div className="text-[54px] mb-3">📧</div>
              <h2 className="text-[22px] font-[800] mb-2" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Verify your email</h2>
              <p className="text-[13px] text-[#757575] mb-5 leading-[1.7]">We sent a 6-digit code to <strong className="text-[#1A1A1A]">{otp.email}</strong></p>
              <input type="text" inputMode="numeric" maxLength={6} value={otp.code}
                onChange={(e) => setOtp((o) => ({ ...o, code: e.target.value.replace(/\D/g, '') }))}
                placeholder="000000"
                className="w-full px-4 py-[14px] border-2 border-[#D0D0D0] rounded-[12px] text-[26px] font-[900] text-center tracking-[0.35em] outline-none focus:border-[#F85606] transition-colors mb-4"
                onKeyDown={(e) => e.key === 'Enter' && handleOtp()} autoFocus />
              <button onClick={handleOtp} disabled={loading || otp.code.length < 4}
                className="w-full py-[13px] bg-[#F85606] text-white text-[15px] font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors disabled:opacity-60 mb-3">
                {loading ? 'Verifying…' : 'Verify & Continue →'}
              </button>
              <button onClick={async () => { try { await authApi.sendOtp(otp.email); toast.success('OTP resent!') } catch { toast.error('Failed to resend') } }}
                className="text-[13px] text-[#757575]">Didn't get it? <span className="text-[#F85606] font-[700]">Resend OTP</span></button>
            </div>
          )}

          {/* ── FORGOT ── */}
          {mode === 'forgot' && (
            <div className="p-7 text-center">
              {forgot.sent ? (
                <>
                  <div className="text-[54px] mb-3">✅</div>
                  <h2 className="text-[22px] font-[800] mb-2" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Check your inbox</h2>
                  <p className="text-[13px] text-[#757575] mb-6 leading-[1.7]">Reset link sent to <strong>{forgot.email}</strong></p>
                  <button onClick={() => { setMode('signin'); setForgot({ email: '', sent: false }) }}
                    className="w-full py-[13px] bg-[#F85606] text-white font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors">Back to Sign In</button>
                </>
              ) : (
                <>
                  <div className="text-[54px] mb-3">🔑</div>
                  <h2 className="text-[22px] font-[800] mb-2" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Reset Password</h2>
                  <p className="text-[13px] text-[#757575] mb-5">Enter your email and we'll send a reset link.</p>
                  <input type="email" value={forgot.email} onChange={(e) => setForgot((f) => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-4 py-[12px] border-[1.5px] border-[#D0D0D0] rounded-[10px] text-[14px] outline-none focus:border-[#F85606] transition-colors mb-4"
                    onKeyDown={(e) => e.key === 'Enter' && handleForgot()} autoFocus />
                  <button onClick={handleForgot} disabled={loading}
                    className="w-full py-[13px] bg-[#F85606] text-white text-[15px] font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors disabled:opacity-60 mb-3">
                    {loading ? 'Sending…' : 'Send Reset Link →'}
                  </button>
                  <button onClick={() => setMode('signin')} className="text-[13px] text-[#757575]">← Back to sign in</button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-5">
          <button onClick={() => router.push('/buyer')} className="text-[13px] text-[#757575] hover:text-[#F85606] transition-colors">← Continue as guest</button>
        </div>
      </div>
    </div>
  )
}
