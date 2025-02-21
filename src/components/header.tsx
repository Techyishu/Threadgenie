'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PricingModal } from './pricing-modal'

export function Header({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: { 
  isMobileMenuOpen: boolean; 
  setIsMobileMenuOpen: (open: boolean) => void 
}) {
  const router = useRouter()
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  
  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      await supabase.auth.signOut()
      // Force a hard navigation to the root path
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 h-14 bg-[#121212] border-b border-zinc-800/50 lg:pl-64">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <PricingModal 
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </>
  )
} 