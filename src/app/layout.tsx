import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth-provider'
import LoginModalController from '@/components/login-modal-controller'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThreadGenie',
  description: 'Generate Twitter threads with AI',
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
          <LoginModalController />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
