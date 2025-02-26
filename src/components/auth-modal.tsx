'use client'

import { useEffect } from 'react'
import { useAuth } from './auth-provider'
import { AuthForm } from './auth-form'
import { X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Close modal if user is authenticated
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false)
      
      // Remove auth param from URL if present
      if (searchParams.has('auth')) {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('auth')
        router.replace(params.toString() ? `?${params.toString()}` : window.location.pathname)
      }
    }
  }, [user, showAuthModal, setShowAuthModal, router, searchParams])

  if (!showAuthModal) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-[#1a1f2d] p-6 shadow-xl">
        <button
          onClick={() => {
            setShowAuthModal(false)
            // Remove auth param from URL if present
            if (searchParams.has('auth')) {
              const params = new URLSearchParams(searchParams.toString())
              params.delete('auth')
              router.replace(params.toString() ? `?${params.toString()}` : window.location.pathname)
            }
          }}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        <AuthForm />
      </div>
    </div>
  )
} 