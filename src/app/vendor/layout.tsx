import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Vendoor — Vendor Portal' }
export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: 'var(--font-manrope, system-ui, sans-serif)' }}>{children}</div>
}
