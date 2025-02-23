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
  const [isSigningOut, setIsSigningOut] = useState(false)
  
  const handleSignOut = async () => {
    if (isSigningOut) return
    
    try {
      setIsSigningOut(true)
      setIsMobileMenuOpen(false)
      
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      await supabase.auth.signOut()
      
      // Clear all auth cookies
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token'
      ]
      cookiesToClear.forEach(name => {
        document.cookie = `${name}=; max-age=0; path=/; secure; samesite=lax`
      })

      // Force a full page reload to clear all state
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsSigningOut(false)
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
              disabled={isSigningOut}
              className="text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="fixed inset-y-0 left-0 w-64 bg-[#121212] border-r border-zinc-800/50 p-4">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                {/* Mobile menu items */}
              </div>
              <div className="border-t border-zinc-800/50 pt-4">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors disabled:opacity-50"
                >
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PricingModal 
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </>
  )
} 