import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: "Vendoor — Nigeria's Campus Marketplace",
  description: 'Shop from verified vendors. Fast delivery, secure Paystack payments.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-center" toastOptions={{
          duration: 2600,
          style: { background: '#111', color: '#fff', borderRadius: '100px', fontSize: '13px', fontWeight: 700, padding: '11px 20px' },
        }} />
      </body>
    </html>
  )
}
