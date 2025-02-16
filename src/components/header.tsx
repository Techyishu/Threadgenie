'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { HamburgerMenu } from './hamburger-menu'
import { PricingModal } from './pricing-modal'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [isPricingOpen, setIsPricingOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <>
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Desktop View */}
          <div className="hidden lg:grid lg:grid-cols-3 items-center">
            <h1 className="text-xl font-bold text-purple-500">ThreadGenius</h1>
            <nav className="flex justify-center space-x-8">
              <a href="#" className="text-gray-300 hover:text-white">Home</a>
              <button 
                onClick={() => setIsPricingOpen(true)}
                className="text-gray-300 hover:text-white"
              >
                Pricing
              </button>
            </nav>
            <div className="flex justify-end">
              <button 
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white pr-8"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile View */}
          <div className="flex lg:hidden justify-between items-center">
            <h1 className="text-xl font-bold text-purple-500">ThreadGenius</h1>
            <HamburgerMenu onSignOut={handleSignOut} onPricingClick={() => setIsPricingOpen(true)} />
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