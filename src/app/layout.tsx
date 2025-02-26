import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth-provider'
import { AuthModal } from '@/components/auth-modal'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThreadGenius',
  description: 'Generate Twitter content with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  )
}
