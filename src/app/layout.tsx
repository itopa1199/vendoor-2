import type { Metadata } from 'next'
import { Syne, Manrope } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const syne = Syne({ subsets: ['latin'], weight: ['700','800'], variable: '--font-syne', display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-manrope', display: 'swap' })

export const metadata: Metadata = {
  title: "Vendoor — Nigeria's Campus Marketplace",
  description: 'Shop from verified vendors. Fast delivery, secure Paystack payments.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${manrope.variable}`}>
      <body style={{ fontFamily: 'var(--font-manrope, system-ui, sans-serif)' }}>
        {children}
        <Toaster position="bottom-center" toastOptions={{
          duration: 2600,
          style: { background: '#111', color: '#fff', borderRadius: '100px', fontSize: '13px', fontWeight: 700, padding: '11px 20px' },
        }} />
      </body>
    </html>
  )
}
